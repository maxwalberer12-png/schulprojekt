import { LEHRPLANPLUS_MATHE_DATENBANK, LehrplanEintrag } from "./lehrplanplus_mathe";

export function resolveLehrplanStandard(klasse: number, themaInput: string): LehrplanEintrag {
  const normKlasse = Math.min(Math.max(klasse, 1), 4) as 1 | 2 | 3 | 4;
  const klassenEintraege = LEHRPLANPLUS_MATHE_DATENBANK.filter(e => e.klasse === normKlasse);
  const inputLower = (themaInput || "").toLowerCase().trim();

  // 1. Suche nach exakter ID
  const directMatch = klassenEintraege.find(e => e.id === themaInput);
  if (directMatch) return directMatch;

  // 2. Keyword-Matching
  for (const eintrag of klassenEintraege) {
    if (inputLower.includes(eintrag.titel.toLowerCase())) return eintrag;
    for (const kw of eintrag.keywords) {
      if (inputLower.includes(kw)) {
        return eintrag;
      }
    }
  }

  // 3. Fallback: Erster Eintrag der Klassenstufe
  return klassenEintraege[0];
}
