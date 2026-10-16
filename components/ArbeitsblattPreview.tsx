/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Printer,
  BookOpen,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  FileText,
  FileCheck,
  AlertCircle,
} from 'lucide-react'
import { GeneratedTask } from '@/types/tools'
import { sanitizeRechendreieckMissing } from '@/lib/rechendreiecke'
import { decomposeGeldAmount } from '@/lib/generators/geldGenerator'
import { PlacedShape, ShapeCountItem, ShapeType } from '@/lib/generators/strichlistenGenerator'
import {
  EbeneFormType,
  PatternShapeType,
  PlacedGeoShape,
  GeoCountSummaryItem,
  GeometrieFormenZaehlenData,
  GeometrieMusterItemData,
  GeometriePunktgitterItemData,
} from '@/lib/generators/geometrieGenerator'
import {
  RaumSymbolType,
  ArrowDirectionType,
  DirectionType,
  PlacedGridSymbol,
  RaumGitterQuestion,
  RaumGitterOrientierungData,
  PlacedArrow,
  ArrowSummaryItem,
  RaumPfeileZaehlenData,
  RaumZeichnenPrompt,
  RaumGitterZeichnenData,
} from '@/lib/generators/raumorientierungGenerator'
import {
  SachaufgabeIconType,
  RechengeschichteItemData,
} from '@/lib/generators/rechengeschichtenGenerator'
import { ZwanzigerfeldItemData } from '@/lib/generators/zwanzigerfeldGenerator'
import { SchuettelboxItemData } from '@/lib/generators/schuettelboxGenerator'
import { ZehnerstoppItemData } from '@/lib/generators/zehnerstoppGenerator'
import { AufgabenfamilieItemData } from '@/lib/generators/aufgabenfamilienGenerator'
import { WochentagItemData } from '@/lib/generators/uhrzeitGenerator'
import {
  HundertertafelItemData,
  DienesBlockItemData,
  NachbarzahlenK2ItemData,
  HalbschriftlichItemData,
  MultiplicationArrayItemData,
  EinmaleinsItemData,
  DivisionItemData,
  EinmaleinsUmkehrItemData,
  GeometrieKoerperItemData,
  KoerperType,
  AchsensymmetrieItemData,
  KoerpernetzItemData,
  RulerMeasureItemData,
  LaengenMessenItemData,
  LaengenUmrechnenItemData,
  LaengenVergleichItemData,
  GeldKlasse2ItemData,
  GeldKommaItemData,
  GeldRueckgeldItemData,
  AnalogClockGrade2ItemData,
  ZeigerEinzeichnenGrade2ItemData,
  ZeitspannenGrade2ItemData,
  DiagrammKlasse2ItemData,
  TabelleKlasse2ItemData,
  KombinatorikKlasse2ItemData,
} from '@/lib/generators/klasse2Generator'
import {
  SchriftlichItemData,
  RundenItemData,
  FlaecheUmfangItemData,
  GewichteHohlmasseItemData,
  DiagrammItemData,
} from '@/lib/generators/grade34Generator'
import {
  WrittenCalcGridItemData,
  StellenwertHZEItemData,
  DienesTausenderItemData,
  NachbarzahlenK3ItemData,
  Zahlenstrahl1000ItemData,
  HalbschriftlichK3ItemData,
  HalbschriftlichMultItemData,
  WuerfelnetzItemData,
  WuerfelgebaeudeItemData,
  RechtWinkelItemData,
  WaageItemData,
  MessbecherItemData,
  FahrplanItemData,
  WahrscheinlichkeitItemData,
} from '@/lib/generators/klasse3Generator'

export type ImagePosition =
  | 'header'
  | 'task1'
  | 'betweenTask1And2'
  | 'bottom'
  | 'hidden'

interface ArbeitsblattPreviewProps {
  rawContent: string
  toolName?: string
  formValues?: Record<string, string>
  taskCounts?: Record<string, number>
  isGenerating?: boolean
  illustrationUrl?: string | null
  imageUrl?: string | null
  isGeneratingImage?: boolean
  onRegenerateIllustration?: () => void
  onToggleIllustrationPosition?: (pos: ImagePosition) => void
}

interface ParsedWorksheetState {
  title: string
  tasks: GeneratedTask[]
  isFallback: boolean
  rawFallback: string
}

// ── Hilfsfunktionen für didaktische Grundschul-Formatierung ────────
const COMP_PLACEHOLDER_REGEX = /\[\s*[\?\_]?\s*\]|\(\s*\)/

function parseNeighborItem(item: string) {
  const prefixMatch = item.match(/^([a-z0-9]+[).])\s*/i)
  const prefix = prefixMatch ? prefixMatch[1] : ''
  const rest = prefixMatch ? item.slice(prefixMatch[0].length) : item

  // Typische Muster: "___ , 4 , ___" oder "___ 14 ___" oder "Vorgänger und Nachfolger: ___ , 8 , ___"
  const underMatch =
    rest.match(/_+\s*[,|\s]\s*(\d+)\s*[,|\s]\s*_+/) ||
    rest.match(/_+\s*(\d+)\s*_+/) ||
    rest.match(/^[^0-9]*_+\s*(\d+)\s*_+[^0-9]*$/) ||
    rest.match(/.*?(\d+).*?_+/) ||
    rest.match(/^(\d+)$/)

  if (underMatch) {
    return { prefix, mitte: underMatch[1] }
  }

  const numMatch = rest.match(/(\d+)/)
  if (numMatch) {
    return { prefix, mitte: numMatch[1] }
  }

  return null
}

function renderWorksheetItem(item: string, taskTitle = '', taskInstruction = '') {
  const metaText = `${taskTitle} ${taskInstruction}`
  const isNeighbor =
    /nachbar|vorgänger|nachfolger|zahlenstrahl/i.test(metaText) ||
    /_+\s*[,|\s]\s*\d+\s*[,|\s]\s*_+/.test(item)

  // 1. Nachbarzahlen: Dreiteiliges Band mit Schreibkästchen
  if (isNeighbor) {
    const parsed = parseNeighborItem(item)
    if (parsed) {
      return (
        <div className="flex items-center gap-2">
          {parsed.prefix && (
            <span className="font-semibold text-gray-500 text-sm min-w-[20px] flex-shrink-0">
              {parsed.prefix}
            </span>
          )}
          <div className="flex items-center gap-2 font-mono text-xl">
            <span className="w-10 h-9 border-2 border-dashed border-gray-400 rounded flex items-center justify-center print:border-black" />
            <span className="w-10 h-9 border-2 border-gray-800 rounded bg-gray-50 font-bold flex items-center justify-center">
              {parsed.mitte}
            </span>
            <span className="w-10 h-9 border-2 border-dashed border-gray-400 rounded flex items-center justify-center print:border-black" />
          </div>
        </div>
      )
    }
  }

  // 2. Größer / Kleiner / Gleich: Schreibkreis statt [ ]
  const isComparison =
    /groesser|größer|kleiner|< > =|<|>|=/i.test(metaText) ||
    COMP_PLACEHOLDER_REGEX.test(item)

  if (isComparison) {
    const prefixMatch = item.match(/^([a-z0-9]+[).])\s*(.*)$/i)
    const prefix = prefixMatch ? prefixMatch[1] : ''
    const content = prefixMatch ? prefixMatch[2] : item

    if (COMP_PLACEHOLDER_REGEX.test(content)) {
      const parts = content.split(COMP_PLACEHOLDER_REGEX)
      return (
        <div className="flex items-center font-mono text-lg flex-wrap">
          {prefix && (
            <span className="font-semibold text-gray-500 text-sm mr-2 flex-shrink-0">
              {prefix}
            </span>
          )}
          {parts.map((p, pIdx) => (
            <React.Fragment key={pIdx}>
              {pIdx > 0 && (
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border-2 border-gray-500 mx-2 text-transparent select-none print:border-black flex-shrink-0" />
              )}
              <span>{p.trim()}</span>
            </React.Fragment>
          ))}
        </div>
      )
    }

    // Fallback: Falls LLM stattdessen ___ verwendet hat
    if (content.includes('___')) {
      const parts = content.split(/_{2,}/)
      if (parts.length >= 2) {
        return (
          <div className="flex items-center font-mono text-lg flex-wrap">
            {prefix && (
              <span className="font-semibold text-gray-500 text-sm mr-2 flex-shrink-0">
                {prefix}
              </span>
            )}
            {parts.map((p, pIdx) => (
              <React.Fragment key={pIdx}>
                {pIdx > 0 && (
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border-2 border-gray-500 mx-2 text-transparent select-none print:border-black flex-shrink-0" />
                )}
                <span>{p.trim()}</span>
              </React.Fragment>
            ))}
          </div>
        )
      }
    }
  }

  // 3. Kopfrechnen / Grundrechenarten: Gestrichelte Lösungsboxen statt Text-Unterstrichen ____
  const eqMatch = item.match(/^([a-z0-9]+[).])?\s*(.*?)=\s*(?:\[\s*\]|_{2,}|\[gestricheltes\s*Feld\]|\s*)$/i)
  if (eqMatch) {
    const prefix = eqMatch[1] || ''
    const term = eqMatch[2].trim()
    return (
      <div className="flex items-center font-mono text-base sm:text-lg">
        {prefix && (
          <span className="font-semibold text-gray-500 text-sm mr-2 flex-shrink-0 min-w-[20px]">
            {prefix}
          </span>
        )}
        <span className="font-bold text-slate-800">{term}</span>
        <span className="font-bold text-gray-400 mx-1.5">=</span>
        <div className="w-8 h-8 sm:w-9 sm:h-9 border-2 border-slate-400 border-dashed rounded-lg bg-white inline-flex items-center justify-center print:border-black flex-shrink-0" />
      </div>
    )
  }

  // 4. Standard-Darstellung
  return <span>{item}</span>
}

function renderSolutionItem(
  sol: string,
  originalItem = '',
  taskTitle = '',
  taskInstruction = ''
) {
  const metaText = `${taskTitle} ${taskInstruction}`
  const isNeighbor =
    /nachbar|vorgänger|nachfolger|zahlenstrahl/i.test(metaText) ||
    /_+\s*[,|\s]\s*\d+\s*[,|\s]\s*_+/.test(originalItem) ||
    /_+\s*[,|\s]\s*\d+\s*[,|\s]\s*_+/.test(sol)

  // 1. Nachbarzahlen: Dreiteiliges Band mit Musterlösung
  if (isNeighbor) {
    const origParsed = parseNeighborItem(originalItem)
    const solParsed = parseNeighborItem(sol)
    const mitte = origParsed?.mitte || solParsed?.mitte
    const prefix = origParsed?.prefix || solParsed?.prefix || ''

    if (mitte) {
      const num = parseInt(mitte, 10)
      const vor = !isNaN(num) ? Math.max(0, num - 1) : '?'
      const nach = !isNaN(num) ? num + 1 : '?'

      return (
        <div className="flex items-center gap-2">
          {prefix && (
            <span className="font-semibold text-emerald-700 text-sm min-w-[20px] flex-shrink-0">
              {prefix}
            </span>
          )}
          <div className="flex items-center gap-2 font-mono text-xl">
            <span className="w-10 h-9 border-2 border-dashed border-emerald-500 bg-emerald-50 text-emerald-800 font-bold rounded flex items-center justify-center print:border-black">
              {vor}
            </span>
            <span className="w-10 h-9 border-2 border-gray-800 rounded bg-gray-50 font-bold text-gray-900 flex items-center justify-center">
              {mitte}
            </span>
            <span className="w-10 h-9 border-2 border-dashed border-emerald-500 bg-emerald-50 text-emerald-800 font-bold rounded flex items-center justify-center print:border-black">
              {nach}
            </span>
          </div>
        </div>
      )
    }
  }

  // 2. Größer / Kleiner / Gleich: Musterlösung im grünen Kreis
  const isComparison =
    /groesser|größer|kleiner|< > =|<|>|=/i.test(metaText) ||
    COMP_PLACEHOLDER_REGEX.test(originalItem) ||
    /([<>]=?|=)/.test(sol)

  if (isComparison) {
    const prefixMatch = sol.match(/^([a-z0-9]+[).])\s*(.*)$/i)
    const prefix = prefixMatch ? prefixMatch[1] : ''
    const rest = prefixMatch ? prefixMatch[2] : sol

    const symMatch = rest.match(/([<>]=?|=)/)
    if (symMatch) {
      const sym = symMatch[1]
      const symParts = rest.split(sym)
      let left = symParts[0]?.trim() || ''
      let right = symParts.slice(1).join(sym)?.trim() || ''

      // Falls nur der Operator geliefert wurde (z.B. "a) <"), Terme aus dem Aufgaben-Item holen
      if ((!left || !right) && originalItem) {
        const origPrefixMatch = originalItem.match(/^([a-z0-9]+[).])\s*(.*)$/i)
        const origContent = origPrefixMatch ? origPrefixMatch[2] : originalItem
        const origParts = origContent.split(COMP_PLACEHOLDER_REGEX)
        if (origParts.length >= 2) {
          left = origParts[0].trim()
          right = origParts.slice(1).join('').trim()
        }
      }

      return (
        <div className="flex items-center font-mono text-lg text-emerald-800 flex-wrap">
          {prefix && (
            <span className="font-semibold text-emerald-700 text-sm mr-2 flex-shrink-0">
              {prefix}
            </span>
          )}
          {left && <span>{left}</span>}
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border-2 border-emerald-600 bg-emerald-50 text-emerald-800 font-bold mx-2 select-none print:border-black flex-shrink-0">
            {sym}
          </span>
          {right && <span>{right}</span>}
        </div>
      )
    }
  }

  // 3. Kopfrechnen: Rechnungen mit hervorgehobenem Ergebnis im Kästchen
  const eqSolMatch = sol.match(/^([a-z0-9]+[).])?\s*(.*?)=\s*(.*?)$/i)
  if (eqSolMatch) {
    const prefix = eqSolMatch[1] || ''
    const term = eqSolMatch[2].trim()
    const res = eqSolMatch[3].trim()
    return (
      <div className="flex items-center font-mono text-base sm:text-lg">
        {prefix && (
          <span className="font-semibold text-emerald-700 text-sm mr-2 flex-shrink-0 min-w-[20px]">
            {prefix}
          </span>
        )}
        <span className="font-bold text-slate-800">{term}</span>
        <span className="font-bold text-gray-400 mx-1.5">=</span>
        <div className="w-8 h-8 sm:w-9 sm:h-9 border-2 border-emerald-600 bg-emerald-50 text-emerald-800 rounded-lg inline-flex items-center justify-center font-bold print:border-black flex-shrink-0">
          {res}
        </div>
      </div>
    )
  }

  // 4. Standard
  return <span>{sol}</span>
}

// ── Rechendreiecke: Visuelle SVG-Komponente für Grundschul-Arbeitsblätter ──
export interface RechendreieckData {
  inner: [number, number, number]
  outer: [number, number, number]
  missing: string[] // z. B. ["outer_0", "inner_2"]
  prefix?: string   // z. B. "a)"
  solutions?: {
    inner: [number, number, number]
    outer: [number, number, number]
  }
}

export function parseRechendreieckData(item: unknown, index = 0): RechendreieckData | null {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
  const defaultPrefix = `${letters[index] || index + 1})`

  if (!item) return null

  // 1. Direktes Objekt
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    if (Array.isArray(obj.inner)) {
      const innerArr = obj.inner.map((n) => Number(n) || 0)
      let a = innerArr[0] ?? 3
      let b = innerArr[1] ?? 4
      let c = innerArr[2] ?? 2

      // Didaktische Varianz: Vorzugsweise unterschiedliche Eckzahlen
      if (a === b && b === c) {
        b = a > 2 ? a - 1 : a + 1
        c = Math.max(1, a - 2)
      } else if (a === b) {
        b = a > 1 ? a - 1 : a + 1
      } else if (b === c) {
        c = b > 1 ? b - 1 : b + 1
      } else if (c === a) {
        c = a > 1 ? a - 1 : a + 1
      }

      // Bei Zahlenraum bis 10: Garantiere strikt, dass jede paarweise Summe <= 10 bleibt
      if (a <= 5 || b <= 5 || c <= 5) {
        if (a + b > 10) {
          if (a >= b) a = Math.max(1, 10 - b)
          else b = Math.max(1, 10 - a)
        }
        if (b + c > 10) {
          if (b >= c) b = Math.max(1, 10 - c)
          else c = Math.max(1, 10 - b)
        }
        if (c + a > 10) {
          if (c >= a) c = Math.max(1, 10 - a)
          else a = Math.max(1, 10 - c)
        }
      }

      // ZWINGENDE MATHEMATISCHE BERECHNUNG DER AUSSENWERTE (Rand >= Ecke garantiert):
      const outer: [number, number, number] = [a + b, b + c, c + a]

      const missing = sanitizeRechendreieckMissing(obj.missing)

      const prefix = typeof obj.prefix === 'string' && obj.prefix.trim()
        ? obj.prefix.trim()
        : defaultPrefix

      let solutions: { inner: [number, number, number]; outer: [number, number, number] } | undefined = undefined
      if (obj.solutions && typeof obj.solutions === 'object') {
        const sObj = obj.solutions as Record<string, unknown>
        if (Array.isArray(sObj.inner) && Array.isArray(sObj.outer)) {
          solutions = {
            inner: [Number(sObj.inner[0]) || a, Number(sObj.inner[1]) || b, Number(sObj.inner[2]) || c],
            outer: [Number(sObj.outer[0]) || outer[0], Number(sObj.outer[1]) || outer[1], Number(sObj.outer[2]) || outer[2]],
          }
        }
      }
      if (!solutions) {
        solutions = {
          inner: [a, b, c],
          outer,
        }
      }

      return {
        inner: [a, b, c],
        outer,
        missing,
        prefix,
        solutions,
      }
    }
  }

  // 2. String (JSON oder Text)
  if (typeof item === 'string') {
    const trimmed = item.trim()
    const prefixMatch = trimmed.match(/^([a-z0-9]+[).])\s*/i)
    const prefix = prefixMatch ? prefixMatch[1] : defaultPrefix
    const cleanStr = prefixMatch ? trimmed.slice(prefixMatch[0].length).trim() : trimmed

    if (cleanStr.startsWith('{') || cleanStr.includes('"inner"')) {
      try {
        const jsonMatch = cleanStr.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          const res = parseRechendreieckData(parsed, index)
          if (res) return { ...res, prefix }
        }
      } catch {}
    }

    // Fallback: Zahlen aus Text extrahieren
    const nums = (cleanStr.match(/\d+/g) || []).map(Number)
    if (nums.length >= 3) {
      const a = nums[0]
      let b = nums[1]
      let c = nums[2]
      if (a === b && b === c) {
        b = a + 1
        c = Math.max(1, a - 1)
      } else if (a === b) {
        b = a + 1
      }
      const outer: [number, number, number] = [a + b, b + c, c + a]
      return {
        inner: [a, b, c],
        outer,
        missing: ['outer_0', 'outer_1', 'outer_2'],
        prefix,
        solutions: {
          inner: [a, b, c],
          outer,
        },
      }
    }
  }

  return null
}

interface RechendreieckItemProps {
  data: RechendreieckData
  isSolution?: boolean
}

export function RechendreieckItem({ data, isSolution = false }: RechendreieckItemProps) {
  const { inner, outer, missing, prefix, solutions } = data

  // 3 Eckzahlen (Innen / Summanden): Feste Kreise an den 3 Spitzen
  // [0] oben: inner_0
  // [1] links unten: inner_1
  // [2] rechts unten: inner_2
  const corners = [
    { key: 'inner_0', x: 100, y: 24, val: inner[0], sol: solutions?.inner[0] ?? inner[0] },
    { key: 'inner_1', x: 34, y: 126, val: inner[1], sol: solutions?.inner[1] ?? inner[1] },
    { key: 'inner_2', x: 166, y: 126, val: inner[2], sol: solutions?.inner[2] ?? inner[2] },
  ]

  // 3 Außenzahlen (Summen): Abgerundete Rechtecke rx="4" mittig auf den 3 Kanten
  // [0] Kante links (zwischen oben und links unten): outer_0 (inner_0 + inner_1)
  // [1] Kante unten (zwischen links unten und rechts unten): outer_1 (inner_1 + inner_2)
  // [2] Kante rechts (zwischen rechts unten und oben): outer_2 (inner_2 + inner_0)
  const sides = [
    { key: 'outer_0', x: 67, y: 75, val: outer[0], sol: solutions?.outer[0] ?? outer[0] },
    { key: 'outer_1', x: 100, y: 126, val: outer[1], sol: solutions?.outer[1] ?? outer[1] },
    { key: 'outer_2', x: 133, y: 75, val: outer[2], sol: solutions?.outer[2] ?? outer[2] },
  ]

  return (
    <div className="flex flex-col items-center select-none py-1 px-1">
      {prefix && (
        <span className="font-bold text-gray-600 text-xs sm:text-sm mb-1 self-start font-mono">
          {prefix}
        </span>
      )}
      <svg
        width="170"
        height="150"
        viewBox="0 0 200 160"
        className="overflow-visible"
      >
        {/* Dreieckslinien, die die Eck-Kreise verbinden */}
        <line x1="100" y1="24" x2="34" y2="126" stroke="#9ca3af" strokeWidth="2" />
        <line x1="34" y1="126" x2="166" y2="126" stroke="#9ca3af" strokeWidth="2" />
        <line x1="166" y1="126" x2="100" y2="24" stroke="#9ca3af" strokeWidth="2" />

        {/* 1. Eckzahlen (Innen): Feste Kreise an den 3 Spitzen */}
        {corners.map((c) => {
          const isMissing = missing.includes(c.key)
          const showAnswer = isSolution && isMissing
          const showEmpty = !isSolution && isMissing

          return (
            <g key={c.key}>
              {/* Opake weiße Deckfläche, damit graue Verbindungslinien niemals durchscheinen */}
              <circle cx={c.x} cy={c.y} r={15} fill="white" />
              <circle
                cx={c.x}
                cy={c.y}
                r={15}
                fill={showAnswer ? '#eff6ff' : 'white'}
                stroke={
                  showAnswer
                    ? '#2563eb'
                    : showEmpty
                    ? '#6b7280'
                    : '#111827'
                }
                strokeWidth={showEmpty ? 1.5 : 2}
                strokeDasharray={showEmpty ? '3 3' : undefined}
              />
              {!showEmpty && (
                <text
                  x={c.x}
                  y={c.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={15}
                  fontWeight="bold"
                  fill={showAnswer ? '#1d4ed8' : '#111827'}
                  fontStyle={showAnswer ? 'italic' : 'normal'}
                  className="font-mono"
                >
                  {showAnswer ? c.sol : c.val}
                </text>
              )}
            </g>
          )
        })}

        {/* 2. Außenzahlen (Summen): Abgerundete Rechtecke rx="4" mittig auf den 3 Kanten */}
        {sides.map((s) => {
          const isMissing = missing.includes(s.key)
          const showAnswer = isSolution && isMissing
          const showEmpty = !isSolution && isMissing

          const width = 36
          const height = 26

          return (
            <g key={s.key}>
              {/* Opake weiße Deckfläche, damit die graue Linie hinter gestrichelten Boxen sauber verdeckt wird */}
              <rect
                x={s.x - width / 2}
                y={s.y - height / 2}
                width={width}
                height={height}
                rx={4}
                fill="white"
              />
              <rect
                x={s.x - width / 2}
                y={s.y - height / 2}
                width={width}
                height={height}
                rx={4}
                fill={showAnswer ? '#eff6ff' : 'white'}
                stroke={
                  showAnswer
                    ? '#2563eb'
                    : showEmpty
                    ? '#6b7280'
                    : '#111827'
                }
                strokeWidth={showEmpty ? 1.5 : 2}
                strokeDasharray={showEmpty ? '3 3' : undefined}
              />
              {!showEmpty && (
                <text
                  x={s.x}
                  y={s.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={14}
                  fontWeight="bold"
                  fill={showAnswer ? '#1d4ed8' : '#111827'}
                  fontStyle={showAnswer ? 'italic' : 'normal'}
                  className="font-mono"
                >
                  {showAnswer ? s.sol : s.val}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export const RechendreieckSVG = RechendreieckItem

// ── Rechenhäuser: Visuelle SVG-Komponente für Zahlzerlegungen ──
export interface RechenhausData {
  roof: number
  floors: Array<{
    left: number
    right: number
    missing: 'left' | 'right'
  }>
  prefix?: string
}

export function parseRechenhausData(item: unknown, index = 0): RechenhausData | null {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
  const defaultPrefix = `${letters[index] || index + 1})`

  if (!item) return null

  // 1. Direktes Objekt
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    const roof = Number(obj.roof ?? obj.dach ?? obj.hausnummer)
    const rawFloors = Array.isArray(obj.floors)
      ? obj.floors
      : Array.isArray(obj.stockwerke)
      ? obj.stockwerke
      : Array.isArray(obj.zeilen)
      ? obj.zeilen
      : []

    if (roof > 0) {
      const floors: Array<{ left: number; right: number; missing: 'left' | 'right' }> = []
      for (let f = 0; f < rawFloors.length; f++) {
        const fl = rawFloors[f]
        if (typeof fl === 'object' && fl !== null) {
          const flRec = fl as Record<string, unknown>
          let left = Number(flRec.left ?? flRec.links ?? 0)
          if (roof >= 2 && (left <= 0 || left >= roof)) {
            left = Math.max(1, Math.min(roof - 1, left <= 0 ? 1 : roof - 1))
          }
          const right = Number(flRec.right ?? flRec.rechts ?? (roof - left))
          const cleanRight = roof - left
          const missing: 'left' | 'right' =
            flRec.missing === 'left' || flRec.gesucht === 'links' ? 'left' : 'right'
          floors.push({ left, right: cleanRight, missing })
        }
      }

      if (floors.length === 0) {
        const countF = roof <= 5 ? 3 : 4
        const maxL = Math.max(1, roof - 1)
        for (let i = 0; i < countF; i++) {
          const left = (i % maxL) + 1
          floors.push({
            left,
            right: roof - left,
            missing: i % 2 === 0 ? 'right' : 'left',
          })
        }
      }

      const prefix = typeof obj.prefix === 'string' && obj.prefix.trim()
        ? obj.prefix.trim()
        : defaultPrefix

      return { roof, floors, prefix }
    }
  }

  // 2. String
  if (typeof item === 'string') {
    const trimmed = item.trim()
    const prefixMatch = trimmed.match(/^([a-z0-9]+[).])\s*/i)
    const prefix = prefixMatch ? prefixMatch[1] : defaultPrefix
    const cleanStr = prefixMatch ? trimmed.slice(prefixMatch[0].length).trim() : trimmed

    if (cleanStr.startsWith('{') || cleanStr.includes('"roof"')) {
      try {
        const jsonMatch = cleanStr.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          const res = parseRechenhausData(parsed, index)
          if (res) return { ...res, prefix }
        }
      } catch {}
    }

    const roofMatch = cleanStr.match(/dach\s*(\d+)/i) || cleanStr.match(/(\d+)/)
    if (roofMatch) {
      const roof = parseInt(roofMatch[1], 10)
      const countF = roof <= 5 ? 3 : 4
      const floors: Array<{ left: number; right: number; missing: 'left' | 'right' }> = []
      for (let i = 0; i < countF; i++) {
        const left = (i + 1) % (roof + 1)
        floors.push({
          left,
          right: roof - left,
          missing: i % 2 === 0 ? 'right' : 'left',
        })
      }
      return { roof, floors, prefix }
    }
  }

  return null
}

export interface RechenhausItemProps {
  data: RechenhausData
  isSolution?: boolean
}

export function RechenhausItem({ data, isSolution = false }: RechenhausItemProps) {
  const { roof, floors, prefix } = data
  const floorHeight = 28
  const houseWidth = 110
  const houseX = 15
  const roofHeight = 38
  const houseHeight = floors.length * floorHeight
  const totalSvgHeight = 10 + roofHeight + houseHeight + 10
  const middleX = houseX + houseWidth / 2 // 70

  return (
    <div className="flex flex-col items-center select-none py-1 px-1">
      {prefix && (
        <span className="font-bold text-gray-600 text-xs sm:text-sm mb-1 self-start font-mono">
          {prefix}
        </span>
      )}
      <svg
        width="135"
        height={Math.min(totalSvgHeight, 180)}
        viewBox={`0 0 140 ${totalSvgHeight}`}
        className="overflow-visible"
      >
        {/* Dach (Giebel): Großes Dreieck oben mit Dachzahl */}
        <polygon
          points={`${middleX},8 ${houseX},${8 + roofHeight} ${houseX + houseWidth},${8 + roofHeight}`}
          fill="#f8fafc"
          stroke="#111827"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <text
          x={middleX}
          y={8 + roofHeight * 0.62}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={20}
          fontWeight="bold"
          fill="#111827"
          className="font-mono"
        >
          {roof}
        </text>

        {/* Stockwerke: Hauskörper */}
        <rect
          x={houseX}
          y={8 + roofHeight}
          width={houseWidth}
          height={houseHeight}
          fill="#ffffff"
          stroke="#111827"
          strokeWidth="2.5"
        />

        {/* Vertikale Mittelwand zwischen linkem und rechtem Zimmer */}
        <line
          x1={middleX}
          y1={8 + roofHeight}
          x2={middleX}
          y2={8 + roofHeight + houseHeight}
          stroke="#111827"
          strokeWidth="2"
        />

        {/* Die einzelnen Stockwerke */}
        {floors.map((floor, fIdx) => {
          const y = 8 + roofHeight + fIdx * floorHeight
          const isLeftMissing = floor.missing === 'left'
          const isRightMissing = floor.missing === 'right'

          const showLeftAnswer = isSolution && isLeftMissing
          const showLeftEmpty = !isSolution && isLeftMissing

          const showRightAnswer = isSolution && isRightMissing
          const showRightEmpty = !isSolution && isRightMissing

          return (
            <g key={fIdx}>
              {/* Horizontale Deckenlinie */}
              {fIdx > 0 && (
                <line
                  x1={houseX}
                  y1={y}
                  x2={houseX + houseWidth}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="1.5"
                />
              )}

              {/* Linkes Zimmer */}
              {showLeftAnswer || showLeftEmpty ? (
                <rect
                  x={houseX + 3}
                  y={y + 3}
                  width={houseWidth / 2 - 6}
                  height={floorHeight - 6}
                  rx={3}
                  fill={showLeftAnswer ? '#eff6ff' : '#ffffff'}
                  stroke={showLeftAnswer ? '#2563eb' : '#6b7280'}
                  strokeWidth={1.5}
                  strokeDasharray={showLeftEmpty ? '3 3' : undefined}
                />
              ) : null}
              {!showLeftEmpty && (
                <text
                  x={houseX + houseWidth / 4}
                  y={y + floorHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={15}
                  fontWeight="bold"
                  fill={showLeftAnswer ? '#1d4ed8' : '#111827'}
                  fontStyle={showLeftAnswer ? 'italic' : 'normal'}
                  className="font-mono"
                >
                  {floor.left}
                </text>
              )}

              {/* Rechtes Zimmer */}
              {showRightAnswer || showRightEmpty ? (
                <rect
                  x={middleX + 3}
                  y={y + 3}
                  width={houseWidth / 2 - 6}
                  height={floorHeight - 6}
                  rx={3}
                  fill={showRightAnswer ? '#eff6ff' : '#ffffff'}
                  stroke={showRightAnswer ? '#2563eb' : '#6b7280'}
                  strokeWidth={1.5}
                  strokeDasharray={showRightEmpty ? '3 3' : undefined}
                />
              ) : null}
              {!showRightEmpty && (
                <text
                  x={middleX + houseWidth / 4}
                  y={y + floorHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={15}
                  fontWeight="bold"
                  fill={showRightAnswer ? '#1d4ed8' : '#111827'}
                  fontStyle={showRightAnswer ? 'italic' : 'normal'}
                  className="font-mono"
                >
                  {floor.right}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── Zahlenmauern: Visuelle SVG-Pyramiden-Komponente ──
export interface ZahlenmauerData {
  rows: number
  layers: number[][] // layers[0] = Basis (3 Steine), layers[1] = Mitte (2), layers[2] = Spitze (1)
  missing: Array<{ row: number; col: number }>
  solutions?: number[][]
  prefix?: string
}

export function parseZahlenmauerData(item: unknown, index = 0): ZahlenmauerData | null {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
  const defaultPrefix = `${letters[index] || index + 1})`

  if (!item) return null

  // 1. Direktes Objekt
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    if (Array.isArray(obj.layers) && obj.layers.length >= 2) {
      const rows = Number(obj.rows) || obj.layers.length
      const layers = (obj.layers as unknown[][]).map((l) => (Array.isArray(l) ? l.map(Number) : []))
      const missing = Array.isArray(obj.missing)
        ? (obj.missing as Array<{ row: number; col: number }>)
        : []
      const solutions = Array.isArray(obj.solutions)
        ? (obj.solutions as unknown[][]).map((l) => (Array.isArray(l) ? l.map(Number) : []))
        : layers
      const prefix = typeof obj.prefix === 'string' && obj.prefix.trim()
        ? obj.prefix.trim()
        : defaultPrefix

      return {
        rows,
        layers,
        missing,
        solutions,
        prefix,
      }
    }
  }

  // 2. String (JSON)
  if (typeof item === 'string') {
    const trimmed = item.trim()
    const prefixMatch = trimmed.match(/^([a-z0-9]+[).])\s*/i)
    const prefix = prefixMatch ? prefixMatch[1] : defaultPrefix
    const cleanStr = prefixMatch ? trimmed.slice(prefixMatch[0].length).trim() : trimmed

    if (cleanStr.startsWith('{') || cleanStr.includes('"layers"')) {
      try {
        const jsonMatch = cleanStr.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          const res = parseZahlenmauerData(parsed, index)
          if (res) return { ...res, prefix }
        }
      } catch {}
    }
  }

  return null
}

export interface ZahlenmauerSVGProps {
  data: ZahlenmauerData
  isSolution?: boolean
}

export function ZahlenmauerSVG({ data, isSolution = false }: ZahlenmauerSVGProps) {
  const { rows = 3, layers, missing, solutions, prefix } = data
  const brickWidth = 44
  const brickHeight = 26
  const paddingX = 6
  const paddingY = 6
  const totalSvgWidth = paddingX * 2 + rows * brickWidth
  const totalSvgHeight = paddingY * 2 + rows * brickHeight

  return (
    <div className="flex flex-col items-center select-none py-1 px-1">
      {prefix && (
        <span className="font-bold text-gray-600 text-xs sm:text-sm mb-1 self-start font-mono">
          {prefix}
        </span>
      )}
      <svg
        width={totalSvgWidth}
        height={totalSvgHeight}
        viewBox={`0 0 ${totalSvgWidth} ${totalSvgHeight}`}
        className="overflow-visible"
      >
        {layers.map((layer, r) => {
          // r=0 ist Basis (unten), r=rows-1 ist Spitze (oben)
          const rowFromTop = rows - 1 - r
          const y = paddingY + rowFromTop * brickHeight
          const offsetX = paddingX + (rows - layer.length) * (brickWidth / 2)

          return (
            <g key={r}>
              {layer.map((val, c) => {
                const x = offsetX + c * brickWidth
                const isMissing = missing.some((m) => m.row === r && m.col === c)
                const showAnswer = isSolution && isMissing
                const showEmpty = !isSolution && isMissing
                const solutionVal = solutions?.[r]?.[c] ?? val

                return (
                  <g key={`${r}-${c}`}>
                    <rect
                      x={x + 1}
                      y={y + 1}
                      width={brickWidth - 2}
                      height={brickHeight - 2}
                      rx={2}
                      fill={showAnswer ? '#eff6ff' : '#ffffff'}
                      stroke={
                        showAnswer
                          ? '#2563eb'
                          : showEmpty
                          ? '#6b7280'
                          : '#374151'
                      }
                      strokeWidth={showEmpty ? 1.5 : 2}
                      strokeDasharray={showEmpty ? '3 3' : undefined}
                    />
                    {!showEmpty && (
                      <text
                        x={x + brickWidth / 2}
                        y={y + brickHeight / 2}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={14}
                        fontWeight="bold"
                        fill={showAnswer ? '#1d4ed8' : '#111827'}
                        fontStyle={showAnswer ? 'italic' : 'normal'}
                        className="font-mono"
                      >
                        {showAnswer ? solutionVal : val}
                      </text>
                    )}
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export const ZahlenmauerItem = ZahlenmauerSVG

// ── Größen: Euro und Cent (Klasse 1) Komponenten ──
export interface GeldZaehlenData {
  prefix?: string
  unit: '€' | 'ct'
  total: number
  denominations: number[]
}

export function parseGeldZaehlenData(item: unknown, index = 0): GeldZaehlenData | null {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const defaultPrefix = `${letters[index] || index + 1})`

  if (!item) return null

  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    const total = Number(obj.total ?? obj.betrag ?? obj.ziel ?? obj.summe ?? 0)
    const unit: '€' | 'ct' = obj.unit === 'ct' || obj.einheit === 'ct' ? 'ct' : '€'
    const prefix = typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix

    let denominations: number[] = []
    if (Array.isArray(obj.denominations)) {
      denominations = obj.denominations.map(Number).filter((n) => n > 0)
    } else if (Array.isArray(obj.muenzen)) {
      denominations = obj.muenzen.map(Number).filter((n) => n > 0)
    }

    if (total > 0 && denominations.length === 0) {
      denominations = decomposeGeldAmount(total, unit)
    }

    if (total > 0 && denominations.length > 0) {
      return { prefix, unit, total, denominations }
    }
  }

  if (typeof item === 'string') {
    const trimmed = item.trim()
    const prefixMatch = trimmed.match(/^([a-z0-9]+[).])\s*/i)
    const prefix = prefixMatch ? prefixMatch[1] : defaultPrefix
    const cleanStr = prefixMatch ? trimmed.slice(prefixMatch[0].length).trim() : trimmed

    if (cleanStr.startsWith('{')) {
      try {
        const parsed = JSON.parse(cleanStr)
        const res = parseGeldZaehlenData(parsed, index)
        if (res) return { ...res, prefix }
      } catch {}
    }

    const unit: '€' | 'ct' = cleanStr.includes('ct') ? 'ct' : '€'
    const parts = cleanStr.split('=')
    if (parts.length >= 2) {
      const left = parts[0]
      const right = parts[1]
      const rightNumMatch = right.match(/(\d+)/)
      const rawNums = left.match(/\d+/g) || []
      const numMatches = rawNums.map((n) => parseInt(n, 10))
      const total = rightNumMatch ? parseInt(rightNumMatch[1], 10) : numMatches.reduce((a, b) => a + b, 0)
      const denominations = numMatches.length > 0 ? numMatches.sort((a, b) => b - a) : decomposeGeldAmount(total, unit)
      if (total > 0) {
        return { prefix, unit, total, denominations }
      }
    }
  }

  return null
}

export function GeldscheinSVG({
  value,
  colorMode = 'color',
}: {
  value: number
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  return (
    <svg
      width="54"
      height="34"
      viewBox="0 0 54 34"
      className="overflow-visible inline-block flex-shrink-0 select-none"
    >
      <rect
        x="1"
        y="1"
        width="52"
        height="32"
        rx="3"
        fill={isBw ? '#ffffff' : '#f8fafc'}
        stroke={isBw ? '#000000' : '#1e293b'}
        strokeWidth={isBw ? 2 : 1.5}
      />
      <rect
        x="4"
        y="4"
        width="46"
        height="26"
        rx="2"
        fill="none"
        stroke={isBw ? '#000000' : '#94a3b8'}
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <text
        x="27"
        y="17"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="13"
        fontWeight="bold"
        fill={isBw ? '#000000' : '#111827'}
        className="font-mono"
      >
        {value} €
      </text>
    </svg>
  )
}

export function EuroMuenzeSVG({
  value,
  colorMode = 'color',
}: {
  value: number
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 34 34"
      className="overflow-visible inline-block flex-shrink-0 select-none"
    >
      <circle
        cx="17"
        cy="17"
        r="15"
        fill={isBw ? '#ffffff' : value === 2 ? '#fef3c7' : '#f1f5f9'}
        stroke={isBw ? '#000000' : '#1e293b'}
        strokeWidth={isBw ? 2 : 1.5}
      />
      <circle
        cx="17"
        cy="17"
        r="11"
        fill={isBw ? '#ffffff' : value === 2 ? '#ffffff' : '#fef3c7'}
        stroke={isBw ? '#000000' : '#64748b'}
        strokeWidth={1}
      />
      <text
        x="17"
        y="17.5"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
        fill={isBw ? '#000000' : '#111827'}
        className="font-mono"
      >
        {value} €
      </text>
    </svg>
  )
}

export function CentMuenzeSVG({
  value,
  colorMode = 'color',
}: {
  value: number
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const isTwoDigit = value >= 10
  const size = isTwoDigit ? 38 : 34
  const radius = isTwoDigit ? 17 : 15
  const center = size / 2

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible inline-block flex-shrink-0 select-none"
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill={isBw ? '#ffffff' : '#fed7aa'}
        stroke={isBw ? '#000000' : '#c2410c'}
        strokeWidth={isBw ? 2 : 1.5}
      />
      <text
        x={center}
        y={center + 0.5}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={isTwoDigit ? '9.5' : '11'}
        fontWeight="bold"
        fill={isBw ? '#000000' : '#7c2d12'}
        className="font-mono"
      >
        {value} ct
      </text>
    </svg>
  )
}

export interface MoneyPieceProps {
  value: number
  unit: '€' | 'ct'
  colorMode?: 'color' | 'bw'
  imageUrl?: string | null
}

export function MoneyPiece({
  value,
  unit,
  colorMode = 'color',
  imageUrl = null,
}: MoneyPieceProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`${value} ${unit}`}
        className={`inline-block object-contain select-none ${
          unit === '€' && value >= 5 ? 'w-14 h-8.5 rounded-sm' : 'w-8.5 h-8.5 rounded-full'
        } ${
          colorMode === 'bw'
            ? 'grayscale contrast-[1.25] brightness-[1.10] border border-slate-300 rounded-sm'
            : ''
        }`}
      />
    )
  }

  if (unit === '€') {
    if (value >= 5) {
      return <GeldscheinSVG value={value} colorMode={colorMode} />
    }
    return <EuroMuenzeSVG value={value} colorMode={colorMode} />
  }
  return <CentMuenzeSVG value={value} colorMode={colorMode} />
}

export const GeldStueckSVG = MoneyPiece

export function GeldZaehlenItem({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: GeldZaehlenData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const { prefix, unit, total, denominations } = data
  const isBw = colorMode === 'bw'
  return (
    <div className="flex items-center gap-2 py-1 flex-wrap sm:flex-nowrap">
      {prefix && (
        <span className="font-semibold text-gray-500 text-sm min-w-[20px] flex-shrink-0 font-mono">
          {prefix}
        </span>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        {denominations.map((val, idx) => (
          <MoneyPiece key={idx} value={val} unit={unit} colorMode={colorMode} />
        ))}
      </div>
      <span className="font-bold text-gray-700 text-lg mx-1 select-none flex-shrink-0">=</span>
      <div className="flex items-center flex-shrink-0">
        {isSolution ? (
          <span
            className={`inline-flex w-12 h-8 border-2 rounded-md print:border-black items-center justify-center font-mono font-bold text-base select-none ${
              isBw
                ? 'border-black text-black bg-white'
                : 'border-slate-600 text-blue-700 bg-blue-50/60'
            }`}
          >
            {total}
          </span>
        ) : (
          <span
            className={`inline-flex w-12 h-8 border-2 border-dashed rounded-md print:border-black items-center justify-center font-mono text-base bg-white select-none ${
              isBw ? 'border-slate-600' : 'border-slate-400'
            }`}
          />
        )}
        <span className="font-bold text-gray-800 text-base ml-1.5 font-mono">{unit}</span>
      </div>
    </div>
  )
}

export interface GeldRechnenData {
  prefix?: string
  num1: number
  op: '+' | '-'
  num2: number
  result: number
  unit: '€' | 'ct'
}

export function parseGeldRechnenData(item: unknown, index = 0): GeldRechnenData | null {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const defaultPrefix = `${letters[index] || index + 1})`

  if (!item) return null

  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    const num1 = Number(obj.num1 ?? obj.a ?? 0)
    const num2 = Number(obj.num2 ?? obj.b ?? 0)
    const op: '+' | '-' = obj.op === '-' ? '-' : '+'
    const unit: '€' | 'ct' = obj.unit === 'ct' ? 'ct' : '€'
    const result = Number(obj.result ?? (op === '+' ? num1 + num2 : num1 - num2))
    const prefix = typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix

    if (num1 > 0 && num2 > 0) {
      return { prefix, num1, op, num2, result, unit }
    }
  }

  if (typeof item === 'string') {
    const trimmed = item.trim()
    const prefixMatch = trimmed.match(/^([a-z0-9]+[).])\s*/i)
    const prefix = prefixMatch ? prefixMatch[1] : defaultPrefix
    const cleanStr = prefixMatch ? trimmed.slice(prefixMatch[0].length).trim() : trimmed

    const m = cleanStr.match(/(\d+)\s*(€|ct)\s*([\+\-])\s*(\d+)\s*(?:€|ct)?\s*=\s*(\d+|_+|\[\s*\])?\s*(?:€|ct)?/i)
    if (m) {
      const num1 = parseInt(m[1], 10)
      const unit = m[2] === 'ct' ? 'ct' : '€'
      const op = m[3] as '+' | '-'
      const num2 = parseInt(m[4], 10)
      const result = m[5] && !m[5].includes('_') && !m[5].includes('[') ? parseInt(m[5], 10) : (op === '+' ? num1 + num2 : num1 - num2)
      return { prefix, num1, op, num2, result, unit }
    }
  }

  return null
}

export function GeldRechnenItem({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: GeldRechnenData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const { prefix, num1, op, num2, result, unit } = data
  const isBw = colorMode === 'bw'
  return (
    <div className="flex items-center gap-2 whitespace-nowrap py-1">
      {prefix && (
        <span className="font-semibold text-gray-500 text-sm min-w-[20px] flex-shrink-0 font-mono">
          {prefix}
        </span>
      )}
      <span className="font-mono text-base font-medium text-gray-900">
        {num1} {unit} {op} {num2} {unit} =
      </span>
      <div className="flex items-center flex-shrink-0">
        {isSolution ? (
          <span
            className={`inline-flex w-11 h-8 border-2 rounded print:border-black items-center justify-center font-mono font-bold text-base select-none ${
              isBw
                ? 'border-black text-black bg-white'
                : 'border-slate-600 text-blue-700 bg-blue-50/60'
            }`}
          >
            {result}
          </span>
        ) : (
          <span
            className={`inline-flex w-11 h-8 border-2 border-dashed rounded print:border-black items-center justify-center font-mono text-base bg-white select-none ${
              isBw ? 'border-slate-600' : 'border-slate-400'
            }`}
          />
        )}
        <span className="font-mono text-base font-medium text-gray-900 ml-1.5">{unit}</span>
      </div>
    </div>
  )
}

export interface GeldVergleichData {
  prefix?: string
  leftTerm: string
  operator: '<' | '>' | '='
  rightTerm: string
}

export function parseGeldVergleichData(item: unknown, index = 0): GeldVergleichData | null {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const defaultPrefix = `${letters[index] || index + 1})`

  if (!item) return null

  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    const prefix = typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix
    const leftTerm = String(obj.leftTerm ?? obj.links ?? '')
    const rightTerm = String(obj.rightTerm ?? obj.rechts ?? '')
    const operator = (obj.operator ?? obj.op ?? '=') as '<' | '>' | '='

    if (leftTerm && rightTerm) {
      return { prefix, leftTerm, operator, rightTerm }
    }
  }

  if (typeof item === 'string') {
    const trimmed = item.trim()
    const prefixMatch = trimmed.match(/^([a-z0-9]+[).])\s*/i)
    const prefix = prefixMatch ? prefixMatch[1] : defaultPrefix
    const cleanStr = prefixMatch ? trimmed.slice(prefixMatch[0].length).trim() : trimmed

    const compMatch = cleanStr.match(/(.*?)\s*(\[\s*[\?\_]?\s*\]|\(\s*\)|[<>=])\s*(.*)/)
    if (compMatch) {
      const leftTerm = compMatch[1].trim()
      const middle = compMatch[2].trim()
      const rightTerm = compMatch[3].trim()

      const op: '<' | '>' | '=' = middle === '<' || middle === '>' || middle === '=' ? middle : '='
      return { prefix, leftTerm, operator: op, rightTerm }
    }
  }

  return null
}

export function GeldVergleichItem({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: GeldVergleichData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const { prefix, leftTerm, operator, rightTerm } = data
  const isBw = colorMode === 'bw'
  return (
    <div className="flex items-center whitespace-nowrap py-1">
      {prefix && (
        <span className="font-semibold text-gray-500 text-sm mr-2 min-w-[20px] flex-shrink-0 font-mono">
          {prefix}
        </span>
      )}
      <span className="font-mono text-base font-medium text-gray-900">{leftTerm}</span>
      {isSolution ? (
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-full border-2 mx-2.5 font-bold text-base print:border-black flex-shrink-0 select-none font-mono ${
            isBw
              ? 'border-black text-black bg-white'
              : 'border-slate-600 text-blue-700 bg-blue-50/60'
          }`}
        >
          {operator}
        </span>
      ) : (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border-2 border-slate-600 mx-2.5 text-transparent select-none print:border-black flex-shrink-0" />
      )}
      <span className="font-mono text-base font-medium text-gray-900">{rightTerm}</span>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════
// UHRZEIT-KOMPONENTEN (KLASSE 1: VOLLE STUNDEN)
// ═════════════════════════════════════════════════════════════════

export interface AnalogClockSVGProps {
  hour: number // 1 .. 12
  showHourHand?: boolean
  isHourHandSolution?: boolean
  colorMode?: 'color' | 'bw'
  size?: number
}

export function AnalogClockSVG({
  hour,
  showHourHand = true,
  isHourHandSolution = false,
  colorMode = 'color',
  size = 90,
}: AnalogClockSVGProps) {
  const isBw = colorMode === 'bw'
  const normalizedHour = ((hour - 1) % 12) + 1

  // 12 Stunden-Ticks und Zahlen
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const num = i + 1
    const angleDeg = num * 30 - 90
    const angleRad = (angleDeg * Math.PI) / 180
    const x1 = 50 + 40 * Math.cos(angleRad)
    const y1 = 50 + 40 * Math.sin(angleRad)
    const x2 = 50 + 44 * Math.cos(angleRad)
    const y2 = 50 + 44 * Math.sin(angleRad)
    const tx = 50 + 33 * Math.cos(angleRad)
    const ty = 50 + 33 * Math.sin(angleRad)
    const isQuarter = num % 3 === 0

    return {
      num,
      x1,
      y1,
      x2,
      y2,
      tx,
      ty,
      isQuarter,
    }
  })

  // Stundenzeiger (kurz und kräftig: 22px)
  const hourAngleDeg = normalizedHour * 30 - 90
  const hourAngleRad = (hourAngleDeg * Math.PI) / 180
  const hx = 50 + 22 * Math.cos(hourAngleRad)
  const hy = 50 + 22 * Math.sin(hourAngleRad)

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="overflow-visible inline-block select-none flex-shrink-0"
    >
      {/* Äußerer Kreis */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="white"
        stroke={isBw ? '#000000' : '#1e293b'}
        strokeWidth="2.5"
      />

      {/* 12 Ticks und Zahlen 1 bis 12 */}
      {ticks.map(({ num, x1, y1, x2, y2, tx, ty, isQuarter }) => (
        <g key={num}>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={isBw ? '#000000' : '#334155'}
            strokeWidth={isQuarter ? '2.5' : '1.2'}
            strokeLinecap="round"
          />
          <text
            x={tx}
            y={ty}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="8.5"
            fontWeight="bold"
            fill={isBw ? '#000000' : '#1e293b'}
            className="font-sans font-bold"
          >
            {num}
          </text>
        </g>
      ))}

      {/* Langer Minutenzeiger (zeigt IMMER strikt auf die 12 / y=14) */}
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="14"
        stroke={isBw ? '#000000' : '#334155'}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Kurzer Stundenzeiger (falls sichtbar) */}
      {showHourHand && (
        <line
          x1="50"
          y1="50"
          x2={hx}
          y2={hy}
          stroke={
            isHourHandSolution
              ? isBw
                ? '#000000'
                : '#2563eb'
              : isBw
              ? '#000000'
              : '#0f172a'
          }
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={isHourHandSolution && isBw ? '3 1.5' : undefined}
        />
      )}

      {/* Mittelpunkt */}
      <circle
        cx="50"
        cy="50"
        r="3.5"
        fill={
          isHourHandSolution
            ? isBw
              ? '#000000'
              : '#2563eb'
            : isBw
            ? '#000000'
            : '#0f172a'
        }
      />
    </svg>
  )
}

// ── Parser & Komponenten für Sektion 1: Uhrzeit ablesen ────────
export interface UhrzeitAblesenData {
  prefix?: string
  hour: number
}

export function parseUhrzeitAblesenData(item: unknown, index = 0): UhrzeitAblesenData | null {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const defaultPrefix = `${letters[index] || index + 1})`

  if (!item) return null

  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    const hour = Number(obj.hour ?? obj.stunde ?? 0)
    const prefix = typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix
    if (hour >= 1 && hour <= 12) {
      return { prefix, hour }
    }
  }

  if (typeof item === 'string') {
    const trimmed = item.trim()
    const prefixMatch = trimmed.match(/^([a-z0-9]+[).])\s*/i)
    const prefix = prefixMatch ? prefixMatch[1] : defaultPrefix
    const cleanStr = prefixMatch ? trimmed.slice(prefixMatch[0].length).trim() : trimmed

    const m = cleanStr.match(/(\d+)\s*uhr/i) || cleanStr.match(/(\d+)/)
    if (m) {
      const hour = parseInt(m[1], 10)
      if (hour >= 1 && hour <= 12) {
        return { prefix, hour }
      }
    }
  }

  return null
}

export function UhrzeitAblesenItem({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: UhrzeitAblesenData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const { prefix, hour } = data
  const isBw = colorMode === 'bw'

  return (
    <div className="flex flex-col items-center justify-between p-3 rounded-lg border border-slate-200 bg-white/70 shadow-xs print:border-gray-400">
      <div className="w-full flex items-center justify-between mb-1">
        {prefix && (
          <span className="font-semibold text-gray-500 text-xs font-mono select-none">
            {prefix}
          </span>
        )}
      </div>
      <div className="my-1">
        <AnalogClockSVG hour={hour} colorMode={colorMode} />
      </div>
      <div className="flex items-center gap-1.5 mt-2 text-sm font-medium text-gray-900 whitespace-nowrap">
        <span>Es ist</span>
        {isSolution ? (
          <span
            className={`inline-flex w-10 h-7 border-2 rounded print:border-black items-center justify-center font-mono font-bold text-sm select-none ${
              isBw
                ? 'border-black text-black bg-white'
                : 'border-slate-600 text-blue-700 bg-blue-50/60'
            }`}
          >
            {hour}
          </span>
        ) : (
          <span
            className={`inline-flex w-10 h-7 border-2 border-dashed rounded print:border-black items-center justify-center font-mono text-sm bg-white select-none ${
              isBw ? 'border-slate-600' : 'border-slate-400'
            }`}
          />
        )}
        <span>Uhr.</span>
      </div>
    </div>
  )
}

// ── Parser & Komponenten für Sektion 2: Zeiger einzeichnen ─────
export interface UhrzeitZeichnenData {
  prefix?: string
  hour: number
}

export function parseUhrzeitZeichnenData(item: unknown, index = 0): UhrzeitZeichnenData | null {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const defaultPrefix = `${letters[index] || index + 1})`

  if (!item) return null

  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    const hour = Number(obj.hour ?? obj.stunde ?? 0)
    const prefix = typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix
    if (hour >= 1 && hour <= 12) {
      return { prefix, hour }
    }
  }

  if (typeof item === 'string') {
    const trimmed = item.trim()
    const prefixMatch = trimmed.match(/^([a-z0-9]+[).])\s*/i)
    const prefix = prefixMatch ? prefixMatch[1] : defaultPrefix
    const cleanStr = prefixMatch ? trimmed.slice(prefixMatch[0].length).trim() : trimmed

    const m = cleanStr.match(/(\d+)\s*uhr/i) || cleanStr.match(/(\d+)/)
    if (m) {
      const hour = parseInt(m[1], 10)
      if (hour >= 1 && hour <= 12) {
        return { prefix, hour }
      }
    }
  }

  return null
}

export function UhrzeitZeichnenItem({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: UhrzeitZeichnenData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const { prefix, hour } = data

  return (
    <div className="flex flex-col items-center justify-between p-3 rounded-lg border border-slate-200 bg-white/70 shadow-xs print:border-gray-400">
      <div className="w-full flex items-center justify-between mb-1">
        {prefix && (
          <span className="font-semibold text-gray-500 text-xs font-mono select-none">
            {prefix}
          </span>
        )}
      </div>
      <div className="my-1">
        <AnalogClockSVG
          hour={hour}
          showHourHand={isSolution}
          isHourHandSolution={isSolution}
          colorMode={colorMode}
        />
      </div>
      <span className="font-bold text-base font-mono text-gray-900 mt-2 select-none">
        {hour} Uhr
      </span>
    </div>
  )
}

// ── Parser & Komponenten für Sektion 3: Rechnen mit Stunden ────
export interface UhrzeitRechnenData {
  prefix?: string
  startHour: number
  op: '+' | '-'
  diffHours: number
  resultHour: number
}

export function parseUhrzeitRechnenData(item: unknown, index = 0): UhrzeitRechnenData | null {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const defaultPrefix = `${letters[index] || index + 1})`

  if (!item) return null

  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    const startHour = Number(obj.startHour ?? obj.num1 ?? 0)
    const diffHours = Number(obj.diffHours ?? obj.num2 ?? 0)
    const op: '+' | '-' = obj.op === '-' ? '-' : '+'
    const resultHour = Number(obj.resultHour ?? (op === '+' ? startHour + diffHours : startHour - diffHours))
    const prefix = typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix

    if (startHour > 0 && diffHours > 0) {
      return { prefix, startHour, op, diffHours, resultHour }
    }
  }

  if (typeof item === 'string') {
    const trimmed = item.trim()
    const prefixMatch = trimmed.match(/^([a-z0-9]+[).])\s*/i)
    const prefix = prefixMatch ? prefixMatch[1] : defaultPrefix
    const cleanStr = prefixMatch ? trimmed.slice(prefixMatch[0].length).trim() : trimmed

    // z.B. "4 Uhr + 3 Stunden = 7 Uhr" oder "4 Uhr + 3 Stunden = ____ Uhr"
    const m = cleanStr.match(/(\d+)\s*uhr\s*([\+\-])\s*(\d+)\s*stunden?\s*=\s*(\d+|_+|\[\s*\])?\s*uhr?/i)
    if (m) {
      const startHour = parseInt(m[1], 10)
      const op = m[2] as '+' | '-'
      const diffHours = parseInt(m[3], 10)
      const resultHour = m[4] && !m[4].includes('_') && !m[4].includes('[') ? parseInt(m[4], 10) : (op === '+' ? startHour + diffHours : startHour - diffHours)
      return { prefix, startHour, op, diffHours, resultHour }
    }
  }

  return null
}

export function UhrzeitRechnenItem({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: UhrzeitRechnenData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const { prefix, startHour, op, diffHours, resultHour } = data
  const isBw = colorMode === 'bw'
  const stundenWord = diffHours === 1 ? 'Stunde' : 'Stunden'

  return (
    <div className="flex items-center gap-2 whitespace-nowrap py-1">
      {prefix && (
        <span className="font-semibold text-gray-500 text-sm min-w-[20px] flex-shrink-0 font-mono">
          {prefix}
        </span>
      )}
      <span className="font-mono text-base font-medium text-gray-900">
        {startHour} Uhr {op} {diffHours} {stundenWord} =
      </span>
      <div className="flex items-center flex-shrink-0">
        {isSolution ? (
          <span
            className={`inline-flex w-11 h-8 border-2 rounded print:border-black items-center justify-center font-mono font-bold text-base select-none ${
              isBw
                ? 'border-black text-black bg-white'
                : 'border-slate-600 text-blue-700 bg-blue-50/60'
            }`}
          >
            {resultHour}
          </span>
        ) : (
          <span
            className={`inline-flex w-11 h-8 border-2 border-dashed rounded print:border-black items-center justify-center font-mono text-base bg-white select-none ${
              isBw ? 'border-slate-600' : 'border-slate-400'
            }`}
          />
        )}
        <span className="font-mono text-base font-medium text-gray-900 ml-1.5">Uhr</span>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════
// STRICHLISTEN-KOMPONENTEN (KLASSE 1: 5er-BÜNDELUNG & HÄUFIGKEITEN)
// ═════════════════════════════════════════════════════════════════

export interface TallyMarksSVGProps {
  count: number // 1 .. 25
  colorMode?: 'color' | 'bw'
  isSolution?: boolean
}

export function TallyMarksSVG({
  count,
  colorMode = 'color',
  isSolution = false,
}: TallyMarksSVGProps) {
  const isBw = colorMode === 'bw'
  const stroke = isSolution
    ? isBw
      ? '#000000'
      : '#2563eb'
    : isBw
    ? '#000000'
    : '#1e293b'

  const safeCount = Math.max(0, Math.min(25, count))
  const bundles = Math.floor(safeCount / 5)
  const remainder = safeCount % 5

  // 5er-Bündel: 4 Striche (x=2, 8, 14, 20) -> Gesamtbreite 22px
  const bundleWidth = 22
  const gap = 14
  const remainderWidth = remainder > 0 ? (remainder - 1) * 6 + 4 : 0
  const totalWidth =
    bundles === 0
      ? Math.max(16, remainderWidth + 8)
      : bundles * bundleWidth +
        Math.max(0, bundles - 1) * gap +
        (remainder > 0 ? gap + remainderWidth : 0) +
        8

  const height = 28
  let currentX = 4
  const elements: React.ReactNode[] = []

  // 1. 5er-Bündel (4 senkrechte Striche + 1 Querstrich)
  for (let b = 0; b < bundles; b++) {
    const gx = currentX
    elements.push(
      <g key={`b-${b}`}>
        {/* 4 senkrechte Striche (Abstand 6px) */}
        <line x1={gx} y1={4} x2={gx} y2={24} stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        <line x1={gx + 6} y1={4} x2={gx + 6} y2={24} stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        <line x1={gx + 12} y1={4} x2={gx + 12} y2={24} stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        <line x1={gx + 18} y1={4} x2={gx + 18} y2={24} stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        {/* Diagonale Durchstreichung von unten links nach oben rechts */}
        <line x1={gx - 2} y1={23} x2={gx + 20} y2={5} stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      </g>
    )
    currentX += bundleWidth + gap
  }

  // 2. Einzelstriche
  if (remainder > 0) {
    for (let r = 0; r < remainder; r++) {
      const sx = currentX + r * 6
      elements.push(
        <line
          key={`r-${r}`}
          x1={sx}
          y1={4}
          x2={sx}
          y2={24}
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )
    }
  }

  return (
    <svg
      width={totalWidth}
      height={height}
      viewBox={`0 0 ${totalWidth} ${height}`}
      className="overflow-visible inline-block select-none flex-shrink-0"
    >
      {elements}
    </svg>
  )
}

// ── SVG-Symbole für Suchbild & Tabelle ──────────────────────────
export function ShapeIconSVG({
  shape,
  colorMode = 'color',
  size = 22,
}: {
  shape: ShapeType | string
  colorMode?: 'color' | 'bw'
  size?: number
}) {
  const isBw = colorMode === 'bw'
  const s = String(shape || '').toLowerCase().trim()

  if (s === 'star' || s === 'stern') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="inline-block select-none flex-shrink-0"
      >
        <polygon
          points="12,2 14.8,8.2 21.5,8.8 16.4,13.4 17.9,20 12,16.5 6.1,20 7.6,13.4 2.5,8.8 9.2,8.2"
          fill={isBw ? '#475569' : '#fef08a'}
          stroke={isBw ? '#000000' : '#ca8a04'}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (s === 'triangle' || s === 'dreieck') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="inline-block select-none flex-shrink-0"
      >
        <polygon
          points="12,3 22,21 2,21"
          fill={isBw ? '#cbd5e1' : '#bae6fd'}
          stroke={isBw ? '#000000' : '#0284c7'}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (s === 'square' || s === 'quadrat') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="inline-block select-none flex-shrink-0"
      >
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="1.5"
          fill={isBw ? '#ffffff' : '#dcfce7'}
          stroke={isBw ? '#000000' : '#16a34a'}
          strokeWidth="1.8"
        />
      </svg>
    )
  }

  if (s === 'rectangle' || s === 'rechteck') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="inline-block select-none flex-shrink-0"
      >
        <rect
          x="2"
          y="6"
          width="20"
          height="12"
          rx="1.5"
          fill={isBw ? '#cbd5e1' : '#fef3c7'}
          stroke={isBw ? '#000000' : '#d97706'}
          strokeWidth="1.8"
        />
      </svg>
    )
  }

  // circle / kreis
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="inline-block select-none flex-shrink-0"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill={isBw ? '#ffffff' : '#fecdd3'}
        stroke={isBw ? '#000000' : '#e11d48'}
        strokeWidth={isBw ? 2 : 1.8}
      />
    </svg>
  )
}

// ── Suchbild-Kasten mit garantierten überlappungsfreien Formen ───
export function ShapeSearchBoxSVG({
  shapes,
  colorMode = 'color',
}: {
  shapes: PlacedShape[]
  colorMode?: 'color' | 'bw'
}) {
  return (
    <div className="w-full h-28 border-2 border-slate-300 rounded-xl bg-slate-50/50 relative overflow-hidden flex items-center justify-center p-2 print:border-gray-400 print:bg-white select-none">
      <svg
        viewBox="0 0 560 110"
        className="w-full h-full max-h-[105px] overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        {shapes.map((s) => {
          const cx = s.col * 70 + 35 + s.offsetX
          const cy = s.row * 36.6 + 18.3 + s.offsetY
          return (
            <g key={s.id} transform={`translate(${cx - 12}, ${cy - 12})`}>
              <ShapeIconSVG shape={s.shape} colorMode={colorMode} size={24} />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── Parser & Komponenten für Sektion 1: Strichlisten ablesen ────
export interface StrichlisteAblesenData {
  prefix?: string
  count: number
}

export function parseStrichlisteAblesenData(
  item: unknown,
  index = 0
): StrichlisteAblesenData | null {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const defaultPrefix = `${letters[index] || index + 1})`

  if (!item) return null

  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    const count = Number(obj.count ?? obj.anzahl ?? obj.number ?? 0)
    const prefix =
      typeof obj.prefix === 'string' && obj.prefix.trim()
        ? obj.prefix.trim()
        : defaultPrefix
    if (count > 0) {
      return { prefix, count }
    }
  }

  if (typeof item === 'string') {
    const trimmed = item.trim()
    const prefixMatch = trimmed.match(/^([a-z0-9]+[).])\s*/i)
    const prefix = prefixMatch ? prefixMatch[1] : defaultPrefix
    const cleanStr = prefixMatch ? trimmed.slice(prefixMatch[0].length).trim() : trimmed

    const numMatch = cleanStr.match(/\d+/)
    if (numMatch) {
      const count = parseInt(numMatch[0], 10)
      if (count > 0) {
        return { prefix, count }
      }
    }
  }

  return null
}

export function StrichlisteAblesenItem({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: StrichlisteAblesenData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const { prefix, count } = data
  const isBw = colorMode === 'bw'

  return (
    <div className="flex items-center gap-2 py-1.5 whitespace-nowrap">
      {prefix && (
        <span className="font-semibold text-gray-500 text-sm min-w-[20px] font-mono select-none">
          {prefix}
        </span>
      )}
      <div className="flex items-center min-w-[70px]">
        <TallyMarksSVG count={count} colorMode={colorMode} />
      </div>
      <span className="font-bold text-gray-600 text-base mx-1 select-none">=</span>
      <div className="flex items-center flex-shrink-0">
        {isSolution ? (
          <span
            className={`inline-flex w-11 h-8 border-2 rounded print:border-black items-center justify-center font-mono font-bold text-base select-none ${
              isBw
                ? 'border-black text-black bg-white'
                : 'border-slate-600 text-blue-700 bg-blue-50/60'
            }`}
          >
            {count}
          </span>
        ) : (
          <span
            className={`inline-flex w-11 h-8 border-2 border-dashed rounded print:border-black items-center justify-center font-mono text-base bg-white select-none ${
              isBw ? 'border-slate-600' : 'border-slate-400'
            }`}
          />
        )}
      </div>
    </div>
  )
}

// ── Parser & Komponenten für Sektion 2: Strichlisten zeichnen ───
export interface StrichlisteZeichnenData {
  prefix?: string
  count: number
}

export function parseStrichlisteZeichnenData(
  item: unknown,
  index = 0
): StrichlisteZeichnenData | null {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const defaultPrefix = `${letters[index] || index + 1})`

  if (!item) return null

  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    const count = Number(obj.count ?? obj.anzahl ?? obj.number ?? 0)
    const prefix =
      typeof obj.prefix === 'string' && obj.prefix.trim()
        ? obj.prefix.trim()
        : defaultPrefix
    if (count > 0) {
      return { prefix, count }
    }
  }

  if (typeof item === 'string') {
    const trimmed = item.trim()
    const prefixMatch = trimmed.match(/^([a-z0-9]+[).])\s*/i)
    const prefix = prefixMatch ? prefixMatch[1] : defaultPrefix
    const cleanStr = prefixMatch ? trimmed.slice(prefixMatch[0].length).trim() : trimmed

    const numMatch = cleanStr.match(/\d+/)
    if (numMatch) {
      const count = parseInt(numMatch[0], 10)
      if (count > 0) {
        return { prefix, count }
      }
    }
  }

  return null
}

export function StrichlisteZeichnenItem({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: StrichlisteZeichnenData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const { prefix, count } = data
  const isBw = colorMode === 'bw'

  return (
    <div className="flex items-center gap-2 py-1.5 whitespace-nowrap">
      {prefix && (
        <span className="font-semibold text-gray-500 text-sm min-w-[20px] font-mono select-none">
          {prefix}
        </span>
      )}
      <span className="font-mono text-base font-bold text-gray-900 min-w-[34px] select-none">
        {count} =
      </span>
      <div
        className={`w-44 h-11 border-2 border-dashed rounded-md flex items-center px-3 bg-white select-none ${
          isBw ? 'border-slate-600' : 'border-slate-400'
        }`}
      >
        {isSolution && (
          <TallyMarksSVG count={count} colorMode={colorMode} isSolution={true} />
        )}
      </div>
    </div>
  )
}

// ── Parser & Komponenten für Sektion 3: Zählen & Häufigkeiten ──
export interface StrichlisteZaehlenDataParsed {
  shapes: PlacedShape[]
  summary: ShapeCountItem[]
}

export function parseStrichlisteZaehlenData(
  item: unknown
): StrichlisteZaehlenDataParsed | null {
  if (!item) return null

  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    if (Array.isArray(obj.shapes) && Array.isArray(obj.summary)) {
      return {
        shapes: obj.shapes as PlacedShape[],
        summary: obj.summary as ShapeCountItem[],
      }
    }
  }

  return null
}

export function StrichlisteZaehlenItem({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: StrichlisteZaehlenDataParsed
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const { shapes, summary } = data
  const isBw = colorMode === 'bw'

  return (
    <div className="space-y-3 my-2 w-full">
      {/* 1. Suchbild Box mit Formen */}
      <ShapeSearchBoxSVG shapes={shapes} colorMode={colorMode} />

      {/* 2. Auswertungs-Tabelle */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm sm:text-base">
          <thead>
            <tr className="border-b border-slate-300 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-1 px-3 text-left w-32">Form</th>
              <th className="py-1 px-3 text-left">Strichliste</th>
              <th className="py-1 px-3 text-center w-28">Anzahl</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {summary.map((row) => (
              <tr key={row.shape} className="h-10">
                <td className="py-1 px-3 flex items-center gap-2">
                  <ShapeIconSVG shape={row.shape} colorMode={colorMode} size={22} />
                  <span className="font-medium text-gray-800 text-sm">{row.label}</span>
                </td>
                <td className="py-1 px-3">
                  <div
                    className={`w-40 h-8 border-2 border-dashed rounded flex items-center px-2 bg-white select-none ${
                      isBw ? 'border-slate-600' : 'border-slate-400'
                    }`}
                  >
                    {isSolution && (
                      <TallyMarksSVG
                        count={row.count}
                        colorMode={colorMode}
                        isSolution={true}
                      />
                    )}
                  </div>
                </td>
                <td className="py-1 px-3 text-center">
                  {isSolution ? (
                    <span
                      className={`inline-flex w-10 h-7 border-2 rounded print:border-black items-center justify-center font-mono font-bold text-sm ${
                        isBw
                          ? 'border-black text-black bg-white'
                          : 'border-slate-600 text-blue-700 bg-blue-50/60'
                      }`}
                    >
                      {row.count}
                    </span>
                  ) : (
                    <span
                      className={`inline-flex w-10 h-7 border-2 border-dashed rounded print:border-black items-center justify-center font-mono text-sm bg-white ${
                        isBw ? 'border-slate-600' : 'border-slate-400'
                      }`}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════
// GEOMETRIE-KOMPONENTEN (KLASSE 1: EBENE FORMEN & MUSTER)
// ═════════════════════════════════════════════════════════════════

export function EbeneFormSVG({
  shape,
  colorMode = 'color',
  size = 24,
  rotation = 0,
}: {
  shape: EbeneFormType | string
  colorMode?: 'color' | 'bw'
  size?: number
  rotation?: number
}) {
  const isBw = colorMode === 'bw'
  const s = String(shape || '').toLowerCase().trim()

  let content: React.ReactNode = null

  if (s === 'circle' || s === 'kreis') {
    content = (
      <circle
        cx="12"
        cy="12"
        r="9"
        fill={isBw ? '#ffffff' : '#fecdd3'}
        stroke={isBw ? '#000000' : '#e11d48'}
        strokeWidth="1.8"
      />
    )
  } else if (s === 'triangle' || s === 'dreieck') {
    content = (
      <polygon
        points="12,3 22,21 2,21"
        fill={isBw ? '#e2e8f0' : '#bae6fd'}
        stroke={isBw ? '#000000' : '#0284c7'}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    )
  } else if (s === 'square' || s === 'quadrat') {
    content = (
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="1.5"
        fill={isBw ? '#ffffff' : '#dcfce7'}
        stroke={isBw ? '#000000' : '#16a34a'}
        strokeWidth="1.8"
      />
    )
  } else if (s === 'rectangle' || s === 'rechteck') {
    // Deutlich länglich: 20x12px
    content = (
      <rect
        x="2"
        y="6"
        width="20"
        height="12"
        rx="1.5"
        fill={isBw ? '#cbd5e1' : '#fef3c7'}
        stroke={isBw ? '#000000' : '#d97706'}
        strokeWidth="1.8"
      />
    )
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="inline-block select-none flex-shrink-0 overflow-visible"
    >
      {rotation !== 0 ? (
        <g transform={`rotate(${rotation} 12 12)`}>{content}</g>
      ) : (
        content
      )}
    </svg>
  )
}

export function GeoShapesSearchBoxSVG({
  shapes,
  colorMode = 'color',
}: {
  shapes: PlacedGeoShape[]
  colorMode?: 'color' | 'bw'
}) {
  return (
    <div className="w-full h-32 border-2 border-slate-300 rounded-xl bg-slate-50/40 relative overflow-hidden flex items-center justify-center p-2 print:border-gray-400 print:bg-white select-none">
      <svg
        viewBox="0 0 560 115"
        className="w-full h-full max-h-[120px] overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        {shapes.map((s) => {
          const cx = s.col * 70 + 35 + s.offsetX
          const cy = s.row * 38.3 + 19.1 + s.offsetY
          return (
            <g key={s.id} transform={`translate(${cx - 14}, ${cy - 14})`}>
              <EbeneFormSVG
                shape={s.shape}
                colorMode={colorMode}
                size={28}
                rotation={s.rotation}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function parseGeometrieFormenZaehlenData(
  item: unknown
): GeometrieFormenZaehlenData | null {
  if (!item) return null
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    if (Array.isArray(obj.shapes) && Array.isArray(obj.summary)) {
      return {
        shapes: obj.shapes as PlacedGeoShape[],
        summary: obj.summary as GeoCountSummaryItem[],
      }
    }
  }
  return null
}

export function GeometrieFormenZaehlenItem({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: GeometrieFormenZaehlenData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const { shapes, summary } = data
  const isBw = colorMode === 'bw'

  return (
    <div className="space-y-3 my-2 w-full">
      {/* 1. Kasten mit Formen */}
      <GeoShapesSearchBoxSVG shapes={shapes} colorMode={colorMode} />

      {/* 2. 4 Auswertungs-Felder in einer Reihe */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
        {summary.map((item) => (
          <div
            key={item.shape}
            className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-white shadow-xs print:border-gray-400"
          >
            <div className="flex items-center gap-1.5">
              <EbeneFormSVG shape={item.shape} colorMode={colorMode} size={22} />
              <span className="font-semibold text-xs text-gray-800">{item.label}</span>
            </div>
            <span className="font-bold text-gray-400 text-sm mx-1">=</span>
            {isSolution ? (
              <span
                className={`inline-flex w-9 h-7 border-2 rounded print:border-black items-center justify-center font-mono font-bold text-sm select-none ${
                  isBw
                    ? 'border-black text-black bg-white'
                    : 'border-slate-600 text-blue-700 bg-blue-50/60'
                }`}
              >
                {item.count}
              </span>
            ) : (
              <span
                className={`inline-flex w-9 h-7 border-2 border-dashed rounded print:border-black items-center justify-center font-mono text-sm bg-white select-none ${
                  isBw ? 'border-slate-600' : 'border-slate-400'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Muster fortsetzen ──────────────────────────────────────────
export function PatternShapeSVG({
  shape,
  colorMode = 'color',
  size = 24,
}: {
  shape: PatternShapeType
  colorMode?: 'color' | 'bw'
  size?: number
}) {
  const isBw = colorMode === 'bw'

  if (shape === 'circle') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block select-none flex-shrink-0">
        <circle
          cx="12"
          cy="12"
          r="8.5"
          fill={isBw ? '#ffffff' : '#fecdd3'}
          stroke={isBw ? '#000000' : '#e11d48'}
          strokeWidth="2"
        />
      </svg>
    )
  }
  if (shape === 'triangle') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block select-none flex-shrink-0">
        <polygon
          points="12,3 21,19 3,19"
          fill={isBw ? '#e2e8f0' : '#bae6fd'}
          stroke={isBw ? '#000000' : '#0284c7'}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (shape === 'square') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block select-none flex-shrink-0">
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="2"
          fill={isBw ? '#ffffff' : '#bbf7d0'}
          stroke={isBw ? '#000000' : '#16a34a'}
          strokeWidth="2"
        />
      </svg>
    )
  }
  if (shape === 'star') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block select-none flex-shrink-0">
        <polygon
          points="12,2 14.8,8.2 21.5,8.8 16.4,13.4 17.9,20 12,16.5 6.1,20 7.6,13.4 2.5,8.8 9.2,8.2"
          fill={isBw ? '#cbd5e1' : '#fef08a'}
          stroke={isBw ? '#000000' : '#ca8a04'}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  // diamond (Raute)
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block select-none flex-shrink-0">
      <polygon
        points="12,2 21,12 12,22 3,12"
        fill={isBw ? '#e2e8f0' : '#e9d5ff'}
        stroke={isBw ? '#000000' : '#9333ea'}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function parseGeometrieMusterData(
  item: unknown,
  index = 0
): GeometrieMusterItemData | null {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f']
  const defaultPrefix = `${letters[index] || index + 1})`

  if (!item) return null

  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    if (Array.isArray(obj.sequence) && Array.isArray(obj.solution)) {
      const prefix =
        typeof obj.prefix === 'string' && obj.prefix.trim()
          ? obj.prefix.trim()
          : defaultPrefix
      const patternType = (obj.patternType || 'ABAB') as 'ABAB' | 'AABB' | 'ABC' | 'ABB'
      return {
        prefix,
        patternType,
        sequence: obj.sequence as PatternShapeType[],
        solution: [obj.solution[0], obj.solution[1]] as [PatternShapeType, PatternShapeType],
      }
    }
  }

  return null
}

export function GeometrieMusterItem({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: GeometrieMusterItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const { prefix, sequence, solution } = data
  const isBw = colorMode === 'bw'
  const isRightCol = prefix?.trim().startsWith('b') || prefix?.trim().startsWith('d')

  return (
    <div
      className={`flex items-center gap-2 py-1.5 flex-wrap sm:flex-nowrap ${
        isRightCol ? 'ml-4' : ''
      }`}
    >
      {prefix && (
        <span className="font-semibold text-gray-500 text-sm min-w-[20px] font-mono select-none">
          {prefix}
        </span>
      )}
      <div className="flex items-center gap-2 bg-slate-50/80 border border-slate-200 rounded-lg px-2.5 py-1.5 select-none print:border-gray-400 print:bg-white">
        {sequence.map((shape, sIdx) => (
          <div key={sIdx} className="w-7 h-7 flex items-center justify-center">
            <PatternShapeSVG shape={shape} colorMode={colorMode} size={22} />
          </div>
        ))}
      </div>
      <span className="font-bold text-gray-400 text-base mx-1 select-none">→</span>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div
          className={`w-9 h-9 border-2 border-dashed rounded flex items-center justify-center bg-white select-none ${
            isBw ? 'border-slate-600' : 'border-slate-400'
          }`}
        >
          {isSolution && (
            <PatternShapeSVG shape={solution[0]} colorMode={colorMode} size={22} />
          )}
        </div>
        <div
          className={`w-9 h-9 border-2 border-dashed rounded flex items-center justify-center bg-white select-none ${
            isBw ? 'border-slate-600' : 'border-slate-400'
          }`}
        >
          {isSolution && (
            <PatternShapeSVG shape={solution[1]} colorMode={colorMode} size={22} />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Formen im Punktgitter (Geobrett) ───────────────────────────
export function GeobrettSVG({
  targetShape,
  solutionGridPoints = [],
  givenGridPoints = [],
  isSymmetry = false,
  cols = 5,
  rows = 5,
  isSolution = false,
  colorMode = 'color',
}: {
  targetShape: 'Quadrat' | 'Rechteck' | 'Dreieck' | 'Spiegelbild'
  solutionGridPoints?: Array<{ x: number; y: number }>
  givenGridPoints?: Array<{ x: number; y: number }>
  isSymmetry?: boolean
  cols?: number
  rows?: number
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const is6x5 = cols === 6 || isSymmetry
  const width = is6x5 ? 142 : 120
  const height = 120
  const rectWidth = is6x5 ? 134 : 112
  const rectHeight = 112

  const xCoords = is6x5
    ? [16, 38, 60, 82, 104, 126]
    : [16, 38, 60, 82, 104]
  const yCoords = [16, 38, 60, 82, 104]

  const polyPoints = solutionGridPoints
    .map((pt) => `${16 + pt.x * 22},${16 + pt.y * 22}`)
    .join(' ')

  const givenPoints = givenGridPoints
    .map((pt) => `${16 + pt.x * 22},${16 + pt.y * 22}`)
    .join(' ')

  // Spiegelachse genau zwischen Spalte 2 (x=60) und Spalte 3 (x=82) => x=71
  const mirrorAxisX = 71

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible select-none inline-block flex-shrink-0"
    >
      {/* Hintergrund-Fläche */}
      <rect
        x="4"
        y="4"
        width={rectWidth}
        height={rectHeight}
        rx="6"
        fill={isBw ? '#ffffff' : '#f8fafc'}
        stroke={isBw ? '#000000' : '#e2e8f0'}
        strokeWidth="1.5"
      />

      {/* Rote vertikale Spiegelachse bei Symmetrie */}
      {isSymmetry && (
        <line
          x1={mirrorAxisX}
          y1="4"
          x2={mirrorAxisX}
          y2={116}
          stroke={isBw ? '#000000' : '#ef4444'}
          strokeWidth="2.5"
          strokeDasharray="4 2"
        />
      )}

      {/* Vorgegebene linke Figur */}
      {isSymmetry && givenPoints && (
        <polyline
          points={givenPoints}
          fill="none"
          stroke={isBw ? '#000000' : '#2563eb'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Lösungs-Form */}
      {isSolution && polyPoints && (
        isSymmetry ? (
          <polyline
            points={polyPoints}
            fill="none"
            stroke={isBw ? '#000000' : '#10b981'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="3 3"
          />
        ) : (
          <polygon
            points={polyPoints}
            fill={isBw ? 'none' : '#2563eb18'}
            stroke={isBw ? '#000000' : '#2563eb'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={isBw ? '4 2' : undefined}
          />
        )
      )}

      {/* Raster aus Punkten */}
      {yCoords.map((cy, rowIdx) =>
        xCoords.map((cx, colIdx) => (
          <circle
            key={`${rowIdx}-${colIdx}`}
            cx={cx}
            cy={cy}
            r="2.5"
            fill={isBw ? '#000000' : '#475569'}
          />
        ))
      )}
    </svg>
  )
}

export function parseGeometriePunktgitterData(
  item: unknown,
  index = 0
): GeometriePunktgitterItemData | null {
  const letters = ['a', 'b', 'c', 'd']
  const defaultPrefix = `${letters[index] || index + 1})`

  if (!item) return null

  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    const prefix =
      typeof obj.prefix === 'string' && obj.prefix.trim()
        ? obj.prefix.trim()
        : defaultPrefix
    const targetShape = (obj.targetShape || 'Quadrat') as 'Quadrat' | 'Rechteck' | 'Dreieck' | 'Spiegelbild'
    const label = String(obj.label || `Zeichne ein ${targetShape}`)
    const solutionGridPoints = Array.isArray(obj.solutionGridPoints)
      ? (obj.solutionGridPoints as Array<{ x: number; y: number }>)
      : []
    const givenGridPoints = Array.isArray(obj.givenGridPoints)
      ? (obj.givenGridPoints as Array<{ x: number; y: number }>)
      : undefined
    const isSymmetry = Boolean(obj.isSymmetry)
    const cols = typeof obj.cols === 'number' ? obj.cols : 5
    const rows = typeof obj.rows === 'number' ? obj.rows : 5

    return {
      prefix,
      targetShape,
      label,
      solutionGridPoints,
      givenGridPoints,
      isSymmetry,
      cols,
      rows,
    }
  }

  return null
}

export function GeometriePunktgitterItem({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: GeometriePunktgitterItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const { prefix, targetShape, label, solutionGridPoints, givenGridPoints, isSymmetry, cols, rows } = data

  return (
    <div className="flex flex-col items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white/70 shadow-xs print:border-gray-400">
      <span className="font-semibold text-xs sm:text-sm text-gray-800 mb-2 font-mono text-center">
        {prefix} {label}
      </span>
      <GeobrettSVG
        targetShape={targetShape}
        solutionGridPoints={solutionGridPoints}
        givenGridPoints={givenGridPoints}
        isSymmetry={isSymmetry}
        cols={cols}
        rows={rows}
        isSolution={isSolution}
        colorMode={colorMode}
      />
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════
// GEOMETRIE-KOMPONENTEN (KLASSE 1: RAUMORIENTIERUNG & LAGEBEZIEHUNGEN)
// ═════════════════════════════════════════════════════════════════

export function RaumSymbolSVG({
  symbol,
  colorMode = 'color',
  size = 24,
}: {
  symbol: RaumSymbolType | string
  colorMode?: 'color' | 'bw'
  size?: number
}) {
  const isBw = colorMode === 'bw'
  const s = String(symbol || '').toLowerCase().trim()

  if (s === 'star' || s === 'stern') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="inline-block select-none flex-shrink-0"
      >
        <polygon
          points="12,2 14.8,8.2 21.5,8.8 16.4,13.4 17.9,20 12,16.5 6.1,20 7.6,13.4 2.5,8.8 9.2,8.2"
          fill={isBw ? '#ffffff' : '#fef08a'}
          stroke={isBw ? '#000000' : '#ca8a04'}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (s === 'heart' || s === 'herz') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="inline-block select-none flex-shrink-0"
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill={isBw ? '#ffffff' : '#fecdd3'}
          stroke={isBw ? '#000000' : '#e11d48'}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (s === 'triangle' || s === 'dreieck') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="inline-block select-none flex-shrink-0"
      >
        <polygon
          points="12,3 22,21 2,21"
          fill={isBw ? '#e2e8f0' : '#bae6fd'}
          stroke={isBw ? '#000000' : '#0284c7'}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (s === 'square' || s === 'quadrat') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="inline-block select-none flex-shrink-0"
      >
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="2"
          fill={isBw ? '#ffffff' : '#dcfce7'}
          stroke={isBw ? '#000000' : '#16a34a'}
          strokeWidth="1.8"
        />
      </svg>
    )
  }

  if (s === 'diamond' || s === 'raute') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="inline-block select-none flex-shrink-0"
      >
        <polygon
          points="12,2 21,12 12,22 3,12"
          fill={isBw ? '#ffffff' : '#f3e8ff'}
          stroke={isBw ? '#000000' : '#9333ea'}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  // circle / kreis (z.B. Referenzpunkt in Sektion 3)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="inline-block select-none flex-shrink-0"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill={isBw ? '#000000' : '#334155'}
        stroke={isBw ? '#000000' : '#0f172a'}
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function ArrowDirectionSVG({
  direction,
  colorMode = 'color',
  size = 24,
}: {
  direction: ArrowDirectionType | string
  colorMode?: 'color' | 'bw'
  size?: number
}) {
  const isBw = colorMode === 'bw'
  const d = String(direction || '').toLowerCase().trim()

  let strokeColor = '#0f172a'
  if (!isBw) {
    if (d === 'left' || d === 'links') strokeColor = '#0284c7' // Blue
    else if (d === 'right' || d === 'rechts') strokeColor = '#16a34a' // Green
    else if (d === 'up' || d === 'oben') strokeColor = '#d97706' // Amber
    else if (d === 'down' || d === 'unten') strokeColor = '#9333ea' // Purple
  }

  if (d === 'left' || d === 'links') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="inline-block select-none flex-shrink-0 overflow-visible"
      >
        <path
          d="M11 5l-7 7 7 7"
          fill="none"
          stroke={strokeColor}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="5"
          y1="12"
          x2="20"
          y2="12"
          stroke={strokeColor}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (d === 'right' || d === 'rechts') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="inline-block select-none flex-shrink-0 overflow-visible"
      >
        <path
          d="M13 5l7 7-7 7"
          fill="none"
          stroke={strokeColor}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="4"
          y1="12"
          x2="19"
          y2="12"
          stroke={strokeColor}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (d === 'up' || d === 'oben') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="inline-block select-none flex-shrink-0 overflow-visible"
      >
        <path
          d="M5 11l7-7 7 7"
          fill="none"
          stroke={strokeColor}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="12"
          y1="5"
          x2="12"
          y2="20"
          stroke={strokeColor}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  // down / unten
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="inline-block select-none flex-shrink-0 overflow-visible"
    >
      <path
        d="M5 13l7 7 7-7"
        fill="none"
        stroke={strokeColor}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="12"
        y1="4"
        x2="12"
        y2="19"
        stroke={strokeColor}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function OrientierungGitter3x3SVG({
  gridSymbols,
  colorMode = 'color',
  size = 180,
}: {
  gridSymbols: PlacedGridSymbol[]
  colorMode?: 'color' | 'bw'
  size?: number
}) {
  const isBw = colorMode === 'bw'
  const strokeColor = isBw ? '#000000' : '#334155'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 180 180"
      className="overflow-visible select-none inline-block flex-shrink-0"
    >
      {/* 9 Zellen-Hintergründe */}
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => {
          const isCenter = r === 1 && c === 1
          return (
            <rect
              key={`${r}-${c}`}
              x={c * 60}
              y={r * 60}
              width="60"
              height="60"
              fill={isCenter ? (isBw ? '#f8fafc' : '#fef9c3') : '#ffffff'}
            />
          )
        })
      )}

      {/* Kräftige Gitterlinien */}
      <line x1="60" y1="0" x2="60" y2="180" stroke={strokeColor} strokeWidth="2.5" />
      <line x1="120" y1="0" x2="120" y2="180" stroke={strokeColor} strokeWidth="2.5" />
      <line x1="0" y1="60" x2="180" y2="60" stroke={strokeColor} strokeWidth="2.5" />
      <line x1="0" y1="120" x2="180" y2="120" stroke={strokeColor} strokeWidth="2.5" />

      {/* Äußerer Rahmen */}
      <rect
        x="1.5"
        y="1.5"
        width="177"
        height="177"
        rx="8"
        fill="none"
        stroke={strokeColor}
        strokeWidth="3"
      />

      {/* Symbole in den Feldern */}
      {gridSymbols.map((item) => {
        const cx = item.col * 60 + 30
        const cy = item.row * 60 + 30
        const isCenter = item.row === 1 && item.col === 1
        const symSize = isCenter ? 36 : 32
        return (
          <g key={`${item.row}-${item.col}`} transform={`translate(${cx - symSize / 2}, ${cy - symSize / 2})`}>
            <RaumSymbolSVG symbol={item.symbol} colorMode={colorMode} size={symSize} />
          </g>
        )
      })}
    </svg>
  )
}

export function parseRaumGitterOrientierungData(item: unknown): RaumGitterOrientierungData | null {
  if (!item) return null
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    if (Array.isArray(obj.gridSymbols) && Array.isArray(obj.questions)) {
      return {
        centerSymbol: (obj.centerSymbol || 'star') as RaumSymbolType,
        gridSymbols: obj.gridSymbols as PlacedGridSymbol[],
        questions: obj.questions as RaumGitterQuestion[],
      }
    }
  }
  return null
}

export function RaumGitterOrientierungItem({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: RaumGitterOrientierungData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const { gridSymbols, questions } = data
  const isBw = colorMode === 'bw'

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 my-2 py-1 w-full justify-between">
      {/* 3x3 Gitter */}
      <div className="flex-shrink-0 flex items-center justify-center p-1">
        <OrientierungGitter3x3SVG gridSymbols={gridSymbols} colorMode={colorMode} size={180} />
      </div>

      {/* 4 kindgerechte Lückenaufgaben */}
      <div className="flex-1 w-full max-w-lg space-y-2.5">
        {questions.map((q, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 text-sm sm:text-base font-medium text-slate-800 flex-wrap sm:flex-nowrap bg-white/70 p-2 rounded-lg border border-slate-200 shadow-xs print:border-gray-400"
          >
            <span className="font-semibold text-gray-500 min-w-[20px] font-mono select-none">
              {q.prefix}
            </span>
            <span className="select-none">{q.article}</span>
            <RaumSymbolSVG symbol={q.symbol} colorMode={colorMode} size={22} />
            <span className="select-none">ist</span>
            {isSolution ? (
              <span
                className={`inline-flex w-24 h-8 border-2 rounded items-center justify-center font-bold text-sm select-none ${
                  isBw
                    ? 'border-black text-black bg-white'
                    : 'border-slate-600 text-blue-700 bg-blue-50/70'
                }`}
              >
                {q.solutionDirection}
              </span>
            ) : (
              <span
                className={`inline-flex w-24 h-8 border-2 border-dashed rounded items-center justify-center font-mono text-sm bg-white select-none ${
                  isBw ? 'border-slate-600' : 'border-slate-400'
                }`}
              />
            )}
            <span className="select-none">vom</span>
            <RaumSymbolSVG symbol={q.refSymbol} colorMode={colorMode} size={22} />
            <span>.</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ArrowSearchBoxSVG({
  arrows,
  colorMode = 'color',
}: {
  arrows: PlacedArrow[]
  colorMode?: 'color' | 'bw'
}) {
  return (
    <div className="w-full h-24 border-2 border-slate-300 rounded-xl bg-slate-50/40 relative overflow-hidden flex items-center justify-center p-2 print:border-gray-400 print:bg-white select-none">
      <svg
        viewBox="0 0 560 84"
        className="w-full h-full max-h-[80px] overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        {arrows.map((a) => {
          const cx = a.col * 70 + 35 + a.offsetX
          const cy = a.row * 42 + 21 + a.offsetY
          return (
            <g key={a.id} transform={`translate(${cx - 14}, ${cy - 14})`}>
              <ArrowDirectionSVG direction={a.direction} colorMode={colorMode} size={28} />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function parseRaumPfeileZaehlenData(item: unknown): RaumPfeileZaehlenData | null {
  if (!item) return null
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    if (Array.isArray(obj.arrows) && Array.isArray(obj.summary)) {
      return {
        arrows: obj.arrows as PlacedArrow[],
        summary: obj.summary as ArrowSummaryItem[],
      }
    }
  }
  return null
}

export function RaumPfeileZaehlenItem({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: RaumPfeileZaehlenData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const { arrows, summary } = data
  const isBw = colorMode === 'bw'

  return (
    <div className="space-y-3 my-2 w-full">
      {/* Pfeile-Box */}
      <ArrowSearchBoxSVG arrows={arrows} colorMode={colorMode} />

      {/* 4 Zähl-Felder */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
        {summary.map((item) => (
          <div
            key={item.direction}
            className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-white shadow-xs print:border-gray-400"
          >
            <div className="flex items-center gap-1.5">
              <ArrowDirectionSVG direction={item.direction} colorMode={colorMode} size={22} />
              <span className="font-semibold text-xs text-gray-800">{item.label}:</span>
            </div>
            {isSolution ? (
              <span
                className={`inline-flex w-9 h-7 border-2 rounded print:border-black items-center justify-center font-mono font-bold text-sm select-none ${
                  isBw
                    ? 'border-black text-black bg-white'
                    : 'border-slate-600 text-blue-700 bg-blue-50/60'
                }`}
              >
                {item.count}
              </span>
            ) : (
              <span
                className={`inline-flex w-9 h-7 border-2 border-dashed rounded print:border-black items-center justify-center font-mono text-sm bg-white select-none ${
                  isBw ? 'border-slate-600' : 'border-slate-400'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ZeichneGitter3x3SVG({
  tasks,
  isSolution = false,
  colorMode = 'color',
  size = 150,
}: {
  tasks: RaumZeichnenPrompt[]
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
  size?: number
}) {
  const isBw = colorMode === 'bw'
  const strokeColor = isBw ? '#000000' : '#334155'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 150 150"
      className="overflow-visible select-none inline-block flex-shrink-0"
    >
      {/* 9 weiße Zellen */}
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <rect
            key={`${r}-${c}`}
            x={c * 50}
            y={r * 50}
            width="50"
            height="50"
            fill={r === 1 && c === 1 ? (isBw ? '#f8fafc' : '#f1f5f9') : '#ffffff'}
          />
        ))
      )}

      {/* Kräftige Gitterlinien */}
      <line x1="50" y1="0" x2="50" y2="150" stroke={strokeColor} strokeWidth="2" />
      <line x1="100" y1="0" x2="100" y2="150" stroke={strokeColor} strokeWidth="2" />
      <line x1="0" y1="50" x2="150" y2="50" stroke={strokeColor} strokeWidth="2" />
      <line x1="0" y1="100" x2="150" y2="100" stroke={strokeColor} strokeWidth="2" />

      {/* Äußerer Rahmen */}
      <rect
        x="1.5"
        y="1.5"
        width="147"
        height="147"
        rx="8"
        fill="none"
        stroke={strokeColor}
        strokeWidth="2.5"
      />

      {/* Kreis in der Mitte [1,1] */}
      <circle
        cx="75"
        cy="75"
        r="14"
        fill={isBw ? '#000000' : '#334155'}
      />

      {/* Im Lösungsmodus: Die 4 Formen in den Ziel-Zellen einzeichnen */}
      {isSolution &&
        tasks.map((t, idx) => {
          const cx = t.targetCell.col * 50 + 25
          const cy = t.targetCell.row * 50 + 25
          return (
            <g key={idx} transform={`translate(${cx - 14}, ${cy - 14})`}>
              <RaumSymbolSVG symbol={t.symbol} colorMode={colorMode} size={28} />
            </g>
          )
        })}
    </svg>
  )
}

export function parseRaumGitterZeichnenData(item: unknown): RaumGitterZeichnenData | null {
  if (!item) return null
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    if (Array.isArray(obj.tasks)) {
      return {
        centerShape: 'circle',
        tasks: obj.tasks as RaumZeichnenPrompt[],
      }
    }
  }
  return null
}

export function RaumGitterZeichnenItem({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: RaumGitterZeichnenData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const { tasks } = data

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 my-2 py-1 w-full justify-between">
      {/* 3x3 Gitter zum Zeichnen */}
      <div className="flex-shrink-0 flex items-center justify-center p-1">
        <ZeichneGitter3x3SVG tasks={tasks} isSolution={isSolution} colorMode={colorMode} size={150} />
      </div>

      {/* 4 klare Zeichen-Aufträge */}
      <div className="flex-1 w-full max-w-lg space-y-2">
        {tasks.map((t, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 text-sm sm:text-base font-medium text-slate-800 bg-white/70 p-2 rounded-lg border border-slate-200 shadow-xs print:border-gray-400"
          >
            <span className="font-semibold text-gray-500 min-w-[20px] font-mono select-none">
              {t.prefix}
            </span>
            <span className="select-none">Zeichne {t.article}</span>
            <RaumSymbolSVG symbol={t.symbol} colorMode={colorMode} size={22} />
            <span className="select-none">nach</span>
            <span className="font-bold text-slate-900 font-mono underline decoration-slate-400 underline-offset-2">
              {t.direction}
            </span>
            <span className="text-xs text-gray-500 select-none">{t.hint}.</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════
// RECHENGESCHICHTEN-KOMPONENTEN (KLASSE 1: TEXT-/SACHAUFGABEN)
// ═════════════════════════════════════════════════════════════════

export function SachaufgabeIconSVG({
  icon,
  colorMode = 'color',
  size = 24,
}: {
  icon: SachaufgabeIconType | string
  colorMode?: 'color' | 'bw'
  size?: number
}) {
  const isBw = colorMode === 'bw'
  const ic = String(icon || '').toLowerCase().trim()

  if (ic === 'apple') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block select-none flex-shrink-0">
        <path
          d="M12 21c-4.2 0-7-3.2-7-7.2 0-3.3 2.1-5.3 4.2-5.3 1.5 0 2.3.8 2.8.8s1.3-.8 2.8-.8c2.1 0 4.2 2 4.2 5.3 0 4-2.8 7.2-7 7.2z"
          fill={isBw ? '#ffffff' : '#f87171'}
          stroke={isBw ? '#000000' : '#dc2626'}
          strokeWidth="1.5"
        />
        <path d="M12 8.5V4.5c1.2 0 2-.6 2-1" stroke={isBw ? '#000000' : '#78350f'} strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <path d="M12 6.5c1.8-1.2 3.8-.3 3.8-.3s-.8 1.8-2 1.8c-1.2 0-1.8-1.5-1.8-1.5z" fill={isBw ? '#94a3b8' : '#22c55e'} stroke={isBw ? '#000000' : '#15803d'} strokeWidth="1" />
      </svg>
    )
  }

  if (ic === 'balloon') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block select-none flex-shrink-0">
        <ellipse cx="12" cy="10" rx="7" ry="8" fill={isBw ? '#ffffff' : '#60a5fa'} stroke={isBw ? '#000000' : '#2563eb'} strokeWidth="1.6" />
        <polygon points="11,18 13,18 12,20" fill={isBw ? '#000000' : '#2563eb'} />
        <path d="M12 20c-1.5 1-1.5 2.5 0 3.5" stroke={isBw ? '#000000' : '#64748b'} strokeWidth="1.3" fill="none" />
      </svg>
    )
  }

  if (ic === 'car') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block select-none flex-shrink-0">
        <path d="M3 14h18l-2-5H7l-2 3H3v2z" fill={isBw ? '#ffffff' : '#fbbf24'} stroke={isBw ? '#000000' : '#d97706'} strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="7" cy="15.5" r="2.5" fill={isBw ? '#ffffff' : '#334155'} stroke={isBw ? '#000000' : '#0f172a'} strokeWidth="1.5" />
        <circle cx="17" cy="15.5" r="2.5" fill={isBw ? '#ffffff' : '#334155'} stroke={isBw ? '#000000' : '#0f172a'} strokeWidth="1.5" />
      </svg>
    )
  }

  if (ic === 'pencil') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block select-none flex-shrink-0">
        <path
          d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7.5 18.5 3 20l1.5-4.5L16.5 3.5z"
          fill={isBw ? '#ffffff' : '#fde047'}
          stroke={isBw ? '#000000' : '#ca8a04'}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <line x1="14" y1="6" x2="18" y2="10" stroke={isBw ? '#000000' : '#ca8a04'} strokeWidth="1.5" />
      </svg>
    )
  }

  if (ic === 'bird') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block select-none flex-shrink-0">
        <path
          d="M16 6c-2.5 0-4 1.5-5 2.5C9 7.5 6 8.5 5 11.5c-1 3 .5 6.5 3.5 7.5 4 1.2 8-.8 9.5-4.5l3 1-1-3 2.5-1-3-1c-.2-2.5-2-4.5-4.5-4.5z"
          fill={isBw ? '#ffffff' : '#67e8f9'}
          stroke={isBw ? '#000000' : '#0891b2'}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="15.5" cy="9.5" r="1.2" fill={isBw ? '#000000' : '#0e7490'} />
      </svg>
    )
  }

  if (ic === 'football') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block select-none flex-shrink-0">
        <circle cx="12" cy="12" r="9" fill="#ffffff" stroke={isBw ? '#000000' : '#1e293b'} strokeWidth="1.6" />
        <polygon points="12,8 15,10 14,14 10,14 9,10" fill={isBw ? '#000000' : '#1e293b'} />
        <line x1="12" y1="8" x2="12" y2="3.2" stroke={isBw ? '#000000' : '#1e293b'} strokeWidth="1.2" />
        <line x1="15" y1="10" x2="19.5" y2="8" stroke={isBw ? '#000000' : '#1e293b'} strokeWidth="1.2" />
        <line x1="14" y1="14" x2="17.5" y2="18" stroke={isBw ? '#000000' : '#1e293b'} strokeWidth="1.2" />
        <line x1="10" y1="14" x2="6.5" y2="18" stroke={isBw ? '#000000' : '#1e293b'} strokeWidth="1.2" />
        <line x1="9" y1="10" x2="4.5" y2="8" stroke={isBw ? '#000000' : '#1e293b'} strokeWidth="1.2" />
      </svg>
    )
  }

  if (ic === 'candy') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block select-none flex-shrink-0">
        <polygon points="7,12 2.5,7.5 2.5,16.5" fill={isBw ? '#ffffff' : '#f472b6'} stroke={isBw ? '#000000' : '#db2777'} strokeWidth="1.5" strokeLinejoin="round" />
        <polygon points="17,12 21.5,7.5 21.5,16.5" fill={isBw ? '#ffffff' : '#f472b6'} stroke={isBw ? '#000000' : '#db2777'} strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="5.5" fill={isBw ? '#ffffff' : '#ec4899'} stroke={isBw ? '#000000' : '#be185d'} strokeWidth="1.6" />
      </svg>
    )
  }

  if (ic === 'flower') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block select-none flex-shrink-0">
        <circle cx="12" cy="6" r="3.2" fill={isBw ? '#ffffff' : '#fda4af'} stroke={isBw ? '#000000' : '#e11d48'} strokeWidth="1.2" />
        <circle cx="17.5" cy="10" r="3.2" fill={isBw ? '#ffffff' : '#fda4af'} stroke={isBw ? '#000000' : '#e11d48'} strokeWidth="1.2" />
        <circle cx="15.5" cy="16.5" r="3.2" fill={isBw ? '#ffffff' : '#fda4af'} stroke={isBw ? '#000000' : '#e11d48'} strokeWidth="1.2" />
        <circle cx="8.5" cy="16.5" r="3.2" fill={isBw ? '#ffffff' : '#fda4af'} stroke={isBw ? '#000000' : '#e11d48'} strokeWidth="1.2" />
        <circle cx="6.5" cy="10" r="3.2" fill={isBw ? '#ffffff' : '#fda4af'} stroke={isBw ? '#000000' : '#e11d48'} strokeWidth="1.2" />
        <circle cx="12" cy="12" r="3.2" fill={isBw ? '#000000' : '#facc15'} stroke={isBw ? '#000000' : '#ca8a04'} strokeWidth="1.4" />
      </svg>
    )
  }

  if (ic === 'book') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block select-none flex-shrink-0">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke={isBw ? '#000000' : '#4338ca'} strokeWidth="1.6" fill="none" />
        <path d="M6.5 2H20v19H6.5A2.5 2.5 0 0 1 4 18.5v-14A2.5 2.5 0 0 1 6.5 2z" fill={isBw ? '#ffffff' : '#c7d2fe'} stroke={isBw ? '#000000' : '#4338ca'} strokeWidth="1.6" />
        <line x1="8" y1="7" x2="16" y2="7" stroke={isBw ? '#000000' : '#4338ca'} strokeWidth="1.4" strokeLinecap="round" />
        <line x1="8" y1="11" x2="14" y2="11" stroke={isBw ? '#000000' : '#4338ca'} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    )
  }

  if (ic === 'star') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block select-none flex-shrink-0">
        <polygon
          points="12,2 15,8.5 22,9.3 17,14.2 18.2,21.2 12,17.8 5.8,21.2 7,14.2 2,9.3 9,8.5"
          fill={isBw ? '#ffffff' : '#fde047'}
          stroke={isBw ? '#000000' : '#ca8a04'}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (ic === 'fish') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block select-none flex-shrink-0">
        <path
          d="M2 12 C6 7, 14 7, 20 12 C14 17, 6 17, 2 12 Z M20 12 L22 8 L22 16 Z"
          fill={isBw ? '#ffffff' : '#7dd3fc'}
          stroke={isBw ? '#000000' : '#0284c7'}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="11" r="1.2" fill={isBw ? '#000000' : '#0369a1'} />
      </svg>
    )
  }

  // marble
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block select-none flex-shrink-0">
      <circle cx="12" cy="12" r="8.5" fill={isBw ? '#ffffff' : '#c084fc'} stroke={isBw ? '#000000' : '#7e22ce'} strokeWidth="1.6" />
      <ellipse cx="9" cy="9" rx="3" ry="1.5" transform="rotate(-30 9 9)" fill="#ffffff" opacity={isBw ? 0.4 : 0.8} />
    </svg>
  )
}

export function parseRechengeschichteItemData(
  item: unknown,
  index = 0
): RechengeschichteItemData | null {
  const letters = ['a', 'b', 'c', 'd']
  const defaultPrefix = `${letters[index] || index + 1})`

  if (!item) return null
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    if (typeof obj.num1 === 'number' && typeof obj.num2 === 'number' && typeof obj.result === 'number') {
      return {
        prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
        storySentence1: String(obj.storySentence1 || ''),
        storySentence2: String(obj.storySentence2 || ''),
        questionText: String(obj.questionText || ''),
        icon: (obj.icon || 'apple') as SachaufgabeIconType,
        num1: obj.num1,
        op: (obj.op === '-' ? '-' : '+') as '+' | '-',
        num2: obj.num2,
        result: obj.result,
        answerPrefix: String(obj.answerPrefix || 'Es sind jetzt'),
        answerSuffix: String(obj.answerSuffix || 'Äpfel.'),
        nounPlural: String(obj.nounPlural || 'Äpfel'),
      }
    }
  }
  return null
}

function renderStorySentenceWithInlineIcons(
  sentence: string,
  icon: SachaufgabeIconType,
  colorMode: 'color' | 'bw'
) {
  const parts = sentence.split(/(\d+)/g)
  return (
    <>
      {parts.map((part, pIdx) => {
        if (/^\d+$/.test(part)) {
          return (
            <span key={pIdx} className="font-bold text-slate-900 inline-flex items-center gap-0.5 mx-0.5">
              <span>{part}</span>
              <SachaufgabeIconSVG icon={icon} colorMode={colorMode} size={15} />
            </span>
          )
        }
        return <span key={pIdx}>{part}</span>
      })}
    </>
  )
}

export function RechengeschichteCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: RechengeschichteItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const {
    prefix,
    storySentence1,
    storySentence2,
    questionText,
    icon,
    num1,
    op,
    num2,
    result,
    answerPrefix,
    answerSuffix,
  } = data

  return (
    <div className="border border-slate-200 rounded-xl p-3.5 bg-white shadow-2xs print:border-gray-400 print:shadow-none flex flex-col justify-between space-y-2.5">
      {/* 1. Kurze Rechengeschichte mit fettgedruckten Zahlen & Mini-SVG */}
      <div className="flex items-start gap-2">
        <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px] pt-0.5">
          {prefix}
        </span>
        <div className="flex-1 text-xs sm:text-sm text-slate-800 leading-snug">
          <span>{renderStorySentenceWithInlineIcons(storySentence1, icon, colorMode)} </span>
          <span>{renderStorySentenceWithInlineIcons(storySentence2, icon, colorMode)} </span>
          <span className="font-semibold text-slate-900 block mt-0.5">{questionText}</span>
        </div>
        <div className="flex-shrink-0 p-1 bg-slate-50/80 rounded-lg border border-slate-200 print:bg-white print:border-gray-300">
          <SachaufgabeIconSVG icon={icon} colorMode={colorMode} size={22} />
        </div>
      </div>

      {/* 2. Strukturierte Rechnungs-Kästchen */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100 print:border-gray-300">
        <span className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[62px] select-none font-mono">
          Rechnung:
        </span>
        <div className="flex items-center gap-1.5 font-mono select-none">
          {/* Zahl 1 */}
          <div
            className={`min-w-[2rem] px-1.5 h-7 sm:min-w-[2.5rem] sm:h-8 border-2 rounded-lg flex items-center justify-center font-bold text-sm ${
              isSolution
                ? isBw
                  ? 'border-black text-black bg-white'
                  : 'border-slate-600 text-blue-700 bg-blue-50/60'
                : isBw
                  ? 'border-slate-600 border-dashed bg-white'
                  : 'border-slate-400 border-dashed bg-white'
            }`}
          >
            {isSolution ? num1 : ''}
          </div>
          {/* Operator (+ / -) */}
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 border-2 rounded-lg flex items-center justify-center font-bold text-sm ${
              isSolution
                ? isBw
                  ? 'border-black text-black bg-white'
                  : 'border-slate-600 text-blue-700 bg-blue-50/60'
                : isBw
                  ? 'border-slate-600 border-dashed bg-white'
                  : 'border-slate-400 border-dashed bg-white'
            }`}
          >
            {isSolution ? op : ''}
          </div>
          {/* Zahl 2 */}
          <div
            className={`min-w-[2rem] px-1.5 h-7 sm:min-w-[2.5rem] sm:h-8 border-2 rounded-lg flex items-center justify-center font-bold text-sm ${
              isSolution
                ? isBw
                  ? 'border-black text-black bg-white'
                  : 'border-slate-600 text-blue-700 bg-blue-50/60'
                : isBw
                  ? 'border-slate-600 border-dashed bg-white'
                  : 'border-slate-400 border-dashed bg-white'
            }`}
          >
            {isSolution ? num2 : ''}
          </div>
          <span className="font-bold text-gray-400 text-base mx-0.5 select-none">=</span>
          {/* Ergebnis */}
          <div
            className={`min-w-[2rem] px-1.5 h-7 sm:min-w-[2.5rem] sm:h-8 border-2 rounded-lg flex items-center justify-center font-bold text-sm ${
              isSolution
                ? isBw
                  ? 'border-black text-black bg-white'
                  : 'border-slate-600 text-blue-700 bg-blue-50/60'
                : isBw
                  ? 'border-slate-600 border-dashed bg-white'
                  : 'border-slate-400 border-dashed bg-white'
            }`}
          >
            {isSolution ? result : ''}
          </div>
        </div>
      </div>

      {/* 3. Vorgefertigter Lücken-Antwortsatz */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 print:border-gray-300 flex-wrap text-xs sm:text-sm">
        <span className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[62px] select-none font-mono">
          Antwort:
        </span>
        <span className="text-slate-800 select-none">{answerPrefix}</span>
        <div
          className={`w-9 h-7 border-2 rounded-lg inline-flex items-center justify-center font-mono font-bold text-sm select-none ${
            isSolution
              ? isBw
                ? 'border-black text-black bg-white'
                : 'border-slate-600 text-blue-700 bg-blue-50/60'
              : isBw
                ? 'border-slate-600 border-dashed bg-white'
                : 'border-slate-400 border-dashed bg-white'
          }`}
        >
          {isSolution ? result : ''}
        </div>
        <span className="text-slate-800 select-none">{answerSuffix}</span>
      </div>
    </div>
  )
}

// ── Zehnerfeld / Zwanzigerfeld (TwentyFrameSVG) ─────────────────
export function TwentyFrameSVG({
  isTenFrame = false,
  num1 = 0,
  num2 = 0,
  colorMode = 'color',
}: {
  isTenFrame?: boolean
  num1?: number
  num2?: number
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const total = isTenFrame ? 10 : 20
  const height = isTenFrame ? 28 : 52
  const rectHeight = isTenFrame ? 24 : 48

  return (
    <svg
      viewBox={`0 0 196 ${height}`}
      className="w-full max-w-[210px] h-auto select-none flex-shrink-0"
    >
      {/* Outer frame */}
      <rect
        x="2"
        y="2"
        width="192"
        height={rectHeight}
        rx="5"
        fill="#ffffff"
        stroke="#334155"
        strokeWidth="1.5"
      />

      {/* Vertical 5er separator line ("Kraft der 5") */}
      <line
        x1="99"
        y1="2"
        x2="99"
        y2={rectHeight + 2}
        stroke={isBw ? '#475569' : '#64748b'}
        strokeWidth="1.5"
        strokeDasharray="2 2"
      />

      {/* Horizontal separator between row 1 and row 2 (only for 20er-Feld) */}
      {!isTenFrame && (
        <line
          x1="2"
          y1="26"
          x2="194"
          y2="26"
          stroke="#94a3b8"
          strokeWidth="1.5"
        />
      )}

      {/* Circles (Wendeplättchen) */}
      {Array.from({ length: total }).map((_, idx) => {
        const row = Math.floor(idx / 10)
        const col = idx % 10
        const cx = col < 5 ? 14 + col * 18 : 112 + (col - 5) * 18
        const cy = row === 0 ? 14 : 38

        const isRed = idx < num1
        const isBlue = !isRed && idx < num1 + num2

        let fill = '#ffffff'
        let stroke = '#94a3b8'
        let strokeWidth = '1.2'
        let strokeDasharray = '2 2'

        if (isRed) {
          fill = isBw ? '#334155' : '#ef4444'
          stroke = isBw ? '#000000' : '#b91c1c'
          strokeWidth = '1.5'
          strokeDasharray = 'none'
        } else if (isBlue) {
          fill = isBw ? '#cbd5e1' : '#3b82f6'
          stroke = isBw ? '#334155' : '#1d4ed8'
          strokeWidth = '1.5'
          strokeDasharray = 'none'
        }

        return (
          <circle
            key={idx}
            cx={cx}
            cy={cy}
            r="7"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray === 'none' ? undefined : strokeDasharray}
          />
        )
      })}
    </svg>
  )
}

export function parseZwanzigerfeldItemData(
  item: unknown,
  index = 0
): ZwanzigerfeldItemData | null {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f']
  const defaultPrefix = `${letters[index] || index + 1})`

  if (!item) return null
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    if (typeof obj.num1 === 'number' && typeof obj.num2 === 'number' && typeof obj.result === 'number') {
      return {
        prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
        isTenFrame: Boolean(obj.isTenFrame),
        num1: obj.num1,
        num2: obj.num2,
        result: obj.result,
        isVerliebteZahlen: Boolean(obj.isVerliebteZahlen),
      }
    }
  }
  return null
}

export function ZwanzigerfeldCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: ZwanzigerfeldItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, isTenFrame, num1, num2, result, isVerliebteZahlen } = data

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 print:shadow-none flex flex-col justify-between space-y-2.5">
      {/* 1. Kopfzeile mit Prefix und Punktefeld */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">
          {prefix}
        </span>
        <div className="flex-1 flex justify-center py-0.5">
          <TwentyFrameSVG
            isTenFrame={isTenFrame}
            num1={num1}
            num2={isVerliebteZahlen ? 0 : num2}
            colorMode={colorMode}
          />
        </div>
      </div>

      {/* 2. Rechnungs-Kästchen */}
      <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-slate-100 print:border-gray-300 font-mono text-sm select-none">
        {isVerliebteZahlen ? (
          <>
            <span className="font-bold text-base px-1 text-slate-800">{num1}</span>
            <span className="font-bold text-gray-400 text-base">+</span>
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 border-2 rounded-lg flex items-center justify-center font-bold text-sm ${
                isSolution
                  ? isBw
                    ? 'border-black text-black bg-white'
                    : 'border-slate-600 text-blue-700 bg-blue-50/60'
                  : isBw
                    ? 'border-slate-600 border-dashed bg-white'
                    : 'border-slate-400 border-dashed bg-white'
              }`}
            >
              {isSolution ? num2 : ''}
            </div>
            <span className="font-bold text-gray-400 text-base">=</span>
            <span className="font-bold text-base px-1 text-slate-800">10</span>
          </>
        ) : (
          <>
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 border-2 rounded-lg flex items-center justify-center font-bold text-sm ${
                isSolution
                  ? isBw
                    ? 'border-black text-black bg-white'
                    : 'border-slate-600 text-blue-700 bg-blue-50/60'
                  : isBw
                    ? 'border-slate-600 border-dashed bg-white'
                    : 'border-slate-400 border-dashed bg-white'
              }`}
            >
              {isSolution ? num1 : ''}
            </div>
            <span className="font-bold text-gray-400 text-base">+</span>
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 border-2 rounded-lg flex items-center justify-center font-bold text-sm ${
                isSolution
                  ? isBw
                    ? 'border-black text-black bg-white'
                    : 'border-slate-600 text-blue-700 bg-blue-50/60'
                  : isBw
                    ? 'border-slate-600 border-dashed bg-white'
                    : 'border-slate-400 border-dashed bg-white'
              }`}
            >
              {isSolution ? num2 : ''}
            </div>
            <span className="font-bold text-gray-400 text-base">=</span>
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 border-2 rounded-lg flex items-center justify-center font-bold text-sm ${
                isSolution
                  ? isBw
                    ? 'border-black text-black bg-white'
                    : 'border-slate-600 text-blue-700 bg-blue-50/60'
                  : isBw
                    ? 'border-slate-600 border-dashed bg-white'
                    : 'border-slate-400 border-dashed bg-white'
              }`}
            >
              {isSolution ? result : ''}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Schüttelboxen (ShakeBoxSVG & SchuettelboxCard) ─────────────
export function ShakeBoxSVG({
  total,
  leftCount,
  rightCount,
  isSolution = false,
  colorMode = 'color',
}: {
  total: number
  leftCount: number
  rightCount: number
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'

  const getDotPositions = (count: number, offsetX = 0) => {
    const cx = 35 + offsetX
    const cy = 30
    if (count === 1) return [{ x: cx, y: cy }]
    if (count === 2) return [{ x: cx - 14, y: cy - 12 }, { x: cx + 14, y: cy + 12 }]
    if (count === 3) return [{ x: cx - 14, y: cy - 14 }, { x: cx, y: cy }, { x: cx + 14, y: cy + 14 }]
    if (count === 4) return [
      { x: cx - 14, y: cy - 12 }, { x: cx + 14, y: cy - 12 },
      { x: cx - 14, y: cy + 12 }, { x: cx + 14, y: cy + 12 },
    ]
    if (count === 5) return [
      { x: cx - 15, y: cy - 14 }, { x: cx + 15, y: cy - 14 },
      { x: cx, y: cy },
      { x: cx - 15, y: cy + 14 }, { x: cx + 15, y: cy + 14 },
    ]
    if (count === 6) return [
      { x: cx - 14, y: cy - 16 }, { x: cx + 14, y: cy - 16 },
      { x: cx - 14, y: cy }, { x: cx + 14, y: cy },
      { x: cx - 14, y: cy + 16 }, { x: cx + 14, y: cy + 16 },
    ]
    if (count === 7) return [
      { x: cx - 15, y: cy - 16 }, { x: cx + 15, y: cy - 16 },
      { x: cx - 15, y: cy }, { x: cx, y: cy }, { x: cx + 15, y: cy },
      { x: cx - 15, y: cy + 16 }, { x: cx + 15, y: cy + 16 },
    ]
    if (count === 8) return [
      { x: cx - 16, y: cy - 16 }, { x: cx, y: cy - 16 }, { x: cx + 16, y: cy - 16 },
      { x: cx - 16, y: cy }, { x: cx + 16, y: cy },
      { x: cx - 16, y: cy + 16 }, { x: cx, y: cy + 16 }, { x: cx + 16, y: cy + 16 },
    ]
    return [
      { x: cx - 16, y: cy - 16 }, { x: cx, y: cy - 16 }, { x: cx + 16, y: cy - 16 },
      { x: cx - 16, y: cy }, { x: cx, y: cy }, { x: cx + 16, y: cy },
      { x: cx - 16, y: cy + 16 }, { x: cx, y: cy + 16 }, { x: cx + 16, y: cy + 16 },
    ]
  }

  const leftDots = getDotPositions(leftCount, 0)
  const rightDots = getDotPositions(rightCount, 70)

  return (
    <div className="flex flex-col items-center">
      <div className="mb-1 text-center font-extrabold text-base sm:text-lg font-mono text-slate-900 px-3 py-0.5 rounded-full bg-slate-100 border border-slate-300">
        {total}
      </div>

      <svg width="140" height="60" viewBox="0 0 140 60" className="select-none flex-shrink-0">
        <rect
          x="2"
          y="2"
          width="136"
          height="56"
          rx="8"
          fill="#ffffff"
          stroke="#334155"
          strokeWidth="2"
        />

        <path
          d="M 70 2 H 130 A 8 8 0 0 1 138 10 V 50 A 8 8 0 0 1 130 58 H 70 Z"
          fill={isBw ? '#f1f5f9' : '#f8fafc'}
        />

        <line
          x1="70"
          y1="2"
          x2="70"
          y2="58"
          stroke="#334155"
          strokeWidth="2"
        />

        {leftDots.map((pt, idx) => (
          <circle
            key={`l-${idx}`}
            cx={pt.x}
            cy={pt.y}
            r="4.2"
            fill={isBw ? '#000000' : '#1e293b'}
          />
        ))}

        {isSolution ? (
          rightDots.map((pt, idx) => (
            <circle
              key={`r-${idx}`}
              cx={pt.x}
              cy={pt.y}
              r="4.2"
              fill={isBw ? '#334155' : '#10b981'}
              stroke={isBw ? '#000000' : '#059669'}
              strokeWidth="1"
            />
          ))
        ) : (
          <text
            x="105"
            y="37"
            textAnchor="middle"
            fill={isBw ? '#475569' : '#94a3b8'}
            fontSize="22"
            fontWeight="bold"
            fontFamily="monospace"
          >
            ?
          </text>
        )}
      </svg>
    </div>
  )
}

export function parseSchuettelboxItemData(
  item: unknown,
  index = 0
): SchuettelboxItemData | null {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f']
  const defaultPrefix = `${letters[index] || index + 1})`

  if (!item) return null
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    if (typeof obj.total === 'number' && typeof obj.leftCount === 'number') {
      return {
        prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
        total: obj.total,
        leftCount: obj.leftCount,
        rightCount: typeof obj.rightCount === 'number' ? obj.rightCount : obj.total - obj.leftCount,
      }
    }
  }
  return null
}

export function SchuettelboxCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: SchuettelboxItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, total, leftCount, rightCount } = data

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 print:shadow-none flex flex-col items-center justify-between space-y-2">
      <div className="w-full flex items-center justify-between">
        <span className="font-bold text-gray-500 font-mono text-sm select-none">
          {prefix}
        </span>
      </div>

      <ShakeBoxSVG
        total={total}
        leftCount={leftCount}
        rightCount={rightCount}
        isSolution={isSolution}
        colorMode={colorMode}
      />

      <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-slate-100 print:border-gray-300 font-mono text-sm select-none w-full">
        <span className="font-bold text-base px-1 text-slate-800">{leftCount}</span>
        <span className="font-bold text-gray-400 text-base">+</span>
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 border-2 rounded-lg flex items-center justify-center font-bold text-sm ${
            isSolution
              ? isBw
                ? 'border-black text-black bg-white'
                : 'border-slate-600 text-blue-700 bg-blue-50/60'
              : isBw
                ? 'border-slate-600 border-dashed bg-white'
                : 'border-slate-400 border-dashed bg-white'
          }`}
        >
          {isSolution ? rightCount : ''}
        </div>
        <span className="font-bold text-gray-400 text-base">=</span>
        <span className="font-bold text-base px-1 text-slate-800">{total}</span>
      </div>
    </div>
  )
}

// ── Zehnerstopp (ZehnerstoppCard) ──────────────────────────────
export function parseZehnerstoppItemData(
  item: unknown,
  index = 0
): ZehnerstoppItemData | null {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f']
  const defaultPrefix = `${letters[index] || index + 1})`

  if (!item) return null
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    if (typeof obj.num1 === 'number' && typeof obj.num2 === 'number' && typeof obj.result === 'number') {
      return {
        prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
        op: (obj.op === '-' ? '-' : '+') as '+' | '-',
        num1: obj.num1,
        num2: obj.num2,
        result: obj.result,
        step1Missing: typeof obj.step1Missing === 'number' ? obj.step1Missing : (obj.op === '+' ? 10 - obj.num1 : obj.num1 - 10),
        step2Missing: typeof obj.step2Missing === 'number' ? obj.step2Missing : (obj.num2 - (obj.op === '+' ? 10 - obj.num1 : obj.num1 - 10)),
      }
    }
  }
  return null
}

export function ZehnerstoppCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: ZehnerstoppItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, op, num1, num2, result, step1Missing, step2Missing } = data

  return (
    <div className="border border-slate-200 rounded-xl p-3.5 bg-white shadow-2xs print:border-gray-400 print:shadow-none space-y-2.5 font-mono select-none">
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-500 text-sm min-w-[20px]">
          {prefix}
        </span>
        <div className="flex items-center gap-1.5 text-base font-bold text-slate-900">
          <span>{num1}</span>
          <span className="text-gray-400">{op}</span>
          <span>{num2}</span>
          <span className="text-gray-400">=</span>
          <div
            className={`w-9 h-8 border-2 rounded-lg flex items-center justify-center font-bold text-sm ${
              isSolution
                ? isBw
                  ? 'border-black text-black bg-white'
                  : 'border-slate-600 text-blue-700 bg-blue-50/60'
                : 'border-slate-400 border-dashed bg-white'
            }`}
          >
            {isSolution ? result : ''}
          </div>
        </div>
      </div>

      <div className="pl-6 border-l-2 border-slate-200 space-y-2 text-xs sm:text-sm text-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-500 font-sans min-w-[58px]">1. Schritt:</span>
          <span>{num1}</span>
          <span className="text-gray-400">{op}</span>
          <div
            className={`w-7 h-7 sm:w-8 sm:h-7 border-2 rounded-md flex items-center justify-center font-bold text-xs ${
              isSolution
                ? isBw
                  ? 'border-black text-black bg-white'
                  : 'border-slate-600 text-blue-700 bg-blue-50/60'
                : 'border-slate-400 border-dashed bg-white'
            }`}
          >
            {isSolution ? step1Missing : ''}
          </div>
          <span className="text-gray-400">=</span>
          <span className="font-bold text-slate-900">10</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-500 font-sans min-w-[58px]">2. Schritt:</span>
          <span className="font-bold text-slate-900">10</span>
          <span className="text-gray-400">{op}</span>
          <div
            className={`w-7 h-7 sm:w-8 sm:h-7 border-2 rounded-md flex items-center justify-center font-bold text-xs ${
              isSolution
                ? isBw
                  ? 'border-black text-black bg-white'
                  : 'border-slate-600 text-blue-700 bg-blue-50/60'
                : 'border-slate-400 border-dashed bg-white'
            }`}
          >
            {isSolution ? step2Missing : ''}
          </div>
          <span className="text-gray-400">=</span>
          <div
            className={`w-7 h-7 sm:w-8 sm:h-7 border-2 rounded-md flex items-center justify-center font-bold text-xs ${
              isSolution
                ? isBw
                  ? 'border-black text-black bg-white'
                  : 'border-slate-600 text-blue-700 bg-blue-50/60'
                : 'border-slate-400 border-dashed bg-white'
            }`}
          >
            {isSolution ? result : ''}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Aufgabenfamilien (AufgabenfamilieDachSVG & AufgabenfamilieCard) ─
export function AufgabenfamilieDachSVG({
  a,
  b,
  sum,
  colorMode = 'color',
}: {
  a: number
  b: number
  sum: number
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'

  return (
    <svg width="120" height="52" viewBox="0 0 120 52" className="select-none flex-shrink-0">
      <polygon
        points="60,4 116,48 4,48"
        fill={isBw ? '#ffffff' : '#f8fafc'}
        stroke="#334155"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="22" r="11" fill={isBw ? '#ffffff' : '#e0e7ff'} stroke="#4338ca" strokeWidth="1" />
      <text
        x="60"
        y="26"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#1e1b4b"
        fontFamily="monospace"
      >
        {sum}
      </text>

      <text
        x="32"
        y="42"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#334155"
        fontFamily="monospace"
      >
        {a}
      </text>

      <text
        x="88"
        y="42"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#334155"
        fontFamily="monospace"
      >
        {b}
      </text>
    </svg>
  )
}

export function parseAufgabenfamilieItemData(
  item: unknown,
  index = 0
): AufgabenfamilieItemData | null {
  const letters = ['a', 'b', 'c', 'd']
  const defaultPrefix = `${letters[index] || index + 1})`

  if (!item) return null
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    if (typeof obj.a === 'number' && typeof obj.b === 'number' && typeof obj.sum === 'number') {
      return {
        prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
        a: obj.a,
        b: obj.b,
        sum: obj.sum,
      }
    }
  }
  return null
}

export function AufgabenfamilieCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: AufgabenfamilieItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, a, b, sum } = data

  const renderEquationRow = (
    n1: number,
    op: '+' | '-',
    n2: number,
    res: number,
    isFirst = false
  ) => {
    return (
      <div className="flex items-center justify-center gap-1 font-mono text-sm select-none">
        <div
          className={`w-7 h-7 sm:w-8 sm:h-7 border-2 rounded flex items-center justify-center font-bold text-xs ${
            isSolution || isFirst
              ? isBw
                ? 'border-black text-black bg-white'
                : 'border-slate-600 text-blue-700 bg-blue-50/60'
              : 'border-slate-400 border-dashed bg-white'
          }`}
        >
          {isSolution || isFirst ? n1 : ''}
        </div>
        <span className="font-bold text-gray-400 text-sm">{op}</span>
        <div
          className={`w-7 h-7 sm:w-8 sm:h-7 border-2 rounded flex items-center justify-center font-bold text-xs ${
            isSolution || isFirst
              ? isBw
                ? 'border-black text-black bg-white'
                : 'border-slate-600 text-blue-700 bg-blue-50/60'
              : 'border-slate-400 border-dashed bg-white'
          }`}
        >
          {isSolution || isFirst ? n2 : ''}
        </div>
        <span className="font-bold text-gray-400 text-sm">=</span>
        <div
          className={`w-7 h-7 sm:w-8 sm:h-7 border-2 rounded flex items-center justify-center font-bold text-xs ${
            isSolution
              ? isBw
                ? 'border-black text-black bg-white'
                : 'border-slate-600 text-blue-700 bg-blue-50/60'
              : 'border-slate-400 border-dashed bg-white'
          }`}
        >
          {isSolution ? res : ''}
        </div>
      </div>
    )
  }

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 print:shadow-none flex flex-col items-center justify-between space-y-2">
      <div className="w-full flex items-center justify-between">
        <span className="font-bold text-gray-500 font-mono text-sm select-none">
          {prefix}
        </span>
      </div>

      <AufgabenfamilieDachSVG a={a} b={b} sum={sum} colorMode={colorMode} />

      <div className="w-full pt-1 border-t border-slate-100 print:border-gray-300 space-y-1.5">
        {renderEquationRow(a, '+', b, sum, true)}
        {renderEquationRow(b, '+', a, sum, false)}
        {renderEquationRow(sum, '-', b, a, false)}
        {renderEquationRow(sum, '-', a, b, false)}
      </div>
    </div>
  )
}

// ── Wochentage (WochentageCard) ────────────────────────────────
export function parseWochentagItemData(
  item: unknown,
  index = 0
): WochentagItemData | null {
  const letters = ['a', 'b', 'c', 'd']
  const defaultPrefix = `${letters[index] || index + 1})`

  if (!item) return null
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>
    if (typeof obj.gestern === 'string' && typeof obj.heute === 'string' && typeof obj.morgen === 'string') {
      return {
        prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
        givenType: (obj.givenType || 'heute') as 'heute' | 'gestern' | 'morgen',
        givenDay: String(obj.givenDay || obj.heute),
        gestern: String(obj.gestern),
        heute: String(obj.heute),
        morgen: String(obj.morgen),
      }
    }
  }
  return null
}

export function WochentageCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: WochentagItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, givenType, givenDay, gestern, heute, morgen } = data

  const renderSlot = (label: string, value: string, isGiven: boolean) => {
    return (
      <div className="flex-1 min-w-[70px] flex flex-col items-center">
        <span className="text-[11px] text-gray-400 font-mono uppercase mb-1">{label}</span>
        <div
          className={`w-full py-1.5 px-1.5 rounded-lg border-2 text-center font-bold text-xs sm:text-sm select-none ${
            isGiven
              ? 'border-slate-300 bg-slate-50 text-slate-800'
              : isSolution
                ? isBw
                  ? 'border-black text-black bg-white'
                  : 'border-slate-600 text-blue-700 bg-blue-50/60'
                : 'border-slate-400 border-dashed bg-white text-transparent'
          }`}
        >
          {isGiven || isSolution ? value : ' '}
        </div>
      </div>
    )
  }

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 print:shadow-none space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">
          {prefix}
        </span>
        <span className="text-xs sm:text-sm text-slate-700">
          {givenType === 'heute' && (
            <>Heute ist <span className="font-bold text-slate-900">{givenDay}</span>.</>
          )}
          {givenType === 'gestern' && (
            <>Gestern war <span className="font-bold text-slate-900">{givenDay}</span>.</>
          )}
          {givenType === 'morgen' && (
            <>Morgen ist <span className="font-bold text-slate-900">{givenDay}</span>.</>
          )}
        </span>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-slate-100 print:border-gray-300">
        {renderSlot('Gestern', gestern, givenType === 'gestern')}
        <span className="text-gray-300 font-bold select-none">→</span>
        {renderSlot('Heute', heute, givenType === 'heute')}
        <span className="text-gray-300 font-bold select-none">→</span>
        {renderSlot('Morgen', morgen, givenType === 'morgen')}
      </div>
    </div>
  )
}// ── 1. HundertertafelCard ──────────────────────────────────────────
export function parseHundertertafelItemData(
  item: unknown,
  index = 0
): HundertertafelItemData | null {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const defaultPrefix = letters[index] || `${index + 1})`
  if (!item) return null

  let rawItem = item
  if (typeof rawItem === 'string') {
    try {
      rawItem = JSON.parse(rawItem)
    } catch {
      const match = (rawItem as string).match(/(\d+)/)
      if (match) {
        const c = parseInt(match[1], 10)
        return {
          type: 'punktefeld',
          prefix: defaultPrefix,
          count: c,
          zehner: Math.floor(c / 10),
          einer: c % 10,
          ergaenzung100: 100 - c,
        }
      }
      return null
    }
  }

  if (typeof rawItem !== 'object' || rawItem === null) return null
  const obj = rawItem as Record<string, unknown>
  const type = (obj.type as string) || (obj.center !== undefined ? 'kreuz' : obj.solution !== undefined ? 'raetsel' : 'nachbarzehner')
  
  if (type === 'kreuz' || obj.center !== undefined) {
    const center = Number(obj.center || 0)
    return {
      type: 'kreuz',
      prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
      center,
      top: Number(obj.top ?? center - 10),
      bottom: Number(obj.bottom ?? center + 10),
      left: Number(obj.left ?? center - 1),
      right: Number(obj.right ?? center + 1),
      zehner: Number(obj.zehner ?? Math.floor(center / 10)),
      einer: Number(obj.einer ?? (center % 10)),
    }
  }

  if (type === 'raetsel' || obj.text !== undefined) {
    return {
      type: 'raetsel',
      prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
      text: String(obj.text || ''),
      zehner: Number(obj.zehner || 0),
      einer: Number(obj.einer || 0),
      solution: Number(obj.solution ?? (Number(obj.zehner || 0) * 10 + Number(obj.einer || 0))),
    }
  }

  if (type === 'nachbarzehner' || obj.lowerZehner !== undefined) {
    const num = Number(obj.num || 0)
    return {
      type: 'nachbarzehner',
      prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
      num,
      lowerZehner: Number(obj.lowerZehner ?? Math.floor(num / 10) * 10),
      upperZehner: Number(obj.upperZehner ?? (Math.floor(num / 10) * 10 + 10)),
    }
  }

  if (
    type === 'punktefeld' ||
    obj.highlightCount !== undefined ||
    obj.count !== undefined ||
    (obj.zehner !== undefined && obj.einer !== undefined)
  ) {
    const count = Number(obj.count ?? obj.highlightCount ?? ((Number(obj.zehner || 0) * 10) + Number(obj.einer || 0)))
    const zehner = Number(obj.zehner ?? Math.floor(count / 10))
    const einer = Number(obj.einer ?? (count % 10))
    const ergaenzung100 = Number(obj.ergaenzung100 ?? (100 - count))
    return {
      type: 'punktefeld',
      prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
      count,
      zehner,
      einer,
      ergaenzung100,
    }
  }

  if (type === 'stellenwert' || (obj.num !== undefined && obj.ergaenzung100 !== undefined)) {
    const num = Number(obj.num || 0)
    const zehner = Number(obj.zehner ?? Math.floor(num / 10))
    const einer = Number(obj.einer ?? (num % 10))
    const ergaenzung100 = Number(obj.ergaenzung100 ?? (100 - num))
    return {
      type: 'stellenwert',
      prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
      num,
      zehner,
      einer,
      ergaenzung100,
    }
  }

  return null
}

export function HundredDotFieldSVG({
  count,
  colorMode = 'color',
}: {
  count: number
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  return (
    <svg width="145" height="145" viewBox="0 0 145 145" className="select-none overflow-visible">
      <line x1="72.5" y1="2" x2="72.5" y2="143" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 2" />
      <line x1="2" y1="72.5" x2="143" y2="72.5" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 2" />
      {Array.from({ length: 100 }, (_, idx) => {
        const row = Math.floor(idx / 10)
        const col = idx % 10
        const cx = 9 + col * 12.5 + (col >= 5 ? 5 : 0)
        const cy = 9 + row * 12.5 + (row >= 5 ? 5 : 0)
        const isFilled = idx < count
        return (
          <circle
            key={idx}
            cx={cx}
            cy={cy}
            r={4.5}
            fill={isFilled ? (isBw ? '#111827' : '#2563eb') : 'white'}
            stroke={isFilled ? (isBw ? '#000000' : '#1d4ed8') : '#94a3b8'}
            strokeWidth="1.2"
          />
        )
      })}
    </svg>
  )
}

export function HundertertafelCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: HundertertafelItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix } = data

  if (data.type === 'kreuz') {
    const { center, top, bottom, left, right, zehner, einer } = data
    return (
      <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2 flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">
            {prefix}
          </span>
          <span className="text-xs text-slate-600 font-medium">Hundertertafel-Ausschnitt:</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-1">
          {/* 3x3 Kreuz */}
          <div className="w-[108px] h-[108px] grid grid-cols-3 grid-rows-3 gap-1 select-none">
            {/* Row 0 */}
            <div />
            <div
              className={`w-8 h-8 rounded border-2 flex items-center justify-center font-mono font-bold text-sm ${
                isSolution
                  ? isBw
                    ? 'border-black text-black bg-white'
                    : 'border-slate-700 text-blue-700 bg-blue-50/60'
                  : 'border-slate-400 border-dashed bg-white text-transparent'
              }`}
            >
              {isSolution ? top : ''}
            </div>
            <div />

            {/* Row 1 */}
            <div
              className={`w-8 h-8 rounded border-2 flex items-center justify-center font-mono font-bold text-sm ${
                isSolution
                  ? isBw
                    ? 'border-black text-black bg-white'
                    : 'border-slate-700 text-blue-700 bg-blue-50/60'
                  : 'border-slate-400 border-dashed bg-white text-transparent'
              }`}
            >
              {isSolution ? left : ''}
            </div>
            <div
              className={`w-8 h-8 rounded border-2 flex items-center justify-center font-mono font-bold text-sm ${
                isBw ? 'border-black bg-slate-100 text-black' : 'border-slate-800 bg-amber-100 text-amber-950'
              }`}
            >
              {center}
            </div>
            <div
              className={`w-8 h-8 rounded border-2 flex items-center justify-center font-mono font-bold text-sm ${
                isSolution
                  ? isBw
                    ? 'border-black text-black bg-white'
                    : 'border-slate-700 text-blue-700 bg-blue-50/60'
                  : 'border-slate-400 border-dashed bg-white text-transparent'
              }`}
            >
              {isSolution ? right : ''}
            </div>

            {/* Row 2 */}
            <div />
            <div
              className={`w-8 h-8 rounded border-2 flex items-center justify-center font-mono font-bold text-sm ${
                isSolution
                  ? isBw
                    ? 'border-black text-black bg-white'
                    : 'border-slate-700 text-blue-700 bg-blue-50/60'
                  : 'border-slate-400 border-dashed bg-white text-transparent'
              }`}
            >
              {isSolution ? bottom : ''}
            </div>
            <div />
          </div>

          {/* Stellenwert-Zerlegung */}
          <div className="flex flex-col gap-1.5 font-mono text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-bold text-slate-900">{center}</span>
              <span className="font-bold text-gray-400">=</span>
              <div
                className={`w-8 h-7 rounded border-2 flex items-center justify-center font-bold text-xs ${
                  isSolution
                    ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
                    : 'border-slate-400 border-dashed bg-white text-transparent'
                }`}
              >
                {isSolution ? zehner : ''}
              </div>
              <span className="font-bold text-slate-800">Z</span>
              <span className="font-bold text-gray-400">+</span>
              <div
                className={`w-8 h-7 rounded border-2 flex items-center justify-center font-bold text-xs ${
                  isSolution
                    ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
                    : 'border-slate-400 border-dashed bg-white text-transparent'
                }`}
              >
                {isSolution ? einer : ''}
              </div>
              <span className="font-bold text-slate-800">E</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (data.type === 'raetsel') {
    return (
      <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">
            {prefix}
          </span>
          <span className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
            {data.text}
          </span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 font-mono text-xs sm:text-sm">
          <span className="text-slate-600 font-sans text-xs">Gesuchte Zahl:</span>
          <div
            className={`min-w-[50px] px-2 h-7 rounded border-2 flex items-center justify-center font-bold ${
              isSolution
                ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
                : 'border-slate-400 border-dashed bg-white text-transparent'
            }`}
          >
            {isSolution ? `${data.solution}` : ''}
          </div>
          {isSolution && (
            <span className="text-gray-400 text-xs font-normal">
              ({data.zehner} Z + {data.einer} E)
            </span>
          )}
        </div>
      </div>
    )
  }

  if (data.type === 'punktefeld') {
    const { count, zehner, einer, ergaenzung100 } = data
    return (
      <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2 flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">
            {prefix}
          </span>
          <span className="text-xs text-slate-600 font-medium">Hunderterfeld (10x10 Punktefeld):</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-1">
          {/* 10x10 SVG Punktefeld mit 5er-Struktur */}
          <HundredDotFieldSVG count={count} colorMode={colorMode} />

          {/* Fragen / Antworten */}
          <div className="flex flex-col gap-2 font-mono text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-slate-600 font-sans text-xs">Punkte:</span>
              <div
                className={`w-10 h-7 rounded border-2 flex items-center justify-center font-bold ${
                  isSolution
                    ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
                    : 'border-slate-400 border-dashed bg-white text-transparent'
                }`}
              >
                {isSolution ? count : ''}
              </div>
              <span className="text-gray-400 text-xs">({zehner}Z + {einer}E)</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap text-xs">
              <span className="text-slate-600 font-sans">Ergänzen:</span>
              <span className="font-bold">{count}</span>
              <span>+</span>
              <div
                className={`w-9 h-6 rounded border-2 flex items-center justify-center font-bold ${
                  isSolution
                    ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
                    : 'border-slate-400 border-dashed bg-white text-transparent'
                }`}
              >
                {isSolution ? ergaenzung100 : ''}
              </div>
              <span>= 100</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (data.type === 'stellenwert') {
    const { num, zehner, einer, ergaenzung100 } = data
    return (
      <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2 flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">
            {prefix}
          </span>
          <span className="text-xs text-slate-600 font-medium">Stellenwerttafel & Ergänzen:</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-1">
          {/* Stellenwerttafel Tabelle */}
          <div className="border-2 border-slate-700 rounded-lg overflow-hidden select-none">
            <div className="grid grid-cols-2 text-center text-xs font-bold bg-slate-100 border-b border-slate-300">
              <div className="px-3 py-1 bg-blue-100 text-blue-800 border-r border-slate-300">Z</div>
              <div className="px-3 py-1 bg-emerald-100 text-emerald-800">E</div>
            </div>
            <div className="grid grid-cols-2 text-center font-mono font-bold text-base py-1.5 bg-white">
              <div className="border-r border-slate-300 text-blue-900">{zehner}</div>
              <div className="text-emerald-900">{einer}</div>
            </div>
          </div>

          {/* Aufgaben */}
          <div className="flex flex-col gap-1.5 font-mono text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <span>{zehner * 10} + {einer} =</span>
              <div
                className={`w-10 h-7 rounded border-2 flex items-center justify-center font-bold ${
                  isSolution
                    ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
                    : 'border-slate-400 border-dashed bg-white text-transparent'
                }`}
              >
                {isSolution ? num : ''}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold">{num}</span>
              <span>+</span>
              <div
                className={`w-9 h-6 rounded border-2 flex items-center justify-center font-bold ${
                  isSolution
                    ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
                    : 'border-slate-400 border-dashed bg-white text-transparent'
                }`}
              >
                {isSolution ? ergaenzung100 : ''}
              </div>
              <span>= 100</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // data.type === 'nachbarzehner'
  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">
          {prefix}
        </span>
        <span className="text-xs text-slate-600 font-medium">Trage die Nachbarzehner ein:</span>
      </div>
      <div className="flex items-center justify-center gap-2 pt-1 font-mono text-xs sm:text-sm">
        <div
          className={`w-12 h-7 rounded border-2 flex items-center justify-center font-bold ${
            isSolution
              ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
              : 'border-slate-400 border-dashed bg-white text-transparent'
          }`}
        >
          {isSolution ? data.lowerZehner : ''}
        </div>
        <span className="font-bold text-gray-400">&lt;</span>
        <span className="font-bold text-slate-900 px-1">{data.num}</span>
        <span className="font-bold text-gray-400">&lt;</span>
        <div
          className={`w-12 h-7 rounded border-2 flex items-center justify-center font-bold ${
            isSolution
              ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
              : 'border-slate-400 border-dashed bg-white text-transparent'
          }`}
        >
          {isSolution ? data.upperZehner : ''}
        </div>
      </div>
    </div>
  )
}

// ── 2. HalbschriftlichCard ──────────────────────────────────────────
export function parseHalbschriftlichItemData(
  item: unknown,
  index = 0
): HalbschriftlichItemData | null {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const defaultPrefix = letters[index] || `${index + 1})`
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  if (obj.num1 !== undefined && obj.num2 !== undefined) {
    const num1 = Number(obj.num1)
    const num2 = Number(obj.num2)
    const op = (obj.op === '-' ? '-' : '+') as '+' | '-'
    const ten = Math.floor(num2 / 10) * 10
    const one = num2 % 10
    const step1Ten = Number(obj.step1Ten ?? ten)
    const step1Res = Number(obj.step1Res ?? (op === '+' ? num1 + ten : num1 - ten))
    const step2One = Number(obj.step2One ?? one)
    const result = Number(obj.result ?? (op === '+' ? step1Res + one : step1Res - one))

    return {
      prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
      num1,
      num2,
      op,
      step1Ten,
      step1Res,
      step2One,
      result,
    }
  }
  return null
}

export function HalbschriftlichCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: HalbschriftlichItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, num1, num2, op, step1Ten, step1Res, step2One, result } = data

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2">
      {/* Hauptaufgabe */}
      <div className="flex items-center gap-2 font-mono text-sm sm:text-base border-b-2 border-slate-400 pb-1.5">
        <span className="font-bold text-gray-500 text-sm select-none min-w-[20px]">
          {prefix}
        </span>
        <span className="font-bold text-slate-900">
          {num1} {op} {num2}
        </span>
        <span className="font-bold text-gray-400">=</span>
        <div
          className={`w-11 h-7 rounded border-2 flex items-center justify-center font-bold text-sm ${
            isSolution
              ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
              : 'border-slate-400 border-dashed bg-white text-transparent'
          }`}
        >
          {isSolution ? result : ''}
        </div>
      </div>

      {/* Rechenweg in 2 Schritten */}
      <div className="pl-6 space-y-1.5 pt-1 font-mono text-xs sm:text-sm text-slate-700">
        {/* Schritt 1: Zehner */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-400 font-sans w-16">1. Schritt:</span>
          <span>{num1} {op} {step1Ten} =</span>
          <div
            className={`w-9 h-6 rounded border-2 flex items-center justify-center font-bold text-xs ${
              isSolution
                ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
                : 'border-slate-400 border-dashed bg-white text-transparent'
            }`}
          >
            {isSolution ? step1Res : ''}
          </div>
        </div>

        {/* Schritt 2: Einer */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-400 font-sans w-16">2. Schritt:</span>
          <div
            className={`w-9 h-6 rounded border-2 flex items-center justify-center font-bold text-xs ${
              isSolution
                ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
                : 'border-slate-400 border-dashed bg-white text-transparent'
            }`}
          >
            {isSolution ? step1Res : ''}
          </div>
          <span>{op} {step2One} =</span>
          <div
            className={`w-9 h-6 rounded border-2 flex items-center justify-center font-bold text-xs ${
              isSolution
                ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
                : 'border-slate-400 border-dashed bg-white text-transparent'
            }`}
          >
            {isSolution ? result : ''}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 3. EinmaleinsCard ──────────────────────────────────────────────
export function parseEinmaleinsItemData(
  item: unknown,
  index = 0
): EinmaleinsItemData | null {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const defaultPrefix = letters[index] || `${index + 1})`
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  if (obj.rows !== undefined && obj.cols !== undefined) {
    const rows = Number(obj.rows)
    const cols = Number(obj.cols)
    return {
      prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
      rows,
      cols,
      product: Number(obj.product ?? rows * cols),
    }
  }
  return null
}

export function EinmaleinsCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: EinmaleinsItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, rows, cols, product } = data

  const renderSlot = (val: number | string) => (
    <div
      className={`inline-flex w-8 h-6 rounded border-2 items-center justify-center font-bold text-xs font-mono align-middle ${
        isSolution
          ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
          : 'border-slate-400 border-dashed bg-white text-transparent'
      }`}
    >
      {isSolution ? val : ''}
    </div>
  )

  const dotSpacing = 14
  const svgWidth = cols * dotSpacing + 12
  const svgHeight = rows * dotSpacing + 12

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">
          {prefix}
        </span>
        <span className="text-xs text-slate-600 font-medium">
          Punktefeld &amp; Malfamilie ({rows} Zeilen, {cols} Spalten):
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
        {/* SVG Punktefeld */}
        <div className="p-2 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
          <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="overflow-visible"
          >
            {Array.from({ length: rows }).map((_, rIdx) =>
              Array.from({ length: cols }).map((_, cIdx) => (
                <circle
                  key={`${rIdx}-${cIdx}`}
                  cx={8 + cIdx * dotSpacing}
                  cy={8 + rIdx * dotSpacing}
                  r={4.2}
                  fill={isBw ? '#000000' : '#2563eb'}
                />
              ))
            )}
          </svg>
        </div>

        {/* 4 Gleichungen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 font-mono text-xs sm:text-sm text-slate-800 flex-1">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-gray-400 text-[10px] uppercase font-sans">Mal:</span>
            <span>{rows} · {cols} =</span>
            {renderSlot(product)}
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-gray-400 text-[10px] uppercase font-sans">Tausch:</span>
            <span>{cols} · {rows} =</span>
            {renderSlot(product)}
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-gray-400 text-[10px] uppercase font-sans">Umkehr 1:</span>
            <span>{product} : {cols} =</span>
            {renderSlot(rows)}
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-gray-400 text-[10px] uppercase font-sans">Umkehr 2:</span>
            <span>{product} : {rows} =</span>
            {renderSlot(cols)}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 4. GeldKlasse2Card ─────────────────────────────────────────────
export function parseGeldKlasse2ItemData(
  item: unknown,
  index = 0
): GeldKlasse2ItemData | null {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const defaultPrefix = letters[index] || `${index + 1})`
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  return {
    prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
    type: (obj.type || 'count') as 'count' | 'convert_to_comma' | 'convert_from_comma' | 'compare',
    bills: Array.isArray(obj.bills) ? (obj.bills as number[]) : undefined,
    coins: Array.isArray(obj.coins) ? (obj.coins as number[]) : undefined,
    euro: obj.euro !== undefined ? Number(obj.euro) : undefined,
    cent: obj.cent !== undefined ? Number(obj.cent) : undefined,
    commaStr: typeof obj.commaStr === 'string' ? obj.commaStr : undefined,
    leftCompare: typeof obj.leftCompare === 'string' ? obj.leftCompare : undefined,
    rightCompare: typeof obj.rightCompare === 'string' ? obj.rightCompare : undefined,
    compareOp: (obj.compareOp || '=') as '<' | '>' | '=',
  }
}

export function GeldKlasse2Card({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: GeldKlasse2ItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, type } = data

  const renderSlot = (val: string, minW = 'min-w-[40px]') => (
    <div
      className={`inline-flex px-2 h-7 rounded border-2 items-center justify-center font-bold text-xs font-mono align-middle ${minW} ${
        isSolution
          ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
          : 'border-slate-400 border-dashed bg-white text-transparent'
      }`}
    >
      {isSolution ? val : ''}
    </div>
  )

  if (type === 'count') {
    const bills = data.bills || []
    const coins = data.coins || []
    return (
      <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">
            {prefix}
          </span>
          <span className="text-xs text-slate-600 font-medium">Zähle das Geld zusammen:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 py-1">
          {bills.map((b: number, bIdx: number) => (
            <GeldscheinSVG key={`b-${bIdx}`} value={b} colorMode={colorMode} />
          ))}
          {coins.map((c: number, cIdx: number) => (
            c >= 1 ? (
              <EuroMuenzeSVG key={`c-${cIdx}`} value={c} colorMode={colorMode} />
            ) : (
              <CentMuenzeSVG key={`c-${cIdx}`} value={Math.round(c * 100)} colorMode={colorMode} />
            )
          ))}
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 font-mono text-xs sm:text-sm">
          <span>Betrag:</span>
          {renderSlot(`${data.euro ?? 0} € ${data.cent ?? 0} ct`, 'min-w-[80px]')}
          <span>=</span>
          {renderSlot(data.commaStr ?? `${data.euro},${data.cent} €`, 'min-w-[65px]')}
        </div>
      </div>
    )
  }

  if (type === 'convert_to_comma') {
    return (
      <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-1.5 font-mono text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-sans text-xs text-slate-600">
          <span className="font-bold text-gray-500 font-mono text-sm min-w-[20px]">{prefix}</span>
          <span>In Kommaschreibweise:</span>
        </div>
        <div className="flex items-center gap-2 pl-6">
          <span className="font-bold text-slate-800">{data.euro} € {data.cent} ct</span>
          <span className="text-gray-400 font-bold">=</span>
          {renderSlot(data.commaStr ?? `${data.euro},${data.cent} €`, 'min-w-[70px]')}
        </div>
      </div>
    )
  }

  if (type === 'convert_from_comma') {
    return (
      <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-1.5 font-mono text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-sans text-xs text-slate-600">
          <span className="font-bold text-gray-500 font-mono text-sm min-w-[20px]">{prefix}</span>
          <span>In Euro und Cent zerlegen:</span>
        </div>
        <div className="flex items-center gap-2 pl-6">
          <span className="font-bold text-slate-800">{data.commaStr}</span>
          <span className="text-gray-400 font-bold">=</span>
          {renderSlot(`${data.euro ?? 0}`, 'min-w-[32px]')}
          <span className="font-bold text-slate-800">€ und</span>
          {renderSlot(`${data.cent ?? 0}`, 'min-w-[32px]')}
          <span className="font-bold text-slate-800">ct</span>
        </div>
      </div>
    )
  }

  // type === 'compare'
  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-1.5 font-mono text-xs sm:text-sm">
      <div className="flex items-center gap-2 font-sans text-xs text-slate-600">
        <span className="font-bold text-gray-500 font-mono text-sm min-w-[20px]">{prefix}</span>
        <span>Setze &lt;, &gt; oder = ein:</span>
      </div>
      <div className="flex items-center justify-center gap-3 py-1">
        <span className="font-bold text-slate-800">{data.leftCompare}</span>
        <div
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-base ${
            isSolution
              ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
              : 'border-slate-400 border-dashed bg-white text-transparent'
          }`}
        >
          {isSolution ? data.compareOp : ''}
        </div>
        <span className="font-bold text-slate-800">{data.rightCompare}</span>
      </div>
    </div>
  )
}

// ── 5. LinealSVG & LaengenMessenCard ───────────────────────────────
export function LinealSVG({
  lengthCm = 7,
  colorMode = 'color',
}: {
  lengthCm: number
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const startX = 14
  const cmPx = 22
  const maxCm = 10
  const width = startX + maxCm * cmPx + 16
  const height = 48
  const barY = 10
  const rulerY = 22
  const barEndX = startX + lengthCm * cmPx

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="select-none overflow-visible"
    >
      {/* Gemessene Strecke oberhalb des Lineals */}
      <line
        x1={startX}
        y1={barY}
        x2={barEndX}
        y2={barY}
        stroke={isBw ? '#000000' : '#dc2626'}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Endmarkierungen der Strecke */}
      <line
        x1={startX}
        y1={barY - 4}
        x2={startX}
        y2={barY + 4}
        stroke={isBw ? '#000000' : '#dc2626'}
        strokeWidth="2"
      />
      <line
        x1={barEndX}
        y1={barY - 4}
        x2={barEndX}
        y2={barY + 4}
        stroke={isBw ? '#000000' : '#dc2626'}
        strokeWidth="2"
      />

      {/* Linealkörper */}
      <rect
        x="6"
        y={rulerY}
        width={maxCm * cmPx + 16}
        height="22"
        rx="2"
        fill={isBw ? '#ffffff' : '#fef9c3'}
        stroke="#475569"
        strokeWidth="1.2"
      />

      {/* Skala-Striche und Zahlen */}
      {Array.from({ length: maxCm + 1 }).map((_, cm) => {
        const x = startX + cm * cmPx
        return (
          <g key={cm}>
            {/* Großer Zentimeter-Strich */}
            <line x1={x} y1={rulerY} x2={x} y2={rulerY + 8} stroke="#1e293b" strokeWidth="1.2" />
            {/* Halbzentimeter-Strich */}
            {cm < maxCm && (
              <line x1={x + cmPx / 2} y1={rulerY} x2={x + cmPx / 2} y2={rulerY + 5} stroke="#64748b" strokeWidth="0.8" />
            )}
            {/* Zahl */}
            <text
              x={x}
              y={rulerY + 17}
              textAnchor="middle"
              fontSize="8.5"
              fontFamily="monospace"
              fontWeight="bold"
              fill="#0f172a"
            >
              {cm}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function parseLaengenMessenItemData(
  item: unknown,
  index = 0
): LaengenMessenItemData | null {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const defaultPrefix = letters[index] || `${index + 1})`
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  return {
    prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
    type: (obj.type || 'lineal') as 'lineal' | 'complement_1m' | 'mixed_convert',
    lineLengthCm: obj.lineLengthCm !== undefined ? Number(obj.lineLengthCm) : undefined,
    givenCm: obj.givenCm !== undefined ? Number(obj.givenCm) : undefined,
    missingCm: obj.missingCm !== undefined ? Number(obj.missingCm) : undefined,
    meters: obj.meters !== undefined ? Number(obj.meters) : undefined,
    centimeters: obj.centimeters !== undefined ? Number(obj.centimeters) : undefined,
    totalCm: obj.totalCm !== undefined ? Number(obj.totalCm) : undefined,
  }
}

export function LaengenMessenCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: LaengenMessenItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, type } = data

  const renderSlot = (val: string, minW = 'min-w-[45px]') => (
    <div
      className={`inline-flex px-2 h-7 rounded border-2 items-center justify-center font-bold text-xs font-mono align-middle ${minW} ${
        isSolution
          ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
          : 'border-slate-400 border-dashed bg-white text-transparent'
      }`}
    >
      {isSolution ? val : ''}
    </div>
  )

  if (type === 'lineal') {
    const len = data.lineLengthCm ?? 6
    return (
      <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">
            {prefix}
          </span>
          <span className="text-xs text-slate-600 font-medium">Lies die Länge der roten Strecke am Lineal ab:</span>
        </div>

        <div className="flex justify-center py-1">
          <LinealSVG lengthCm={len} colorMode={colorMode} />
        </div>

        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 font-mono text-xs sm:text-sm">
          <span>Länge:</span>
          {renderSlot(`${len} cm`)}
        </div>
      </div>
    )
  }

  if (type === 'complement_1m') {
    const given = data.givenCm ?? 70
    const missing = data.missingCm ?? 30
    return (
      <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-1.5 font-mono text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-sans text-xs text-slate-600">
          <span className="font-bold text-gray-500 font-mono text-sm min-w-[20px]">{prefix}</span>
          <span>Ergänze zu 1 Meter (100 cm):</span>
        </div>
        <div className="flex items-center gap-2 pl-6">
          <span className="font-bold text-slate-800">{given} cm</span>
          <span className="text-gray-400 font-bold">+</span>
          {renderSlot(`${missing} cm`)}
          <span className="text-gray-400 font-bold">=</span>
          <span className="font-bold text-slate-900">1 m (100 cm)</span>
        </div>
      </div>
    )
  }

  // type === 'mixed_convert'
  const m = data.meters ?? 1
  const cm = data.centimeters ?? 35
  const total = data.totalCm ?? (m * 100 + cm)
  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-1.5 font-mono text-xs sm:text-sm">
      <div className="flex items-center gap-2 font-sans text-xs text-slate-600">
        <span className="font-bold text-gray-500 font-mono text-sm min-w-[20px]">{prefix}</span>
        <span>Rechne in Zentimeter um (1 m = 100 cm):</span>
      </div>
      <div className="flex items-center gap-2 pl-6">
        <span className="font-bold text-slate-800">{m} m {cm} cm</span>
        <span className="text-gray-400 font-bold">=</span>
        {renderSlot(`${total} cm`)}
      </div>
    </div>
  )
}

// ── 6. KoerperSVG & KoerperCard ────────────────────────────────────
export function KoerperSVG({
  shape = 'Wuerfel',
  colorMode = 'color',
  size = 54,
}: {
  shape: KoerperType | string
  colorMode?: 'color' | 'bw'
  size?: number
}) {
  const isBw = colorMode === 'bw'
  const s = String(shape || '').toLowerCase()

  if (s.includes('wuerfel') || s.includes('würfel')) {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60" className="inline-block overflow-visible select-none">
        <polygon points="12,18 30,8 48,18 30,28" fill={isBw ? '#ffffff' : '#bfdbfe'} stroke="#1e293b" strokeWidth="1.6" />
        <polygon points="12,18 30,28 30,50 12,40" fill={isBw ? '#f1f5f9' : '#60a5fa'} stroke="#1e293b" strokeWidth="1.6" />
        <polygon points="30,28 48,18 48,40 30,50" fill={isBw ? '#cbd5e1' : '#3b82f6'} stroke="#1e293b" strokeWidth="1.6" />
      </svg>
    )
  }

  if (s.includes('quader')) {
    return (
      <svg width={size * 1.2} height={size} viewBox="0 0 72 60" className="inline-block overflow-visible select-none">
        <polygon points="8,22 28,10 64,10 44,22" fill={isBw ? '#ffffff' : '#fed7aa'} stroke="#1e293b" strokeWidth="1.6" />
        <polygon points="8,22 44,22 44,48 8,48" fill={isBw ? '#f1f5f9' : '#f97316'} stroke="#1e293b" strokeWidth="1.6" />
        <polygon points="44,22 64,10 64,36 44,48" fill={isBw ? '#cbd5e1' : '#ea580c'} stroke="#1e293b" strokeWidth="1.6" />
      </svg>
    )
  }

  if (s.includes('kugel')) {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60" className="inline-block overflow-visible select-none">
        <defs>
          <radialGradient id="kugelGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor={isBw ? '#ffffff' : '#fef08a'} />
            <stop offset="70%" stopColor={isBw ? '#cbd5e1' : '#eab308'} />
            <stop offset="100%" stopColor={isBw ? '#64748b' : '#ca8a04'} />
          </radialGradient>
        </defs>
        <circle cx="30" cy="30" r="22" fill="url(#kugelGrad)" stroke="#1e293b" strokeWidth="1.6" />
        <ellipse cx="30" cy="30" rx="22" ry="7" fill="none" stroke="#1e293b" strokeWidth="1.2" strokeDasharray="3,3" />
      </svg>
    )
  }

  if (s.includes('zylinder')) {
    return (
      <svg width={size} height={size} viewBox="0 0 60 60" className="inline-block overflow-visible select-none">
        <path d="M16,18 L16,42 A14,6 0 0,0 44,42 L44,18 Z" fill={isBw ? '#f1f5f9' : '#a7f3d0'} stroke="#1e293b" strokeWidth="1.6" />
        <ellipse cx="30" cy="18" rx="14" ry="6" fill={isBw ? '#ffffff' : '#6ee7b7'} stroke="#1e293b" strokeWidth="1.6" />
        <ellipse cx="30" cy="42" rx="14" ry="6" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="2,2" />
      </svg>
    )
  }

  // Pyramide
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" className="inline-block overflow-visible select-none">
      <polygon points="30,8 10,44 32,48" fill={isBw ? '#f1f5f9' : '#fbcfe8'} stroke="#1e293b" strokeWidth="1.6" />
      <polygon points="30,8 32,48 50,40" fill={isBw ? '#cbd5e1' : '#f472b6'} stroke="#1e293b" strokeWidth="1.6" />
      <line x1="10" y1="44" x2="28" y2="36" stroke="#64748b" strokeWidth="1" strokeDasharray="2,2" />
      <line x1="50" y1="40" x2="28" y2="36" stroke="#64748b" strokeWidth="1" strokeDasharray="2,2" />
      <line x1="30" y1="8" x2="28" y2="36" stroke="#64748b" strokeWidth="1" strokeDasharray="2,2" />
    </svg>
  )
}

export function parseGeometrieKoerperItemData(
  item: unknown,
  index = 0
): GeometrieKoerperItemData | null {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const defaultPrefix = letters[index] || `${index + 1})`
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const type = (obj.type || (obj.ecken !== undefined ? 'properties' : obj.cols !== undefined ? 'symmetry' : 'identify')) as 'identify' | 'properties' | 'symmetry'

  if (type === 'identify') {
    return {
      type: 'identify',
      prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
      shape: (obj.shape || 'Wuerfel') as KoerperType,
      germanName: String(obj.germanName || obj.shape || 'Würfel'),
    }
  }

  if (type === 'properties') {
    return {
      type: 'properties',
      prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
      shape: (obj.shape || 'Wuerfel') as KoerperType,
      germanName: String(obj.germanName || obj.shape || 'Würfel'),
      ecken: Number(obj.ecken || 0),
      kanten: Number(obj.kanten || 0),
      flaechen: Number(obj.flaechen || 0),
    }
  }

  if (type === 'symmetry') {
    return {
      type: 'symmetry',
      prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
      cols: Number(obj.cols || 6),
      rows: Number(obj.rows || 4),
      givenGridPoints: Array.isArray(obj.givenGridPoints) ? (obj.givenGridPoints as { x: number; y: number }[]) : [],
      solutionGridPoints: Array.isArray(obj.solutionGridPoints) ? (obj.solutionGridPoints as { x: number; y: number }[]) : [],
    }
  }

  return null
}

export function KoerperCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: GeometrieKoerperItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, type } = data

  const renderSlot = (val: string | number, minW = 'min-w-[40px]') => (
    <div
      className={`inline-flex px-2 h-7 rounded border-2 items-center justify-center font-bold text-xs font-mono align-middle ${minW} ${
        isSolution
          ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
          : 'border-slate-400 border-dashed bg-white text-transparent'
      }`}
    >
      {isSolution ? String(val) : ''}
    </div>
  )

  if (type === 'identify') {
    return (
      <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2 flex flex-col items-center">
        <div className="w-full flex items-center gap-2">
          <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">{prefix}</span>
          <span className="text-xs text-slate-600 font-medium">Welcher Körper ist das?</span>
        </div>
        <div className="py-2">
          <KoerperSVG shape={data.shape} colorMode={colorMode} size={56} />
        </div>
        <div className="w-full flex items-center justify-center gap-2 pt-1 border-t border-slate-100 font-sans text-xs sm:text-sm">
          <span className="text-slate-600">Name:</span>
          {renderSlot(data.germanName, 'min-w-[90px]')}
        </div>
      </div>
    )
  }

  if (type === 'properties') {
    return (
      <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2">
        <div className="w-full flex items-center gap-2">
          <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">{prefix}</span>
          <span className="text-xs text-slate-600 font-medium">Bestimme die Eigenschaften ({data.germanName}):</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-1">
          <KoerperSVG shape={data.shape} colorMode={colorMode} size={50} />
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-xs text-slate-600">Ecken:</span>
              {renderSlot(data.ecken, 'min-w-[32px]')}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-xs text-slate-600">Kanten:</span>
              {renderSlot(data.kanten, 'min-w-[32px]')}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-xs text-slate-600">Flächen:</span>
              {renderSlot(data.flaechen, 'min-w-[32px]')}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // type === 'symmetry'
  const cols = data.cols || 6
  const rows = data.rows || 4
  const cellSize = 18
  const width = cols * cellSize
  const height = rows * cellSize
  const midX = (cols / 2) * cellSize

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2">
      <div className="w-full flex items-center gap-2">
        <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">{prefix}</span>
        <span className="text-xs text-slate-600 font-medium">Spiegle die Punkte an der roten Achse:</span>
      </div>
      <div className="flex justify-center py-1">
        <svg
          width={width + 10}
          height={height + 10}
          viewBox={`-5 -5 ${width + 10} ${height + 10}`}
          className="border border-slate-300 rounded bg-slate-50 select-none overflow-visible"
        >
          {/* Gitterlinien */}
          {Array.from({ length: cols + 1 }).map((_, c) => (
            <line
              key={`c-${c}`}
              x1={c * cellSize}
              y1={0}
              x2={c * cellSize}
              y2={height}
              stroke="#cbd5e1"
              strokeWidth="0.8"
            />
          ))}
          {Array.from({ length: rows + 1 }).map((_, r) => (
            <line
              key={`r-${r}`}
              x1={0}
              y1={r * cellSize}
              x2={width}
              y2={r * cellSize}
              stroke="#cbd5e1"
              strokeWidth="0.8"
            />
          ))}

          {/* Rote Spiegelachse in der Mitte */}
          <line
            x1={midX}
            y1={-2}
            x2={midX}
            y2={height + 2}
            stroke="#ef4444"
            strokeWidth="2.2"
            strokeDasharray="4,2"
          />

          {/* Vorgegebene Punkte (links) */}
          {(data.givenGridPoints || []).map((p: any, pIdx: number) => (
            <circle
              key={`given-${pIdx}`}
              cx={p.x * cellSize}
              cy={p.y * cellSize}
              r={4.5}
              fill={isBw ? '#000000' : '#2563eb'}
            />
          ))}

          {/* Gespiegelte Punkte (rechts) */}
          {isSolution &&
            (data.solutionGridPoints || []).map((p: any, sIdx: number) => (
              <circle
                key={`sol-${sIdx}`}
                cx={p.x * cellSize}
                cy={p.y * cellSize}
                r={4.5}
                fill={isBw ? '#000000' : '#059669'}
              />
            ))}
        </svg>
      </div>
    </div>
  )
}

// ── 7. DienesBlocksSVG & DienesBlocksCard (Zehnerstangen & Einerwürfel) ──
export function DienesBlocksSVG({
  zehner,
  einer,
  colorMode = 'color',
}: {
  zehner: number
  einer: number
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const rodWidth = 8
  const rodHeight = 50
  const rodGap = 4
  const cubeSize = 8
  const cubeGap = 3

  const totalRodWidth = zehner * (rodWidth + rodGap)
  const einerCols = Math.ceil(einer / 5)
  const totalCubeWidth = einerCols * (cubeSize + cubeGap)
  const totalWidth = Math.max(90, totalRodWidth + 14 + totalCubeWidth + 10)
  const totalHeight = 56

  return (
    <svg
      width={totalWidth}
      height={totalHeight}
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      className="overflow-visible select-none inline-block"
    >
      {/* Zehnerstangen */}
      {Array.from({ length: zehner }).map((_, zIdx) => {
        const x = 4 + zIdx * (rodWidth + rodGap)
        const y = 3
        return (
          <g key={`rod-${zIdx}`}>
            <rect
              x={x}
              y={y}
              width={rodWidth}
              height={rodHeight}
              rx={1}
              fill={isBw ? '#e2e8f0' : '#bfdbfe'}
              stroke="#1e293b"
              strokeWidth="1.2"
            />
            {Array.from({ length: 9 }).map((_, divIdx) => {
              const divY = y + (divIdx + 1) * (rodHeight / 10)
              return (
                <line
                  key={`div-${divIdx}`}
                  x1={x}
                  y1={divY}
                  x2={x + rodWidth}
                  y2={divY}
                  stroke="#475569"
                  strokeWidth="0.8"
                />
              )
            })}
          </g>
        )
      })}

      {/* Trennung zwischen Z und E */}
      {zehner > 0 && einer > 0 && (
        <line
          x1={totalRodWidth + 8}
          y1={6}
          x2={totalRodWidth + 8}
          y2={50}
          stroke="#cbd5e1"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      )}

      {/* Einerwürfel */}
      {Array.from({ length: einer }).map((_, eIdx) => {
        const col = Math.floor(eIdx / 5)
        const row = eIdx % 5
        const x = totalRodWidth + 14 + col * (cubeSize + cubeGap)
        const y = 3 + row * (cubeSize + 2)
        return (
          <rect
            key={`cube-${eIdx}`}
            x={x}
            y={y}
            width={cubeSize}
            height={cubeSize}
            rx={1}
            fill={isBw ? '#f8fafc' : '#fef08a'}
            stroke="#1e293b"
            strokeWidth="1"
          />
        )
      })}
    </svg>
  )
}

export function parseDienesBlockItemData(item: unknown, index = 0): DienesBlockItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const num = Number(obj.number ?? 0)
  return {
    prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : letters[index] || `${index + 1})`,
    number: num,
    zehner: Number(obj.zehner ?? Math.floor(num / 10)),
    einer: Number(obj.einer ?? (num % 10)),
  }
}

export function DienesBlocksCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: DienesBlockItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, number, zehner, einer } = data

  const renderSlot = (val: number | string, minW = 'min-w-[32px]') => (
    <div
      className={`inline-flex px-1.5 h-7 rounded border-2 items-center justify-center font-bold text-xs font-mono align-middle ${minW} ${
        isSolution
          ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
          : 'border-slate-400 border-dashed bg-white text-transparent'
      }`}
    >
      {isSolution ? String(val) : ''}
    </div>
  )

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2 flex flex-col justify-between">
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">
          {prefix}
        </span>
        <span className="text-xs text-slate-600 font-medium">Bündeln (Zehner und Einer):</span>
      </div>

      <div className="flex justify-center py-2 bg-slate-50/70 rounded-lg border border-slate-100">
        <DienesBlocksSVG zehner={zehner} einer={einer} colorMode={colorMode} />
      </div>

      <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-slate-100 font-mono text-xs sm:text-sm">
        {renderSlot(zehner)}
        <span className="font-bold text-blue-800">Z</span>
        <span className="text-gray-400 font-bold">+</span>
        {renderSlot(einer)}
        <span className="font-bold text-amber-700">E</span>
        <span className="text-gray-400 font-bold">=</span>
        {renderSlot(number, 'min-w-[42px]')}
      </div>
    </div>
  )
}

// ── 8. NachbarzahlenK2Card (ZR 100 mit Nachbarzehnern) ────────────────
export function parseNachbarzahlenK2ItemData(item: unknown, index = 0): NachbarzahlenK2ItemData | null {
  if (!item) return null
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const defaultPrefix = letters[index] || `${index + 1})`

  let rawItem = item
  if (typeof rawItem === 'string') {
    try {
      rawItem = JSON.parse(rawItem)
    } catch {
      const match = (rawItem as string).match(/(\d+)/)
      if (match) {
        const num = parseInt(match[1], 10)
        const prevTen = Math.floor(num / 10) * 10
        return {
          prefix: defaultPrefix,
          num,
          prevTen,
          prev: num - 1,
          next: num + 1,
          nextTen: prevTen + 10,
        }
      }
      return null
    }
  }

  if (typeof rawItem !== 'object' || rawItem === null) return null
  const obj = rawItem as Record<string, unknown>
  const num = Number(obj.num ?? 0)
  const prevTen = Number(obj.prevTen ?? Math.floor(num / 10) * 10)
  return {
    prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
    num,
    prevTen,
    prev: Number(obj.prev ?? num - 1),
    next: Number(obj.next ?? num + 1),
    nextTen: Number(obj.nextTen ?? prevTen + 10),
  }
}

export function NachbarzahlenK2Card({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: NachbarzahlenK2ItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, num, prevTen, prev, next, nextTen } = data

  const renderSlot = (val: number | string, highlight = false) => (
    <div
      className={`w-10 sm:w-11 h-8 sm:h-8.5 rounded border-2 flex items-center justify-center font-bold text-xs sm:text-sm font-mono ${
        highlight
          ? 'border-blue-600 bg-blue-100/70 text-blue-900 shadow-2xs'
          : isSolution
          ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
          : 'border-slate-400 border-dashed bg-white text-transparent'
      }`}
    >
      {highlight || isSolution ? String(val) : ''}
    </div>
  )

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">
          {prefix}
        </span>
        <span className="text-xs text-slate-600 font-medium">Nachbarzehner, Vorgänger und Nachfolger:</span>
      </div>

      <div className="w-full py-1">
        <div className="grid grid-cols-5 gap-1 sm:gap-2 text-center items-end">
          {/* Spalte 1: Nachbarzehner */}
          <div className="flex flex-col items-center gap-1.5 min-w-0">
            <span className="text-[9.5px] sm:text-[11px] font-medium text-slate-600 leading-tight text-center break-words max-w-full">
              Nachbar<span className="hidden sm:inline">zehner</span>
              <span className="sm:hidden"><br />zehner</span>
            </span>
            {renderSlot(prevTen)}
          </div>

          {/* Spalte 2: Vorgänger */}
          <div className="flex flex-col items-center gap-1.5 min-w-0">
            <span className="text-[9.5px] sm:text-[11px] font-medium text-slate-600 leading-tight text-center truncate max-w-full">
              Vorgänger
            </span>
            {renderSlot(prev)}
          </div>

          {/* Spalte 3: Zahl */}
          <div className="flex flex-col items-center gap-1.5 min-w-0">
            <span className="text-[10px] sm:text-[11.5px] font-bold text-blue-700 leading-tight text-center truncate max-w-full">
              Zahl
            </span>
            {renderSlot(num, true)}
          </div>

          {/* Spalte 4: Nachfolger */}
          <div className="flex flex-col items-center gap-1.5 min-w-0">
            <span className="text-[9.5px] sm:text-[11px] font-medium text-slate-600 leading-tight text-center truncate max-w-full">
              Nachfolger
            </span>
            {renderSlot(next)}
          </div>

          {/* Spalte 5: Nachbarzehner */}
          <div className="flex flex-col items-center gap-1.5 min-w-0">
            <span className="text-[9.5px] sm:text-[11px] font-medium text-slate-600 leading-tight text-center break-words max-w-full">
              Nachbar<span className="hidden sm:inline">zehner</span>
              <span className="sm:hidden"><br />zehner</span>
            </span>
            {renderSlot(nextTen)}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 9. MultiplicationArrayCard (1x1 Punktefeld mit Plus- & Malaufgabe) ──
export function parseMultiplicationArrayItemData(item: unknown, index = 0): MultiplicationArrayItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)', 'c)', 'd)']
  const rows = Number(obj.rows ?? 3)
  const cols = Number(obj.cols ?? 4)
  const product = Number(obj.product ?? rows * cols)
  const plusTerms = Array.isArray(obj.plusTerms) ? (obj.plusTerms as number[]) : Array.from({ length: rows }, () => cols)
  return {
    prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : letters[index] || `${index + 1})`,
    rows,
    cols,
    product,
    plusTerms,
  }
}

export function MultiplicationArrayCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: MultiplicationArrayItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, rows, cols, product, plusTerms } = data

  const renderSlot = (val: number | string, minW = 'min-w-[32px]') => (
    <div
      className={`inline-flex px-1.5 h-7 rounded border-2 items-center justify-center font-bold text-xs font-mono align-middle ${minW} ${
        isSolution
          ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
          : 'border-slate-400 border-dashed bg-white text-transparent'
      }`}
    >
      {isSolution ? String(val) : ''}
    </div>
  )

  const dotSpacing = 16
  const svgWidth = cols * dotSpacing + 12
  const svgHeight = rows * dotSpacing + 12

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">
          {prefix}
        </span>
        <span className="text-xs text-slate-600 font-medium">
          Punktefeld: Plus- und Malaufgabe ({rows} Reihen mit {cols} Punkten)
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 py-1">
        {/* SVG Punktefeld */}
        <div className="p-2 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
          <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="overflow-visible select-none"
          >
            {Array.from({ length: rows }).map((_, rIdx) =>
              Array.from({ length: cols }).map((_, cIdx) => (
                <circle
                  key={`${rIdx}-${cIdx}`}
                  cx={10 + cIdx * dotSpacing}
                  cy={10 + rIdx * dotSpacing}
                  r={4.5}
                  fill={isBw ? '#000000' : '#2563eb'}
                />
              ))
            )}
          </svg>
        </div>

        {/* Plus- & Malaufgabe */}
        <div className="flex-1 space-y-2 font-mono text-xs sm:text-sm">
          {/* Plusaufgabe */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-sans text-xs text-slate-600 font-semibold w-20">Plusaufgabe:</span>
            {plusTerms.map((term, tIdx) => (
              <React.Fragment key={tIdx}>
                {tIdx > 0 && <span className="text-gray-400 font-bold">+</span>}
                {renderSlot(term, 'min-w-[28px]')}
              </React.Fragment>
            ))}
            <span className="text-gray-400 font-bold">=</span>
            {renderSlot(product, 'min-w-[36px]')}
          </div>

          {/* Malaufgabe */}
          <div className="flex items-center gap-1.5">
            <span className="font-sans text-xs text-slate-600 font-semibold w-20">Malaufgabe:</span>
            <span className="font-bold text-slate-800">{rows}</span>
            <span className="text-gray-600 font-bold">·</span>
            <span className="font-bold text-slate-800">{cols}</span>
            <span className="text-gray-400 font-bold">=</span>
            {renderSlot(product, 'min-w-[36px]')}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 10. DivisionCard (Geteilt-Aufgaben) ─────────────────────────────
export function parseDivisionItemData(item: unknown, index = 0): DivisionItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const dividend = Number(obj.dividend ?? 24)
  const divisor = Number(obj.divisor ?? 6)
  return {
    prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : letters[index] || `${index + 1})`,
    dividend,
    divisor,
    quotient: Number(obj.quotient ?? (dividend / divisor)),
  }
}

export function DivisionCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: DivisionItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, dividend, divisor, quotient } = data

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">
          {prefix}
        </span>
        <span className="text-xs text-slate-600 font-medium">Geteilt-Aufgabe:</span>
      </div>

      <div className="flex items-center justify-center gap-2 py-1 font-mono text-sm sm:text-base">
        <span className="font-bold text-slate-900">{dividend}</span>
        <span className="font-bold text-slate-700">:</span>
        <span className="font-bold text-slate-900">{divisor}</span>
        <span className="font-bold text-gray-400">=</span>
        <div
          className={`w-11 h-8 rounded border-2 flex items-center justify-center font-bold text-sm ${
            isSolution
              ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
              : 'border-slate-400 border-dashed bg-white text-transparent'
          }`}
        >
          {isSolution ? quotient : ''}
        </div>
      </div>
    </div>
  )
}

// ── 11. EinmaleinsUmkehrCard (1x1 Aufgabenfamilien) ──────────────────
export function parseEinmaleinsUmkehrItemData(item: unknown, index = 0): EinmaleinsUmkehrItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)', 'c)', 'd)']
  const a = Number(obj.a ?? 4)
  const b = Number(obj.b ?? 7)
  return {
    prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : letters[index] || `${index + 1})`,
    a,
    b,
    product: Number(obj.product ?? a * b),
  }
}

export function EinmaleinsUmkehrCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: EinmaleinsUmkehrItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, a, b, product } = data

  const renderSlot = (val: number | string, minW = 'min-w-[32px]') => (
    <div
      className={`inline-flex px-1.5 h-7 rounded border-2 items-center justify-center font-bold text-xs font-mono align-middle ${minW} ${
        isSolution
          ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
          : 'border-slate-400 border-dashed bg-white text-transparent'
      }`}
    >
      {isSolution ? String(val) : ''}
    </div>
  )

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">
          {prefix}
        </span>
        <span className="text-xs text-slate-600 font-medium">Aufgabenfamilie (1x1):</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-1">
        {/* Zahlendreieck */}
        <div className="relative w-28 h-24 flex items-center justify-center flex-shrink-0 select-none">
          <svg width="100" height="88" viewBox="0 0 100 88" className="overflow-visible">
            <polygon
              points="50,8 8,80 92,80"
              fill={isBw ? '#ffffff' : '#f1f5f9'}
              stroke="#334155"
              strokeWidth="1.8"
            />
            {/* Produkt oben */}
            <circle cx="50" cy="18" r="14" fill={isBw ? '#e2e8f0' : '#bfdbfe'} stroke="#1e293b" strokeWidth="1.4" />
            <text x="50" y="22" textAnchor="middle" fontSize="11" fontFamily="monospace" fontWeight="bold" fill="#0f172a">
              {product}
            </text>

            {/* a unten links */}
            <circle cx="22" cy="70" r="12" fill={isBw ? '#f8fafc' : '#fef08a'} stroke="#1e293b" strokeWidth="1.4" />
            <text x="22" y="74" textAnchor="middle" fontSize="11" fontFamily="monospace" fontWeight="bold" fill="#0f172a">
              {a}
            </text>

            {/* b unten rechts */}
            <circle cx="78" cy="70" r="12" fill={isBw ? '#f8fafc' : '#fef08a'} stroke="#1e293b" strokeWidth="1.4" />
            <text x="78" y="74" textAnchor="middle" fontSize="11" fontFamily="monospace" fontWeight="bold" fill="#0f172a">
              {b}
            </text>

            {/* Rechenzeichen */}
            <text x="50" y="75" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#64748b">·</text>
          </svg>
        </div>

        {/* 4 Aufgaben (2 Mal, 2 Geteilt) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 font-mono text-xs sm:text-sm text-slate-800 flex-1">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span>{a} · {b} =</span>
            {renderSlot(product)}
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span>{b} · {a} =</span>
            {renderSlot(product)}
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span>{product} : {b} =</span>
            {renderSlot(a)}
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span>{product} : {a} =</span>
            {renderSlot(b)}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 12. AchsensymmetrieCard (Spiegelbilder am 8x6 Gitter) ──────────────
export function parseAchsensymmetrieItemData(item: unknown, index = 0): AchsensymmetrieItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)', 'c)', 'd)']
  return {
    prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : letters[index] || `${index + 1})`,
    cols: Number(obj.cols ?? 8),
    rows: Number(obj.rows ?? 6),
    axisCol: Number(obj.axisCol ?? 4),
    leftPoints: Array.isArray(obj.leftPoints) ? (obj.leftPoints as { x: number; y: number }[]) : [],
    reflectedPoints: Array.isArray(obj.reflectedPoints) ? (obj.reflectedPoints as { x: number; y: number }[]) : [],
  }
}

export function AchsensymmetrieCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: AchsensymmetrieItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, cols, rows, axisCol, leftPoints, reflectedPoints } = data
  const cellSize = 18
  const width = cols * cellSize
  const height = rows * cellSize
  const axisX = axisCol * cellSize

  const leftPath = leftPoints.length > 0
    ? leftPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x * cellSize} ${p.y * cellSize}`).join(' ')
    : ''

  const reflectedPath = reflectedPoints.length > 0
    ? reflectedPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x * cellSize} ${p.y * cellSize}`).join(' ')
    : ''

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">
          {prefix}
        </span>
        <span className="text-xs text-slate-600 font-medium">
          Spiegle die Figur exakt an der roten Spiegelachse:
        </span>
      </div>

      <div className="flex justify-center py-1">
        <svg
          width={width + 10}
          height={height + 10}
          viewBox={`-5 -5 ${width + 10} ${height + 10}`}
          className="select-none overflow-visible"
        >
          {/* Karo-Gitterlinien */}
          {Array.from({ length: cols + 1 }).map((_, c) => (
            <line
              key={`c-${c}`}
              x1={c * cellSize}
              y1={0}
              x2={c * cellSize}
              y2={height}
              stroke="#e2e8f0"
              strokeWidth="0.8"
            />
          ))}
          {Array.from({ length: rows + 1 }).map((_, r) => (
            <line
              key={`r-${r}`}
              x1={0}
              y1={r * cellSize}
              x2={width}
              y2={r * cellSize}
              stroke="#e2e8f0"
              strokeWidth="0.8"
            />
          ))}

          {/* Vorgezeichnete linke Figur */}
          {leftPath && (
            <path
              d={leftPath}
              fill="none"
              stroke={isBw ? '#000000' : '#1e293b'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {leftPoints.map((p, idx) => (
            <circle
              key={`lp-${idx}`}
              cx={p.x * cellSize}
              cy={p.y * cellSize}
              r={3.2}
              fill={isBw ? '#000000' : '#2563eb'}
            />
          ))}

          {/* Rote Spiegelachse */}
          <line
            x1={axisX}
            y1={-3}
            x2={axisX}
            y2={height + 3}
            stroke={isBw ? '#000000' : '#dc2626'}
            strokeWidth="2.8"
            strokeDasharray="4,2"
          />

          {/* Gespiegelte rechte Figur (nur im Lösungsmodus) */}
          {isSolution && reflectedPath && (
            <path
              d={reflectedPath}
              fill="none"
              stroke={isBw ? '#000000' : '#16a34a'}
              strokeWidth="2.5"
              strokeDasharray="3,3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {isSolution &&
            reflectedPoints.map((p, idx) => (
              <circle
                key={`rp-${idx}`}
                cx={p.x * cellSize}
                cy={p.y * cellSize}
                r={3.2}
                fill={isBw ? '#000000' : '#16a34a'}
              />
            ))}
        </svg>
      </div>
    </div>
  )
}

// ── 13. KoerpernetzeCard (Körpernetze & Ansichten) ───────────────────
export function parseKoerpernetzItemData(item: unknown, index = 0): KoerpernetzItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)', 'c)', 'd)']
  return {
    prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : letters[index] || `${index + 1})`,
    shapeName: String(obj.shapeName || 'Würfel'),
    question: String(obj.question || ''),
    options: Array.isArray(obj.options) ? (obj.options as string[]) : [],
    solution: String(obj.solution || ''),
  }
}

export function KoerpernetzeCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: KoerpernetzItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, question, options, solution } = data

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">
          {prefix}
        </span>
        <span className="text-xs text-slate-800 font-medium">{question}</span>
      </div>

      <div className="pl-6 space-y-1.5 pt-1">
        {options.map((opt, oIdx) => {
          const isCorrect = opt === solution
          return (
            <div key={oIdx} className="flex items-center gap-2 text-xs text-slate-700">
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center font-bold text-[10px] ${
                  isSolution && isCorrect
                    ? isBw ? 'border-black bg-black text-white' : 'border-green-600 bg-green-600 text-white'
                    : 'border-slate-400 bg-white'
                }`}
              >
                {isSolution && isCorrect ? '✓' : ''}
              </div>
              <span className={isSolution && isCorrect ? 'font-bold text-green-800' : ''}>
                {opt}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── 14. LaengenUmrechnenCard (Längen m & cm) ─────────────────────────
export function parseLaengenUmrechnenItemData(item: unknown, index = 0): LaengenUmrechnenItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  return {
    prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : letters[index] || `${index + 1})`,
    taskType: (obj.taskType || 'm_to_cm') as any,
    givenText: String(obj.givenText || ''),
    solutionText: String(obj.solutionText || ''),
  }
}

export function LaengenUmrechnenCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: LaengenUmrechnenItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, givenText, solutionText } = data

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">
          {prefix}
        </span>
        <span className="text-xs text-slate-600 font-medium">Längen umrechnen (1 m = 100 cm):</span>
      </div>

      <div className="flex items-center justify-center py-1 font-mono text-sm sm:text-base">
        {isSolution ? (
          <span className={`font-bold ${isBw ? 'text-black' : 'text-blue-700'}`}>
            {solutionText}
          </span>
        ) : (
          <span className="font-bold text-slate-900">{givenText}</span>
        )}
      </div>
    </div>
  )
}

// ── 15. LaengenVergleichCard (< > =) ────────────────────────────────
export function parseLaengenVergleichItemData(item: unknown, index = 0): LaengenVergleichItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)', 'c)', 'd)']
  return {
    prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : letters[index] || `${index + 1})`,
    left: String(obj.left || ''),
    right: String(obj.right || ''),
    op: (obj.op || '=') as '<' | '>' | '=',
  }
}

export function LaengenVergleichCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: LaengenVergleichItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, left, right, op } = data

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2 font-mono text-xs sm:text-sm">
      <div className="flex items-center gap-2 font-sans text-xs text-slate-600">
        <span className="font-bold text-gray-500 font-mono text-sm min-w-[20px]">{prefix}</span>
        <span>Setze &lt;, &gt; oder = ein:</span>
      </div>

      <div className="flex items-center justify-center gap-3 py-1">
        <span className="font-bold text-slate-800">{left}</span>
        <div
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-base ${
            isSolution
              ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
              : 'border-slate-400 border-dashed bg-white text-transparent'
          }`}
        >
          {isSolution ? op : ''}
        </div>
        <span className="font-bold text-slate-800">{right}</span>
      </div>
    </div>
  )
}

// ── 16. GeldRueckgeldCard (Kassenbon & Rückgeld bis 100 €) ───────────
export function parseGeldRueckgeldItemData(item: unknown, index = 0): GeldRueckgeldItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)', 'c)', 'd)']
  const price = Number(obj.price ?? 34)
  const paidWith = Number(obj.paidWith ?? 50)
  return {
    prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : letters[index] || `${index + 1})`,
    itemDesc: String(obj.itemDesc || 'Artikel'),
    price,
    paidWith,
    change: Number(obj.change ?? (paidWith - price)),
  }
}

export function GeldRueckgeldCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: GeldRueckgeldItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, itemDesc, price, paidWith, change } = data

  const renderSlot = (val: number | string) => (
    <div
      className={`inline-flex px-2 h-7 rounded border-2 items-center justify-center font-bold text-xs font-mono align-middle min-w-[50px] ${
        isSolution
          ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
          : 'border-slate-400 border-dashed bg-white text-transparent'
      }`}
    >
      {isSolution ? `${val} €` : ''}
    </div>
  )

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">
          {prefix}
        </span>
        <span className="text-xs text-slate-600 font-medium">Kassenbon &amp; Rückgeld berechnen:</span>
      </div>

      <div className="grid grid-cols-4 gap-2 items-center py-1 text-center font-mono text-xs sm:text-sm border-t border-slate-100 pt-2">
        <div>
          <span className="block text-[10px] text-gray-400 font-sans">Artikel</span>
          <span className="font-bold text-slate-800">{itemDesc}</span>
        </div>
        <div>
          <span className="block text-[10px] text-gray-400 font-sans">Preis</span>
          <span className="font-bold text-slate-800">{price} €</span>
        </div>
        <div>
          <span className="block text-[10px] text-gray-400 font-sans">Bezahlt mit</span>
          <span className="font-bold text-slate-800">{paidWith} €-Schein</span>
        </div>
        <div>
          <span className="block text-[10px] text-gray-400 font-sans">Rückgeld</span>
          {renderSlot(change)}
        </div>
      </div>
    </div>
  )
}

// ── 17. AnalogClockGrade2SVG & AnalogClockGrade2Card ────────────────
export function AnalogClockGrade2SVG({
  hours12,
  minutes,
  colorMode = 'color',
  showHands = true,
  size = 110,
}: {
  hours12: number
  minutes: number
  colorMode?: 'color' | 'bw'
  showHands?: boolean
  size?: number
}) {
  const isBw = colorMode === 'bw'
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 6

  const minuteAngle = minutes * 6
  const hourAngle = (hours12 % 12 + minutes / 60) * 30

  const mRad = ((minuteAngle - 90) * Math.PI) / 180
  const hRad = ((hourAngle - 90) * Math.PI) / 180

  const minuteHandLen = r * 0.78
  const hourHandLen = r * 0.52

  const mx = cx + minuteHandLen * Math.cos(mRad)
  const my = cy + minuteHandLen * Math.sin(mRad)
  const hx = cx + hourHandLen * Math.cos(hRad)
  const hy = cy + hourHandLen * Math.sin(hRad)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="select-none overflow-visible">
      <circle cx={cx} cy={cy} r={r} fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />

      {Array.from({ length: 60 }).map((_, i) => {
        const isHour = i % 5 === 0
        const rad = ((i * 6 - 90) * Math.PI) / 180
        const tickLen = isHour ? 6 : 3
        const x1 = cx + (r - tickLen) * Math.cos(rad)
        const y1 = cy + (r - tickLen) * Math.sin(rad)
        const x2 = cx + (r - 1) * Math.cos(rad)
        const y2 = cy + (r - 1) * Math.sin(rad)
        return (
          <line
            key={`tick-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={isHour ? '#1e293b' : '#94a3b8'}
            strokeWidth={isHour ? 1.5 : 0.8}
          />
        )
      })}

      {Array.from({ length: 12 }).map((_, i) => {
        const h = i + 1
        const rad = ((h * 30 - 90) * Math.PI) / 180
        const textR = r - 13
        const tx = cx + textR * Math.cos(rad)
        const ty = cy + textR * Math.sin(rad) + 3.5
        return (
          <text
            key={`num-${h}`}
            x={tx}
            y={ty}
            textAnchor="middle"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
            fill="#0f172a"
          >
            {h}
          </text>
        )
      })}

      {showHands && (
        <>
          <line
            x1={cx}
            y1={cy}
            x2={hx}
            y2={hy}
            stroke={isBw ? '#000000' : '#dc2626'}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <line
            x1={cx}
            y1={cy}
            x2={mx}
            y2={my}
            stroke={isBw ? '#000000' : '#2563eb'}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </>
      )}

      <circle cx={cx} cy={cy} r={3} fill="#0f172a" />
    </svg>
  )
}

export function parseAnalogClockGrade2ItemData(item: unknown, index = 0): AnalogClockGrade2ItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)', 'c)', 'd)']
  return {
    prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : letters[index] || `${index + 1})`,
    hours12: Number(obj.hours12 ?? 8),
    minutes: Number(obj.minutes ?? 15),
    morningTime: String(obj.morningTime || '08:15 Uhr'),
    afternoonTime: String(obj.afternoonTime || '20:15 Uhr'),
    textDescription: String(obj.textDescription || 'Viertel nach 8'),
  }
}

export function AnalogClockGrade2Card({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: AnalogClockGrade2ItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, hours12, minutes, morningTime, afternoonTime } = data

  const renderSlot = (val: string, minW = 'min-w-[70px]') => (
    <div
      className={`inline-flex px-1.5 h-7 rounded border-2 items-center justify-center font-bold text-xs font-mono align-middle ${minW} ${
        isSolution
          ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
          : 'border-slate-400 border-dashed bg-white text-transparent'
      }`}
    >
      {isSolution ? val : ''}
    </div>
  )

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2 flex flex-col items-center">
      <div className="w-full flex items-center gap-2">
        <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">
          {prefix}
        </span>
        <span className="text-xs text-slate-600 font-medium">Uhrzeit ablesen (digital):</span>
      </div>

      <div className="py-1">
        <AnalogClockGrade2SVG hours12={hours12} minutes={minutes} colorMode={colorMode} showHands={true} size={105} />
      </div>

      <div className="w-full flex flex-wrap items-center justify-around gap-2 pt-1 border-t border-slate-100 font-mono text-xs sm:text-sm">
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-sans text-slate-600">Vormittag:</span>
          {renderSlot(morningTime)}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-sans text-slate-600">Nachmittag:</span>
          {renderSlot(afternoonTime)}
        </div>
      </div>
    </div>
  )
}

// ── 18. ZeigerEinzeichnenGrade2Card ────────────────────────────────
export function parseZeigerEinzeichnenGrade2ItemData(item: unknown, index = 0): ZeigerEinzeichnenGrade2ItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)', 'c)', 'd)']
  return {
    prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : letters[index] || `${index + 1})`,
    digitalTime: String(obj.digitalTime || '14:30 Uhr'),
    verbalTime: String(obj.verbalTime || 'halb 3'),
    hours12: Number(obj.hours12 ?? 2),
    minutes: Number(obj.minutes ?? 30),
  }
}

export function ZeigerEinzeichnenGrade2Card({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: ZeigerEinzeichnenGrade2ItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const { prefix, digitalTime, verbalTime, hours12, minutes } = data

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2 flex flex-col items-center">
      <div className="w-full flex items-center gap-2">
        <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">
          {prefix}
        </span>
        <span className="text-xs text-slate-600 font-medium">Zeichne die Zeiger ein:</span>
      </div>

      <div className="font-mono text-sm font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded">
        {digitalTime} <span className="font-sans text-xs text-slate-500 font-normal">({verbalTime})</span>
      </div>

      <div className="py-1">
        <AnalogClockGrade2SVG
          hours12={hours12}
          minutes={minutes}
          colorMode={colorMode}
          showHands={isSolution}
          size={105}
        />
      </div>
    </div>
  )
}

// ── 19. ZeitspannenGrade2Card ───────────────────────────────────────
export function parseZeitspannenGrade2ItemData(item: unknown, index = 0): ZeitspannenGrade2ItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)', 'c)', 'd)']
  return {
    prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : letters[index] || `${index + 1})`,
    startTime: String(obj.startTime || '14:15 Uhr'),
    endTime: String(obj.endTime || '15:00 Uhr'),
    durationMinutes: Number(obj.durationMinutes ?? 45),
  }
}

export function ZeitspannenGrade2Card({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: ZeitspannenGrade2ItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, startTime, endTime, durationMinutes } = data

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2 font-mono text-xs sm:text-sm">
      <div className="flex items-center gap-2 font-sans text-xs text-slate-600">
        <span className="font-bold text-gray-500 font-mono text-sm min-w-[20px]">{prefix}</span>
        <span>Wie viel Zeit vergeht?</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 py-1 pl-6">
        <span>Von <strong className="text-slate-900">{startTime}</strong> bis <strong className="text-slate-900">{endTime}</strong>:</span>
        <div
          className={`inline-flex px-2 h-7 rounded border-2 items-center justify-center font-bold text-xs ${
            isSolution
              ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
              : 'border-slate-400 border-dashed bg-white text-transparent'
          }`}
        >
          {isSolution ? `${durationMinutes} min` : ''}
        </div>
      </div>
    </div>
  )
}

// ── 20. BarChartKlasse2Card (Säulendiagramm) ─────────────────────────
export function parseDiagrammKlasse2ItemData(item: unknown): DiagrammKlasse2ItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  return {
    title: String(obj.title || 'Lieblingstiere der Klasse 2a'),
    categories: Array.isArray(obj.categories)
      ? (obj.categories as { label: string; count: number; color: string }[])
      : [],
    questions: Array.isArray(obj.questions)
      ? (obj.questions as { question: string; solution: string }[])
      : [],
  }
}

export function BarChartKlasse2Card({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: DiagrammKlasse2ItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { title, categories, questions } = data
  const chartHeight = 110
  const chartWidth = 220
  const maxVal = 10

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-3">
      <div className="font-bold text-xs text-slate-700 flex items-center justify-between">
        <span>Säulendiagramm: {title}</span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-around gap-4 py-1">
        {/* SVG Säulendiagramm */}
        <div className="p-2 border border-slate-200 rounded-lg bg-slate-50 flex-shrink-0">
          <svg
            width={chartWidth}
            height={chartHeight + 25}
            viewBox={`0 0 ${chartWidth} ${chartHeight + 25}`}
            className="overflow-visible select-none"
          >
            {[0, 2, 4, 6, 8, 10].map((v) => {
              const y = chartHeight - (v / maxVal) * chartHeight + 10
              return (
                <g key={`y-${v}`}>
                  <line x1={25} y1={y} x2={chartWidth - 10} y2={y} stroke="#e2e8f0" strokeWidth="0.8" />
                  <text x={20} y={y + 3} textAnchor="end" fontSize="8" fontFamily="monospace" fill="#64748b">
                    {v}
                  </text>
                </g>
              )
            })}

            {categories.map((cat, cIdx) => {
              const barWidth = 28
              const gap = 16
              const x = 32 + cIdx * (barWidth + gap)
              const bHeight = (cat.count / maxVal) * chartHeight
              const y = chartHeight - bHeight + 10
              return (
                <g key={`bar-${cIdx}`}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={bHeight}
                    rx={2}
                    fill={isBw ? '#94a3b8' : cat.color}
                    stroke="#1e293b"
                    strokeWidth="1.2"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight + 22}
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight="bold"
                    fill="#1e293b"
                  >
                    {cat.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Ablese-Fragen */}
        <div className="flex-1 space-y-2 text-xs">
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="space-y-1">
              <span className="text-slate-700 font-medium">{q.question}</span>
              <div
                className={`min-h-[26px] px-2 py-0.5 rounded border-2 flex items-center font-mono text-xs ${
                  isSolution
                    ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
                    : 'border-slate-400 border-dashed bg-white text-transparent'
                }`}
              >
                {isSolution ? q.solution : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 21. TabelleKlasse2Card & KombinatorikKlasse2Card ─────────────────
export function parseTabelleKlasse2ItemData(item: unknown, index = 0): TabelleKlasse2ItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)', 'c)', 'd)']
  return {
    prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : letters[index] || `${index + 1})`,
    fruit: String(obj.fruit || 'Obst'),
    count: Number(obj.count ?? 0),
  }
}

export function TabelleKlasse2Card({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: TabelleKlasse2ItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, fruit, count } = data

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-1.5 font-mono text-xs sm:text-sm">
      <div className="flex items-center gap-2 font-sans text-xs text-slate-600">
        <span className="font-bold text-gray-500 font-mono text-sm min-w-[20px]">{prefix}</span>
        <span>Wie viele Stück {fruit} sind es?</span>
      </div>
      <div className="flex items-center gap-2 pl-6">
        <span className="font-bold text-slate-800">{fruit}:</span>
        <div
          className={`inline-flex px-2 h-7 rounded border-2 items-center justify-center font-bold text-xs ${
            isSolution
              ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
              : 'border-slate-400 border-dashed bg-white text-transparent'
          }`}
        >
          {isSolution ? `${count} Stück` : ''}
        </div>
      </div>
    </div>
  )
}

export function parseKombinatorikKlasse2ItemData(item: unknown): KombinatorikKlasse2ItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  return {
    prefix: String(obj.prefix || 'a)'),
    problemText: String(obj.problemText || ''),
    itemsA: Array.isArray(obj.itemsA) ? (obj.itemsA as string[]) : [],
    itemsB: Array.isArray(obj.itemsB) ? (obj.itemsB as string[]) : [],
    solutionCount: Number(obj.solutionCount ?? 6),
  }
}

export function KombinatorikKlasse2Card({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: KombinatorikKlasse2ItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, problemText, itemsA, itemsB, solutionCount } = data

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-2xs print:border-gray-400 space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-500 font-mono text-sm select-none min-w-[20px]">{prefix}</span>
        <span className="text-xs text-slate-700 font-medium">{problemText}</span>
      </div>

      <div className="flex flex-wrap gap-4 py-1 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
        <div>
          <span className="font-bold block text-slate-800">Oberteile ({itemsA.length}):</span>
          {itemsA.join(', ')}
        </div>
        <div>
          <span className="font-bold block text-slate-800">Hosen ({itemsB.length}):</span>
          {itemsB.join(', ')}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 font-mono text-xs sm:text-sm">
        <span>Möglichkeiten:</span>
        <div
          className={`inline-flex px-2 h-7 rounded border-2 items-center justify-center font-bold text-xs ${
            isSolution
              ? isBw ? 'border-black text-black bg-white' : 'border-slate-600 text-blue-700 bg-blue-50/60'
              : 'border-slate-400 border-dashed bg-white text-transparent'
          }`}
        >
          {isSolution ? `${solutionCount} Möglichkeiten (${itemsA.length} · ${itemsB.length})` : ''}
        </div>
      </div>
    </div>
  )
}

// ── KLASSE 3 SPEZIAL-CARDS & DETERMINISTISCHE SVGS ──────────────────

// 1. KERN-FEATURE: WrittenCalcGridSVG (Karopapier-Raster für schriftliches Rechnen)
export function parseWrittenCalcGridItemData(item: unknown, index = 0): WrittenCalcGridItemData | null {
  if (!item) return null
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const defaultPrefix = letters[index] || `${index + 1})`
  if (typeof item === 'object') {
    const obj = item as Record<string, unknown>
    if (obj.num1 !== undefined && obj.num2 !== undefined) {
      return {
        prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
        operation: (obj.operation === '-' ? '-' : '+') as '+' | '-',
        isMoney: Boolean(obj.isMoney),
        unit: typeof obj.unit === 'string' ? obj.unit : undefined,
        num1: Number(obj.num1 || 0),
        num2: Number(obj.num2 || 0),
        result: Number(obj.result || 0),
        num1Str: String(obj.num1Str || obj.num1 || ''),
        num2Str: String(obj.num2Str || obj.num2 || ''),
        resultStr: String(obj.resultStr || obj.result || ''),
        carries: Array.isArray(obj.carries) ? obj.carries.map(Number) : [],
        missingMask: obj.missingMask as WrittenCalcGridItemData['missingMask'],
        ueberschlag: obj.ueberschlag as WrittenCalcGridItemData['ueberschlag'],
      }
    }
  }
  return null
}

export function WrittenCalcGridSVG({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: WrittenCalcGridItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const isMoney = Boolean(data.isMoney)

  // Standard (H, Z, E) vs Geld (Z, E, ',', z, e, '€')
  if (isMoney) {
    const cellW = 24
    const cellH = 26
    const carryH = 18
    const totalW = 7 * cellW
    const totalH = 20 + cellH + cellH + carryH + cellH

    // Nummern aufsplitten: e.g. "24,65" -> ['2', '4', ',', '6', '5']
    const parts1 = data.num1Str.split('')
    const parts2 = data.num2Str.split('')
    const partsRes = data.resultStr.split('')

    // 7 Spalten: [0: Op, 1: Zehner, 2: Einer, 3: Komma, 4: Zehntel, 5: Hundertstel, 6: Währung]
    const colLabels = ['', 'Z', 'E', ',', 'z', 'e', '€']

    const renderCell = (
      col: number,
      y: number,
      h: number,
      char: string,
      isMissing = false,
      isResult = false,
      isCarry = false
    ) => {
      const x = col * cellW
      const isKomma = col === 3
      const bgFill = isMissing
        ? isSolution
          ? isBw ? '#e2e8f0' : '#fef3c7'
          : isBw ? '#ffffff' : '#fffbeb'
        : isResult
        ? isSolution
          ? isBw ? '#f1f5f9' : '#ecfdf5'
          : '#ffffff'
        : '#ffffff'

      const stroke = isMissing && !isSolution
        ? isBw ? '#64748b' : '#f59e0b'
        : isResult && !isSolution
        ? '#94a3b8'
        : '#cbd5e1'

      const isDashed = (isResult && !isSolution) || (isMissing && !isSolution)

      let textColor = isBw ? '#000000' : '#1e293b'
      if (isCarry) textColor = isBw ? '#000000' : '#dc2626'
      if (isResult && isSolution) textColor = isBw ? '#000000' : '#047857'
      if (isMissing && isSolution) textColor = isBw ? '#000000' : '#d97706'

      return (
        <g key={`cell-${col}-${y}`}>
          <rect
            x={x}
            y={y}
            width={cellW}
            height={h}
            fill={bgFill}
            stroke={stroke}
            strokeWidth={isMissing && !isSolution ? 1.5 : 1}
            strokeDasharray={isDashed ? '3 2' : undefined}
          />
          {char ? (
            <text
              x={x + cellW / 2}
              y={y + h / 2 + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isCarry ? 11 : isKomma ? 16 : 14}
              fontWeight={isCarry ? 'bold' : isResult ? 'bold' : '600'}
              fill={textColor}
              fontFamily="monospace, Courier, monospace"
            >
              {char}
            </text>
          ) : isMissing && !isSolution ? (
            <text
              x={x + cellW / 2}
              y={y + h / 2 + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={12}
              fontWeight="bold"
              fill={isBw ? '#64748b' : '#d97706'}
            >
              ?
            </text>
          ) : null}
        </g>
      )
    }

    return (
      <svg width={totalW} height={totalH} viewBox={`0 0 ${totalW} ${totalH}`} className="block select-none">
        {/* Spaltenköpfe */}
        {colLabels.map((lbl, c) => (
          <g key={`head-${c}`}>
            <rect x={c * cellW} y={0} width={cellW} height={20} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
            <text
              x={c * cellW + cellW / 2}
              y={10}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
              fontWeight="bold"
              fill="#64748b"
            >
              {lbl}
            </text>
          </g>
        ))}

        {/* Zeile 1: Zahl 1 */}
        {renderCell(0, 20, cellH, '')}
        {parts1.map((ch, idx) => renderCell(idx + 1, 20, cellH, ch))}
        {renderCell(6, 20, cellH, '€')}

        {/* Zeile 2: Operator + Zahl 2 */}
        {renderCell(0, 20 + cellH, cellH, data.operation)}
        {parts2.map((ch, idx) => renderCell(idx + 1, 20 + cellH, cellH, ch))}
        {renderCell(6, 20 + cellH, cellH, '€')}

        {/* Zeile 3: Übertragszeile */}
        {renderCell(0, 20 + 2 * cellH, carryH, '')}
        {Array.from({ length: 6 }).map((_, c) => {
          const carryVal = data.carries && data.carries[c] ? String(data.carries[c]) : ''
          return renderCell(c + 1, 20 + 2 * cellH, carryH, isSolution ? carryVal : '', false, false, true)
        })}

        {/* Dicke Rechenlinie */}
        <line
          x1={0}
          y1={20 + 2 * cellH + carryH}
          x2={totalW}
          y2={20 + 2 * cellH + carryH}
          stroke="#1e293b"
          strokeWidth={2.5}
        />

        {/* Zeile 4: Ergebnis-Zeile */}
        {renderCell(0, 20 + 2 * cellH + carryH, cellH, '')}
        {partsRes.map((ch, idx) =>
          renderCell(idx + 1, 20 + 2 * cellH + carryH, cellH, isSolution ? ch : '', false, true)
        )}
        {renderCell(6, 20 + 2 * cellH + carryH, cellH, isSolution ? '€' : '', false, true)}
      </svg>
    )
  }

  // Standard Karopapier (4 Spalten: [Op] | H | Z | E)
  const cellW = 28
  const cellH = 28
  const carryH = 20
  const totalW = 4 * cellW
  const totalH = 20 + cellH + cellH + carryH + cellH

  const s1 = data.num1Str.padStart(3, ' ').split('')
  const s2 = data.num2Str.padStart(3, ' ').split('')
  const sRes = data.resultStr.padStart(3, ' ').split('')

  const colLabels = ['', 'H', 'Z', 'E']

  const isMasked = (row: 1 | 2 | 'res', colIdx: number) => {
    if (!data.missingMask) return false
    if (row === 1) return data.missingMask.num1Hidden?.includes(colIdx) ?? false
    if (row === 2) return data.missingMask.num2Hidden?.includes(colIdx) ?? false
    if (row === 'res') return data.missingMask.resultHidden?.includes(colIdx) ?? false
    return false
  }

  const renderCell = (
    col: number,
    y: number,
    h: number,
    char: string,
    isMissing = false,
    isResult = false,
    isCarry = false
  ) => {
    const x = col * cellW
    const bgFill = isMissing
      ? isSolution
        ? isBw ? '#e2e8f0' : '#fef3c7'
        : isBw ? '#ffffff' : '#fffbeb'
      : isResult
      ? isSolution
        ? isBw ? '#f1f5f9' : '#ecfdf5'
        : '#ffffff'
      : '#ffffff'

    const stroke = isMissing && !isSolution
      ? isBw ? '#64748b' : '#f59e0b'
      : isResult && !isSolution
      ? '#94a3b8'
      : '#cbd5e1'

    const isDashed = (isResult && !isSolution) || (isMissing && !isSolution)

    let textColor = isBw ? '#000000' : '#1e293b'
    if (isCarry) textColor = isBw ? '#000000' : '#dc2626'
    if (isResult && isSolution) textColor = isBw ? '#000000' : '#047857'
    if (isMissing && isSolution) textColor = isBw ? '#000000' : '#d97706'

    const displayChar = isMissing && !isSolution ? '' : char.trim()

    return (
      <g key={`cell-${col}-${y}`}>
        <rect
          x={x}
          y={y}
          width={cellW}
          height={h}
          fill={bgFill}
          stroke={stroke}
          strokeWidth={isMissing && !isSolution ? 1.5 : 1}
          strokeDasharray={isDashed ? '3 2' : undefined}
        />
        {displayChar ? (
          <text
            x={x + cellW / 2}
            y={y + h / 2 + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={isCarry ? 11 : 16}
            fontWeight={isCarry ? 'bold' : isResult ? 'bold' : '600'}
            fill={textColor}
            fontFamily="monospace, Courier, monospace"
          >
            {displayChar}
          </text>
        ) : isMissing && !isSolution ? (
          <text
            x={x + cellW / 2}
            y={y + h / 2 + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13}
            fontWeight="bold"
            fill={isBw ? '#64748b' : '#d97706'}
          >
            ?
          </text>
        ) : null}
      </g>
    )
  }

  // Überträge: [Zehnerübertrag, Einerübertrag] -> Spalte 1 (H), Spalte 2 (Z)
  const carryHVal = data.carries && data.carries[0] ? String(data.carries[0]) : ''
  const carryZVal = data.carries && data.carries[1] ? String(data.carries[1]) : ''

  return (
    <svg width={totalW} height={totalH} viewBox={`0 0 ${totalW} ${totalH}`} className="block select-none">
      {/* Spaltenköpfe H | Z | E */}
      {colLabels.map((lbl, c) => (
        <g key={`head-${c}`}>
          <rect x={c * cellW} y={0} width={cellW} height={20} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
          <text
            x={c * cellW + cellW / 2}
            y={10}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight="bold"
            fill="#64748b"
          >
            {lbl}
          </text>
        </g>
      ))}

      {/* Zeile 1: Zahl 1 */}
      {renderCell(0, 20, cellH, '')}
      {s1.map((d, idx) => renderCell(idx + 1, 20, cellH, d, isMasked(1, idx)))}

      {/* Zeile 2: Operator + Zahl 2 */}
      {renderCell(0, 20 + cellH, cellH, data.operation)}
      {s2.map((d, idx) => renderCell(idx + 1, 20 + cellH, cellH, d, isMasked(2, idx)))}

      {/* Zeile 3: Übertragszeile */}
      {renderCell(0, 20 + 2 * cellH, carryH, '')}
      {renderCell(1, 20 + 2 * cellH, carryH, isSolution ? carryHVal : '', false, false, true)}
      {renderCell(2, 20 + 2 * cellH, carryH, isSolution ? carryZVal : '', false, false, true)}
      {renderCell(3, 20 + 2 * cellH, carryH, '', false, false, true)}

      {/* Dicke horizontale Rechenlinie */}
      <line
        x1={0}
        y1={20 + 2 * cellH + carryH}
        x2={totalW}
        y2={20 + 2 * cellH + carryH}
        stroke="#1e293b"
        strokeWidth={2.5}
      />

      {/* Zeile 4: Ergebnis-Kästchen */}
      {renderCell(0, 20 + 2 * cellH + carryH, cellH, '')}
      {sRes.map((d, idx) =>
        renderCell(
          idx + 1,
          20 + 2 * cellH + carryH,
          cellH,
          isSolution ? d : '',
          isMasked('res', idx),
          true
        )
      )}
    </svg>
  )
}

export function WrittenCalcGridCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: WrittenCalcGridItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const hasUeberschlag = Boolean(data.ueberschlag)
  const isMissingDigits = Boolean(data.missingMask)

  return (
    <div
      className={`p-3 rounded-xl border ${
        isBw ? 'border-gray-400 bg-white' : 'border-slate-200 bg-slate-50/50'
      } shadow-2xs flex flex-col items-center justify-between min-h-[190px]`}
    >
      <div className="w-full flex items-center justify-between mb-2">
        <span className="font-bold text-xs text-gray-700">{data.prefix}</span>
        <span className="text-[11px] font-mono text-gray-400">
          {data.isMoney
            ? 'Geldbeträge schriftlich'
            : isMissingDigits
            ? 'Fehlende Ziffern'
            : data.operation === '+'
            ? 'Schriftliche Addition'
            : 'Schriftliche Subtraktion'}
        </span>
      </div>

      {/* Überschlagszeile (falls vorhanden) */}
      {hasUeberschlag && data.ueberschlag && (
        <div className="w-full mb-3 text-xs font-mono bg-white p-2 rounded border border-slate-200">
          <span className="font-bold text-slate-700 mr-2">Ü:</span>
          {isSolution ? (
            <span className="font-bold text-emerald-700">
              {data.ueberschlag.approx1} {data.operation} {data.ueberschlag.approx2} = {data.ueberschlag.approxResult}
            </span>
          ) : (
            <span className="text-gray-400">
              [ _______ ] {data.operation} [ _______ ] = [ _______ ]
            </span>
          )}
        </div>
      )}

      {/* Das Karopapier-Raster */}
      <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
        <WrittenCalcGridSVG data={data} isSolution={isSolution} colorMode={colorMode} />
      </div>
    </div>
  )
}

// 2. StellenwertHZE Card (H | Z | E & Zahlwörter)
export function parseStellenwertHZEItemData(item: unknown, index = 0): StellenwertHZEItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  return {
    prefix: typeof obj.prefix === 'string' ? obj.prefix : letters[index] || `${index + 1})`,
    num: Number(obj.num || 0),
    h: Number(obj.h || 0),
    z: Number(obj.z || 0),
    e: Number(obj.e || 0),
    zerlegung: String(obj.zerlegung || ''),
    zahlwort: String(obj.zahlwort || ''),
  }
}

export function StellenwertHZECard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: StellenwertHZEItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  return (
    <div className={`p-3 rounded-xl border ${isBw ? 'border-gray-400 bg-white' : 'border-slate-200 bg-slate-50/50'} shadow-2xs`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-xs text-gray-700">{data.prefix} Zahl: <span className="font-mono text-sm text-blue-700">{data.num}</span></span>
        <span className="text-[11px] font-mono text-gray-400">Stellenwerte (H-Z-E)</span>
      </div>

      <div className="w-full my-2">
        <table className="w-full text-center border-collapse border border-slate-300 text-xs font-mono">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold">
              <th className="border border-slate-300 p-1 w-1/3">Hunderter (H)</th>
              <th className="border border-slate-300 p-1 w-1/3">Zehner (Z)</th>
              <th className="border border-slate-300 p-1 w-1/3">Einer (E)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              <td className="border border-slate-300 p-2 font-bold text-sm">
                {isSolution ? data.h : <span className="text-gray-300 font-normal">[   ]</span>}
              </td>
              <td className="border border-slate-300 p-2 font-bold text-sm">
                {isSolution ? data.z : <span className="text-gray-300 font-normal">[   ]</span>}
              </td>
              <td className="border border-slate-300 p-2 font-bold text-sm">
                {isSolution ? data.e : <span className="text-gray-300 font-normal">[   ]</span>}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="space-y-1.5 mt-2 text-xs">
        <div className="p-1.5 bg-white rounded border border-slate-200 font-mono">
          <span className="text-gray-500 mr-2">Zerlegung:</span>
          {isSolution ? (
            <span className="font-bold text-emerald-700">{data.zerlegung}</span>
          ) : (
            <span className="text-gray-400">{data.num} = [ _____ ] + [ _____ ] + [ _____ ]</span>
          )}
        </div>
        <div className="p-1.5 bg-white rounded border border-slate-200">
          <span className="text-gray-500 mr-2 text-xs">Zahlwort:</span>
          {isSolution ? (
            <span className="font-semibold text-emerald-800">{data.zahlwort}</span>
          ) : (
            <span className="text-gray-300 italic">[ ___________________________________ ]</span>
          )}
        </div>
      </div>
    </div>
  )
}


// 3. DienesTausenderSVG & Card (Hunderterplatten, Zehnerstangen, Einerwürfel)
export function parseDienesTausenderItemData(item: unknown, index = 0): DienesTausenderItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const num = Number(obj.number || 0)
  return {
    prefix: typeof obj.prefix === 'string' ? obj.prefix : letters[index] || `${index + 1})`,
    number: num,
    platten: Number(obj.platten ?? (obj.h ?? Math.floor(num / 100))),
    stangen: Number(obj.stangen ?? (obj.z ?? Math.floor((num % 100) / 10))),
    wuerfel: Number(obj.wuerfel ?? (obj.e ?? (num % 10))),
  }
}

export function DienesTausenderSVG({
  platten,
  stangen,
  wuerfel,
  colorMode = 'color',
}: {
  platten: number
  stangen: number
  wuerfel: number
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const plateSize = 42
  const rodW = 6
  const rodH = 42
  const cubeSize = 6

  const platesW = platten * (plateSize + 4)
  const rodsW = stangen * (rodW + 3)
  const cubesW = Math.ceil(wuerfel / 3) * (cubeSize + 3)
  const totalW = Math.max(160, platesW + rodsW + cubesW + 24)
  const totalH = 50

  let curX = 4

  return (
    <svg width={totalW} height={totalH} viewBox={`0 0 ${totalW} ${totalH}`} className="block select-none">
      {/* Hunderterplatten (10x10) */}
      {Array.from({ length: platten }).map((_, pIdx) => {
        const x = curX
        curX += plateSize + 4
        return (
          <g key={`plate-${pIdx}`}>
            <rect
              x={x}
              y={4}
              width={plateSize}
              height={plateSize}
              fill={isBw ? '#ffffff' : '#dbeafe'}
              stroke={isBw ? '#000000' : '#2563eb'}
              strokeWidth={1.5}
            />
            {/* 10x10 Linien */}
            {Array.from({ length: 9 }).map((_, i) => (
              <g key={`pl-line-${i}`}>
                <line
                  x1={x + (i + 1) * (plateSize / 10)}
                  y1={4}
                  x2={x + (i + 1) * (plateSize / 10)}
                  y2={4 + plateSize}
                  stroke={isBw ? '#94a3b8' : '#93c5fd'}
                  strokeWidth={0.5}
                />
                <line
                  x1={x}
                  y1={4 + (i + 1) * (plateSize / 10)}
                  x2={x + plateSize}
                  y2={4 + (i + 1) * (plateSize / 10)}
                  stroke={isBw ? '#94a3b8' : '#93c5fd'}
                  strokeWidth={0.5}
                />
              </g>
            ))}
          </g>
        )
      })}

      {curX += 4}

      {/* Zehnerstangen */}
      {Array.from({ length: stangen }).map((_, rIdx) => {
        const x = curX
        curX += rodW + 3
        return (
          <g key={`rod-${rIdx}`}>
            <rect
              x={x}
              y={4}
              width={rodW}
              height={rodH}
              fill={isBw ? '#ffffff' : '#d1fae5'}
              stroke={isBw ? '#000000' : '#059669'}
              strokeWidth={1}
            />
            {Array.from({ length: 9 }).map((_, i) => (
              <line
                key={`rod-line-${i}`}
                x1={x}
                y1={4 + (i + 1) * (rodH / 10)}
                x2={x + rodW}
                y2={4 + (i + 1) * (rodH / 10)}
                stroke={isBw ? '#94a3b8' : '#6ee7b7'}
                strokeWidth={0.5}
              />
            ))}
          </g>
        )
      })}

      {curX += 4}

      {/* Einerwürfel */}
      {Array.from({ length: wuerfel }).map((_, cIdx) => {
        const col = Math.floor(cIdx / 5)
        const row = cIdx % 5
        const cx = curX + col * (cubeSize + 3)
        const cy = 4 + row * (cubeSize + 2.5)
        return (
          <rect
            key={`cube-${cIdx}`}
            x={cx}
            y={cy}
            width={cubeSize}
            height={cubeSize}
            fill={isBw ? '#ffffff' : '#fef3c7'}
            stroke={isBw ? '#000000' : '#d97706'}
            strokeWidth={1}
          />
        )
      })}
    </svg>
  )
}

export function DienesTausenderCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: DienesTausenderItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  return (
    <div className={`p-3 rounded-xl border ${isBw ? 'border-gray-400 bg-white' : 'border-slate-200 bg-slate-50/50'} shadow-2xs`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-xs text-gray-700">{data.prefix} Hunderterplatten, Zehnerstangen & Einer</span>
        <span className="text-[11px] font-mono text-gray-400">Dienes-Material</span>
      </div>

      <div className="p-2 bg-white rounded border border-slate-200 my-2 overflow-x-auto flex justify-center">
        <DienesTausenderSVG platten={data.platten} stangen={data.stangen} wuerfel={data.wuerfel} colorMode={colorMode} />
      </div>

      <div className="mt-2 text-xs font-mono p-2 bg-white rounded border border-slate-200 text-center">
        {isSolution ? (
          <span className="font-bold text-emerald-700">
            {data.platten} H + {data.stangen} Z + {data.wuerfel} E = {data.number}
          </span>
        ) : (
          <span className="text-gray-500">
            [ ___ ] H + [ ___ ] Z + [ ___ ] E = [ _____ ]
          </span>
        )}
      </div>
    </div>
  )
}

// 3b. NachbarzahlenK3Card (NH | NZ | V | Zahl | N | NZ | NH)
export function parseNachbarzahlenK3ItemData(item: unknown, index = 0): NachbarzahlenK3ItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const num = Number(obj.num || 0)
  return {
    prefix: typeof obj.prefix === 'string' ? obj.prefix : letters[index] || `${index + 1})`,
    num,
    nhLinks: Number(obj.nhLinks ?? Math.floor(num / 100) * 100),
    nzLinks: Number(obj.nzLinks ?? Math.floor(num / 10) * 10),
    vorgaenger: Number(obj.vorgaenger ?? num - 1),
    nachfolger: Number(obj.nachfolger ?? num + 1),
    nzRechts: Number(obj.nzRechts ?? (Math.floor(num / 10) * 10 + 10)),
    nhRechts: Number(obj.nhRechts ?? (Math.floor(num / 100) * 100 + 100)),
  }
}

export function NachbarzahlenK3Card({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: NachbarzahlenK3ItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  return (
    <div className={`p-3 rounded-xl border ${isBw ? 'border-gray-400 bg-white' : 'border-slate-200 bg-slate-50/50'} shadow-2xs`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-xs text-gray-700">{data.prefix} Nachbarzahlen zu {data.num}</span>
        <span className="text-[11px] font-mono text-gray-400">NH | NZ | V | Zahl | N | NZ | NH</span>
      </div>

      <div className="overflow-x-auto my-1">
        <table className="w-full text-center border-collapse border border-slate-300 text-xs font-mono">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold text-[10px]">
              <th className="border border-slate-300 p-1">NH</th>
              <th className="border border-slate-300 p-1">NZ</th>
              <th className="border border-slate-300 p-1">V</th>
              <th className="border border-slate-300 p-1 bg-blue-50 text-blue-800">Zahl</th>
              <th className="border border-slate-300 p-1">N</th>
              <th className="border border-slate-300 p-1">NZ</th>
              <th className="border border-slate-300 p-1">NH</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              <td className="border border-slate-300 p-1.5 font-bold">
                {isSolution ? <span className="text-emerald-700">{data.nhLinks}</span> : <span className="text-gray-300">[ ___ ]</span>}
              </td>
              <td className="border border-slate-300 p-1.5 font-bold">
                {isSolution ? <span className="text-emerald-700">{data.nzLinks}</span> : <span className="text-gray-300">[ ___ ]</span>}
              </td>
              <td className="border border-slate-300 p-1.5 font-bold">
                {isSolution ? <span className="text-emerald-700">{data.vorgaenger}</span> : <span className="text-gray-300">[ ___ ]</span>}
              </td>
              <td className="border border-slate-300 p-1.5 font-bold bg-blue-50/50 text-blue-700">
                {data.num}
              </td>
              <td className="border border-slate-300 p-1.5 font-bold">
                {isSolution ? <span className="text-emerald-700">{data.nachfolger}</span> : <span className="text-gray-300">[ ___ ]</span>}
              </td>
              <td className="border border-slate-300 p-1.5 font-bold">
                {isSolution ? <span className="text-emerald-700">{data.nzRechts}</span> : <span className="text-gray-300">[ ___ ]</span>}
              </td>
              <td className="border border-slate-300 p-1.5 font-bold">
                {isSolution ? <span className="text-emerald-700">{data.nhRechts}</span> : <span className="text-gray-300">[ ___ ]</span>}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// 4. Zahlenstrahl bis 1.000 Card & SVG
export function parseZahlenstrahl1000ItemData(item: unknown): Zahlenstrahl1000ItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  return {
    min: Number(obj.min ?? 0),
    max: Number(obj.max ?? 1000),
    stepMajor: Number(obj.stepMajor ?? 100),
    stepMedium: Number(obj.stepMedium ?? 50),
    stepMinor: Number(obj.stepMinor ?? 10),
    markers: Array.isArray(obj.markers)
      ? obj.markers.map((m: any) => ({
          id: (m.id || m.label || 'A') as 'A' | 'B' | 'C' | 'D',
          value: Number(m.value || 0),
        }))
      : [],
  }
}

export function Zahlenstrahl1000SVG({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: Zahlenstrahl1000ItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const svgW = 560
  const svgH = 85
  const lineStartX = 25
  const lineEndX = 535
  const lineY = 55
  const lineLen = lineEndX - lineStartX

  const getX = (val: number) => lineStartX + (val / 1000) * lineLen

  return (
    <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="block select-none max-w-full">
      {/* Hauptachse mit Pfeil */}
      <line x1={lineStartX} y1={lineY} x2={lineEndX + 10} y2={lineY} stroke="#1e293b" strokeWidth={2} />
      <polygon
        points={`${lineEndX + 10},${lineY - 4} ${lineEndX + 18},${lineY} ${lineEndX + 10},${lineY + 4}`}
        fill="#1e293b"
      />

      {/* 10er Ticks (klein) */}
      {Array.from({ length: 101 }).map((_, i) => {
        const val = i * 10
        const x = getX(val)
        const is100 = val % 100 === 0
        const is50 = val % 50 === 0 && !is100
        const tickH = is100 ? 12 : is50 ? 8 : 4
        return (
          <line
            key={`tick-${val}`}
            x1={x}
            y1={lineY - tickH}
            x2={x}
            y2={lineY + tickH}
            stroke="#475569"
            strokeWidth={is100 ? 1.5 : 0.75}
          />
        )
      })}

      {/* 100er Beschriftung */}
      {Array.from({ length: 11 }).map((_, i) => {
        const val = i * 100
        const x = getX(val)
        return (
          <text
            key={`lbl-${val}`}
            x={x}
            y={lineY + 20}
            textAnchor="middle"
            fontSize={10}
            fontFamily="monospace, Courier, monospace"
            fontWeight="bold"
            fill="#334155"
          >
            {val}
          </text>
        )
      })}

      {/* Markierungs-Pfeile / Schilder A, B, C, D */}
      {data.markers.map((m) => {
        const x = getX(m.value)
        return (
          <g key={`marker-${m.id}`}>
            <rect
              x={x - 12}
              y={lineY - 42}
              width={24}
              height={18}
              rx={3}
              fill={isBw ? '#ffffff' : '#3b82f6'}
              stroke={isBw ? '#000000' : '#1d4ed8'}
              strokeWidth={1.5}
            />
            <text
              x={x}
              y={lineY - 30}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fontWeight="bold"
              fill={isBw ? '#000000' : '#ffffff'}
            >
              {m.id}
            </text>
            <polygon
              points={`${x - 4},${lineY - 24} ${x + 4},${lineY - 24} ${x},${lineY - 14}`}
              fill={isBw ? '#000000' : '#1d4ed8'}
            />
          </g>
        )
      })}
    </svg>
  )
}

export function Zahlenstrahl1000Card({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: Zahlenstrahl1000ItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  return (
    <div className={`p-3 rounded-xl border ${isBw ? 'border-gray-400 bg-white' : 'border-slate-200 bg-slate-50/50'} shadow-2xs`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-xs text-gray-700">Zahlenstrahl von 0 bis 1.000</span>
        <span className="text-[11px] font-mono text-gray-400">Pfeile ablesen</span>
      </div>

      <div className="p-2 bg-white rounded border border-slate-200 my-2 overflow-x-auto flex justify-center">
        <Zahlenstrahl1000SVG data={data} isSolution={isSolution} colorMode={colorMode} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
        {data.markers.map((m) => (
          <div key={`ans-${m.id}`} className="p-2 bg-white rounded border border-slate-200 text-center font-mono text-xs">
            <span className="font-bold text-blue-700 mr-2">{m.id} =</span>
            {isSolution ? (
              <span className="font-bold text-emerald-700">{m.value}</span>
            ) : (
              <span className="text-gray-400">[ _____ ]</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// 5. Würfelnetze erkennen Card & SVG
export function parseWuerfelnetzItemData(item: unknown, index = 0): WuerfelnetzItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)', 'c)', 'd)']
  return {
    prefix: typeof obj.prefix === 'string' ? obj.prefix : letters[index] || `${index + 1})`,
    name: typeof obj.name === 'string' ? obj.name : `Netz ${index + 1}`,
    squares: Array.isArray(obj.squares)
      ? obj.squares.map((sq: any) => ({ c: Number(sq.c ?? sq.x ?? 0), r: Number(sq.r ?? sq.y ?? 0) }))
      : [],
    isValid: Boolean(obj.isValid ?? obj.isValidCube),
  }
}

export function WuerfelnetzeCard({
  items,
  isSolution = false,
  colorMode = 'color',
}: {
  items: WuerfelnetzItemData[]
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const sqSize = 16

  return (
    <div className={`p-3 rounded-xl border ${isBw ? 'border-gray-400 bg-white' : 'border-slate-200 bg-slate-50/50'} shadow-2xs`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-xs text-gray-700">Würfelnetze & Körpernetze</span>
        <span className="text-[11px] font-mono text-gray-400">Entsteht ein Würfel?</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2">
        {items.map((net, idx) => (
          <div key={idx} className="p-2 bg-white rounded border border-slate-200 flex flex-col items-center">
            <span className="font-bold text-xs text-blue-700 mb-1">{net.prefix}</span>

            <svg width={sqSize * 5 + 4} height={sqSize * 4 + 4} viewBox={`0 0 ${sqSize * 5 + 4} ${sqSize * 4 + 4}`} className="my-1">
              {net.squares.map((sq, sIdx) => (
                <rect
                  key={sIdx}
                  x={sq.c * sqSize + 2}
                  y={sq.r * sqSize + 2}
                  width={sqSize}
                  height={sqSize}
                  fill={isBw ? '#ffffff' : '#e0e7ff'}
                  stroke={isBw ? '#000000' : '#4338ca'}
                  strokeWidth={1.5}
                />
              ))}
            </svg>

            <div className="mt-2 text-[11px] flex items-center gap-2">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  readOnly
                  checked={isSolution && net.isValid}
                  className="rounded text-emerald-600"
                />
                <span className={isSolution && net.isValid ? 'font-bold text-emerald-700' : 'text-gray-600'}>
                  Ja
                </span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  readOnly
                  checked={isSolution && !net.isValid}
                  className="rounded text-red-600"
                />
                <span className={isSolution && !net.isValid ? 'font-bold text-red-700' : 'text-gray-600'}>
                  Nein
                </span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 6. Würfelgebäude & 3D-Bauplan Card & Isometric SVG
export function parseWuerfelgebaeudeItemData(item: unknown, index = 0): WuerfelgebaeudeItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)']
  return {
    prefix: typeof obj.prefix === 'string' ? obj.prefix : letters[index] || `${index + 1})`,
    totalCubes: Number(obj.totalCubes || 0),
    grid3x3: Array.isArray(obj.grid3x3)
      ? (obj.grid3x3 as number[][])
      : Array.isArray(obj.grid)
      ? (obj.grid as number[][])
      : [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  }
}

export function WuerfelgebaeudeSVG({
  grid,
  colorMode = 'color',
}: {
  grid: number[][]
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  // Isometrische Projektion für 3x3 Würfel
  const originX = 85
  const originY = 95
  const dx = 16
  const dy = 9
  const dz = 18

  // Zeichne jeden Würfel (x, y, z)
  const cubes: Array<{ x: number; y: number; z: number }> = []
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      const height = grid[y]?.[x] || 0
      for (let z = 0; z < height; z++) {
        cubes.push({ x, y, z })
      }
    }
  }

  // Sortiere für korrekte Verdeckung: erst y klein, dann x klein, dann z klein
  cubes.sort((a, b) => a.y - b.y || a.x - b.x || a.z - b.z)

  return (
    <svg width={170} height={140} viewBox="0 0 170 140" className="block select-none">
      {cubes.map((c, idx) => {
        const cx = originX + (c.x - c.y) * dx
        const cy = originY + (c.x + c.y) * dy - c.z * dz

        // Top face
        const topPts = `${cx},${cy - dz} ${cx + dx},${cy - dz + dy} ${cx},${cy - dz + 2 * dy} ${cx - dx},${cy - dz + dy}`
        // Left face
        const leftPts = `${cx - dx},${cy - dz + dy} ${cx},${cy - dz + 2 * dy} ${cx},${cy + 2 * dy} ${cx - dx},${cy + dy}`
        // Right face
        const rightPts = `${cx},${cy - dz + 2 * dy} ${cx + dx},${cy - dz + dy} ${cx + dx},${cy + dy} ${cx},${cy + 2 * dy}`

        return (
          <g key={`cube-iso-${idx}`}>
            <polygon
              points={topPts}
              fill={isBw ? '#f8fafc' : '#93c5fd'}
              stroke={isBw ? '#000000' : '#1e3a8a'}
              strokeWidth={1}
            />
            <polygon
              points={leftPts}
              fill={isBw ? '#e2e8f0' : '#60a5fa'}
              stroke={isBw ? '#000000' : '#1e3a8a'}
              strokeWidth={1}
            />
            <polygon
              points={rightPts}
              fill={isBw ? '#cbd5e1' : '#3b82f6'}
              stroke={isBw ? '#000000' : '#1e3a8a'}
              strokeWidth={1}
            />
          </g>
        )
      })}
    </svg>
  )
}

export function WuerfelgebaeudeCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: WuerfelgebaeudeItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  return (
    <div className={`p-3 rounded-xl border ${isBw ? 'border-gray-400 bg-white' : 'border-slate-200 bg-slate-50/50'} shadow-2xs`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-xs text-gray-700">{data.prefix} 3D-Würfelgebäude & Bauplan</span>
        <span className="text-[11px] font-mono text-gray-400">Stockwerke eintragen</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center my-2">
        {/* Isometrisches 3D Bild */}
        <div className="p-2 bg-white rounded border border-slate-200 flex justify-center">
          <WuerfelgebaeudeSVG grid={data.grid3x3} colorMode={colorMode} />
        </div>

        {/* 3x3 Grundriss Bauplan */}
        <div className="p-3 bg-white rounded border border-slate-200 flex flex-col items-center">
          <span className="text-xs font-bold text-slate-700 mb-2">Bauplan (3×3)</span>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded border border-slate-300">
            {data.grid3x3.map((row, r) =>
              row.map((val, c) => (
                <div
                  key={`cell-${r}-${c}`}
                  className="w-8 h-8 rounded border border-slate-300 bg-white flex items-center justify-center font-mono font-bold text-sm"
                >
                  {isSolution ? (
                    <span className={val > 0 ? 'text-blue-700' : 'text-gray-300'}>{val}</span>
                  ) : (
                    <span className="text-gray-200">.</span>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="mt-3 text-xs font-mono">
            <span>Gesamtwürfel: </span>
            {isSolution ? (
              <span className="font-bold text-emerald-700">{data.totalCubes} Würfel</span>
            ) : (
              <span className="text-gray-400">[ ___ ]</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 7. Waagen ablesen Card & ScaleSVG
export function parseWaageItemData(item: unknown, index = 0): WaageItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)', 'c)']
  const weights = Array.isArray(obj.weights) ? obj.weights.map(Number) : [500, 200, 50]
  const totalGrams = Number(obj.totalGrams ?? obj.totalWeight ?? weights.reduce((a, b) => a + b, 0))
  const ergaenzung1kg = Number(obj.ergaenzung1kg ?? obj.neededTo1kg ?? Math.max(0, 1000 - totalGrams))
  return {
    prefix: typeof obj.prefix === 'string' ? obj.prefix : letters[index] || `${index + 1})`,
    weights,
    totalGrams,
    ergaenzung1kg,
  }
}

export function ScaleSVG({
  weights,
  colorMode = 'color',
}: {
  weights: number[]
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const svgW = 180
  const svgH = 80

  return (
    <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="block select-none">
      {/* Waagenteller */}
      <polygon points="10,50 170,50 150,60 30,60" fill={isBw ? '#e2e8f0' : '#cbd5e1'} stroke="#475569" strokeWidth={1.5} />
      {/* Standfuß */}
      <polygon points="75,60 105,60 115,75 65,75" fill={isBw ? '#94a3b8' : '#64748b'} stroke="#334155" strokeWidth={1.5} />

      {/* Gewichtssteine auf dem Teller */}
      {weights.map((w, idx) => {
        const x = 20 + idx * 36
        const wHeight = w >= 500 ? 32 : w >= 200 ? 24 : 18
        const y = 50 - wHeight
        return (
          <g key={`wt-${idx}`}>
            {/* Knopf oben */}
            <circle cx={x + 15} cy={y - 3} r={3} fill={isBw ? '#94a3b8' : '#d97706'} stroke="#78350f" strokeWidth={0.75} />
            {/* Körper */}
            <rect
              x={x}
              y={y}
              width={30}
              height={wHeight}
              rx={2}
              fill={isBw ? '#f1f5f9' : '#fef3c7'}
              stroke={isBw ? '#000000' : '#b45309'}
              strokeWidth={1}
            />
            <text
              x={x + 15}
              y={y + wHeight / 2 + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={8.5}
              fontWeight="bold"
              fill={isBw ? '#000000' : '#78350f'}
            >
              {w}g
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function WaagenAblesenCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: WaageItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  return (
    <div className={`p-3 rounded-xl border ${isBw ? 'border-gray-400 bg-white' : 'border-slate-200 bg-slate-50/50'} shadow-2xs`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-xs text-gray-700">{data.prefix} Küchenwaage & Gewichtssteine</span>
        <span className="text-[11px] font-mono text-gray-400">Ergänzen auf 1 kg</span>
      </div>

      <div className="p-2 bg-white rounded border border-slate-200 flex justify-center my-2">
        <ScaleSVG weights={data.weights} colorMode={colorMode} />
      </div>

      <div className="space-y-1.5 mt-2 text-xs font-mono">
        <div className="p-1.5 bg-white rounded border border-slate-200">
          <span>Gesamtgewicht: </span>
          {isSolution ? (
            <span className="font-bold text-emerald-700">{data.totalGrams} g</span>
          ) : (
            <span className="text-gray-400">[ _____ ] g</span>
          )}
        </div>
        <div className="p-1.5 bg-white rounded border border-slate-200">
          <span>Es fehlen bis 1 kg (1.000 g): </span>
          {isSolution ? (
            <span className="font-bold text-emerald-700">{data.ergaenzung1kg} g</span>
          ) : (
            <span className="text-gray-400">[ _____ ] g</span>
          )}
        </div>
      </div>
    </div>
  )
}

// 8. Messbecher ablesen Card & MeasuringCupSVG
export function parseMessbecherItemData(item: unknown, index = 0): MessbecherItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)', 'c)']
  const fillMl = Number(obj.fillMl ?? obj.levelMl ?? 500)
  const totalCapacityMl = Number(obj.totalCapacityMl ?? 1000)
  const diffTo1Liter = Number(obj.diffTo1Liter ?? obj.neededTo1l ?? Math.max(0, 1000 - fillMl))
  return {
    prefix: typeof obj.prefix === 'string' ? obj.prefix : letters[index] || `${index + 1})`,
    fillMl,
    totalCapacityMl,
    diffTo1Liter,
  }
}

export function MeasuringCupSVG({
  levelMl,
  colorMode = 'color',
}: {
  levelMl: number
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const cupH = 100
  const maxMl = 1000
  const liquidH = (levelMl / maxMl) * (cupH - 20)

  return (
    <svg width={130} height={115} viewBox="0 0 130 115" className="block select-none">
      {/* Messbecher Glas-Körper */}
      <polygon
        points="30,10 90,10 82,105 38,105"
        fill="#f8fafc"
        stroke="#475569"
        strokeWidth={2}
      />

      {/* Griff rechts */}
      <path
        d="M 88,25 C 115,25 115,80 84,80"
        fill="none"
        stroke="#475569"
        strokeWidth={3}
      />

      {/* Blaues Wasser */}
      <polygon
        points={`38,${105 - liquidH} 82,${105 - liquidH} 82,105 38,105`}
        fill={isBw ? '#cbd5e1' : '#60a5fa'}
        opacity={0.7}
      />

      {/* Skala-Striche: 200, 400, 600, 800, 1000 ml */}
      {[200, 400, 600, 800, 1000].map((ml) => {
        const y = 105 - (ml / maxMl) * (cupH - 20)
        return (
          <g key={`mark-${ml}`}>
            <line x1={42} y1={y} x2={52} y2={y} stroke="#1e293b" strokeWidth={1.5} />
            <text x={38} y={y} textAnchor="end" dominantBaseline="central" fontSize={7.5} fontWeight="bold" fill="#334155">
              {ml === 1000 ? '1 l' : ml}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function MessbecherAblesenCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: MessbecherItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  return (
    <div className={`p-3 rounded-xl border ${isBw ? 'border-gray-400 bg-white' : 'border-slate-200 bg-slate-50/50'} shadow-2xs`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-xs text-gray-700">{data.prefix} Messbecher (ml & Liter)</span>
        <span className="text-[11px] font-mono text-gray-400">Wasserstand ablesen</span>
      </div>

      <div className="p-2 bg-white rounded border border-slate-200 flex justify-center my-2">
        <MeasuringCupSVG levelMl={data.fillMl} colorMode={colorMode} />
      </div>

      <div className="space-y-1.5 mt-2 text-xs font-mono">
        <div className="p-1.5 bg-white rounded border border-slate-200">
          <span>Flüssigkeitsstand: </span>
          {isSolution ? (
            <span className="font-bold text-emerald-700">{data.fillMl} ml</span>
          ) : (
            <span className="text-gray-400">[ _____ ] ml</span>
          )}
        </div>
        <div className="p-1.5 bg-white rounded border border-slate-200">
          <span>Bis 1 Liter (1.000 ml) fehlen: </span>
          {isSolution ? (
            <span className="font-bold text-emerald-700">{data.diffTo1Liter} ml</span>
          ) : (
            <span className="text-gray-400">[ _____ ] ml</span>
          )}
        </div>
      </div>
    </div>
  )
}

// 9. Wahrscheinlichkeit Card & UrneSVG
export function parseWahrscheinlichkeitItemData(item: unknown, index = 0): WahrscheinlichkeitItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)']
  return {
    prefix: typeof obj.prefix === 'string' ? obj.prefix : letters[index] || `${index + 1})`,
    redBalls: Number(obj.redBalls || 0),
    blueBalls: Number(obj.blueBalls || 0),
    yellowBalls: Number(obj.yellowBalls || 0),
    statements: Array.isArray(obj.statements)
      ? obj.statements.map((st: any) => ({
          text: String(st.text || ''),
          answer: st.answer as 'sicher' | 'möglich' | 'unmöglich',
        }))
      : [],
  }
}

export function UrneSVG({
  red,
  blue,
  yellow,
  colorMode = 'color',
}: {
  red: number
  blue: number
  yellow: number
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const balls: string[] = []
  for (let i = 0; i < red; i++) balls.push('red')
  for (let i = 0; i < blue; i++) balls.push('blue')
  for (let i = 0; i < yellow; i++) balls.push('yellow')

  return (
    <svg width={130} height={100} viewBox="0 0 130 100" className="block select-none">
      {/* Glasgefäß / Urne */}
      <path
        d="M 35,15 L 95,15 C 95,15 110,85 90,92 L 40,92 C 20,85 35,15 35,15 Z"
        fill="#f8fafc"
        stroke="#475569"
        strokeWidth={2}
      />
      {/* Rand oben */}
      <ellipse cx={65} cy={15} rx={30} ry={5} fill="#e2e8f0" stroke="#475569" strokeWidth={1.5} />

      {/* Kugeln im Gefäß */}
      {balls.map((b, idx) => {
        const col = idx % 4
        const row = Math.floor(idx / 4)
        const cx = 45 + col * 13 + (row % 2) * 6
        const cy = 78 - row * 13
        const fill =
          b === 'red'
            ? isBw ? '#475569' : '#ef4444'
            : b === 'blue'
            ? isBw ? '#94a3b8' : '#3b82f6'
            : isBw ? '#cbd5e1' : '#eab308'
        return (
          <circle
            key={idx}
            cx={cx}
            cy={cy}
            r={5.5}
            fill={fill}
            stroke="#1e293b"
            strokeWidth={1}
          />
        )
      })}
    </svg>
  )
}

export function WahrscheinlichkeitCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: WahrscheinlichkeitItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  return (
    <div className={`p-3 rounded-xl border ${isBw ? 'border-gray-400 bg-white' : 'border-slate-200 bg-slate-50/50'} shadow-2xs`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-xs text-gray-700">{data.prefix} Kugeln ziehen aus der Urne</span>
        <span className="text-[11px] font-mono text-gray-400">Wahrscheinlichkeit</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center my-2">
        <div className="p-2 bg-white rounded border border-slate-200 flex justify-center">
          <UrneSVG red={data.redBalls} blue={data.blueBalls} yellow={data.yellowBalls} colorMode={colorMode} />
        </div>

        <div className="sm:col-span-2 space-y-2">
          {data.statements.map((st, idx) => (
            <div key={idx} className="p-2 bg-white rounded border border-slate-200 text-xs">
              <div className="font-medium text-slate-800 mb-1.5">{st.text}</div>
              <div className="flex items-center gap-3 text-[11px]">
                {(['sicher', 'möglich', 'unmöglich'] as const).map((opt) => (
                  <label key={opt} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name={`st-${data.prefix}-${idx}`}
                      readOnly
                      checked={isSolution && st.answer === opt}
                      className="text-blue-600"
                    />
                    <span
                      className={
                        isSolution && st.answer === opt ? 'font-bold text-emerald-700' : 'text-gray-600'
                      }
                    >
                      {opt}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 10. HalbschriftlichK3Card (3 Schritte unter dem Strich)
export function parseHalbschriftlichK3ItemData(item: unknown, index = 0): HalbschriftlichK3ItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)', 'c)', 'd)']
  const n1 = Number(obj.n1 || 0)
  const n2 = Number(obj.n2 || 0)
  const op = (obj.op === '-' ? '-' : '+') as '+' | '-'
  const h2 = Number(obj.h2 ?? Math.floor(n2 / 100) * 100)
  const z2 = Number(obj.z2 ?? Math.floor((n2 % 100) / 10) * 10)
  const e2 = Number(obj.e2 ?? n2 % 10)
  const step1 = (obj.step1 as { term: string; res: number }) || { term: `${n1} ${op} ${h2}`, res: op === '+' ? n1 + h2 : n1 - h2 }
  const step2 = (obj.step2 as { term: string; res: number }) || { term: `${step1.res} ${op} ${z2}`, res: op === '+' ? step1.res + z2 : step1.res - z2 }
  const step3 = (obj.step3 as { term: string; res: number }) || { term: `${step2.res} ${op} ${e2}`, res: op === '+' ? step2.res + e2 : step2.res - e2 }
  const result = Number(obj.result || step3.res)

  return {
    prefix: typeof obj.prefix === 'string' ? obj.prefix : letters[index] || `${index + 1})`,
    op,
    n1,
    n2,
    h2,
    z2,
    e2,
    step1,
    step2,
    step3,
    result,
  }
}

export function HalbschriftlichK3Card({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: HalbschriftlichK3ItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  return (
    <div className={`p-3 rounded-xl border ${isBw ? 'border-gray-400 bg-white' : 'border-slate-200 bg-slate-50/50'} shadow-2xs`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-xs text-gray-700">{data.prefix} {data.n1} {data.op} {data.n2}</span>
        <span className="text-[11px] font-mono text-gray-400">Halbschriftlich in 3 Schritten</span>
      </div>

      <div className="p-3 bg-white rounded border border-slate-300 font-mono text-xs space-y-1">
        <div className="font-bold text-slate-800 tracking-wider">
          {data.n1} {data.op} {data.n2}
        </div>
        <hr className="border-slate-800 border-t-2 my-1" />
        {isSolution ? (
          <div className="space-y-1 text-emerald-800 font-semibold">
            <div>{data.step1.term} = {data.step1.res}</div>
            <div>{data.step2.term} = {data.step2.res}</div>
            <div>{data.step3.term} = {data.step3.res}</div>
          </div>
        ) : (
          <div className="space-y-2 text-gray-500 py-1">
            <div className="border-b border-dashed border-gray-300 pb-0.5">{data.n1} {data.op} {data.h2} = [ _____ ]</div>
            <div className="border-b border-dashed border-gray-300 pb-0.5">[ ___ ] {data.op} {data.z2} = [ _____ ]</div>
            <div className="border-b border-dashed border-gray-300 pb-0.5">[ ___ ] {data.op} {data.e2} = [ _____ ]</div>
          </div>
        )}
        <hr className="border-slate-800 border-t my-1" />
        <div className="font-bold text-slate-900 pt-0.5">
          = {isSolution ? <span className="text-emerald-700 font-bold">{data.result}</span> : <span className="text-gray-400">[ _____ ]</span>}
        </div>
      </div>
    </div>
  )
}

// 10b. HalbschriftlichMultCard (in Schritten multiplizieren)
export function parseHalbschriftlichMultItemData(item: unknown, index = 0): HalbschriftlichMultItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)', 'c)', 'd)']
  return {
    prefix: typeof obj.prefix === 'string' ? obj.prefix : letters[index] || `${index + 1})`,
    factor1: Number(obj.factor1 || 0),
    factor2: Number(obj.factor2 || 0),
    z2: Number(obj.z2 || 0),
    e2: Number(obj.e2 || 0),
    step1: (obj.step1 as { term: string; res: number }) || { term: '', res: 0 },
    step2: (obj.step2 as { term: string; res: number }) || { term: '', res: 0 },
    result: Number(obj.result || 0),
  }
}

export function HalbschriftlichMultCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: HalbschriftlichMultItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  return (
    <div className={`p-3 rounded-xl border ${isBw ? 'border-gray-400 bg-white' : 'border-slate-200 bg-slate-50/50'} shadow-2xs`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-xs text-gray-700">{data.prefix} {data.factor1} · {data.factor2}</span>
        <span className="text-[11px] font-mono text-gray-400">Halbschriftlich multiplizieren</span>
      </div>

      <div className="p-3 bg-white rounded border border-slate-300 font-mono text-xs space-y-1">
        <div className="font-bold text-slate-800 tracking-wider">
          {data.factor1} · {data.factor2}
        </div>
        <hr className="border-slate-800 border-t-2 my-1" />
        {isSolution ? (
          <div className="space-y-1 text-emerald-800 font-semibold">
            <div>{data.step1.term} = {data.step1.res}</div>
            <div>{data.step2.term} = {data.step2.res}</div>
          </div>
        ) : (
          <div className="space-y-2 text-gray-500 py-1">
            <div className="border-b border-dashed border-gray-300 pb-0.5">{data.factor1} · {data.z2} = [ _____ ]</div>
            <div className="border-b border-dashed border-gray-300 pb-0.5">{data.factor1} · {data.e2} = [ _____ ]</div>
          </div>
        )}
        <hr className="border-slate-800 border-t my-1" />
        <div className="font-bold text-slate-900 pt-0.5">
          = {isSolution ? <span className="text-emerald-700 font-bold">{data.result}</span> : <span className="text-gray-400">[ _____ ]</span>}
        </div>
      </div>
    </div>
  )
}

// 10c. RechteWinkelParallelenCard
export function parseRechtWinkelItemData(item: unknown, index = 0): RechtWinkelItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)', 'c)', 'd)']
  return {
    prefix: typeof obj.prefix === 'string' ? obj.prefix : letters[index] || `${index + 1})`,
    type: (obj.type || 'parallel') as 'parallel' | 'senkrecht' | 'schief',
    label: String(obj.label || `Paar ${index + 1}`),
  }
}

export function RechteWinkelParallelenCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: RechtWinkelItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  return (
    <div className={`p-3 rounded-xl border ${isBw ? 'border-gray-400 bg-white' : 'border-slate-200 bg-slate-50/50'} shadow-2xs`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-xs text-gray-700">{data.prefix} {data.label}</span>
        <span className="text-[11px] font-mono text-gray-400">parallel (||) oder senkrecht (⊥)?</span>
      </div>

      <div className="p-2 bg-white rounded border border-slate-200 flex justify-center my-2">
        <svg width={140} height={70} viewBox="0 0 140 70" className="block select-none">
          {data.type === 'parallel' ? (
            <g>
              <line x1={20} y1={25} x2={120} y2={25} stroke="#1e293b" strokeWidth={2} />
              <line x1={20} y1={45} x2={120} y2={45} stroke="#1e293b" strokeWidth={2} />
            </g>
          ) : (
            <g>
              <line x1={20} y1={50} x2={120} y2={50} stroke="#1e293b" strokeWidth={2} />
              <line x1={70} y1={10} x2={70} y2={60} stroke="#1e293b" strokeWidth={2} />
              {/* Rechter Winkel Bogen/Punkt */}
              <path d="M 70,40 L 80,40 L 80,50" fill="none" stroke="#64748b" strokeWidth={1} />
              <circle cx={75} cy={45} r={1.5} fill="#64748b" />
            </g>
          )}
        </svg>
      </div>

      <div className="p-2 bg-white rounded border border-slate-200 text-xs font-mono text-center">
        {isSolution ? (
          <span className="font-bold text-emerald-700">
            {data.type === 'parallel' ? 'parallel ( || )' : 'senkrecht / rechter Winkel ( ⊥ )'}
          </span>
        ) : (
          <span className="text-gray-400">[  ||  ]  oder  [  ⊥  ]</span>
        )}
      </div>
    </div>
  )
}

// 11. FahrplanCard (Zeitpunkt & Fahrtdauer)
export function parseFahrplanItemData(item: unknown, index = 0): FahrplanItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  const letters = ['a)', 'b)', 'c)', 'd)']
  return {
    prefix: typeof obj.prefix === 'string' ? obj.prefix : letters[index] || `${index + 1})`,
    abfahrt: String(obj.abfahrt || '12:00 Uhr'),
    dauerMin: Number(obj.dauerMin || 30),
    ankunft: String(obj.ankunft || '12:30 Uhr'),
  }
}

export function FahrplanCard({
  items,
  isSolution = false,
  colorMode = 'color',
}: {
  items: FahrplanItemData[]
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  return (
    <div className={`p-3 rounded-xl border ${isBw ? 'border-gray-400 bg-white' : 'border-slate-200 bg-slate-50/50'} shadow-2xs`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-xs text-gray-700">Fahrplantabelle: Abfahrt, Fahrtdauer & Ankunft</span>
        <span className="text-[11px] font-mono text-gray-400">Zeitspannen berechnen</span>
      </div>

      <div className="overflow-x-auto my-2">
        <table className="w-full text-center border-collapse border border-slate-300 text-xs font-mono">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold">
              <th className="border border-slate-300 p-1.5">Aufgabe</th>
              <th className="border border-slate-300 p-1.5">Abfahrt</th>
              <th className="border border-slate-300 p-1.5">Fahrtdauer</th>
              <th className="border border-slate-300 p-1.5">Ankunft</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr key={idx} className="bg-white">
                <td className="border border-slate-300 p-2 font-bold text-blue-700">{row.prefix}</td>
                <td className="border border-slate-300 p-2">{row.abfahrt}</td>
                <td className="border border-slate-300 p-2 font-medium">{row.dauerMin} min</td>
                <td className="border border-slate-300 p-2 font-bold">
                  {isSolution ? (
                    <span className="text-emerald-700">{row.ankunft}</span>
                  ) : (
                    <span className="text-gray-400">[ __________ ]</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── KLASSE 3 & 4 CARDS & PARSER ──────────────────────────────────
export function parseSchriftlichItemData(item: unknown, index = 0): SchriftlichItemData | null {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const defaultPrefix = letters[index] || `${index + 1})`
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  return {
    prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
    operation: (obj.operation || '+') as '+' | '-' | '*' | ':',
    num1: Number(obj.num1 || 0),
    num2: Number(obj.num2 || 0),
    result: Number(obj.result || 0),
    rest: obj.rest !== undefined ? Number(obj.rest) : undefined,
    carryDigits: Array.isArray(obj.carryDigits) ? obj.carryDigits.map(Number) : undefined,
  }
}

export function SchriftlichCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: SchriftlichItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, operation, num1, num2, result, rest } = data

  if (operation === '+' || operation === '-') {
    const s1 = String(num1)
    const s2 = String(num2)
    const sRes = String(result)
    const maxLen = Math.max(s1.length, s2.length, sRes.length)

    const pad1 = s1.padStart(maxLen, ' ').split('')
    const pad2 = s2.padStart(maxLen, ' ').split('')
    const padRes = sRes.padStart(maxLen, ' ').split('')

    return (
      <div className={`p-3 rounded-xl border ${isBw ? 'border-gray-400 bg-white' : 'border-slate-200 bg-slate-50/50'} shadow-2xs`}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-xs text-gray-700">{prefix}</span>
          <span className="text-[11px] font-mono text-gray-400">
            {operation === '+' ? 'Schriftliche Addition' : 'Schriftliche Subtraktion'}
          </span>
        </div>
        <div className="flex justify-center">
          <div className="font-mono text-lg tracking-widest inline-block select-none">
            {/* Erste Zahl */}
            <div className="flex justify-end gap-1 font-bold text-gray-800">
              <span className="w-5 text-center text-transparent"> </span>
              {pad1.map((d, idx) => (
                <span key={idx} className="w-6 text-center">{d}</span>
              ))}
            </div>
            {/* Zweite Zahl mit Operator */}
            <div className="flex justify-end gap-1 font-bold text-gray-800">
              <span className="w-5 text-center text-blue-600">{operation}</span>
              {pad2.map((d, idx) => (
                <span key={idx} className="w-6 text-center">{d}</span>
              ))}
            </div>
            {/* Übertrags-Linie */}
            <div className="flex justify-end gap-1 text-xs text-gray-400 py-0.5 border-t border-b border-gray-800 my-0.5">
              <span className="w-5 text-center text-transparent"> </span>
              {padRes.map((_, idx) => (
                <span key={idx} className="w-6 text-center text-[10px]"> </span>
              ))}
            </div>
            {/* Ergebnis-Zeile */}
            <div className="flex justify-end gap-1 font-bold mt-0.5">
              <span className="w-5 text-center text-transparent"> </span>
              {padRes.map((d, idx) => (
                <span
                  key={idx}
                  className={`w-6 h-7 flex items-center justify-center rounded border ${
                    isSolution
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                      : 'border-dashed border-gray-400 bg-white text-transparent'
                  }`}
                >
                  {isSolution ? d : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Multiplikation / Division
  return (
    <div className={`p-3 rounded-xl border ${isBw ? 'border-gray-400 bg-white' : 'border-slate-200 bg-slate-50/50'} shadow-2xs`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-xs text-gray-700">{prefix}</span>
        <span className="text-[11px] font-mono text-gray-400">
          {operation === '*' ? 'Schriftliche Multiplikation' : 'Schriftliche Division'}
        </span>
      </div>
      <div className="font-mono text-base text-gray-800 my-1">
        {operation === '*' ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold">{num1} · {num2}</span>
              <span>=</span>
              {isSolution ? (
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                  {result}
                </span>
              ) : (
                <span className="w-24 h-7 border-2 border-dashed border-gray-400 rounded inline-block" />
              )}
            </div>
            <div className="w-full h-12 border border-gray-200 rounded bg-white p-1 text-xs text-gray-300">
              <div className="grid grid-cols-8 gap-0.5 h-full opacity-40">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="border border-gray-300" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold">{num1} : {num2}</span>
              <span>=</span>
              {isSolution ? (
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                  {result} {rest && rest > 0 ? `Rest ${rest}` : ''}
                </span>
              ) : (
                <span className="w-28 h-7 border-2 border-dashed border-gray-400 rounded inline-block" />
              )}
            </div>
            <div className="w-full h-16 border border-gray-200 rounded bg-white p-1 text-xs text-gray-300">
              <div className="grid grid-cols-8 gap-0.5 h-full opacity-40">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="border border-gray-300" />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function parseRundenItemData(item: unknown, index = 0): RundenItemData | null {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const defaultPrefix = letters[index] || `${index + 1})`
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  return {
    prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
    number: Number(obj.number || 0),
    roundTo: (obj.roundTo || 'H') as 'Z' | 'H' | 'T' | 'ZT' | 'HT',
    roundToLabel: String(obj.roundToLabel || 'Hunderter (H)'),
    solution: Number(obj.solution || 0),
    ruleText: String(obj.ruleText || 'aufrunden'),
  }
}

export function RundenCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: RundenItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, number, roundToLabel, solution, ruleText } = data

  return (
    <div className={`p-3 rounded-xl border ${isBw ? 'border-gray-400 bg-white' : 'border-indigo-100 bg-indigo-50/30'} shadow-2xs`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-bold text-xs text-gray-700">{prefix}</span>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${isBw ? 'bg-gray-100 text-gray-800' : 'bg-indigo-100 text-indigo-700'}`}>
          Runde auf {roundToLabel}
        </span>
      </div>
      <div className="flex items-center gap-3 font-mono text-base my-2 flex-wrap">
        <span className="font-bold text-gray-900">{number.toLocaleString('de-DE')}</span>
        <span className="text-gray-500 font-bold">≈</span>
        {isSolution ? (
          <span className="font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-md border border-emerald-300">
            {solution.toLocaleString('de-DE')}
            <span className="text-xs font-normal text-emerald-700 ml-1.5">({ruleText})</span>
          </span>
        ) : (
          <span className="w-32 h-8 border-2 border-dashed border-gray-400 rounded-md bg-white inline-block" />
        )}
      </div>
    </div>
  )
}

export function parseFlaecheUmfangItemData(item: unknown, index = 0): FlaecheUmfangItemData | null {
  const letters = ['a)', 'b)', 'c)', 'd)']
  const defaultPrefix = letters[index] || `${index + 1})`
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  return {
    prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
    shape: (obj.shape || 'Rechteck') as 'Rechteck' | 'Quadrat',
    a: Number(obj.a || 6),
    b: Number(obj.b || 4),
    unit: (obj.unit || 'cm') as 'cm' | 'm',
    umfang: Number(obj.umfang || 20),
    flaeche: Number(obj.flaeche || 24),
  }
}

export function FlaecheUmfangCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: FlaecheUmfangItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prefix, shape, a, b, unit, umfang, flaeche } = data

  const svgW = 120
  const svgH = 80
  const rectW = Math.min(100, Math.max(40, a * 12))
  const rectH = Math.min(65, Math.max(30, b * 12))

  return (
    <div className={`p-3 rounded-xl border ${isBw ? 'border-gray-400 bg-white' : 'border-teal-100 bg-teal-50/20'} shadow-2xs`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-xs text-gray-700">{prefix} {shape}</span>
        <span className="text-[11px] text-gray-500 font-mono">
          a = {a} {unit}, b = {b} {unit}
        </span>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <svg width={svgW} height={svgH} className="select-none flex-shrink-0">
          <rect
            x={(svgW - rectW) / 2}
            y={(svgH - rectH) / 2}
            width={rectW}
            height={rectH}
            fill={isBw ? '#ffffff' : '#ccfbf1'}
            stroke={isBw ? '#000000' : '#0f766e'}
            strokeWidth="1.8"
            rx="2"
          />
          <text
            x={svgW / 2}
            y={(svgH - rectH) / 2 - 4}
            textAnchor="middle"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
            fill="#134e4a"
          >
            a = {a} {unit}
          </text>
          <text
            x={(svgW + rectW) / 2 + 14}
            y={svgH / 2 + 3}
            textAnchor="middle"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
            fill="#134e4a"
          >
            b = {b} {unit}
          </text>
        </svg>

        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">Umfang u:</span>
            {isSolution ? (
              <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                {umfang} {unit}
              </span>
            ) : (
              <span className="w-20 h-6 border-2 border-dashed border-gray-400 rounded bg-white inline-block" />
            )}
            <span className="text-gray-400 text-[10px]">(2·a + 2·b)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">Fläche A:</span>
            {isSolution ? (
              <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                {flaeche} {unit}²
              </span>
            ) : (
              <span className="w-20 h-6 border-2 border-dashed border-gray-400 rounded bg-white inline-block" />
            )}
            <span className="text-gray-400 text-[10px]">(a · b)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function parseGewichteHohlmasseItemData(item: unknown, index = 0): GewichteHohlmasseItemData | null {
  const letters = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)']
  const defaultPrefix = letters[index] || `${index + 1})`
  if (!item) return null
  if (typeof item === 'string') {
    return {
      prefix: defaultPrefix,
      category: item.includes('l') || item.includes('ml') ? 'hohlmass' : 'gewicht',
      prompt: item,
      solution: item,
    }
  }
  const obj = item as Record<string, unknown>
  return {
    prefix: typeof obj.prefix === 'string' && obj.prefix.trim() ? obj.prefix.trim() : defaultPrefix,
    category: (obj.category || 'gewicht') as 'gewicht' | 'hohlmass',
    prompt: String(obj.prompt || ''),
    solution: String(obj.solution || ''),
  }
}

export function GewichteHohlmasseCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: GewichteHohlmasseItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { prompt, solution, category } = data

  return (
    <div className={`p-3 rounded-xl border ${isBw ? 'border-gray-400 bg-white' : 'border-amber-100 bg-amber-50/20'} shadow-2xs`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isBw ? 'bg-gray-100 text-gray-700' : category === 'gewicht' ? 'bg-amber-100 text-amber-800' : 'bg-cyan-100 text-cyan-800'}`}>
          {category === 'gewicht' ? 'Gewicht' : 'Hohlmaß'}
        </span>
      </div>
      <div className="font-mono text-sm text-gray-800 my-1">
        {isSolution ? (
          <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-300 inline-block">
            {solution}
          </span>
        ) : (
          <span>{renderWorksheetItem(prompt)}</span>
        )}
      </div>
    </div>
  )
}

export function parseDiagrammItemData(item: unknown): DiagrammItemData | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  if (!Array.isArray(obj.categories) || !Array.isArray(obj.questions)) return null
  return {
    title: String(obj.title || 'Diagramm'),
    categories: obj.categories as Array<{ label: string; value: number }>,
    maxValue: Number(obj.maxValue || 14),
    unit: String(obj.unit || 'Anzahl'),
    questions: obj.questions as Array<{ id: string; question: string; answer: string }>,
  }
}

export function DiagrammCard({
  data,
  isSolution = false,
  colorMode = 'color',
}: {
  data: DiagrammItemData
  isSolution?: boolean
  colorMode?: 'color' | 'bw'
}) {
  const isBw = colorMode === 'bw'
  const { title, categories, maxValue, questions } = data

  const svgW = 420
  const svgH = 150
  const chartPadLeft = 40
  const chartPadBottom = 25
  const chartPadTop = 15
  const chartPadRight = 15

  const chartW = svgW - chartPadLeft - chartPadRight
  const chartH = svgH - chartPadTop - chartPadBottom

  const barW = chartW / categories.length - 12
  const stepY = 2

  return (
    <div className={`p-4 rounded-xl border ${isBw ? 'border-gray-400 bg-white' : 'border-slate-200 bg-slate-50/40'} shadow-2xs space-y-4`}>
      <div className="font-bold text-xs text-gray-800 text-center">{title}</div>

      <div className="flex justify-center">
        <svg width={svgW} height={svgH} className="select-none overflow-visible">
          {Array.from({ length: Math.floor(maxValue / stepY) + 1 }).map((_, i) => {
            const val = i * stepY
            const y = chartPadTop + chartH - (val / maxValue) * chartH
            return (
              <g key={val}>
                <line
                  x1={chartPadLeft}
                  y1={y}
                  x2={svgW - chartPadRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="0.8"
                />
                <text
                  x={chartPadLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="8.5"
                  fontFamily="monospace"
                  fill="#64748b"
                >
                  {val}
                </text>
              </g>
            )
          })}

          <line
            x1={chartPadLeft}
            y1={chartPadTop}
            x2={chartPadLeft}
            y2={chartPadTop + chartH}
            stroke="#334155"
            strokeWidth="1.5"
          />
          <line
            x1={chartPadLeft}
            y1={chartPadTop + chartH}
            x2={svgW - chartPadRight}
            y2={chartPadTop + chartH}
            stroke="#334155"
            strokeWidth="1.5"
          />

          {categories.map((cat, idx) => {
            const barH = (cat.value / maxValue) * chartH
            const x = chartPadLeft + 6 + idx * (chartW / categories.length)
            const y = chartPadTop + chartH - barH

            return (
              <g key={cat.label}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  fill={isBw ? '#e2e8f0' : '#3b82f6'}
                  stroke={isBw ? '#000000' : '#1d4ed8'}
                  strokeWidth="1.2"
                  rx="2"
                />
                <text
                  x={x + barW / 2}
                  y={y - 3}
                  textAnchor="middle"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                  fill="#1e293b"
                >
                  {cat.value}
                </text>
                <text
                  x={x + barW / 2}
                  y={chartPadTop + chartH + 14}
                  textAnchor="middle"
                  fontSize="9"
                  fontFamily="sans-serif"
                  fill="#334155"
                >
                  {cat.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="space-y-2 pt-2 border-t border-gray-200">
        {questions.map((q) => (
          <div key={q.id} className="text-xs space-y-1">
            <p className="font-medium text-gray-800">
              <span className="font-bold mr-1">{q.id}</span>
              {q.question}
            </p>
            {isSolution ? (
              <p className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-300 font-mono">
                Antwort: {q.answer}
              </p>
            ) : (
              <div className="border-b border-dashed border-gray-400 h-6 w-full max-w-md" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}


export default function ArbeitsblattPreview({
  rawContent,
  formValues = {},
  taskCounts,
  illustrationUrl = null,
  imageUrl = null,
  isGeneratingImage = false,
  onRegenerateIllustration,
  onToggleIllustrationPosition,
}: ArbeitsblattPreviewProps) {
  // ── Umschalter: [ 📝 Schülerblatt (Standard) | 🔑 Lösungsblatt ] ──
  const [viewTab, setViewTab] = useState<'student' | 'solution'>('student')
  const [printBoth, setPrintBoth] = useState(false)
  const [colorMode, setColorMode] = useState<'color' | 'bw'>('color')

  // Aktive Bild-URL
  const activeImageUrl = imageUrl || illustrationUrl

  // Initiale Bildposition
  const initialPosition = ((): ImagePosition => {
    if (formValues.show_illustration === 'false') return 'hidden'
    const pos = formValues.illustration_position as ImagePosition
    if (
      pos === 'task1' ||
      pos === 'betweenTask1And2' ||
      pos === 'bottom' ||
      pos === 'hidden' ||
      pos === 'header'
    ) {
      return pos
    }
    return 'header'
  })()

  const [imagePosition, setImagePosition] = useState<ImagePosition>(initialPosition)

  useEffect(() => {
    if (formValues.illustration_position) {
      const pos = formValues.illustration_position as ImagePosition
      if (
        pos === 'task1' ||
        pos === 'betweenTask1And2' ||
        pos === 'bottom' ||
        pos === 'hidden' ||
        pos === 'header'
      ) {
        setImagePosition(pos)
      }
    }
  }, [formValues.illustration_position])

  const handleSetPosition = (pos: ImagePosition) => {
    setImagePosition(pos)
    onToggleIllustrationPosition?.(pos)
  }

  const showNotenraster = formValues.show_notenraster === 'true'

  // ── Parser: Zerlegt Output strikt in GeneratedWorksheet ──────────
  const parsed: ParsedWorksheetState = useMemo(() => {
    const defaultTitle = formValues.thema || formValues.titel || 'Mathematik-Arbeitsblatt'
    const rawKlasse = formValues.klasse || ''
    const matchKlasse = String(rawKlasse).match(/\d+/)
    const normGrade = matchKlasse ? parseInt(matchKlasse[0], 10) : 1

    if (!rawContent || rawContent.trim() === '') {
      return {
        title: defaultTitle,
        tasks: [],
        isFallback: false,
        rawFallback: '',
      }
    }

    const trimmedRaw = rawContent.trim()

    // 1. Versuch: Strukturiertes JSON
    if (trimmedRaw.startsWith('{') || trimmedRaw.startsWith('[') || trimmedRaw.startsWith('```')) {
      const cleanJson = trimmedRaw
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim()

      try {
        let parsedObj: unknown = null
        try {
          parsedObj = JSON.parse(cleanJson)
        } catch {
          const match = cleanJson.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
          if (match) {
            parsedObj = JSON.parse(match[0])
          }
        }

        if (parsedObj && typeof parsedObj === 'object') {
          const rec = parsedObj as Record<string, unknown>
          const title =
            typeof rec.titel === 'string' && rec.titel.trim()
              ? rec.titel.trim()
              : typeof rec.title === 'string' && rec.title.trim()
              ? rec.title.trim()
              : defaultTitle

          let rawTaskList: unknown[] = []
          if (Array.isArray(rec.tasks)) rawTaskList = rec.tasks
          else if (Array.isArray(rec.aufgaben)) rawTaskList = rec.aufgaben
          else if (Array.isArray(rec.items)) rawTaskList = rec.items
          else if (Array.isArray(parsedObj)) rawTaskList = parsedObj
          else {
            const arr = Object.values(rec).find((v) => Array.isArray(v))
            if (Array.isArray(arr)) rawTaskList = arr
            else rawTaskList = [rec]
          }

          const parsedTasks: GeneratedTask[] = rawTaskList.map((t, idx) => {
            const tRec = (t && typeof t === 'object' ? t : {}) as Record<string, unknown>
            const id = typeof tRec.id === 'number' ? tRec.id : idx + 1
            const rawType = typeof tRec.type === 'string' ? tRec.type.trim().toLowerCase() : ''
            let taskTitle =
              typeof tRec.title === 'string' && tRec.title.trim()
                ? tRec.title.trim()
                : typeof tRec.titel === 'string' && tRec.titel.trim()
                ? tRec.titel.trim()
                : `Aufgabe ${idx + 1}`

            // Doppelungen und führende Nummerierungen bereinigen ("Aufgabe 1: Kopfrechnen" -> "Kopfrechnen", "1. Wie viel Geld ist es?" -> "Wie viel Geld ist es?")
            taskTitle = taskTitle.replace(/^(?:Aufgabe\s*)?\d+\s*[:\-.)]?\s*/i, '').trim()
            if (!taskTitle) taskTitle = `Aufgabe ${idx + 1}`

            const instruction =
              typeof tRec.instruction === 'string'
                ? tRec.instruction.trim()
                : typeof tRec.anweisung === 'string'
                ? tRec.anweisung.trim()
                : ''

            const isRechenhaus =
              rawType === 'rechenhaeuser' ||
              rawType === 'rechenhaus' ||
              /rechenhaus|rechenhäuser|zahlenhaus|zahlenhäuser/i.test(taskTitle) ||
              /rechenhaus|rechenhäuser|zahlenhaus|zahlenhäuser/i.test(instruction)

            const isRechendreieck =
              !isRechenhaus &&
              (rawType === 'rechendreiecke' ||
                rawType === 'rechendreieck' ||
                /rechendreieck/i.test(taskTitle) ||
                /rechendreieck/i.test(instruction))

            const isZahlenmauer =
              !isRechenhaus &&
              !isRechendreieck &&
              (rawType === 'zahlenmauern' ||
                rawType === 'zahlenmauer' ||
                /zahlenmauer|rechenmauer/i.test(taskTitle) ||
                /zahlenmauer|rechenmauer/i.test(instruction))

            const isGeldZaehlen =
              rawType === 'geld_zaehlen' ||
              rawType === 'geld' ||
              /wie viel geld|münzen und scheine|münzen zählen|scheine zählen/i.test(taskTitle) ||
              /wie viel geld|münzen und scheine|münzen zählen|scheine zählen/i.test(instruction)

            const isGeldRechnen =
              rawType === 'geld_rechnen' ||
              /rechnen mit euro|rechnen mit geld/i.test(taskTitle) ||
              /rechnen mit euro|rechnen mit geld/i.test(instruction)

            const isGeldVergleich =
              rawType === 'geld_vergleich' ||
              ((/vergleich|größer.*kleiner|< > =/i.test(taskTitle) ||
                /vergleich|größer.*kleiner|< > =/i.test(instruction)) &&
                /€|cent|ct|euro|geld/i.test(`${taskTitle} ${instruction} ${JSON.stringify(tRec.items || '')}`))

            const isUhrzeitAblesen =
              rawType === 'uhrzeit_ablesen' ||
              /wie spät ist es|uhrzeiten ablesen/i.test(taskTitle) ||
              /wie spät ist es|uhrzeiten ablesen/i.test(instruction)

            const isUhrzeitZeichnen =
              rawType === 'uhrzeit_zeichnen' ||
              /zeiger einzeichnen|stundenzeiger ein/i.test(taskTitle) ||
              /zeiger einzeichnen|stundenzeiger ein/i.test(instruction)

            const isUhrzeitRechnen =
              rawType === 'uhrzeit_rechnen' ||
              /rechnen mit stunden|zeitspannen/i.test(taskTitle) ||
              /rechnen mit stunden|zeitspannen/i.test(instruction)

            const isStrichlisteAblesen =
              rawType === 'strichliste_ablesen' ||
              /strichlisten? ablesen/i.test(taskTitle) ||
              /strichlisten? ablesen/i.test(instruction)

            const isStrichlisteZeichnen =
              rawType === 'strichliste_zeichnen' ||
              /strichlisten? zeichnen/i.test(taskTitle) ||
              /strichlisten? zeichnen/i.test(instruction)

            const isStrichlisteZaehlen =
              rawType === 'strichliste_zaehlen' ||
              /zählen und häufigkeiten|formen im kasten/i.test(taskTitle) ||
              /zählen und häufigkeiten|formen im kasten/i.test(instruction)

            const isGeometrieFormenZaehlen =
              rawType === 'geometrie_formen_zaehlen' ||
              /formen (erkennen und )?zählen/i.test(taskTitle) ||
              /formen (erkennen und )?zählen/i.test(instruction)

            const isGeometrieMuster =
              rawType === 'geometrie_muster_fortsetzen' ||
              /muster (fortsetzen|fortführen)/i.test(taskTitle) ||
              /muster (fortsetzen|fortführen)/i.test(instruction)

            const isGeometriePunktgitter =
              rawType === 'geometrie_punktgitter' ||
              /punktgitter|geobrett/i.test(taskTitle) ||
              /punktgitter|geobrett/i.test(instruction)

            const isRaumGitterOrientierung =
              rawType === 'raum_gitter_orientierung' ||
              /wo befinden sich die formen|3x3-gitter/i.test(taskTitle) ||
              /wo befinden sich die formen|3x3-gitter/i.test(instruction)

            const isRaumPfeileZaehlen =
              rawType === 'raum_pfeile_zaehlen' ||
              /links oder rechts|pfeile (zählen|erkennen)|richtungen erkennen/i.test(taskTitle) ||
              /links oder rechts|pfeile (zählen|erkennen)|richtungen erkennen/i.test(instruction)

            const isRaumGitterZeichnen =
              rawType === 'raum_gitter_zeichnen' ||
              /zeichne an die richtige stelle|an die richtige stelle/i.test(taskTitle) ||
              /zeichne an die richtige stelle|an die richtige stelle/i.test(instruction)

            const isRechengeschichten =
              rawType === 'rechengeschichten' ||
              (normGrade === 1 && (
                rawType === 'sachaufgaben' ||
                rawType === 'textaufgaben' ||
                /rechengeschichte|text-?\/sachaufgabe|sachaufgabe|textaufgabe/i.test(taskTitle) ||
                /rechengeschichte|text-?\/sachaufgabe|sachaufgabe|textaufgabe/i.test(instruction)
              ))

            const isZwanzigerfeld =
              (rawType === 'zwanzigerfeld' ||
               (rawType === 'punktefeld' && normGrade === 1) ||
               rawType === 'zehnerfeld' ||
               /zwanzigerfeld|zehnerfeld|wendeplättchen/i.test(taskTitle) ||
               /zwanzigerfeld|zehnerfeld|wendeplättchen/i.test(instruction)) &&
              rawType !== 'hunderterfeld_punkte' &&
              rawType !== 'einmaleins_punktefeld' &&
              !/hunderterfeld|hundertertafel|10x10|einmaleins/i.test(taskTitle) &&
              !/hunderterfeld|hundertertafel|10x10|einmaleins/i.test(instruction)

            const isSchuettelboxen =
              rawType === 'schuettelboxen' ||
              rawType === 'schuettelbox' ||
              /schüttelbox|schuettelbox/i.test(taskTitle) ||
              /schüttelbox|schuettelbox/i.test(instruction)

            const isZehnerstopp =
              rawType === 'zehnerstopp' ||
              /zehnerstopp|stopp bei der 10|in zwei schritten|in 2 schritten/i.test(taskTitle) ||
              /zehnerstopp|stopp bei der 10|in zwei schritten|in 2 schritten/i.test(instruction)

            const isAufgabenfamilien =
              rawType === 'aufgabenfamilien' ||
              rawType === 'aufgabenfamilie' ||
              rawType === 'tausch_umkehraufgaben' ||
              /aufgabenfamilie|tausch-?\s*und\s*umkehraufgabe|tausch-?\s*&\s*umkehraufgabe/i.test(taskTitle) ||
              /aufgabenfamilie|tausch-?\s*und\s*umkehraufgabe|tausch-?\s*&\s*umkehraufgabe/i.test(instruction)

            const isWochentage =
              rawType === 'wochentage' ||
              rawType === 'wochentag' ||
              /wochentag|gestern.*heute.*morgen/i.test(taskTitle) ||
              /wochentag|gestern.*heute.*morgen/i.test(instruction)

            const isHundertertafel =
              rawType === 'hundertertafel' ||
              rawType === 'hunderterfeld_punkte' ||
              rawType === 'stellenwert_ze' ||
              (!rawType && (/hundertertafel|hunderterfeld|stellenwert/i.test(taskTitle) || /hundertertafel|hunderterfeld|stellenwert/i.test(instruction)))

            const isHalbschriftlich =
              rawType === 'halbschriftlich' ||
              /halbschriftlich|in zwei schritten|in 2 schritten.*zehner/i.test(taskTitle) ||
              /halbschriftlich|in zwei schritten|in 2 schritten.*zehner/i.test(instruction)

            const isEinmaleins =
              rawType === 'einmaleins' ||
              /einmaleins|malreihen|punktefeld & malfamilie|tauschaufgabe.*umkehraufgabe/i.test(taskTitle) ||
              /einmaleins|malreihen|punktefeld & malfamilie|tauschaufgabe.*umkehraufgabe/i.test(instruction)

            const isGeldKomma =
              rawType === 'geld_komma' ||
              /geld.*komma|kommaschreibweise|euro und cent mit komma/i.test(taskTitle) ||
              /geld.*komma|kommaschreibweise|euro und cent mit komma/i.test(instruction)

            const isLaengenMessen =
              rawType === 'laengen_messen' ||
              /längen messen|strecken.*messen|meter und zentimeter/i.test(taskTitle) ||
              /längen messen|strecken.*messen|meter und zentimeter/i.test(instruction)

            const isGeometrieKoerper =
              rawType === 'geometrie_koerper' ||
              /körper.*symmetrie|geometrische körper|körper & symmetrie/i.test(taskTitle) ||
              /körper.*symmetrie|geometrische körper|körper & symmetrie/i.test(instruction)

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
                : isHundertertafel
                ? 'hundertertafel'
                : isHalbschriftlich
                ? 'halbschriftlich'
                : isEinmaleins
                ? 'einmaleins'
                : isGeldKomma
                ? 'geld_komma'
                : isLaengenMessen
                ? 'laengen_messen'
                : isGeometrieKoerper
                ? 'geometrie_koerper'
                : undefined)

            let items: unknown[] = []
            if (Array.isArray(tRec.items)) {
              items = tRec.items
            } else if (Array.isArray(tRec.teilaufgaben)) {
              items = tRec.teilaufgaben
            }

            const tasksPerLevel = (() => {
              const match = (formValues.anzahl_aufgaben || '').match(/\d+/)
              return match ? parseInt(match[0], 10) : undefined
            })()

            const specificCount = (() => {
              if (!taskCounts || Object.keys(taskCounts).length === 0) return tasksPerLevel
              if (typeof taskCounts[rawType] === 'number') return taskCounts[rawType]
              if (type && typeof taskCounts[type] === 'number') return taskCounts[type]
              if (typeof taskCounts[taskTitle] === 'number') return taskCounts[taskTitle]
              for (const [key, val] of Object.entries(taskCounts)) {
                const kLow = key.toLowerCase()
                if (taskTitle.toLowerCase().includes(kLow) || (type && type.toLowerCase().includes(kLow)) || (rawType && rawType.toLowerCase().includes(kLow))) {
                  return val
                }
              }
              return tasksPerLevel
            })()

            const isSingleCompositeTask =
              isStrichlisteZaehlen ||
              isGeometrieFormenZaehlen ||
              isRaumGitterOrientierung ||
              isRaumPfeileZaehlen ||
              isRaumGitterZeichnen

            if (!isSingleCompositeTask && specificCount && items.length > specificCount) {
              items = items.slice(0, specificCount)
            }

            let solutionItems: unknown[] | undefined = undefined
            if (Array.isArray(tRec.solutionItems)) {
              solutionItems = isSingleCompositeTask
                ? tRec.solutionItems
                : specificCount && tRec.solutionItems.length > specificCount
                ? tRec.solutionItems.slice(0, specificCount)
                : tRec.solutionItems
            } else if (Array.isArray(tRec.loesungen)) {
              solutionItems = isSingleCompositeTask
                ? tRec.loesungen
                : specificCount && tRec.loesungen.length > specificCount
                ? tRec.loesungen.slice(0, specificCount)
                : tRec.loesungen
            }

            return {
              id,
              type,
              title: taskTitle,
              instruction,
              items,
              ...(solutionItems ? { solutionItems } : {}),
            }
          })

          if (parsedTasks.length > 0) {
            return {
              title,
              tasks: parsedTasks,
              isFallback: false,
              rawFallback: '',
            }
          }
        }
      } catch (err) {
        console.warn('JSON-Parsing fehlgeschlagen in ArbeitsblattPreview:', err)
      }
    }

    // 2. Fallback: Inhalt lesbar als Fallback anzeigen
    console.warn('Nutze Fallback-Darstellung für ArbeitsblattPreview.')
    return {
      title: defaultTitle,
      tasks: [],
      isFallback: true,
      rawFallback: trimmedRaw,
    }
  }, [rawContent, formValues])

  const handlePrint = () => {
    window.print()
  }

  // ── Render-Funktion für die Schulbuch-Illustration ────────────────
  const renderImage = (pos: ImagePosition) => {
    if (!activeImageUrl && !isGeneratingImage) return null

    return (
      <div className="relative group inline-block flex-shrink-0">
        {activeImageUrl ? (
          <img
            src={activeImageUrl}
            alt="Schulbuch-Illustration"
            className={`object-contain filter drop-shadow-xs transition-transform ${
              pos === 'betweenTask1And2' || pos === 'bottom'
                ? 'max-h-[85px] max-w-[160px]'
                : 'w-[85px] h-[85px] max-w-[90px] max-h-[90px]'
            }`}
            style={{ mixBlendMode: 'multiply' }}
          />
        ) : isGeneratingImage ? (
          <div className="w-[85px] h-[85px] rounded-lg border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-[10px] text-gray-500 animate-pulse no-print">
            <Sparkles className="w-4 h-4 text-gray-400 animate-spin mb-1" />
            <span>Illustration...</span>
          </div>
        ) : null}
      </div>
    )
  }

  // ── A4-Layout-Steuerung & 2-Seiten-Unterstützung ─────────────────
  const isTwoPageMode = Boolean(
    formValues.seitenumfang?.includes('2') || 
    formValues.seitenumfang?.toLowerCase().includes('ausführlich')
  )
  const isSinglePageMode = !isTwoPageMode
  const allTasks = parsed.tasks

  // Wenn 2-Seiten-Modus aktiv ist und mehr als 1 Aufgabe vorliegt, teilen wir auf
  const hasMultiplePages = isTwoPageMode && allTasks.length > 1
  const splitIndex = hasMultiplePages ? Math.ceil(allTasks.length / 2) : allTasks.length
  const page1Tasks = allTasks.slice(0, splitIndex)
  const page2Tasks = hasMultiplePages ? allTasks.slice(splitIndex) : []

  const pages = hasMultiplePages ? [page1Tasks, page2Tasks] : [page1Tasks]

  return (
    <div className="flex flex-col h-full bg-slate-100 rounded-2xl overflow-hidden border border-gray-200">
      {/* ── Toolbar oben mit Segmented Switcher (no-print) ───────── */}
      <div className="no-print bg-white px-5 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {hasMultiplePages
                ? 'Arbeitsblatt-Vorschau (2 DIN-A4-Seiten)'
                : 'Arbeitsblatt-Vorschau (1 DIN-A4-Seite)'}
            </h3>
            <p className="text-[11px] text-gray-400">
              Druckfertige Kopiervorlage nach bayerischem LehrplanPLUS
            </p>
          </div>
        </div>

        {/* ── UMSCHALTER: [ 📝 Schülerblatt (Standard) | 🔑 Lösungsblatt ] ── */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner">
          <button
            type="button"
            onClick={() => setViewTab('student')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewTab === 'student'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Schülerblatt (Standard)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewTab('solution')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewTab === 'solution'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Lösungsblatt</span>
          </button>
        </div>

        {/* ── FARB- & DRUCKMODUS-UMSCHALTER: [ Farbig 🎨 | S/W druckoptimiert 🖨️ ] ── */}
        <div
          role="group"
          aria-label="Farb- und Druckmodus"
          className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner"
        >
          <button
            type="button"
            onClick={() => setColorMode('color')}
            aria-pressed={colorMode === 'color'}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              colorMode === 'color'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Farbansicht für Bildschirm und digitale Nutzung"
          >
            <span>Farbig</span>
            <span aria-hidden="true">🎨</span>
          </button>
          <button
            type="button"
            onClick={() => setColorMode('bw')}
            aria-pressed={colorMode === 'bw'}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              colorMode === 'bw'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Schwarz-Weiß druckoptimiert für Schulkopierer"
          >
            <span>S/W druckoptimiert</span>
            <span aria-hidden="true">🖨️</span>
          </button>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Bild-Position Dropdown-Steuerung */}
          {(activeImageUrl || isGeneratingImage) && (
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-gray-500 font-medium flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Bild:</span>
              </span>
              <select
                value={imagePosition}
                onChange={(e) => handleSetPosition(e.target.value as ImagePosition)}
                className="bg-white border border-gray-300 rounded px-2 py-0.5 text-xs text-gray-800 font-medium cursor-pointer focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="header">Header (oben rechts)</option>
                <option value="task1">Neben Aufgabe 1</option>
                <option value="betweenTask1And2">Zwischen Aufgabe 1 & 2</option>
                <option value="bottom">Fußbereich</option>
                <option value="hidden">Ausblenden</option>
              </select>
              {onRegenerateIllustration && (
                <button
                  type="button"
                  onClick={onRegenerateIllustration}
                  disabled={isGeneratingImage}
                  title="Schulbuch-Illustration neu generieren"
                  className="p-1 rounded text-gray-500 hover:text-blue-600 hover:bg-white transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      isGeneratingImage ? 'animate-spin text-blue-600' : ''
                    }`}
                  />
                </button>
              )}
            </div>
          )}

          {/* Option: Beide Blätter zusammen drucken */}
          <label className="inline-flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100">
            <input
              type="checkbox"
              checked={printBoth}
              onChange={(e) => setPrintBoth(e.target.checked)}
              className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-0 cursor-pointer"
            />
            <span>Beide drucken</span>
          </label>

          {/* Druck-Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            <span>
              {viewTab === 'student' ? 'Schülerblatt drucken / PDF' : 'Lösungsblatt drucken / PDF'}
            </span>
          </button>
        </div>
      </div>

      {/* ── Scrollbarer Bereich mit DIN-A4-Darstellung ───────────── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center gap-6">
        <div id="arbeitsblatt-print-area" className="w-full flex flex-col items-center gap-6">
        {/* ═══════════════════════════════════════════════════════════
            SCHÜLERBLATT (Klassische Kopiervorlage)
            ═══════════════════════════════════════════════════════════ */}
        {(viewTab === 'student' || printBoth) &&
          pages.map((pageTasks, pageIdx) => {
            const isSecondPage = pageIdx === 1
            const totalPageItems = pageTasks.reduce((acc, t) => acc + (t.items?.length || 1), 0)
            const isDense = totalPageItems > 8 || pageTasks.length > 3

            return (
              <div
                key={`student-page-${pageIdx}`}
                className={`
                  arbeitsblatt-page w-full max-w-[794px] bg-white text-gray-900 rounded-xs shadow-xl border border-gray-300
                  p-6 sm:p-8 min-h-[1050px] flex flex-col justify-between
                  ${isSecondPage ? 'print-page-break' : ''}
                  ${viewTab === 'solution' && !printBoth ? 'hidden' : 'block'}
                `}
                style={{ fontFamily: 'Georgia, Cambria, serif' }}
              >
                <div>
                  {!isSecondPage ? (
                    <>
                      {/* ── 1. SAUBERE KOPFZEILE (Name, Datum, Klasse) ── */}
                      <div className="border-b border-gray-400 pb-2 mb-4 font-sans text-xs text-gray-800">
                        <div className="flex justify-between items-baseline gap-4 sm:gap-6">
                          <div className="flex items-baseline flex-1">
                            <span className="font-semibold text-gray-900 mr-2">Name:</span>
                            <div className="flex-1 border-b border-dotted border-gray-400 h-4" />
                          </div>
                          <div className="flex items-baseline w-32 sm:w-36">
                            <span className="font-semibold text-gray-900 mr-2">Datum:</span>
                            <div className="flex-1 border-b border-dotted border-gray-400 h-4" />
                          </div>
                          <div className="flex items-baseline w-20 sm:w-24">
                            <span className="font-semibold text-gray-900 mr-2">Klasse:</span>
                            <div className="flex-1 border-b border-dotted border-gray-400 h-4" />
                          </div>
                          {showNotenraster && (
                            <div className="border border-gray-400 rounded px-2 py-0.5 text-right text-[10px] leading-tight flex-shrink-0">
                              <div>Punkte: ___ / ___ P.</div>
                              <div className="font-bold border-t border-gray-300 mt-0.5 pt-0.5">Note: ____</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ── 2. FORMATIERTER TITEL (Direkt unter der Kopfzeile) ── */}
                      <div className="relative mb-5 flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h1
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            className="font-serif font-bold text-gray-950 tracking-tight text-xl sm:text-2xl outline-none hover:bg-blue-50/30 focus:bg-white focus:ring-1 focus:ring-blue-400 rounded px-1 -ml-1 transition-all cursor-text"
                            title="Klicken zum Bearbeiten"
                          >
                            {parsed.title}
                          </h1>
                        </div>

                        {/* Bild oben rechts neben dem Header (max 90x90px) */}
                        {imagePosition === 'header' && activeImageUrl && (
                          <div className="flex-shrink-0">{renderImage('header')}</div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* ── KOPFZEILE SEITE 2 (Name, Datum, Klasse) ── */}
                      <div className="border-b border-gray-400 pb-2 mb-4 font-sans text-xs text-gray-800">
                        <div className="flex justify-between items-baseline gap-4 sm:gap-6">
                          <div className="flex items-baseline flex-1">
                            <span className="font-semibold text-gray-900 mr-2">Name:</span>
                            <div className="flex-1 border-b border-dotted border-gray-400 h-4" />
                          </div>
                          <div className="flex items-baseline w-32 sm:w-36">
                            <span className="font-semibold text-gray-900 mr-2">Datum:</span>
                            <div className="flex-1 border-b border-dotted border-gray-400 h-4" />
                          </div>
                          <div className="flex items-baseline w-20 sm:w-24">
                            <span className="font-semibold text-gray-900 mr-2">Klasse:</span>
                            <div className="flex-1 border-b border-dotted border-gray-400 h-4" />
                          </div>
                        </div>
                      </div>

                      {/* ── TITEL SEITE 2 (Fortsetzung) ── */}
                      <div className="relative mb-5 flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h1 className="font-serif font-bold text-gray-950 tracking-tight text-xl sm:text-2xl">
                            {parsed.title} <span className="text-gray-400 text-base sm:text-lg font-normal font-sans">(Fortsetzung)</span>
                          </h1>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── 3. AUFGABEN-STRUKTUR ──────────────────────────── */}
                  {(() => {
                    if (!isSecondPage && parsed.isFallback && parsed.rawFallback) {
                      return (
                        <div className="border border-amber-300 bg-amber-50/60 rounded-xl p-4 font-sans text-sm text-gray-800 whitespace-pre-wrap leading-relaxed shadow-xs">
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-2">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <span>Hinweis zur Rohausgabe (Konnte nicht als JSON geparst werden):</span>
                          </div>
                          {parsed.rawFallback}
                        </div>
                      )
                    }

                    return (
                      <div className={isDense ? "space-y-3.5" : "space-y-5"}>
                        {pageTasks.map((task, localIndex) => {
                          const index = isSecondPage ? splitIndex + localIndex : localIndex
                          return (
                            <div key={task.id || index} className="task-block font-sans break-inside-avoid print:break-inside-avoid">
                        {/* Bild-Position: Neben Aufgabe 1 gefloatet */}
                        {index === 0 && imagePosition === 'task1' && activeImageUrl && (
                          <div className="float-right ml-4 mb-2 flex items-center justify-center">
                            {renderImage('task1')}
                          </div>
                        )}

                        {/* Aufgaben-Kopf: task.id. task.title */}
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-bold text-base text-gray-950 flex-shrink-0">
                            {task.id || index + 1}.
                          </span>
                          <h2
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            className="font-bold text-base text-gray-950 outline-none hover:bg-blue-50/30 focus:bg-white focus:ring-1 focus:ring-blue-400 focus:rounded px-1 -ml-1 transition-all cursor-text"
                            title="Klicken zum Bearbeiten"
                          >
                            {task.title || `Aufgabe ${index + 1}`}
                          </h2>
                          {showNotenraster && (
                            <span className="text-xs text-gray-400 ml-auto font-normal">
                              (___ P.)
                            </span>
                          )}
                        </div>

                        {/* Aufgabenstellung / Anweisung kursiv abgesetzt */}
                        {task.instruction && (
                          <p
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            className="italic text-xs text-gray-600 mb-2 leading-relaxed outline-none hover:bg-blue-50/30 focus:bg-white focus:ring-1 focus:ring-blue-400 rounded px-1"
                            title="Klicken zum Bearbeiten"
                          >
                            {task.instruction}
                          </p>
                        )}

                        {/* Rechenhäuser ODER Rechendreiecke ODER Standard-Items */}
                        {(() => {
                          const isRechenhaus =
                            task.type === 'rechenhaeuser' ||
                            task.type === 'rechenhaus' ||
                            /rechenhaus|rechenhäuser|zahlenhaus|zahlenhäuser/i.test(`${task.title} ${task.instruction}`)

                          if (isRechenhaus && task.items && task.items.length > 0) {
                            return (
                              <div className={`gap-3 sm:gap-4.5 justify-items-center my-3 py-1 ${
                                task.items.length === 1
                                  ? 'flex justify-center max-w-[200px] mx-auto'
                                  : task.items.length === 2
                                  ? 'grid grid-cols-2 max-w-[420px] mx-auto'
                                  : task.items.length === 3
                                  ? 'grid grid-cols-1 sm:grid-cols-3 max-w-2xl mx-auto'
                                  : task.items.length === 4
                                  ? 'grid grid-cols-2 sm:grid-cols-4 max-w-full mx-auto'
                                  : 'flex flex-wrap justify-center gap-3 sm:gap-4 max-w-full mx-auto'
                              }`}>
                                {task.items.map((item, iIdx) => {
                                  const hausData = parseRechenhausData(item, iIdx)
                                  if (!hausData) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <RechenhausItem
                                      key={iIdx}
                                      data={hausData}
                                      isSolution={false}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isRechendreieck =
                            task.type === 'rechendreiecke' ||
                            /rechendreieck/i.test(`${task.title} ${task.instruction}`)

                          if (isRechendreieck && task.items && task.items.length > 0) {
                            return (
                              <div className={`gap-3 sm:gap-4.5 justify-items-center my-3 py-1 ${
                                task.items.length === 1
                                  ? 'flex justify-center max-w-[220px] mx-auto'
                                  : task.items.length === 2
                                  ? 'grid grid-cols-2 max-w-[460px] mx-auto'
                                  : task.items.length === 3
                                  ? 'grid grid-cols-1 sm:grid-cols-3 max-w-2xl mx-auto'
                                  : task.items.length === 4
                                  ? 'grid grid-cols-2 sm:grid-cols-4 max-w-full mx-auto'
                                  : 'flex flex-wrap justify-center gap-3 sm:gap-4 max-w-full mx-auto'
                              }`}>
                                {task.items.map((item, iIdx) => {
                                  const dreieckData = parseRechendreieckData(item, iIdx)
                                  if (!dreieckData) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <RechendreieckItem
                                      key={iIdx}
                                      data={dreieckData}
                                      isSolution={false}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isZahlenmauer =
                            task.type === 'zahlenmauern' ||
                            /zahlenmauer|rechenmauer/i.test(`${task.title} ${task.instruction}`)

                          if (isZahlenmauer && task.items && task.items.length > 0) {
                            return (
                              <div className={`gap-3 sm:gap-4.5 justify-items-center my-3 py-1 ${
                                task.items.length === 1
                                  ? 'flex justify-center max-w-[240px] mx-auto'
                                  : task.items.length === 2
                                  ? 'grid grid-cols-2 max-w-[500px] mx-auto'
                                  : task.items.length === 3
                                  ? 'grid grid-cols-1 sm:grid-cols-3 max-w-2xl mx-auto'
                                  : task.items.length === 4
                                  ? 'grid grid-cols-2 sm:grid-cols-4 max-w-full mx-auto'
                                  : 'flex flex-wrap justify-center gap-3 sm:gap-4 max-w-full mx-auto'
                              }`}>
                                {task.items.map((item, iIdx) => {
                                  const mauerData = parseZahlenmauerData(item, iIdx)
                                  if (!mauerData) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <ZahlenmauerSVG
                                      key={iIdx}
                                      data={mauerData}
                                      isSolution={false}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isGeldZaehlen =
                            task.type === 'geld_zaehlen' ||
                            /wie viel geld|münzen und scheine/i.test(`${task.title} ${task.instruction}`)

                          if (isGeldZaehlen && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 my-3 py-1">
                                {task.items.map((item, iIdx) => {
                                  const data = parseGeldZaehlenData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <GeldZaehlenItem
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isGeldRechnen =
                            task.type === 'geld_rechnen' ||
                            /rechnen mit euro|rechnen mit geld/i.test(`${task.title} ${task.instruction}`)

                          if (isGeldRechnen && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-base font-mono my-3 py-1">
                                {task.items.map((item, iIdx) => {
                                  const data = parseGeldRechnenData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <GeldRechnenItem
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isGeldVergleich =
                            task.type === 'geld_vergleich' ||
                            ((/vergleich|größer.*kleiner|< > =/i.test(`${task.title} ${task.instruction}`)) &&
                              /€|cent|ct|euro|geld/i.test(`${task.title} ${task.instruction} ${JSON.stringify(task.items || '')}`))

                          if (isGeldVergleich && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-base font-mono my-3 py-1">
                                {task.items.map((item, iIdx) => {
                                  const data = parseGeldVergleichData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <GeldVergleichItem
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isUhrzeitAblesen =
                            task.type === 'uhrzeit_ablesen' ||
                            /wie spät ist es|uhrzeiten ablesen/i.test(`${task.title} ${task.instruction}`)

                          if (isUhrzeitAblesen && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
                                {task.items.map((item, iIdx) => {
                                  const data = parseUhrzeitAblesenData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <UhrzeitAblesenItem
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isUhrzeitZeichnen =
                            task.type === 'uhrzeit_zeichnen' ||
                            /zeiger einzeichnen|stundenzeiger ein/i.test(`${task.title} ${task.instruction}`)

                          if (isUhrzeitZeichnen && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
                                {task.items.map((item, iIdx) => {
                                  const data = parseUhrzeitZeichnenData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <UhrzeitZeichnenItem
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isUhrzeitRechnen =
                            task.type === 'uhrzeit_rechnen' ||
                            /rechnen mit stunden|zeitspannen/i.test(`${task.title} ${task.instruction}`)

                          if (isUhrzeitRechnen && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-base font-mono my-3 py-1">
                                {task.items.map((item, iIdx) => {
                                  const data = parseUhrzeitRechnenData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <UhrzeitRechnenItem
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isStrichlisteAblesen =
                            task.type === 'strichliste_ablesen' ||
                            /strichlisten? ablesen/i.test(`${task.title} ${task.instruction}`)

                          if (isStrichlisteAblesen && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-base font-mono my-2 py-1">
                                {task.items.map((item, iIdx) => {
                                  const data = parseStrichlisteAblesenData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <StrichlisteAblesenItem
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isStrichlisteZeichnen =
                            task.type === 'strichliste_zeichnen' ||
                            /strichlisten? zeichnen/i.test(`${task.title} ${task.instruction}`)

                          if (isStrichlisteZeichnen && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-base font-mono my-2 py-1">
                                {task.items.map((item, iIdx) => {
                                  const data = parseStrichlisteZeichnenData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <StrichlisteZeichnenItem
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isStrichlisteZaehlen =
                            task.type === 'strichliste_zaehlen' ||
                            /zählen und häufigkeiten|formen im kasten/i.test(`${task.title} ${task.instruction}`)

                          if (isStrichlisteZaehlen && task.items && task.items.length > 0) {
                            const data = parseStrichlisteZaehlenData(task.items[0])
                            if (data) {
                              return (
                                <StrichlisteZaehlenItem
                                  data={data}
                                  isSolution={false}
                                  colorMode={colorMode}
                                />
                              )
                            }
                          }

                          const isGeometrieFormenZaehlen =
                            task.type === 'geometrie_formen_zaehlen' ||
                            /formen (erkennen und )?zählen/i.test(`${task.title} ${task.instruction}`)

                          if (isGeometrieFormenZaehlen && task.items && task.items.length > 0) {
                            const data = parseGeometrieFormenZaehlenData(task.items[0])
                            if (data) {
                              return (
                                <GeometrieFormenZaehlenItem
                                  data={data}
                                  isSolution={false}
                                  colorMode={colorMode}
                                />
                              )
                            }
                          }

                          const isGeometrieMuster =
                            task.type === 'geometrie_muster_fortsetzen' ||
                            /muster (fortsetzen|fortführen)/i.test(`${task.title} ${task.instruction}`)

                          if (isGeometrieMuster && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 my-2 py-1">
                                {task.items.map((item, iIdx) => {
                                  const data = parseGeometrieMusterData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <GeometrieMusterItem
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isGeometriePunktgitter =
                            task.type === 'geometrie_punktgitter' ||
                            /punktgitter|geobrett/i.test(`${task.title} ${task.instruction}`)

                          if (isGeometriePunktgitter && task.items && task.items.length > 0) {
                            return (
                              <div className={`gap-3 my-2 py-1 ${
                                task.items.length === 1
                                  ? 'flex justify-center max-w-[240px] mx-auto'
                                  : task.items.length === 2
                                  ? 'grid grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto gap-4'
                                  : task.items.length === 3
                                  ? 'grid grid-cols-1 sm:grid-cols-3 max-w-3xl mx-auto gap-3'
                                  : task.items.length === 4
                                  ? 'grid grid-cols-2 sm:grid-cols-4 max-w-full mx-auto gap-2.5'
                                  : 'flex flex-wrap justify-center gap-3 max-w-full mx-auto'
                              }`}>
                                {task.items.map((item, iIdx) => {
                                  const data = parseGeometriePunktgitterData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <GeometriePunktgitterItem
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isRaumGitterOrientierung =
                            task.type === 'raum_gitter_orientierung' ||
                            /wo befinden sich die formen|3x3-gitter/i.test(`${task.title} ${task.instruction}`)

                          if (isRaumGitterOrientierung && task.items && task.items.length > 0) {
                            const data = parseRaumGitterOrientierungData(task.items[0])
                            if (data) {
                              return (
                                <RaumGitterOrientierungItem
                                  data={data}
                                  isSolution={false}
                                  colorMode={colorMode}
                                />
                              )
                            }
                          }

                          const isRaumPfeileZaehlen =
                            task.type === 'raum_pfeile_zaehlen' ||
                            /links oder rechts|pfeile (zählen|erkennen)|richtungen erkennen/i.test(
                              `${task.title} ${task.instruction}`
                            )

                          if (isRaumPfeileZaehlen && task.items && task.items.length > 0) {
                            const data = parseRaumPfeileZaehlenData(task.items[0])
                            if (data) {
                              return (
                                <RaumPfeileZaehlenItem
                                  data={data}
                                  isSolution={false}
                                  colorMode={colorMode}
                                />
                              )
                            }
                          }

                          const isRaumGitterZeichnen =
                            task.type === 'raum_gitter_zeichnen' ||
                            /zeichne an die richtige stelle|an die richtige stelle/i.test(
                              `${task.title} ${task.instruction}`
                            )

                          if (isRaumGitterZeichnen && task.items && task.items.length > 0) {
                            const data = parseRaumGitterZeichnenData(task.items[0])
                            if (data) {
                              return (
                                <RaumGitterZeichnenItem
                                  data={data}
                                  isSolution={false}
                                  colorMode={colorMode}
                                />
                              )
                            }
                          }

                          const isRechengeschichten =
                            task.type === 'rechengeschichten' ||
                            /rechengeschichte/i.test(`${task.title} ${task.instruction}`)

                          if (isRechengeschichten && task.items && task.items.length > 0) {
                            return (
                              <div className={`gap-4 my-2 ${
                                task.items.length === 1
                                  ? 'grid grid-cols-1 max-w-lg mx-auto'
                                  : 'grid grid-cols-1 sm:grid-cols-2'
                              }`}>
                                {task.items.map((item, iIdx) => {
                                  const data = parseRechengeschichteItemData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <RechengeschichteCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isZwanzigerfeld =
                            (task.type === 'zwanzigerfeld' ||
                             task.type === 'zehnerfeld' ||
                             /zwanzigerfeld|zehnerfeld|wendeplättchen/i.test(
                               `${task.title} ${task.instruction}`
                             )) &&
                            task.type !== 'hunderterfeld_punkte' &&
                            task.type !== 'hundertertafel' &&
                            task.type !== 'einmaleins_punktefeld' &&
                            !/hunderterfeld|hundertertafel|10x10|einmaleins/i.test(
                              `${task.title} ${task.instruction}`
                            )

                          if (isZwanzigerfeld && task.items && task.items.length > 0) {
                            return (
                              <div className={`gap-4 my-2 ${
                                task.items.length === 1
                                  ? 'grid grid-cols-1 max-w-md mx-auto'
                                  : 'grid grid-cols-1 sm:grid-cols-2'
                              }`}>
                                {task.items.map((item, iIdx) => {
                                  const data = parseZwanzigerfeldItemData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <ZwanzigerfeldCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isSchuettelboxen =
                            task.type === 'schuettelboxen' ||
                            /schüttelbox|schuettelbox/i.test(`${task.title} ${task.instruction}`)

                          if (isSchuettelboxen && task.items && task.items.length > 0) {
                            return (
                              <div className={`gap-3 my-2 ${
                                task.items.length === 1
                                  ? 'grid grid-cols-1 max-w-[260px] mx-auto'
                                  : task.items.length === 2
                                  ? 'grid grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto'
                                  : task.items.length === 3
                                  ? 'grid grid-cols-1 sm:grid-cols-3 max-w-3xl mx-auto'
                                  : task.items.length === 4
                                  ? 'grid grid-cols-2 sm:grid-cols-4 max-w-full mx-auto gap-2.5'
                                  : 'flex flex-wrap justify-center gap-2.5 sm:gap-3.5 max-w-full mx-auto'
                              }`}>
                                {task.items.map((item, iIdx) => {
                                  const data = parseSchuettelboxItemData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <SchuettelboxCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isZehnerstopp =
                            task.type === 'zehnerstopp' ||
                            /zehnerstopp|stopp bei der 10|in zwei schritten|in 2 schritten/i.test(
                              `${task.title} ${task.instruction}`
                            )

                          if (isZehnerstopp && task.items && task.items.length > 0) {
                            return (
                              <div className={`gap-3 my-2 ${
                                task.items.length === 1
                                  ? 'grid grid-cols-1 max-w-md mx-auto'
                                  : task.items.length === 2
                                  ? 'grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto'
                                  : task.items.length === 3
                                  ? 'grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-3xl mx-auto'
                                  : task.items.length === 4
                                  ? 'grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-full mx-auto'
                                  : 'flex flex-wrap justify-center gap-3 max-w-full mx-auto'
                              }`}>
                                {task.items.map((item, iIdx) => {
                                  const data = parseZehnerstoppItemData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <ZehnerstoppCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isAufgabenfamilien =
                            task.type === 'aufgabenfamilien' ||
                            /aufgabenfamilie|tausch-?\s*und\s*umkehraufgabe|tausch-?\s*&\s*umkehraufgabe/i.test(
                              `${task.title} ${task.instruction}`
                            )

                          if (isAufgabenfamilien && task.items && task.items.length > 0) {
                            return (
                              <div className={`gap-3 my-2 ${
                                task.items.length === 1
                                  ? 'grid grid-cols-1 max-w-[240px] mx-auto'
                                  : task.items.length === 2
                                  ? 'grid grid-cols-1 sm:grid-cols-2 max-w-md mx-auto'
                                  : task.items.length === 3
                                  ? 'grid grid-cols-1 sm:grid-cols-3 max-w-2xl mx-auto'
                                  : task.items.length === 4
                                  ? 'grid grid-cols-2 sm:grid-cols-4 max-w-full mx-auto gap-2.5'
                                  : 'flex flex-wrap justify-center gap-2.5 sm:gap-3.5 max-w-full mx-auto'
                              }`}>
                                {task.items.map((item, iIdx) => {
                                  const data = parseAufgabenfamilieItemData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <AufgabenfamilieCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isWochentage =
                            task.type === 'wochentage' ||
                            /wochentag|gestern.*heute.*morgen/i.test(`${task.title} ${task.instruction}`)

                          if (isWochentage && task.items && task.items.length > 0) {
                            return (
                              <div className={`gap-3 my-2 ${
                                task.items.length === 1
                                  ? 'grid grid-cols-1 max-w-xs mx-auto'
                                  : task.items.length === 2
                                  ? 'grid grid-cols-1 sm:grid-cols-2 max-w-md mx-auto gap-3'
                                  : task.items.length === 3
                                  ? 'grid grid-cols-1 sm:grid-cols-3 max-w-2xl mx-auto gap-3'
                                  : task.items.length === 4
                                  ? 'grid grid-cols-2 sm:grid-cols-4 max-w-full mx-auto gap-2 sm:gap-3'
                                  : 'flex flex-wrap justify-center gap-2.5 sm:gap-3 max-w-full mx-auto'
                              }`}>
                                {task.items.map((item, iIdx) => {
                                  const data = parseWochentagItemData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <WochentageCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // ── KLASSE 3: DETERMINISTISCHE CARDS & SVGS ──────────────────
                          // 3.1 Schriftliches Rechnen im Karopapier-Kästchenraster
                          const isWrittenCalc =
                            task.type === 'schriftlich_addition' ||
                            task.type === 'schriftlich_subtraktion' ||
                            task.type === 'schriftlich_fehlende_ziffern' ||
                            task.type === 'ueberschlag_kontrolle' ||
                            task.type === 'geld_schriftlich'

                          if (isWrittenCalc && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 print:grid-cols-2 gap-4 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseWrittenCalcGridItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <WrittenCalcGridCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 3.2 Stellenwerttafel (H | Z | E) & Zahlwörter
                          if (task.type === 'stellenwert_hze' && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseStellenwertHZEItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <StellenwertHZECard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 3.3 Tausenderbuch & Hunderterplatten (Dienes)
                          if (task.type === 'dienes_tausender' && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseDienesTausenderItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <DienesTausenderCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 3.4 Nachbarzahlen im ZR 1.000 (NH | NZ | V | Zahl | N | NZ | NH)
                          if (task.type === 'nachbarzahlen_k3' && task.items && task.items.length > 0) {
                            return (
                              <div className="space-y-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseNachbarzahlenK3ItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <NachbarzahlenK3Card
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 3.5 Zahlenstrahl bis 1.000
                          if (task.type === 'zahlenstrahl_1000' && task.items && task.items.length > 0) {
                            const data = parseZahlenstrahl1000ItemData(task.items[0])
                            if (data) {
                              return (
                                <div className="my-2">
                                  <Zahlenstrahl1000Card
                                    data={data}
                                    isSolution={false}
                                    colorMode={colorMode}
                                  />
                                </div>
                              )
                            }
                          }

                          // 3.6 Halbschriftliche Addition & Subtraktion (3 Schritte)
                          if (task.type === 'halbschriftlich_k3' && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseHalbschriftlichK3ItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <HalbschriftlichK3Card
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 3.7 Halbschriftliche Multiplikation (in Schritten)
                          if (task.type === 'halbschriftlich_multiplikation' && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseHalbschriftlichMultItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <HalbschriftlichMultCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 3.8 Würfelnetze erkennen
                          if (task.type === 'wuerfelnetze' && task.items && task.items.length > 0) {
                            const netItems = task.items
                              .map((it, idx) => parseWuerfelnetzItemData(it, idx))
                              .filter((it): it is WuerfelnetzItemData => Boolean(it))
                            if (netItems.length > 0) {
                              return (
                                <div className="my-2">
                                  <WuerfelnetzeCard
                                    items={netItems}
                                    isSolution={false}
                                    colorMode={colorMode}
                                  />
                                </div>
                              )
                            }
                          }

                          // 3.9 Würfelgebäude & 3D-Baupläne
                          if (task.type === 'wuerfelgebaeude_bauplan' && task.items && task.items.length > 0) {
                            return (
                              <div className="space-y-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseWuerfelgebaeudeItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <WuerfelgebaeudeCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 3.10 Rechte Winkel & Parallele Linien
                          if (task.type === 'rechte_winkel_parallelen' && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseRechtWinkelItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <RechteWinkelParallelenCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 3.11 Waagen ablesen & bis 1 kg ergänzen
                          if (task.type === 'waagen_ablesen' && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseWaageItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <WaagenAblesenCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 3.12 Messbecher ablesen & Hohlmaße
                          if (task.type === 'messbecher_ablesen' && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseMessbecherItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <MessbecherAblesenCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 3.13 Zeitpunkt & Fahrtdauer (Fahrplantabelle)
                          if (task.type === 'zeitpunkt_zeitdauer' && task.items && task.items.length > 0) {
                            const fahrplanRows = task.items
                              .map((it, idx) => parseFahrplanItemData(it, idx))
                              .filter((it): it is FahrplanItemData => Boolean(it))
                            if (fahrplanRows.length > 0) {
                              return (
                                <div className="my-2">
                                  <FahrplanCard
                                    items={fahrplanRows}
                                    isSolution={false}
                                    colorMode={colorMode}
                                  />
                                </div>
                              )
                            }
                          }

                          // 3.14 Wahrscheinlichkeit (Urne mit Kugeln)
                          if (task.type === 'wahrscheinlichkeit_k3' && task.items && task.items.length > 0) {
                            return (
                              <div className="space-y-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseWahrscheinlichkeitItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <WahrscheinlichkeitCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isHundertertafel =
                            task.type === 'hundertertafel' ||
                            task.type === 'hunderterfeld_punkte' ||
                            task.type === 'stellenwert_ze' ||
                            (task.type === 'punktefeld' && !/zwanziger/i.test(`${task.title} ${task.instruction}`)) ||
                            /hundertertafel|hunderterfeld|10x10|stellenwert/i.test(
                              `${task.title} ${task.instruction}`
                            )

                          if (isHundertertafel && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseHundertertafelItemData(item, iIdx)
                                  if (!data) {
                                    if (typeof item === 'object' && item !== null) {
                                      const obj = item as Record<string, unknown>
                                      const count = Number(obj.count ?? obj.highlightCount ?? 20)
                                      return (
                                        <HundertertafelCard
                                          key={iIdx}
                                          data={{
                                            type: 'punktefeld',
                                            prefix: `${iIdx + 1})`,
                                            count,
                                            zehner: Math.floor(count / 10),
                                            einer: count % 10,
                                            ergaenzung100: 100 - count,
                                          }}
                                          isSolution={false}
                                          colorMode={colorMode}
                                        />
                                      )
                                    }
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <HundertertafelCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isHalbschriftlich =
                            task.type === 'halbschriftlich' ||
                            /halbschriftlich|in zwei schritten|in 2 schritten.*zehner/i.test(
                              `${task.title} ${task.instruction}`
                            )

                          if (isHalbschriftlich && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseHalbschriftlichItemData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <HalbschriftlichCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isEinmaleins =
                            task.type === 'einmaleins' ||
                            /einmaleins|malreihen|punktefeld & malfamilie|tauschaufgabe.*umkehraufgabe/i.test(
                              `${task.title} ${task.instruction}`
                            )

                          if (isEinmaleins && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseEinmaleinsItemData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <EinmaleinsCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isGeldKomma =
                            task.type === 'geld_komma' ||
                            /geld.*komma|kommaschreibweise|euro und cent mit komma/i.test(
                              `${task.title} ${task.instruction}`
                            )

                          if (isGeldKomma && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseGeldKlasse2ItemData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <GeldKlasse2Card
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isLaengenMessen =
                            task.type === 'laengen_messen' ||
                            /längen messen|strecken.*messen|meter und zentimeter/i.test(
                              `${task.title} ${task.instruction}`
                            )

                          if (isLaengenMessen && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseLaengenMessenItemData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <LaengenMessenCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isGeometrieKoerper =
                            task.type === 'geometrie_koerper' ||
                            /körper.*symmetrie|geometrische körper|körper & symmetrie/i.test(
                              `${task.title} ${task.instruction}`
                            )

                          if (isGeometrieKoerper && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseGeometrieKoerperItemData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <KoerperCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 2.1 Zehnerstangen & Einerwürfel (Bündeln)
                          const isDienesBlocks = task.type === 'zehnerstangen_einer'
                          if (isDienesBlocks && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseDienesBlockItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <DienesBlocksCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 2.2 Nachbarzahlen im ZR 100
                          const isNachbarzahlenK2 = task.type === 'nachbarzahlen_k2'
                          if (isNachbarzahlenK2 && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseNachbarzahlenK2ItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <NachbarzahlenK2Card
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 2.3 1x1 Punktefelder (Plus- & Malaufgabe)
                          const isMultiplicationArray = task.type === 'einmaleins_punktefeld'
                          if (isMultiplicationArray && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseMultiplicationArrayItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <MultiplicationArrayCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 2.4 Geteilt-Aufgaben (Division)
                          const isDivision = task.type === 'division'
                          if (isDivision && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseDivisionItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <DivisionCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 2.5 Tausch- & Umkehraufgaben (1x1)
                          const isEinmaleinsUmkehr = task.type === 'einmaleins_umkehr'
                          if (isEinmaleinsUmkehr && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseEinmaleinsUmkehrItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <EinmaleinsUmkehrCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 2.6 Achsensymmetrie (Spiegelbilder zeichnen)
                          const isAchsensymmetrie = task.type === 'achsensymmetrie'
                          if (isAchsensymmetrie && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseAchsensymmetrieItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <AchsensymmetrieCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 2.7 Körpernetze & Ansichten
                          const isKoerpernetze = task.type === 'koerpernetze'
                          if (isKoerpernetze && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseKoerpernetzItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <KoerpernetzeCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 2.8 Längen umrechnen (m & cm)
                          const isLaengenUmrechnen = task.type === 'laengen_umrechnen'
                          if (isLaengenUmrechnen && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseLaengenUmrechnenItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <LaengenUmrechnenCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 2.9 Längen vergleichen & berechnen
                          const isLaengenVergleich = task.type === 'laengen_vergleich'
                          if (isLaengenVergleich && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseLaengenVergleichItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <LaengenVergleichCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 2.10 Rechnen mit Geld & Rückgeld
                          const isGeldRueckgeld = task.type === 'geld_rueckgeld'
                          if (isGeldRueckgeld && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseGeldRueckgeldItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <GeldRueckgeldCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 2.11 Uhrzeiten ablesen (analog & digital)
                          const isAnalogClockK2 = task.type === 'uhrzeit_ablesen_k2'
                          if (isAnalogClockK2 && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseAnalogClockGrade2ItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <AnalogClockGrade2Card
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 2.12 Zeiger einzeichnen (Stunde & Minute)
                          const isZeigerEinzeichnenK2 = task.type === 'uhrzeit_zeichnen_k2'
                          if (isZeigerEinzeichnenK2 && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseZeigerEinzeichnenGrade2ItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <ZeigerEinzeichnenGrade2Card
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 2.13 Zeitspannen & Zeitdauer berechnen
                          const isZeitspannenK2 = task.type === 'zeitspannen_k2'
                          if (isZeitspannenK2 && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseZeitspannenGrade2ItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <ZeitspannenGrade2Card
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 2.14 Säulendiagramm ablesen
                          const isDiagrammK2 = task.type === 'diagramm_k2'
                          if (isDiagrammK2 && task.items && task.items.length > 0) {
                            return (
                              <div className="my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseDiagrammKlasse2ItemData(item)
                                  if (!data) return null
                                  return (
                                    <BarChartKlasse2Card
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 2.15 Tabelle auswerten & ergänzen
                          const isTabelleK2 = task.type === 'tabelle_k2'
                          if (isTabelleK2 && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseTabelleKlasse2ItemData(item, iIdx)
                                  if (!data) return null
                                  return (
                                    <TabelleKlasse2Card
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          // 2.16 Kombinatorik & Zufall
                          const isKombinatorikK2 = task.type === 'kombinatorik_k2'
                          if (isKombinatorikK2 && task.items && task.items.length > 0) {
                            return (
                              <div className="my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseKombinatorikKlasse2ItemData(item)
                                  if (!data) return null
                                  return (
                                    <KombinatorikKlasse2Card
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isSchriftlich =
                            task.type === 'schriftlich' ||
                            /schriftlich/i.test(`${task.title} ${task.instruction}`)

                          if (isSchriftlich && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseSchriftlichItemData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <SchriftlichCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isRunden =
                            task.type === 'runden' ||
                            /runden/i.test(`${task.title} ${task.instruction}`)

                          if (isRunden && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseRundenItemData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <RundenCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isFlaecheUmfang =
                            task.type === 'flaeche_umfang' ||
                            /flächeninhalt|umfang/i.test(`${task.title} ${task.instruction}`)

                          if (isFlaecheUmfang && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseFlaecheUmfangItemData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <FlaecheUmfangCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isGewichteHohlmasse =
                            task.type === 'gewichte_hohlmasse' ||
                            /gewicht|hohlmaß|hohlmass/i.test(`${task.title} ${task.instruction}`)

                          if (isGewichteHohlmasse && task.items && task.items.length > 0) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                                {task.items.map((item, iIdx) => {
                                  const data = parseGewichteHohlmasseItemData(item, iIdx)
                                  if (!data) {
                                    return (
                                      <div key={iIdx} className="p-2 border rounded font-mono">
                                        {renderWorksheetItem(String(item), task.title, task.instruction)}
                                      </div>
                                    )
                                  }
                                  return (
                                    <GewichteHohlmasseCard
                                      key={iIdx}
                                      data={data}
                                      isSolution={false}
                                      colorMode={colorMode}
                                    />
                                  )
                                })}
                              </div>
                            )
                          }

                          const isDiagramm =
                            task.type === 'tabellen' ||
                            /diagramm|säulendiagramm/i.test(`${task.title} ${task.instruction}`)

                          if (isDiagramm && task.items && task.items.length > 0) {
                            const data = parseDiagrammItemData(task.items[0])
                            if (data) {
                              return (
                                <div className="my-2">
                                  <DiagrammCard
                                    data={data}
                                    isSolution={false}
                                    colorMode={colorMode}
                                  />
                                </div>
                              )
                            }
                          }

                          if (task.items && task.items.length > 0) {
                            return (
                              <div className={`gap-y-2 gap-x-6 text-lg font-medium font-mono my-2 ${
                                task.items.length === 1
                                  ? 'grid grid-cols-1 max-w-sm mx-auto'
                                  : 'grid grid-cols-2'
                              }`}>
                                {task.items.map((item, iIdx) => {
                                  const isNeighbor =
                                    /nachbar|vorgänger|nachfolger|zahlenstrahl/i.test(`${task.title} ${task.instruction}`) ||
                                    /_+\s*[,|\s]\s*\d+\s*[,|\s]\s*_+/.test(String(item))

                                  return (
                                    <div
                                      key={iIdx}
                                      contentEditable={true}
                                      suppressContentEditableWarning={true}
                                      className={`flex items-center outline-none hover:bg-blue-50/30 focus:bg-white focus:ring-1 focus:ring-blue-400 rounded transition-all cursor-text ${
                                        isNeighbor ? 'py-1 px-1' : 'border-b border-gray-200/80 pb-1 px-1'
                                      }`}
                                      title="Klicken zum Bearbeiten"
                                    >
                                      {renderWorksheetItem(String(item), task.title, task.instruction)}
                                    </div>
                                  )
                                })}
                              </div>
                            )
                          }

                          return null
                        })()}

                        {/* Bild-Position: Zwischen Aufgabe 1 und 2 */}
                        {index === 0 && imagePosition === 'betweenTask1And2' && activeImageUrl && (
                          <div className="my-3 py-2 border-y border-dashed border-gray-200 flex items-center justify-center">
                            {renderImage('betweenTask1And2')}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })()}

              {/* Bild-Position: Unten auf dem Blatt */}
              {((!hasMultiplePages && !isSecondPage) || (hasMultiplePages && isSecondPage)) && imagePosition === 'bottom' && activeImageUrl && (
                <div className="mt-4 pt-2 flex items-center justify-center">
                  {renderImage('bottom')}
                </div>
              )}
            </div>

            {/* ── 4. SCHLANKE FUßZEILE ────────────────────────── */}
            <div className="border-t border-gray-300 pt-2 mt-4 flex justify-between items-center text-xs text-gray-400 font-sans">
              <span>Schul-Assistent Grundschule · LehrplanPLUS</span>
              <span>{hasMultiplePages ? `Seite ${pageIdx + 1} von 2` : 'Seite 1'}</span>
            </div>
          </div>
        )
      })
    }

        {/* ═══════════════════════════════════════════════════════════
            BLATT 2: LÖSUNGSBLATT FÜR DIE LEHRKRAFT
            ═══════════════════════════════════════════════════════════ */}
        {(viewTab === 'solution' || printBoth) &&
          pages.map((pageTasks, pageIdx) => {
            const isSecondPage = pageIdx === 1
            const totalPageItems = pageTasks.reduce((acc, t) => acc + (t.items?.length || 1), 0)
            const isDense = totalPageItems > 8 || pageTasks.length > 3

            return (
              <div
                key={`solution-page-${pageIdx}`}
                className={`
                  arbeitsblatt-page w-full max-w-[794px] bg-white text-gray-900 rounded-xs shadow-xl border border-emerald-300
                  p-6 sm:p-8 min-h-[1050px] flex flex-col justify-between font-sans
                  ${pageIdx === 0 && printBoth ? 'print-page-break' : ''}
                  ${isSecondPage ? 'print-page-break' : ''}
                  ${viewTab === 'student' && !printBoth ? 'hidden' : 'block'}
                `}
              >
                <div>
                  {/* Kopfzeile Lösungsblatt */}
                  <div className="border-b-2 border-emerald-600 pb-2 mb-4 text-xs text-gray-700 flex justify-between items-baseline">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>LÖSUNGSBLATT FÜR DIE LEHRKRAFT (Musterlösung{isSecondPage ? ' · Fortsetzung' : ''})</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h1 className="font-serif font-bold text-gray-950 text-xl sm:text-2xl tracking-tight">
                      Lösungen: {parsed.title} {isSecondPage ? <span className="text-gray-400 text-base sm:text-lg font-normal font-sans">(Fortsetzung)</span> : null}
                    </h1>
                    {!isSecondPage && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Nur zur unterrichtlichen Verwendung · Nicht an Schüler aushändigen
                      </p>
                    )}
                  </div>

                  {/* Strukturierte Lösungen nach Aufgabenblöcken */}
                  <div className={isDense ? "space-y-3" : "space-y-4"}>
                    {pageTasks.map((task, localIndex) => {
                      const index = isSecondPage ? splitIndex + localIndex : localIndex
                      return (
                        <div
                          key={task.id || index}
                          className="task-block border border-gray-200 rounded-lg p-3 sm:p-3.5 bg-slate-50/60 font-sans break-inside-avoid print:break-inside-avoid"
                        >
                    <div className="flex items-center gap-2 mb-2 font-bold text-sm text-gray-900 border-b border-gray-200 pb-1">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">
                        {task.id || index + 1}
                      </span>
                      <span>{task.title}</span>
                    </div>

                    {task.instruction && (
                      <p className="italic text-xs text-gray-500 mb-2">
                        {task.instruction}
                      </p>
                    )}

                    {/* Rechenhäuser ODER Rechendreiecke im grafischen Grid ODER Standard-Lösungs-Items */}
                    {(() => {
                      const isRechenhaus =
                        task.type === 'rechenhaeuser' ||
                        task.type === 'rechenhaus' ||
                        /rechenhaus|rechenhäuser|zahlenhaus|zahlenhäuser/i.test(`${task.title} ${task.instruction}`)

                      if (isRechenhaus && task.items && task.items.length > 0) {
                        return (
                          <div className={`gap-3 sm:gap-4.5 justify-items-center my-3 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 ${
                            task.items.length === 1
                              ? 'flex justify-center max-w-[200px] mx-auto'
                              : task.items.length === 2
                              ? 'grid grid-cols-2 max-w-[420px] mx-auto'
                              : task.items.length === 3
                              ? 'grid grid-cols-1 sm:grid-cols-3 max-w-2xl mx-auto'
                              : task.items.length === 4
                              ? 'grid grid-cols-2 sm:grid-cols-4 max-w-full mx-auto'
                              : 'flex flex-wrap justify-center gap-3 sm:gap-4 max-w-full mx-auto'
                          }`}>
                            {task.items.map((item, iIdx) => {
                              const hausData = parseRechenhausData(item, iIdx)
                              if (!hausData) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <RechenhausItem
                                  key={iIdx}
                                  data={hausData}
                                  isSolution={true}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isRechendreieck =
                        task.type === 'rechendreiecke' ||
                        /rechendreieck/i.test(`${task.title} ${task.instruction}`)

                      if (isRechendreieck && task.items && task.items.length > 0) {
                        return (
                          <div className={`gap-3 sm:gap-4.5 justify-items-center my-3 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 ${
                            task.items.length === 1
                              ? 'flex justify-center max-w-[220px] mx-auto'
                              : task.items.length === 2
                              ? 'grid grid-cols-2 max-w-[460px] mx-auto'
                              : task.items.length === 3
                              ? 'grid grid-cols-1 sm:grid-cols-3 max-w-2xl mx-auto'
                              : task.items.length === 4
                              ? 'grid grid-cols-2 sm:grid-cols-4 max-w-full mx-auto'
                              : 'flex flex-wrap justify-center gap-3 sm:gap-4 max-w-full mx-auto'
                          }`}>
                            {task.items.map((item, iIdx) => {
                              const dreieckData = parseRechendreieckData(item, iIdx)
                              if (!dreieckData) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <RechendreieckItem
                                  key={iIdx}
                                  data={dreieckData}
                                  isSolution={true}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isZahlenmauer =
                        task.type === 'zahlenmauern' ||
                        /zahlenmauer|rechenmauer/i.test(`${task.title} ${task.instruction}`)

                      if (isZahlenmauer && task.items && task.items.length > 0) {
                        return (
                          <div className={`gap-3 sm:gap-4.5 justify-items-center my-3 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 ${
                            task.items.length === 1
                              ? 'flex justify-center max-w-[240px] mx-auto'
                              : task.items.length === 2
                              ? 'grid grid-cols-2 max-w-[500px] mx-auto'
                              : task.items.length === 3
                              ? 'grid grid-cols-1 sm:grid-cols-3 max-w-2xl mx-auto'
                              : task.items.length === 4
                              ? 'grid grid-cols-2 sm:grid-cols-4 max-w-full mx-auto'
                              : 'flex flex-wrap justify-center gap-3 sm:gap-4 max-w-full mx-auto'
                          }`}>
                            {task.items.map((item, iIdx) => {
                              const mauerData = parseZahlenmauerData(item, iIdx)
                              if (!mauerData) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <ZahlenmauerSVG
                                  key={iIdx}
                                  data={mauerData}
                                  isSolution={true}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isGeldZaehlen =
                        task.type === 'geld_zaehlen' ||
                        /wie viel geld|münzen und scheine/i.test(`${task.title} ${task.instruction}`)

                      if (isGeldZaehlen && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 my-3 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-2">
                            {task.items.map((item, iIdx) => {
                              const data = parseGeldZaehlenData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <GeldZaehlenItem
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isGeldRechnen =
                        task.type === 'geld_rechnen' ||
                        /rechnen mit euro|rechnen mit geld/i.test(`${task.title} ${task.instruction}`)

                      if (isGeldRechnen && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-base font-mono my-3 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-2">
                            {task.items.map((item, iIdx) => {
                              const data = parseGeldRechnenData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <GeldRechnenItem
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isGeldVergleich =
                        task.type === 'geld_vergleich' ||
                        ((/vergleich|größer.*kleiner|< > =/i.test(`${task.title} ${task.instruction}`)) &&
                          /€|cent|ct|euro|geld/i.test(`${task.title} ${task.instruction} ${JSON.stringify(task.items || '')}`))

                      if (isGeldVergleich && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-base font-mono my-3 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-2">
                            {task.items.map((item, iIdx) => {
                              const data = parseGeldVergleichData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <GeldVergleichItem
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isUhrzeitAblesen =
                        task.type === 'uhrzeit_ablesen' ||
                        /wie spät ist es|uhrzeiten ablesen/i.test(`${task.title} ${task.instruction}`)

                      if (isUhrzeitAblesen && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-2">
                            {task.items.map((item, iIdx) => {
                              const data = parseUhrzeitAblesenData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <UhrzeitAblesenItem
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isUhrzeitZeichnen =
                        task.type === 'uhrzeit_zeichnen' ||
                        /zeiger einzeichnen|stundenzeiger ein/i.test(`${task.title} ${task.instruction}`)

                      if (isUhrzeitZeichnen && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-2">
                            {task.items.map((item, iIdx) => {
                              const data = parseUhrzeitZeichnenData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <UhrzeitZeichnenItem
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isUhrzeitRechnen =
                        task.type === 'uhrzeit_rechnen' ||
                        /rechnen mit stunden|zeitspannen/i.test(`${task.title} ${task.instruction}`)

                      if (isUhrzeitRechnen && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-base font-mono my-3 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-2">
                            {task.items.map((item, iIdx) => {
                              const data = parseUhrzeitRechnenData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <UhrzeitRechnenItem
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isStrichlisteAblesen =
                        task.type === 'strichliste_ablesen' ||
                        /strichlisten? ablesen/i.test(`${task.title} ${task.instruction}`)

                      if (isStrichlisteAblesen && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-base font-mono my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseStrichlisteAblesenData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <StrichlisteAblesenItem
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isStrichlisteZeichnen =
                        task.type === 'strichliste_zeichnen' ||
                        /strichlisten? zeichnen/i.test(`${task.title} ${task.instruction}`)

                      if (isStrichlisteZeichnen && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-base font-mono my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseStrichlisteZeichnenData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <StrichlisteZeichnenItem
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isStrichlisteZaehlen =
                        task.type === 'strichliste_zaehlen' ||
                        /zählen und häufigkeiten|formen im kasten/i.test(`${task.title} ${task.instruction}`)

                      if (isStrichlisteZaehlen && task.items && task.items.length > 0) {
                        const data = parseStrichlisteZaehlenData(task.items[0])
                        if (data) {
                          return (
                            <div className="my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                              <StrichlisteZaehlenItem
                                data={data}
                                isSolution={true}
                                colorMode={colorMode}
                              />
                            </div>
                          )
                        }
                      }

                      const isGeometrieFormenZaehlen =
                        task.type === 'geometrie_formen_zaehlen' ||
                        /formen (erkennen und )?zählen/i.test(`${task.title} ${task.instruction}`)

                      if (isGeometrieFormenZaehlen && task.items && task.items.length > 0) {
                        const data = parseGeometrieFormenZaehlenData(task.items[0])
                        if (data) {
                          return (
                            <div className="my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                              <GeometrieFormenZaehlenItem
                                data={data}
                                isSolution={true}
                                colorMode={colorMode}
                              />
                            </div>
                          )
                        }
                      }

                      const isGeometrieMuster =
                        task.type === 'geometrie_muster_fortsetzen' ||
                        /muster (fortsetzen|fortführen)/i.test(`${task.title} ${task.instruction}`)

                      if (isGeometrieMuster && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseGeometrieMusterData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <GeometrieMusterItem
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isGeometriePunktgitter =
                        task.type === 'geometrie_punktgitter' ||
                        /punktgitter|geobrett/i.test(`${task.title} ${task.instruction}`)

                      if (isGeometriePunktgitter && task.items && task.items.length > 0) {
                        return (
                          <div className={`gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3 ${
                            task.items.length === 1
                              ? 'flex justify-center max-w-[240px] mx-auto'
                              : task.items.length === 2
                              ? 'grid grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto gap-4'
                              : task.items.length === 3
                              ? 'grid grid-cols-1 sm:grid-cols-3 max-w-3xl mx-auto gap-3'
                              : task.items.length === 4
                              ? 'grid grid-cols-2 sm:grid-cols-4 max-w-full mx-auto gap-2.5'
                              : 'flex flex-wrap justify-center gap-3 max-w-full mx-auto'
                          }`}>
                            {task.items.map((item, iIdx) => {
                              const data = parseGeometriePunktgitterData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <GeometriePunktgitterItem
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isRaumGitterOrientierung =
                        task.type === 'raum_gitter_orientierung' ||
                        /wo befinden sich die formen|3x3-gitter/i.test(`${task.title} ${task.instruction}`)

                      if (isRaumGitterOrientierung && task.items && task.items.length > 0) {
                        const data = parseRaumGitterOrientierungData(task.items[0])
                        if (data) {
                          return (
                            <div className="my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                              <RaumGitterOrientierungItem
                                data={data}
                                isSolution={true}
                                colorMode={colorMode}
                              />
                            </div>
                          )
                        }
                      }

                      const isRaumPfeileZaehlen =
                        task.type === 'raum_pfeile_zaehlen' ||
                        /links oder rechts|pfeile (zählen|erkennen)|richtungen erkennen/i.test(
                          `${task.title} ${task.instruction}`
                        )

                      if (isRaumPfeileZaehlen && task.items && task.items.length > 0) {
                        const data = parseRaumPfeileZaehlenData(task.items[0])
                        if (data) {
                          return (
                            <div className="my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                              <RaumPfeileZaehlenItem
                                data={data}
                                isSolution={true}
                                colorMode={colorMode}
                              />
                            </div>
                          )
                        }
                      }

                      const isRaumGitterZeichnen =
                        task.type === 'raum_gitter_zeichnen' ||
                        /zeichne an die richtige stelle|an die richtige stelle/i.test(
                          `${task.title} ${task.instruction}`
                        )

                      if (isRaumGitterZeichnen && task.items && task.items.length > 0) {
                        const data = parseRaumGitterZeichnenData(task.items[0])
                        if (data) {
                          return (
                            <div className="my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                              <RaumGitterZeichnenItem
                                data={data}
                                isSolution={true}
                                colorMode={colorMode}
                              />
                            </div>
                          )
                        }
                      }

                      const isRechengeschichtenSol =
                        task.type === 'rechengeschichten' ||
                        /rechengeschichte/i.test(`${task.title} ${task.instruction}`)

                      if (isRechengeschichtenSol && task.items && task.items.length > 0) {
                        return (
                          <div className={`gap-4 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3 ${
                            task.items.length === 1
                              ? 'grid grid-cols-1 max-w-lg mx-auto'
                              : 'grid grid-cols-1 sm:grid-cols-2'
                          }`}>
                            {task.items.map((item, iIdx) => {
                              const data = parseRechengeschichteItemData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <RechengeschichteCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isZwanzigerfeldSol =
                        (task.type === 'zwanzigerfeld' ||
                         task.type === 'zehnerfeld' ||
                         /zwanzigerfeld|zehnerfeld|wendeplättchen/i.test(
                           `${task.title} ${task.instruction}`
                         )) &&
                        task.type !== 'hunderterfeld_punkte' &&
                        task.type !== 'hundertertafel' &&
                        task.type !== 'einmaleins_punktefeld' &&
                        !/hunderterfeld|hundertertafel|10x10|einmaleins/i.test(
                          `${task.title} ${task.instruction}`
                        )

                      if (isZwanzigerfeldSol && task.items && task.items.length > 0) {
                        return (
                          <div className={`gap-4 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3 ${
                            task.items.length === 1
                              ? 'grid grid-cols-1 max-w-md mx-auto'
                              : 'grid grid-cols-1 sm:grid-cols-2'
                          }`}>
                            {task.items.map((item, iIdx) => {
                              const data = parseZwanzigerfeldItemData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <ZwanzigerfeldCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isSchuettelboxenSol =
                        task.type === 'schuettelboxen' ||
                        /schüttelbox|schuettelbox/i.test(`${task.title} ${task.instruction}`)

                      if (isSchuettelboxenSol && task.items && task.items.length > 0) {
                        return (
                          <div className={`gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3 ${
                            task.items.length === 1
                              ? 'grid grid-cols-1 max-w-[260px] mx-auto'
                              : task.items.length === 2
                              ? 'grid grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto'
                              : task.items.length === 3
                              ? 'grid grid-cols-1 sm:grid-cols-3 max-w-3xl mx-auto'
                              : task.items.length === 4
                              ? 'grid grid-cols-2 sm:grid-cols-4 max-w-full mx-auto gap-2.5'
                              : 'flex flex-wrap justify-center gap-2.5 sm:gap-3.5 max-w-full mx-auto'
                          }`}>
                            {task.items.map((item, iIdx) => {
                              const data = parseSchuettelboxItemData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <SchuettelboxCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isZehnerstoppSol =
                        task.type === 'zehnerstopp' ||
                        /zehnerstopp|stopp bei der 10|in zwei schritten|in 2 schritten/i.test(
                          `${task.title} ${task.instruction}`
                        )

                      if (isZehnerstoppSol && task.items && task.items.length > 0) {
                        return (
                          <div className={`gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3 ${
                            task.items.length === 1
                              ? 'grid grid-cols-1 max-w-md mx-auto'
                              : task.items.length === 2
                              ? 'grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto'
                              : task.items.length === 3
                              ? 'grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-3xl mx-auto'
                              : task.items.length === 4
                              ? 'grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-full mx-auto'
                              : 'flex flex-wrap justify-center gap-3 max-w-full mx-auto'
                          }`}>
                            {task.items.map((item, iIdx) => {
                              const data = parseZehnerstoppItemData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <ZehnerstoppCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isAufgabenfamilienSol =
                        task.type === 'aufgabenfamilien' ||
                        /aufgabenfamilie|tausch-?\s*und\s*umkehraufgabe|tausch-?\s*&\s*umkehraufgabe/i.test(
                          `${task.title} ${task.instruction}`
                        )

                      if (isAufgabenfamilienSol && task.items && task.items.length > 0) {
                        return (
                          <div className={`gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3 ${
                            task.items.length === 1
                              ? 'grid grid-cols-1 max-w-[240px] mx-auto'
                              : task.items.length === 2
                              ? 'grid grid-cols-1 sm:grid-cols-2 max-w-md mx-auto'
                              : task.items.length === 3
                              ? 'grid grid-cols-1 sm:grid-cols-3 max-w-2xl mx-auto'
                              : task.items.length === 4
                              ? 'grid grid-cols-2 sm:grid-cols-4 max-w-full mx-auto gap-2.5'
                              : 'flex flex-wrap justify-center gap-2.5 sm:gap-3.5 max-w-full mx-auto'
                          }`}>
                            {task.items.map((item, iIdx) => {
                              const data = parseAufgabenfamilieItemData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <AufgabenfamilieCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isWochentageSol =
                        task.type === 'wochentage' ||
                        /wochentag|gestern.*heute.*morgen/i.test(`${task.title} ${task.instruction}`)

                      if (isWochentageSol && task.items && task.items.length > 0) {
                        return (
                          <div className={`gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3 ${
                            task.items.length === 1
                              ? 'grid grid-cols-1 max-w-xs mx-auto'
                              : task.items.length === 2
                              ? 'grid grid-cols-1 sm:grid-cols-2 max-w-md mx-auto gap-3'
                              : task.items.length === 3
                              ? 'grid grid-cols-1 sm:grid-cols-3 max-w-2xl mx-auto gap-3'
                              : task.items.length === 4
                              ? 'grid grid-cols-2 sm:grid-cols-4 max-w-full mx-auto gap-2 sm:gap-3'
                              : 'flex flex-wrap justify-center gap-2.5 sm:gap-3 max-w-full mx-auto'
                          }`}>
                            {task.items.map((item, iIdx) => {
                              const data = parseWochentagItemData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <WochentageCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // ── KLASSE 3: DETERMINISTISCHE CARDS & SVGS (LÖSUNG) ────────
                      // 3.1 Schriftliches Rechnen im Karopapier-Kästchenraster
                      const isWrittenCalcSol =
                        task.type === 'schriftlich_addition' ||
                        task.type === 'schriftlich_subtraktion' ||
                        task.type === 'schriftlich_fehlende_ziffern' ||
                        task.type === 'ueberschlag_kontrolle' ||
                        task.type === 'geld_schriftlich'

                      if (isWrittenCalcSol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 print:grid-cols-2 gap-4 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseWrittenCalcGridItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <WrittenCalcGridCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 3.2 Stellenwerttafel (H | Z | E) & Zahlwörter
                      if (task.type === 'stellenwert_hze' && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseStellenwertHZEItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <StellenwertHZECard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 3.3 Tausenderbuch & Hunderterplatten (Dienes)
                      if (task.type === 'dienes_tausender' && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseDienesTausenderItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <DienesTausenderCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 3.4 Nachbarzahlen im ZR 1.000 (NH | NZ | V | Zahl | N | NZ | NH)
                      if (task.type === 'nachbarzahlen_k3' && task.items && task.items.length > 0) {
                        return (
                          <div className="space-y-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseNachbarzahlenK3ItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <NachbarzahlenK3Card
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 3.5 Zahlenstrahl bis 1.000
                      if (task.type === 'zahlenstrahl_1000' && task.items && task.items.length > 0) {
                        const data = parseZahlenstrahl1000ItemData(task.items[0])
                        if (data) {
                          return (
                            <div className="my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                              <Zahlenstrahl1000Card
                                data={data}
                                isSolution={true}
                                colorMode={colorMode}
                              />
                            </div>
                          )
                        }
                      }

                      // 3.6 Halbschriftliche Addition & Subtraktion (3 Schritte)
                      if (task.type === 'halbschriftlich_k3' && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseHalbschriftlichK3ItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <HalbschriftlichK3Card
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 3.7 Halbschriftliche Multiplikation (in Schritten)
                      if (task.type === 'halbschriftlich_multiplikation' && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseHalbschriftlichMultItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <HalbschriftlichMultCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 3.8 Würfelnetze erkennen
                      if (task.type === 'wuerfelnetze' && task.items && task.items.length > 0) {
                        const netItems = task.items
                          .map((it, idx) => parseWuerfelnetzItemData(it, idx))
                          .filter((it): it is WuerfelnetzItemData => Boolean(it))
                        if (netItems.length > 0) {
                          return (
                            <div className="my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                              <WuerfelnetzeCard
                                items={netItems}
                                isSolution={true}
                                colorMode={colorMode}
                              />
                            </div>
                          )
                        }
                      }

                      // 3.9 Würfelgebäude & 3D-Baupläne
                      if (task.type === 'wuerfelgebaeude_bauplan' && task.items && task.items.length > 0) {
                        return (
                          <div className="space-y-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseWuerfelgebaeudeItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <WuerfelgebaeudeCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 3.10 Rechte Winkel & Parallele Linien
                      if (task.type === 'rechte_winkel_parallelen' && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseRechtWinkelItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <RechteWinkelParallelenCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 3.11 Waagen ablesen & bis 1 kg ergänzen
                      if (task.type === 'waagen_ablesen' && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseWaageItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <WaagenAblesenCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 3.12 Messbecher ablesen & Hohlmaße
                      if (task.type === 'messbecher_ablesen' && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseMessbecherItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <MessbecherAblesenCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 3.13 Zeitpunkt & Fahrtdauer (Fahrplantabelle)
                      if (task.type === 'zeitpunkt_zeitdauer' && task.items && task.items.length > 0) {
                        const fahrplanRows = task.items
                          .map((it, idx) => parseFahrplanItemData(it, idx))
                          .filter((it): it is FahrplanItemData => Boolean(it))
                        if (fahrplanRows.length > 0) {
                          return (
                            <div className="my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                              <FahrplanCard
                                items={fahrplanRows}
                                isSolution={true}
                                colorMode={colorMode}
                              />
                            </div>
                          )
                        }
                      }

                      // 3.14 Wahrscheinlichkeit (Urne mit Kugeln)
                      if (task.type === 'wahrscheinlichkeit_k3' && task.items && task.items.length > 0) {
                        return (
                          <div className="space-y-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseWahrscheinlichkeitItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <WahrscheinlichkeitCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isHundertertafelSol =
                        task.type === 'hundertertafel' ||
                        task.type === 'hunderterfeld_punkte' ||
                        task.type === 'stellenwert_ze' ||
                        (task.type === 'punktefeld' && !/zwanziger/i.test(`${task.title} ${task.instruction}`)) ||
                        /hundertertafel|hunderterfeld|10x10|stellenwert/i.test(
                          `${task.title} ${task.instruction}`
                        )

                      if (isHundertertafelSol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseHundertertafelItemData(item, iIdx)
                              if (!data) {
                                if (typeof item === 'object' && item !== null) {
                                  const obj = item as Record<string, unknown>
                                  const count = Number(obj.count ?? obj.highlightCount ?? 20)
                                  return (
                                    <HundertertafelCard
                                      key={iIdx}
                                      data={{
                                        type: 'punktefeld',
                                        prefix: `${iIdx + 1})`,
                                        count,
                                        zehner: Math.floor(count / 10),
                                        einer: count % 10,
                                        ergaenzung100: 100 - count,
                                      }}
                                      isSolution={true}
                                      colorMode={colorMode}
                                    />
                                  )
                                }
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <HundertertafelCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isHalbschriftlichSol =
                        task.type === 'halbschriftlich' ||
                        /halbschriftlich|in zwei schritten|in 2 schritten.*zehner/i.test(
                          `${task.title} ${task.instruction}`
                        )

                      if (isHalbschriftlichSol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseHalbschriftlichItemData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <HalbschriftlichCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isEinmaleinsSol =
                        task.type === 'einmaleins' ||
                        /einmaleins|malreihen|punktefeld & malfamilie|tauschaufgabe.*umkehraufgabe/i.test(
                          `${task.title} ${task.instruction}`
                        )

                      if (isEinmaleinsSol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseEinmaleinsItemData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <EinmaleinsCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isGeldKommaSol =
                        task.type === 'geld_komma' ||
                        /geld.*komma|kommaschreibweise|euro und cent mit komma/i.test(
                          `${task.title} ${task.instruction}`
                        )

                      if (isGeldKommaSol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseGeldKlasse2ItemData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <GeldKlasse2Card
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isLaengenMessenSol =
                        task.type === 'laengen_messen' ||
                        /längen messen|strecken.*messen|meter und zentimeter/i.test(
                          `${task.title} ${task.instruction}`
                        )

                      if (isLaengenMessenSol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseLaengenMessenItemData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <LaengenMessenCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isGeometrieKoerperSol =
                        task.type === 'geometrie_koerper' ||
                        /körper.*symmetrie|geometrische körper|körper & symmetrie/i.test(
                          `${task.title} ${task.instruction}`
                        )

                      if (isGeometrieKoerperSol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseGeometrieKoerperItemData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <KoerperCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 2.1 Zehnerstangen & Einerwürfel (Bündeln)
                      const isDienesBlocksSol = task.type === 'zehnerstangen_einer'
                      if (isDienesBlocksSol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseDienesBlockItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <DienesBlocksCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 2.2 Nachbarzahlen im ZR 100
                      const isNachbarzahlenK2Sol = task.type === 'nachbarzahlen_k2'
                      if (isNachbarzahlenK2Sol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseNachbarzahlenK2ItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <NachbarzahlenK2Card
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 2.3 1x1 Punktefelder (Plus- & Malaufgabe)
                      const isMultiplicationArraySol = task.type === 'einmaleins_punktefeld'
                      if (isMultiplicationArraySol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseMultiplicationArrayItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <MultiplicationArrayCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 2.4 Geteilt-Aufgaben (Division)
                      const isDivisionSol = task.type === 'division'
                      if (isDivisionSol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseDivisionItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <DivisionCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 2.5 Tausch- & Umkehraufgaben (1x1)
                      const isEinmaleinsUmkehrSol = task.type === 'einmaleins_umkehr'
                      if (isEinmaleinsUmkehrSol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseEinmaleinsUmkehrItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <EinmaleinsUmkehrCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 2.6 Achsensymmetrie (Spiegelbilder zeichnen)
                      const isAchsensymmetrieSol = task.type === 'achsensymmetrie'
                      if (isAchsensymmetrieSol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseAchsensymmetrieItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <AchsensymmetrieCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 2.7 Körpernetze & Ansichten
                      const isKoerpernetzeSol = task.type === 'koerpernetze'
                      if (isKoerpernetzeSol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseKoerpernetzItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <KoerpernetzeCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 2.8 Längen umrechnen (m & cm)
                      const isLaengenUmrechnenSol = task.type === 'laengen_umrechnen'
                      if (isLaengenUmrechnenSol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseLaengenUmrechnenItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <LaengenUmrechnenCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 2.9 Längen vergleichen & berechnen
                      const isLaengenVergleichSol = task.type === 'laengen_vergleich'
                      if (isLaengenVergleichSol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseLaengenVergleichItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <LaengenVergleichCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 2.10 Rechnen mit Geld & Rückgeld
                      const isGeldRueckgeldSol = task.type === 'geld_rueckgeld'
                      if (isGeldRueckgeldSol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseGeldRueckgeldItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <GeldRueckgeldCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 2.11 Uhrzeiten ablesen (analog & digital)
                      const isAnalogClockK2Sol = task.type === 'uhrzeit_ablesen_k2'
                      if (isAnalogClockK2Sol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseAnalogClockGrade2ItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <AnalogClockGrade2Card
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 2.12 Zeiger einzeichnen (Stunde & Minute)
                      const isZeigerEinzeichnenK2Sol = task.type === 'uhrzeit_zeichnen_k2'
                      if (isZeigerEinzeichnenK2Sol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseZeigerEinzeichnenGrade2ItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <ZeigerEinzeichnenGrade2Card
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 2.13 Zeitspannen & Zeitdauer berechnen
                      const isZeitspannenK2Sol = task.type === 'zeitspannen_k2'
                      if (isZeitspannenK2Sol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseZeitspannenGrade2ItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <ZeitspannenGrade2Card
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 2.14 Säulendiagramm ablesen
                      const isDiagrammK2Sol = task.type === 'diagramm_k2'
                      if (isDiagrammK2Sol && task.items && task.items.length > 0) {
                        return (
                          <div className="my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseDiagrammKlasse2ItemData(item)
                              if (!data) return null
                              return (
                                <BarChartKlasse2Card
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 2.15 Tabelle auswerten & ergänzen
                      const isTabelleK2Sol = task.type === 'tabelle_k2'
                      if (isTabelleK2Sol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseTabelleKlasse2ItemData(item, iIdx)
                              if (!data) return null
                              return (
                                <TabelleKlasse2Card
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      // 2.16 Kombinatorik & Zufall
                      const isKombinatorikK2Sol = task.type === 'kombinatorik_k2'
                      if (isKombinatorikK2Sol && task.items && task.items.length > 0) {
                        return (
                          <div className="my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseKombinatorikKlasse2ItemData(item)
                              if (!data) return null
                              return (
                                <KombinatorikKlasse2Card
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isSchriftlichSol =
                        task.type === 'schriftlich' ||
                        /schriftlich/i.test(`${task.title} ${task.instruction}`)

                      if (isSchriftlichSol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseSchriftlichItemData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <SchriftlichCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isRundenSol =
                        task.type === 'runden' ||
                        /runden/i.test(`${task.title} ${task.instruction}`)

                      if (isRundenSol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseRundenItemData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <RundenCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isFlaecheUmfangSol =
                        task.type === 'flaeche_umfang' ||
                        /flächeninhalt|umfang/i.test(`${task.title} ${task.instruction}`)

                      if (isFlaecheUmfangSol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseFlaecheUmfangItemData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <FlaecheUmfangCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isGewichteHohlmasseSol =
                        task.type === 'gewichte_hohlmasse' ||
                        /gewicht|hohlmaß|hohlmass/i.test(`${task.title} ${task.instruction}`)

                      if (isGewichteHohlmasseSol && task.items && task.items.length > 0) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                            {task.items.map((item, iIdx) => {
                              const data = parseGewichteHohlmasseItemData(item, iIdx)
                              if (!data) {
                                return (
                                  <div key={iIdx} className="p-2 border rounded text-emerald-800 font-mono">
                                    {task.solutionItems?.[iIdx] ? String(task.solutionItems[iIdx]) : String(item)}
                                  </div>
                                )
                              }
                              return (
                                <GewichteHohlmasseCard
                                  key={iIdx}
                                  data={data}
                                  isSolution={true}
                                  colorMode={colorMode}
                                />
                              )
                            })}
                          </div>
                        )
                      }

                      const isDiagrammSol =
                        task.type === 'tabellen' ||
                        /diagramm|säulendiagramm/i.test(`${task.title} ${task.instruction}`)

                      if (isDiagrammSol && task.items && task.items.length > 0) {
                        const data = parseDiagrammItemData(task.items[0])
                        if (data) {
                          return (
                            <div className="my-2 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100 px-3">
                              <DiagrammCard
                                data={data}
                                isSolution={true}
                                colorMode={colorMode}
                              />
                            </div>
                          )
                        }
                      }

                      if (task.solutionItems && task.solutionItems.length > 0) {
                        return (
                          <div className={`gap-y-2 gap-x-6 text-base font-semibold font-mono my-1 ${
                            task.solutionItems.length === 1
                              ? 'grid grid-cols-1 max-w-sm mx-auto'
                              : 'grid grid-cols-2'
                          }`}>
                            {task.solutionItems.map((sol, sIdx) => {
                              const originalItem = task.items?.[sIdx] ? String(task.items[sIdx]) : ''
                              const isNeighbor =
                                /nachbar|vorgänger|nachfolger|zahlenstrahl/i.test(`${task.title} ${task.instruction}`) ||
                                /_+\s*[,|\s]\s*\d+\s*[,|\s]\s*_+/.test(originalItem) ||
                                /_+\s*[,|\s]\s*\d+\s*[,|\s]\s*_+/.test(String(sol))

                              return (
                                <div
                                  key={sIdx}
                                  className={`flex items-center text-emerald-800 ${
                                    isNeighbor ? 'py-1 px-1' : 'border-b border-emerald-200/80 pb-1 px-1'
                                  }`}
                                >
                                  {renderSolutionItem(String(sol), originalItem, task.title, task.instruction)}
                                </div>
                              )
                            })}
                          </div>
                        )
                      }

                      if (task.items && task.items.length > 0) {
                        return (
                          <div className={`gap-y-2 gap-x-6 text-base font-medium font-mono my-1 ${
                            task.items.length === 1
                              ? 'grid grid-cols-1 max-w-sm mx-auto'
                              : 'grid grid-cols-2'
                          }`}>
                            {task.items.map((item, iIdx) => {
                              const isNeighbor =
                                /nachbar|vorgänger|nachfolger|zahlenstrahl/i.test(`${task.title} ${task.instruction}`) ||
                                /_+\s*[,|\s]\s*\d+\s*[,|\s]\s*_+/.test(String(item))

                              return (
                                <div
                                  key={iIdx}
                                  className={`flex items-center text-gray-700 ${
                                    isNeighbor ? 'py-1 px-1' : 'border-b border-gray-200/80 pb-1 px-1'
                                  }`}
                                >
                                  {renderWorksheetItem(String(item), task.title, task.instruction)}
                                </div>
                              )
                            })}
                          </div>
                        )
                      }

                      return null
                    })()}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Fußzeile Lösungsblatt */}
          <div className="border-t border-gray-300 pt-2 mt-4 flex justify-between items-center text-xs text-gray-400">
            <span>Schul-Assistent Grundschule · Lehrkraft-Exemplar</span>
            <span>{hasMultiplePages ? `Seite ${pageIdx + 1} von 2` : 'Lösungsblatt'}</span>
          </div>
        </div>
      )
    })
  }
  </div>
</div>

      {/* ── Print-Styles für DIN A4 ──────────────────────────────── */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 10mm 12mm;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          #arbeitsblatt-print-area {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            overflow: visible !important;
          }
          .arbeitsblatt-page {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            background: transparent !important;
          }
          .task-block {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .print-page-break {
            page-break-before: always !important;
            break-before: page !important;
            margin-top: 0 !important;
            padding-top: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
