/**
 * Скрытие и показ элементов.
 *
 * Видимость элемента — это свойство hidden его слоя. Оно наследуется потомками,
 * поэтому скрытие слоя убирает из вида и всё, что лежит внутри него. Меняем
 * значение так же, как это делает программа: через setx.
 */
import { sourcesOf } from './search';

/** Скрыть слои. Возвращает, сколько слоёв изменилось. */
export async function hideLayers(layers: DwgLayer[]): Promise<number> {
  const unique = new Set(layers);
  let changed = 0;
  for (const layer of unique) {
    try {
      if (layer.hidden) continue;
      await layer.setx('hidden', true);
      changed++;
    } catch {
      // Слой мог быть удалён вместе с выгруженным вложением.
    }
  }
  return changed;
}

/** Показать всё скрытое в проекте и во всех загруженных вложениях. */
export async function showAll(project: Drawing): Promise<number> {
  let changed = 0;
  for (const source of sourcesOf(project, true)) {
    const layers: DwgLayer[] = [];
    source.drawing.layers.forEach(layer => {
      if (layer.hidden) layers.push(layer);
    });
    for (const layer of layers) {
      try {
        await layer.setx('hidden', false);
        changed++;
      } catch {
        // Тот же случай: слоя уже нет.
      }
    }
  }
  return changed;
}

/** Сколько слоёв скрыто в проекте и вложениях. */
export function hiddenCount(project: Drawing): number {
  let count = 0;
  for (const source of sourcesOf(project, true)) {
    source.drawing.layers.forEach(layer => {
      if (layer.hidden) count++;
    });
  }
  return count;
}
