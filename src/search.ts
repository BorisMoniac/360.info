/**
 * Сквозной поиск по слоям проекта и всех его вложений.
 *
 * Элементы моделей IFC и SMDX попадают в чертёж как слои с типизированными
 * свойствами, поэтому поиск идёт по слоям: по имени, по пути, по типу и по всем
 * названиям и значениям свойств. Предела на число находок нет: ищем всё.
 */
import { Hit, SearchOptions, SearchResult } from './model';

/** Насколько глубоко разбирать вложенные свойства. */
const MAX_DEPTH = 8;
/** Предел узлов свойств на один слой, чтобы тяжёлая модель не подвесила поиск. */
const MAX_NODES = 800;
/** Через сколько слоёв отдавать управление интерфейсу. */
const YIELD_EVERY = 400;

/** Источник поиска: чертёж и его человекочитаемое имя. */
export interface Source {
  title: string;
  drawing: Drawing;
}

/** Главный чертёж приложения. */
export function projectOf(app: Application | undefined): Drawing | undefined {
  if (!app) return undefined;
  const model = app.model as Drawing | undefined;
  if (!model || typeof model !== 'object' || !('attachments' in model)) return undefined;
  return model.project ?? model;
}

/** Главный чертёж активного приложения. */
export function activeProject(ctx: Context): Drawing | undefined {
  return projectOf(ctx.app) ?? projectOf(ctx.manager.activeApp);
}

/** Чертёж проекта и чертежи всех загруженных вложений. */
export function sourcesOf(project: Drawing, includeHidden: boolean): Source[] {
  const sources: Source[] = [{title: 'Проект', drawing: project}];
  project.attachments.forEach(attachment => {
    if (!includeHidden && attachment.hidden) return;
    const model = attachment.model;
    if (model) sources.push({title: attachment.name ?? 'Вложение', drawing: model});
  });
  return sources;
}

/** Привести значение к строке. Объекты и массивы сюда не попадают. */
function asText(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const type = typeof value;
  if (type === 'string') return value as string;
  if (type === 'number' || type === 'boolean') return String(value);
  return undefined;
}

/**
 * Служебные поля слоя, которые не относятся к данным модели.
 *
 * Их не показывает и штатная панель свойств: она отдельно достаёт имя и
 * описание, а видимость и заморозку убирает из списка. Здесь тот же набор плюс
 * оформительские поля слоя, чтобы в условиях отбора не мелькало лишнее.
 */
const SERVICE_KEYS = new Set([
  'hidden', 'disabled', 'unplottable', 'color', 'lineweight', 'linetype',
  'name', 'layer', 'key', 'uuid', 'modelname'
]);

/**
 * Развернуть типизированные свойства в плоский словарь.
 *
 * Ключи получают точечный путь, значения приводятся к строке. Служебные поля и
 * пустые значения пропускаются: параметр, из которого значение убрали при
 * подготовке модели, в просмотрщике не виден, и здесь его быть не должно.
 */
export function flattenProperties(layer: DwgLayer): Record<string, string> {
  const out: Record<string, string> = {};
  let nodes = 0;

  const visit = (value: unknown, prefix: string, depth: number): void => {
    if (depth > MAX_DEPTH || nodes > MAX_NODES) return;
    nodes++;

    const text = asText(value);
    if (text !== undefined) {
      if (prefix && text !== '') out[prefix] = text;
      return;
    }
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) visit(value[i], prefix + '[' + i + ']', depth + 1);
      return;
    }
    if (!value || typeof value !== 'object') return;

    const record = value as Record<string, unknown>;
    if (record.$value !== undefined) {
      visit(record.$value, prefix, depth + 1);
      return;
    }
    for (const key in record) {
      if (key.startsWith('$')) continue;
      if (depth === 0 && SERVICE_KEYS.has(key.toLowerCase())) continue;
      visit(record[key], prefix ? prefix + '.' + key : key, depth + 1);
    }
  };

  try {
    visit(layer.typedProperties(), '', 0);
  } catch {
    // Часть свойств недоступна, отдаём что успели собрать.
  }
  return out;
}

/** Короткое имя параметра: без имени набора и без пути. */
function shortKey(key: string): string {
  const pipe = key.lastIndexOf('|');
  if (pipe > 0) return key.slice(pipe + 1);
  const dot = key.lastIndexOf('.');
  return dot > 0 ? key.slice(dot + 1) : key;
}

/** Найти совпадение в типизированных свойствах слоя. */
function matchProperties(layer: DwgLayer, needle: string, caseSensitive: boolean): string | undefined {
  const props = flattenProperties(layer);
  for (const key in props) {
    const value = props[key];
    const haystack = caseSensitive ? value : value.toLowerCase();
    const keyText = caseSensitive ? key : key.toLowerCase();
    if (haystack.includes(needle) || keyText.includes(needle)) return key + ': ' + value;
  }
  return undefined;
}

/**
 * Собственные поля элемента: имя, путь, модель и тип.
 *
 * В свойствах модели их нет, это поля самого слоя. Но в списке параметров они
 * предлагаются наравне с остальными, поэтому поиск по параметру обязан их знать.
 */
function basicsOf(layer: DwgLayer, model: string): [string, string][] {
  let typeName = '';
  try {
    typeName = layer.typed?.name ?? '';
  } catch {
    typeName = '';
  }
  return [
    ['Имя', layer.name ?? ''],
    ['Модель', model],
    ['Путь', layer.$path ?? ''],
    ['Тип', typeName]
  ];
}

/**
 * Найти совпадение внутри одного параметра.
 *
 * Имя параметра сравнивается и с полным ключом, и с коротким именем, поэтому
 * годится как «МОГЭ_Геометрические параметры|Длина», так и просто «Длина».
 * Пустой запрос означает «у элемента этот параметр заполнен».
 */
function matchInProperty(
  layer: DwgLayer,
  property: string,
  needle: string,
  caseSensitive: boolean,
  model: string
): string | undefined {
  for (const [label, value] of basicsOf(layer, model)) {
    if (!label.toLowerCase().includes(property)) continue;
    if (!needle) {
      if (value) return label + ': ' + value;
      continue;
    }
    const haystack = caseSensitive ? value : value.toLowerCase();
    if (haystack.includes(needle)) return label + ': ' + value;
  }

  const props = flattenProperties(layer);
  for (const key in props) {
    const full = key.toLowerCase();
    const short = shortKey(key).toLowerCase();
    if (!full.includes(property) && !short.includes(property)) continue;

    const value = props[key];
    if (!needle) return value ? key + ': ' + value : undefined;
    const haystack = caseSensitive ? value : value.toLowerCase();
    if (haystack.includes(needle)) return key + ': ' + value;
  }
  return undefined;
}

/** Проверить один слой. Возвращает описание совпадения или undefined. */
function matchLayer(layer: DwgLayer, needle: string, options: SearchOptions, model: string): string | undefined {
  const caseSensitive = options.caseSensitive;
  const property = options.property.trim().toLowerCase();
  if (property) return matchInProperty(layer, property, needle, caseSensitive, model);

  const name = layer.name ?? '';
  if ((caseSensitive ? name : name.toLowerCase()).includes(needle)) return 'имя: ' + name;

  const path = layer.$path ?? '';
  if ((caseSensitive ? path : path.toLowerCase()).includes(needle)) return 'путь: ' + path;

  let typeName = '';
  try {
    typeName = layer.typed?.name ?? '';
  } catch {
    typeName = '';
  }
  if (typeName && (caseSensitive ? typeName : typeName.toLowerCase()).includes(needle)) {
    return 'тип: ' + typeName;
  }

  return matchProperties(layer, needle, caseSensitive);
}

/** Ход выполнения поиска. */
export type SearchProgress = (scanned: number, found: number, model: string) => void;

/** Выполнить поиск по проекту и вложениям. */
export async function runSearch(
  project: Drawing,
  options: SearchOptions,
  progress?: SearchProgress
): Promise<SearchResult> {
  const started = Date.now();
  const query = options.query.trim();
  const needle = options.caseSensitive ? query : query.toLowerCase();
  const hits: Hit[] = [];
  let scanned = 0;

  // Без запроса ищем только когда задан параметр: тогда находим всех, у кого он заполнен.
  if (!needle && !options.property.trim()) return {hits, scanned: 0, models: 0, elapsed: 0};

  const sources = sourcesOf(project, options.includeHidden);

  for (const source of sources) {
    const layers: DwgLayer[] = [];
    source.drawing.layers.forEach(layer => {
      layers.push(layer);
    });

    for (const layer of layers) {
      scanned++;
      if (scanned % YIELD_EVERY === 0) {
        progress?.(scanned, hits.length, source.title);
        await pause();
      }

      const match = matchLayer(layer, needle, options, source.title);
      if (!match) continue;

      hits.push({
        index: hits.length,
        layer,
        name: layer.name ?? 'без имени',
        model: source.title,
        path: layer.$path ?? '',
        match,
        props: {}
      });
    }
  }

  // Свойства собираем только для находок: их немного по сравнению со всей моделью.
  for (let i = 0; i < hits.length; i++) {
    hits[i].props = flattenProperties(hits[i].layer);
    if (i % 200 === 0) {
      progress?.(scanned, hits.length, 'чтение свойств');
      await pause();
    }
  }

  progress?.(scanned, hits.length, '');
  return {hits, scanned, models: sources.length, elapsed: Date.now() - started};
}

function pause(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}
