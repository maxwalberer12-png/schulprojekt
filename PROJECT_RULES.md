# PROJECT_RULES.md – Schul-Assistent

## 🎯 Projektziel
DSGVO-konforme KI-Web-App für Grundschullehrkräfte, die Arbeitsaufwand reduziert und dabei Datenschutz garantiert.

---

## 💰 Kosten-Regel (STRIKT)
**Ausschließlich Free Tiers** – kein Stripe, keine Paid-Plugins, kein Bezahlmodell.
Alle verwendeten Dienste müssen dauerhaft kostenlos nutzbar sein (Supabase Free, Vercel Free, etc.).
Für den Mathematik-Arbeitsblatt-Generator werden **100 % deterministische lokale TypeScript-Generatoren & SVGs** genutzt (spart LLM-Kosten und verhindert Mathe-Halluzinationen).

---

## 🛠 Tech-Stack
| Bereich            | Technologie                                        |
|--------------------|----------------------------------------------------|
| Framework          | Next.js 14 (App Router, TypeScript)                |
| Styling            | Tailwind CSS                                       |
| Icons              | Lucide-React + eigene deterministische Inline-SVGs |
| Auth & Datenbank   | Supabase (Region: **EU-Frankfurt / eu-central-1**) |
| Deployment         | Vercel (Free Tier)                                 |
| KI-Backend         | Vercel AI SDK + OpenRouter / kostenlose LLMs       |

---

## 👩‍🏫 Zielgruppe & Design-Prinzipien
**Zielgruppe:** Grundschullehrkräfte (nicht tech-affin, unter Zeitdruck)
- Design muss: extrem klar, aufgeräumt, barrierearm, vertrauenerweckend sein.
- Schriftart: gut lesbar (mindestens 16px Basis), genug Kontrast.
- Kein Dark-Mode-Zwang – helles, freundliches UI bevorzugt.
- Sprache der UI: **Deutsch**.

---

## 🔒 Datenschutz & DSGVO (NICHT VERHANDELBAR)
- **Kein Prompt-Logging im Backend** – Prompts werden NICHT in der Datenbank gespeichert.
- **PII-Filter vor LLM-Anfragen:** Alle Schülernamen und personenbezogenen Daten müssen automatisch anonymisiert werden, bevor ein Prompt an ein LLM gesendet wird.
- **Supabase-Region:** Immer EU-Frankfurt (`eu-central-1`) – keine US-Region!
- Keine Analytics-Tools, die personenbezogene Daten in Drittländer übertragen.

---

## 🚦 Modulare Arbeitsweise (STRIKT EINHALTEN)
- **Immer nur eine Phase** auf einmal implementieren.
- Vor dem Start der nächsten Phase **Test-Feedback abwarten**.
- Am Ende jeder Phase: Liste "Was du manuell tun musst" bereitstellen.

---

## 🔑 Schul-Zugangscode (Pilot)
- Pflichtfeld bei der Registrierung.
- Gültiger Code für den Piloten: **`PILOT-2026`**
- Bei falschem Code: Registrierung abbrechen, Fehlermeldung auf Deutsch:
  > *"Ungültiger Schul-Zugangscode. Bitte wende dich an deine Schulleitung."*

---

## 📁 Wichtige Dateien & Konventionen
- `.env.local` – Supabase-Keys (NICHT in Git committen, in `.gitignore` eintragen)
- `.env.local.example` – Vorlage für Keys (wird committet)
- Alle Routen unter `/app` (App Router)
- API-Routen unter `/app/api/`
- Wiederverwendbare Komponenten unter `/components/`
- Typen unter `/types/`

---

## 📐 ARCHITEKTUR-REGELN: MATHE-ARBEITSBLATT-GENERATOR (KLASSE 1–4)

### 1. Strikte Trennung: Thema (`topic`) vs. Aufgabentypen (`selectedTaskTypes`)
- **Kein Hardcoded-Override:** Das gewählte Lehrplan-Thema im Dropdown darf NIEMALS starr vordefinierte Sektionen auf dem Arbeitsblatt erzwingen und dabei die Chip-Auswahl ignorieren.
- **Funktion des Dropdowns (`topic`):** Bestimmt den mathematischen Zahlenraum (`maxNumber`: 10, 20, 100, 1000, 1000000), ob mit/ohne Übergang gerechnet wird, und setzt beim Themenwechsel einmalig die `defaultSelected`-Chips.
- **Funktion der Chips (`selectedTaskTypes`):** Das generierte Arbeitsblatt rendert zu 100 % exakt die Sektionen der aktuell blau aktivierten Chips in deren Reihenfolge (`1.`, `2.`, `3.`).

### 2. UI-Regel für Aufgabentyp-Chips: NIEMALS ausgrauen (`filter` statt `disabled`)
- Im Bereich "Aufgabentypen (Mathematik)" dürfen **keine ausgegrauten (`disabled` / `opacity-50`) Buttons** existieren!
- Es werden im DOM ausschließlich diejenigen Chips gerendert, die laut untenstehender LehrplanPLUS-Matrix zum aktuell gewählten `topic` gehören.
- Jeder sichtbare Chip ist sofort anklickbar:
  - **Blau mit `✓`:** Aktiv (wird auf dem Arbeitsblatt gerendert).
  - **Weiß mit `+`:** Inaktiv, gehört aber zum Thema und ist jederzeit per Klick zuschaltbar.

### 3. Mathematische & Didaktische Standards (100 % Deterministisch)
- **Keine KI-Halluzinationen:** Alle Rechenaufgaben, Zahlenräume und Geometrie-/Größen-Grafiken werden deterministisch berechnet.
- **Deutsche Schulbuch-Notation:** Multiplikation immer mit Mittelpunkt `·` (niemals `*` oder `x`), Division immer mit `:` (niemals `/`), Dezimalzahlen mit Komma (`12,50 €`).
- **Eingabefelder:** Kinder tragen Lösungen immer in saubere, gestrichelte Kästchen ein (keine Text-Unterstriche `____`).
- **Modi & Print:** Jede SVG- und Aufgaben-Komponente unterstützt `colorMode` (`"color"` | `"bw"`), `showSolutions` (`boolean`) und passt sauber auf das DIN-A4-Drucklayout.

---

## 📚 VERBINDLICHE LEHRPLANPLUS BAYERN MATRIX (MATHEMATIK KLASSE 1–4)

Jedes Thema zeigt in der UI **ausschließlich** die hier gelisteten Chips an:

### 🟢 1. KLASSE (Zahlenraum bis 10 & 20)
1. **Zahlenraum bis 10: Zahlzerlegung & Verliebte Zahlen**
   - *Chips:* `Schüttelboxen (Zahlzerlegung)`, `Rechenhäuser`, `Zwanzigerfeld / Punktefeld`, `Kopfrechnen / Grundrechenarten`, `Zahlenmauern`, `Rechendreiecke`
2. **Zahlenraum bis 10: Addition und Subtraktion**
   - *Chips:* `Kopfrechnen / Grundrechenarten`, `Zwanzigerfeld / Punktefeld`, `Tausch- & Umkehraufgaben`, `Rechendreiecke`, `Zahlenmauern`, `Größer/Kleiner/Gleich (< > =)`, `Text-/Sachaufgaben (Rechengeschichten)`
3. **Zahlenraum bis 20: Vorgänger, Nachfolger & Zahlenstrahl**
   - *Chips:* `Nachbarzahlen & Zahlenstrahl`, `Größer/Kleiner/Gleich (< > =)`, `Zwanzigerfeld / Punktefeld`, `Zahlenfolgen & Zahlen ordnen`
4. **Zahlenraum bis 20: Ohne Zehnerübergang**
   - *Chips:* `Kopfrechnen / Grundrechenarten`, `Analogieaufgaben (Zwerg & Riese)`, `Zwanzigerfeld / Punktefeld`, `Tausch- & Umkehraufgaben`, `Zahlenmauern`, `Rechendreiecke`, `Text-/Sachaufgaben (Rechengeschichten)`
5. **Zahlenraum bis 20: Verdoppeln und Halbieren**
   - *Chips:* `Verdoppeln & Halbieren (Tabellen/Spiegel)`, `Kopfrechnen / Grundrechenarten`, `Zwanzigerfeld / Punktefeld`, `Rechenhäuser`, `Text-/Sachaufgaben (Rechengeschichten)`
6. **Zahlenraum bis 20: Mit Zehnerübergang**
   - *Chips:* `Zehnerstopp (Rechnen in 2 Schritten)`, `Zwanzigerfeld / Punktefeld`, `Kopfrechnen / Grundrechenarten`, `Zahlenmauern`, `Rechendreiecke`, `Rechenhäuser`, `Text-/Sachaufgaben (Rechengeschichten)`
7. **Geometrie: Raumorientierung & Lagebeziehungen**
   - *Chips:* `3x3-Gitter (links, rechts, oben, unten)`, `Richtungspfeile zählen`, `Formen nach Anweisung zeichnen`
8. **Geometrie: Ebene Formen & Muster**
   - *Chips:* `Grundformen erkennen & zählen`, `Geometrische Musterreihen fortsetzen`, `Figuren & Spiegelbilder am Punktgitter`
9. **Größen: Euro und Cent (bis 20 €)**
   - *Chips:* `Münzen & Scheine zählen`, `Rechnen mit Geld (€ & ct)`, `Geldbeträge vergleichen & Rückgeld`
10. **Größen: Zeit & Uhrzeit (volle Stunden, Wochentage)**
    - *Chips:* `Analoge Uhren ablesen (volle Stunden)`, `Stundenzeiger einzeichnen`, `Zeitspannen & Wochentage`
11. **Daten & Zufall: Strichlisten & einfache Häufigkeiten**
    - *Chips:* `Strichlisten ablesen (5er-Bündel)`, `Strichlisten selbst zeichnen`, `Objekte zählen & Häufigkeitstabelle`

---

### 🔵 2. KLASSE (Zahlenraum bis 100 & Kleines 1x1)
1. **Zahlenraum bis 100: Hunderterfeld, Zehner & Einer**
   - *Chips:* `Hundertertafel & Zahlenkreuz`, `Hunderterfeld (Punktefeld 10x10)`, `Zehnerstangen & Einerwürfel (Bündeln)`, `Stellenwerttafel (Z/E) & Ergänzen auf 100`, `Nachbarzahlen & Zahlenstrahl (ZR 100)`, `Größer/Kleiner/Gleich (< > =)`, `Zahlenfolgen & Zahlen ordnen`
2. **Zahlenraum bis 100: Addition & Subtraktion**
   - *Chips:* `Halbschriftliches Rechnen (in Schritten)`, `Kopfrechnen (ZR 100)`, `Zahlenmauern`, `Rechendreiecke`, `Tausch- & Umkehraufgaben`, `Text-/Sachaufgaben`
3. **Kleines 1x1: Kernaufgaben (2er, 5er, 10er Reihe)**
   - *Chips:* `1x1 Punktefelder (Plus- & Malaufgabe)`, `Einmaleins-Reihen & Kopfrechnen`, `Tausch- & Umkehraufgaben (1x1)`, `Rechendreiecke`, `Text-/Sachaufgaben`
4. **Kleines 1x1: Alle Reihen & Division (ohne Rest)**
   - *Chips:* `Einmaleins-Reihen & Kopfrechnen`, `Geteilt-Aufgaben (Division)`, `Tausch- & Umkehraufgaben (Aufgabenfamilien)`, `1x1 Punktefelder (Plus- & Malaufgabe)`, `Division mit Rest (Einführung)`, `Text-/Sachaufgaben`
5. **Geometrie: Körperformen (Würfel, Quader, Kugel) & Symmetrie**
   - *Chips:* `Geometrische Körper (Steckbriefe: Ecken, Kanten, Flächen)`, `Achsensymmetrie (Spiegelbilder am Gitter)`, `Körpernetze & Würfelgebäude`
6. **Größen: Längen (Meter und Zentimeter)**
   - *Chips:* `Strecken mit dem Lineal messen (cm)`, `Längen umrechnen (m & cm)`, `Längen vergleichen & berechnen`, `Text-/Sachaufgaben`
7. **Größen: Geld mit Komma (€ & ct bis 100 €)**
   - *Chips:* `Geldbeträge in Kommaschreibweise`, `Rechnen mit Geld & Rückgeld (Kassenbon)`, `Geldbeträge vergleichen (< > =)`, `Text-/Sachaufgaben`
8. **Größen: Zeit (Stunde und Minute, analog & digital)**
   - *Chips:* `Uhrzeiten ablesen (Viertel, Halb, 5-Minuten)`, `Zeiger einzeichnen (Stunde & Minute)`, `Zeitspannen & Zeitdauer berechnen`, `Kalender & Datum lesen`
9. **Daten & Zufall: Tabellen, Steckbriefe & einfache Diagramme**
   - *Chips:* `Säulendiagramm / Balkendiagramm ablesen`, `Tabellen & Strichlisten auswerten`, `Kombinatorik & Zufallsexperimente`

---

### 🟠 3. KLASSE (Zahlenraum bis 1.000 & Schriftliches Rechnen +/-)
1. **Zahlenraum bis 1.000: Stellenwerte (H-Z-E) & Zahlenstrahl**
   - *Chips:* `Stellenwerttafel (H | Z | E) & Zahlwörter`, `Tausenderbuch & Hunderterplatten (Dienes)`, `Nachbarzahlen (Vorgänger, Nachbarzehner, Nachbarhunderter)`, `Zahlenstrahl bis 1.000`, `Runden auf Zehner und Hunderter`, `Größer/Kleiner/Gleich & Zahlen ordnen`
2. **Zahlenraum bis 1.000: Halbschriftliches Rechnen & Kopfrechnen**
   - *Chips:* `Halbschriftliche Addition & Subtraktion (ZR 1.000)`, `Kopfrechnen mit Hundertern & Zehnern`, `Zahlenmauern & Rechendreiecke (ZR 1.000)`, `Text-/Sachaufgaben`
3. **Schriftliche Addition & Subtraktion (mit Übertrag)**
   - *Chips:* `Schriftliche Addition (im Kästchenraster)`, `Schriftliche Subtraktion (im Kästchenraster)`, `Fehlende Ziffern in schriftlichen Aufgaben`, `Überschlagsrechnung & Kontrolle`, `Text-/Sachaufgaben`
4. **Zehner-Einmaleins: Halbschriftliche Multiplikation & Division**
   - *Chips:* `Zehner-Einmaleins (z.B. 4 · 60, 240 : 6)`, `Halbschriftliche Multiplikation (in Schritten)`, `Halbschriftliche Division (mit und ohne Rest)`, `Text-/Sachaufgaben`
5. **Geometrie: Körpernetze, Würfelgebäude & Symmetrie**
   - *Chips:* `Würfelnetze & Quadernetze erkennen`, `Würfelgebäude & Baupläne (Wie viele Würfel?)`, `Achsensymmetrie (am Gitternetz)`, `Rechte Winkel & Parallele Linien`
6. **Größen: Längen (mm, cm, m, km)**
   - *Chips:* `Einheiten umrechnen (mm, cm, m, km)`, `Kommaschreibweise bei Längen (z.B. 1,45 m)`, `Rechnen mit Längen`, `Text-/Sachaufgaben`
7. **Größen: Gewichte (g, kg, t) & Hohlmaße (ml, l)**
   - *Chips:* `Gewichte umrechnen & bis 1 kg ergänzen (g, kg, t)`, `Waagen ablesen & Gewichte vergleichen`, `Hohlmaße umrechnen & Messbecher ablesen (ml, l)`, `Text-/Sachaufgaben`
8. **Größen: Zeitspannen, Zeitpunkt & Geld (Kommaschreibweise)**
   - *Chips:* `Zeitpunkt & Zeitdauer berechnen`, `Zeiteinheiten umrechnen (s, min, h)`, `Schriftliches Rechnen mit Geldbeträgen (€ mit Komma)`, `Text-/Sachaufgaben`
9. **Daten & Zufall: Diagramme, Wahrscheinlichkeit & Kombinatorik**
   - *Chips:* `Balken- & Säulendiagramme auswerten`, `Wahrscheinlichkeit (sicher, möglich, unmöglich)`, `Kombinatorik (Baumdiagramm / Möglichkeiten)`

---

### 🔴 4. KLASSE (Zahlenraum bis 1.000.000 & Schriftliches Mal/Geteilt)
1. **Zahlenraum bis 1.000.000: Stellenwerttafel & Runden**
   - *Chips:* `Stellenwerttafel (M | HT | ZT | T | H | Z | E) & Zahlwörter`, `Nachbarzahlen (Nachbartausender, Nachbarzehntausender)`, `Zahlenstrahl & Zahlen ordnen (bis 1.000.000)`, `Runden auf T, ZT, HT`, `Größer/Kleiner/Gleich (< > =)`
2. **Zahlenraum bis 1.000.000: Addition & Subtraktion (Mündlich & Schriftlich)**
   - *Chips:* `Schriftliche Addition & Subtraktion (große Zahlen)`, `Kopfrechnen & Halbschriftlich bis 1.000.000`, `Überschlagsrechnung`, `Text-/Sachaufgaben`
3. **Schriftliche Multiplikation (ein- und mehrstellig)**
   - *Chips:* `Schriftliche Multiplikation (mit 1-stelligem Faktor)`, `Schriftliche Multiplikation (mit Zehner- & 2-stelligem Faktor)`, `Überschlagsrechnung & Fehlende Ziffern`, `Text-/Sachaufgaben`
4. **Schriftliche Division (ein- und zweistellig, mit/ohne Rest)**
   - *Chips:* `Schriftliche Division durch 1-stellige Zahl (Treppenform)`, `Schriftliche Division mit Rest & Probe`, `Division durch Zehnerzahlen`, `Text-/Sachaufgaben`
5. **Geometrie: Umfang & Flächeninhalt, Maßstab, Drehsymmetrie, Kreis**
   - *Chips:* `Umfang & Flächeninhalt am Karogitter (Rechteck & Quadrat)`, `Maßstab berechnen & zeichnen (z.B. 1:100)`, `Kreise zeichnen (Radius r & Durchmesser d)`, `Körperansichten & Drehsymmetrie`
6. **Größen: Alle Einheiten, Kommaschreibweise & Bruchteile von Größen**
   - *Chips:* `Bruchteile von Größen (1/2, 1/4, 3/4 von km, kg, l, h)`, `Einheiten umrechnen (Kommaschreibweise: km/m, t/kg/g, l/ml)`, `Mehrschrittige Sachaufgaben`
7. **Daten & Zufall: Komplexe Diagramme, Durchschnitt & Zufall**
   - *Chips:* `Säulen- & Kreisdiagramme lesen und vergleichen`, `Durchschnitt (Mittelwert) & Tabellen berechnen`, `Zufallsexperimente (Glücksrad / Würfel-Chancen)`


## 🎯 VERBINDLICHE ARCHITEKTUR- & UI-REGELN (MATHEMATIK KLASSE 1–4)

### 1. Strikte Trennung: Thema (`topic`) vs. Aufgabentypen (`selectedTaskTypes`)
- **Kein Hardcoded-Override:** Das gewählte Lehrplan-Thema im Dropdown darf NIEMALS starr vordefinierte Sektionen auf dem Arbeitsblatt erzwingen und dabei die Chip-Auswahl ignorieren.
- **Funktion des Dropdowns (`topic`):** Bestimmt den mathematischen Zahlenraum (`maxNumber`: 10, 20, 100, 1000, 1000000), ob mit/ohne Übergang gerechnet wird, und setzt beim Themenwechsel einmalig die `defaultSelected`-Chips.
- **Funktion der Chips (`selectedTaskTypes`):** Das generierte Arbeitsblatt rendert zu 100 % exakt die Sektionen der aktuell blau aktivierten Chips in deren Reihenfolge (`1.`, `2.`, `3.`).

### 2. UI-Regel für Aufgabentyp-Chips: NIEMALS ausgrauen (`filter` statt `disabled`)
- Im Bereich "Aufgabentypen (Mathematik)" dürfen **keine ausgegrauten (`disabled` / `opacity-50`) Buttons** existieren!
- Es werden im DOM ausschließlich diejenigen Chips gerendert, die laut untenstehender LehrplanPLUS-Matrix zum aktuell gewählten `topic` gehören.
- Jeder sichtbare Chip ist sofort anklickbar (Blau mit `✓` = aktiv auf dem Blatt | Weiß mit `+` = inaktiv, aber jederzeit zuschaltbar).

### 3. Mathematische & Didaktische Grundregeln (100 % Deterministisch)
- **Keine KI-Halluzinationen bei Mathe & SVGs:** Alle Rechenaufgaben, Zahlenräume und Geometrie-/Größen-Grafiken werden über deterministische TypeScript-Funktionen und präzise SVG-Komponenten berechnet.
- **Deutsche Schulbuch-Notation:** Multiplikation immer mit Mittelpunkt `·` (niemals `*` oder `x`), Division immer mit `:` (niemals `/`), Dezimalzahlen mit Komma (`12,50 €`).
- **Eingabefelder:** Kinder tragen Lösungen immer in saubere, gestrichelte Kästchen ein (keine reinen Text-Unterstriche `____`).
### 4. Granulare Aufgabenanzahl pro Aufgabentyp-Chip (Kein globales Feld)
- **Kein globales Eingabefeld:** Es gibt kein globales Eingabefeld "Anzahl Aufgaben pro Niveau" in der linken Sidebar.
- **Lokale Steuerung am Chip:** Jeder aktive Chip (blau mit `✓`) besitzt direkt einen dezenten Stepper `[- 3 +]` (Bereich: 1 bis 5 Aufgaben).
- **Default & Reset:** Neu aktivierte Chips starten immer standardmäßig mit `3` Aufgaben. Beim Abwählen eines Chips wird dessen Zähler zurückgesetzt.

### 5. Strikte Vermeidung statischer Zahlen (100 % Randomisierung)
- **Keine hardcodierten Testzahlen:** Niemals feste Beispielzahlen, statische Beispielaufgaben (z. B. `47 + 28 = 75`) oder feste Tabellen-/Kreuzmitten (z. B. Hundertertafel-Ausschnitte mit `62`) im Code ablegen. Alle Zahlen werden durch mathematisch fundierte Zufalls-Algorithmen berechnet.
- **Mathematische Bedingungen einhalten:**
  - Addition/Subtraktion im ZR 100 oder 1000 werden je nach gewähltem Modus (mit oder ohne Zehnerübergang) dynamisch berechnet.
  - Schriftliche Subtraktion im Rechenkästchen-Gitter garantiert immer strikt `obere Zahl > untere Zahl` (`n1 > n2`).
  - Sach- und Textaufgaben permutieren Zufallsnamen (Anna, Ben, Mia etc.), Objekte und Beträge aus Arrays.
- **Frisches Blatt bei jedem Klick:** Jedes Generieren oder Anpassen eines Parameters berechnet einen komplett neuen Satz Zufallsaufgaben ohne Wiederholungen.

### 6. Dynamische Spalten für SVG- und Aufgaben-Container (1 bis 5 Aufgaben)
- **Keine starren 3er-Limits:** Container für Schüttelboxen, Rechenhäuser, Rechendreiecke, Zahlenmauern, Geometrie-Punktgitter und Aufgabenfamilien dürfen nicht starr auf 3 Spalten begrenzt sein.
- **Flexible Anordnung:** Aufgabenanzahlen von 1 bis 5 werden dynamisch und ästhetisch arrangiert (z. B. 1 zentriert, 2 als 2er-Grid, 3 als 3er-Grid, 4 als 4er-Grid oder 2x2, 5 als sauber umbrechendes Flex-Layout mit Zentrierung).

### 7. Automatisches DIN-A4 Druck- & 2-Seiten-Layout
- **Layout-Optionen:**
  - `1 DIN-A4-Seite (Kompakt)`: Maximal 4 Aufgabenblöcke, kompaktes Spacing, garantiert passend auf genau 1 DIN-A4-Blatt.
  - `2 Seiten (Ausführlich)`: Alle ausgewählten Aufgaben werden ausgewogen (`Math.ceil(tasks.length / 2)`) auf 2 vollwertige DIN-A4-Seiten aufgeteilt.
- **Seitenstruktur & Umbruch:**
  - Jede Seite besitzt eigene Kopfzeilen (Seite 2 mit Fortsetzungs-Hinweis und Schüler-Namensfeld) und genaue Seitenzahlen ("Seite 1 von 2" / "Seite 2 von 2").
  - CSS-Print-Regeln (`.print-page-break` mit `page-break-before: always`, `.task-block` mit `break-inside: avoid` / `page-break-inside: avoid`) verhindern unkontrolliertes Überlängen oder Zerschneiden von Aufgabenblöcken im Druck.
  - Das Lösungsblatt teilt sich analog im 2-Seiten-Modus auf 2 Seiten auf und trennt sich beim kombinierten Druck ("Beide drucken") mit sauberem Seitenumbruch vom Schülerblatt.

---

## 📚 VOLLSTÄNDIGE LEHRPLANPLUS BAYERN MATRIX (KLASSE 1–4)

Jedes Thema zeigt in der UI **ausschließlich** die hier gelisteten Chips an:

### 🟢 KLASSE 1 (Zahlenraum bis 10 & 20)
1. **Zahlenraum bis 10: Zahlzerlegung & Verliebte Zahlen**
   - *Chips:* `Schüttelboxen (Zahlzerlegung)`, `Rechenhäuser`, `Zwanzigerfeld / Punktefeld`, `Kopfrechnen / Grundrechenarten`, `Zahlenmauern`, `Rechendreiecke`
2. **Zahlenraum bis 10: Addition und Subtraktion**
   - *Chips:* `Kopfrechnen / Grundrechenarten`, `Zwanzigerfeld / Punktefeld`, `Tausch- & Umkehraufgaben`, `Rechendreiecke`, `Zahlenmauern`, `Größer/Kleiner/Gleich (< > =)`, `Text-/Sachaufgaben (Rechengeschichten)`
3. **Zahlenraum bis 20: Vorgänger, Nachfolger & Zahlenstrahl**
   - *Chips:* `Nachbarzahlen & Zahlenstrahl`, `Größer/Kleiner/Gleich (< > =)`, `Zwanzigerfeld / Punktefeld`, `Zahlenfolgen & Zahlen ordnen`
4. **Zahlenraum bis 20: Ohne Zehnerübergang**
   - *Chips:* `Kopfrechnen / Grundrechenarten`, `Analogieaufgaben (Zwerg & Riese)`, `Zwanzigerfeld / Punktefeld`, `Tausch- & Umkehraufgaben`, `Zahlenmauern`, `Rechendreiecke`, `Text-/Sachaufgaben (Rechengeschichten)`
5. **Zahlenraum bis 20: Verdoppeln und Halbieren**
   - *Chips:* `Verdoppeln & Halbieren (Tabellen/Spiegel)`, `Kopfrechnen / Grundrechenarten`, `Zwanzigerfeld / Punktefeld`, `Rechenhäuser`, `Text-/Sachaufgaben (Rechengeschichten)`
6. **Zahlenraum bis 20: Mit Zehnerübergang**
   - *Chips:* `Zehnerstopp (Rechnen in 2 Schritten)`, `Zwanzigerfeld / Punktefeld`, `Kopfrechnen / Grundrechenarten`, `Zahlenmauern`, `Rechendreiecke`, `Rechenhäuser`, `Text-/Sachaufgaben (Rechengeschichten)`
7. **Geometrie: Raumorientierung & Lagebeziehungen**
   - *Chips:* `3x3-Gitter (links, rechts, oben, unten)`, `Richtungspfeile zählen`, `Formen nach Anweisung zeichnen`
8. **Geometrie: Ebene Formen & Muster**
   - *Chips:* `Grundformen erkennen & zählen`, `Geometrische Musterreihen fortsetzen`, `Figuren & Spiegelbilder am Punktgitter`
9. **Größen: Euro und Cent (bis 20 €)**
   - *Chips:* `Münzen & Scheine zählen`, `Rechnen mit Geld (€ & ct)`, `Geldbeträge vergleichen & Rückgeld`
10. **Größen: Zeit & Uhrzeit (volle Stunden, Wochentage)**
    - *Chips:* `Analoge Uhren ablesen (volle Stunden)`, `Stundenzeiger einzeichnen`, `Zeitspannen & Wochentage (Gestern-Heute-Morgen)`
11. **Daten & Zufall: Strichlisten & einfache Häufigkeiten**
    - *Chips:* `Strichlisten ablesen (5er-Bündel)`, `Strichlisten selbst zeichnen`, `Objekte zählen & Häufigkeitstabelle`

---

### 🔵 KLASSE 2 (Zahlenraum bis 100 & Kleines 1x1)
1. **Zahlenraum bis 100: Hunderterfeld, Zehner & Einer**
   - *Chips:* `Hundertertafel & Zahlenkreuz`, `Hunderterfeld (Punktefeld 10x10)`, `Zehnerstangen & Einerwürfel (Bündeln)`, `Stellenwerttafel (Z/E) & Ergänzen auf 100`, `Nachbarzahlen & Zahlenstrahl (ZR 100)`, `Größer/Kleiner/Gleich (< > =)`, `Zahlenfolgen & Zahlen ordnen`
2. **Zahlenraum bis 100: Addition & Subtraktion**
   - *Chips:* `Halbschriftliches Rechnen (in Schritten)`, `Kopfrechnen (ZR 100)`, `Zahlenmauern`, `Rechendreiecke`, `Tausch- & Umkehraufgaben`, `Text-/Sachaufgaben`
3. **Kleines 1x1: Kernaufgaben (2er, 5er, 10er Reihe)**
   - *Chips:* `1x1 Punktefelder (Plus- & Malaufgabe)`, `Einmaleins-Reihen & Kopfrechnen`, `Tausch- & Umkehraufgaben (1x1)`, `Rechendreiecke`, `Text-/Sachaufgaben`
4. **Kleines 1x1: Alle Reihen & Division (ohne Rest)**
   - *Chips:* `Einmaleins-Reihen & Kopfrechnen`, `Geteilt-Aufgaben (Division)`, `Tausch- & Umkehraufgaben (Aufgabenfamilien)`, `1x1 Punktefelder (Plus- & Malaufgabe)`, `Division mit Rest (Einführung)`, `Text-/Sachaufgaben`
5. **Geometrie: Körperformen (Würfel, Quader, Kugel) & Symmetrie**
   - *Chips:* `Geometrische Körper (Steckbriefe: Ecken, Kanten, Flächen)`, `Achsensymmetrie (Spiegelbilder am Gitter)`, `Körpernetze & Würfelgebäude`
6. **Größen: Längen (Meter und Zentimeter)**
   - *Chips:* `Strecken mit dem Lineal messen (cm)`, `Längen umrechnen (m & cm)`, `Längen vergleichen & berechnen`, `Text-/Sachaufgaben`
7. **Größen: Geld mit Komma (€ & ct bis 100 €)**
   - *Chips:* `Geldbeträge in Kommaschreibweise`, `Rechnen mit Geld & Rückgeld (Kassenbon)`, `Geldbeträge vergleichen (< > =)`, `Text-/Sachaufgaben`
8. **Größen: Zeit (Stunde und Minute, analog & digital)**
   - *Chips:* `Uhrzeiten ablesen (Viertel, Halb, 5-Minuten)`, `Zeiger einzeichnen (Stunde & Minute)`, `Zeitspannen & Zeitdauer berechnen`, `Kalender & Datum lesen`
9. **Daten & Zufall: Tabellen, Steckbriefe & einfache Diagramme**
   - *Chips:* `Säulendiagramm / Balkendiagramm ablesen`, `Tabellen & Strichlisten auswerten`, `Kombinatorik & Zufallsexperimente`

---

### 🟠 KLASSE 3 (Zahlenraum bis 1.000 & Schriftliches Rechnen +/-)
1. **Zahlenraum bis 1.000: Stellenwerte (H-Z-E) & Zahlenstrahl**
   - *Chips:* `Stellenwerttafel (H | Z | E) & Zahlwörter`, `Tausenderbuch & Hunderterplatten (Dienes)`, `Nachbarzahlen (Vorgänger, Nachbarzehner, Nachbarhunderter)`, `Zahlenstrahl bis 1.000`, `Runden auf Zehner und Hunderter`, `Größer/Kleiner/Gleich & Zahlen ordnen`
2. **Zahlenraum bis 1.000: Halbschriftliches Rechnen & Kopfrechnen**
   - *Chips:* `Halbschriftliche Addition & Subtraktion (ZR 1.000)`, `Kopfrechnen mit Hundertern & Zehnern`, `Zahlenmauern & Rechendreiecke (ZR 1.000)`, `Text-/Sachaufgaben`
3. **Schriftliche Addition & Subtraktion (mit Übertrag)**
   - *Chips:* `Schriftliche Addition (im Kästchenraster)`, `Schriftliche Subtraktion (im Kästchenraster)`, `Fehlende Ziffern in schriftlichen Aufgaben (Kleckse)`, `Überschlagsrechnung & Kontrolle`, `Text-/Sachaufgaben`
4. **Zehner-Einmaleins: Halbschriftliche Multiplikation & Division**
   - *Chips:* `Zehner-Einmaleins (z.B. 4 · 60, 240 : 6)`, `Halbschriftliche Multiplikation (Mal-Kreuz / Schritte)`, `Halbschriftliche Division (mit und ohne Rest)`, `Text-/Sachaufgaben`
5. **Geometrie: Körpernetze, Würfelgebäude & Symmetrie**
   - *Chips:* `Würfelnetze & Quadernetze erkennen`, `Würfelgebäude & Baupläne (Wie viele Würfel?)`, `Achsensymmetrie (auch schräge Spiegelachsen)`, `Rechte Winkel & Parallele Linien (Geodreieck)`
6. **Größen: Längen (mm, cm, m, km)**
   - *Chips:* `Einheiten umrechnen (mm, cm, m, km)`, `Kommaschreibweise bei Längen (z.B. 1,45 m)`, `Rechnen mit Längen & Maßstab-Vorstufe`, `Text-/Sachaufgaben`
7. **Größen: Gewichte (g, kg, t) & Hohlmaße (ml, l)**
   - *Chips:* `Gewichte umrechnen & bis 1 kg ergänzen (g, kg, t)`, `Waagen ablesen & Gewichte vergleichen`, `Hohlmaße umrechnen & Messbecher ablesen (ml, l)`, `Text-/Sachaufgaben`
8. **Größen: Zeitspannen, Zeitpunkt & Geld (Kommaschreibweise)**
   - *Chips:* `Zeitpunkt & Zeitdauer berechnen (Uhrzeiten-Tabelle)`, `Zeiteinheiten umrechnen (s, min, h, Tage)`, `Schriftliches Rechnen mit Geldbeträgen (€ mit Komma)`, `Text-/Sachaufgaben`
9. **Daten & Zufall: Diagramme, Wahrscheinlichkeit & Kombinatorik**
   - *Chips:* `Balken- & Säulendiagramme auswerten (größere Skalen)`, `Wahrscheinlichkeit (sicher, möglich, unmöglich)`, `Kombinatorik (Baumdiagramm / Möglichkeiten)`

---

### 🔴 KLASSE 4 (Zahlenraum bis 1.000.000 & Schriftliches Mal/Geteilt)
1. **Zahlenraum bis 1.000.000: Stellenwerttafel & Runden**
   - *Chips:* `Stellenwerttafel (M | HT | ZT | T | H | Z | E) & Zahlwörter`, `Nachbarzahlen (Nachbartausender, Nachbarzehntausender)`, `Zahlenstrahl & Zahlen ordnen (bis 1.000.000)`, `Runden auf Tausender, Zehntausender, Hunderttausender`, `Größer/Kleiner/Gleich (< > =)`
2. **Zahlenraum bis 1.000.000: Addition & Subtraktion (Mündlich & Schriftlich)**
   - *Chips:* `Schriftliche Addition & Subtraktion (große Zahlen)`, `Kopfrechnen & Halbschriftlich bis 1.000.000`, `Überschlagsrechnung`, `Text-/Sachaufgaben`
3. **Schriftliche Multiplikation (ein- und mehrstellig)**
   - *Chips:* `Schriftliche Multiplikation (mit 1-stelligem Faktor)`, `Schriftliche Multiplikation (mit Zehner- & 2-stelligem Faktor)`, `Überschlagsrechnung & Fehlende Ziffern`, `Text-/Sachaufgaben`
4. **Schriftliche Division (ein- und zweistellig, mit/ohne Rest)**
   - *Chips:* `Schriftliche Division durch 1-stellige Zahl (Treppenform)`, `Schriftliche Division mit Rest & Probe (Umkehraufgabe)`, `Division durch Zehnerzahlen`, `Text-/Sachaufgaben`
5. **Geometrie: Umfang & Flächeninhalt, Maßstab, Drehsymmetrie, Kreis**
   - *Chips:* `Umfang & Flächeninhalt am Karogitter (Rechteck & Quadrat)`, `Maßstab berechnen & zeichnen (z.B. 1:100)`, `Kreise zeichnen (Radius r & Durchmesser d)`, `Körperansichten (Vorder-, Seiten-, Draufsicht) & Drehsymmetrie`
6. **Größen: Alle Einheiten, Kommaschreibweise & Bruchteile von Größen**
   - *Chips:* `Bruchteile von Größen (1/2, 1/4, 3/4 von km, kg, l, h)`, `Einheiten umrechnen (Kommaschreibweise: km/m, t/kg/g, l/ml)`, `Mehrschrittige Sachaufgaben (Tabellen & Preisvergleiche)`
7. **Daten & Zufall: Komplexe Diagramme, Durchschnitt & Zufall**
   - *Chips:* `Säulen- & Kreisdiagramme lesen und vergleichen`, `Durchschnitt (Mittelwert) & Tabellen berechnen`, `Zufallsexperimente (Glücksrad / Würfel-Chancen)`