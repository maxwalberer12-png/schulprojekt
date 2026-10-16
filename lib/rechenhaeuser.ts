/**
 * lib/rechenhaeuser.ts
 *
 * Deterministischer, mathematisch 100% konsistenter Generator
 * für Rechenhäuser / Zahlenhäuser der Grundschule (Zahlzerlegung).
 */

export interface RechenhausFloor {
  left: number
  right: number
  missing: 'left' | 'right'
}

export interface RechenhausData {
  roof: number
  floors: RechenhausFloor[]
  prefix?: string
}

export function generateConsistentRechenhaeuser(
  count: number,
  maxNumber: number = 20,
  seedItems?: unknown[]
): { items: RechenhausData[]; solutionItems: string[] } {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
  const items: RechenhausData[] = []
  const solutionItems: string[] = []

  // Schöne Dachzahlen für Klasse 1
  // Falls maxNumber <= 10: 10, 8, 7, 9, 6, 5
  // Falls maxNumber > 10: 10, 20, 15, 12, 14, 16, 18
  const defaultRoofs = maxNumber <= 10
    ? [10, 8, 7, 9, 6, 5]
    : [10, 20, 12, 15, 14, 16, 18, 8]

  const usedRoofs = new Set<number>()

  for (let i = 0; i < count; i++) {
    const prefix = `${letters[i] || i + 1})`

    // Dachzahl wählen
    let roof = 0
    const candidate = seedItems?.[i]
    if (candidate && typeof candidate === 'object') {
      const rec = candidate as Record<string, unknown>
      const parsedRoof = Number(rec.roof ?? rec.dach ?? rec.hausnummer)
      if (Number.isInteger(parsedRoof) && parsedRoof >= 3 && parsedRoof <= maxNumber) {
        roof = parsedRoof
      }
    }

    if (!roof) {
      // Wähle eine unbenutzte Dachzahl aus den Standardzahlen zufällig
      const available = defaultRoofs.filter((r) => r <= maxNumber && !usedRoofs.has(r))
      if (available.length > 0) {
        const randIdx = Math.floor(Math.random() * available.length)
        roof = available[randIdx]
      } else {
        roof = Math.max(4, Math.floor(Math.random() * (maxNumber - 3)) + 4)
      }
    }
    usedRoofs.add(roof)

    // Stockwerke generieren: 3 bis 4 Zerlegungen
    const numFloors = roof <= 5 ? 3 : 4
    const floors: RechenhausFloor[] = []
    const usedLeft = new Set<number>()

    // Erzeuge Zerlegungen left + right === roof
    // REGEL: Nur Zahlen zwischen 1 und roof - 1 (niemals 0 oder roof)!
    // REGEL: Vermeide identische Zeilen direkt untereinander im selben Haus (z.B. [4 | 6] gefolgt von [6 | 4])
    let prevLeft = -1
    let prevRight = -1

    for (let f = 0; f < numFloors; f++) {
      let left = -1
      let attempts = 0
      const maxLeft = Math.max(1, roof - 1)

      while (attempts < 50) {
        attempts++
        // Erzeuge Zahl zwischen 1 und roof - 1
        const candidateLeft = Math.floor(Math.random() * maxLeft) + 1
        const candidateRight = roof - candidateLeft

        if (!usedLeft.has(candidateLeft)) {
          // Vermeide direkt aufeinanderfolgende identische Paare (z. B. 4|6 und 6|4)
          if (
            f > 0 &&
            (candidateLeft === prevLeft || candidateLeft === prevRight) &&
            maxLeft > 2 &&
            attempts < 30
          ) {
            continue
          }
          left = candidateLeft
          break
        }
      }

      if (left === -1) {
        // Fallback: Erste noch freie Zahl zwischen 1 und roof - 1
        for (let cand = 1; cand < roof; cand++) {
          if (!usedLeft.has(cand)) {
            left = cand
            break
          }
        }
        if (left === -1) {
          left = Math.max(1, (f % (roof - 1)) + 1)
        }
      }

      usedLeft.add(left)
      const right = roof - left
      prevLeft = left
      prevRight = right

      // Abwechselnd linkes oder rechtes Zimmer gesucht
      const missing: 'left' | 'right' = f % 2 === 0 ? 'right' : 'left'

      floors.push({
        left,
        right,
        missing,
      })
    }

    items.push({
      roof,
      floors,
      prefix,
    })

    // Lösung als formatierter Text
    const floorSolutions = floors.map((fl) => {
      return fl.missing === 'right'
        ? `[${fl.left} | ${fl.right}]`
        : `[${fl.left} | ${fl.right}]`
    })
    solutionItems.push(`${prefix} Dach ${roof}: ${floorSolutions.join(', ')}`)
  }

  return { items, solutionItems }
}
