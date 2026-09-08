/** Типы поиска. */

/** Что просматривать при поиске. */
export type SearchScope = 'all' | 'name';

/** Настройки поиска. */
export interface SearchOptions {
  /** Строка запроса. */
  query: string;
  /** Просматривать только имена или ещё и свойства. */
  scope: SearchScope;
  /** Учитывать регистр. */
  caseSensitive: boolean;
  /** Искать и в скрытых вложениях. */
  includeHidden: boolean;
  /** Предел числа находок. */
  limit: number;
}

/** Значения по умолчанию. */
export const defaultOptions = (): SearchOptions => ({
  query: '',
  scope: 'all',
  caseSensitive: false,
  includeHidden: false,
  limit: 500
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
}

/** Итог поиска. */
export interface SearchResult {
  hits: Hit[];
  /** Сколько слоёв просмотрено. */
  scanned: number;
  /** Сколько моделей просмотрено. */
  models: number;
  /** Достигнут ли предел находок. */
  truncated: boolean;
  /** Длительность в миллисекундах. */
  elapsed: number;
}
