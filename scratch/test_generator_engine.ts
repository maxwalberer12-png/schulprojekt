import { generateRechendreiecke } from '../lib/generators/rechendreieckGenerator'

console.log('--- TEST 1: ZR 10 ohne Zehnerübergang ---')
const res10 = generateRechendreiecke(5, 10, false)
if (res10.items.length !== 5) {
  console.error('Fehler: Nicht 5 Items erzeugt')
  process.exit(1)
}

for (const it of res10.items) {
  const [A, B, C] = it.inner
  const [rAB, rBC, rCA] = it.outer
  if (rAB !== A + B || rBC !== B + C || rCA !== C + A) {
    console.error('Fehler in Summenberechnung:', it)
    process.exit(1)
  }
  if (rAB > 10 || rBC > 10 || rCA > 10) {
    console.error('Fehler: Summe > 10 bei ZR 10:', it)
    process.exit(1)
  }
  if (!it.solutions || it.solutions.inner[0] !== A || it.solutions.outer[0] !== rAB) {
    console.error('Fehler in solutions-Objekt:', it)
    process.exit(1)
  }
  if (!Array.isArray(it.missing) || it.missing.length === 0) {
    console.error('Fehler: missing ist leer:', it)
    process.exit(1)
  }
}
console.log('ZR 10 Test bestanden!')

console.log('--- TEST 2: ZR 20 mit Zehnerübergang (100 Iterationen) ---')
for (let run = 0; run < 100; run++) {
  const res20 = generateRechendreiecke(5, 20, true)
  for (const it of res20.items) {
    const [A, B, C] = it.inner
    const [rAB, rBC, rCA] = it.outer
    if (rAB !== A + B || rBC !== B + C || rCA !== C + A) {
      console.error('Fehler:', it)
      process.exit(1)
    }
    if (rAB > 20 || rBC > 20 || rCA > 20) {
      console.error('Summe > 20:', it)
      process.exit(1)
    }
  }
}
console.log('100 Iterationen ZR 20 erfolgreich!')
