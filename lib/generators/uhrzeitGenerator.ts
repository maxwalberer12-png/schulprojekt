/**
 * lib/generators/uhrzeitGenerator.ts
 *
 * Deterministischer Generator für Klasse 1:
 * "Größen: Zeit & Uhrzeit (volle Stunden, Wochentage)"
 *
 * Didaktische Regeln (LehrplanPLUS Bayern):
 * - Ausschließliche Verwendung voller Stunden (Minutenzeiger zeigt immer exakt auf die 12)
 * - Uhrzeiten am Zifferblatt von 1 bis 12 Uhr
 * - Keine führenden Nummern in den Sektionstiteln (Template nummeriert automatisch)
 */

import { GeneratedTask, GeneratedWorksheet } from '@/types/tools'

export interface UhrzeitAblesenItemData {
  prefix: string
  hour: number // 1 .. 12
}

export interface UhrzeitZeichnenItemData {
  prefix: string
  hour: number // 1 .. 12
}

export interface UhrzeitRechnenItemData {
  prefix: string
  startHour: number
  op: '+' | '-'
  diffHours: number
  resultHour: number
  display: string
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
 * Sektion 1: "Wie spät ist es? (Uhrzeiten ablesen)"
 * 4 Teilaufgaben (a bis d), 4 verschiedene volle Stunden zwischen 1 und 12.
 */
export function generateUhrzeitAblesenTask(count = 4): GeneratedTask {
  const safeCount = Math.max(1, Math.min(count, 10))
  const prefixes = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)', 'g)', 'h)', 'i)', 'j)']
  // Beliebte und didaktisch abwechslungsreiche Stunden wählen (z.B. 3, 7, 9, 11)
  const hourPool = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4])
  const selectedHours = hourPool.slice(0, safeCount)

  const items: UhrzeitAblesenItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < safeCount; i++) {
    const prefix = prefixes[i]
    const hour = selectedHours[i]

    items.push({
      prefix,
      hour,
    })

    solutionItems.push(`${prefix} Es ist ${hour} Uhr.`)
  }

  return {
    id: 1,
    type: 'uhrzeit_ablesen',
    title: 'Wie spät ist es? (Uhrzeiten ablesen)',
    instruction: 'Schau auf die Uhr und trage die richtige Stunde in das Kästchen ein.',
    items,
    solutionItems,
  }
}

/**
 * Sektion 2: "Zeichne den Stundenzeiger ein"
 * 4 Teilaufgaben (a bis d) mit 4 verschiedenen vollen Stunden.
 * Nur der Minutenzeiger steht auf der 12, der Stundenzeiger soll eingezeichnet werden.
 */
export function generateUhrzeitZeichnenTask(excludedHours?: number[], count = 4): GeneratedTask {
  const safeCount = Math.max(1, Math.min(count, 10))
  const prefixes = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)', 'g)', 'h)', 'i)', 'j)']
  const excludedSet = new Set(excludedHours || [])
  const available = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter((h) => !excludedSet.has(h))
  const pool = available.length >= safeCount ? available : [2, 4, 8, 10, 3, 7, 9, 11]
  const shuffled = shuffleArray(pool)
  const selectedHours = shuffled.slice(0, safeCount)

  const items: UhrzeitZeichnenItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < safeCount; i++) {
    const prefix = prefixes[i]
    const hour = selectedHours[i % selectedHours.length]

    items.push({
      prefix,
      hour,
    })

    solutionItems.push(`${prefix} Stundenzeiger auf ${hour} Uhr`)
  }

  return {
    id: 2,
    type: 'uhrzeit_zeichnen',
    title: 'Zeichne den Stundenzeiger ein',
    instruction: 'Der große Minutenzeiger steht auf der 12. Zeichne den kleinen Stundenzeiger passend zur Uhrzeit ein.',
    items,
    solutionItems,
  }
}

/**
 * Sektion 3: "Rechnen mit Stunden (Zeitspannen)"
 * 4 kindgerechte Aufgaben (2x Addition, 2x Subtraktion) im Zahlenraum 1 bis 12.
 */
export function generateUhrzeitRechnenTask(count = 4): GeneratedTask {
  const safeCount = Math.max(1, Math.min(count, 10))
  const prefixes = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)', 'g)', 'h)', 'i)', 'j)']
  const items: UhrzeitRechnenItemData[] = []
  const solutionItems: string[] = []

  const ops: Array<'+' | '-'> = ['+', '-', '+', '-', '+', '-', '+', '-']
  const usedSignatures = new Set<string>()

  for (let i = 0; i < safeCount; i++) {
    const prefix = prefixes[i]
    const op = ops[i % ops.length]
    let startHour = 0
    let diffHours = 0
    let resultHour = 0
    let attempts = 0

    while (attempts < 100) {
      attempts++
      if (op === '+') {
        startHour = Math.floor(Math.random() * 8) + 1 // 1 bis 8
        diffHours = Math.floor(Math.random() * Math.min(5, 12 - startHour)) + 1 // diff >= 1, sum <= 12
        resultHour = startHour + diffHours
      } else {
        startHour = Math.floor(Math.random() * 8) + 5 // 5 bis 12
        diffHours = Math.floor(Math.random() * Math.min(6, startHour - 1)) + 1 // result >= 1
        resultHour = startHour - diffHours
      }

      const sig = `${startHour}${op}${diffHours}`
      if (!usedSignatures.has(sig) && resultHour >= 1 && resultHour <= 12) {
        usedSignatures.add(sig)
        break
      }
    }

    const stundenWord = diffHours === 1 ? 'Stunde' : 'Stunden'
    const display = `${startHour} Uhr ${op} ${diffHours} ${stundenWord} = ____ Uhr`

    items.push({
      prefix,
      startHour,
      op,
      diffHours,
      resultHour,
      display,
    })

    solutionItems.push(
      `${prefix} ${startHour} Uhr ${op} ${diffHours} ${stundenWord} = ${resultHour} Uhr`
    )
  }

  return {
    id: 3,
    type: 'uhrzeit_rechnen',
    title: 'Rechnen mit Stunden (Zeitspannen)',
    instruction: 'Wie viel Uhr ist es später oder früher? Rechne aus.',
    items,
    solutionItems,
  }
}

export interface WochentagItemData {
  prefix: string
  givenType: 'heute' | 'gestern' | 'morgen'
  givenDay: string
  gestern: string
  heute: string
  morgen: string
}

export function generateWochentageTask(count = 3): GeneratedTask {
  const safeCount = Math.max(1, Math.min(count, 10))
  const prefixes = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)', 'g)', 'h)', 'i)', 'j)']
  const weekdays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
  const givenTypes: Array<'heute' | 'gestern' | 'morgen'> = ['heute', 'gestern', 'morgen']
  const items: WochentagItemData[] = []
  const solutionItems: string[] = []
  const usedIndices = new Set<number>()

  for (let i = 0; i < safeCount; i++) {
    const prefix = prefixes[i]
    let dayIdx = Math.floor(Math.random() * 7)
    let attempts = 0
    while (usedIndices.has(dayIdx) && attempts < 20) {
      dayIdx = Math.floor(Math.random() * 7)
      attempts++
    }
    usedIndices.add(dayIdx)

    const gestern = weekdays[(dayIdx + 6) % 7]
    const heute = weekdays[dayIdx]
    const morgen = weekdays[(dayIdx + 1) % 7]
    const givenType = givenTypes[i % givenTypes.length]
    const givenDay = givenType === 'gestern' ? gestern : givenType === 'morgen' ? morgen : heute

    items.push({
      prefix,
      givenType,
      givenDay,
      gestern,
      heute,
      morgen,
    })
    solutionItems.push(
      `${prefix} Gestern: ${gestern} | Heute: ${heute} | Morgen: ${morgen}`
    )
  }

  return {
    id: 4,
    type: 'wochentage',
    title: 'Die Wochentage',
    instruction: 'Welcher Wochentag fehlt? Trage die richtigen Tage in die Lücken ein.',
    items,
    solutionItems,
  }
}

/**
 * Erzeugt das komplette deterministische Arbeitsblatt für
 * Klasse 1: "Größen: Zeit & Uhrzeit (volle Stunden, Wochentage)".
 */
export function generateUhrzeitArbeitsblatt(): GeneratedWorksheet {
  const task1 = generateUhrzeitAblesenTask()
  const usedHours1 = (task1.items as UhrzeitAblesenItemData[]).map((it) => it.hour)
  const task2 = generateUhrzeitZeichnenTask(usedHours1)
  const task3 = generateUhrzeitRechnenTask()
  const task4 = generateWochentageTask()

  return {
    titel: 'Größen: Zeit & Uhrzeit (volle Stunden, Wochentage)',
    tasks: [task1, task2, task3, task4],
  }
}

