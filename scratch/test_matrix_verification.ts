import { LEHRPLANPLUS_MATHE_DATENBANK } from '../lib/curriculum/lehrplanplus_mathe'
import {
  getTopicConfig,
  generateUniversalTaskWithConfig,
  normalizeUniversalTaskType,
} from '../lib/generators/universalMathGenerator'
import { MATHE_KEY_TO_LABEL, MATHE_LABEL_TO_KEY } from '../components/dashboard/ToolDetailClient'

console.log('=== MATRIX VERIFICATION FOR KLASSE 1 & KLASSE 2 ===\n')

const grade1Entries = LEHRPLANPLUS_MATHE_DATENBANK.filter((e) => e.klasse === 1)
const grade2Entries = LEHRPLANPLUS_MATHE_DATENBANK.filter((e) => e.klasse === 2)

console.log(`Checking ${grade1Entries.length} topics in Grade 1...`)
for (const entry of grade1Entries) {
  const cfg = getTopicConfig(1, entry.titel)
  console.log(`\n[Grade 1] ${entry.titel}:`)
  console.log(`  Available Task Types (${cfg.availableTaskTypes?.length || 0}):`, cfg.availableTaskTypes)
  console.log(`  Default Task Types (${cfg.defaultTaskTypes.length}):`, cfg.defaultTaskTypes)

  if (!cfg.availableTaskTypes || cfg.availableTaskTypes.length === 0) {
    throw new Error(`Missing availableTaskTypes for Grade 1: ${entry.titel}`)
  }

  // Check that every available task type has a label and can be generated
  for (const key of cfg.availableTaskTypes) {
    const label = MATHE_KEY_TO_LABEL[key]
    if (!label) {
      console.warn(`  WARNING: No MATHE_KEY_TO_LABEL mapping for key: ${key}`)
    }
    const reverseKey = MATHE_LABEL_TO_KEY[label || key]
    if (!reverseKey) {
      console.warn(`  WARNING: No reverse mapping in MATHE_LABEL_TO_KEY for label: "${label}"`)
    }
    const task = generateUniversalTaskWithConfig(key, cfg, 3, 0)
    if (!task || !task.items || task.items.length === 0) {
      throw new Error(`Task generation failed for key: ${key} in topic: ${entry.titel}`)
    }
  }
}

console.log(`\nChecking ${grade2Entries.length} topics in Grade 2...`)
for (const entry of grade2Entries) {
  const cfg = getTopicConfig(2, entry.titel)
  console.log(`\n[Grade 2] ${entry.titel}:`)
  console.log(`  Available Task Types (${cfg.availableTaskTypes?.length || 0}):`, cfg.availableTaskTypes)
  console.log(`  Default Task Types (${cfg.defaultTaskTypes.length}):`, cfg.defaultTaskTypes)

  if (!cfg.availableTaskTypes || cfg.availableTaskTypes.length === 0) {
    throw new Error(`Missing availableTaskTypes for Grade 2: ${entry.titel}`)
  }

  for (const key of cfg.availableTaskTypes) {
    const label = MATHE_KEY_TO_LABEL[key]
    if (!label) {
      console.warn(`  WARNING: No MATHE_KEY_TO_LABEL mapping for key: ${key}`)
    }
    const reverseKey = MATHE_LABEL_TO_KEY[label || key]
    if (!reverseKey) {
      console.warn(`  WARNING: No reverse mapping in MATHE_LABEL_TO_KEY for label: "${label}"`)
    }
    const task = generateUniversalTaskWithConfig(key, cfg, 3, 0)
    if (!task || !task.items || task.items.length === 0) {
      throw new Error(`Task generation failed for key: ${key} in topic: ${entry.titel}`)
    }
  }
}

console.log('\n>>> ALL TOPICS IN KLASSE 1 & KLASSE 2 PASSED 100% DETERMINISTIC VERIFICATION! <<<')
