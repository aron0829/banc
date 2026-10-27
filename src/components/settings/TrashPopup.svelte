<script lang="ts">
  import { ArchiveRestore, Trash } from '@lucide/svelte';
  import type { Entry } from '../../lib/model';
  import { restoreCategory, restoreEntry, restoreGroup, trash, type TrashSection } from '../../lib/ops';
  import { entryWhen, type ListSection } from '../../lib/sections';
  import { app, commit } from '../../lib/sync.svelte';
  import { closePopup, openPopup } from '../../lib/ui.svelte';
  import EntryList from '../EntryList.svelte';
  import Modal from '../Modal.svelte';
  import ConfirmPopup from '../popups/ConfirmPopup.svelte';

  const sections = $derived(trash(app.data!));

  const label = (s: TrashSection) => (s.groupLabel ? `${s.category.name} · ${s.groupLabel}` : s.category.name);

  function confirmEntry(s: TrashSection, e: Entry) {
    openPopup(ConfirmPopup, {
      tone: 'neutral',
      title: 'Papierkorb',
      icon: Trash,
      subtitle: 'Eintrag wiederherstellen?',
      subtitleIcon: ArchiveRestore,
      rows: [{ label: `${label(s)}: ${e.name || '–'} ${entryWhen(e)}`, amount: e.amount }],
      onConfirm: () => commit(restoreEntry(app.data!, e.id)),
    });
  }

  function confirmSection(s: TrashSection) {
    openPopup(ConfirmPopup, {
      tone: 'neutral',
      title: 'Papierkorb',
      icon: Trash,
      subtitle: s.group ? 'Gruppe wiederherstellen?' : 'Kategorie wiederherstellen?',
      subtitleIcon: ArchiveRestore,
      rows: [{ label: label(s), value: `${s.entries.length} Einträge` }],
      onConfirm: () => commit(s.group ? restoreGroup(app.data!, s.group.id) : restoreCategory(app.data!, s.category.id)),
    });
  }

  /** Each trash section becomes a list section; the header restores a deleted category/group as a whole. */
  const listSections = $derived<ListSection[]>(
    sections.map((s) => {
      const wholeDeleted = !!s.group || !!s.category.deleted;
      return {
        key: `${s.category.id}/${s.group?.id ?? ''}`,
        label: label(s),
        icon: s.category.icon,
        total: s.entries.reduce((sum, e) => sum + e.amount, 0),
        entries: s.entries,
        onHeaderTap: wholeDeleted ? () => confirmSection(s) : undefined,
      };
    }),
  );

  function tapEntry(e: Entry) {
    const s = sections.find((x) => x.entries.includes(e));
    if (s) confirmEntry(s, e);
  }
</script>

<Modal title="Papierkorb" icon={Trash} onConfirm={closePopup} onCancel={closePopup}>
  <div class="box">
    <EntryList sections={listSections} onTap={tapEntry} empty="Der Papierkorb ist leer" />
  </div>
</Modal>

<style>
  .box {
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 12px 16px;
  }
  .box :global(.list) {
    max-height: 320px;
  }
</style>
