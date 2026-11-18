import { groupedEntries } from './calc';
import { dayLabel, shortMonth } from './dates';
import { formatHours } from './money';
import { visibleCategories, type Category, type Data, type Entry, type Scope } from './model';

export interface ListSection {
  key: string;
  /** Without label the entries are shown as top-level rows. */
  label?: string;
  /** Sits below a category header: indented one level, unlabelled entries become normal rows. */
  nested?: boolean;
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

/** Newest first: groups with totals, ungrouped entries as top-level rows in between. */
export function byGroup(data: Data, entries: Entry[]): ListSection[] {
  return groupedEntries(data, entries).map((r, i) =>
    r.group ? { key: r.group.id, label: r.group.name, total: r.total, entries: r.entries } : { key: `loose-${i}`, entries: r.entries },
  );
}

/**
 * Variable Einnahmen: a header per category (with icon and total), below it the groups and loose entries newest first.
 */
export function byCategoryAndGroup(data: Data, scope: Scope, entries: Entry[], onLongPress?: (c: Category) => void): ListSection[] {
  return byCategory(data, scope, entries, onLongPress).flatMap((head) => [
    { ...head, entries: [] },
    ...byGroup(data, head.entries).map((s) => ({ ...s, key: `${head.key}/${s.key}`, nested: true })),
  ]);
}

/** Name of the entry; nameless variable income shows its hours instead. */
export function entryName(e: Entry): string {
  return e.name || (e.hours != null ? formatHours(e.hours) : '–');
}

/** "1. Okt" for one-off entries, "Okt 26 - Unlimited" for recurring ones. */
export function entryWhen(e: Entry): string {
  if (e.date) return e.name && e.hours != null ? `${formatHours(e.hours)} · ${dayLabel(e.date)}` : dayLabel(e.date);
  if (!e.from) return '';
  return `${shortMonth(e.from)} - ${e.to ? shortMonth(e.to) : 'Unlimited'}`;
}
