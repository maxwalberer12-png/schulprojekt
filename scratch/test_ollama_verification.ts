import { getCurriculumGuidelines } from '../lib/curriculum/lehrplanplus'

async function runTest() {
  const fach = 'Mathematik'
  const klasse = '2. Klasse'
  const thema = 'dividieren und einfaches einmal eins'
  const selectedTaskTypes = ['Kopfrechnen', 'Zahlenmauern']

  const curriculumRules = getCurriculumGuidelines(fach, klasse)
  const taskTypesListStr = selectedTaskTypes.join(', ')
  const taskCount = selectedTaskTypes.length

  const effectiveSystemPrompt =
    'Du bist ein erfahrener Grundschullehrer und Didaktik-Experte für Grundschul-Arbeitsblätter.\n\n' +
    `STRIKTE VORGABE: Das Arbeitsblatt ist für Klasse ${klasse}. Halte dich strikt an den bayerischen LehrplanPLUS: ${curriculumRules}.\n` +
    `Erstelle AUSSCHLIESSLICH Aufgaben für folgende ausgewählte Aufgabentypen: ${taskTypesListStr}.\n` +
    'Ignoriere alle anderen Aufgabentypen vollständig!\n' +
    'Erzeuge keine Lösungen auf dem Schülerblatt.\n\n' +
    `ANZAHL DER AUFGABENBLÖCKE: Erstelle EXAKT ${taskCount} Aufgabenblöcke im Array "tasks" – genau eine Aufgabe pro ausgewähltem Aufgabentyp!\n` +
    `Da 2 Chips aktiv sind (${taskTypesListStr}), MÜSSEN im Array "tasks" EXAKT 2 Aufgaben-Objekte existieren: 1. Kopfrechnen und 2. Zahlenmauern!\n\n` +
    'ANTWORTFORMAT:\n' +
    'Antworte im JSON-Format mit einem Objekt, das ein Array "tasks" enthält:\n' +
    '{\n' +
    '  "tasks": [\n' +
    '    {\n' +
    '      "id": "aufgabe-1",\n' +
    '      "type": "kopfrechnen",\n' +
    '      "title": "Kopfrechnen",\n' +
    '      "instruction": "Rechne im Kopf und trage das Ergebnis ein.",\n' +
    '      "items": [\n' +
    '        "a) 12 : 3 = ____",\n' +
    '        "b) 20 : 5 = ____"\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "id": "aufgabe-2",\n' +
    '      "type": "zahlenmauern",\n' +
    '      "title": "Zahlenmauern",\n' +
    '      "instruction": "Ergänze die fehlenden Zahlen in den Zahlenmauern.",\n' +
    '      "items": [\n' +
    '        "a) Basis: 3, 2, 4",\n' +
    '        "b) Basis: 5, 1, 2"\n' +
    '      ]\n' +
    '    }\n' +
    '  ]\n' +
    '}'

  const prompt =
    `Erstelle das Arbeitsblatt für:\n` +
    `Fach: ${fach}\n` +
    `Jahrgangsstufe: ${klasse}\n` +
    `Thema: ${thema}\n` +
    `Ausgewählte Aufgabentypen (${taskCount}): ${taskTypesListStr}\n\n` +
    `Erstelle EXAKT ${taskCount} Aufgaben-Objekte im "tasks"-Array (1. Kopfrechnen, 2. Zahlenmauern). Keine weiteren Aufgaben!`

  const ollamaRes = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen2.5:14b',
      messages: [
        { role: 'system', content: effectiveSystemPrompt },
        { role: 'user', content: prompt },
      ],
      stream: false,
      format: 'json',
      options: {
        temperature: 0.2,
      },
    }),
  })

  const data = await ollamaRes.json()
  const content = data.message?.content
  console.log('\nOllama output:\n', content)

  const parsed = JSON.parse(content)
  const tasksArray = Array.isArray(parsed) ? parsed : parsed.tasks || []
  console.log('\n--- VERIFIKATION ---')
  console.log('Anzahl Aufgabenblöcke:', tasksArray.length, '(Erwartet: 2)')
  tasksArray.forEach((t: any, i: number) => {
    console.log(`Aufgabe ${i + 1}: ${t.title} (${t.type}) -> Items:`, t.items)
  })
}

runTest()
