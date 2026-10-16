/**
 * LEHRPLANPLUS BAYERN – MATHEMATIK KATALOG (KLASSEN 1–4)
 * Strukturierte Lehrplan-Matrix mit verbindlichen Themen, Zahlenräumen,
 * erlaubten Rechenoperationen, Regeln und zulässigen Aufgabentypen.
 */

export interface MatheThema {
  id: string
  label: string
  zahlenraum: number
  operationen: string[]
  regeln: string[]
  erlaubteAufgabentypen: string[]
}

export const LEHRPLAN_MATHE: Record<number, MatheThema[]> = {
  1: [
    {
      id: "k1_zr10_zerlegung",
      label: "Zahlenraum bis 10: Zahlzerlegung & Verliebte Zahlen zur 10",
      zahlenraum: 10,
      operationen: ["+"],
      regeln: ["Zahlenzerlegung (Schüttelbox)", "Partnerzahlen / Verliebte Zahlen zur 10", "Kraft der 5"],
      erlaubteAufgabentypen: ["kopfrechnen", "rechendreiecke", "rechenhaeuser", "zahlenmauern", "zwanzigerfeld", "punktefeld", "schuettelboxen", "aufgabenfamilien", "textaufgaben", "rechengeschichten"]
    },
    {
      id: "k1_zr10_plusminus",
      label: "Zahlenraum bis 10: Plus- und Minusaufgaben",
      zahlenraum: 10,
      operationen: ["+", "-"],
      regeln: ["Ergebnisse und Startwerte maximal 10", "Verbinden von Addition und Subtraktion"],
      erlaubteAufgabentypen: ["kopfrechnen", "zwanzigerfeld", "punktefeld", "aufgabenfamilien", "groesser_kleiner_gleich", "nachbarzahlen", "textaufgaben", "rechengeschichten"]
    },
    {
      id: "k1_zr20_orientierung",
      label: "Zahlenraum bis 20: Vorgänger, Nachfolger & Zahlenstrahl",
      zahlenraum: 20,
      operationen: [],
      regeln: ["Zahlenraum bis 20", "Vorgänger und Nachfolger", "Zahlen vergleichen (< > =)"],
      erlaubteAufgabentypen: ["nachbarzahlen", "groesser_kleiner_gleich"]
    },
    {
      id: "k1_zr20_ohne_uebergang",
      label: "Zahlenraum bis 20: Plus und Minus (ohne Zehnerübergang)",
      zahlenraum: 20,
      operationen: ["+", "-"],
      regeln: ["Kein Zehnerübergang (z. B. 12 + 3 = 15, 17 - 4 = 13)", "Zwerg- und Riesenaufgaben"],
      erlaubteAufgabentypen: ["kopfrechnen", "zwanzigerfeld", "punktefeld", "aufgabenfamilien", "nachbarzahlen", "groesser_kleiner_gleich", "zahlenmauern", "rechendreiecke", "rechenhaeuser", "textaufgaben", "rechengeschichten"]
    },
    {
      id: "k1_zr20_verdoppeln_halbieren",
      label: "Zahlenraum bis 20: Verdoppeln und Halbieren",
      zahlenraum: 20,
      operationen: ["+", "-"],
      regeln: ["Gerade Zahlen bis 20 halbieren", "Zahlen bis 10 verdoppeln"],
      erlaubteAufgabentypen: ["kopfrechnen", "zwanzigerfeld", "punktefeld", "groesser_kleiner_gleich", "textaufgaben", "rechengeschichten"]
    },
    {
      id: "k1_zr20_mit_uebergang",
      label: "Zahlenraum bis 20: Mit Zehnerübergang (über die 10)",
      zahlenraum: 20,
      operationen: ["+", "-"],
      regeln: ["Zehnerübergang (z. B. 8 + 5, 14 - 7)", "Schrittweises Rechnen über den Zehner"],
      erlaubteAufgabentypen: ["kopfrechnen", "zwanzigerfeld", "punktefeld", "zehnerstopp", "aufgabenfamilien", "zahlenmauern", "rechendreiecke", "rechenhaeuser", "textaufgaben", "rechengeschichten"]
    },
    {
      id: "k1_geld",
      label: "Größen: Euro und Cent (Münzen und Scheine bis 20 €)",
      zahlenraum: 20,
      operationen: ["+", "-"],
      regeln: ["Nur Münzen (1ct bis 2€) und Scheine (5€, 10€, 20€)", "Geldbeträge bündeln und vergleichen"],
      erlaubteAufgabentypen: ["geld_zaehlen", "geld_rechnen", "geld_vergleich", "kopfrechnen", "groesser_kleiner_gleich"]
    },
    {
      id: "k1_geometrie_formen",
      label: "Geometrie: Formen erkennen & Muster fortsetzen",
      zahlenraum: 20,
      operationen: [],
      regeln: ["Formen: Kreis, Dreieck, Viereck/Rechteck, Quadrat", "Musterfolgen fortführen"],
      erlaubteAufgabentypen: ["geometrie_formen_zaehlen", "geometrie_muster_fortsetzen", "geometrie_punktgitter", "geometrie"]
    },
    {
      id: "k1_groessen_zeit",
      label: "Größen: Zeit & Uhrzeit (volle Stunden, Wochentage)",
      zahlenraum: 24,
      operationen: [],
      regeln: ["Nur volle Stunden an der analogen Uhr", "Tageszeiten und Wochentage ordnen", "Keine Minuten/Sekunden"],
      erlaubteAufgabentypen: ["uhrzeit_ablesen", "uhrzeit_zeichnen", "uhrzeit_rechnen", "kopfrechnen", "groesser_kleiner_gleich"]
    },
    {
      id: "k1_geometrie_lage",
      label: "Geometrie: Lagebeziehungen (rechts/links, oben/unten)",
      zahlenraum: 20,
      operationen: [],
      regeln: ["Begriffe: rechts, links, oben, unten, vor, hinter, zwischen", "Orientierung auf dem Karofeld"],
      erlaubteAufgabentypen: ["raum_gitter_orientierung", "raum_pfeile_zaehlen", "raum_gitter_zeichnen", "geometrie"]
    },
    {
      id: "k1_daten_strichlisten",
      label: "Daten & Zufall: Strichlisten & einfache Häufigkeiten",
      zahlenraum: 20,
      operationen: ["+"],
      regeln: ["5er-Bündelung bei Strichlisten", "Einfache Zählaufgaben aus dem Alltag"],
      erlaubteAufgabentypen: ["strichliste_ablesen", "strichliste_zeichnen", "strichliste_zaehlen", "kopfrechnen"]
    }
  ],
  2: [
    {
      id: 'k2_zr100_orientierung',
      label: 'Zahlenraum bis 100: Hunderterfeld, Zehner & Einer',
      zahlenraum: 100,
      operationen: [],
      regeln: ['Zehner und Einer (Z, E)', 'Hundertertafel', 'Vorgänger und Nachfolger'],
      erlaubteAufgabentypen: ['hundertertafel', 'nachbarzahlen', 'groesser_kleiner_gleich', 'kopfrechnen'],
    },
    {
      id: 'k2_zr100_plusminus',
      label: 'Zahlenraum bis 100: Addition & Subtraktion',
      zahlenraum: 100,
      operationen: ['+', '-'],
      regeln: ['Zahlenraum bis 100', 'Zehner und Einer', 'Halbschriftliche Zwischenschritte'],
      erlaubteAufgabentypen: ['halbschriftlich', 'kopfrechnen', 'zahlenmauern', 'groesser_kleiner_gleich', 'rechendreiecke', 'rechenhaeuser'],
    },
    {
      id: 'k2_einmaleins_kern',
      label: 'Kleines 1x1: Kernaufgaben (2er, 5er, 10er Reihe)',
      zahlenraum: 100,
      operationen: ['*'],
      regeln: ['Nur Faktoren aus den Kernreihen (2, 5, 10)', 'Tauschaufgaben'],
      erlaubteAufgabentypen: ['einmaleins', 'kopfrechnen', 'sachaufgaben', 'groesser_kleiner_gleich'],
    },
    {
      id: 'k2_division_umkehr',
      label: 'Kleines 1x1 & Division (als Umkehrung, ohne Rest)',
      zahlenraum: 100,
      operationen: ['*', '/'],
      regeln: ['Division strikt ohne Rest', 'Teiler und Faktoren aus 1x1 (1-10)', 'Keine Division durch 0'],
      erlaubteAufgabentypen: ['einmaleins', 'kopfrechnen', 'sachaufgaben', 'groesser_kleiner_gleich'],
    },
    {
      id: 'k2_geld_komma',
      label: 'Größen: Geld mit Komma (€ & ct bis 100 €)',
      zahlenraum: 100,
      operationen: ['+', '-'],
      regeln: ['Euro und Cent mit Komma z. B. 4,50 €', 'Scheine und Münzen bis 100 €'],
      erlaubteAufgabentypen: ['geld_komma', 'kopfrechnen', 'groesser_kleiner_gleich'],
    },
    {
      id: 'k2_laengen_messen',
      label: 'Größen: Längen messen (Meter und Zentimeter)',
      zahlenraum: 100,
      operationen: ['+', '-'],
      regeln: ['1 m = 100 cm', 'Strecken mit dem Lineal ablesen'],
      erlaubteAufgabentypen: ['laengen_messen', 'einheiten_umrechnen', 'sachaufgaben', 'groesser_kleiner_gleich'],
    },
    {
      id: 'k2_geometrie_koerper',
      label: 'Geometrie: Körperformen & Symmetrie',
      zahlenraum: 100,
      operationen: [],
      regeln: ['Körper: Würfel, Quader, Kugel, Zylinder, Pyramide', 'Ecken, Kanten, Flächen', 'Achsensymmetrie'],
      erlaubteAufgabentypen: ['geometrie_koerper', 'geometrie'],
    },
  ],
  3: [
    {
      id: 'k3_zr1000_halbschriftlich',
      label: 'Zahlenraum bis 1.000: Halbschriftliche Grundrechenarten',
      zahlenraum: 1000,
      operationen: ['+', '-', '*', '/'],
      regeln: ['Halbschriftliche Rechenwege', 'Division mit und ohne Rest', 'Zahlenraum bis 1000'],
      erlaubteAufgabentypen: ['kopfrechnen', 'sachaufgaben', 'zahlenmauern', 'groesser_kleiner_gleich'],
    },
    {
      id: 'k3_groessen_einheiten',
      label: 'Größen & Einheiten: Gewichte (kg, g), Längen (km, m, mm), Geld (€, ct)',
      zahlenraum: 1000,
      operationen: ['+', '-', '*'],
      regeln: ['Einheiten umrechnen', 'Einfache Kommaschreibweise bei Geld'],
      erlaubteAufgabentypen: ['einheiten_umrechnen', 'sachaufgaben', 'tabellen'],
    },
  ],
  4: [
    {
      id: 'k4_zr1m_schriftlich',
      label: 'Zahlenraum bis 1.000.000: Schriftliche Rechenverfahren',
      zahlenraum: 1000000,
      operationen: ['+', '-', '*', '/'],
      regeln: ['Schriftliche Addition, Subtraktion, Multiplikation und Division'],
      erlaubteAufgabentypen: ['kopfrechnen', 'sachaufgaben', 'groesser_kleiner_gleich'],
    },
    {
      id: 'k4_sachaufgaben_hohlmasse',
      label: 'Größen, Hohlmaße (l, ml) & komplexe Sachaufgaben',
      zahlenraum: 1000000,
      operationen: ['+', '-', '*', '/'],
      regeln: ['Mehrschrittige Textaufgaben mit Frage, Rechnung, Antwort', 'Hohlmaße und Gewichte'],
      erlaubteAufgabentypen: ['sachaufgaben', 'einheiten_umrechnen', 'tabellen'],
    },
  ],
}

/**
 * Holt alle Themen für eine bestimmte Jahrgangsstufe (1-4).
 */
export function getMatheThemenForGrade(grade: number): MatheThema[] {
  return LEHRPLAN_MATHE[grade] || LEHRPLAN_MATHE[2] || []
}

/**
 * Findet ein Mathe-Thema anhand der ID oder des Labels.
 */
export function findMatheThema(grade: number, themaQueryOrId: string): MatheThema | undefined {
  const themen = getMatheThemenForGrade(grade)
  const norm = (themaQueryOrId || '').toLowerCase().trim()
  
  // 1. Exakter ID-Match
  const byId = themen.find((t) => t.id === themaQueryOrId)
  if (byId) return byId

  // 2. Exakter oder enthaltener Label-Match
  const byLabel = themen.find((t) => t.label.toLowerCase() === norm || t.label.toLowerCase().includes(norm))
  if (byLabel) return byLabel

  // 3. Match über alle Klassen hinweg
  for (const g of [1, 2, 3, 4]) {
    const list = LEHRPLAN_MATHE[g] || []
    const match = list.find((t) => t.id === themaQueryOrId || t.label.toLowerCase().includes(norm))
    if (match) return match
  }

  return undefined
}
