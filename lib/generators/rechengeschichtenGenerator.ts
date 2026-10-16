/**
 * lib/generators/rechengeschichtenGenerator.ts
 *
 * 100 % deterministischer Rechengeschichten-Generator für Klasse 1
 * (Text-/Sachaufgaben für Schulanfänger).
 *
 * Didaktische Regeln (LehrplanPLUS Bayern, Klasse 1):
 * - Erstklässler können noch keine freien Frage- und Antwortsätze formulieren.
 * - Fibelgerechte, kurze Geschichten (maximal 2 einfache Sätze).
 * - Zahlenraum passt sich automatisch an (bis 10 oder bis 20).
 * - Strukturierte Kästchen für Rechnung: [Zahl 1] [Op] [Zahl 2] = [Ergebnis].
 * - Vorgefertigter Lücken-Antwortsatz: Kind trägt nur die Lösung ein.
 * - Pool von 10 kindgerechten Szenarien mit passenden Mini-SVGs.
 */

import { GeneratedTask } from '@/types/tools'

export type SachaufgabeIconType =
  | 'apple'
  | 'balloon'
  | 'car'
  | 'pencil'
  | 'bird'
  | 'football'
  | 'candy'
  | 'flower'
  | 'star'
  | 'fish'
  | 'book'
  | 'marble'

export interface RechengeschichteItemData {
  prefix: string // 'a)', 'b)', 'c)', 'd)'
  storySentence1: string
  storySentence2: string
  questionText: string
  icon: SachaufgabeIconType
  num1: number
  op: '+' | '-'
  num2: number
  result: number
  answerPrefix: string // z. B. "Es sind jetzt"
  answerSuffix: string // z. B. "Äpfel."
  nounPlural: string
}

export interface ScenarioTemplate {
  icon: SachaufgabeIconType
  nounSingular: string
  nounPlural: string
  addition: (name: string, n1: number, n2: number) => {
    s1: string
    s2: string
    q: string
    answerPrefix: string
    answerSuffix: string
  }
  subtraction: (name: string, n1: number, n2: number) => {
    s1: string
    s2: string
    q: string
    answerPrefix: string
    answerSuffix: string
  }
}

const NAMES = [
  'Lena', 'Max', 'Mia', 'Ben', 'Emma',
  'Jonas', 'Lea', 'Paul', 'Sophie', 'Leon',
  'Anna', 'Felix', 'Marie', 'Lukas', 'Lara',
]

export const SCENARIOS: ScenarioTemplate[] = [
  // 1. Äpfel
  {
    icon: 'apple',
    nounSingular: 'Apfel',
    nounPlural: 'Äpfel',
    addition: (name, n1, n2) => ({
      s1: `${name} hat ${n1} Äpfel gepflückt.`,
      s2: `Oma schenkt ihr noch ${n2} Äpfel dazu.`,
      q: 'Wie viele Äpfel hat sie jetzt?',
      answerPrefix: 'Es sind jetzt',
      answerSuffix: 'Äpfel.',
    }),
    subtraction: (name, n1, n2) => ({
      s1: `Im Korb liegen ${n1} Äpfel.`,
      s2: `${name} und Freunde essen ${n2} Äpfel auf.`,
      q: 'Wie viele Äpfel bleiben übrig?',
      answerPrefix: 'Es bleiben',
      answerSuffix: 'Äpfel übrig.',
    }),
  },
  // 2. Luftballons
  {
    icon: 'balloon',
    nounSingular: 'Luftballon',
    nounPlural: 'Luftballons',
    addition: (name, n1, n2) => ({
      s1: `Auf dem Schulfest fliegen ${n1} Luftballons.`,
      s2: `${name} bringt noch ${n2} Luftballons mit.`,
      q: 'Wie viele Luftballons sind es zusammen?',
      answerPrefix: 'Es sind zusammen',
      answerSuffix: 'Luftballons.',
    }),
    subtraction: (name, n1, n2) => ({
      s1: `${name} hält ${n1} Luftballons in der Hand.`,
      s2: `Plötzlich fliegen ${n2} Luftballons in den Himmel.`,
      q: 'Wie viele Luftballons hat er noch?',
      answerPrefix: 'Er hat noch',
      answerSuffix: 'Luftballons.',
    }),
  },
  // 3. Autos
  {
    icon: 'car',
    nounSingular: 'Auto',
    nounPlural: 'Autos',
    addition: (name, n1, n2) => ({
      s1: `Auf dem Parkplatz stehen ${n1} Autos.`,
      s2: `Es fahren noch ${n2} Autos dazu.`,
      q: 'Wie viele Autos stehen dort jetzt?',
      answerPrefix: 'Dort stehen jetzt',
      answerSuffix: 'Autos.',
    }),
    subtraction: (name, n1, n2) => ({
      s1: `Auf dem Schulhof parken ${n1} Autos.`,
      s2: `Nach dem Unterricht fahren ${n2} Autos weg.`,
      q: 'Wie viele Autos stehen noch da?',
      answerPrefix: 'Es stehen noch',
      answerSuffix: 'Autos da.',
    }),
  },
  // 4. Buntstifte
  {
    icon: 'pencil',
    nounSingular: 'Buntstift',
    nounPlural: 'Buntstifte',
    addition: (name, n1, n2) => ({
      s1: `In ${name}s Mäppchen liegen ${n1} Buntstifte.`,
      s2: `Zum Malen nimmt sie ${n2} Buntstifte dazu.`,
      q: 'Wie viele Buntstifte liegen dort jetzt?',
      answerPrefix: 'Es liegen jetzt',
      answerSuffix: 'Buntstifte dort.',
    }),
    subtraction: (name, n1, n2) => ({
      s1: `${name} hat ${n1} Buntstifte auf dem Tisch.`,
      s2: `Er packt ${n2} Buntstifte in die Schachtel.`,
      q: 'Wie viele Buntstifte bleiben auf dem Tisch?',
      answerPrefix: 'Es bleiben',
      answerSuffix: 'Buntstifte auf dem Tisch.',
    }),
  },
  // 5. Vögel
  {
    icon: 'bird',
    nounSingular: 'Vogel',
    nounPlural: 'Vögel',
    addition: (name, n1, n2) => ({
      s1: `Auf dem Baum sitzen ${n1} Vögel.`,
      s2: `Es flattern noch ${n2} Vögel herbei.`,
      q: 'Wie viele Vögel sitzen jetzt auf dem Baum?',
      answerPrefix: 'Auf dem Baum sitzen jetzt',
      answerSuffix: 'Vögel.',
    }),
    subtraction: (name, n1, n2) => ({
      s1: `Auf dem Zaun zwitschern ${n1} Vögel.`,
      s2: `Auf einmal fliegen ${n2} Vögel davon.`,
      q: 'Wie viele Vögel sitzen noch auf dem Zaun?',
      answerPrefix: 'Es sitzen noch',
      answerSuffix: 'Vögel da.',
    }),
  },
  // 6. Fußbälle
  {
    icon: 'football',
    nounSingular: 'Fußball',
    nounPlural: 'Fußbälle',
    addition: (name, n1, n2) => ({
      s1: `In der Turnhalle liegen ${n1} Fußbälle.`,
      s2: `Der Trainer bringt noch ${n2} Fußbälle.`,
      q: 'Wie viele Fußbälle gibt es jetzt?',
      answerPrefix: 'Es gibt jetzt',
      answerSuffix: 'Fußbälle.',
    }),
    subtraction: (name, n1, n2) => ({
      s1: `Im Korb liegen ${n1} Fußbälle.`,
      s2: `Die Kinder nehmen ${n2} Fußbälle zum Spielen.`,
      q: 'Wie viele Fußbälle bleiben im Korb?',
      answerPrefix: 'Im Korb bleiben',
      answerSuffix: 'Fußbälle.',
    }),
  },
  // 7. Bonbons
  {
    icon: 'candy',
    nounSingular: 'Bonbon',
    nounPlural: 'Bonbons',
    addition: (name, n1, n2) => ({
      s1: `${name} hat ${n1} Bonbons in der Dose.`,
      s2: `Er bekommt noch ${n2} Bonbons geschenkt.`,
      q: 'Wie viele Bonbons hat er jetzt?',
      answerPrefix: 'Er hat jetzt',
      answerSuffix: 'Bonbons.',
    }),
    subtraction: (name, n1, n2) => ({
      s1: `In einer Schale liegen ${n1} Bonbons.`,
      s2: `${name} verteilt ${n2} Bonbons an Freunde.`,
      q: 'Wie viele Bonbons sind noch in der Schale?',
      answerPrefix: 'In der Schale sind noch',
      answerSuffix: 'Bonbons.',
    }),
  },
  // 8. Blumen
  {
    icon: 'flower',
    nounSingular: 'Blume',
    nounPlural: 'Blumen',
    addition: (name, n1, n2) => ({
      s1: `Im Beet blühen ${n1} bunte Blumen.`,
      s2: `Heute gehen noch ${n2} neue Blumen auf.`,
      q: 'Wie viele Blumen blühen jetzt?',
      answerPrefix: 'Es blühen jetzt',
      answerSuffix: 'Blumen.',
    }),
    subtraction: (name, n1, n2) => ({
      s1: `In der Vase stehen ${n1} Blumen.`,
      s2: `${name} nimmt ${n2} Blumen für Mama heraus.`,
      q: 'Wie viele Blumen stehen noch in der Vase?',
      answerPrefix: 'In der Vase stehen noch',
      answerSuffix: 'Blumen.',
    }),
  },
  // 9. Bücher
  {
    icon: 'book',
    nounSingular: 'Buch',
    nounPlural: 'Bücher',
    addition: (name, n1, n2) => ({
      s1: `Auf dem Regal stehen ${n1} Bücher.`,
      s2: `${name} stellt ${n2} neue Bücher dazu.`,
      q: 'Wie viele Bücher stehen jetzt im Regal?',
      answerPrefix: 'Im Regal stehen jetzt',
      answerSuffix: 'Bücher.',
    }),
    subtraction: (name, n1, n2) => ({
      s1: `Auf dem Tisch liegen ${n1} Bücher.`,
      s2: `${name} räumt ${n2} Bücher in die Schultasche.`,
      q: 'Wie viele Bücher liegen noch auf dem Tisch?',
      answerPrefix: 'Auf dem Tisch liegen noch',
      answerSuffix: 'Bücher.',
    }),
  },
  // 10. Murmeln
  {
    icon: 'marble',
    nounSingular: 'Murmel',
    nounPlural: 'Murmeln',
    addition: (name, n1, n2) => ({
      s1: `${name} hat ${n1} bunte Murmeln.`,
      s2: `Beim Spielen gewinnt er ${n2} Murmeln dazu.`,
      q: 'Wie viele Murmeln hat er jetzt?',
      answerPrefix: 'Er hat jetzt',
      answerSuffix: 'Murmeln.',
    }),
    subtraction: (name, n1, n2) => ({
      s1: `Im Glas sind ${n1} Glasmurmeln.`,
      s2: `${name} nimmt ${n2} Murmeln zum Klickern heraus.`,
      q: 'Wie viele Murmeln bleiben im Glas?',
      answerPrefix: 'Im Glas bleiben',
      answerSuffix: 'Murmeln.',
    }),
  },
  // 11. Sterne
  {
    icon: 'star',
    nounSingular: 'Stern',
    nounPlural: 'Sterne',
    addition: (name, n1, n2) => ({
      s1: `${name} sieht am Himmel ${n1} helle Sterne.`,
      s2: `Dann entdeckt sie noch ${n2} Sterne dazu.`,
      q: 'Wie viele Sterne sieht sie jetzt zusammen?',
      answerPrefix: 'Es sind zusammen',
      answerSuffix: 'Sterne.',
    }),
    subtraction: (name, n1, n2) => ({
      s1: `Am Nachthimmel leuchten ${n1} Sterne.`,
      s2: `Hinter einer Wolke verschwinden ${n2} Sterne.`,
      q: 'Wie viele Sterne sind noch zu sehen?',
      answerPrefix: 'Es sind noch',
      answerSuffix: 'Sterne zu sehen.',
    }),
  },
  // 12. Fische
  {
    icon: 'fish',
    nounSingular: 'Fisch',
    nounPlural: 'Fische',
    addition: (name, n1, n2) => ({
      s1: `Im Aquarium schwimmen ${n1} kleine Fische.`,
      s2: `Papa setzt noch ${n2} Fische hinein.`,
      q: 'Wie viele Fische schwimmen jetzt im Aquarium?',
      answerPrefix: 'Es sind jetzt',
      answerSuffix: 'Fische.',
    }),
    subtraction: (name, n1, n2) => ({
      s1: `Im Teich schwimmen ${n1} Fische.`,
      s2: `Zwischen den Steinen verstecken sich ${n2} Fische.`,
      q: 'Wie viele Fische sieht man noch?',
      answerPrefix: 'Man sieht noch',
      answerSuffix: 'Fische.',
    }),
  },
]

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export interface GenerateRechengeschichtenOptions {
  maxNumber?: number
  count?: number
  thema?: string
  withoutTransition?: boolean
}

/**
 * Erzeugt eine deterministische Rechengeschichten-Aufgabe für Klasse 1.
 */
export function generateRechengeschichtenTask(
  options: GenerateRechengeschichtenOptions = {}
): GeneratedTask {
  const themaStr = (options.thema || '').toLowerCase()
  let maxNumber = options.maxNumber || 20
  if (/bis\s*10|zr\s*10|zahlzerlegung/i.test(themaStr)) {
    maxNumber = 10
  }

  const isOhneUebergang =
    options.withoutTransition ||
    /ohne zehnerübergang|ohne zehnerüberschreitung/i.test(themaStr)

  const isMitUebergang =
    /mit zehnerübergang|über die 10/i.test(themaStr) && maxNumber > 10

  const count = Math.max(1, Math.min(options.count ?? 2, 10))
  const prefixes = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)', 'g)', 'h)', 'i)', 'j)']

  const shuffledScenarios = shuffleArray(SCENARIOS)
  const shuffledNames = shuffleArray(NAMES)

  const items: RechengeschichteItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const scenario = shuffledScenarios[i % shuffledScenarios.length]
    const name = shuffledNames[i % shuffledNames.length]
    const prefix = prefixes[i]

    // Abwechselnd Addition und Subtraktion
    const isAddition = i % 2 === 0
    const op: '+' | '-' = isAddition ? '+' : '-'

    let n1 = 1
    let n2 = 1
    let result = 2

    let attempts = 0
    while (attempts < 200) {
      attempts++
      if (isAddition) {
        if (maxNumber <= 10) {
          n1 = Math.floor(Math.random() * 5) + 2 // 2 .. 6
          const maxN2 = maxNumber - n1
          if (maxN2 < 2) continue
          n2 = Math.floor(Math.random() * (maxN2 - 1)) + 2 // 2 .. maxN2
          result = n1 + n2
        } else if (isMitUebergang) {
          // z. B. 7 + 5 = 12, 8 + 6 = 14
          n1 = Math.floor(Math.random() * 6) + 4 // 4 .. 9
          n2 = Math.floor(Math.random() * 6) + (11 - n1) // so dass n1 + n2 > 10
          result = n1 + n2
          if (result > maxNumber || n2 > 9 || n2 < 2) continue
        } else if (isOhneUebergang) {
          // z. B. 12 + 4 = 16, 14 + 3 = 17 oder kleine Zahlen bis 10
          if (Math.random() > 0.4) {
            n1 = Math.floor(Math.random() * 5) + 11 // 11 .. 15
            const maxN2 = 19 - n1
            if (maxN2 < 2) continue
            n2 = Math.floor(Math.random() * (maxN2 - 1)) + 2
          } else {
            n1 = Math.floor(Math.random() * 4) + 3 // 3 .. 6
            const maxN2 = 10 - n1
            if (maxN2 < 2) continue
            n2 = Math.floor(Math.random() * (maxN2 - 1)) + 2
          }
          result = n1 + n2
        } else if (maxNumber > 100) {
          // ZR 1.000 (Klasse 3): Glatte Zehner/Hunderter, Summe <= 1.000
          n1 = (Math.floor(Math.random() * 38) + 12) * 10 // 120..490
          const maxN2 = 1000 - n1
          n2 = (Math.floor(Math.random() * Math.min(35, Math.floor(maxN2 / 10) - 5)) + 5) * 10
          result = n1 + n2
        } else if (maxNumber > 20) {
          // ZR 100 (Klasse 2): Summe <= 100
          n1 = Math.floor(Math.random() * 50) + 15 // 15..64
          const maxN2 = maxNumber - n1
          n2 = Math.floor(Math.random() * Math.min(30, maxN2 - 5)) + 5
          result = n1 + n2
        } else {
          // Standard ZR 20
          n1 = Math.floor(Math.random() * 11) + 2 // 2 .. 12
          const maxN2 = maxNumber - n1
          if (maxN2 < 2) continue
          n2 = Math.floor(Math.random() * Math.min(8, maxN2 - 1)) + 2
          result = n1 + n2
        }

        if (result <= maxNumber && n1 >= 2 && n2 >= 2) break
      } else {
        // Subtraktion
        if (maxNumber <= 10) {
          n1 = Math.floor(Math.random() * 6) + 5 // 5 .. 10
          n2 = Math.floor(Math.random() * (n1 - 3)) + 2 // 2 .. n1-2
          result = n1 - n2
        } else if (isMitUebergang) {
          // z. B. 14 - 6 = 8, 12 - 5 = 7
          n1 = Math.floor(Math.random() * 6) + 11 // 11 .. 16
          n2 = Math.floor(Math.random() * (n1 - 10)) + (n1 - 9) // so dass result < 10
          result = n1 - n2
          if (result >= 10 || result < 2 || n2 > 9 || n2 < 2) continue
        } else if (isOhneUebergang) {
          // z. B. 17 - 4 = 13, 18 - 5 = 13
          n1 = Math.floor(Math.random() * 6) + 14 // 14 .. 19
          n2 = Math.floor(Math.random() * (n1 - 12)) + 2 // n2 so dass result >= 10
          result = n1 - n2
        } else if (maxNumber > 100) {
          // ZR 1.000 (Klasse 3): strikt positiv n1 >= n2, Diff >= 50
          n1 = (Math.floor(Math.random() * 50) + 40) * 10 // 400..890
          n2 = (Math.floor(Math.random() * (Math.floor(n1 / 10) - 15)) + 10) * 10 // 100..
          result = n1 - n2
        } else if (maxNumber > 20) {
          // ZR 100 (Klasse 2): strikt positiv n1 >= n2, Diff >= 8
          n1 = Math.floor(Math.random() * 60) + 35 // 35..94
          n2 = Math.floor(Math.random() * (n1 - 15)) + 8
          result = n1 - n2
        } else {
          n1 = Math.floor(Math.random() * 12) + 7 // 7 .. 18
          n2 = Math.floor(Math.random() * (n1 - 4)) + 2
          result = n1 - n2
        }

        if (result >= 2 && n1 <= maxNumber && n2 >= 2) break
      }
    }

    const storyData = isAddition
      ? scenario.addition(name, n1, n2)
      : scenario.subtraction(name, n1, n2)

    items.push({
      prefix,
      storySentence1: storyData.s1,
      storySentence2: storyData.s2,
      questionText: storyData.q,
      icon: scenario.icon,
      num1: n1,
      op,
      num2: n2,
      result,
      answerPrefix: storyData.answerPrefix,
      answerSuffix: storyData.answerSuffix,
      nounPlural: scenario.nounPlural,
    })

    solutionItems.push(
      `${prefix} ${n1} ${op} ${n2} = ${result} (Antwort: ${storyData.answerPrefix} ${result} ${storyData.answerSuffix})`
    )
  }

  return {
    id: 1,
    type: 'rechengeschichten',
    title: 'Rechengeschichten',
    instruction: 'Lies die Rechengeschichte genau. Schreibe die Rechnung und trage die Antwort ein.',
    items,
    solutionItems,
  }
}
