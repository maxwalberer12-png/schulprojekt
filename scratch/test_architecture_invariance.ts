import { generateUniversalMathArbeitsblatt } from '../lib/generators/universalMathGenerator'

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`)
  }
}

console.log('=== TEST 1: Genau 1 ausgewählter Chip ===')
const ws1 = generateUniversalMathArbeitsblatt({
  grade: 2,
  thema: 'Zahlenraum bis 100: Hundertertafel & Zahlenmuster',
  selectedTaskTypes: ['Hundertertafel & Zahlenrätsel'],
  taskCounts: { 'Hundertertafel & Zahlenrätsel': 2 },
})
assert(ws1.tasks.length === 1, `Erwartet 1 Task, aber ${ws1.tasks.length} erhalten`)
assert(ws1.tasks[0].type === 'hundertertafel', `Erwartet hundertertafel, erhalten ${ws1.tasks[0].type}`)
assert(ws1.tasks[0].items?.length === 2, `Erwartet 2 Items, erhalten ${ws1.tasks[0].items?.length}`)
console.log('Test 1 erfolgreich! Task-Länge:', ws1.tasks.length, 'Item-Länge:', ws1.tasks[0].items?.length)

console.log('=== TEST 2: Genau 2 ausgewählte Chips mit unterschiedlichen Counts ===')
const ws2 = generateUniversalMathArbeitsblatt({
  grade: 1,
  thema: 'Zahlenraum bis 20: Addition & Subtraktion mit Zehnerübergang',
  selectedTaskTypes: ['Rechendreiecke', 'Zahlenmauern'],
  taskCounts: { 'Rechendreiecke': 1, 'Zahlenmauern': 4 },
})
assert(ws2.tasks.length === 2, `Erwartet 2 Tasks, aber ${ws2.tasks.length} erhalten`)
assert(ws2.tasks[0].type === 'rechendreiecke', `Task 1 Typ mismatch`)
assert(ws2.tasks[0].items?.length === 1, `Task 1 count mismatch`)
assert(ws2.tasks[1].type === 'zahlenmauern', `Task 2 Typ mismatch`)
assert(ws2.tasks[1].items?.length === 4, `Task 2 count mismatch`)
console.log('Test 2 erfolgreich! Reihenfolge und Counts stimmen exakt überein.')

console.log('=== TEST 3: 5 ausgewählte Chips in Klasse 4 (Größen & Messen) ===')
const ws3 = generateUniversalMathArbeitsblatt({
  grade: 4,
  thema: 'Größen: Längen & Kommaschreibweise (km, m, cm, mm)',
  selectedTaskTypes: [
    'Kommaschreibweise bei Längen (2,35 m = 2 m 35 cm)',
    'Große Längeneinheiten umrechnen (km, m, dm, cm, mm)',
    'Rechnen mit Längen in Kommaschreibweise',
    'Text-/Sachaufgaben zu Längen',
    'Schriftliche Addition',
  ],
  taskCounts: {
    'Kommaschreibweise bei Längen (2,35 m = 2 m 35 cm)': 3,
    'Große Längeneinheiten umrechnen (km, m, dm, cm, mm)': 2,
    'Rechnen mit Längen in Kommaschreibweise': 4,
    'Text-/Sachaufgaben zu Längen': 1,
    'Schriftliche Addition': 5,
  },
})
assert(ws3.tasks.length === 5, `Erwartet 5 Tasks, aber ${ws3.tasks.length} erhalten`)
assert(ws3.tasks.map(t => t.id).join(',') === '1,2,3,4,5', 'Ids müssen 1 bis 5 sein')
console.log('Test 3 erfolgreich! Alle 5 Abschnitte vorhanden.')

console.log('=== TEST 4: Umgekehrte Reihenfolge der Chips ===')
const ws4 = generateUniversalMathArbeitsblatt({
  grade: 3,
  thema: 'Halbschriftliche Multiplikation & Division',
  selectedTaskTypes: ['Halbschriftliche Division', 'Zehner-Einmaleins (4 · 60)'],
})
assert(ws4.tasks.length === 2, `Erwartet 2 Tasks`)
assert(ws4.tasks[0].type === 'halbschriftlich_division', 'Task 1 muss halbschriftlich_division sein')
assert(ws4.tasks[1].type === 'zehner_einmaleins', 'Task 2 muss zehner_einmaleins sein')
console.log('Test 4 erfolgreich! Reihenfolge entspricht 100% der UI-Auswahl.')

console.log('\n>>> ALLE INVARIANZ-TESTS BESTANDEN! <<<')
