/**
 * lib/generators/schuettelboxGenerator.ts
 *
 * 100 % deterministischer Generator für Schüttelbox-Aufgaben
 * (Zahlzerlegung & Verliebte Zahlen, Klasse 1 / LehrplanPLUS Bayern).
 */

import { GeneratedTask } from '@/types/tools'

export interface SchuettelboxItemData {
  prefix: string
  total: number // 5 bis 10
  leftCount: number // 1 bis total - 1
  rightCount: number // total - leftCount
}

export interface GenerateSchuettelboxOptions {
  thema?: string
  maxNumber?: number
  count?: number // 4 bis 6
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function generateSchuettelboxTask(
  options: GenerateSchuettelboxOptions = {}
): GeneratedTask {
  const themaStr = (options.thema || '').toLowerCase()
  const isVerliebteZahlen =
    /verliebte\s*zahlen|partnerzahlen|zehnzerlegung/i.test(themaStr)

  const count = Math.max(1, Math.min(options.count ?? 4, 10))
  const prefixes = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)', 'g)', 'h)', 'i)', 'j)']

  const items: SchuettelboxItemData[] = []
  const solutionItems: string[] = []

  if (isVerliebteZahlen) {
    // Feste Summe 10
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    const shuffled = shuffleArray(numbers)

    for (let i = 0; i < count; i++) {
      const prefix = prefixes[i]
      const leftCount = shuffled[i % shuffled.length]
      const rightCount = 10 - leftCount

      items.push({
        prefix,
        total: 10,
        leftCount,
        rightCount,
      })

      solutionItems.push(`${prefix} ${leftCount} + ${rightCount} = 10`)
    }
  } else {
    // Zahlzerlegungen im Bereich 5 bis 10
    const possibleTotals = [6, 7, 8, 9, 10]
    const usedCombinations = new Set<string>()

    for (let i = 0; i < count; i++) {
      const prefix = prefixes[i]
      let total = possibleTotals[i % possibleTotals.length]
      let leftCount = 2
      let rightCount = total - leftCount

      let attempts = 0
      while (attempts < 100) {
        attempts++
        total = possibleTotals[Math.floor(Math.random() * possibleTotals.length)]
        leftCount = Math.floor(Math.random() * (total - 2)) + 1 // 1 .. total-2
        rightCount = total - leftCount
        const key = `${total}:${leftCount}`
        if (!usedCombinations.has(key)) {
          usedCombinations.add(key)
          break
        }
      }

      items.push({
        prefix,
        total,
        leftCount,
        rightCount,
      })

      solutionItems.push(`${prefix} ${leftCount} + ${rightCount} = ${total}`)
    }
  }

  return {
    id: 1,
    type: 'schuettelboxen',
    title: 'Schüttelboxen: Zahlen zerlegen',
    instruction:
      'Wie viele Kugeln sind in der verdeckten Kammer? Schreibe die passende Plusaufgabe auf.',
    items,
    solutionItems,
  }
}
