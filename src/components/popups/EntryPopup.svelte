<script lang="ts">
  import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Euro, LayoutGrid, Plus, SquarePen, Tag } from '@lucide/svelte';
  import { addDays, shortDate, todayDay, yearOf, type Day } from '../../lib/dates';
  import { focusNow } from '../../lib/focus';
  import { categoryOf, groupOf, signOf, visibleCategories, type Entry } from '../../lib/model';
  import { amountInput, parseAmount } from '../../lib/money';
  import { addEntry, deleteEntry, updateEntry } from '../../lib/ops';
  import { amountAllowed } from '../../lib/rules';
  import { SCOPES, type Tone } from '../../lib/scopes';
  import { app, commit } from '../../lib/sync.svelte';
  import { closePopup, openPopup } from '../../lib/ui.svelte';
  import AddCategoryButton from '../AddCategoryButton.svelte';
  import ArtPicker from '../ArtPicker.svelte';
  import Field from '../Field.svelte';
  import Modal from '../Modal.svelte';
  import GroupPicker from './GroupPicker.svelte';

  let {
    scope,
    entry,
    date: initialDate,
    categoryId: initialCategory,
  }: { scope: 'expense' | 'overview'; entry?: Entry; date?: Day; categoryId?: string } = $props();

  // svelte-ignore state_referenced_locally
  const start = entry ?? { name: '', amount: NaN, date: initialDate ?? todayDay(), categoryId: initialCategory, groupId: undefined };
  let name = $state(start.name);
  let date = $state<Day>(start.date ?? todayDay());
  // svelte-ignore state_referenced_locally
  let categoryId = $state(start.categoryId ?? (app.data ? visibleCategories(app.data, scope)[0]?.id : undefined));
  // svelte-ignore state_referenced_locally
  const startCategory = app.data && categoryId ? categoryOf(app.data, categoryId) : undefined;
  // svelte-ignore state_referenced_locally
  const startSign = signOf(startCategory);
  // Schulden: the direction comes from the "Ich schulde / Ich bekomme" switch, not from a typed sign.
  // svelte-ignore state_referenced_locally
  let owe = $state(Number.isNaN(start.amount) || start.amount < 0);
  let amountText = $state(
    Number.isNaN(start.amount)
      ? startSign < 0 ? '-' : ''
      : amountInput(startCategory?.kind === 'debt' ? Math.abs(start.amount) : start.amount),
  );
  let groupId = $state<string | undefined>(start.groupId);

  const data = $derived(app.data!);
  const category = $derived(categoryId ? categoryOf(data, categoryId) : undefined);
  const group = $derived(groupOf(data, groupId));
  const isDebt = $derived(category?.kind === 'debt');
  const sign = $derived(isDebt ? (owe ? -1 : 1) : signOf(category));
  const typed = $derived(parseAmount(amountText));
  // Zusätzliche Einnahmen/Ausgaben and Schulden get their sign forced, whatever was typed.
  const amount = $derived(typed !== null && sign ? sign * Math.abs(typed) : typed);
  const missingGroup = $derived(!!category?.requiresGroup && (!group || group.deleted));
  const valid = $derived(amountAllowed(scope, amount) && !!category && !category.deleted && !missingGroup);
  const tone = $derived<Tone>(sign > 0 ? 'income' : sign < 0 ? 'expense' : SCOPES[scope].tone);
  const title = $derived(scope === 'expense' ? SCOPES.expense.title : `Übersicht ${yearOf(date)}`);

  function selectCategory(id: string) {
    if (id !== categoryId) groupId = undefined;
    categoryId = id;
    // "Zusätzliche Ausgaben" start with a minus, everything else without
    const c = categoryOf(data, id);
    const s = signOf(c);
    const digits = amountText.replace(/^[+-]/, '');
    amountText = s < 0 ? `-${digits}` : s > 0 || c?.kind === 'debt' ? digits : amountText;
  }

  function pickGroup() {
    if (!categoryId) return;
    openPopup(GroupPicker, { categoryId, selected: groupId, onSelect: (id?: string) => (groupId = id) });
  }

  function save() {
    if (!valid) return;
    const fields = { name: name.trim(), date, amount: amount!, categoryId: categoryId!, groupId };
    commit(entry ? updateEntry(data, entry.id, fields) : addEntry(data, fields));
    closePopup();
  }

  function remove() {
    commit(deleteEntry(data, entry!.id, new Date().toISOString()));
    closePopup();
  }
</script>

<Modal
  {tone}
  {title}
  icon={SCOPES[scope].icon}
  subtitle={entry ? 'Eintrag bearbeiten' : 'Eintrag hinzufügen'}
  subtitleIcon={entry ? SquarePen : Plus}
  onCancel={closePopup}
  onConfirm={save}
  confirmDisabled={!valid}
  onDelete={entry ? remove : undefined}
>
  <Field icon={Tag} label="Name" {tone}>
    <input bind:value={name} placeholder="Optional" aria-label="Name" />
  </Field>

  <Field {tone}>
    <div class="date">
      <button aria-label="Tag zurück" onclick={() => (date = addDays(date, -1))}><ChevronLeft size={20} /></button>
      <label class="day">
        <Calendar size={18} strokeWidth={1.6} />{shortDate(date)}
        <input type="date" value={date} onchange={(e) => e.currentTarget.value && (date = e.currentTarget.value)} aria-label="Datum" />
      </label>
      <button aria-label="Tag weiter" onclick={() => (date = addDays(date, 1))}><ChevronRight size={20} /></button>
    </div>
  </Field>

  <Field icon={Euro} label="Preis" {tone} block={isDebt} invalid={amountText !== '' && amountText !== '-' && !amountAllowed(scope, amount)}>
    <input bind:value={amountText} inputmode="decimal" placeholder="0.00" aria-label="Preis" class="price" use:focusNow />&nbsp;€
    {#snippet below()}
      {#if isDebt}
        <div class="direction" role="group" aria-label="Richtung">
          <button class="expense" class:on={owe} aria-pressed={owe} onclick={() => (owe = true)}>Ich schulde</button>
          <button class="income" class:on={!owe} aria-pressed={!owe} onclick={() => (owe = false)}>Ich bekomme</button>
        </div>
      {/if}
    {/snippet}
  </Field>

  <Field icon={LayoutGrid} label="Art" {tone} block invalid={missingGroup && !!amountText}>
    {#snippet action()}<AddCategoryButton {scope} onCreated={selectCategory} />{/snippet}
    <button class="group" class:muted={!group} onclick={pickGroup}>
      {group?.name ?? (category?.requiresGroup ? 'Gruppe wählen' : 'Gruppe')}<ChevronDown size={18} />
    </button>
    {#snippet below()}
      <ArtPicker {scope} selected={categoryId} onSelect={selectCategory} {tone} />
    {/snippet}
  </Field>
</Modal>

<style>
  .date {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .date button {
    display: inline-flex;
  }
  .day {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 16px;
  }
  .day input {
    position: absolute;
    inset: 0;
    opacity: 0;
    width: 100%;
    cursor: pointer;
  }
  .price {
    max-width: 140px;
  }
  .direction {
    display: flex;
    gap: 6px;
    padding: 3px;
    border: 1px solid var(--line);
    border-radius: 999px;
  }
  .direction button {
    flex: 1;
    padding: 6px 0;
    border-radius: 999px;
    font-size: 14px;
    color: var(--muted);
  }
  .direction .on {
    font-weight: 600;
    color: var(--text);
  }
  .direction .on.expense {
    background: var(--expense-bg);
    color: var(--expense);
  }
  .direction .on.income {
    background: var(--income-bg);
    color: var(--income);
  }
  .group {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 15px;
  }
  .muted {
    color: var(--muted);
  }
</style>
