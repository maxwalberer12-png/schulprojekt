/**
 * LEHRPLANPLUS BAYERN – REFERENZ-DATENBANK FÜR DIE GRUNDSCHULE
 *
 * Verbindliche didaktische Leitlinien, Fachbegriffe, Kernkompetenzen,
 * Grundschul-Operatoren und Lineatur-Empfehlungen für die Klassen 1 bis 4
 * in den Fächern Deutsch, Mathematik und Heimat- und Sachunterricht (HSU).
 */

export type PrimaryGrade = 1 | 2 | 3 | 4
export type PrimarySubject = 'Deutsch' | 'Mathematik' | 'HSU'

export interface PrimaryOperator {
  operator: string
  anforderungsbereich: 'I (Wiedergabe)' | 'II (Zusammenhänge herstellen)' | 'III (Reflektieren & Problemlösen)'
  beschreibung: string
  beispiel: string
}

export interface ForbiddenOperator {
  operator: string
  grund: string
  grundschulAlternative: string
}

export interface GradeCurriculum {
  grade: PrimaryGrade
  schwerpunkte: string[]
  kernkompetenzen: string[]
  fachbegriffe: string[]
  lineaturEmpfehlung: {
    name: string
    beschreibung: string
    liniengroesse: string
    hilfslinien: string
  }
  schreibhilfen: string[]
  rechenraster?: string
}

export interface SubjectCurriculum {
  subject: PrimarySubject
  bezeichnung: string
  fachprofil: string
  grades: Record<PrimaryGrade, GradeCurriculum>
  didaktischeLeitlinien: string[]
}

// ── 1. VERBINDLICHE GRUNDSCHUL-OPERATOREN ─────────────────────────
export const GRUNDSCHUL_OPERATOREN: PrimaryOperator[] = [
  {
    operator: 'nenne / benenne',
    anforderungsbereich: 'I (Wiedergabe)',
    beschreibung: 'Wissenselemente oder Begriffe stichpunktartig oder in einem einfachen Satz aufzählen.',
    beispiel: 'Nenne die vier Jahreszeiten.',
  },
  {
    operator: 'ordne zu',
    anforderungsbereich: 'II (Zusammenhänge herstellen)',
    beschreibung: 'Begriffe, Bilder oder Zahlen vorgegebenen Kategorien, Tabellen oder Pfeilen zuweisen.',
    beispiel: 'Ordne die Wörter den Wortarten Nomen, Verb und Adjektiv zu.',
  },
  {
    operator: 'beschreibe',
    anforderungsbereich: 'II (Zusammenhänge herstellen)',
    beschreibung: 'Beobachtungen, Merkmale, Bilder oder einfache Abläufe in eigenen Worten verständlich darstellen.',
    beispiel: 'Beschreibe den Weg des Wassertropfens im Wasserkreislauf.',
  },
  {
    operator: 'begründe kurz',
    anforderungsbereich: 'III (Reflektieren & Problemlösen)',
    beschreibung: 'Eine einfache, kindgerechte Erklärung mit "weil" oder "denn" formulieren.',
    beispiel: 'Begründe kurz, warum der Igel im Winter Winterschlaf hält.',
  },
  {
    operator: 'ergänze',
    anforderungsbereich: 'I (Wiedergabe)',
    beschreibung: 'Fehlende Wörter, Zahlen oder Satzglieder in Lücken oder Rechnungen einsetzen.',
    beispiel: 'Ergänze das passende Satzzeichen am Satzende (. ! ?).',
  },
  {
    operator: 'verbinde',
    anforderungsbereich: 'I (Wiedergabe)',
    beschreibung: 'Zusammengehörige Elemente mit einem Lineal oder Pfeil verbinden.',
    beispiel: 'Verbinde das Nomen mit dem passenden Begleiter (der, die, das).',
  },
  {
    operator: 'markiere / unterstreiche',
    anforderungsbereich: 'I (Wiedergabe)',
    beschreibung: 'Bestimmte Buchstaben, Signalwörter oder Satzteile farbig hervorheben.',
    beispiel: 'Unterstreiche alle Verben blau und alle Nomen braun.',
  },
  {
    operator: 'kreuze an',
    anforderungsbereich: 'I (Wiedergabe)',
    beschreibung: 'Aus vorgegebenen Optionen die richtige Antwort im Kästchen auswählen.',
    beispiel: 'Kreuze die richtige Lösung an.',
  },
  {
    operator: 'berechne / rechne / löse',
    anforderungsbereich: 'I (Wiedergabe)',
    beschreibung: 'Mathematische Rechenoperationen strukturiert und nachvollziehbar ausführen.',
    beispiel: 'Berechne das Ergebnis. Nutze bei Bedarf den Rechenweg.',
  },
  {
    operator: 'vergleiche',
    anforderungsbereich: 'II (Zusammenhänge herstellen)',
    beschreibung: 'Zwei Gegenstände, Zahlen oder Texte auf Gemeinsamkeiten und Unterschiede prüfen (<, >, =).',
    beispiel: 'Vergleiche die Zahlen und setze <, > oder = ein.',
  },
  {
    operator: 'schreibe auf / übertrage',
    anforderungsbereich: 'I (Wiedergabe)',
    beschreibung: 'Einen Text oder Wörter fehlerfrei und formklar in die Schreibzeilen übertragen.',
    beispiel: 'Schreibe den fertigen Satz in dein Heft.',
  },
  {
    operator: 'finde',
    anforderungsbereich: 'II (Zusammenhänge herstellen)',
    beschreibung: 'Passende Wörter, Fehler oder Lösungen im Text, Rätsel oder Gitter aufspüren.',
    beispiel: 'Finde 4 Nomen im Suchsel.',
  },
]

// ── 2. AUSGESCHLOSSENE SEKUNDARSTUFEN-OPERATOREN ─────────────────
export const AUSGESCHLOSSENE_OPERATOREN: ForbiddenOperator[] = [
  {
    operator: 'analysiere',
    grund: 'Zu abstrakt und methodisch überfordernd für Grundschüler (Klasse 1–4).',
    grundschulAlternative: 'untersuche / zerlege in Wortbausteine / beschreibe genau',
  },
  {
    operator: 'erörtere / diskutiere',
    grund: 'Erfordert dialektische Pro-/Kontra-Argumentation nach Sekundarstufen-Standard.',
    grundschulAlternative: 'begründe kurz / nenne Vor- und Nachteile / sammle Ideen',
  },
  {
    operator: 'interpretiere',
    grund: 'Hermeneutische Auslegung übersteigt das Grundschul-Niveau.',
    grundschulAlternative: 'beschreibe, was du denkst / wie fühlt sich die Figur?',
  },
  {
    operator: 'charakterisiere',
    grund: 'Psychologische und literarische Charakteranalyse gehört in die Mittelstufe.',
    grundschulAlternative: 'welche Eigenschaften hat... / beschreibe die Person',
  },
  {
    operator: 'reflektiere',
    grund: 'Metakognitive Begrifflichkeit ist sprachlich nicht kindgerecht.',
    grundschulAlternative: 'überlege, was dir geholfen hat / überprüfe deine Lösung',
  },
  {
    operator: 'beurteile kritisch / differenziere',
    grund: 'Wissenschaftspropädeutische Anforderung der Oberstufe.',
    grundschulAlternative: 'finde deine eigene Meinung und begründe sie kurz',
  },
]

// ── 3. CURRICULUM-DATENBANK LEHRPLANPLUS BAYERN ──────────────────
export const LEHRPLAN_PLUS_GRUNDSCHULE: Record<PrimarySubject, SubjectCurriculum> = {
  // ── DEUTSCH ──────────────────────────────────────────────────────
  Deutsch: {
    subject: 'Deutsch',
    bezeichnung: 'Deutsch Grundschule (LehrplanPLUS Bayern)',
    fachprofil:
      'Sprachbetrachtung, Rechtschreiben, Lesen und Verfassen von Texten mit stufenangepassten Begriffen und Rechtschreibstrategien.',
    didaktischeLeitlinien: [
      'Ausschließlich Grundschulbegriffe verwenden: Nomen/Namenwort, Verb/Tunwort, Adjektiv/Wiewort, Satzzeichen (. ! ?), Satzglieder (Satzgegenstand/Subjekt, Satzaussage/Prädikat).',
      'Keine Sekundarstufen-Grammatik: Keinesfalls "Präposition", "Subjunktion", "Haupt-/Nebensatz", "Akkusativobjekt" ohne kindgerechte Übersetzung ("Wen-Ergänzung").',
      'Aufgabenstellungen mit klaren Schüttelsätzen, Lückentexten oder Signalwörtern formulieren.',
      'Schüttelsätze (Nomen- & Satzanfangs-Regel): Alle Nomen zwingend großschreiben. Das Wort am Satzanfang (z. B. "Die", "Der", "Heute") MUSS in den Schüttelwörtern immer bereits großgeschrieben sein (z. B. "Ball / mit / dem / spielen / Kinder / Die").',
      'Schreibzeilen und Lineatur passend zur Klassenstufe vorgeben.',
    ],
    grades: {
      1: {
        grade: 1,
        schwerpunkte: [
          'Laut-Buchstaben-Zuordnung & Phonologische Bewusstheit',
          'Silbenschwingen & Silbenbögen',
          'Erstlesen einfacher Wörter und Sätze',
          'Druckschrift sauber formen, Abstände zwischen Wörtern',
        ],
        kernkompetenzen: [
          'Laute heraushören (Anlaut, Inlaut, Auslaut)',
          'Silben mit den Händen klatschen und Silbenbögen zeichnen',
          'Vokale (Könige: A, E, I, O, U) in jeder Silbe erkennen',
          'Einfache Sätze mit großem Anfangsbuchstaben und Punkt schreiben',
        ],
        fachbegriffe: [
          'Buchstabe',
          'Laut',
          'Selbstlaut / Vokal (Könige: A, E, I, O, U)',
          'Mitlaut / Konsonant',
          'Silbe',
          'Wort',
          'Satz',
          'Punkt',
        ],
        lineaturEmpfehlung: {
          name: 'Lineatur 1',
          beschreibung: '4 Linien mit Kontrastlineatur und Hilfslinien für Ober- und Unterlänge (5-5-5 mm Abstand).',
          liniengroesse: 'Große Schreibzeilen (ca. 15 mm Gesamthöhe)',
          hilfslinien: 'Dach, Erdgeschoss, Keller / Haus-Symbolik',
        },
        schreibhilfen: [
          'Anlauttabelle als Hilfestellung',
          'Silbenbögen unter jedes Wort zeichnen',
          'Wortzwischenräume mit dem "Zeigefinger-Abstand" kontrollieren',
        ],
      },
      2: {
        grade: 2,
        schwerpunkte: [
          'Wortarten: Nomen, Verben, Adjektive grundlegend unterscheiden',
          'Großschreibung von Nomen (Begleiterprobe, Anfassen-Probe)',
          'Verben beugen (Grundform vs. Personalform: ich, du, er/sie/es)',
          'Rechtschreibstrategien: Schwingen, Verlängern (Auslautverhärtung d/t, g/k, b/p)',
          'Satzarten und Satzzeichen (. ! ?)',
        ],
        kernkompetenzen: [
          'Nomen an ihren Begleitern (der, die, das / ein, eine) erkennen und großschreiben',
          'Verben in Einzahl und Mehrzahl beugen',
          'Adjektive als Beschreibwörter verwenden und Gegenteile finden',
          'Wörter mit doppeltem Mitlaut (kurzer Selbstlaut) durch Schwingen erkennen',
          'Aussagesatz (.), Fragesatz (?) und Ausrufesatz (!) mit passendem Satzzeichen beenden',
        ],
        fachbegriffe: [
          'Nomen / Namenwort',
          'Verb / Tunwort',
          'Adjektiv / Wiewort',
          'Begleiter / Artikel (der, die, das, ein, eine)',
          'Einzahl und Mehrzahl',
          'Grundform und Personalform',
          'Satzanfang groß',
          'Punkt, Fragezeichen, Ausrufezeichen',
        ],
        lineaturEmpfehlung: {
          name: 'Lineatur 2',
          beschreibung: '4 Linien mit Hilfslinien (4-4-4 mm Abstand).',
          liniengroesse: 'Mittlere Grundschulzeilen (ca. 12 mm Gesamthöhe)',
          hilfslinien: 'Oberlänge, Mittellänge, Unterlänge',
        },
        schreibhilfen: [
          'Begleiterprobe (der, die, das vor das Wort setzen)',
          'Verlängerungsprobe bei Auslautverhärtung (Hund → Hunde)',
          'Signalwörter für Adjektive ("Wie ist etwas?")',
        ],
      },
      3: {
        grade: 3,
        schwerpunkte: [
          'Satzglieder ermitteln (Umstellprobe)',
          'Subjekt (Satzgegenstand: Wer oder was?) & Prädikat (Satzaussage: Was tut...?)',
          'Zeitformen des Verbs: Gegenwart (Präsens), 1. Vergangenheit (Präteritum), 2. Vergangenheit (Perfekt)',
          'Wortbausteine: Wortstamm, Vorsilben (ver-, vor-, ab-, ent-) und Nachsilben (-heit, -keit, -ung, -nis, -lich)',
          'Wörtliche Rede mit vorangestelltem Redebegleitsatz',
          'Nachschlagen im Wörterbuch (Alphabet / ABC)',
        ],
        kernkompetenzen: [
          'Sätze umstellen und Satzglieder mit Strichen abtrennen',
          'Satzgegenstand (Subjekt) und Satzaussage (Prädikat) sicher erfragen',
          'Wortfamilien anhand des gemeinsamen Wortstamms bilden',
          'Vorsilben und Nachsilben nutzen, um neue Nomen oder Adjektive zu bilden',
          'Wörtliche Rede mit Redezeichen (Anführungszeichen) korrekt setzen',
        ],
        fachbegriffe: [
          'Satzglied',
          'Subjekt / Satzgegenstand (Wer oder was?)',
          'Prädikat / Satzaussage (Was tut die Person?)',
          'Umstellprobe',
          'Wortstamm',
          'Wortfamilie',
          'Vorsilbe',
          'Nachsilbe',
          'Wörtliche Rede & Redebegleitsatz',
          'Gegenwart (Präsens)',
          '1. Vergangenheit (Präteritum)',
          '2. Vergangenheit (Perfekt)',
        ],
        lineaturEmpfehlung: {
          name: 'Lineatur 3',
          beschreibung: '2 Linien bzw. 3 Linien ohne Kontrast (3,5 mm Zeilenabstand).',
          liniengroesse: 'Kompakte Linien für Klasse 3',
          hilfslinien: 'Mittelband zur Orientierung',
        },
        schreibhilfen: [
          'Umstellprobe (Satzglieder umstellen, ohne dass der Sinn verloren geht)',
          'Frageprobe (Wer oder was? / Was tut...?)',
          'Ableitungsstrategie bei ä/e und äu/au (Wortstamm suchen: Hände → Hand)',
        ],
      },
      4: {
        grade: 4,
        schwerpunkte: [
          'Die vier Fälle des Nomens (Wer-, Wessen-, Wem-, Wen-Fall / Nominativ, Genitiv, Dativ, Akkusativ)',
          'Satzglieder vertiefen: Ergänzungen (Dativ-Objekt / Wem-Ergänzung, Akkusativ-Objekt / Wen-Ergänzung)',
          'Zeitstufen: Zukunft (Futur) ergänzen zu Gegenwart und Vergangenheit',
          'Rechtschreibstrategien automatisieren (Weiterschreiben, Ableiten, Merkwörter)',
          'Zusammengesetzte Sätze (Satzgefüge mit Bindewörtern: weil, dass, obwohl, damit)',
          'Kriterienorientierte Textüberarbeitung (Schreibkonferenz)',
        ],
        kernkompetenzen: [
          'Fälle des Nomens mit der Frageprobe sicher bestimmen',
          'Objekte als Satzglieder erkennen und benennen',
          'Das/dass-Unterscheidung über Ersatzprobe (dieses/jenes/welches) anwenden',
          'Texte mithilfe einer Checkliste eigenständig auf Rechtschreibung und Satzbau überprüfen',
        ],
        fachbegriffe: [
          'Die vier Fälle: 1. Fall (Wer-Fall / Nominativ), 2. Fall (Wessen-Fall / Genitiv), 3. Fall (Wem-Fall / Dativ), 4. Fall (Wen-Fall / Akkusativ)',
          'Satzergänzung / Objekt (Wem-Ergänzung, Wen-Ergänzung)',
          'Zeitform: Zukunft (Futur)',
          'Bindewort / Konjunktion (weil, dass, obwohl, wenn)',
          'Wortfeld',
          'Nachschlagen im Wörterbuch (zweiter und dritter Buchstabe)',
        ],
        lineaturEmpfehlung: {
          name: 'Lineatur 4',
          beschreibung: '1 Linie (einfache Linien mit 9 mm Abstand, optional mit Seitenrand).',
          liniengroesse: 'Standard-Schreiblinien Klasse 4',
          hilfslinien: 'Keine Hilfslinien mehr erforderlich',
        },
        schreibhilfen: [
          'Frageprobe für die Fälle (Wer oder was? / Wessen? / Wem? / Wen oder was?)',
          'Ersatzprobe für "dass" (dieses / jenes / welches)',
          'Fehler-Checkliste: Satzanfänge, Nomen groß, Satzzeichen am Ende, Doppel-Konsonant',
        ],
      },
    },
  },

  // ── MATHEMATIK ───────────────────────────────────────────────────
  Mathematik: {
    subject: 'Mathematik',
    bezeichnung: 'Mathematik Grundschule (LehrplanPLUS Bayern)',
    fachprofil:
      'Zahlen und Operationen, Raum und Form, Größen und Messen sowie Daten und Zufall. Klare Rechenwege, strukturierte Sachaufgaben (F-R-A-Schema) und passendes Karoraster.',
    didaktischeLeitlinien: [
      'Zahlenraum streng an die Jahrgangsstufe anpassen (Kl. 1: bis 20, Kl. 2: bis 100, Kl. 3: bis 1000, Kl. 4: bis 1.000.000).',
      'Textaufgaben IMMER nach dem Grundschul-Schema strukturieren: F: (Frage), R: (Rechnung / Platzhalter), A: (Antwortsatz).',
      'Vergleichsaufgaben mit "<, > oder =" mit eindeutigen Kästchen/Platzhaltern versehen.',
      'Kariertes Rechenkästchen-Feld (5x5 mm) für schriftliche und halbschriftliche Rechenwege bereitstellen.',
      'Keine Wortspeicher-Box auf Mathematik-Arbeitsblättern (stattdessen Rechenkästchen-Raster nutzen).',
    ],
    grades: {
      1: {
        grade: 1,
        schwerpunkte: [
          'Zahlenraum bis 20',
          'Zählen, Bündeln (Zehner und Einer), Zerlegen (Schüttelbox)',
          'Addition und Subtraktion im Zahlenraum bis 10 und bis 20',
          'Zehnerübergang (über die 10)',
          'Verdoppeln und Halbieren',
          'Geometrie: Grundformen (Kreis, Dreieck, Quadrat, Rechteck)',
        ],
        kernkompetenzen: [
          'Anzahlen simultan und quasi-simultan erfassen',
          'Zahlenzerlegungen der Zahl 10 (Verliebte Zahlen / Zehnerfreunde) automatisieren',
          'Plus- und Minusaufgaben ohne und mit Zehnerübergang rechnen',
          'Zahlen vergleichen mit den Zeichen <, > und =',
        ],
        fachbegriffe: [
          'Plus (+)',
          'Minus (-)',
          'Gleich (=)',
          'Zehner (Z)',
          'Einer (E)',
          'Vorgänger und Nachfolger',
          'Größer als (>)',
          'Kleiner als (<)',
          'Zehnerfreunde / Verliebte Zahlen',
        ],
        lineaturEmpfehlung: {
          name: 'Große Rechenkästchen',
          beschreibung: '10x10 mm oder 7x7 mm Karos für Schulanfänger.',
          liniengroesse: 'Extragroße Ziffernfelder',
          hilfslinien: 'Vorgegebene Ziffernhäuschen',
        },
        schreibhilfen: [
          'Zwanzigerfeld zur visuellen Unterstützung',
          'Punktebilder und Schüttelbox-Skizzen',
          'Schrittweises Rechnen über den Zehner (z. B. 8 + 5: erst 8 + 2 = 10, dann 10 + 3 = 13)',
        ],
        rechenraster: '10mm Karos / Zwanzigerfeld',
      },
      2: {
        grade: 2,
        schwerpunkte: [
          'Zahlenraum bis 100',
          'Hundertertafel, Zehner und Einer bündeln',
          'Addition und Subtraktion mit Zehnerübergang im Hunderterraum',
          'Einführung der Multiplikation (Malnehmen) als wiederholte Addition',
          'Einführung der Division (Geteilt/Aufteilen)',
          'Einmaleins-Reihen (Kernaufgaben: 1x, 2x, 5x, 10x)',
          'Größen: Geldwerte (Euro, Cent), Uhrzeiten (Stunde, Minute)',
        ],
        kernkompetenzen: [
          'Zahlen auf dem Zahlenstrahl und in der Hundertertafel verorten',
          'Halbschriftliche Rechenstrategien bei Zehnerübergängen anwenden (Zuerst Zehner, dann Einer)',
          'Umkehraufgaben und Tauschaufgaben bei Plus, Minus und Mal bilden',
          'Sachaufgaben zu Geld und Zeit mit Frage, Rechnung und Antwort lösen',
        ],
        fachbegriffe: [
          'Hunderter (H)',
          'Zehner (Z)',
          'Einer (E)',
          'Malnehmen / Multiplikation (·)',
          'Teilen / Division (:)',
          'Tauschaufgabe',
          'Umkehraufgabe',
          'Euro (€)',
          'Cent (ct)',
          'Uhrzeit (Stunde h, Minute min)',
        ],
        lineaturEmpfehlung: {
          name: 'Rechenkästchen 7x7 mm',
          beschreibung: 'Standard-Rechenkästchen für Klasse 2.',
          liniengroesse: '7 mm Karoraster',
          hilfslinien: 'Zweistellige Stellenwertstreifen',
        },
        schreibhilfen: [
          'Zahlenstrahl bis 100',
          'Pfeilbilder zur Schrittrechnung',
          'F-R-A-Schema (Frage, Rechnung, Antwort)',
        ],
        rechenraster: '7mm Karos / Hunderterfeld',
      },
      3: {
        grade: 3,
        schwerpunkte: [
          'Zahlenraum bis 1000',
          'Stellenwerttafel: H, Z, E',
          'Schriftliche Addition und Subtraktion mit Übertrag (Abziehverfahren / Ergänzungsverfahren)',
          'Halbschriftliche Multiplikation und Division',
          'Einmaleins (1x1) vollständig automatisiert',
          'Größen und Messen: Längen (km, m, dm, cm, mm), Gewichte (kg, g), Zeitspannen',
          'Geometrie: Rechter Winkel, Senkrechte, Parallelen, Körperformen (Würfel, Quader)',
        ],
        kernkompetenzen: [
          'Schriftliche Rechenverfahren sauber untereinander stellen (Einer unter Einer, Zehner unter Zehner)',
          'Überträge bei schriftlicher Addition und Subtraktion sicher notieren',
          'Sachaufgaben mit mehrschrittigen Rechnungen und Einheitenumrechnung lösen',
          'Rechte Winkel mit dem Geodreieck prüfen und zeichnen',
        ],
        fachbegriffe: [
          'Hunderter (H), Zehner (Z), Einer (E)',
          'Stellenwerttafel',
          'Schriftliche Addition',
          'Schriftliche Subtraktion',
          'Übertrag',
          'Summand, Summe, Minuend, Subtrahend, Differenz',
          'Faktor, Produkt, Dividend, Divisor, Quotient',
          'Kilometer (km), Meter (m), Zentimeter (cm), Millimeter (mm)',
          'Kilogramm (kg), Gramm (g)',
          'Rechter Winkel',
        ],
        lineaturEmpfehlung: {
          name: 'Standard-Rechenkästchen 5x5 mm',
          beschreibung: 'Kariertes Papier mit 5 mm Raster (Lineatur 7 / 28).',
          liniengroesse: '5 mm Karoraster',
          hilfslinien: 'Saubere Ausrichtung: 1 Ziffer pro Kästchen',
        },
        schreibhilfen: [
          'Stellenwerttafel zur Veranschaulichung',
          'Lineal-Pflicht für Rechenstriche bei schriftlichen Verfahren',
          'F-R-A-Schema für Textaufgaben mit Antwortsatz',
        ],
        rechenraster: '5mm Karos mit Rechenstrich',
      },
      4: {
        grade: 4,
        schwerpunkte: [
          'Zahlenraum bis 1.000.000 (Millionenraum)',
          'Stellenwerttafel erweitert: M, HT, ZT, T, H, Z, E',
          'Runden und Überschlagsrechnung',
          'Schriftliche Multiplikation mit mehrstelligen Zahlen',
          'Schriftliche Division mit einstelligem und zweistelligem Teiler (mit und ohne Rest)',
          'Größen: Hohlmaße (l, ml), Gewichte mit Tonne (t, kg, g), Zeitspannen',
          'Geometrie: Flächeninhalt und Umfang (Rechteck, Quadrat), Symmetrie, Würfelnetze',
        ],
        kernkompetenzen: [
          'Große Zahlen lesen, schreiben, bündeln und runden',
          'Schriftliche Multiplikation und schriftliche Division routiniert durchführen',
          'Überschlag vor dem Rechnen zur Plausibilitätsprüfung nutzen',
          'Umfang (U = 2·a + 2·b) und Flächeninhalt handlungsorientiert bestimmen',
        ],
        fachbegriffe: [
          'Million (M), Hunderttausend (HT), Zehntausend (ZT), Tausend (T)',
          'Überschlag / Überschlagsrechnung',
          'Runden (abrunden bei 0-4, aufrunden bei 5-9)',
          'Schriftliche Multiplikation',
          'Schriftliche Division mit Rest',
          'Liter (l), Milliliter (ml)',
          'Tonne (t)',
          'Flächeninhalt, Umfang',
          'Symmetrieachse / Achsensymmetrie',
        ],
        lineaturEmpfehlung: {
          name: 'Standard-Rechenkästchen 5x5 mm mit Rand',
          beschreibung: '5 mm Karoraster für mehrstellige schriftliche Rechnungen.',
          liniengroesse: '5 mm Karoraster',
          hilfslinien: 'Ein Kästchen pro Ziffer, Überträge klein notieren',
        },
        schreibhilfen: [
          'Überschlagszeile über der Hauptrechnung',
          'Stellenwert-Punkte bei großen Zahlen (z. B. 450.000)',
          'Strukturierter Antwortsatz mit Einheitenkontrolle',
        ],
        rechenraster: '5mm Karos strukturiert',
      },
    },
  },

  // ── HEIMAT- UND SACHUNTERRICHT (HSU) ─────────────────────────────
  HSU: {
    subject: 'HSU',
    bezeichnung: 'Heimat- und Sachunterricht Grundschule (LehrplanPLUS Bayern)',
    fachprofil:
      'Natur und Leben, Raum und Mobilität, Gesellschaft und Kultur, Zeit und Wandel sowie Technik und Arbeitswelt. Sachlich exakte Fachsprache auf Grundschulniveau.',
    didaktischeLeitlinien: [
      'Themenexakte LehrplanPLUS-Einbettung mit verlässlichen naturwissenschaftlichen und gesellschaftlichen Fakten.',
      'Immer eine Wortspeicher-Box mit 5 bis 8 kindgerechten, aber fachlich exakten Kernbegriffen bereitstellen.',
      'Keine erfundenen Fantasietitel – sachliche Titel verwenden (z. B. "Der Wasserkreislauf", "Die Stockwerke des Waldes", "Der Stromkreis").',
      'Kombination aus bildunterstützten Aufgaben, Zuordnungen, Lückentexten und kurzen Erklärfragen.',
    ],
    grades: {
      1: {
        grade: 1,
        schwerpunkte: [
          'Schulumgebung, Schulhaus und Schulgemeinschaft',
          'Sicherer Schulweg & Verkehrserziehung (Ampel, Zebrastreifen, Links-Rechts-Schauen, Helle Kleidung)',
          'Jahreszeiten & Kalender (Frühling, Sommer, Herbst, Winter)',
          'Die 5 Sinne (Sehen, Hören, Riechen, Schmecken, Tasten/Fühlen)',
          'Haustiere und deren Bedürfnisse',
        ],
        kernkompetenzen: [
          'Verkehrszeichen und sichere Überquerungshilfen benennen',
          'Typische Wettererscheinungen und Naturveränderungen den Jahreszeiten zuordnen',
          'Sinnesorgane den entsprechenden Sinneseindrücken zuweisen',
          'Einfache Verhaltensregeln im Schulalltag begründen',
        ],
        fachbegriffe: [
          'Schulweg',
          'Ampel',
          'Zebrastreifen / Fußgängerüberweg',
          'Gehweg',
          'Reflektor',
          'Frühling, Sommer, Herbst, Winter',
          'Sinnesorgane (Auge, Ohr, Nase, Zunge, Haut)',
        ],
        lineaturEmpfehlung: {
          name: 'Lineatur 1 mit Bildunterstützung',
          beschreibung: 'Große Linien mit Symbolen und Bildern zum Ausmalen und Ankreuzen.',
          liniengroesse: '15 mm',
          hilfslinien: 'Bild-Wort-Pfeile',
        },
        schreibhilfen: [
          'Bildkarten zum Zuordnen',
          'Ankreuzkästchen statt langer Schreibtexte',
          'Farbiges Kennzeichnen (z. B. Rote Ampel / Grüne Ampel)',
        ],
      },
      2: {
        grade: 2,
        schwerpunkte: [
          'Mein Heimatort / Wohnort (Wichtige Einrichtungen, Rathaus, Post, Feuerwehr)',
          'Heimische Tiere im Winter (Überwinterungsstrategien: Winterschlaf, Winterruhe, Winterstarre, Zug- und Standvögel)',
          'Pflanzen im Frühling (Frühblüher: Schneeglöckchen, Tulpe, Narzisse; Zwiebel, Knolle)',
          'Gesunde Ernährung (Ernährungspyramide) und Zahnpflege (Milchgebiss, KAI-Putztechnik)',
          'Wiese und Hecke als Lebensräume',
        ],
        kernkompetenzen: [
          'Überwinterungsformen heimischer Tiere präzise unterscheiden und Tierbeispielen zuordnen',
          'Aufbau eines Frühblühers mit Zwiebel, Knolle, Stängel und Blüte beschreiben',
          'Lebensmittel anhand der Ernährungspyramide bewerten',
          'Die Zähne des menschlichen Gebisses benennen und Zahnpflegeregeln erklären',
        ],
        fachbegriffe: [
          'Winterschlaf (z. B. Igel, Siebenschläfer)',
          'Winterruhe (z. B. Eichhörnchen, Dachs)',
          'Winterstarre (z. B. Frosch, Eidechse)',
          'Zugvögel & Standvögel',
          'Frühblüher (Tulpe, Schneeglöckchen)',
          'Zwiebel, Knolle, Blüte, Stängel, Wurzel',
          'Ernährungspyramide',
          'Milchzähne, Backenzähne, Schneidezähne, Karies',
        ],
        lineaturEmpfehlung: {
          name: 'Lineatur 2',
          beschreibung: '4-Linien-System mit kurzen Antwortzeilen.',
          liniengroesse: '12 mm',
          hilfslinien: 'Vorgegebene Wortspeicher-Kästen',
        },
        schreibhilfen: [
          'Wortspeicher mit vorgegebenen Fachwörtern',
          'Vergleichstabellen (z. B. Winterschlaf vs. Winterruhe)',
          'Beschriftungspfeile an Pflanzen- und Zahndiagrammen',
        ],
      },
      3: {
        grade: 3,
        schwerpunkte: [
          'Der Wasserkreislauf (Verdunsten, Kondensieren, Niederschlag, Versickern, Grundwasser)',
          'Die 3 Aggregatzustände des Wassers (fest/Eis, flüssig/Wasser, gasförmig/Wasserdampf)',
          'Der Wald und seine Bedeutung (Die 5 Stockwerke des Waldes, Laub- und Nadelbäume, Fotosynthese einfach erklärt)',
          'Feuer und Feuerwehr (Verbrennungsdreieck: Brennstoff, Sauerstoff, Zündtemperatur; Notruf 112: 5 W-Fragen)',
          'Zeit und Geschichte: Zeitleiste, Schule früher und heute',
        ],
        kernkompetenzen: [
          'Die Stationen des Wasserkreislaufs fachsprachlich korrekt erklären (Verdunstung, Kondensation)',
          'Die Stockwerke des Waldes von unten nach oben benennen und Pflanzen sowie Tieren zuweisen',
          'Bedingungen für ein Feuer anhand des Verbrennungsdreiecks beschreiben und Löschmethoden ableiten',
          'Einen vollständigen Notruf (112) mit den W-Fragen formulieren',
        ],
        fachbegriffe: [
          'Wasserkreislauf',
          'Verdunsten / Verdunstung',
          'Kondensieren / Kondensation',
          'Aggregatzustand (flüssig, fest, gasförmig)',
          'Grundwasser, Niederschlag',
          'Stockwerke des Waldes: Wurzelschicht, Moosschicht, Krautschicht, Strauchschicht, Baumschicht',
          'Laubbaum, Nadelbaum, Mischwald',
          'Verbrennungsdreieck (Brennstoff, Wärme/Zündtemperatur, Sauerstoff)',
          'Notruf 112 (Wo? Wer? Was? Wie viele? Warten!)',
        ],
        lineaturEmpfehlung: {
          name: 'Lineatur 3',
          beschreibung: '3,5 mm Zeilenabstand für strukturierte Erklärsätze.',
          liniengroesse: '3,5 mm',
          hilfslinien: 'Lückentexte mit Fachbegriffen',
        },
        schreibhilfen: [
          'Wortspeicher mit Pflichtbegriffen für Lückentexte',
          'Ursache-Wirkung-Pfeile (Wenn Wasser kocht → entsteht Wasserdampf)',
          'Schichten-Schema für die Stockwerke des Waldes',
        ],
      },
      4: {
        grade: 4,
        schwerpunkte: [
          'Heimatraum Bayern (Die 7 Regierungsbezirke, Landeshauptstadt München, Landschaften: Alpen, Alpenvorland, Mittelgebirge; Flüsse & Seen: Donau, Main, Isar, Bodensee)',
          'Strom und Stromkreis (Einfacher Stromkreis, Stromquelle, Leiter wie Kupfer/Eisen und Nichtleiter/Isolatoren wie Holz/Kunststoff, Schalter, Gefahren des Stroms, Erneuerbare Energien)',
          'Sinnesorgane vertieft: Das Auge (Hornhaut, Pupille, Linse, Netzhaut) und das Ohr (Trommelfell, Gehörknöchelchen)',
          'Gemeinde und Demokratie (Aufgaben der Gemeinde, Bürgermeister/in, Gemeinderat)',
          'Mittelalter & Geschichte in der Region (Ritter, Burgen, Stadtleben im Mittelalter)',
        ],
        kernkompetenzen: [
          'Geografische Orientierung auf der Bayernkarte (Regierungsbezirke und Nachbarländer benennen)',
          'Einen funktionierenden Stromkreis aufbauen, Leiter und Isolatoren unterscheiden und Schaltpläne zeichnen',
          'Die Funktionsweise von Auge oder Ohr anhand von Modellskizzen erklären',
          'Aufgaben der kommunalen Selbstverwaltung (Pflichtaufgaben vs. freiwillige Aufgaben) unterscheiden',
        ],
        fachbegriffe: [
          'Regierungsbezirk (z. B. Oberbayern, Mittelfranken, Schwaben...)',
          'Landeshauptstadt München',
          'Freistaat Bayern, Nachbarländer',
          'Stromkreis, Stromquelle, Verbraucher, Schalter',
          'Leiter, Nichtleiter / Isolator',
          'Erneuerbare Energien (Sonne, Wind, Wasser)',
          'Auge: Hornhaut, Linse, Pupille, Netzhaut, Sehnerv',
          'Ohr: Trommelfell, Gehörknöchelchen, Schnecke, Hörnerv',
          'Gemeinderat, Bürgermeister/in, Gemeindehaushalt',
        ],
        lineaturEmpfehlung: {
          name: 'Lineatur 4',
          beschreibung: '1 Linie mit Rand für zusammenhängende Sacherklärungen.',
          liniengroesse: '9 mm',
          hilfslinien: 'Schaltplan- und Kartenskizzen-Felder',
        },
        schreibhilfen: [
          'Wortspeicher-Box mit verbindlichen Fachausdrücken',
          'Schaltplan-Symbole (Lampe, Batterie, Schalter, Leitungsdraht)',
          'Begründungsmuster ("Ein Stromkreis ist nur geschlossen, wenn...")',
        ],
      },
    },
  },
}

// ── 4. HELPER-FUNKTIONEN FÜR PROMPTS & VALIDIERUNG ──────────────

/**
 * Normalisiert ein vom Benutzer gewähltes Schulfach auf das primäre Lehrplan-Fach.
 */
export function normalizePrimarySubject(rawSubject?: string): PrimarySubject {
  if (!rawSubject) return 'Deutsch'
  const lower = rawSubject.toLowerCase()
  if (lower.includes('mathe') || lower.includes('rechnen')) return 'Mathematik'
  if (
    lower.includes('sach') ||
    lower.includes('hsu') ||
    lower.includes('heimat') ||
    lower.includes('natur')
  ) {
    return 'HSU'
  }
  return 'Deutsch'
}

/**
 * Normalisiert eine Jahrgangsstufe auf 1, 2, 3 oder 4.
 */
export function normalizePrimaryGrade(rawGrade?: string | number): PrimaryGrade {
  if (!rawGrade) return 3
  const str = String(rawGrade).trim()
  if (str.includes('1')) return 1
  if (str.includes('2')) return 2
  if (str.includes('4')) return 4
  return 3 // Standardklasse 3
}

/**
 * Holt die spezifischen Lehrplan-Daten für ein Fach und eine Klasse.
 */
export function getCurriculumData(rawSubject?: string, rawGrade?: string | number): {
  subjectData: SubjectCurriculum
  gradeData: GradeCurriculum
} {
  const subjectKey = normalizePrimarySubject(rawSubject)
  const gradeKey = normalizePrimaryGrade(rawGrade)
  const subjectData = LEHRPLAN_PLUS_GRUNDSCHULE[subjectKey]
  const gradeData = subjectData.grades[gradeKey]
  return { subjectData, gradeData }
}

/**
 * Generiert einen prägnanten, didaktisch wasserdichten Prompt-Zusatz
 * für das KI-Backend auf Basis des LehrplanPLUS Bayern.
 */
export function getCurriculumPromptGuidelines(
  rawSubject?: string,
  rawGrade?: string | number,
  topic?: string
): string {
  const { subjectData, gradeData } = getCurriculumData(rawSubject, rawGrade)
  const grade = gradeData.grade

  const allowedOps = GRUNDSCHUL_OPERATOREN.filter((o) => {
    if (subjectData.subject === 'Mathematik') {
      return (
        o.operator.includes('berechne') ||
        o.operator.includes('vergleiche') ||
        o.operator.includes('ergänze') ||
        o.operator.includes('ordne') ||
        o.operator.includes('finde')
      )
    }
    if (subjectData.subject === 'HSU') {
      return (
        o.operator.includes('nenne') ||
        o.operator.includes('ordne') ||
        o.operator.includes('beschreibe') ||
        o.operator.includes('begründe') ||
        o.operator.includes('kreuze') ||
        o.operator.includes('ergänze') ||
        o.operator.includes('verbinde')
      )
    }
    return (
      o.operator.includes('nenne') ||
      o.operator.includes('ordne') ||
      o.operator.includes('beschreibe') ||
      o.operator.includes('markiere') ||
      o.operator.includes('ergänze') ||
      o.operator.includes('schreibe') ||
      o.operator.includes('verbinde')
    )
  })

  const allowedOpsStr = allowedOps
    .map((o) => `"${o.operator}" (${o.beschreibung.split('.')[0]})`)
    .join(', ')

  const forbiddenOpsStr = AUSGESCHLOSSENE_OPERATOREN.map(
    (o) => `"${o.operator}" (stattdessen: ${o.grundschulAlternative})`
  ).join(', ')

  return `
--- DIDAKTISCHER LEHRPLAN-ABGLEICH (LehrplanPLUS Bayern, Grundschule Klasse ${grade}): ---
1. FACH & KLASSE: ${subjectData.bezeichnung} – Jahrgangsstufe ${grade}.
2. SACHLICHER TITEL: Verwende einen klaren, fachlich korrekten Grundschultitel (z. B. passend zu "${topic || 'Unterrichtsthema'}"). Absolutes Verbot für künstliche Verniedlichungen wie "...-Party", "...-Abenteuer" oder "Zauber-..."!
3. VERBINDLICHE OPERATOREN (VERWENDEN):
   Nutze für Aufgabenstellungen ausschließlich Grundschul-Operatoren: ${allowedOpsStr}.
4. AUSGESCHLOSSENE OPERATOREN (STRENG VERBOTEN):
   Folgende Sekundarstufen-Operatoren sind strikt unzulässig: ${forbiddenOpsStr}.
5. KERNKOMPETENZEN KLASSE ${grade}:
   ${gradeData.kernkompetenzen.map((k) => `- ${k}`).join('\n   ')}
6. ERLAUBTES FACHVOKABULAR & FACHBEGRIFFE (LehrplanPLUS):
   Verwende stufengerechte Fachbegriffe: ${gradeData.fachbegriffe.join(', ')}.
   Verwende KEINERLEI universitäre oder Sekundarstufen-Terminologie!
7. SCHREIBHILFEN & LINEATUR:
   - Empfohlen: ${gradeData.lineaturEmpfehlung.name} (${gradeData.lineaturEmpfehlung.beschreibung}).
   - Didaktische Hilfestellungen: ${gradeData.schreibhilfen.join(' · ')}.
${subjectData.subject === 'Mathematik' ? `   - Rechenkästchen-Raster: ${gradeData.rechenraster || '5mm Karos'}.` : ''}
------------------------------------------------------------------------------------------
`.trim()
}
