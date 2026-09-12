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

/**
 * Оставить видимыми только указанные элементы.
 *
 * Видимость наследуется, поэтому прятать каждый лишний слой по отдельности не
 * нужно и вредно: на большой модели это были бы тысячи операций. Идём от корней
 * вниз и прячем целую ветку там, где внутри неё нет ничего нужного. Внутрь
 * оставленных веток не заходим, там всё остаётся как было.
 */
export async function isolate(project: Drawing, keep: DwgLayer[]): Promise<{visible: number; hidden: number}> {
  const kept = new Set(keep);
  if (!kept.size) return {visible: 0, hidden: 0};

  // Предки нужных слоёв тоже должны остаться видимыми, иначе потомки не покажутся.
  const path = new Set<DwgLayer>();
  for (const layer of kept) {
    let parent = layer.layer;
    for (let depth = 0; parent && depth < 64; depth++) {
      path.add(parent);
      parent = parent.layer;
    }
  }

  let visible = 0;
  let hidden = 0;

  for (const source of sourcesOf(project, true)) {
    const children = new Map<DwgLayer | undefined, DwgLayer[]>();
    source.drawing.layers.forEach(layer => {
      const parent = layer.layer;
      const list = children.get(parent);
      if (list) list.push(layer);
      else children.set(parent, [layer]);
    });

    const walk = async (parent: DwgLayer | undefined): Promise<void> => {
      for (const layer of children.get(parent) ?? []) {
        const needed = kept.has(layer) || path.has(layer);
        try {
          if (needed) {
            if (layer.hidden) {
              await layer.setx('hidden', false);
              visible++;
            }
          } else if (!layer.hidden) {
            await layer.setx('hidden', true);
            hidden++;
          }
        } catch {
          // Слоя уже нет, идём дальше.
        }
        // Спускаемся только внутрь ветки, ведущей к нужным элементам.
        if (path.has(layer)) await walk(layer);
      }
    };

    await walk(undefined);
  }

  return {visible, hidden};
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
