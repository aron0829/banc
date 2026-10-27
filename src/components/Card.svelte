<script lang="ts">
  import type { Component, Snippet } from 'svelte';
  import { formatAmount } from '../lib/money';
  import { longpress } from '../lib/longpress';
  import type { Tone } from '../lib/scopes';
  import CatIcon from './CatIcon.svelte';

  let {
    title,
    icon,
    catIcon,
    total,
    sigma = false,
    tone = 'neutral',
    sub = false,
    open = true,
    onToggle,
    onLongPress,
    children,
  }: {
    title: string;
    icon?: Component;
    catIcon?: string;
    total?: number;
    sigma?: boolean;
    tone?: Tone;
    sub?: boolean;
    open?: boolean;
    onToggle?: () => void;
    onLongPress?: () => void;
    children?: Snippet;
  } = $props();
</script>

<section class="card {tone}" class:sub>
  <button class="head no-select" onclick={onToggle} disabled={!onToggle && !onLongPress} use:longpress={onLongPress}>
    <span class="icon">
      {#if catIcon}<CatIcon name={catIcon} size={sub ? 19 : 22} />{:else if icon}{@const I = icon}<I size={sub ? 19 : 22} strokeWidth={1.6} />{/if}
    </span>
    <span class="title">{title}</span>
    {#if total !== undefined}
      <span class="total amount">{#if sigma}<b class="sigma">Σ</b>{/if}{formatAmount(total)}</span>
    {/if}
  </button>
  {#if open && children}
    <div class="body">{@render children()}</div>
  {/if}
</section>

<style>
  .card {
    border: 1px solid var(--frame);
    border-radius: 22px;
    background: var(--surface);
    padding: 4px 14px;
  }
  .card.income {
    border-color: var(--income);
    background: var(--income-bg);
  }
  .card.expense {
    border-color: var(--expense);
    background: var(--expense-bg);
  }
  .card.sub {
    border-radius: 20px;
    border-color: var(--line);
    background: var(--surface);
    padding: 2px 12px;
  }
  .card.sub.expense {
    border-color: var(--expense-line);
  }
  .head {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    text-align: left;
  }
  .head:disabled {
    opacity: 1;
    cursor: default;
  }
  .icon {
    display: inline-flex;
    width: 24px;
    justify-content: center;
  }
  .title {
    flex: 1;
    font-size: 20px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .total {
    font-size: 17px;
    font-weight: 600;
  }
  .sigma {
    margin-right: 8px;
    font-size: 19px;
  }
  .sub .title {
    font-size: 16px;
    font-weight: 500;
  }
  .sub .total {
    font-size: 16px;
    font-weight: 500;
  }
  .body {
    padding: 2px 0 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
</style>
