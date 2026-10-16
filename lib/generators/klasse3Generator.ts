/**
 * lib/generators/klasse3Generator.ts
 *
 * 100 % deterministische Generatoren für alle LehrplanPLUS Bayern Themen der 3. Klasse:
 *
 * 1. Zahlenraum bis 1.000: Stellenwerte (H-Z-E) & Zahlenstrahl
 * 2. Zahlenraum bis 1.000: Halbschriftliches Rechnen & Kopfrechnen
 * 3. Schriftliche Addition & Subtraktion (im Karopapier-Kästchenraster mit Übertrag)
 * 4. Zehner-Einmaleins: Halbschriftliche Multiplikation & Division
 * 5. Geometrie: Körpernetze, Würfelgebäude & Symmetrie
 * 6. Größen: Längen (mm, cm, m, km & Komma)
 * 7. Größen: Gewichte (g, kg, t) & Hohlmaße (ml, l) mit Waagen- & Messbecher-SVGs
 * 8. Größen: Zeitspannen, Zeitpunkt & Geld (schriftlich mit Komma)
 * 9. Daten & Zufall: Diagramme, Wahrscheinlichkeit (Kugeln) & Baumdiagramm
 */

import { GeneratedTask } from '@/types/tools'
import { generateZahlenmauern } from './zahlenmauerGenerator'
import { generateRechendreiecke } from './rechendreieckGenerator'
import { generateRechengeschichtenTask } from './rechengeschichtenGenerator'

// ═════════════════════════════════════════════════════════════════
// 1. KERN-FEATURE: SCHRIFTLICHES RECHNEN IM KÄSTCHENRASTER
// ═════════════════════════════════════════════════════════════════

export interface WrittenCalcGridItemData {
  prefix: string
  operation: '+' | '-'
  isMoney?: boolean
  unit?: string
  num1: number
  num2: number
  result: number
  // Digits formatted for columns [H, Z, E] or [Z, E, ',', z, e]
  num1Str: string
  num2Str: string
  resultStr: string
  // Überträge für die Übertragszeile (rechts nach links, z. B. Übertrag von Einer auf Zehner)
  carries: number[]
  // Für Kleckse / Fehlende Ziffern
  missingMask?: {
    num1Hidden?: number[] // indices in string to hide
    num2Hidden?: number[]
    resultHidden?: number[]
  }
  // Für Überschlagsrechnung
  ueberschlag?: {
    approx1: number
    approx2: number
    approxResult: number
  }
}

/**
 * Berechnet stellenwertgerechte Überträge für 2 dreistellige Zahlen.
 */
function calculateCarries(n1: number, n2: number, op: '+' | '-'): number[] {
  const e1 = n1 % 10
  const z1 = Math.floor((n1 % 100) / 10)
  const h1 = Math.floor(n1 / 100)

  const e2 = n2 % 10
  const z2 = Math.floor((n2 % 100) / 10)
  const h2 = Math.floor(n2 / 100)

  if (op === '+') {
    const carryEtoZ = e1 + e2 >= 10 ? 1 : 0
    const carryZtoH = z1 + z2 + carryEtoZ >= 10 ? 1 : 0
    return [carryZtoH, carryEtoZ]
  } else {
    // Abziehverfahren / Entbündeln
    const borrowE = e1 < e2 ? 1 : 0
    const borrowZ = (z1 - borrowE) < z2 ? 1 : 0
    return [borrowZ, borrowE]
  }
}

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

export function generateSchriftlicheAdditionTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: WrittenCalcGridItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const prefix = letters[i] || `${i + 1})`
    let n1 = 300
    let n2 = 200

    let attempts = 0
    while (attempts < 200) {
      attempts++
      const h1 = getRandomInt(1, 4)
      const z1 = getRandomInt(1, 8)
      const e1 = getRandomInt(3, 9)
      const h2 = getRandomInt(1, 8 - h1)
      const z2 = getRandomInt(1, 8)
      const e2 = getRandomInt(11 - e1, 9) // Zehnerübertrag garantiert
      n1 = h1 * 100 + z1 * 10 + e1
      n2 = h2 * 100 + z2 * 10 + e2
      if (n1 + n2 < 1000) break
    }

    const sum = n1 + n2
    const carries = calculateCarries(n1, n2, '+')

    items.push({
      prefix,
      operation: '+',
      num1: n1,
      num2: n2,
      result: sum,
      num1Str: String(n1),
      num2Str: String(n2),
      resultStr: String(sum),
      carries,
    })

    solutionItems.push(`${prefix} ${n1} + ${n2} = ${sum} (Übertrag: ${carries.join(', ')})`)
  }

  return {
    id: 1,
    type: 'schriftlich_addition',
    title: 'Schriftliche Addition (im Kästchenraster)',
    instruction:
      'Rechne die schriftlichen Additionsaufgaben stellenwertgerecht von rechts nach links aus. Notiere die Überträge in der kleinen Übertragszeile.',
    items,
    solutionItems,
  }
}

export function generateSchriftlicheSubtraktionTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: WrittenCalcGridItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const prefix = letters[i] || `${i + 1})`
    let n1 = 700
    let n2 = 300

    let attempts = 0
    while (attempts < 200) {
      attempts++
      const h1 = getRandomInt(5, 9)
      const z1 = getRandomInt(1, 5)
      const e1 = getRandomInt(1, 5)
      const h2 = getRandomInt(1, h1 - 2)
      const z2 = getRandomInt(z1 + 1, 8) // Zehnerübertrag
      const e2 = getRandomInt(e1 + 2, 9) // Einerübertrag
      n1 = h1 * 100 + z1 * 10 + e1
      n2 = h2 * 100 + z2 * 10 + e2
      // Immer sicherstellen: n1 > n2 (obere Zahl größer als untere!)
      if (n1 > n2 && n1 - n2 >= 50 && (n1 % 10) < (n2 % 10)) break
    }

    const diff = n1 - n2
    const carries = calculateCarries(n1, n2, '-')

    items.push({
      prefix,
      operation: '-',
      num1: n1,
      num2: n2,
      result: diff,
      num1Str: String(n1),
      num2Str: String(n2),
      resultStr: String(diff),
      carries,
    })

    solutionItems.push(`${prefix} ${n1} - ${n2} = ${diff} (Übertrag: ${carries.join(', ')})`)
  }

  return {
    id: 1,
    type: 'schriftlich_subtraktion',
    title: 'Schriftliche Subtraktion (im Kästchenraster)',
    instruction:
      'Rechne die schriftlichen Subtraktionsaufgaben stellenwertgerecht von rechts nach links aus (Abziehverfahren). Notiere die Überträge.',
    items,
    solutionItems,
  }
}

export function generateSchriftlichFehlendeZiffernTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: WrittenCalcGridItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const isAdd = i % 2 === 0
    const prefix = letters[i] || `${i + 1})`
    const op = isAdd ? ('+' as const) : ('-' as const)

    let n1 = 400
    let n2 = 200

    if (isAdd) {
      n1 = getRandomInt(180, 500)
      n2 = getRandomInt(150, 450)
    } else {
      n1 = getRandomInt(550, 950)
      n2 = getRandomInt(120, n1 - 100)
    }

    const res = op === '+' ? n1 + n2 : n1 - n2
    const carries = calculateCarries(n1, n2, op)

    const hide1 = [getRandomInt(0, 2)]
    const hide2 = [getRandomInt(0, 2)]
    const hideRes = [getRandomInt(0, 2)]

    items.push({
      prefix,
      operation: op,
      num1: n1,
      num2: n2,
      result: res,
      num1Str: String(n1),
      num2Str: String(n2),
      resultStr: String(res),
      carries,
      missingMask: {
        num1Hidden: hide1,
        num2Hidden: hide2,
        resultHidden: hideRes,
      },
    })

    solutionItems.push(
      `${prefix} Vollständige Rechnung: ${n1} ${op} ${n2} = ${res}`
    )
  }

  return {
    id: 1,
    type: 'schriftlich_fehlende_ziffern',
    title: 'Fehlende Ziffern in schriftlichen Aufgaben',
    instruction:
      'Finde die fehlenden Ziffern in den Kästchen heraus. Kombiniere von den Einern ausgehend stellenwertgerecht.',
    items,
    solutionItems,
  }
}

export function generateUeberschlagKontrolleTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: WrittenCalcGridItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const isAdd = i % 2 === 0
    const prefix = letters[i] || `${i + 1})`
    const op = isAdd ? ('+' as const) : ('-' as const)

    let n1 = 300
    let n2 = 200

    if (isAdd) {
      n1 = getRandomInt(180, 500)
      n2 = getRandomInt(150, 450)
    } else {
      n1 = getRandomInt(550, 950)
      n2 = getRandomInt(120, n1 - 100)
    }

    const a1 = Math.round(n1 / 100) * 100
    const a2 = Math.round(n2 / 100) * 100
    const res = op === '+' ? n1 + n2 : n1 - n2
    const approxRes = op === '+' ? a1 + a2 : a1 - a2
    const carries = calculateCarries(n1, n2, op)

    items.push({
      prefix,
      operation: op,
      num1: n1,
      num2: n2,
      result: res,
      num1Str: String(n1),
      num2Str: String(n2),
      resultStr: String(res),
      carries,
      ueberschlag: {
        approx1: a1,
        approx2: a2,
        approxResult: approxRes,
      },
    })

    solutionItems.push(
      `${prefix} Überschlag: ${a1} ${op} ${a2} = ${approxRes} | Genau: ${n1} ${op} ${n2} = ${res}`
    )
  }

  return {
    id: 1,
    type: 'ueberschlag_kontrolle',
    title: 'Überschlagsrechnung & Kontrolle',
    instruction:
      'Runde zuerst beide Zahlen auf Hunderter für den Überschlag (Ü). Berechne danach das genaue Ergebnis im Kästchenraster.',
    items,
    solutionItems,
  }
}

export function generateGeldSchriftlichTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: WrittenCalcGridItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const isAdd = i % 2 === 0
    const prefix = letters[i] || `${i + 1})`
    const op = isAdd ? ('+' as const) : ('-' as const)

    let n1Cent = 2000
    let n2Cent = 1500

    if (isAdd) {
      n1Cent = getRandomInt(1500, 4500)
      n2Cent = getRandomInt(1200, 4500)
    } else {
      n1Cent = getRandomInt(5000, 9500)
      n2Cent = getRandomInt(1200, n1Cent - 1000)
    }

    const resCent = op === '+' ? n1Cent + n2Cent : n1Cent - n2Cent
    const n1Euro = (n1Cent / 100).toFixed(2).replace('.', ',')
    const n2Euro = (n2Cent / 100).toFixed(2).replace('.', ',')
    const resEuro = (resCent / 100).toFixed(2).replace('.', ',')
    const carries = calculateCarries(n1Cent, n2Cent, op)

    items.push({
      prefix,
      operation: op,
      isMoney: true,
      unit: '€',
      num1: n1Cent,
      num2: n2Cent,
      result: resCent,
      num1Str: n1Euro,
      num2Str: n2Euro,
      resultStr: resEuro,
      carries,
    })

    solutionItems.push(
      `${prefix} ${n1Euro} € ${op} ${n2Euro} € = ${resEuro} €`
    )
  }

  return {
    id: 1,
    type: 'geld_schriftlich',
    title: 'Schriftliches Rechnen mit Geldbeträgen (€ mit Komma)',
    instruction:
      'Schreibe die Geldbeträge stellengerecht untereinander (Komma unter Komma). Rechne schriftlich aus.',
    items,
    solutionItems,
  }
}

// ═════════════════════════════════════════════════════════════════
// 2. THEMA 1: ZAHLENRAUM BIS 1.000: STELLENWERTE & ZAHLENSTRAHL
// ═════════════════════════════════════════════════════════════════

export interface StellenwertHZEItemData {
  prefix: string
  num: number
  h: number
  z: number
  e: number
  zerlegung: string
  zahlwort: string
}

const ZAHLWOERTER_EINER = ['', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun']
const ZAHLWOERTER_ZEHNER = ['', 'zehn', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig']

function toZahlwort(n: number): string {
  const h = Math.floor(n / 100)
  const rem = n % 100
  const z = Math.floor(rem / 10)
  const e = rem % 10

  let hPart = h > 0 ? (h === 1 ? 'einhundert' : `${ZAHLWOERTER_EINER[h]}hundert`) : ''
  let remPart = ''

  if (rem === 0) {
    remPart = ''
  } else if (rem < 10) {
    remPart = rem === 1 ? 'eins' : ZAHLWOERTER_EINER[rem]
  } else if (rem === 11) {
    remPart = 'elf'
  } else if (rem === 12) {
    remPart = 'zwölf'
  } else if (rem === 16) {
    remPart = 'sechzehn'
  } else if (rem === 17) {
    remPart = 'siebzehn'
  } else if (e === 0) {
    remPart = ZAHLWOERTER_ZEHNER[z]
  } else {
    remPart = `${e === 1 ? 'ein' : ZAHLWOERTER_EINER[e]}und${ZAHLWOERTER_ZEHNER[z]}`
  }

  return `${hPart}${remPart}`
}

export function generateStellenwertHZETask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: StellenwertHZEItemData[] = []
  const solutionItems: string[] = []

  const uniqueNums = getRandomUniqueInts(count, 101, 999)

  for (let i = 0; i < uniqueNums.length; i++) {
    const num = uniqueNums[i]
    const h = Math.floor(num / 100)
    const z = Math.floor((num % 100) / 10)
    const e = num % 10
    const prefix = letters[i] || `${i + 1})`
    const wort = toZahlwort(num)

    items.push({
      prefix,
      num,
      h,
      z,
      e,
      zerlegung: `${h * 100} + ${z * 10} + ${e} = ${num}`,
      zahlwort: wort,
    })

    solutionItems.push(
      `${prefix} ${num} = ${h}H ${z}Z ${e}E | ${h * 100} + ${z * 10} + ${e} = ${num} | Wort: ${wort}`
    )
  }

  return {
    id: 1,
    type: 'stellenwert_hze',
    title: 'Stellenwerttafel (H | Z | E) & Zahlwörter',
    instruction:
      'Trage die Hunderter, Zehner und Einer in die Stellenwerttafel ein, zerlege die Zahl und schreibe das Zahlwort auf.',
    items,
    solutionItems,
  }
}

export interface DienesTausenderItemData {
  prefix: string
  number: number
  platten: number // Hunderterplatten
  stangen: number // Zehnerstangen
  wuerfel: number // Einerwürfel
}

export function generateDienesTausenderTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: DienesTausenderItemData[] = []
  const solutionItems: string[] = []

  const uniqueNums = getRandomUniqueInts(count, 101, 999)

  for (let i = 0; i < uniqueNums.length; i++) {
    const num = uniqueNums[i]
    const h = Math.floor(num / 100)
    const z = Math.floor((num % 100) / 10)
    const e = num % 10
    const prefix = letters[i] || `${i + 1})`

    items.push({
      prefix,
      number: num,
      platten: h,
      stangen: z,
      wuerfel: e,
    })

    solutionItems.push(
      `${prefix} ${h} Hunderterplatten + ${z} Zehnerstangen + ${e} Einerwürfel = ${num}`
    )
  }

  return {
    id: 1,
    type: 'dienes_tausender',
    title: 'Tausenderbuch & Hunderterplatten (Dienes)',
    instruction:
      'Zähle die Hunderterplatten (H), Zehnerstangen (Z) und Einerwürfel (E) ab und bilde die dreistellige Zahl.',
    items,
    solutionItems,
  }
}

export interface NachbarzahlenK3ItemData {
  prefix: string
  num: number
  nhLinks: number
  nzLinks: number
  vorgaenger: number
  nachfolger: number
  nzRechts: number
  nhRechts: number
}

export function generateNachbarzahlenKlasse3Task(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: NachbarzahlenK3ItemData[] = []
  const solutionItems: string[] = []

  const uniqueNums = getRandomUniqueInts(count, 105, 995, (n) => n % 10 !== 0)

  for (let i = 0; i < uniqueNums.length; i++) {
    const num = uniqueNums[i]
    const nhL = Math.floor(num / 100) * 100
    const nhR = nhL + 100
    const nzL = Math.floor(num / 10) * 10
    const nzR = nzL + 10
    const prefix = letters[i] || `${i + 1})`

    items.push({
      prefix,
      num,
      nhLinks: nhL,
      nzLinks: nzL,
      vorgaenger: num - 1,
      nachfolger: num + 1,
      nzRechts: nzR,
      nhRechts: nhR,
    })

    solutionItems.push(
      `${prefix} ${nhL} < ${nzL} < ${num - 1} < [${num}] < ${num + 1} < ${nzR} < ${nhR}`
    )
  }

  return {
    id: 1,
    type: 'nachbarzahlen_k3',
    title: 'Nachbarzahlen (Vorgänger, Nachbarzehner, Nachbarhunderter)',
    instruction:
      'Bestimme zu jeder Zahl die Vorgänger/Nachfolger, Nachbarzehner (NZ) und Nachbarhunderter (NH).',
    items,
    solutionItems,
  }
}

export interface ZahlenstrahlMarker {
  id: 'A' | 'B' | 'C' | 'D'
  value: number
}

export interface Zahlenstrahl1000ItemData {
  min: number
  max: number
  stepMajor: number
  stepMedium: number
  stepMinor: number
  markers: ZahlenstrahlMarker[]
}

export function generateZahlenstrahl1000Task(count = 4): GeneratedTask {
  const letters: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D']
  const v1 = getRandomInt(4, 20) * 10 // 40..200
  const v2 = getRandomInt(28, 46) * 10 // 280..460 (Mindestabstand 80)
  const v3 = getRandomInt(54, 72) * 10 // 540..720 (Mindestabstand 80)
  const v4 = getRandomInt(80, 96) * 10 // 800..960 (Mindestabstand 80)

  const vals = [v1, v2, v3, v4]
  const markers: ZahlenstrahlMarker[] = letters.map((id, i) => ({
    id,
    value: vals[i],
  }))

  const items: Zahlenstrahl1000ItemData[] = [
    {
      min: 0,
      max: 1000,
      stepMajor: 100,
      stepMedium: 50,
      stepMinor: 10,
      markers: markers.slice(0, count),
    },
  ]

  const solutionItems = markers
    .slice(0, count)
    .map((m) => `${m.id} = ${m.value}`)

  return {
    id: 1,
    type: 'zahlenstrahl_1000',
    title: 'Zahlenstrahl bis 1.000',
    instruction:
      'Lies am Zahlenstrahl die Werte an den Schildern A, B, C und D genau ab.',
    items,
    solutionItems,
  }
}

export function generateRundenKlasse3Task(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: string[] = []
  const solutionItems: string[] = []

  const uniqueNums = getRandomUniqueInts(count, 105, 995, (n) => n % 10 !== 0)

  for (let i = 0; i < uniqueNums.length; i++) {
    const num = uniqueNums[i]
    const zRound = Math.round(num / 10) * 10
    const hRound = Math.round(num / 100) * 100
    const prefix = letters[i] || `${i + 1})`

    items.push(
      `${prefix} ${num} ≈ [___] (auf Zehner)  |  ${num} ≈ [___] (auf Hunderter)`
    )
    solutionItems.push(
      `${prefix} ${num} ≈ ${zRound} (auf Zehner) | ${num} ≈ ${hRound} (auf Hunderter)`
    )
  }

  return {
    id: 1,
    type: 'runden_k3',
    title: 'Runden auf Zehner und Hunderter',
    instruction:
      'Runde die Zahlen auf den nächsten Nachbarzehner (Z) und Nachbarhunderter (H). Achte auf die Rundungsregeln (ab 5 aufrunden).',
    items,
    solutionItems,
  }
}

export function generateGroesserKleinerOrdnenK3Task(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: string[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const prefix = letters[i] || `${i + 1})`
    if (i % 2 === 0) {
      // < > =
      const a = Math.floor(Math.random() * 700) + 200
      const diff = (Math.floor(Math.random() * 3) - 1) * (Math.floor(Math.random() * 20) + 1)
      const b = diff === 0 ? a : a + diff
      const op = a < b ? '<' : a > b ? '>' : '='
      items.push(`${prefix} ${a} [___] ${b}`)
      solutionItems.push(`${prefix} ${a} ${op} ${b}`)
    } else {
      // 5 Zahlen ordnen
      const nums = [
        Math.floor(Math.random() * 200) + 100,
        Math.floor(Math.random() * 200) + 300,
        Math.floor(Math.random() * 200) + 500,
        Math.floor(Math.random() * 200) + 700,
        Math.floor(Math.random() * 90) + 900,
      ].sort(() => Math.random() - 0.5)

      const sorted = [...nums].sort((x, y) => x - y)
      items.push(`${prefix} Ordne der Größe nach (<): ${nums.join(', ')}`)
      solutionItems.push(`${prefix} ${sorted.join(' < ')}`)
    }
  }

  return {
    id: 1,
    type: 'groesser_kleiner_ordnen_k3',
    title: 'Größer/Kleiner/Gleich & Zahlen ordnen',
    instruction:
      'Setze das richtige Zeichen (<, >, =) ein bzw. ordne die Zahlen der Größe nach mit dem Kleiner-Zeichen (<).',
    items,
    solutionItems,
  }
}

// ═════════════════════════════════════════════════════════════════
// 3. THEMA 2: HALBSCHRIFTLICHES RECHNEN & KOPFRECHNEN (ZR 1.000)
// ═════════════════════════════════════════════════════════════════

export interface HalbschriftlichK3ItemData {
  prefix: string
  op: '+' | '-'
  n1: number
  n2: number
  h2: number
  z2: number
  e2: number
  step1: { term: string; res: number }
  step2: { term: string; res: number }
  step3: { term: string; res: number }
  result: number
}

export function generateHalbschriftlichK3Task(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: HalbschriftlichK3ItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const isAdd = i % 2 === 0
    const op = isAdd ? ('+' as const) : ('-' as const)
    const prefix = letters[i] || `${i + 1})`

    let n1 = 300
    let n2 = 200

    if (isAdd) {
      n1 = getRandomInt(180, 480)
      n2 = getRandomInt(150, 450)
    } else {
      n1 = getRandomInt(550, 950)
      n2 = getRandomInt(120, n1 - 100) // n1 > n2 immer garantiert!
    }

    const h2 = Math.floor(n2 / 100) * 100
    const z2 = Math.floor((n2 % 100) / 10) * 10
    const e2 = n2 % 10

    let r1: number, r2: number, r3: number
    if (op === '+') {
      r1 = n1 + h2
      r2 = r1 + z2
      r3 = r2 + e2
    } else {
      r1 = n1 - h2
      r2 = r1 - z2
      r3 = r2 - e2
    }

    items.push({
      prefix,
      op,
      n1,
      n2,
      h2,
      z2,
      e2,
      step1: { term: `${n1} ${op} ${h2}`, res: r1 },
      step2: { term: `${r1} ${op} ${z2}`, res: r2 },
      step3: { term: `${r2} ${op} ${e2}`, res: r3 },
      result: r3,
    })

    solutionItems.push(
      `${prefix} ${n1} ${op} ${n2} = ${r3} [Schritte: ${n1} ${op} ${h2} = ${r1} | ${r1} ${op} ${z2} = ${r2} | ${r2} ${op} ${e2} = ${r3}]`
    )
  }

  return {
    id: 1,
    type: 'halbschriftlich_k3',
    title: 'Halbschriftliche Addition & Subtraktion (ZR 1.000)',
    instruction:
      'Rechne in 3 Schritten unter dem Strich (erst Hunderter, dann Zehner, dann Einer).',
    items,
    solutionItems,
  }
}

export function generateKopfrechnenK3Task(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: string[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const prefix = letters[i] || `${i + 1})`
    if (i % 2 === 0) {
      // Hunderter / Zehner Addition
      const a = (Math.floor(Math.random() * 40) + 10) * 10 // 100..490
      const b = (Math.floor(Math.random() * 30) + 10) * 10
      items.push(`${prefix} ${a} + ${b} = ___`)
      solutionItems.push(`${prefix} ${a} + ${b} = ${a + b}`)
    } else {
      // Subtraktion
      const a = (Math.floor(Math.random() * 40) + 50) * 10 // 500..890
      const b = (Math.floor(Math.random() * 30) + 10) * 10
      items.push(`${prefix} ${a} - ${b} = ___`)
      solutionItems.push(`${prefix} ${a} - ${b} = ${a - b}`)
    }
  }

  return {
    id: 1,
    type: 'kopfrechnen_k3',
    title: 'Kopfrechnen mit Hundertern & Zehnern',
    instruction:
      'Rechne die Aufgaben zügig im Kopf aus und trage das Ergebnis ein.',
    items,
    solutionItems,
  }
}

export function generateZahlenmauernK3Task(count = 4): GeneratedTask {
  const gen = generateZahlenmauern(Math.min(count, 4), 1000, 3)
  return {
    id: 1,
    type: 'zahlenmauern_k3',
    title: 'Zahlenmauern & Rechendreiecke (ZR 1.000)',
    instruction:
      'Rechne die Zahlenmauern von unten nach oben aus. Zwei nebeneinander liegende Steine ergeben zusammen den Stein darüber.',
    items: gen.items,
    solutionItems: gen.solutionItems,
  }
}

// ═════════════════════════════════════════════════════════════════
// 4. THEMA 4: ZEHNER-EINMALEINS & MULTIPLIKATION / DIVISION
// ═════════════════════════════════════════════════════════════════

export function generateZehnerEinmaleinsTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: string[] = []
  const solutionItems: string[] = []
  const used = new Set<string>()

  for (let i = 0; i < count; i++) {
    const prefix = letters[i] || `${i + 1})`
    const isMult = i % 2 === 0

    if (isMult) {
      let a = 4
      let bTen = 60
      let attempts = 0
      while (attempts < 100) {
        attempts++
        a = getRandomInt(2, 9)
        const b = getRandomInt(2, 9)
        bTen = b * 10
        const key = `m:${a}x${bTen}`
        if (!used.has(key)) {
          used.add(key)
          break
        }
      }
      const res = a * bTen
      items.push(`${prefix} ${a} · ${bTen} = ___`)
      solutionItems.push(`${prefix} ${a} · ${bTen} = ${res}`)
    } else {
      let b = 6
      let qTen = 40
      let attempts = 0
      while (attempts < 100) {
        attempts++
        b = getRandomInt(2, 9)
        const q = getRandomInt(2, 9)
        qTen = q * 10
        const key = `d:${b * qTen}:${b}`
        if (!used.has(key)) {
          used.add(key)
          break
        }
      }
      const dividend = b * qTen
      items.push(`${prefix} ${dividend} : ${b} = ___`)
      solutionItems.push(`${prefix} ${dividend} : ${b} = ${qTen}`)
    }
  }

  return {
    id: 1,
    type: 'zehner_einmaleins',
    title: 'Zehner-Einmaleins (z.B. 4 · 60, 240 : 6)',
    instruction:
      'Nutze deine Kenntnisse aus dem kleinen 1x1 für das Rechnen mit Zehnerzahlen.',
    items,
    solutionItems,
  }
}

export interface HalbschriftlichMultItemData {
  prefix: string
  factor1: number
  factor2: number
  z2: number
  e2: number
  step1: { term: string; res: number }
  step2: { term: string; res: number }
  result: number
}

export function generateHalbschriftlichMultiplikationTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: HalbschriftlichMultItemData[] = []
  const solutionItems: string[] = []
  const used = new Set<string>()

  for (let i = 0; i < count; i++) {
    let f1 = 4
    let f2 = 36
    let attempts = 0
    while (attempts < 100) {
      attempts++
      f1 = getRandomInt(3, 8)
      f2 = getRandomInt(14, 69)
      const key = `${f1}x${f2}`
      if (!used.has(key)) {
        used.add(key)
        break
      }
    }

    const z = Math.floor(f2 / 10) * 10
    const e = f2 % 10
    const r1 = f1 * z
    const r2 = f1 * e
    const prod = r1 + r2
    const prefix = letters[i] || `${i + 1})`

    items.push({
      prefix,
      factor1: f1,
      factor2: f2,
      z2: z,
      e2: e,
      step1: { term: `${f1} · ${z}`, res: r1 },
      step2: { term: `${f1} · ${e}`, res: r2 },
      result: prod,
    })

    solutionItems.push(
      `${prefix} ${f1} · ${f2} = ${prod} (${f1} · ${z} = ${r1} | ${f1} · ${e} = ${r2} | ${r1} + ${r2} = ${prod})`
    )
  }

  return {
    id: 1,
    type: 'halbschriftlich_multiplikation',
    title: 'Halbschriftliche Multiplikation (in Schritten)',
    instruction:
      'Zerlege den zweistelligen Faktor in Zehner und Einer. Multipliziere einzeln und zähle die Teilergebnisse zusammen.',
    items,
    solutionItems,
  }
}

export function generateHalbschriftlichDivisionTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: string[] = []
  const solutionItems: string[] = []
  const used = new Set<string>()

  for (let i = 0; i < count; i++) {
    const isRest = i >= 2
    const prefix = letters[i] || `${i + 1})`

    if (!isRest) {
      // Glatte Division mit Zerlegung: z.B. divisor = 3, 4, 5, 6
      let divisor = 4
      let zPart = 80
      let ePart = 16
      let attempts = 0
      while (attempts < 100) {
        attempts++
        divisor = getRandomInt(3, 7)
        const qZ = getRandomInt(1, 3) * 10
        const qE = getRandomInt(1, 9)
        zPart = qZ * divisor
        ePart = qE * divisor
        const dividend = zPart + ePart
        const key = `${dividend}:${divisor}`
        if (!used.has(key)) {
          used.add(key)
          break
        }
      }
      const dividend = zPart + ePart
      const res = (zPart + ePart) / divisor

      items.push(
        `${prefix} ${dividend} : ${divisor} = ___  (Zerlege: ${zPart} : ${divisor} = ___ und ${ePart} : ${divisor} = ___)`
      )
      solutionItems.push(
        `${prefix} ${dividend} : ${divisor} = ${res} (${zPart} : ${divisor} = ${zPart / divisor} und ${ePart} : ${divisor} = ${ePart / divisor})`
      )
    } else {
      // Division mit Rest
      let divisor = 5
      let q = 8
      let r = 3
      let attempts = 0
      while (attempts < 100) {
        attempts++
        divisor = getRandomInt(3, 9)
        q = getRandomInt(4, 9)
        r = getRandomInt(1, divisor - 1)
        const key = `rest:${divisor * q + r}:${divisor}`
        if (!used.has(key)) {
          used.add(key)
          break
        }
      }
      const dividend = divisor * q + r

      items.push(
        `${prefix} ${dividend} : ${divisor} = ___ Rest ___ (denn ___ · ${divisor} + ___ = ${dividend})`
      )
      solutionItems.push(
        `${prefix} ${dividend} : ${divisor} = ${q} Rest ${r} (denn ${q} · ${divisor} + ${r} = ${dividend})`
      )
    }
  }

  return {
    id: 1,
    type: 'halbschriftlich_division',
    title: 'Halbschriftliche Division (mit und ohne Rest)',
    instruction:
      'Zerlege den Dividenden in passende Vielfache oder bestimme das Ergebnis mit Rest.',
    items,
    solutionItems,
  }
}

// ═════════════════════════════════════════════════════════════════
// 5. THEMA 5: GEOMETRIE: KÖRPERNETZE, WÜRFELGEBÄUDE & SYMMETRIE
// ═════════════════════════════════════════════════════════════════

export interface WuerfelnetzItemData {
  prefix: string
  name: string
  // 6 Quadrate als (col, row) Koordinaten auf einem 5x4 Raster
  squares: Array<{ c: number; r: number }>
  isValid: boolean
}

export function generateWuerfelnetzeTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)']
  // 2 echte Würfelnetze (T-Form, Kreuz), 2 falsche Netze (6 in einer Reihe oder 4er-Block)
  const netzTemplates = [
    {
      name: 'Netz 1 (Kreuz-Form)',
      isValid: true,
      squares: [
        { c: 2, r: 0 },
        { c: 0, r: 1 }, { c: 1, r: 1 }, { c: 2, r: 1 }, { c: 3, r: 1 },
        { c: 2, r: 2 },
      ],
    },
    {
      name: 'Netz 2 (Treppen-Form)',
      isValid: true,
      squares: [
        { c: 0, r: 0 }, { c: 1, r: 0 },
        { c: 1, r: 1 }, { c: 2, r: 1 },
        { c: 2, r: 2 }, { c: 3, r: 2 },
      ],
    },
    {
      name: 'Netz 3 (Block-Fehler)',
      isValid: false,
      squares: [
        { c: 0, r: 0 }, { c: 1, r: 0 },
        { c: 0, r: 1 }, { c: 1, r: 1 },
        { c: 2, r: 1 }, { c: 3, r: 1 },
      ],
    },
    {
      name: 'Netz 4 (Reihen-Fehler)',
      isValid: false,
      squares: [
        { c: 0, r: 0 }, { c: 1, r: 0 }, { c: 2, r: 0 }, { c: 3, r: 0 }, { c: 4, r: 0 },
        { c: 2, r: 1 },
      ],
    },
  ]

  const items: WuerfelnetzItemData[] = netzTemplates.slice(0, count).map((t, idx) => ({
    prefix: letters[idx],
    name: t.name,
    squares: t.squares,
    isValid: t.isValid,
  }))

  const solutionItems = items.map(
    (it) => `${it.prefix} ${it.name}: ${it.isValid ? 'JA (echtes Würfelnetz)' : 'NEIN (kein Würfelnetz)'}`
  )

  return {
    id: 1,
    type: 'wuerfelnetze',
    title: 'Würfelnetze & Quadernetze erkennen',
    instruction:
      'Prüfe die abgebildeten Flächennetze aus 6 Quadraten. Entsteht beim Falten ein echter geschlossener Würfel? Kreuze an: [ Ja ] / [ Nein ].',
    items,
    solutionItems,
  }
}

export interface WuerfelgebaeudeItemData {
  prefix: string
  totalCubes: number
  // 3x3 Grundriss Matrix
  grid3x3: number[][]
}

export function generateWuerfelgebaeudeTask(count = 2): GeneratedTask {
  const letters = ['a)', 'b)']
  const items: WuerfelgebaeudeItemData[] = [
    {
      prefix: letters[0],
      totalCubes: 7,
      grid3x3: [
        [2, 1, 0],
        [1, 2, 0],
        [0, 1, 0],
      ],
    },
    {
      prefix: letters[1] || 'b)',
      totalCubes: 9,
      grid3x3: [
        [3, 1, 0],
        [2, 2, 0],
        [0, 1, 0],
      ],
    },
  ]

  const solutionItems = items.map(
    (it) => `${it.prefix} Gesamtanzahl: ${it.totalCubes} Würfel | Bauplan: ${it.grid3x3.map((r) => r.join('-')).join(' / ')}`
  )

  return {
    id: 1,
    type: 'wuerfelgebaeude_bauplan',
    title: 'Würfelgebäude & Baupläne (Wie viele Würfel?)',
    instruction:
      'Betrachte das 3D-Würfelgebäude. Zähle alle Würfel und trage im Bauplan (3x3 Raster) für jedes Feld die Stockwerkshöhe ein.',
    items: items.slice(0, count),
    solutionItems: solutionItems.slice(0, count),
  }
}

export function generateAchsensymmetrieK3Task(count = 2): GeneratedTask {
  // Verwendet die bestehende bewährte Achsensymmetrie-Komponente am 8x8 Gitternetz
  return {
    id: 1,
    type: 'achsensymmetrie',
    title: 'Achsensymmetrie (am Gitternetz)',
    instruction:
      'Spiegle die gezeichnete Figur an der roten Spiegelachse und vervollständige das symmetrische Bild.',
    items: [
      {
        prefix: 'a)',
        axisCol: 4,
        points: [
          { x: 1, y: 1 },
          { x: 3, y: 1 },
          { x: 3, y: 5 },
          { x: 1, y: 4 },
        ],
      },
      {
        prefix: 'b)',
        axisCol: 4,
        points: [
          { x: 2, y: 2 },
          { x: 3, y: 1 },
          { x: 3, y: 6 },
          { x: 1, y: 6 },
        ],
      },
    ].slice(0, count),
    solutionItems: ['a) Gespiegelt an Achse Spalte 4', 'b) Gespiegelt an Achse Spalte 4'],
  }
}

export interface RechtWinkelItemData {
  prefix: string
  type: 'parallel' | 'senkrecht' | 'schief'
  label: string
}

export function generateRechteWinkelParallelenTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)']
  const items: RechtWinkelItemData[] = [
    { prefix: letters[0], type: 'parallel' as const, label: 'Linienpaar 1' },
    { prefix: letters[1], type: 'senkrecht' as const, label: 'Linienpaar 2' },
    { prefix: letters[2], type: 'parallel' as const, label: 'Linienpaar 3' },
    { prefix: letters[3], type: 'senkrecht' as const, label: 'Linienpaar 4' },
  ].slice(0, count)

  const solutionItems = items.map((it) =>
    it.type === 'parallel'
      ? `${it.prefix} parallel (||)`
      : it.type === 'senkrecht'
      ? `${it.prefix} senkrecht aufeinander / rechter Winkel (⊥)`
      : `${it.prefix} weder noch`
  )

  return {
    id: 1,
    type: 'rechte_winkel_parallelen',
    title: 'Rechte Winkel & Parallele Linien',
    instruction:
      'Untersuche die Linienpaare mit dem Geodreieck. Sind sie parallel zueinander (||) oder stehen sie senkrecht aufeinander (⊥, rechter Winkel)?',
    items,
    solutionItems,
  }
}

// ═════════════════════════════════════════════════════════════════
// 6. THEMA 6: GRÖSSEN: LÄNGEN (MM, CM, M, KM)
// ═════════════════════════════════════════════════════════════════

export function generateLaengenUmrechnenK3Task(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: string[] = []
  const solutionItems: string[] = []

  const templates = [
    { q: '3 cm 5 mm = ___ mm', sol: '35 mm' },
    { q: '72 mm = ___ cm ___ mm', sol: '7 cm 2 mm' },
    { q: '4 m 60 cm = ___ cm', sol: '460 cm' },
    { q: '650 m + [___] m = 1 km', sol: '350 m' },
    { q: '1 km 250 m = ___ m', sol: '1.250 m' },
    { q: '800 m + [___] m = 1 km', sol: '200 m' },
  ]

  for (let i = 0; i < Math.min(count, templates.length); i++) {
    const t = templates[i]
    const prefix = letters[i] || `${i + 1})`
    items.push(`${prefix} ${t.q}`)
    solutionItems.push(`${prefix} ${t.sol}`)
  }

  return {
    id: 1,
    type: 'laengen_umrechnen_k3',
    title: 'Einheiten umrechnen (mm, cm, m, km)',
    instruction:
      'Wandle in die gesuchte Längeneinheit um bzw. ergänze bis zu einem vollen Kilometer (1 km = 1.000 m).',
    items,
    solutionItems,
  }
}

export function generateLaengenKommaK3Task(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)']
  const items: string[] = []
  const solutionItems: string[] = []

  const data = [
    { text: '3 m 45 cm', komma: '3,45 m', cm: '345 cm' },
    { text: '1 m 80 cm', komma: '1,80 m', cm: '180 cm' },
    { text: '5 m 6 cm', komma: '5,06 m', cm: '506 cm' },
    { text: '2 m 15 cm', komma: '2,15 m', cm: '215 cm' },
  ]

  for (let i = 0; i < Math.min(count, data.length); i++) {
    const d = data[i]
    const prefix = letters[i] || `${i + 1})`
    items.push(`${prefix} ${d.text} = [___] m = [___] cm`)
    solutionItems.push(`${prefix} ${d.text} = ${d.komma} = ${d.cm}`)
  }

  return {
    id: 1,
    type: 'laengen_komma_k3',
    title: 'Kommaschreibweise bei Längen (z.B. 1,45 m)',
    instruction:
      'Schreibe die Längen in Kommaschreibweise mit Meter (m) und als reine Zentimeter (cm).',
    items,
    solutionItems,
  }
}

export function generateRechnenLaengenK3Task(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: string[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const prefix = letters[i] || `${i + 1})`
    const mode = i % 5

    if (mode === 0) {
      // m + m im ZR bis 1.000 m
      const a = getRandomInt(20, 50) * 10
      const maxB = 1000 - a
      const b = getRandomInt(15, Math.floor(maxB / 10)) * 10
      const sum = a + b
      items.push(`${prefix} ${a} m + ${b} m = ___ m`)
      solutionItems.push(`${prefix} ${a} m + ${b} m = ${sum} m`)
    } else if (mode === 1) {
      // 1 km - x m (immer strikt positiv)
      const x = getRandomInt(15, 85) * 10
      const diff = 1000 - x
      items.push(`${prefix} 1 km - ${x} m = ___ m`)
      solutionItems.push(`${prefix} 1 km - ${x} m = ${diff} m`)
    } else if (mode === 2) {
      // m cm + m cm
      const m1 = getRandomInt(1, 4)
      const cm1 = getRandomInt(10, 60)
      const m2 = getRandomInt(1, 4)
      const cm2 = getRandomInt(15, 75)
      const totalCm = (m1 + m2) * 100 + cm1 + cm2
      const resM = Math.floor(totalCm / 100)
      const resCm = totalCm % 100
      items.push(`${prefix} ${m1} m ${cm1} cm + ${m2} m ${cm2} cm = ___ m ___ cm`)
      solutionItems.push(`${prefix} ${m1} m ${cm1} cm + ${m2} m ${cm2} cm = ${resM} m ${resCm} cm`)
    } else if (mode === 3) {
      // m - m cm (strikt a >= b)
      const m1 = getRandomInt(4, 8)
      const m2 = getRandomInt(1, m1 - 2)
      const cm2 = getRandomInt(10, 90)
      const totalCm1 = m1 * 100
      const totalCm2 = m2 * 100 + cm2
      const diffCm = totalCm1 - totalCm2
      const resM = Math.floor(diffCm / 100)
      const resCm = diffCm % 100
      items.push(`${prefix} ${m1} m - ${m2} m ${cm2} cm = ___ m ___ cm`)
      solutionItems.push(`${prefix} ${m1} m - ${m2} m ${cm2} cm = ${resM} m ${resCm} cm`)
    } else {
      // m - m im ZR 1.000 m (strikt a > b)
      const a = getRandomInt(50, 95) * 10
      const b = getRandomInt(15, Math.floor(a / 10) - 10) * 10
      const diff = a - b
      items.push(`${prefix} ${a} m - ${b} m = ___ m`)
      solutionItems.push(`${prefix} ${a} m - ${b} m = ${diff} m`)
    }
  }

  return {
    id: 1,
    type: 'rechnen_laengen',
    title: 'Rechnen mit Längen',
    instruction:
      'Rechne die Längenaufgaben aus. Achte auf gleiche Einheiten.',
    items,
    solutionItems,
  }
}

// ═════════════════════════════════════════════════════════════════
// 7. THEMA 7: GEWICHTE (G, KG, T) & HOHLMASSE (ML, L)
// ═════════════════════════════════════════════════════════════════

export function generateGewichteUmrechnenK3Task(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: string[] = []
  const solutionItems: string[] = []

  const templates = [
    { q: '1 kg = [___] g', sol: '1.000 g' },
    { q: '1/2 kg = [___] g', sol: '500 g' },
    { q: '1/4 kg = [___] g', sol: '250 g' },
    { q: '750 g + [___] g = 1 kg', sol: '250 g' },
    { q: '3 t = [___] kg', sol: '3.000 kg' },
    { q: '400 g + [___] g = 1 kg', sol: '600 g' },
  ]

  for (let i = 0; i < Math.min(count, templates.length); i++) {
    const t = templates[i]
    const prefix = letters[i] || `${i + 1})`
    items.push(`${prefix} ${t.q}`)
    solutionItems.push(`${prefix} ${t.sol}`)
  }

  return {
    id: 1,
    type: 'gewichte_umrechnen_k3',
    title: 'Gewichte umrechnen & bis 1 kg ergänzen (g, kg, t)',
    instruction:
      'Rechne mit den Einheiten Gramm (g), Kilogramm (kg) und Tonne (t). Ergänze auf 1 kg (1.000 g).',
    items,
    solutionItems,
  }
}

export interface WaageItemData {
  prefix: string
  weights: number[] // z. B. [500, 200, 100]
  totalGrams: number
  ergaenzung1kg: number
}

export function generateWaagenAblesenTask(count = 2): GeneratedTask {
  const letters = ['a)', 'b)']
  const items: WaageItemData[] = [
    { prefix: letters[0], weights: [500, 200, 50], totalGrams: 750, ergaenzung1kg: 250 },
    { prefix: letters[1], weights: [500, 100, 100, 100], totalGrams: 800, ergaenzung1kg: 200 },
  ].slice(0, count)

  const solutionItems = items.map(
    (it) => `${it.prefix} Waage zeigt: ${it.totalGrams} g | Es fehlen bis 1 kg: ${it.ergaenzung1kg} g`
  )

  return {
    id: 1,
    type: 'waagen_ablesen',
    title: 'Waagen ablesen & Gewichte vergleichen',
    instruction:
      'Lies die Gewichtsstücke auf der Waage ab. Berechne das Gesamtgewicht in Gramm und wie viel bis 1 kg (1.000 g) fehlt.',
    items,
    solutionItems,
  }
}

export interface MessbecherItemData {
  prefix: string
  fillMl: number // z. B. 600
  totalCapacityMl: number // 1000
  diffTo1Liter: number
}

export function generateMessbecherAblesenTask(count = 2): GeneratedTask {
  const letters = ['a)', 'b)']
  const items: MessbecherItemData[] = [
    { prefix: letters[0], fillMl: 600, totalCapacityMl: 1000, diffTo1Liter: 400 },
    { prefix: letters[1], fillMl: 750, totalCapacityMl: 1000, diffTo1Liter: 250 },
  ].slice(0, count)

  const solutionItems = items.map(
    (it) => `${it.prefix} Füllstand: ${it.fillMl} ml | Es fehlen bis 1 Liter: ${it.diffTo1Liter} ml`
  )

  return {
    id: 1,
    type: 'messbecher_ablesen',
    title: 'Hohlmaße umrechnen & Messbecher ablesen (ml, l)',
    instruction:
      'Lies den Füllstand am Messbecher in Milliliter (ml) ab. Berechne, wie viel Flüssigkeit bis zu 1 Liter (1.000 ml) fehlt.',
    items,
    solutionItems,
  }
}

// ═════════════════════════════════════════════════════════════════
// 8. THEMA 8: ZEITSPANNEN & ZEITPUNKT
// ═════════════════════════════════════════════════════════════════

export interface FahrplanItemData {
  prefix: string
  abfahrt: string
  dauerMin: number
  ankunft: string
}

export function generateZeitpunktZeitdauerTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)']
  const items: FahrplanItemData[] = [
    { prefix: letters[0], abfahrt: '14:20 Uhr', dauerMin: 45, ankunft: '15:05 Uhr' },
    { prefix: letters[1], abfahrt: '08:45 Uhr', dauerMin: 35, ankunft: '09:20 Uhr' },
    { prefix: letters[2], abfahrt: '11:15 Uhr', dauerMin: 50, ankunft: '12:05 Uhr' },
    { prefix: letters[3], abfahrt: '16:30 Uhr', dauerMin: 40, ankunft: '17:10 Uhr' },
  ].slice(0, count)

  const solutionItems = items.map(
    (it) => `${it.prefix} Abfahrt: ${it.abfahrt} | Fahrtdauer: ${it.dauerMin} min -> Ankunft: ${it.ankunft}`
  )

  return {
    id: 1,
    type: 'zeitpunkt_zeitdauer',
    title: 'Zeitpunkt & Zeitdauer berechnen',
    instruction:
      'Berechne die Ankunftszeit anhand der Abfahrtszeit und der Fahrtdauer in Minuten.',
    items,
    solutionItems,
  }
}

export function generateZeiteinheitenK3Task(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: string[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const prefix = letters[i] || `${i + 1})`
    const mode = i % 5

    if (mode === 0) {
      // min -> s
      const m = getRandomInt(2, 5)
      items.push(`${prefix} ${m} min = [___] s`)
      solutionItems.push(`${prefix} ${m} min = ${m * 60} s`)
    } else if (mode === 1) {
      // h -> min
      const h = getRandomInt(2, 4)
      items.push(`${prefix} ${h} h = [___] min`)
      solutionItems.push(`${prefix} ${h} h = ${h * 60} min`)
    } else if (mode === 2) {
      // h min -> min
      const h = getRandomInt(1, 2)
      const m = getRandomInt(2, 9) * 5 // 10, 15, ..., 45
      const totalMin = h * 60 + m
      items.push(`${prefix} ${h} h ${m} min = [___] min`)
      solutionItems.push(`${prefix} ${h} h ${m} min = ${totalMin} min`)
    } else if (mode === 3) {
      // Tage -> h
      const days = getRandomInt(2, 3)
      items.push(`${prefix} ${days} Tage = [___] h`)
      solutionItems.push(`${prefix} ${days} Tage = ${days * 24} h`)
    } else {
      // min s -> s
      const m = 1
      const s = getRandomInt(2, 9) * 5 // 10..45
      const totalS = m * 60 + s
      items.push(`${prefix} ${m} min ${s} s = [___] s`)
      solutionItems.push(`${prefix} ${m} min ${s} s = ${totalS} s`)
    }
  }

  return {
    id: 1,
    type: 'zeiteinheiten_k3',
    title: 'Zeiteinheiten umrechnen (s, min, h)',
    instruction:
      'Rechne die Zeiteinheiten um (Sekunde, Minute, Stunde, Tag).',
    items,
    solutionItems,
  }
}

// ═════════════════════════════════════════════════════════════════
// 9. THEMA 9: DATEN & ZUFALL
// ═════════════════════════════════════════════════════════════════

export function generateBalkendiagrammK3Task(): GeneratedTask {
  const data = [
    { label: 'Fahrrad', count: 420 },
    { label: 'Zu Fuß', count: 350 },
    { label: 'Bus', count: 680 },
    { label: 'Auto', count: 210 },
  ]

  return {
    id: 1,
    type: 'balkendiagramm_k3',
    title: 'Balken- & Säulendiagramme auswerten',
    instruction:
      'Lies die Häufigkeiten am Säulendiagramm (Schulweg von 1.000 Kindern) ab und beantworte die Fragen.',
    items: [
      {
        data,
        questions: [
          'Wie viele Kinder fahren mit dem Bus? [ 680 ]',
          'Welches Verkehrsmittel wird am seltensten genutzt? [ Auto (210) ]',
          'Wie viele Kinder kommen umweltfreundlich zu Fuß oder mit dem Rad? [ 770 ]',
        ],
      },
    ],
    solutionItems: [
      'Bus: 680 Kinder',
      'Seltenstes Verkehrsmittel: Auto mit 210 Kindern',
      'Zu Fuß + Rad: 350 + 420 = 770 Kinder',
    ],
  }
}

export interface WahrscheinlichkeitItemData {
  prefix: string
  redBalls: number
  blueBalls: number
  yellowBalls: number
  statements: Array<{ text: string; answer: 'sicher' | 'möglich' | 'unmöglich' }>
}

export function generateWahrscheinlichkeitK3Task(count = 2): GeneratedTask {
  const letters = ['a)', 'b)']
  const items: WahrscheinlichkeitItemData[] = [
    {
      prefix: letters[0],
      redBalls: 6,
      blueBalls: 3,
      yellowBalls: 0,
      statements: [
        { text: 'Eine rote Kugel zu ziehen, ist...', answer: 'möglich' as const },
        { text: 'Eine gelbe Kugel zu ziehen, ist...', answer: 'unmöglich' as const },
        { text: 'Eine Kugel zu ziehen, die rot oder blau ist, ist...', answer: 'sicher' as const },
      ],
    },
    {
      prefix: letters[1] || 'b)',
      redBalls: 5,
      blueBalls: 5,
      yellowBalls: 2,
      statements: [
        { text: 'Eine grüne Kugel zu ziehen, ist...', answer: 'unmöglich' as const },
        { text: 'Eine blaue Kugel zu ziehen, ist...', answer: 'möglich' as const },
      ],
    },
  ].slice(0, count)

  const solutionItems = items.map(
    (it) => `${it.prefix} ${it.statements.map((s) => `${s.text} -> ${s.answer.toUpperCase()}`).join(' | ')}`
  )

  return {
    id: 1,
    type: 'wahrscheinlichkeit_k3',
    title: 'Wahrscheinlichkeit (sicher, möglich, unmöglich)',
    instruction:
      'In einer Urne liegen die abgebildeten Kugeln. Beurteile die Aussagen beim blinden Ziehen einer Kugel: Ist das Ereignis sicher, möglich oder unmöglich?',
    items,
    solutionItems,
  }
}

export function generateKombinatorikBaumdiagrammTask(count = 2): GeneratedTask {
  const letters = ['a)', 'b)']
  const items = [
    {
      prefix: letters[0],
      text: 'Mia hat 3 verschiedene T-Shirts (rot, blau, grün) und 2 verschiedene Hosen (kurz, lang). Wie viele verschiedene Outfits kann sie kombinieren?',
      sol: '3 · 2 = 6 verschiedene Outfits',
    },
    {
      prefix: letters[1] || 'b)',
      text: 'In der Eisdiele gibt es 4 Eissorten (Schoko, Vanille, Erdbeere, Zitrone) und 2 Becherarten (Waffel oder Becher). Wie viele Kombinationen aus 1 Kugel Eis gibt es?',
      sol: '4 · 2 = 8 verschiedene Kombinationen',
    },
  ].slice(0, count)

  const solutionItems = items.map((it) => `${it.prefix} ${it.sol}`)

  return {
    id: 1,
    type: 'kombinatorik_baumdiagramm',
    title: 'Kombinatorik (Baumdiagramm / Möglichkeiten)',
    instruction:
      'Ermittle die Anzahl aller Kombinationsmöglichkeiten durch eine Multiplikationsaufgabe oder ein Baumdiagramm.',
    items,
    solutionItems,
  }
}

export function generateSachaufgabenK3Task(count = 2): GeneratedTask {
  return generateRechengeschichtenTask({
    count,
    maxNumber: 1000,
    thema: 'Zahlenraum bis 1.000',
  })
}
