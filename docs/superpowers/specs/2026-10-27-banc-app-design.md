# banc – Spezifikation

Stand: 2026-10-27 · Designs: `Designideen/PNGs_01/*.png` (verbindlich für Aussehen)

## Ziel

Private Handy-Web-App für monatliche Einnahmen/Ausgaben. Ersetzt Arons Google-Sheet
(Monatstabs + Tab „Allgemein“). Läuft unter `https://banc.mercao.de`, zwei Profile (Aron, Merle),
Daten synchron zwischen Geräten.

## Architektur

- **Frontend:** Vite + Svelte 5 + TypeScript, als PWA installierbar (Manifest + Icon, kein Offline-Schreiben).
- **Daten:** Supabase (Free-Tier, Region eu-central-1). Eine Tabelle `profiles_data`:
  `user_id uuid PK → auth.users`, `data jsonb`, `version int`, `updated_at timestamptz`.
  Row Level Security: jeder Nutzer sieht/ändert nur seine Zeile.
- **Login:** Supabase Auth mit zwei Nutzern. Eingabe `p` (getrimmt, klein geschrieben) →
  E-Mail `<p>@banc.mercao.de`, Passwort `<p>` + fester Suffix (Supabase verlangt ≥ 6 Zeichen).
  Passwörter: `aron`, `merle` (Groß/Klein egal). Sitzung bleibt gespeichert, bis man abmeldet.
- **Speichern:** Ganzer Profil-Zustand als ein JSON-Dokument. Jede Änderung speichert sofort
  (entprellt ~400 ms) mit Versionsprüfung (`update … where version = v`). Konflikt (anderes Gerät war schneller) → neu
  laden, Hinweis „Auf anderem Gerät geändert – neu geladen“. Beim Zurückkehren in die App
  (Fenster-Fokus) wird neu geladen, falls keine Änderung offen ist.
- **Hosting:** GitHub Pages aus Repo `aron0829/banc` (öffentlich), Build via GitHub Actions bei
  jedem Push auf `main`. Domain `banc.mercao.de` per CNAME bei Strato → `aron0829.github.io`;
  `www.banc.mercao.de` ebenfalls CNAME. HTTPS durch GitHub.
- Keine Geheimnisse im Code: Supabase-URL + Publishable Key sind öffentlich gedacht; Schutz über RLS.

## Datenmodell (JSON pro Profil)

```ts
type Scope = 'income' | 'fixed' | 'invest' | 'expense' | 'overview';
interface Category { id; scope: Scope; name; icon: string; requiresGroup?: boolean; order: number; deleted?: boolean }
interface Group    { id; categoryId; name; deleted?: boolean }
interface Entry {
  id; categoryId; groupId?: string; name: string; amount: number /* Cent, mit Vorzeichen */;
  // wiederkehrend (income/fixed/invest):
  from?: 'YYYY-MM'; to?: 'YYYY-MM' | null /* null = Unbegrenzt */;
  // einmalig (expense/overview):
  date?: 'YYYY-MM-DD';
  deleted?: boolean; deletedAt?: string;
}
interface Data { categories: Category[]; groups: Group[]; entries: Entry[] }
```

Gruppen gibt es nur bei `expense` und `overview`. Bei `income/fixed/invest` ist die Kategorie die „Art“
(Gehalt, Wohnen, Crypto …).

**Startdaten** für ein neues Profil (Kategorien, Icons sinngemäß):
- income: Gehalt, Weitere · fixed: Wohnen, Handy, Abos, Versicherung, Weitere
- invest: Crypto, Aktien, Weiteres · expense: Essen, Shopping, Reisen, Weitere
- overview: Schulden (`requiresGroup`), Other

## Rechenregeln

Alle Beträge in Cent (Ganzzahlen), Anzeige `1128.00 €` (Punkt, zwei Nachkommastellen, wie im Design),
negative mit `-`.

Ein Eintrag ist **sichtbar**, wenn er, seine Kategorie und (falls vorhanden) seine Gruppe nicht gelöscht sind.

1. **Wiederkehrend aktiv im Monat M**: `from ≤ M` und (`to` ist null oder `M ≤ to`).
2. **Einnahmen(M)** = Σ aktive income-Einträge.
3. **Investments(M)**, **Fixkosten(M)** = Σ aktive invest- bzw. fixed-Einträge.
4. **Kategorie(M)** für expense = Σ Einträge mit `date` in M.
5. **Ausgaben(M)** = Investments + Fixkosten + Σ expense-Kategorien.
6. **Bilanz(M)** = Einnahmen − Ausgaben.
7. **Verbraucht %** = round(Ausgaben / Einnahmen × 100); bei Einnahmen = 0 wird der Hinweis ausgeblendet.
8. **Prognose** (nur aktueller Monat): `Investments + Fixkosten + variabel / heutigerTag × TageImMonat`.
   > Einnahmen → „Du erreichst dein Monatslimit voraussichtlich vorzeitig“, sonst
   „Du bleibst voraussichtlich im Limit“. Vergangene Monate: „Monat abgeschlossen“. Zukünftige: nur %.
9. **Übersicht Jahr J**
   - *Monate*: alle Monate von J, die ≤ aktueller Monat sind und mindestens einen Eintrag
     (wiederkehrend aktiv oder einmalig) haben; Wert = Bilanz(M). Summe = Σ Bilanzen.
   - *overview-Kategorien* (Schulden, Other, eigene): Σ Einträge mit `date` in J; Anzeige nach
     Gruppen (Gruppensumme + Einträge darunter), Einträge ohne Gruppe direkt.
   - *Eigenes Jahresergebnis(J)* = Σ Monate + Σ overview-Kategorien.
   - *Von Vorjahren*: Zeilen für jedes Jahr Y < J mit Eigenem Jahresergebnis ≠ 0, absteigend;
     Titel „Von 2025, …“ (bzw. „Von 2025“ bei nur einem Jahr). Summe = Σ.
   - **Σ Übersicht** = Eigenes Jahresergebnis(J) + Von Vorjahren.

## Screens & Bedienung

Farben: Einnahmen grün (`#6f9a8d`-Rand, helles Grün), Ausgaben lila (`#8e5f86`), neutral grau;
Löschen-Bestätigungen rot. Abgerundete Karten wie im Design, Hell- und Dunkelmodus.

- **Anmelden**: Karte mit Passwortfeld + ✓. Falsches Passwort → Feld rot + „Falsches Passwort“.
- **Monat** (Startscreen nach Login, aktueller Monat):
  - Oben links Home (→ Übersicht des Jahres), oben rechts Settings.
  - Oben Mitte nur wenn ≠ aktueller Monat: Pille „TT.MM.JJJJ  ±Bilanz(heute) €“, Tipp → aktueller Monat.
  - Einnahmen-Karte (Σ) und Ausgaben-Karte (Σ) als Akkordeon (eine offen).
    Einnahmen offen: Arten mit Einträgen „Name  Mon JJ – Mon JJ/Unlimited  Betrag“.
    Ausgaben offen: Unterkarten Investments, Fixkosten (je aufklappbar mit Arten/Einträgen),
    dann expense-Kategorien (aufklappbar mit Gruppen + Einträgen „Name  T. Mon  Betrag“).
  - Hinweis Monatslimit + „X % verbraucht“.
  - Unten: „+“ (neue Ausgabe, Datum vorbelegt: heute bzw. 1. des angezeigten Monats) und Pille „‹ 📅 Monat ›“
    (Monat ± 1, über Jahresgrenzen; bei anderem Jahr „Oktober 25“).
- **Übersicht (Home)**: oben links 📅 (→ Monat), oben Mitte „Home“, rechts Settings.
  Karte „Übersicht Σ“ mit Unterkarten Monate, overview-Kategorien, Von Vorjahren. Unten „+“ (neuer
  Übersicht-Eintrag) und „‹ 📅 Jahr ›“.
- **Eintrag-Popup (einmalig)** – Titel Ausgaben bzw. Übersicht J, „Eintrag hinzufügen/bearbeiten“:
  Name (optional), Datum mit ‹ › (Tag ±1, Tipp öffnet Datumsauswahl), Preis (Dezimal, Komma oder Punkt,
  in Übersicht auch negativ), Art (Kategorie-Icons + „+“ neue Kategorie), Gruppen-Dropdown rechts.
  ✕ / ✓ / 🗑 (nur beim Bearbeiten). Bei `requiresGroup` ohne Gruppe: ✓ deaktiviert, Hinweis
  „Bitte Gruppe wählen“. Ohne Kategorie keine Speicherung.
- **Gruppen-Auswahl**: „Aktuelle Gruppen“: „Keine Gruppe“ (fehlt bei requiresGroup), Gruppen mit ✓ und 🗑,
  „+“ → Gruppe hinzufügen (Name). Langes Drücken auf Gruppe → Gruppe bearbeiten (Name). 🗑 → rote
  Bestätigung „Gruppe löschen?“.
- **Kategorie hinzufügen/bearbeiten**: Name + Icon-Raster (~100 Icons, scrollbar), ✕ ✓ (🗑 beim Bearbeiten).
  Öffnet sich durch „+“ in einer Art-Zeile bzw. durch langes Drücken (≥ 500 ms) auf eine Kategorie
  (Monat, Übersicht, Popups, Settings).
- **Settings**: Einnahmen, Fixkosten, Investments, Papierkorb, Modus (☀/☾), „Profil: Name“ (↦ Abmelden).
- **Settings Einnahmen/Fixkosten/Investments**: Abschnitt „Veraltet“ (Einträge mit `to` < aktueller Monat,
  zugeklappt) und „Aktuell – Mon JJ“ (alle übrigen inkl. zukünftiger, Σ der im aktuellen Monat aktiven), beide
  als Akkordeon; Zeile „Art“ mit Kategorie-Icons + „+“. Tipp auf Art wählt sie vor; unten „+“ neuer Eintrag.
  Tipp auf Eintrag → Auswahl Bearbeiten / Hinzufügen (gleiche Art) / Löschen.
- **Eintrag-Popup (wiederkehrend)**: Name, Von (Monat), Bis (Monat oder Unbegrenzt), Preis, Art; ✕ ✓ 🗑.
  Bis < Von → ✓ deaktiviert.
- **Papierkorb**: gelöschte (bzw. durch gelöschte Gruppe/Kategorie versteckte) Einträge, nach Kategorie
  gruppiert, neueste zuerst. Gelöschte Kategorien/Gruppen ohne Einträge erscheinen als eigene Zeile.
  Tipp → „Eintrag wiederherstellen?“ → stellt Eintrag samt Gruppe und Kategorie wieder her.
  Kein endgültiges Löschen.
- **Listen**: max. 5 Zeilen pro Feld sichtbar, Rest scrollbar ohne sichtbare Scrollleiste.
- **Tippen** auf Einträge im Monat/Übersicht → direkt Bearbeiten-Popup (wiederkehrende → deren
  Settings-Popup). Löschen verschiebt immer in den Papierkorb.

## Fehlerfälle

- Kein Netz/Server beim Speichern → Hinweis „Nicht gespeichert – erneuter Versuch“, automatisch erneut
  (alle 5 s), Änderungen bleiben im Speicher der Seite.
- Ungültiger Betrag → ✓ deaktiviert.

## Tests

- Vitest-Unittests für die Rechenlogik (`calc.ts`), Datumshilfen und Betragsformat/-parser.
- Manuelle Prüfung im Browser (Handy-Breite) für alle Screens.

## Nicht enthalten (bewusst)

Offline-Schreiben, Export/Import, Diagramme, endgültiges Löschen, automatische Übernahme aus dem Google-Sheet.
