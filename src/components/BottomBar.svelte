<script lang="ts">
  import { Calendar, ChevronLeft, ChevronRight, Plus } from '@lucide/svelte';
  import type { Tone } from '../lib/scopes';
  import RoundButton from './RoundButton.svelte';

  let {
    tone = 'neutral',
    label,
    onAdd,
    onPrev,
    onNext,
    onLabel,
  }: { tone?: Tone; label: string; onAdd: () => void; onPrev: () => void; onNext: () => void; onLabel?: () => void } = $props();
</script>

<nav class="bottom">
  <RoundButton label="Eintrag hinzufügen" size={40} strong {tone} onclick={onAdd}><Plus size={24} strokeWidth={2} /></RoundButton>
  <div class="pill">
    <button aria-label="Zurück" onclick={onPrev}><ChevronLeft size={20} /></button>
    <button class="label" onclick={onLabel}><Calendar size={20} strokeWidth={1.6} />{label}</button>
    <button aria-label="Weiter" onclick={onNext}><ChevronRight size={20} /></button>
  </div>
</nav>

<style>
  .bottom {
    flex: none;
    margin-top: auto;
    padding-top: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }
  .pill {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 40px;
    padding: 0 10px;
    border: 1px solid var(--line);
    border-radius: 20px;
    background: var(--surface);
  }
  .pill button {
    height: 100%;
    display: inline-flex;
    align-items: center;
    padding: 0 6px;
  }
  .label {
    gap: 8px;
    min-width: 130px;
    justify-content: center;
    font-size: 17px;
    font-weight: 600;
  }
</style>
