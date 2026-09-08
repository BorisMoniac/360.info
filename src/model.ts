/** Типы поиска и отбора. */

/** Настройки поиска. */
export interface SearchOptions {
  /** Строка запроса. */
  query: string;
  /** Учитывать регистр. */
  caseSensitive: boolean;
  /** Искать и в скрытых вложениях. */
  includeHidden: boolean;
}

/** Значения по умолчанию. */
export const defaultOptions = (): SearchOptions => ({
  query: '',
  caseSensitive: false,
  includeHidden: false
});

/** Одна находка. */
export interface Hit {
  /** Порядковый номер, он же ключ строки списка. */
  index: number;
  /** Слой, который нужно выделить. */
  layer: DwgLayer;
  /** Имя элемента. */
  name: string;
  /** Модель, в которой он найден. */
  model: string;
  /** Путь в дереве слоёв. */
  path: string;
  /** Где именно совпало. */
  match: string;
  /** Все свойства элемента в плоском виде: ключ и строковое значение. */
  props: Record<string, string>;
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
