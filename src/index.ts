import { mountPanel, showSelection } from './panel';
import { defaultOptions } from './model';
import { activeProject, runSearch } from './search';
import { clear as clearSelection, select } from './view';
import css from './style.css?inline';

const VERSION = '0.6.0';
const VIEW = 'nashepo.info/search_panel';

/**
 * Контекст, всегда указывающий на активное приложение и вид.
 * Панель живёт дольше одного документа, поэтому обращаться к ctx.app напрямую нельзя.
 */
function live(ctx: Context): Context {
  return new Proxy(ctx, {
    get(target, key) {
      if (key === 'app') return ctx.manager.activeApp;
      if (key === 'cadview') return (ctx.manager.activeWindow as CadViewDocumentWindow | undefined)?.context;
      return Reflect.get(target, key);
    }
  });
}

export default {
  /** Открыть панель поиска. */
  open(ctx: Context): void {
    ctx.manager.revealView(VIEW);
  },

  /** Смонтировать панель. */
  mount(ctx: Context): void {
    const el = ctx.el as HTMLElement | undefined;
    if (!el) return;
    const mount = document.createElement('div');
    mount.style.height = '100%';
    el.replaceChildren(mount);
    mountPanel(mount, live(ctx), css, VERSION);
  },

  /** Быстрый поиск: спросить значение и сразу подсветить все совпадения. */
  async quick(ctx: Context): Promise<void> {
    const scope = live(ctx);
    const project = activeProject(scope);
    if (!project) {
      await ctx.showMessage('Нет открытого проекта.', 'warning');
      return;
    }

    const query = await ctx.showInputBox({
      title: 'Поиск по проекту',
      prompt: 'Значение, имя, GUID или часть свойства',
      placeHolder: 'Введите искомое значение'
    });
    if (!query || !query.trim()) return;

    const options = {...defaultOptions(), query};
    const progress = ctx.beginProgress();
    progress.indeterminate = true;
    progress.label = 'Поиск по проекту';
    let result;
    try {
      result = await runSearch(project, options, (scanned, found) => {
        progress.details = 'просмотрено ' + scanned + ', найдено ' + found;
      });
    } finally {
      ctx.endProgress(progress);
    }

    if (!result.hits.length) {
      await ctx.showMessage('Ничего не найдено. Просмотрено слоёв: ' + result.scanned + '.', 'info');
      return;
    }

    const shown = select(scope, result.hits.map(hit => hit.layer), true);
    ctx.manager.revealView(VIEW);
    await ctx.showMessage(
      shown
        ? 'Найдено элементов: ' + result.hits.length + '. Они подсвечены в модели.'
        : 'Найдено элементов: ' + result.hits.length + ', но активного вида чертежа нет.',
      shown ? 'info' : 'warning'
    );
  },

  /** Снять подсветку. */
  clear(ctx: Context): void {
    clearSelection(live(ctx));
  },

  /**
   * Выделение в модели изменилось.
   *
   * Программа шлёт это событие при выборе элемента в 3D. Выбранные объекты
   * лежат в слое чертежа активного вида, а нужный нам слой элемента — в поле
   * layer каждого объекта. Так же читает выделение и штатная панель свойств.
   */
  selection_changed(ctx: Context): void {
    const view = (ctx.cadview ?? (ctx.manager.activeWindow as CadViewDocumentWindow | undefined)?.context) as
      CadViewContext | undefined;
    const drawing = (view?.layer as unknown as {drawing?: SelectionSource} | undefined)?.drawing;
    if (!drawing?.selectedObjects) {
      showSelection([]);
      return;
    }

    const layers: DwgLayer[] = [];
    const seen = new Set<DwgLayer>();
    try {
      for (const object of drawing.selectedObjects()) {
        const layer = object?.layer;
        if (layer && !seen.has(layer)) {
          seen.add(layer);
          layers.push(layer);
        }
      }
    } catch {
      // Вид перестраивается, выделение прочитаем в следующий раз.
      return;
    }
    showSelection(layers);
  }
};

/** Слой чертежа вида, из которого читается выделение. В типах SDK он не описан. */
interface SelectionSource {
  selectedObjects(): Iterable<{layer?: DwgLayer}>;
}
