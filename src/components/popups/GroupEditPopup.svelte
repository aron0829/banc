<script lang="ts">
  import { Plus, SquarePen, Tag } from '@lucide/svelte';
  import { categoryOf, type Group } from '../../lib/model';
  import { addGroup, renameGroup } from '../../lib/ops';
  import { SCOPES } from '../../lib/scopes';
  import { app, commit } from '../../lib/sync.svelte';
  import { closePopup } from '../../lib/ui.svelte';
  import Field from '../Field.svelte';
  import Modal from '../Modal.svelte';

  let { categoryId, group, onSaved }: { categoryId: string; group?: Group; onSaved?: (id: string) => void } = $props();

  // svelte-ignore state_referenced_locally
  let name = $state(group?.name ?? '');
  const category = $derived(categoryOf(app.data!, categoryId)!);

  function save() {
    const n = name.trim();
    if (!n) return;
    if (group) {
      commit(renameGroup(app.data!, group.id, n));
      closePopup();
      return;
    }
    const next = addGroup(app.data!, categoryId, n);
    commit(next);
    closePopup();
    onSaved?.(next.groups[next.groups.length - 1].id);
  }
</script>

<Modal
  tone={SCOPES[category.scope].tone}
  title={category.name}
  catIcon={category.icon}
  subtitle={group ? 'Gruppe bearbeiten' : 'Gruppe hinzufügen'}
  subtitleIcon={group ? SquarePen : Plus}
  onCancel={closePopup}
  onConfirm={save}
  confirmDisabled={!name.trim()}
>
  <Field icon={Tag} label="Name">
    <!-- svelte-ignore a11y_autofocus -->
    <input bind:value={name} aria-label="Name" autofocus onkeydown={(e) => e.key === 'Enter' && save()} />
  </Field>
</Modal>
