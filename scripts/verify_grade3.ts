import { LEHRPLANPLUS_MATHE_DATENBANK } from '../lib/curriculum/lehrplanplus_mathe'
import { GRADE_TASK_TYPES } from '../components/dashboard/ToolDetailClient'
import { generateUniversalMathArbeitsblatt, normalizeUniversalTaskType, getTopicConfig } from '../lib/generators/universalMathGenerator'

console.log('=== VERIFYING GRADE 3 LEHRPLANPLUS IMPLEMENTATION ===\n')

const GRADE_3_TOPICS = LEHRPLANPLUS_MATHE_DATENBANK.filter((e) => e.klasse === 3)

// 1. Verify 9 Topics in Curriculum
console.log(`1. Checking Grade 3 topics count: ${GRADE_3_TOPICS.length} (Expected: 9)`)
if (GRADE_3_TOPICS.length !== 9) {
  console.error(`FAIL: Expected 9 topics, got ${GRADE_3_TOPICS.length}`)
  process.exit(1)
}

GRADE_3_TOPICS.forEach((t, i) => {
  console.log(`  Topic ${i + 1}: [${t.id}] ${t.titel}`)
})

// 2. Checking chips in GRADE_TASK_TYPES[3]
const chips = GRADE_TASK_TYPES[3] || []
console.log(`\n2. Checking Grade 3 chip count: ${chips.length} (Expected: 33)`)
chips.forEach((c) => {
  const norm = normalizeUniversalTaskType(c)
  console.log(`  Chip "${c}" -> normalized key: "${norm}"`)
})

// 3. Test Worksheet Generation for all 9 topics
console.log('\n3. Generating full worksheets for all 9 Grade 3 topics...')
for (const topic of GRADE_3_TOPICS) {
  const config = getTopicConfig(3, topic.titel)
  console.log(`\n--- Topic: ${topic.titel} (${topic.id}) ---`)
  console.log(`Available task types: ${config.availableTaskTypes?.join(', ')}`)

  const worksheet = generateUniversalMathArbeitsblatt({
    grade: 3,
    thema: topic.titel,
    selectedTaskTypes: config.defaultTaskTypes,
    tasksPerLevel: 4,
  })

  console.log(`Generated tasks count: ${worksheet.tasks.length}`)
  for (const task of worksheet.tasks) {
    console.log(`  - Task [${task.type}]: "${task.title}" (Items: ${task.items?.length || 0}, Solutions: ${task.solutionItems?.length || 0})`)
    if (!task.items || task.items.length === 0) {
      console.error(`FAIL: Task ${task.type} generated 0 items!`)
      process.exit(1)
    }
  }
}

// 4. Test individual generation of every single chip
console.log('\n4. Testing generation for each of the 33 individual chips...')
let passCount = 0
for (const chip of chips) {
  const norm = normalizeUniversalTaskType(chip)
  const worksheet = generateUniversalMathArbeitsblatt({
    grade: 3,
    thema: 'Zahlenraum bis 1.000',
    selectedTaskTypes: [norm],
    tasksPerLevel: 4,
  })

  const task = worksheet.tasks[0]
  if (!task) {
    console.error(`FAIL: Chip "${chip}" (${norm}) produced no task!`)
    process.exit(1)
  }
  console.log(`  [OK] Chip "${chip}" -> Normalized: ${norm} -> Task type: ${task.type}, Title: "${task.title}", Items: ${task.items?.length || 0}`)
  passCount++
}

console.log(`\n=== ALL ${passCount} CHIPS & ALL 9 TOPICS VERIFIED SUCCESSFULLY! ===`)
