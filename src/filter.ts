/**
 * Отбор найденного по условиям на свойства.
 *
 * Условия применяются к уже найденному, без повторного обхода моделей,
 * поэтому список пересобирается мгновенно.
 */
import { ANY_KEY, BUILTIN_KEYS, Condition, Hit } from './model';

/** Значение свойства элемента, включая псевдосвойства имени, модели и пути. */
function valueOf(hit: Hit, key: string): string | undefined {
  if (key === 'Имя') return hit.name;
  if (key === 'Модель') return hit.model;
  if (key === 'Путь') return hit.path;
  return hit.props[key];
}

/** Все значения, по которым проверяется условие с пустым ключом. */
function allValues(hit: Hit): string[] {
  const values = [hit.name, hit.model, hit.path];
  for (const key in hit.props) values.push(hit.props[key]);
  return values;
}

/** Сравнить одно значение с условием. */
function test(value: string | undefined, condition: Condition): boolean {
  const has = value !== undefined && value !== '';
  switch (condition.op) {
    case 'exists':
      return has;
    case 'missing':
      return !has;
    default:
      break;
  }
  if (!has) return false;

  const left = (value as string).toLowerCase();
  const right = condition.value.trim().toLowerCase();

  switch (condition.op) {
    case 'contains':
      return left.includes(right);
    case 'notContains':
      return !left.includes(right);
    case 'equals':
      return left === right;
    case 'notEquals':
      return left !== right;
    case 'gt':
    case 'lt': {
      const a = parseFloat((value as string).replace(',', '.'));
      const b = parseFloat(condition.value.replace(',', '.'));
      if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
      return condition.op === 'gt' ? a > b : a < b;
    }
    default:
      return false;
  }
}

/** Проверить элемент одним условием. */
function matches(hit: Hit, condition: Condition): boolean {
  if (condition.key !== ANY_KEY) return test(valueOf(hit, condition.key), condition);

  // Пустой ключ означает «любое свойство».
  if (condition.op === 'missing') return allValues(hit).every(value => !test(value, {...condition, op: 'exists'}));
  return allValues(hit).some(value => test(value, condition));
}

/** Отобрать находки, удовлетворяющие всем условиям. */
export function applyConditions(hits: Hit[], conditions: Condition[]): Hit[] {
  const active = conditions.filter(c => c.op === 'exists' || c.op === 'missing' || c.value.trim() !== '' || c.key !== ANY_KEY);
  if (!active.length) return hits;
  return hits.filter(hit => active.every(condition => matches(hit, condition)));
}

/** Список свойств, встречающихся в находках. Для выбора в условии. */
export function propertyKeys(hits: Hit[]): string[] {
  const keys = new Set<string>();
  for (const hit of hits) for (const key in hit.props) keys.add(key);
  const sorted = [...keys].sort((a, b) => a.localeCompare(b, 'ru'));
  return [...BUILTIN_KEYS, ...sorted];
}
