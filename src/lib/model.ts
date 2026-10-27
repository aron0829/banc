import type { Day, Month } from './dates';

export type Scope = 'income' | 'fixed' | 'invest' | 'expense' | 'overview';
export const RECURRING: Scope[] = ['income', 'fixed', 'invest'];

export interface Category {
  id: string;
  scope: Scope;
  name: string;
  icon: string;
  requiresGroup?: boolean;
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

export function visibleGroups(data: Data, categoryId: string): Group[] {
  return data.groups.filter((g) => g.categoryId === categoryId && !g.deleted);
}

const DEFAULTS: [Scope, string, string, boolean?][] = [
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
  ['overview', 'Schulden', 'hand-coins', true],
  ['overview', 'Other', 'ellipsis'],
];

export function defaultData(start?: Month): Data {
  return {
    start,
    categories: DEFAULTS.map(([scope, name, icon, requiresGroup], order) => ({
      id: uid(),
      scope,
      name,
      icon,
      order,
      ...(requiresGroup ? { requiresGroup } : {}),
    })),
    groups: [],
    entries: [],
  };
}
