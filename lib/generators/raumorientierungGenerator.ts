/**
 * lib/generators/raumorientierungGenerator.ts
 *
 * 100 % deterministischer Generator für Klasse 1:
 * "Geometrie: Raumorientierung & Lagebeziehungen"
 *
 * Didaktische Vorgaben:
 * - Begriffe: oben, unten, links, rechts, in der Mitte
 * - Keine führenden Nummern in den Sektionstiteln (Template nummeriert automatisch)
 * - Kindgerechte Aufgaben mit visuellen Symbolen / Mini-SVGs
 * - Volle Unterstützung für colorMode ("color" | "bw") und showSolutions
 * - Kompaktes Layout, garantiert auf 1 DIN A4-Seite passend
 */

import { GeneratedTask, GeneratedWorksheet } from '@/types/tools'

export type DirectionType = 'oben' | 'unten' | 'links' | 'rechts'
export type ArrowDirectionType = 'left' | 'right' | 'up' | 'down'
export type RaumSymbolType = 'star' | 'heart' | 'triangle' | 'square' | 'diamond'

export interface PlacedGridSymbol {
  row: number // 0 .. 2
  col: number // 0 .. 2
  symbol: RaumSymbolType
  label: string
}

export interface RaumGitterQuestion {
  prefix: string
  article: string
  symbol: RaumSymbolType
  symbolLabel: string
  solutionDirection: DirectionType
  solutionAlt: string
  refSymbol: RaumSymbolType
}

export interface RaumGitterOrientierungData {
  centerSymbol: RaumSymbolType
  gridSymbols: PlacedGridSymbol[]
  questions: RaumGitterQuestion[]
}

export interface PlacedArrow {
  id: number
  direction: ArrowDirectionType
  col: number
  row: number
  offsetX: number
  offsetY: number
}

export interface ArrowSummaryItem {
  direction: ArrowDirectionType
  label: string
  count: number
}

export interface RaumPfeileZaehlenData {
  arrows: PlacedArrow[]
  summary: ArrowSummaryItem[]
}

export interface RaumZeichnenPrompt {
  prefix: string
  symbol: RaumSymbolType
  article: string
  label: string
  direction: DirectionType
  hint: string
  targetCell: { row: number; col: number }
}

export interface RaumGitterZeichnenData {
  centerShape: 'circle'
  tasks: RaumZeichnenPrompt[]
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
 * Sektion 1: "Wo befinden sich die Formen? (3x3-Gitter)"
 * Zentraler Stern in der Mitte [1,1] und 4 zufällig verteilte Formen
 * (Herz, Quadrat, Dreieck, Raute) in [0,1], [2,1], [1,0], [1,2].
 */
export function generateRaumGitterOrientierungTask(): GeneratedTask {
  const positions: Array<{ direction: DirectionType; row: number; col: number; alt: string }> = [
    { direction: 'oben', row: 0, col: 1, alt: 'über' },
    { direction: 'unten', row: 2, col: 1, alt: 'unter' },
    { direction: 'links', row: 1, col: 0, alt: 'neben' },
    { direction: 'rechts', row: 1, col: 2, alt: 'neben' },
  ]

  const symbolsInfo: Array<{
    symbol: RaumSymbolType
    label: string
    article: string
  }> = [
    { symbol: 'heart', label: 'Herz', article: 'Das' },
    { symbol: 'square', label: 'Quadrat', article: 'Das' },
    { symbol: 'triangle', label: 'Dreieck', article: 'Das' },
    { symbol: 'diamond', label: 'Raute', article: 'Die' },
  ]

  const shuffledSymbols = shuffleArray(symbolsInfo)

  const gridSymbols: PlacedGridSymbol[] = [
    { row: 1, col: 1, symbol: 'star', label: 'Stern' },
  ]

  const questions: RaumGitterQuestion[] = []
  const prefixes = ['a)', 'b)', 'c)', 'd)']
  const solutionItems: string[] = []

  positions.forEach((pos, idx) => {
    const sym = shuffledSymbols[idx]
    gridSymbols.push({
      row: pos.row,
      col: pos.col,
      symbol: sym.symbol,
      label: sym.label,
    })

    const prefix = prefixes[idx]
    questions.push({
      prefix,
      article: sym.article,
      symbol: sym.symbol,
      symbolLabel: sym.label,
      solutionDirection: pos.direction,
      solutionAlt: pos.alt,
      refSymbol: 'star',
    })

    solutionItems.push(`${prefix} ${pos.direction}`)
  })

  const data: RaumGitterOrientierungData = {
    centerSymbol: 'star',
    gridSymbols,
    questions,
  }

  return {
    id: 1,
    type: 'raum_gitter_orientierung',
    title: 'Wo befinden sich die Formen? (3x3-Gitter)',
    instruction:
      'Schau dir das Gitter genau an. Kreuze das richtige Wort an oder trage es ein: oben, unten, links oder rechts.',
    items: [data],
    solutionItems,
  }
}

/**
 * Sektion 2: "Links oder Rechts? (Richtungen erkennen)"
 * Box mit SVG-Pfeilen (←, →, ↑, ↓) überlappungsfrei verteilt.
 * 4 Zähl-Felder (nach links, nach rechts, nach oben, nach unten).
 */
export function generateRaumPfeileZaehlenTask(): GeneratedTask {
  // Zufällig jeweils 2 bis 5 Pfeile pro Richtung, Summe ca. 12 bis 16 (Raster 8 Spalten x 2 Zeilen = 16 Zellen)
  let leftCount = 0
  let rightCount = 0
  let upCount = 0
  let downCount = 0

  while (true) {
    leftCount = Math.floor(Math.random() * 4) + 2 // 2 .. 5
    rightCount = Math.floor(Math.random() * 4) + 2 // 2 .. 5
    upCount = Math.floor(Math.random() * 4) + 2 // 2 .. 5
    downCount = Math.floor(Math.random() * 4) + 2 // 2 .. 5
    const total = leftCount + rightCount + upCount + downCount
    if (total >= 12 && total <= 16) {
      break
    }
  }

  // 16 Zellen (8 cols x 2 rows)
  const cellPositions: Array<{ col: number; row: number }> = []
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 8; c++) {
      cellPositions.push({ col: c, row: r })
    }
  }

  const shuffledCells = shuffleArray(cellPositions)

  const arrowDirections: ArrowDirectionType[] = [
    ...Array(leftCount).fill('left' as ArrowDirectionType),
    ...Array(rightCount).fill('right' as ArrowDirectionType),
    ...Array(upCount).fill('up' as ArrowDirectionType),
    ...Array(downCount).fill('down' as ArrowDirectionType),
  ]

  const shuffledArrows = shuffleArray(arrowDirections)

  const placedArrows: PlacedArrow[] = shuffledArrows.map((dir, idx) => {
    const cell = shuffledCells[idx]
    const offsetX = Math.floor(Math.random() * 11) - 5 // -5 .. +5 px
    const offsetY = Math.floor(Math.random() * 7) - 3 // -3 .. +3 px

    return {
      id: idx + 1,
      direction: dir,
      col: cell.col,
      row: cell.row,
      offsetX,
      offsetY,
    }
  })

  const summary: ArrowSummaryItem[] = [
    { direction: 'left', label: 'nach links', count: leftCount },
    { direction: 'right', label: 'nach rechts', count: rightCount },
    { direction: 'up', label: 'nach oben', count: upCount },
    { direction: 'down', label: 'nach unten', count: downCount },
  ]

  const data: RaumPfeileZaehlenData = {
    arrows: placedArrows,
    summary,
  }

  const solutionItems = [
    `nach links: ${leftCount}`,
    `nach rechts: ${rightCount}`,
    `nach oben: ${upCount}`,
    `nach unten: ${downCount}`,
  ]

  return {
    id: 2,
    type: 'raum_pfeile_zaehlen',
    title: 'Links oder Rechts? (Richtungen erkennen)',
    instruction:
      'Zähle die Pfeile. Wie viele Pfeile zeigen nach links, nach rechts, nach oben und nach unten?',
    items: [data],
    solutionItems,
  }
}

/**
 * Sektion 3: "Zeichne an die richtige Stelle"
 * 3x3-Gitter mit Kreis in der Mitte [1,1].
 * 4 Zeichen-Aufträge (oben, unten, links, rechts) für 4 Formen.
 */
export function generateRaumGitterZeichnenTask(): GeneratedTask {
  const directionsConfig: Array<{
    direction: DirectionType
    hint: string
    targetCell: { row: number; col: number }
  }> = [
    { direction: 'oben', hint: '(über den Kreis)', targetCell: { row: 0, col: 1 } },
    { direction: 'unten', hint: '(unter den Kreis)', targetCell: { row: 2, col: 1 } },
    { direction: 'links', hint: '(neben den Kreis)', targetCell: { row: 1, col: 0 } },
    { direction: 'rechts', hint: '(neben den Kreis)', targetCell: { row: 1, col: 2 } },
  ]

  const shapesConfig: Array<{
    symbol: RaumSymbolType
    label: string
    article: string
  }> = [
    { symbol: 'triangle', label: 'Dreieck', article: 'ein' },
    { symbol: 'square', label: 'Quadrat', article: 'ein' },
    { symbol: 'star', label: 'Stern', article: 'einen' },
    { symbol: 'heart', label: 'Herz', article: 'ein' },
  ]

  const shuffledDirs = shuffleArray(directionsConfig)
  const prefixes = ['a)', 'b)', 'c)', 'd)']

  const tasks: RaumZeichnenPrompt[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < 4; i++) {
    const shape = shapesConfig[i]
    const dir = shuffledDirs[i]
    const prefix = prefixes[i]

    tasks.push({
      prefix,
      symbol: shape.symbol,
      article: shape.article,
      label: shape.label,
      direction: dir.direction,
      hint: dir.hint,
      targetCell: dir.targetCell,
    })

    solutionItems.push(
      `${prefix} ${shape.label} nach ${dir.direction} (${dir.targetCell.row === 0 ? 'oben' : dir.targetCell.row === 2 ? 'unten' : dir.targetCell.col === 0 ? 'links' : 'rechts'})`
    )
  }

  const data: RaumGitterZeichnenData = {
    centerShape: 'circle',
    tasks,
  }

  return {
    id: 3,
    type: 'raum_gitter_zeichnen',
    title: 'Zeichne an die richtige Stelle',
    instruction:
      'Lies genau und zeichne die Formen an den richtigen Platz um den Kreis in der Mitte.',
    items: [data],
    solutionItems,
  }
}

/**
 * Gesamtes Arbeitsblatt für Klasse 1: "Geometrie: Raumorientierung & Lagebeziehungen"
 */
export function generateRaumorientierungArbeitsblatt(): GeneratedWorksheet {
  const task1 = generateRaumGitterOrientierungTask()
  const task2 = generateRaumPfeileZaehlenTask()
  const task3 = generateRaumGitterZeichnenTask()

  return {
    titel: 'Geometrie: Raumorientierung & Lagebeziehungen',
    tasks: [task1, task2, task3],
  }
}
