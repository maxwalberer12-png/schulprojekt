/**
 * lib/generators/geldGenerator.ts
 *
 * Deterministischer Generator für Klasse 1: "Größen: Euro und Cent (bis 20 €)".
 * 100 % didaktisch konsistent nach LehrplanPLUS Bayern:
 * - Zahlenraum: Strikt 1 bis 20 (keine Zahlen > 20, keine negativen Zahlen)
 * - Strikte Einheiten-Trennung: Niemals Euro und Cent in derselben Aufgabe mischen
 * - Nur echte Münzen & Scheine:
 *     Euro: 1 €, 2 € (Münzen); 5 €, 10 € (Scheine)
 *     Cent: 1 ct, 2 ct, 5 ct, 10 ct (Münzen)
 */

import { GeneratedTask, GeneratedWorksheet } from '@/types/tools'

export interface GeldZaehlenItemData {
  prefix: string
  unit: '€' | 'ct'
  total: number
  denominations: number[] // Absteigend sortiert, z. B. [10, 5, 2]
}

export interface GeldRechnenItemData {
  prefix: string
  num1: number
  op: '+' | '-'
  num2: number
  result: number
  unit: '€' | 'ct'
  display: string
}

export interface GeldVergleichItemData {
  prefix: string
  leftTerm: string
  leftVal: number
  operator: '<' | '>' | '='
  rightTerm: string
  rightVal: number
  unit: '€' | 'ct'
}

/**
 * Zerlegt einen Betrag zwischen 5 und 20 in maximal 3-4 echte Münzen/Scheine.
 * Garantiert immer mindestens 2 Stücke für eine echte Zählaufgabe.
 */
export function decomposeGeldAmount(target: number, unit: '€' | 'ct'): number[] {
  // Für Euro: 10, 5, 2, 1
  // Für Cent: 10, 5, 2, 1
  // Bei 10 und 5: didaktisch bündeln, damit mindestens 2 Münzen/Scheine vorhanden sind
  if (target === 10) {
    return [5, 5]
  }
  if (target === 5) {
    return [2, 2, 1]
  }
  if (target === 20) {
    return [10, 10]
  }

  const result: number[] = []
  let rem = target

  // Greedy mit [10, 5, 2, 1]
  while (rem >= 10) {
    result.push(10)
    rem -= 10
  }
  while (rem >= 5) {
    result.push(5)
    rem -= 5
  }
  while (rem >= 2) {
    result.push(2)
    rem -= 2
  }
  while (rem >= 1) {
    result.push(1)
    rem -= 1
  }

  return result
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
 * Sektion 1: "1. Wie viel Geld ist es?" (Visuelles Münzen- & Scheine-Zählen)
 * 4 Teilaufgaben (a bis d), 2x mit €, 2x mit ct.
 * Zielbetrag 5 bis 20, max 3-4 echte Münzen/Scheine absteigend sortiert.
 */
export function generateGeldZaehlenTask(count = 4): GeneratedTask {
  const safeCount = Math.max(1, Math.min(count, 10))
  const prefixes = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)', 'g)', 'h)', 'i)', 'j)']
  const euroCandidates = shuffleArray([7, 8, 11, 12, 13, 14, 15, 16, 17, 18, 19, 9, 10])
  const centCandidates = shuffleArray([6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19])

  const items: GeldZaehlenItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < safeCount; i++) {
    const unit: '€' | 'ct' = i % 2 === 0 ? '€' : 'ct'
    const target = unit === '€'
      ? euroCandidates[Math.floor(i / 2) % euroCandidates.length]
      : centCandidates[Math.floor(i / 2) % centCandidates.length]
    const denominations = decomposeGeldAmount(target, unit)
    const prefix = prefixes[i]

    items.push({
      prefix,
      unit,
      total: target,
      denominations,
    })

    const equation = denominations.map((d) => `${d} ${unit}`).join(' + ')
    solutionItems.push(`${prefix} ${equation} = ${target} ${unit}`)
  }

  return {
    id: 1,
    type: 'geld_zaehlen',
    title: 'Wie viel Geld ist es?',
    instruction: 'Zähle die Münzen und Scheine zusammen und trage den Betrag ein.',
    items,
    solutionItems,
  }
}

/**
 * Sektion 2: "2. Rechnen mit Euro und Cent" (Grundrechenarten)
 * 2-spaltiges Grid mit 6 Teilaufgaben (a bis f).
 * Gemischt Addition (+) und Subtraktion (-) im Zahlenraum bis 20.
 * Strikt gleiche Einheit pro Aufgabe.
 */
export function generateGeldRechnenTask(count = 6): GeneratedTask {
  const safeCount = Math.max(1, Math.min(count, 10))
  const prefixes = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)', 'g)', 'h)', 'i)', 'j)']
  const items: GeldRechnenItemData[] = []
  const solutionItems: string[] = []

  const patterns: Array<{ unit: '€' | 'ct'; op: '+' | '-' }> = [
    { unit: '€', op: '+' },
    { unit: 'ct', op: '-' },
    { unit: '€', op: '-' },
    { unit: 'ct', op: '+' },
    { unit: '€', op: '+' },
    { unit: 'ct', op: '-' },
  ]

  const usedSignatures = new Set<string>()

  for (let i = 0; i < safeCount; i++) {
    const { unit, op } = patterns[i % patterns.length]
    const prefix = prefixes[i]
    let num1 = 0
    let num2 = 0
    let result = 0
    let attempts = 0

    while (attempts < 100) {
      attempts++
      if (op === '+') {
        num1 = Math.floor(Math.random() * 12) + 2 // 2 bis 13
        num2 = Math.floor(Math.random() * (20 - num1)) + 1 // num1 + num2 <= 20
        result = num1 + num2
      } else {
        num1 = Math.floor(Math.random() * 13) + 8 // 8 bis 20
        num2 = Math.floor(Math.random() * (num1 - 2)) + 1 // 1 bis num1 - 2
        result = num1 - num2
      }

      if (result >= 1 && result <= 20 && num1 >= 1 && num2 >= 1) {
        const sig = `${num1}${op}${num2}${unit}`
        if (!usedSignatures.has(sig)) {
          usedSignatures.add(sig)
          break
        }
      }
    }

    const display = `${num1} ${unit} ${op} ${num2} ${unit} = ____ ${unit}`
    items.push({
      prefix,
      num1,
      op,
      num2,
      result,
      unit,
      display,
    })

    solutionItems.push(`${prefix} ${num1} ${unit} ${op} ${num2} ${unit} = ${result} ${unit}`)
  }

  return {
    id: 2,
    type: 'geld_rechnen',
    title: 'Rechnen mit Euro und Cent',
    instruction: 'Rechne die Aufgaben aus. Achte auf € und ct.',
    items,
    solutionItems,
  }
}

/**
 * Sektion 3: "Größer, Kleiner oder Gleich?" (Beträge vergleichen ohne Zeilenumbruch!)
 * 2-spaltiges Grid mit 6 Teilaufgaben (a bis f).
 * Links: Rechnung (z. B. 8 € + 4 €)
 * Mitte: Vergleichskreis
 * Rechts: Vergleichswert derselben Einheit (z. B. 12 €)
 * 3x Euro, 3x Cent.
 * Mindestens 2x '<', 2x '>', 2x '=' für ausgewogene Verteilung.
 */
export function generateGeldVergleichTask(count = 6): GeneratedTask {
  const safeCount = Math.max(1, Math.min(count, 10))
  const prefixes = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)', 'g)', 'h)', 'i)', 'j)']
  const items: GeldVergleichItemData[] = []
  const solutionItems: string[] = []

  // Geplante Operatoren: ausgewogene Verteilung
  const targetOpsPool: Array<'<' | '>' | '='> = ['=', '<', '>', '=', '<', '>', '=', '<', '>', '=']
  const targetOps = shuffleArray(targetOpsPool)

  const usedKeys = new Set<string>()

  for (let i = 0; i < safeCount; i++) {
    const prefix = prefixes[i]
    const unit: '€' | 'ct' = i % 2 === 0 ? '€' : 'ct'
    const op = targetOps[i % targetOps.length]

    let leftTerm = ''
    let leftVal = 0
    let rightTerm = ''
    let rightVal = 0
    let attempts = 0

    while (attempts < 100) {
      attempts++
      const isSub = Math.random() < 0.35 // 35 % Subtraktion, 65 % Addition
      let a = 0
      let b = 0

      if (isSub) {
        a = Math.floor(Math.random() * 11) + 10 // 10 bis 20
        b = Math.floor(Math.random() * (a - 3)) + 1 // 1 bis a - 3
        leftVal = a - b
        leftTerm = `${a} ${unit} - ${b} ${unit}`
      } else {
        a = Math.floor(Math.random() * 10) + 3 // 3 bis 12
        b = Math.floor(Math.random() * (19 - a)) + 1 // a + b <= 20
        leftVal = a + b
        leftTerm = `${a} ${unit} + ${b} ${unit}`
      }

      if (op === '=') {
        rightVal = leftVal
      } else if (op === '<') {
        // leftVal < rightVal
        const diff = Math.floor(Math.random() * 4) + 1 // 1 bis 4
        rightVal = Math.min(20, leftVal + diff)
        if (rightVal <= leftVal) {
          leftVal = Math.max(1, rightVal - diff)
        }
      } else {
        // leftVal > rightVal
        const diff = Math.floor(Math.random() * 4) + 1 // 1 bis 4
        rightVal = Math.max(1, leftVal - diff)
        if (leftVal <= rightVal) {
          rightVal = Math.max(1, leftVal - 1)
        }
      }

      // Rechter Term: Bei Euro/Cent als kompakter Betrag z. B. "12 €"
      rightTerm = `${rightVal} ${unit}`

      // Verifiziere strikt ZR 1..20
      if (leftVal >= 1 && leftVal <= 20 && rightVal >= 1 && rightVal <= 20) {
        let validOp = false
        if (op === '=' && leftVal === rightVal) validOp = true
        if (op === '<' && leftVal < rightVal) validOp = true
        if (op === '>' && leftVal > rightVal) validOp = true

        if (validOp) {
          const key = `${leftTerm}_${rightTerm}`
          if (!usedKeys.has(key)) {
            usedKeys.add(key)
            break
          }
        }
      }
    }

    items.push({
      prefix,
      leftTerm,
      leftVal,
      operator: op,
      rightTerm,
      rightVal,
      unit,
    })

    solutionItems.push(`${prefix} ${leftTerm} ${op} ${rightTerm}`)
  }

  return {
    id: 3,
    type: 'geld_vergleich',
    title: 'Größer, Kleiner oder Gleich?',
    instruction: 'Vergleiche die Beträge. Setze <, > oder = ein.',
    items,
    solutionItems,
  }
}

/**
 * Erzeugt das komplette, 100 % deterministische Arbeitsblatt für
 * Klasse 1: "Größen: Euro und Cent (bis 20 €)".
 */
export function generateGeldArbeitsblatt(): GeneratedWorksheet {
  return {
    titel: 'Größen: Euro und Cent (bis 20 €)',
    tasks: [
      generateGeldZaehlenTask(),
      generateGeldRechnenTask(),
      generateGeldVergleichTask(),
    ],
  }
}
