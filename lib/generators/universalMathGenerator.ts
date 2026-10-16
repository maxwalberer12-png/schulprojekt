/**
 * lib/generators/universalMathGenerator.ts
 *
 * Universeller, 100 % deterministischer Task-Type-Mapper für ALLE 4 Klassenstufen (1–4)
 * und sämtliche bayerischen LehrplanPLUS-Themen.
 *
 * ARCHITEKTUR-PRINZIPIEN:
 * 1. ENTKOPPLUNG: Thema vs. Aufgabentyp-Chips:
 *    - `getTopicConfig(grade, topic)` leitet mathematische Parameter ab:
 *      maxNumber, allowCarry, defaultTaskTypes.
 * 2. CHIP-STRIKTHEIT (`buildSectionsFromSelectedTypes`):
 *    - Wenn `selectedTaskTypes.length > 0` ist, wird JEDER einzelne aktive Chip direkt
 *      auf genau 1 Sektion gemappt (fortlaufend nummeriert: 1., 2., 3., ...).
 *    - Keine festen 3er-Overides mehr anhand des Themennamens!
 * 3. ZAHLENRAUM-SKALIERUNG:
 *    - Universelle Aufgabentypen (Kopfrechnen, Größer/Kleiner/Gleich, Zahlenmauern,
 *      Rechendreiecke, Nachbarzahlen) skalieren automatisch passend zu maxNumber & allowCarry.
 * 4. SPEZIAL-THEMEN ALS DEFAULTS:
 *    - Spezial-Themen (Euro & Cent, Uhrzeit, Geometrie, Strichlisten) definieren standardmäßig
 *      ihre 3 didaktischen Spezial-Sektionen, bleiben aber jederzeit vom Nutzer über Chips frei veränderbar.
 */

import { GeneratedTask, GeneratedWorksheet } from '@/types/tools'
import { generateZwanzigerfeldTask } from './zwanzigerfeldGenerator'
import { generateAufgabenfamilienTask } from './aufgabenfamilienGenerator'
import { generateSchuettelboxTask } from './schuettelboxGenerator'
import { generateZehnerstoppTask } from './zehnerstoppGenerator'
import { generateConsistentRechenhaeuser } from '@/lib/rechenhaeuser'
import { generateRechendreiecke } from './rechendreieckGenerator'
import { generateZahlenmauern } from './zahlenmauerGenerator'
import { generateRechengeschichtenTask } from './rechengeschichtenGenerator'
import {
  generateGeldZaehlenTask,
  generateGeldRechnenTask,
  generateGeldVergleichTask,
} from './geldGenerator'
import {
  generateUhrzeitAblesenTask,
  generateUhrzeitZeichnenTask,
  generateUhrzeitRechnenTask,
  generateWochentageTask,
} from './uhrzeitGenerator'
import {
  generateStrichlisteAblesenTask,
  generateStrichlisteZeichnenTask,
  generateStrichlisteZaehlenTask,
} from './strichlistenGenerator'
import {
  generateGeometrieFormenZaehlenTask,
  generateGeometrieMusterTask,
  generateGeometriePunktgitterTask,
} from './geometrieGenerator'
import {
  generateRaumGitterOrientierungTask,
  generateRaumPfeileZaehlenTask,
  generateRaumGitterZeichnenTask,
} from './raumorientierungGenerator'
import {
  generateHundertertafelTask,
  generateHunderterfeldPunkteTask,
  generateStellenwertZETask,
  generateDienesBlocksTask,
  generateNachbarzahlenKlasse2Task,
  generateHalbschriftlichTask,
  generateMultiplicationArrayTask,
  generateEinmaleinsTask,
  generateDivisionTask,
  generateDivisionRestTask,
  generateEinmaleinsUmkehrTask,
  generateGeometrieKoerperTask,
  generateAchsensymmetrieTask,
  generateKoerpernetzeTask,
  generateLaengenMessenTask,
  generateLaengenUmrechnenTask,
  generateLaengenVergleichTask,
  generateGeldKommaTask,
  generateGeldRueckgeldTask,
  generateAnalogClockGrade2Task,
  generateZeigerEinzeichnenGrade2Task,
  generateZeitspannenGrade2Task,
  generateKalenderDatumTask,
  generateDiagrammKlasse2Task,
  generateTabelleKlasse2Task,
  generateKombinatorikKlasse2Task,
} from './klasse2Generator'
import {
  generateSchriftlichTask,
  generateRundenTask,
  generateFlaecheUmfangTask,
  generateGewichteHohlmasseTask,
  generateEinheitenUmrechnenTask,
  generateDiagrammTask,
  generateLaengenKommaK4Task,
  generateLaengenUmrechnenK4Task,
  generateRechnenLaengenK4Task,
  generateGewichteUmrechnenK4Task,
  generateBruchteileGroessenK4Task,
  generateRechnenGewichteK4Task,
  generateSachaufgabenK4Task,
} from './grade34Generator'
import {
  generateSchriftlicheAdditionTask,
  generateSchriftlicheSubtraktionTask,
  generateSchriftlichFehlendeZiffernTask,
  generateUeberschlagKontrolleTask,
  generateGeldSchriftlichTask,
  generateStellenwertHZETask,
  generateDienesTausenderTask,
  generateNachbarzahlenKlasse3Task,
  generateZahlenstrahl1000Task,
  generateRundenKlasse3Task,
  generateGroesserKleinerOrdnenK3Task,
  generateHalbschriftlichK3Task,
  generateKopfrechnenK3Task,
  generateZahlenmauernK3Task,
  generateZehnerEinmaleinsTask,
  generateHalbschriftlichMultiplikationTask,
  generateHalbschriftlichDivisionTask,
  generateWuerfelnetzeTask,
  generateWuerfelgebaeudeTask,
  generateAchsensymmetrieK3Task,
  generateRechteWinkelParallelenTask,
  generateLaengenUmrechnenK3Task,
  generateLaengenKommaK3Task,
  generateRechnenLaengenK3Task,
  generateGewichteUmrechnenK3Task,
  generateWaagenAblesenTask,
  generateMessbecherAblesenTask,
  generateZeitpunktZeitdauerTask,
  generateZeiteinheitenK3Task,
  generateBalkendiagrammK3Task,
  generateWahrscheinlichkeitK3Task,
  generateKombinatorikBaumdiagrammTask,
  generateSachaufgabenK3Task,
} from './klasse3Generator'

export interface TopicConfig {
  grade: 1 | 2 | 3 | 4
  topic: string
  maxNumber: number
  allowCarry: boolean
  defaultTaskTypes: string[]
  availableTaskTypes?: string[]
}

export interface UniversalMathOptions {
  grade: 1 | 2 | 3 | 4
  thema: string
  selectedTaskTypes?: string[]
  tasksPerLevel?: number
  taskCounts?: Record<string, number>
  colorMode?: 'color' | 'bw'
  diffModus?: string
}

/**
 * Leitet aus Jahrgangsstufe und Themenbezeichnung die didaktisch-mathematischen
 * Rahmenbedingungen ab.
 */
export function getTopicConfig(gradeInput: number, topicInput: string): TopicConfig {
  const grade = (Math.min(Math.max(gradeInput || 1, 1), 4) as 1 | 2 | 3 | 4)
  const topic = topicInput || ''
  const lower = topic.toLowerCase()

  // 1. maxNumber (Zahlenraum)
  let maxNumber = 20
  if (grade === 1) {
    if (/bis 10|zr 10|zerleg|verliebt|partnerzahl|fünferbündel/i.test(lower)) {
      maxNumber = 10
    } else {
      maxNumber = 20
    }
  } else if (grade === 2) {
    maxNumber = 100
  } else if (grade === 3) {
    maxNumber = 1000
  } else {
    maxNumber = 1000000
  }

  // 2. allowCarry (Zehnerübergang)
  let allowCarry = true
  if (/ohne zehner|ohne übertrag|ohne zehnerübergang/i.test(lower)) {
    allowCarry = false
  } else if (/mit zehner|mit übertrag|zehnerstopp|zehnerüberschreitung/i.test(lower)) {
    allowCarry = true
  } else if (grade === 1 && maxNumber <= 10) {
    allowCarry = false
  }

  // 3. defaultTaskTypes & availableTaskTypes
  let defaultTaskTypes: string[] = []
  let availableTaskTypes: string[] | undefined = undefined

  if (grade === 1) {
    if (/verliebt|zerleg|partnerzahl/i.test(lower)) {
      // 1. Zahlzerlegung & Verliebte Zahlen
      availableTaskTypes = ['schuettelboxen', 'rechenhaeuser', 'zwanzigerfeld', 'kopfrechnen', 'zahlenmauern', 'rechendreiecke']
      defaultTaskTypes = ['schuettelboxen', 'rechenhaeuser', 'zwanzigerfeld']
    } else if (/addition.*subtraktion|plus.*minus|bis 10\b/i.test(lower)) {
      // 2. Addition und Subtraktion bis 10
      availableTaskTypes = ['kopfrechnen', 'zwanzigerfeld', 'aufgabenfamilien', 'rechendreiecke', 'zahlenmauern', 'groesser_kleiner_gleich', 'sachaufgaben']
      defaultTaskTypes = ['kopfrechnen', 'zwanzigerfeld', 'zahlenmauern']
    } else if (/vorgänger|nachfolger|zahlenstrahl/i.test(lower)) {
      // 3. Vorgänger, Nachfolger & Zahlenstrahl (ZR 20)
      availableTaskTypes = ['nachbarzahlen', 'groesser_kleiner_gleich', 'zwanzigerfeld', 'zahlenfolgen']
      defaultTaskTypes = ['nachbarzahlen', 'groesser_kleiner_gleich', 'zahlenfolgen']
    } else if (/ohne zehner/i.test(lower)) {
      // 4. Ohne Zehnerübergang (ZR 20)
      availableTaskTypes = ['kopfrechnen', 'analogieaufgaben', 'zwanzigerfeld', 'aufgabenfamilien', 'zahlenmauern', 'rechendreiecke', 'sachaufgaben']
      defaultTaskTypes = ['kopfrechnen', 'analogieaufgaben', 'zahlenmauern']
    } else if (/verdoppeln|halbieren/i.test(lower)) {
      // 5. Verdoppeln und Halbieren (ZR 20)
      availableTaskTypes = ['verdoppeln_halbieren', 'kopfrechnen', 'zwanzigerfeld', 'rechenhaeuser', 'sachaufgaben']
      defaultTaskTypes = ['verdoppeln_halbieren', 'kopfrechnen', 'zwanzigerfeld']
    } else if (/mit zehner|zehnerstopp|überschreitung/i.test(lower)) {
      // 6. Mit Zehnerübergang (ZR 20)
      availableTaskTypes = ['zehnerstopp', 'zwanzigerfeld', 'kopfrechnen', 'zahlenmauern', 'rechendreiecke', 'rechenhaeuser', 'sachaufgaben']
      defaultTaskTypes = ['zehnerstopp', 'zwanzigerfeld', 'zahlenmauern']
    } else if (/raumorientierung|lagebeziehung/i.test(lower)) {
      // 7. Raumorientierung & Lagebeziehungen
      availableTaskTypes = ['raum_gitter_orientierung', 'raum_pfeile_zaehlen', 'raum_gitter_zeichnen']
      defaultTaskTypes = ['raum_gitter_orientierung', 'raum_pfeile_zaehlen', 'raum_gitter_zeichnen']
    } else if (/ebene formen|formen erkennen|formen & muster/i.test(lower)) {
      // 8. Ebene Formen & Muster
      availableTaskTypes = ['geometrie_formen_zaehlen', 'geometrie_muster', 'geometrie_punktgitter']
      defaultTaskTypes = ['geometrie_formen_zaehlen', 'geometrie_muster', 'geometrie_punktgitter']
    } else if (/euro|cent|geld|münz|schein/i.test(lower)) {
      // 9. Euro und Cent (bis 20 €)
      availableTaskTypes = ['geld_zaehlen', 'geld_rechnen', 'geld_vergleich']
      defaultTaskTypes = ['geld_zaehlen', 'geld_rechnen', 'geld_vergleich']
    } else if (/uhrzeit|uhr|zeit|stunde|wochentag/i.test(lower)) {
      // 10. Zeit & Uhrzeit (volle Stunden, Wochentage)
      availableTaskTypes = ['uhrzeit_ablesen', 'uhrzeit_zeichnen', 'wochentage']
      defaultTaskTypes = ['uhrzeit_ablesen', 'uhrzeit_zeichnen', 'wochentage']
    } else if (/strichliste|häufigkeit/i.test(lower)) {
      // 11. Strichlisten & einfache Häufigkeiten
      availableTaskTypes = ['strichliste_ablesen', 'strichliste_zeichnen', 'strichliste_zaehlen']
      defaultTaskTypes = ['strichliste_ablesen', 'strichliste_zeichnen', 'strichliste_zaehlen']
    } else {
      availableTaskTypes = ['kopfrechnen', 'zahlenmauern', 'rechendreiecke', 'zwanzigerfeld']
      defaultTaskTypes = ['kopfrechnen', 'zahlenmauern', 'rechendreiecke']
    }
  } else if (grade === 2) {
    if (/hunderterfeld|zehner.*einer|hundertertafel|orientierung/i.test(lower)) {
      // 1. Zahlenraum bis 100: Hunderterfeld, Zehner & Einer
      availableTaskTypes = [
        'hundertertafel',
        'hunderterfeld_punkte',
        'zehnerstangen_einer',
        'stellenwert_ze',
        'nachbarzahlen_k2',
        'groesser_kleiner_gleich',
        'zahlenfolgen',
      ]
      defaultTaskTypes = ['hundertertafel', 'zehnerstangen_einer', 'stellenwert_ze']
    } else if (/addition.*subtraktion|plus.*minus|rechnen bis 100/i.test(lower)) {
      // 2. Zahlenraum bis 100: Addition & Subtraktion
      availableTaskTypes = [
        'halbschriftlich',
        'kopfrechnen_k2',
        'zahlenmauern',
        'rechendreiecke',
        'aufgabenfamilien',
        'sachaufgaben_k2',
      ]
      defaultTaskTypes = ['halbschriftlich', 'kopfrechnen_k2', 'zahlenmauern']
    } else if (/kernaufgabe/i.test(lower)) {
      // 3. Kleines 1x1: Kernaufgaben
      availableTaskTypes = [
        'einmaleins_punktefeld',
        'einmaleins',
        'einmaleins_umkehr',
        'rechendreiecke',
        'sachaufgaben_k2',
      ]
      defaultTaskTypes = ['einmaleins_punktefeld', 'einmaleins', 'einmaleins_umkehr']
    } else if (/einmaleins|alle reihen|multiplikation|division/i.test(lower)) {
      // 4. Kleines 1x1: Alle Reihen & Division
      availableTaskTypes = [
        'einmaleins',
        'division',
        'einmaleins_umkehr',
        'einmaleins_punktefeld',
        'division_rest',
        'sachaufgaben_k2',
      ]
      defaultTaskTypes = ['einmaleins', 'division', 'einmaleins_umkehr']
    } else if (/körper|koerper|symmetrie|spiegel|würfel|quader/i.test(lower)) {
      // 5. Geometrie: Körperformen & Symmetrie
      availableTaskTypes = ['geometrie_koerper', 'achsensymmetrie', 'koerpernetze']
      defaultTaskTypes = ['geometrie_koerper', 'achsensymmetrie', 'koerpernetze']
    } else if (/länge|laenge|meter|zentimeter|messen/i.test(lower)) {
      // 6. Größen: Längen
      availableTaskTypes = ['laengen_messen', 'laengen_umrechnen', 'laengen_vergleich', 'sachaufgaben_k2']
      defaultTaskTypes = ['laengen_messen', 'laengen_umrechnen', 'laengen_vergleich']
    } else if (/geld|komma/i.test(lower)) {
      // 7. Größen: Geld mit Komma
      availableTaskTypes = ['geld_komma', 'geld_rueckgeld', 'geld_vergleich_k2', 'sachaufgaben_k2']
      defaultTaskTypes = ['geld_komma', 'geld_rueckgeld', 'geld_vergleich_k2']
    } else if (/uhrzeit|zeit|stunde|minute/i.test(lower)) {
      // 8. Größen: Zeit
      availableTaskTypes = ['uhrzeit_ablesen_k2', 'uhrzeit_zeichnen_k2', 'zeitspannen_k2', 'kalender_datum']
      defaultTaskTypes = ['uhrzeit_ablesen_k2', 'uhrzeit_zeichnen_k2', 'zeitspannen_k2']
    } else if (/diagramm|tabelle|daten|zufall|steckbrief/i.test(lower)) {
      // 9. Daten & Zufall
      availableTaskTypes = ['diagramm_k2', 'tabelle_k2', 'kombinatorik_k2']
      defaultTaskTypes = ['diagramm_k2', 'tabelle_k2', 'kombinatorik_k2']
    } else {
      availableTaskTypes = ['halbschriftlich', 'einmaleins', 'nachbarzahlen_k2', 'kopfrechnen']
      defaultTaskTypes = ['halbschriftlich', 'einmaleins', 'nachbarzahlen_k2']
    }
  } else if (grade === 3) {
    if (/stellenwert|h-z-e|tausender|hunderterplatten|dienes|zahlenstrahl bis 1\.000/i.test(lower)) {
      // 1. Zahlenraum bis 1.000: Stellenwerte (H-Z-E) & Zahlenstrahl
      availableTaskTypes = [
        'stellenwert_hze',
        'dienes_tausender',
        'nachbarzahlen_k3',
        'zahlenstrahl_1000',
        'runden_k3',
        'groesser_kleiner_ordnen_k3',
      ]
      defaultTaskTypes = ['stellenwert_hze', 'dienes_tausender', 'zahlenstrahl_1000']
    } else if (/halbschriftlich.*kopfrechnen|kopfrechnen mit hundertern|halbschriftliches rechnen/i.test(lower)) {
      // 2. Zahlenraum bis 1.000: Halbschriftliches Rechnen & Kopfrechnen
      availableTaskTypes = [
        'halbschriftlich_k3',
        'kopfrechnen_k3',
        'zahlenmauern_k3',
        'sachaufgaben_k3',
      ]
      defaultTaskTypes = ['halbschriftlich_k3', 'kopfrechnen_k3', 'zahlenmauern_k3']
    } else if (/schriftliche addition.*subtraktion|schriftlich.*übertrag|kästchenraster/i.test(lower)) {
      // 3. Schriftliche Addition & Subtraktion (mit Übertrag)
      availableTaskTypes = [
        'schriftlich_addition',
        'schriftlich_subtraktion',
        'schriftlich_fehlende_ziffern',
        'ueberschlag_kontrolle',
        'sachaufgaben_k3',
      ]
      defaultTaskTypes = ['schriftlich_addition', 'schriftlich_subtraktion', 'ueberschlag_kontrolle']
    } else if (/zehner-einmaleins|halbschriftliche multiplikation|halbschriftliche division/i.test(lower)) {
      // 4. Zehner-Einmaleins: Halbschriftliche Multiplikation & Division
      availableTaskTypes = [
        'zehner_einmaleins',
        'halbschriftlich_multiplikation',
        'halbschriftlich_division',
        'sachaufgaben_k3',
      ]
      defaultTaskTypes = ['zehner_einmaleins', 'halbschriftlich_multiplikation', 'halbschriftlich_division']
    } else if (/körpernetze|würfelnetze|würfelgebäude|symmetrie|geometrie/i.test(lower)) {
      // 5. Geometrie: Körpernetze, Würfelgebäude & Symmetrie
      availableTaskTypes = [
        'wuerfelnetze',
        'wuerfelgebaeude_bauplan',
        'achsensymmetrie_k3',
        'rechte_winkel_parallelen',
      ]
      defaultTaskTypes = ['wuerfelnetze', 'wuerfelgebaeude_bauplan', 'rechte_winkel_parallelen']
    } else if (/längen|laengen|millimeter|kilometer|kommaschreibweise bei längen/i.test(lower)) {
      // 6. Größen: Längen (mm, cm, m, km)
      availableTaskTypes = [
        'laengen_umrechnen_k3',
        'laengen_komma_k3',
        'rechnen_laengen',
        'sachaufgaben_k3',
      ]
      defaultTaskTypes = ['laengen_umrechnen_k3', 'laengen_komma_k3', 'rechnen_laengen']
    } else if (/gewichte|hohlmaße|hohlmasse|waagen|messbecher/i.test(lower)) {
      // 7. Größen: Gewichte (g, kg, t) & Hohlmaße (ml, l)
      availableTaskTypes = [
        'gewichte_umrechnen_k3',
        'waagen_ablesen',
        'messbecher_ablesen',
        'sachaufgaben_k3',
      ]
      defaultTaskTypes = ['gewichte_umrechnen_k3', 'waagen_ablesen', 'messbecher_ablesen']
    } else if (/zeitspannen|zeitpunkt|fahrtdauer|geldbeträgen|zeit.*geld/i.test(lower)) {
      // 8. Größen: Zeitspannen, Zeitpunkt & Geld (Kommaschreibweise)
      availableTaskTypes = [
        'zeitpunkt_zeitdauer',
        'zeiteinheiten_k3',
        'geld_schriftlich',
        'sachaufgaben_k3',
      ]
      defaultTaskTypes = ['zeitpunkt_zeitdauer', 'zeiteinheiten_k3', 'geld_schriftlich']
    } else if (/daten.*zufall|diagramme|wahrscheinlichkeit|kombinatorik|baumdiagramm/i.test(lower)) {
      // 9. Daten & Zufall: Diagramme, Wahrscheinlichkeit & Kombinatorik
      availableTaskTypes = [
        'balkendiagramm_k3',
        'wahrscheinlichkeit_k3',
        'kombinatorik_baumdiagramm',
      ]
      defaultTaskTypes = ['balkendiagramm_k3', 'wahrscheinlichkeit_k3', 'kombinatorik_baumdiagramm']
    } else {
      availableTaskTypes = [
        'schriftlich_addition',
        'schriftlich_subtraktion',
        'halbschriftlich_k3',
        'kopfrechnen_k3',
        'nachbarzahlen_k3',
      ]
      defaultTaskTypes = ['schriftlich_addition', 'schriftlich_subtraktion', 'halbschriftlich_k3']
    }
  } else {
    // Grade 4
    if (/längen.*komma|kommaschreibweise.*länge|km.*m.*cm.*mm|längen & kommaschreibweise/i.test(lower)) {
      availableTaskTypes = [
        'laengen_komma_k4',
        'laengen_umrechnen_k4',
        'rechnen_laengen_k4',
        'sachaufgaben_k4',
      ]
      defaultTaskTypes = ['laengen_komma_k4', 'laengen_umrechnen_k4', 'rechnen_laengen_k4']
    } else if (/gewichte.*bruchteile|bruchteile.*größen|bruchteile.*groessen|tonne.*kg.*g|t.*kg.*g|gewichte & bruchteile/i.test(lower)) {
      availableTaskTypes = [
        'gewichte_umrechnen_k4',
        'bruchteile_groessen_k4',
        'rechnen_gewichte_k4',
        'sachaufgaben_k4',
      ]
      defaultTaskTypes = ['gewichte_umrechnen_k4', 'bruchteile_groessen_k4', 'rechnen_gewichte_k4']
    } else if (/hohlmaß|liter.*milli|l.*ml/i.test(lower)) {
      availableTaskTypes = [
        'gewichte_hohlmasse',
        'einheiten_umrechnen',
        'sachaufgaben_k4',
      ]
      defaultTaskTypes = ['gewichte_hohlmasse', 'einheiten_umrechnen']
    } else if (/schriftlich.*multiplikation/i.test(lower)) {
      availableTaskTypes = ['schriftlich', 'kopfrechnen', 'sachaufgaben_k4']
      defaultTaskTypes = ['schriftlich', 'kopfrechnen']
    } else if (/schriftlich.*division/i.test(lower)) {
      availableTaskTypes = ['schriftlich', 'kopfrechnen', 'sachaufgaben_k4']
      defaultTaskTypes = ['schriftlich', 'kopfrechnen']
    } else if (/schriftlich/i.test(lower)) {
      availableTaskTypes = ['schriftlich', 'kopfrechnen', 'sachaufgaben_k4']
      defaultTaskTypes = ['schriftlich', 'kopfrechnen', 'sachaufgaben_k4']
    } else if (/runden|stellenwert|million/i.test(lower)) {
      availableTaskTypes = ['runden', 'nachbarzahlen', 'groesser_kleiner_gleich']
      defaultTaskTypes = ['runden', 'nachbarzahlen', 'groesser_kleiner_gleich']
    } else if (/fläche|umfang/i.test(lower)) {
      availableTaskTypes = ['flaeche_umfang', 'sachaufgaben_k4', 'kopfrechnen']
      defaultTaskTypes = ['flaeche_umfang', 'sachaufgaben_k4']
    } else if (/körpernetze|körper|maßstab/i.test(lower)) {
      availableTaskTypes = ['wuerfelnetze', 'kopfrechnen', 'sachaufgaben_k4']
      defaultTaskTypes = ['wuerfelnetze', 'kopfrechnen']
    } else if (/diagramm|tabelle/i.test(lower)) {
      availableTaskTypes = ['tabellen', 'sachaufgaben_k4', 'kopfrechnen']
      defaultTaskTypes = ['tabellen', 'sachaufgaben_k4']
    } else {
      defaultTaskTypes = ['schriftlich', 'runden', 'flaeche_umfang']
    }
  }

  return {
    grade,
    topic,
    maxNumber,
    allowCarry,
    defaultTaskTypes,
    ...(availableTaskTypes ? { availableTaskTypes } : {}),
  }
}

/**
 * Normalisiert jeden beliebigen Chip-Text oder Schlüssel auf einen Standard-Key.
 */
export function normalizeUniversalTaskType(typeStr: string): string {
  const lower = (typeStr || '').toLowerCase().trim()

  // ── KLASSE 3 SPEZIFIKA (Höchste Priorität vor generischen Teilstring-Matches!) ──
  if (lower === 'schriftlich_addition' || lower === 'schriftliche addition (im kästchenraster)' || (lower.startsWith('schriftlich') && lower.includes('addition'))) return 'schriftlich_addition'
  if (lower === 'schriftlich_subtraktion' || lower === 'schriftliche subtraktion (im kästchenraster)' || (lower.startsWith('schriftlich') && lower.includes('subtraktion'))) return 'schriftlich_subtraktion'
  if (lower === 'schriftlich_fehlende_ziffern' || lower.includes('fehlende ziffern') || lower.includes('kleckse')) return 'schriftlich_fehlende_ziffern'
  if (lower === 'ueberschlag_kontrolle' || lower.includes('überschlag') || lower.includes('ueberschlag')) return 'ueberschlag_kontrolle'
  if (lower === 'geld_schriftlich' || lower.includes('schriftliches rechnen mit geldbeträgen') || (lower.includes('schriftlich') && lower.includes('geld')) || (lower.includes('geldbeträgen') && lower.includes('komma'))) return 'geld_schriftlich'
  if (lower === 'stellenwert_hze' || (lower.includes('stellenwerttafel') && lower.includes('h')) || (lower.includes('stellenwert') && lower.includes('zahlwörter'))) return 'stellenwert_hze'
  if (lower === 'dienes_tausender' || lower.includes('tausenderbuch') || lower.includes('hunderterplatten')) return 'dienes_tausender'
  if (lower === 'nachbarzahlen_k3' || (lower.includes('nachbar') && (lower.includes('nachbarhunderter') || lower.includes('vorgänger, nachbarzehner')))) return 'nachbarzahlen_k3'
  if (lower === 'zahlenstrahl_1000' || (lower.includes('zahlenstrahl') && (lower.includes('1.000') || lower.includes('1000')))) return 'zahlenstrahl_1000'
  if (lower === 'runden_k3' || (lower.includes('runden') && (lower.includes('zehner') || lower.includes('hunderter')))) return 'runden_k3'
  if (lower === 'groesser_kleiner_ordnen_k3' || lower.includes('größer/kleiner/gleich & zahlen ordnen') || (lower.includes('größer') && lower.includes('ordnen')) || (lower.includes('groesser') && lower.includes('ordnen'))) return 'groesser_kleiner_ordnen_k3'
  if (lower === 'halbschriftlich_multiplikation' || (lower.includes('halbschriftlich') && lower.includes('multiplikation')) || lower.includes('in schritten multiplizieren')) return 'halbschriftlich_multiplikation'
  if (lower === 'halbschriftlich_division' || (lower.includes('halbschriftlich') && lower.includes('division'))) return 'halbschriftlich_division'
  if (lower === 'halbschriftlich_k3' || lower.includes('halbschriftliche addition & subtraktion') || (lower.includes('halbschriftlich') && (lower.includes('1.000') || lower.includes('zr 1.000') || lower.includes('3 schritte')))) return 'halbschriftlich_k3'
  if (lower === 'kopfrechnen_k3' || (lower.includes('kopfrechnen') && (lower.includes('hundertern') || lower.includes('zehnern')))) return 'kopfrechnen_k3'
  if (lower === 'zahlenmauern_k3' || (lower.includes('zahlenmauern') && lower.includes('1.000'))) return 'zahlenmauern_k3'
  if (lower === 'zehner_einmaleins' || lower.includes('zehner-einmaleins') || lower.includes('zehnereinmaleins') || lower.includes('4 · 60')) return 'zehner_einmaleins'
  if (lower === 'wuerfelnetze' || lower.includes('würfelnetze') || lower.includes('wuerfelnetze') || lower.includes('quadernetze')) return 'wuerfelnetze'
  if (lower === 'wuerfelgebaeude_bauplan' || lower.includes('würfelgebäude') || lower.includes('baupläne') || lower.includes('bauplan') || lower.includes('wie viele würfel')) return 'wuerfelgebaeude_bauplan'
  if (lower === 'achsensymmetrie_k3' || (lower.includes('achsensymmetrie') && lower.includes('gitternetz'))) return 'achsensymmetrie_k3'
  if (lower === 'rechte_winkel_parallelen' || lower.includes('rechte winkel') || lower.includes('parallele linien') || lower.includes('senkrecht')) return 'rechte_winkel_parallelen'
  if (lower === 'laengen_umrechnen_k3' || (lower.includes('einheiten umrechnen') && lower.includes('km')) || (lower.includes('umrechnen') && lower.includes('mm'))) return 'laengen_umrechnen_k3'
  if (lower === 'laengen_komma_k3' || (lower.includes('kommaschreibweise') && lower.includes('längen')) || lower.includes('1,45 m')) return 'laengen_komma_k3'
  if (lower === 'rechnen_laengen' || lower.includes('rechnen mit längen')) return 'rechnen_laengen'
  if (lower === 'gewichte_umrechnen_k3' || lower.includes('gewichte umrechnen') || (lower.includes('gewichte') && lower.includes('1 kg'))) return 'gewichte_umrechnen_k3'
  if (lower === 'waagen_ablesen' || lower.includes('waagen ablesen') || lower.includes('gewichte vergleichen')) return 'waagen_ablesen'
  if (lower === 'messbecher_ablesen' || lower.includes('messbecher') || (lower.includes('hohlmaße') && lower.includes('ablesen'))) return 'messbecher_ablesen'
  if (lower === 'zeitpunkt_zeitdauer' || lower.includes('zeitpunkt') || lower.includes('zeitdauer')) return 'zeitpunkt_zeitdauer'
  if (lower === 'zeiteinheiten_k3' || (lower.includes('zeiteinheiten') && (lower.includes('s, min') || lower.includes('umrechnen')))) return 'zeiteinheiten_k3'
  if (lower === 'balkendiagramm_k3' || (lower.includes('balken') && lower.includes('diagramm')) || (lower.includes('säulendiagramm') && lower.includes('auswerten'))) return 'balkendiagramm_k3'
  if (lower === 'wahrscheinlichkeit_k3' || lower.includes('wahrscheinlichkeit') || lower.includes('sicher, möglich')) return 'wahrscheinlichkeit_k3'
  if (lower === 'kombinatorik_baumdiagramm' || lower.includes('baumdiagramm') || (lower.includes('kombinatorik') && lower.includes('möglichkeiten'))) return 'kombinatorik_baumdiagramm'
  if (lower === 'sachaufgaben_k3') return 'sachaufgaben_k3'

  // ── KLASSE 4 GRÖSSEN & MESSEN SPEZIFIKA ──
  if (lower === 'laengen_komma_k4' || (lower.includes('kommaschreibweise') && lower.includes('längen') && (lower.includes('2,35') || lower.includes('k4') || lower.includes('km, m, cm')))) return 'laengen_komma_k4'
  if (lower === 'laengen_umrechnen_k4' || lower.includes('große längeneinheiten umrechnen') || (lower.includes('längeneinheiten umrechnen') && lower.includes('km')) || (lower.includes('umrechnen') && lower.includes('dm'))) return 'laengen_umrechnen_k4'
  if (lower === 'rechnen_laengen_k4' || (lower.includes('rechnen mit längen') && lower.includes('komma'))) return 'rechnen_laengen_k4'
  if (lower === 'gewichte_umrechnen_k4' || (lower.includes('gewichte umrechnen') && (lower.includes('(t, kg, g)') || lower.includes('k4')))) return 'gewichte_umrechnen_k4'
  if (lower === 'bruchteile_groessen_k4' || lower.includes('bruchteile von größen') || lower.includes('bruchteile') || lower.includes('½ kg') || lower.includes('1/2 kg')) return 'bruchteile_groessen_k4'
  if (lower === 'rechnen_gewichte_k4' || (lower.includes('rechnen mit gewichten') && lower.includes('(t, kg, g)'))) return 'rechnen_gewichte_k4'
  if (lower === 'sachaufgaben_k4' || lower.includes('sachaufgaben zu größen') || (lower.includes('text-/sachaufgaben') && lower.includes('größen'))) return 'sachaufgaben_k4'

  // Spezifische Typen (vor allgemeinen Teilstring-Matches!)
  if (lower === 'hunderterfeld_punkte' || (lower.includes('hunderterfeld') && lower.includes('punktefeld')) || lower.includes('punktefeld 10x10')) return 'hunderterfeld_punkte'
  if (lower === 'stellenwert_ze' || (lower.includes('stellenwert') && (lower.includes('z/e') || lower.includes('ergänzen'))) || lower.includes('stellenwerttafel (z/e)')) return 'stellenwert_ze'
  if (lower === 'division_rest' || (lower.includes('division') && lower.includes('rest')) || lower.includes('mit rest')) return 'division_rest'
  if (lower === 'kalender_datum' || lower.includes('kalender') || (lower.includes('datum') && lower.includes('lesen'))) return 'kalender_datum'
  if (lower === 'zahlenfolgen' || lower.includes('zahlenfolgen') || lower.includes('zahlen ordnen')) return 'zahlenfolgen'
  if (lower === 'analogieaufgaben' || lower.includes('analogie') || lower.includes('zwerg')) return 'analogieaufgaben'
  if (lower === 'verdoppeln_halbieren' || lower.includes('verdoppeln') || lower.includes('halbieren')) return 'verdoppeln_halbieren'

  // 1. Klasse 1 Spezial-Sektionen (Direkt-Routing)
  if (lower === 'geld_zaehlen' || lower.includes('münzen und scheine zählen') || lower.includes('münzen zählen') || lower.includes('münzen & scheine')) return 'geld_zaehlen'
  if (lower === 'geld_rechnen' || lower.includes('rechnen mit euro und cent') || lower.includes('rechnen mit geld')) return 'geld_rechnen'
  if (lower === 'geld_vergleich' || lower.includes('geldbeträge vergleichen')) return 'geld_vergleich'
  if (lower === 'uhrzeit_ablesen' || lower.includes('uhrzeit ablesen') || lower.includes('volle stunden ablesen') || lower.includes('analoge uhren ablesen')) return 'uhrzeit_ablesen'
  if (lower === 'uhrzeit_zeichnen' || lower.includes('uhrzeit zeichnen') || lower.includes('zeiger einzeichnen') || lower.includes('stundenzeiger einzeichnen')) return 'uhrzeit_zeichnen'
  if (lower === 'wochentage' || lower.includes('wochentage') || lower.includes('tage der woche') || lower.includes('zeitspannen & wochentage')) return 'wochentage'
  if (lower === 'strichliste_ablesen' || lower.includes('strichliste ablesen') || lower.includes('strichlisten ablesen')) return 'strichliste_ablesen'
  if (lower === 'strichliste_zeichnen' || lower.includes('strichliste zeichnen') || lower.includes('strichlisten selbst zeichnen')) return 'strichliste_zeichnen'
  if (lower === 'strichliste_zaehlen' || lower.includes('strichliste zählen') || lower.includes('häufigkeitstabelle')) return 'strichliste_zaehlen'
  if (lower === 'geometrie_formen_zaehlen' || lower.includes('formen erkennen und zählen') || lower.includes('formen zählen') || lower.includes('grundformen erkennen')) return 'geometrie_formen_zaehlen'
  if (lower === 'geometrie_muster' || lower.includes('musterreihen') || lower.includes('muster fortsetzen') || lower.includes('geometrische musterreihen')) return 'geometrie_muster'
  if (lower === 'geometrie_punktgitter' || lower.includes('zeichnen im punktgitter') || lower.includes('punktgitter')) return 'geometrie_punktgitter'
  if (lower === 'raum_gitter_orientierung' || lower.includes('wo befinden sich die formen') || lower.includes('3x3-gitter')) return 'raum_gitter_orientierung'
  if (lower === 'raum_pfeile_zaehlen' || lower.includes('links oder rechts') || lower.includes('pfeile zählen') || lower.includes('richtungspfeile zählen')) return 'raum_pfeile_zaehlen'
  if (lower === 'raum_gitter_zeichnen' || lower.includes('zeichne an die richtige stelle') || lower.includes('formen nach anweisung zeichnen')) return 'raum_gitter_zeichnen'

  // 2. Klasse 3 & 4 Spezifika
  if (lower.includes('schriftlich') || lower.includes('untereinander')) return 'schriftlich'
  if (lower.includes('runden') || lower.includes('stellenwert') || lower.includes('stellenwerttafel')) return 'runden'
  if (lower.includes('fläche') || lower.includes('flaeche') || lower.includes('umfang')) return 'flaeche_umfang'
  if (lower.includes('gewicht') || lower.includes('hohlmaß') || lower.includes('hohlmass') || lower.includes('gramm') || lower.includes('liter') || lower.includes('tonne')) return 'gewichte_hohlmasse'
  if (lower.includes('einheit')) return 'einheiten_umrechnen'

  // 3. Klasse 2 Spezifika
  if (lower === 'zehnerstangen_einer' || lower.includes('zehnerstange') || lower.includes('bündeln') || lower.includes('dienes')) return 'zehnerstangen_einer'
  if (lower === 'nachbarzahlen_k2' || (lower.includes('nachbar') && (lower.includes('100') || lower.includes('nachbarzehner')))) return 'nachbarzahlen_k2'
  if (lower === 'einmaleins_punktefeld' || (lower.includes('punktefeld') && (lower.includes('1x1') || lower.includes('mal')))) return 'einmaleins_punktefeld'
  if (lower === 'division' || lower.includes('geteilt-aufgabe') || lower.includes('geteilt') || lower.includes('division (ohne rest)')) return 'division'
  if (lower === 'einmaleins_umkehr' || lower.includes('tausch- & umkehraufgaben (1x1)') || (lower.includes('umkehr') && lower.includes('1x1')) || lower.includes('aufgabenfamilien')) return 'einmaleins_umkehr'
  if (lower === 'achsensymmetrie' || lower.includes('achsensymmetrie') || lower.includes('spiegelbilder')) return 'achsensymmetrie'
  if (lower === 'koerpernetze' || lower.includes('körpernetze') || lower.includes('koerpernetze') || lower.includes('ansichten') || lower.includes('würfelgebäude')) return 'koerpernetze'
  if (lower === 'laengen_umrechnen' || (lower.includes('umrechnen') && (lower.includes('m & cm') || lower.includes('länge')))) return 'laengen_umrechnen'
  if (lower === 'laengen_vergleich' || (lower.includes('vergleichen') && (lower.includes('länge') || lower.includes('berechnen')))) return 'laengen_vergleich'
  if (lower === 'geld_rueckgeld' || lower.includes('rückgeld') || lower.includes('kasse') || lower.includes('kassenbon')) return 'geld_rueckgeld'
  if (lower === 'uhrzeit_ablesen_k2' || (lower.includes('uhrzeit') && (lower.includes('viertel') || lower.includes('halb') || lower.includes('minuten') || lower.includes('5-minuten')))) return 'uhrzeit_ablesen_k2'
  if (lower === 'uhrzeit_zeichnen_k2' || (lower.includes('zeiger einzeichnen') && lower.includes('minute'))) return 'uhrzeit_zeichnen_k2'
  if (lower === 'zeitspannen_k2' || lower.includes('zeitspanne') || lower.includes('zeitdauer')) return 'zeitspannen_k2'
  if (lower === 'kopfrechnen_k2' || lower.includes('kopfrechnen (zr 100)')) return 'kopfrechnen'
  if (lower === 'sachaufgaben_k2' || lower === 'text-/sachaufgaben') return 'sachaufgaben'
  if (lower === 'geld_vergleich_k2' || lower.includes('geldbeträge vergleichen')) return 'groesser_kleiner_gleich'
  if (lower === 'diagramm_k2' || lower.includes('säulendiagramm') || lower.includes('balkendiagramm')) return 'diagramm_k2'
  if (lower === 'tabelle_k2' || (lower.includes('tabelle') && (lower.includes('auswerten') || lower.includes('ergänzen')))) return 'tabelle_k2'
  if (lower === 'kombinatorik_k2' || lower.includes('kombinatorik') || lower.includes('zufall') || lower.includes('zufallsexperimente')) return 'kombinatorik_k2'
  if (lower.includes('hunderter') || lower.includes('zahlenrätsel') || lower.includes('tafel') || lower.includes('zahlenkreuz')) return 'hundertertafel'
  if (lower.includes('halbschriftlich') || lower.includes('rechenweg') || lower.includes('schritte')) return 'halbschriftlich'
  if (lower.includes('malreihe') || lower.includes('einmaleins') || lower.includes('1x1')) return 'einmaleins'
  if (lower.includes('komma')) return 'geld_komma'
  if (lower.includes('länge') || lower.includes('laenge') || lower.includes('messen') || lower.includes('lineal') || lower.includes('strecke')) return 'laengen_messen'
  if (lower.includes('körper') || lower.includes('koerper') || lower.includes('steckbrief')) return 'geometrie_koerper'

  // 4. Klasse 1 Didaktik & Anschauung
  if (lower.includes('zwanziger') || lower.includes('zehnerfeld') || lower.includes('punktefeld') || lower.includes('wendeplättchen')) return 'zwanzigerfeld'
  if (lower.includes('schüttel') || lower.includes('schuettel') || lower.includes('shake')) return 'schuettelboxen'
  if (lower.includes('zehnerstopp') || lower.includes('2 schritt') || lower.includes('zwei schritt')) return 'zehnerstopp'
  if (lower.includes('tausch') || lower.includes('umkehr') || lower.includes('familie')) return 'aufgabenfamilien'

  // 5. Größen & Geometrie & Daten
  if (lower.includes('euro') || lower.includes('cent') || lower.includes('geld') || lower.includes('münz') || lower.includes('schein')) return 'geld'
  if (lower.includes('uhrzeit') || lower.includes('uhr') || lower.includes('zeit') || lower.includes('stunde') || lower.includes('wochentag')) return 'uhrzeit'
  if (lower.includes('strichliste') || lower.includes('häufigkeit') || lower.includes('fünferbündel')) return 'strichlisten'
  if (lower.includes('raumorientierung') || lower.includes('lagebeziehung') || lower.includes('rechts') || lower.includes('links')) return 'raumorientierung'
  if (lower.includes('geometrie') || lower.includes('form') || lower.includes('muster') || lower.includes('punktgitter')) return 'geometrie'
  if (lower.includes('tabelle') || lower.includes('diagramm') || lower.includes('säule') || lower.includes('balken')) return 'tabellen'

  // 6. Arithmetik Standard
  if (lower.includes('mauer')) return 'zahlenmauern'
  if (lower.includes('dreieck')) return 'rechendreiecke'
  if (lower.includes('haus') || lower.includes('häuser') || lower.includes('haeuser')) return 'rechenhaeuser'
  if (lower.includes('nachbar') || lower.includes('strahl') || lower.includes('vorgänger') || lower.includes('nachfolger')) return 'nachbarzahlen'
  if (lower.includes('größer') || lower.includes('groesser') || lower.includes('< > =') || lower.includes('kleiner') || lower.includes('vergleich')) return 'groesser_kleiner_gleich'
  if (lower.includes('sachaufgabe') || lower.includes('textaufgabe') || lower.includes('rechengeschichte')) return 'sachaufgaben'
  if (lower.includes('kopfrechnen') || lower.includes('grundrechenart') || lower.includes('plus') || lower.includes('minus') || lower.includes('rechnen')) return 'kopfrechnen'

  return lower
}

/**
 * Erzeugt Vorgänger- und Nachfolgeraufgaben passend zum Zahlenraum.
 */
function generateScaledNachbarzahlenTask(
  grade: 1 | 2 | 3 | 4,
  maxNumber: number,
  count = 4
): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: string[] = []
  const solutionItems: string[] = []

  if (grade === 1) {
    const minMitte = 2
    const maxMitte = maxNumber <= 10 ? 9 : 19
    for (let i = 0; i < count; i++) {
      const prefix = letters[i] || `${i + 1})`
      const mitte = Math.floor(Math.random() * (maxMitte - minMitte + 1)) + minMitte
      items.push(`${prefix} ___ , ${mitte} , ___`)
      solutionItems.push(`${prefix} ${mitte - 1} , ${mitte} , ${mitte + 1}`)
    }
  } else if (grade === 2) {
    for (let i = 0; i < count; i++) {
      const prefix = letters[i] || `${i + 1})`
      if (i % 2 === 0) {
        const n = Math.floor(Math.random() * 80) + 11
        const lowZ = Math.floor(n / 10) * 10
        const highZ = lowZ + 10
        items.push(`${prefix} Nachbarzehner: [___] < ${n} < [___]`)
        solutionItems.push(`${prefix} ${lowZ} < ${n} < ${highZ}`)
      } else {
        const mitte = Math.floor(Math.random() * 80) + 10
        items.push(`${prefix} Vorgänger / Nachfolger: ___ , ${mitte} , ___`)
        solutionItems.push(`${prefix} ${mitte - 1} , ${mitte} , ${mitte + 1}`)
      }
    }
  } else if (grade === 3) {
    for (let i = 0; i < count; i++) {
      const prefix = letters[i] || `${i + 1})`
      if (i % 2 === 0) {
        const n = Math.floor(Math.random() * 800) + 110
        const lowH = Math.floor(n / 100) * 100
        const highH = lowH + 100
        items.push(`${prefix} Nachbarhunderter: [___] < ${n} < [___]`)
        solutionItems.push(`${prefix} ${lowH} < ${n} < ${highH}`)
      } else {
        const n = Math.floor(Math.random() * 800) + 110
        const lowZ = Math.floor(n / 10) * 10
        const highZ = lowZ + 10
        items.push(`${prefix} Nachbarzehner: [___] < ${n} < [___]`)
        solutionItems.push(`${prefix} ${lowZ} < ${n} < ${highZ}`)
      }
    }
  } else {
    for (let i = 0; i < count; i++) {
      const prefix = letters[i] || `${i + 1})`
      if (i % 2 === 0) {
        const n = Math.floor(Math.random() * 800000) + 120000
        const lowT = Math.floor(n / 1000) * 1000
        const highT = lowT + 1000
        items.push(`${prefix} Nachbartausender: [___] < ${n.toLocaleString('de-DE')} < [___]`)
        solutionItems.push(`${prefix} ${lowT.toLocaleString('de-DE')} < ${n.toLocaleString('de-DE')} < ${highT.toLocaleString('de-DE')}`)
      } else {
        const n = Math.floor(Math.random() * 800000) + 120000
        const lowZT = Math.floor(n / 10000) * 10000
        const highZT = lowZT + 10000
        items.push(`${prefix} Nachbarzehntausender: [___] < ${n.toLocaleString('de-DE')} < [___]`)
        solutionItems.push(`${prefix} ${lowZT.toLocaleString('de-DE')} < ${n.toLocaleString('de-DE')} < ${highZT.toLocaleString('de-DE')}`)
      }
    }
  }

  return {
    id: 1,
    type: 'nachbarzahlen',
    title: grade >= 3 ? 'Nachbarzahlen (Zehner, Hunderter, Tausender)' : 'Nachbarzahlen (Vorgänger und Nachfolger)',
    instruction: 'Bestimme die Nachbarzahlen und trage sie in die Lücken ein.',
    items,
    solutionItems,
  }
}

/**
 * Erzeugt Vergleichsaufgaben (< > =) passend zum Zahlenraum.
 */
function generateScaledVergleichTask(
  grade: 1 | 2 | 3 | 4,
  maxNumber: number,
  count = 4
): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: string[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const prefix = letters[i] || `${i + 1})`
    const type = i % 3 // 0: <, 1: >, 2: =

    if (grade === 1) {
      const maxVal = maxNumber <= 10 ? 9 : 18
      let a = Math.floor(Math.random() * (maxVal - 2)) + 2
      let b = a
      if (type === 0) b = Math.min(maxNumber, a + Math.floor(Math.random() * 4) + 1)
      else if (type === 1) b = Math.max(1, a - Math.floor(Math.random() * 4) - 1)
      const op = a < b ? '<' : a > b ? '>' : '='
      items.push(`${prefix} ${a}  [ ? ]  ${b}`)
      solutionItems.push(`${prefix} ${a}  ${op}  ${b}`)
    } else if (grade === 2) {
      const a = (Math.floor(Math.random() * 8) + 2) * (Math.floor(Math.random() * 8) + 2)
      let b = a
      if (type === 0) b = a + Math.floor(Math.random() * 8) + 2
      else if (type === 1) b = Math.max(2, a - Math.floor(Math.random() * 8) - 2)
      const op = a < b ? '<' : a > b ? '>' : '='
      items.push(`${prefix} ${a}  [ ? ]  ${b}`)
      solutionItems.push(`${prefix} ${a}  ${op}  ${b}`)
    } else if (grade === 3) {
      let a = Math.floor(Math.random() * 600) + 200
      let b = a
      if (type === 0) b = a + Math.floor(Math.random() * 80) + 15
      else if (type === 1) b = Math.max(50, a - Math.floor(Math.random() * 80) - 15)
      const op = a < b ? '<' : a > b ? '>' : '='
      items.push(`${prefix} ${a}  [ ? ]  ${b}`)
      solutionItems.push(`${prefix} ${a}  ${op}  ${b}`)
    } else {
      let a = Math.floor(Math.random() * 700000) + 150000
      let b = a
      if (type === 0) b = a + (Math.floor(Math.random() * 4) + 1) * 1000
      else if (type === 1) b = a - (Math.floor(Math.random() * 4) + 1) * 1000
      const op = a < b ? '<' : a > b ? '>' : '='
      items.push(`${prefix} ${a.toLocaleString('de-DE')}  [ ? ]  ${b.toLocaleString('de-DE')}`)
      solutionItems.push(`${prefix} ${a.toLocaleString('de-DE')}  ${op}  ${b.toLocaleString('de-DE')}`)
    }
  }

  return {
    id: 2,
    type: 'groesser_kleiner_gleich',
    title: 'Größer, Kleiner oder Gleich (< > =)',
    instruction: 'Setze das richtige Zeichen <, > oder = in die Kreise ein.',
    items,
    solutionItems,
  }
}

/**
 * Erzeugt Kopfrechnen passend zu maxNumber und allowCarry.
 */
function generateScaledKopfrechnenTask(
  grade: 1 | 2 | 3 | 4,
  maxNumber: number,
  allowCarry: boolean,
  count = 6
): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)', 'g)', 'h)']
  const items: string[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const prefix = letters[i] || `${i + 1})`
    const isPlus = i % 2 === 0

    if (grade === 1) {
      if (maxNumber <= 10) {
        if (isPlus) {
          const a = Math.floor(Math.random() * 7) + 1
          const b = Math.floor(Math.random() * (10 - a)) + 1
          items.push(`${prefix} ${a} + ${b} = ___`)
          solutionItems.push(`${prefix} ${a} + ${b} = ${a + b}`)
        } else {
          const a = Math.floor(Math.random() * 8) + 3
          const b = Math.floor(Math.random() * (a - 1)) + 1
          items.push(`${prefix} ${a} - ${b} = ___`)
          solutionItems.push(`${prefix} ${a} - ${b} = ${a - b}`)
        }
      } else {
        // ZR 20
        if (!allowCarry) {
          // ohne Zehnerübergang: z. B. 12 + 3, 17 - 4
          if (isPlus) {
            const a = Math.floor(Math.random() * 7) + 11 // 11..17
            const b = Math.floor(Math.random() * (19 - a)) + 1
            items.push(`${prefix} ${a} + ${b} = ___`)
            solutionItems.push(`${prefix} ${a} + ${b} = ${a + b}`)
          } else {
            const a = Math.floor(Math.random() * 8) + 12 // 12..19
            const maxSub = a - 10
            const b = Math.floor(Math.random() * maxSub) + 1
            items.push(`${prefix} ${a} - ${b} = ___`)
            solutionItems.push(`${prefix} ${a} - ${b} = ${a - b}`)
          }
        } else {
          // mit Zehnerübergang: z. B. 8 + 5 = 13, 14 - 7 = 7
          if (isPlus) {
            const a = Math.floor(Math.random() * 5) + 6 // 6..10
            const b = Math.floor(Math.random() * (19 - a - 2)) + (11 - a)
            items.push(`${prefix} ${a} + ${b} = ___`)
            solutionItems.push(`${prefix} ${a} + ${b} = ${a + b}`)
          } else {
            const a = Math.floor(Math.random() * 7) + 12 // 12..18
            const minSub = a - 9
            const maxSub = a - 2
            const b = Math.floor(Math.random() * (maxSub - minSub + 1)) + minSub
            items.push(`${prefix} ${a} - ${b} = ___`)
            solutionItems.push(`${prefix} ${a} - ${b} = ${a - b}`)
          }
        }
      }
    } else if (grade === 2) {
      if (isPlus) {
        // ZR 100: Summe darf maximal 100 betragen
        const a = Math.floor(Math.random() * 55) + 12 // 12..66
        const maxB = 100 - a
        const b = Math.floor(Math.random() * Math.min(35, maxB - 5)) + 5
        items.push(`${prefix} ${a} + ${b} = ___`)
        solutionItems.push(`${prefix} ${a} + ${b} = ${a + b}`)
      } else {
        // ZR 100: Niemals negative Zahlen, Ergebnis strikt >= 5
        const a = Math.floor(Math.random() * 70) + 25 // 25..94
        const b = Math.floor(Math.random() * (a - 15)) + 10 // 10..(a - 6)
        items.push(`${prefix} ${a} - ${b} = ___`)
        solutionItems.push(`${prefix} ${a} - ${b} = ${a - b}`)
      }
    } else if (grade === 3) {
      if (isPlus) {
        const a = (Math.floor(Math.random() * 40) + 10) * 10
        const b = (Math.floor(Math.random() * 35) + 10) * 10
        items.push(`${prefix} ${a} + ${b} = ___`)
        solutionItems.push(`${prefix} ${a} + ${b} = ${a + b}`)
      } else {
        const a = (Math.floor(Math.random() * 45) + 40) * 10
        const b = (Math.floor(Math.random() * 30) + 10) * 10
        items.push(`${prefix} ${a} - ${b} = ___`)
        solutionItems.push(`${prefix} ${a} - ${b} = ${a - b}`)
      }
    } else {
      if (isPlus) {
        const a = (Math.floor(Math.random() * 35) + 15) * 10000
        const b = (Math.floor(Math.random() * 35) + 10) * 10000
        items.push(`${prefix} ${a.toLocaleString('de-DE')} + ${b.toLocaleString('de-DE')} = ___`)
        solutionItems.push(`${prefix} ${a.toLocaleString('de-DE')} + ${b.toLocaleString('de-DE')} = ${(a + b).toLocaleString('de-DE')}`)
      } else {
        const a = (Math.floor(Math.random() * 40) + 50) * 10000
        const b = (Math.floor(Math.random() * 35) + 10) * 10000
        items.push(`${prefix} ${a.toLocaleString('de-DE')} - ${b.toLocaleString('de-DE')} = ___`)
        solutionItems.push(`${prefix} ${a.toLocaleString('de-DE')} - ${b.toLocaleString('de-DE')} = ${(a - b).toLocaleString('de-DE')}`)
      }
    }
  }

  return {
    id: 1,
    type: 'kopfrechnen',
    title: 'Kopfrechnen / Grundrechenarten',
    instruction: 'Rechne die Aufgaben zügig im Kopf aus und trage das Ergebnis ein.',
    items,
    solutionItems,
  }
}

export function generateZahlenfolgenTask(
  grade: 1 | 2 | 3 | 4,
  maxNumber: number,
  count = 4
): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: string[] = []
  const solutionItems: string[] = []

  if (grade === 1) {
    const rules = [
      { step: 2, isAdd: true, rule: '+2' },
      { step: 2, isAdd: false, rule: '-2' },
      { step: 1, isAdd: true, rule: '+1' },
      { step: 5, isAdd: true, rule: '+5' },
    ]

    for (let i = 0; i < count; i++) {
      const r = rules[i % rules.length]
      const prefix = letters[i] || `${i + 1})`
      let startVal = 2
      if (r.isAdd) {
        startVal = r.step === 5 ? 5 : Math.floor(Math.random() * 6) + 1
      } else {
        startVal = Math.floor(Math.random() * 6) + 15
      }

      const seq: number[] = [startVal]
      for (let s = 1; s < 5; s++) {
        seq.push(r.isAdd ? seq[s - 1] + r.step : seq[s - 1] - r.step)
      }

      const given = seq.slice(0, 3)
      const next = seq.slice(3)
      items.push(`${prefix} ${given.join(', ')} , ___ , ___ (Regel: ${r.rule})`)
      solutionItems.push(`${prefix} ${given.join(', ')} , ${next.join(' , ')} (Regel: ${r.rule})`)
    }
  } else {
    const rules = [
      { step: 2, isAdd: true, rule: '+2' },
      { step: 3, isAdd: true, rule: '+3' },
      { step: 4, isAdd: true, rule: '+4' },
      { step: 5, isAdd: true, rule: '+5' },
      { step: 10, isAdd: true, rule: '+10' },
      { step: 10, isAdd: false, rule: '-10' },
    ]

    for (let i = 0; i < count; i++) {
      const r = rules[i % rules.length]
      const prefix = letters[i] || `${i + 1})`
      let startVal = 20
      if (r.isAdd) {
        startVal = (Math.floor(Math.random() * 8) + 2) * (r.step >= 5 ? 5 : 2)
      } else {
        startVal = (Math.floor(Math.random() * 4) + 6) * 10
      }

      const seq: number[] = [startVal]
      for (let s = 1; s < 6; s++) {
        seq.push(r.isAdd ? seq[s - 1] + r.step : seq[s - 1] - r.step)
      }

      const given = seq.slice(0, 3)
      const next = seq.slice(3)
      items.push(`${prefix} ${given.join(', ')} , ___ , ___ , ___ (Regel: ${r.rule})`)
      solutionItems.push(`${prefix} ${given.join(', ')} , ${next.join(' , ')} (Regel: ${r.rule})`)
    }
  }

  return {
    id: 1,
    type: 'zahlenfolgen',
    title: 'Zahlenfolgen & Zahlen ordnen',
    instruction: 'Setze die Zahlenfolgen fort. Achte auf die Rechenregel.',
    items,
    solutionItems,
  }
}

export function generateAnalogieaufgabenTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: string[] = []
  const solutionItems: string[] = []

  for (let i = 0; i < count; i++) {
    const isPlus = i % 2 === 0
    const prefix = letters[i] || `${i + 1})`

    let a = 3
    let b = 4
    if (isPlus) {
      a = Math.floor(Math.random() * 5) + 1 // 1..5
      b = Math.floor(Math.random() * (9 - a)) + 1 // a + b <= 9
      const zwergSol = a + b
      const rieseSol = a + 10 + b
      items.push(`${prefix} Zwerg: ${a} + ${b} = ___   ->   Riese: ${a + 10} + ${b} = ___`)
      solutionItems.push(`${prefix} Zwerg: ${a} + ${b} = ${zwergSol}   ->   Riese: ${a + 10} + ${b} = ${rieseSol}`)
    } else {
      a = Math.floor(Math.random() * 5) + 5 // 5..9
      b = Math.floor(Math.random() * (a - 2)) + 1 // b < a
      const zwergSol = a - b
      const rieseSol = a + 10 - b
      items.push(`${prefix} Zwerg: ${a} - ${b} = ___   ->   Riese: ${a + 10} - ${b} = ___`)
      solutionItems.push(`${prefix} Zwerg: ${a} - ${b} = ${zwergSol}   ->   Riese: ${a + 10} - ${b} = ${rieseSol}`)
    }
  }

  return {
    id: 1,
    type: 'analogieaufgaben',
    title: 'Analogieaufgaben (Zwerg & Riese)',
    instruction: 'Nutze die einfache Zwergenaufgabe, um die Riesenaufgabe blitzschnell zu lösen.',
    items,
    solutionItems,
  }
}

export function generateVerdoppelnHalbierenTask(count = 4): GeneratedTask {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const items: string[] = []
  const solutionItems: string[] = []

  const doublePool = [2, 3, 4, 5, 6, 7, 8, 9, 10].sort(() => Math.random() - 0.5)
  const halfPool = [4, 6, 8, 10, 12, 14, 16, 18, 20].sort(() => Math.random() - 0.5)

  for (let i = 0; i < count; i++) {
    const prefix = letters[i] || `${i + 1})`
    if (i % 2 === 0) {
      const n = doublePool[Math.floor(i / 2) % doublePool.length]
      items.push(`${prefix} Das Doppelte von ${n} ist ___ (Rechnung: ${n} + ${n} = ___)`)
      solutionItems.push(`${prefix} Das Doppelte von ${n} ist ${2 * n} (Rechnung: ${n} + ${n} = ${2 * n})`)
    } else {
      const n = halfPool[Math.floor(i / 2) % halfPool.length]
      items.push(`${prefix} Die Hälfte von ${n} ist ___ (denn ___ + ___ = ${n})`)
      solutionItems.push(`${prefix} Die Hälfte von ${n} ist ${n / 2} (denn ${n / 2} + ${n / 2} = ${n})`)
    }
  }

  return {
    id: 1,
    type: 'verdoppeln_halbieren',
    title: 'Verdoppeln & Halbieren (Tabellen/Spiegel)',
    instruction: 'Verdopple oder halbiere die Zahlen und begründe dein Ergebnis.',
    items,
    solutionItems,
  }
}

/**
 * Mappt einen einzelnen aktiven Chip deterministisch auf genau 1 Sektion.
 */
export function generateUniversalTaskWithConfig(
  rawType: string,
  topicConfig: TopicConfig,
  tasksPerLevel: number,
  index: number
): GeneratedTask {
  const normKey = normalizeUniversalTaskType(rawType)
  const { grade, maxNumber, allowCarry, topic } = topicConfig
  const count = Math.max(1, Math.min(tasksPerLevel || 4, 10))

  let task: GeneratedTask

  switch (normKey) {
    // ── 1. KLASSE 1 SPEZIAL-SEKTIONEN (Direktes deterministisches Rendering) ──
    case 'geld_zaehlen': {
      task = generateGeldZaehlenTask(count)
      break
    }
    case 'geld_rechnen': {
      task = generateGeldRechnenTask(count)
      break
    }
    case 'geld_vergleich': {
      task = generateGeldVergleichTask(count)
      break
    }
    case 'uhrzeit_ablesen': {
      task = generateUhrzeitAblesenTask(count)
      break
    }
    case 'uhrzeit_zeichnen': {
      task = generateUhrzeitZeichnenTask(undefined, count)
      break
    }
    case 'wochentage': {
      task = generateWochentageTask(count)
      break
    }
    case 'strichliste_ablesen': {
      task = generateStrichlisteAblesenTask(count)
      break
    }
    case 'strichliste_zeichnen': {
      task = generateStrichlisteZeichnenTask(count)
      break
    }
    case 'strichliste_zaehlen': {
      task = generateStrichlisteZaehlenTask()
      break
    }
    case 'geometrie_formen_zaehlen': {
      task = generateGeometrieFormenZaehlenTask()
      break
    }
    case 'geometrie_muster': {
      task = generateGeometrieMusterTask(count)
      break
    }
    case 'geometrie_punktgitter': {
      task = generateGeometriePunktgitterTask(count)
      break
    }
    case 'raum_gitter_orientierung': {
      task = generateRaumGitterOrientierungTask()
      break
    }
    case 'raum_pfeile_zaehlen': {
      task = generateRaumPfeileZaehlenTask()
      break
    }
    case 'raum_gitter_zeichnen': {
      task = generateRaumGitterZeichnenTask()
      break
    }

    // ── KLASSE 3 SPEZIALS ─────────────────────────────────────────
    case 'schriftlich_addition': {
      task = generateSchriftlicheAdditionTask(count)
      break
    }
    case 'schriftlich_subtraktion': {
      task = generateSchriftlicheSubtraktionTask(count)
      break
    }
    case 'schriftlich_fehlende_ziffern': {
      task = generateSchriftlichFehlendeZiffernTask(count)
      break
    }
    case 'ueberschlag_kontrolle': {
      task = generateUeberschlagKontrolleTask(count)
      break
    }
    case 'geld_schriftlich': {
      task = generateGeldSchriftlichTask(count)
      break
    }
    case 'stellenwert_hze': {
      task = generateStellenwertHZETask(count)
      break
    }
    case 'dienes_tausender': {
      task = generateDienesTausenderTask(count)
      break
    }
    case 'nachbarzahlen_k3': {
      task = generateNachbarzahlenKlasse3Task(count)
      break
    }
    case 'zahlenstrahl_1000': {
      task = generateZahlenstrahl1000Task(count)
      break
    }
    case 'runden_k3': {
      task = generateRundenKlasse3Task(count)
      break
    }
    case 'groesser_kleiner_ordnen_k3': {
      task = generateGroesserKleinerOrdnenK3Task(count)
      break
    }
    case 'halbschriftlich_k3': {
      task = generateHalbschriftlichK3Task(count)
      break
    }
    case 'kopfrechnen_k3': {
      task = generateKopfrechnenK3Task(count)
      break
    }
    case 'zahlenmauern_k3': {
      task = generateZahlenmauernK3Task(count)
      break
    }
    case 'zehner_einmaleins': {
      task = generateZehnerEinmaleinsTask(count)
      break
    }
    case 'halbschriftlich_multiplikation': {
      task = generateHalbschriftlichMultiplikationTask(count)
      break
    }
    case 'halbschriftlich_division': {
      task = generateHalbschriftlichDivisionTask(count)
      break
    }
    case 'wuerfelnetze': {
      task = generateWuerfelnetzeTask()
      break
    }
    case 'wuerfelgebaeude_bauplan': {
      task = generateWuerfelgebaeudeTask(count)
      break
    }
    case 'achsensymmetrie_k3': {
      task = generateAchsensymmetrieK3Task(count)
      break
    }
    case 'rechte_winkel_parallelen': {
      task = generateRechteWinkelParallelenTask(count)
      break
    }
    case 'laengen_umrechnen_k3': {
      task = generateLaengenUmrechnenK3Task(count)
      break
    }
    case 'laengen_komma_k3': {
      task = generateLaengenKommaK3Task(count)
      break
    }
    case 'rechnen_laengen': {
      task = generateRechnenLaengenK3Task(count)
      break
    }
    case 'gewichte_umrechnen_k3': {
      task = generateGewichteUmrechnenK3Task(count)
      break
    }
    case 'waagen_ablesen': {
      task = generateWaagenAblesenTask(count)
      break
    }
    case 'messbecher_ablesen': {
      task = generateMessbecherAblesenTask(count)
      break
    }
    case 'zeitpunkt_zeitdauer': {
      task = generateZeitpunktZeitdauerTask(count)
      break
    }
    case 'zeiteinheiten_k3': {
      task = generateZeiteinheitenK3Task(count)
      break
    }
    case 'balkendiagramm_k3': {
      task = generateBalkendiagrammK3Task()
      break
    }
    case 'wahrscheinlichkeit_k3': {
      task = generateWahrscheinlichkeitK3Task(count)
      break
    }
    case 'kombinatorik_baumdiagramm': {
      task = generateKombinatorikBaumdiagrammTask(count)
      break
    }
    case 'sachaufgaben_k3': {
      task = generateSachaufgabenK3Task(count)
      break
    }

    // ── 2. KLASSE 3 & 4 SPEZIALS ─────────────────────────────────
    case 'laengen_komma_k4': {
      task = generateLaengenKommaK4Task(count)
      break
    }
    case 'laengen_umrechnen_k4': {
      task = generateLaengenUmrechnenK4Task(count)
      break
    }
    case 'rechnen_laengen_k4': {
      task = generateRechnenLaengenK4Task(count)
      break
    }
    case 'gewichte_umrechnen_k4': {
      task = generateGewichteUmrechnenK4Task(count)
      break
    }
    case 'bruchteile_groessen_k4': {
      task = generateBruchteileGroessenK4Task(count)
      break
    }
    case 'rechnen_gewichte_k4': {
      task = generateRechnenGewichteK4Task(count)
      break
    }
    case 'sachaufgaben_k4': {
      task = generateSachaufgabenK4Task(count)
      break
    }
    case 'schriftlich': {
      task = generateSchriftlichTask(grade === 4 ? 4 : 3, count)
      break
    }
    case 'runden': {
      task = generateRundenTask(count)
      break
    }
    case 'flaeche_umfang': {
      task = generateFlaecheUmfangTask(Math.min(count, 4))
      break
    }
    case 'gewichte_hohlmasse': {
      task = generateGewichteHohlmasseTask(grade === 4 ? 4 : 3, count)
      break
    }
    case 'einheiten_umrechnen': {
      task = generateEinheitenUmrechnenTask(grade === 1 ? 2 : (grade as 2 | 3 | 4), count)
      break
    }
    case 'tabellen': {
      task = generateDiagrammTask(grade === 1 ? 2 : (grade as 2 | 3 | 4))
      break
    }

    // ── 3. KLASSE 2 SPEZIALS ─────────────────────────────────────
    case 'hundertertafel': {
      task = generateHundertertafelTask(count)
      break
    }
    case 'hunderterfeld_punkte': {
      task = generateHunderterfeldPunkteTask(count)
      break
    }
    case 'stellenwert_ze': {
      task = generateStellenwertZETask(count)
      break
    }
    case 'zehnerstangen_einer': {
      task = generateDienesBlocksTask(count)
      break
    }
    case 'nachbarzahlen_k2': {
      task = generateNachbarzahlenKlasse2Task(count)
      break
    }
    case 'halbschriftlich': {
      task = generateHalbschriftlichTask(count)
      break
    }
    case 'einmaleins_punktefeld': {
      task = generateMultiplicationArrayTask(count)
      break
    }
    case 'einmaleins': {
      const isKern = /kernaufgabe/i.test(topic)
      task = generateEinmaleinsTask(count, isKern)
      break
    }
    case 'division': {
      task = generateDivisionTask(count)
      break
    }
    case 'division_rest': {
      task = generateDivisionRestTask(count)
      break
    }
    case 'einmaleins_umkehr': {
      task = generateEinmaleinsUmkehrTask(Math.min(count, 2))
      break
    }
    case 'kalender_datum': {
      task = generateKalenderDatumTask(count)
      break
    }
    case 'zahlenfolgen': {
      task = generateZahlenfolgenTask(grade, maxNumber, count)
      break
    }
    case 'analogieaufgaben': {
      task = generateAnalogieaufgabenTask(count)
      break
    }
    case 'verdoppeln_halbieren': {
      task = generateVerdoppelnHalbierenTask(count)
      break
    }
    case 'geld_komma': {
      task = generateGeldKommaTask(count)
      break
    }
    case 'geld_rueckgeld': {
      task = generateGeldRueckgeldTask(count)
      break
    }
    case 'laengen_messen': {
      task = generateLaengenMessenTask(count)
      break
    }
    case 'laengen_umrechnen': {
      task = generateLaengenUmrechnenTask(count)
      break
    }
    case 'laengen_vergleich': {
      task = generateLaengenVergleichTask(count)
      break
    }
    case 'geometrie_koerper': {
      task = generateGeometrieKoerperTask(count)
      break
    }
    case 'achsensymmetrie': {
      task = generateAchsensymmetrieTask(count)
      break
    }
    case 'koerpernetze': {
      task = generateKoerpernetzeTask(count)
      break
    }
    case 'uhrzeit_ablesen_k2': {
      task = generateAnalogClockGrade2Task(count)
      break
    }
    case 'uhrzeit_zeichnen_k2': {
      task = generateZeigerEinzeichnenGrade2Task(count)
      break
    }
    case 'zeitspannen_k2': {
      task = generateZeitspannenGrade2Task(count)
      break
    }
    case 'diagramm_k2': {
      task = generateDiagrammKlasse2Task()
      break
    }
    case 'tabelle_k2': {
      task = generateTabelleKlasse2Task()
      break
    }
    case 'kombinatorik_k2': {
      task = generateKombinatorikKlasse2Task()
      break
    }

    // ── 4. KLASSE 1 DIDAKTIK & ANSCHAUUNG ────────────────────────
    case 'zwanzigerfeld': {
      task = generateZwanzigerfeldTask({
        thema: topic,
        maxNumber: grade === 1 ? maxNumber : 100,
        count,
      })
      break
    }
    case 'schuettelboxen': {
      task = generateSchuettelboxTask({
        thema: topic,
        maxNumber: Math.min(maxNumber, 10),
        count,
      })
      break
    }
    case 'zehnerstopp': {
      task = generateZehnerstoppTask({ count })
      break
    }
    case 'aufgabenfamilien': {
      task = generateAufgabenfamilienTask({
        maxNumber: grade === 1 ? maxNumber : 100,
        count,
      })
      break
    }
    case 'sachaufgaben': {
      task = generateRechengeschichtenTask({
        count,
        maxNumber,
        thema: topic,
      })
      break
    }

    // ── 5. GRÖSSEN & GEOMETRIE & DATEN (ALLGEMEIN) ────────────────
    case 'geld': {
      if (grade === 1) {
        task = index % 2 === 0 ? generateGeldZaehlenTask(count) : generateGeldRechnenTask(count)
      } else {
        task = generateGeldKommaTask(count)
      }
      break
    }
    case 'uhrzeit': {
      if (grade === 1) {
        task = index % 2 === 0 ? generateUhrzeitAblesenTask(count) : generateWochentageTask(count)
      } else {
        task = index % 2 === 0 ? generateUhrzeitZeichnenTask(undefined, count) : generateUhrzeitRechnenTask(count)
      }
      break
    }
    case 'strichlisten': {
      task = index % 2 === 0 ? generateStrichlisteAblesenTask(count) : generateStrichlisteZeichnenTask(count)
      break
    }
    case 'geometrie': {
      if (grade === 1) {
        task = index % 2 === 0 ? generateGeometrieFormenZaehlenTask() : generateGeometrieMusterTask(count)
      } else {
        task = generateGeometriePunktgitterTask(count)
      }
      break
    }
    case 'raumorientierung': {
      task = index % 2 === 0 ? generateRaumGitterOrientierungTask() : generateRaumPfeileZaehlenTask()
      break
    }

    // ── 6. GRUNDRECHENARTEN & SCHULBUCH-KLASSIKER (DYNAMISCH SKALIERT) ──
    case 'zahlenmauern': {
      const wallMax = maxNumber <= 10 ? 10 : maxNumber <= 20 ? 20 : maxNumber <= 100 ? 100 : 1000
      const gen = generateZahlenmauern(count, wallMax, 3)
      task = {
        id: index + 1,
        type: 'zahlenmauern',
        title: 'Zahlenmauern',
        instruction:
          'Rechne die Zahlenmauern von unten nach oben aus. Zwei Steine nebeneinander ergeben den Stein darüber.',
        items: gen.items,
        solutionItems: gen.solutionItems,
      }
      break
    }
    case 'rechendreiecke': {
      const gen = generateRechendreiecke(count, maxNumber, allowCarry)
      task = {
        id: index + 1,
        type: 'rechendreiecke',
        title: 'Rechendreiecke',
        instruction:
          'Die Summe zweier Innenzahlen ergibt die Zahl im Außenfeld. Trage die fehlenden Zahlen ein.',
        items: gen.items,
        solutionItems: gen.solutionItems,
      }
      break
    }
    case 'rechenhaeuser': {
      const gen = generateConsistentRechenhaeuser(count, maxNumber)
      task = {
        id: index + 1,
        type: 'rechenhaeuser',
        title: 'Rechenhäuser: Zahlen zerlegen',
        instruction:
          'Zerlege die Zahl im Dach. In jedem Stockwerk müssen beide Zahlen zusammen die Dachzahl ergeben.',
        items: gen.items,
        solutionItems: gen.solutionItems,
      }
      break
    }
    case 'nachbarzahlen': {
      task = generateScaledNachbarzahlenTask(grade, maxNumber, count)
      break
    }
    case 'groesser_kleiner_gleich': {
      task = generateScaledVergleichTask(grade, maxNumber, count)
      break
    }
    case 'kopfrechnen':
    default: {
      task = generateScaledKopfrechnenTask(grade, maxNumber, allowCarry, count)
      break
    }
  }

  task.id = index + 1
  return task
}

/**
 * DER ZENTRALE SEKTIONS-ROUTER:
 * Baut strikt aus den ausgewählten Aufgabentyp-Chips (`selectedTaskTypes`)
 * fortlaufend nummerierte Sektionen zusammen.
 */
export function buildSectionsFromSelectedTypes(
  selectedTaskTypes: string[],
  topicConfig: TopicConfig,
  tasksPerLevel = 4,
  taskCounts?: Record<string, number>
): GeneratedTask[] {
  const typesToUse =
    selectedTaskTypes && selectedTaskTypes.length > 0
      ? selectedTaskTypes
      : topicConfig.defaultTaskTypes

  return typesToUse.map((chip, idx) => {
    const normKey = normalizeUniversalTaskType(chip)
    const specificCount = (taskCounts && (
      taskCounts[chip] ??
      taskCounts[normKey] ??
      Object.entries(taskCounts).find(([k]) => chip.toLowerCase().includes(k.toLowerCase()) || normKey.toLowerCase().includes(k.toLowerCase()))?.[1]
    )) ?? tasksPerLevel

    return generateUniversalTaskWithConfig(chip, topicConfig, specificCount, idx)
  })
}

/**
 * HAUPTEINSTIEG: Generiert ein komplettes, deterministisches Arbeitsblatt.
 */
export function generateUniversalMathArbeitsblatt(
  options: UniversalMathOptions
): GeneratedWorksheet {
  const { grade = 1, thema, selectedTaskTypes, tasksPerLevel = 4, taskCounts } = options
  const topicConfig = getTopicConfig(grade, thema)
  const tasks = buildSectionsFromSelectedTypes(selectedTaskTypes || [], topicConfig, tasksPerLevel, taskCounts)

  return {
    titel: thema,
    tasks,
  }
}
