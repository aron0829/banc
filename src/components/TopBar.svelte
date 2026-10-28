<script lang="ts">
  import { Calendar, House, SlidersHorizontal } from '@lucide/svelte';
  import { openSettings } from '../lib/actions';
  import { balance, overviewTotal } from '../lib/calc';
  import { monthLabel, monthOf } from '../lib/dates';
  import type { Data } from '../lib/model';
  import { formatAmount } from '../lib/money';
  import { setMonth, showView, ui, type View } from '../lib/ui.svelte';
  import RoundButton from './RoundButton.svelte';

  let { data }: { data: Data } = $props();

  // Same order as the pages: Übersicht on the left, Monat on the right.
  const views: { view: View; label: string; icon: typeof House }[] = [
    { view: 'overview', label: 'Übersicht', icon: House },
    { view: 'month', label: 'Monat', icon: Calendar },
  ];
</script>

<header class="top">
  <div class="switch" role="group" aria-label="Ansicht">
    {#each views as v (v.view)}
      {@const I = v.icon}
      <button class:on={ui.view === v.view} aria-label={v.label} title={v.label} aria-pressed={ui.view === v.view} onclick={() => showView(v.view)}>
        <I size={18} strokeWidth={1.6} />
      </button>
    {/each}
  </div>
  {#if ui.view === 'month'}
    <button class="balance amount" aria-label="Bilanz {monthLabel(ui.month)}" onclick={() => setMonth(monthOf(ui.today))}>
      {formatAmount(balance(data, ui.month), true)}
    </button>
  {:else}
    <span class="balance amount" aria-label="Gesamt">{formatAmount(overviewTotal(data, ui.year, ui.today), true)}</span>
  {/if}
  <span class="end"><RoundButton label="Settings" onclick={openSettings}><SlidersHorizontal size={18} strokeWidth={1.6} /></RoundButton></span>
</header>

<style>
  /* the balance stays centred although the switch is wider than the settings button */
  .top {
    flex: none;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }
  .switch {
    justify-self: start;
    display: inline-flex;
    gap: 2px;
    height: 34px;
    padding: 2px;
    border: 1px solid var(--line);
    border-radius: 17px;
    background: var(--surface);
  }
  .switch button {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1.5px solid transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
  }
  .switch .on {
    border-color: var(--frame);
    color: var(--text);
  }
  .balance {
    display: flex;
    align-items: center;
    height: 34px;
    padding: 0 16px;
    border: 2px solid var(--frame);
    border-radius: 17px;
    font-size: 17px;
    font-weight: 600;
  }
  .end {
    justify-self: end;
    display: inline-flex;
  }
</style>
