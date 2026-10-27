<script lang="ts">
  import { House, Lock, SlidersHorizontal, Sprout } from '@lucide/svelte';
  import { editCategory, editEntry, newOneOff, openSettings } from '../lib/actions';
  import {
    balance, categoryEntriesForMonth, categoryTotal, expenses, income, limitHint, scopeEntriesForMonth, scopeTotal, usedPercent,
  } from '../lib/calc';
  import { addMonths, monthLabel, monthOf, yearOf, type Day } from '../lib/dates';
  import { visibleCategories, type Data, type Entry } from '../lib/model';
  import { formatAmount } from '../lib/money';
  import { SCOPES } from '../lib/scopes';
  import { byCategory, byGroup } from '../lib/sections';
  import { showYear, ui } from '../lib/ui.svelte';
  import BottomBar from './BottomBar.svelte';
  import Card from './Card.svelte';
  import EntryList from './EntryList.svelte';
  import RoundButton from './RoundButton.svelte';

  let { data }: { data: Data } = $props();

  const today = $derived(ui.today);
  const current = $derived(monthOf(today));
  const m = $derived(ui.month);

  // Always exactly one of the two is open: tapping switches.
  let open = $state<'income' | 'expense'>('expense');
  let openSub = $state<string | null>(null);

  const toggle = () => (open = open === 'income' ? 'expense' : 'income');
  const toggleSub = (id: string) => (openSub = openSub === id ? null : id);
  const tap = (e: Entry) => editEntry(data, e);

  const percent = $derived(usedPercent(data, m));
  const hint = $derived(limitHint(data, m, today));
  const label = $derived(yearOf(m) === yearOf(today) ? monthLabel(m) : `${monthLabel(m)} ${m.slice(2, 4)}`);
  const newDate = $derived<Day>(m === current ? today : `${m}-01`);
</script>

<header class="top">
  <RoundButton label="Übersicht" onclick={() => showYear(yearOf(m))}><House size={18} strokeWidth={1.6} /></RoundButton>
  <button class="balance amount" aria-label="Bilanz {monthLabel(m)}" onclick={() => (ui.month = current)}>
    {formatAmount(balance(data, m), true)}
  </button>
  <RoundButton label="Settings" onclick={openSettings}><SlidersHorizontal size={18} strokeWidth={1.6} /></RoundButton>
</header>

<div class="cards">
  <Card
    title={SCOPES.income.title}
    icon={SCOPES.income.icon}
    total={income(data, m)}
    sigma
    tone="income"
    open={open === 'income'}
    fill
    onToggle={toggle}
  >
    <EntryList
      sections={byCategory(data, 'income', scopeEntriesForMonth(data, 'income', m), editCategory)}
      onTap={tap}
      empty="Keine Einnahmen – in den Settings hinzufügen"
    />
  </Card>

  <Card
    title={SCOPES.expense.title}
    icon={SCOPES.expense.icon}
    total={expenses(data, m)}
    sigma
    tone="expense"
    open={open === 'expense'}
    fill
    onToggle={toggle}
  >
    <Card sub tone="expense" title="Investments" icon={Sprout} total={scopeTotal(data, 'invest', m)} open={openSub === 'invest'} onToggle={() => toggleSub('invest')}>
      <EntryList sections={byCategory(data, 'invest', scopeEntriesForMonth(data, 'invest', m), editCategory)} onTap={tap} empty="Keine Investments – in den Settings hinzufügen" />
    </Card>
    <Card sub tone="expense" title="Fixkosten" icon={Lock} total={scopeTotal(data, 'fixed', m)} open={openSub === 'fixed'} onToggle={() => toggleSub('fixed')}>
      <EntryList sections={byCategory(data, 'fixed', scopeEntriesForMonth(data, 'fixed', m), editCategory)} onTap={tap} empty="Keine Fixkosten – in den Settings hinzufügen" />
    </Card>
    {#each visibleCategories(data, 'expense') as c (c.id)}
      <Card
        sub
        tone="expense"
        title={c.name}
        catIcon={c.icon}
        total={categoryTotal(data, c.id, m)}
        open={openSub === c.id}
        onToggle={() => toggleSub(c.id)}
        onLongPress={() => editCategory(c)}
      >
        <EntryList sections={byGroup(data, categoryEntriesForMonth(data, c.id, m))} onTap={tap} empty="Noch keine Einträge" />
      </Card>
    {/each}
  </Card>
</div>

{#if percent !== null}
  <p class="hint">
    {#if hint}<b>{hint}</b><br />{/if}
    {percent} % verbraucht
  </p>
{/if}

<BottomBar
  tone="expense"
  {label}
  onAdd={() => newOneOff('expense', newDate)}
  onPrev={() => (ui.month = addMonths(m, -1))}
  onNext={() => (ui.month = addMonths(m, 1))}
  onLabel={() => (ui.month = current)}
/>

<style>
  .top {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 16px;
  }
  .balance {
    height: 34px;
    padding: 0 16px;
    border: 2px solid var(--frame);
    border-radius: 17px;
    font-size: 17px;
    font-weight: 600;
  }
  .cards {
    flex: 0 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .hint {
    flex: none;
    text-align: center;
    font-size: 12.5px;
    color: var(--muted);
    line-height: 1.5;
    margin: 18px 0 0;
  }
  .hint b {
    color: var(--text);
    font-weight: 600;
  }
</style>
