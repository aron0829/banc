<script lang="ts">
  import Login from './components/Login.svelte';
  import MonthView from './components/MonthView.svelte';
  import OverviewView from './components/OverviewView.svelte';
  import { app, init } from './lib/sync.svelte';
  import { ui } from './lib/ui.svelte';

  init();
</script>

<div class="page">
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
    max-width: 420px;
    margin: 0 auto;
    padding: max(20px, env(safe-area-inset-top)) 20px 0;
    min-height: 100dvh;
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
