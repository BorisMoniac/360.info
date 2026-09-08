/**
 * Панель поиска.
 *
 * Разметка строится вручную в теневом дереве, чтобы стили плагина не смешивались
 * со стилями программы. Состояние запроса и условий хранится в localStorage.
 */
import { ANY_KEY, Condition, Hit, OPERATORS, SearchOptions, defaultOptions } from './model';
import { applyConditions, propertyKeys } from './filter';
import { activeProject, runSearch } from './search';
import { clear as clearSelection, hasView, select } from './view';

const STORE_KEY = 'nashepo.info.search.v2';

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
      caseSensitive: saved.caseSensitive === true,
      includeHidden: saved.includeHidden === true
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

/**
 * Подстроить схему цветов под тему программы.
 *
 * Выпадающие списки рисует сам браузер, и в тёмной теме они остаются белыми,
 * пока элементу не задана тёмная схема. Яркость берём из той же переменной,
 * которой программа красит поверхность панели.
 */
function applyColorScheme(host: HTMLElement, probe: HTMLElement): void {
  const background = getComputedStyle(probe).backgroundColor;
  const parts = background.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return;
  const [r, g, b] = parts.map(Number);
  const light = (r * 0.299 + g * 0.587 + b * 0.114) > 128;
  host.style.colorScheme = light ? 'light' : 'dark';
}

/** Смонтировать панель в переданный элемент. */
export function mountPanel(container: HTMLElement, ctx: Context, css: string, version: string): void {
  const root = container.attachShadow ? container.shadowRoot || container.attachShadow({mode: 'open'}) : container;
  const options = loadOptions();

  root.innerHTML = '<style>' + css + '</style>' +
    '<main class="app" id="app">' +
    '<div class="query">' +
    '<input id="query" type="search" placeholder="Значение, имя, GUID, что угодно" value="' + esc(options.query) + '">' +
    '<button class="primary" id="find">Найти</button>' +
    '</div>' +
    '<div class="options">' +
    '<label><input id="case" type="checkbox"> учитывать регистр</label>' +
    '<label><input id="hidden" type="checkbox"> искать в скрытых</label>' +
    '</div>' +

    '<section class="block">' +
    '<div class="block-head"><button class="fold" id="fold-conditions" aria-expanded="false">Условия отбора <span id="conditions-count"></span></button>' +
    '<button id="add-condition" title="Добавить условие">＋</button></div>' +
    '<div class="conditions" id="conditions" hidden></div>' +
    '</section>' +

    '<div class="bar">' +
    '<button id="all">Подсветить все</button>' +
    '<button id="prev" title="Предыдущий элемент">←</button>' +
    '<button id="next" title="Следующий элемент">→</button>' +
    '<span class="spacer"></span>' +
    '<button id="reset">Снять</button>' +
    '</div>' +
    '<div class="status" id="status">Введите значение и нажмите «Найти».</div>' +

    '<div class="list" id="list"><div class="empty">Пока ничего не найдено</div></div>' +

    '<section class="block props-block">' +
    '<div class="block-head"><button class="fold" id="fold-props" aria-expanded="true">Свойства элемента</button>' +
    '<input id="prop-filter" type="search" placeholder="фильтр свойств"></div>' +
    '<div class="props" id="props"><div class="empty">Выберите элемент в списке</div></div>' +
    '</section>' +

    '<div class="hint">Щелчок по строке подсвечивает элемент и переводит к нему камеру. Версия ' + esc(version) + '</div>' +
    '</main>';

  const app = root.querySelector('#app') as HTMLElement;
  const queryInput = root.querySelector('#query') as HTMLInputElement;
  const caseBox = root.querySelector('#case') as HTMLInputElement;
  const hiddenBox = root.querySelector('#hidden') as HTMLInputElement;
  const findButton = root.querySelector('#find') as HTMLButtonElement;
  const allButton = root.querySelector('#all') as HTMLButtonElement;
  const prevButton = root.querySelector('#prev') as HTMLButtonElement;
  const nextButton = root.querySelector('#next') as HTMLButtonElement;
  const resetButton = root.querySelector('#reset') as HTMLButtonElement;
  const status = root.querySelector('#status') as HTMLElement;
  const list = root.querySelector('#list') as HTMLElement;
  const conditionsBox = root.querySelector('#conditions') as HTMLElement;
  const conditionsCount = root.querySelector('#conditions-count') as HTMLElement;
  const addCondition = root.querySelector('#add-condition') as HTMLButtonElement;
  const foldConditions = root.querySelector('#fold-conditions') as HTMLButtonElement;
  const foldProps = root.querySelector('#fold-props') as HTMLButtonElement;
  const propsBox = root.querySelector('#props') as HTMLElement;
  const propFilter = root.querySelector('#prop-filter') as HTMLInputElement;

  caseBox.checked = options.caseSensitive;
  hiddenBox.checked = options.includeHidden;
  applyColorScheme(container, app);

  let found: Hit[] = [];
  let shown: Hit[] = [];
  let conditions: Condition[] = [];
  let nextId = 1;
  let current = -1;
  let busy = false;

  function say(text: string, error = false): void {
    status.textContent = text;
    status.classList.toggle('error', error);
  }

  function readOptions(): SearchOptions {
    return {query: queryInput.value, caseSensitive: caseBox.checked, includeHidden: hiddenBox.checked};
  }

  function updateButtons(): void {
    const has = shown.length > 0;
    allButton.disabled = !has || busy;
    prevButton.disabled = !has || busy;
    nextButton.disabled = !has || busy;
    findButton.disabled = busy;
  }

  function renderConditions(): void {
    const keys = propertyKeys(found);
    conditionsCount.textContent = conditions.length ? '· ' + conditions.length : '';
    if (!conditions.length) {
      conditionsBox.innerHTML = '<div class="empty">Условий нет. Кнопка ＋ добавит условие по свойству.</div>';
      return;
    }
    conditionsBox.innerHTML = conditions.map(condition => {
      const keyOptions = ['<option value="">любое свойство</option>']
        .concat(keys.map(key =>
          '<option value="' + esc(key) + '"' + (key === condition.key ? ' selected' : '') + '>' + esc(key) + '</option>'
        )).join('');
      const opOptions = OPERATORS.map(o =>
        '<option value="' + o.op + '"' + (o.op === condition.op ? ' selected' : '') + '>' + o.label + '</option>'
      ).join('');
      const needsValue = OPERATORS.find(o => o.op === condition.op)?.needsValue ?? true;
      return '<div class="condition" data-id="' + condition.id + '">' +
        '<select class="cond-key">' + keyOptions + '</select>' +
        '<select class="cond-op">' + opOptions + '</select>' +
        '<input class="cond-value" type="search" placeholder="значение" value="' + esc(condition.value) + '"' +
        (needsValue ? '' : ' disabled') + '>' +
        '<button class="cond-remove" title="Удалить условие">×</button>' +
        '</div>';
    }).join('');
  }

  function renderList(): void {
    if (!shown.length) {
      list.innerHTML = '<div class="empty">' + (found.length ? 'Условия отбора не пропустили ни одного элемента' : 'Пока ничего не найдено') + '</div>';
      return;
    }
    list.innerHTML = shown.map(hit =>
      '<button class="row" data-index="' + hit.index + '">' +
      '<div class="name">' + esc(hit.name) + '</div>' +
      '<div class="meta"><span class="model">' + esc(hit.model) + '</span><span>' + esc(hit.path) + '</span></div>' +
      '<div class="match">' + esc(hit.match) + '</div>' +
      '</button>'
    ).join('');
  }

  function renderProps(): void {
    const hit = shown.find(h => h.index === current);
    if (!hit) {
      propsBox.innerHTML = '<div class="empty">Выберите элемент в списке</div>';
      return;
    }
    const needle = propFilter.value.trim().toLowerCase();
    const rows: [string, string][] = [
      ['Имя', hit.name],
      ['Модель', hit.model],
      ['Путь', hit.path]
    ];
    for (const key of Object.keys(hit.props).sort((a, b) => a.localeCompare(b, 'ru'))) {
      rows.push([key, hit.props[key]]);
    }
    const visible = needle
      ? rows.filter(([key, value]) => key.toLowerCase().includes(needle) || value.toLowerCase().includes(needle))
      : rows;
    if (!visible.length) {
      propsBox.innerHTML = '<div class="empty">Ничего не подходит под фильтр</div>';
      return;
    }
    propsBox.innerHTML = '<table class="props-table"><tbody>' + visible.map(([key, value]) =>
      '<tr><th title="' + esc(key) + '">' + esc(key) + '</th><td title="' + esc(value) + '">' + esc(value) + '</td></tr>'
    ).join('') + '</tbody></table>';
  }

  function applyFilters(quiet = false): void {
    shown = applyConditions(found, conditions);
    current = -1;
    renderList();
    renderProps();
    updateButtons();
    if (quiet) return;
    if (!found.length) return;
    say(conditions.length
      ? 'Найдено: ' + found.length + '. После условий отбора: ' + shown.length + '.'
      : 'Найдено: ' + found.length + '.');
  }

  function highlight(index: number): void {
    current = index;
    list.querySelectorAll('.row').forEach(row => {
      row.classList.toggle('active', Number((row as HTMLElement).dataset.index) === index);
    });
    (list.querySelector('.row.active') as HTMLElement | null)?.scrollIntoView({block: 'nearest'});
    renderProps();
  }

  function focusAt(position: number): void {
    if (position < 0 || position >= shown.length) return;
    const hit = shown[position];
    if (!select(ctx, [hit.layer], true)) {
      say('Нет активного вида чертежа. Откройте окно проекта.', true);
      return;
    }
    highlight(hit.index);
    say('Элемент ' + (position + 1) + ' из ' + shown.length + '. ' + hit.model);
  }

  function positionOfCurrent(): number {
    return shown.findIndex(hit => hit.index === current);
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
    found = [];
    shown = [];
    current = -1;
    updateButtons();
    say('Поиск…');

    try {
      const result = await runSearch(project, options, (scanned, hits, model) => {
        say('Просмотрено ' + scanned + ', найдено ' + hits + (model ? '. ' + model : ''));
      });
      found = result.hits;
      renderConditions();
      applyFilters(true);

      if (!found.length) {
        say('Ничего не найдено. Просмотрено слоёв: ' + result.scanned + ' в моделях: ' + result.models + '.');
      } else {
        const filtered = conditions.length ? ' После условий отбора: ' + shown.length + '.' : '';
        say('Найдено: ' + found.length + '.' + filtered +
          ' Просмотрено слоёв: ' + result.scanned + ' в моделях: ' + result.models +
          ' за ' + Math.round(result.elapsed / 100) / 10 + ' с.');
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
  caseBox.addEventListener('change', () => saveOptions(readOptions()));
  hiddenBox.addEventListener('change', () => saveOptions(readOptions()));

  allButton.addEventListener('click', () => {
    if (!shown.length) return;
    if (!select(ctx, shown.map(hit => hit.layer), true)) {
      say('Нет активного вида чертежа. Откройте окно проекта.', true);
      return;
    }
    current = -1;
    highlight(-1);
    say('Подсвечено элементов: ' + shown.length + '.');
  });

  prevButton.addEventListener('click', () => {
    if (!shown.length) return;
    const position = positionOfCurrent();
    focusAt(position <= 0 ? shown.length - 1 : position - 1);
  });

  nextButton.addEventListener('click', () => {
    if (!shown.length) return;
    const position = positionOfCurrent();
    focusAt(position >= shown.length - 1 ? 0 : position + 1);
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
    const index = Number(row.dataset.index);
    focusAt(shown.findIndex(hit => hit.index === index));
  });

  addCondition.addEventListener('click', () => {
    conditions.push({id: nextId++, key: ANY_KEY, op: 'contains', value: ''});
    conditionsBox.hidden = false;
    foldConditions.setAttribute('aria-expanded', 'true');
    renderConditions();
    applyFilters();
  });

  foldConditions.addEventListener('click', () => {
    const open = conditionsBox.hidden;
    conditionsBox.hidden = !open;
    foldConditions.setAttribute('aria-expanded', String(open));
    if (open) renderConditions();
  });

  foldProps.addEventListener('click', () => {
    const open = propsBox.hidden;
    propsBox.hidden = !open;
    foldProps.setAttribute('aria-expanded', String(open));
  });

  propFilter.addEventListener('input', () => renderProps());

  conditionsBox.addEventListener('click', event => {
    const button = (event.target as HTMLElement).closest('.cond-remove') as HTMLElement | null;
    if (!button) return;
    const id = Number((button.closest('.condition') as HTMLElement).dataset.id);
    conditions = conditions.filter(condition => condition.id !== id);
    renderConditions();
    applyFilters();
  });

  conditionsBox.addEventListener('change', event => {
    const target = event.target as HTMLElement;
    const box = target.closest('.condition') as HTMLElement | null;
    if (!box) return;
    const condition = conditions.find(c => c.id === Number(box.dataset.id));
    if (!condition) return;
    if (target.classList.contains('cond-key')) condition.key = (target as HTMLSelectElement).value;
    if (target.classList.contains('cond-op')) {
      condition.op = (target as HTMLSelectElement).value as Condition['op'];
      renderConditions();
    }
    if (target.classList.contains('cond-value')) condition.value = (target as HTMLInputElement).value;
    applyFilters();
  });

  conditionsBox.addEventListener('input', event => {
    const target = event.target as HTMLElement;
    if (!target.classList.contains('cond-value')) return;
    const box = target.closest('.condition') as HTMLElement | null;
    if (!box) return;
    const condition = conditions.find(c => c.id === Number(box.dataset.id));
    if (!condition) return;
    condition.value = (target as HTMLInputElement).value;
    applyFilters();
  });

  // Тема программы может смениться на ходу, поэтому схему цветов проверяем и позже.
  app.addEventListener('pointerdown', () => applyColorScheme(container, app));

  renderConditions();
  updateButtons();
}
