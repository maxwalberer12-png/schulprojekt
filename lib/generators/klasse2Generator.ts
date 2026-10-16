/**
 * lib/generators/klasse2Generator.ts
 *
 * 100 % deterministische Generatoren für alle LehrplanPLUS Bayern Themen der 2. Klasse.
 *
 * DECKT ALLE 8 SPEZIAL-THEMEN DER 2. KLASSE AB:
 * 1. Hunderterfeld, Zehner & Einer (Hundertertafel, Zehnerstangen & Einerwürfel, Nachbarzahlen ZR 100)
 * 2. Addition & Subtraktion (Halbschriftliches Rechnen in 2 Schritten)
 * 3. Kleines 1x1 (Punktefelder mit Plus- & Malaufgabe, Kernaufgaben & Alle Reihen, Division, Aufgabenfamilien)
 * 4. Geometrie (Körperformen 3D Steckbriefe, Achsensymmetrie am Gitter, Körpernetze)
 * 5. Größen: Längen (Strecken messen mit Lineal bis 12 cm, m & cm umrechnen, vergleichen)
 * 6. Größen: Geld (Kommaschreibweise, Rückgeld-Tabelle bis 100 €)
 * 7. Größen: Zeit (Analoge Uhr mit Viertel/Halb/Minuten, Vormittag/Nachmittag, Zeiger einzeichnen, Zeitspannen)
 * 8. Daten & Zufall (Säulendiagramm Lieblingstiere, Tabellen, Kombinatorik)
 */

import { GeneratedTask, GeneratedWorksheet } from '@/types/tools'

// ═════════════════════════════════════════════════════════════════
// 1. THEMA: ZAHLENRAUM BIS 100: HUNDERTERFELD, ZEHNER & EINER
// ═════════════════════════════════════════════════════════════════

// 1.1 Hundertertafel & Zahlenrätsel
export interface HundertertafelKreuzItem {
  type: 'kreuz'
  prefix: string
  center: number
  top: number
  bottom: number
  left: number
  right: number
  zehner: number
  einer: number
}

export interface HundertertafelRaetselItem {
  type: 'raetsel'
  prefix: string
  text: string
  zehner: number
  einer: number
  solution: number
}

export interface HundertertafelNachbarzehnerItem {
  type: 'nachbarzehner'
  prefix: string
  num: number
  lowerZehner: number
  upperZehner: number
}

export interface HunderterfeldPunkteItem {
  type: 'punktefeld'
  prefix: string
  count: number
  zehner: number
  einer: number
  ergaenzung100: number
}

export interface StellenwertZEItem {
  type: 'stellenwert'
  prefix: string
  num: number
  zehner: number
  einer: number
  ergaenzung100: number
}

export type HundertertafelItemData =
  | HundertertafelKreuzItem
  | HundertertafelRaetselItem
  | HundertertafelNachbarzehnerItem
  | HunderterfeldPunkteItem
  | StellenwertZEItem

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomUniqueInts(
  count: number,
  min: number,
  max: number,
  filter?: (n: number) => boolean
): number[] {
  const chosen = new Set<number>()
  let attempts = 0
  while (chosen.size < count && attempts < 1000) {
    attempts++
    const val = getRandomInt(min, max)
    if (!filter || filter(val)) {
      chosen.add(val)
    }
  }
  return Array.from(chosen)
}

function generateValidCrossCenter(excludeCenters: number[] = []): number {
  let attempts = 0
  while (attempts < 200) {
    attempts++
    const z = getRandomInt(1, 8)
    const e = getRandomInt(2, 9)
    const val = z * 10 + e
    if (!excludeCenters.some((c) => Math.abs(c - val) < 15)) {
      return val
    }
  }
  return 54
}

export function generateHundertertafelTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: HundertertafelItemData[] = []
  const solutionItems: string[] = []

  const c1 = generateValidCrossCenter()
  const c2 = generateValidCrossCenter([c1])

  // Item a): Kreuz 1
  items.push({
    type: 'kreuz',
    prefix: letters[0],
    center: c1,
    top: c1 - 10,
    bottom: c1 + 10,
    left: c1 - 1,
    right: c1 + 1,
    zehner: Math.floor(c1 / 10),
    einer: c1 % 10,
  })
  solutionItems.push(
    `${letters[0]} Oben: ${c1 - 10}, Unten: ${c1 + 10}, Links: ${c1 - 1}, Rechts: ${c1 + 1} | ${c1} = ${Math.floor(c1 / 10)}Z + ${c1 % 10}E`
  )

  // Item b): Zahlenrätsel
  const z = getRandomInt(2, 8)
  const e = getRandomInt(1, 9)
  const solNum = z * 10 + e
  items.push({
    type: 'raetsel',
    prefix: letters[1],
    text: `Meine Zahl hat ${z} Zehner und ${e} Einer. Welche Zahl ist es?`,
    zehner: z,
    einer: e,
    solution: solNum,
  })
  solutionItems.push(`${letters[1]} ${solNum} (${z}Z + ${e}E)`)

  // Item c): Kreuz 2
  items.push({
    type: 'kreuz',
    prefix: letters[2],
    center: c2,
    top: c2 - 10,
    bottom: c2 + 10,
    left: c2 - 1,
    right: c2 + 1,
    zehner: Math.floor(c2 / 10),
    einer: c2 % 10,
  })
  solutionItems.push(
    `${letters[2]} Oben: ${c2 - 10}, Unten: ${c2 + 10}, Links: ${c2 - 1}, Rechts: ${c2 + 1} | ${c2} = ${Math.floor(c2 / 10)}Z + ${c2 % 10}E`
  )

  // Item d): Nachbarzehner
  const safeNz = getRandomInt(12, 89)
  const lowerZ = Math.floor(safeNz / 10) * 10
  const upperZ = lowerZ + 10
  items.push({
    type: 'nachbarzehner',
    prefix: letters[3],
    num: safeNz,
    lowerZehner: lowerZ,
    upperZehner: upperZ,
  })
  solutionItems.push(`${letters[3]} Nachbarzehner von ${safeNz}: ${lowerZ} und ${upperZ}`)

  return {
    id: 1,
    type: 'hundertertafel',
    title: 'Hundertertafel & Zahlenrätsel',
    instruction:
      'Trage die fehlenden Nachbarzahlen in das Kreuz ein und bestimme die Zehner und Einer.',
    items: items.slice(0, count),
    solutionItems: solutionItems.slice(0, count),
  }
}

export function generateHunderterfeldPunkteTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: HunderterfeldPunkteItem[] = []
  const solutionItems: string[] = []

  const uniqueVals = getRandomUniqueInts(count, 11, 99)

  for (let i = 0; i < uniqueVals.length; i++) {
    const val = uniqueVals[i]
    const z = Math.floor(val / 10)
    const e = val % 10
    const erg = 100 - val
    const prefix = letters[i] || `${i + 1})`
    items.push({
      type: 'punktefeld',
      prefix,
      count: val,
      zehner: z,
      einer: e,
      ergaenzung100: erg,
    })
    solutionItems.push(
      `${prefix} ${val} Punkte = ${z}Z + ${e}E | Ergänzung auf 100: ${val} + ${erg} = 100`
    )
  }

  return {
    id: 1,
    type: 'hunderterfeld_punkte',
    title: 'Hunderterfeld (Punktefeld 10x10)',
    instruction:
      'Zähle die gefärbten Punkte am Hunderterfeld (Zehnerreihen und Einer). Trage die Zehner und Einer ein und ergänze auf 100.',
    items,
    solutionItems,
  }
}

export function generateStellenwertZETask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: StellenwertZEItem[] = []
  const solutionItems: string[] = []

  const uniqueVals = getRandomUniqueInts(count, 11, 99)

  for (let i = 0; i < uniqueVals.length; i++) {
    const val = uniqueVals[i]
    const z = Math.floor(val / 10)
    const e = val % 10
    const erg = 100 - val
    const prefix = letters[i] || `${i + 1})`
    items.push({
      type: 'stellenwert',
      prefix,
      num: val,
      zehner: z,
      einer: e,
      ergaenzung100: erg,
    })
    solutionItems.push(
      `${prefix} ${z} Z + ${e} E = ${val} (${z * 10} + ${e} = ${val}) | ${val} + ${erg} = 100`
    )
  }

  return {
    id: 1,
    type: 'stellenwert_ze',
    title: 'Stellenwerttafel (Z/E) & Ergänzen auf 100',
    instruction:
      'Lies die Zehner und Einer an der Stellenwerttafel ab, bilde die Zahl und ergänze auf 100.',
    items,
    solutionItems,
  }
}

// 1.2 Zehnerstangen & Einerwürfel (Bündeln)
export interface DienesBlockItemData {
  prefix: string
  number: number
  zehner: number
  einer: number
}

export function generateDienesBlocksTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const uniqueVals = getRandomUniqueInts(count, 11, 99)

  const items: DienesBlockItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < uniqueVals.length; i++) {
    const num = uniqueVals[i]
    const z = Math.floor(num / 10)
    const e = num % 10
    const prefix = letters[i] || `${i + 1})`

    items.push({
      prefix,
      number: num,
      zehner: z,
      einer: e,
    })
    solutionItems.push(`${prefix} ${z} Z + ${e} E = ${num}`)
  }

  return {
    id: 2,
    type: 'zehnerstangen_einer',
    title: 'Zehnerstangen & Einerwürfel (Bündeln)',
    instruction:
      'Zähle die Zehnerstangen (Z) und die einzelnen Einerwürfel (E) und trage die Zahl ein.',
    items,
    solutionItems,
  }
}

// 1.3 Nachbarzahlen im ZR 100 (Nachbarzehner | Vorgänger | ZAHL | Nachfolger | Nachbarzehner)
export interface NachbarzahlenK2ItemData {
  prefix: string
  num: number
  prevTen: number
  prev: number
  next: number
  nextTen: number
}

export function generateNachbarzahlenKlasse2Task(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const uniqueVals = getRandomUniqueInts(count, 11, 98, (n) => n % 10 !== 0)

  const items: NachbarzahlenK2ItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < uniqueVals.length; i++) {
    const num = uniqueVals[i]
    const prevTen = Math.floor(num / 10) * 10
    const nextTen = prevTen + 10
    const prev = num - 1
    const next = num + 1
    const prefix = letters[i] || `${i + 1})`

    items.push({
      prefix,
      num,
      prevTen,
      prev,
      next,
      nextTen,
    })
    solutionItems.push(
      `${prefix} Nachbarzehner: ${prevTen} | Vorgänger: ${prev} | ZAHL: ${num} | Nachfolger: ${next} | Nachbarzehner: ${nextTen}`
    )
  }

  return {
    id: 3,
    type: 'nachbarzahlen_k2',
    title: 'Nachbarzahlen & Nachbarzehner im ZR 100',
    instruction:
      'Trage zu jeder Zahl die Nachbarzehner sowie Vorgänger und Nachfolger in die Tabelle ein.',
    items,
    solutionItems,
  }
}

// ═════════════════════════════════════════════════════════════════
// 2. THEMA: ZAHLENRAUM BIS 100: ADDITION & SUBTRAKTION
// ═════════════════════════════════════════════════════════════════

export interface HalbschriftlichItemData {
  prefix: string
  num1: number
  num2: number
  op: '+' | '-'
  step1Ten: number
  step1Res: number
  step2One: number
  result: number
}

export function generateHalbschriftlichTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: HalbschriftlichItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const isAdd = i % 2 === 0
    const prefix = letters[i] || `${i + 1})`
    let num1 = 10
    let num2 = 10

    if (isAdd) {
      // 2-stellige Addition mit Zehnerübergang (e1 + e2 > 10), Summe < 100
      let attempts = 0
      while (attempts < 200) {
        attempts++
        const z1 = getRandomInt(2, 5)
        const e1 = getRandomInt(4, 9)
        const z2 = getRandomInt(1, 8 - z1)
        const e2 = getRandomInt(11 - e1, 9)
        num1 = z1 * 10 + e1
        num2 = z2 * 10 + e2
        if (num1 + num2 <= 100 && (num1 % 10) + (num2 % 10) > 10) break
      }

      const ten = Math.floor(num2 / 10) * 10
      const one = num2 % 10
      const step1Res = num1 + ten
      const result = step1Res + one

      items.push({
        prefix,
        num1,
        num2,
        op: '+',
        step1Ten: ten,
        step1Res,
        step2One: one,
        result,
      })
      solutionItems.push(
        `${prefix} ${num1} + ${num2} = ${result} (1. Schritt: ${num1} + ${ten} = ${step1Res} | 2. Schritt: ${step1Res} + ${one} = ${result})`
      )
    } else {
      // 2-stellige Subtraktion mit Zehnerübergang (e1 < e2), num1 > num2
      let attempts = 0
      while (attempts < 200) {
        attempts++
        const z1 = getRandomInt(5, 9)
        const e1 = getRandomInt(1, 5)
        const z2 = getRandomInt(1, z1 - 2)
        const e2 = getRandomInt(e1 + 2, 9)
        num1 = z1 * 10 + e1
        num2 = z2 * 10 + e2
        if (num1 > num2 && (num1 % 10) < (num2 % 10) && num1 - num2 >= 10) break
      }

      const ten = Math.floor(num2 / 10) * 10
      const one = num2 % 10
      const step1Res = num1 - ten
      const result = step1Res - one

      items.push({
        prefix,
        num1,
        num2,
        op: '-',
        step1Ten: ten,
        step1Res,
        step2One: one,
        result,
      })
      solutionItems.push(
        `${prefix} ${num1} - ${num2} = ${result} (1. Schritt: ${num1} - ${ten} = ${step1Res} | 2. Schritt: ${step1Res} - ${one} = ${result})`
      )
    }
  }

  return {
    id: 1,
    type: 'halbschriftlich',
    title: 'Halbschriftliches Rechnen (in zwei Schritten)',
    instruction:
      'Rechne in zwei Schritten: Zuerst die Zehner, dann die Einer.',
    items,
    solutionItems,
  }
}

// ═════════════════════════════════════════════════════════════════
// 3. THEMEN: KLEINES 1X1 (KERN- & ALLE REIHEN, DIVISION)
// ═════════════════════════════════════════════════════════════════

// 3.1 1x1 Punktefelder (Plus- & Malaufgabe)
export interface MultiplicationArrayItemData {
  prefix: string
  rows: number
  cols: number
  product: number
  plusTerms: number[]
}

export function generateMultiplicationArrayTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: MultiplicationArrayItemData[] = []
  const solutionItems: string[] = []
  const used = new Set<string>()

  for (let i = 0; i < count; i++) {
    let rows = 3
    let cols = 4
    let attempts = 0
    while (attempts < 100) {
      attempts++
      rows = getRandomInt(2, 5)
      cols = getRandomInt(2, 7)
      const key = `${rows}x${cols}`
      if (!used.has(key)) {
        used.add(key)
        break
      }
    }

    const prod = rows * cols
    const prefix = letters[i] || `${i + 1})`
    const plusTerms = Array.from({ length: rows }, () => cols)

    items.push({
      prefix,
      rows,
      cols,
      product: prod,
      plusTerms,
    })

    const plusStr = plusTerms.join(' + ') + ` = ${prod}`
    solutionItems.push(
      `${prefix} Plusaufgabe: ${plusStr} | Malaufgabe: ${rows} · ${cols} = ${prod}`
    )
  }

  return {
    id: 1,
    type: 'einmaleins_punktefeld',
    title: '1x1 Punktefelder (Plus- & Malaufgabe)',
    instruction:
      'Schau dir das Punktefeld an. Schreibe zuerst die Plusaufgabe und dann die Malaufgabe auf.',
    items,
    solutionItems,
  }
}

// 3.2 Einmaleins-Reihen & Kopfrechnen
export interface EinmaleinsItemData {
  prefix: string
  rows: number
  cols: number
  product: number
}

export function generateEinmaleinsTask(count = 4, isKern = false): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: EinmaleinsItemData[] = []
  const solutionItems: string[] = []
  const used = new Set<string>()

  for (let i = 0; i < count; i++) {
    let rows = 2
    let cols = 3
    let attempts = 0
    while (attempts < 100) {
      attempts++
      if (isKern) {
        const kernFactors = [1, 2, 5, 10]
        if (Math.random() < 0.25) {
          const sq = getRandomInt(2, 9)
          rows = sq
          cols = sq
        } else {
          rows = kernFactors[getRandomInt(0, kernFactors.length - 1)]
          cols = getRandomInt(2, 9)
        }
      } else {
        rows = getRandomInt(2, 9)
        cols = getRandomInt(2, 9)
      }
      const key = `${rows}x${cols}`
      if (!used.has(key)) {
        used.add(key)
        break
      }
    }

    const prefix = letters[i] || `${i + 1})`
    const prod = rows * cols

    items.push({
      prefix,
      rows,
      cols,
      product: prod,
    })

    solutionItems.push(
      `${prefix} ${rows} · ${cols} = ${prod} (Tauschaufgabe: ${cols} · ${rows} = ${prod})`
    )
  }

  return {
    id: 2,
    type: 'einmaleins',
    title: isKern ? 'Kleines 1x1: Kernaufgaben' : 'Kleines 1x1: Multiplikation',
    instruction:
      'Löse die Malaufgaben und nutze bei Bedarf die Tauschaufgabe.',
    items,
    solutionItems,
  }
}

// 3.3 Geteilt-Aufgaben (Division ohne Rest)
export interface DivisionItemData {
  prefix: string
  dividend: number
  divisor: number
  quotient: number
}

export function generateDivisionTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: DivisionItemData[] = []
  const solutionItems: string[] = []
  const used = new Set<string>()

  for (let i = 0; i < count; i++) {
    let b = 2
    let q = 2
    let attempts = 0
    while (attempts < 100) {
      attempts++
      b = getRandomInt(2, 9)
      q = getRandomInt(2, 10)
      const key = `${b * q}:${b}`
      if (!used.has(key)) {
        used.add(key)
        break
      }
    }
    const a = b * q
    const prefix = letters[i] || `${i + 1})`
    items.push({
      prefix,
      dividend: a,
      divisor: b,
      quotient: q,
    })
    solutionItems.push(`${prefix} ${a} : ${b} = ${q}`)
  }

  return {
    id: 3,
    type: 'division',
    title: 'Geteilt-Aufgaben (Division ohne Rest)',
    instruction:
      'Löse die Geteilt-Aufgaben. Denke an die passende Malaufgabe (Umkehraufgabe)!',
    items,
    solutionItems,
  }
}

// 3.4 Tausch- & Umkehraufgaben (1x1 Aufgabenfamilien)
export interface EinmaleinsUmkehrItemData {
  prefix: string
  a: number
  b: number
  product: number
}

export function generateEinmaleinsUmkehrTask(count = 2): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: EinmaleinsUmkehrItemData[] = []
  const solutionItems: string[] = []
  const used = new Set<number>()

  for (let i = 0; i < count; i++) {
    let a = 2
    let b = 3
    let attempts = 0
    while (attempts < 100) {
      attempts++
      a = getRandomInt(2, 9)
      b = getRandomInt(2, 9)
      if (a !== b && !used.has(a * b)) {
        used.add(a * b)
        break
      }
    }
    const p = a * b
    const prefix = letters[i] || `${i + 1})`
    items.push({
      prefix,
      a,
      b,
      product: p,
    })
    solutionItems.push(
      `${prefix} Zahlen ${a}, ${b}, ${p} → ${a} · ${b} = ${p} | ${b} · ${a} = ${p} | ${p} : ${b} = ${a} | ${p} : ${a} = ${b}`
    )
  }

  return {
    id: 4,
    type: 'einmaleins_umkehr',
    title: 'Tausch- & Umkehraufgaben (1x1-Familien)',
    instruction:
      'Bilde aus den drei Zahlen im Dreieck zwei Malaufgaben und zwei Geteilt-Aufgaben.',
    items,
    solutionItems,
  }
}

// ═════════════════════════════════════════════════════════════════
// 4. THEMA: GEOMETRIE: KÖRPERFORMEN & SYMMETRIE
// ═════════════════════════════════════════════════════════════════

export type KoerperType = 'Wuerfel' | 'Quader' | 'Kugel' | 'Zylinder' | 'Pyramide'

export interface KoerperSteckbriefItemData {
  prefix: string
  shape: KoerperType
  germanName: string
  ecken: number
  kanten: number
  flaechen: number
}

export function generateGeometrieKoerperTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)']
  const bodies: KoerperSteckbriefItemData[] = [
    {
      prefix: letters[0],
      shape: 'Wuerfel',
      germanName: 'Würfel',
      ecken: 8,
      kanten: 12,
      flaechen: 6,
    },
    {
      prefix: letters[1],
      shape: 'Quader',
      germanName: 'Quader',
      ecken: 8,
      kanten: 12,
      flaechen: 6,
    },
    {
      prefix: letters[2],
      shape: 'Kugel',
      germanName: 'Kugel',
      ecken: 0,
      kanten: 0,
      flaechen: 1,
    },
    {
      prefix: letters[3],
      shape: 'Zylinder',
      germanName: 'Zylinder',
      ecken: 0,
      kanten: 2,
      flaechen: 3,
    },
  ]

  const items = bodies.slice(0, count)
  const solutionItems = items.map(
    (b) =>
      `${b.prefix} ${b.germanName}: ${b.ecken} Ecken, ${b.kanten} Kanten, ${b.flaechen} Flächen`
  )

  return {
    id: 1,
    type: 'geometrie_koerper',
    title: 'Geometrische Körper (Steckbriefe)',
    instruction:
      'Schreibe den Namen des Körpers auf und bestimme die Anzahl der Ecken, Kanten und Flächen.',
    items,
    solutionItems,
  }
}

// 4.2 Achsensymmetrie (Spiegelbilder zeichnen auf 8x6 Gitter mit roter Achse)
export interface AchsensymmetrieItemData {
  prefix: string
  cols: number
  rows: number
  axisCol: number
  leftPoints: { x: number; y: number }[]
  reflectedPoints: { x: number; y: number }[]
}

export function generateAchsensymmetrieTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)']
  // 8 Spalten (0..7), Spiegelachse bei x = 4 (mittig)
  // Linke Figuren liegen in Spalten 0..3, gespiegelt in 4..7
  const patterns = [
    {
      // Dach / Pfeil nach links
      left: [{ x: 3, y: 1 }, { x: 1, y: 3 }, { x: 3, y: 5 }],
      right: [{ x: 4, y: 1 }, { x: 6, y: 3 }, { x: 4, y: 5 }],
    },
    {
      // Treppenstufe
      left: [{ x: 3, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 4 }, { x: 3, y: 4 }],
      right: [{ x: 4, y: 1 }, { x: 6, y: 1 }, { x: 6, y: 4 }, { x: 4, y: 4 }],
    },
    {
      // Zickzack
      left: [{ x: 3, y: 1 }, { x: 1, y: 2 }, { x: 3, y: 4 }, { x: 1, y: 5 }],
      right: [{ x: 4, y: 1 }, { x: 6, y: 2 }, { x: 4, y: 4 }, { x: 6, y: 5 }],
    },
    {
      // Dreieck
      left: [{ x: 3, y: 2 }, { x: 0, y: 4 }, { x: 3, y: 5 }],
      right: [{ x: 4, y: 2 }, { x: 7, y: 4 }, { x: 4, y: 5 }],
    },
  ]

  const items: AchsensymmetrieItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < Math.min(count, patterns.length); i++) {
    const p = patterns[i]
    const prefix = letters[i]
    items.push({
      prefix,
      cols: 8,
      rows: 6,
      axisCol: 4,
      leftPoints: p.left,
      reflectedPoints: p.right,
    })
    solutionItems.push(
      `${prefix} Figur an der roten Spiegelachse symmetrisch nach rechts ergänzt.`
    )
  }

  return {
    id: 2,
    type: 'achsensymmetrie',
    title: 'Achsensymmetrie (Spiegelbilder zeichnen)',
    instruction:
      'Spiegle die vorgezeichnete Figur exakt an der roten Spiegelachse nach rechts.',
    items,
    solutionItems,
  }
}

// 4.3 Körpernetze & Ansichten
export interface KoerpernetzItemData {
  prefix: string
  shapeName: string
  question: string
  options: string[]
  solution: string
}

export function generateKoerpernetzeTask(count = 3): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)']
  const pool = [
    {
      shapeName: 'Würfel',
      question: 'Aus wie vielen quadratischen Flächen besteht ein Würfelnetz?',
      options: ['4 Quadrate', '6 Quadrate', '8 Quadrate'],
      solution: '6 Quadrate',
    },
    {
      shapeName: 'Quader',
      question: 'Welche Flächen hat ein Quader?',
      options: ['6 Rechtecke (oder 4 Rechtecke und 2 Quadrate)', '4 Dreiecke', '2 Kreise'],
      solution: '6 Rechtecke (oder 4 Rechtecke und 2 Quadrate)',
    },
    {
      shapeName: 'Kugel',
      question: 'Hat eine Kugel Ecken oder Kanten?',
      options: ['Nein, eine Kugel hat 0 Ecken und 0 Kanten.', 'Ja, 1 Kante.', 'Ja, 8 Ecken.'],
      solution: 'Nein, eine Kugel hat 0 Ecken und 0 Kanten.',
    },
  ]

  const items: KoerpernetzItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const p = pool[i]
    const prefix = letters[i]
    items.push({
      prefix,
      shapeName: p.shapeName,
      question: p.question,
      options: p.options,
      solution: p.solution,
    })
    solutionItems.push(`${prefix} ${p.question} → Antwort: ${p.solution}`)
  }

  return {
    id: 3,
    type: 'koerpernetze',
    title: 'Körpernetze & Ansichten',
    instruction:
      'Beantworte die Fragen zu den Körpernetzen und Ansichten.',
    items,
    solutionItems,
  }
}

// ═════════════════════════════════════════════════════════════════
// 5. THEMA: GRÖSSEN: LÄNGEN (METER UND ZENTIMETER)
// ═════════════════════════════════════════════════════════════════

// 5.1 Strecken mit dem Lineal messen (0 bis 12 cm)
export interface RulerMeasureItemData {
  prefix: string
  lineLengthCm: number
}

export function generateLaengenMessenTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const uniqueLengths = getRandomUniqueInts(count, 3, 12)

  const items: RulerMeasureItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < uniqueLengths.length; i++) {
    const len = uniqueLengths[i]
    const prefix = letters[i] || `${i + 1})`
    items.push({
      prefix,
      lineLengthCm: len,
    })
    solutionItems.push(`${prefix} Die Strecke ist genau ${len} cm lang.`)
  }

  return {
    id: 1,
    type: 'laengen_messen',
    title: 'Strecken mit dem Lineal messen (cm)',
    instruction:
      'Lies die Länge der farbigen Strecke am Lineal ab und trage die Zentimeter ein.',
    items,
    solutionItems,
  }
}

// 5.2 Längen umrechnen (m & cm, Stützpunkt 1 m = 100 cm)
export interface LaengenUmrechnenItemData {
  prefix: string
  taskType: 'm_to_cm' | 'mixed_to_cm' | 'cm_to_mixed' | 'complement_to_1m'
  givenText: string
  solutionText: string
}

export function generateLaengenUmrechnenTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: LaengenUmrechnenItemData[] = []
  const solutionItems: string[] = []

  const types: Array<'m_to_cm' | 'mixed_to_cm' | 'cm_to_mixed' | 'complement_to_1m'> = [
    'm_to_cm',
    'mixed_to_cm',
    'cm_to_mixed',
    'complement_to_1m',
  ]

  for (let i = 0; i < count; i++) {
    const prefix = letters[i] || `${i + 1})`
    const t = types[i % types.length]

    if (t === 'm_to_cm') {
      const m = getRandomInt(2, 9)
      const cm = m * 100
      items.push({
        prefix,
        taskType: t,
        givenText: `${m} m = [   ] cm`,
        solutionText: `${m} m = ${cm} cm`,
      })
      solutionItems.push(`${prefix} ${m} m = ${cm} cm`)
    } else if (t === 'mixed_to_cm') {
      const m = getRandomInt(1, 4)
      const cmPart = getRandomInt(2, 19) * 5 // 10..95
      const totalCm = m * 100 + cmPart
      items.push({
        prefix,
        taskType: t,
        givenText: `${m} m ${cmPart} cm = [   ] cm`,
        solutionText: `${m} m ${cmPart} cm = ${totalCm} cm`,
      })
      solutionItems.push(`${prefix} ${m} m ${cmPart} cm = ${totalCm} cm`)
    } else if (t === 'cm_to_mixed') {
      const m = getRandomInt(1, 4)
      const cmPart = getRandomInt(1, 9) * 10 // 10..90
      const totalCm = m * 100 + cmPart
      items.push({
        prefix,
        taskType: t,
        givenText: `${totalCm} cm = [   ] m [   ] cm`,
        solutionText: `${totalCm} cm = ${m} m ${cmPart} cm`,
      })
      solutionItems.push(`${prefix} ${totalCm} cm = ${m} m ${cmPart} cm`)
    } else {
      const cm = getRandomInt(2, 18) * 5 // 10..90
      const rest = 100 - cm
      items.push({
        prefix,
        taskType: t,
        givenText: `${cm} cm + [   ] cm = 1 m`,
        solutionText: `${cm} cm + ${rest} cm = 1 m (100 cm)`,
      })
      solutionItems.push(`${prefix} ${cm} cm + ${rest} cm = 1 m (100 cm)`)
    }
  }

  return {
    id: 2,
    type: 'laengen_umrechnen',
    title: 'Längen umrechnen (m und cm)',
    instruction:
      'Wandle die Längen um oder ergänze auf 1 Meter (1 m = 100 cm).',
    items,
    solutionItems,
  }
}

// 5.3 Längen vergleichen & berechnen
export interface LaengenVergleichItemData {
  prefix: string
  left: string
  right: string
  op: '<' | '>' | '='
}

export function generateLaengenVergleichTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: LaengenVergleichItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const prefix = letters[i] || `${i + 1})`
    const mode = i % 4

    let left = ''
    let right = ''
    let op: '<' | '>' | '=' = '='

    if (mode === 0) {
      // 1 m X cm vs Y cm
      const m = 1
      const cm = getRandomInt(15, 60)
      const leftVal = m * 100 + cm
      const delta = getRandomInt(5, 15) * (Math.random() > 0.5 ? 1 : -1)
      const rightVal = leftVal + delta
      op = leftVal > rightVal ? '>' : '<'
      left = `${m} m ${cm} cm`
      right = `${rightVal} cm`
    } else if (mode === 1) {
      // Ergänzung auf 1m: X cm + Y cm vs 1 m
      const c1 = getRandomInt(3, 8) * 10
      const c2 = 100 - c1
      left = `${c1} cm + ${c2} cm`
      right = '1 m'
      op = '='
    } else if (mode === 2) {
      // X cm vs 1 m Y cm
      const cm1 = getRandomInt(85, 98)
      const cm2 = getRandomInt(5, 15)
      left = `${cm1} cm`
      right = `1 m ${cm2 < 10 ? '0' + cm2 : cm2} cm`
      op = '<'
    } else {
      // 2 m X cm vs Y cm
      const m = 2
      const cm = getRandomInt(10, 50)
      const leftVal = m * 100 + cm
      const rightVal = leftVal - getRandomInt(5, 20)
      left = `${m} m ${cm} cm`
      right = `${rightVal} cm`
      op = '>'
    }

    items.push({ prefix, left, right, op })
    solutionItems.push(`${prefix} ${left} ${op} ${right}`)
  }

  return {
    id: 3,
    type: 'laengen_vergleich',
    title: 'Längen vergleichen (< > =)',
    instruction:
      'Setze das passende Zeichen <, > oder = ein.',
    items,
    solutionItems,
  }
}

// ═════════════════════════════════════════════════════════════════
// 6. THEMA: GRÖSSEN: GELD MIT KOMMA (€ & CT BIS 100 €)
// ═════════════════════════════════════════════════════════════════

// 6.1 Geldbeträge in Kommaschreibweise
export interface GeldKommaItemData {
  prefix: string
  euro: number
  cent: number
  commaStr: string
}

export function generateGeldKommaTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: GeldKommaItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const euro = getRandomInt(2, 60)
    const cent = getRandomInt(1, 19) * 5
    const commaStr = `${euro},${cent < 10 ? '0' + cent : cent} €`
    const prefix = letters[i] || `${i + 1})`
    items.push({ prefix, euro, cent, commaStr })
    solutionItems.push(`${prefix} ${euro} € ${cent < 10 ? '0' + cent : cent} ct = ${commaStr}`)
  }

  return {
    id: 1,
    type: 'geld_komma',
    title: 'Geldbeträge in Kommaschreibweise',
    instruction:
      'Wandle die Geldbeträge in die Kommaschreibweise um.',
    items,
    solutionItems,
  }
}

// 6.2 Rechnen mit Geld & Rückgeld (bis 100 €)
export interface GeldRueckgeldItemData {
  prefix: string
  itemDesc: string
  price: number
  paidWith: number
  change: number
}

export function generateGeldRueckgeldTask(count = 3): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const itemNames = [
    'Buch', 'Rucksack', 'Malkasten', 'Füller', 'Turnbeutel',
    'Kartenspiel', 'Mütze', 'Trinkflasche', 'Schulheft-Set', 'Tuschkasten'
  ].sort(() => Math.random() - 0.5)

  const items: GeldRueckgeldItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const itemDesc = itemNames[i % itemNames.length]
    const banknotes = [20, 50, 100]
    const paidWith = banknotes[i % banknotes.length]
    const price = getRandomInt(Math.floor(paidWith * 0.25), Math.floor(paidWith * 0.85))
    const change = paidWith - price
    const prefix = letters[i] || `${i + 1})`

    items.push({ prefix, itemDesc, price, paidWith, change })
    solutionItems.push(
      `${prefix} ${itemDesc} kostet ${price} € | Gezahlt: ${paidWith} € | Rückgeld: ${change} €`
    )
  }

  return {
    id: 2,
    type: 'geld_rueckgeld',
    title: 'Rechnen mit Geld: Rückgeld an der Kasse',
    instruction:
      'Berechne, wie viel Rückgeld das Kind an der Kasse zurückbekommt.',
    items,
    solutionItems,
  }
}

// ═════════════════════════════════════════════════════════════════
// 7. THEMA: GRÖSSEN: ZEIT (STUNDE & MINUTE, ANALOG & DIGITAL)
// ═════════════════════════════════════════════════════════════════

// 7.1 Uhrzeiten ablesen (Viertel, Halb, Dreiviertel, Minuten)
export interface AnalogClockGrade2ItemData {
  prefix: string
  hours12: number
  minutes: number
  morningTime: string
  afternoonTime: string
  textDescription: string
}

export function generateAnalogClockGrade2Task(count = 3): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: AnalogClockGrade2ItemData[] = []
  const solutionItems: string[] = []

  const minutePool = [0, 15, 30, 45, 10, 20, 40, 50]
  const used = new Set<string>()

  for (let i = 0; i < count; i++) {
    let h12 = 8
    let m = 15
    let attempts = 0
    while (attempts < 100) {
      attempts++
      h12 = getRandomInt(1, 12)
      m = minutePool[getRandomInt(0, minutePool.length - 1)]
      const key = `${h12}:${m}`
      if (!used.has(key)) {
        used.add(key)
        break
      }
    }

    const hMorning = h12 < 10 ? `0${h12}` : `${h12}`
    const hAfternoon = `${h12 + 12}`
    const mStr = m < 10 ? `0${m}` : `${m}`
    const morning = `${hMorning}:${mStr}`
    const afternoon = `${hAfternoon}:${mStr}`

    let desc = `${h12} Uhr`
    if (m === 15) desc = `Viertel nach ${h12}`
    else if (m === 30) desc = `halb ${h12 === 12 ? 1 : h12 + 1}`
    else if (m === 45) desc = `Viertel vor ${h12 === 12 ? 1 : h12 + 1}`
    else if (m > 0) desc = `${m} nach ${h12}`

    const prefix = letters[i] || `${i + 1})`
    items.push({
      prefix,
      hours12: h12,
      minutes: m,
      morningTime: `${morning} Uhr`,
      afternoonTime: `${afternoon} Uhr`,
      textDescription: desc,
    })
    solutionItems.push(
      `${prefix} ${desc} → Vormittag: ${morning} Uhr | Nachmittag: ${afternoon} Uhr`
    )
  }

  return {
    id: 1,
    type: 'uhrzeit_ablesen_k2',
    title: 'Uhrzeiten ablesen (analog & digital)',
    instruction:
      'Lies die Uhrzeit an der analogen Uhr ab und trage die digitale Uhrzeit für Vormittag und Nachmittag ein.',
    items,
    solutionItems,
  }
}

// 7.2 Zeiger einzeichnen (Stunde & Minute)
export interface ZeigerEinzeichnenGrade2ItemData {
  prefix: string
  digitalTime: string
  verbalTime: string
  hours12: number
  minutes: number
}

export function generateZeigerEinzeichnenGrade2Task(count = 3): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: ZeigerEinzeichnenGrade2ItemData[] = []
  const solutionItems: string[] = []

  const minuteOptions = [15, 30, 45, 10, 20, 50]
  const used = new Set<string>()

  for (let i = 0; i < count; i++) {
    let h12 = 3
    let m = 30
    let attempts = 0
    while (attempts < 100) {
      attempts++
      h12 = getRandomInt(1, 12)
      m = minuteOptions[getRandomInt(0, minuteOptions.length - 1)]
      const key = `${h12}:${m}`
      if (!used.has(key)) {
        used.add(key)
        break
      }
    }

    const isAfternoon = Math.random() > 0.5
    const displayH = isAfternoon ? h12 + 12 : h12
    const hStr = displayH < 10 ? `0${displayH}` : `${displayH}`
    const mStr = m < 10 ? `0${m}` : `${m}`
    const digital = `${hStr}:${mStr} Uhr`

    let verbal = ''
    if (m === 15) verbal = `Viertel nach ${h12}`
    else if (m === 30) verbal = `halb ${h12 === 12 ? 1 : h12 + 1}`
    else if (m === 45) verbal = `Viertel vor ${h12 === 12 ? 1 : h12 + 1}`
    else verbal = `${m} nach ${h12}`

    const prefix = letters[i] || `${i + 1})`
    items.push({
      prefix,
      digitalTime: digital,
      verbalTime: verbal,
      hours12: h12,
      minutes: m,
    })
    solutionItems.push(`${prefix} ${digital} (${verbal}): Zeiger eingezeichnet.`)
  }

  return {
    id: 2,
    type: 'uhrzeit_zeichnen_k2',
    title: 'Zeiger einzeichnen (Stunde & Minute)',
    instruction:
      'Zeichne den Stundenzeiger (kurz) und den Minutenzeiger (lang) passend in die Uhren ein.',
    items,
    solutionItems,
  }
}

// 7.3 Zeitspannen & Zeitdauer berechnen
export interface ZeitspannenGrade2ItemData {
  prefix: string
  startTime: string
  endTime: string
  durationMinutes: number
}

export function generateZeitspannenGrade2Task(count = 3): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: ZeitspannenGrade2ItemData[] = []
  const solutionItems: string[] = []

  const durations = [15, 30, 45, 60]

  for (let i = 0; i < count; i++) {
    const dur = durations[getRandomInt(0, durations.length - 1)]
    const startHour = getRandomInt(8, 16)
    const startMin = [0, 15, 30, 45][getRandomInt(0, 3)]

    const startTotalMin = startHour * 60 + startMin
    const endTotalMin = startTotalMin + dur

    const endHour = Math.floor(endTotalMin / 60)
    const endMin = endTotalMin % 60

    const startStr = `${startHour < 10 ? '0' + startHour : startHour}:${startMin < 10 ? '0' + startMin : startMin} Uhr`
    const endStr = `${endHour < 10 ? '0' + endHour : endHour}:${endMin < 10 ? '0' + endMin : endMin} Uhr`

    const prefix = letters[i] || `${i + 1})`
    items.push({
      prefix,
      startTime: startStr,
      endTime: endStr,
      durationMinutes: dur,
    })
    solutionItems.push(
      `${prefix} Von ${startStr} bis ${endStr} vergehen genau ${dur} Minuten.`
    )
  }

  return {
    id: 3,
    type: 'zeitspannen_k2',
    title: 'Zeitspannen & Zeitdauer berechnen',
    instruction:
      'Wie viel Zeit vergeht? Berechne die Minuten zwischen Start- und Endzeit.',
    items,
    solutionItems,
  }
}

// ═════════════════════════════════════════════════════════════════
// 8. THEMA: DATEN & ZUFALL: TABELLEN & EINFACHE DIAGRAMME
// ═════════════════════════════════════════════════════════════════

// 8.1 Säulendiagramm / Balkendiagramm ablesen
export interface DiagrammKlasse2ItemData {
  title: string
  categories: { label: string; count: number; color: string }[]
  questions: { question: string; solution: string }[]
}

export function generateDiagrammKlasse2Task(): GeneratedTask {
  const animalPool = [
    { label: 'Hund', color: '#3b82f6' },
    { label: 'Katze', color: '#10b981' },
    { label: 'Pferd', color: '#f59e0b' },
    { label: 'Hase', color: '#ec4899' },
  ]

  // Zufällige aber unterschiedliche Stimmenzahlen
  const counts = getRandomUniqueInts(4, 3, 12)
  const categories = animalPool.map((a, idx) => ({
    ...a,
    count: counts[idx],
  }))

  const total = categories.reduce((sum, c) => sum + c.count, 0)
  const maxCategory = categories.reduce((max, c) => (c.count > max.count ? c : max), categories[0])
  const minCategory = categories.reduce((min, c) => (c.count < min.count ? c : min), categories[0])

  const questions = [
    {
      question: `a) Wie viele Kinder mögen ${categories[0].label}e am liebsten?`,
      solution: `${categories[0].count} Kinder`,
    },
    {
      question: 'b) Welches Tier wurde am häufigsten gewählt?',
      solution: `Der ${maxCategory.label} (${maxCategory.count} Stimmen)`,
    },
    {
      question: 'c) Welches Tier wurde am seltensten gewählt?',
      solution: `Der ${minCategory.label} (${minCategory.count} Stimmen)`,
    },
    {
      question: 'd) Wie viele Kinder haben insgesamt abgestimmt?',
      solution: `${total} Kinder`,
    },
  ]

  const itemData: DiagrammKlasse2ItemData = {
    title: 'Lieblingstiere der Klasse 2a',
    categories,
    questions,
  }

  return {
    id: 1,
    type: 'diagramm_k2',
    title: 'Säulendiagramm ablesen: Lieblingstiere',
    instruction:
      'Schau dir das Säulendiagramm an und beantworte die Fragen.',
    items: [itemData],
    solutionItems: questions.map((q) => `${q.question} → ${q.solution}`),
  }
}

// 8.2 Tabelle auswerten & ergänzen
export interface TabelleKlasse2ItemData {
  prefix: string
  fruit: string
  count: number
}

export function generateTabelleKlasse2Task(): GeneratedTask {
  const fruitNames = ['Äpfel', 'Bananen', 'Birnen', 'Erdbeeren']
  const letters = ['a)', 'b)', 'c)', 'd)']
  const counts = getRandomUniqueInts(4, 5, 18)

  const data: TabelleKlasse2ItemData[] = fruitNames.map((fruit, idx) => ({
    prefix: letters[idx],
    fruit,
    count: counts[idx],
  }))

  return {
    id: 2,
    type: 'tabelle_k2',
    title: 'Tabelle auswerten: Pausenobst',
    instruction:
      'Lies die Werte aus der Tabelle ab und beantworte die Fragen zur Obstmenge.',
    items: data,
    solutionItems: data.map((d) => `${d.prefix} ${d.fruit}: ${d.count} Stück`),
  }
}

// 8.3 Kombinatorik & Zufall
export interface KombinatorikKlasse2ItemData {
  prefix: string
  problemText: string
  itemsA: string[]
  itemsB: string[]
  solutionCount: number
}

export function generateKombinatorikKlasse2Task(): GeneratedTask {
  const names = ['Mia', 'Leon', 'Lukas', 'Sophie', 'Ben', 'Emma']
  const name = names[getRandomInt(0, names.length - 1)]

  const shirtColors = ['Rot', 'Blau', 'Gelb', 'Grün'].sort(() => Math.random() - 0.5).slice(0, 2)
  const pantsColors = ['Schwarz', 'Grau', 'Blau', 'Weiß'].sort(() => Math.random() - 0.5).slice(0, 3)

  const solCount = shirtColors.length * pantsColors.length

  const item: KombinatorikKlasse2ItemData = {
    prefix: 'a)',
    problemText:
      `${name} hat ${shirtColors.length} verschiedene T-Shirts (${shirtColors.map(c => c.toLowerCase()).join(', ')}) und ${pantsColors.length} verschiedene Hosen (${pantsColors.map(c => c.toLowerCase()).join(', ')}). Wie viele verschiedene Outfits kann ${name} anziehen?`,
    itemsA: shirtColors.map(c => `${c}es T-Shirt`),
    itemsB: pantsColors.map(c => `${c}e Hose`),
    solutionCount: solCount,
  }

  return {
    id: 3,
    type: 'kombinatorik_k2',
    title: 'Kombinatorik: Verschiedene Möglichkeiten',
    instruction:
      'Finde alle Möglichkeiten und berechne die Gesamtzahl der Kombinationen.',
    items: [item],
    solutionItems: [
      `a) ${shirtColors.length} T-Shirts · ${pantsColors.length} Hosen = ${solCount} verschiedene Outfits.`,
    ],
  }
}

// ═════════════════════════════════════════════════════════════════
// HAUPT-GENERATOR FÜR KLASSE 2 (ABWÄRTSKOMPATIBEL)
// ═════════════════════════════════════════════════════════════════
export interface GenerateKlasse2Options {
  thema?: string
  selectedTaskTypes?: string[]
  tasksPerLevel?: number
}

export function normalizeKlasse2TaskType(typeStr: string): string {
  const lower = (typeStr || '').toLowerCase().trim()
  if (lower.includes('hunderter') || lower.includes('zahlenrätsel') || lower.includes('tafel')) return 'hundertertafel'
  if (lower.includes('zehnerstange') || lower.includes('bündeln') || lower.includes('dienes')) return 'zehnerstangen_einer'
  if (lower.includes('nachbar') || lower.includes('nachbarzehner')) return 'nachbarzahlen_k2'
  if (lower.includes('halbschriftlich') || lower.includes('schritte') || lower.includes('rechenweg')) return 'halbschriftlich'
  if (lower.includes('punktefeld') && (lower.includes('1x1') || lower.includes('mal'))) return 'einmaleins_punktefeld'
  if (lower.includes('division') || lower.includes('geteilt')) return 'division'
  if (lower.includes('umkehr') || lower.includes('familie')) return 'einmaleins_umkehr'
  if (lower.includes('einmaleins') || lower.includes('malreihe') || lower.includes('1x1')) return 'einmaleins'
  if (lower.includes('rückgeld') || lower.includes('kasse') || lower.includes('bon')) return 'geld_rueckgeld'
  if (lower.includes('komma') || (lower.includes('geld') && lower.includes('ct'))) return 'geld_komma'
  if (lower.includes('lineal') || (lower.includes('messen') && lower.includes('cm'))) return 'laengen_messen'
  if (lower.includes('umrechnen') && (lower.includes('länge') || lower.includes('meter') || lower.includes('cm'))) return 'laengen_umrechnen'
  if (lower.includes('vergleich') && (lower.includes('länge') || lower.includes('m'))) return 'laengen_vergleich'
  if (lower.includes('symmetrie') || lower.includes('spiegel')) return 'achsensymmetrie'
  if (lower.includes('netz') || lower.includes('ansicht')) return 'koerpernetze'
  if (lower.includes('körper') || lower.includes('steckbrief')) return 'geometrie_koerper'
  if (lower.includes('uhrzeit') && (lower.includes('zeichnen') || lower.includes('zeiger'))) return 'uhrzeit_zeichnen_k2'
  if (lower.includes('uhrzeit') || lower.includes('stunde') || lower.includes('minute')) return 'uhrzeit_ablesen_k2'
  if (lower.includes('zeitspanne') || lower.includes('zeitdauer')) return 'zeitspannen_k2'
  if (lower.includes('diagramm') || lower.includes('säule') || lower.includes('balken')) return 'diagramm_k2'
  if (lower.includes('tabelle')) return 'tabelle_k2'
  if (lower.includes('kombinatorik') || lower.includes('zufall')) return 'kombinatorik_k2'
  if (lower.includes('kopfrechnen')) return 'kopfrechnen'
  if (lower.includes('sachaufgabe') || lower.includes('textaufgabe')) return 'sachaufgaben'
  if (lower.includes('mauer')) return 'zahlenmauern'
  if (lower.includes('dreieck')) return 'rechendreiecke'
  if (lower.includes('größer') || lower.includes('< > =')) return 'groesser_kleiner_gleich'
  return lower
}

export function generateKlasse2Arbeitsblatt(
  options: GenerateKlasse2Options = {}
): GeneratedWorksheet {
  const thema = options.thema || 'Mathematik Klasse 2: Zahlenraum bis 100'
  const countPerTask = options.tasksPerLevel || 4

  const rawTypes =
    options.selectedTaskTypes && options.selectedTaskTypes.length > 0
      ? options.selectedTaskTypes
      : [
          'Hundertertafel & Zahlenrätsel',
          'Halbschriftliches Rechnen',
          'Malreihen & Division (Einmaleins)',
        ]

  const tasks: GeneratedTask[] = []

  rawTypes.forEach((rawType, idx) => {
    const key = normalizeKlasse2TaskType(rawType)

    switch (key) {
      case 'hundertertafel': {
        const task = generateHundertertafelTask(countPerTask)
        task.id = idx + 1
        tasks.push(task)
        break
      }
      case 'zehnerstangen_einer': {
        const task = generateDienesBlocksTask(countPerTask)
        task.id = idx + 1
        tasks.push(task)
        break
      }
      case 'nachbarzahlen_k2': {
        const task = generateNachbarzahlenKlasse2Task(countPerTask)
        task.id = idx + 1
        tasks.push(task)
        break
      }
      case 'halbschriftlich': {
        const task = generateHalbschriftlichTask(countPerTask)
        task.id = idx + 1
        tasks.push(task)
        break
      }
      case 'einmaleins_punktefeld': {
        const task = generateMultiplicationArrayTask(countPerTask)
        task.id = idx + 1
        tasks.push(task)
        break
      }
      case 'einmaleins': {
        const isKern = /kernaufgabe/i.test(thema)
        const task = generateEinmaleinsTask(countPerTask, isKern)
        task.id = idx + 1
        tasks.push(task)
        break
      }
      case 'division': {
        const task = generateDivisionTask(countPerTask)
        task.id = idx + 1
        tasks.push(task)
        break
      }
      case 'einmaleins_umkehr': {
        const task = generateEinmaleinsUmkehrTask(Math.min(countPerTask, 2))
        task.id = idx + 1
        tasks.push(task)
        break
      }
      case 'geld_komma': {
        const task = generateGeldKommaTask(countPerTask)
        task.id = idx + 1
        tasks.push(task)
        break
      }
      case 'geld_rueckgeld': {
        const task = generateGeldRueckgeldTask(countPerTask)
        task.id = idx + 1
        tasks.push(task)
        break
      }
      case 'laengen_messen': {
        const task = generateLaengenMessenTask(countPerTask)
        task.id = idx + 1
        tasks.push(task)
        break
      }
      case 'laengen_umrechnen': {
        const task = generateLaengenUmrechnenTask(countPerTask)
        task.id = idx + 1
        tasks.push(task)
        break
      }
      case 'laengen_vergleich': {
        const task = generateLaengenVergleichTask(countPerTask)
        task.id = idx + 1
        tasks.push(task)
        break
      }
      case 'geometrie_koerper': {
        const task = generateGeometrieKoerperTask(countPerTask)
        task.id = idx + 1
        tasks.push(task)
        break
      }
      case 'achsensymmetrie': {
        const task = generateAchsensymmetrieTask(countPerTask)
        task.id = idx + 1
        tasks.push(task)
        break
      }
      case 'koerpernetze': {
        const task = generateKoerpernetzeTask(countPerTask)
        task.id = idx + 1
        tasks.push(task)
        break
      }
      case 'uhrzeit_ablesen_k2': {
        const task = generateAnalogClockGrade2Task(countPerTask)
        task.id = idx + 1
        tasks.push(task)
        break
      }
      case 'uhrzeit_zeichnen_k2': {
        const task = generateZeigerEinzeichnenGrade2Task(countPerTask)
        task.id = idx + 1
        tasks.push(task)
        break
      }
      case 'zeitspannen_k2': {
        const task = generateZeitspannenGrade2Task(countPerTask)
        task.id = idx + 1
        tasks.push(task)
        break
      }
      case 'diagramm_k2': {
        const task = generateDiagrammKlasse2Task()
        task.id = idx + 1
        tasks.push(task)
        break
      }
      case 'tabelle_k2': {
        const task = generateTabelleKlasse2Task()
        task.id = idx + 1
        tasks.push(task)
        break
      }
      case 'kombinatorik_k2': {
        const task = generateKombinatorikKlasse2Task()
        task.id = idx + 1
        tasks.push(task)
        break
      }
      default: {
        // Nie unbemerkt auf Hundertertafel zurückfallen!
        // Sondern ein passendes Halbschriftlich/Kopfrechnen generieren
        const task = generateHalbschriftlichTask(countPerTask)
        task.id = idx + 1
        tasks.push(task)
        break
      }
    }
  })

  return {
    titel: thema,
    tasks,
  }
}

// Backward-compatible type aliases
export type GeometrieKoerperItemData = KoerperSteckbriefItemData | any
export type GeldKlasse2ItemData = any
export type LaengenMessenItemData = RulerMeasureItemData | any
export const generateGeldKlasse2Task = generateGeldKommaTask

export function generateDivisionRestTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: string[] = []
  const solutionItems: string[] = []
  const used = new Set<string>()

  for (let i = 0; i < count; i++) {
    let b = 3
    let q = 4
    let r = 2
    let attempts = 0
    while (attempts < 100) {
      attempts++
      b = getRandomInt(3, 8)
      q = getRandomInt(2, 7)
      r = getRandomInt(1, b - 1)
      const key = `${b * q + r}:${b}`
      if (!used.has(key)) {
        used.add(key)
        break
      }
    }
    const div = b * q + r
    const prefix = letters[i] || `${i + 1})`
    items.push(`${prefix} ${div} : ${b} = ___ Rest ___ (denn ___ · ${b} + ___ = ${div})`)
    solutionItems.push(`${prefix} ${div} : ${b} = ${q} Rest ${r} (denn ${q} · ${b} + ${r} = ${div})`)
  }

  return {
    id: 1,
    type: 'division_rest',
    title: 'Division mit Rest (Einführung)',
    instruction:
      'Rechne die Geteilt-Aufgaben aus. Wie oft passt die Zahl hinein und welcher Rest bleibt übrig?',
    items,
    solutionItems,
  }
}

export function generateKalenderDatumTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: string[] = []
  const solutionItems: string[] = []

  const pool = [
    { q: 'Ein Jahr hat wie viele Monate?', a: '12 Monate' },
    { q: 'Welcher Monat kommt direkt nach dem März?', a: 'April' },
    { q: 'Eine Woche hat wie viele Wochentage?', a: '7 Tage' },
    { q: 'Welcher Monat ist der kürzeste im Jahr?', a: 'Februar (28 bzw. 29 Tage)' },
    { q: 'Welcher Wochentag kommt direkt nach dem Donnerstag?', a: 'Freitag' },
    { q: 'Welche Monate gehören zum Sommer?', a: 'Juni, Juli, August' },
    { q: 'Welches Datum ist genau eine Woche nach dem 5. Mai?', a: '12. Mai' },
    { q: 'Wie viele Tage hat der Januar?', a: '31 Tage' },
  ].sort(() => Math.random() - 0.5)

  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const p = pool[i]
    const prefix = letters[i] || `${i + 1})`
    items.push(`${prefix} ${p.q} Antwort: _________`)
    solutionItems.push(`${prefix} ${p.q} -> ${p.a}`)
  }

  return {
    id: 1,
    type: 'kalender_datum',
    title: 'Kalender & Datum lesen',
    instruction:
      'Beantworte die Fragen rund um Kalender, Wochentage, Monate und Jahreszeiten.',
    items,
    solutionItems,
  }
}

