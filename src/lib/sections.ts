import { groupedEntries } from './calc';
import { dayLabel, shortMonth } from './dates';
import { visibleCategories, type Category, type Data, type Entry, type Scope } from './model';

export interface ListSection {
  key: string;
  /** Without label the entries are shown as top-level rows. */
  label?: string;
  icon?: string;
  total?: number;
  entries: Entry[];
  onHeaderLongPress?: () => void;
  onHeaderTap?: () => void;
}

/** One section per category of the scope (recurring lists), empty categories skipped. */
export function byCategory(data: Data, scope: Scope, entries: Entry[], onLongPress?: (c: Category) => void): ListSection[] {
  return visibleCategories(data, scope)
    .map((c) => {
      const list = entries.filter((e) => e.categoryId === c.id);
      return {
        key: c.id,
        label: c.name,
        icon: c.icon,
        total: list.reduce((s, e) => s + e.amount, 0),
        entries: list,
        onHeaderLongPress: onLongPress && (() => onLongPress(c)),
      };
    })
    .filter((s) => s.entries.length > 0);
}

/** Groups with totals, then ungrouped entries as top-level rows. */
export function byGroup(data: Data, entries: Entry[]): ListSection[] {
  return groupedEntries(data, entries).map((r) =>
    r.group ? { key: r.group.id, label: r.group.name, total: r.total, entries: r.entries } : { key: 'loose', entries: r.entries },
  );
}

/** "1. Okt" for one-off entries, "Okt 26 - Unlimited" for recurring ones. */
export function entryWhen(e: Entry): string {
  if (e.date) return dayLabel(e.date);
  if (!e.from) return '';
  return `${shortMonth(e.from)} - ${e.to ? shortMonth(e.to) : 'Unlimited'}`;
}
