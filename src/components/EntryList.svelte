<script lang="ts">
  import type { Entry } from '../lib/model';
  import { entryWhen, type ListSection } from '../lib/sections';
  import { longpress } from '../lib/longpress';
  import { formatAmount } from '../lib/money';
  import CatIcon from './CatIcon.svelte';

  let { sections, onTap, empty }: { sections: ListSection[]; onTap?: (e: Entry) => void; empty?: string } = $props();

</script>

<div class="list scroll">
  {#each sections as s (s.key)}
    {#if s.label !== undefined}
      <button class="group no-select" onclick={s.onHeaderTap} use:longpress={s.onHeaderLongPress} disabled={!s.onHeaderLongPress && !s.onHeaderTap}>
        {#if s.icon}<CatIcon name={s.icon} size={15} />{/if}
        <span class="name">{s.label}</span>
        {#if s.total !== undefined}<span class="amount">{formatAmount(s.total)}</span>{/if}
      </button>
    {/if}
    {#each s.entries as e (e.id)}
      <button class="row" class:top={s.label === undefined} onclick={() => onTap?.(e)} disabled={!onTap}>
        <span class="name">{e.name || '–'}</span>
        <span class="when">{entryWhen(e)}</span>
        <span class="amount">{formatAmount(e.amount)}</span>
      </button>
    {/each}
  {:else}
    {#if empty}<p class="empty">{empty}</p>{/if}
  {/each}
</div>

<style>
  .list {
    max-height: 170px;
    display: flex;
    flex-direction: column;
    font-size: 12.5px;
  }
  button:disabled {
    opacity: 1;
    cursor: default;
  }
  .group,
  .row {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    min-height: 21px;
    text-align: left;
  }
  .group {
    font-weight: 700;
    margin-top: 4px;
  }
  .group:first-child {
    margin-top: 0;
  }
  .row {
    padding-left: 8px;
  }
  .row.top {
    padding-left: 0;
    font-weight: 600;
  }
  .name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 45%;
  }
  .group .name {
    flex: 1;
    max-width: none;
  }
  .when {
    flex: 1;
    color: var(--muted);
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .amount {
    margin-left: auto;
  }
  .empty {
    margin: 0;
    color: var(--muted);
    font-size: 12.5px;
  }
</style>
