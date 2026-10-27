<script lang="ts">
  import type { Component } from 'svelte';
  import { formatAmount } from '../../lib/money';
  import type { Tone } from '../../lib/scopes';
  import { closePopup } from '../../lib/ui.svelte';
  import Field from '../Field.svelte';
  import Modal from '../Modal.svelte';

  interface Row {
    icon?: Component;
    label: string;
    value?: string;
    amount?: number;
  }

  let {
    tone = 'danger',
    title,
    icon,
    catIcon,
    subtitle,
    subtitleIcon,
    rows,
    onConfirm,
  }: {
    tone?: Tone;
    title: string;
    icon?: Component;
    catIcon?: string;
    subtitle: string;
    subtitleIcon?: Component;
    rows: Row[];
    onConfirm: () => void;
  } = $props();

  function confirm() {
    closePopup();
    onConfirm();
  }
</script>

<Modal {tone} {title} {icon} {catIcon} {subtitle} {subtitleIcon} onCancel={closePopup} onConfirm={confirm}>
  {#each rows as r, i (i)}
    <Field icon={r.icon} label={r.label}>
      {#if r.amount !== undefined}<span class="amount">{formatAmount(r.amount)}</span>{:else}{r.value}{/if}
    </Field>
  {/each}
</Modal>
