import { describe, expect, it } from 'vitest';
import { expenses } from './calc';
import { isVisible, type Data } from './model';
import {
  addCategory, addEntry, addGroup, deleteCategory, deleteEntry, deleteGroup, renameGroup,
  restoreCategory, restoreEntry, restoreGroup, trash, updateCategory, updateEntry,
} from './ops';

function base(): Data {
  return {
    categories: [{ id: 'essen', scope: 'expense', name: 'Essen', icon: 'utensils', order: 0 }],
    groups: [{ id: 'g1', categoryId: 'essen', name: 'Group 1' }],
    entries: [
      { id: 'a', categoryId: 'essen', groupId: 'g1', name: 'Abendessen', amount: 1000, date: '2026-10-01' },
      { id: 'b', categoryId: 'essen', name: 'Snack', amount: 500, date: '2026-10-13' },
    ],
  };
}
const entryById = (d: Data, id: string) => d.entries.find((e) => e.id === id)!;

describe('entries', () => {
  it('adds an entry with a new id without mutating the input', () => {
    const d = base();
    const next = addEntry(d, { categoryId: 'essen', name: 'Pizza', amount: 1200, date: '2026-10-20' });
    expect(d.entries).toHaveLength(2);
    expect(next.entries).toHaveLength(3);
    expect(next.entries[2].id).toBeTruthy();
    expect(expenses(next, '2026-10')).toBe(2700);
  });
  it('updates an entry', () => {
    const next = updateEntry(base(), 'b', { amount: 700, groupId: 'g1' });
    expect(entryById(next, 'b')).toMatchObject({ amount: 700, groupId: 'g1' });
  });
  it('moves a deleted entry to the trash', () => {
    const next = deleteEntry(base(), 'b', '2026-10-27T10:00:00Z');
    expect(isVisible(next, entryById(next, 'b'))).toBe(false);
    expect(trash(next)).toEqual([
      expect.objectContaining({ category: expect.objectContaining({ id: 'essen' }), entries: [expect.objectContaining({ id: 'b' })] }),
    ]);
  });
  it('restores a deleted entry', () => {
    const next = restoreEntry(deleteEntry(base(), 'b', '2026-10-27T10:00:00Z'), 'b');
    expect(isVisible(next, entryById(next, 'b'))).toBe(true);
    expect(trash(next)).toEqual([]);
  });
});

describe('groups', () => {
  it('adds and renames groups', () => {
    let d = addGroup(base(), 'essen', 'Mensa');
    const g = d.groups.find((x) => x.name === 'Mensa')!;
    d = renameGroup(d, g.id, 'Uni');
    expect(d.groups.find((x) => x.id === g.id)!.name).toBe('Uni');
  });
  it('hides entries of a deleted group and lists them in the trash', () => {
    const d = deleteGroup(base(), 'g1', '2026-10-27T10:00:00Z');
    expect(isVisible(d, entryById(d, 'a'))).toBe(false);
    expect(expenses(d, '2026-10')).toBe(500);
    expect(trash(d)).toEqual([expect.objectContaining({ groupLabel: 'Group 1', entries: [expect.objectContaining({ id: 'a' })] })]);
  });
  it('restoring an entry of a deleted group restores the group', () => {
    const d = restoreEntry(deleteGroup(base(), 'g1', '2026-10-27T10:00:00Z'), 'a');
    expect(d.groups[0].deleted).toBeFalsy();
    expect(isVisible(d, entryById(d, 'a'))).toBe(true);
  });
  it('restores an empty deleted group from its trash section', () => {
    let d = addGroup(base(), 'essen', 'Leer');
    const id = d.groups.find((g) => g.name === 'Leer')!.id;
    d = deleteGroup(d, id, '2026-10-27T10:00:00Z');
    expect(trash(d)).toEqual([expect.objectContaining({ groupLabel: 'Leer', entries: [] })]);
    expect(trash(restoreGroup(d, id))).toEqual([]);
  });
});

describe('categories', () => {
  it('adds a category at the end of its scope and edits it', () => {
    let d = addCategory(base(), 'expense', 'Kino', 'clapperboard');
    const c = d.categories.find((x) => x.name === 'Kino')!;
    expect(c.order).toBe(1);
    d = updateCategory(d, c.id, { name: 'Kultur', icon: 'drama' });
    expect(d.categories.find((x) => x.id === c.id)).toMatchObject({ name: 'Kultur', icon: 'drama' });
  });
  it('a deleted category hides its entries and restoring an entry restores it', () => {
    let d = deleteCategory(base(), 'essen', '2026-10-27T10:00:00Z');
    expect(expenses(d, '2026-10')).toBe(0);
    expect(trash(d)[0].entries.map((e) => e.id).sort()).toEqual(['a', 'b']);
    d = restoreEntry(d, 'b');
    expect(d.categories[0].deleted).toBeFalsy();
  });
  it('restoreCategory brings back the category', () => {
    const d = restoreCategory(deleteCategory(base(), 'essen', '2026-10-27T10:00:00Z'), 'essen');
    expect(trash(d)).toEqual([]);
  });
});

describe('trash ordering', () => {
  it('lists newest deletions first', () => {
    let d = deleteEntry(base(), 'a', '2026-10-01T00:00:00Z');
    d = addCategory(d, 'expense', 'Kino', 'clapperboard');
    const kino = d.categories.find((c) => c.name === 'Kino')!.id;
    d = addEntry(d, { categoryId: kino, name: 'Film', amount: 900, date: '2026-10-02' });
    d = deleteCategory(d, kino, '2026-10-05T00:00:00Z');
    expect(trash(d).map((s) => s.category.name)).toEqual(['Kino', 'Essen']);
  });
});
