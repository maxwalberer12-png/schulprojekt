'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Clock, Sparkles, FileText, Mail, BookOpen, Layers,
  TrendingUp, ClipboardList, ClipboardCheck, CalendarDays, Target,
  LayoutGrid, BookMarked, Search, FileSignature, Stamp, ChevronDown,
  Info, Wand2, Copy, Check, Square, RotateCcw, AlertCircle, ShieldCheck,
  Printer, Layout, Sliders, Image as ImageIcon, RefreshCw
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Tool, ToolInputField } from '@/types/tools'
import { getCategoryMeta } from '@/config/tools.config'
import ArbeitsblattPreview from '@/components/ArbeitsblattPreview'
import { LEHRPLANPLUS_MATHE_DATENBANK, LehrplanEintrag } from '@/lib/curriculum/lehrplanplus_mathe'
import { resolveLehrplanStandard } from '@/lib/curriculum/resolver'
import {
  generateUniversalMathArbeitsblatt,
  getTopicConfig,
  normalizeUniversalTaskType,
  TopicConfig,
} from '@/lib/generators/universalMathGenerator'

export const GRADE_TASK_TYPES: Record<1 | 2 | 3 | 4, string[]> = {
  1: [
    'Kopfrechnen / Grundrechenarten',
    'Text-/Sachaufgaben (Rechengeschichten)',
    'Zahlenmauern',
    'Rechendreiecke',
    'Rechenhäuser',
    'Zwanzigerfeld / Punktefeld',
    'Schüttelboxen (Zahlzerlegung)',
    'Zehnerstopp (Rechnen in 2 Schritten)',
    'Tausch- & Umkehraufgaben',
    'Nachbarzahlen & Zahlenstrahl',
    'Größer/Kleiner/Gleich (< > =)',
    'Geld (Euro & Cent)',
    'Uhrzeiten (volle Stunden)',
    'Strichlisten & Häufigkeiten',
    'Geometrie & Formen',
    'Raumorientierung (Lagebeziehungen)',
  ],
  2: [
    'Kopfrechnen / Grundrechenarten',
    'Halbschriftliches Rechnen',
    'Malreihen & Division (Einmaleins)',
    'Hundertertafel & Zahlenrätsel',
    'Geld mit Komma (€ & ct)',
    'Längen messen (cm & m)',
    'Geometrische Körper & Symmetrie',
    'Zahlenmauern',
    'Rechendreiecke',
    'Rechenhäuser',
    'Tausch- & Umkehraufgaben',
    'Nachbarzahlen & Zahlenstrahl',
    'Größer/Kleiner/Gleich (< > =)',
    'Text-/Sachaufgaben (Frage, Rechnung, Antwort)',
    'Uhrzeiten & Zeitspannen',
    'Tabellen & Diagramme',
  ],
  3: [
    'Stellenwerttafel (H | Z | E) & Zahlwörter',
    'Tausenderbuch & Hunderterplatten (Dienes)',
    'Nachbarzahlen (Vorgänger, Nachbarzehner, Nachbarhunderter)',
    'Zahlenstrahl bis 1.000',
    'Runden auf Zehner und Hunderter',
    'Größer/Kleiner/Gleich & Zahlen ordnen',
    'Halbschriftliche Addition & Subtraktion (ZR 1.000)',
    'Kopfrechnen mit Hundertern & Zehnern',
    'Zahlenmauern & Rechendreiecke (ZR 1.000)',
    'Schriftliche Addition (im Kästchenraster)',
    'Schriftliche Subtraktion (im Kästchenraster)',
    'Fehlende Ziffern in schriftlichen Aufgaben',
    'Überschlagsrechnung & Kontrolle',
    'Zehner-Einmaleins (z.B. 4 · 60, 240 : 6)',
    'Halbschriftliche Multiplikation (in Schritten)',
    'Halbschriftliche Division (mit und ohne Rest)',
    'Würfelnetze & Quadernetze erkennen',
    'Würfelgebäude & Baupläne (Wie viele Würfel?)',
    'Achsensymmetrie (am Gitternetz)',
    'Rechte Winkel & Parallele Linien',
    'Einheiten umrechnen (mm, cm, m, km)',
    'Kommaschreibweise bei Längen (z.B. 1,45 m)',
    'Rechnen mit Längen',
    'Gewichte umrechnen & bis 1 kg ergänzen (g, kg, t)',
    'Waagen ablesen & Gewichte vergleichen',
    'Hohlmaße umrechnen & Messbecher ablesen (ml, l)',
    'Zeitpunkt & Zeitdauer berechnen',
    'Zeiteinheiten umrechnen (s, min, h)',
    'Schriftliches Rechnen mit Geldbeträgen (€ mit Komma)',
    'Balken- & Säulendiagramme auswerten',
    'Wahrscheinlichkeit (sicher, möglich, unmöglich)',
    'Kombinatorik (Baumdiagramm / Möglichkeiten)',
    'Text-/Sachaufgaben',
  ],
  4: [
    'Kopfrechnen / Grundrechenarten',
    'Schriftliche Addition & Subtraktion',
    'Schriftliche Multiplikation & Division',
    'Runden & Stellenwerte',
    'Flächeninhalt & Umfang (Rechteck & Quadrat)',
    'Zahlenmauern',
    'Nachbarzahlen & Zahlenstrahl',
    'Größer/Kleiner/Gleich (< > =)',
    'Geld mit Komma (€ & ct)',
    'Einheiten umrechnen',
    'Gewichte & Hohlmaße (g, kg, t / l, ml)',
    'Text-/Sachaufgaben (Frage, Rechnung, Antwort)',
    'Geometrische Körper & Symmetrie',
    'Tabellen & Diagramme',
  ],
}

export const MATHE_KEY_TO_LABEL: Record<string, string> = {
  // Allgemeine / Übergreifende Keys
  kopfrechnen: 'Kopfrechnen / Grundrechenarten',
  kopfrechnen_k2: 'Kopfrechnen (ZR 100)',
  sachaufgaben: 'Text-/Sachaufgaben (Rechengeschichten)',
  sachaufgaben_k2: 'Text-/Sachaufgaben',
  zahlenmauern: 'Zahlenmauern',
  groesser_kleiner_gleich: 'Größer/Kleiner/Gleich (< > =)',
  geld_vergleich_k2: 'Geldbeträge vergleichen (< > =)',
  einheiten_umrechnen: 'Einheiten umrechnen',
  nachbarzahlen: 'Nachbarzahlen & Zahlenstrahl',
  nachbarzahlen_k2: 'Nachbarzahlen & Zahlenstrahl (ZR 100)',
  tabellen: 'Tabellen & Diagramme',
  rechendreiecke: 'Rechendreiecke',
  rechenhaeuser: 'Rechenhäuser',
  zwanzigerfeld: 'Zwanzigerfeld / Punktefeld',
  schuettelboxen: 'Schüttelboxen (Zahlzerlegung)',
  zehnerstopp: 'Zehnerstopp (Rechnen in 2 Schritten)',
  aufgabenfamilien: 'Tausch- & Umkehraufgaben',
  zahlenfolgen: 'Zahlenfolgen & Zahlen ordnen',
  analogieaufgaben: 'Analogieaufgaben (Zwerg & Riese)',
  verdoppeln_halbieren: 'Verdoppeln & Halbieren (Tabellen/Spiegel)',

  // Klasse 1 Spezial-Sektionen
  geld_zaehlen: 'Münzen & Scheine zählen',
  geld_rechnen: 'Rechnen mit Geld (€ & ct)',
  geld_vergleich: 'Geldbeträge vergleichen & Rückgeld',
  uhrzeit_ablesen: 'Analoge Uhren ablesen (volle Stunden)',
  uhrzeit_zeichnen: 'Stundenzeiger einzeichnen',
  wochentage: 'Zeitspannen & Wochentage',
  strichliste_ablesen: 'Strichlisten ablesen (5er-Bündel)',
  strichliste_zeichnen: 'Strichlisten selbst zeichnen',
  strichliste_zaehlen: 'Objekte zählen & Häufigkeitstabelle',
  geometrie_formen_zaehlen: 'Grundformen erkennen & zählen',
  geometrie_muster: 'Geometrische Musterreihen fortsetzen',
  geometrie_punktgitter: 'Figuren & Spiegelbilder am Punktgitter',
  raum_gitter_orientierung: '3x3-Gitter (links, rechts, oben, unten)',
  raum_pfeile_zaehlen: 'Richtungspfeile zählen',
  raum_gitter_zeichnen: 'Formen nach Anweisung zeichnen',

  // Klasse 2 Spezial-Sektionen
  hundertertafel: 'Hundertertafel & Zahlenkreuz',
  hunderterfeld_punkte: 'Hunderterfeld (Punktefeld 10x10)',
  zehnerstangen_einer: 'Zehnerstangen & Einerwürfel (Bündeln)',
  stellenwert_ze: 'Stellenwerttafel (Z/E) & Ergänzen auf 100',
  halbschriftlich: 'Halbschriftliches Rechnen (in Schritten)',
  einmaleins_punktefeld: '1x1 Punktefelder (Plus- & Malaufgabe)',
  einmaleins: 'Einmaleins-Reihen & Kopfrechnen',
  division: 'Geteilt-Aufgaben (Division)',
  division_rest: 'Division mit Rest (Einführung)',
  einmaleins_umkehr: 'Tausch- & Umkehraufgaben (1x1)',
  geometrie_koerper: 'Geometrische Körper (Steckbriefe: Ecken, Kanten, Flächen)',
  achsensymmetrie: 'Achsensymmetrie (Spiegelbilder am Gitter)',
  koerpernetze: 'Körpernetze & Würfelgebäude',
  laengen_messen: 'Strecken mit dem Lineal messen (cm)',
  laengen_umrechnen: 'Längen umrechnen (m & cm)',
  laengen_vergleich: 'Längen vergleichen & berechnen',
  geld_komma: 'Geldbeträge in Kommaschreibweise',
  geld_rueckgeld: 'Rechnen mit Geld & Rückgeld (Kassenbon)',
  uhrzeit_ablesen_k2: 'Uhrzeiten ablesen (Viertel, Halb, 5-Minuten)',
  uhrzeit_zeichnen_k2: 'Zeiger einzeichnen (Stunde & Minute)',
  zeitspannen_k2: 'Zeitspannen & Zeitdauer berechnen',
  kalender_datum: 'Kalender & Datum lesen',
  diagramm_k2: 'Säulendiagramm / Balkendiagramm ablesen',
  tabelle_k2: 'Tabellen & Strichlisten auswerten',
  kombinatorik_k2: 'Kombinatorik & Zufallsexperimente',

  // Klasse 3 Spezial-Sektionen
  stellenwert_hze: 'Stellenwerttafel (H | Z | E) & Zahlwörter',
  dienes_tausender: 'Tausenderbuch & Hunderterplatten (Dienes)',
  nachbarzahlen_k3: 'Nachbarzahlen (Vorgänger, Nachbarzehner, Nachbarhunderter)',
  zahlenstrahl_1000: 'Zahlenstrahl bis 1.000',
  runden_k3: 'Runden auf Zehner und Hunderter',
  groesser_kleiner_ordnen_k3: 'Größer/Kleiner/Gleich & Zahlen ordnen',
  halbschriftlich_k3: 'Halbschriftliche Addition & Subtraktion (ZR 1.000)',
  kopfrechnen_k3: 'Kopfrechnen mit Hundertern & Zehnern',
  zahlenmauern_k3: 'Zahlenmauern & Rechendreiecke (ZR 1.000)',
  schriftlich_addition: 'Schriftliche Addition (im Kästchenraster)',
  schriftlich_subtraktion: 'Schriftliche Subtraktion (im Kästchenraster)',
  schriftlich_fehlende_ziffern: 'Fehlende Ziffern in schriftlichen Aufgaben',
  ueberschlag_kontrolle: 'Überschlagsrechnung & Kontrolle',
  zehner_einmaleins: 'Zehner-Einmaleins (z.B. 4 · 60, 240 : 6)',
  halbschriftlich_multiplikation: 'Halbschriftliche Multiplikation (in Schritten)',
  halbschriftlich_division: 'Halbschriftliche Division (mit und ohne Rest)',
  wuerfelnetze: 'Würfelnetze & Quadernetze erkennen',
  wuerfelgebaeude_bauplan: 'Würfelgebäude & Baupläne (Wie viele Würfel?)',
  achsensymmetrie_k3: 'Achsensymmetrie (am Gitternetz)',
  rechte_winkel_parallelen: 'Rechte Winkel & Parallele Linien',
  laengen_umrechnen_k3: 'Einheiten umrechnen (mm, cm, m, km)',
  laengen_komma_k3: 'Kommaschreibweise bei Längen (z.B. 1,45 m)',
  rechnen_laengen: 'Rechnen mit Längen',
  gewichte_umrechnen_k3: 'Gewichte umrechnen & bis 1 kg ergänzen (g, kg, t)',
  waagen_ablesen: 'Waagen ablesen & Gewichte vergleichen',
  messbecher_ablesen: 'Hohlmaße umrechnen & Messbecher ablesen (ml, l)',
  zeitpunkt_zeitdauer: 'Zeitpunkt & Zeitdauer berechnen',
  zeiteinheiten_k3: 'Zeiteinheiten umrechnen (s, min, h)',
  geld_schriftlich: 'Schriftliches Rechnen mit Geldbeträgen (€ mit Komma)',
  balkendiagramm_k3: 'Balken- & Säulendiagramme auswerten',
  wahrscheinlichkeit_k3: 'Wahrscheinlichkeit (sicher, möglich, unmöglich)',
  kombinatorik_baumdiagramm: 'Kombinatorik (Baumdiagramm / Möglichkeiten)',
  sachaufgaben_k3: 'Text-/Sachaufgaben',

  // Klasse 3 & 4
  schriftlich: 'Schriftliche Addition & Subtraktion',
  schriftlich_mult_div: 'Schriftliche Multiplikation & Division',
  runden: 'Runden & Stellenwerte',
  flaeche_umfang: 'Flächeninhalt & Umfang (Rechteck & Quadrat)',
  gewichte_hohlmasse: 'Gewichte & Hohlmaße (g, kg, t / l, ml)',

  // Klasse 4 Größen & Messen Spezial-Sektionen
  laengen_komma_k4: 'Kommaschreibweise bei Längen (z.B. 2,35 m, 1,5 km)',
  laengen_umrechnen_k4: 'Große Längeneinheiten umrechnen (km, m, dm, cm, mm)',
  rechnen_laengen_k4: 'Rechnen mit Längen (mit Komma)',
  gewichte_umrechnen_k4: 'Gewichte umrechnen (t, kg, g)',
  bruchteile_groessen_k4: 'Bruchteile von Größen (z.B. ½ kg = 500 g, ¼ t = 250 kg)',
  rechnen_gewichte_k4: 'Rechnen mit Gewichten (t, kg, g)',
  sachaufgaben_k4: 'Text-/Sachaufgaben zu Größen',
}

export const MATHE_LABEL_TO_KEY: Record<string, string> = {
  // Klasse 4 Größen & Messen Labels
  'Kommaschreibweise bei Längen (z.B. 2,35 m, 1,5 km)': 'laengen_komma_k4',
  'Große Längeneinheiten umrechnen (km, m, dm, cm, mm)': 'laengen_umrechnen_k4',
  'Rechnen mit Längen (mit Komma)': 'rechnen_laengen_k4',
  'Gewichte umrechnen (t, kg, g)': 'gewichte_umrechnen_k4',
  'Bruchteile von Größen (z.B. ½ kg = 500 g, ¼ t = 250 kg)': 'bruchteile_groessen_k4',
  'Rechnen mit Gewichten (t, kg, g)': 'rechnen_gewichte_k4',
  'Text-/Sachaufgaben zu Größen': 'sachaufgaben_k4',

  // Grundrechenarten & Kopfrechnen
  'Kopfrechnen / Grundrechenarten': 'kopfrechnen',
  'Kopfrechnen (ZR 100)': 'kopfrechnen_k2',
  'Kopfrechnen mit Hundertern & Zehnern': 'kopfrechnen_k3',
  'Kopfrechnen': 'kopfrechnen',
  'Text-/Sachaufgaben (Frage, Rechnung, Antwort)': 'sachaufgaben',
  'Text-/Sachaufgaben (Rechengeschichten)': 'sachaufgaben',
  'Text-/Sachaufgaben': 'sachaufgaben_k3',
  'Zahlenmauern': 'zahlenmauern',
  'Zahlenmauern & Rechendreiecke (ZR 1.000)': 'zahlenmauern_k3',
  'Größer/Kleiner/Gleich (< > =)': 'groesser_kleiner_gleich',
  'Größer/Kleiner/Gleich & Zahlen ordnen': 'groesser_kleiner_ordnen_k3',
  'Einheiten umrechnen': 'einheiten_umrechnen',
  'Einheiten umrechnen (mm, cm, m, km)': 'laengen_umrechnen_k3',
  'Nachbarzahlen & Zahlenstrahl': 'nachbarzahlen',
  'Nachbarzahlen & Zahlenstrahl (ZR 100)': 'nachbarzahlen_k2',
  'Nachbarzahlen (Vorgänger, Nachbarzehner, Nachbarhunderter)': 'nachbarzahlen_k3',
  'Zahlenstrahl bis 1.000': 'zahlenstrahl_1000',
  'Runden auf Zehner und Hunderter': 'runden_k3',
  'Tabellen & Diagramme': 'tabellen',
  'Rechendreiecke': 'rechendreiecke',
  'Rechenhäuser': 'rechenhaeuser',
  'Zwanzigerfeld / Punktefeld': 'zwanzigerfeld',
  'Zwanzigerfeld': 'zwanzigerfeld',
  'Punktefeld': 'zwanzigerfeld',
  'Zehnerfeld': 'zwanzigerfeld',
  'Tausch- & Umkehraufgaben': 'aufgabenfamilien',
  'Tausch- & Umkehraufgaben (Aufgabenfamilien)': 'einmaleins_umkehr',
  'Aufgabenfamilien': 'aufgabenfamilien',
  'Schüttelboxen (Zahlzerlegung)': 'schuettelboxen',
  'Schüttelboxen': 'schuettelboxen',
  'Zehnerstopp (Rechnen in 2 Schritten)': 'zehnerstopp',
  'Zehnerstopp': 'zehnerstopp',
  'Zahlenfolgen & Zahlen ordnen': 'zahlenfolgen',
  'Zahlenfolgen': 'zahlenfolgen',
  'Analogieaufgaben (Zwerg & Riese)': 'analogieaufgaben',
  'Analogieaufgaben': 'analogieaufgaben',
  'Verdoppeln & Halbieren (Tabellen/Spiegel)': 'verdoppeln_halbieren',
  'Verdoppeln & Halbieren': 'verdoppeln_halbieren',

  // Klasse 3 Spezifika
  'Stellenwerttafel (H | Z | E) & Zahlwörter': 'stellenwert_hze',
  'Tausenderbuch & Hunderterplatten (Dienes)': 'dienes_tausender',
  'Halbschriftliche Addition & Subtraktion (ZR 1.000)': 'halbschriftlich_k3',
  'Schriftliche Addition (im Kästchenraster)': 'schriftlich_addition',
  'Schriftliche Addition': 'schriftlich_addition',
  'Schriftliche Subtraktion (im Kästchenraster)': 'schriftlich_subtraktion',
  'Schriftliche Subtraktion': 'schriftlich_subtraktion',
  'Fehlende Ziffern in schriftlichen Aufgaben': 'schriftlich_fehlende_ziffern',
  'Fehlende Ziffern in schriftlichen Aufgaben (Kleckse)': 'schriftlich_fehlende_ziffern',
  'Überschlagsrechnung & Kontrolle': 'ueberschlag_kontrolle',
  'Zehner-Einmaleins (z.B. 4 · 60, 240 : 6)': 'zehner_einmaleins',
  'Zehner-Einmaleins': 'zehner_einmaleins',
  'Halbschriftliche Multiplikation (in Schritten)': 'halbschriftlich_multiplikation',
  'Halbschriftliche Division (mit und ohne Rest)': 'halbschriftlich_division',
  'Würfelnetze & Quadernetze erkennen': 'wuerfelnetze',
  'Würfelgebäude & Baupläne (Wie viele Würfel?)': 'wuerfelgebaeude_bauplan',
  'Würfelgebäude & Baupläne': 'wuerfelgebaeude_bauplan',
  'Achsensymmetrie (am Gitternetz)': 'achsensymmetrie_k3',
  'Rechte Winkel & Parallele Linien': 'rechte_winkel_parallelen',
  'Kommaschreibweise bei Längen (z.B. 1,45 m)': 'laengen_komma_k3',
  'Kommaschreibweise bei Längen': 'laengen_komma_k3',
  'Rechnen mit Längen': 'rechnen_laengen',
  'Gewichte umrechnen & bis 1 kg ergänzen (g, kg, t)': 'gewichte_umrechnen_k3',
  'Waagen ablesen & Gewichte vergleichen': 'waagen_ablesen',
  'Hohlmaße umrechnen & Messbecher ablesen (ml, l)': 'messbecher_ablesen',
  'Zeitpunkt & Zeitdauer berechnen': 'zeitpunkt_zeitdauer',
  'Zeiteinheiten umrechnen (s, min, h)': 'zeiteinheiten_k3',
  'Schriftliches Rechnen mit Geldbeträgen (€ mit Komma)': 'geld_schriftlich',
  'Balken- & Säulendiagramme auswerten': 'balkendiagramm_k3',
  'Wahrscheinlichkeit (sicher, möglich, unmöglich)': 'wahrscheinlichkeit_k3',
  'Kombinatorik (Baumdiagramm / Möglichkeiten)': 'kombinatorik_baumdiagramm',

  // Klasse 1 Geometrie / Größen / Daten
  'Münzen & Scheine zählen': 'geld_zaehlen',
  'Rechnen mit Geld (€ & ct)': 'geld_rechnen',
  'Geldbeträge vergleichen & Rückgeld': 'geld_vergleich',
  'Analoge Uhren ablesen (volle Stunden)': 'uhrzeit_ablesen',
  'Stundenzeiger einzeichnen': 'uhrzeit_zeichnen',
  'Zeitspannen & Wochentage': 'wochentage',
  'Strichlisten ablesen (5er-Bündel)': 'strichliste_ablesen',
  'Strichlisten selbst zeichnen': 'strichliste_zeichnen',
  'Objekte zählen & Häufigkeitstabelle': 'strichliste_zaehlen',
  'Grundformen erkennen & zählen': 'geometrie_formen_zaehlen',
  'Geometrische Musterreihen fortsetzen': 'geometrie_muster',
  'Figuren & Spiegelbilder am Punktgitter': 'geometrie_punktgitter',
  '3x3-Gitter (links, rechts, oben, unten)': 'raum_gitter_orientierung',
  'Richtungspfeile zählen': 'raum_pfeile_zaehlen',
  'Formen nach Anweisung zeichnen': 'raum_gitter_zeichnen',

  // Klasse 2
  'Hundertertafel & Zahlenkreuz': 'hundertertafel',
  'Hundertertafel & Zahlenrätsel': 'hundertertafel',
  'Hundertertafel': 'hundertertafel',
  'Hunderterfeld (Punktefeld 10x10)': 'hunderterfeld_punkte',
  'Hunderterfeld': 'hunderterfeld_punkte',
  'Zehnerstangen & Einerwürfel (Bündeln)': 'zehnerstangen_einer',
  'Stellenwerttafel (Z/E) & Ergänzen auf 100': 'stellenwert_ze',
  'Stellenwerttafel (Z/E)': 'stellenwert_ze',
  'Halbschriftliches Rechnen (in Schritten)': 'halbschriftlich',
  'Halbschriftliches Rechnen': 'halbschriftlich',
  'Halbschriftlich': 'halbschriftlich',
  '1x1 Punktefelder (Plus- & Malaufgabe)': 'einmaleins_punktefeld',
  'Einmaleins-Reihen & Kopfrechnen': 'einmaleins',
  'Malreihen & Division (Einmaleins)': 'einmaleins',
  'Malreihen & Division': 'einmaleins',
  'Einmaleins': 'einmaleins',
  'Geteilt-Aufgaben (Division)': 'division',
  'Division mit Rest (Einführung)': 'division_rest',
  'Division mit Rest': 'division_rest',
  'Tausch- & Umkehraufgaben (1x1)': 'einmaleins_umkehr',
  'Geometrische Körper (Steckbriefe: Ecken, Kanten, Flächen)': 'geometrie_koerper',
  'Geometrische Körper (Steckbriefe)': 'geometrie_koerper',
  'Geometrische Körper & Symmetrie': 'geometrie_koerper',
  'Geometrische Körper': 'geometrie_koerper',
  'Achsensymmetrie (Spiegelbilder am Gitter)': 'achsensymmetrie',
  'Achsensymmetrie (Spiegelbilder zeichnen)': 'achsensymmetrie',
  'Körpernetze & Würfelgebäude': 'koerpernetze',
  'Körpernetze & Ansichten': 'koerpernetze',
  'Strecken mit dem Lineal messen (cm)': 'laengen_messen',
  'Längen messen (cm & m)': 'laengen_messen',
  'Längen messen': 'laengen_messen',
  'Längen umrechnen (m & cm)': 'laengen_umrechnen',
  'Längen vergleichen & berechnen': 'laengen_vergleich',
  'Geldbeträge in Kommaschreibweise': 'geld_komma',
  'Geld mit Komma (€ & ct)': 'geld_komma',
  'Geld mit Komma': 'geld_komma',
  'Rechnen mit Geld & Rückgeld (Kassenbon)': 'geld_rueckgeld',
  'Rechnen mit Geld & Rückgeld (bis 100 €)': 'geld_rueckgeld',
  'Geldbeträge vergleichen (< > =)': 'geld_vergleich_k2',
  'Uhrzeiten ablesen (Viertel, Halb, 5-Minuten)': 'uhrzeit_ablesen_k2',
  'Uhrzeiten ablesen (Viertel, Halb, Minuten)': 'uhrzeit_ablesen_k2',
  'Zeiger einzeichnen (Stunde & Minute)': 'uhrzeit_zeichnen_k2',
  'Zeitspannen & Zeitdauer berechnen': 'zeitspannen_k2',
  'Kalender & Datum lesen': 'kalender_datum',
  'Kalender & Datum': 'kalender_datum',
  'Säulendiagramm / Balkendiagramm ablesen': 'diagramm_k2',
  'Tabellen & Strichlisten auswerten': 'tabelle_k2',
  'Tabelle auswerten & ergänzen': 'tabelle_k2',
  'Kombinatorik & Zufallsexperimente': 'kombinatorik_k2',
  'Kombinatorik & Zufall': 'kombinatorik_k2',

  // Klassen 3 & 4
  'Schriftliche Addition & Subtraktion': 'schriftlich',
  'Schriftliche Multiplikation & Division': 'schriftlich',
  'Runden & Stellenwerte': 'runden',
  'Flächeninhalt & Umfang (Rechteck & Quadrat)': 'flaeche_umfang',
  'Gewichte & Hohlmaße (g, kg / l, ml)': 'gewichte_hohlmasse',
  'Gewichte & Hohlmaße (g, kg, t / l, ml)': 'gewichte_hohlmasse',
}

export function filterOrFallbackTaskTypes(
  selectedLabelsOrKeys: string[],
  aktivesThema: LehrplanEintrag | null | undefined,
  grade?: number
): string[] {
  const normGrade = (Math.min(Math.max(grade ?? aktivesThema?.klasse ?? 1, 1), 4) as 1 | 2 | 3 | 4)
  const topicTitle = aktivesThema?.titel || ''
  const topicConfig = getTopicConfig(normGrade, topicTitle)

  const allowedKeys =
    topicConfig.availableTaskTypes && topicConfig.availableTaskTypes.length > 0
      ? new Set(topicConfig.availableTaskTypes)
      : new Set((GRADE_TASK_TYPES[normGrade] || []).map((l) => MATHE_LABEL_TO_KEY[l] || l))

  const validSelection = selectedLabelsOrKeys
    .map((item) => {
      const key = MATHE_LABEL_TO_KEY[item] || item
      return allowedKeys.has(key) ? (MATHE_KEY_TO_LABEL[key] || item) : null
    })
    .filter((x): x is string => Boolean(x))

  if (validSelection.length > 0) {
    return validSelection
  }

  return topicConfig.defaultTaskTypes.map((k) => MATHE_KEY_TO_LABEL[k] || k)
}

const ICON_MAP: Record<string, React.ElementType> = {
  FileText, Mail, BookOpen, Layers, TrendingUp, ClipboardList,
  ClipboardCheck, CalendarDays, Target, LayoutGrid, BookMarked,
  Search, FileSignature, Stamp,
}

const CATEGORY_STYLES: Record<string, { headerBg: string; badge: string }> = {
  zeugnisse: { headerBg: 'from-violet-50 to-white', badge: 'bg-violet-100 text-violet-700' },
  eltern: { headerBg: 'from-blue-50 to-white', badge: 'bg-blue-100 text-blue-700' },
  unterricht: { headerBg: 'from-green-50 to-white', badge: 'bg-green-100 text-green-700' },
  differenzierung: { headerBg: 'from-orange-50 to-white', badge: 'bg-orange-100 text-orange-700' },
  foerderung: { headerBg: 'from-pink-50 to-white', badge: 'bg-pink-100 text-pink-700' },
  verwaltung: { headerBg: 'from-gray-50 to-white', badge: 'bg-gray-100 text-gray-700' },
}

export function normalizeSubjectKey(
  rawSubject?: string
): 'Mathematik' | 'Sachunterricht' | 'Deutsch' | 'Englisch' {
  const lower = (rawSubject || '').toLowerCase().trim()
  if (lower.includes('mathe') || lower.includes('rechnen')) return 'Mathematik'
  if (
    lower.includes('sach') ||
    lower.includes('hsu') ||
    lower.includes('heimat') ||
    lower.includes('natur')
  ) {
    return 'Sachunterricht'
  }
  if (lower.includes('engl')) return 'Englisch'
  return 'Deutsch'
}

export const SUBJECT_CONFIGS: Record<
  'Mathematik' | 'Sachunterricht' | 'Deutsch' | 'Englisch',
  {
    taskTypes: string[]
    defaultTaskTypes: string[]
    extraOptionLabel: string
    extraOptionKey: string
  }
> = {
  Mathematik: {
    taskTypes: [
      'Kopfrechnen / Grundrechenarten',
      'Text-/Sachaufgaben (Frage, Rechnung, Antwort)',
      'Zahlenmauern',
      'Größer/Kleiner/Gleich (< > =)',
      'Einheiten umrechnen',
      'Nachbarzahlen & Zahlenstrahl',
      'Tabellen & Diagramme',
      'Rechendreiecke',
      'Rechenhäuser',
      'Zwanzigerfeld / Punktefeld',
      'Tausch- & Umkehraufgaben',
      'Schüttelboxen (Zahlzerlegung)',
      'Zehnerstopp (Rechnen in 2 Schritten)',
      'Hundertertafel & Zahlenrätsel',
      'Halbschriftliches Rechnen',
      'Malreihen & Division (Einmaleins)',
      'Geld mit Komma (€ & ct)',
      'Längen messen (cm & m)',
      'Geometrische Körper & Symmetrie',
      'Geometrie & Formen',
    ],
    defaultTaskTypes: [
      'Kopfrechnen / Grundrechenarten',
      'Text-/Sachaufgaben (Frage, Rechnung, Antwort)',
      'Zahlenmauern',
    ],
    extraOptionLabel: 'Kariertes Rechenkästchen-Feld anzeigen',
    extraOptionKey: 'show_rechenkaestchen',
  },
  Sachunterricht: {
    taskTypes: [
      'Lückentext mit Fachbegriffen',
      'Richtig/Falsch-Aussagen',
      'Prozesse nummerieren/sortieren',
      'Zuordnungsaufgaben',
      'Kurze Erklärfragen',
    ],
    defaultTaskTypes: [
      'Lückentext mit Fachbegriffen',
      'Richtig/Falsch-Aussagen',
      'Zuordnungsaufgaben',
    ],
    extraOptionLabel: 'Wortspeicher-Box oben anzeigen',
    extraOptionKey: 'show_wortspeicher',
  },
  Deutsch: {
    taskTypes: [
      'Schüttelsätze',
      'Wortarten bestimmen',
      'Satzzeichen setzen',
      'Leseverständnis',
      'Freies Schreiben',
      'Lückentext',
    ],
    defaultTaskTypes: [
      'Schüttelsätze',
      'Wortarten bestimmen',
      'Satzzeichen setzen',
    ],
    extraOptionLabel: 'Wortspeicher-Box oben anzeigen',
    extraOptionKey: 'show_wortspeicher',
  },
  Englisch: {
    taskTypes: [
      'Vokabelzuordnung',
      'Matching (Bild/Wort)',
      'Lückentext',
      'Kurzantworten',
    ],
    defaultTaskTypes: ['Vokabelzuordnung', 'Lückentext'],
    extraOptionLabel: 'Wortspeicher-Box oben anzeigen',
    extraOptionKey: 'show_wortspeicher',
  },
}

export function getSubjectConfig(subject?: string) {
  const key = normalizeSubjectKey(subject)
  return SUBJECT_CONFIGS[key]
}

export function getRecommendedTaskTypesForTopic(
  fach?: string,
  thema?: string
): string[] | null {
  const normFach = normalizeSubjectKey(fach)
  const normThema = (thema || '').toLowerCase().trim()
  if (!normThema) return null

  if (normFach === 'Mathematik') {
    // 1. Division / Multiplikation / Einmaleins
    if (
      /divid|teil|geteilt|multipli|mal\b|einmaleins|1x1|malnehmen|produkt|quotient|faktor/i.test(
        normThema
      )
    ) {
      return [
        'Kopfrechnen / Grundrechenarten',
        'Text-/Sachaufgaben (Frage, Rechnung, Antwort)',
        'Größer/Kleiner/Gleich (< > =)',
      ]
    }
    // 2. Geometrie / Formen / Körper
    if (
      /geometrie|form|körper|würfel|quader|kugel|dreieck|rechteck|quadrat|symmetrie|spiegel/i.test(
        normThema
      )
    ) {
      return [
        'Geometrie & Formen',
        'Text-/Sachaufgaben (Frage, Rechnung, Antwort)',
      ]
    }
    // 3. Größen / Einheiten / Geld / Längen
    if (
      /einheit|größ|geld|euro|cent|ct|€|läng|meter|cm|km|gewicht|kilo|gramm|zeit|uhr/i.test(
        normThema
      )
    ) {
      if (/k1_|klasse 1|1\. klasse|bis 20\s*€|volle stunden/i.test(normThema)) {
        return [
          'Text-/Sachaufgaben (Frage, Rechnung, Antwort)',
          'Größer/Kleiner/Gleich (< > =)',
          'Kopfrechnen / Grundrechenarten',
        ]
      }
      return [
        'Einheiten umrechnen',
        'Text-/Sachaufgaben (Frage, Rechnung, Antwort)',
        'Größer/Kleiner/Gleich (< > =)',
      ]
    }
    // 4. Nachbarzahlen / Zahlenstrahl / Orientierung
    if (
      /nachbar|zahlenstrahl|orientier|stellenwert|vorgänger|nachfolger|zehner|hunderter/i.test(
        normThema
      )
    ) {
      return [
        'Nachbarzahlen & Zahlenstrahl',
        'Größer/Kleiner/Gleich (< > =)',
        'Kopfrechnen / Grundrechenarten',
      ]
    }
    // 5. Addition / Subtraktion / Zahlenmauern / Rechendreiecke / Rechenhäuser
    if (/addit|subtra|plus|minus|zahlenmauer|rechendreieck|rechenhaus|zerleg/i.test(normThema)) {
      return [
        'Kopfrechnen / Grundrechenarten',
        'Zahlenmauern',
        'Text-/Sachaufgaben (Frage, Rechnung, Antwort)',
      ]
    }
    // 6. Tabellen & Diagramme
    if (/tabelle|diagramm|daten|strichliste|säulendiagramm/i.test(normThema)) {
      return [
        'Tabellen & Diagramme',
        'Text-/Sachaufgaben (Frage, Rechnung, Antwort)',
      ]
    }
  }

  if (normFach === 'Deutsch') {
    if (/lese|text|verständnis|geschichte/i.test(normThema)) {
      return ['Leseverständnis', 'Lückentext']
    }
    if (/wortart|nomen|verb|adjektiv/i.test(normThema)) {
      return ['Wortarten bestimmen', 'Lückentext']
    }
    if (/satz|schüttelsatz|zeichen|punkt|komma/i.test(normThema)) {
      return ['Schüttelsätze', 'Satzzeichen setzen']
    }
  }

  return null
}

interface ToolDetailClientProps {
  tool: Tool
}

export default function ToolDetailClient({ tool }: ToolDetailClientProps) {
  const isWorksheet = tool.id === 'aufgaben-differenziert' || tool.category === 'differenzierung'

  const [formValues, setFormValues] = useState<Record<string, string>>({
    fach: 'Mathematik',
    klasse: '1. Klasse',
    thema: 'Zahlenraum bis 10: Zahlzerlegung & Verliebte Zahlen',
    seitenumfang: '1 DIN-A4-Seite (Kompakt)',
    diff_modus: 'Alle Niveaustufen auf einem Blatt (Stern-System)',
    anzahl_aufgaben: '3',
    show_wortspeicher: 'false',
    show_rechenkaestchen: 'true',
    show_loesung: 'true',
    show_notenraster: 'false',
    show_illustration: 'true',
    illustration_position: 'header',
    bild_motiv: '',
    bild_stil: 'vektor',
    aufgabentypen: 'Zwanzigerfeld / Punktefeld, Tausch- & Umkehraufgaben, Schüttelboxen (Zahlzerlegung)',
  })

  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({})
  const [output, setOutput] = useState<string>('')
  const [illustrationUrl, setIllustrationUrl] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<'worksheet' | 'markdown'>(isWorksheet ? 'worksheet' : 'markdown')
  const abortControllerRef = useRef<AbortController | null>(null)

  // ── Live-Update / Reaktivität für Arbeitsblätter (Klassen 1 bis 4) ──
  useEffect(() => {
    if (!isWorksheet) return
    const isMath = normalizeSubjectKey(formValues.fach) === 'Mathematik'
    const parsedGrade = parseInt((formValues.klasse || '1').match(/\d+/)?.[0] || '1', 10)
    const normGrade = (Math.min(Math.max(parsedGrade, 1), 4) as 1 | 2 | 3 | 4)
    if (!isMath) return

    const activeTypes = (formValues.aufgabentypen || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const curTasksPerLevel = parseInt((formValues.anzahl_aufgaben || '3').match(/\d+/)?.[0] || '3', 10)

    const generated = generateUniversalMathArbeitsblatt({
      grade: normGrade,
      thema: formValues.thema,
      selectedTaskTypes: activeTypes,
      tasksPerLevel: curTasksPerLevel,
      taskCounts,
    })
    setOutput(JSON.stringify(generated, null, 2))
  }, [
    isWorksheet,
    formValues.fach,
    formValues.klasse,
    formValues.thema,
    formValues.aufgabentypen,
    formValues.anzahl_aufgaben,
    taskCounts,
  ])

  const Icon = ICON_MAP[tool.icon] ?? FileText
  const catMeta = getCategoryMeta(tool.category)
  const styles = CATEGORY_STYLES[tool.category] ?? CATEGORY_STYLES.verwaltung

  const handleChange = (fieldId: string, value: string) => {
    if (fieldId === 'fach' && isWorksheet) {
      const subjectKey = normalizeSubjectKey(value)
      const isMath = subjectKey === 'Mathematik'
      const cfg = SUBJECT_CONFIGS[subjectKey]

      if (isMath) {
        const parsedGrade = parseInt((formValues.klasse || '1').match(/\d+/)?.[0] || '1', 10)
        const normGrade = (Math.min(Math.max(parsedGrade, 1), 4) as 1 | 2 | 3 | 4)
        const gradeEntries = LEHRPLANPLUS_MATHE_DATENBANK.filter(e => e.klasse === normGrade)
        const defaultThema = gradeEntries[0]?.titel || 'Zahlenraum bis 10: Zahlzerlegung & Verliebte Zahlen'
        const topicCfg = getTopicConfig(normGrade, defaultThema)
        const defaultLabels = topicCfg.defaultTaskTypes.map((k) => MATHE_KEY_TO_LABEL[k] || k)

        setFormValues((prev) => ({
          ...prev,
          fach: value,
          thema: defaultThema,
          aufgabentypen: defaultLabels.join(', '),
          show_wortspeicher: 'false',
          show_rechenkaestchen: 'true',
        }))
        return
      }

      setFormValues((prev) => ({
        ...prev,
        fach: value,
        thema: 'Leseverständnis & Wortarten',
        aufgabentypen: cfg.defaultTaskTypes.join(', '),
        show_wortspeicher: 'true',
        show_rechenkaestchen: 'false',
      }))
      return
    }

    if (fieldId === 'klasse' && isWorksheet) {
      const parsedGrade = parseInt(value.match(/\d+/)?.[0] || '1', 10)
      const normGrade = (Math.min(Math.max(parsedGrade, 1), 4) as 1 | 2 | 3 | 4)
      const gradeEntries = LEHRPLANPLUS_MATHE_DATENBANK.filter(e => e.klasse === normGrade)
      const isMath = normalizeSubjectKey(formValues.fach) === 'Mathematik'

      const currentMatches = gradeEntries.some(e => e.titel === formValues.thema || e.id === formValues.thema)
      const newThema = isMath
        ? (currentMatches ? formValues.thema : (gradeEntries[0]?.titel || ''))
        : formValues.thema

      let newAufgabentypen = formValues.aufgabentypen || ''
      if (isMath) {
        const topicCfg = getTopicConfig(normGrade, newThema)
        const defaultLabels = topicCfg.defaultTaskTypes.map((k) => MATHE_KEY_TO_LABEL[k] || k)
        newAufgabentypen = defaultLabels.join(', ')
      }

      setFormValues((prev) => ({
        ...prev,
        klasse: value,
        thema: newThema,
        aufgabentypen: newAufgabentypen,
      }))
      return
    }

    if (fieldId === 'thema' && isWorksheet) {
      const isMath = normalizeSubjectKey(formValues.fach) === 'Mathematik'
      if (isMath) {
        const parsedGrade = parseInt((formValues.klasse || '1').match(/\d+/)?.[0] || '1', 10)
        const normGrade = (Math.min(Math.max(parsedGrade, 1), 4) as 1 | 2 | 3 | 4)
        const topicCfg = getTopicConfig(normGrade, value)
        const defaultLabels = topicCfg.defaultTaskTypes.map((k) => MATHE_KEY_TO_LABEL[k] || k)

        setFormValues((prev) => ({
          ...prev,
          thema: value,
          aufgabentypen: defaultLabels.join(', '),
        }))
        return
      }

      setFormValues((prev) => ({
        ...prev,
        thema: value,
      }))
      return
    }

    if (fieldId === 'seitenumfang') {
      setFormValues((prev) => ({
        ...prev,
        seitenumfang: value,
      }))
      return
    }

    setFormValues((prev) => ({ ...prev, [fieldId]: value }))
  }

  // Umschalten von Aufgabentypen (Chips)
  const handleToggleTaskType = (type: string) => {
    const isMath = normalizeSubjectKey(formValues.fach) === 'Mathematik'
    let allowedTypes: Set<string>

    if (isMath) {
      const parsedGrade = parseInt((formValues.klasse || '1').match(/\d+/)?.[0] || '1', 10)
      const normGrade = (Math.min(Math.max(parsedGrade, 1), 4) as 1 | 2 | 3 | 4)
      const topicCfg = getTopicConfig(normGrade, formValues.thema)
      const topicChips = topicCfg.availableTaskTypes && topicCfg.availableTaskTypes.length > 0
        ? topicCfg.availableTaskTypes.map((k) => MATHE_KEY_TO_LABEL[k] || k)
        : GRADE_TASK_TYPES[normGrade]
      allowedTypes = new Set(topicChips)
    } else {
      const subjectCfg = getSubjectConfig(formValues.fach)
      allowedTypes = new Set(subjectCfg.taskTypes)
    }

    if (!allowedTypes.has(type)) return

    const currentList = (formValues.aufgabentypen || '')
      .split(',')
      .map((t) => t.trim())
      .filter((t) => allowedTypes.has(t))

    let newList: string[]
    if (currentList.includes(type)) {
      if (currentList.length > 1) {
        newList = currentList.filter((t) => t !== type)
        // Beim Abwählen Zähler im State zurücksetzen:
        setTaskCounts((prev) => {
          const next = { ...prev }
          delete next[type]
          return next
        })
      } else {
        return // Mindestens 1 Aufgabentyp muss aktiv bleiben
      }
    } else {
      newList = [...currentList, type]
      // Beim Anwählen Standardwert setzen (3 Aufgaben):
      setTaskCounts((prev) => ({
        ...prev,
        [type]: prev[type] ?? 3,
      }))
    }

    setFormValues((prev) => ({
      ...prev,
      aufgabentypen: newList.join(', '),
    }))
  }

  const handleUpdateTaskCount = (type: string, delta: number) => {
    setTaskCounts((prev) => {
      const cur = prev[type] ?? 3
      const nextVal = Math.max(1, Math.min(cur + delta, 5))
      return {
        ...prev,
        [type]: nextVal,
      }
    })
  }

  const isMathForValidation = normalizeSubjectKey(formValues.fach || 'Deutsch') === 'Mathematik'
  const parsedGradeForValidation = parseInt((formValues.klasse || '1').match(/\d+/)?.[0] || '1', 10)
  const normGradeForValidation = (Math.min(Math.max(parsedGradeForValidation, 1), 4) as 1 | 2 | 3 | 4)
  const topicCfgForValidation = isMathForValidation ? getTopicConfig(normGradeForValidation, formValues.thema) : null
  const topicChipsForValidation = topicCfgForValidation?.availableTaskTypes && topicCfgForValidation.availableTaskTypes.length > 0
    ? topicCfgForValidation.availableTaskTypes.map((k) => MATHE_KEY_TO_LABEL[k] || k)
    : GRADE_TASK_TYPES[normGradeForValidation]

  const allowedTypesForValidation = isMathForValidation
    ? new Set(topicChipsForValidation)
    : new Set(getSubjectConfig(formValues.fach || 'Deutsch').taskTypes)

  const currentSelectedTaskTypes = (formValues.aufgabentypen || '')
    .split(',')
    .map((t) => t.trim())
    .filter((t) => allowedTypesForValidation.has(t))

  const isFormValid = (() => {
    // 1. Jahrgangsstufe (klasse) ist ein striktes Pflichtfeld (1. bis 4. Klasse)
    const klasseVal = (formValues.klasse ?? '').trim()
    if (!klasseVal) return false

    // 2. Für Arbeitsblätter: Mindestens 1 Aufgabentyp muss aktiv sein
    if (isWorksheet && currentSelectedTaskTypes.length === 0) return false

    // 3. Alle im Tool als required deklarierten Felder prüfen
    return tool.inputs
      .filter((f) => f.required)
      .every((f) => (formValues[f.id] ?? '').trim() !== '')
  })()

  // ── Illustration generieren (FLUX & automatische Transparenz) ──────
  const generateIllustration = async (customThema?: string, customPosition?: string) => {
    if (!isWorksheet || formValues.show_illustration === 'false') return
    const thema =
      customThema || formValues.thema || formValues.titel || formValues.fach || 'Grundschulunterricht'
    setIsGeneratingImage(true)
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thema,
          fach: formValues.fach,
          position: customPosition || formValues.illustration_position || 'header',
          motiv: formValues.bild_motiv || '',
          stil: formValues.bild_stil || 'vektor',
        }),
      })
      if (!res.ok) {
        throw new Error('Bildgenerierung fehlgeschlagen')
      }
      const data = await res.json()
      if (data.imageUrl) {
        setIllustrationUrl(data.imageUrl)
      }
    } catch (err) {
      console.warn('Illustration konnte nicht generiert werden:', err)
    } finally {
      setIsGeneratingImage(false)
    }
  }

  // ── Streaming-Generierung ─────────────────────────────────────────
  const handleGenerate = async () => {
    if (!isFormValid || isGenerating) return

    setErrorMessage(null)
    setOutput('')
    setIsGenerating(true)

    // Parallel die passende Schulbuch-Illustration generieren
    if (isWorksheet && formValues.show_illustration !== 'false') {
      generateIllustration()
    }

    const isMath = normalizeSubjectKey(formValues.fach) === 'Mathematik'
    const parsedGrade = parseInt((formValues.klasse || '1').match(/\d+/)?.[0] || '1', 10)
    const normGrade = Math.min(Math.max(parsedGrade, 1), 4) as 1 | 2 | 3 | 4
    const aktivesThema = isMath ? resolveLehrplanStandard(normGrade, formValues.thema) : null

    const activeSelectedTaskTypes = (formValues.aufgabentypen || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const finalSelectedTaskTypes = [...activeSelectedTaskTypes]

    const effectiveFields: Record<string, string> = {
      ...formValues,
      aufgabentypen: finalSelectedTaskTypes.join(', '),
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: tool.id,
          fach: formValues.fach,
          klasse: formValues.klasse,
          thema: formValues.thema,
          seitenumfang: formValues.seitenumfang,
          diff_modus: formValues.diff_modus,
          anzahl_aufgaben: formValues.anzahl_aufgaben || '3',
          tasksPerLevel: parseInt((formValues.anzahl_aufgaben || '3').match(/\d+/)?.[0] || '3', 10),
          taskCounts,
          aufgabentypen: finalSelectedTaskTypes.join(', '),
          selectedTaskTypes: finalSelectedTaskTypes,
          fields: {
            ...effectiveFields,
            anzahl_aufgaben: formValues.anzahl_aufgaben || '3',
            tasksPerLevel: String(parseInt((formValues.anzahl_aufgaben || '3').match(/\d+/)?.[0] || '3', 10)),
            taskCounts: JSON.stringify(taskCounts),
            aufgabentypen: finalSelectedTaskTypes.join(', '),
          },
        }),
        signal: abortController.signal,
      })

      if (!res.ok) {
        let errText = 'Generierung fehlgeschlagen.'
        try {
          const json = await res.json()
          if (json.error) errText = json.error
        } catch {
          // Fallback to generic message
        }
        throw new Error(errText)
      }

      if (!res.body) {
        throw new Error('Kein Datenstrom vom Server empfangen.')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk
        setOutput(accumulated)
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      const message = err instanceof Error ? err.message : 'Unerwarteter Fehler'
      setErrorMessage(message)
    } finally {
      setIsGenerating(false)
      abortControllerRef.current = null
    }
  }

  // ── Generierung abbrechen ─────────────────────────────────────────
  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsGenerating(false)
    }
  }

  // ── In die Zwischenablage kopieren ────────────────────────────────
  const handleCopy = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      console.error('Kopieren fehlgeschlagen')
    }
  }

  // ── Drucken ───────────────────────────────────────────────────────
  const handlePrint = () => {
    window.print()
  }

  const wordCount = output.trim() ? output.trim().split(/\s+/).length : 0
  const charCount = output.length

  return (
    <div className="max-w-6xl mx-auto">
      {/* Zurück-Link */}
      <div className="no-print mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Zurück zur Übersicht
        </Link>
      </div>

      {/* ── Tool-Header ──────────────────────────────────── */}
      <div className={`no-print bg-gradient-to-b ${styles.headerBg} rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm`}>
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${tool.color}`}>
            <Icon className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {catMeta && (
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${styles.badge}`}>
                  {catMeta.label}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                {tool.estimatedTime}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{tool.name}</h1>
            <p className="text-gray-500 text-sm mt-1 leading-relaxed">{tool.fullDescription}</p>
          </div>
        </div>
      </div>

      {/* ── Zwei-Spalten-Layout ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Linke Spalte – Formular (2/5) */}
        <div className="no-print lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Formular-Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">Angaben ausfüllen</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Pflichtfelder sind mit <span className="text-red-400">*</span> markiert.
                </p>
              </div>
            </div>

            {/* Felder */}
            <div className="p-6 space-y-5">
              {(isWorksheet
                ? [...tool.inputs].sort((a, b) => {
                    const order: Record<string, number> = {
                      fach: 1,
                      klasse: 2,
                      thema: 3,
                      kontext: 4,
                    }
                    return (order[a.id] ?? 99) - (order[b.id] ?? 99)
                  })
                : tool.inputs
              )
                .filter((field) => field.id !== 'anzahl_aufgaben')
                .map((field: ToolInputField) => (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    {field.label}
                    {field.required && (
                      <span className="text-red-400 ml-1" aria-hidden="true">*</span>
                    )}
                  </label>

                  {field.id === 'thema' && isWorksheet && normalizeSubjectKey(formValues.fach) === 'Mathematik' ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <select
                          id={field.id}
                          disabled={isGenerating}
                          value={formValues[field.id] ?? ''}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          required={field.required}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white appearance-none cursor-pointer pr-10 disabled:bg-gray-50 disabled:text-gray-400 font-medium"
                        >
                          <option value="" disabled>Lehrplan-Thema auswählen...</option>
                          {(() => {
                            const parsedGrade = parseInt((formValues.klasse || '1').match(/\d+/)?.[0] || '1', 10)
                            const normGrade = Math.min(Math.max(parsedGrade, 1), 4) as 1 | 2 | 3 | 4
                            const bereiche = [
                              "Zahlen und Operationen",
                              "Raum und Form",
                              "Größen und Messen",
                              "Daten und Zufall"
                            ] as const
                            const klassenEintraege = LEHRPLANPLUS_MATHE_DATENBANK.filter(e => e.klasse === normGrade)

                            return bereiche.map((bereich) => {
                              const eintraege = klassenEintraege.filter(e => e.bereich === bereich)
                              if (eintraege.length === 0) return null
                              return (
                                <optgroup key={bereich} label={`── ${bereich.toUpperCase()} ──`}>
                                  {eintraege.map((e) => (
                                    <option key={e.id} value={e.titel}>
                                      {e.titel}
                                    </option>
                                  ))}
                                </optgroup>
                              )
                            })
                          })()}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>

                      {/* Info-Badge mit amtlicher LehrplanPLUS-Kompetenz */}
                      {(() => {
                        const parsedGrade = parseInt((formValues.klasse || '1').match(/\d+/)?.[0] || '1', 10)
                        const eintrag = resolveLehrplanStandard(parsedGrade, formValues.thema)
                        if (!eintrag) return null
                        return (
                          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs space-y-1.5 text-blue-900">
                            <div className="flex items-center justify-between gap-1.5 font-semibold text-blue-800">
                              <span className="flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                LehrplanPLUS Bayern · {eintrag.bereich}
                              </span>
                              <span className="bg-blue-100/80 text-blue-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                                ZR {eintrag.zahlenraum >= 1000000 ? '1.000.000' : eintrag.zahlenraum >= 1000 ? '1.000' : eintrag.zahlenraum}
                              </span>
                            </div>
                            <p className="text-blue-950/80 leading-relaxed italic">
                              &bdquo;{eintrag.kompetenzText}&ldquo;
                            </p>
                          </div>
                        )
                      })()}
                    </div>
                  ) : field.type === 'text' ? (
                    <>
                      <input
                        id={field.id}
                        type="text"
                        disabled={isGenerating}
                        value={formValues[field.id] ?? ''}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        placeholder={
                          field.id === 'thema' && isWorksheet
                            ? 'z. B. Zahlenraum bis 20: Plus und Minus, Verdoppeln, Nachbarzahlen...'
                            : field.placeholder
                        }
                        required={field.required}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white disabled:bg-gray-50 disabled:text-gray-400"
                      />
                      {field.id === 'thema' && isWorksheet && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[11px] text-gray-400 font-medium">Beispiele:</span>
                          {(normalizeSubjectKey(formValues.fach) === 'Mathematik'
                            ? [
                                'Zahlenraum bis 20: Plus und Minus (ohne Zehnerübergang)',
                                'Zahlenraum bis 20: Verdoppeln und Halbieren',
                                'Vorgänger, Nachfolger & Zahlenstrahl',
                                'Verliebte Zahlen zur 10',
                              ]
                            : [
                                'Leseverständnis',
                                'Wortarten bestimmen',
                                'Schüttelsätze & Satzzeichen',
                              ]
                          ).map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleChange('thema', preset)}
                              className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 text-[11px] font-medium border border-gray-200 transition-colors"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      id={field.id}
                      disabled={isGenerating}
                      value={formValues[field.id] ?? ''}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      rows={field.rows ?? 3}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white resize-none disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  ) : field.type === 'select' ? (
                    <div className="relative">
                      <select
                        id={field.id}
                        disabled={isGenerating}
                        value={formValues[field.id] ?? ''}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        required={field.required}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white appearance-none cursor-pointer pr-10 disabled:bg-gray-50 disabled:text-gray-400"
                      >
                        <option value="" disabled>Bitte auswählen...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  ) : field.type === 'number' ? (
                    <input
                      id={field.id}
                      type="number"
                      disabled={isGenerating}
                      min={field.min ?? 1}
                      max={field.max ?? 10}
                      value={formValues[field.id] ?? ''}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      required={field.required}
                      className="w-24 px-3 py-2 border rounded-lg text-center font-semibold text-gray-800"
                    />
                  ) : null}

                  {/* Hinweistext */}
                  {field.helperText && (
                    <p className="flex items-start gap-1.5 mt-1.5 text-xs text-gray-400">
                      <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      {field.helperText}
                    </p>
                  )}
                </div>
              ))}

              {/* ── ERWEITERTE ARBEITSBLATT-EINSTELLUNGEN ───────── */}
              {isWorksheet && (
                <div className="pt-4 mt-2 border-t border-gray-100 space-y-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    <Sliders className="w-3.5 h-3.5 text-blue-600" />
                    <span>Arbeitsblatt-Optionen</span>
                  </div>

                  {/* 1. Seitenumfang */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Seitenumfang:
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        '1 DIN-A4-Seite (Kompakt)',
                        '2 Seiten (Ausführlich)',
                      ].map((opt) => {
                        const isSelected = formValues.seitenumfang === opt
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleChange('seitenumfang', opt)}
                            className={`
                              py-2 px-2.5 rounded-lg border text-left font-medium transition-all
                              ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-2xs'
                                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                              }
                            `}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* 2. Differenzierungs-Modus */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Differenzierungs-Modus:
                    </label>
                    <div className="space-y-1.5 text-xs">
                      {[
                        'Alle Niveaustufen auf einem Blatt (Stern-System)',
                        '3 separate Blätter (Basis / Standard / Experte)',
                      ].map((opt) => {
                        const isSelected = formValues.diff_modus === opt
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleChange('diff_modus', opt)}
                            className={`
                              w-full py-2 px-3 rounded-lg border text-left font-medium transition-all
                              ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-2xs'
                                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                              }
                            `}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* 3. Aufgabentypen (Fachabhängige Auswahl-Chips) */}
                  {(() => {
                    const currentFach = formValues.fach || 'Mathematik'
                    const isMath = normalizeSubjectKey(currentFach) === 'Mathematik'
                    const parsedGrade = parseInt((formValues.klasse || '1').match(/\d+/)?.[0] || '1', 10)
                    const normGrade = Math.min(Math.max(parsedGrade, 1), 4) as 1 | 2 | 3 | 4
                    const aktivesThema = isMath ? resolveLehrplanStandard(normGrade, formValues.thema) : null

                    const subjectCfg = getSubjectConfig(currentFach)
                    const validTaskTypes = new Set(subjectCfg.taskTypes)
                    const topicCfg = isMath ? getTopicConfig(normGrade, formValues.thema) : null
                    const topicChips = topicCfg?.availableTaskTypes && topicCfg.availableTaskTypes.length > 0
                      ? topicCfg.availableTaskTypes.map((k) => MATHE_KEY_TO_LABEL[k] || k)
                      : GRADE_TASK_TYPES[normGrade]
                    const availableTaskTypes = isMath
                      ? topicChips
                      : subjectCfg.taskTypes

                    const allowedTaskTypesSet = new Set(availableTaskTypes)
                    const subjectActiveTypes = (formValues.aufgabentypen || '')
                      .split(',')
                      .map((t) => t.trim())
                      .filter((t) => allowedTaskTypesSet.has(t))

                    return (
                      <div>
                        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                          <label className="text-xs font-medium text-gray-700">
                            Aufgabentypen ({currentFach}):
                          </label>
                          <div className="flex items-center gap-2">
                            {subjectActiveTypes.length > 3 && formValues.seitenumfang === '1 DIN-A4-Seite (Kompakt)' && (
                              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                Tipp: 3–4 für 1 Seite
                              </span>
                            )}
                            <span className="text-[11px] text-gray-400">
                              {subjectActiveTypes.length} aktiv
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {availableTaskTypes.map((type) => {
                            const isActive = subjectActiveTypes.includes(type)
                            const currentCount = taskCounts[type] ?? 3

                            if (isActive) {
                              return (
                                <div
                                  key={type}
                                  className="inline-flex items-center rounded-md border border-blue-600 bg-blue-600 text-white shadow-2xs overflow-hidden text-xs"
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleToggleTaskType(type)}
                                    className="px-2.5 py-1 font-medium hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-1"
                                    title="Klicken zum Abwählen"
                                  >
                                    <span className="font-bold">✓</span>
                                    <span>{type}</span>
                                  </button>
                                  <div className="flex items-center bg-blue-700 border-l border-blue-500 px-1 py-0.5 gap-0.5">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleUpdateTaskCount(type, -1)
                                      }}
                                      disabled={currentCount <= 1}
                                      className="w-4 h-4 flex items-center justify-center rounded hover:bg-blue-800 disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-bold leading-none select-none cursor-pointer"
                                      title="1 Aufgabe weniger (Min: 1)"
                                    >
                                      −
                                    </button>
                                    <span
                                      className="text-[11px] font-bold font-mono px-1 min-w-[14px] text-center select-none"
                                      title={`Aktuell ${currentCount} Aufgabe(n) für diesen Typ (1 bis 5)`}
                                    >
                                      {currentCount}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleUpdateTaskCount(type, 1)
                                      }}
                                      disabled={currentCount >= 5}
                                      className="w-4 h-4 flex items-center justify-center rounded hover:bg-blue-800 disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-bold leading-none select-none cursor-pointer"
                                      title="1 Aufgabe mehr (Max: 5)"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              )
                            }

                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => handleToggleTaskType(type)}
                                className="px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                              >
                                + {type}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })()}

                  {/* 4. Zusatzoptionen (Fachabhängige Checkboxen) */}
                  <div className="space-y-2 pt-1 text-xs">
                    {(formValues.fach || 'Deutsch') === 'Mathematik' ? (
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formValues.show_rechenkaestchen !== 'false'}
                          onChange={(e) =>
                            handleChange(
                              'show_rechenkaestchen',
                              e.target.checked ? 'true' : 'false'
                            )
                          }
                          className="w-4 h-4 text-blue-600 rounded focus:ring-0 cursor-pointer"
                        />
                        <span className="text-gray-700 font-medium">
                          Kariertes Rechenkästchen-Feld anzeigen
                        </span>
                      </label>
                    ) : (
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formValues.show_wortspeicher !== 'false'}
                          onChange={(e) =>
                            handleChange(
                              'show_wortspeicher',
                              e.target.checked ? 'true' : 'false'
                            )
                          }
                          className="w-4 h-4 text-blue-600 rounded focus:ring-0 cursor-pointer"
                        />
                        <span className="text-gray-700 font-medium">
                          Wortspeicher-Box oben anzeigen
                        </span>
                      </label>
                    )}

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formValues.show_loesung !== 'false'}
                        onChange={(e) =>
                          handleChange('show_loesung', e.target.checked ? 'true' : 'false')
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-0 cursor-pointer"
                      />
                      <span className="text-gray-700 font-medium">
                        Separates Lösungsblatt am Ende anhängen
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formValues.show_notenraster === 'true'}
                        onChange={(e) =>
                          handleChange('show_notenraster', e.target.checked ? 'true' : 'false')
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-0 cursor-pointer"
                      />
                      <span className="text-gray-700 font-medium">
                        Punkte-/Notenraster oben rechts (___ / 20 P. Note: ___)
                      </span>
                    </label>

                    {/* ── BEREICH: ILLUSTRATION & BILD ───────── */}
                    <div className="pt-3 border-t border-gray-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                          <span>Illustration & Bild</span>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={formValues.show_illustration !== 'false'}
                            onChange={(e) => {
                              const isChecked = e.target.checked
                              handleChange('show_illustration', isChecked ? 'true' : 'false')
                              if (isChecked && !illustrationUrl && !isGeneratingImage) {
                                generateIllustration()
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-0 cursor-pointer"
                          />
                          <span className="text-xs font-medium text-gray-700">Bild aktivieren</span>
                        </label>
                      </div>

                      {formValues.show_illustration !== 'false' && (
                        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-3 text-xs">
                          {/* 1. Motiv / Prompt */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Eigenes Bild-Motiv:
                            </label>
                            <input
                              type="text"
                              value={formValues.bild_motiv || ''}
                              onChange={(e) => handleChange('bild_motiv', e.target.value)}
                              placeholder='z. B. "Freundlicher Bleistift", "Eule mit Buch", "Hund im Garten"'
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder:text-gray-400"
                            />
                            <p className="mt-1 text-[11px] text-gray-400">
                              Default: Wird automatisch aus dem Thema abgeleitet.
                            </p>
                          </div>

                          {/* 2. Stil-Auswahl (Chips) */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                              Stil-Auswahl:
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {[
                                { id: 'vektor', label: 'Schulbuch-Zeichnung (vektorisiert)' },
                                { id: 'sketch', label: 'Klassische Strichzeichnung (Schwarz-Weiß)' },
                              ].map((styleOpt) => {
                                const isSelected =
                                  (formValues.bild_stil || 'vektor') === styleOpt.id
                                return (
                                  <button
                                    key={styleOpt.id}
                                    type="button"
                                    onClick={() => handleChange('bild_stil', styleOpt.id)}
                                    className={`
                                      py-1.5 px-2.5 rounded-lg border text-left font-medium transition-all text-[11px]
                                      ${
                                        isSelected
                                          ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-2xs font-semibold'
                                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                      }
                                    `}
                                  >
                                    {isSelected ? '✓ ' : ''}{styleOpt.label}
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          {/* 3. Bild-Position (Dropdown) */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Bild-Position:
                            </label>
                            <div className="relative">
                              <select
                                value={formValues.illustration_position || 'header'}
                                onChange={(e) => handleChange('illustration_position', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none cursor-pointer pr-8"
                              >
                                <option value="header">Header (oben rechts)</option>
                                <option value="task1">Neben Aufgabe 1</option>
                                <option value="betweenTask1And2">Zwischen Aufgabe 1 und 2</option>
                                <option value="bottom">Fußbereich</option>
                              </select>
                              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            </div>
                          </div>

                          {/* Button: Bild neu generieren */}
                          <div className="pt-1 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => generateIllustration()}
                              disabled={isGeneratingImage}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors disabled:opacity-50"
                            >
                              <RefreshCw
                                className={`w-3.5 h-3.5 ${isGeneratingImage ? 'animate-spin' : ''}`}
                              />
                              <span>{isGeneratingImage ? 'Generiere Bild...' : 'Bild generieren'}</span>
                            </button>
                            {illustrationUrl && (
                              <span className="text-[11px] text-green-600 font-medium">✓ Bild bereit</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Generate & Cancel Buttons */}
            <div className="px-6 pb-6 space-y-2">
              {isGenerating ? (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold text-sm bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Generierung stoppen</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!isFormValid || isGenerating}
                  className={`
                    w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-semibold text-sm transition-all
                    ${isFormValid && !isGenerating
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md active:scale-[0.98]'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <Wand2 className="w-4 h-4" />
                  <span>
                    {isGenerating
                      ? 'Arbeitsblatt wird generiert...'
                      : isWorksheet
                      ? output
                        ? 'Arbeitsblatt neu generieren'
                        : 'Arbeitsblatt generieren'
                      : output
                      ? 'Erneut generieren'
                      : 'KI-Text generieren'}
                  </span>
                  <Sparkles className="w-4 h-4 opacity-70" />
                </button>
              )}

              {!isFormValid && (
                <p className="text-xs text-center text-amber-600 mt-2 font-medium">
                  {!(formValues.klasse ?? '').trim()
                    ? '⚠️ Bitte wähle eine Jahrgangsstufe (1. bis 4. Klasse) aus.'
                    : isWorksheet && currentSelectedTaskTypes.length === 0
                    ? '⚠️ Bitte wähle mindestens einen Aufgabentyp aus.'
                    : 'Bitte alle Pflichtfelder ausfüllen.'}
                </p>
              )}
            </div>
          </div>

          {/* DSGVO-Hinweis */}
          <div className="mt-4 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-emerald-900">DSGVO-geschützt</p>
              <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                Eingaben werden nicht im Backend gespeichert. Schülernamen werden automatisch anonymisiert, bevor das Modell sie verarbeitet.
              </p>
            </div>
          </div>
        </div>

        {/* Rechte Spalte – Output (3/5) */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[550px] flex flex-col">
            {/* Output-Header */}
            <div className="no-print px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">{tool.outputLabel}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  {isGenerating ? (
                    <span className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                      Wird live generiert...
                    </span>
                  ) : output ? (
                    <span className="text-xs text-gray-400">
                      {wordCount} Wörter · {charCount} Zeichen
                    </span>
                  ) : (
                    <p className="text-xs text-gray-400">KI-generierter Text erscheint hier</p>
                  )}
                </div>
              </div>

              {/* View-Switcher & Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {output && (
                  <div className="inline-flex rounded-lg bg-gray-100 p-0.5 border border-gray-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setViewMode('worksheet')}
                      className={`
                        inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors
                        ${viewMode === 'worksheet' ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'}
                      `}
                    >
                      <Layout className="w-3.5 h-3.5" />
                      <span>Arbeitsblatt (A4)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('markdown')}
                      className={`
                        inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors
                        ${viewMode === 'markdown' ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'}
                      `}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Text-Ansicht</span>
                    </button>
                  </div>
                )}

                {/* Kopieren */}
                {output && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-green-700">Kopiert!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gray-500" />
                        <span>Kopieren</span>
                      </>
                    )}
                  </button>
                )}

                {/* Drucken */}
                {output && viewMode === 'markdown' && (
                  <button
                    type="button"
                    onClick={handlePrint}
                    title="Drucken / PDF"
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                )}

                {/* Zurücksetzen */}
                {output && (
                  <button
                    type="button"
                    onClick={() => setOutput('')}
                    disabled={isGenerating}
                    title="Ausgabe leeren"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Fehlermeldung */}
            {errorMessage && (
              <div className="no-print m-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-sm">
                    <p className="font-semibold text-red-900">Fehler bei der Generierung</p>
                    <p className="mt-1 text-red-700 text-xs leading-relaxed">{errorMessage}</p>
                    {errorMessage.includes('Ollama') && (
                      <div className="mt-3 p-3 bg-white/70 rounded-lg border border-red-200 text-xs text-red-900 font-mono">
                        Terminal: <code className="bg-red-100 px-1.5 py-0.5 rounded">ollama run qwen2.5:14b</code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Output-Inhalt */}
            {output || isGenerating ? (
              viewMode === 'worksheet' ? (
                /* ── ARBEITSBLATT-ANSICHT (DIN A4) ──────────────── */
                <div className="flex-1 flex flex-col">
                  <ArbeitsblattPreview
                    rawContent={output}
                    toolName={tool.name}
                    formValues={formValues}
                    taskCounts={taskCounts}
                    isGenerating={isGenerating}
                    illustrationUrl={illustrationUrl}
                    isGeneratingImage={isGeneratingImage}
                    onRegenerateIllustration={() => generateIllustration()}
                    onToggleIllustrationPosition={(pos) =>
                      handleChange('illustration_position', pos)
                    }
                  />
                </div>
              ) : (
                /* ── REINE TEXT- / MARKDOWN-ANSICHT ──────────────── */
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-table:border prose-th:bg-gray-50 prose-th:border prose-td:border prose-th:p-2 prose-td:p-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {output}
                    </ReactMarkdown>
                    {isGenerating && (
                      <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1 align-middle rounded-sm" />
                    )}
                  </div>
                </div>
              )
            ) : !errorMessage ? (
              /* Platzhalter wenn noch kein Text generiert wurde */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
                  <Wand2 className="w-9 h-9 text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  Bereit zur Generierung
                </h3>
                <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                  Fülle die Felder links aus und klicke auf &bdquo;KI-Text generieren&ldquo;. Der Text wird live als druckfertiges DIN-A4-Arbeitsblatt formatiert.
                </p>
                <div className="mt-6 flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-xs text-blue-700 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>Druckfertiges A4-Layout mit Schreiblinien & Niveaustufen</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

      </div>
    </div>
  )
}
