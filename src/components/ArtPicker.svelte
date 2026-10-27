<script lang="ts">
  import { editCategory } from '../lib/actions';
  import { longpress } from '../lib/longpress';
  import { visibleCategories, type Scope } from '../lib/model';
  import type { Tone } from '../lib/scopes';
  import { app } from '../lib/sync.svelte';
  import CatIcon from './CatIcon.svelte';

  let { scope, selected, onSelect, tone = 'neutral' }: { scope: Scope; selected?: string; onSelect: (id: string) => void; tone?: Tone } = $props();

  const categories = $derived(app.data ? visibleCategories(app.data, scope) : []);
  const name = $derived(categories.find((c) => c.id === selected)?.name);
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
</div>
{#if name}<p class="name">{name}</p>{/if}

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
  .name {
    margin: -2px 0 0;
    text-align: center;
    font-size: 12px;
    color: var(--muted);
  }
</style>
