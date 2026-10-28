<script lang="ts" module>
  /** Parts of the example screen a step can point at. */
  export type IntroPart = 'home' | 'balance' | 'settings' | 'income' | 'expense' | 'hint' | 'add' | 'pill' | 'info' | 'entry';
  export type IntroKind = 'month' | 'overview' | 'entry' | 'settings';
</script>

<script lang="ts">
  import {
    BanknoteArrowDown, BanknoteArrowUp, Calendar, Check, ChevronDown, ChevronLeft, ChevronRight, Euro, House, Info, LayoutGrid,
    Lock, LogOut, Moon, Plus, RefreshCw, RotateCcwClock, ScrollText, SlidersHorizontal, Sprout, Sun, Tag, ToggleLeft, Trash, User, X,
  } from '@lucide/svelte';
  import CatIcon from '../CatIcon.svelte';

  // Drawn at phone size and scaled down, so it looks like the real app.
  let { kind = 'month', focus = [], open }: { kind?: IntroKind; focus?: IntroPart[]; open?: 'essen' } = $props();

  const expenses = [
    { name: 'Essen', icon: 'utensils', total: '186.40 €' },
    { name: 'Shopping', icon: 'shopping-bag', total: '112.20 €' },
    { name: 'Reisen', icon: 'plane', total: '70.00 €' },
    { name: 'Weitere', icon: 'ellipsis', total: '0.00 €' },
  ];
  const food = [
    { name: 'Rewe', when: '27. Okt', amount: '34.80 €' },
    { name: 'Pizza', when: '24. Okt', amount: '18.50 €' },
    { name: 'Bäcker', when: '21. Okt', amount: '6.20 €' },
  ];
  const months = [
    ['Oktober', '911.40 €'],
    ['September', '604.10 €'],
    ['August', '372.95 €'],
    ['Juli', '815.00 €'],
    ['Juni', '-120.30 €'],
  ];
</script>

<div class="frame" aria-hidden="true">
  <div class="screen" class:dim={focus.length > 0}>
    {#if kind === 'month' || kind === 'overview'}
      <header class="top">
        <span class="switch" class:p={true} class:hl={focus.includes('home')}>
          <span class:on={kind === 'overview'}><House size={18} strokeWidth={1.6} /></span>
          <span class:on={kind === 'month'}><Calendar size={18} strokeWidth={1.6} /></span>
        </span>
        <span class="balance" class:p={true} class:hl={focus.includes('balance')}>{kind === 'month' ? '+911.40 €' : '+4 862.15 €'}</span>
        <span class="round" class:p={true} class:hl={focus.includes('settings')}><SlidersHorizontal size={18} strokeWidth={1.6} /></span>
      </header>

      {#if kind === 'month'}
        <div class="cards">
          <section class="card income" class:p={true} class:hl={focus.includes('income')}>
            <div class="head"><BanknoteArrowUp size={22} strokeWidth={1.6} /><b>Einnahmen</b><span>2400.00 €</span></div>
          </section>
          <section class="card expense" class:p={true} class:hl={focus.includes('expense')}>
            <div class="head"><BanknoteArrowDown size={22} strokeWidth={1.6} /><b>Ausgaben</b><span>1488.60 €</span></div>
            <div class="sub"><Sprout size={19} strokeWidth={1.8} /><i>Investments</i><span>300.00 €</span></div>
            <div class="sub"><Lock size={19} strokeWidth={1.8} /><i>Fixkosten</i><span>820.00 €</span></div>
            {#each expenses as c (c.name)}
              <div class="sub" class:opened={open === 'essen' && c.name === 'Essen'}>
                <div class="subhead"><CatIcon name={c.icon} size={19} /><i>{c.name}</i><span>{c.total}</span></div>
                {#if open === 'essen' && c.name === 'Essen'}
                  {#each food as e, i (e.name)}
                    <div class="entry" class:ring={i === 0 && focus.includes('entry')}>
                      <span>{e.name}</span><em>{e.when}</em><span>{e.amount}</span>
                    </div>
                  {/each}
                {/if}
              </div>
            {/each}
          </section>
        </div>
        <p class="hint" class:p={true} class:hl={focus.includes('hint')}><b>Du bleibst voraussichtlich im Limit</b><br />62 % verbraucht</p>
      {:else}
        <div class="cards">
          <section class="card">
            <div class="head"><ScrollText size={22} strokeWidth={1.6} /><b>Jahresübersicht</b><span>3962.15 €</span></div>
            <div class="sub opened">
              <div class="subhead"><Calendar size={19} strokeWidth={1.8} /><i>Monatsvergleich</i><span>2583.15 €</span></div>
              {#each months as [m, v] (m)}
                <div class="entry month"><span>{m}</span><span>{v}</span></div>
              {/each}
            </div>
            <div class="sub"><RotateCcwClock size={19} strokeWidth={1.8} /><i>Von 2025</i><span>1379.00 €</span></div>
          </section>
          <section class="card">
            <div class="head"><ScrollText size={22} strokeWidth={1.6} /><b>Allgemein</b><span>900.00 €</span></div>
          </section>
          <section class="card">
            <div class="head"><CatIcon name="weight-dollar" size={22} /><b>Schulden</b><span>-150.00 €</span></div>
          </section>
        </div>
      {/if}

      <nav class="bottom">
        <span class="round add" class:expense={kind === 'month'} class:p={true} class:hl={focus.includes('add')}><Plus size={24} strokeWidth={2} /></span>
        <span class="pill" class:p={true} class:hl={focus.includes('pill')}>
          <ChevronLeft size={20} /><span class="label"><Calendar size={20} strokeWidth={1.6} />{kind === 'month' ? 'Oktober' : '2026'}</span><ChevronRight size={20} />
        </span>
      </nav>
      <span class="info" class:p={true} class:hl={focus.includes('info')}><Info size={22} strokeWidth={1.6} /></span>
    {:else if kind === 'entry'}
      <div class="modal expense">
        <h2><BanknoteArrowDown size={24} strokeWidth={1.6} />Ausgaben</h2>
        <h3><Plus size={19} strokeWidth={1.8} />Eintrag hinzufügen</h3>
        <div class="field"><Tag size={18} strokeWidth={1.7} /><b>Name</b><span>Rewe</span></div>
        <div class="field"><ChevronLeft size={20} /><b class="center">Di, 28.10.2026</b><ChevronRight size={20} /></div>
        <div class="field"><Euro size={18} strokeWidth={1.7} /><b>Preis</b><span>34.80 €</span></div>
        <div class="field block">
          <div class="line"><LayoutGrid size={18} strokeWidth={1.7} /><b>Art</b><span class="round tiny"><Plus size={14} strokeWidth={2} /></span><span class="muted">Gruppe <ChevronDown size={18} /></span></div>
          <div class="art">
            {#each expenses as c, i (c.name)}
              <span class="cat" class:on={i === 0}><CatIcon name={c.icon} size={20} /></span>
            {/each}
          </div>
          <p class="artname">Essen</p>
        </div>
        <div class="actions">
          <span class="round small"><X size={18} strokeWidth={2.2} /></span>
          <span class="round big expense"><Check size={22} strokeWidth={2.2} /></span>
        </div>
      </div>
    {:else}
      <div class="modal">
        <h2><SlidersHorizontal size={24} strokeWidth={1.6} />Settings</h2>
        <div class="row income"><BanknoteArrowUp size={18} strokeWidth={1.6} /><span>Einnahmen</span><RefreshCw size={20} strokeWidth={1.6} /></div>
        <div class="row expense"><Lock size={18} strokeWidth={1.6} /><span>Fixkosten</span><RefreshCw size={20} strokeWidth={1.6} /></div>
        <div class="row expense"><Sprout size={18} strokeWidth={1.6} /><span>Investments</span><RefreshCw size={20} strokeWidth={1.6} /></div>
        <div class="row"><Trash size={18} strokeWidth={1.6} /><span>Papierkorb</span><RefreshCw size={20} strokeWidth={1.6} /></div>
        <div class="row"><ToggleLeft size={18} strokeWidth={1.6} /><span>Modus</span><span class="mode on"><Sun size={17} strokeWidth={1.6} /></span><span class="mode"><Moon size={17} strokeWidth={1.6} /></span></div>
        <div class="row"><User size={18} strokeWidth={1.6} /><span>Profil: aron</span><LogOut size={20} strokeWidth={1.6} /></div>
        <div class="actions"><span class="round big"><Check size={22} strokeWidth={2.2} /></span></div>
      </div>
    {/if}
  </div>
</div>

<style>
  /* 375 × 660 phone screen shown at 0.46 */
  .frame {
    width: 176px;
    height: 312px;
    margin: 0 auto;
    border: 1.5px solid var(--frame);
    border-radius: 20px;
    overflow: hidden;
    background: var(--bg);
    flex: none;
  }
  .screen {
    position: relative;
    width: 375px;
    height: 666px;
    padding: 20px 20px 16px;
    transform: scale(0.4627);
    transform-origin: 0 0;
    display: flex;
    flex-direction: column;
    font-size: 16px;
    text-align: left;
    color: var(--text);
  }
  .p {
    transition: opacity 0.2s;
  }
  .dim .p:not(.hl) {
    opacity: 0.25;
  }
  .hl,
  .ring {
    outline: 4px solid var(--focus);
    outline-offset: 4px;
  }
  .ring {
    border-radius: 8px;
    outline-offset: 2px;
  }
  .top {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }
  .top > :last-child {
    justify-self: end;
  }
  .switch {
    justify-self: start;
    display: inline-flex;
    gap: 2px;
    height: 34px;
    padding: 2px;
    border: 1px solid var(--line);
    border-radius: 17px;
    background: var(--surface);
  }
  .switch > span {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1.5px solid transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
  }
  .switch > .on {
    border-color: var(--frame);
    color: var(--text);
  }
  .round {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 1px solid var(--line);
    background: var(--surface);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
  }
  .balance {
    display: flex;
    align-items: center;
    height: 34px;
    padding: 0 16px;
    border: 2px solid var(--frame);
    border-radius: 17px;
    font-size: 17px;
    font-weight: 600;
  }
  /* like the app: cards shrink to fit (the real ones scroll), the bottom bar stays visible */
  .cards {
    flex: 0 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .card {
    flex: none;
  }
  .card.expense {
    flex: 0 1 auto;
    min-height: 0;
    overflow: hidden;
  }
  .card {
    border: 1px solid var(--frame);
    border-radius: 22px;
    background: var(--surface);
    padding: 4px 14px 4px;
  }
  .card.income {
    border-color: var(--income);
    background: var(--income-bg);
  }
  .card.expense {
    border-color: var(--expense);
    background: var(--expense-bg);
    padding-bottom: 14px;
  }
  .head,
  .sub,
  .subhead {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .head {
    min-height: 44px;
  }
  .head b {
    flex: 1;
    font-size: 20px;
  }
  .head span {
    font-size: 17px;
  }
  .sub {
    min-height: 36px;
    margin-top: 8px;
    padding: 0 12px;
    border: 1px solid var(--line);
    border-radius: 20px;
    background: var(--surface);
  }
  .expense .sub {
    border-color: var(--expense-line);
  }
  .sub:first-of-type {
    margin-top: 2px;
  }
  .sub.opened {
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding-bottom: 9px;
  }
  .subhead {
    flex: 1;
    min-height: 36px;
  }
  .sub i,
  .subhead i {
    flex: 1;
    font-style: normal;
    font-weight: 500;
  }
  .sub > span,
  .subhead span {
    font-weight: 500;
  }
  .entry {
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 21px;
    font-size: 12.5px;
    font-weight: 600;
  }
  .entry em {
    flex: 1;
    font-style: normal;
    font-weight: 400;
    color: var(--muted);
  }
  .entry.month {
    justify-content: space-between;
  }
  .hint {
    text-align: center;
    font-size: 12.5px;
    color: var(--muted);
    line-height: 1.5;
    margin: 18px auto 0;
    padding: 0 6px;
  }
  .hint b {
    color: var(--text);
    font-weight: 600;
  }
  .bottom {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }
  .add {
    width: 40px;
    height: 40px;
    border: 1.5px solid var(--frame);
  }
  .add.expense {
    border-color: var(--expense);
  }
  .pill {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 40px;
    padding: 0 16px;
    border: 1px solid var(--line);
    border-radius: 20px;
    background: var(--surface);
  }
  .label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 130px;
    font-size: 17px;
    font-weight: 600;
  }
  .info {
    position: absolute;
    left: 20px;
    bottom: 21px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
  }
  .modal {
    margin: auto 0;
    border: 1px solid var(--frame);
    border-radius: 22px;
    box-shadow: var(--shadow);
    background: var(--surface);
    padding: 16px 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .modal.expense {
    border-color: var(--expense);
  }
  h2,
  h3 {
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  h2 {
    font-size: 20px;
  }
  h3 {
    font-size: 16px;
    font-weight: 600;
  }
  .field,
  .line {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .field {
    min-height: 38px;
    padding: 0 16px;
    border: 1px solid var(--expense-line);
    border-radius: 20px;
    font-size: 15px;
  }
  .field > span,
  .line > .muted {
    flex: 1;
    text-align: right;
  }
  .field b.center {
    flex: 1;
    text-align: center;
    font-size: 16px;
  }
  .field.block {
    flex-direction: column;
    align-items: stretch;
    padding: 8px 16px 12px;
    gap: 10px;
  }
  .muted {
    display: inline-flex;
    justify-content: flex-end;
    align-items: center;
    gap: 4px;
    color: var(--muted);
  }
  .art {
    display: flex;
    justify-content: center;
    gap: 14px;
  }
  .cat {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1px solid var(--line);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .cat.on {
    border: 2px solid var(--expense);
  }
  .artname {
    margin: -2px 0 0;
    text-align: center;
    font-size: 12px;
    color: var(--muted);
  }
  .actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 18px;
  }
  .small {
    width: 30px;
    height: 30px;
  }
  .tiny {
    width: 22px;
    height: 22px;
  }
  .big {
    width: 38px;
    height: 38px;
    border: 1.5px solid var(--frame);
  }
  .big.expense {
    border-color: var(--expense);
  }
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 38px;
    padding: 0 12px 0 16px;
    border: 1px solid var(--line);
    border-radius: 20px;
    font-weight: 600;
  }
  .row > span:not(.mode) {
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
