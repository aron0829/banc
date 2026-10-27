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
    onClose,
    onConfirm,
    confirmDisabled = false,
    onDelete,
    onAdd,
    addIsMain = false,
    children,
  }: {
    tone?: Tone;
    title?: string;
    icon?: Component;
    catIcon?: string;
    subtitle?: string;
    subtitleIcon?: Component;
    /** Shows the X button; also used for Escape / tapping outside. */
    onCancel?: () => void;
    /** Escape / tapping outside only, for popups where an X would do the same as ✓. */
    onClose?: () => void;
    onConfirm?: () => void;
    confirmDisabled?: boolean;
    onDelete?: () => void;
    onAdd?: () => void;
    /** "+" becomes the big coloured button in the middle, ✓ moves small to its left. */
    addIsMain?: boolean;
    children?: Snippet;
  } = $props();

  const dismiss = () => (onCancel ?? onClose)?.();

  function key(e: KeyboardEvent) {
    if (e.key === 'Escape') dismiss();
  }

  /** Once the keyboard is up, scroll the focused field into the visible part of the popup. */
  function focusin(e: FocusEvent) {
    const el = e.target as HTMLElement;
    if (el.tagName !== 'INPUT') return;
    setTimeout(() => el.isConnected && el.scrollIntoView({ block: 'nearest' }), 300);
  }
</script>

<svelte:window onkeydown={key} />

<div class="overlay" role="presentation" onclick={(e) => e.target === e.currentTarget && dismiss()}>
  <div class="modal {tone}" role="dialog" aria-modal="true" aria-label={title ?? subtitle} tabindex="-1" onfocusin={focusin}>
    {#if title}
      <h2>{#if catIcon}<CatIcon name={catIcon} size={24} />{:else if icon}{@const I = icon}<I size={24} strokeWidth={1.6} />{/if}{title}</h2>
    {/if}
    {#if subtitle}
      <h3>{#if subtitleIcon}{@const S = subtitleIcon}<S size={19} strokeWidth={1.8} />{/if}{subtitle}</h3>
    {/if}
    {#if children}<div class="body">{@render children()}</div>{/if}
    <div class="actions">
      {#if addIsMain}
        <RoundButton label="Fertig" size={30} onclick={onConfirm}><Check size={18} strokeWidth={2.2} /></RoundButton>
        <RoundButton label="Hinzufügen" size={38} strong {tone} onclick={onAdd}><Plus size={22} strokeWidth={2.2} /></RoundButton>
        <span class="slot"></span>
      {:else}
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
      {/if}
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    left: 0;
    right: 0;
    /* follows the visual viewport, so the popup moves up above the on-screen keyboard */
    top: var(--vv-top, 0px);
    height: var(--vv-height, 100dvh);
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
    max-height: 100%;
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
  .slot {
    width: 30px;
  }
  .actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 18px;
  }
</style>
