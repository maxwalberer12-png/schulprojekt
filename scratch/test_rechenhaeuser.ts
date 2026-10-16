import { generateConsistentRechenhaeuser } from '../lib/rechenhaeuser'
import { parseRechenhausData } from '../components/ArbeitsblattPreview'
import { MATHE_KEY_TO_LABEL, MATHE_LABEL_TO_KEY } from '../components/dashboard/ToolDetailClient'
import { LEHRPLANPLUS_MATHE_DATENBANK } from '../lib/curriculum/lehrplanplus_mathe'

console.log('--- TEST 1: Trennung der Aufgabentypen ---')
if (MATHE_KEY_TO_LABEL['rechendreiecke'] !== 'Rechendreiecke') {
  throw new Error(`MATHE_KEY_TO_LABEL['rechendreiecke'] sollte 'Rechendreiecke' sein, ist aber: ${MATHE_KEY_TO_LABEL['rechendreiecke']}`)
}
if (MATHE_KEY_TO_LABEL['rechenhaeuser'] !== 'Rechenhäuser') {
  throw new Error(`MATHE_KEY_TO_LABEL['rechenhaeuser'] sollte 'Rechenhäuser' sein, ist aber: ${MATHE_KEY_TO_LABEL['rechenhaeuser']}`)
}
if (MATHE_LABEL_TO_KEY['Rechendreiecke'] !== 'rechendreiecke') {
  throw new Error(`MATHE_LABEL_TO_KEY['Rechendreiecke'] fehlerhaft`)
}
if (MATHE_LABEL_TO_KEY['Rechenhäuser'] !== 'rechenhaeuser') {
  throw new Error(`MATHE_LABEL_TO_KEY['Rechenhäuser'] fehlerhaft`)
}
console.log('✓ TEST 1 BESTANDEN: rechendreiecke und rechenhaeuser sind als separate Aufgabentypen definiert!')

console.log('\n--- TEST 2: Lehrplan-Erlaubnis für Zahlzerlegung ---')
const k1Thema = LEHRPLANPLUS_MATHE_DATENBANK.find((t) => t.id === 'by_k1_zr10_zerlegung')
if (!k1Thema) throw new Error('by_k1_zr10_zerlegung nicht gefunden')
if (!k1Thema.erlaubteAufgabentypen.includes('rechenhaeuser')) {
  throw new Error('rechenhaeuser muss in by_k1_zr10_zerlegung erlaubt sein!')
}
if (!k1Thema.erlaubteAufgabentypen.includes('rechendreiecke')) {
  throw new Error('rechendreiecke muss in by_k1_zr10_zerlegung erlaubt sein!')
}
console.log('✓ TEST 2 BESTANDEN: Lehrplan-Thema Zahlzerlegung bis 10 erlaubt rechenhaeuser und rechendreiecke!')

console.log('\n--- TEST 3: Deterministische Generierung von Rechenhäusern ---')
const genResult = generateConsistentRechenhaeuser(3, 10)
console.log('Generierte Häuser:', JSON.stringify(genResult.items, null, 2))
console.log('Lösungs-Strings:', genResult.solutionItems)

if (genResult.items.length !== 3) throw new Error('Es sollten genau 3 Häuser generiert werden')

for (let i = 0; i < genResult.items.length; i++) {
  const house = genResult.items[i]
  const roof = house.roof
  if (roof < 3 || roof > 10) throw new Error(`Ungültige Dachzahl: ${roof}`)

  for (const floor of house.floors) {
    if (floor.left + floor.right !== roof) {
      throw new Error(`Mathematischer Fehler in Stockwerk: ${floor.left} + ${floor.right} !== ${roof}`)
    }
    if (floor.missing !== 'left' && floor.missing !== 'right') {
      throw new Error(`Ungültiges missing: ${floor.missing}`)
    }
  }

  // Test Parser
  const parsed = parseRechenhausData(house, i)
  if (!parsed || parsed.roof !== roof || parsed.floors.length !== house.floors.length) {
    throw new Error(`parseRechenhausData Fehler bei Haus ${i}`)
  }
}
console.log('✓ TEST 3 BESTANDEN: Alle Rechenhäuser sind mathematisch zu 100% konsistent!')

console.log('\n=== ALLE TESTS ERFOLGREICH ABGESCHLOSSEN ===')
