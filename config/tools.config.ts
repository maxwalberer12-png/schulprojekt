import type { Tool, ToolCategoryMeta } from '@/types/tools'

// ─────────────────────────────────────────────────────────────
// KATEGORIE-METADATEN
// ─────────────────────────────────────────────────────────────

export const TOOL_CATEGORIES: ToolCategoryMeta[] = [
  {
    id: 'differenzierung',
    label: 'Arbeitsblatt-Generator',
    icon: 'Layers',
    color: 'bg-blue-100 text-blue-700',
    description: 'Druckfertige Arbeitsblätter nach bayerischem LehrplanPLUS erstellen',
  },
]

// ─────────────────────────────────────────────────────────────
// TOOL-DEFINITIONEN
// ─────────────────────────────────────────────────────────────

export const ALL_TOOLS: Tool[] = [
  // ── ZEUGNISSE & BERICHTE ──────────────────────────────────
  {
    id: 'zeugnis-grundschule',
    name: 'Zeugnistext Grundschule',
    shortDescription: 'Individuelle Zeugnistexte für Grundschüler formulieren',
    fullDescription:
      'Erstellt einen einfühlsamen, pädagogisch wertvollen Zeugnistext auf Basis deiner Eingaben zu Stärken, Entwicklungsfeldern und Verhalten des Kindes. Der Text ist datenschutzkonform – Schülernamen werden automatisch anonymisiert.',
    category: 'zeugnisse',
    icon: 'FileText',
    color: 'bg-violet-100 text-violet-700',
    badge: 'Beliebt',
    estimatedTime: 'ca. 2 Min.',
    outputLabel: 'Generierter Zeugnistext',
    tags: ['zeugnis', 'beurteilung', 'text', 'grundschule'],
    isPremium: false,
    inputs: [
      {
        id: 'klasse',
        label: 'Jahrgangsstufe',
        type: 'select',
        required: true,
        options: ['1. Klasse', '2. Klasse', '3. Klasse', '4. Klasse'],
      },
      {
        id: 'staerken',
        label: 'Stärken und positive Eigenschaften',
        type: 'textarea',
        required: true,
        rows: 3,
        placeholder: 'z.B. zeigt große Begeisterung beim Lesen, hilfsbereit gegenüber Mitschülern...',
        helperText: 'Beschreibe 2–4 konkrete Stärken des Kindes.',
        piiSensitive: false,
      },
      {
        id: 'entwicklungsfelder',
        label: 'Entwicklungsfelder',
        type: 'textarea',
        required: false,
        rows: 2,
        placeholder: 'z.B. Konzentration bei Gruppenarbeit, Aufgaben vollständig zu Ende führen...',
        helperText: 'Optional: Was kann das Kind noch verbessern? (Wertschätzend formulieren)',
        piiSensitive: false,
      },
      {
        id: 'sozialverhalten',
        label: 'Sozialverhalten',
        type: 'select',
        required: true,
        options: [
          'sehr aufgeschlossen und kooperativ',
          'freundlich und hilfsbereit',
          'ruhig und zurückhaltend',
          'lebhaft und kontaktfreudig',
          'zeigt Führungsqualitäten',
        ],
      },
      {
        id: 'halbjahr',
        label: 'Zeugnis-Zeitpunkt',
        type: 'select',
        required: true,
        options: ['Halbjahreszeugnis', 'Jahreszeugnis'],
      },
      {
        id: 'tonalitaet',
        label: 'Tonalität des Textes',
        type: 'select',
        required: true,
        options: [
          'ermutigend und motivierend',
          'sachlich und präzise',
          'besonders wertschätzend',
        ],
      },
    ],
    promptTemplate: `Du bist eine erfahrene Grundschullehrerin und hilfst beim Formulieren von Zeugnistexten.

Erstelle einen Zeugnistext für einen Schüler der {{klasse}} zum {{halbjahr}}.

Angaben der Lehrkraft:
- Stärken: {{staerken}}
- Entwicklungsfelder: {{entwicklungsfelder}}
- Sozialverhalten: {{sozialverhalten}}
- Gewünschte Tonalität: {{tonalitaet}}

Regeln für den Text:
- 3–5 Sätze, flüssig lesbar
- Kein Schülername im Text (Datenschutz)
- Pädagogisch wertschätzende Sprache
- Keine Floskeln wie "zeigt sich stets bemüht"
- Auf Deutsch verfassen
- Schließe mit einem ermutigenden Ausblick

Gib NUR den fertigen Zeugnistext aus, ohne Erklärungen.`,
  },

  {
    id: 'lernentwicklungsbericht',
    name: 'Lernentwicklungsbericht',
    shortDescription: 'Ausführliche Lernentwicklungsberichte strukturiert erstellen',
    fullDescription:
      'Generiert einen strukturierten Lernentwicklungsbericht mit allen relevanten Kompetenzbereichen für Schulanfänger und ältere Grundschüler.',
    category: 'zeugnisse',
    icon: 'ClipboardCheck',
    color: 'bg-violet-100 text-violet-700',
    estimatedTime: 'ca. 3 Min.',
    outputLabel: 'Lernentwicklungsbericht',
    tags: ['lernentwicklung', 'bericht', 'kompetenzen'],
    isPremium: false,
    inputs: [
      {
        id: 'klasse',
        label: 'Jahrgangsstufe',
        type: 'select',
        required: true,
        options: ['1. Klasse', '2. Klasse', '3. Klasse', '4. Klasse'],
      },
      {
        id: 'lesen',
        label: 'Leseentwicklung',
        type: 'textarea',
        required: true,
        rows: 2,
        placeholder: 'z.B. liest flüssig kurze Texte, stockendes Lesen bei langen Wörtern...',
        piiSensitive: false,
      },
      {
        id: 'schreiben',
        label: 'Schreibentwicklung',
        type: 'textarea',
        required: true,
        rows: 2,
        placeholder: 'z.B. schreibt lesbar, Groß- und Kleinschreibung noch unsicher...',
        piiSensitive: false,
      },
      {
        id: 'mathe',
        label: 'Mathematik',
        type: 'textarea',
        required: true,
        rows: 2,
        placeholder: 'z.B. sicheres Rechnen im Zahlenraum 100, Sachaufgaben bereiten noch Mühe...',
        piiSensitive: false,
      },
      {
        id: 'besonderheiten',
        label: 'Weitere Besonderheiten',
        type: 'textarea',
        required: false,
        rows: 2,
        placeholder: 'z.B. besonderes Talent im Musizieren, Freude an Experimenten...',
        piiSensitive: false,
      },
    ],
    promptTemplate: `Erstelle einen strukturierten Lernentwicklungsbericht für einen Schüler der {{klasse}}.

Lehrerangaben:
- Lesen: {{lesen}}
- Schreiben: {{schreiben}}
- Mathematik: {{mathe}}
- Weitere Besonderheiten: {{besonderheiten}}

Format: Strukturierter Fließtext mit 3 Abschnitten (Sprachliche Entwicklung, Mathematik, Gesamtentwicklung).
Kein Schülername. Wertschätzend und präzise. Auf Deutsch. Ca. 150–200 Wörter.`,
  },

  // ── ELTERNKOMMUNIKATION ───────────────────────────────────
  {
    id: 'elternbrief-allgemein',
    name: 'Elternbrief verfassen',
    shortDescription: 'Professionelle Elternbriefe zu beliebigen Themen erstellen',
    fullDescription:
      'Erstellt einen klaren, freundlichen Elternbrief zu jedem Schulthema. Ideal für Ausflüge, Veranstaltungen, Verhaltenshinweise oder organisatorische Mitteilungen.',
    category: 'eltern',
    icon: 'Mail',
    color: 'bg-blue-100 text-blue-700',
    badge: 'Beliebt',
    estimatedTime: 'ca. 1 Min.',
    outputLabel: 'Fertiger Elternbrief',
    tags: ['elternbrief', 'kommunikation', 'schreiben'],
    isPremium: false,
    inputs: [
      {
        id: 'thema',
        label: 'Thema des Briefes',
        type: 'text',
        required: true,
        placeholder: 'z.B. Klassenausflug ins Naturkundemuseum',
      },
      {
        id: 'details',
        label: 'Wichtige Informationen / Details',
        type: 'textarea',
        required: true,
        rows: 3,
        placeholder: 'z.B. Datum: 15.11.2026, Kosten: 5 Euro, Abfahrt: 8:00 Uhr, Rückkehr: 15:00 Uhr...',
        helperText: 'Alle Fakten, die im Brief vorkommen sollen.',
        piiSensitive: false,
      },
      {
        id: 'klasse',
        label: 'Klasse',
        type: 'text',
        required: true,
        placeholder: 'z.B. 3b',
      },
      {
        id: 'rueckmeldung',
        label: 'Ist eine Rückmeldung der Eltern nötig?',
        type: 'select',
        required: true,
        options: ['Ja, Abschnitt zum Abtrennen', 'Ja, per E-Mail', 'Nein'],
      },
      {
        id: 'ton',
        label: 'Ton des Briefes',
        type: 'select',
        required: true,
        options: ['freundlich-informell', 'förmlich', 'herzlich-einladend'],
      },
    ],
    promptTemplate: `Du bist eine Grundschullehrerin und verfasst einen Elternbrief.

Thema: {{thema}}
Details: {{details}}
Klasse: {{klasse}}
Rückmeldung: {{rueckmeldung}}
Gewünschter Ton: {{ton}}

Erstelle einen vollständigen Elternbrief mit:
- Betreff
- Anrede "Liebe Eltern,"
- Klar strukturiertem Inhalt
- Freundlichem Abschluss
- Platzhalter "[Lehrername]" für die Unterschrift
- Falls Rückmeldung nötig: Abtrennabschnitt mit Datum und Klasse

Nur Deutsch. Keine Füllwörter. Klar und verständlich.`,
  },

  {
    id: 'einladung-elternabend',
    name: 'Einladung Elternabend',
    shortDescription: 'Einladungsschreiben für Elternabende und -gespräche',
    fullDescription:
      'Erstellt eine freundliche Einladung für Elternabende, Elternsprechtage oder Einzelgespräche mit allen notwendigen Informationen.',
    category: 'eltern',
    icon: 'CalendarDays',
    color: 'bg-blue-100 text-blue-700',
    estimatedTime: 'ca. 1 Min.',
    outputLabel: 'Fertige Einladung',
    tags: ['elternabend', 'einladung', 'termin'],
    isPremium: false,
    inputs: [
      {
        id: 'art',
        label: 'Art der Veranstaltung',
        type: 'select',
        required: true,
        options: ['Klassenelternabend', 'Elternsprechtag', 'Einzelgespräch', 'Informationsabend'],
      },
      {
        id: 'datum',
        label: 'Datum und Uhrzeit',
        type: 'text',
        required: true,
        placeholder: 'z.B. Mittwoch, 12.11.2026 um 19:00 Uhr',
      },
      {
        id: 'ort',
        label: 'Ort / Raum',
        type: 'text',
        required: true,
        placeholder: 'z.B. Klassenraum 2b, Schulgebäude A',
      },
      {
        id: 'themen',
        label: 'Themen der Veranstaltung',
        type: 'textarea',
        required: false,
        rows: 2,
        placeholder: 'z.B. Lernstand Mitte des Schuljahres, Ausblick auf das Halbjahr, Fragen der Eltern',
        piiSensitive: false,
      },
      {
        id: 'klasse',
        label: 'Klasse',
        type: 'text',
        required: true,
        placeholder: 'z.B. 2a',
      },
    ],
    promptTemplate: `Erstelle eine Einladung für einen {{art}} der Klasse {{klasse}}.

Datum & Uhrzeit: {{datum}}
Ort: {{ort}}
Geplante Themen: {{themen}}

Ton: herzlich und einladend. Kurz und prägnant (max. 150 Wörter).
Mit Betreff, Anrede "Liebe Eltern,", Inhalt, Abschluss, Platzhalter "[Lehrername]".`,
  },

  // ── UNTERRICHTSPLANUNG ────────────────────────────────────
  {
    id: 'stundenverlaufsplan',
    name: 'Stundenverlaufsplan',
    shortDescription: 'Strukturierten Unterrichtsverlauf für 45 Minuten erstellen',
    fullDescription:
      'Generiert einen vollständigen Stundenverlaufsplan mit Einstieg, Erarbeitung, Sicherung und Ausblick – angepasst an Klasse und Thema.',
    category: 'unterricht',
    icon: 'BookOpen',
    color: 'bg-green-100 text-green-700',
    badge: 'Neu',
    estimatedTime: 'ca. 2 Min.',
    outputLabel: 'Stundenverlaufsplan',
    tags: ['planung', 'unterricht', 'stundenplan', 'pädagogik'],
    isPremium: false,
    inputs: [
      {
        id: 'fach',
        label: 'Fach',
        type: 'select',
        required: true,
        options: [
          'Deutsch',
          'Mathematik',
          'Sachunterricht',
          'Kunst',
          'Musik',
          'Sport',
          'Religion/Ethik',
          'Englisch',
        ],
      },
      {
        id: 'thema',
        label: 'Unterrichtsthema',
        type: 'text',
        required: true,
        placeholder: 'z.B. Einführung der Multiplikation als wiederholte Addition',
      },
      {
        id: 'klasse',
        label: 'Jahrgangsstufe',
        type: 'select',
        required: true,
        options: ['1. Klasse', '2. Klasse', '3. Klasse', '4. Klasse'],
      },
      {
        id: 'lernziel',
        label: 'Lernziel der Stunde',
        type: 'textarea',
        required: true,
        rows: 2,
        placeholder: 'z.B. Die Schülerinnen und Schüler können einfache Multiplikationsaufgaben als wiederholte Addition darstellen.',
        piiSensitive: false,
      },
      {
        id: 'besonderheiten',
        label: 'Besonderheiten / verfügbare Materialien',
        type: 'textarea',
        required: false,
        rows: 2,
        placeholder: 'z.B. Smartboard vorhanden, 3 Kinder mit DaZ-Hintergrund, Gruppenarbeitstische',
        piiSensitive: false,
      },
    ],
    promptTemplate: `Erstelle einen detaillierten Stundenverlaufsplan.

Fach: {{fach}} | Klasse: {{klasse}}
Thema: {{thema}}
Lernziel: {{lernziel}}
Besonderheiten: {{besonderheiten}}

Format als Tabelle mit Spalten: Phase | Zeit | Inhalt / Lehrertätigkeit | Schülertätigkeit | Methode/Sozialform | Material
Phasen: Einstieg (5-10 Min.) → Erarbeitung (15-20 Min.) → Sicherung (10-15 Min.) → Abschluss/Ausblick (5 Min.)
Sprache: Deutsch, konkret und umsetzbar.`,
  },

  {
    id: 'lernziele-formulieren',
    name: 'Lernziele formulieren',
    shortDescription: 'Klare, messbare Lernziele nach Bloom für jedes Thema',
    fullDescription:
      'Formuliert präzise Lernziele nach der Bloom\'schen Taxonomie – von Grundverständnis bis zur kreativen Anwendung.',
    category: 'unterricht',
    icon: 'Target',
    color: 'bg-green-100 text-green-700',
    estimatedTime: 'ca. 1 Min.',
    outputLabel: 'Lernziele',
    tags: ['lernziele', 'bloom', 'didaktik', 'planung'],
    isPremium: false,
    inputs: [
      {
        id: 'thema',
        label: 'Unterrichtsthema',
        type: 'text',
        required: true,
        placeholder: 'z.B. Wasserkreislauf',
      },
      {
        id: 'fach',
        label: 'Fach',
        type: 'select',
        required: true,
        options: ['Deutsch', 'Mathematik', 'Sachunterricht', 'Kunst', 'Musik', 'Sport', 'Englisch'],
      },
      {
        id: 'klasse',
        label: 'Jahrgangsstufe',
        type: 'select',
        required: true,
        options: ['1. Klasse', '2. Klasse', '3. Klasse', '4. Klasse'],
      },
      {
        id: 'anzahl',
        label: 'Anzahl der Lernziele',
        type: 'select',
        required: true,
        options: ['3 Lernziele', '5 Lernziele', '7 Lernziele'],
      },
    ],
    promptTemplate: `Formuliere {{anzahl}} konkrete, messbare Lernziele für folgenden Unterricht:

Fach: {{fach}} | Klasse: {{klasse}} | Thema: {{thema}}

Nutze die Bloom'sche Taxonomie (Wissen → Verstehen → Anwenden).
Format: Nummerierte Liste. Jedes Ziel beginnt mit "Die Schülerinnen und Schüler..."
Verwende Handlungsverben (nennen, erklären, unterscheiden, anwenden, erstellen).
Auf Deutsch. Präzise und realistisch für Grundschule.`,
  },

  {
    id: 'wochenplan-erstellen',
    name: 'Wochenplan erstellen',
    shortDescription: 'Strukturierten Wochenplan für Freiarbeit oder Offenen Unterricht',
    fullDescription:
      'Erstellt einen ansprechenden Wochenplan mit Pflicht- und Wahlaufgaben für die Freiarbeit, angepasst an Klasse und Themenschwerpunkt.',
    category: 'unterricht',
    icon: 'LayoutGrid',
    color: 'bg-green-100 text-green-700',
    estimatedTime: 'ca. 2 Min.',
    outputLabel: 'Wochenplan',
    tags: ['wochenplan', 'freiarbeit', 'offener unterricht'],
    isPremium: false,
    inputs: [
      {
        id: 'klasse',
        label: 'Jahrgangsstufe',
        type: 'select',
        required: true,
        options: ['1. Klasse', '2. Klasse', '3. Klasse', '4. Klasse'],
      },
      {
        id: 'thema',
        label: 'Thematischer Schwerpunkt der Woche',
        type: 'text',
        required: true,
        placeholder: 'z.B. Herbst und Natur / Zahlenraum bis 1000',
      },
      {
        id: 'faecher',
        label: 'Enthaltene Fächer',
        type: 'select',
        required: true,
        options: ['Deutsch + Mathe', 'Deutsch + Mathe + Sachunterricht', 'Alle Hauptfächer'],
      },
      {
        id: 'pflichtaufgaben',
        label: 'Anzahl Pflichtaufgaben',
        type: 'select',
        required: true,
        options: ['3 Pflichtaufgaben', '5 Pflichtaufgaben', '7 Pflichtaufgaben'],
      },
    ],
    promptTemplate: `Erstelle einen Wochenplan für die Freiarbeit.

Klasse: {{klasse}} | Thema: {{thema}} | Fächer: {{faecher}}
Pflichtaufgaben: {{pflichtaufgaben}}

Format: Übersichtliche Liste mit Pflichtaufgaben (Stern ★) und Wahlaufgaben.
Für jede Aufgabe: Kurze Beschreibung + Hinweis auf Material (z.B. "Arbeitsheft S. 34" oder "Karteikarte").
Ideen für Wahlaufgaben mit Kreativanteil einbauen.
Auf Deutsch, kindgerecht formuliert.`,
  },

  // ── DIFFERENZIERUNG ───────────────────────────────────────
  {
    id: 'aufgaben-differenziert',
    name: 'Differenzierte Aufgaben',
    shortDescription: 'Aufgaben auf 3 Niveaustufen (Stern-System) erstellen',
    fullDescription:
      'Erstellt dasselbe Lernziel als Aufgaben auf drei Niveaustufen: Grundanforderungen ⭐, Regelanforderungen ⭐⭐ und Erweiterungsaufgaben ⭐⭐⭐.',
    category: 'differenzierung',
    icon: 'Layers',
    color: 'bg-orange-100 text-orange-700',
    badge: 'Beliebt',
    estimatedTime: 'ca. 2 Min.',
    outputLabel: 'Differenzierte Aufgaben (3 Niveaus)',
    tags: ['differenzierung', 'aufgaben', 'inklusion', 'niveaustufen'],
    isPremium: false,
    inputs: [
      {
        id: 'fach',
        label: 'Fach',
        type: 'select',
        required: true,
        options: ['Deutsch', 'Mathematik', 'Sachunterricht (HSU)', 'Englisch'],
      },
      {
        id: 'thema',
        label: 'Thema / Lerninhalt',
        type: 'text',
        required: true,
        placeholder: 'z. B. Zahlenraum bis 20: Plus und Minus, Verdoppeln, Nachbarzahlen...',
      },
      {
        id: 'klasse',
        label: 'Jahrgangsstufe',
        type: 'select',
        required: true,
        options: ['1. Klasse', '2. Klasse', '3. Klasse', '4. Klasse'],
      },
      {
        id: 'kontext',
        label: 'Thematischer Kontext (optional)',
        type: 'text',
        required: false,
        placeholder: 'z.B. Schulkiosk, Bauernhof, Fußball – macht die Aufgaben lebensnaher',
      },
    ],
    promptTemplate: `Erstelle ein didaktisch hochwertiges Grundschul-Arbeitsblatt zum Thema "{{thema}}" im Fach {{fach}}, {{klasse}}.

Kontext: {{kontext}}
Gewählte Aufgabentypen: {{aufgabentypen}}

Formatvorgaben:
Beginne direkt mit "# TITEL:".
Halte dich exakt an die Vorgaben aus den System-Leitlinien für das Fach {{fach}}.`,
  },

  {
    id: 'erklaertext-vereinfachen',
    name: 'Text vereinfachen / DaZ',
    shortDescription: 'Texte in einfache Sprache für DaZ-Kinder umschreiben',
    fullDescription:
      'Vereinfacht komplexe Sachtexte oder Aufgabenstellungen in einfache Sprache – ideal für Kinder mit Deutsch als Zweitsprache oder Leseanfänger.',
    category: 'differenzierung',
    icon: 'BookMarked',
    color: 'bg-orange-100 text-orange-700',
    estimatedTime: 'ca. 1 Min.',
    outputLabel: 'Vereinfachter Text',
    tags: ['daz', 'einfache sprache', 'inklusion', 'leseanfänger'],
    isPremium: false,
    inputs: [
      {
        id: 'originaltext',
        label: 'Originaltext oder Aufgabenstellung',
        type: 'textarea',
        required: true,
        rows: 4,
        placeholder: 'Füge hier den Text ein, der vereinfacht werden soll...',
        piiSensitive: false,
      },
      {
        id: 'zielgruppe',
        label: 'Zielgruppe',
        type: 'select',
        required: true,
        options: [
          'DaZ-Kinder (Anfänger)',
          'DaZ-Kinder (Fortgeschrittene)',
          'Kinder mit Leseschwäche',
          'Erstklässler allgemein',
        ],
      },
      {
        id: 'behalte_fachwoerter',
        label: 'Fachbegriffe behalten?',
        type: 'select',
        required: true,
        options: ['Nein, durch einfache Wörter ersetzen', 'Ja, aber mit Erklärung in Klammern'],
      },
    ],
    promptTemplate: `Schreibe folgenden Text in einfache Sprache um.

Originaltext: {{originaltext}}

Zielgruppe: {{zielgruppe}}
Fachbegriffe: {{behalte_fachwoerter}}

Regeln:
- Kurze Sätze (max. 10 Wörter pro Satz)
- Einfache, bekannte Wörter
- Ein Gedanke pro Satz
- Aktive Formulierungen
- Auf Deutsch

Gib nur den vereinfachten Text aus.`,
  },

  // ── FÖRDERUNG & DIAGNOSE ──────────────────────────────────
  {
    id: 'foerderplan',
    name: 'Förderplan erstellen',
    shortDescription: 'Individuellen Förderplan mit konkreten Maßnahmen erstellen',
    fullDescription:
      'Generiert einen strukturierten Förderplan mit Ausgangslage, Förderziel, konkreten Maßnahmen und Erfolgskriterien. Datenschutzkonform – kein Schülername im Prompt.',
    category: 'foerderung',
    icon: 'TrendingUp',
    color: 'bg-pink-100 text-pink-700',
    estimatedTime: 'ca. 3 Min.',
    outputLabel: 'Förderplan',
    tags: ['förderplan', 'inklusion', 'lrs', 'rechenschwäche', 'ads'],
    isPremium: false,
    inputs: [
      {
        id: 'klasse',
        label: 'Jahrgangsstufe',
        type: 'select',
        required: true,
        options: ['1. Klasse', '2. Klasse', '3. Klasse', '4. Klasse'],
      },
      {
        id: 'foerderbereich',
        label: 'Förderbereich',
        type: 'select',
        required: true,
        options: [
          'Lesen (LRS)',
          'Schreiben (LRS)',
          'Mathematik (Rechenschwäche)',
          'Aufmerksamkeit (ADS/ADHS)',
          'Sozialverhalten',
          'Sprachentwicklung (DaZ)',
          'Allgemeine Lernschwäche',
        ],
      },
      {
        id: 'ausgangslage',
        label: 'Aktuelle Ausgangslage / Beobachtungen',
        type: 'textarea',
        required: true,
        rows: 3,
        placeholder: 'z.B. liest sehr langsam, verwechselt b/d, verliert beim Lesen oft die Zeile...',
        piiSensitive: false,
      },
      {
        id: 'dauer',
        label: 'Förderzeitraum',
        type: 'select',
        required: true,
        options: ['6 Wochen', '12 Wochen (Halbjahr)', 'Schuljahr'],
      },
    ],
    promptTemplate: `Erstelle einen strukturierten Förderplan.

Jahrgangsstufe: {{klasse}}
Förderbereich: {{foerderbereich}}
Ausgangslage: {{ausgangslage}}
Zeitraum: {{dauer}}

Struktur des Förderplans:
1. Ausgangslage (Zusammenfassung)
2. Förderziel (konkret, messbar)
3. Konkrete Fördermaßnahmen (mindestens 4, mit Häufigkeit)
4. Materialempfehlungen
5. Erfolgskriterien / Überprüfung

Kein Schülername. Auf Deutsch. Professionell und konkret umsetzbar.`,
  },

  {
    id: 'beobachtungsbogen',
    name: 'Beobachtungsbogen generieren',
    shortDescription: 'Strukturierte Beobachtungsbögen für Lernstand und Verhalten',
    fullDescription:
      'Erstellt einen maßgeschneiderten Beobachtungsbogen mit Bewertungskriterien und Beurteilungsskala für Unterrichtsbeobachtungen.',
    category: 'foerderung',
    icon: 'Search',
    color: 'bg-pink-100 text-pink-700',
    estimatedTime: 'ca. 2 Min.',
    outputLabel: 'Beobachtungsbogen',
    tags: ['beobachtung', 'diagnose', 'lernstand', 'bewertung'],
    isPremium: false,
    inputs: [
      {
        id: 'bereich',
        label: 'Beobachtungsbereich',
        type: 'select',
        required: true,
        options: [
          'Leseflüssigkeit',
          'Schriftspracherwerb',
          'Mathematische Grundkenntnisse',
          'Sozialverhalten',
          'Arbeitsverhalten',
          'Sprachkompetenz (Mündlich)',
        ],
      },
      {
        id: 'klasse',
        label: 'Jahrgangsstufe',
        type: 'select',
        required: true,
        options: ['1. Klasse', '2. Klasse', '3. Klasse', '4. Klasse'],
      },
      {
        id: 'skala',
        label: 'Bewertungsskala',
        type: 'select',
        required: true,
        options: ['1–4 (sehr gut bis nicht erreicht)', '+ / ± / -', 'ja / teilweise / nein'],
      },
    ],
    promptTemplate: `Erstelle einen professionellen Beobachtungsbogen.

Bereich: {{bereich}} | Klasse: {{klasse}}
Bewertungsskala: {{skala}}

Format: Tabelle mit Beobachtungskriterien (mindestens 8), Skala und Notizfeld.
Professionelle pädagogische Sprache. Auf Deutsch.
Am Ende: kurzes Freifeld "Gesamteindruck / Empfehlung".`,
  },

  // ── VERWALTUNG ────────────────────────────────────────────
  {
    id: 'protokoll-elterngespraech',
    name: 'Gesprächsprotokoll',
    shortDescription: 'Strukturiertes Protokoll für Eltern- oder Teamgespräche',
    fullDescription:
      'Erstellt eine professionelle Protokollvorlage für Elterngespräche, Fördergespräche oder Teambesprechungen – mit allen wichtigen Gesprächspunkten.',
    category: 'verwaltung',
    icon: 'FileSignature',
    color: 'bg-gray-100 text-gray-700',
    estimatedTime: 'ca. 1 Min.',
    outputLabel: 'Gesprächsprotokoll',
    tags: ['protokoll', 'elterngespräch', 'dokumentation'],
    isPremium: false,
    inputs: [
      {
        id: 'art',
        label: 'Art des Gesprächs',
        type: 'select',
        required: true,
        options: [
          'Elterngespräch (allgemein)',
          'Fördergespräch',
          'Konfliktgespräch',
          'Schuljahresgespräch',
          'Teambesprechung',
        ],
      },
      {
        id: 'themen',
        label: 'Geplante Gesprächsthemen / -punkte',
        type: 'textarea',
        required: true,
        rows: 3,
        placeholder: 'z.B. Lernentwicklung Lesen, Hausaufgabensituation, nächste Schritte...',
        piiSensitive: false,
      },
      {
        id: 'datum',
        label: 'Datum und Uhrzeit',
        type: 'text',
        required: false,
        placeholder: 'z.B. 15.11.2026, 16:00 Uhr',
      },
    ],
    promptTemplate: `Erstelle eine professionelle Protokollvorlage für ein {{art}}.

Datum: {{datum}}
Geplante Themen: {{themen}}

Format:
- Kopfzeile: Datum, Uhrzeit, Teilnehmer (Platzhalter), Ort
- Für jedes Thema: Abschnitt mit "Besprochenes:" und "Vereinbartes:"
- Abschnitt "Nächste Schritte / Vereinbarungen"
- Unterschriftenzeile für alle Beteiligten

Kein Schüler- oder Elternname. Auf Deutsch. Professionell.`,
  },

  {
    id: 'entschuldigungsbestaetigung',
    name: 'Bestätigung / Bescheinigung',
    shortDescription: 'Offizielle Schulbescheinigungen und Bestätigungsschreiben',
    fullDescription:
      'Erstellt formelle Bescheinigungen wie Schulzeitbestätigungen, Teilnahmebestätigungen oder Entschuldigungsvermerke.',
    category: 'verwaltung',
    icon: 'Stamp',
    color: 'bg-gray-100 text-gray-700',
    estimatedTime: 'ca. 1 Min.',
    outputLabel: 'Fertige Bescheinigung',
    tags: ['bescheinigung', 'bestätigung', 'formular', 'offiziell'],
    isPremium: false,
    inputs: [
      {
        id: 'art',
        label: 'Art der Bescheinigung',
        type: 'select',
        required: true,
        options: [
          'Schulbesuchsbestätigung',
          'Teilnahmebestätigung (Projekt/AG)',
          'Bestätigung Schülerausweis',
          'Freistellung vom Unterricht',
        ],
      },
      {
        id: 'zweck',
        label: 'Verwendungszweck',
        type: 'text',
        required: false,
        placeholder: 'z.B. für Behörden, für Sportverein, für Arzttermin',
      },
      {
        id: 'klasse',
        label: 'Klasse',
        type: 'text',
        required: true,
        placeholder: 'z.B. 3a',
      },
      {
        id: 'datum',
        label: 'Ausstellungsdatum',
        type: 'text',
        required: true,
        placeholder: 'z.B. 07.10.2026',
      },
    ],
    promptTemplate: `Erstelle eine offizielle Schulbescheinigung.

Art: {{art}}
Verwendungszweck: {{zweck}}
Klasse: {{klasse}}
Datum: {{datum}}

Format: Formeller Geschäftsbrief. Kein Schülername (Platzhalter "[Name des Schülers / der Schülerin]").
Mit Ort, Datum, Schulstempel-Platzhalter und Unterschriftenzeile.
Auf Deutsch. Amtliche, sachliche Sprache.`,
  },
]

const aufgabenDifferenziertTool = ALL_TOOLS.find((t) => t.id === 'aufgaben-differenziert') ?? ALL_TOOLS[0]

/** Aktive Tools – fürs Erste ausschließlich der Arbeitsblatt-Generator */
export const TOOLS: Tool[] = [
  {
    ...aufgabenDifferenziertTool,
    name: 'Arbeitsblatt-Generator',
    badge: 'LehrplanPLUS Bayern',
    shortDescription: 'Druckfertige DIN-A4-Arbeitsblätter nach bayerischem LehrplanPLUS für Klassen 1–4',
  },
]

// ─────────────────────────────────────────────────────────────
// HILFSFUNKTIONEN
// ─────────────────────────────────────────────────────────────

/** Alle Tools einer bestimmten Kategorie abrufen */
export function getToolsByCategory(category: string): Tool[] {
  return TOOLS.filter((tool) => tool.category === category)
}

/** Ein einzelnes Tool per ID abrufen */
export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((tool) => tool.id === id) || ALL_TOOLS.find((tool) => tool.id === id)
}

/** Tools nach Suchbegriff filtern */
export function searchTools(query: string): Tool[] {
  const q = query.toLowerCase().trim()
  if (!q) return TOOLS
  return TOOLS.filter(
    (tool) =>
      tool.name.toLowerCase().includes(q) ||
      tool.shortDescription.toLowerCase().includes(q) ||
      tool.tags.some((tag) => tag.includes(q))
  )
}

/** Kategorie-Metadaten per ID abrufen */
export function getCategoryMeta(id: string): ToolCategoryMeta | undefined {
  return TOOL_CATEGORIES.find((cat) => cat.id === id)
}
