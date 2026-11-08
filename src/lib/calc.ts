import { monthOf, monthsOfYear, yearOf, type Day, type Month } from './dates';
import { categoryOf, generalCategories, groupOf, isVisible, type Data, type Entry, type Group, type Scope } from './model';

const sum = (entries: Entry[]) => entries.reduce((s, e) => s + e.amount, 0);

/** Recurring entry counts in month m (from ≤ m ≤ to, to = null means unlimited). */
export function isActive(e: Entry, m: Month): boolean {
  if (!e.from) return false;
  return e.from <= m && (e.to == null || m <= e.to);
}

function entriesOfScope(data: Data, scope: Scope): Entry[] {
  return data.entries.filter((e) => categoryOf(data, e.categoryId)?.scope === scope && isVisible(data, e));
}

/** Visible entries of a scope that count in month m (recurring: active; one-off: dated in m). */
export function scopeEntriesForMonth(data: Data, scope: Scope, m: Month): Entry[] {
  return entriesOfScope(data, scope).filter((e) => (e.date ? monthOf(e.date) === m : isActive(e, m)));
}

export const scopeTotal = (data: Data, scope: Scope, m: Month) => sum(scopeEntriesForMonth(data, scope, m));

export function categoryEntriesForMonth(data: Data, categoryId: string, m: Month): Entry[] {
  const scope = categoryOf(data, categoryId)?.scope;
  return scope ? scopeEntriesForMonth(data, scope, m).filter((e) => e.categoryId === categoryId) : [];
}

export const categoryTotal = (data: Data, categoryId: string, m: Month) => sum(categoryEntriesForMonth(data, categoryId, m));

export const income = (data: Data, m: Month) => scopeTotal(data, 'income', m);

export function expenses(data: Data, m: Month): number {
  return scopeTotal(data, 'invest', m) + scopeTotal(data, 'fixed', m) + scopeTotal(data, 'expense', m);
}

export const balance = (data: Data, m: Month) => income(data, m) - expenses(data, m);

/** "Fix": what is left for variable spending = Einnahmen − Fixkosten − Investments. */
export const budget = (data: Data, m: Month) => income(data, m) - scopeTotal(data, 'fixed', m) - scopeTotal(data, 'invest', m);

/** How much of the budget the variable spending has used. */
export function budgetUsage(data: Data, m: Month): { spent: number; budget: number; percent: number | null } | null {
  if (income(data, m) === 0) return null;
  const left = budget(data, m);
  const spent = scopeTotal(data, 'expense', m);
  return { spent, budget: left, percent: left > 0 ? Math.round((spent / left) * 100) : null };
}

export function hasActivity(data: Data, m: Month): boolean {
  return (['income', 'fixed', 'invest', 'expense'] as Scope[]).some((s) => scopeEntriesForMonth(data, s, m).length > 0);
}

/** Profile start, moved back to the earliest expense entry so backfilled months count. */
export function effectiveStart(data: Data): Month | undefined {
  const firstExpense = entriesOfScope(data, 'expense')
    .map((e) => monthOf(e.date!))
    .sort()[0];
  if (!data.start) return undefined;
  return firstExpense && firstExpense < data.start ? firstExpense : data.start;
}

/** Months of the year up to today (and from the profile start) that have entries, with their balance. */
export function overviewMonths(data: Data, year: number, today: Day): { month: Month; balance: number }[] {
  const now = monthOf(today);
  const start = effectiveStart(data);
  return monthsOfYear(year)
    .filter((m) => m <= now && (!start || m >= start) && hasActivity(data, m))
    .map((m) => ({ month: m, balance: balance(data, m) }));
}

export function overviewCategoryEntries(data: Data, categoryId: string, year: number): Entry[] {
  return data.entries.filter((e) => e.categoryId === categoryId && isVisible(data, e) && !!e.date && yearOf(e.date) === year);
}

export const overviewCategoryTotal = (data: Data, categoryId: string, year: number) =>
  sum(overviewCategoryEntries(data, categoryId, year));

/** "Allgemein": one-off overview entries of the year; Schulden don't count. */
export const generalTotal = (data: Data, year: number) =>
  generalCategories(data).reduce((s, c) => s + overviewCategoryTotal(data, c.id, year), 0);

export function ownYearResult(data: Data, year: number, today: Day): number {
  return overviewMonths(data, year, today).reduce((s, m) => s + m.balance, 0) + generalTotal(data, year);
}

/** Schulden over all years, since they carry on until paid back. */
export function debtEntries(data: Data, categoryId: string): Entry[] {
  return data.entries.filter((e) => e.categoryId === categoryId && isVisible(data, e));
}

function firstYear(data: Data): number | null {
  const years = data.entries.filter((e) => isVisible(data, e)).map((e) => yearOf((e.date ?? e.from)!));
  if (data.start) years.push(yearOf(data.start));
  return years.length ? Math.min(...years) : null;
}

/** Own results of all earlier years ≠ 0, newest first. */
export function previousYears(data: Data, year: number, today: Day): { year: number; total: number }[] {
  const first = firstYear(data);
  const out: { year: number; total: number }[] = [];
  if (first == null) return out;
  for (let y = year - 1; y >= first; y--) {
    const total = ownYearResult(data, y, today);
    if (total !== 0) out.push({ year: y, total });
  }
  return out;
}

/** "Jahresübersicht": month balances of the year plus the results of earlier years. */
export function yearSummaryTotal(data: Data, year: number, today: Day): number {
  const months = overviewMonths(data, year, today).reduce((s, m) => s + m.balance, 0);
  return months + previousYears(data, year, today).reduce((s, y) => s + y.total, 0);
}

export function overviewTotal(data: Data, year: number, today: Day): number {
  return yearSummaryTotal(data, year, today) + generalTotal(data, year);
}

export interface EntryRow {
  group?: Group;
  total: number;
  entries: Entry[];
}

/**
 * Newest first: a group sits where its newest entry is, ungrouped entries in between become rows without group.
 * Entries of the same day keep the newest added on top.
 */
export function groupedEntries(data: Data, entries: Entry[]): EntryRow[] {
  const newest = [...entries].reverse().sort((a, b) => (b.date ?? b.from ?? '').localeCompare(a.date ?? a.from ?? ''));
  const rows = new Map<string, EntryRow>();
  const out: EntryRow[] = [];
  for (const e of newest) {
    const g = groupOf(data, e.groupId);
    let row = g ? rows.get(g.id) : out.at(-1)?.group ? undefined : out.at(-1);
    if (!row) {
      row = { group: g, total: 0, entries: [] };
      if (g) rows.set(g.id, row);
      out.push(row);
    }
    row.total += e.amount;
    row.entries.push(e);
  }
  return out;
}
