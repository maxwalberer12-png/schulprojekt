/**
 * lib/generators/rechendreieckGenerator.ts
 *
 * Rein deterministische Zufalls-Generierungslogik für Rechendreiecke.
 * Mathematisch exakte Zahlen und didaktisch eindeutig lösbare Lückenmuster
 * für Grundschüler (Klasse 1 & 2).
 */

export interface RechendreieckItemData {
  inner: [number, number, number]; // [A (oben), B (links), C (rechts)]
  outer: [number, number, number]; // [R_AB (links), R_BC (unten), R_CA (rechts)]
  missing: string[];               // z. B. ["inner_0", "outer_1"]
  prefix?: string;
  solutions: {
    inner: [number, number, number];
    outer: [number, number, number];
  };
}

export interface GenerateRechendreieckeResult {
  items: RechendreieckItemData[];
  solutionItems: string[];
}

export function generateRechendreiecke(
  count: number = 5,
  maxZahlenraum: number = 20,
  mitZehneruebergang: boolean = true
): GenerateRechendreieckeResult {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
  const items: RechendreieckItemData[] = [];
  const solutionItems: string[] = [];

  for (let i = 0; i < count; i++) {
    const prefix = `${letters[i] || i + 1})`;
    let A = 0, B = 0, C = 0;
    let rAB = 0, rBC = 0, rCA = 0;
    let valid = false;

    // 1. Zufällige Eckzahlen generieren, die den Zahlenraum-Bedingungen entsprechen
    let attempts = 0;
    while (!valid && attempts < 250) {
      attempts++;
      if (maxZahlenraum <= 10) {
        // Didaktische Regel für ZR 10: Ecken zwischen 1 und 5, Summe paarweise maximal 10
        A = Math.floor(Math.random() * 5) + 1;
        const maxB = Math.min(5, 10 - A);
        B = Math.floor(Math.random() * maxB) + 1;
        const maxC = Math.min(5, 10 - A, 10 - B);
        if (maxC < 1) continue;
        C = Math.floor(Math.random() * maxC) + 1;
      } else {
        const maxCorner = Math.max(3, Math.floor(maxZahlenraum / 2));
        A = Math.floor(Math.random() * maxCorner) + 1;
        B = Math.floor(Math.random() * maxCorner) + 1;
        C = Math.floor(Math.random() * maxCorner) + 1;
      }

      // Duplikate vermeiden für abwechslungsreiche Aufgaben
      if (A === B && B === C) continue;

      rAB = A + B;
      rBC = B + C;
      rCA = C + A;

      // Schranken-Check: Alle Summen müssen im erlaubten Zahlenraum liegen
      if (rAB > maxZahlenraum || rBC > maxZahlenraum || rCA > maxZahlenraum) continue;

      // Zehnerübergang-Check (wenn ohne Übergang gefordert, darf keine Summe > 10 sein bei ZR10 bzw. Übergang über die 10 vermeiden)
      if (!mitZehneruebergang) {
        if (A <= 10 && rAB > 10) continue;
        if (B <= 10 && rBC > 10) continue;
        if (C <= 10 && rCA > 10) continue;
      }

      valid = true;
    }

    // Didaktischer Fallback, falls keine Kombination gefunden wurde
    if (!valid || A === 0 || B === 0 || C === 0) {
      if (maxZahlenraum <= 10) {
        const fallbacks: [number, number, number][] = [
          [2, 3, 4], // rAB=5, rBC=7, rCA=6
          [3, 1, 4], // rAB=4, rBC=5, rCA=7
          [2, 4, 1], // rAB=6, rBC=5, rCA=3
          [1, 5, 2], // rAB=6, rBC=7, rCA=3
          [3, 2, 5], // rAB=5, rBC=7, rCA=8
          [4, 1, 5], // rAB=5, rBC=6, rCA=9
        ];
        const fb = fallbacks[i % fallbacks.length];
        A = fb[0];
        B = fb[1];
        C = fb[2];
      } else {
        const fallbacks: [number, number, number][] = [[3, 4, 5], [6, 2, 5], [4, 7, 3], [5, 3, 6], [7, 2, 4]];
        const fb = fallbacks[i % fallbacks.length];
        A = fb[0];
        B = fb[1];
        C = fb[2];
      }
      rAB = A + B;
      rBC = B + C;
      rCA = C + A;
    }

    // 2. Erlaubte, didaktisch eindeutige Lückenmuster (für Klasse 1 & 2)
    // Muster poolen: Lücken können an den Ecken (inner) ODER an den Rändern (outer) liegen!
    const lueckenMuster: string[][] = [
      // Typ 1: Alle 3 Ränder gesucht (Standard-Addition)
      ["outer_0", "outer_1", "outer_2"],
      
      // Typ 2: Ecke oben gesucht (A), Rand links (rAB) bekannt -> Kind rechnet A = rAB - B
      ["inner_0", "outer_1", "outer_2"],
      
      // Typ 3: Ecke links gesucht (B), Rand unten (rBC) bekannt -> Kind rechnet B = rBC - C
      ["inner_1", "outer_0", "outer_2"],
      
      // Typ 4: Ecke rechts gesucht (C), Rand rechts (rCA) bekannt -> Kind rechnet C = rCA - A
      ["inner_2", "outer_0", "outer_1"],
      
      // Typ 5: Zwei Ecken und ein Rand gesucht (lösbar über eindeutige Kette)
      // A & B bekannt -> Kind rechnet rAB, rBC ist bekannt -> Kind rechnet C, dann rCA
      ["inner_2", "outer_0", "outer_2"]
    ];

    // Didaktisch kluge Auswahl:
    // Erste Aufgaben vorzugsweise reine Randaufgaben (Typ 1) für die Basis,
    // spätere Aufgaben abwechslungsreich aus dem Muster-Pool
    let selectedMissing: string[];
    if (i === 0 && count > 1) {
      selectedMissing = ["outer_0", "outer_1", "outer_2"];
    } else {
      selectedMissing = [...lueckenMuster[Math.floor(Math.random() * lueckenMuster.length)]];
    }

    // Formulierung der didaktischen Lösung für die Lehreransicht
    let solutionText = `${prefix} `;
    const missingDescriptions: string[] = [];
    if (selectedMissing.includes('inner_0')) missingDescriptions.push(`Ecke oben = ${A}`);
    if (selectedMissing.includes('inner_1')) missingDescriptions.push(`Ecke links = ${B}`);
    if (selectedMissing.includes('inner_2')) missingDescriptions.push(`Ecke rechts = ${C}`);
    if (selectedMissing.includes('outer_0')) missingDescriptions.push(`Rand links = ${rAB}`);
    if (selectedMissing.includes('outer_1')) missingDescriptions.push(`Rand unten = ${rBC}`);
    if (selectedMissing.includes('outer_2')) missingDescriptions.push(`Rand rechts = ${rCA}`);

    solutionText += missingDescriptions.join(', ');

    items.push({
      inner: [A, B, C],
      outer: [rAB, rBC, rCA],
      missing: selectedMissing,
      prefix,
      solutions: {
        inner: [A, B, C],
        outer: [rAB, rBC, rCA]
      }
    });

    solutionItems.push(solutionText);
  }

  return { items, solutionItems };
}
