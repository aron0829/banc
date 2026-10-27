<script lang="ts">
  import { Calendar, Euro, LayoutGrid, Plus, SquarePen, Tag } from '@lucide/svelte';
  import { monthOf, shortMonth, todayDay, type Month } from '../../lib/dates';
  import { categoryOf, visibleCategories, type Entry, type Scope } from '../../lib/model';
  import { amountInput, parseAmount } from '../../lib/money';
  import { addEntry, deleteEntry, updateEntry } from '../../lib/ops';
  import { amountAllowed } from '../../lib/rules';
  import { SCOPES } from '../../lib/scopes';
  import { app, commit } from '../../lib/sync.svelte';
  import { closePopup, openPopup } from '../../lib/ui.svelte';
  import ArtPicker from '../ArtPicker.svelte';
  import Field from '../Field.svelte';
  import Modal from '../Modal.svelte';
  import MonthPicker from './MonthPicker.svelte';

  let { scope, entry, categoryId: initialCategory }: { scope: Scope; entry?: Entry; categoryId?: string } = $props();

  // svelte-ignore state_referenced_locally
  let name = $state(entry?.name ?? '');
  // svelte-ignore state_referenced_locally
  let from = $state<Month>(entry?.from ?? monthOf(todayDay()));
  // svelte-ignore state_referenced_locally
  let to = $state<Month | null>(entry?.to ?? null);
  // svelte-ignore state_referenced_locally
  let amountText = $state(entry ? amountInput(entry.amount) : '');
  // svelte-ignore state_referenced_locally
  let categoryId = $state(entry?.categoryId ?? initialCategory ?? (app.data ? visibleCategories(app.data, scope)[0]?.id : undefined));

  const data = $derived(app.data!);
  const amount = $derived(parseAmount(amountText));
  const category = $derived(categoryId ? categoryOf(data, categoryId) : undefined);
  const rangeOk = $derived(to === null || to >= from);
  const valid = $derived(amountAllowed(scope, amount) && !!category && !category.deleted && rangeOk);
  const tone = $derived(SCOPES[scope].tone);

  const pickFrom = () => openPopup(MonthPicker, { title: 'Von', value: from, tone, onPick: (m: Month | null) => m && (from = m) });
  const pickTo = () => openPopup(MonthPicker, { title: 'Bis', value: to, tone, allowUnlimited: true, onPick: (m: Month | null) => (to = m) });

  function save() {
    if (!valid) return;
    const fields = { name: name.trim(), from, to, amount: amount!, categoryId: categoryId! };
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
  title={SCOPES[scope].title}
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

  <Field {tone} block invalid={!rangeOk}>
    <button class="line" onclick={pickFrom}><Calendar size={18} strokeWidth={1.6} /><b>Von</b><span>{shortMonth(from)}</span></button>
    {#snippet below()}
      <button class="line" onclick={pickTo}><Calendar size={18} strokeWidth={1.6} /><b>Bis</b><span>{to ? shortMonth(to) : 'Unbegrenzt'}</span></button>
    {/snippet}
  </Field>

  <Field icon={Euro} label="Preis" {tone} invalid={amountText !== '' && !amountAllowed(scope, amount)}>
    <input bind:value={amountText} inputmode="decimal" placeholder="0.00" aria-label="Preis" class="price" />&nbsp;€
  </Field>

  <Field icon={LayoutGrid} label="Art" {tone} block>
    {#snippet below()}
      <ArtPicker {scope} selected={categoryId} onSelect={(id) => (categoryId = id)} {tone} />
    {/snippet}
  </Field>
</Modal>

<style>
  .line {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
  }
  .line span {
    margin-left: auto;
  }
  .price {
    max-width: 140px;
  }
</style>
