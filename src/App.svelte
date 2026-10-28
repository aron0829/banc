<script lang="ts">
  import Login from './components/Login.svelte';
  import MonthView from './components/MonthView.svelte';
  import OverviewView from './components/OverviewView.svelte';
  import { Info } from '@lucide/svelte';
  import IntroPopup from './components/popups/IntroPopup.svelte';
  import { app, init } from './lib/sync.svelte';
  import { openPopup, trackViewport, ui } from './lib/ui.svelte';

  init();
  trackViewport();
</script>

<div class="page" class:fixed={!!app.data}>
  {#if !app.ready}
    <!-- checking session -->
  {:else if !app.userId}
    <Login />
  {:else if !app.data}
    <p class="loading">Lade…</p>
  {:else if ui.view === 'month'}
    <MonthView data={app.data} />
  {:else}
    <OverviewView data={app.data} />
  {/if}
  {#if app.data}
    <button class="info" aria-label="Einführung" title="Einführung" onclick={() => openPopup(IntroPopup, {})}>
      <Info size={22} strokeWidth={1.6} />
    </button>
  {/if}
</div>

{#each ui.popups as p (p.id)}
  {@const C = p.component}
  <C {...p.props} />
{/each}

{#if app.notice}
  <div class="notice" role="status">{app.notice}</div>
{/if}

<style>
  .page {
    position: relative;
    max-width: 420px;
    margin: 0 auto;
    padding: max(20px, env(safe-area-inset-top)) 20px 0;
    min-height: 100dvh;
  }
  /* Month and overview fit the screen; only the open card scrolls inside. */
  .page.fixed {
    height: 100dvh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding-bottom: max(16px, env(safe-area-inset-bottom));
  }
  /* bottom-left corner, level with the month pill */
  .info {
    position: absolute;
    left: 20px;
    bottom: calc(max(16px, env(safe-area-inset-bottom)) + 5px);
    width: 30px;
    height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
  }
  .loading {
    text-align: center;
    color: var(--muted);
    margin-top: 40dvh;
  }
  .notice {
    position: fixed;
    left: 50%;
    top: max(12px, env(safe-area-inset-top));
    transform: translateX(-50%);
    background: var(--text);
    color: var(--bg);
    padding: 8px 14px;
    border-radius: 18px;
    font-size: 13px;
    z-index: 20;
    max-width: calc(100% - 32px);
    text-align: center;
  }
</style>
