<script lang="ts">
  import { Lock, Sprout } from '@lucide/svelte';
  import { editCategory, editEntry } from '../lib/actions';
  import {
    categoryEntriesForMonth, categoryTotal, expenses, income, limitHint, scopeEntriesForMonth, scopeTotal, usedPercent,
  } from '../lib/calc';
  import { visibleCategories, type Data, type Entry } from '../lib/model';
  import { SCOPES } from '../lib/scopes';
  import { byCategory, byGroup } from '../lib/sections';
  import { ui } from '../lib/ui.svelte';
  import Card from './Card.svelte';
  import EntryList from './EntryList.svelte';

  let { data }: { data: Data } = $props();

  const today = $derived(ui.today);
  const m = $derived(ui.month);

  // Always exactly one of the two is open: tapping switches.
  let open = $state<'income' | 'expense'>('expense');
  let openSub = $state<string | null>(null);

  const toggle = () => (open = open === 'income' ? 'expense' : 'income');
  const toggleSub = (id: string) => (openSub = openSub === id ? null : id);
  const tap = (e: Entry) => editEntry(data, e);

  const percent = $derived(usedPercent(data, m));
  const hint = $derived(limitHint(data, m, today));
</script>

<div class="cards">
  <Card
    title={SCOPES.income.title}
    icon={SCOPES.income.icon}
    total={income(data, m)}
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

<style>
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
