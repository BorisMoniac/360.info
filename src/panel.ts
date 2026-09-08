/**
 * Панель поиска.
 *
 * Разметка строится вручную в теневом дереве, чтобы стили плагина не смешивались
 * со стилями программы. Состояние запроса хранится в localStorage.
 */
import { Hit, SearchOptions, defaultOptions } from './model';
import { activeProject, runSearch } from './search';
import { clear as clearSelection, hasView, select } from './view';

const STORE_KEY = 'nashepo.info.search.v1';

/** Экранировать текст для вставки в разметку. */
function esc(value: string): string {
  return value.replace(/[&<>"]/g, ch => (
    ch === '&' ? '&amp;' : ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : '&quot;'
  ));
}

/** Прочитать сохранённые настройки. */
function loadOptions(): SearchOptions {
  const base = defaultOptions();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw) as Partial<SearchOptions>;
    return {
      query: typeof saved.query === 'string' ? saved.query : base.query,
      scope: saved.scope === 'name' ? 'name' : 'all',
      caseSensitive: saved.caseSensitive === true,
      includeHidden: saved.includeHidden === true,
      limit: Number.isFinite(saved.limit) ? Math.min(Math.max(Number(saved.limit), 10), 5000) : base.limit
    };
  } catch {
    return base;
  }
}

/** Сохранить настройки. */
function saveOptions(options: SearchOptions): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(options));
  } catch {
    // Хранилище недоступно, настройки просто не переживут перезапуск.
  }
}

/** Смонтировать панель в переданный элемент. */
export function mountPanel(container: HTMLElement, ctx: Context, css: string, version: string): void {
  const root = container.attachShadow ? container.shadowRoot || container.attachShadow({mode: 'open'}) : container;
  const options = loadOptions();

  root.innerHTML = '<style>' + css + '</style>' +
    '<main class="app">' +
    '<div class="query">' +
    '<input id="query" type="search" placeholder="Значение, имя, GUID, что угодно" value="' + esc(options.query) + '">' +
    '<button class="primary" id="find">Найти</button>' +
    '</div>' +
    '<div class="options">' +
    '<label>Искать<select id="scope">' +
    '<option value="all">везде</option>' +
    '<option value="name">только имена</option>' +
    '</select></label>' +
    '<label><input id="case" type="checkbox"> регистр</label>' +
    '<label><input id="hidden" type="checkbox"> скрытые</label>' +
    '<label>предел<input id="limit" type="number" min="10" max="5000" step="10" value="' + options.limit + '"></label>' +
    '</div>' +
    '<div class="bar">' +
    '<button id="all">Подсветить все</button>' +
    '<button id="prev" title="Предыдущий элемент">←</button>' +
    '<button id="next" title="Следующий элемент">→</button>' +
    '<span class="spacer"></span>' +
    '<button id="reset">Снять</button>' +
    '</div>' +
    '<div class="status" id="status">Введите значение и нажмите «Найти».</div>' +
    '<div class="list" id="list"><div class="empty">Пока ничего не найдено</div></div>' +
    '<div class="hint">Щелчок по строке подсвечивает элемент и переводит к нему камеру. Версия ' + esc(version) + '</div>' +
    '</main>';

  const queryInput = root.querySelector('#query') as HTMLInputElement;
  const scopeSelect = root.querySelector('#scope') as HTMLSelectElement;
  const caseBox = root.querySelector('#case') as HTMLInputElement;
  const hiddenBox = root.querySelector('#hidden') as HTMLInputElement;
  const limitInput = root.querySelector('#limit') as HTMLInputElement;
  const findButton = root.querySelector('#find') as HTMLButtonElement;
  const allButton = root.querySelector('#all') as HTMLButtonElement;
  const prevButton = root.querySelector('#prev') as HTMLButtonElement;
  const nextButton = root.querySelector('#next') as HTMLButtonElement;
  const resetButton = root.querySelector('#reset') as HTMLButtonElement;
  const status = root.querySelector('#status') as HTMLElement;
  const list = root.querySelector('#list') as HTMLElement;

  scopeSelect.value = options.scope;
  caseBox.checked = options.caseSensitive;
  hiddenBox.checked = options.includeHidden;

  let hits: Hit[] = [];
  let current = -1;
  let busy = false;

  function say(text: string, error = false): void {
    status.textContent = text;
    status.classList.toggle('error', error);
  }

  function readOptions(): SearchOptions {
    const limit = Math.min(Math.max(parseInt(limitInput.value, 10) || 500, 10), 5000);
    limitInput.value = String(limit);
    return {
      query: queryInput.value,
      scope: scopeSelect.value === 'name' ? 'name' : 'all',
      caseSensitive: caseBox.checked,
      includeHidden: hiddenBox.checked,
      limit
    };
  }

  function updateButtons(): void {
    const has = hits.length > 0;
    allButton.disabled = !has || busy;
    prevButton.disabled = !has || busy;
    nextButton.disabled = !has || busy;
    findButton.disabled = busy;
  }

  function render(): void {
    if (!hits.length) {
      list.innerHTML = '<div class="empty">Пока ничего не найдено</div>';
      return;
    }
    list.innerHTML = hits.map(hit =>
      '<button class="row" data-index="' + hit.index + '">' +
      '<div class="name">' + esc(hit.name) + '</div>' +
      '<div class="meta"><span class="model">' + esc(hit.model) + '</span><span>' + esc(hit.path) + '</span></div>' +
      '<div class="match">' + esc(hit.match) + '</div>' +
      '</button>'
    ).join('');
  }

  function highlight(index: number): void {
    current = index;
    const rows = list.querySelectorAll('.row');
    rows.forEach(row => {
      row.classList.toggle('active', Number((row as HTMLElement).dataset.index) === index);
    });
    const active = list.querySelector('.row.active') as HTMLElement | null;
    active?.scrollIntoView({block: 'nearest'});
  }

  function focusHit(index: number): void {
    if (index < 0 || index >= hits.length) return;
    const hit = hits[index];
    if (!select(ctx, [hit.layer], true)) {
      say('Нет активного вида чертежа. Откройте окно проекта.', true);
      return;
    }
    highlight(index);
    say('Элемент ' + (index + 1) + ' из ' + hits.length + '. ' + hit.model);
  }

  async function find(): Promise<void> {
    const options = readOptions();
    saveOptions(options);

    if (!options.query.trim()) {
      say('Введите значение для поиска.', true);
      return;
    }

    const project = activeProject(ctx);
    if (!project) {
      say('Нет открытого проекта.', true);
      return;
    }
    if (!hasView(ctx)) {
      say('Нет активного вида чертежа. Поиск выполнится, но подсветка работать не будет.');
    }

    busy = true;
    hits = [];
    current = -1;
    updateButtons();
    say('Поиск…');

    try {
      const result = await runSearch(project, options, (scanned, found, model) => {
        say('Просмотрено ' + scanned + ', найдено ' + found + (model ? '. Модель: ' + model : ''));
      });
      hits = result.hits;
      render();

      if (!hits.length) {
        say('Ничего не найдено. Просмотрено слоёв: ' + result.scanned + ' в моделях: ' + result.models + '.');
      } else {
        const limited = result.truncated ? ' Показаны первые ' + options.limit + ', увеличьте предел.' : '';
        say('Найдено: ' + hits.length + '. Просмотрено слоёв: ' + result.scanned +
          ' в моделях: ' + result.models + ' за ' + Math.round(result.elapsed / 100) / 10 + ' с.' + limited);
      }
    } catch (e) {
      say('Ошибка поиска: ' + ((e as Error)?.message ?? String(e)), true);
    } finally {
      busy = false;
      updateButtons();
    }
  }

  findButton.addEventListener('click', () => void find());
  queryInput.addEventListener('keydown', event => {
    if ((event as KeyboardEvent).key === 'Enter') void find();
  });

  allButton.addEventListener('click', () => {
    if (!hits.length) return;
    if (!select(ctx, hits.map(hit => hit.layer), true)) {
      say('Нет активного вида чертежа. Откройте окно проекта.', true);
      return;
    }
    current = -1;
    highlight(-1);
    say('Подсвечено элементов: ' + hits.length + '.');
  });

  prevButton.addEventListener('click', () => {
    if (!hits.length) return;
    focusHit(current <= 0 ? hits.length - 1 : current - 1);
  });

  nextButton.addEventListener('click', () => {
    if (!hits.length) return;
    focusHit(current >= hits.length - 1 ? 0 : current + 1);
  });

  resetButton.addEventListener('click', () => {
    clearSelection(ctx);
    current = -1;
    highlight(-1);
    say('Выделение снято.');
  });

  list.addEventListener('click', event => {
    const row = (event.target as HTMLElement).closest('.row') as HTMLElement | null;
    if (!row) return;
    focusHit(Number(row.dataset.index));
  });

  updateButtons();
}
