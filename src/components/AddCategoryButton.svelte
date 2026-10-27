<script lang="ts">
  import { Plus } from '@lucide/svelte';
  import { newCategory } from '../lib/actions';
  import type { Scope } from '../lib/model';

  let { scope, onCreated }: { scope: Scope; onCreated: (id: string) => void } = $props();
</script>

<button class="add" aria-label="Kategorie hinzufügen" title="Kategorie hinzufügen" onclick={() => newCategory(scope, onCreated)}>
  <Plus size={16} strokeWidth={2} />
</button>

<style>
  .add {
    display: inline-flex;
    padding: 2px;
    opacity: 0.5;
  }
</style>
