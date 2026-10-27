<script lang="ts">
  import { Check, Plus, Trash, X } from '@lucide/svelte';
  import type { Component, Snippet } from 'svelte';
  import type { Tone } from '../lib/scopes';
  import CatIcon from './CatIcon.svelte';
  import RoundButton from './RoundButton.svelte';

  let {
    tone = 'neutral',
    title,
    icon,
    catIcon,
    subtitle,
    subtitleIcon,
    onCancel,
    onConfirm,
    confirmDisabled = false,
    onDelete,
    onAdd,
    children,
  }: {
    tone?: Tone;
    title?: string;
    icon?: Component;
    catIcon?: string;
    subtitle?: string;
    subtitleIcon?: Component;
    onCancel?: () => void;
    onConfirm?: () => void;
    confirmDisabled?: boolean;
    onDelete?: () => void;
    onAdd?: () => void;
    children?: Snippet;
  } = $props();

  function key(e: KeyboardEvent) {
    if (e.key === 'Escape') onCancel?.();
  }
</script>

<svelte:window onkeydown={key} />

<div class="overlay" role="presentation" onclick={(e) => e.target === e.currentTarget && onCancel?.()}>
  <div class="modal {tone}" role="dialog" aria-modal="true" aria-label={title ?? subtitle}>
    {#if title}
      <h2>{#if catIcon}<CatIcon name={catIcon} size={24} />{:else if icon}{@const I = icon}<I size={24} strokeWidth={1.6} />{/if}{title}</h2>
    {/if}
    {#if subtitle}
      <h3>{#if subtitleIcon}{@const S = subtitleIcon}<S size={19} strokeWidth={1.8} />{/if}{subtitle}</h3>
    {/if}
    {#if children}<div class="body">{@render children()}</div>{/if}
    <div class="actions">
      {#if onCancel}
        <RoundButton label="Abbrechen" size={30} onclick={onCancel}><X size={18} strokeWidth={2.2} /></RoundButton>
      {/if}
      {#if onConfirm}
        <RoundButton label="Bestätigen" size={38} strong {tone} onclick={onConfirm} disabled={confirmDisabled}>
          <Check size={22} strokeWidth={2.2} />
        </RoundButton>
      {/if}
      {#if onAdd}
        <RoundButton label="Hinzufügen" size={30} onclick={onAdd}><Plus size={20} strokeWidth={2.2} /></RoundButton>
      {/if}
      {#if onDelete}
        <RoundButton label="Löschen" size={30} onclick={onDelete}><Trash size={15} strokeWidth={1.8} /></RoundButton>
      {/if}
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: var(--overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 10;
  }
  .modal {
    width: 100%;
    max-width: 360px;
    max-height: calc(100dvh - 40px);
    overflow-y: auto;
    scrollbar-width: none;
    background: var(--surface);
    border: 1px solid var(--frame);
    border-radius: 22px;
    box-shadow: var(--shadow);
    padding: 16px 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .modal::-webkit-scrollbar {
    display: none;
  }
  .income {
    border-color: var(--income);
  }
  .expense {
    border-color: var(--expense);
  }
  .danger {
    border-color: var(--danger);
  }
  h2,
  h3 {
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-align: center;
  }
  h2 {
    font-size: 20px;
    font-weight: 700;
  }
  h3 {
    font-size: 16px;
    font-weight: 600;
  }
  .body {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 18px;
  }
</style>
