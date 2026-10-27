import { describe, expect, it } from 'vitest';
import { debtCategories, defaultData, generalCategories, migrate, signOf, type Category, type Data } from './model';

const cat = (id: string, extra: Partial<Category> = {}): Category => ({ id, scope: 'overview', name: id, icon: 'ellipsis', order: 14, ...extra });

describe('defaultData', () => {
  it('has Zusätzliche Einnahmen/Ausgaben and Schulden in the overview', () => {
    const d = defaultData('2026-10');
    expect(generalCategories(d).map((c) => c.kind)).toEqual(['plus', 'minus']);
    expect(debtCategories(d).map((c) => c.name)).toEqual(['Schulden']);
  });
  it('needs no migration', () => {
    const d = defaultData('2026-10');
    expect(migrate(d)).toBe(d);
  });
});

describe('migrate', () => {
  const old = (): Data => ({
    categories: [
      cat('schulden', { name: 'Schulden', icon: 'hand-coins', requiresGroup: true }),
      cat('other', { name: 'Other', order: 15 }),
    ],
    groups: [],
    entries: [],
  });
  it('turns Schulden into the debt kind, adds plus/minus first and drops the unused Other', () => {
    const d = migrate(old());
    expect(d.categories.find((c) => c.id === 'schulden')).toMatchObject({ kind: 'debt', icon: 'weight-dollar' });
    expect(generalCategories(d).map((c) => c.kind)).toEqual(['plus', 'minus']);
    expect(migrate(d)).toBe(d);
  });
  it('keeps Other when it holds entries', () => {
    const d = old();
    d.entries = [{ id: 'e', categoryId: 'other', name: 'Startwert', amount: 1000, date: '2025-03-01' }];
    expect(generalCategories(migrate(d)).map((c) => c.id)).toEqual(['kind-plus', 'kind-minus', 'other']);
  });
  it('does not bring back a deleted plus category', () => {
    const d = migrate(old());
    const deleted = { ...d, categories: d.categories.map((c) => (c.kind === 'plus' ? { ...c, deleted: true } : c)) };
    expect(migrate(deleted)).toBe(deleted);
  });
});

describe('signOf', () => {
  it('forces + for Zusätzliche Einnahmen and − for Zusätzliche Ausgaben', () => {
    expect(signOf(cat('a', { kind: 'plus' }))).toBe(1);
    expect(signOf(cat('b', { kind: 'minus' }))).toBe(-1);
    expect(signOf(cat('c', { kind: 'debt' }))).toBe(0);
    expect(signOf(undefined)).toBe(0);
  });
});
