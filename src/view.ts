/**
 * Выделение найденных элементов и перевод камеры.
 *
 * Платформа делает это через слой чертежа активного вида: у составного слоя
 * есть подслой drawing с методом selectLayers, который выделяет набор слоёв
 * и при необходимости подгоняет камеру. Тем же способом работают штатные
 * фильтры в дереве проекта.
 */

/** Слой чертежа активного вида. В типах SDK он не описан, поэтому объявлен здесь. */
interface DrawingViewLayer {
  selectLayers(layers: DwgLayer[], zoom?: boolean): void;
}

/** Составной слой вида с подслоем чертежа. */
interface CompoundWithDrawing {
  drawing?: DrawingViewLayer;
}

/** Найти слой чертежа активного окна. */
function drawingLayer(ctx: Context): DrawingViewLayer | undefined {
  const direct = (ctx.cadview?.layer as unknown as CompoundWithDrawing | undefined)?.drawing;
  if (direct) return direct;

  const window = ctx.manager.activeWindow as CadViewDocumentWindow | undefined;
  const compound = window?.context?.layer as unknown as CompoundWithDrawing | undefined;
  if (compound?.drawing) return compound.drawing;

  for (const candidate of ctx.manager.windows) {
    const view = (candidate as CadViewDocumentWindow).context;
    const layer = view?.layer as unknown as CompoundWithDrawing | undefined;
    if (layer?.drawing) return layer.drawing;
  }
  return undefined;
}

/** Есть ли вид, в котором можно что-то выделить. */
export function hasView(ctx: Context): boolean {
  return drawingLayer(ctx) !== undefined;
}

/**
 * Выделить слои. При zoom камера переводится к выделенному.
 * Возвращает false, если активного вида чертежа нет.
 */
export function select(ctx: Context, layers: DwgLayer[], zoom: boolean): boolean {
  const layer = drawingLayer(ctx);
  if (!layer) return false;
  layer.selectLayers(layers, zoom);
  return true;
}

/** Снять выделение. */
export function clear(ctx: Context): boolean {
  return select(ctx, [], false);
}
