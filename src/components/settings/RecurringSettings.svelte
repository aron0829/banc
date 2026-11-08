<script lang="ts">
  import { Clock3, RotateCcwClock } from '@lucide/svelte';
  import { editCategory, editEntry, newRecurring } from '../../lib/actions';
  import { scopeTotal } from '../../lib/calc';
  import { monthOf, shortMonth, todayDay } from '../../lib/dates';
  import { categoryOf, isVisible, type Entry, type Scope } from '../../lib/model';
  import { SCOPES } from '../../lib/scopes';
  import { byCategory } from '../../lib/sections';
  import { app } from '../../lib/sync.svelte';
  import { closePopup } from '../../lib/ui.svelte';
  import Card from '../Card.svelte';
  import EntryList from '../EntryList.svelte';
  import Modal from '../Modal.svelte';

  let { scope }: { scope: Scope } = $props();

  const data = $derived(app.data!);
  const current = monthOf(todayDay());
  const tone = $derived(SCOPES[scope].tone);

  let openOld = $state(false);
  let openCurrent = $state(true);

  const entries = $derived(data.entries.filter((e) => e.from && categoryOf(data, e.categoryId)?.scope === scope && isVisible(data, e)));
  const outdated = $derived(entries.filter((e) => e.to != null && e.to < current));
  const active = $derived(entries.filter((e) => !(e.to != null && e.to < current)));

  const edit = (e: Entry) => editEntry(app.data!, e);
</script>

<Modal {tone} title={SCOPES[scope].title} icon={SCOPES[scope].icon} onClose={closePopup} onConfirm={closePopup} onAdd={() => newRecurring(scope)} addIsMain>
  <Card sub {tone} title="Veraltet" icon={RotateCcwClock} open={openOld} onToggle={() => (openOld = !openOld)}>
    <EntryList sections={byCategory(data, scope, outdated, editCategory)} onTap={edit} empty="Keine veralteten Einträge" />
  </Card>
  <Card
    sub
    {tone}
    title="Aktuell - {shortMonth(current)}"
    icon={Clock3}
    total={scopeTotal(data, scope, current)}
    open={openCurrent}
    onToggle={() => (openCurrent = !openCurrent)}
  >
    <EntryList sections={byCategory(data, scope, active, editCategory)} onTap={edit} empty="Noch keine Einträge – unten mit + hinzufügen" />
  </Card>
</Modal>
