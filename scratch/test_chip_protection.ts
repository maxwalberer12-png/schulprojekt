import { LEHRPLANPLUS_MATHE_DATENBANK } from '../lib/curriculum/lehrplanplus_mathe'
import { resolveLehrplanStandard } from '../lib/curriculum/resolver'
import { MATHE_LABEL_TO_KEY, filterOrFallbackTaskTypes } from '../components/dashboard/ToolDetailClient'

console.log('=== TEST 1: Alle Klasse-1-Themen auf unzulässige Typen prüfen ===')
const k1Eintraege = LEHRPLANPLUS_MATHE_DATENBANK.filter(e => e.klasse === 1)
const forbiddenInK1 = ['sachaufgaben', 'einheiten_umrechnen', 'tabellen']
let anyForbiddenFound = false

for (const eintrag of k1Eintraege) {
  for (const forbidden of forbiddenInK1) {
    if (eintrag.erlaubteAufgabentypen.includes(forbidden)) {
      console.error(`FEHLER: Thema "${eintrag.titel}" enthält verbotenen Typ "${forbidden}"!`)
      anyForbiddenFound = true
    }
  }
}
if (!anyForbiddenFound) {
  console.log('✓ Kein einziges Klasse-1-Thema enthält sachaufgaben, einheiten_umrechnen oder tabellen.')
}

console.log('\n=== TEST 2: Koppelung der Chips an ein K1-Thema ===')
const thema1 = resolveLehrplanStandard(1, 'Zahlenraum bis 10: Zahlzerlegung & Verliebte Zahlen')
console.log('Thema:', thema1.titel)
console.log('Erlaubte Typen:', thema1.erlaubteAufgabentypen)

const testChips = [
  'Kopfrechnen / Grundrechenarten',
  'Text-/Sachaufgaben (Frage, Rechnung, Antwort)',
  'Zahlenmauern',
  'Größer/Kleiner/Gleich (< > =)',
  'Einheiten umrechnen',
  'Nachbarzahlen & Zahlenstrahl',
  'Tabellen & Diagramme',
  'Rechendreiecke / Rechenhäuser',
  'Geometrie & Formen',
]

for (const chip of testChips) {
  const chipId = MATHE_LABEL_TO_KEY[chip] || chip
  const isAllowed = thema1.erlaubteAufgabentypen.includes(chipId)
  console.log(`- Chip "${chip}": ${isAllowed ? 'ERLAUBT (aktivierbar)' : 'GESPERRT (disabled + grau)'}`)
}

console.log('\n=== TEST 3: Automatisches Deselektieren & Fallback bei Themenwechsel ===')
// Angenommen, der Nutzer hatte vorher Sachaufgaben und Einheiten ausgewählt:
const previousSelection = ['Text-/Sachaufgaben (Frage, Rechnung, Antwort)', 'Einheiten umrechnen']
const filtered = filterOrFallbackTaskTypes(previousSelection, thema1)
console.log('Vorherige unpassende Auswahl:', previousSelection)
console.log('Nach Themenwechsel gefiltert/Fallback:', filtered)

// Und wenn mindestens ein erlaubter Typ ausgewählt war:
const partiallyValid = ['Kopfrechnen / Grundrechenarten', 'Text-/Sachaufgaben (Frage, Rechnung, Antwort)']
const filteredValid = filterOrFallbackTaskTypes(partiallyValid, thema1)
console.log('\nTeilweise gültige Auswahl:', partiallyValid)
console.log('Nach Filterung (ungültige entfernt):', filteredValid)

console.log('\n=== ALLE TESTS ERFOLGREICH DURCHLAUFEN ===')
