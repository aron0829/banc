<script lang="ts">
  import {
    Calendar, ChevronLeft, ChevronRight, CircleCheck, House, Info, LayoutList, Plus, SlidersHorizontal, Sparkles, SquarePen, Wallet,
  } from '@lucide/svelte';
  import type { Component } from 'svelte';
  import { closePopup } from '../../lib/ui.svelte';
  import Modal from '../Modal.svelte';

  const steps: { icon: Component; title: string; text: string }[] = [
    {
      icon: Sparkles,
      title: 'Willkommen bei banc',
      text: 'Hier behältst du deine Einnahmen und Ausgaben Monat für Monat im Blick. Die nächsten Schritte zeigen dir kurz, was wo ist.',
    },
    {
      icon: Wallet,
      title: 'Bilanz',
      text: 'Oben in der Mitte steht die Bilanz des Monats: Einnahmen minus Ausgaben. Antippen bringt dich zurück zum aktuellen Monat.',
    },
    {
      icon: LayoutList,
      title: 'Einnahmen & Ausgaben',
      text: 'Die zwei Karten zeigen alles für den Monat. Tipp auf eine Karte, um zwischen ihnen zu wechseln. In den Ausgaben stecken Investments, Fixkosten und deine Kategorien – antippen klappt sie auf.',
    },
    {
      icon: Plus,
      title: 'Ausgabe eintragen',
      text: 'Mit dem + unten trägst du eine Ausgabe ein: Name (optional), Tag, Preis und Art. Unter den Karten siehst du, wie viel Prozent deiner Einnahmen schon verbraucht sind.',
    },
    {
      icon: SquarePen,
      title: 'Bearbeiten',
      text: 'Tipp auf einen Eintrag, um ihn zu ändern oder zu löschen. Halte eine Kategorie gedrückt, um Name und Icon zu ändern. Gelöschtes landet im Papierkorb.',
    },
    {
      icon: Calendar,
      title: 'Monate wechseln',
      text: 'Mit den Pfeilen in der Leiste unten blätterst du durch die Monate. Ein Tipp auf den Monatsnamen springt zurück zu heute.',
    },
    {
      icon: House,
      title: 'Übersicht',
      text: 'Das Haus oben links öffnet das Jahr: Bilanzen aller Monate (antippen springt hin), „Allgemein“ für Einmalposten und deine Schulden, die nicht zur Gesamtsumme zählen.',
    },
    {
      icon: SlidersHorizontal,
      title: 'Settings',
      text: 'Oben rechts legst du Wiederkehrendes an – Einnahmen, Fixkosten und Investments mit Zeitraum. Die werden jeden Monat automatisch eingetragen. Außerdem: Papierkorb, Hell/Dunkel und Abmelden.',
    },
    {
      icon: CircleCheck,
      title: 'Fertig',
      text: 'Das war’s! Über das kleine i unten links kannst du diese Einführung jederzeit wieder öffnen.',
    },
  ];

  let step = $state(0);
  const s = $derived(steps[step]);
  const last = $derived(step === steps.length - 1);

  function key(e: KeyboardEvent) {
    if (e.key === 'ArrowRight' && !last) step++;
    if (e.key === 'ArrowLeft' && step > 0) step--;
  }
</script>

<svelte:window onkeydown={key} />

<Modal title="Einführung" icon={Info} onClose={closePopup} onConfirm={closePopup}>
  <div class="step">
    {#key step}
      {@const I = s.icon}
      <span class="icon"><I size={26} strokeWidth={1.6} /></span>
      <h4>{s.title}</h4>
      <p>{s.text}</p>
    {/key}
  </div>
  <div class="nav">
    <button aria-label="Zurück" onclick={() => step--} disabled={step === 0}><ChevronLeft size={20} /></button>
    <div class="dots" aria-label="Schritt {step + 1} von {steps.length}">
      {#each steps as _, i (i)}
        <button class="dot" class:on={i === step} aria-label="Schritt {i + 1}" onclick={() => (step = i)}></button>
      {/each}
    </div>
    <button aria-label="Weiter" onclick={() => step++} disabled={last}><ChevronRight size={20} /></button>
  </div>
</Modal>

<style>
  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 8px;
    /* fits the longest step, so the popup doesn't jump while paging */
    min-height: 222px;
  }
  .icon {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: 1.5px solid var(--frame);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 4px;
  }
  h4 {
    margin: 4px 0 0;
    font-size: 16px;
    font-weight: 700;
  }
  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: var(--muted);
  }
  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .nav > button {
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .dots {
    display: flex;
    gap: 6px;
  }
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--line);
  }
  .dot.on {
    background: var(--text);
  }
</style>
