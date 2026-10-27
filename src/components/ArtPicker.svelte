<script lang="ts">
  import { Plus } from '@lucide/svelte';
  import { editCategory, newCategory } from '../lib/actions';
  import { longpress } from '../lib/longpress';
  import { visibleCategories, type Scope } from '../lib/model';
  import type { Tone } from '../lib/scopes';
  import { app } from '../lib/sync.svelte';
  import CatIcon from './CatIcon.svelte';

  let { scope, selected, onSelect, tone = 'neutral' }: { scope: Scope; selected?: string; onSelect: (id: string) => void; tone?: Tone } = $props();

  const categories = $derived(app.data ? visibleCategories(app.data, scope) : []);
</script>

<div class="art">
  {#each categories as c (c.id)}
    <button
      class="cat no-select {tone}"
      class:on={c.id === selected}
      title={c.name}
      aria-label={c.name}
      aria-pressed={c.id === selected}
      onclick={() => onSelect(c.id)}
      use:longpress={() => editCategory(c)}
    >
      <CatIcon name={c.icon} size={20} />
    </button>
  {/each}
  <button class="add" aria-label="Kategorie hinzufügen" onclick={() => newCategory(scope, onSelect)}><Plus size={20} strokeWidth={2} /></button>
</div>

<style>
  .art {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 14px;
  }
  .cat {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1px solid var(--line);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .cat.on {
    border: 2px solid var(--frame);
  }
  .cat.on.income {
    border-color: var(--income);
  }
  .cat.on.expense {
    border-color: var(--expense);
  }
  .add {
    width: 28px;
    height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
</style>
