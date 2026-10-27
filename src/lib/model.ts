import type { Day, Month } from './dates';

export type Scope = 'income' | 'fixed' | 'invest' | 'expense' | 'overview';
export const RECURRING: Scope[] = ['income', 'fixed', 'invest'];

/** Special overview categories: "Zusätzliche Einnahmen" (always +), "Zusätzliche Ausgaben" (always −), Schulden (not counted). */
export type Kind = 'plus' | 'minus' | 'debt';

export interface Category {
  id: string;
  scope: Scope;
  name: string;
  icon: string;
  requiresGroup?: boolean;
  kind?: Kind;
  order: number;
  deleted?: boolean;
  deletedAt?: string;
}

export interface Group {
  id: string;
  categoryId: string;
  name: string;
  deleted?: boolean;
  deletedAt?: string;
}

export interface Entry {
  id: string;
  categoryId: string;
  groupId?: string;
  name: string;
  /** Cents, signed. */
  amount: number;
  /** Recurring entries (income/fixed/invest). */
  from?: Month;
  /** null = Unbegrenzt */
  to?: Month | null;
  /** One-off entries (expense/overview). */
  date?: Day;
  deleted?: boolean;
  deletedAt?: string;
}

export interface Data {
  /** First month the profile was used; earlier months don't count in the overview. */
  start?: Month;
  categories: Category[];
  groups: Group[];
  entries: Entry[];
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export const isRecurring = (scope: Scope) => RECURRING.includes(scope);

export function categoryOf(data: Data, id: string): Category | undefined {
  return data.categories.find((c) => c.id === id);
}

export function groupOf(data: Data, id: string | undefined): Group | undefined {
  return id ? data.groups.find((g) => g.id === id) : undefined;
}

/** Visible = entry, its category and (if any) its group are not deleted. */
export function isVisible(data: Data, e: Entry): boolean {
  if (e.deleted) return false;
  const c = categoryOf(data, e.categoryId);
  if (!c || c.deleted) return false;
  return !groupOf(data, e.groupId)?.deleted;
}

export function visibleCategories(data: Data, scope: Scope): Category[] {
  return data.categories.filter((c) => c.scope === scope && !c.deleted).sort((a, b) => a.order - b.order);
}

/** Sign the amounts of a category are forced to (1 / -1), or 0 when both are allowed. */
export function signOf(c: Category | undefined): 1 | -1 | 0 {
  return c?.kind === 'plus' ? 1 : c?.kind === 'minus' ? -1 : 0;
}

/** Overview categories that count in the totals (everything except Schulden). */
export function generalCategories(data: Data): Category[] {
  return visibleCategories(data, 'overview').filter((c) => c.kind !== 'debt');
}

export function debtCategories(data: Data): Category[] {
  return visibleCategories(data, 'overview').filter((c) => c.kind === 'debt');
}

export function visibleGroups(data: Data, categoryId: string): Group[] {
  return data.groups.filter((g) => g.categoryId === categoryId && !g.deleted);
}

const DEFAULTS: [Scope, string, string][] = [
  ['income', 'Gehalt', 'briefcase'],
  ['income', 'Weitere', 'ellipsis'],
  ['fixed', 'Wohnen', 'house'],
  ['fixed', 'Handy', 'smartphone'],
  ['fixed', 'Abos', 'tv-minimal-play'],
  ['fixed', 'Versicherung', 'shield-check'],
  ['fixed', 'Weitere', 'ellipsis'],
  ['invest', 'Crypto', 'bitcoin'],
  ['invest', 'Aktien', 'chart-candlestick'],
  ['invest', 'Weiteres', 'ellipsis'],
  ['expense', 'Essen', 'utensils'],
  ['expense', 'Shopping', 'shopping-bag'],
  ['expense', 'Reisen', 'plane'],
  ['expense', 'Weitere', 'ellipsis'],
];

/** Fixed ids, so two devices migrating the same profile create the same categories. */
const KIND_CATEGORIES: Record<Kind, Omit<Category, 'order'>> = {
  plus: { id: 'kind-plus', scope: 'overview', name: 'Zusätzliche Einnahmen', icon: 'dollar-plus', kind: 'plus' },
  minus: { id: 'kind-minus', scope: 'overview', name: 'Zusätzliche Ausgaben', icon: 'dollar-minus', kind: 'minus' },
  debt: { id: 'kind-debt', scope: 'overview', name: 'Schulden', icon: 'weight-dollar', kind: 'debt', requiresGroup: true },
};

export function defaultData(start?: Month): Data {
  const base = DEFAULTS.map(([scope, name, icon], order) => ({ id: uid(), scope, name, icon, order }));
  const kinds = (['plus', 'minus', 'debt'] as Kind[]).map((k, i) => ({ ...KIND_CATEGORIES[k], order: base.length + i }));
  return { start, categories: [...base, ...kinds], groups: [], entries: [] };
}

/**
 * Brings profiles from before the overview split up to date: the old Schulden category becomes the debt kind,
 * "Zusätzliche Einnahmen/Ausgaben" are added and the unused default "Other" goes away.
 * Returns the same object when nothing changed.
 */
export function migrate(data: Data): Data {
  let categories = data.categories.map((c) =>
    c.scope === 'overview' && c.requiresGroup && !c.kind
      ? { ...c, kind: 'debt' as const, icon: c.icon === 'hand-coins' ? 'weight-dollar' : c.icon }
      : c,
  );
  const used = new Set(data.entries.map((e) => e.categoryId));
  categories = categories.filter(
    (c) => !(c.scope === 'overview' && !c.kind && c.name === 'Other' && c.icon === 'ellipsis' && !used.has(c.id)),
  );
  const first = Math.min(0, ...categories.filter((c) => c.scope === 'overview').map((c) => c.order));
  for (const [i, k] of (['plus', 'minus'] as Kind[]).entries()) {
    if (!categories.some((c) => c.kind === k)) categories.push({ ...KIND_CATEGORIES[k], order: first - 2 + i });
  }
  const changed =
    categories.length !== data.categories.length || categories.some((c, i) => c !== data.categories[i]);
  return changed ? { ...data, categories } : data;
}
