/**
 * Сквозной поиск по слоям проекта и всех его вложений.
 *
 * Элементы моделей IFC и SMDX попадают в чертёж как слои с типизированными
 * свойствами, поэтому поиск идёт по слоям: по имени, по пути, по типу и по всем
 * названиям и значениям свойств.
 */
import { Hit, SearchOptions, SearchResult } from './model';

/** Насколько глубоко разбирать вложенные свойства. */
const MAX_DEPTH = 6;
/** Предел узлов свойств на один слой, чтобы тяжёлая модель не подвесила поиск. */
const MAX_NODES = 600;
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

/** Привести значение к строке для сравнения. Объекты и массивы сюда не попадают. */
function asText(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const type = typeof value;
  if (type === 'string') return value as string;
  if (type === 'number' || type === 'boolean') return String(value);
  return undefined;
}

/** Найти совпадение в типизированных свойствах слоя. */
function matchProperties(layer: DwgLayer, needle: string, caseSensitive: boolean): string | undefined {
  let properties: DwgTypedObject | undefined;
  try {
    properties = layer.typedProperties();
  } catch {
    return undefined;
  }
  if (!properties || typeof properties !== 'object') return undefined;

  let nodes = 0;

  const visit = (value: unknown, label: string, depth: number): string | undefined => {
    if (depth > MAX_DEPTH || nodes > MAX_NODES) return undefined;
    nodes++;

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const found = visit(value[i], label + '[' + i + ']', depth + 1);
        if (found) return found;
      }
      return undefined;
    }

    const text = asText(value);
    if (text !== undefined) {
      const haystack = caseSensitive ? text : text.toLowerCase();
      return haystack.includes(needle) ? (label || 'значение') + ': ' + text : undefined;
    }

    if (!value || typeof value !== 'object') return undefined;

    const record = value as Record<string, unknown>;
    const named = asText(record.$name);
    const own = named ? label + ' (' + named + ')' : label;

    if (record.$value !== undefined) {
      const found = visit(record.$value, own, depth + 1);
      if (found) return found;
    }

    for (const key in record) {
      if (key === '$value' || key === '$type' || key === '$values') continue;
      const child = record[key];
      const path = label ? label + '.' + key : key;
      const childText = asText(child);
      if (childText !== undefined) {
        nodes++;
        const haystack = caseSensitive ? childText : childText.toLowerCase();
        const keyText = caseSensitive ? key : key.toLowerCase();
        if (haystack.includes(needle) || keyText.includes(needle)) return path + ': ' + childText;
        continue;
      }
      const found = visit(child, path, depth + 1);
      if (found) return found;
    }
    return undefined;
  };

  return visit(properties, '', 0);
}

/** Проверить один слой. Возвращает описание совпадения или undefined. */
function matchLayer(layer: DwgLayer, needle: string, options: SearchOptions): string | undefined {
  const name = layer.name ?? '';
  if ((options.caseSensitive ? name : name.toLowerCase()).includes(needle)) return 'имя: ' + name;

  const path = layer.$path ?? '';
  if ((options.caseSensitive ? path : path.toLowerCase()).includes(needle)) return 'путь: ' + path;

  let typeName = '';
  try {
    typeName = layer.typed?.name ?? '';
  } catch {
    typeName = '';
  }
  if (typeName && (options.caseSensitive ? typeName : typeName.toLowerCase()).includes(needle)) {
    return 'тип: ' + typeName;
  }

  if (options.scope === 'name') return undefined;
  return matchProperties(layer, needle, options.caseSensitive);
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
  let truncated = false;

  if (!needle) return {hits, scanned: 0, models: 0, truncated: false, elapsed: 0};

  const sources = sourcesOf(project, options.includeHidden);

  for (const source of sources) {
    if (truncated) break;

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

      const match = matchLayer(layer, needle, options);
      if (!match) continue;

      hits.push({
        index: hits.length,
        layer,
        name: layer.name ?? 'без имени',
        model: source.title,
        path: layer.$path ?? '',
        match
      });

      if (hits.length >= options.limit) {
        truncated = true;
        break;
      }
    }
  }

  progress?.(scanned, hits.length, '');
  return {hits, scanned, models: sources.length, truncated, elapsed: Date.now() - started};
}

function pause(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}
