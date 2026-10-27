<script lang="ts">
  import { Plus, SquarePen, Trash } from '@lucide/svelte';
  import { closePopup } from '../../lib/ui.svelte';
  import Modal from '../Modal.svelte';

  let { onEdit, onAdd, onDelete }: { onEdit: () => void; onAdd: () => void; onDelete: () => void } = $props();

  const run = (fn: () => void) => () => {
    closePopup();
    fn();
  };
</script>

<Modal onCancel={closePopup}>
  <button class="choice" onclick={run(onEdit)}><SquarePen size={18} strokeWidth={1.8} />Bearbeiten</button>
  <button class="choice" onclick={run(onAdd)}><Plus size={18} strokeWidth={2} />Hinzufügen</button>
  <button class="choice" onclick={run(onDelete)}><Trash size={18} strokeWidth={1.8} />Löschen</button>
</Modal>

<style>
  .choice {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 38px;
    border: 1px solid var(--line);
    border-radius: 20px;
    font-size: 16px;
    font-weight: 500;
  }
</style>
