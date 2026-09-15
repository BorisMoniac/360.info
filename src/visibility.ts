/**
 * Скрытие и показ элементов.
 *
 * Видимость слоя хранится не в его данных, а в настройках чертежа: программа
 * держит там набор ключей скрытых слоёв. Поэтому менять её нужно присваиванием
 * `layer.hidden`, как это делает лампочка в дереве проекта. Запись через setx
 * не работает: геттер сначала смотрит в настройки и расширенные данные не видит.
 *
 * Для отрисовки видимость наследуется, но лампочка в дереве показывает
 * собственный флаг слоя. Чтобы дерево не расходилось с видом, дочерние слои
 * помечаются явно, тем же способом, что и в дереве.
 */
import { sourcesOf } from './search';

/** Безопасно задать видимость слоя. */
function setHidden(layer: DwgLayer, value: boolean): boolean {
  try {
    if (layer.hidden === value) return false;
    layer.hidden = value;
    return true;
  } catch {
    // Слой мог исчезнуть вместе с выгруженным вложением.
    return false;
  }
}

/** Слой и все его потомки. */
function withChildren(layer: DwgLayer): DwgLayer[] {
  const all = [layer];
  try {
    layer.walkChilds(child => {
      all.push(child);
    });
  } catch {
    // Обход недоступен, обойдёмся самим слоем.
  }
  return all;
}

/** Скрыть слои вместе с их содержимым. Возвращает, сколько слоёв изменилось. */
export async function hideLayers(layers: DwgLayer[]): Promise<number> {
  const targets = new Set<DwgLayer>();
  for (const layer of layers) for (const item of withChildren(layer)) targets.add(item);

  let changed = 0;
  for (const layer of targets) if (setHidden(layer, true)) changed++;
  return changed;
}

/**
 * Оставить видимыми только указанные элементы.
 *
 * Видимыми остаются сами элементы, их содержимое и ветка предков над ними,
 * иначе скрытый родитель погасил бы всё внутри. Остальное скрывается.
 */
export async function isolate(project: Drawing, keep: DwgLayer[]): Promise<{visible: number; hidden: number}> {
  if (!keep.length) return {visible: 0, hidden: 0};

  const wanted = new Set<DwgLayer>();
  for (const layer of keep) {
    for (const item of withChildren(layer)) wanted.add(item);
    let parent = layer.layer;
    for (let depth = 0; parent && depth < 64; depth++) {
      wanted.add(parent);
      parent = parent.layer;
    }
  }

  let visible = 0;
  let hidden = 0;

  for (const source of sourcesOf(project, true)) {
    const layers: DwgLayer[] = [];
    source.drawing.layers.forEach(layer => {
      layers.push(layer);
    });
    for (const layer of layers) {
      if (wanted.has(layer)) {
        if (setHidden(layer, false)) visible++;
      } else if (setHidden(layer, true)) {
        hidden++;
      }
    }
  }

  return {visible, hidden};
}

/**
 * Показать слои.
 *
 * Снимаем скрытие не только с самих элементов и их содержимого, но и с предков:
 * скрытый родитель гасит всё внутри, и без этого элемент остался бы невидимым.
 * Так же поступает дерево проекта при включении лампочки.
 */
export async function showLayers(layers: DwgLayer[]): Promise<number> {
  const targets = new Set<DwgLayer>();
  for (const layer of layers) {
    for (const item of withChildren(layer)) targets.add(item);
    let parent = layer.layer;
    for (let depth = 0; parent && depth < 64; depth++) {
      targets.add(parent);
      parent = parent.layer;
    }
  }

  let changed = 0;
  for (const layer of targets) if (setHidden(layer, false)) changed++;
  return changed;
}

/** Виден ли элемент с учётом скрытых родителей. */
export function isVisible(layer: DwgLayer): boolean {
  try {
    return !layer.resolveHidden();
  } catch {
    return true;
  }
}

/** Показать всё скрытое в проекте и во всех загруженных вложениях. */
export async function showAll(project: Drawing): Promise<number> {
  let changed = 0;
  for (const source of sourcesOf(project, true)) {
    const layers: DwgLayer[] = [];
    source.drawing.layers.forEach(layer => {
      layers.push(layer);
    });
    for (const layer of layers) if (setHidden(layer, false)) changed++;
  }
  return changed;
}
