/**
 * Панель поиска.
 *
 * Разметка строится вручную в теневом дереве, чтобы стили плагина не смешивались
 * со стилями программы. Состояние запроса и условий хранится в localStorage.
 */
import { ANY_KEY, Condition, ElementInfo, Hit, OPERATORS, SearchOptions, defaultOptions } from './model';
import { applyConditions, isActive, propertyKeys, valuesFor } from './filter';
import { ELEMENT_GROUP, describeLayer, groupProperties, splitKey } from './props';
import { activeProject, runSearch } from './search';
import { clear as clearSelection, hasView, select } from './view';
import { hideLayers, isolate, showAll } from './visibility';

const STORE_KEY = 'nashepo.info.search.v2';

/** Смонтированные панели. Нужны, чтобы доставлять им выделение из модели. */
const mounted = new Set<(layers: DwgLayer[]) => void>();

/**
 * Показать в панелях свойства элемента, выбранного в модели.
 * Вызывается обработчиком события выделения.
 */
export function showSelection(layers: DwgLayer[]): void {
  for (const listener of mounted) listener(layers);
}

/**
 * Значки для кнопок.
 *
 * Программа подгружает шрифт Material Symbols, и если он доступен, берём значки
 * из него — тогда панель выглядит как остальной интерфейс. Если шрифта нет,
 * подставляем обычные символы, чтобы вместо значка не появилось слово.
 */
const iconFont = (() => {
  try {
    return document.fonts?.check?.('16px "Material Symbols Outlined"') === true;
  } catch {
    return false;
  }
})();

/** Разметка значка: имя из Material Symbols и запасной символ. */
function icon(name: string, fallback: string): string {
  return iconFont ? '<span class="ic">' + name + '</span>' : '<span class="ic-text">' + fallback + '</span>';
}

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
      property: typeof saved.property === 'string' ? saved.property : base.property,
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
 * Определить, светлая тема у программы или тёмная.
 *
 * Идём вверх по предкам до первого непрозрачного фона: это и есть фон окна.
 * Если такого не нашлось, спрашиваем системную настройку.
 */
function isLightTheme(start: HTMLElement | null): boolean {
  let node = start;
  while (node) {
    const parts = getComputedStyle(node).backgroundColor.match(/[\d.]+/g);
    if (parts && parts.length >= 3 && (parts.length < 4 || Number(parts[3]) > 0.1)) {
      const [r, g, b] = parts.map(Number);
      return r * 0.299 + g * 0.587 + b * 0.114 > 140;
    }
    node = node.parentElement;
  }
  return !matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Подстроить схему цветов под тему программы.
 *
 * Выпадающие списки рисует сам браузер. В тёмной теме их подложка остаётся
 * белой, а текст наследует светлый цвет панели, поэтому надписи не видно, пока
 * на них не наведёшься. Схема цветов чинит подложку, а явные цвета у option
 * чинят текст.
 */
function applyColorScheme(host: HTMLElement, app: HTMLElement): void {
  const light = isLightTheme(host.parentElement ?? host);
  host.style.colorScheme = light ? 'light' : 'dark';
  app.classList.toggle('theme-light', light);
  app.classList.toggle('theme-dark', !light);
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
    '<div class="scope">' +
    '<span class="scope-label">в параметре</span>' +
    '<input id="param" list="param-list" placeholder="любой параметр" value="' + esc(options.property) + '">' +
    '<datalist id="param-list"></datalist>' +
    '<button id="param-clear" title="Искать везде">×</button>' +
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

    '<div class="toolbar">' +
    '<button id="prev" class="ib" title="Предыдущий элемент">' + icon('chevron_left', '‹') + '</button>' +
    '<button id="next" class="ib" title="Следующий элемент">' + icon('chevron_right', '›') + '</button>' +
    '<button id="all" class="ib" title="Подсветить все найденные">' + icon('select_all', '▣') + '</button>' +
    '<button id="reset" class="ib" title="Снять подсветку">' + icon('deselect', '✕') + '</button>' +
    '<span class="sep"></span>' +
    '<button id="isolate" class="ib" title="Изолировать: оставить видимым только выбранный элемент, а если он не выбран — весь список">' +
    icon('center_focus_strong', '⊙') + '</button>' +
    '<button id="hide" class="ib" title="Скрыть элементы из списка">' + icon('visibility_off', '⊘') + '</button>' +
    '<button id="show-all" class="ib" title="Показать всё скрытое в проекте">' + icon('visibility', '◎') + '</button>' +
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
  const paramInput = root.querySelector('#param') as HTMLInputElement;
  const paramList = root.querySelector('#param-list') as HTMLDataListElement;
  const paramClear = root.querySelector('#param-clear') as HTMLButtonElement;
  const hideButton = root.querySelector('#hide') as HTMLButtonElement;
  const showAllButton = root.querySelector('#show-all') as HTMLButtonElement;
  const isolateButton = root.querySelector('#isolate') as HTMLButtonElement;
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
  /** Элемент, выбранный прямо в модели. Пока он есть, свойства показываются по нему. */
  let viewed: ElementInfo | undefined;

  function say(text: string, error = false): void {
    status.textContent = text;
    status.classList.toggle('error', error);
  }

  function readOptions(): SearchOptions {
    return {
      query: queryInput.value,
      property: paramInput.value,
      caseSensitive: caseBox.checked,
      includeHidden: hiddenBox.checked
    };
  }

  function updateButtons(): void {
    const has = shown.length > 0;
    allButton.disabled = !has || busy;
    prevButton.disabled = !has || busy;
    nextButton.disabled = !has || busy;
    hideButton.disabled = !has || busy;
    isolateButton.disabled = !has || busy;
    findButton.disabled = busy;
    showAllButton.disabled = busy;
    app.classList.toggle('scoped', paramInput.value.trim() !== '');
  }

  /** Подсказки имён параметров для поля «в параметре». */
  function updateParamList(): void {
    const names = new Set<string>();
    for (const key of propertyKeys(found)) {
      names.add(key);
      const short = splitKey(key).name;
      if (short && short !== key) names.add(short);
    }
    paramList.innerHTML = [...names]
      .sort((a, b) => a.localeCompare(b, 'ru'))
      .slice(0, 400)
      .map(name => '<option value="' + esc(name) + '"></option>')
      .join('');
  }

  function renderConditions(): void {
    const keys = propertyKeys(found);
    conditionsCount.textContent = conditions.length ? '· ' + conditions.length : '';
    if (!conditions.length) {
      conditionsBox.innerHTML = '<div class="empty">Условий нет. Кнопка ＋ добавит условие по свойству.</div>';
      return;
    }
    // Свойства собираем по группам, чтобы в списке была не одна длинная строка,
    // а название группы и короткие имена параметров внутри неё.
    const grouped = new Map<string, {key: string; name: string}[]>();
    for (const key of keys) {
      const {group, name} = splitKey(key);
      const bucket = ['Имя', 'Модель', 'Путь'].includes(key) ? ELEMENT_GROUP : group;
      const label = bucket === ELEMENT_GROUP ? key : name;
      const list = grouped.get(bucket);
      if (list) list.push({key, name: label});
      else grouped.set(bucket, [{key, name: label}]);
    }

    conditionsBox.innerHTML = conditions.map(condition => {
      const keyOptions = ['<option value="">любое свойство</option>']
        .concat([...grouped.entries()].map(([group, items]) =>
          '<optgroup label="' + esc(group) + '">' +
          items.map(item =>
            '<option value="' + esc(item.key) + '"' + (item.key === condition.key ? ' selected' : '') + '>' +
            esc(item.name) + '</option>'
          ).join('') +
          '</optgroup>'
        )).join('');
      const opOptions = OPERATORS.map(o =>
        '<option value="' + o.op + '"' + (o.op === condition.op ? ' selected' : '') + '>' + o.label + '</option>'
      ).join('');
      const needsValue = OPERATORS.find(o => o.op === condition.op)?.needsValue ?? true;
      const numeric = condition.op === 'gt' || condition.op === 'lt';
      const waiting = needsValue && !isActive(condition);
      const hint = waiting
        ? (numeric && condition.value.trim() !== '' ? 'нужно число' : 'введите значение')
        : '';
      // Подсказка значений: что это свойство принимает у найденных элементов.
      const values = needsValue ? valuesFor(found, condition.key) : [];
      const listId = 'cond-values-' + condition.id;
      const valueList = values.length
        ? '<datalist id="' + listId + '">' +
          values.map(value => '<option value="' + esc(value) + '"></option>').join('') +
          '</datalist>'
        : '';
      const placeholder = numeric ? 'число' : values.length ? 'значение или часть' : 'значение';

      return '<div class="condition' + (waiting ? ' waiting' : '') + '" data-id="' + condition.id + '">' +
        '<select class="cond-key">' + keyOptions + '</select>' +
        '<select class="cond-op">' + opOptions + '</select>' +
        '<input class="cond-value" type="search" placeholder="' + placeholder + '" value="' +
        esc(condition.value) + '"' + (needsValue ? '' : ' disabled') +
        (values.length ? ' list="' + listId + '"' : '') + '>' +
        '<button class="cond-remove" title="Удалить условие">×</button>' +
        valueList +
        (values.length ? '<div class="cond-hint">известных значений: ' + values.length + '</div>' : '') +
        (hint ? '<div class="cond-hint">' + hint + ', условие пока не применяется</div>' : '') +
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
    const info: ElementInfo | undefined = viewed ?? shown.find(h => h.index === current);
    if (!info) {
      propsBox.innerHTML = '<div class="empty">Выберите элемент в списке или в модели</div>';
      return;
    }

    const needle = propFilter.value.trim().toLowerCase();
    const groups = groupProperties(info)
      .map(group => ({
        group: group.group,
        rows: needle
          ? group.rows.filter(row =>
            row.name.toLowerCase().includes(needle) ||
            row.key.toLowerCase().includes(needle) ||
            row.value.toLowerCase().includes(needle))
          : group.rows
      }))
      .filter(group => group.rows.length);

    if (!groups.length) {
      propsBox.innerHTML = '<div class="empty">Ничего не подходит под фильтр</div>';
      return;
    }

    const note = viewed ? '<div class="props-note">Элемент выбран в модели</div>' : '';
    propsBox.innerHTML = note + groups.map(group =>
      '<div class="prop-group">' +
      '<div class="prop-group-name" title="' + esc(group.group) + '">' + esc(group.group) + '</div>' +
      '<table class="props-table"><tbody>' + group.rows.map(row =>
        '<tr><th title="' + esc(row.key) + '">' + esc(row.name) + '</th>' +
        '<td title="' + esc(row.value) + '">' + esc(row.value) + '</td></tr>'
      ).join('') + '</tbody></table>' +
      '</div>'
    ).join('');
  }

  function applyFilters(quiet = false): void {
    shown = applyConditions(found, conditions);
    current = -1;
    renderList();
    renderProps();
    updateButtons();
    if (quiet) return;
    if (!found.length) return;
    const active = conditions.filter(isActive).length;
    say(active
      ? 'Найдено: ' + found.length + '. После отбора по ' + active + ' условиям: ' + shown.length + '.'
      : 'Найдено: ' + found.length + '.');
  }

  function highlight(index: number): void {
    current = index;
    viewed = undefined;
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

    if (!options.query.trim() && !options.property.trim()) {
      say('Введите значение для поиска или укажите параметр.', true);
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
      updateParamList();
      applyFilters(true);

      if (!found.length) {
        const where = options.property.trim() ? ' Параметр: ' + options.property.trim() + '.' : '';
        say('Ничего не найдено.' + where + ' Просмотрено слоёв: ' + result.scanned + ' в моделях: ' + result.models + '.');
      } else {
        const filtered = conditions.filter(isActive).length ? ' После условий отбора: ' + shown.length + '.' : '';
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
  paramInput.addEventListener('keydown', event => {
    if ((event as KeyboardEvent).key === 'Enter') void find();
  });
  paramInput.addEventListener('input', () => {
    saveOptions(readOptions());
    updateButtons();
  });
  paramClear.addEventListener('click', () => {
    paramInput.value = '';
    saveOptions(readOptions());
    updateButtons();
    paramInput.focus();
  });
  caseBox.addEventListener('change', () => saveOptions(readOptions()));
  hiddenBox.addEventListener('change', () => saveOptions(readOptions()));

  hideButton.addEventListener('click', () => {
    void (async () => {
      if (!shown.length) return;
      busy = true;
      updateButtons();
      say('Скрываю элементы…');
      try {
        const changed = await hideLayers(shown.map(hit => hit.layer));
        clearSelection(ctx);
        say('Скрыто элементов: ' + changed + '. Вернуть их можно кнопкой «Показать все».');
      } catch (e) {
        say('Не удалось скрыть: ' + ((e as Error)?.message ?? String(e)), true);
      } finally {
        busy = false;
        updateButtons();
      }
    })();
  });

  isolateButton.addEventListener('click', () => {
    void (async () => {
      const project = activeProject(ctx);
      if (!project) {
        say('Нет открытого проекта.', true);
        return;
      }
      const active = shown.find(hit => hit.index === current);
      const keep = active ? [active.layer] : shown.map(hit => hit.layer);
      if (!keep.length) return;

      busy = true;
      updateButtons();
      say('Изолирую…');
      try {
        const result = await isolate(project, keep);
        select(ctx, keep, true);
        say('Изолировано элементов: ' + keep.length + '. Скрыто веток: ' + result.hidden +
          '. Вернуть вид можно кнопкой показа всего.');
      } catch (e) {
        say('Не удалось изолировать: ' + ((e as Error)?.message ?? String(e)), true);
      } finally {
        busy = false;
        updateButtons();
      }
    })();
  });

  showAllButton.addEventListener('click', () => {
    void (async () => {
      const project = activeProject(ctx);
      if (!project) {
        say('Нет открытого проекта.', true);
        return;
      }
      busy = true;
      updateButtons();
      say('Показываю скрытое…');
      try {
        const changed = await showAll(project);
        say(changed ? 'Показано элементов: ' + changed + '.' : 'Скрытых элементов не было.');
      } catch (e) {
        say('Не удалось показать: ' + ((e as Error)?.message ?? String(e)), true);
      } finally {
        busy = false;
        updateButtons();
      }
    })();
  });

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
    if (target.classList.contains('cond-key')) {
      condition.key = (target as HTMLSelectElement).value;
      // Свойство сменилось, значит подсказка значений теперь другая.
      renderConditions();
    }
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

    // Подсказку обновляем на месте: перерисовка списка увела бы курсор из поля.
    const numeric = condition.op === 'gt' || condition.op === 'lt';
    const waiting = !isActive(condition);
    box.classList.toggle('waiting', waiting);
    let hint = box.querySelector('.cond-hint') as HTMLElement | null;
    if (waiting) {
      if (!hint) {
        hint = document.createElement('div');
        hint.className = 'cond-hint';
        box.appendChild(hint);
      }
      hint.textContent = (numeric && condition.value.trim() !== '' ? 'нужно число' : 'введите значение') +
        ', условие пока не применяется';
    } else if (hint) {
      hint.remove();
    }

    applyFilters();
  });

  /**
   * Выделение в модели. Если элемент есть среди находок, встаём на его строку,
   * иначе показываем его свойства отдельно, не трогая список.
   */
  const onSelection = (layers: DwgLayer[]): void => {
    if (!container.isConnected) {
      mounted.delete(onSelection);
      return;
    }
    if (!layers.length) {
      if (!viewed) return;
      viewed = undefined;
      renderProps();
      return;
    }
    const layer = layers[0];
    const hit = shown.find(h => h.layer === layer);
    if (hit) {
      highlight(hit.index);
      return;
    }
    viewed = describeLayer(layer);
    renderProps();
  };
  mounted.add(onSelection);

  // Тема программы может смениться на ходу, поэтому схему цветов проверяем и позже.
  app.addEventListener('pointerdown', () => applyColorScheme(container, app));
  setTimeout(() => applyColorScheme(container, app), 500);

  renderConditions();
  updateButtons();
}
