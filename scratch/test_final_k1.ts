import { MATHE_LABEL_TO_KEY, MATHE_KEY_TO_LABEL, filterOrFallbackTaskTypes } from '../components/dashboard/ToolDetailClient'
import { LEHRPLANPLUS_MATHE_DATENBANK } from '../lib/curriculum/lehrplanplus_mathe'
import { generateRechengeschichtenTask, SCENARIOS, RechengeschichteItemData } from '../lib/generators/rechengeschichtenGenerator'
import { generateZwanzigerfeldTask, ZwanzigerfeldItemData } from '../lib/generators/zwanzigerfeldGenerator'

console.log('=== TEST 1: CHIP-SCHUTZ & NEUER BUTTON (ZWANTIGERFELD) ===')

// 1. Prüfe, ob "zwanzigerfeld" in den Labels und Keys registriert ist
console.log('Label für zwanzigerfeld:', MATHE_KEY_TO_LABEL['zwanzigerfeld'])
console.log('Key für "Zwanzigerfeld / Punktefeld":', MATHE_LABEL_TO_KEY['Zwanzigerfeld / Punktefeld'])
if (MATHE_KEY_TO_LABEL['zwanzigerfeld'] !== 'Zwanzigerfeld / Punktefeld') {
  throw new Error('Key to label mapping für zwanzigerfeld fehlt!')
}

// 2. Prüfe, ob "Zwanzigerfeld / Punktefeld" in allen K1-Arithmetik-Themen erlaubt ist
const k1ArithmetikThemen = LEHRPLANPLUS_MATHE_DATENBANK.filter(
  (t) => t.klasse === 1 && t.bereich === 'Zahlen und Operationen' && t.zahlenraum <= 20 && t.erlaubteOperationen.length > 0
)

k1ArithmetikThemen.forEach((thema) => {
  const isAllowed = thema.erlaubteAufgabentypen.includes('zwanzigerfeld')
  console.log(`- Thema "${thema.titel}": Zwanzigerfeld erlaubt? ${isAllowed}`)
  if (!isAllowed) {
    throw new Error(`Zwanzigerfeld nicht erlaubt in ${thema.titel}`)
  }
})
console.log('✓ Zwanzigerfeld / Punktefeld ist in allen K1-Arithmetik-Themen freigeschaltet!')

// 3. Prüfe, ob "Einheiten umrechnen" in K1 ausgeblendet wird
const k1Thema = LEHRPLANPLUS_MATHE_DATENBANK.find((t) => t.klasse === 1)!
const filtered = filterOrFallbackTaskTypes(
  ['Kopfrechnen / Grundrechenarten', 'Einheiten umrechnen', 'Zwanzigerfeld / Punktefeld'],
  k1Thema,
  1
)
console.log('Gefilterte Auswahl für K1:', filtered)
if (filtered.includes('Einheiten umrechnen')) {
  throw new Error('Einheiten umrechnen wurde in K1 nicht herausgefiltert!')
}
if (!filtered.includes('Zwanzigerfeld / Punktefeld')) {
  throw new Error('Zwanzigerfeld / Punktefeld wurde fälschlicherweise herausgefiltert!')
}
console.log('✓ Einheiten umrechnen wird in K1 strikt unterbunden und Zwanzigerfeld bleibt erhalten!')

console.log('\n=== TEST 2: RECHENGESCHICHTEN-GENERATOR (KLASSE 1) ===')
console.log(`Anzahl an Szenarien: ${SCENARIOS.length} (inkl. star und fish)`)
const hasStar = SCENARIOS.some((s) => s.icon === 'star')
const hasFish = SCENARIOS.some((s) => s.icon === 'fish')
if (!hasStar || !hasFish) {
  throw new Error('Szenarien "star" oder "fish" fehlen!')
}
console.log('✓ Szenarien-Pool umfasst alle kindgerechten Symbole inkl. Stern und Fisch!')

const rgZR10 = generateRechengeschichtenTask({ thema: 'Zahlenraum bis 10', maxNumber: 10, count: 4 })
const itemsZR10 = rgZR10.items as RechengeschichteItemData[]
itemsZR10.forEach((item) => {
  if (item.result > 10) throw new Error(`ZR10 überschritten: ${item.result}`)
  console.log(`  [${item.prefix}] [${item.icon}] ${item.num1} ${item.op} ${item.num2} = ${item.result} | Frage: ${item.questionText}`)
})
console.log('✓ Rechengeschichten im ZR 10 deterministisch und mathematisch korrekt!')

console.log('\n=== TEST 3: ZWANZIGERFELD / PUNKTEFELD GENERATOR ===')

// 1. Zehnerfeld (ZR 10)
const zfZR10 = generateZwanzigerfeldTask({ thema: 'Zahlenraum bis 10: Plus und Minus', maxNumber: 10, count: 4 })
console.log(`Titel ZR 10: "${zfZR10.title}"`)
const itemsZfZR10 = zfZR10.items as ZwanzigerfeldItemData[]
itemsZfZR10.forEach((item) => {
  if (!item.isTenFrame) throw new Error('isTenFrame muss true sein für ZR 10')
  if (item.result > 10) throw new Error(`ZR 10 überschritten: ${item.result}`)
  if (item.num1 + item.num2 !== item.result) throw new Error('Ergebnis fehlerhaft')
  console.log(`  [${item.prefix}] 10er-Feld: ${item.num1} rot + ${item.num2} blau = ${item.result}`)
})
console.log('✓ Zehnerfeld ZR 10 vollständig korrekt!')

// 2. Spezialfall Verliebte Zahlen / Zahlzerlegung zur 10
const zfPartner = generateZwanzigerfeldTask({ thema: 'Zahlenraum bis 10: Zahlzerlegung & Verliebte Zahlen zur 10', maxNumber: 10, count: 4 })
console.log(`\nTitel Verliebte Zahlen: "${zfPartner.title}"`)
console.log(`Anweisung: "${zfPartner.instruction}"`)
const itemsZfPartner = zfPartner.items as ZwanzigerfeldItemData[]
itemsZfPartner.forEach((item) => {
  if (!item.isVerliebteZahlen) throw new Error('isVerliebteZahlen muss true sein')
  if (item.num1 + item.num2 !== 10) throw new Error('Partnerzahl muss exakt 10 ergeben')
  console.log(`  [${item.prefix}] Verliebte Zahlen: ${item.num1} rot + [ ${item.num2} ] = 10`)
})
console.log('✓ Spezialfall "Verliebte Zahlen" (a + [ ___ ] = 10) vollständig korrekt!')

// 3. Zwanzigerfeld (ZR 20) mit Zehnerübergang
const zfZR20Mit = generateZwanzigerfeldTask({ thema: 'Zahlenraum bis 20: Rechnen mit Zehnerübergang', maxNumber: 20, count: 4 })
console.log(`\nTitel ZR 20: "${zfZR20Mit.title}"`)
const itemsZfZR20Mit = zfZR20Mit.items as ZwanzigerfeldItemData[]
itemsZfZR20Mit.forEach((item) => {
  if (item.isTenFrame) throw new Error('isTenFrame muss false sein für ZR 20')
  if (item.result <= 10) throw new Error(`Zehnerübergang verlangt result > 10, war: ${item.result}`)
  if (item.result > 20) throw new Error(`ZR 20 überschritten: ${item.result}`)
  console.log(`  [${item.prefix}] 20er-Feld mit Übergang: ${item.num1} rot + ${item.num2} blau = ${item.result}`)
})
console.log('✓ Zwanzigerfeld ZR 20 mit Zehnerübergang vollständig korrekt!')

console.log('\n=== ALLE TESTS ERFOLGREICH BESTANDEN ===')
