async function testOllamaRechendreiecke() {
  const prompt = `Erstelle ein Arbeitsblatt für Klasse 1, Fach Mathematik, Thema "Zahlenraum bis 10: Zahlzerlegung & Verliebte Zahlen", Aufgabentyp: Rechendreiecke.`
  const systemPrompt = `Du bist ein Grundschullehrer. Erstelle ein Arbeitsblatt im JSON-Format mit tasks:
{
  "titel": "Rechendreiecke bis 10",
  "tasks": [
    {
      "id": 1,
      "type": "rechendreiecke",
      "title": "Rechendreiecke",
      "instruction": "Rechne die Innen- und Außenzahlen aus.",
      "items": [
        {
          "inner": [3, 4, 2],
          "outer": [7, 6, 5],
          "missing": ["outer_0", "inner_2"]
        }
      ]
    }
  ]
}
Regel Klasse 1: Summen maximal 10 bzw. 20. Antworte nur in JSON.`

  try {
    const res = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:14b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        stream: false,
        format: 'json',
        options: { temperature: 0.2 }
      })
    })

    const data = await res.json()
    console.log('Ollama Response Content:\n', data.message?.content)
  } catch (e) {
    console.error('Ollama Test Fehler:', e)
  }
}

testOllamaRechendreiecke()
