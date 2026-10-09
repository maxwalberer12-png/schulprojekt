/**
 * PII-Filter – Maskiert personenbezogene Daten (Schülernamen) vor der LLM-Übermittlung.
 *
 * DSGVO-Anforderung: Kein Klarname darf das Backend verlassen.
 *
 * Strategie:
 *  1. Einfache Eigennamen-Heuristik (Wort mit Großbuchstabe, nicht am Satzanfang)
 *  2. Typische deutschsprachige Vornamen-Blocklist
 *  3. Ersetzt erkannte Namen durch "Kind" / "der Schüler" / "die Schülerin"
 */

// Häufige deutsche Vornamen (Grundschul-relevant, erweiterbar)
const KNOWN_FIRST_NAMES = new Set([
  'emma', 'mia', 'hannah', 'sofia', 'lena', 'lea', 'julia', 'anna', 'lina', 'marie',
  'lara', 'lisa', 'nora', 'sarah', 'laura', 'katharina', 'klara', 'nina', 'amelie',
  'charlotte', 'franziska', 'luisa', 'paula', 'maja', 'leonie', 'jasmin', 'alina',
  'noah', 'leon', 'luca', 'lukas', 'finn', 'felix', 'jonas', 'ben', 'jan', 'max',
  'moritz', 'paul', 'tim', 'tom', 'nico', 'david', 'julian', 'tobias', 'fabian',
  'philipp', 'alexander', 'simon', 'michael', 'daniel', 'christian', 'sebastian',
  'maximilian', 'elias', 'luis', 'henry', 'oskar', 'theo', 'simon', 'niklas',
  'cem', 'fatima', 'ayasha', 'mehmet', 'ali', 'zeynep', 'leyla', 'yusuf',
  'mia', 'marie', 'amelie', 'ida', 'eva', 'emilia', 'lotte', 'frida',
])

/**
 * Maskiert erkannte Vornamen im Text.
 * Gibt den gefilterten Text und ein Log der ersetzten Namen zurück.
 */
export function applyPiiFilter(text: string): {
  filtered: string
  replacements: number
  warning: boolean
} {
  if (!text || text.trim() === '') {
    return { filtered: text, replacements: 0, warning: false }
  }

  let replacements = 0

  // Regex: Wort mit Großbuchstabe (nicht am Satzanfang nach `. `)
  // Erkennt Muster wie "Max hat" oder "Emma und Leon"
  const filtered = text.replace(/\b([A-ZÄÖÜ][a-zäöüß]{2,})\b/g, (match) => {
    const lower = match.toLowerCase()
    if (KNOWN_FIRST_NAMES.has(lower)) {
      replacements++
      return '[KIND]'
    }
    return match
  })

  return {
    filtered,
    replacements,
    // Warnung wenn mehr als 3 Ersetzungen: Möglicherweise viele Namen im Text
    warning: replacements > 3,
  }
}

/**
 * Wendet PII-Filter auf alle Felder eines Prompt-Objekts an.
 */
export function filterPromptFields(
  fields: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(fields)) {
    result[key] = applyPiiFilter(value).filtered
  }
  return result
}

/**
 * Baut den finalen Prompt aus dem Template und den (gefilterten) Feldern zusammen.
 */
export function buildPrompt(
  template: string,
  fields: Record<string, string>
): string {
  let prompt = template
  for (const [key, value] of Object.entries(fields)) {
    prompt = prompt.replaceAll(`{{${key}}}`, value || '(keine Angabe)')
  }
  // Noch verbliebene Platzhalter entfernen
  prompt = prompt.replace(/\{\{[^}]+\}\}/g, '(keine Angabe)')
  return prompt
}
