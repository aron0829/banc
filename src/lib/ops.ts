import { uid, type Category, type Data, type Entry, type Group, type Scope } from './model';

const patchById = <T extends { id: string }>(list: T[], id: string, patch: Partial<T>): T[] =>
  list.map((x) => (x.id === id ? { ...x, ...patch } : x));

const undelete = { deleted: false, deletedAt: undefined };

export function addEntry(data: Data, e: Omit<Entry, 'id'>): Data {
  return { ...data, entries: [...data.entries, { ...e, id: uid() }] };
}

export function updateEntry(data: Data, id: string, patch: Partial<Entry>): Data {
  return { ...data, entries: patchById(data.entries, id, patch) };
}

export function deleteEntry(data: Data, id: string, now: string): Data {
  return updateEntry(data, id, { deleted: true, deletedAt: now });
}

export function addCategory(data: Data, scope: Scope, name: string, icon: string): Data {
  const order = Math.max(-1, ...data.categories.filter((c) => c.scope === scope).map((c) => c.order)) + 1;
  return { ...data, categories: [...data.categories, { id: uid(), scope, name, icon, order }] };
}

export function updateCategory(data: Data, id: string, patch: Partial<Category>): Data {
  return { ...data, categories: patchById(data.categories, id, patch) };
}

export function deleteCategory(data: Data, id: string, now: string): Data {
  return updateCategory(data, id, { deleted: true, deletedAt: now });
}

export function addGroup(data: Data, categoryId: string, name: string): Data {
  return { ...data, groups: [...data.groups, { id: uid(), categoryId, name }] };
}

export function renameGroup(data: Data, id: string, name: string): Data {
  return { ...data, groups: patchById(data.groups, id, { name }) };
}

export function deleteGroup(data: Data, id: string, now: string): Data {
  return { ...data, groups: patchById(data.groups, id, { deleted: true, deletedAt: now }) };
}

export function restoreCategory(data: Data, id: string): Data {
  return updateCategory(data, id, undelete);
}

export function restoreGroup(data: Data, id: string): Data {
  return { ...data, groups: patchById<Group>(data.groups, id, undelete) };
}

/** Restores the entry together with its group and category. */
export function restoreEntry(data: Data, id: string): Data {
  const e = data.entries.find((x) => x.id === id);
  if (!e) return data;
  let next = updateEntry(data, id, undelete);
  next = restoreCategory(next, e.categoryId);
  return e.groupId ? restoreGroup(next, e.groupId) : next;
}

export interface TrashSection {
  category: Category;
  /** Set when the section stands for a deleted group. */
  group?: Group;
  groupLabel?: string;
  entries: Entry[];
  deletedAt: string;
}

/** Hidden entries grouped by what hid them (deleted category, deleted group, or the entry itself), newest first. */
export function trash(data: Data): TrashSection[] {
  const sections = new Map<string, TrashSection>();
  const section = (category: Category, group?: Group): TrashSection => {
    const key = group ? `${category.id}/${group.id}` : category.id;
    let s = sections.get(key);
    if (!s) {
      s = { category, entries: [], deletedAt: '', ...(group ? { group, groupLabel: group.name } : {}) };
      sections.set(key, s);
    }
    return s;
  };
  const bump = (s: TrashSection, at?: string) => {
    if (at && at > s.deletedAt) s.deletedAt = at;
  };

  for (const c of data.categories) if (c.deleted) bump(section(c), c.deletedAt);
  for (const g of data.groups) {
    const c = data.categories.find((x) => x.id === g.categoryId);
    if (g.deleted && c && !c.deleted) bump(section(c, g), g.deletedAt);
  }
  for (const e of data.entries) {
    const c = data.categories.find((x) => x.id === e.categoryId);
    if (!c) continue;
    const g = data.groups.find((x) => x.id === e.groupId);
    const s = c.deleted ? section(c) : g?.deleted ? section(c, g) : e.deleted ? section(c) : null;
    if (!s) continue;
    s.entries.push(e);
    bump(s, e.deletedAt);
  }
  return [...sections.values()].sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
}
