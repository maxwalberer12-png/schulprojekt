/**
 * lib/generators/zahlenUndOperationenGenerator.ts
 *
 * Zentraler, 100 % deterministischer Generator für den Bereich "Zahlen und Operationen"
 * (Zahlenraum bis 10 und Zahlenraum bis 20, Klasse 1 / LehrplanPLUS Bayern).
 *
 * Mappt JEDEN vom Nutzer ausgewählten Aufgabentyp-Button dynamisch auf seinen
 * passenden SVG-Komponenten-Generator.
 */

import { GeneratedTask, GeneratedWorksheet } from '@/types/tools'
import { generateZwanzigerfeldTask } from './zwanzigerfeldGenerator'
import { generateAufgabenfamilienTask } from './aufgabenfamilienGenerator'
import { generateSchuettelboxTask } from './schuettelboxGenerator'
import { generateZehnerstoppTask } from './zehnerstoppGenerator'
import { generateConsistentRechenhaeuser } from '@/lib/rechenhaeuser'
import { generateRechendreiecke } from './rechendreieckGenerator'
import { generateZahlenmauern } from './zahlenmauerGenerator'
import { generateRechengeschichtenTask } from './rechengeschichtenGenerator'

export interface GenerateZahlenUndOperationenOptions {
  grade?: number
  thema: string
  selectedTaskTypes?: string[]
  tasksPerLevel?: number
  maxNumber?: number
  mitZehneruebergang?: boolean
}

export function normalizeMatheTaskType(typeStr: string): string {
  const lower = (typeStr || '').toLowerCase().trim()
  if (lower.includes('zwanziger') || lower.includes('zehnerfeld') || lower.includes('punktefeld')) return 'zwanzigerfeld'
  if (lower.includes('tausch') || lower.includes('umkehr') || lower.includes('familie')) return 'aufgabenfamilien'
  if (lower.includes('schüttel') || lower.includes('schuettel') || lower.includes('shake')) return 'schuettelboxen'
  if (lower.includes('zehnerstopp') || lower.includes('2 schritt') || lower.includes('zwei schritt')) return 'zehnerstopp'
  if (lower.includes('haus') || lower.includes('häuser') || lower.includes('haeuser')) return 'rechenhaeuser'
  if (lower.includes('dreieck')) return 'rechendreiecke'
  if (lower.includes('mauer')) return 'zahlenmauern'
  if (lower.includes('nachbar') || lower.includes('strahl') || lower.includes('vorgänger') || lower.includes('nachfolger')) return 'nachbarzahlen'
  if (lower.includes('größer') || lower.includes('groesser') || lower.includes('< > =') || lower.includes('kleiner')) return 'groesser_kleiner_gleich'
  if (lower.includes('sachaufgabe') || lower.includes('textaufgabe') || lower.includes('rechengeschichte')) return 'sachaufgaben'
  if (lower.includes('kopfrechnen') || lower.includes('grundrechenart') || lower.includes('rechnen')) return 'kopfrechnen'
  return lower
}

/**
 * Erzeugt Vorgänger- und Nachfolgeraufgaben (Nachbarzahlen)
 */
export function generateNachbarzahlenTask(maxNumber = 10, count = 4): GeneratedTask {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f']
  const items: string[] = []
  const solutionItems: string[] = []
  const usedMitte = new Set<number>()

  const minMitte = 2
  const maxMitte = maxNumber <= 10 ? 9 : 19

  for (let i = 0; i < count; i++) {
    const prefix = `${letters[i] || i + 1})`
    let mitte = 0
    let attempts = 0
    while (attempts < 30) {
      attempts++
      const cand = Math.floor(Math.random() * (maxMitte - minMitte + 1)) + minMitte
      if (!usedMitte.has(cand)) {
        mitte = cand
        break
      }
    }
    if (!mitte) mitte = minMitte + (i % (maxMitte - minMitte + 1))
    usedMitte.add(mitte)

    const vor = mitte - 1
    const nach = mitte + 1

    items.push(`${prefix} ___ , ${mitte} , ___`)
    solutionItems.push(`${prefix} ${vor} , ${mitte} , ${nach}`)
  }

  return {
    id: 1,
    type: 'nachbarzahlen',
    title: 'Nachbarzahlen (Vorgänger und Nachfolger)',
    instruction: 'Trage den Vorgänger und den Nachfolger in die Lücken ein.',
    items,
    solutionItems,
  }
}

/**
 * Erzeugt Vergleichsaufgaben mit dem Kreis-Symbol (< > =)
 */
export function generateVergleichTask(maxNumber = 10, count = 4): GeneratedTask {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f']
  const items: string[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const prefix = `${letters[i] || i + 1})`
    const type = i % 3 // 0: <, 1: >, 2: =
    let leftStr = ''
    let rightStr = ''
    let sign = ''

    if (type === 0) {
      // Kleiner (<)
      const a = Math.floor(Math.random() * (maxNumber - 3)) + 1
      const b = Math.floor(Math.random() * (maxNumber - a - 1)) + 1
      const sum = a + b
      const rightVal = Math.min(maxNumber, sum + Math.floor(Math.random() * 2) + 1)
      leftStr = `${a} + ${b}`
      rightStr = `${rightVal}`
      sign = '<'
    } else if (type === 1) {
      // Größer (>)
      const a = Math.floor(Math.random() * (maxNumber - 2)) + 2
      const b = Math.floor(Math.random() * (a - 1)) + 1
      const diff = a - b
      const rightVal = Math.max(0, diff - 1)
      leftStr = `${a} - ${b}`
      rightStr = `${rightVal}`
      sign = '>'
    } else {
      // Gleich (=)
      const a = Math.floor(Math.random() * (maxNumber - 2)) + 1
      const b = Math.floor(Math.random() * (maxNumber - a)) + 1
      const sum = a + b
      leftStr = `${a} + ${b}`
      rightStr = `${sum}`
      sign = '='
    }

    items.push(`${prefix} ${leftStr} [ ] ${rightStr}`)
    solutionItems.push(`${prefix} ${leftStr} ${sign} ${rightStr}`)
  }

  return {
    id: 1,
    type: 'groesser_kleiner_gleich',
    title: 'Größer, kleiner oder gleich (< > =)',
    instruction: 'Setze das richtige Zeichen in den Kreis ein: <, > oder =.',
    items,
    solutionItems,
  }
}

/**
 * Erzeugt Kopfrechnen-Aufgaben mit Lückenboxen
 */
export function generateKopfrechnenTask(
  maxNumber = 10,
  count = 4,
  mitZehneruebergang = false
): GeneratedTask {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f']
  const items: string[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const prefix = `${letters[i] || i + 1})`
    const isPlus = i % 2 === 0

    if (isPlus) {
      let a = 0
      let b = 0
      if (maxNumber <= 10) {
        a = Math.floor(Math.random() * 8) + 1
        b = Math.floor(Math.random() * (10 - a)) + 1
      } else if (!mitZehneruebergang) {
        a = Math.floor(Math.random() * 8) + 11 // 11 bis 18
        b = Math.floor(Math.random() * (20 - a)) + 1
      } else {
        // mit Zehnerübergang (z.B. 8 + 5 = 13)
        a = Math.floor(Math.random() * 4) + 6 // 6 bis 9
        b = Math.floor(Math.random() * (20 - a - (10 - a))) + (11 - a) // mind. 10 - a + 1
      }
      const sum = a + b
      items.push(`${prefix} ${a} + ${b} = [ ]`)
      solutionItems.push(`${prefix} ${a} + ${b} = ${sum}`)
    } else {
      let a = 0
      let b = 0
      if (maxNumber <= 10) {
        a = Math.floor(Math.random() * 9) + 2
        b = Math.floor(Math.random() * (a - 1)) + 1
      } else if (!mitZehneruebergang) {
        a = Math.floor(Math.random() * 8) + 12 // 12 bis 19
        b = Math.floor(Math.random() * (a - 10)) + 1 // b so dass a - b >= 10
      } else {
        // mit Zehnerübergang (z.B. 14 - 6 = 8)
        a = Math.floor(Math.random() * 8) + 11 // 11 bis 18
        b = Math.floor(Math.random() * (a - 10)) + (a - 9) // b > a - 10
        if (b >= a) b = a - 2
      }
      const diff = a - b
      items.push(`${prefix} ${a} - ${b} = [ ]`)
      solutionItems.push(`${prefix} ${a} - ${b} = ${diff}`)
    }
  }

  return {
    id: 1,
    type: 'kopfrechnen',
    title: 'Kopfrechnen: Grundrechenarten',
    instruction: 'Rechne die Aufgaben aus und trage das Ergebnis in das Kästchen ein.',
    items,
    solutionItems,
  }
}

/**
 * Haupt-Generator: Erzeugt das komplette Arbeitsblatt dynamisch anhand der vom
 * Nutzer ausgewählten Task-Types (`selectedTaskTypes`).
 */
export function generateZahlenUndOperationenArbeitsblatt(
  options: GenerateZahlenUndOperationenOptions
): GeneratedWorksheet {
  const thema = options.thema || 'Zahlenraum bis 10: Zahlzerlegung & Verliebte Zahlen'
  const isZR10 =
    options.maxNumber === 10 ||
    /bis\s*10\b|zerleg|verliebt/i.test(thema)

  const maxNumber = isZR10 ? 10 : (options.maxNumber || 20)
  const mitZehneruebergang =
    options.mitZehneruebergang ??
    (!isZR10 && /mit\s*(?:zehner)?übergang|über\s*die\s*10/i.test(thema))

  const countPerTask = options.tasksPerLevel || 4

  // Standard-Auswahl, falls Nutzer noch nichts gewählt hat
  const rawTypes =
    options.selectedTaskTypes && options.selectedTaskTypes.length > 0
      ? options.selectedTaskTypes
      : isZR10
      ? ['Zwanzigerfeld / Punktefeld', 'Tausch- & Umkehraufgaben', 'Schüttelboxen (Zahlzerlegung)']
      : ['Kopfrechnen / Grundrechenarten', 'Rechendreiecke', 'Rechenhäuser']

  const tasks: GeneratedTask[] = []

  rawTypes.forEach((rawType, idx) => {
    const key = normalizeMatheTaskType(rawType)

    switch (key) {
      case 'zwanzigerfeld': {
        const task = generateZwanzigerfeldTask({
          thema,
          maxNumber,
          count: countPerTask,
        })
        task.id = idx + 1
        tasks.push(task)
        break
      }

      case 'aufgabenfamilien': {
        const task = generateAufgabenfamilienTask({
          maxNumber,
          count: countPerTask,
        })
        task.id = idx + 1
        tasks.push(task)
        break
      }

      case 'schuettelboxen': {
        const task = generateSchuettelboxTask({
          thema,
          maxNumber,
          count: countPerTask,
        })
        task.id = idx + 1
        tasks.push(task)
        break
      }

      case 'zehnerstopp': {
        const task = generateZehnerstoppTask({ count: countPerTask })
        task.id = idx + 1
        tasks.push(task)
        break
      }

      case 'rechenhaeuser': {
        const gen = generateConsistentRechenhaeuser(countPerTask, maxNumber)
        tasks.push({
          id: idx + 1,
          type: 'rechenhaeuser',
          title: 'Rechenhäuser: Zahlen zerlegen',
          instruction: 'Zerlege die Zahl im Dach. Trage die fehlenden Zahlen in die Zimmer ein.',
          items: gen.items,
          solutionItems: gen.solutionItems,
        })
        break
      }

      case 'rechendreiecke': {
        const gen = generateRechendreiecke(
          countPerTask,
          maxNumber,
          mitZehneruebergang
        )
        tasks.push({
          id: idx + 1,
          type: 'rechendreiecke',
          title: 'Rechendreiecke',
          instruction: 'Rechne die Innen- und Außenzahlen im Dreieck aus.',
          items: gen.items,
          solutionItems: gen.solutionItems,
        })
        break
      }

      case 'zahlenmauern': {
        const gen = generateZahlenmauern(countPerTask, maxNumber, 3)
        tasks.push({
          id: idx + 1,
          type: 'zahlenmauern',
          title: 'Zahlenmauern',
          instruction: 'Rechne die Zahlenmauern von unten nach oben aus.',
          items: gen.items,
          solutionItems: gen.solutionItems,
        })
        break
      }

      case 'nachbarzahlen': {
        const task = generateNachbarzahlenTask(maxNumber, countPerTask)
        task.id = idx + 1
        tasks.push(task)
        break
      }

      case 'groesser_kleiner_gleich': {
        const task = generateVergleichTask(maxNumber, countPerTask)
        task.id = idx + 1
        tasks.push(task)
        break
      }

      case 'sachaufgaben': {
        const task = generateRechengeschichtenTask({
          count: countPerTask,
          maxNumber,
          thema,
        })
        task.id = idx + 1
        tasks.push(task)
        break
      }

      case 'kopfrechnen':
      default: {
        const task = generateKopfrechnenTask(maxNumber, countPerTask, mitZehneruebergang)
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
