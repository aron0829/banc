<script lang="ts">
  import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Clock3, LayoutGrid, Plus, SquarePen, Tag } from '@lucide/svelte';
  import { switchOneOff } from '../../lib/actions';
  import { addDays, shortDate, todayDay, type Day } from '../../lib/dates';
  import { focusNow } from '../../lib/focus';
  import { categoryOf, groupOf, visibleCategories, type Category, type Entry } from '../../lib/model';
  import { earnings, formatAmount, parseHours } from '../../lib/money';
  import { addEntry, deleteEntry, updateEntry } from '../../lib/ops';
  import { SCOPES } from '../../lib/scopes';
  import { app, commit } from '../../lib/sync.svelte';
  import { closePopup, openPopup } from '../../lib/ui.svelte';
  import AddCategoryButton from '../AddCategoryButton.svelte';
  import ArtPicker from '../ArtPicker.svelte';
  import Field from '../Field.svelte';
  import Modal from '../Modal.svelte';
  import GroupPicker from './GroupPicker.svelte';

  let { entry, date: initialDate, categoryId: initialCategory }: { entry?: Entry; date?: Day; categoryId?: string } = $props();

  const tone = 'income';
  // svelte-ignore state_referenced_locally
  let name = $state(entry?.name ?? '');
  // svelte-ignore state_referenced_locally
  let date = $state<Day>(entry?.date ?? initialDate ?? todayDay());
  // svelte-ignore state_referenced_locally
  let hoursText = $state(entry?.hours != null ? String(entry.hours) : '');
  // svelte-ignore state_referenced_locally
  let categoryId = $state(entry?.categoryId ?? initialCategory ?? (app.data ? visibleCategories(app.data, 'varIncome')[0]?.id : undefined));
  // svelte-ignore state_referenced_locally
  let groupId = $state<string | undefined>(entry?.groupId);

  const data = $derived(app.data!);
  const category = $derived(categoryId ? categoryOf(data, categoryId) : undefined);
  const group = $derived(groupOf(data, groupId));
  const hours = $derived(parseHours(hoursText));
  // An unchanged entry keeps its amount, even if the Stundenlohn changed since.
  const amount = $derived(
    entry && hours === entry.hours && categoryId === entry.categoryId
      ? entry.amount
      : hours !== null && category?.rate != null
        ? earnings(hours, category.rate)
        : null,
  );
  const valid = $derived(hours !== null && hours > 0 && amount !== null && !!category && !category.deleted);

  const rateLabel = (cents: number) => `${Number((cents / 100).toFixed(2))} € / h`;
  const caption = (c: Category) => {
    const base = c.rate != null ? `${c.name} (${rateLabel(c.rate)})` : c.name;
    return valid ? `${base} · ${formatAmount(amount!)}` : base;
  };

  function selectCategory(id: string) {
    if (id !== categoryId) groupId = undefined;
    categoryId = id;
  }

  function pickGroup() {
    if (!categoryId) return;
    openPopup(GroupPicker, { categoryId, selected: groupId, onSelect: (id?: string) => (groupId = id) });
  }

  function save() {
    if (!valid) return;
    const fields = { name: name.trim(), date, hours: hours!, amount: amount!, categoryId: categoryId!, groupId };
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
  title={SCOPES.varIncome.title}
  icon={SCOPES.varIncome.icon}
  subtitle={entry ? 'Eintrag bearbeiten' : 'Eintrag hinzufügen'}
  subtitleIcon={entry ? SquarePen : Plus}
  onCancel={closePopup}
  onConfirm={save}
  confirmDisabled={!valid}
  onDelete={entry ? remove : undefined}
  onSwitch={entry ? undefined : () => switchOneOff('varIncome', date)}
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

  <Field icon={Clock3} label="Stunden" {tone} invalid={hoursText !== '' && hours === null}>
    <input bind:value={hoursText} inputmode="decimal" placeholder="0.0" aria-label="Stunden" class="hours" use:focusNow />
  </Field>

  <Field icon={LayoutGrid} label="Art" {tone} block>
    <button class="group" class:muted={!group} onclick={pickGroup} disabled={!category}>
      {group?.name ?? 'Gruppe'}<ChevronDown size={18} />
    </button>
    {#snippet below()}
      <ArtPicker scope="varIncome" selected={categoryId} onSelect={selectCategory} {tone} {caption}>
        <AddCategoryButton scope="varIncome" onCreated={selectCategory} />
      </ArtPicker>
      {#if !category}<p class="hint">Mit + eine Kategorie mit Stundenlohn anlegen</p>{/if}
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
  .hours {
    max-width: 120px;
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
  .hint {
    margin: -2px 0 0;
    text-align: center;
    font-size: 12px;
    color: var(--muted);
  }
</style>
