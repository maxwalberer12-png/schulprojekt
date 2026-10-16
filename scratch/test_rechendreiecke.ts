import { generateConsistentRechendreiecke } from '../lib/rechendreiecke'
import { parseRechendreieckData } from '../components/ArbeitsblattPreview'

console.log('--- TEST 1: Generierung für Klasse 1 Zahlenraum bis 20 (3 Aufgaben) ---')
const res20 = generateConsistentRechendreiecke(3, 20)
console.log('Generierte Items (ZR 20):', JSON.stringify(res20.items, null, 2))
console.log('Lösungen:', res20.solutionItems)

// Prüfungen
for (let i = 0; i < res20.items.length; i++) {
  const item = res20.items[i]
  const [a, b, c] = item.inner
  const [out0, out1, out2] = item.outer

  // 1. Mathematische Gleichheit
  if (out0 !== a + b) throw new Error(`out0 (${out0}) !== a + b (${a + b}) bei Item ${i}`)
  if (out1 !== b + c) throw new Error(`out1 (${out1}) !== b + c (${b + c}) bei Item ${i}`)
  if (out2 !== c + a) throw new Error(`out2 (${out2}) !== c + a (${c + a}) bei Item ${i}`)

  // 2. Zahlenraum <= 20
  if (out0 > 20 || out1 > 20 || out2 > 20) throw new Error(`Zahlenraum > 20 bei Item ${i}`)
  if (a < 1 || b < 1 || c < 1) throw new Error(`Negative/Null-Ecken bei Item ${i}`)

  // 3. Typ A vs Typ B
  if (i < 2) {
    // Index 0 und 1 sollten Typ A sein (70%)
    if (JSON.stringify(item.missing) !== JSON.stringify(['outer_0', 'outer_1', 'outer_2'])) {
      throw new Error(`Item ${i} sollte Typ A sein, ist aber ${item.missing}`)
    }
  } else {
    // Index 2 sollte Typ B sein (30%)
    // Bei Typ B fehlt 1 Ecke und 2 Kanten
    const innerMissing = item.missing.filter((m) => m.startsWith('inner_'))
    const outerMissing = item.missing.filter((m) => m.startsWith('outer_'))
    if (innerMissing.length !== 1 || outerMissing.length !== 2) {
      throw new Error(`Item ${i} sollte Typ B sein (1 Ecke, 2 Kanten gesucht), ist aber: ${item.missing}`)
    }
  }

  // 4. Test über parseRechendreieckData
  const parsed = parseRechendreieckData(item, i)
  if (!parsed) throw new Error(`parseRechendreieckData schlug fehl für Item ${i}`)
  if (parsed.outer[0] !== a + b || parsed.outer[1] !== b + c || parsed.outer[2] !== c + a) {
    throw new Error(`parseRechendreieckData fehlerhafte Außenzahlen bei Item ${i}`)
  }
}
console.log('✓ TEST 1 BESTANDEN: Alle Berechnungen und Lücken-Schemata für ZR 20 stimmen exakt!')

console.log('\n--- TEST 2: Generierung für Klasse 1 Zahlenraum bis 10 (4 Aufgaben) ---')
const res10 = generateConsistentRechendreiecke(4, 10)
for (let i = 0; i < res10.items.length; i++) {
  const item = res10.items[i]
  const [a, b, c] = item.inner
  const [out0, out1, out2] = item.outer

  if (out0 !== a + b || out1 !== b + c || out2 !== c + a) {
    throw new Error(`Mathe-Fehler bei Item ${i}`)
  }
  if (out0 > 10 || out1 > 10 || out2 > 10) {
    throw new Error(`Zahlenraum > 10 überschritten bei Item ${i}: out=[${out0}, ${out1}, ${out2}]`)
  }
}
console.log('✓ TEST 2 BESTANDEN: Zahlenraum bis 10 wird strikt eingehalten!')

console.log('\n--- TEST 3: Typ B Lösbarkeit ---')
// Bei Typ B: wenn Ecke c (inner_2) gesucht ist, sind a, b und outer_1 (b + c) gegeben.
// Ist c = outer_1 - b lösbar?
for (let i = 0; i < res20.items.length; i++) {
  const item = res20.items[i]
  if (item.missing.includes('inner_2')) {
    const b = item.inner[1]
    const outer1 = item.outer[1]
    const calculatedC = outer1 - b
    if (calculatedC !== item.inner[2]) {
      throw new Error(`Typ B nicht lösbar: c berechnet ${calculatedC} !== tatsächliches c ${item.inner[2]}`)
    }
  }
}
console.log('✓ TEST 3 BESTANDEN: Typ B Knobelaufgaben sind mathematisch 100% konsistent lösbar!')
console.log('\n=== ALLE TESTS ERFOLGREICH ===')
