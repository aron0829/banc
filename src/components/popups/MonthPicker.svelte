<script lang="ts">
  import { ChevronLeft, ChevronRight } from '@lucide/svelte';
  import { monthOf, monthsOfYear, todayDay, yearOf, type Month } from '../../lib/dates';
  import type { Tone } from '../../lib/scopes';
  import { closePopup } from '../../lib/ui.svelte';
  import Modal from '../Modal.svelte';

  let {
    title,
    value,
    allowUnlimited = false,
    after,
    tone = 'neutral',
    onPick,
  }: {
    title: string;
    value: Month | null;
    allowUnlimited?: boolean;
    /** Only months after this one can be picked ("Bis" after "Von"). */
    after?: Month;
    tone?: Tone;
    onPick: (m: Month | null) => void;
  } = $props();

  const SHORT = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  // svelte-ignore state_referenced_locally
  let year = $state(yearOf(value ?? monthOf(todayDay())));

  function pick(m: Month | null) {
    closePopup();
    onPick(m);
  }
</script>

<Modal {tone} {title} onCancel={closePopup}>
  <div class="year">
    <button aria-label="Vorjahr" onclick={() => year--}><ChevronLeft size={20} /></button>
    <b>{year}</b>
    <button aria-label="Nächstes Jahr" onclick={() => year++}><ChevronRight size={20} /></button>
  </div>
  <div class="grid">
    {#each monthsOfYear(year) as m, i (m)}
      <button class="m {tone}" class:on={m === value} disabled={!!after && m <= after} onclick={() => pick(m)}>{SHORT[i]}</button>
    {/each}
  </div>
  {#if allowUnlimited}
    <button class="m wide {tone}" class:on={value === null} onclick={() => pick(null)}>Unbegrenzt</button>
  {/if}
</Modal>

<style>
  .year {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 24px;
    font-size: 17px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  .m {
    height: 36px;
    border: 1px solid var(--line);
    border-radius: 18px;
  }
  .m.on {
    border: 2px solid var(--frame);
    font-weight: 700;
  }
  .m.on.income {
    border-color: var(--income);
  }
  .m.on.expense {
    border-color: var(--expense);
  }
</style>
