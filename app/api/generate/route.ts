import { streamText } from 'ai'
import { mistral } from '@ai-sdk/mistral'
import { createClient } from '@/lib/supabase/server'
import { filterPromptFields, buildPrompt } from '@/lib/pii-filter'
import { getToolById } from '@/config/tools.config'
import { getCurriculumGuidelines, parseGradeNumber } from '@/lib/curriculum/lehrplanplus'
import {
  MatheThema,
  findMatheThema,
} from '@/lib/curriculum/mathe'
import { resolveLehrplanStandard } from '@/lib/curriculum/resolver'
import { LehrplanEintrag } from '@/lib/curriculum/lehrplanplus_mathe'
import { GeneratedWorksheet } from '@/types/tools'
import { generateRechendreiecke } from '@/lib/generators/rechendreieckGenerator'
import { generateZahlenmauern } from '@/lib/generators/zahlenmauerGenerator'
import { generateConsistentRechenhaeuser } from '@/lib/rechenhaeuser'
import {
  generateGeldArbeitsblatt,
  generateGeldZaehlenTask,
  generateGeldRechnenTask,
  generateGeldVergleichTask,
} from '@/lib/generators/geldGenerator'
import {
  generateUhrzeitArbeitsblatt,
  generateUhrzeitAblesenTask,
  generateUhrzeitZeichnenTask,
  generateUhrzeitRechnenTask,
} from '@/lib/generators/uhrzeitGenerator'
import {
  generateStrichlistenArbeitsblatt,
  generateStrichlisteAblesenTask,
  generateStrichlisteZeichnenTask,
  generateStrichlisteZaehlenTask,
} from '@/lib/generators/strichlistenGenerator'
import {
  generateGeometrieArbeitsblatt,
  generateGeometrieFormenZaehlenTask,
  generateGeometrieMusterTask,
  generateGeometriePunktgitterTask,
} from '@/lib/generators/geometrieGenerator'
import {
  generateRaumorientierungArbeitsblatt,
  generateRaumGitterOrientierungTask,
  generateRaumPfeileZaehlenTask,
  generateRaumGitterZeichnenTask,
} from '@/lib/generators/raumorientierungGenerator'
import { generateRechengeschichtenTask } from '@/lib/generators/rechengeschichtenGenerator'
import { generateZwanzigerfeldTask } from '@/lib/generators/zwanzigerfeldGenerator'
import { generateSchuettelboxTask } from '@/lib/generators/schuettelboxGenerator'
import { generateZehnerstoppTask } from '@/lib/generators/zehnerstoppGenerator'
import { generateAufgabenfamilienTask } from '@/lib/generators/aufgabenfamilienGenerator'
import { generateWochentageTask } from '@/lib/generators/uhrzeitGenerator'
import { generateKlasse2Arbeitsblatt } from '@/lib/generators/klasse2Generator'
import { generateUniversalMathArbeitsblatt } from '@/lib/generators/universalMathGenerator'


// ── Typen ──────────────────────────────────────────────────────
interface GenerateRequest {
  toolId?: string
  id?: string
  fach?: string
  klasse?: string
  thema?: string
  thema_id?: string
  aufgabentypen?: string
  selectedTaskTypes?: string[]
  seitenumfang?: string
  diff_modus?: string
  show_wortspeicher?: string | boolean
  show_rechenkaestchen?: string | boolean
  show_loesung?: string | boolean
  show_notenraster?: string | boolean
  anzahl_aufgaben?: string
  tasksPerLevel?: number | string
  taskCounts?: Record<string, number>
  kontext?: string
  fields?: Record<string, any>
}

const SYSTEM_PROMPT =
  'Du bist ein hilfreicher Assistent für Grundschullehrkräfte in Deutschland. ' +
  'Du schreibst professionelle, pädagogisch wertvolle Texte auf Deutsch. ' +
  'Antworte ausschließlich auf Deutsch. Sei präzise und praxisnah.'

export const maxDuration = 60

const MATHE_KEY_TO_LABEL_MAP: Record<string, string> = {
  kopfrechnen: 'Kopfrechnen / Grundrechenarten',
  sachaufgaben: 'Text-/Sachaufgaben (Frage, Rechnung, Antwort)',
  zahlenmauern: 'Zahlenmauern',
  groesser_kleiner_gleich: 'Größer/Kleiner/Gleich (< > =)',
  einheiten_umrechnen: 'Einheiten umrechnen',
  nachbarzahlen: 'Nachbarzahlen & Zahlenstrahl',
  tabellen: 'Tabellen & Diagramme',
  rechendreiecke: 'Rechendreiecke',
  rechenhaeuser: 'Rechenhäuser / Zahlenhäuser',
  zwanzigerfeld: 'Zwanzigerfeld / Punktefeld',
  schuettelboxen: 'Schüttelboxen (Zahlzerlegung)',
  zehnerstopp: 'Zehnerstopp (Rechnen in 2 Schritten)',
  aufgabenfamilien: 'Tausch- & Umkehraufgaben',
  hundertertafel: 'Hundertertafel & Zahlenrätsel',
  halbschriftlich: 'Halbschriftliches Rechnen',
  einmaleins: 'Malreihen & Division (Einmaleins)',
  geld_komma: 'Geld mit Komma (€ & ct)',
  laengen_messen: 'Längen messen (cm & m)',
  geometrie_koerper: 'Geometrische Körper & Symmetrie',
  geometrie: 'Geometrie & Formen',
}

function normalizeTaskTypeToKey(typeStr: string): string {
  const lower = typeStr.toLowerCase()
  if (lower.includes('hunderter') || lower.includes('zahlenrätsel') || lower.includes('tafel')) return 'hundertertafel'
  if (lower.includes('halbschriftlich') || lower.includes('schritte') || lower.includes('rechenweg')) return 'halbschriftlich'
  if (lower.includes('malreihe') || lower.includes('einmaleins') || lower.includes('1x1') || lower.includes('division')) return 'einmaleins'
  if (lower.includes('komma') || (lower.includes('geld') && lower.includes('ct'))) return 'geld_komma'
  if (lower.includes('länge') || lower.includes('laenge') || lower.includes('messen') || lower.includes('lineal')) return 'laengen_messen'
  if (lower.includes('körper') || lower.includes('koerper') || lower.includes('symmetrie')) return 'geometrie_koerper'
  if (lower.includes('zwanziger') || lower.includes('zehnerfeld') || lower.includes('punktefeld')) return 'zwanzigerfeld'
  if (lower.includes('tausch') || lower.includes('umkehr') || lower.includes('familie')) return 'aufgabenfamilien'
  if (lower.includes('schüttel') || lower.includes('schuettel') || lower.includes('shake')) return 'schuettelboxen'
  if (lower.includes('zehnerstopp') || lower.includes('2 schritt') || lower.includes('zwei schritt')) return 'zehnerstopp'
  if (lower.includes('kopfrechnen')) return 'kopfrechnen'
  if (lower.includes('sachaufgabe') || lower.includes('textaufgabe') || lower.includes('rechengeschichte')) return 'sachaufgaben'
  if (lower.includes('mauer')) return 'zahlenmauern'
  if (lower.includes('größer') || lower.includes('< > =') || lower.includes('groesser') || lower.includes('kleiner')) return 'groesser_kleiner_gleich'
  if (lower.includes('einheit')) return 'einheiten_umrechnen'
  if (lower.includes('nachbar') || lower.includes('strahl') || lower.includes('vorgänger') || lower.includes('nachfolger')) return 'nachbarzahlen'
  if (lower.includes('tabelle') || lower.includes('diagramm')) return 'tabellen'
  if (lower.includes('haus') || lower.includes('häuser') || lower.includes('haeuser')) return 'rechenhaeuser'
  if (lower.includes('dreieck')) return 'rechendreiecke'
  if (lower.includes('geometrie') || lower.includes('form')) return 'geometrie'
  return lower
}

// ── LehrplanPLUS-Resolver & Guard für Bayern ─────────────────────
// ── LehrplanPLUS-Resolver & Guard für Bayern ─────────────────────
function getCurriculumConstraints(klasse: number, themaInput: string) {
  const standard = resolveLehrplanStandard(klasse, themaInput)
  if (standard) {
    const isOhneUebergang =
      /ohne\s+zehner/i.test(themaInput) || /ohne\s+zehner/i.test(standard.titel)
    return {
      maxNumber: standard.zahlenraum,
      allowedOps: standard.erlaubteOperationen,
      forbiddenOps: standard.verboteneOperationen,
      isOhneUebergang,
      standard,
    }
  }

  // Absolute Klassen-Grenzen (LehrplanPLUS Bayern)
  const classLimits: Record<number, { maxNumber: number; allowedOps: string[]; forbiddenOps: string[] }> = {
    1: { maxNumber: 20, allowedOps: ["+", "-"], forbiddenOps: ["*", "/"] },
    2: { maxNumber: 100, allowedOps: ["+", "-", "*", "/"], forbiddenOps: ["Kommazahlen", "große Zahlen"] },
    3: { maxNumber: 1000, allowedOps: ["+", "-", "*", "/"], forbiddenOps: [] },
    4: { maxNumber: 1000000, allowedOps: ["+", "-", "*", "/"], forbiddenOps: [] },
  };

  const limits = classLimits[klasse] || classLimits[1];
  const isOhneUebergang = /ohne\s+zehner/i.test(themaInput);
  
  return {
    ...limits,
    isOhneUebergang,
    standard: undefined,
  };
}

function prioritizeAndFilterTaskTypes(
  subjectCategory: string,
  thema: string,
  types: string[],
  maxCount: number,
  matheThema?: MatheThema,
  grade = 1,
  standard?: LehrplanEintrag
): string[] {
  if (subjectCategory === 'Mathematik') {
    // Wenn Klasse 1: Filter Typen, die Multiplikation oder Division erfordern
    let availableTypes = types
    if (grade === 1) {
      availableTypes = availableTypes.filter(
        (t) => !/divid|multipli|mal\b|1x1/i.test(t)
      )
    }

    const allowedList =
      standard && standard.erlaubteAufgabentypen.length > 0
        ? standard.erlaubteAufgabentypen
        : matheThema && matheThema.erlaubteAufgabentypen.length > 0
          ? matheThema.erlaubteAufgabentypen
          : []

    // 1. Wenn ein konkreter LehrplanPLUS-Standard aktiv ist:
    // Strikte Filterung auf dessen erlaubteAufgabentypen!
    if (allowedList.length > 0) {
      const allowedSet = new Set(allowedList)
      const matchingTypes = availableTypes.filter((t) => {
        const key = normalizeTaskTypeToKey(t)
        return allowedSet.has(key)
      })

      if (matchingTypes.length > 0) {
        return matchingTypes.slice(0, maxCount)
      }

      // Fallback: Die im Lehrplan definierten Typen für dieses Thema
      return allowedList
        .slice(0, maxCount)
        .map((k) => MATHE_KEY_TO_LABEL_MAP[k] || k)
    }

    if (availableTypes.length === 0) return []
    const normThema = (thema || '').toLowerCase().trim()
    const isDivisionOrMult =
      grade > 1 &&
      /divid|teil|geteilt|multipli|mal\b|einmaleins|1x1|malnehmen|produkt|quotient|faktor/i.test(
        normThema
      )
    const isGeometry =
      /geometrie|form|körper|würfel|quader|kugel|dreieck|rechteck|quadrat|symmetrie/i.test(
        normThema
      )
    const isUnits =
      /einheit|größ|geld|euro|cent|ct|€|läng|meter|cm|km|gewicht|kilo|gramm|zeit|uhr/i.test(
        normThema
      )
    const isNeighbors =
      /nachbar|zahlenstrahl|orientier|stellenwert|vorgänger|nachfolger/i.test(
        normThema
      )

    const scored = types.map((t) => {
      let score = 5
      const lower = t.toLowerCase()
      if (isDivisionOrMult) {
        if (lower.includes('kopfrechnen')) score += 12
        if (lower.includes('sachaufgabe') || lower.includes('textaufgabe')) score += 10
        if (lower.includes('größer') || lower.includes('< > =')) score += 9
        if (lower.includes('tabelle')) score += 8
        if (lower.includes('dreieck')) score += 3
        if (lower.includes('einheit')) score -= 15
        if (lower.includes('geometrie')) score -= 15
        if (lower.includes('nachbar')) score -= 10
        if (lower.includes('mauer')) score -= 6
      } else if (isGeometry) {
        if (lower.includes('geometrie')) score += 15
        if (lower.includes('sachaufgabe')) score += 8
        if (lower.includes('kopfrechnen')) score -= 5
        if (lower.includes('einheit')) score -= 8
      } else if (isUnits) {
        if (lower.includes('einheit')) score += 15
        if (lower.includes('sachaufgabe')) score += 8
        if (lower.includes('größer')) score += 6
        if (lower.includes('geometrie')) score -= 8
      } else if (isNeighbors) {
        if (lower.includes('nachbar')) score += 15
        if (lower.includes('größer')) score += 8
        if (lower.includes('kopfrechnen')) score += 6
      }
      return { type: t, score }
    })

    scored.sort((a, b) => b.score - a.score)
    const positiveOnly = scored.filter((s) => s.score > 0)
    const candidateList = positiveOnly.length >= 1 ? positiveOnly : scored
    return candidateList.slice(0, maxCount).map((s) => s.type)
  }

  return types.slice(0, maxCount)
}

function parseAndNormalizeWorksheet(
  rawText: string,
  defaultTitle: string,
  tasksPerLevel: number = 3,
  curriculumMaxNumber: number = 20,
  mitZehneruebergang: boolean = true,
  grade: number = 1,
  taskCounts?: Record<string, number>
): GeneratedWorksheet {
  const worksheet: GeneratedWorksheet = {
    titel: defaultTitle,
    tasks: [],
  }

  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  let parsed: unknown = null
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0])
      } catch {}
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return worksheet
  }

  const rec = parsed as Record<string, unknown>
  if (typeof rec.titel === 'string' && rec.titel.trim()) {
    worksheet.titel = rec.titel.trim()
  } else if (typeof rec.title === 'string' && rec.title.trim()) {
    worksheet.titel = rec.title.trim()
  }

  let rawTasks: unknown[] = []
  if (Array.isArray(rec.tasks)) rawTasks = rec.tasks
  else if (Array.isArray(rec.aufgaben)) rawTasks = rec.aufgaben
  else if (Array.isArray(rec.items)) rawTasks = rec.items
  else if (Array.isArray(parsed)) rawTasks = parsed
  else {
    const arr = Object.values(rec).find((v) => Array.isArray(v))
    if (Array.isArray(arr)) rawTasks = arr
    else rawTasks = [parsed]
  }

  worksheet.tasks = rawTasks.map((t, idx) => {
    const tRec = (t && typeof t === 'object' ? t : {}) as Record<string, unknown>
    const id = typeof tRec.id === 'number' ? tRec.id : idx + 1
    const rawType = typeof tRec.type === 'string' ? tRec.type.trim().toLowerCase() : ''
    let title =
      typeof tRec.title === 'string' && tRec.title.trim()
        ? tRec.title.trim()
        : typeof tRec.titel === 'string' && tRec.titel.trim()
        ? tRec.titel.trim()
        : `Aufgabe ${idx + 1}`

    // Doppelungen und führende Nummerierungen bereinigen ("Aufgabe 1: Kopfrechnen" -> "Kopfrechnen", "1. Wie viel Geld ist es?" -> "Wie viel Geld ist es?")
    title = title.replace(/^(?:Aufgabe\s*)?\d+\s*[:\-.)]?\s*/i, '').trim()
    if (!title) title = `Aufgabe ${idx + 1}`

    const instruction =
      typeof tRec.instruction === 'string'
        ? tRec.instruction.trim()
        : typeof tRec.anweisung === 'string'
        ? tRec.anweisung.trim()
        : ''

    const isRechenhaus =
      rawType === 'rechenhaeuser' ||
      rawType === 'rechenhaus' ||
      /rechenhaus|rechenhäuser|zahlenhaus|zahlenhäuser/i.test(title) ||
      /rechenhaus|rechenhäuser|zahlenhaus|zahlenhäuser/i.test(instruction)

    const isRechendreieck =
      !isRechenhaus &&
      (rawType === 'rechendreiecke' ||
        rawType === 'rechendreieck' ||
        /rechendreieck/i.test(title) ||
        /rechendreieck/i.test(instruction))

    const isZahlenmauer =
      !isRechenhaus &&
      !isRechendreieck &&
      (rawType === 'zahlenmauern' ||
        rawType === 'zahlenmauer' ||
        /zahlenmauer|rechenmauer/i.test(title) ||
        /zahlenmauer|rechenmauer/i.test(instruction))

    const isGeldZaehlen =
      rawType === 'geld_zaehlen' ||
      rawType === 'geld' ||
      /wie viel geld|münzen und scheine|münzen zählen|scheine zählen/i.test(title) ||
      /wie viel geld|münzen und scheine|münzen zählen|scheine zählen/i.test(instruction)

    const isGeldRechnen =
      rawType === 'geld_rechnen' ||
      /rechnen mit euro|rechnen mit geld/i.test(title) ||
      /rechnen mit euro|rechnen mit geld/i.test(instruction)

    const isGeldVergleich =
      rawType === 'geld_vergleich' ||
      ((/vergleich|größer.*kleiner|< > =/i.test(title) ||
        /vergleich|größer.*kleiner|< > =/i.test(instruction)) &&
        /euro|cent|ct|€|geld/i.test(`${title} ${instruction}`))

    const isUhrzeitAblesen =
      rawType === 'uhrzeit_ablesen' ||
      /wie spät ist es|uhrzeiten ablesen/i.test(title) ||
      /wie spät ist es|uhrzeiten ablesen/i.test(instruction)

    const isUhrzeitZeichnen =
      rawType === 'uhrzeit_zeichnen' ||
      /zeiger einzeichnen|stundenzeiger ein/i.test(title) ||
      /zeiger einzeichnen|stundenzeiger ein/i.test(instruction)

    const isUhrzeitRechnen =
      rawType === 'uhrzeit_rechnen' ||
      /rechnen mit stunden|zeitspannen/i.test(title) ||
      /rechnen mit stunden|zeitspannen/i.test(instruction)

    const isStrichlisteAblesen =
      rawType === 'strichliste_ablesen' ||
      /strichlisten? ablesen/i.test(title) ||
      /strichlisten? ablesen/i.test(instruction)

    const isStrichlisteZeichnen =
      rawType === 'strichliste_zeichnen' ||
      /strichlisten? zeichnen/i.test(title) ||
      /strichlisten? zeichnen/i.test(instruction)

    const isStrichlisteZaehlen =
      rawType === 'strichliste_zaehlen' ||
      /zählen und häufigkeiten|formen im kasten/i.test(title) ||
      /zählen und häufigkeiten|formen im kasten/i.test(instruction)

    const isGeometrieFormenZaehlen =
      rawType === 'geometrie_formen_zaehlen' ||
      /formen (erkennen und )?zählen/i.test(title) ||
      /formen (erkennen und )?zählen/i.test(instruction)

    const isGeometrieMuster =
      rawType === 'geometrie_muster_fortsetzen' ||
      /muster (fortsetzen|fortführen)/i.test(title) ||
      /muster (fortsetzen|fortführen)/i.test(instruction)

    const isGeometriePunktgitter =
      rawType === 'geometrie_punktgitter' ||
      /punktgitter|geobrett/i.test(title) ||
      /punktgitter|geobrett/i.test(instruction)

    const isRaumGitterOrientierung =
      rawType === 'raum_gitter_orientierung' ||
      /wo befinden sich die formen|3x3-gitter/i.test(title) ||
      /wo befinden sich die formen|3x3-gitter/i.test(instruction)

    const isRaumPfeileZaehlen =
      rawType === 'raum_pfeile_zaehlen' ||
      /links oder rechts|pfeile (zählen|erkennen)|richtungen erkennen/i.test(title) ||
      /links oder rechts|pfeile (zählen|erkennen)|richtungen erkennen/i.test(instruction)

    const isRaumGitterZeichnen =
      rawType === 'raum_gitter_zeichnen' ||
      /zeichne an die richtige stelle|an die richtige stelle/i.test(title) ||
      /zeichne an die richtige stelle|an die richtige stelle/i.test(instruction)

    const isRechengeschichten =
      rawType === 'rechengeschichten' ||
      (grade === 1 && (
        rawType === 'sachaufgaben' ||
        rawType === 'textaufgaben' ||
        /rechengeschichte|text-?\/sachaufgabe|sachaufgabe|textaufgabe/i.test(title) ||
        /rechengeschichte|text-?\/sachaufgabe|sachaufgabe|textaufgabe/i.test(instruction)
      ))

    const isZwanzigerfeld =
      rawType === 'zwanzigerfeld' ||
      rawType === 'punktefeld' ||
      rawType === 'zehnerfeld' ||
      /zwanzigerfeld|punktefeld|zehnerfeld|wendeplättchen/i.test(title) ||
      /zwanzigerfeld|punktefeld|zehnerfeld|wendeplättchen/i.test(instruction)

    const isSchuettelboxen =
      rawType === 'schuettelboxen' ||
      rawType === 'schuettelbox' ||
      /schüttelbox|schuettelbox/i.test(title) ||
      /schüttelbox|schuettelbox/i.test(instruction)

    const isZehnerstopp =
      rawType === 'zehnerstopp' ||
      /zehnerstopp|stopp bei der 10|in zwei schritten|in 2 schritten/i.test(title) ||
      /zehnerstopp|stopp bei der 10|in zwei schritten|in 2 schritten/i.test(instruction)

    const isAufgabenfamilien =
      rawType === 'aufgabenfamilien' ||
      rawType === 'aufgabenfamilie' ||
      rawType === 'tausch_umkehraufgaben' ||
      /aufgabenfamilie|tausch-?\s*und\s*umkehraufgabe|tausch-?\s*&\s*umkehraufgabe/i.test(title) ||
      /aufgabenfamilie|tausch-?\s*und\s*umkehraufgabe|tausch-?\s*&\s*umkehraufgabe/i.test(instruction)

    const isWochentage =
      rawType === 'wochentage' ||
      rawType === 'wochentag' ||
      /wochentag|gestern.*heute.*morgen/i.test(title) ||
      /wochentag|gestern.*heute.*morgen/i.test(instruction)

    const type =
      rawType ||
      (isRechenhaus
        ? 'rechenhaeuser'
        : isRechendreieck
        ? 'rechendreiecke'
        : isZahlenmauer
        ? 'zahlenmauern'
        : isGeldZaehlen
        ? 'geld_zaehlen'
        : isGeldRechnen
        ? 'geld_rechnen'
        : isGeldVergleich
        ? 'geld_vergleich'
        : isUhrzeitAblesen
        ? 'uhrzeit_ablesen'
        : isUhrzeitZeichnen
        ? 'uhrzeit_zeichnen'
        : isUhrzeitRechnen
        ? 'uhrzeit_rechnen'
        : isStrichlisteAblesen
        ? 'strichliste_ablesen'
        : isStrichlisteZeichnen
        ? 'strichliste_zeichnen'
        : isStrichlisteZaehlen
        ? 'strichliste_zaehlen'
        : isGeometrieFormenZaehlen
        ? 'geometrie_formen_zaehlen'
        : isGeometrieMuster
        ? 'geometrie_muster_fortsetzen'
        : isGeometriePunktgitter
        ? 'geometrie_punktgitter'
        : isRaumGitterOrientierung
        ? 'raum_gitter_orientierung'
        : isRaumPfeileZaehlen
        ? 'raum_pfeile_zaehlen'
        : isRaumGitterZeichnen
        ? 'raum_gitter_zeichnen'
        : isRechengeschichten
        ? 'rechengeschichten'
        : isZwanzigerfeld
        ? 'zwanzigerfeld'
        : isSchuettelboxen
        ? 'schuettelboxen'
        : isZehnerstopp
        ? 'zehnerstopp'
        : isAufgabenfamilien
        ? 'aufgabenfamilien'
        : isWochentage
        ? 'wochentage'
        : undefined)

    let items: unknown[] = []
    if (Array.isArray(tRec.items)) {
      items = tRec.items
    } else if (Array.isArray(tRec.teilaufgaben)) {
      items = tRec.teilaufgaben
    }

    let solutionItems: unknown[] | undefined = undefined

    const specificCount = (() => {
      if (!taskCounts || Object.keys(taskCounts).length === 0) return tasksPerLevel
      if (rawType && typeof taskCounts[rawType] === 'number') return taskCounts[rawType]
      if (type && typeof taskCounts[type] === 'number') return taskCounts[type]
      if (title && typeof taskCounts[title] === 'number') return taskCounts[title]
      for (const [key, val] of Object.entries(taskCounts)) {
        const kLow = key.toLowerCase()
        if (title.toLowerCase().includes(kLow) || (type && type.toLowerCase().includes(kLow)) || (rawType && rawType.toLowerCase().includes(kLow))) {
          return val
        }
      }
      return tasksPerLevel
    })()

    if (isRechenhaus) {
      const generated = generateConsistentRechenhaeuser(
        specificCount,
        curriculumMaxNumber,
        items
      )
      items = generated.items
      solutionItems = generated.solutionItems
    } else if (isRechendreieck) {
      // Deterministische Rechendreieck-Engine: Zahlen und Lücken werden per Generator berechnet
      const generated = generateRechendreiecke(
        specificCount,
        curriculumMaxNumber,
        mitZehneruebergang
      )
      items = generated.items
      solutionItems = generated.solutionItems
    } else if (isZahlenmauer) {
      // Deterministische Zahlenmauer-Engine: Zahlen und Lücken werden per Generator berechnet
      const generated = generateZahlenmauern(
        specificCount,
        curriculumMaxNumber,
        3
      )
      items = generated.items
      solutionItems = generated.solutionItems
    } else if (isGeldZaehlen && items.length === 0) {
      const generated = generateGeldZaehlenTask(specificCount)
      items = generated.items
      solutionItems = generated.solutionItems
    } else if (isGeldRechnen && items.length === 0) {
      const generated = generateGeldRechnenTask(specificCount)
      items = generated.items
      solutionItems = generated.solutionItems
    } else if (isGeldVergleich && items.length === 0) {
      const generated = generateGeldVergleichTask(specificCount)
      items = generated.items
      solutionItems = generated.solutionItems
    } else if (isUhrzeitAblesen && items.length === 0) {
      const generated = generateUhrzeitAblesenTask(specificCount)
      items = generated.items
      solutionItems = generated.solutionItems
    } else if (isUhrzeitZeichnen && items.length === 0) {
      const generated = generateUhrzeitZeichnenTask(undefined, specificCount)
      items = generated.items
      solutionItems = generated.solutionItems
    } else if (isUhrzeitRechnen && items.length === 0) {
      const generated = generateUhrzeitRechnenTask(specificCount)
      items = generated.items
      solutionItems = generated.solutionItems
    } else if (isStrichlisteAblesen && items.length === 0) {
      const generated = generateStrichlisteAblesenTask(specificCount)
      items = generated.items
      solutionItems = generated.solutionItems
    } else if (isStrichlisteZeichnen && items.length === 0) {
      const generated = generateStrichlisteZeichnenTask(specificCount)
      items = generated.items
      solutionItems = generated.solutionItems
    } else if (isStrichlisteZaehlen && items.length === 0) {
      const generated = generateStrichlisteZaehlenTask()
      items = generated.items
      solutionItems = generated.solutionItems
    } else if (isGeometrieFormenZaehlen && items.length === 0) {
      const generated = generateGeometrieFormenZaehlenTask()
      items = generated.items
      solutionItems = generated.solutionItems
    } else if (isGeometrieMuster && items.length === 0) {
      const generated = generateGeometrieMusterTask(specificCount)
      items = generated.items
      solutionItems = generated.solutionItems
    } else if (isGeometriePunktgitter && items.length === 0) {
      const generated = generateGeometriePunktgitterTask(specificCount)
      items = generated.items
      solutionItems = generated.solutionItems
    } else if (isRaumGitterOrientierung && items.length === 0) {
      const generated = generateRaumGitterOrientierungTask()
      items = generated.items
      solutionItems = generated.solutionItems
    } else if (isRaumPfeileZaehlen && items.length === 0) {
      const generated = generateRaumPfeileZaehlenTask()
      items = generated.items
      solutionItems = generated.solutionItems
    } else if (isRaumGitterZeichnen && items.length === 0) {
      const generated = generateRaumGitterZeichnenTask()
      items = generated.items
      solutionItems = generated.solutionItems
    } else if (isRechengeschichten) {
      const generated = generateRechengeschichtenTask({
        thema: defaultTitle,
        maxNumber: curriculumMaxNumber,
        count: specificCount,
      })
      items = generated.items
      solutionItems = generated.solutionItems
    } else if (isZwanzigerfeld) {
      const generated = generateZwanzigerfeldTask({
        thema: defaultTitle,
        maxNumber: curriculumMaxNumber,
        count: specificCount,
      })
      items = generated.items
      solutionItems = generated.solutionItems
    } else if (isSchuettelboxen) {
      const generated = generateSchuettelboxTask({
        thema: defaultTitle,
        maxNumber: curriculumMaxNumber,
        count: specificCount,
      })
      items = generated.items
      solutionItems = generated.solutionItems
    } else if (isZehnerstopp) {
      const generated = generateZehnerstoppTask({
        count: specificCount,
      })
      items = generated.items
      solutionItems = generated.solutionItems
    } else if (isAufgabenfamilien) {
      const generated = generateAufgabenfamilienTask({
        maxNumber: curriculumMaxNumber,
        count: specificCount,
      })
      items = generated.items
      solutionItems = generated.solutionItems
    } else if (isWochentage) {
      const generated = generateWochentageTask(specificCount)
      items = generated.items
      solutionItems = generated.solutionItems
    } else {
      const isCustomVisualTask =
        isGeldZaehlen ||
        isGeldRechnen ||
        isGeldVergleich ||
        isUhrzeitAblesen ||
        isUhrzeitZeichnen ||
        isUhrzeitRechnen ||
        isStrichlisteAblesen ||
        isStrichlisteZeichnen ||
        isStrichlisteZaehlen ||
        isGeometrieFormenZaehlen ||
        isGeometrieMuster ||
        isGeometriePunktgitter ||
        isRaumGitterOrientierung ||
        isRaumPfeileZaehlen ||
        isRaumGitterZeichnen ||
        isRechengeschichten ||
        isZwanzigerfeld ||
        isSchuettelboxen ||
        isZehnerstopp ||
        isAufgabenfamilien ||
        isWochentage

      if (!isCustomVisualTask) {
        items = items.map((it) => (typeof it === 'string' ? it : JSON.stringify(it)))
      }

      // Schneide überflüssige Teilaufgaben ab (nur reine Einzelfigur-Grafiken ausnehmen)
      const isSingleCompositeTask =
        isStrichlisteZaehlen ||
        isGeometrieFormenZaehlen ||
        isRaumGitterOrientierung ||
        isRaumPfeileZaehlen ||
        isRaumGitterZeichnen
      if (!isSingleCompositeTask && items.length > specificCount) {
        items = items.slice(0, specificCount)
      }

      if (Array.isArray(tRec.solutionItems)) {
        solutionItems = isSingleCompositeTask ? tRec.solutionItems : tRec.solutionItems.slice(0, specificCount)
      } else if (Array.isArray(tRec.loesungen)) {
        solutionItems = isSingleCompositeTask ? tRec.loesungen : tRec.loesungen.slice(0, specificCount)
      }
    }

    return {
      id,
      title,
      type,
      instruction,
      items,
      ...(solutionItems ? { solutionItems } : {}),
    }
  })

  return worksheet
}

// ── Route Handler ──────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    // 1. Auth-Check: Nur eingeloggte Lehrkräfte dürfen generieren
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Nicht autorisiert. Bitte erneut anmelden.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 2. Request parsen
    const body = (await req.json()) as GenerateRequest
    const toolId = body.toolId || body.id || 'aufgaben-differenziert'
    const incomingFields = (body.fields && typeof body.fields === 'object') ? body.fields : {}

    // Fach, Klasse, Thema und Optionen sauber und ohne harten Deutsch-Default auslesen
    const rawFach = typeof incomingFields.fach === 'string'
      ? incomingFields.fach
      : typeof body.fach === 'string'
      ? body.fach
      : ''
    const fach = rawFach.trim()

    const rawKlasse = typeof incomingFields.klasse === 'string'
      ? incomingFields.klasse
      : typeof body.klasse === 'string'
      ? body.klasse
      : ''
    const klasse = rawKlasse.trim()
    const grade = parseGradeNumber(klasse)

    const rawThema = typeof incomingFields.thema === 'string'
      ? incomingFields.thema
      : typeof body.thema === 'string'
      ? body.thema
      : ''
    const thema = rawThema.trim()

    const rawThemaId = typeof incomingFields.thema_id === 'string'
      ? incomingFields.thema_id
      : typeof body.thema_id === 'string'
      ? body.thema_id
      : ''
    const thema_id = rawThemaId.trim()

    const rawAufgabentypen = typeof incomingFields.aufgabentypen === 'string'
      ? incomingFields.aufgabentypen
      : typeof body.aufgabentypen === 'string'
      ? body.aufgabentypen
      : ''
    const aufgabentypen = rawAufgabentypen.trim()

    const seitenumfang = (incomingFields.seitenumfang || body.seitenumfang || '1 DIN-A4-Seite (Kompakt)').trim()
    const diff_modus = (incomingFields.diff_modus || body.diff_modus || 'Alle Niveaustufen auf einem Blatt (Stern-System)').trim()
    const anzahl_aufgaben = (incomingFields.anzahl_aufgaben || body.anzahl_aufgaben || '3 Aufgaben').trim()
    const rawTasksPerLevel = body.tasksPerLevel ?? incomingFields.tasksPerLevel ?? anzahl_aufgaben
    const tasksPerLevel = (() => {
      if (typeof rawTasksPerLevel === 'number' && rawTasksPerLevel > 0) return rawTasksPerLevel
      const match = String(rawTasksPerLevel).match(/\d+/)
      return match ? Math.max(1, parseInt(match[0], 10)) : 3
    })()

    const rawTaskCounts = body.taskCounts ?? incomingFields.taskCounts
    const taskCounts: Record<string, number> = (() => {
      if (rawTaskCounts && typeof rawTaskCounts === 'object') {
        return rawTaskCounts as Record<string, number>
      }
      if (typeof rawTaskCounts === 'string') {
        try {
          const parsed = JSON.parse(rawTaskCounts)
          if (parsed && typeof parsed === 'object') return parsed as Record<string, number>
        } catch {}
      }
      return {}
    })()

    const kontext = (incomingFields.kontext || body.kontext || '').trim()

    const fields: Record<string, string> = {
      ...incomingFields,
      ...(fach ? { fach } : {}),
      ...(klasse ? { klasse } : {}),
      ...(thema ? { thema } : {}),
      ...(thema_id ? { thema_id } : {}),
      ...(aufgabentypen ? { aufgabentypen } : {}),
      ...(seitenumfang ? { seitenumfang } : {}),
      ...(diff_modus ? { diff_modus } : {}),
      ...(anzahl_aufgaben ? { anzahl_aufgaben } : {}),
      tasksPerLevel: String(tasksPerLevel),
      ...(kontext ? { kontext } : {}),
    }

    if (!toolId) {
      return new Response(
        JSON.stringify({ error: 'Ungültige Anfrage: toolId ist erforderlich.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 3. Tool validieren
    const tool = getToolById(toolId)
    if (!tool) {
      return new Response(
        JSON.stringify({ error: `Tool "${toolId}" nicht gefunden.` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 4. PII-Filter anwenden (DSGVO-Pflicht!)
    //    Filtert alle Eingabefelder – Schülernamen werden zu [KIND]
    const filteredFields = filterPromptFields(fields)

    // 5. Fachkategorie ermitteln (Mathematik, Sachunterricht/HSU, Deutsch, Englisch)
    const lowerFach = fach.toLowerCase()
    let subjectCategory: 'Mathematik' | 'Sachunterricht' | 'Deutsch' | 'Englisch'
    if (lowerFach.includes('mathe') || lowerFach.includes('rechnen')) {
      subjectCategory = 'Mathematik'
    } else if (
      lowerFach.includes('sach') ||
      lowerFach.includes('hsu') ||
      lowerFach.includes('heimat') ||
      lowerFach.includes('natur')
    ) {
      subjectCategory = 'Sachunterricht'
    } else if (lowerFach.includes('engl')) {
      subjectCategory = 'Englisch'
    } else {
      subjectCategory = 'Deutsch'
    }

    // 6. Prompt & System-Prompt je nach Tool und Fach isolieren
    let effectiveSystemPrompt = SYSTEM_PROMPT
    let prompt: string

    const rawSelectedTaskTypes = Array.isArray(body.selectedTaskTypes)
      ? body.selectedTaskTypes
      : typeof incomingFields.aufgabentypen === 'string' && incomingFields.aufgabentypen.trim()
      ? incomingFields.aufgabentypen.split(',').map((s) => s.trim()).filter(Boolean)
      : typeof body.aufgabentypen === 'string' && body.aufgabentypen.trim()
      ? body.aufgabentypen.split(',').map((s) => s.trim()).filter(Boolean)
      : []

    const selectedTaskTypes = rawSelectedTaskTypes.filter(
      (t): t is string => typeof t === 'string' && t.trim().length > 0
    )

    if (toolId === 'aufgaben-differenziert') {
      const standard =
        subjectCategory === 'Mathematik'
          ? resolveLehrplanStandard(grade, thema_id || thema)
          : undefined
      const matheThema =
        subjectCategory === 'Mathematik'
          ? findMatheThema(grade, thema_id || thema)
          : undefined

      // ── Zentraler deterministischer Generator für Mathematik (LehrplanPLUS Bayern Klassen 1–4) ──
      if (subjectCategory === 'Mathematik') {
        const activeTypes =
          selectedTaskTypes && selectedTaskTypes.length > 0
            ? selectedTaskTypes
            : aufgabentypen
            ? aufgabentypen.split(',').map((s) => s.trim()).filter(Boolean)
            : undefined

        const validGrade = (grade >= 1 && grade <= 4 ? (grade as 1 | 2 | 3 | 4) : 1)
        const worksheet = generateUniversalMathArbeitsblatt({
          grade: validGrade,
          thema: standard?.titel || matheThema?.label || thema || 'Mathematik',
          selectedTaskTypes: activeTypes,
          taskCounts,
          tasksPerLevel: typeof tasksPerLevel === 'number' ? tasksPerLevel : 4,
        })

        return new Response(JSON.stringify(worksheet, null, 2), {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        })
      }

      const curriculumRules = getCurriculumGuidelines(fach, klasse)
      const isSinglePage = seitenumfang.includes('1') || seitenumfang.includes('Kompakt')
      const maxTasksForPage = isSinglePage ? 3 : 5

      // A4-Kapazitäts-Schutz & Themen-Priorisierung anhand LehrplanPLUS
      const constraints = (subjectCategory as string) === 'Mathematik' ? getCurriculumConstraints(grade, thema) : undefined

      let effectiveSelectedTypes =
        selectedTaskTypes && selectedTaskTypes.length > 0
          ? selectedTaskTypes
          : prioritizeAndFilterTaskTypes(
              subjectCategory,
              thema,
              selectedTaskTypes,
              maxTasksForPage,
              matheThema,
              grade,
              standard
            )

      if (effectiveSelectedTypes.length === 0) {
        effectiveSelectedTypes = ['Schüttelsätze', 'Wortarten bestimmen']
      }

      const taskCount = effectiveSelectedTypes.length
      const taskTypesListStr = effectiveSelectedTypes.join(', ')

      const isDivisionOrMultiplication =
        /divid|teil|geteilt|multipli|mal\b|einmaleins|1x1|malnehmen|produkt|quotient|faktor/i.test(
          thema
        )
      const isGeometry =
        /geometrie|form|körper|würfel|quader|kugel|dreieck|rechteck|quadrat|symmetrie/i.test(
          thema
        )
      const isUnits =
        /einheit|größ|geld|euro|cent|ct|€|läng|meter|cm|km|gewicht|kilo|gramm|zeit|uhr/i.test(
          thema
        )

      let guardDirectives = ''
      if (constraints) {
        let maxNumber = constraints.maxNumber
        if (/bis\s+10\b/i.test(thema)) maxNumber = Math.min(maxNumber, 10)
        else if (/bis\s+20\b/i.test(thema)) maxNumber = Math.min(maxNumber, 20)
        else if (/bis\s+50\b/i.test(thema)) maxNumber = Math.min(maxNumber, 50)
        if (matheThema) maxNumber = Math.min(maxNumber, matheThema.zahlenraum)
        if (standard) maxNumber = Math.min(maxNumber, standard.zahlenraum)

        guardDirectives =
          `AUTOMATISCHER LEHRPLANPLUS-GUARD (BAYERN, KLASSE ${grade}):\n` +
          `- ZAHLENRAUM: Strikt bis maximal ${maxNumber}! Alle Zahlen, Operanden, Zwischenschritte und Ergebnisse MÜSSEN <= ${maxNumber} sein! Niemals Zahlen größer als ${maxNumber} verwenden!\n` +
          `- ERLAUBTE OPERATIONEN: ${constraints.allowedOps.join(', ')}.\n` +
          (constraints.forbiddenOps.length > 0
            ? `- STRENG VERBOTENE OPERATIONEN: ${constraints.forbiddenOps.join(', ')} (In Klasse ${grade} ausnahmslos unzulässig)!\n`
            : '') +
          (constraints.isOhneUebergang
            ? `- STRIKT OHNE ZEHNERÜBERGANG: Keine Zehnerüberschreitungen (z. B. 12 + 5 = 17, 18 - 4 = 14; KEINE Aufgaben wie 8 + 5 oder 13 - 6)!\n`
            : '')
      }

      let themaDirectives = ''
      if (standard) {
        themaDirectives =
          `VERBINDLICHE BAYERISCHE LEHRPLANPLUS-MATRIX FÜR DIESES MATHEMATIK-THEMA:\n` +
          `- Thema: "${standard.titel}" (Gegenstandsbereich: ${standard.bereich}, Jahrgangsstufe ${standard.klasse})\n` +
          `- AMTLICHE KOMPETENZERWARTUNG (LehrplanPLUS Bayern): "${standard.kompetenzText}"\n` +
          `- ZAHLENRAUM: Strikt bis maximal ${standard.zahlenraum}! Alle Zahlen, Operanden, Rechnungen und Ergebnisse MÜSSEN <= ${standard.zahlenraum} sein! Niemals Zahlen größer als ${standard.zahlenraum} verwenden!\n` +
          `- ERLAUBTE OPERATIONEN: ${standard.erlaubteOperationen.length > 0 ? standard.erlaubteOperationen.join(', ') : 'Keine Rechenoperationen (z. B. reine Geometrie / Lagebeziehungen / Formen / Muster)'}.\n` +
          (standard.verboteneOperationen.length > 0
            ? `- STRENG VERBOTENE OPERATIONEN: ${standard.verboteneOperationen.join(', ')}!\n`
            : '') +
          `- VERBINDLICHE DIDAKTISCHE REGELN FÜR DIESES THEMA:\n${standard.didaktischeRegeln.map((r) => `  * ${r}`).join('\n')}\n` +
          `- ZULÄSSIGE AUFGABENFORMATE: ${standard.erlaubteAufgabentypen.join(', ')}\n` +
          `- Jede Aufgabe MUSS sich zwingend an diese didaktischen Regeln und an den amtlichen LehrplanPLUS halten!\n`
      } else if (matheThema) {
        themaDirectives =
          `VERBINDLICHE BAYERISCHE LEHRPLANPLUS-MATRIX FÜR DIESES MATHEMATIK-THEMA:\n` +
          `- Thema: "${matheThema.label}"\n` +
          `- ZAHLENRAUM: Strikt bis ${matheThema.zahlenraum}! Alle Zahlen, Operanden, Rechnungen und Ergebnisse MÜSSEN <= ${matheThema.zahlenraum} sein! Verwende NIEMALS Zahlen größer als ${matheThema.zahlenraum}!\n` +
          `- ERLAUBTE OPERATIONEN: ${matheThema.operationen.join(', ')}. Andere Rechenarten sind STRENG VERBOTEN!\n` +
          `- VERBINDLICHE REGELN FÜR DIESES THEMA:\n${matheThema.regeln.map((r) => `  * ${r}`).join('\n')}\n` +
          `- ZULÄSSIGE AUFGABENFORMATE: ${matheThema.erlaubteAufgabentypen.join(', ')}\n` +
          `- Jede Aufgabe MUSS sich zwingend an diese didaktischen Regeln halten!\n`
      } else {
        themaDirectives =
          `STRIKTE PRIORISIERUNG DES THEMAS ("${thema || 'Rechnen'}"):\n` +
          `Das vom Nutzer angegebene Thema ("${thema || 'Rechnen'}") ist die OBERSTE LEITLINIE des gesamten Arbeitsblatts!\n` +
          `Jeder einzelne Aufgabenblock MUSS inhaltlich und rechnerisch zwingend auf dieses Thema fokussiert sein!\n`

        if (isDivisionOrMultiplication) {
          themaDirectives +=
            `STRIKTE VORGABE FÜR DIVISION / MULTIPLIKATION:\n` +
            `- Alle Rechenaufgaben MÜSSEN Geteilt- (:) oder Mal-Aufgaben (·) passend zur Jahrgangsstufe ${klasse || '2. Klasse'} sein!\n` +
            `- KEINE isolierten Additions- oder Subtraktionsaufgaben, wenn das Thema Division/Multiplikation ist!\n` +
            `- "Kopfrechnen": AUSSCHLIESSLICH Geteilt- und Malaufgaben (z. B. "12 : 3 = ___", "20 : 5 = ___", "6 · 4 = ___")!\n` +
            `- "Größer/Kleiner/Gleich (< > =)": MUSS Terme mit Division oder Multiplikation vergleichen (z. B. "18 : 3 [ ] 5" oder "24 : 4 [ ] 20 : 5")!\n` +
            `- "Text-/Sachaufgaben": MÜSSEN zwingend eine Aufteil-, Verteil- oder Malhandlung beschreiben (z. B. "20 Bonbons werden gerecht an 4 Kinder verteilt. Wie viele erhält jedes Kind?") mit F:, R: und A:!\n` +
            `- "Tabellen & Diagramme": Divisionstabellen, Umkehraufgaben oder Mal-Tabellen!\n` +
            `- Unter KEINEN Umständen isolierte Aufgaben zu fremden Themen (kein Geld-Wechseln, keine Geometrie)!\n`
        } else if (isGeometry) {
          themaDirectives +=
            `STRIKTE VORGABE FÜR GEOMETRIE:\n` +
            `- Alle Aufgaben müssen sich auf Formen, Körper, Ecken, Kanten oder Flächen beziehen!\n`
        } else if (isUnits) {
          themaDirectives +=
            `STRIKTE VORGABE FÜR GRÖSSEN & EINHEITEN:\n` +
            `- Alle Aufgaben müssen die Größen und Einheiten thematisieren!\n`
        }
      }

      const defaultSheetTitle = (standard?.titel || matheThema?.label || thema || 'Mathematik-Arbeitsblatt').replace(/^["']|["']$/g, '')
      const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
      const exampleLetters = letters.slice(0, tasksPerLevel).map((l) => `${l})`).join(', ')

      const dynamicSampleItems = [
        '3 + 4 = ____',
        '8 - 2 = ____',
        '5 + 3 = ____',
        '9 - 4 = ____',
        '6 + 2 = ____',
        '7 - 5 = ____',
      ]
        .slice(0, tasksPerLevel)
        .map((calc, i) => `"${letters[i]}) ${calc}"`)
        .join(',\n        ')

      const dynamicSampleSolutions = [
        '7',
        '6',
        '8',
        '5',
        '8',
        '2',
      ]
        .slice(0, tasksPerLevel)
        .map((sol, i) => `"${letters[i]}) ${sol}"`)
        .join(',\n        ')

      effectiveSystemPrompt =
        'Du bist ein erfahrener Grundschullehrer und Didaktik-Experte für Grundschul-Arbeitsblätter.\n\n' +
        (guardDirectives ? `${guardDirectives}\n` : '') +
        `${themaDirectives}\n` +
        `STRIKTE VORGABE: Das Arbeitsblatt ist für Klasse ${klasse || '1. Klasse'}. Halte dich strikt an den bayerischen LehrplanPLUS: ${curriculumRules}.\n` +
        `Erstelle AUSSCHLIESSLICH Aufgaben für folgende ausgewählte Aufgabentypen: ${taskTypesListStr}.\n` +
        'Ignoriere alle anderen Aufgabentypen vollständig!\n\n' +
        `ANZAHL DER AUFGABENBLÖCKE & TEILAUFGABEN (STRIKT VERBINDLICH):\n` +
        `- Erstelle EXAKT ${taskCount} Aufgabenblöcke im JSON-Objekt – genau eine Aufgabe pro ausgewähltem Aufgabentyp (${taskTypesListStr})!\n` +
        `- JEDER generierte Aufgabenblock MUSS EXAKT ${tasksPerLevel} durchnummerierte Teilaufgaben (${exampleLetters}) im \`items\`-Array enthalten. Nicht mehr und nicht weniger!\n\n` +
        'VERBINDLICHES JSON-SCHEMA:\n' +
        'Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt mit folgender Struktur:\n' +
        '{\n' +
        `  "titel": "${defaultSheetTitle}",\n` +
        '  "tasks": [\n' +
        '    {\n' +
        '      "id": 1,\n' +
        '      "title": "Aufgabentyp-Titel (z. B. Kopfrechnen)",\n' +
        '      "instruction": "Aufgabenstellung (z. B. Rechne die Aufgaben aus.)",\n' +
        `      "items": [\n        ${dynamicSampleItems}\n      ],\n` +
        `      "solutionItems": [\n        ${dynamicSampleSolutions}\n      ]\n` +
        '    }\n' +
        '  ]\n' +
        '}\n\n' +
        `BEISPIEL-STRUKTUR: JEDER Aufgabenblock MUSS EXAKT ${tasksPerLevel} Teilaufgaben enthalten:\n` +
        `- Kopfrechnen: ${letters.slice(0, tasksPerLevel).map((l, i) => `${l}) ${i + 3} + 2 = ____`).join(', ')}\n` +
        `- Größer/Kleiner/Gleich: ${letters.slice(0, tasksPerLevel).map((l, i) => `${l}) ${i + 4} + 1 [ ] ${i + 6}`).join(', ')} (Verwende zwingend '[ ]' als Platzhalter für den Kreis; in solutionItems z. B. '${letters[0]}) ${4 + 1} < 6')\n` +
        `- Nachbarzahlen: ${letters.slice(0, tasksPerLevel).map((l, i) => `${l}) ___ , ${i + 4} , ___`).join(', ')} (Verwende zwingend '___ , X , ___' für Vorgänger und Nachfolger)\n` +
        `- Rechendreiecke: "type": "rechendreiecke", "title": "Rechendreiecke", "instruction": "Rechne die Innen- und Außenzahlen aus."\n` +
        `  Jedes Element in "items" MUSS ein Dreieck-Objekt sein:\n` +
        `  {\n` +
        `    "inner": [3, 4, 2],       // Die 3 Eckzahlen (A=3 oben, B=4 links unten, C=2 rechts unten)\n` +
        `    "outer": [7, 6, 5],       // Die 3 Randsummen (A+B=7, B+C=6, C+A=5)\n` +
        `    "missing": ["outer_0", "outer_1", "outer_2"] // Muster 1: alle 3 Ränder gesucht; Muster 2: genau 1 Ecke und 2 Ränder gesucht, z. B. ["inner_2", "outer_0", "outer_2"] (niemals dürfen eine Ecke und beide anliegenden Ränder gleichzeitig fehlen!)\n` +
        `  }\n` +
        `- Rechenhäuser: "type": "rechenhaeuser", "title": "Rechenhäuser", "instruction": "Zerlege die Zahl im Dach. Trage die fehlenden Zahlen in die Zimmer ein."\n` +
        `  Jedes Element in "items" MUSS ein Haus-Objekt sein:\n` +
        `  {\n` +
        `    "roof": 10,               // Dachzahl / Hausnummer\n` +
        `    "floors": [\n` +
        `      { "left": 3, "right": 7, "missing": "right" },\n` +
        `      { "left": 6, "right": 4, "missing": "left" }\n` +
        `    ]\n` +
        `  }\n` +
        `- Zahlenmauern: "type": "zahlenmauern", "title": "Zahlenmauern", "instruction": "Rechne die Zahlenmauern von unten nach oben aus."\n` +
        `  STRIKTE REGEL FÜR KLASSE 1: Zahlenraum bis 20 (bzw. bis 10 falls angegeben)! Alle Zerlegungen und Summen müssen mathematisch exakt aufgehen!\n\n` +
        'ANTWORTFORMAT:\n' +
        'Liefere AUSSCHLIESSLICH das valide JSON-Objekt zurück. Kein vorangestellter oder nachfolgender Fließtext, kein Markdown-Codeblock.'

      prompt =
        `Erstelle das Arbeitsblatt als valides JSON-Objekt für folgende Einstellungen:\n` +
        `Fach: ${fach || 'Mathematik'}\n` +
        `Jahrgangsstufe: ${klasse || '1. Klasse'}\n` +
        `Thema: ${thema || 'Rechnen'}\n` +
        (kontext ? `Kontext: ${kontext}\n` : '') +
        `Ausgewählte Aufgabentypen (${taskCount}): ${taskTypesListStr}\n` +
        `Aufgaben pro Niveau: EXAKT ${tasksPerLevel} Teilaufgaben pro Aufgabenblock (${exampleLetters})\n\n` +
        `WICHTIG:\n` +
        `- Das Thema "${thema || 'Rechnen'}" MUSS in ALLEN ${taskCount} Aufgabenblöcken primär umgesetzt werden!\n` +
        `- Erstelle EXAKT ${taskCount} Aufgabenblöcke im tasks-Array des JSON-Objekts, passend zu den ausgewählten Typen: ${taskTypesListStr}.\n` +
        `- JEDER generierte Aufgabenblock MUSS EXAKT ${tasksPerLevel} durchnummerierte Teilaufgaben (${exampleLetters}) im items-Array enthalten. Nicht mehr und nicht weniger!\n` +
        `- Halte dich strikt an den bayerischen LehrplanPLUS für ${klasse}: ${curriculumRules}.\n` +
        `- Liefere AUSSCHLIESSLICH das valide JSON-Objekt.`
    } else {
      prompt = buildPrompt(tool.promptTemplate, filteredFields)
    }

    const provider = process.env.AI_PROVIDER ?? 'local'
    const sheetMaxNumber = /bis\s*10\b/i.test(thema) ? 10 : 20

    // ── FALL A: Lokaler Modus via Ollama (qwen2.5:14b) ─────────
    if (provider === 'local') {
      const ollamaBaseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/api'
      const chatUrl = ollamaBaseUrl.endsWith('/api')
        ? `${ollamaBaseUrl}/chat`
        : `${ollamaBaseUrl}/api/chat`
      const ollamaModel = process.env.OLLAMA_MODEL ?? 'qwen2.5:14b'

      // Für Arbeitsblätter: Strikt typisiertes JSON-Objekt direkt und sauber zurückgeben
      if (toolId === 'aufgaben-differenziert') {
        const ollamaRes = await fetch(chatUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ollamaModel,
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

        if (!ollamaRes.ok) {
          const errorText = await ollamaRes.text()
          throw new Error(`Ollama Fehler (${ollamaRes.status}): ${errorText}`)
        }

        const data = await ollamaRes.json()
        const rawContent = data.message?.content || '{}'
        const defaultSheetTitle = (thema || 'Arbeitsblatt').replace(/^["']|["']$/g, '')
        const mitZehneruebergang = !/ohne\s*(?:zehner)?übergang/i.test(thema)

        const normalized = parseAndNormalizeWorksheet(
          rawContent,
          defaultSheetTitle,
          tasksPerLevel,
          sheetMaxNumber,
          mitZehneruebergang,
          grade,
          taskCounts
        )

        return new Response(JSON.stringify(normalized, null, 2), {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        })
      }

      // Für andere Tools: Klassisches Text-Streaming
      const ollamaRes = await fetch(chatUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          messages: [
            { role: 'system', content: effectiveSystemPrompt },
            { role: 'user', content: prompt },
          ],
          stream: true,
          options: {
            temperature: 0.7,
          },
        }),
      })

      if (!ollamaRes.ok) {
        const errorText = await ollamaRes.text()
        throw new Error(`Ollama Fehler (${ollamaRes.status}): ${errorText}`)
      }

      const reader = ollamaRes.body?.getReader()
      if (!reader) {
        throw new Error('Kein Response-Body von Ollama empfangen.')
      }

      const encoder = new TextEncoder()
      const decoder = new TextDecoder()

      const stream = new ReadableStream({
        async start(controller) {
          let buffer = ''
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              buffer += decoder.decode(value, { stream: true })
              const lines = buffer.split('\n')
              buffer = lines.pop() ?? ''

              for (const line of lines) {
                if (!line.trim()) continue
                try {
                  const parsed = JSON.parse(line)
                  if (parsed.message?.content) {
                    controller.enqueue(encoder.encode(parsed.message.content))
                  }
                } catch {
                  // Unvollständige Zeile ignorieren
                }
              }
            }
            if (buffer.trim()) {
              try {
                const parsed = JSON.parse(buffer)
                if (parsed.message?.content) {
                  controller.enqueue(encoder.encode(parsed.message.content))
                }
              } catch {}
            }
            controller.close()
          } catch (err) {
            controller.error(err)
          }
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      })
    }

    // ── FALL B: Mistral Cloud Provider ─────────────────────────
    if (toolId === 'aufgaben-differenziert') {
      const result = await streamText({
        model: mistral('mistral-small-latest'),
        messages: [
          { role: 'system', content: effectiveSystemPrompt },
          { role: 'user', content: prompt },
        ],
        maxOutputTokens: 2048,
        temperature: 0.2,
      })
      const fullText = await result.text
      const defaultSheetTitle = (thema || 'Arbeitsblatt').replace(/^["']|["']$/g, '')
      const mitZehneruebergang = !/ohne\s*(?:zehner)?übergang/i.test(thema)

      const normalized = parseAndNormalizeWorksheet(
        fullText,
        defaultSheetTitle,
        tasksPerLevel,
        sheetMaxNumber,
        mitZehneruebergang,
        grade,
        taskCounts
      )
      return new Response(JSON.stringify(normalized, null, 2), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      })
    }

    const result = await streamText({
      model: mistral('mistral-small-latest'),
      messages: [
        { role: 'system', content: effectiveSystemPrompt },
        { role: 'user', content: prompt },
      ],
      maxOutputTokens: 2048,
      temperature: 0.7,
    })

    return result.toTextStreamResponse()
  } catch (error: unknown) {
    console.error('[/api/generate] Fehler:', error)

    const message = error instanceof Error ? error.message : 'Unbekannter Fehler'

    if (
      message.includes('ECONNREFUSED') ||
      message.includes('fetch failed') ||
      message.includes('Failed to fetch')
    ) {
      return new Response(
        JSON.stringify({
          error:
            'Ollama ist nicht erreichbar. Bitte stelle sicher, dass Ollama läuft (ollama serve).',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        error: message || 'Generierung fehlgeschlagen. Bitte erneut versuchen.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
