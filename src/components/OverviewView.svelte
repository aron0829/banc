<script lang="ts">
  import { Calendar, Minus, Plus, RotateCcwClock } from '@lucide/svelte';
  import { editCategory, editEntry } from '../lib/actions';
  import {
    debtEntries, generalTotal, overviewCategoryEntries, overviewCategoryTotal, overviewMonths, previousYears, yearSummaryTotal,
  } from '../lib/calc';
  import { monthLabel } from '../lib/dates';
  import { debtCategories, generalCategories, type Category, type Data, type Entry } from '../lib/model';
  import { formatAmount } from '../lib/money';
  import { SCOPES, type Tone } from '../lib/scopes';
  import { byGroup } from '../lib/sections';
  import { setYear, showMonth, ui } from '../lib/ui.svelte';
  import Card from './Card.svelte';
  import EntryList from './EntryList.svelte';

  let { data }: { data: Data } = $props();

  const today = $derived(ui.today);
  const year = $derived(ui.year);

  // One card open at a time; tapping a closed one opens it.
  let open = $state<'year' | 'general' | 'debt'>('year');

  const months = $derived(overviewMonths(data, year, today));
  const previous = $derived(previousYears(data, year, today));
  const previousTitle = $derived(
    previous.length ? `Von ${previous[0].year}${previous.length > 1 ? ', …' : ''}` : '',
  );
  const sum = (list: { total?: number; balance?: number; amount?: number }[]) =>
    list.reduce((s, x) => s + (x.total ?? x.balance ?? x.amount ?? 0), 0);

  const debts = $derived(debtCategories(data));
  const debtTotal = $derived(debts.reduce((s, c) => s + sum(debtEntries(data, c.id)), 0));

  const kindTone = (c: Category): Tone => (c.kind === 'plus' ? 'income' : c.kind === 'minus' ? 'expense' : 'neutral');
  const tap = (e: Entry) => editEntry(data, e);
</script>

<div class="cards">
  <Card
    title="Jahresübersicht"
    icon={SCOPES.overview.icon}
    total={yearSummaryTotal(data, year, today)}
    open={open === 'year'}
    fill
    onToggle={() => (open = 'year')}
  >
    <Card sub title="Monatsvergleich" icon={Calendar} total={sum(months)}>
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

    {#if previous.length}
      <Card sub title={previousTitle} icon={RotateCcwClock} total={sum(previous)}>
        <div class="rows scroll">
          {#each previous as p (p.year)}
            <button class="row" onclick={() => setYear(p.year)}>
              <span>{p.year}</span><span class="amount">{formatAmount(p.total)}</span>
            </button>
          {/each}
        </div>
      </Card>
    {/if}
  </Card>

  <Card
    title="Allgemein"
    icon={SCOPES.overview.icon}
    total={generalTotal(data, year)}
    open={open === 'general'}
    fill
    onToggle={() => (open = 'general')}
  >
    {#each generalCategories(data) as c (c.id)}
      <Card
        sub
        accent
        tone={kindTone(c)}
        title={c.name}
        icon={c.kind === 'plus' ? Plus : c.kind === 'minus' ? Minus : undefined}
        catIcon={c.kind ? undefined : c.icon}
        total={overviewCategoryTotal(data, c.id, year)}
        onLongPress={() => editCategory(c)}
      >
        <EntryList sections={byGroup(data, overviewCategoryEntries(data, c.id, year))} onTap={tap} empty="Noch keine Einträge" />
      </Card>
    {/each}
  </Card>

  {#if debts.length}
    <Card title="Schulden" catIcon={debts[0].icon} total={debtTotal} open={open === 'debt'} fill onToggle={() => (open = 'debt')}>
      {#each debts as c (c.id)}
        <EntryList sections={byGroup(data, debtEntries(data, c.id))} onTap={tap} empty="Keine Schulden" />
      {/each}
      <p class="note">Zählt nicht zur Gesamtsumme</p>
    </Card>
  {/if}
</div>

<style>
  .cards {
    flex: 0 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
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
  .empty,
  .note {
    margin: 0;
    color: var(--muted);
    font-size: 12.5px;
  }
</style>
