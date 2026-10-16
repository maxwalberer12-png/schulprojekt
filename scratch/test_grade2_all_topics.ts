import { getTopicConfig, generateUniversalMathArbeitsblatt } from '../lib/generators/universalMathGenerator'
import { LEHRPLANPLUS_MATHE_DATENBANK } from '../lib/curriculum/lehrplanplus_mathe'
import { MATHE_KEY_TO_LABEL } from '../components/dashboard/ToolDetailClient'

console.log('=== TEST 1: ALL TOPICS IN GRADE 2 HAVE CORRECT CHIPS ===')

const k2Topics = LEHRPLANPLUS_MATHE_DATENBANK.filter((e) => e.klasse === 2)
console.log(`Found ${k2Topics.length} topics for Grade 2 in curriculum database.\n`)

for (const entry of k2Topics) {
  const config = getTopicConfig(2, entry.titel)
  const chips = (config.availableTaskTypes || []).map((k) => MATHE_KEY_TO_LABEL[k] || k)
  console.log(`Topic: "${entry.titel}"`)
  console.log(`  -> Available chips (${chips.length}):`, chips.join(' | '))
  console.log(`  -> Default chips (${config.defaultTaskTypes.length}):`, config.defaultTaskTypes.map((k) => MATHE_KEY_TO_LABEL[k] || k).join(' | '))
  
  // Verify that Hundertertafel is NOT in chips unless the topic is Topic 1 (Orientierung / Hunderterfeld)
  const hasHundertertafel = config.availableTaskTypes?.includes('hundertertafel')
  const isTopic1 = /hunderterfeld|zehner.*einer|hundertertafel/i.test(entry.titel)
  if (hasHundertertafel && !isTopic1) {
    console.error(`  FAIL: "${entry.titel}" contains hundertertafel unexpectedly!`)
    process.exit(1)
  }
}

console.log('\n=== TEST 2: WORKSHEET RENDERS STRICTLY SELECTED CHIPS ===')

for (const entry of k2Topics) {
  const config = getTopicConfig(2, entry.titel)
  const chips = (config.availableTaskTypes || []).map((k) => MATHE_KEY_TO_LABEL[k] || k)

  // Pick each individual chip alone and check the resulting worksheet
  for (const chip of chips) {
    const ws = generateUniversalMathArbeitsblatt({
      grade: 2,
      thema: entry.titel,
      selectedTaskTypes: [chip],
      tasksPerLevel: 3,
    })

    if (ws.tasks.length !== 1) {
      console.error(`  FAIL: Expected 1 task for single chip "${chip}" in "${entry.titel}", got ${ws.tasks.length}`)
      process.exit(1)
    }

    const task = ws.tasks[0]
    const isTopic1 = /hunderterfeld|zehner.*einer|hundertertafel/i.test(entry.titel)
    if (task.type === 'hundertertafel' && !chip.includes('Hundertertafel')) {
      console.error(`  FAIL: Fell back to hundertertafel for chip "${chip}" in "${entry.titel}"!`)
      process.exit(1)
    }

    if (!task.items || task.items.length === 0) {
      console.error(`  FAIL: Task has no items for chip "${chip}" in "${entry.titel}"!`)
      process.exit(1)
    }
  }

  // Pick all available chips together
  const wsFull = generateUniversalMathArbeitsblatt({
    grade: 2,
    thema: entry.titel,
    selectedTaskTypes: chips,
    tasksPerLevel: 3,
  })

  if (wsFull.tasks.length !== chips.length) {
    console.error(`  FAIL: Expected ${chips.length} tasks for all chips in "${entry.titel}", got ${wsFull.tasks.length}`)
    process.exit(1)
  }

  console.log(`  ✓ OK: "${entry.titel}" correctly generated all ${chips.length} task sections!`)
}

console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===')
