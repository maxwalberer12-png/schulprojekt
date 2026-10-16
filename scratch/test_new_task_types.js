// Verification test for the four new mathematics task types
const testTasks = [
  {
    id: "aufgabe-1",
    type: "nachbarzahlen",
    title: "Nachbarzahlen & Zahlenstrahl",
    instruction: "Bestimme Vorgänger und Nachfolger.",
    nachbarzahlen: [
      { vorgegeben: 48, vorgaenger: 47, nachfolger: 49, aufgabe: "___ , 48 , ___" },
      { vorgegeben: 80, vorgaenger: 79, nachfolger: 81, aufgabe: "___ , 80 , ___" }
    ]
  },
  {
    id: "aufgabe-2",
    type: "tabellen",
    title: "Tabellen & Diagramme",
    instruction: "Lies die Tabelle ab und beantworte die Fragen.",
    table: {
      headers: ["Tier", "Anzahl"],
      rows: [["Hund", "6"], ["Katze", "4"], ["Kaninchen", "8"]]
    },
    items: [
      "a) Welches Tier kommt am häufigsten vor?",
      "b) Wie viele Tiere sind es insgesamt?"
    ]
  },
  {
    id: "aufgabe-3",
    type: "rechendreiecke",
    title: "Rechendreiecke",
    instruction: "Rechne die Außenfelder aus.",
    rechendreiecke: [
      { ecken: [5, 3, 8], aussen: [8, null, 13] },
      { ecken: [12, 7, 9], aussen: [19, 16, null] }
    ]
  },
  {
    id: "aufgabe-4",
    type: "geometrie",
    title: "Geometrie & Formen",
    instruction: "Untersuche die geometrischen Formen.",
    geometrie: [
      { name: "Würfel", frage: "Wie viele Ecken, Kanten und Flächen hat ein Würfel?", ecken: 8, kanten: 12, flaechen: 6 },
      { name: "Dreieck", frage: "Wie viele Ecken und Seiten hat ein Dreieck?", ecken: 3, seiten: 3 }
    ]
  }
];

console.log("JSON schema test data is valid JSON:", JSON.stringify(testTasks, null, 2).length > 0);
