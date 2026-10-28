<script lang="ts">
  import { newOneOff } from '../lib/actions';
  import { addMonths, monthLabel, monthOf, yearOf, type Day } from '../lib/dates';
  import { setMonth, setYear, ui } from '../lib/ui.svelte';
  import BottomBar from './BottomBar.svelte';

  const today = $derived(ui.today);
  const current = $derived(monthOf(today));
  const thisYear = $derived(yearOf(today));
  const m = $derived(ui.month);
  const year = $derived(ui.year);

  const monthText = $derived(yearOf(m) === thisYear ? monthLabel(m) : `${monthLabel(m)} ${m.slice(2, 4)}`);
  const monthDate = $derived<Day>(m === current ? today : `${m}-01`);
  const yearDate = $derived<Day>(year === thisYear ? today : `${year}-01-01`);
</script>

{#if ui.view === 'month'}
  <BottomBar
    tone="expense"
    label={monthText}
    onAdd={() => newOneOff('expense', monthDate)}
    onPrev={() => setMonth(addMonths(m, -1))}
    onNext={() => setMonth(addMonths(m, 1))}
    onLabel={() => setMonth(current)}
  />
{:else}
  <BottomBar
    label={String(year)}
    onAdd={() => newOneOff('overview', yearDate)}
    onPrev={() => setYear(year - 1)}
    onNext={() => setYear(year + 1)}
    onLabel={() => setYear(thisYear)}
  />
{/if}
