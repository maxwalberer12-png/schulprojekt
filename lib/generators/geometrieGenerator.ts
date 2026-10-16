/**
 * lib/generators/geometrieGenerator.ts
 *
 * Deterministischer Generator für Klasse 1:
 * "Geometrie: Ebene Formen & Muster"
 *
 * Didaktische Regeln (LehrplanPLUS Bayern):
 * - Grundformen der 1. Klasse: Kreis, Dreieck, Quadrat, Rechteck
 * - Rechteck deutlich länglich, um klare Unterscheidung vom Quadrat zu sichern
 * - Musterfolgen fortsetzen (ABAB, AABB, ABC, ABB)
 * - Formen im 5x5 Punktgitter zeichnen
 * - Keine führenden Nummern in den Sektionstiteln (Template nummeriert automatisch)
 */

import { GeneratedTask, GeneratedWorksheet } from '@/types/tools'

export type EbeneFormType = 'circle' | 'triangle' | 'square' | 'rectangle'
export type PatternShapeType = 'circle' | 'triangle' | 'square' | 'star' | 'diamond'

export interface PlacedGeoShape {
  id: number
  shape: EbeneFormType
  col: number // 0 .. 7
  row: number // 0 .. 2
  offsetX: number
  offsetY: number
  rotation: number // -15 | 0 | 15
}

export interface GeoCountSummaryItem {
  shape: EbeneFormType
  label: string
  count: number
}

export interface GeometrieFormenZaehlenData {
  shapes: PlacedGeoShape[]
  summary: GeoCountSummaryItem[]
}

export interface GeometrieMusterItemData {
  prefix: string
  patternType: 'ABAB' | 'AABB' | 'ABC' | 'ABB'
  sequence: PatternShapeType[] // 6 shapes shown
  solution: [PatternShapeType, PatternShapeType] // next 2 shapes
}

export interface GeometriePunktgitterItemData {
  prefix: string
  targetShape: 'Quadrat' | 'Rechteck' | 'Dreieck' | 'Spiegelbild'
  label: string
  solutionGridPoints: Array<{ x: number; y: number }> // 0 .. 4 grid coords
  isSymmetry?: boolean
  givenGridPoints?: Array<{ x: number; y: number }> // vorgegebene Figur links
  cols?: number // 5 oder 6
  rows?: number // default 5
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
 * Sektion 1: "Formen erkennen und zählen"
 * 4 Grundformen (Kreis, Dreieck, Quadrat, Rechteck) verteilt in 8x3 Raster (24 Zellen).
 */
export function generateGeometrieFormenZaehlenTask(): GeneratedTask {
  // Jede Form zwischen 2 und 6 Mal, Summe maximal 20 (Raster hat 24 Zellen)
  let circleCount = 0
  let triangleCount = 0
  let squareCount = 0
  let rectangleCount = 0

  while (true) {
    circleCount = Math.floor(Math.random() * 5) + 2 // 2 .. 6
    triangleCount = Math.floor(Math.random() * 5) + 2 // 2 .. 6
    squareCount = Math.floor(Math.random() * 5) + 2 // 2 .. 6
    rectangleCount = Math.floor(Math.random() * 5) + 2 // 2 .. 6
    const total = circleCount + triangleCount + squareCount + rectangleCount
    if (total >= 14 && total <= 20) {
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

  const shapeList: EbeneFormType[] = [
    ...Array(circleCount).fill('circle' as EbeneFormType),
    ...Array(triangleCount).fill('triangle' as EbeneFormType),
    ...Array(squareCount).fill('square' as EbeneFormType),
    ...Array(rectangleCount).fill('rectangle' as EbeneFormType),
  ]

  const shuffledShapes = shuffleArray(shapeList)
  const possibleRotations = [-15, 0, 15]

  const placedShapes: PlacedGeoShape[] = shuffledShapes.map((shape, idx) => {
    const cell = shuffledCells[idx]
    const offsetX = Math.floor(Math.random() * 9) - 4 // -4 .. +4 px
    const offsetY = Math.floor(Math.random() * 7) - 3 // -3 .. +3 px
    const rotation = possibleRotations[Math.floor(Math.random() * possibleRotations.length)]

    return {
      id: idx + 1,
      shape,
      col: cell.col,
      row: cell.row,
      offsetX,
      offsetY,
      rotation,
    }
  })

  const summary: GeoCountSummaryItem[] = [
    { shape: 'circle', label: 'Kreis', count: circleCount },
    { shape: 'triangle', label: 'Dreieck', count: triangleCount },
    { shape: 'square', label: 'Quadrat', count: squareCount },
    { shape: 'rectangle', label: 'Rechteck', count: rectangleCount },
  ]

  const data: GeometrieFormenZaehlenData = {
    shapes: placedShapes,
    summary,
  }

  const solutionItems = [
    `Kreis: ${circleCount}`,
    `Dreieck: ${triangleCount}`,
    `Quadrat: ${squareCount}`,
    `Rechteck: ${rectangleCount}`,
  ]

  return {
    id: 1,
    type: 'geometrie_formen_zaehlen',
    title: 'Formen erkennen und zählen',
    instruction: 'Zähle die geometrischen Formen im Kasten und trage die richtige Anzahl ein.',
    items: [data],
    solutionItems,
  }
}

/**
 * Sektion 2: "Muster fortsetzen"
 * 4 Teilaufgaben mit klassischen Mustern (ABAB, AABB, ABC, ABB)
 */
export function generateGeometrieMusterTask(requestedCount?: number): GeneratedTask {
  const count = Math.max(1, Math.min(requestedCount ?? 4, 10))
  const prefixes = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)', 'g)', 'h)', 'i)', 'j)']
  const patterns: Array<'ABAB' | 'AABB' | 'ABC' | 'ABB'> = ['ABAB', 'AABB', 'ABC', 'ABB']

  const allShapes: PatternShapeType[] = ['circle', 'triangle', 'square', 'star', 'diamond']

  const items: GeometrieMusterItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const prefix = prefixes[i]
    const pType = patterns[i % patterns.length]

    // Form-Auswahl für dieses Muster
    const shuffledShapes = shuffleArray(allShapes)
    const A = shuffledShapes[0]
    const B = shuffledShapes[1]
    const C = shuffledShapes[2]

    let fullSequence: PatternShapeType[] = []

    if (pType === 'ABAB') {
      // 8 Elemente: A B A B A B | A B
      fullSequence = [A, B, A, B, A, B, A, B]
    } else if (pType === 'AABB') {
      // 8 Elemente: A A B B A A | B B
      fullSequence = [A, A, B, B, A, A, B, B]
    } else if (pType === 'ABC') {
      // 8 Elemente: A B C A B C | A B
      fullSequence = [A, B, C, A, B, C, A, B]
    } else {
      // ABB: A B B A B B | A B
      fullSequence = [A, B, B, A, B, B, A, B]
    }

    const sequence = fullSequence.slice(0, 6)
    const solution: [PatternShapeType, PatternShapeType] = [fullSequence[6], fullSequence[7]]

    items.push({
      prefix,
      patternType: pType,
      sequence,
      solution,
    })

    solutionItems.push(`${prefix} ${solution[0]}, ${solution[1]}`)
  }

  return {
    id: 2,
    type: 'geometrie_muster_fortsetzen',
    title: 'Muster fortsetzen',
    instruction:
      'Schau dir die Reihe genau an. Wie geht das Muster weiter? Zeichne die nächsten zwei Formen in die Kästchen.',
    items,
    solutionItems,
  }
}

/**
 * Sektion 3: "Formen im Punktgitter zeichnen"
 * 3-4 Aufgaben (Quadrat, Rechteck, Dreieck, Spiegelbild) im 5x5 Punktgitter
 */
export function generateGeometriePunktgitterTask(requestedCount?: number): GeneratedTask {
  const count = Math.max(1, Math.min(requestedCount ?? 4, 4))
  const allItems: GeometriePunktgitterItemData[] = [
    {
      prefix: 'a)',
      targetShape: 'Quadrat',
      label: 'Zeichne ein Quadrat',
      cols: 5,
      rows: 5,
      solutionGridPoints: [
        { x: 1, y: 1 },
        { x: 3, y: 1 },
        { x: 3, y: 3 },
        { x: 1, y: 3 },
      ],
    },
    {
      prefix: 'b)',
      targetShape: 'Rechteck',
      label: 'Zeichne ein Rechteck',
      cols: 5,
      rows: 5,
      solutionGridPoints: [
        { x: 0, y: 1 },
        { x: 4, y: 1 },
        { x: 4, y: 3 },
        { x: 0, y: 3 },
      ],
    },
    {
      prefix: 'c)',
      targetShape: 'Dreieck',
      label: 'Zeichne ein Dreieck',
      cols: 5,
      rows: 5,
      solutionGridPoints: [
        { x: 2, y: 0 },
        { x: 4, y: 4 },
        { x: 0, y: 4 },
      ],
    },
    {
      prefix: 'd)',
      targetShape: 'Spiegelbild',
      label: 'Spiegle an der roten Linie',
      isSymmetry: true,
      cols: 6,
      rows: 5,
      givenGridPoints: [
        { x: 2, y: 0 },
        { x: 0, y: 2 },
        { x: 2, y: 4 },
      ],
      solutionGridPoints: [
        { x: 3, y: 0 },
        { x: 5, y: 2 },
        { x: 3, y: 4 },
      ],
    },
  ]

  const allSolutionItems = [
    'a) Quadrat (verbundene Gitterpunkte)',
    'b) Rechteck (verbundene Gitterpunkte)',
    'c) Dreieck (verbundene Gitterpunkte)',
    'd) Spiegelbild (an roter Spiegelachse gespiegelt)',
  ]

  const items = allItems.slice(0, count)
  const solutionItems = allSolutionItems.slice(0, count)

  return {
    id: 3,
    type: 'geometrie_punktgitter',
    title: 'Formen & Spiegelbilder im Punktgitter',
    instruction: 'Verbinde die Punkte mit dem Lineal. Spiegle bei d) die Figur an der roten Linie.',
    items,
    solutionItems,
  }
}

/**
 * Erzeugt das komplette deterministische Arbeitsblatt für
 * Klasse 1: "Geometrie: Ebene Formen & Muster".
 */
export function generateGeometrieArbeitsblatt(): GeneratedWorksheet {
  return {
    titel: 'Geometrie: Ebene Formen & Muster',
    tasks: [
      generateGeometrieFormenZaehlenTask(),
      generateGeometrieMusterTask(),
      generateGeometriePunktgitterTask(),
    ],
  }
}
