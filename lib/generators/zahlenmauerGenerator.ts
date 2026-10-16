/**
 * lib/generators/zahlenmauerGenerator.ts
 *
 * Rein deterministische Zufalls-Generierungslogik für Zahlenmauern.
 * Mathematisch fehlerfrei, deterministisch berechnet, mit Zufallszahlen
 * und garantierter schrittweiser Lösbarkeit für Grundschüler.
 */

export interface ZahlenmauerItemData {
  rows: number;               // 3 (Standard) oder 4
  layers: number[][];         // layers[0] = Basis (3 Steine), layers[1] = Mitte (2), layers[2] = Spitze (1)
  missing: { row: number; col: number }[]; // Koordinaten der Lücken
  solutions: number[][];      // Vollständige Lösung aller Steine
  prefix?: string;            // z. B. "a)"
}

export interface GenerateZahlenmauernResult {
  items: ZahlenmauerItemData[];
  solutionItems: string[];
}

export function generateZahlenmauern(
  count: number = 4,
  maxZahlenraum: number = 20,
  rows: number = 3
): GenerateZahlenmauernResult {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
  const items: ZahlenmauerItemData[] = [];
  const solutionItems: string[] = [];

  for (let i = 0; i < count; i++) {
    const prefix = `${letters[i] || i + 1})`;
    let layers: number[][] = [];
    let valid = false;
    let attempts = 0;

    while (!valid && attempts < 250) {
      attempts++;
      // 1. Basis-Steine (unterste Reihe) würfeln
      const baseLen = rows;
      const base: number[] = [];
      // Werte so dimensionieren, dass die Spitze nicht den Zahlenraum sprengt
      const maxBaseVal = Math.max(2, Math.floor(maxZahlenraum / (rows === 3 ? 4 : 8)));

      for (let b = 0; b < baseLen; b++) {
        base.push(Math.floor(Math.random() * maxBaseVal) + 1);
      }

      // Alle Reihen von unten nach oben exakt aufsummieren
      const tempLayers: number[][] = [base];
      for (let r = 0; r < rows - 1; r++) {
        const currentLayer = tempLayers[r];
        const nextLayer: number[] = [];
        for (let c = 0; c < currentLayer.length - 1; c++) {
          nextLayer.push(currentLayer[c] + currentLayer[c + 1]);
        }
        tempLayers.push(nextLayer);
      }

      // Deckstein prüfen
      const topValue = tempLayers[rows - 1][0];
      if (topValue <= maxZahlenraum && topValue >= (rows === 3 ? 4 : 8)) {
        layers = tempLayers;
        valid = true;
      }
    }

    // Didaktischer Fallback falls keine Kombination gefunden wurde
    if (!valid || layers.length === 0) {
      if (maxZahlenraum <= 10) {
        const fbBase = [2, 1, 3];
        layers = [
          fbBase,
          [fbBase[0] + fbBase[1], fbBase[1] + fbBase[2]],
          [(fbBase[0] + fbBase[1]) + (fbBase[1] + fbBase[2])]
        ];
      } else {
        const fbBases = [[2, 3, 4], [3, 2, 5], [4, 1, 3], [3, 4, 2]];
        const fbBase = fbBases[i % fbBases.length];
        layers = [
          fbBase,
          [fbBase[0] + fbBase[1], fbBase[1] + fbBase[2]],
          [(fbBase[0] + fbBase[1]) + (fbBase[1] + fbBase[2])]
        ];
      }
    }

    // 2. Erlaubte, schrittweise lösbare Lückenmuster für 3-stufige Mauer
    // (layers[0] = 3 Steine unten, layers[1] = 2 Steine mitte, layers[2] = 1 Stein spitze)
    let missing: { row: number; col: number }[] = [];
    if (rows === 3) {
      const musterPool = [
        // Typ A (Leicht - Reine Addition): Ganze Basis bekannt, Mitte & Spitze fehlen
        [
          { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 0 }
        ],
        // Typ B (Mittel - Spitze & Mitte rechts bekannt, ein Basisstein gesucht)
        [
          { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 2, col: 0 }
        ],
        // Typ C (Spitze und Basis außen bekannt)
        [
          { row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 0 }
        ]
      ];

      // Erste Aufgabe vorzugsweise Typ A (reine Addition zum Reinkommen)
      if (i === 0 && count > 1) {
        missing = musterPool[0];
      } else {
        missing = musterPool[Math.floor(Math.random() * musterPool.length)];
      }
    } else {
      // Fallback für 4 Stufen: Obere Stufen als Lücken
      missing = [
        { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 3, col: 0 }
      ];
    }

    // Formulierung der didaktischen Lösung für die Lehreransicht
    // z. B. "a) Spitze = 12, Mitte = [5, 7]"
    const solParts: string[] = [];
    solParts.push(`Deckstein = ${layers[rows - 1][0]}`);
    if (rows === 3) {
      solParts.push(`Mitte = [${layers[1].join(', ')}]`);
      solParts.push(`Basis = [${layers[0].join(', ')}]`);
    }
    const solutionText = `${prefix} ${solParts.join(' | ')}`;

    items.push({
      rows,
      layers,
      missing,
      solutions: layers,
      prefix,
    });

    solutionItems.push(solutionText);
  }

  return { items, solutionItems };
}
