async function testApi() {
  const payload = {
    toolId: 'aufgaben-differenziert',
    fach: 'Mathematik',
    klasse: 'Klasse 1',
    thema: 'Addition und Subtraktion bis 20',
    aufgabentypen: 'Rechendreiecke',
    selectedTaskTypes: ['Rechendreiecke'],
    tasksPerLevel: 3,
  }

  const res = await fetch('http://localhost:3000/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    console.error('API Error:', res.status, await res.text())
    process.exit(1)
  }

  const json = await res.json()
  console.log('Titel:', json.titel)
  console.log('Aufgabe:', json.tasks[0]?.title)
  console.log('Items Anzahl:', json.tasks[0]?.items?.length)
  console.log('Item 0:', JSON.stringify(json.tasks[0]?.items?.[0]))
  console.log('Solution 0:', json.tasks[0]?.solutionItems?.[0])
}

testApi()
