import { generateConsistentRechendreiecke } from '../lib/rechendreiecke'

for (let r = 0; r < 50; r++) {
  const { items } = generateConsistentRechendreiecke(4, 20)
  for (const item of items) {
    const [a, b, c] = item.inner
    const [o0, o1, o2] = item.outer
    if (a === b || b === c || c === a) {
      console.error('Doppelte Ecke gefunden:', item.inner)
      process.exit(1)
    }
    if (o0 < a || o0 < b || o1 < b || o1 < c || o2 < c || o2 < a) {
      console.error('Rand < Ecke:', item)
      process.exit(1)
    }
  }
}
console.log('50 Runs erfolgreich: Alle 200 Rechendreiecke haben unterschiedliche Ecken und Rand >= Ecke!')
