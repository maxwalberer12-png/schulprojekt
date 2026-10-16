/**
 * lib/generators/zwanzigerfeldGenerator.ts
 *
 * 100 % deterministischer Generator für Rechnen am Zehner-/Zwanzigerfeld (Punktefeld mit Wendeplättchen)
 * für die 1. Klasse (LehrplanPLUS Bayern).
 *
 * Features:
 * - Zahlenraum bis 10: Zehnerfeld (1 Zeile mit 10 Kreisen, 5er-Bündelung).
 * - Zahlenraum bis 20: Zwanzigerfeld (2 Zeilen à 10 Kreise, 5er-Trennlinie).
 * - Mit/Ohne Zehnerübergang im ZR 20.
 * - Spezialfall "Zahlzerlegung & Verliebte Zahlen": a + [ ___ ] = 10 (zeigt a rote Plättchen).
 * - Standardfall: [ a ] + [ b ] = [ a + b ] (zeigt a rote und b blaue Plättchen).
 */

import { GeneratedTask } from '@/types/tools'

export interface ZwanzigerfeldItemData {
  prefix: string // 'a)', 'b)', 'c)', 'd)', 'e)', 'f)'
  isTenFrame: boolean
  num1: number // rote Plättchen (a)
  num2: number // blaue Plättchen (b)
  result: number // a + b
  isVerliebteZahlen: boolean
}

export interface GenerateZwanzigerfeldOptions {
  thema?: string
  maxNumber?: number
  count?: number // 4 bis 6
  withoutTransition?: boolean
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function generateZwanzigerfeldTask(
  options: GenerateZwanzigerfeldOptions = {}
): GeneratedTask {
  const themaStr = (options.thema || '').toLowerCase()

  const isVerliebteZahlen =
    /verliebte\s*zahlen|partnerzahlen|zahlzerlegung|schüttelbox|zehnzerlegung/i.test(themaStr)

  const isZR10 =
    options.maxNumber === 10 ||
    /bis\s*10\b/i.test(themaStr) ||
    isVerliebteZahlen

  const maxNumber = isZR10 ? 10 : 20
  const isTenFrame = isZR10

  const isOhneUebergang =
    options.withoutTransition ||
    /ohne\s*(?:zehner)?übergang|ohne\s*(?:zehner)?überschreitung/i.test(themaStr)

  const isMitUebergang =
    /mit\s*(?:zehner)?übergang|über\s*die\s*10/i.test(themaStr) && maxNumber > 10

  const count = Math.max(1, Math.min(options.count ?? 4, 10))
  const prefixes = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)', 'g)', 'h)', 'i)', 'j)']

  const items: ZwanzigerfeldItemData[] = []
  const solutionItems: string[] = []

  // Spezialfall: Zahlzerlegung & Verliebte Zahlen (Partnerzahlen zur 10)
  if (isVerliebteZahlen) {
    // Mögliche Zerlegungen der 10: 1+9, 2+8, 3+7, 4+6, 5+5, 6+4, 7+3, 8+2, 9+1
    const partnerNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    const shuffledPartners = shuffleArray(partnerNumbers)

    for (let i = 0; i < count; i++) {
      const a = shuffledPartners[i % shuffledPartners.length]
      const b = 10 - a
      const prefix = prefixes[i]

      items.push({
        prefix,
        isTenFrame: true,
        num1: a,
        num2: b,
        result: 10,
        isVerliebteZahlen: true,
      })

      solutionItems.push(`${prefix} ${a} + ${b} = 10`)
    }

    return {
      id: 1,
      type: 'zwanzigerfeld',
      title: 'Rechnen am Zehnerfeld',
      instruction:
        'Schau dir die roten Plättchen an. Wie viele Plättchen fehlen bis zur 10? Trage die passende Zahl ein.',
      items,
      solutionItems,
    }
  }

  // Standardfall: Addition am Zehner- oder Zwanzigerfeld
  const usedPairs = new Set<string>()

  for (let i = 0; i < count; i++) {
    const prefix = prefixes[i]
    let a = 1
    let b = 1
    let result = 2

    let attempts = 0
    while (attempts < 200) {
      attempts++
      if (isTenFrame) {
        // ZR 10: a + b <= 10
        a = Math.floor(Math.random() * 6) + 2 // 2 .. 7
        const maxB = 10 - a
        if (maxB < 1) continue
        b = Math.floor(Math.random() * maxB) + 1
        result = a + b
      } else if (isMitUebergang) {
        // ZR 20 mit Zehnerübergang: a <= 9, a + b > 10, result <= 20
        a = Math.floor(Math.random() * 6) + 4 // 4 .. 9
        const minB = 11 - a
        const maxB = Math.min(9, 20 - a)
        if (minB > maxB) continue
        b = Math.floor(Math.random() * (maxB - minB + 1)) + minB
        result = a + b
      } else if (isOhneUebergang) {
        // ZR 20 ohne Zehnerübergang: z. B. 12 + 4 = 16 oder 10 + 5 = 15 oder kleine Zahlen bis 10
        if (Math.random() > 0.3) {
          a = Math.floor(Math.random() * 6) + 11 // 11 .. 16
          const maxB = 19 - a
          if (maxB < 1) continue
          b = Math.floor(Math.random() * maxB) + 1
        } else {
          a = Math.floor(Math.random() * 5) + 3 // 3 .. 7
          const maxB = 10 - a
          b = Math.floor(Math.random() * maxB) + 1
        }
        result = a + b
      } else {
        // Standard ZR 20
        a = Math.floor(Math.random() * 11) + 2 // 2 .. 12
        const maxB = Math.min(8, 20 - a)
        if (maxB < 1) continue
        b = Math.floor(Math.random() * maxB) + 1
        result = a + b
      }

      const key = `${a}+${b}`
      if (!usedPairs.has(key) && result <= maxNumber && a >= 1 && b >= 1) {
        usedPairs.add(key)
        break
      }
    }

    items.push({
      prefix,
      isTenFrame,
      num1: a,
      num2: b,
      result,
      isVerliebteZahlen: false,
    })

    solutionItems.push(`${prefix} ${a} + ${b} = ${result}`)
  }

  const sectionTitle = isTenFrame
    ? 'Rechnen am Zehnerfeld'
    : 'Rechnen am Zwanzigerfeld'

  const instruction =
    'Schau dir die roten und blauen Plättchen an. Schreibe die passende Plusaufgabe auf und rechne aus.'

  return {
    id: 1,
    type: 'zwanzigerfeld',
    title: sectionTitle,
    instruction,
    items,
    solutionItems,
  }
}
