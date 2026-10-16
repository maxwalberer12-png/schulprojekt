/**
 * lib/generators/grade34Generator.ts
 *
 * 100 % deterministische Generatoren für Klasse 3 und 4 (LehrplanPLUS Bayern):
 * 1. Schriftliches Rechnen (+, -, *, / mit Übertrag und Rest)
 * 2. Runden & Stellenwerte im ZR bis 1.000.000
 * 3. Flächeninhalt & Umfang (Rechteck & Quadrat: A = a*b, u = 2a+2b)
 * 4. Gewichte & Hohlmaße (g, kg, t / ml, l)
 * 5. Einheiten umrechnen (Längen, Gewichte, Hohlmaße, Zeitspannen)
 * 6. Diagramme & Tabellen (Säulendiagramm mit SVG und Auswertungsfragen)
 */

import { GeneratedTask } from '@/types/tools'

// ── 1. SCHRIFTLICHES RECHNEN ─────────────────────────────────────
export interface SchriftlichItemData {
  prefix: string
  operation: '+' | '-' | '*' | ':'
  num1: number
  num2: number
  result: number
  rest?: number
  carryDigits?: number[]
}

export function generateSchriftlichTask(grade: 3 | 4 = 3, count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: SchriftlichItemData[] = []
  const solutionItems: string[] = []

  if (grade === 3) {
    // Klasse 3: Schriftliche Addition und Subtraktion bis 1.000 mit Übertrag
    for (let i = 0; i < count; i++) {
      const prefix = letters[i] || `${i + 1})`
      const isAdd = i % 2 === 0

      if (isAdd) {
        // Addition: 2 Dreistellige Zahlen mit Summe < 1.000
        const n1 = Math.floor(Math.random() * 350) + 180 // 180..529
        const n2 = Math.floor(Math.random() * 350) + 150 // 150..499
        const sum = n1 + n2
        items.push({
          prefix,
          operation: '+',
          num1: n1,
          num2: n2,
          result: sum,
        })
        solutionItems.push(`${prefix} ${n1} + ${n2} = ${sum}`)
      } else {
        // Subtraktion: Dreistellig - Dreistellig > 0
        const n1 = Math.floor(Math.random() * 400) + 450 // 450..849
        const n2 = Math.floor(Math.random() * 300) + 120 // 120..419
        const diff = n1 - n2
        items.push({
          prefix,
          operation: '-',
          num1: n1,
          num2: n2,
          result: diff,
        })
        solutionItems.push(`${prefix} ${n1} - ${n2} = ${diff}`)
      }
    }

    return {
      id: 1,
      type: 'schriftlich',
      title: 'Schriftliche Addition und Subtraktion',
      instruction:
        'Schreibe die Zahlen stellenwertgerecht untereinander und rechne aus. Denke an die Überträge!',
      items,
      solutionItems,
    }
  }

  // Klasse 4: Schriftliche +, -, *, / (im ZR bis 1.000.000)
  for (let i = 0; i < count; i++) {
    const prefix = letters[i] || `${i + 1})`
    const mode = i % 4

    if (mode === 0) {
      // Schriftliche Addition großer Zahlen
      const n1 = Math.floor(Math.random() * 30000) + 12000
      const n2 = Math.floor(Math.random() * 40000) + 15000
      const sum = n1 + n2
      items.push({ prefix, operation: '+', num1: n1, num2: n2, result: sum })
      solutionItems.push(`${prefix} ${n1} + ${n2} = ${sum}`)
    } else if (mode === 1) {
      // Schriftliche Subtraktion großer Zahlen
      const n1 = Math.floor(Math.random() * 40000) + 50000
      const n2 = Math.floor(Math.random() * 30000) + 12000
      const diff = n1 - n2
      items.push({ prefix, operation: '-', num1: n1, num2: n2, result: diff })
      solutionItems.push(`${prefix} ${n1} - ${n2} = ${diff}`)
    } else if (mode === 2) {
      // Schriftliche Multiplikation (z. B. dreistellig * einstellig oder zweistellig * zweistellig)
      const n1 = Math.floor(Math.random() * 400) + 120 // 120..519
      const n2 = Math.floor(Math.random() * 6) + 4 // 4..9
      const prod = n1 * n2
      items.push({ prefix, operation: '*', num1: n1, num2: n2, result: prod })
      solutionItems.push(`${prefix} ${n1} · ${n2} = ${prod}`)
    } else {
      // Schriftliche Division mit oder ohne Rest
      const divisor = Math.floor(Math.random() * 5) + 3 // 3..7
      const quotient = Math.floor(Math.random() * 120) + 40 // 40..159
      const rest = (i % 2 === 1) ? Math.floor(Math.random() * (divisor - 1)) + 1 : 0
      const n1 = quotient * divisor + rest
      items.push({ prefix, operation: ':', num1: n1, num2: divisor, result: quotient, rest })
      solutionItems.push(
        rest > 0
          ? `${prefix} ${n1} : ${divisor} = ${quotient} R ${rest}`
          : `${prefix} ${n1} : ${divisor} = ${quotient}`
      )
    }
  }

  return {
    id: 1,
    type: 'schriftlich',
    title: 'Schriftliche Grundrechenarten (+, -, ·, :)',
    instruction:
      'Rechne die Aufgaben schriftlich im Rechenkästchen-Gitter aus. Beachte Überträge und eventuelle Reste!',
    items,
    solutionItems,
  }
}

// ── 2. RUNDEN & STELLENWERTE (KLASSE 4) ───────────────────────────
export interface RundenItemData {
  prefix: string
  number: number
  roundTo: 'Z' | 'H' | 'T' | 'ZT' | 'HT'
  roundToLabel: string
  solution: number
  ruleText: string
}

export function generateRundenTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: RundenItemData[] = []
  const solutionItems: string[] = []

  const configList: Array<{ roundTo: 'Z' | 'H' | 'T' | 'ZT'; label: string; div: number }> = [
    { roundTo: 'Z', label: 'Zehner (Z)', div: 10 },
    { roundTo: 'H', label: 'Hunderter (H)', div: 100 },
    { roundTo: 'T', label: 'Tausender (T)', div: 1000 },
    { roundTo: 'ZT', label: 'Zehntausender (ZT)', div: 10000 },
  ]

  for (let i = 0; i < count; i++) {
    const prefix = letters[i] || `${i + 1})`
    const cfg = configList[i % configList.length]
    // Erzeuge Zahl passender Größenordnung
    const num = Math.floor(Math.random() * 600000) + 45000
    const remainder = num % cfg.div
    const half = cfg.div / 2
    const isUp = remainder >= half
    const sol = isUp ? num + (cfg.div - remainder) : num - remainder

    const ruleText = isUp ? 'aufrunden' : 'abrunden'
    items.push({
      prefix,
      number: num,
      roundTo: cfg.roundTo,
      roundToLabel: cfg.label,
      solution: sol,
      ruleText,
    })
    solutionItems.push(`${prefix} ${num.toLocaleString('de-DE')} ≈ ${sol.toLocaleString('de-DE')} (${ruleText})`)
  }

  return {
    id: 2,
    type: 'runden',
    title: 'Runden großer Zahlen',
    instruction:
      'Runde die Zahlen auf den angegebenen Stellenwert. Regel: 0, 1, 2, 3, 4 wird abgerundet – 5, 6, 7, 8, 9 wird aufgerundet!',
    items,
    solutionItems,
  }
}

// ── 3. FLÄCHENINHALT & UMFANG (KLASSE 4) ─────────────────────────
export interface FlaecheUmfangItemData {
  prefix: string
  shape: 'Rechteck' | 'Quadrat'
  a: number
  b: number
  unit: 'cm' | 'm'
  umfang: number
  flaeche: number
}

export function generateFlaecheUmfangTask(count = 3): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)']
  const items: FlaecheUmfangItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const prefix = letters[i] || `${i + 1})`
    const isQuadrat = i === 1
    const unit: 'cm' | 'm' = i === 2 ? 'm' : 'cm'

    let a = Math.floor(Math.random() * 6) + 4 // 4..9
    let b = isQuadrat ? a : Math.floor(Math.random() * 4) + 2 // 2..5
    if (!isQuadrat && a === b) a += 2

    const umfang = 2 * (a + b)
    const flaeche = a * b
    const shape = isQuadrat ? 'Quadrat' : 'Rechteck'

    items.push({
      prefix,
      shape,
      a,
      b,
      unit,
      umfang,
      flaeche,
    })

    solutionItems.push(
      `${prefix} ${shape} (${a} ${unit} × ${b} ${unit}): Umfang u = ${umfang} ${unit}, Flächeninhalt A = ${flaeche} ${unit}²`
    )
  }

  return {
    id: 3,
    type: 'flaeche_umfang',
    title: 'Flächeninhalt und Umfang (Rechteck & Quadrat)',
    instruction:
      'Berechne für jedes Rechteck oder Quadrat den Umfang u (2·a + 2·b) und den Flächeninhalt A (a · b). Vergiss die Maßeinheiten nicht!',
    items,
    solutionItems,
  }
}

// ── 4. GEWICHTE & HOHLMASSE (KLASSE 3 & 4) ────────────────────────
export interface GewichteHohlmasseItemData {
  prefix: string
  category: 'gewicht' | 'hohlmass'
  prompt: string
  solution: string
}

export function generateGewichteHohlmasseTask(grade: 3 | 4 = 3, count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: GewichteHohlmasseItemData[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const prefix = letters[i] || `${i + 1})`
    const isWeight = i % 2 === 0

    if (grade === 4) {
      if (isWeight) {
        // Tonne & kg
        const mode = i % 3
        if (mode === 0) {
          const t = Math.floor(Math.random() * 5) + 2
          const kg = Math.floor(Math.random() * 18) * 50 + 50 // 50..900 in 50er Schritten
          const totalKg = t * 1000 + kg
          items.push({
            prefix,
            category: 'gewicht',
            prompt: `${prefix} ${t} t ${kg} kg = [___] kg`,
            solution: `${prefix} ${t} t ${kg} kg = ${totalKg} kg`,
          })
          solutionItems.push(`${prefix} ${t} t ${kg} kg = ${totalKg} kg`)
        } else if (mode === 1) {
          const t = Math.floor(Math.random() * 6) + 1
          const kg = Math.floor(Math.random() * 18) * 50 + 50
          const totalKg = t * 1000 + kg
          items.push({
            prefix,
            category: 'gewicht',
            prompt: `${prefix} ${totalKg} kg = [___] t [___] kg`,
            solution: `${prefix} ${totalKg} kg = ${t} t ${kg} kg`,
          })
          solutionItems.push(`${prefix} ${totalKg} kg = ${t} t ${kg} kg`)
        } else {
          const t = Math.floor(Math.random() * 4) + 2
          items.push({
            prefix,
            category: 'gewicht',
            prompt: `${prefix} ${t} t = [___] kg`,
            solution: `${prefix} ${t} t = ${t * 1000} kg`,
          })
          solutionItems.push(`${prefix} ${t} t = ${t * 1000} kg`)
        }
      } else {
        // Liter & ml
        const l = Math.floor(Math.random() * 4) + 1
        const ml = Math.floor(Math.random() * 18) * 50 + 50
        const totalMl = l * 1000 + ml
        if (i % 2 === 1) {
          items.push({
            prefix,
            category: 'hohlmass',
            prompt: `${prefix} ${l} l ${ml} ml = [___] ml`,
            solution: `${prefix} ${l} l ${ml} ml = ${totalMl} ml`,
          })
          solutionItems.push(`${prefix} ${l} l ${ml} ml = ${totalMl} ml`)
        } else {
          items.push({
            prefix,
            category: 'hohlmass',
            prompt: `${prefix} ${totalMl} ml = [___] l [___] ml`,
            solution: `${prefix} ${totalMl} ml = ${l} l ${ml} ml`,
          })
          solutionItems.push(`${prefix} ${totalMl} ml = ${l} l ${ml} ml`)
        }
      }
    } else {
      // Grade 3: kg und g, bzw. l und ml
      if (isWeight) {
        const kg = Math.floor(Math.random() * 4) + 1
        const g = Math.floor(Math.random() * 18) * 50 + 50
        const totalG = kg * 1000 + g
        if (i % 2 === 0) {
          items.push({
            prefix,
            category: 'gewicht',
            prompt: `${prefix} ${kg} kg ${g} g = [___] g`,
            solution: `${prefix} ${kg} kg ${g} g = ${totalG} g`,
          })
          solutionItems.push(`${prefix} ${kg} kg ${g} g = ${totalG} g`)
        } else {
          items.push({
            prefix,
            category: 'gewicht',
            prompt: `${prefix} ${totalG} g = [___] kg [___] g`,
            solution: `${prefix} ${totalG} g = ${kg} kg ${g} g`,
          })
          solutionItems.push(`${prefix} ${totalG} g = ${kg} kg ${g} g`)
        }
      } else {
        const l = Math.floor(Math.random() * 3) + 1
        const ml = Math.floor(Math.random() * 18) * 50 + 50
        const totalMl = l * 1000 + ml
        items.push({
          prefix,
          category: 'hohlmass',
          prompt: `${prefix} ${l} l ${ml} ml = [___] ml`,
          solution: `${prefix} ${l} l ${ml} ml = ${totalMl} ml`,
        })
        solutionItems.push(`${prefix} ${l} l ${ml} ml = ${totalMl} ml`)
      }
    }
  }

  return {
    id: 4,
    type: 'gewichte_hohlmasse',
    title: grade === 4 ? 'Gewichte (t, kg, g) und Hohlmaße (l, ml)' : 'Gewichte (kg, g) und Hohlmaße (l, ml)',
    instruction: 'Wandle die Größen in die gesuchte Maßeinheit um oder ergänze die Lücken.',
    items,
    solutionItems,
  }
}

// ── 5. EINHEITEN UMRECHNEN (LÄNGEN, ZEIT, GEWICHTE) ───────────────
export function generateEinheitenUmrechnenTask(grade: 2 | 3 | 4 = 3, count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: string[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const prefix = letters[i] || `${i + 1})`
    let q = ''
    let a = ''

    if (grade === 2) {
      const mode = i % 3
      if (mode === 0) {
        const m = Math.floor(Math.random() * 4) + 2 // 2..5
        q = `${m} m = [___] cm`
        a = `${m} m = ${m * 100} cm`
      } else if (mode === 1) {
        const m = Math.floor(Math.random() * 2) + 1
        const cm = Math.floor(Math.random() * 8) * 10 + 15 // 15, 25..85
        const total = m * 100 + cm
        q = `${m} m ${cm} cm = [___] cm`
        a = `${m} m ${cm} cm = ${total} cm`
      } else {
        const m = Math.floor(Math.random() * 2) + 1
        const cm = Math.floor(Math.random() * 8) * 10 + 10
        const total = m * 100 + cm
        q = `${total} cm = [___] m [___] cm`
        a = `${total} cm = ${m} m ${cm} cm`
      }
    } else if (grade === 3) {
      const mode = i % 4
      if (mode === 0) {
        const km = Math.floor(Math.random() * 4) + 1
        const m = Math.floor(Math.random() * 18) * 50 + 50
        const total = km * 1000 + m
        q = `${km} km ${m} m = [___] m`
        a = `${km} km ${m} m = ${total} m`
      } else if (mode === 1) {
        const cm = Math.floor(Math.random() * 7) + 2
        const mm = Math.floor(Math.random() * 9) + 1
        const total = cm * 10 + mm
        q = `${cm} cm ${mm} mm = [___] mm`
        a = `${cm} cm ${mm} mm = ${total} mm`
      } else if (mode === 2) {
        const h = Math.floor(Math.random() * 2) + 1
        const min = Math.floor(Math.random() * 10) * 5 + 5
        const total = h * 60 + min
        q = `${h} h ${min} min = [___] min`
        a = `${h} h ${min} min = ${total} min`
      } else {
        const h = Math.floor(Math.random() * 2) + 1
        const min = Math.floor(Math.random() * 10) * 5 + 5
        const total = h * 60 + min
        q = `${total} min = [___] h [___] min`
        a = `${total} min = ${h} h ${min} min`
      }
    } else {
      // Grade 4
      const mode = i % 4
      if (mode === 0) {
        const km = Math.floor(Math.random() * 5) + 2
        const m = Math.floor(Math.random() * 18) * 50 + 50
        const total = km * 1000 + m
        q = `${km} km ${m} m = [___] m`
        a = `${km} km ${m} m = ${total} m`
      } else if (mode === 1) {
        const t = Math.floor(Math.random() * 4) + 2
        const kg = Math.floor(Math.random() * 18) * 50 + 50
        const total = t * 1000 + kg
        q = `${t} t ${kg} kg = [___] kg`
        a = `${t} t ${kg} kg = ${total} kg`
      } else if (mode === 2) {
        const l = Math.floor(Math.random() * 4) + 2
        const ml = Math.floor(Math.random() * 18) * 50 + 50
        const total = l * 1000 + ml
        q = `${l} l ${ml} ml = [___] ml`
        a = `${l} l ${ml} ml = ${total} ml`
      } else {
        const h = Math.floor(Math.random() * 2) + 1
        const min = Math.floor(Math.random() * 10) * 5 + 10
        const total = h * 60 + min
        q = `${h} h ${min} min = [___] min`
        a = `${h} h ${min} min = ${total} min`
      }
    }

    items.push(`${prefix} ${q}`)
    solutionItems.push(`${prefix} ${a}`)
  }

  return {
    id: 5,
    type: 'einheiten_umrechnen',
    title: 'Einheiten umrechnen',
    instruction: 'Rechne die Einheiten um und trage die fehlenden Zahlen ein.',
    items,
    solutionItems,
  }
}


// ── 6. DIAGRAMME & TABELLEN (SÄULENDIAGRAMM) ──────────────────────
export interface DiagrammItemData {
  title: string
  categories: Array<{ label: string; value: number }>
  maxValue: number
  unit: string
  questions: Array<{ id: string; question: string; answer: string }>
}

export function generateDiagrammTask(grade: 2 | 3 | 4 = 3): GeneratedTask {
  const sportsPool = ['Fußball', 'Schwimmen', 'Turnen', 'Reiten', 'Tennis', 'Basketball', 'Handball']
  const shuffledSports = [...sportsPool].sort(() => Math.random() - 0.5).slice(0, 5)

  const usedVals = new Set<number>()
  const categories = shuffledSports.map((label) => {
    let val = 8
    let attempts = 0
    while (attempts < 50) {
      attempts++
      val = Math.floor(Math.random() * 12) + 4 // 4..15
      if (!usedVals.has(val)) {
        usedVals.add(val)
        break
      }
    }
    return { label, value: val }
  })

  const total = categories.reduce((sum, c) => sum + c.value, 0)
  const maxVal = Math.max(...categories.map((c) => c.value))
  const maxSport = categories.find((c) => c.value === maxVal)?.label || categories[0].label
  const minVal = Math.min(...categories.map((c) => c.value))
  const minSport = categories.find((c) => c.value === minVal)?.label || categories[categories.length - 1].label

  const c1 = categories[1]
  const c2 = categories[2]
  const sumTwo = c1.value + c2.value

  const data: DiagrammItemData = {
    title: `Lieblingssportarten der ${total} Kinder der Klasse`,
    categories,
    maxValue: maxVal + 3,
    unit: 'Kinder',
    questions: [
      {
        id: 'a)',
        question: 'Welche Sportart ist am beliebtesten und wie viele Kinder wählen sie?',
        answer: `${maxSport} (${maxVal} Kinder)`,
      },
      {
        id: 'b)',
        question: `Wie viele Kinder haben sich insgesamt für ${c1.label} oder ${c2.label} entschieden?`,
        answer: `${sumTwo} Kinder (${c1.value} + ${c2.value} = ${sumTwo})`,
      },
      {
        id: 'c)',
        question: `Um wie viele Kinder wählen mehr Kinder ${maxSport} als ${minSport}?`,
        answer: `${maxVal - minVal} Kinder (${maxVal} - ${minVal} = ${maxVal - minVal})`,
      },
    ],
  }

  return {
    id: 6,
    type: 'tabellen',
    title: 'Daten & Diagramme: Säulendiagramm auswerten',
    instruction:
      'Lies die Häufigkeiten aus dem Säulendiagramm ab und beantworte die Fragen vollständig.',
    items: [data as unknown as string],
    solutionItems: data.questions.map((q) => `${q.id} ${q.question} -> Antwort: ${q.answer}`),
  }
}

// ── 7. KLASSE 4: GRÖSSEN & MESSEN SPEZIAL-GENERATOREN ─────────────

/**
 * 7.1 Kommaschreibweise bei Längen (km, m, cm, mm) für Klasse 4
 */
export function generateLaengenKommaK4Task(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: string[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const prefix = letters[i] || `${i + 1})`
    const mode = i % 5

    if (mode === 0) {
      // km & m in Kommaschreibweise
      const km = Math.floor(Math.random() * 8) + 1 // 1..8
      const m = (Math.floor(Math.random() * 19) + 1) * 50 // 50..950
      const commaStr = (km + m / 1000).toLocaleString('de-DE', { minimumFractionDigits: m % 100 === 0 ? 1 : m % 10 === 0 ? 2 : 3 })
      items.push(`${prefix} ${km} km ${m} m = [___] km`)
      solutionItems.push(`${prefix} ${km} km ${m} m = ${commaStr} km`)
    } else if (mode === 1) {
      // m & cm in Kommaschreibweise
      const m = Math.floor(Math.random() * 6) + 1
      const cm = (Math.floor(Math.random() * 19) + 1) * 5 // 5..95
      const commaStr = (m + cm / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 })
      items.push(`${prefix} ${m} m ${cm} cm = [___] m`)
      solutionItems.push(`${prefix} ${m} m ${cm} cm = ${commaStr} m`)
    } else if (mode === 2) {
      // cm & mm in Kommaschreibweise
      const cm = Math.floor(Math.random() * 15) + 3
      const mm = Math.floor(Math.random() * 9) + 1
      const commaStr = (cm + mm / 10).toLocaleString('de-DE', { minimumFractionDigits: 1 })
      items.push(`${prefix} ${cm} cm ${mm} mm = [___] cm`)
      solutionItems.push(`${prefix} ${cm} cm ${mm} mm = ${commaStr} cm`)
    } else if (mode === 3) {
      // Kommaschreibweise auflösen in m & cm
      const m = Math.floor(Math.random() * 5) + 2
      const cm = Math.floor(Math.random() * 18) * 5 + 10 // 10..95
      const commaStr = (m + cm / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 })
      items.push(`${prefix} ${commaStr} m = [___] m [___] cm`)
      solutionItems.push(`${prefix} ${commaStr} m = ${m} m ${cm} cm`)
    } else {
      // Kommaschreibweise auflösen in m
      const km = Math.floor(Math.random() * 5) + 1
      const m = (Math.floor(Math.random() * 9) + 1) * 100 // 100..900
      const commaStr = (km + m / 1000).toLocaleString('de-DE', { minimumFractionDigits: 1 })
      const totalM = km * 1000 + m
      items.push(`${prefix} ${commaStr} km = [___] m`)
      solutionItems.push(`${prefix} ${commaStr} km = ${totalM} m`)
    }
  }

  return {
    id: 7,
    type: 'laengen_komma_k4',
    title: 'Kommaschreibweise bei Längen (km, m, cm, mm)',
    instruction:
      'Schreibe die Längen in Kommaschreibweise oder löse die Kommazahlen in gemischte Einheiten auf.',
    items,
    solutionItems,
  }
}

/**
 * 7.2 Große Längeneinheiten umrechnen (km, m, dm, cm, mm) für Klasse 4
 */
export function generateLaengenUmrechnenK4Task(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: string[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const prefix = letters[i] || `${i + 1})`
    const mode = i % 5

    if (mode === 0) {
      // km & m -> m
      const km = Math.floor(Math.random() * 6) + 2
      const m = Math.floor(Math.random() * 18) * 50 + 50
      const totalM = km * 1000 + m
      items.push(`${prefix} ${km} km ${m} m = [___] m`)
      solutionItems.push(`${prefix} ${km} km ${m} m = ${totalM} m`)
    } else if (mode === 1) {
      // reine m -> km und m
      const km = Math.floor(Math.random() * 6) + 2
      const m = Math.floor(Math.random() * 18) * 50 + 50
      const totalM = km * 1000 + m
      items.push(`${prefix} ${totalM} m = [___] km [___] m`)
      solutionItems.push(`${prefix} ${totalM} m = ${km} km ${m} m`)
    } else if (mode === 2) {
      // m & dm -> dm
      const m = Math.floor(Math.random() * 8) + 2
      const dm = Math.floor(Math.random() * 8) + 1
      const totalDm = m * 10 + dm
      items.push(`${prefix} ${m} m ${dm} dm = [___] dm`)
      solutionItems.push(`${prefix} ${m} m ${dm} dm = ${totalDm} dm`)
    } else if (mode === 3) {
      // cm -> mm
      const cm = Math.floor(Math.random() * 25) + 5
      items.push(`${prefix} ${cm} cm = [___] mm`)
      solutionItems.push(`${prefix} ${cm} cm = ${cm * 10} mm`)
    } else {
      // m -> mm
      const m = Math.floor(Math.random() * 4) + 1
      items.push(`${prefix} ${m} m = [___] mm`)
      solutionItems.push(`${prefix} ${m} m = ${m * 1000} mm`)
    }
  }

  return {
    id: 8,
    type: 'laengen_umrechnen_k4',
    title: 'Große Längeneinheiten umrechnen (km, m, dm, cm, mm)',
    instruction:
      'Wandle die Längenangaben in die gesuchte Maßeinheit um.',
    items,
    solutionItems,
  }
}

/**
 * 7.3 Rechnen mit Längen (mit Komma) für Klasse 4
 */
export function generateRechnenLaengenK4Task(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: string[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const prefix = letters[i] || `${i + 1})`
    const mode = i % 4

    if (mode === 0) {
      // Addition mit Komma (km)
      const aVal = Math.floor(Math.random() * 30) * 100 + 1200 // 1,2..4,1 km
      const bVal = Math.floor(Math.random() * 25) * 100 + 800  // 0,8..3,2 km
      const sum = aVal + bVal
      const aStr = (aVal / 1000).toLocaleString('de-DE', { minimumFractionDigits: 1 })
      const bStr = (bVal / 1000).toLocaleString('de-DE', { minimumFractionDigits: 1 })
      const sumStr = (sum / 1000).toLocaleString('de-DE', { minimumFractionDigits: 1 })
      items.push(`${prefix} ${aStr} km + ${bStr} km = [___] km`)
      solutionItems.push(`${prefix} ${aStr} km + ${bStr} km = ${sumStr} km`)
    } else if (mode === 1) {
      // Subtraktion mit Komma (m) - strikt a > b
      const bVal = Math.floor(Math.random() * 20) * 10 + 150 // 1,50..3,40 m
      const aVal = bVal + Math.floor(Math.random() * 25) * 10 + 120 // aVal > bVal immer garantiert!
      const diff = aVal - bVal
      const aStr = (aVal / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 })
      const bStr = (bVal / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 })
      const diffStr = (diff / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 })
      items.push(`${prefix} ${aStr} m - ${bStr} m = [___] m`)
      solutionItems.push(`${prefix} ${aStr} m - ${bStr} m = ${diffStr} m`)
    } else if (mode === 2) {
      // Multiplikation mit einstelliger Zahl
      const factor = Math.floor(Math.random() * 4) + 2 // 2..5
      const cmVal = (Math.floor(Math.random() * 8) + 2) * 25 // 50, 75, 100, 125..225 cm
      const prod = cmVal * factor
      const cmStr = (cmVal / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 })
      const prodStr = (prod / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 })
      items.push(`${prefix} ${factor} · ${cmStr} m = [___] m`)
      solutionItems.push(`${prefix} ${factor} · ${cmStr} m = ${prodStr} m`)
    } else {
      // Division durch 2 oder 4 (glatt teilbar)
      const divisor = Math.random() > 0.5 ? 2 : 4
      const quotient = (Math.floor(Math.random() * 6) + 1) * 250 // 250, 500..1500 m
      const dividend = quotient * divisor
      const divStr = (dividend / 1000).toLocaleString('de-DE', { minimumFractionDigits: 1 })
      const qStr = (quotient / 1000).toLocaleString('de-DE', { minimumFractionDigits: divisor === 4 ? 3 : 2 })
      items.push(`${prefix} ${divStr} km : ${divisor} = [___] km`)
      solutionItems.push(`${prefix} ${divStr} km : ${divisor} = ${qStr} km`)
    }
  }

  return {
    id: 9,
    type: 'rechnen_laengen_k4',
    title: 'Rechnen mit Längen (mit Komma)',
    instruction:
      'Berechne die Längenaufgaben. Achte auf die richtige Einheit und die Kommastellen.',
    items,
    solutionItems,
  }
}

/**
 * 7.4 Gewichte umrechnen (t, kg, g) für Klasse 4
 */
export function generateGewichteUmrechnenK4Task(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: string[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const prefix = letters[i] || `${i + 1})`
    const mode = i % 5

    if (mode === 0) {
      // t & kg -> kg
      const t = Math.floor(Math.random() * 5) + 2
      const kg = Math.floor(Math.random() * 18) * 50 + 50
      const totalKg = t * 1000 + kg
      items.push(`${prefix} ${t} t ${kg} kg = [___] kg`)
      solutionItems.push(`${prefix} ${t} t ${kg} kg = ${totalKg} kg`)
    } else if (mode === 1) {
      // kg -> t & kg
      const t = Math.floor(Math.random() * 6) + 1
      const kg = Math.floor(Math.random() * 18) * 50 + 50
      const totalKg = t * 1000 + kg
      items.push(`${prefix} ${totalKg} kg = [___] t [___] kg`)
      solutionItems.push(`${prefix} ${totalKg} kg = ${t} t ${kg} kg`)
    } else if (mode === 2) {
      // kg & g -> g
      const kg = Math.floor(Math.random() * 6) + 2
      const g = Math.floor(Math.random() * 18) * 50 + 50
      const totalG = kg * 1000 + g
      items.push(`${prefix} ${kg} kg ${g} g = [___] g`)
      solutionItems.push(`${prefix} ${kg} kg ${g} g = ${totalG} g`)
    } else if (mode === 3) {
      // t in Kommaschreibweise
      const t = Math.floor(Math.random() * 5) + 1
      const kg = Math.floor(Math.random() * 19) * 50 + 50 // 50..950
      const commaStr = (t + kg / 1000).toLocaleString('de-DE', { minimumFractionDigits: 1 })
      items.push(`${prefix} ${t} t ${kg} kg = [___] t`)
      solutionItems.push(`${prefix} ${t} t ${kg} kg = ${commaStr} t`)
    } else {
      // g -> kg & g
      const kg = Math.floor(Math.random() * 4) + 1
      const g = Math.floor(Math.random() * 18) * 50 + 50
      const totalG = kg * 1000 + g
      items.push(`${prefix} ${totalG} g = [___] kg [___] g`)
      solutionItems.push(`${prefix} ${totalG} g = ${kg} kg ${g} g`)
    }
  }

  return {
    id: 10,
    type: 'gewichte_umrechnen_k4',
    title: 'Gewichte umrechnen (t, kg, g)',
    instruction:
      'Wandle die Gewichtsangaben in die gesuchte Maßeinheit um.',
    items,
    solutionItems,
  }
}

/**
 * 7.5 Bruchteile von Größen (½ kg = 500 g, ¼ t = 250 kg) für Klasse 4
 */
export function generateBruchteileGroessenK4Task(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: string[] = []
  const solutionItems: string[] = []

  const pool = [
    { q: '½ kg = [___] g', a: '½ kg = 500 g' },
    { q: '¼ kg = [___] g', a: '¼ kg = 250 g' },
    { q: '¾ kg = [___] g', a: '¾ kg = 750 g' },
    { q: '½ t = [___] kg', a: '½ t = 500 kg' },
    { q: '¼ t = [___] kg', a: '¼ t = 250 kg' },
    { q: '¾ t = [___] kg', a: '¾ t = 750 kg' },
    { q: '½ km = [___] m', a: '½ km = 500 m' },
    { q: '¼ km = [___] m', a: '¼ km = 250 m' },
    { q: '¾ km = [___] m', a: '¾ km = 750 m' },
    { q: '½ m = [___] cm', a: '½ m = 50 cm' },
    { q: '¼ m = [___] cm', a: '¼ m = 25 cm' },
    { q: '¾ m = [___] cm', a: '¾ m = 75 cm' },
    { q: '½ l = [___] ml', a: '½ l = 500 ml' },
    { q: '¼ l = [___] ml', a: '¼ l = 250 ml' },
    { q: '¾ l = [___] ml', a: '¾ l = 750 ml' },
  ]

  // Permutieren
  const shuffled = [...pool].sort(() => Math.random() - 0.5)

  for (let i = 0; i < count; i++) {
    const prefix = letters[i] || `${i + 1})`
    const item = shuffled[i % shuffled.length]
    items.push(`${prefix} ${item.q}`)
    solutionItems.push(`${prefix} ${item.a}`)
  }

  return {
    id: 11,
    type: 'bruchteile_groessen_k4',
    title: 'Bruchteile von Größen (½ kg = 500 g, ¼ t = 250 kg)',
    instruction:
      'Wandle die Bruchteile der Maßeinheiten in die kleinere Einheit um.',
    items,
    solutionItems,
  }
}

/**
 * 7.6 Rechnen mit Gewichten (t, kg, g) für Klasse 4
 */
export function generateRechnenGewichteK4Task(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: string[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const prefix = letters[i] || `${i + 1})`
    const mode = i % 4

    if (mode === 0) {
      // Addition Tonnen & kg
      const t1 = Math.floor(Math.random() * 4) + 1
      const kg1 = (Math.floor(Math.random() * 12) + 2) * 50 // 100..650
      const t2 = Math.floor(Math.random() * 4) + 1
      const kg2 = (Math.floor(Math.random() * 12) + 2) * 50
      const totalKg = (t1 + t2) * 1000 + kg1 + kg2
      const resT = Math.floor(totalKg / 1000)
      const resKg = totalKg % 1000
      items.push(`${prefix} ${t1} t ${kg1} kg + ${t2} t ${kg2} kg = [___] t [___] kg`)
      solutionItems.push(`${prefix} ${t1} t ${kg1} kg + ${t2} t ${kg2} kg = ${resT} t ${resKg} kg`)
    } else if (mode === 1) {
      // Subtraktion - strikt a > b
      const t1 = Math.floor(Math.random() * 5) + 5 // 5..9 t
      const t2 = Math.floor(Math.random() * (t1 - 3)) + 1 // 1..(t1-3)
      const kg2 = (Math.floor(Math.random() * 15) + 2) * 50 // 100..800 kg
      const totalKg1 = t1 * 1000
      const totalKg2 = t2 * 1000 + kg2
      const diffKg = totalKg1 - totalKg2 // strikt positiv!
      const resT = Math.floor(diffKg / 1000)
      const resKg = diffKg % 1000
      items.push(`${prefix} ${t1} t - ${t2} t ${kg2} kg = [___] t [___] kg`)
      solutionItems.push(`${prefix} ${t1} t - ${t2} t ${kg2} kg = ${resT} t ${resKg} kg`)
    } else if (mode === 2) {
      // Ergänzen bis 1 t oder 1 kg
      const isTonne = i % 2 === 0
      if (isTonne) {
        const kg = (Math.floor(Math.random() * 17) + 2) * 50 // 100..900 kg
        const restKg = 1000 - kg
        items.push(`${prefix} ${kg} kg + [___] kg = 1 t`)
        solutionItems.push(`${prefix} ${kg} kg + ${restKg} kg = 1 t`)
      } else {
        const g = (Math.floor(Math.random() * 17) + 2) * 50 // 100..900 g
        const restG = 1000 - g
        items.push(`${prefix} ${g} g + [___] g = 1 kg`)
        solutionItems.push(`${prefix} ${g} g + ${restG} g = 1 kg`)
      }
    } else {
      // Multiplikation von Gewichten
      const factor = Math.floor(Math.random() * 4) + 2 // 2..5
      const kg = (Math.floor(Math.random() * 6) + 2) * 50 // 100..350 kg
      const prod = factor * kg
      items.push(`${prefix} ${factor} · ${kg} kg = [___] kg`)
      solutionItems.push(`${prefix} ${factor} · ${kg} kg = ${prod} kg`)
    }
  }

  return {
    id: 12,
    type: 'rechnen_gewichte_k4',
    title: 'Rechnen mit Gewichten (t, kg, g)',
    instruction:
      'Rechne die Aufgaben mit Gewichtsangaben aus.',
    items,
    solutionItems,
  }
}

/**
 * 7.7 Text-/Sachaufgaben zu Größen für Klasse 4
 */
export function generateSachaufgabenK4Task(count = 2): GeneratedTask {
  const letters = ['a)', 'b)']
  const scenarios = [
    {
      text: 'Ein Lastwagen darf höchstens 12 t laden. Auf der Ladefläche stehen bereits 8 t 450 kg Kies. Wie viel Kilogramm Kies dürfen noch zugeladen werden?',
      sol: '12 t - 8 t 450 kg = 3 t 550 kg = 3.550 kg (Es dürfen noch 3.550 kg zugeladen werden.)',
    },
    {
      text: 'Für das Schulsportfest werden 6 Rollen Markierungsband zu je 250 m benötigt. Reichen 1,4 km Band aus oder wie viele Meter fehlen bzw. bleiben übrig?',
      sol: '6 · 250 m = 1.500 m = 1,5 km. 1,5 km > 1,4 km. Es fehlen 100 m Band.',
    },
    {
      text: 'In einer Bäckerei werden für ein großes Brotfest 3 Sack Mehl zu je 25 kg und 4 Packungen Zucker zu je 2,5 kg verbraucht. Wie viel Kilogramm wiegen die Zutaten zusammen?',
      sol: '3 · 25 kg = 75 kg; 4 · 2,5 kg = 10 kg; 75 kg + 10 kg = 85 kg.',
    },
    {
      text: 'Auf einer 4,2 km langen Wanderstrecke machen die Kinder nach genau der Hälfte eine Pause. Wie viele Meter sind sie bis zur Pause gewandert?',
      sol: '4,2 km : 2 = 2,1 km = 2.100 m (Sie sind 2.100 m gewandert.)',
    },
  ]

  const shuffled = [...scenarios].sort(() => Math.random() - 0.5)
  const items = shuffled.slice(0, count).map((s, idx) => ({
    prefix: letters[idx] || `${idx + 1})`,
    text: s.text,
    sol: s.sol,
  }))

  const solutionItems = items.map((it) => `${it.prefix} ${it.sol}`)

  return {
    id: 13,
    type: 'sachaufgaben_k4',
    title: 'Sachaufgaben zu Größen (Längen & Gewichte)',
    instruction:
      'Lies die Sachaufgaben aufmerksam durch, notiere den Rechenweg und den Antwortsatz.',
    items,
    solutionItems,
  }
}

