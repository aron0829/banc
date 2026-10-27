import { describe, expect, it } from 'vitest';
import {
  balance, categoryTotal, expenses, groupedEntries, hasActivity, income, isActive, limitHint,
  debtEntries, effectiveStart, generalTotal, overviewCategoryTotal, overviewMonths, overviewTotal, ownYearResult, previousYears,
  scopeTotal, usedPercent, yearSummaryTotal,
} from './calc';
import type { Category, Data, Entry, Scope } from './model';

function cat(id: string, scope: Scope, extra: Partial<Category> = {}): Category {
  return { id, scope, name: id, icon: 'ellipsis', order: 0, ...extra };
}
let n = 0;
function entry(categoryId: string, amount: number, extra: Partial<Entry> = {}): Entry {
  return { id: `e${n++}`, categoryId, name: '', amount, ...extra };
}
function base(): Data {
  return {
    categories: [
      cat('job', 'income'), cat('wohnen', 'fixed'), cat('handy', 'fixed'), cat('crypto', 'invest'),
      cat('essen', 'expense'), cat('shopping', 'expense'), cat('schulden', 'overview', { requiresGroup: true, kind: 'debt' }), cat('other', 'overview'),
    ],
    groups: [{ id: 'mama', categoryId: 'schulden', name: 'Mama' }, { id: 'g1', categoryId: 'essen', name: 'Group 1' }],
    entries: [],
  };
}

describe('isActive', () => {
  const e = entry('job', 100, { from: '2026-10', to: '2027-02' });
  it('counts recurring entries across the year boundary', () => {
    expect(isActive(e, '2027-01')).toBe(true);
    expect(isActive(e, '2026-10')).toBe(true);
    expect(isActive(e, '2027-02')).toBe(true);
    expect(isActive(e, '2027-03')).toBe(false);
    expect(isActive(e, '2026-09')).toBe(false);
  });
  it('treats to = null as unlimited', () => {
    expect(isActive(entry('job', 1, { from: '2022-08', to: null }), '2030-05')).toBe(true);
  });
  it('never treats one-off entries as active', () => {
    expect(isActive(entry('essen', 1, { date: '2026-10-01' }), '2026-10')).toBe(false);
  });
});

describe('month (design scenario October 2026)', () => {
  const d = base();
  d.entries = [
    entry('job', 75800, { from: '2026-10', to: '2027-02' }), // Erasmus
    entry('job', 37000, { from: '2022-08', to: null }), // Eltern
    entry('wohnen', 52000, { from: '2026-10', to: '2027-02' }),
    entry('handy', 4200, { from: '2026-01', to: '2028-01' }),
    entry('handy', 1000, { from: '2026-01', to: null }),
    entry('wohnen', 48000, { from: '2023-10', to: '2026-09' }), // outdated, must not count
    entry('crypto', 10000, { from: '2026-10', to: null }),
    entry('essen', 1000, { date: '2026-10-01', groupId: 'g1' }),
    entry('essen', 500, { date: '2026-10-13' }),
    entry('essen', 9900, { date: '2026-11-02' }), // other month
  ];
  it('sums income of active recurring entries', () => expect(income(d, '2026-10')).toBe(112800));
  it('sums fixed costs and investments', () => {
    expect(scopeTotal(d, 'fixed', '2026-10')).toBe(57200);
    expect(scopeTotal(d, 'invest', '2026-10')).toBe(10000);
  });
  it('sums one-off expenses of the month per category', () => {
    expect(categoryTotal(d, 'essen', '2026-10')).toBe(1500);
    expect(categoryTotal(d, 'shopping', '2026-10')).toBe(0);
  });
  it('computes Ausgaben = invest + fixed + variable and Bilanz = Einnahmen - Ausgaben', () => {
    expect(expenses(d, '2026-10')).toBe(57200 + 10000 + 1500);
    expect(balance(d, '2026-10')).toBe(112800 - 68700);
  });
  it('computes used percent = Ausgaben / Einnahmen', () => {
    expect(usedPercent(d, '2026-10')).toBe(Math.round((68700 / 112800) * 100));
  });
  it('returns null used percent without income', () => expect(usedPercent(d, '2021-01')).toBeNull());
  it('detects activity from recurring or one-off entries', () => {
    expect(hasActivity(d, '2026-10')).toBe(true);
    expect(hasActivity(d, '2021-01')).toBe(false);
  });
});

describe('limitHint', () => {
  const d = base();
  d.entries = [
    entry('wohnen', 5000, { from: '2026-10', to: null }),
    entry('crypto', 5000, { from: '2026-10', to: null }),
    entry('essen', 10000, { date: '2026-10-05' }),
  ];
  const withIncome = (cents: number): Data => ({ ...d, entries: [...d.entries, entry('job', cents, { from: '2026-10', to: null })] });
  it('warns when the projection exceeds income in the current month', () => {
    // 100 + 100 / 10 * 31 = 410 > 300
    expect(limitHint(withIncome(30000), '2026-10', '2026-10-10')).toBe('Du erreichst dein Monatslimit voraussichtlich vorzeitig');
  });
  it('reassures when the projection stays within income', () => {
    expect(limitHint(withIncome(50000), '2026-10', '2026-10-10')).toBe('Du bleibst voraussichtlich im Limit');
  });
  it('says closed for past months and nothing for future months', () => {
    expect(limitHint(withIncome(50000), '2026-10', '2026-11-03')).toBe('Monat abgeschlossen');
    expect(limitHint(withIncome(50000), '2026-11', '2026-10-10')).toBeNull();
  });
  it('shows nothing without income', () => expect(limitHint(d, '2026-10', '2026-10-10')).toBeNull());
});

describe('overview', () => {
  const d = base();
  d.entries = [
    entry('job', 100000, { from: '2026-06', to: null }),
    entry('essen', 30000, { date: '2026-07-04' }),
    entry('schulden', 5000, { date: '2026-10-01', groupId: 'mama' }),
    entry('schulden', -1000, { date: '2026-10-03', groupId: 'mama' }),
    entry('schulden', 6000, { date: '2026-10-10', groupId: 'mama' }),
    entry('other', 10000, { date: '2025-03-01', name: 'Startwert' }),
    entry('other', 2000, { date: '2024-01-01' }),
  ];
  const today = '2026-08-15';
  it('lists months with activity up to today only', () => {
    expect(overviewMonths(d, 2026, today)).toEqual([
      { month: '2026-06', balance: 100000 },
      { month: '2026-07', balance: 70000 },
      { month: '2026-08', balance: 100000 },
    ]);
  });
  it('lists no months for future years', () => expect(overviewMonths(d, 2027, today)).toEqual([]));
  it('sums overview categories within the year, signed', () => {
    expect(overviewCategoryTotal(d, 'schulden', 2026)).toBe(10000);
    expect(overviewCategoryTotal(d, 'other', 2026)).toBe(0);
  });
  it('computes own year result = months + overview categories, without Schulden', () => {
    expect(generalTotal(d, 2026)).toBe(0);
    expect(ownYearResult(d, 2026, today)).toBe(270000);
  });
  it('keeps Schulden apart, summed over all years', () => {
    expect(debtEntries(d, 'schulden').reduce((s, e) => s + e.amount, 0)).toBe(10000);
  });
  it('carries previous years, newest first, skipping zero years', () => {
    expect(previousYears(d, 2026, today)).toEqual([{ year: 2025, total: 10000 }, { year: 2024, total: 2000 }]);
  });
  it('computes Jahresübersicht = months + previous years and total = Jahresübersicht + Allgemein', () => {
    expect(yearSummaryTotal(d, 2026, today)).toBe(270000 + 12000);
    expect(overviewTotal(d, 2026, today)).toBe(270000 + 12000);
    const withGeneral: Data = { ...d, entries: [...d.entries, entry('other', -3000, { date: '2026-05-01' })] };
    expect(overviewTotal(withGeneral, 2026, today)).toBe(270000 + 12000 - 3000);
  });
});

describe('profile start month', () => {
  it('ignores months before the profile start in overview and previous years', () => {
    const d: Data = { ...base(), start: '2026-07' };
    d.entries = [entry('job', 37000, { from: '2022-08', to: null }), entry('other', 10000, { date: '2025-03-01' })];
    expect(overviewMonths(d, 2026, '2026-08-15').map((m) => m.month)).toEqual(['2026-07', '2026-08']);
    expect(previousYears(d, 2026, '2026-08-15')).toEqual([{ year: 2025, total: 10000 }]);
  });
});

describe('deleted things do not count', () => {
  it('ignores entries of a deleted category or group and deleted entries', () => {
    const d = base();
    d.categories = d.categories.map((c) => (c.id === 'shopping' ? { ...c, deleted: true } : c));
    d.groups = d.groups.map((g) => ({ ...g, deleted: true }));
    d.entries = [
      entry('shopping', 1000, { date: '2026-10-01' }),
      entry('essen', 2000, { date: '2026-10-01', groupId: 'g1' }),
      entry('essen', 4000, { date: '2026-10-01', deleted: true }),
      entry('essen', 300, { date: '2026-10-02' }),
    ];
    expect(categoryTotal(d, 'shopping', '2026-10')).toBe(0);
    expect(expenses(d, '2026-10')).toBe(300);
  });
});

describe('groupedEntries', () => {
  it('puts groups first with totals, then ungrouped entries', () => {
    const d = base();
    const a = entry('essen', 1000, { date: '2026-10-01', groupId: 'g1' });
    const b = entry('essen', 500, { date: '2026-10-13' });
    const c = entry('essen', 200, { date: '2026-10-02', groupId: 'g1' });
    const rows = groupedEntries(d, [b, a, c]);
    expect(rows.map((r) => [r.group?.name ?? null, r.total, r.entries.map((e) => e.amount)])).toEqual([
      ['Group 1', 1200, [1000, 200]],
      [null, 500, [500]],
    ]);
  });
});

describe('backfilled months', () => {
  it('moves the profile start back to the earliest expense entry', () => {
    const d: Data = { ...base(), start: '2026-10' };
    d.entries = [entry('job', 100000, { from: '2026-01', to: null }), entry('essen', 2000, { date: '2026-03-05' })];
    expect(effectiveStart(d)).toBe('2026-03');
    expect(overviewMonths(d, 2026, '2026-10-27').map((m) => m.month)).toEqual([
      '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10',
    ]);
  });
});
