import { generateZahlenmauern } from '../lib/generators/zahlenmauerGenerator'

console.log('--- TEST: generateZahlenmauern ---')

// 1. 50 Durchläufe mit ZR 10
for (let i = 0; i < 50; i++) {
  const res10 = generateZahlenmauern(4, 10, 3)
  if (res10.items.length !== 4) {
    console.error('Fehler: Nicht 4 Items')
    process.exit(1)
  }

  for (const it of res10.items) {
    const { layers, rows, missing, solutions } = it
    if (rows !== 3 || layers.length !== 3) {
      console.error('Fehler in Reihenanzahl:', it)
      process.exit(1)
    }

    // Prüfe Summations-Konsistenz
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < layers[r].length - 1; c++) {
        if (layers[r + 1][c] !== layers[r][c] + layers[r][c + 1]) {
          console.error(`Fehlerhafte Addition bei Reihe ${r}, Spalte ${c}:`, it)
          process.exit(1)
        }
      }
    }

    // Prüfe Deckstein <= 10
    if (layers[2][0] > 10) {
      console.error('Deckstein > 10 bei ZR 10:', layers[2][0])
      process.exit(1)
    }

    if (!Array.isArray(missing) || missing.length === 0) {
      console.error('Missing leer:', it)
      process.exit(1)
    }
  }
}

console.log('50 Durchläufe ZR 10 erfolgreich!')

// 2. 50 Durchläufe mit ZR 20
for (let i = 0; i < 50; i++) {
  const res20 = generateZahlenmauern(4, 20, 3)
  for (const it of res20.items) {
    const { layers, rows } = it
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < layers[r].length - 1; c++) {
        if (layers[r + 1][c] !== layers[r][c] + layers[r][c + 1]) {
          console.error(`Fehlerhafte Addition:`, it)
          process.exit(1)
        }
      }
    }
    if (layers[2][0] > 20) {
      console.error('Deckstein > 20:', layers[2][0])
      process.exit(1)
    }
  }
}

console.log('50 Durchläufe ZR 20 erfolgreich!')
console.log('Alle Zahlenmauer-Tests bestanden!')
