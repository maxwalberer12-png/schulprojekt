# ROADMAP.md – Schul-Assistent

## Projekt-Phasen

- [x] Phase 1: Grundgerüst & Auth mit Schul-Code (Registrierung/Login via Supabase)
- [x] Phase 2: Tool-Architektur (tools.config.ts für dynamische Kacheln)
- [x] Phase 3: Dashboard & Benutzeroberfläche (Kacheln, Filter, Zwei-Spalten-Layout)
- [x] Phase 4: KI-Backend & Streaming (/api/generate mit PII-Filter und Vercel AI SDK)
- [x] Phase 4b: Didaktischer Lehrplan-Abgleich (LehrplanPLUS Bayern) & Interaktiver A4-Arbeitsblatt-Editor
- [ ] Phase 5: Export-Funktionen (Word-Export .docx, erweiterte Archivierung)

---

## Phase 1: Grundgerüst & Auth ✅
**Status:** Abgeschlossen

### Umgesetzt:
- Next.js 14 (App Router, TypeScript, Tailwind CSS) initialisiert
- Supabase Browser- & Server-Client eingerichtet (`/lib/supabase/`)
- `.env.local.example` mit benötigten Variablen erstellt
- Login/Registrierungs-Seite unter `/login` implementiert
- Schul-Zugangscode-Validierung (Pilot-Code: `PILOT-2026`)
- Middleware zum Schutz der `/dashboard`-Route
- Placeholder-Dashboard-Seite

---

## Phase 2: Tool-Architektur ✅
**Status:** Abgeschlossen

### Umgesetzt:
- `tools.config.ts` mit typisierter Tool-Definition und 14 Grundschul-Tools
- Dynamische Kachel-Generierung aus Konfiguration
- Kategorien & Metadaten pro Tool

---

## Phase 3: Dashboard & Benutzeroberfläche ✅
**Status:** Abgeschlossen

### Umgesetzt:
- Vollständiges Dashboard-Layout mit Sidebar und Header
- Kachel-Raster mit Live-Suche und Kategorie-Filtern
- Detailansicht (`/dashboard/tool/[id]`) mit Zwei-Spalten-Layout
- Responsive Design für Desktop und Mobile

---

## Phase 4: KI-Backend & Streaming ✅
**Status:** Abgeschlossen

### Umgesetzt:
- Streaming Route Handler (`/api/generate`) mit Vercel AI SDK
- PII-Filter (`lib/pii-filter.ts`) zur DSGVO-konformen Maskierung von Schülernamen vor LLM-Aufruf
- Provider-Switch: Lokales Modell `qwen2.5:14b` via Ollama (`http://localhost:11434/api`) mit Fallback auf Mistral Cloud
- Steuerbarkeit über Umgebungsvariablen (`AI_PROVIDER`, `OLLAMA_MODEL`, `OLLAMA_BASE_URL`)
- Live-Streaming-UI in `ToolDetailClient.tsx` mit `react-markdown` und `remark-gfm`
- Abbrechen-Button für laufende Generierung, 1-Klick-Kopieren, Zeichen-/Wortzähler und Fehlerbehandlung mit Hinweisen

---

## Phase 4b: Didaktischer Lehrplan-Abgleich & Interaktiver A4-Editor ✅
**Status:** Abgeschlossen

### Umgesetzt:
- **LehrplanPLUS Bayern Datenbank (`lib/curriculum/lehrplanplus-grundschule.ts`):**
  * Verbindliche Grundschul-Operatoren (z. B. *nenne, ordne zu, beschreibe, begründe kurz, ergänze, berechne, vergleiche*)
  * Strikter Ausschluss von Sekundarstufen-Operatoren (*analysiere, erörtere, interpretiere, charakterisiere*)
  * Fachbegriffe & Kernkompetenzen nach LehrplanPLUS für Klassen 1 bis 4 (Deutsch, Mathematik, HSU)
  * Stufenspezifische Schreibhilfen & Lineatur-Empfehlungen (Lineatur 1–4, 5mm Karos, F-R-A-Schema)
- **Dynamische System-Prompt-Anbindung (`app/api/generate/route.ts`):**
  * Fach- und klassengerechte Leitplanken werden beim Generieren automatisch injiziert
  * Sachliche Titel und striktes Grundschulniveau gesichert
- **Interaktiver Inline-Editor (`components/ArbeitsblattPreview.tsx`):**
  * Direktes Bearbeiten aller Textbereiche (`contentEditable="true"` für Titel, Unterzeile, Aufgabenstellungen, Aufgabentexte, Wortspeicher, Lösungen)
  * Subtile `:focus`-Outlines und Hover-Zustände
  * Änderungen werden live direkt im A4-Drucklayout übernommen
- **Flexible Bild-Slots & Hover-Toolbar:**
  * 3 feste Positionen: Slot 1 (Header oben rechts), Slot 2 (neben Aufgabe 1), Slot 3 (Kasten unter Aufgabe 1/2)
  * Dezente Hover-Toolbar am Bild: `[ Nach oben | Nach unten | Ausblenden ]`
  * Toolbar-Schnellwahltasten & Reaktivierungs-Option
- **Layout-Schutz & A4-Druckoptimierung:**
  * Strikte Begrenzung auf genau 1 DIN-A4-Seite im Kompaktmodus
  * CSS-Klasse `.no-print` sowie `@media print` Bereinigung (keine Outlines/Toolbars beim PDF-Export)

---

## Phase 5: Export-Funktionen ⏳
**Status:** Teilweise umgesetzt (Druckansicht & 1-Klick-Kopieren aktiv)

### Geplant / Nächste Schritte:
- Word-Export (.docx)
- Erweiterte Archivierungs- und Exportformate
