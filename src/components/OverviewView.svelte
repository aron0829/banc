<script lang="ts">
  import { Calendar, House, RotateCcwClock, SlidersHorizontal } from '@lucide/svelte';
  import { editCategory, editEntry, newOneOff, openSettings } from '../lib/actions';
  import { overviewCategoryEntries, overviewCategoryTotal, overviewMonths, overviewTotal, previousYears } from '../lib/calc';
  import { monthLabel, monthOf, yearOf, type Day } from '../lib/dates';
  import { visibleCategories, type Data } from '../lib/model';
  import { formatAmount } from '../lib/money';
  import { SCOPES } from '../lib/scopes';
  import { byGroup } from '../lib/sections';
  import { showMonth, ui } from '../lib/ui.svelte';
  import BottomBar from './BottomBar.svelte';
  import Card from './Card.svelte';
  import EntryList from './EntryList.svelte';
  import RoundButton from './RoundButton.svelte';

  let { data }: { data: Data } = $props();

  const today = $derived(ui.today);
  const thisYear = $derived(yearOf(today));
  const year = $derived(ui.year);

  const months = $derived(overviewMonths(data, year, today));
  const previous = $derived(previousYears(data, year, today));
  const previousTitle = $derived(
    previous.length ? `Von ${previous[0].year}${previous.length > 1 ? ', …' : ''}` : '',
  );
  const sum = (list: { total?: number; balance?: number }[]) => list.reduce((s, x) => s + (x.total ?? x.balance ?? 0), 0);

  const monthTarget = $derived(year === thisYear ? monthOf(today) : year < thisYear ? `${year}-12` : `${year}-01`);
  const newDate = $derived<Day>(year === thisYear ? today : `${year}-01-01`);
</script>

<header class="top">
  <RoundButton label="Monat" onclick={() => showMonth(monthTarget)}><Calendar size={18} strokeWidth={1.6} /></RoundButton>
  <span class="home"><House size={20} strokeWidth={1.6} />Home</span>
  <RoundButton label="Settings" onclick={openSettings}><SlidersHorizontal size={18} strokeWidth={1.6} /></RoundButton>
</header>

<Card title={SCOPES.overview.title} icon={SCOPES.overview.icon} total={overviewTotal(data, year, today)} sigma>
  <Card sub title="Monate" icon={Calendar} total={sum(months)}>
    <div class="rows scroll">
      {#each months as row (row.month)}
        <button class="row" onclick={() => showMonth(row.month)}>
          <span>{monthLabel(row.month)}</span><span class="amount">{formatAmount(row.balance)}</span>
        </button>
      {:else}
        <p class="empty">Noch keine Monate</p>
      {/each}
    </div>
  </Card>

  {#each visibleCategories(data, 'overview') as c (c.id)}
    <Card sub title={c.name} catIcon={c.icon} total={overviewCategoryTotal(data, c.id, year)} onLongPress={() => editCategory(c)}>
      <EntryList sections={byGroup(data, overviewCategoryEntries(data, c.id, year))} onTap={(e) => editEntry(data, e)} empty="Noch keine Einträge" />
    </Card>
  {/each}

  {#if previous.length}
    <Card sub title={previousTitle} icon={RotateCcwClock} total={sum(previous)}>
      <div class="rows scroll">
        {#each previous as p (p.year)}
          <button class="row" onclick={() => (ui.year = p.year)}>
            <span>{p.year}</span><span class="amount">{formatAmount(p.total)}</span>
          </button>
        {/each}
      </div>
    </Card>
  {/if}
</Card>

<BottomBar
  label={String(year)}
  onAdd={() => newOneOff('overview', newDate)}
  onPrev={() => (ui.year = year - 1)}
  onNext={() => (ui.year = year + 1)}
  onLabel={() => (ui.year = thisYear)}
/>

<style>
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .home {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 34px;
    padding: 0 14px;
    border: 1px solid var(--line);
    border-radius: 17px;
    font-size: 17px;
    font-weight: 600;
  }
  .rows {
    max-height: 170px;
    display: flex;
    flex-direction: column;
  }
  .row {
    display: flex;
    justify-content: space-between;
    min-height: 21px;
    font-size: 12.5px;
    font-weight: 600;
    text-align: left;
  }
  .empty {
    margin: 0;
    color: var(--muted);
    font-size: 12.5px;
  }
</style>
