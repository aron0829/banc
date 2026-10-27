<script lang="ts">
  import { LogOut, Moon, RefreshCw, SlidersHorizontal, Sun, ToggleLeft, Trash, User } from '@lucide/svelte';
  import type { Component } from 'svelte';
  import type { Scope } from '../../lib/model';
  import { SCOPES, type Tone } from '../../lib/scopes';
  import { logout } from '../../lib/supabase';
  import { app } from '../../lib/sync.svelte';
  import { closeAllPopups, closePopup, currentTheme, openPopup, setTheme, type Theme } from '../../lib/ui.svelte';
  import Modal from '../Modal.svelte';
  import RecurringSettings from './RecurringSettings.svelte';
  import TrashPopup from './TrashPopup.svelte';

  let theme = $state<Theme>(currentTheme());

  const sections: { scope: Scope; tone: Tone }[] = [
    { scope: 'income', tone: 'income' },
    { scope: 'fixed', tone: 'expense' },
    { scope: 'invest', tone: 'expense' },
  ];

  function choose(t: Theme) {
    theme = t;
    setTheme(t);
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

<Modal title="Settings" icon={SlidersHorizontal} onCancel={closePopup} onConfirm={closePopup}>
  {#each sections as s (s.scope)}
    {@render row(SCOPES[s.scope].icon, SCOPES[s.scope].title, s.tone, () => openPopup(RecurringSettings, { scope: s.scope }))}
  {/each}
  {@render row(Trash, 'Papierkorb', 'neutral', () => openPopup(TrashPopup, {}))}
  <div class="row neutral">
    <ToggleLeft size={18} strokeWidth={1.6} /><span>Modus</span>
    <button class="mode" class:on={theme === 'light'} aria-label="Hell" aria-pressed={theme === 'light'} onclick={() => choose('light')}><Sun size={17} strokeWidth={1.6} /></button>
    <button class="mode" class:on={theme === 'dark'} aria-label="Dunkel" aria-pressed={theme === 'dark'} onclick={() => choose('dark')}><Moon size={17} strokeWidth={1.6} /></button>
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
  .mode {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
  }
  .mode.on {
    border-color: var(--frame);
  }
</style>
