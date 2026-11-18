<script lang="ts">
  import { Lock, LockOpen } from '@lucide/svelte';
  import { editCategory, editEntry } from '../lib/actions';
  import {
    budget, budgetUsage, categoryEntriesForMonth, categoryTotal, scopeEntriesForMonth, scopeTotal, variableIncome, variableTotal,
  } from '../lib/calc';
  import { visibleCategories, type Data, type Entry, type Scope } from '../lib/model';
  import { SCOPES } from '../lib/scopes';
  import { byCategory, byCategoryAndGroup, byGroup } from '../lib/sections';
  import { ui } from '../lib/ui.svelte';
  import Card from './Card.svelte';
  import EntryList from './EntryList.svelte';

  let { data }: { data: Data } = $props();

  const m = $derived(ui.month);

  // Every card opens and closes on its own.
  let open = $state<Record<string, boolean>>({ variable: true });

  const FIX: Scope[] = ['income', 'fixed', 'invest'];
  const EMPTY: Partial<Record<Scope, string>> = { income: 'Keine Einnahmen', fixed: 'Keine Fixkosten', invest: 'Keine Investments' };

  const toggle = (id: string) => (open[id] = !open[id]);
  const tap = (e: Entry) => editEntry(data, e);

  const usage = $derived(budgetUsage(data, m));
  // With Variable Einnahmen switched on the Variabel card shows + and − like a small balance.
  const withIncome = $derived(!!data.variableIncome);
  const euros = (cents: number) => `${Math.round(cents / 100)} €`;
</script>

<div class="cards">
  <Card title="Fix" icon={Lock} total={budget(data, m)} open={!!open.fix} fill onToggle={() => toggle('fix')}>
    {#each FIX as scope (scope)}
      <Card
        sub
        accent
        tone={SCOPES[scope].tone}
        title={SCOPES[scope].title}
        icon={SCOPES[scope].icon}
        total={scopeTotal(data, scope, m)}
        open={!!open[scope]}
        onToggle={() => toggle(scope)}
      >
        <EntryList
          sections={byCategory(data, scope, scopeEntriesForMonth(data, scope, m), editCategory)}
          onTap={tap}
          empty="{EMPTY[scope]} – in den Settings hinzufügen"
        />
      </Card>
    {/each}
  </Card>

  <Card
    title="Variabel"
    icon={LockOpen}
    total={withIncome ? variableTotal(data, m) : scopeTotal(data, 'expense', m)}
    signed={withIncome}
    open={!!open.variable}
    fill
    onToggle={() => toggle('variable')}
  >
    {#if withIncome}
      <Card
        sub
        accent
        tone="income"
        title={SCOPES.income.title}
        icon={SCOPES.varIncome.icon}
        total={variableIncome(data, m)}
        signed
        open={!!open.varIncome}
        onToggle={() => toggle('varIncome')}
      >
        <EntryList
          sections={byCategoryAndGroup(data, 'varIncome', scopeEntriesForMonth(data, 'varIncome', m), editCategory)}
          onTap={tap}
          empty="Noch keine variablen Einnahmen – mit + und den Pfeilen hinzufügen"
        />
      </Card>
    {/if}
    {#each visibleCategories(data, 'expense') as c (c.id)}
      <Card
        sub
        accent
        tone="expense"
        title={c.name}
        catIcon={c.icon}
        total={withIncome ? -categoryTotal(data, c.id, m) : categoryTotal(data, c.id, m)}
        open={!!open[c.id]}
        onToggle={() => toggle(c.id)}
        onLongPress={() => editCategory(c)}
      >
        <EntryList sections={byGroup(data, categoryEntriesForMonth(data, c.id, m))} onTap={tap} empty="Noch keine Einträge" />
      </Card>
    {/each}
  </Card>
</div>

{#if usage}
  <p class="hint">
    {#if usage.percent !== null}<b>{usage.percent} % verbraucht</b><br />{/if}
    {euros(usage.spent)} / {euros(usage.budget)}
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
