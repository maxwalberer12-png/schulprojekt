import { generateUniversalMathArbeitsblatt } from '../lib/generators/universalMathGenerator'

const result = generateUniversalMathArbeitsblatt({
  grade: 1,
  thema: 'Zahlenraum bis 10: Zahlzerlegung & Verliebte Zahlen',
  selectedTaskTypes: [
    'Zwanzigerfeld / Punktefeld',
    'Schüttelboxen (Zahlzerlegung)',
    'Zehnerstopp (Rechnen in 2 Schritten)',
  ],
  tasksPerLevel: 3,
  taskCounts: {
    'Zwanzigerfeld / Punktefeld': 1,
    'Schüttelboxen (Zahlzerlegung)': 5,
    'Zehnerstopp (Rechnen in 2 Schritten)': 2,
  },
})

console.log('Titel:', result.titel)
console.log('Anzahl Sektionen:', result.tasks.length)

result.tasks.forEach((task, idx) => {
  console.log(`Task ${idx + 1} (${task.type} - "${task.title}"): ${task.items.length} Items`)
})

const test2 = generateUniversalMathArbeitsblatt({
  grade: 1,
  thema: 'Zahlenraum bis 20: Addition & Subtraktion',
  selectedTaskTypes: [
    'Zahlenmauern',
    'Rechendreiecke',
    'Rechenhäuser',
    'Kopfrechnen / Grundrechenarten',
    'Wochentage',
  ],
  tasksPerLevel: 3,
  taskCounts: {
    'Zahlenmauern': 4,
    'Rechendreiecke': 2,
    'Rechenhäuser': 1,
    'Kopfrechnen / Grundrechenarten': 5,
    'Wochentage': 3,
  },
})

test2.tasks.forEach((task, idx) => {
  console.log(`Test 2 - Task ${idx + 1} (${task.type}): ${task.items.length} Items`)
})

const counts2 = test2.tasks.map((t) => t.items.length)
if (counts2[0] === 4 && counts2[1] === 2 && counts2[2] === 1 && counts2[3] === 5 && counts2[4] === 3) {
  console.log('SUCCESS: Test 2 (4, 2, 1, 5, 3) passed perfectly!')
} else {
  console.error('FAILURE: Unexpected counts2:', counts2)
  process.exit(1)
}
