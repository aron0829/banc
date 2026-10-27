<script lang="ts">
  import { Clock3, LayoutGrid, RotateCcwClock } from '@lucide/svelte';
  import { editEntry, newRecurring } from '../../lib/actions';
  import { scopeTotal } from '../../lib/calc';
  import { monthOf, shortMonth, todayDay } from '../../lib/dates';
  import { categoryOf, isVisible, visibleCategories, type Entry, type Scope } from '../../lib/model';
  import { deleteEntry } from '../../lib/ops';
  import { SCOPES } from '../../lib/scopes';
  import { byCategory } from '../../lib/sections';
  import { app, commit } from '../../lib/sync.svelte';
  import { closePopup, openPopup } from '../../lib/ui.svelte';
  import { editCategory } from '../../lib/actions';
  import ArtPicker from '../ArtPicker.svelte';
  import Card from '../Card.svelte';
  import EntryList from '../EntryList.svelte';
  import Field from '../Field.svelte';
  import Modal from '../Modal.svelte';
  import ChoicePopup from '../popups/ChoicePopup.svelte';

  let { scope }: { scope: Scope } = $props();

  const data = $derived(app.data!);
  const current = monthOf(todayDay());
  const tone = $derived(SCOPES[scope].tone);

  let open = $state<'old' | 'current'>('current');
  // svelte-ignore state_referenced_locally
  let art = $state<string | undefined>(visibleCategories(app.data!, scope)[0]?.id);

  const entries = $derived(data.entries.filter((e) => e.from && categoryOf(data, e.categoryId)?.scope === scope && isVisible(data, e)));
  const outdated = $derived(entries.filter((e) => e.to != null && e.to < current));
  const active = $derived(entries.filter((e) => !(e.to != null && e.to < current)));

  function choose(e: Entry) {
    openPopup(ChoicePopup, {
      onEdit: () => editEntry(app.data!, e),
      onAdd: () => newRecurring(scope, e.categoryId),
      onDelete: () => commit(deleteEntry(app.data!, e.id, new Date().toISOString())),
    });
  }
</script>

<Modal {tone} title={SCOPES[scope].title} icon={SCOPES[scope].icon} onCancel={closePopup} onConfirm={closePopup} onAdd={() => newRecurring(scope, art)}>
  <Card sub {tone} title="Veraltet" icon={RotateCcwClock} open={open === 'old'} onToggle={() => (open = open === 'old' ? 'current' : 'old')}>
    <EntryList sections={byCategory(data, scope, outdated, editCategory)} onTap={choose} empty="Keine veralteten Einträge" />
  </Card>
  <Card
    sub
    {tone}
    title="Aktuell - {shortMonth(current)}"
    icon={Clock3}
    total={scopeTotal(data, scope, current)}
    open={open === 'current'}
    onToggle={() => (open = open === 'current' ? 'old' : 'current')}
  >
    <EntryList sections={byCategory(data, scope, active, editCategory)} onTap={choose} empty="Noch keine Einträge – unten mit + hinzufügen" />
  </Card>
  <Field icon={LayoutGrid} label="Art" {tone} block>
    {#snippet below()}
      <ArtPicker {scope} selected={art} onSelect={(id) => (art = id)} {tone} />
    {/snippet}
  </Field>
</Modal>
