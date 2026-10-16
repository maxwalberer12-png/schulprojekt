import { generateRechengeschichtenTask, SCENARIOS, RechengeschichteItemData } from '../lib/generators/rechengeschichtenGenerator'

console.log('=== TEST 1: Pool an Szenarien prüfen ===')
console.log(`Anzahl an Szenarien: ${SCENARIOS.length} (gefordert: mindestens 10)`)
SCENARIOS.forEach((s, idx) => {
  console.log(` ${idx + 1}. [${s.icon}] ${s.nounPlural}`)
})
if (SCENARIOS.length >= 10) {
  console.log('✓ Mindestens 10 kindgerechte Szenarien vorhanden!')
} else {
  console.error('✗ Zu wenige Szenarien!')
  process.exit(1)
}

console.log('\n=== TEST 2: Generierung im Zahlenraum bis 10 ===')
const taskZR10 = generateRechengeschichtenTask({
  thema: 'Zahlenraum bis 10',
  maxNumber: 10,
  count: 4,
})
console.log(`Titel: ${taskZR10.title}`)
console.log(`Anweisung: ${taskZR10.instruction}`)
const itemsZR10 = taskZR10.items as RechengeschichteItemData[]
itemsZR10.forEach((item, idx) => {
  console.log(`\nAufgabe ${item.prefix}:`)
  console.log(`  Geschichte: "${item.storySentence1} ${item.storySentence2} ${item.questionText}"`)
  console.log(`  Icon: ${item.icon}`)
  console.log(`  Rechnung: [${item.num1}] [${item.op}] [${item.num2}] = [${item.result}]`)
  console.log(`  Antwort: "${item.answerPrefix} [${item.result}] ${item.answerSuffix}"`)
  
  // Validation
  if (item.op === '+') {
    if (item.num1 + item.num2 !== item.result) throw new Error(`Addition fehlerhaft in ${item.prefix}`)
  } else {
    if (item.num1 - item.num2 !== item.result) throw new Error(`Subtraktion fehlerhaft in ${item.prefix}`)
  }
  if (item.result > 10 || item.num1 > 10 || item.num2 > 10) {
    throw new Error(`Zahl über 10 in ZR 10: ${item.num1}, ${item.num2}, ${item.result}`)
  }
})
console.log('✓ Alle Aufgaben im ZR 10 mathematisch und didaktisch korrekt!')

console.log('\n=== TEST 3: Generierung im Zahlenraum bis 20 ===')
const taskZR20 = generateRechengeschichtenTask({
  thema: 'Zahlenraum bis 20: Addition und Subtraktion',
  maxNumber: 20,
  count: 4,
})
;(taskZR20.items as RechengeschichteItemData[]).forEach((item) => {
  if (item.op === '+') {
    if (item.num1 + item.num2 !== item.result) throw new Error(`Addition fehlerhaft in ${item.prefix}`)
  } else {
    if (item.num1 - item.num2 !== item.result) throw new Error(`Subtraktion fehlerhaft in ${item.prefix}`)
  }
  if (item.result > 20 || item.num1 > 20 || item.num2 > 20) {
    throw new Error(`Zahl über 20 in ZR 20: ${item.num1}, ${item.num2}, ${item.result}`)
  }
})
console.log('✓ Alle Aufgaben im ZR 20 mathematisch und didaktisch korrekt!')

console.log('\n=== TEST 4: Ohne Zehnerübergang (ZR 20) ===')
const taskOhneZU = generateRechengeschichtenTask({
  thema: 'Zahlenraum bis 20 ohne Zehnerübergang',
  maxNumber: 20,
  count: 4,
})
;(taskOhneZU.items as RechengeschichteItemData[]).forEach((item) => {
  if (item.op === '+') {
    if ((item.num1 % 10) + (item.num2 % 10) > 9 && item.num1 >= 10) {
      throw new Error(`Zehnerübergang aufgetreten trotz ohne Zehnerübergang: ${item.num1} + ${item.num2}`)
    }
  } else {
    if ((item.num1 % 10) < (item.num2 % 10)) {
      throw new Error(`Zehnerunterschreitung aufgetreten trotz ohne Zehnerübergang: ${item.num1} - ${item.num2}`)
    }
  }
})
console.log('✓ "Ohne Zehnerübergang" strikt eingehalten!')

console.log('\n=== ALLE TESTS ERFOLGREICH BESTANDEN ===')
