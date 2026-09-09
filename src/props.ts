/**
 * Разбор имён свойств на группу и параметр.
 *
 * Импортёр IFC складывает имя набора свойств и имя параметра в один ключ через
 * вертикальную черту: «МОГЭ_Геометрические параметры|Длина». Вложенные свойства
 * модели приходят с точкой: «ifc.ObjectType». И то и другое разбираем на группу
 * и короткое имя, чтобы показывать их деревом, а не одной длинной строкой.
 */
import { ElementInfo } from './model';
import { flattenProperties } from './search';

/** Группа для свойств без явной группы. */
export const OTHER_GROUP = 'Прочее';
/** Группа для имени, модели и пути. */
export const ELEMENT_GROUP = 'Элемент';

/**
 * Разложить ключ свойства на группу и короткое имя.
 * Делим по последней вертикальной черте, как это делает штатная панель свойств.
 */
export function splitKey(key: string): {group: string; name: string} {
  const pipe = key.lastIndexOf('|');
  if (pipe > 0) return {group: key.slice(0, pipe), name: key.slice(pipe + 1)};
  const dot = key.lastIndexOf('.');
  if (dot > 0) return {group: key.slice(0, dot), name: key.slice(dot + 1)};
  return {group: OTHER_GROUP, name: key};
}

/** Строка свойства для показа. */
export interface PropRow {
  key: string;
  name: string;
  value: string;
}

/** Группа свойств для показа. */
export interface PropGroup {
  group: string;
  rows: PropRow[];
}

/** Сгруппировать свойства элемента. Имя, модель и путь идут первой группой. */
export function groupProperties(info: ElementInfo): PropGroup[] {
  const groups = new Map<string, PropRow[]>();
  groups.set(ELEMENT_GROUP, [
    {key: 'Имя', name: 'Имя', value: info.name},
    {key: 'Модель', name: 'Модель', value: info.model},
    {key: 'Путь', name: 'Путь', value: info.path}
  ]);

  for (const key of Object.keys(info.props).sort((a, b) => a.localeCompare(b, 'ru'))) {
    const {group, name} = splitKey(key);
    const rows = groups.get(group);
    const row: PropRow = {key, name, value: info.props[key]};
    if (rows) rows.push(row);
    else groups.set(group, [row]);
  }

  const ordered = [...groups.entries()]
    .filter(([group]) => group !== ELEMENT_GROUP)
    .sort((a, b) => {
      if (a[0] === OTHER_GROUP) return 1;
      if (b[0] === OTHER_GROUP) return -1;
      return a[0].localeCompare(b[0], 'ru');
    });

  return [{group: ELEMENT_GROUP, rows: groups.get(ELEMENT_GROUP) as PropRow[]},
    ...ordered.map(([group, rows]) => ({group, rows}))];
}

/** Собрать сведения об элементе по его слою. */
export function describeLayer(layer: DwgLayer): ElementInfo {
  let model = '';
  try {
    model = layer.modelName ?? '';
  } catch {
    model = '';
  }
  return {
    name: layer.name ?? 'без имени',
    model,
    path: layer.$path ?? '',
    props: flattenProperties(layer)
  };
}
