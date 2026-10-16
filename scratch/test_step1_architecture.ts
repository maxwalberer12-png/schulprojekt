import {
  getTopicConfig,
  buildSectionsFromSelectedTypes,
  generateUniversalMathArbeitsblatt,
} from '../lib/generators/universalMathGenerator'

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`)
    process.exit(1)
  }
  console.log(`✅ PASSED: ${message}`)
}

console.log('--- TEST 1: getTopicConfig math bounds & defaults ---')
// Grade 1 ZR 10
const cfg1_10 = getTopicConfig(1, 'Zahlenraum bis 10: Zahlzerlegung & Verliebte Zahlen')
assert(cfg1_10.maxNumber === 10, 'Grade 1 ZR 10 maxNumber is 10')
assert(!cfg1_10.allowCarry, 'Grade 1 ZR 10 allowCarry is false')
assert(cfg1_10.defaultTaskTypes.length === 3, 'Grade 1 ZR 10 has 3 default task types')

// Grade 1 ZR 20
const cfg1_20 = getTopicConfig(1, 'Zahlenraum bis 20: Addition & Subtraktion mit Zehnerübergang')
assert(cfg1_20.maxNumber === 20, 'Grade 1 ZR 20 maxNumber is 20')
assert(cfg1_20.allowCarry === true, 'Grade 1 ZR 20 allowCarry is true')

// Grade 2 ZR 100
const cfg2 = getTopicConfig(2, 'Zahlenraum bis 100: Addition & Subtraktion')
assert(cfg2.maxNumber === 100, 'Grade 2 maxNumber is 100')
assert(cfg2.defaultTaskTypes.length === 3, 'Grade 2 has 3 default task types')

// Grade 3 ZR 1000
const cfg3 = getTopicConfig(3, 'Zahlenraum bis 1000: Schriftliche Addition & Subtraktion')
assert(cfg3.maxNumber === 1000, 'Grade 3 maxNumber is 1000')

// Grade 4 ZR 1000000
const cfg4 = getTopicConfig(4, 'Zahlenraum bis 1 Million: Runden & Große Zahlen')
assert(cfg4.maxNumber === 1000000, 'Grade 4 maxNumber is 1000000')

console.log('\n--- TEST 2: Arbitrary 3 chips in Grade 1 generate exactly 3 sections ---')
const testChipsGrade1 = ['schuettelboxen', 'zehnerstopp', 'groesser_kleiner_gleich']
const wsGrade1 = generateUniversalMathArbeitsblatt({
  grade: 1,
  thema: 'Zahlenraum bis 20',
  selectedTaskTypes: testChipsGrade1,
})
assert(wsGrade1.tasks.length === 3, 'Grade 1 generated exactly 3 tasks')
assert(wsGrade1.tasks[0].id === 1 && wsGrade1.tasks[0].type === 'schuettelboxen', 'Task 1 is schuettelboxen')
assert(wsGrade1.tasks[1].id === 2 && wsGrade1.tasks[1].type === 'zehnerstopp', 'Task 2 is zehnerstopp')
assert(wsGrade1.tasks[2].id === 3 && wsGrade1.tasks[2].type === 'groesser_kleiner_gleich', 'Task 3 is groesser_kleiner_gleich')

console.log('\n--- TEST 3: Arbitrary 3 chips in Grade 2 generate exactly 3 sections ---')
const testChipsGrade2 = ['hundertertafel', 'einmaleins', 'kopfrechnen']
const wsGrade2 = generateUniversalMathArbeitsblatt({
  grade: 2,
  thema: 'Zahlenraum bis 100',
  selectedTaskTypes: testChipsGrade2,
})
assert(wsGrade2.tasks.length === 3, 'Grade 2 generated exactly 3 tasks')
assert(wsGrade2.tasks[0].id === 1 && wsGrade2.tasks[0].type === 'hundertertafel', 'Task 1 is hundertertafel')
assert(wsGrade2.tasks[1].id === 2 && wsGrade2.tasks[1].type === 'einmaleins', 'Task 2 is einmaleins')
assert(wsGrade2.tasks[2].id === 3 && wsGrade2.tasks[2].type === 'kopfrechnen', 'Task 3 is kopfrechnen')

console.log('\n--- TEST 4: Dynamic scaling of Kopfrechnen across Grade 1, 2, 3, 4 ---')
// Grade 1 ZR 10 Kopfrechnen: numbers must not exceed 10
const wsKopf1 = generateUniversalMathArbeitsblatt({
  grade: 1,
  thema: 'Zahlenraum bis 10: Zahlzerlegung',
  selectedTaskTypes: ['kopfrechnen'],
})
const items1 = wsKopf1.tasks[0].items as string[]
console.log('Grade 1 Kopfrechnen items:', items1)
for (const it of items1) {
  const nums = it.match(/\d+/g)?.map(Number) || []
  for (const n of nums) {
    assert(n <= 10, `Grade 1 number ${n} <= 10`)
  }
}

// Grade 2 ZR 100 Kopfrechnen: numbers up to 100
const wsKopf2 = generateUniversalMathArbeitsblatt({
  grade: 2,
  thema: 'Zahlenraum bis 100: Rechnen',
  selectedTaskTypes: ['kopfrechnen'],
})
const items2 = wsKopf2.tasks[0].items as string[]
console.log('Grade 2 Kopfrechnen items:', items2)
assert(items2.some((it) => (it.match(/\d+/g)?.map(Number) || []).some((n) => n > 20)), 'Grade 2 has numbers > 20')

// Grade 3 ZR 1000 Kopfrechnen: numbers up to 1000
const wsKopf3 = generateUniversalMathArbeitsblatt({
  grade: 3,
  thema: 'Zahlenraum bis 1000',
  selectedTaskTypes: ['kopfrechnen'],
})
const items3 = wsKopf3.tasks[0].items as string[]
console.log('Grade 3 Kopfrechnen items:', items3)
assert(items3.some((it) => (it.match(/\d+/g)?.map(Number) || []).some((n) => n > 100)), 'Grade 3 has numbers > 100')

console.log('\n--- TEST 5: Special topic default preservation ---')
const wsGeldSpecial = generateUniversalMathArbeitsblatt({
  grade: 1,
  thema: 'Größen: Euro und Cent (bis 20 €)',
  selectedTaskTypes: [], // empty = use defaults of topic
})
assert(wsGeldSpecial.tasks.length === 3, 'Geld special has 3 default tasks')
assert(wsGeldSpecial.tasks[0].type === 'geld_zaehlen', 'Default task 1 is geld_zaehlen')
assert(wsGeldSpecial.tasks[1].type === 'geld_rechnen', 'Default task 2 is geld_rechnen')
assert(wsGeldSpecial.tasks[2].type === 'geld_vergleich', 'Default task 3 is geld_vergleich')

console.log('\nALL ARCHITECTURE TESTS PASSED SUCCESSFULLY! 🚀')
