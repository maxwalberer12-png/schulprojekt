export interface LehrplanEintrag {
  id: string;
  klasse: 1 | 2 | 3 | 4;
  bereich: "Zahlen und Operationen" | "Raum und Form" | "Größen und Messen" | "Daten und Zufall";
  titel: string;
  kompetenzText: string;
  keywords: string[];
  zahlenraum: number;
  erlaubteOperationen: string[];
  verboteneOperationen: string[];
  didaktischeRegeln: string[];
  erlaubteAufgabentypen: string[];
}

export const LEHRPLANPLUS_MATHE_DATENBANK: LehrplanEintrag[] = [
  // ==========================================
  // KLASSE 1
  // ==========================================
  // 1. Zahlen und Operationen
  {
    id: "by_k1_zr10_zerlegung",
    klasse: 1,
    bereich: "Zahlen und Operationen",
    titel: "Zahlenraum bis 10: Zahlzerlegung & Verliebte Zahlen",
    kompetenzText: "Die Schülerinnen und Schüler zerlegen Zahlen additiv (u. a. Zahlzerlegungen der Zehn/Partnerzahlen) und nutzen diese Zahlzerlegungen automatisiert für das flexible Rechnen.",
    keywords: ["verliebte zahlen", "partnerzahlen", "zerlegen", "schüttelbox", "zerlegung", "bis 10", "zehnzerlegung"],
    zahlenraum: 10,
    erlaubteOperationen: ["+"],
    verboteneOperationen: ["-", "*", "/"],
    didaktischeRegeln: ["Nur Zahlen bis 10", "Schwerpunkt Partnerzahlen zur 10 (1+9, 2+8 etc.)", "Kraft der 5"],
    erlaubteAufgabentypen: ["kopfrechnen", "rechendreiecke", "rechenhaeuser", "zahlenmauern", "zwanzigerfeld", "punktefeld", "schuettelboxen", "aufgabenfamilien", "textaufgaben", "rechengeschichten"]
  },
  {
    id: "by_k1_zr10_plusminus",
    klasse: 1,
    bereich: "Zahlen und Operationen",
    titel: "Zahlenraum bis 10: Addition und Subtraktion",
    kompetenzText: "Die Schülerinnen und Schüler lösen Additions- und Subtraktionsaufgaben im Zahlenraum bis 10 im Kopf unter Nutzung grundlegender Rechenstrategien.",
    keywords: ["plus und minus bis 10", "rechnen bis 10", "addition bis 10", "subtraktion bis 10"],
    zahlenraum: 10,
    erlaubteOperationen: ["+", "-"],
    verboteneOperationen: ["*", "/"],
    didaktischeRegeln: ["Ergebnisse und Startwerte maximal 10", "Keine negativen Zahlen"],
    erlaubteAufgabentypen: ["kopfrechnen", "zwanzigerfeld", "punktefeld", "aufgabenfamilien", "groesser_kleiner_gleich", "nachbarzahlen", "textaufgaben", "rechengeschichten"]
  },
  {
    id: "by_k1_zr20_orientierung",
    klasse: 1,
    bereich: "Zahlen und Operationen",
    titel: "Zahlenraum bis 20: Vorgänger, Nachfolger & Zahlenstrahl",
    kompetenzText: "Die Schülerinnen und Schüler orientieren sich im Zahlenraum bis 20, bestimmen Vorgänger und Nachfolger und ordnen Zahlen auf dem Zahlenstrahl.",
    keywords: ["vorgänger", "nachfolger", "nachbarzahlen", "zahlenstrahl", "orientierung bis 20"],
    zahlenraum: 20,
    erlaubteOperationen: [],
    verboteneOperationen: ["*", "/"],
    didaktischeRegeln: ["Zahlenraum bis 20", "Vergleichszeichen <, >, =", "Nachbarzahlen"],
    erlaubteAufgabentypen: ["nachbarzahlen", "groesser_kleiner_gleich"]
  },
  {
    id: "by_k1_zr20_ohne_uebergang",
    klasse: 1,
    bereich: "Zahlen und Operationen",
    titel: "Zahlenraum bis 20: Ohne Zehnerübergang",
    kompetenzText: "Die Schülerinnen und Schüler rechnen im Zahlenraum bis 20 ohne Zehnerüberschreitung unter Nutzung von Zwerg- und Riesenaufgaben.",
    keywords: ["ohne zehnerübergang", "zwergaufgaben", "riesenaufgaben", "plus minus bis 20"],
    zahlenraum: 20,
    erlaubteOperationen: ["+", "-"],
    verboteneOperationen: ["*", "/"],
    didaktischeRegeln: ["Kein Zehnerübergang (z. B. 12 + 3 = 15, 17 - 4 = 13)", "Ergebnisse max 20"],
    erlaubteAufgabentypen: ["kopfrechnen", "zwanzigerfeld", "punktefeld", "aufgabenfamilien", "nachbarzahlen", "groesser_kleiner_gleich", "zahlenmauern", "rechendreiecke", "rechenhaeuser", "textaufgaben", "rechengeschichten"]
  },
  {
    id: "by_k1_zr20_verdoppeln_halbieren",
    klasse: 1,
    bereich: "Zahlen und Operationen",
    titel: "Zahlenraum bis 20: Verdoppeln und Halbieren",
    kompetenzText: "Die Schülerinnen und Schüler verdoppeln Zahlen bis 10 und halbieren gerade Zahlen bis 20.",
    keywords: ["verdoppeln", "halbieren", "gerade ungerade", "doppelte"],
    zahlenraum: 20,
    erlaubteOperationen: ["+", "-"],
    verboteneOperationen: ["*", "/"],
    didaktischeRegeln: ["Verdoppeln bis 10", "Halbieren gerader Zahlen bis 20"],
    erlaubteAufgabentypen: ["kopfrechnen", "zwanzigerfeld", "punktefeld", "groesser_kleiner_gleich", "textaufgaben", "rechengeschichten"]
  },
  {
    id: "by_k1_zr20_mit_uebergang",
    klasse: 1,
    bereich: "Zahlen und Operationen",
    titel: "Zahlenraum bis 20: Mit Zehnerübergang",
    kompetenzText: "Die Schülerinnen und Schüler vollziehen den Zehnerübergang schrittweise über die 10.",
    keywords: ["mit zehnerübergang", "über die 10", "zehnerüberschreitung", "schrittweises rechnen"],
    zahlenraum: 20,
    erlaubteOperationen: ["+", "-"],
    verboteneOperationen: ["*", "/"],
    didaktischeRegeln: ["Zehnerübergang (z. B. 8 + 5 = 8 + 2 + 3 = 13, 14 - 7)", "Ergebnisse max 20"],
    erlaubteAufgabentypen: ["kopfrechnen", "zwanzigerfeld", "punktefeld", "zehnerstopp", "aufgabenfamilien", "zahlenmauern", "rechendreiecke", "rechenhaeuser", "textaufgaben", "rechengeschichten"]
  },
  // 2. Raum und Form
  {
    id: "by_k1_raum_lage",
    klasse: 1,
    bereich: "Raum und Form",
    titel: "Geometrie: Raumorientierung & Lagebeziehungen",
    kompetenzText: "Die Schülerinnen und Schüler beschreiben die Lage von Objekten im Raum und auf Abbildungen mit Begriffen wie rechts, links, oben, unten, vor, hinter.",
    keywords: ["rechts links", "oben unten", "lagebeziehungen", "raumorientierung"],
    zahlenraum: 20,
    erlaubteOperationen: [],
    verboteneOperationen: ["*", "/"],
    didaktischeRegeln: ["Fokus auf Lagebegriffe", "Orientierung auf Raster"],
    erlaubteAufgabentypen: ["raum_gitter_orientierung", "raum_pfeile_zaehlen", "raum_gitter_zeichnen", "geometrie"]
  },
  {
    id: "by_k1_raum_formen",
    klasse: 1,
    bereich: "Raum und Form",
    titel: "Geometrie: Ebene Formen & Muster",
    kompetenzText: "Die Schülerinnen und Schüler erkennen, benennen und zeichnen Kreis, Dreieck, Viereck/Rechteck und Quadrat und setzen Musterfolgen fort.",
    keywords: ["geometrie", "formen", "kreis", "dreieck", "viereck", "quadrat", "muster", "parkettieren"],
    zahlenraum: 20,
    erlaubteOperationen: [],
    verboteneOperationen: ["*", "/"],
    didaktischeRegeln: ["Grundformen unterscheiden", "Logische Folgen fortsetzen"],
    erlaubteAufgabentypen: ["geometrie_formen_zaehlen", "geometrie_muster_fortsetzen", "geometrie_punktgitter", "geometrie"]
  },
  // 3. Größen und Messen
  {
    id: "by_k1_groessen_geld",
    klasse: 1,
    bereich: "Größen und Messen",
    titel: "Größen: Euro und Cent (bis 20 €)",
    kompetenzText: "Die Schülerinnen und Schüler bestimmen und vergleichen Geldbeträge bis 20 Euro unter Verwendung von Münzen und Scheinen.",
    keywords: ["geld", "euro", "cent", "münzen", "scheine", "bezahlen"],
    zahlenraum: 20,
    erlaubteOperationen: ["+", "-"],
    verboteneOperationen: ["*", "/", "Kommazahlen"],
    didaktischeRegeln: ["Nur Euro und Cent getrennt (kein Komma)", "Beträge bis 20 €"],
    erlaubteAufgabentypen: ["geld_zaehlen", "geld_rechnen", "geld_vergleich", "kopfrechnen", "groesser_kleiner_gleich"]
  },
  {
    id: "by_k1_groessen_zeit",
    klasse: 1,
    bereich: "Größen und Messen",
    titel: "Größen: Zeit & Uhrzeit (volle Stunden, Wochentage)",
    kompetenzText: "Die Schülerinnen und Schüler lesen volle Stunden auf analogen Uhren ab und ordnen Tageszeiten sowie Wochentage.",
    keywords: ["uhr", "uhrzeit", "volle stunde", "wochentage", "gestern heute morgen"],
    zahlenraum: 24,
    erlaubteOperationen: [],
    verboteneOperationen: ["*", "/"],
    didaktischeRegeln: ["Nur volle Stunden", "Wochentage der Reihe nach"],
    erlaubteAufgabentypen: ["uhrzeit_ablesen", "uhrzeit_zeichnen", "uhrzeit_rechnen", "kopfrechnen", "groesser_kleiner_gleich"]
  },
  // 4. Daten und Zufall
  {
    id: "by_k1_daten_strichlisten",
    klasse: 1,
    bereich: "Daten und Zufall",
    titel: "Daten & Zufall: Strichlisten & einfache Häufigkeiten",
    kompetenzText: "Die Schülerinnen und Schüler sammeln Daten aus ihrer Lebenswelt, stellen sie in Strichlisten mit Fünferbündelung dar und werten einfache Tabellen aus.",
    keywords: ["strichliste", "häufigkeit", "zählen", "fünferbündelung"],
    zahlenraum: 20,
    erlaubteOperationen: ["+"],
    verboteneOperationen: ["*", "/"],
    didaktischeRegeln: ["5er-Bündelung", "Einfache Zählaufgaben"],
    erlaubteAufgabentypen: ["strichliste_ablesen", "strichliste_zeichnen", "strichliste_zaehlen", "kopfrechnen"]
  },

  // ==========================================
  // KLASSE 2
  // ==========================================
  // 1. Zahlen und Operationen
  {
    id: "by_k2_zr100_orientierung",
    klasse: 2,
    bereich: "Zahlen und Operationen",
    titel: "Zahlenraum bis 100: Hunderterfeld, Zehner & Einer",
    kompetenzText: "Die Schülerinnen und Schüler orientieren sich im Zahlenraum bis 100, bündeln in Zehner und Einer und nutzen das Hunderterfeld.",
    keywords: ["hunderterfeld", "zehner einer", "stellenwert", "orientierung 100", "hundertertafel"],
    zahlenraum: 100,
    erlaubteOperationen: [],
    verboteneOperationen: ["*", "/"],
    didaktischeRegeln: ["Zehner- und Einerzerlegung (z. B. 47 = 4Z + 7E)", "Vorgänger/Nachfolger bis 100"],
    erlaubteAufgabentypen: ["hundertertafel", "nachbarzahlen", "groesser_kleiner_gleich", "kopfrechnen"]
  },
  {
    id: "by_k2_zr100_plusminus",
    klasse: 2,
    bereich: "Zahlen und Operationen",
    titel: "Zahlenraum bis 100: Addition & Subtraktion",
    kompetenzText: "Die Schülerinnen und Schüler rechnen im Zahlenraum bis 100 mit und ohne Zehnerüberschreitung unter Nutzung von Rechenstrategien.",
    keywords: ["plus minus 100", "addition 100", "subtraktion 100", "rechnen bis 100"],
    zahlenraum: 100,
    erlaubteOperationen: ["+", "-"],
    verboteneOperationen: ["*", "/"],
    didaktischeRegeln: ["Zahlenraum bis 100", "Halbschriftliche Zwischenschritte (erst Zehner, dann Einer)"],
    erlaubteAufgabentypen: ["halbschriftlich", "kopfrechnen", "zahlenmauern", "groesser_kleiner_gleich", "rechendreiecke", "rechenhaeuser"]
  },
  {
    id: "by_k2_einmaleins_kern",
    klasse: 2,
    bereich: "Zahlen und Operationen",
    titel: "Kleines 1x1: Kernaufgaben (2er, 5er, 10er Reihe)",
    kompetenzText: "Die Schülerinnen und Schüler automatisieren die Kernaufgaben der Multiplikation (2er, 5er, 10er Reihe, Quadratzahlen) sowie Tauschaufgaben.",
    keywords: ["kernaufgaben", "2er reihe", "5er reihe", "10er reihe", "tauschaufgaben", "quadrataufgaben"],
    zahlenraum: 100,
    erlaubteOperationen: ["*"],
    verboteneOperationen: ["/"],
    didaktischeRegeln: ["Nur Faktoren 2, 5, 10 sowie Quadratzahlen", "Tauschaufgaben anwenden"],
    erlaubteAufgabentypen: ["einmaleins", "kopfrechnen", "groesser_kleiner_gleich", "sachaufgaben"]
  },
  {
    id: "by_k2_einmaleins_alle",
    klasse: 2,
    bereich: "Zahlen und Operationen",
    titel: "Kleines 1x1: Alle Reihen & Division (ohne Rest)",
    kompetenzText: "Die Schülerinnen und Schüler automatisieren alle Reihen des kleinen 1x1 und lösen Divisionsaufgaben als Umkehrung ohne Rest.",
    keywords: ["einmaleins komplett", "alle reihen", "division", "geteilt", "umkehraufgabe"],
    zahlenraum: 100,
    erlaubteOperationen: ["*", "/"],
    verboteneOperationen: [],
    didaktischeRegeln: ["Alle 1x1-Reihen", "Division ausschließlich ohne Rest", "Keine Division durch 0"],
    erlaubteAufgabentypen: ["einmaleins", "kopfrechnen", "groesser_kleiner_gleich", "sachaufgaben"]
  },
  // 2. Raum und Form
  {
    id: "by_k2_raum_koerper",
    klasse: 2,
    bereich: "Raum und Form",
    titel: "Geometrie: Körperformen (Würfel, Quader, Kugel) & Symmetrie",
    kompetenzText: "Die Schülerinnen und Schüler erkennen und benennen geometrische Körper (Würfel, Quader, Kugel) und untersuchen achsensymmetrische Figuren.",
    keywords: ["körper", "würfel", "quader", "kugel", "symmetrie", "spiegelachse"],
    zahlenraum: 100,
    erlaubteOperationen: [],
    verboteneOperationen: ["*", "/"],
    didaktischeRegeln: ["Körpereigenschaften (Ecken, Kanten, Flächen)", "Achsensymmetrie an der Spiegelachse"],
    erlaubteAufgabentypen: ["geometrie_koerper", "geometrie", "geometrie_punktgitter"]
  },
  // 3. Größen und Messen
  {
    id: "by_k2_groessen_laengen",
    klasse: 2,
    bereich: "Größen und Messen",
    titel: "Größen: Längen (Meter und Zentimeter)",
    kompetenzText: "Die Schülerinnen und Schüler messen Strecken und Längen mit Lineal und Maßband und rechnen mit m und cm (1 m = 100 cm).",
    keywords: ["längen", "meter", "zentimeter", "strecken messen", "lineal"],
    zahlenraum: 100,
    erlaubteOperationen: ["+", "-"],
    verboteneOperationen: ["*", "/", "Kommazahlen"],
    didaktischeRegeln: ["Umrechnung 1 m = 100 cm", "Keine Kommaschreibweise"],
    erlaubteAufgabentypen: ["laengen_messen", "einheiten_umrechnen", "kopfrechnen", "groesser_kleiner_gleich"]
  },
  {
    id: "by_k2_groessen_geld",
    klasse: 2,
    bereich: "Größen und Messen",
    titel: "Größen: Geld mit Komma (€ & ct bis 100 €)",
    kompetenzText: "Die Schülerinnen und Schüler rechnen mit Geldbeträgen bis 100 Euro, verwenden die Kommaschreibweise (€ und ct) und vergleichen Geldbeträge.",
    keywords: ["geld", "euro", "cent", "kommaschreibweise", "geld klasse 2"],
    zahlenraum: 100,
    erlaubteOperationen: ["+", "-"],
    verboteneOperationen: ["*", "/"],
    didaktischeRegeln: ["Beträge bis 100 €", "Kommaschreibweise z. B. 4,50 €", "Zusammenzählen von Scheinen und Münzen"],
    erlaubteAufgabentypen: ["geld_komma", "kopfrechnen", "groesser_kleiner_gleich"]
  },
  {
    id: "by_k2_groessen_zeit",
    klasse: 2,
    bereich: "Größen und Messen",
    titel: "Größen: Zeit (Stunde und Minute, analog & digital)",
    kompetenzText: "Die Schülerinnen und Schüler lesen Uhrzeiten auf analogen und digitalen Uhren ab (halbe Stunde, Viertelstunde) und rechnen mit h und min.",
    keywords: ["uhrzeit klasse 2", "stunde minute", "viertel nach", "viertel vor", "halb", "digitaluhr"],
    zahlenraum: 60,
    erlaubteOperationen: ["+", "-"],
    verboteneOperationen: ["*", "/"],
    didaktischeRegeln: ["1 h = 60 min", "Viertelstunden, halbe Stunden, Dreiviertelstunden"],
    erlaubteAufgabentypen: ["kopfrechnen", "groesser_kleiner_gleich"]
  },
  // 4. Daten und Zufall
  {
    id: "by_k2_daten_diagramme",
    klasse: 2,
    bereich: "Daten und Zufall",
    titel: "Daten & Zufall: Tabellen, Steckbriefe & einfache Diagramme",
    kompetenzText: "Die Schülerinnen und Schüler entnehmen Daten aus einfachen Tabellen und Säulendiagrammen und stellen Daten eigenständig dar.",
    keywords: ["diagramm", "säulendiagramm", "tabelle klasse 2", "daten auswerten"],
    zahlenraum: 100,
    erlaubteOperationen: ["+", "-"],
    verboteneOperationen: ["*", "/"],
    didaktischeRegeln: ["Maximalwerte bis 100", "Einfache Säulendarstellungen"],
    erlaubteAufgabentypen: ["kopfrechnen"]
  },

  // ==========================================
  // KLASSE 3
  // ==========================================
  // 1. Zahlen und Operationen
  {
    id: "by_k3_zr1000_stellenwerte",
    klasse: 3,
    bereich: "Zahlen und Operationen",
    titel: "Zahlenraum bis 1.000: Stellenwerte (H-Z-E) & Zahlenstrahl",
    kompetenzText: "Die Schülerinnen und Schüler bauen den Zahlenraum bis 1.000 strukturiert auf, nutzen Stellenwerttafeln (H-Z-E), orientieren sich am Zahlenstrahl und runden auf Zehner und Hunderter.",
    keywords: ["stellenwerte", "hze", "tausenderbuch", "hunderterplatten", "dienes", "nachbarzahlen", "zahlenstrahl 1000", "runden"],
    zahlenraum: 1000,
    erlaubteOperationen: [],
    verboteneOperationen: [],
    didaktischeRegeln: ["H-Z-E Struktur", "Vorgänger, Nachfolger, Nachbarzehner, Nachbarhunderter", "Zahlenstrahl bis 1.000", "Runden auf Z und H"],
    erlaubteAufgabentypen: ["stellenwert_hze", "dienes_tausender", "nachbarzahlen_k3", "zahlenstrahl_1000", "runden_k3", "groesser_kleiner_ordnen_k3"]
  },
  {
    id: "by_k3_zr1000_halbschriftlich",
    klasse: 3,
    bereich: "Zahlen und Operationen",
    titel: "Zahlenraum bis 1.000: Halbschriftliches Rechnen & Kopfrechnen",
    kompetenzText: "Die Schülerinnen und Schüler rechnen im Zahlenraum bis 1.000 flexibel im Kopf sowie halbschriftlich in Schritten.",
    keywords: ["halbschriftlich", "kopfrechnen 1000", "zahlenmauern 1000", "rechendreiecke 1000"],
    zahlenraum: 1000,
    erlaubteOperationen: ["+", "-"],
    verboteneOperationen: [],
    didaktischeRegeln: ["Schrittweises Rechnen (erst H, dann Z, dann E)", "Kopfrechnen mit Zehnern und Hundertern"],
    erlaubteAufgabentypen: ["halbschriftlich_k3", "kopfrechnen_k3", "zahlenmauern_k3", "sachaufgaben_k3"]
  },
  {
    id: "by_k3_schriftlich_plusminus",
    klasse: 3,
    bereich: "Zahlen und Operationen",
    titel: "Schriftliche Addition & Subtraktion (mit Übertrag)",
    kompetenzText: "Die Schülerinnen und Schüler wenden die schriftliche Addition und Subtraktion im Kästchenraster mit Überträgen sicher an und nutzen Überschlagsrechnungen zur Kontrolle.",
    keywords: ["schriftliche addition", "schriftliche subtraktion", "übertrag", "kästchenraster", "fehlende ziffern", "überschlag"],
    zahlenraum: 1000,
    erlaubteOperationen: ["+", "-"],
    verboteneOperationen: [],
    didaktischeRegeln: ["Stellenwertgerechtes Karogitter H-Z-E", "Übertragszeile für Merkzahlen", "Überschlag zur Kontrolle"],
    erlaubteAufgabentypen: ["schriftlich_addition", "schriftlich_subtraktion", "schriftlich_fehlende_ziffern", "ueberschlag_kontrolle", "sachaufgaben_k3"]
  },
  {
    id: "by_k3_zehner_einmaleins",
    klasse: 3,
    bereich: "Zahlen und Operationen",
    titel: "Zehner-Einmaleins: Halbschriftliche Multiplikation & Division",
    kompetenzText: "Die Schülerinnen und Schüler nutzen das Zehner-Einmaleins und führen halbschriftliche Multiplikationen und Divisionen (auch mit Rest) zielgerichtet aus.",
    keywords: ["zehner-einmaleins", "halbschriftliche multiplikation", "halbschriftliche division", "division mit rest"],
    zahlenraum: 1000,
    erlaubteOperationen: ["*", "/"],
    verboteneOperationen: [],
    didaktischeRegeln: ["Analogien zum kleinen 1x1", "Zerlegung des zweistelligen Faktors", "Division mit Rest"],
    erlaubteAufgabentypen: ["zehner_einmaleins", "halbschriftlich_multiplikation", "halbschriftlich_division", "sachaufgaben_k3"]
  },
  // 2. Raum und Form
  {
    id: "by_k3_raum_geometrie",
    klasse: 3,
    bereich: "Raum und Form",
    titel: "Geometrie: Körpernetze, Würfelgebäude & Symmetrie",
    kompetenzText: "Die Schülerinnen und Schüler untersuchen Würfel- und Körpernetze, bauen Würfelgebäude nach Bauplan, prüfen rechte Winkel und parallele Linien und spiegeln Figuren.",
    keywords: ["würfelnetze", "körpernetze", "würfelgebäude", "bauplan", "rechter winkel", "parallele linien", "achsensymmetrie"],
    zahlenraum: 1000,
    erlaubteOperationen: [],
    verboteneOperationen: [],
    didaktischeRegeln: ["Körpernetze erkennen", "3D-Baupläne (Stockwerkzahlen)", "Symmetrieachsen im Gitter", "Parallelität und Orthogonalität"],
    erlaubteAufgabentypen: ["wuerfelnetze", "wuerfelgebaeude_bauplan", "achsensymmetrie_k3", "rechte_winkel_parallelen"]
  },
  // 3. Größen und Messen
  {
    id: "by_k3_groessen_laengen",
    klasse: 3,
    bereich: "Größen und Messen",
    titel: "Größen: Längen (mm, cm, m, km)",
    kompetenzText: "Die Schülerinnen und Schüler rechnen mit Längeneinheiten von Millimeter bis Kilometer und nutzen die Kommaschreibweise.",
    keywords: ["längen", "kilometer", "meter", "zentimeter", "millimeter", "kommaschreibweise längen"],
    zahlenraum: 1000,
    erlaubteOperationen: ["+", "-", "*"],
    verboteneOperationen: [],
    didaktischeRegeln: ["1 km = 1000 m", "1 m = 100 cm", "1 cm = 10 mm", "Kommaschreibweise 1,45 m"],
    erlaubteAufgabentypen: ["laengen_umrechnen_k3", "laengen_komma_k3", "rechnen_laengen", "sachaufgaben_k3"]
  },
  {
    id: "by_k3_groessen_gewichte",
    klasse: 3,
    bereich: "Größen und Messen",
    titel: "Größen: Gewichte (g, kg, t) & Hohlmaße (ml, l)",
    kompetenzText: "Die Schülerinnen und Schüler wiegen und messen mit den Einheiten Gramm, Kilogramm, Tonne sowie Milliliter und Liter.",
    keywords: ["gewichte", "tonne", "kilogramm", "gramm", "hohlmaße", "liter", "milliliter", "waage", "messbecher"],
    zahlenraum: 1000,
    erlaubteOperationen: ["+", "-", "*"],
    verboteneOperationen: [],
    didaktischeRegeln: ["1 t = 1000 kg", "1 kg = 1000 g", "1 l = 1000 ml", "Messbecher und Waagen ablesen"],
    erlaubteAufgabentypen: ["gewichte_umrechnen_k3", "waagen_ablesen", "messbecher_ablesen", "sachaufgaben_k3"]
  },
  {
    id: "by_k3_groessen_zeit_geld",
    klasse: 3,
    bereich: "Größen und Messen",
    titel: "Größen: Zeitspannen, Zeitpunkt & Geld (Kommaschreibweise)",
    kompetenzText: "Die Schülerinnen und Schüler berechnen Zeitpunkte und Zeitspannen und wenden die schriftliche Addition und Subtraktion auf Geldbeträge mit Komma an.",
    keywords: ["zeitpunkt", "zeitdauer", "abfahrt ankunft", "sekunde minute stunde", "geld mit komma", "schriftlich rechnen geld"],
    zahlenraum: 1000,
    erlaubteOperationen: ["+", "-", "*"],
    verboteneOperationen: [],
    didaktischeRegeln: ["Fahrplantabellen Abfahrt/Ankunft", "1 h = 60 min, 1 min = 60 s", "Schriftliches Rechnen mit Geldbeträgen"],
    erlaubteAufgabentypen: ["zeitpunkt_zeitdauer", "zeiteinheiten_k3", "geld_schriftlich", "sachaufgaben_k3"]
  },
  // 4. Daten und Zufall
  {
    id: "by_k3_daten_zufall",
    klasse: 3,
    bereich: "Daten und Zufall",
    titel: "Daten & Zufall: Diagramme, Wahrscheinlichkeit & Kombinatorik",
    kompetenzText: "Die Schülerinnen und Schüler entnehmen Daten aus Diagrammen, schätzen Wahrscheinlichkeiten ein (sicher, möglich, unmöglich) und stellen Kombinationsmöglichkeiten dar.",
    keywords: ["balkendiagramm", "säulendiagramm", "wahrscheinlichkeit", "sicher möglich unmöglich", "kombinatorik", "baumdiagramm"],
    zahlenraum: 1000,
    erlaubteOperationen: ["+", "*"],
    verboteneOperationen: [],
    didaktischeRegeln: ["Diagramme bis 1.000", "Wahrscheinlichkeitsbegriffe", "Systematisches Kombinieren"],
    erlaubteAufgabentypen: ["balkendiagramm_k3", "wahrscheinlichkeit_k3", "kombinatorik_baumdiagramm"]
  },

  // ==========================================
  // KLASSE 4
  // ==========================================
  // 1. Zahlen und Operationen
  {
    id: "by_k4_zr1m_orientierung",
    klasse: 4,
    bereich: "Zahlen und Operationen",
    titel: "Zahlenraum bis 1.000.000: Große Zahlen & Runden",
    kompetenzText: "Die Schülerinnen und Schüler orientieren sich im Zahlenraum bis 1.000.000, lesen und schreiben große Zahlen und runden stellenwertgerecht.",
    keywords: ["million", "zr 1000000", "runden", "große zahlen", "nachbarzehntausender"],
    zahlenraum: 1000000,
    erlaubteOperationen: [],
    verboteneOperationen: [],
    didaktischeRegeln: ["Runden auf Z, H, T, ZT, HT", "Stellenwerttafel bis zur Million"],
    erlaubteAufgabentypen: ["nachbarzahlen", "groesser_kleiner_gleich"]
  },
  {
    id: "by_k4_schriftlich_multiplikation",
    klasse: 4,
    bereich: "Zahlen und Operationen",
    titel: "Schriftliche Multiplikation (einstellig und zweistellig)",
    kompetenzText: "Die Schülerinnen und Schüler beherrschen das Verfahren der schriftlichen Multiplikation mit einstelligen und zweistelligen Faktoren.",
    keywords: ["schriftliche multiplikation", "schriftlich malnehmen", "zweistelliger faktor"],
    zahlenraum: 1000000,
    erlaubteOperationen: ["*"],
    verboteneOperationen: [],
    didaktischeRegeln: ["Schriftliches Verfahren mit Teilprodukten", "Zahlenraum bis 1.000.000"],
    erlaubteAufgabentypen: ["kopfrechnen", "groesser_kleiner_gleich"]
  },
  {
    id: "by_k4_schriftlich_division",
    klasse: 4,
    bereich: "Zahlen und Operationen",
    titel: "Schriftliche Division (einstelliger Teiler, mit & ohne Rest)",
    kompetenzText: "Die Schülerinnen und Schüler führen die schriftliche Division mit einstelligen Divisoren und Zehnerzahlen sicher durch.",
    keywords: ["schriftliche division", "schriftlich teilen", "division rest"],
    zahlenraum: 1000000,
    erlaubteOperationen: ["/"],
    verboteneOperationen: [],
    didaktischeRegeln: ["Schriftlicher Divisionsalgorithmus", "Rest-Notation sauber kennzeichnen"],
    erlaubteAufgabentypen: ["kopfrechnen", "groesser_kleiner_gleich"]
  },
  // 2. Raum und Form
  {
    id: "by_k4_raum_flaechen_umfang",
    klasse: 4,
    bereich: "Raum und Form",
    titel: "Geometrie: Flächeninhalt und Umfang (Rechteck & Quadrat)",
    kompetenzText: "Die Schülerinnen und Schüler ermitteln und berechnen Umfang und Flächeninhalt von Rechtecken und Quadraten unter Nutzung von Formeln und Einheiten (cm², m²).",
    keywords: ["flächeninhalt", "umfang", "quadratzentimeter", "rechteck fläche", "umfang berechnen"],
    zahlenraum: 1000000,
    erlaubteOperationen: ["+", "*"],
    verboteneOperationen: [],
    didaktischeRegeln: ["Umfang: u = 2a + 2b", "Fläche: A = a * b", "Einheiten cm², m²"],
    erlaubteAufgabentypen: ["kopfrechnen", "groesser_kleiner_gleich"]
  },
  {
    id: "by_k4_raum_koerpernetze",
    klasse: 4,
    bereich: "Raum und Form",
    titel: "Geometrie: Würfelnetze, Körper & Maßstab",
    kompetenzText: "Die Schülerinnen und Schüler untersuchen Würfel- und Quadernetze, bauen Körpermodelle und berechnen Längen mithilfe einfacher Maßstäbe.",
    keywords: ["würfelnetz", "körpernetz", "maßstab", "vergrößern verkleinern"],
    zahlenraum: 1000000,
    erlaubteOperationen: ["*", "/"],
    verboteneOperationen: [],
    didaktischeRegeln: ["Maßstab 1:2, 1:10, 1:100", "11 Würfelnetze"],
    erlaubteAufgabentypen: ["kopfrechnen"]
  },
  // 3. Größen und Messen
  {
    id: "by_k4_groessen_laengen_komma",
    klasse: 4,
    bereich: "Größen und Messen",
    titel: "Größen: Längen & Kommaschreibweise (km, m, cm, mm)",
    kompetenzText: "Die Schülerinnen und Schüler rechnen mit Längeneinheiten von Millimeter bis Kilometer, wenden die Kommaschreibweise sicher an und wandeln Einheiten um.",
    keywords: ["längen", "kommaschreibweise", "kilometer", "meter", "dezimeter", "zentimeter", "millimeter", "km m cm mm", "stellenwerttafel längen"],
    zahlenraum: 1000000,
    erlaubteOperationen: ["+", "-", "*", "/"],
    verboteneOperationen: [],
    didaktischeRegeln: ["1 km = 1000 m", "1 m = 10 dm = 100 cm = 1000 mm", "Kommaschreibweise z. B. 1,5 km, 2,35 m, 0,8 cm"],
    erlaubteAufgabentypen: ["laengen_komma_k4", "laengen_umrechnen_k4", "rechnen_laengen_k4", "sachaufgaben_k4"]
  },
  {
    id: "by_k4_groessen_gewichte_bruchteile",
    klasse: 4,
    bereich: "Größen und Messen",
    titel: "Größen: Gewichte & Bruchteile von Größen (t, kg, g)",
    kompetenzText: "Die Schülerinnen und Schüler bestimmen und berechnen Gewichte mit den Einheiten Tonne, Kilogramm und Gramm und rechnen mit einfachen Bruchteilen von Größen.",
    keywords: ["gewichte", "tonne", "kilogramm", "gramm", "t kg g", "bruchteile von größen", "halb viertel dreiviertel", "1/2 kg", "1/4 t"],
    zahlenraum: 1000000,
    erlaubteOperationen: ["+", "-", "*", "/"],
    verboteneOperationen: [],
    didaktischeRegeln: ["1 t = 1000 kg, 1 kg = 1000 g", "1/2 kg = 500 g, 1/4 kg = 250 g, 3/4 kg = 750 g", "1/2 t = 500 kg, 1/4 t = 250 kg"],
    erlaubteAufgabentypen: ["gewichte_umrechnen_k4", "bruchteile_groessen_k4", "rechnen_gewichte_k4", "sachaufgaben_k4"]
  },
  {
    id: "by_k4_groessen_hohlmasse",
    klasse: 4,
    bereich: "Größen und Messen",
    titel: "Größen: Hohlmaße (Liter und Milliliter)",
    kompetenzText: "Die Schülerinnen und Schüler messen und rechnen mit den Hohlmaßen Liter und Milliliter (1 l = 1000 ml) und nutzen Bruchzahlen.",
    keywords: ["liter", "milliliter", "hohlmaße", "l und ml", "volumen"],
    zahlenraum: 1000000,
    erlaubteOperationen: ["+", "-", "*", "/"],
    verboteneOperationen: [],
    didaktischeRegeln: ["1 l = 1000 ml", "1/2 l = 500 ml, 1/4 l = 250 ml, 3/4 l = 750 ml"],
    erlaubteAufgabentypen: ["kopfrechnen", "groesser_kleiner_gleich"]
  },
  // 4. Daten und Zufall
  {
    id: "by_k4_daten_diagramme",
    klasse: 4,
    bereich: "Daten und Zufall",
    titel: "Daten & Zufall: Diagramme auswerten & Wahrscheinlichkeiten",
    kompetenzText: "Die Schülerinnen und Schüler werten komplexe Tabellen, Säulen- und Balkendiagramme aus und bestimmen Gewinnchancen bei Zufallsexperimenten.",
    keywords: ["diagramme klasse 4", "balkendiagramm", "zufallsexperiment", "mittelwert", "durchschnitt"],
    zahlenraum: 1000000,
    erlaubteOperationen: ["+", "-", "*", "/"],
    verboteneOperationen: [],
    didaktischeRegeln: ["Skalierte Achsen bei Diagrammen", "Durchschnitt/Mittelwert berechnen"],
    erlaubteAufgabentypen: ["kopfrechnen"]
  }
];
