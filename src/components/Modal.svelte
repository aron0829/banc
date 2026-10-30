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
    /** "+" becomes the big coloured button at the bottom. */
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
    <div class="head">
      <span class="side">
        {#if onCancel}
          <RoundButton label="Abbrechen" size={30} onclick={onCancel}><X size={18} strokeWidth={2.2} /></RoundButton>
        {/if}
      </span>
      {#if title}
        <h2>{#if catIcon}<CatIcon name={catIcon} size={24} />{:else if icon}{@const I = icon}<I size={24} strokeWidth={1.6} />{/if}{title}</h2>
      {:else}
        <span></span>
      {/if}
      <span class="side end">
        {#if onConfirm}
          <!-- a real confirm (there is something to cancel) gets the coloured ring; a plain "done" stays quiet -->
          <RoundButton label={onCancel ? 'Bestätigen' : 'Fertig'} size={onCancel ? 36 : 30} strong={!!onCancel} {tone} onclick={onConfirm} disabled={confirmDisabled}>
            <Check size={onCancel ? 22 : 18} strokeWidth={2.2} />
          </RoundButton>
        {/if}
      </span>
    </div>
    {#if subtitle}
      <h3>{#if subtitleIcon}{@const S = subtitleIcon}<S size={19} strokeWidth={1.8} />{/if}{subtitle}</h3>
    {/if}
    {#if children}<div class="body">{@render children()}</div>{/if}
    {#if onAdd || onDelete}
      <div class="actions">
        {#if onAdd}
          {#if addIsMain}
            <RoundButton label="Hinzufügen" size={38} strong {tone} onclick={onAdd}><Plus size={22} strokeWidth={2.2} /></RoundButton>
          {:else}
            <RoundButton label="Hinzufügen" size={30} onclick={onAdd}><Plus size={20} strokeWidth={2.2} /></RoundButton>
          {/if}
        {/if}
        {#if onDelete}
          <RoundButton label="Löschen" size={30} onclick={onDelete}><Trash size={15} strokeWidth={1.8} /></RoundButton>
        {/if}
      </div>
    {/if}
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
    align-items: flex-start;
    justify-content: center;
    /* every popup starts 200px below the top; less when the screen is short or the keyboard is up */
    padding: calc(20px + clamp(0px, var(--vv-height, 100dvh) - 470px, 180px)) 20px 20px;
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
  .head {
    display: grid;
    grid-template-columns: 36px 1fr 36px;
    align-items: center;
    gap: 8px;
  }
  .side {
    display: flex;
  }
  .side.end {
    justify-content: flex-end;
  }
  .actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 18px;
  }
</style>
