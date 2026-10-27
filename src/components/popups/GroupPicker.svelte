<script lang="ts">
  import { Check, Plus, Tag, Trash } from '@lucide/svelte';
  import { longpress } from '../../lib/longpress';
  import { categoryOf, visibleGroups, type Group } from '../../lib/model';
  import { deleteGroup } from '../../lib/ops';
  import { SCOPES } from '../../lib/scopes';
  import { app, commit } from '../../lib/sync.svelte';
  import { closePopup, openPopup } from '../../lib/ui.svelte';
  import Modal from '../Modal.svelte';
  import ConfirmPopup from './ConfirmPopup.svelte';
  import GroupEditPopup from './GroupEditPopup.svelte';

  let { categoryId, selected, onSelect }: { categoryId: string; selected?: string; onSelect: (id?: string) => void } = $props();

  // svelte-ignore state_referenced_locally
  let sel = $state(selected);
  const data = $derived(app.data!);
  const category = $derived(categoryOf(data, categoryId)!);
  const groups = $derived(visibleGroups(data, categoryId));
  const tone = $derived(SCOPES[category.scope].tone);

  const add = () => openPopup(GroupEditPopup, { categoryId, onSaved: (id: string) => (sel = id) });
  const edit = (g: Group) => openPopup(GroupEditPopup, { categoryId, group: g });

  function remove(g: Group) {
    openPopup(ConfirmPopup, {
      title: category.name,
      catIcon: category.icon,
      subtitle: 'Gruppe löschen?',
      subtitleIcon: Trash,
      rows: [{ icon: Tag, label: 'Name', value: g.name }],
      onConfirm: () => {
        commit(deleteGroup(app.data!, g.id, new Date().toISOString()));
        if (sel === g.id) sel = undefined;
      },
    });
  }

  function apply() {
    closePopup();
    onSelect(sel);
  }
</script>

<Modal {tone} title={category.name} catIcon={category.icon} subtitle="Aktuelle Gruppen" onCancel={closePopup} onConfirm={apply} confirmDisabled={!!category.requiresGroup && !groups.some((g) => g.id === sel)}>
  <div class="box scroll">
    {#if !category.requiresGroup}
      <button class="row" onclick={() => (sel = undefined)}>
        <span class="check">{#if !sel}<Check size={16} />{/if}</span>Keine Gruppe
      </button>
    {/if}
    {#each groups as g (g.id)}
      <div class="row">
        <button class="pick no-select" onclick={() => (sel = g.id)} use:longpress={() => edit(g)}>
          <span class="check">{#if sel === g.id}<Check size={16} />{/if}</span>{g.name}
        </button>
        <button class="trash" aria-label="Gruppe {g.name} löschen" onclick={() => remove(g)}><Trash size={16} strokeWidth={1.8} /></button>
      </div>
    {/each}
    <button class="row add" aria-label="Gruppe hinzufügen" onclick={add}><Plus size={20} strokeWidth={2} /></button>
  </div>
</Modal>

<style>
  .box {
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 10px 16px;
    max-height: 230px;
    display: flex;
    flex-direction: column;
  }
  .row,
  .pick {
    display: flex;
    align-items: center;
    min-height: 30px;
    font-size: 16px;
    text-align: left;
    width: 100%;
  }
  .pick {
    flex: 1;
  }
  .check {
    width: 20px;
    display: inline-flex;
  }
  .trash {
    display: inline-flex;
    padding: 4px;
  }
</style>
