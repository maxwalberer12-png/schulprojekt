/**
 * LEHRPLANPLUS BAYERN – DIDAKTISCHE LEITPLANKEN FÜR DIE GRUNDSCHULE
 * Verbindliche Vorgaben für Mathematik und Deutsch je Jahrgangsstufe (Klassen 1 bis 4).
 */

export interface GradeCurriculumRule {
  grade: number
  zahlenraum?: string
  erlaubteOperationen?: string[]
  verboteneInhalte: string[]
  didaktischeVorgaben: string
  kompetenzen: string[]
}

export const LEHRPLAN_MATHEMATIK: Record<number, GradeCurriculumRule> = {
  1: {
    grade: 1,
    zahlenraum: 'Zahlenraum bis 20',
    erlaubteOperationen: ['Addition (+)', 'Subtraktion (-)'],
    verboteneInhalte: [
      'Zahlen über 20',
      'Multiplikation (·)',
      'Division (:)',
      'Schwieriger Zehnerübergang ohne Anschauung',
      'Negative Zahlen',
    ],
    didaktischeVorgaben:
      'Zahlenraum bis 20. Kein Zehnerübergang bzw. nur einfacher Zehnerübergang. Ausschließlich Addition und Subtraktion. Keine Multiplikation, keine Division. Zahlen dürfen keinesfalls größer als 20 sein. ' +
      'Aufgabentypen: Nachbarzahlen (Vorgänger und Nachfolger im ZR 20); Tabellen (einfache Zähltabellen/Strichlisten bis 20); Rechendreiecke/Rechenhäuser (Zahlzerlegungen und Eckensummen bis 20); Geometrie (Grundformen: Kreis, Dreieck, Viereck/Rechteck, Quadrat).',
    kompetenzen: [
      'Zählen und Mengen erfassen bis 20',
      'Grundrechenarten Addition und Subtraktion im Zahlenraum bis 20',
      'Zerkleinern und Zusammensetzen von Zahlen (Zahlzerlegung)',
      'Nachbarzahlen (Vorgänger und Nachfolger im Zahlenraum bis 20)',
      'Einfache Strichlisten und Zähltabellen auswerten',
      'Rechendreiecke und Rechenhäuser im ZR 20 lösen',
      'Ebene Grundformen erkennen und benennen (Kreis, Dreieck, Quadrat, Rechteck)',
    ],
  },
  2: {
    grade: 2,
    zahlenraum: 'Zahlenraum bis 100',
    erlaubteOperationen: [
      'Addition (+)',
      'Subtraktion (-)',
      'Multiplikation (·) – kleines Einmaleins',
      'Division (:) als Umkehroperation ohne Rest',
    ],
    verboteneInhalte: [
      'Zahlen über 100',
      'Division mit Rest',
      'Schriftliche Rechenverfahren',
      'Halbschriftliche Division dreistelliger Zahlen',
      'Kommazahlen',
    ],
    didaktischeVorgaben:
      'Zahlenraum bis 100. Kleines Einmaleins (Multiplikation und Division als Umkehroperation). KEINE Division mit Rest. KEINE Zahlen über 100. Rechnungen und Ergebnisse müssen ausnahmslos im Zahlenraum 0 bis 100 liegen. ' +
      'Aufgabentypen: Nachbarzahlen (Vorgänger/Nachfolger V/N und Nachbarzehner NZ im ZR 100); Tabellen & Diagramme (Häufigkeitstabellen, Balkendiagramme bis 100); Rechendreiecke (Eckensummen max. 100); Geometrie (Ebene Figuren mit Ecken und Seiten sowie einfache Körper wie Würfel, Kugel, Quader).',
    kompetenzen: [
      'Orientierung im Hunderterraum (Vorgänger, Nachfolger, Nachbarzehner)',
      'Automatisierung des kleinen Einmaleins (Kernaufgaben und Quadrataufgaben)',
      'Division als Aufteilen und Verteilen (Umkehrung der Multiplikation)',
      'Zahlenmauern und Rechendreiecke mit Basiszahlen bis Summe maximal 100',
      'Tabellen und einfache Säulen-/Balkendiagramme lesen und Fragen dazu beantworten',
      'Geometrische Körper (Würfel, Quader, Kugel) und Formen (Ecken, Kanten, Seiten) untersuchen',
    ],
  },
  3: {
    grade: 3,
    zahlenraum: 'Zahlenraum bis 1.000',
    erlaubteOperationen: [
      'Addition (+)',
      'Subtraktion (-)',
      'Multiplikation (·)',
      'Division (:)',
      'Halbschriftliche Rechenverfahren',
      'Rechnen mit Einheiten (ct/€, m/cm, kg/g)',
    ],
    verboteneInhalte: [
      'Zahlen über 1.000',
      'Schriftliche Division mit mehrstelligem Divisor',
      'Negative Zahlen',
      'Bruchrechnung',
    ],
    didaktischeVorgaben:
      'Zahlenraum bis 1.000. Halbschriftliche Rechenverfahren (Zerlegen, Schrittweise rechnen). Einheiten: Geld (ct/€), Längen (m/cm), Gewichte (kg/g). Keine Zahlen über 1.000. ' +
      'Aufgabentypen: Nachbarzahlen (V/N, Nachbarzehner NZ, Nachbarhunderter NH im ZR 1.000); Tabellen & Diagramme (Messwert- und Sachdatentabellen); Rechendreiecke (auch Umkehraufgaben im ZR 1.000); Geometrie (Körper Würfel, Quader, Pyramide, Zylinder mit Flächen, Kanten, Ecken; rechter Winkel, Symmetrie).',
    kompetenzen: [
      'Orientierung im Tausenderraum (V/N, NZ, NH am Zahlenstrahl)',
      'Halbschriftliche Addition und Subtraktion',
      'Halbschriftliche Multiplikation und Division',
      'Größen und Messen (Geldwerte, Längen, Massen)',
      'Tabellen und Schaubilder mit Größen sachgerecht auswerten',
      'Rechendreiecke mit Summen und Differenzen im Tausenderraum',
      'Geometrische Körper nach Ecken, Kanten und Flächen beschreiben',
      'Sachaufgaben mit Frage (F:), Rechnung (R:) und Antwort (A:)',
    ],
  },
  4: {
    grade: 4,
    zahlenraum: 'Zahlenraum bis 1.000.000',
    erlaubteOperationen: [
      'Schriftliche Addition',
      'Schriftliche Subtraktion',
      'Schriftliche Multiplikation',
      'Schriftliche Division',
      'Rechnen mit Größen und Sachzusammenhänge',
    ],
    verboteneInhalte: [
      'Zahlen über 1.000.000',
      'Kommazahlen-Multiplikation',
      'Bruchrechnung',
    ],
    didaktischeVorgaben:
      'Zahlenraum bis 1.000.000. Schriftliche Rechenverfahren (Addition, Subtraktion, Multiplikation, Division). Größen (t/kg/g, km/m/cm/mm, h/min/s) und komplexe lebensnahe Sachzusammenhänge. ' +
      'Aufgabentypen: Nachbarzahlen (Nachbarzehner, Nachbarhunderter, Nachbartausender NT bis 1.000.000); Tabellen & Diagramme (Fahrpläne, Preistabellen, Diagramme analysieren); Rechendreiecke (Zahlenlogik und Knobelaufgaben); Geometrie (Körpernetze, Flächeninhalt, Umfang, Parallelität und Orthogonalität).',
    kompetenzen: [
      'Orientierung im Zahlenraum bis 1 Million (Stellenwerttafel, Nachbarzahlen, Runden)',
      'Schriftliche Rechenverfahren sicher ausführen',
      'Größen und Sachrechnen (Maßstäbe, Zeitspannen, Gewichte)',
      'Tabellen, Diagramme und Fahrpläne entnehmen und interpretieren',
      'Geometrie: Körpereigenschaften (Würfelnetze, Quader, Zylinder, Kugel) sowie Umfang und Flächen',
      'Rechendreiecke und Zahlenrätsel im großen Zahlenraum lösen',
    ],
  },
}

export const LEHRPLAN_DEUTSCH: Record<number, GradeCurriculumRule> = {
  1: {
    grade: 1,
    verboteneInhalte: [
      'Komplexe Grammatikbegriffe (Subjekt, Prädikat, Dativ, Akkusativ)',
      'Lange Aufsätze',
      'Fremdwörter',
    ],
    didaktischeVorgaben:
      'Klasse 1: Laut-Buchstaben-Zuordnung, Silbenbögen, einfache kurze Wörter, lautgetreue Schreibweise, Abschreiben in Druckschrift.',
    kompetenzen: ['Lautgetreues Schreiben', 'Silben klatschen', 'Einfache Wörter lesen und schreiben'],
  },
  2: {
    grade: 2,
    verboteneInhalte: [
      'Wörtliche Rede mit Begleitsatz',
      '4 Fälle (Kasus)',
      'Vergangenheit (Präteritum/Perfekt/Plusquamperfekt)',
    ],
    didaktischeVorgaben:
      'Klasse 2: Groß- und Kleinschreibung (Nomen mit Begleitern der/die/das), Wörter nach dem ABC ordnen, Satzschlusszeichen (. ? !), einfache Schüttelsätze (Subjekt-Prädikat-Objekt), Wortbausteine.',
    kompetenzen: [
      'Nomen, Verben und Adjektive unterscheiden',
      'Satzzeichen sicher setzen',
      'Schüttelsätze zu sinnvollen Sätzen ordnen',
    ],
  },
  3: {
    grade: 3,
    verboteneInhalte: ['Genitiv-Attribute', 'Konjunktiv', 'Passivformen'],
    didaktischeVorgaben:
      'Klasse 3: Wortarten (Nomen, Verben in Gegenwart und 1. Vergangenheit, Adjektive mit Steigerung), Wortfamilien, Rechtschreibstrategien (Verlängern, Ableiten), Satzglieder (Satzgegenstand/Subjekt, Satzaussage/Prädikat).',
    kompetenzen: [
      'Wortarten und Zeitformen sicher anwenden',
      'Satzglieder durch Umstellprobe ermitteln',
      'Rechtschreibstrategien anwenden',
    ],
  },
  4: {
    grade: 4,
    verboteneInhalte: ['Mittelstufen-Grammatik (Relativsätze 2. Grades, Partizipialkonstruktionen)'],
    didaktischeVorgaben:
      'Klasse 4: Wörtliche Rede mit Begleitsatz (vorangestellt und nachgestellt), 4 Fälle des Nomens (Kasus), Zeitformen (Präsens, Präteritum, Perfekt, Futur), Satzglieder erweitern (Objekte im 3. und 4. Fall, Zeit- und Ortsangaben).',
    kompetenzen: [
      'Zeichensetzung bei wörtlicher Rede beherrschen',
      'Fälle des Nomens bestimmen',
      'Texte planen, verfassen und überarbeiten',
    ],
  },
}

/**
 * Ermittelt die Jahrgangsstufe (1, 2, 3 oder 4) aus dem Text.
 */
export function parseGradeNumber(klasse: string): number {
  if (!klasse) return 2
  const match = klasse.match(/([1-4])/)
  if (match) {
    return parseInt(match[1], 10)
  }
  return 2
}

/**
 * Gibt die exakten LehrplanPLUS-Leitplanken für ein Fach und eine Klasse zurück.
 */
export function getCurriculumGuidelines(fach: string, klasse: string): string {
  const grade = parseGradeNumber(klasse)
  const lowerFach = (fach || '').toLowerCase()

  if (lowerFach.includes('mathe') || lowerFach.includes('rechnen')) {
    const rule = LEHRPLAN_MATHEMATIK[grade] || LEHRPLAN_MATHEMATIK[2]
    return (
      `MATHEMATIK KLASSE ${grade}: ${rule.didaktischeVorgaben} ` +
      `ERLAUBTE OPERATIONEN: ${rule.erlaubteOperationen?.join(', ') || 'Grundrechenarten'}. ` +
      `STRIKT VERBOTEN: ${rule.verboteneInhalte.join(', ')}.`
    )
  }

  if (lowerFach.includes('deutsch') || lowerFach.includes('sprache')) {
    const rule = LEHRPLAN_DEUTSCH[grade] || LEHRPLAN_DEUTSCH[2]
    return (
      `DEUTSCH KLASSE ${grade}: ${rule.didaktischeVorgaben} ` +
      `STRIKT VERBOTEN: ${rule.verboteneInhalte.join(', ')}.`
    )
  }

  // Sachunterricht / HSU / Allgemein
  return `GRUNDSCHULE KLASSE ${grade}: Kindgerechtes Niveau nach bayerischem LehrplanPLUS für die ${grade}. Jahrgangsstufe. Keine Überforderung, klare Begrifflichkeiten.`
}
