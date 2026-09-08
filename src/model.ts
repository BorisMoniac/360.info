/** Типы поиска и отбора. */

/** Настройки поиска. */
export interface SearchOptions {
  /** Строка запроса. */
  query: string;
  /**
   * Имя параметра, внутри которого искать.
   * Пустая строка означает поиск по всему: имени, пути, типу и всем свойствам.
   */
  property: string;
  /** Учитывать регистр. */
  caseSensitive: boolean;
  /** Искать и в скрытых вложениях. */
  includeHidden: boolean;
}

/** Значения по умолчанию. */
export const defaultOptions = (): SearchOptions => ({
  query: '',
  property: '',
  caseSensitive: false,
  includeHidden: false
});

/** Сведения об элементе, достаточные для показа свойств. */
export interface ElementInfo {
  /** Имя элемента. */
  name: string;
  /** Модель, в которой он лежит. */
  model: string;
  /** Путь в дереве слоёв. */
  path: string;
  /** Все свойства элемента в плоском виде: ключ и строковое значение. */
  props: Record<string, string>;
}

/** Одна находка. */
export interface Hit extends ElementInfo {
  /** Порядковый номер, он же ключ строки списка. */
  index: number;
  /** Слой, который нужно выделить. */
  layer: DwgLayer;
  /** Где именно совпало. */
  match: string;
}

/** Итог поиска. */
export interface SearchResult {
  hits: Hit[];
  /** Сколько слоёв просмотрено. */
  scanned: number;
  /** Сколько моделей просмотрено. */
  models: number;
  /** Длительность в миллисекундах. */
  elapsed: number;
}

/** Оператор условия отбора. */
export type ConditionOp = 'contains' | 'notContains' | 'equals' | 'notEquals' | 'exists' | 'missing' | 'gt' | 'lt';

/** Человеческие названия операторов. */
export const OPERATORS: {op: ConditionOp; label: string; needsValue: boolean}[] = [
  {op: 'contains', label: 'содержит', needsValue: true},
  {op: 'notContains', label: 'не содержит', needsValue: true},
  {op: 'equals', label: 'равно', needsValue: true},
  {op: 'notEquals', label: 'не равно', needsValue: true},
  {op: 'gt', label: 'больше', needsValue: true},
  {op: 'lt', label: 'меньше', needsValue: true},
  {op: 'exists', label: 'заполнено', needsValue: false},
  {op: 'missing', label: 'пусто', needsValue: false}
];

/** Одно условие отбора найденного. */
export interface Condition {
  /** Ключ строки в списке условий. */
  id: number;
  /** Свойство. Пустая строка означает «любое свойство». */
  key: string;
  /** Оператор. */
  op: ConditionOp;
  /** Значение для сравнения. */
  value: string;
}

/** Ключ, обозначающий поиск по любому свойству. */
export const ANY_KEY = '';

/** Псевдосвойства, доступные в условиях наравне с настоящими. */
export const BUILTIN_KEYS = ['Имя', 'Модель', 'Путь'];
