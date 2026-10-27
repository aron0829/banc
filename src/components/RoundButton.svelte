<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Tone } from '../lib/scopes';

  let {
    onclick,
    label,
    size = 34,
    tone = 'neutral',
    strong = false,
    disabled = false,
    children,
  }: { onclick?: () => void; label: string; size?: number; tone?: Tone; strong?: boolean; disabled?: boolean; children: Snippet } = $props();
</script>

<button class="round {tone}" class:strong style:--size="{size}px" aria-label={label} title={label} {onclick} {disabled}>
  {@render children()}
</button>

<style>
  .round {
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    border: 1px solid var(--line);
    background: var(--surface);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
  }
  .strong {
    border-width: 1.5px;
    border-color: var(--frame);
  }
  .strong.income {
    border-color: var(--income);
  }
  .strong.expense {
    border-color: var(--expense);
  }
  .strong.danger {
    border-color: var(--danger);
  }
</style>
