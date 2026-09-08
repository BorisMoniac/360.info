/**
 * Выделение найденных элементов и перевод камеры.
 *
 * Выделяем сами, а не через selectLayers слоя чертежа. Тот метод только шлёт
 * событие, а выделение и подгонку камеры выполняет панель дерева проекта.
 * Когда открыта наша панель, дерево скрыто, обрабатывать событие некому,
 * и переход не срабатывал.
 */

/** Объект вида, у которого есть слой и границы. */
interface ViewObject {
  layer?: DwgLayer;
  qbounds?: (target: box3) => boolean;
}

/** Найти контекст вида чертежа. */
function viewOf(ctx: Context): CadViewContext | undefined {
  if (ctx.cadview) return ctx.cadview;
  const active = (ctx.manager.activeWindow as CadViewDocumentWindow | undefined)?.context;
  if (active) return active;
  for (const candidate of ctx.manager.windows) {
    const view = (candidate as CadViewDocumentWindow).context;
    if (view) return view;
  }
  return undefined;
}

/** Есть ли вид, в котором можно что-то выделить. */
export function hasView(ctx: Context): boolean {
  return viewOf(ctx) !== undefined;
}

/** Проверить, что слой объекта — искомый или его потомок. */
function belongs(layer: DwgLayer | undefined, wanted: Set<DwgLayer>): boolean {
  let current = layer;
  for (let depth = 0; current && depth < 32; depth++) {
    if (wanted.has(current)) return true;
    current = current.layer;
  }
  return false;
}

/**
 * Выделить слои. При zoom камера переводится к выделенному.
 *
 * Границы собираем прямо в предикате: он и так вызывается для каждого объекта
 * вида, поэтому отдельный обход модели не нужен.
 */
export function select(ctx: Context, layers: DwgLayer[], zoom: boolean): boolean {
  const view = viewOf(ctx);
  if (!view) return false;

  const wanted = new Set(layers);
  const box = Math3d.box3.alloc();
  const item = Math3d.box3.alloc();
  let found = 0;

  view.layer.clearSelected();
  if (wanted.size) {
    view.layer.selectObjects(obj => {
      const target = obj as ViewObject;
      if (!belongs(target?.layer, wanted)) return false;
      if (target.qbounds && target.qbounds(item)) {
        if (found === 0) Math3d.box3.dup(box, item);
        else Math3d.box3.addBox(box, item);
        found++;
      }
      return true;
    }, true);
  }

  if (zoom && found > 0) {
    try {
      view.camera.zoom(box, view);
    } catch {
      // Камера может отказаться от вырожденных границ, выделение при этом остаётся.
    }
  }

  view.invalidate();
  return true;
}

/** Снять выделение. */
export function clear(ctx: Context): boolean {
  const view = viewOf(ctx);
  if (!view) return false;
  view.layer.clearSelected();
  view.invalidate();
  return true;
}
