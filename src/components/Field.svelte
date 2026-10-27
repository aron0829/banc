<script lang="ts">
  import type { Component, Snippet } from 'svelte';
  import type { Tone } from '../lib/scopes';

  let {
    icon,
    label,
    tone = 'neutral',
    block = false,
    invalid = false,
    children,
    below,
  }: {
    icon?: Component;
    label?: string;
    tone?: Tone;
    block?: boolean;
    invalid?: boolean;
    children?: Snippet;
    below?: Snippet;
  } = $props();
</script>

<div class="field {tone}" class:block class:invalid>
  <div class="line">
    {#if icon}{@const I = icon}<I size={18} strokeWidth={1.7} />{/if}
    {#if label}<span class="label">{label}</span>{/if}
    <div class="value">{@render children?.()}</div>
  </div>
  {#if below}{@render below()}{/if}
</div>

<style>
  .field {
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 0 16px;
    min-height: 38px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .income {
    border-color: color-mix(in srgb, var(--income) 35%, var(--line));
  }
  .expense {
    border-color: var(--expense-line);
  }
  .block {
    padding: 8px 16px 12px;
    gap: 10px;
  }
  .invalid {
    border-color: var(--danger);
  }
  .line {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 22px;
  }
  .label {
    font-weight: 600;
    font-size: 15px;
    white-space: nowrap;
  }
  .value {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    min-width: 0;
    font-size: 15px;
  }
  .value :global(input) {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    text-align: right;
    font-size: 16px;
  }
  .value :global(input::placeholder) {
    color: var(--muted);
  }
</style>
