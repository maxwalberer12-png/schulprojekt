/**
 * lib/generators/strichlistenGenerator.ts
 *
 * Deterministischer Generator für Klasse 1:
 * "Daten & Zufall: Strichlisten & einfache Häufigkeiten"
 *
 * Didaktische Regeln (LehrplanPLUS Bayern):
 * - 5er-Bündelung bei Strichlisten (4 senkrechte Striche + 1 Querstrich)
 * - Zahlenraum bis 20
 * - Keine führenden Nummern in den Sektionstiteln (Template nummeriert automatisch)
 */

import { GeneratedTask, GeneratedWorksheet } from '@/types/tools'

export interface StrichlisteAblesenItemData {
  prefix: string
  count: number // 3 .. 19
}

export interface StrichlisteZeichnenItemData {
  prefix: string
  count: number // 4 .. 17
}

export type ShapeType = 'star' | 'triangle' | 'circle'

export interface PlacedShape {
  id: number
  shape: ShapeType
  col: number // 0 .. 7
  row: number // 0 .. 2
  offsetX: number // -6 .. +6 px
  offsetY: number // -4 .. +4 px
}

export interface ShapeCountItem {
  shape: ShapeType
  label: string
  count: number
}

export interface StrichlisteZaehlenData {
  shapes: PlacedShape[]
  summary: ShapeCountItem[]
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Sektion 1: "Strichlisten ablesen"
 * 6 Teilaufgaben (a bis f), 6 verschiedene Zufallszahlen zwischen 3 und 19.
 */
export function generateStrichlisteAblesenTask(requestedCount?: number): GeneratedTask {
  const count = Math.max(1, Math.min(requestedCount ?? 6, 10))
  const prefixes = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)', 'g)', 'h)', 'i)', 'j)']
  const pool = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
  const shuffled = shuffleArray(pool)
  const selectedCounts = shuffled.slice(0, count)

  const items: StrichlisteAblesenItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const prefix = prefixes[i]
    const c = selectedCounts[i]

    items.push({
      prefix,
      count: c,
    })

    solutionItems.push(`${prefix} ${c}`)
  }

  return {
    id: 1,
    type: 'strichliste_ablesen',
    title: 'Strichlisten ablesen',
    instruction: 'Wie viele Striche sind es? Zähle die 5er-Bündel und trage die Zahl ein.',
    items,
    solutionItems,
  }
}

/**
 * Sektion 2: "Strichlisten zeichnen"
 * 4 Teilaufgaben (a bis d), 4 verschiedene Zufallszahlen zwischen 4 und 17.
 */
export function generateStrichlisteZeichnenTask(requestedCount?: number): GeneratedTask {
  const count = Math.max(1, Math.min(requestedCount ?? 4, 10))
  const prefixes = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)', 'g)', 'h)', 'i)', 'j)']
  // Beliebte, didaktisch abwechslungsreiche Zahlen wählen (z.B. mit und ohne volles 5er-Bündel)
  const pool = [4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17]
  const shuffled = shuffleArray(pool)
  const selectedCounts = shuffled.slice(0, count)

  const items: StrichlisteZeichnenItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const prefix = prefixes[i]
    const c = selectedCounts[i]

    items.push({
      prefix,
      count: c,
    })

    const bundles = Math.floor(c / 5)
    const remainder = c % 5
    const textRep = Array(bundles).fill('||||/').concat(remainder > 0 ? ['|'.repeat(remainder)] : []).join(' ')
    solutionItems.push(`${prefix} ${c} = ${textRep}`)
  }

  return {
    id: 2,
    type: 'strichliste_zeichnen',
    title: 'Strichlisten zeichnen',
    instruction: 'Zeichne für jede Zahl die passende Strichliste in das Kästchen.',
    items,
    solutionItems,
  }
}

/**
 * Sektion 3: "Zählen und Häufigkeiten eintragen"
 * 3 Formen (Stern, Dreieck, Kreis) verteilt in 8x3 Raster.
 */
export function generateStrichlisteZaehlenTask(): GeneratedTask {
  // Zufällige Häufigkeiten zwischen 4 und 8, Summe maximal 21 (Raster hat 24 Plätze)
  let starCount = 0
  let triangleCount = 0
  let circleCount = 0

  while (true) {
    starCount = Math.floor(Math.random() * 5) + 4 // 4 .. 8
    triangleCount = Math.floor(Math.random() * 5) + 4 // 4 .. 8
    circleCount = Math.floor(Math.random() * 5) + 4 // 4 .. 8
    const total = starCount + triangleCount + circleCount
    // Sicherstellen, dass keine zwei Formen dieselbe Anzahl haben (für mehr didaktische Klarheit)
    if (
      total <= 21 &&
      starCount !== triangleCount &&
      starCount !== circleCount &&
      triangleCount !== circleCount
    ) {
      break
    }
  }

  // 24 Raster-Positionen (8 Spalten x 3 Zeilen)
  const cellPositions: Array<{ col: number; row: number }> = []
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      cellPositions.push({ col, row })
    }
  }

  const shuffledCells = shuffleArray(cellPositions)

  const shapeList: ShapeType[] = [
    ...Array(starCount).fill('star' as ShapeType),
    ...Array(triangleCount).fill('triangle' as ShapeType),
    ...Array(circleCount).fill('circle' as ShapeType),
  ]

  const shuffledShapes = shuffleArray(shapeList)
  const placedShapes: PlacedShape[] = []

  shuffledShapes.forEach((shape, idx) => {
    const cell = shuffledCells[idx]
    const offsetX = Math.floor(Math.random() * 11) - 5 // -5 .. +5 px
    const offsetY = Math.floor(Math.random() * 9) - 4 // -4 .. +4 px

    placedShapes.push({
      id: idx + 1,
      shape,
      col: cell.col,
      row: cell.row,
      offsetX,
      offsetY,
    })
  })

  const summary: ShapeCountItem[] = [
    { shape: 'star', label: 'Stern', count: starCount },
    { shape: 'triangle', label: 'Dreieck', count: triangleCount },
    { shape: 'circle', label: 'Kreis', count: circleCount },
  ]

  const data: StrichlisteZaehlenData = {
    shapes: placedShapes,
    summary,
  }

  const solutionItems = [
    `Stern: ${starCount} Striche (${starCount})`,
    `Dreieck: ${triangleCount} Striche (${triangleCount})`,
    `Kreis: ${circleCount} Striche (${circleCount})`,
  ]

  return {
    id: 3,
    type: 'strichliste_zaehlen',
    title: 'Zählen und Häufigkeiten eintragen',
    instruction: 'Zähle die Formen im Kasten. Zeichne die Strichliste und schreibe die Anzahl auf.',
    items: [data],
    solutionItems,
  }
}

/**
 * Erzeugt das komplette deterministische Arbeitsblatt für
 * Klasse 1: "Daten & Zufall: Strichlisten & einfache Häufigkeiten".
 */
export function generateStrichlistenArbeitsblatt(): GeneratedWorksheet {
  return {
    titel: 'Daten & Zufall: Strichlisten & einfache Häufigkeiten',
    tasks: [
      generateStrichlisteAblesenTask(),
      generateStrichlisteZeichnenTask(),
      generateStrichlisteZaehlenTask(),
    ],
  }
}
