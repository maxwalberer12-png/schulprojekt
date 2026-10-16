/**
 * lib/generators/aufgabenfamilienGenerator.ts
 *
 * 100 % deterministischer Generator für Aufgabenfamilien (Tausch- und Umkehraufgaben)
 * für Klasse 1 (LehrplanPLUS Bayern).
 */

import { GeneratedTask } from '@/types/tools'

export interface AufgabenfamilieItemData {
  prefix: string
  a: number
  b: number
  sum: number
}

export interface GenerateAufgabenfamilienOptions {
  maxNumber?: number // 10 oder 20
  count?: number // standard 4
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

export function generateAufgabenfamilienTask(
  options: GenerateAufgabenfamilienOptions = {}
): GeneratedTask {
  const maxNumber = options.maxNumber && options.maxNumber <= 10 ? 10 : 20
  const count = Math.max(1, Math.min(options.count ?? 4, 10))
  const prefixes = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)', 'g)', 'h)', 'i)', 'j)']

  const items: AufgabenfamilieItemData[] = []
  const solutionItems: string[] = []
  const usedPairs = new Set<string>()

  for (let i = 0; i < count; i++) {
    const prefix = prefixes[i]
    let a = 3
    let b = 4
    let sum = 7

    let attempts = 0
    while (attempts < 100) {
      attempts++
      if (maxNumber <= 10) {
        a = Math.floor(Math.random() * 6) + 2 // 2..7
        const maxB = 10 - a
        if (maxB < 2) continue
        b = Math.floor(Math.random() * (maxB - 1)) + 2 // 2..maxB
      } else {
        if (options.withoutTransition) {
          // Ohne Zehnerübergang: z.B. 11..16 + 2..3
          a = Math.floor(Math.random() * 6) + 11 // 11..16
          const maxB = 19 - a
          if (maxB < 1) continue
          b = Math.floor(Math.random() * maxB) + 1
        } else {
          // Mit Zehnerübergang oder gemischt
          a = Math.floor(Math.random() * 8) + 4 // 4..11
          const maxB = 19 - a
          if (maxB < 2) continue
          b = Math.floor(Math.random() * (maxB - 1)) + 2
        }
      }

      if (a === b) continue
      sum = a + b
      const key = a < b ? `${a}+${b}` : `${b}+${a}`
      if (!usedPairs.has(key)) {
        usedPairs.add(key)
        break
      }
    }

    items.push({
      prefix,
      a,
      b,
      sum,
    })

    solutionItems.push(
      `${prefix} ${a}+${b}=${sum}, ${b}+${a}=${sum}, ${sum}-${b}=${a}, ${sum}-${a}=${b}`
    )
  }

  return {
    id: 1,
    type: 'aufgabenfamilien',
    title: 'Tausch- und Umkehraufgaben (Aufgabenfamilien)',
    instruction:
      'Zu den drei Zahlen im Dach gehören vier Aufgaben. Schreibe die zwei Plus- und die zwei Minusaufgaben auf.',
    items,
    solutionItems,
  }
}
