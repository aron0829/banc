<script lang="ts">
  import { HandCoins, LayoutGrid, Plus, SquarePen, Tag, Trash } from '@lucide/svelte';
  import { ICON_NAMES } from '../../lib/icons';
  import type { Category, Scope } from '../../lib/model';
  import { amountInput, parseAmount } from '../../lib/money';
  import { addCategory, deleteCategory, updateCategory } from '../../lib/ops';
  import { SCOPES } from '../../lib/scopes';
  import { app, commit } from '../../lib/sync.svelte';
  import { closePopup, openPopup } from '../../lib/ui.svelte';
  import CatIcon from '../CatIcon.svelte';
  import Field from '../Field.svelte';
  import Modal from '../Modal.svelte';
  import ConfirmPopup from './ConfirmPopup.svelte';

  let { scope, category, onCreated }: { scope: Scope; category?: Category; onCreated?: (id: string) => void } = $props();

  // svelte-ignore state_referenced_locally
  let name = $state(category?.name ?? '');
  // svelte-ignore state_referenced_locally
  let icon = $state(category?.icon ?? ICON_NAMES[0]);
  // svelte-ignore state_referenced_locally
  let rateText = $state(category?.rate != null ? amountInput(category.rate) : '');
  const tone = $derived(SCOPES[scope].tone);
  // Variable Einnahmen are paid by the hour
  const hourly = $derived(scope === 'varIncome');
  const rate = $derived(parseAmount(rateText));
  const rateOk = $derived(!hourly || (rate !== null && rate >= 0));
  const valid = $derived(!!name.trim() && rateOk);

  function save() {
    const n = name.trim();
    if (!valid) return;
    const extra = hourly ? { rate: rate! } : {};
    if (category) {
      commit(updateCategory(app.data!, category.id, { name: n, icon, ...extra }));
      closePopup();
      return;
    }
    const next = addCategory(app.data!, scope, n, icon, extra);
    commit(next);
    closePopup();
    onCreated?.(next.categories[next.categories.length - 1].id);
  }

  function remove() {
    const c = category!;
    openPopup(ConfirmPopup, {
      title: SCOPES[scope].title,
      icon: SCOPES[scope].icon,
      subtitle: 'Kategorie löschen?',
      subtitleIcon: Trash,
      rows: [{ icon: Tag, label: 'Name', value: c.name }],
      onConfirm: () => {
        commit(deleteCategory(app.data!, c.id, new Date().toISOString()));
        closePopup();
      },
    });
  }
</script>

<Modal
  {tone}
  title={SCOPES[scope].title}
  icon={SCOPES[scope].icon}
  subtitle={category ? 'Kategorie bearbeiten' : 'Kategorie hinzufügen'}
  subtitleIcon={category ? SquarePen : Plus}
  onCancel={closePopup}
  onConfirm={save}
  confirmDisabled={!valid}
  onDelete={category ? remove : undefined}
>
  <Field icon={Tag} label="Name" {tone}>
    <input bind:value={name} aria-label="Name" placeholder={hourly ? 'z. B. Oper' : 'z. B. Kino'} />
  </Field>
  {#if hourly}
    <Field icon={HandCoins} label="Stundenlohn" {tone} invalid={rateText !== '' && !rateOk}>
      <input bind:value={rateText} inputmode="decimal" placeholder="0.00" aria-label="Stundenlohn" class="rate" />&nbsp;€/h
    </Field>
  {/if}
  <Field icon={LayoutGrid} label="Icons" {tone} block>
    {#snippet below()}
      <div class="grid scroll">
        {#each ICON_NAMES as n (n)}
          <button class="ic {tone}" class:on={n === icon} aria-label={n} aria-pressed={n === icon} onclick={() => (icon = n)}>
            <CatIcon name={n} size={20} />
          </button>
        {/each}
      </div>
    {/snippet}
  </Field>
</Modal>

<style>
  .rate {
    max-width: 120px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(5, 38px);
    justify-content: space-between;
    gap: 16px 0;
    max-height: 262px;
    padding: 2px;
  }
  .ic {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1px solid var(--line);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .ic.on {
    border: 2px solid var(--frame);
  }
  .ic.on.income {
    border-color: var(--income);
  }
  .ic.on.expense {
    border-color: var(--expense);
  }
</style>
