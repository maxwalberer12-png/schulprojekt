import {
  generateConsistentRechendreiecke,
  validateRechendreieckMissing,
  sanitizeRechendreieckMissing,
} from '../lib/rechendreiecke'

// 1. Test: Verbotene Kombinationen müssen ungültig sein
console.log('Test 1: Validator für verbotene Kombinationen')
if (validateRechendreieckMissing(['inner_0', 'outer_0', 'outer_2'])) {
  console.error('Fehler: inner_0 mit beiden anliegenden Rändern outer_0 und outer_2 durfte nicht valide sein!')
  process.exit(1)
}
if (validateRechendreieckMissing(['inner_1', 'outer_0', 'outer_1'])) {
  console.error('Fehler: inner_1 mit beiden anliegenden Rändern durfte nicht valide sein!')
  process.exit(1)
}
if (validateRechendreieckMissing(['inner_2', 'outer_1', 'outer_2'])) {
  console.error('Fehler: inner_2 mit beiden anliegenden Rändern durfte nicht valide sein!')
  process.exit(1)
}

// 2. Test: Erlaubte Muster müssen valide sein
console.log('Test 2: Erlaubte Muster')
if (!validateRechendreieckMissing(['outer_0', 'outer_1', 'outer_2'])) {
  console.error('Fehler: Muster 1 muss valide sein!')
  process.exit(1)
}
if (!validateRechendreieckMissing(['inner_2', 'outer_0', 'outer_2'])) {
  console.error('Fehler: Muster 2 mit inner_2 muss valide sein!')
  process.exit(1)
}

// 3. Test: Sanitizer
console.log('Test 3: Sanitizer')
const s1 = sanitizeRechendreieckMissing(['inner_0', 'outer_0', 'outer_2'])
if (!validateRechendreieckMissing(s1)) {
  console.error('Fehler: Sanitizer erzeugte ungültiges Muster!')
  process.exit(1)
}

// 4. Test: Generierung über 50 Durchläufe mit 5 Teilaufgaben (a bis e)
console.log('Test 4: 50 Durchläufe mit je 5 Teilaufgaben (a bis e)')
for (let run = 0; run < 50; run++) {
  const { items } = generateConsistentRechendreiecke(5, 20)
  if (items.length !== 5) {
    console.error('Fehler: Nicht exakt 5 Items erzeugt!')
    process.exit(1)
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (!validateRechendreieckMissing(item.missing)) {
      console.error(`Fehler bei Aufgabe ${item.prefix}: Ungültige Lücke:`, item.missing)
      process.exit(1)
    }

    const inners = item.missing.filter((m) => m.startsWith('inner_'))
    const outers = item.missing.filter((m) => m.startsWith('outer_'))

    if (inners.length === 0) {
      // Muster 1: alle 3 Ränder
      if (outers.length !== 3) {
        console.error(`Fehler bei Aufgabe ${item.prefix}: Muster 1 muss genau 3 Ränder haben:`, item.missing)
        process.exit(1)
      }
    } else if (inners.length === 1) {
      // Muster 2: genau 1 Ecke und genau 2 Ränder
      if (outers.length !== 2) {
        console.error(`Fehler bei Aufgabe ${item.prefix}: Muster 2 muss genau 2 Ränder haben:`, item.missing)
        process.exit(1)
      }
      // Rand muss an der fehlenden Ecke anliegen:
      if (inners[0] === 'inner_2') {
        // outer_1 muss VORGEGEBEN sein (nicht in missing)
        if (item.missing.includes('outer_1')) {
          console.error(`Fehler bei Aufgabe ${item.prefix}: outer_1 durfte bei inner_2 nicht in missing sein!`)
          process.exit(1)
        }
      }
    } else {
      console.error(`Fehler bei Aufgabe ${item.prefix}: Mehr als 1 Ecke fehlt:`, item.missing)
      process.exit(1)
    }
  }
}

console.log('Alle Tests für die Rechendreieck-Lückenlogik erfolgreich bestanden!')
