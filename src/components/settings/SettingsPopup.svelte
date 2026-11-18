<script lang="ts">
  import { LogOut, Moon, RefreshCw, SlidersHorizontal, Trash, User } from '@lucide/svelte';
  import type { Component } from 'svelte';
  import type { Scope } from '../../lib/model';
  import { SCOPES, type Tone } from '../../lib/scopes';
  import { app, commit, logout } from '../../lib/sync.svelte';
  import { closeAllPopups, closePopup, currentTheme, openPopup, setTheme, type Theme } from '../../lib/ui.svelte';
  import Modal from '../Modal.svelte';
  import Switch from '../Switch.svelte';
  import RecurringSettings from './RecurringSettings.svelte';
  import TrashPopup from './TrashPopup.svelte';

  let theme = $state<Theme>(currentTheme());
  const VarIcon = SCOPES.varIncome.icon;

  const sections: { scope: Scope; tone: Tone }[] = [
    { scope: 'income', tone: 'income' },
    { scope: 'fixed', tone: 'expense' },
    { scope: 'invest', tone: 'expense' },
  ];

  function choose(t: Theme) {
    theme = t;
    setTheme(t);
  }

  /** Synced with the profile, so every device shows the same month results. */
  function setVariableIncome(on: boolean) {
    if (app.data) commit({ ...app.data, variableIncome: on });
  }

  async function signOut() {
    closeAllPopups();
    await logout();
  }
</script>

{#snippet row(icon: Component, label: string, tone: Tone, onclick: () => void)}
  {@const I = icon}
  <button class="row {tone}" {onclick}>
    <I size={18} strokeWidth={1.6} /><span>{label}</span><RefreshCw size={20} strokeWidth={1.6} />
  </button>
{/snippet}

<Modal title="Settings" icon={SlidersHorizontal} onClose={closePopup} onConfirm={closePopup}>
  {#each sections as s (s.scope)}
    {@render row(SCOPES[s.scope].icon, SCOPES[s.scope].title, s.tone, () => openPopup(RecurringSettings, { scope: s.scope }))}
  {/each}
  {@render row(Trash, 'Papierkorb', 'neutral', () => openPopup(TrashPopup, {}))}
  <div class="row neutral">
    <VarIcon size={18} strokeWidth={1.6} /><span>{SCOPES.varIncome.title}</span>
    <Switch label={SCOPES.varIncome.title} on={!!app.data?.variableIncome} onchange={setVariableIncome} />
  </div>
  <div class="row neutral">
    <Moon size={18} strokeWidth={1.6} /><span>Modus</span>
    <Switch label="Dunkler Modus" on={theme === 'dark'} onchange={(on) => choose(on ? 'dark' : 'light')} />
  </div>
  <button class="row neutral" onclick={signOut}>
    <User size={18} strokeWidth={1.6} /><span>Profil: {app.profile}</span><LogOut size={20} strokeWidth={1.6} />
  </button>
</Modal>

<style>
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 38px;
    padding: 0 12px 0 16px;
    border: 1px solid var(--line);
    border-radius: 20px;
    font-size: 16px;
    font-weight: 600;
    text-align: left;
  }
  .row span {
    flex: 1;
  }
  .row.income {
    border-color: var(--income);
  }
  .row.expense {
    border-color: var(--expense);
  }
</style>
