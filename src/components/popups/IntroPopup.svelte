<script lang="ts">
  import { ChevronLeft, ChevronRight, Info } from '@lucide/svelte';
  import { closePopup } from '../../lib/ui.svelte';
  import Modal from '../Modal.svelte';
  import IntroScreen, { type IntroKind, type IntroPart } from './IntroScreen.svelte';

  const steps: { title: string; text: string; kind?: IntroKind; focus?: IntroPart[]; open?: 'essen' }[] = [
    {
      title: 'Willkommen bei banc',
      text: 'Hier behältst du deine Einnahmen und Ausgaben Monat für Monat im Blick. Die nächsten Schritte zeigen dir, was wo ist.',
    },
    {
      title: 'Bilanz',
      text: 'Oben in der Mitte steht die Bilanz des Monats: Einnahmen minus Ausgaben. Antippen springt zum aktuellen Monat.',
      focus: ['balance'],
    },
    {
      title: 'Einnahmen & Ausgaben',
      text: 'Tipp auf eine Karte, um zwischen beiden zu wechseln. In den Ausgaben stecken Investments, Fixkosten und deine Kategorien – antippen klappt sie auf.',
      focus: ['income', 'expense'],
    },
    {
      title: 'Ausgabe eintragen',
      text: 'Mit dem + trägst du eine neue Ausgabe ein. Darüber siehst du, wie viel Prozent deiner Einnahmen schon verbraucht sind.',
      focus: ['add', 'hint'],
    },
    {
      title: 'Neuer Eintrag',
      text: 'Name (optional), Tag, Preis und Art wählen, dann mit ✓ speichern. Mit dem + neben „Art“ legst du eine neue Kategorie an.',
      kind: 'entry',
    },
    {
      title: 'Bearbeiten',
      text: 'Tipp auf einen Eintrag, um ihn zu ändern oder zu löschen. Halte eine Kategorie gedrückt, um Name und Icon zu ändern. Gelöschtes landet im Papierkorb.',
      focus: ['expense', 'entry'],
      open: 'essen',
    },
    {
      title: 'Monate wechseln',
      text: 'Mit den Pfeilen blätterst du durch die Monate. Ein Tipp auf den Monatsnamen springt zurück zu heute.',
      focus: ['pill'],
    },
    {
      title: 'Übersicht',
      text: 'Oben links wechselst du zwischen Übersicht (Haus) und Monat – oder wisch einfach nach rechts bzw. links. Die Übersicht zeigt das Jahr: Bilanzen aller Monate, „Allgemein“ für Einmalposten und deine Schulden, die nicht zur Gesamtsumme zählen.',
      kind: 'overview',
    },
    {
      title: 'Settings',
      text: 'Oben rechts legst du Wiederkehrendes an – Einnahmen, Fixkosten und Investments mit Zeitraum. Die landen jeden Monat automatisch in der Liste.',
      kind: 'settings',
    },
    {
      title: 'Fertig',
      text: 'Das war’s! Über das kleine i unten links kannst du diese Einführung jederzeit wieder öffnen.',
      focus: ['info'],
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
    <IntroScreen kind={s.kind} focus={s.focus} open={s.open} />
    <h4>{s.title}</h4>
    <p>{s.text}</p>
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
    gap: 6px;
  }
  h4 {
    margin: 8px 0 0;
    font-size: 16px;
    font-weight: 700;
  }
  p {
    width: 100%;
    margin: 0;
    /* fits the longest step, so the popup doesn't jump while paging */
    min-height: 84px;
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
