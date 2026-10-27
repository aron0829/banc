// Opens the popups; shared by views and other popups.
import CategoryPopup from '../components/popups/CategoryPopup.svelte';
import EntryPopup from '../components/popups/EntryPopup.svelte';
import RecurringPopup from '../components/popups/RecurringPopup.svelte';
import SettingsPopup from '../components/settings/SettingsPopup.svelte';
import type { Day } from './dates';
import { categoryOf, isRecurring, type Category, type Data, type Entry, type Scope } from './model';
import { openPopup } from './ui.svelte';

export function editEntry(data: Data, entry: Entry): void {
  const scope = categoryOf(data, entry.categoryId)?.scope;
  if (!scope) return;
  if (isRecurring(scope)) openPopup(RecurringPopup, { scope, entry });
  else openPopup(EntryPopup, { scope: scope as 'expense' | 'overview', entry });
}

export function newOneOff(scope: 'expense' | 'overview', date: Day, categoryId?: string): void {
  openPopup(EntryPopup, { scope, date, categoryId });
}

export function newRecurring(scope: Scope, categoryId?: string): void {
  openPopup(RecurringPopup, { scope, categoryId });
}

export function editCategory(category: Category): void {
  openPopup(CategoryPopup, { scope: category.scope, category });
}

export function newCategory(scope: Scope, onCreated?: (id: string) => void): void {
  openPopup(CategoryPopup, { scope, onCreated });
}

export function openSettings(): void {
  openPopup(SettingsPopup, {});
}
