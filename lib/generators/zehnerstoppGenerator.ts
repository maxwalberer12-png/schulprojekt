/**
 * lib/generators/zehnerstoppGenerator.ts
 *
 * 100 % deterministischer Generator für Rechnen über den Zehner in 2 Schritten (Zehnerstopp)
 * (Klasse 1 / LehrplanPLUS Bayern: "Zahlenraum bis 20: Mit Zehnerübergang").
 */

import { GeneratedTask } from '@/types/tools'

export interface ZehnerstoppItemData {
  prefix: string
  op: '+' | '-'
  num1: number
  num2: number
  result: number
  step1Missing: number // bei +: 10 - num1; bei -: num1 - 10
  step2Missing: number // bei +: num2 - step1Missing; bei -: num2 - step1Missing
}

export interface GenerateZehnerstoppOptions {
  count?: number // standard 4
}

export function generateZehnerstoppTask(
  options: GenerateZehnerstoppOptions = {}
): GeneratedTask {
  const count = Math.max(1, Math.min(options.count ?? 4, 10))
  const prefixes = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)', 'g)', 'h)', 'i)', 'j)']

  const items: ZehnerstoppItemData[] = []
  const solutionItems: string[] = []
  const usedKeys = new Set<string>()

  for (let i = 0; i < count; i++) {
    const prefix = prefixes[i]
    const isAdd = i % 2 === 0 // abwechselnd Addition und Subtraktion

    if (isAdd) {
      // num1 in 6..9, step1 = 10 - num1 (1..4)
      // step2 in 1..(9 - step1), result = 10 + step2
      let n1 = 8
      let n2 = 5
      let step1 = 2
      let step2 = 3
      let result = 13

      let attempts = 0
      while (attempts < 100) {
        attempts++
        n1 = Math.floor(Math.random() * 4) + 6 // 6..9
        step1 = 10 - n1
        const maxStep2 = Math.min(8, 9 - step1)
        step2 = Math.floor(Math.random() * maxStep2) + 1
        n2 = step1 + step2
        result = n1 + n2
        const key = `+:${n1}+${n2}`
        if (!usedKeys.has(key)) {
          usedKeys.add(key)
          break
        }
      }

      items.push({
        prefix,
        op: '+',
        num1: n1,
        num2: n2,
        result,
        step1Missing: step1,
        step2Missing: step2,
      })

      solutionItems.push(
        `${prefix} ${n1} + ${n2} = ${result} (${n1}+${step1}=10, 10+${step2}=${result})`
      )
    } else {
      // Subtraktion: num1 in 11..16, step1 = num1 - 10 (1..6)
      // step2 in 1..(9 - step1), num2 = step1 + step2 (<= 9), result = 10 - step2
      let n1 = 14
      let n2 = 6
      let step1 = 4
      let step2 = 2
      let result = 8

      let attempts = 0
      while (attempts < 100) {
        attempts++
        n1 = Math.floor(Math.random() * 6) + 11 // 11..16
        step1 = n1 - 10
        const maxStep2 = Math.min(6, 9 - step1)
        step2 = Math.floor(Math.random() * maxStep2) + 1
        n2 = step1 + step2
        result = n1 - n2
        const key = `-:${n1}-${n2}`
        if (!usedKeys.has(key) && result >= 1) {
          usedKeys.add(key)
          break
        }
      }

      items.push({
        prefix,
        op: '-',
        num1: n1,
        num2: n2,
        result,
        step1Missing: step1,
        step2Missing: step2,
      })

      solutionItems.push(
        `${prefix} ${n1} - ${n2} = ${result} (${n1}-${step1}=10, 10-${step2}=${result})`
      )
    }
  }

  return {
    id: 1,
    type: 'zehnerstopp',
    title: 'Zehnerübergang in zwei Schritten (Stopp bei der 10)',
    instruction:
      'Rechne zuerst bis zur 10 und dann den Rest. Trage die Zahlen in die Kästchen ein.',
    items,
    solutionItems,
  }
}
