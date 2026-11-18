<script lang="ts">
  import type { Snippet } from 'svelte';
  import { editCategory } from '../lib/actions';
  import { longpress } from '../lib/longpress';
  import { visibleCategories, type Category, type Scope } from '../lib/model';
  import type { Tone } from '../lib/scopes';
  import { app } from '../lib/sync.svelte';
  import CatIcon from './CatIcon.svelte';

  let {
    scope,
    selected,
    onSelect,
    tone = 'neutral',
    caption = (c) => c.name,
    children,
  }: {
    scope: Scope;
    selected?: string;
    onSelect: (id: string) => void;
    tone?: Tone;
    /** Text below the icons for the selected category. */
    caption?: (c: Category) => string;
    /** Extra buttons after the icons (e.g. "+"). */
    children?: Snippet;
  } = $props();

  const categories = $derived(app.data ? visibleCategories(app.data, scope) : []);
  const current = $derived(categories.find((c) => c.id === selected));
  const name = $derived(current && caption(current));
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
  {@render children?.()}
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
