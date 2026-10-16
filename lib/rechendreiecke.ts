/**
 * lib/rechendreiecke.ts
 *
 * Deterministischer, mathematisch 100% konsistenter Generator
 * für Rechendreiecke der 1. Klasse (LehrplanPLUS Bayern).
 */

export interface RechendreieckItemData {
  inner: [number, number, number]
  outer: [number, number, number]
  missing: string[]
  prefix?: string
}

/**
 * Validiert, dass NIEMALS gleichzeitig eine Ecke UND die beiden anliegenden Ränder fehlen.
 * Ecken:
 *  inner_0 (oben): anliegend outer_0 (links) und outer_2 (rechts)
 *  inner_1 (links unten): anliegend outer_0 (links) und outer_1 (unten)
 *  inner_2 (rechts unten): anliegend outer_1 (unten) und outer_2 (rechts)
 */
export function validateRechendreieckMissing(missing: string[]): boolean {
  if (missing.includes('inner_0') && missing.includes('outer_0') && missing.includes('outer_2')) {
    return false
  }
  if (missing.includes('inner_1') && missing.includes('outer_0') && missing.includes('outer_1')) {
    return false
  }
  if (missing.includes('inner_2') && missing.includes('outer_1') && missing.includes('outer_2')) {
    return false
  }
  return true
}

/**
 * Stellt sicher, dass für Klasse 1 AUSSCHLIESSLICH folgende 2 Muster existieren:
 * 1. Muster "NUR RÄNDER" (Standard): alle 3 Ecken vorgegeben, alle 3 Ränder gesucht
 * 2. Muster "EINE ECKE GESUCHT" (Differenzierung): genau 1 Ecke und 2 Ränder gesucht
 *    (der 1 vorgegebene Rand grenzt an die fehlende Ecke).
 */
export function sanitizeRechendreieckMissing(missing: unknown): string[] {
  if (!Array.isArray(missing) || missing.length === 0) {
    return ['outer_0', 'outer_1', 'outer_2']
  }

  const strList = missing.map(String)
  const missingInners = strList.filter((m) => m.startsWith('inner_'))

  // 1. MUSTER "NUR RÄNDER" (Standard):
  if (missingInners.length === 0) {
    return ['outer_0', 'outer_1', 'outer_2']
  }

  // Für Klasse 1 darf höchstens 1 Ecke fehlen:
  if (missingInners.length > 1) {
    return ['outer_0', 'outer_1', 'outer_2']
  }

  // 2. MUSTER "EINE ECKE GESUCHT":
  const corner = missingInners[0]
  if (corner === 'inner_2') {
    // Ecke C gesucht (rechts unten): Rand BC (outer_1) vorgegeben -> outer_0 und outer_2 gesucht
    return ['inner_2', 'outer_0', 'outer_2']
  } else if (corner === 'inner_1') {
    // Ecke B gesucht (links unten): Rand AB (outer_0) vorgegeben -> outer_1 und outer_2 gesucht
    return ['inner_1', 'outer_1', 'outer_2']
  } else if (corner === 'inner_0') {
    // Ecke A gesucht (oben): Rand CA (outer_2) vorgegeben -> outer_0 und outer_1 gesucht
    return ['inner_0', 'outer_0', 'outer_1']
  }

  return ['outer_0', 'outer_1', 'outer_2']
}

export function generateConsistentRechendreiecke(
  count: number,
  maxNumber: number = 20,
  seedItems?: unknown[]
): { items: RechendreieckItemData[]; solutionItems: string[] } {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
  const items: RechendreieckItemData[] = []
  const solutionItems: string[] = []

  // Für Klasse 1: Ecken zwischen 1 und 8 (bzw. max 4 bei ZR 10)
  const maxCorner = maxNumber <= 10 ? 4 : Math.min(8, Math.floor(maxNumber / 2))
  const minCorner = 1

  // 2. KLASSE-1-LÜCKEN-SCHEMA:
  // Für Klasse 1 sind AUSSCHLIESSLICH 2 Muster erlaubt:
  // 1. Muster "NUR RÄNDER" (Standard, ca. 70-80%):
  //    Alle 3 Innenzahlen vorgegeben, alle 3 Randkästchen gesucht.
  // 2. Muster "EINE ECKE GESUCHT" (Differenzierung, maximal 1 Aufgabe am Ende):
  //    Genau 2 Ecken und genau 1 Rand vorgegeben (Rand liegt an der fehlenden Ecke).
  const typeBIndices = new Set<number>()
  if (count >= 3) {
    // Platziere die Differenzierungsaufgabe gezielt auf die letzte Teilaufgabe (z. B. e bei 5 Aufgaben)
    typeBIndices.add(count - 1)
  }

  const usedCombinations = new Set<string>()

  for (let i = 0; i < count; i++) {
    const prefix = `${letters[i] || i + 1})`
    let a = 0
    let b = 0
    let c = 0

    // Falls aus seedItems bereits gültige Ecken vorliegen:
    const candidate = seedItems?.[i]
    let candidateUsed = false
    if (candidate && typeof candidate === 'object') {
      const rec = candidate as Record<string, unknown>
      if (Array.isArray(rec.inner) && rec.inner.length >= 3) {
        const inA = Number(rec.inner[0])
        const inB = Number(rec.inner[1])
        const inC = Number(rec.inner[2])
        if (
          Number.isInteger(inA) && inA >= minCorner && inA <= maxCorner &&
          Number.isInteger(inB) && inB >= minCorner && inB <= maxCorner &&
          Number.isInteger(inC) && inC >= minCorner && inC <= maxCorner &&
          inA + inB <= maxNumber && inB + inC <= maxNumber && inC + inA <= maxNumber &&
          inA !== inB && inB !== inC && inC !== inA
        ) {
          a = inA
          b = inB
          c = inC
          candidateUsed = true
        }
      }
    }

    if (!candidateUsed) {
      let attempts = 0
      while (attempts < 80) {
        attempts++
        a = Math.floor(Math.random() * (maxCorner - minCorner + 1)) + minCorner
        b = Math.floor(Math.random() * (maxCorner - minCorner + 1)) + minCorner
        c = Math.floor(Math.random() * (maxCorner - minCorner + 1)) + minCorner

        if (a + b > maxNumber || b + c > maxNumber || c + a > maxNumber) continue

        // Didaktische Varianz: Vorzugsweise 3 unterschiedliche Eckzahlen (keine doppelten Zahlen wie 1, 1, ...)
        if ((a === b || b === c || c === a) && attempts < 60) continue

        const key = [a, b, c].sort().join('-')
        if (!usedCombinations.has(key) || attempts >= 70) {
          usedCombinations.add(key)
          break
        }
      }
    }

    if (a === 0 || b === 0 || c === 0 || (a === b && b === c)) {
      // Determinierter didaktischer Fallback passend zu maxNumber mit strikt paarweise verschiedenen Zahlen
      if (maxNumber <= 10) {
        const fbs: [number, number, number][] = [[2, 3, 4], [3, 1, 4], [2, 4, 1], [1, 5, 2], [3, 2, 5]]
        const fb = fbs[i % fbs.length]
        a = fb[0]
        b = fb[1]
        c = fb[2]
      } else {
        const fbs: [number, number, number][] = [[3, 4, 5], [6, 2, 5], [4, 7, 3], [5, 3, 6], [7, 2, 4], [8, 3, 5]]
        const fb = fbs[i % fbs.length]
        a = fb[0]
        b = fb[1]
        c = fb[2]
      }
    }

    // 1. DETERMINISTISCHE BERECHNUNG DER AUSSENZAHLEN ZWINGEND PER CODE:
    const outer0 = a + b
    const outer1 = b + c
    const outer2 = c + a

    // 2. DIDAKTISCHE SICHERHEITSPRÜFUNG: Rand >= Ecke
    if (outer0 < a || outer0 < b || outer1 < b || outer1 < c || outer2 < c || outer2 < a) {
      throw new Error(`Didaktischer Fehler: Kantenkästchen kleiner als anliegende Ecke`)
    }

    // 3. KLASSE-1-LÜCKEN-SCHEMA:
    const isTypeB = typeBIndices.has(i)
    let missing: string[]
    let solutionStr = ''

    if (!isTypeB) {
      // MUSTER 1 "NUR RÄNDER" (Standard):
      // Vorgegeben: Alle 3 Innenzahlen (a, b, c)
      // Gesucht: Alle 3 Außenzahlen (outer_0, outer_1, outer_2)
      missing = ['outer_0', 'outer_1', 'outer_2']
      solutionStr = `${prefix} Kanten: links = ${outer0}, unten = ${outer1}, rechts = ${outer2}`
    } else {
      // MUSTER 2 "EINE ECKE GESUCHT" (Differenzierung):
      // Vorgegeben: Ecke A (inner_0), Ecke B (inner_1), Rand BC (outer_1, b + c).
      // Gesucht: Ecke C (inner_2), Rand AB (outer_0), Rand CA (outer_2).
      // Das Kind rechnet: C = Rand BC (outer_1) - B (inner_1).
      // Niemals fehlen gleichzeitig eine Ecke UND ihre beiden anliegenden Ränder!
      missing = ['inner_2', 'outer_0', 'outer_2']
      solutionStr = `${prefix} Ecke rechts unten = ${c}, Kante links = ${outer0}, Kante rechts = ${outer2}`
    }

    // Sicherheitsprüfung: Niemals dürfen gleichzeitig eine Ecke UND die beiden anliegenden Ränder fehlen!
    if (!validateRechendreieckMissing(missing)) {
      missing = ['outer_0', 'outer_1', 'outer_2']
    }

    items.push({
      inner: [a, b, c],
      outer: [outer0, outer1, outer2],
      missing,
      prefix,
    })
    solutionItems.push(solutionStr)
  }

  return { items, solutionItems }
}
