/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Printer,
  Eye,
  EyeOff,
  Check,
  BookOpen,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react'

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
  isGenerating?: boolean
  illustrationUrl?: string | null
  imageUrl?: string | null
  isGeneratingImage?: boolean
  onRegenerateIllustration?: () => void
  onToggleIllustrationPosition?: (pos: ImagePosition) => void
}

interface ParsedTaskItem {
  type: 'instruction' | 'subtask' | 'choice' | 'lines' | 'text'
  content: string
  linesCount?: number
}

interface ParsedTask {
  id: string
  number: number
  title: string
  instruction?: string
  items: ParsedTaskItem[]
}

interface ParsedWorksheet {
  title: string
  subtitle: string
  wortspeicher: string[]
  tasks: ParsedTask[]
  solutions: string
}

export default function ArbeitsblattPreview({
  rawContent,
  formValues = {},
  illustrationUrl = null,
  imageUrl = null,
  isGeneratingImage = false,
  onRegenerateIllustration,
  onToggleIllustrationPosition,
}: ArbeitsblattPreviewProps) {
  const [showSolutionScreen, setShowSolutionScreen] = useState(false)
  const [includeSolutionInPrint, setIncludeSolutionInPrint] = useState(
    formValues.show_loesung !== 'false'
  )

  // Aktive Bild-URL
  const activeImageUrl = imageUrl || illustrationUrl

  // Initiale Bildposition
  const initialPosition = ((): ImagePosition => {
    if (formValues.show_illustration === 'false') return 'hidden'
    const pos = formValues.illustration_position as ImagePosition
    if (
      pos === 'task1' ||
      pos === 'betweenTask1And2' ||
      pos === 'underTask1' as unknown ||
      pos === 'bottom' ||
      pos === 'hidden' ||
      pos === 'header'
    ) {
      if ((pos as string) === 'underTask1') return 'betweenTask1And2'
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
      } else if ((pos as string) === 'underTask1') {
        setImagePosition('betweenTask1And2')
      }
    }
  }, [formValues.illustration_position])

  const handleSetPosition = (pos: ImagePosition) => {
    setImagePosition(pos)
    onToggleIllustrationPosition?.(pos)
  }

  const isOnePage = (formValues.seitenumfang ?? '').includes('1 DIN-A4-Seite')
  const isThreeSheets = (formValues.diff_modus ?? '').includes('3 separate Blätter')
  const showNotenraster = formValues.show_notenraster === 'true'
  const isMath = (formValues.fach ?? '').toLowerCase().includes('mathe')
  const showRechenkaestchen = isMath && formValues.show_rechenkaestchen !== 'false'
  const showWortspeicherOption = !isMath && formValues.show_wortspeicher !== 'false'

  // ── Parser: Zerlegt LLM-Text in saubere Arbeitsblatt-Elemente ─────
  const parsed: ParsedWorksheet = useMemo(() => {
    const defaultTitle =
      formValues.thema || formValues.titel || 'Arbeitsblatt'
    const defaultSubtitle = [
      formValues.fach,
      formValues.klasse,
      formValues.thema ? `Thema: ${formValues.thema}` : '',
    ]
      .filter(Boolean)
      .join(' · ')

    if (!rawContent || rawContent.trim() === '') {
      return {
        title: defaultTitle,
        subtitle: defaultSubtitle,
        wortspeicher: [],
        tasks: [],
        solutions: '',
      }
    }

    let title = defaultTitle
    let subtitle = defaultSubtitle
    let wortspeicher: string[] = []
    let solutions = ''
    const tasks: ParsedTask[] = []

    // 1. Lösungen abtrennen
    const solutionMatch = rawContent.match(
      /(?:#+\s*LÖSUNGEN?|Lösungsblatt|Musterlösungen?)[:\s]+([\s\S]*)$/i
    )
    let mainBody = rawContent
    if (solutionMatch) {
      solutions = solutionMatch[1].trim()
      mainBody = rawContent.substring(0, solutionMatch.index).trim()
    }

    // 2. Titel parsen
    const titleWithPrefix = mainBody.match(/(?:#+\s*TITEL|Titel):\s*([^\n\r]+)/i)
    if (titleWithPrefix && titleWithPrefix[1].trim()) {
      title = titleWithPrefix[1].trim().replace(/^["'*#]+|["'*#]+$/g, '')
    } else {
      const firstHeading = mainBody.match(/^#\s+([^\n\r#]+)/m)
      if (
        firstHeading &&
        firstHeading[1].trim() &&
        !/unterzeile|wortspeicher|aufgabe/i.test(firstHeading[1])
      ) {
        title = firstHeading[1].trim()
      }
    }

    // 3. Unterzeile parsen
    const subMatch = mainBody.match(
      /(?:#+\s*(?:UNTERZEILE|THEMA|FACH|KOPFZEILE)|Unterzeile)[:\s]+([^\n\r#]+)/i
    )
    if (subMatch && subMatch[1].trim()) {
      subtitle = subMatch[1].trim()
    }

    // 4. Wortspeicher parsen
    const wortBlockMatch = mainBody.match(
      /(?:#+\s*WORTSPEICHER|Wortspeicher)[:\s]+([\s\S]*?)(?=(?:#+\s*Aufgabe|#+\s*AUFGABE|\n\s*Aufgabe\s*\d|\n#)|$)/i
    )
    if (wortBlockMatch && wortBlockMatch[1].trim()) {
      const rawBlock = wortBlockMatch[1]
      wortspeicher = rawBlock
        .split(/[\n,;•]/)
        .map((w) =>
          w
            .trim()
            .replace(/^[-*•\d.)\s]+/, '')
            .replace(/["']/g, '')
        )
        .filter(
          (w) =>
            w.length > 0 &&
            !w.startsWith('#') &&
            !w.toLowerCase().includes('wortspeicher')
        )
    }

    // 5. Aufgaben parsen
    const taskSplits = mainBody.split(
      /(?=(?:#+\s*AUFGABE\s*\d+|(?:^|\n)#+\s*Aufgabe\s*\d+|\bAufgabe\s*\d+\s*[:(]|(?:^|\n)(?:\*{1,3}|⭐{1,3})\s*(?:Grundanforderung|Regelanforderung|Erweiterung)))/gi
    )

    let taskIndex = 1
    for (const chunk of taskSplits) {
      const trimmed = chunk.trim()
      if (!trimmed) continue

      if (
        !/AUFGABE\s*\d+|Aufgabe\s*\d+|Grundanforderung|Regelanforderung|Erweiterung|⭐/i.test(
          trimmed
        )
      ) {
        continue
      }

      // Zeilen aufteilen
      const lines = trimmed.split('\n')
      let taskTitle = `Aufgabe ${taskIndex}`
      const contentLines: string[] = []

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (i === 0 && (line.startsWith('#') || line.startsWith('Aufgabe'))) {
          taskTitle = line
            .replace(/^#+\s*/, '')
            .replace(/\[[^\]]*\]/g, '')
            .replace(/\([^)]*\)/g, '')
            .replace(/⭐+/g, '')
            .replace(/[:\-]+$/, '')
            .trim()
          if (!taskTitle) taskTitle = `Aufgabe ${taskIndex}`
        } else {
          contentLines.push(lines[i])
        }
      }

      const bodyParagraphs = contentLines.join('\n').split('\n')
      
      // 1. Pass: Vorab-Analyse der Aufgabe (Instruktion, explizite Zeilenwünsche, didaktischer Typ)
      let detectedInstruction = ''
      let explicitLinesCount: number | null = null

      for (const p of bodyParagraphs) {
        const lineText = p.trim()
        const linesMatch = lineText.match(
          /\[?\s*(?:SCHREIBLINIEN|LINIEN|ZEILEN)\s*:\s*(\d+)\s*\]?/i
        )
        if (linesMatch) {
          explicitLinesCount = parseInt(linesMatch[1], 10)
        }
        if (
          !detectedInstruction &&
          /^(?:Bringe|Ordne|Setze|Finde|Bilde|Schreibe|Lies|Verbinde|Ergänze|Kreuze|Markiere|Berechne|Löse|Rechne|Trage|Nenne|Beschreibe|Unterstreiche)\b/i.test(
            lineText
          )
        ) {
          detectedInstruction = lineText
        }
      }

      const taskHeaderCombined = `${taskTitle} ${detectedInstruction}`.toLowerCase()
      const isTaskSchuettel = /schüttelsatz|schüttelsätze|wörter ordnen|reihenfolge|durcheinander/i.test(taskHeaderCombined)
      const isTaskGap = /satzzeichen|lücke|lückentext|einsetz|ergänze.*(?:das|die|zeichen)|unterstreiche|markiere/i.test(taskHeaderCombined)
      const isTaskFreeWriting = /freies schreiben|eigene(?:n)? sätze|bilde.*sätze|schreibe.*auf|erfinde|formuliere/i.test(taskHeaderCombined)

      const parsedItems: ParsedTaskItem[] = []
      let instructionText = detectedInstruction

      // 2. Pass: Items parsen und Schreiblinien-Bedarf strikt nach Aufgabentyp bestimmen
      for (const p of bodyParagraphs) {
        let cleanP = p.trim()

        // Standalone Schreiblinien-Tags ignorieren (werden direkt an den Items gesteuert)
        if (/^\s*\[?\s*(?:SCHREIBLINIEN|LINIEN|ZEILEN)\s*:\s*\d+\s*\]?\s*$/i.test(cleanP)) {
          continue
        }

        cleanP = cleanP
          .replace(/\[?\s*(?:SCHREIBLINIEN|LINIEN|ZEILEN)\s*:\s*\d+\s*\]?/gi, '')
          .trim()

        if (!cleanP) continue

        // Erkennen von Aufgabenstellungen / Anweisungen
        if (
          !instructionText &&
          /^(?:Bringe|Ordne|Setze|Finde|Bilde|Schreibe|Lies|Verbinde|Ergänze|Kreuze|Markiere|Berechne|Löse|Rechne|Trage|Nenne|Beschreibe|Unterstreiche)\b/i.test(
            cleanP
          )
        ) {
          instructionText = cleanP
          parsedItems.push({ type: 'instruction', content: cleanP })
          continue
        }

        // Ankreuzkästchen (Multiple Choice) -> KEINE Schreiblinie
        if (/^\[[\s_xX]?\]\s*|^$$\s*$$\s*/.test(cleanP)) {
          parsedItems.push({
            type: 'choice',
            content: cleanP.replace(/^\[[\s_xX]?\]\s*|^$$\s*$$\s*/, ''),
          })
          continue
        }

        // Teilaufgaben (1., a), •)
        const isSubtask = /^(?:\d+[.)]|[a-zA-Z][.)]|[-•*])\s+(.+)$/.test(cleanP)
        if (isSubtask) {
          const hasInlineGap =
            /_{2,}|\[\s*_{1,}\s*\]|\(\s*_{1,}\s*\)|[a-zA-ZäöüÄÖÜß]\s+_{1,}\s*$|\b_{2,}\b/.test(
              cleanP
            )
          const hasWordSlashes = /[a-zA-ZäöüÄÖÜß]+\s*[/|]\s*[a-zA-ZäöüÄÖÜß]/i.test(cleanP)

          let linesForSubtask = 0

          if (hasInlineGap || (isTaskGap && !isTaskSchuettel && !hasWordSlashes)) {
            // 1. Einsetz- / Lückenaufgaben (z. B. Satzzeichen setzen, Multiple Choice, Lückentext):
            // KEINE Schreiblinien unter den Items! Kinder tragen Zeichen direkt auf ___ ein.
            linesForSubtask = 0
          } else if (hasWordSlashes || isTaskSchuettel) {
            // 2. Schüttelsätze / Satzbildung:
            // Pro Teilaufgabe (a, b, c, ...) exakt EINE saubere Schreiblinie direkt unter dem Aufgabentext.
            linesForSubtask = 1
          } else if (isTaskFreeWriting || (explicitLinesCount !== null && explicitLinesCount > 0)) {
            // 3. Freies Schreiben:
            // Maximal 1 bis 2 Schreiblinien pro Teilaufgabe.
            const requested = explicitLinesCount ?? 2
            linesForSubtask = Math.min(Math.max(requested, 1), 2)
          } else {
            // Standard: Wenn es eine offene Frage ist, 1 Linie
            linesForSubtask = cleanP.endsWith('?') ? 1 : 0
          }

          parsedItems.push({
            type: 'subtask',
            content: cleanP,
            linesCount: linesForSubtask,
          })
          continue
        }

        parsedItems.push({ type: 'text', content: cleanP })
      }

      // Keine losen, verwaisten Linien zwischen den Aufgabenblöcken!
      // Wenn Teilaufgaben existieren, werden alle verwaisten 'lines'-Items herausgefiltert.
      const hasSubtasks = parsedItems.some((it) => it.type === 'subtask')
      const finalItems = hasSubtasks
        ? parsedItems.filter((it) => it.type !== 'lines')
        : parsedItems

      // Nur wenn KEINE Teilaufgaben und keine Linien/Choices existieren, genau maximal 2 Schreiblinien ergänzen
      if (!hasSubtasks) {
        const hasLinesOrChoice = finalItems.some(
          (it) => it.type === 'lines' || it.type === 'choice'
        )
        if (!hasLinesOrChoice && finalItems.length > 0) {
          finalItems.push({
            type: 'lines',
            content: '',
            linesCount: Math.min(explicitLinesCount ?? 2, 2),
          })
        }
      }

      tasks.push({
        id: `task-${taskIndex}`,
        number: taskIndex,
        title: taskTitle,
        instruction: instructionText,
        items: finalItems,
      })

      taskIndex++
    }

    if (tasks.length === 0 && mainBody.trim()) {
      tasks.push({
        id: 'task-1',
        number: 1,
        title: 'Aufgabenstellung',
        items: [
          { type: 'text', content: mainBody },
          { type: 'lines', content: '', linesCount: 2 },
        ],
      })
    }

    return {
      title,
      subtitle,
      wortspeicher,
      tasks,
      solutions,
    }
  }, [rawContent, formValues])

  const handlePrint = () => {
    window.print()
  }

  // ── Render-Funktion für das Bild (Schulbuch-Stil, schlicht & transparent)
  const renderImage = (pos: ImagePosition) => {
    if (!activeImageUrl && !isGeneratingImage) return null

    return (
      <div className="relative group inline-block">
        {activeImageUrl ? (
          <img
            src={activeImageUrl}
            alt="Schulbuch-Illustration"
            className={`object-contain filter drop-shadow-xs transition-transform ${
              pos === 'betweenTask1And2' || pos === 'bottom'
                ? 'max-h-[90px] max-w-[170px]'
                : 'w-20 h-20 sm:w-24 sm:h-24 max-w-[105px] max-h-[105px]'
            }`}
            style={{ mixBlendMode: 'multiply' }}
          />
        ) : isGeneratingImage ? (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-[10px] text-gray-500 animate-pulse no-print">
            <Sparkles className="w-4 h-4 text-gray-400 animate-spin mb-1" />
            <span>Illustration...</span>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-100 rounded-2xl overflow-hidden border border-gray-200">
      {/* ── Toolbar oben (no-print) ────────────────────────── */}
      <div className="no-print bg-white px-5 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              Arbeitsblatt-Vorschau ({isOnePage ? '1 Seite kompakt' : '2 Seiten'})
            </h3>
            <p className="text-[11px] text-gray-400">
              Druckfertig formatiert nach LehrplanPLUS
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Bild-Position Dropdown-Steuerung */}
          {(activeImageUrl || isGeneratingImage) && (
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-gray-500 font-medium flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Bild-Position:</span>
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
                    className={`w-3.5 h-3.5 ${isGeneratingImage ? 'animate-spin text-blue-600' : ''}`}
                  />
                </button>
              )}
            </div>
          )}

          {/* Lösungs-Toggle für Bildschirm */}
          {parsed.solutions && (
            <button
              type="button"
              onClick={() => setShowSolutionScreen(!showSolutionScreen)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${
                  showSolutionScreen
                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {showSolutionScreen ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Lösungen verbergen</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lösungen anzeigen</span>
                </>
              )}
            </button>
          )}

          {/* Option: Lösungen mitdrucken */}
          {parsed.solutions && (
            <label className="inline-flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100">
              <input
                type="checkbox"
                checked={includeSolutionInPrint}
                onChange={(e) => setIncludeSolutionInPrint(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-0 cursor-pointer"
              />
              <span>Lösungsblatt mitdrucken</span>
            </label>
          )}

          {/* Druck-Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            <span>Arbeitsblatt drucken / PDF</span>
          </button>
        </div>
      </div>

      {/* ── Scrollbarer Bereich mit DIN-A4-Darstellung ───────────── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center">
        {/* Das zu druckende Arbeitsblatt (Klassische Kopiervorlage) */}
        <div
          id="arbeitsblatt-print-area"
          className={`
            w-full max-w-[780px] bg-white text-gray-900 rounded-sm shadow-xl border border-gray-300
            ${isOnePage ? 'p-5 sm:p-7 min-h-[1020px]' : 'p-7 sm:p-11 min-h-[1050px]'}
            flex flex-col justify-between
          `}
          style={{ fontFamily: 'Georgia, Cambria, serif' }}
        >
          <div>
            {/* ── 1. SCHLICHTE KOPFZEILE MIT TRENNLINIE ─────────── */}
            <div className="border-b border-gray-400 pb-2 mb-5 font-sans text-xs text-gray-800">
              <div className="flex justify-between items-baseline gap-4 sm:gap-6">
                <div className="flex items-baseline flex-1">
                  <span className="font-semibold text-gray-900 mr-2">Name:</span>
                  <div className="flex-1 border-b border-dotted border-gray-400 h-4"></div>
                </div>
                <div className="flex items-baseline w-32 sm:w-40">
                  <span className="font-semibold text-gray-900 mr-2">Datum:</span>
                  <div className="flex-1 border-b border-dotted border-gray-400 h-4"></div>
                </div>
                <div className="flex items-baseline w-20 sm:w-24">
                  <span className="font-semibold text-gray-900 mr-2">Klasse:</span>
                  <div className="flex-1 border-b border-dotted border-gray-400 h-4"></div>
                </div>
                {showNotenraster && (
                  <div className="border border-gray-400 rounded px-2 py-1 text-right text-[11px] leading-tight flex-shrink-0">
                    <div>Punkte: ___ / ___ P.</div>
                    <div className="font-bold border-t border-gray-300 mt-0.5 pt-0.5">Note: ____</div>
                  </div>
                )}
              </div>
            </div>

            {/* ── 2. HAUPTTITEL (Schlicht, kein Kasten, kein Tag) ── */}
            <div className="relative mb-5">
              <div
                className={`text-center ${
                  imagePosition === 'header' && activeImageUrl ? 'pr-24 sm:pr-28' : ''
                }`}
              >
                <h1
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  className={`font-bold text-gray-950 tracking-tight outline-none hover:bg-blue-50/30 focus:bg-white focus:ring-1 focus:ring-blue-400 rounded px-2 py-0.5 transition-all cursor-text ${
                    isOnePage ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
                  }`}
                  title="Klicken zum Bearbeiten"
                >
                  {parsed.title}
                </h1>
              </div>

              {/* Bild-Position: Oben rechts im Header */}
              {imagePosition === 'header' && activeImageUrl && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
                  {renderImage('header')}
                </div>
              )}
            </div>

            {/* ── 3. DEZENTER WORTSPEICHER (Kompakte graue Leiste) ─ */}
            {showWortspeicherOption && parsed.wortspeicher.length > 0 && (
              <div className="border border-gray-300 rounded-md p-2 bg-gray-50/50 text-xs font-sans mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-800">
                <span className="font-bold text-gray-900 mr-1 flex items-center gap-1">
                  Wortspeicher:
                </span>
                {parsed.wortspeicher.map((word, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="text-gray-400 font-normal">|</span>}
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      className="font-medium text-gray-800 outline-none hover:bg-blue-50/40 focus:bg-white focus:ring-1 focus:ring-blue-400 rounded px-1 cursor-text"
                      title="Klicken zum Bearbeiten"
                    >
                      {word}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* ── 4. AUFGABEN-LISTE (Klassisches Schulbuch-Design) ─── */}
            <div className={isOnePage ? 'space-y-4' : 'space-y-6'}>
              {parsed.tasks.map((task, tIdx) => {
                // Bereinige Titel von redundanten "Aufgabe 1:" Präfixen
                const rawCleanTitle = task.title
                  .replace(/^Aufgabe\s*\d+\s*[:\-.]?\s*/i, '')
                  .trim()
                const hasCustomTitle = rawCleanTitle.length > 0 && !/^Aufgabe$/i.test(rawCleanTitle)

                return (
                  <React.Fragment key={task.id}>
                    <div
                      className={`
                        font-sans
                        ${isThreeSheets && tIdx > 0 ? 'print-page-break' : ''}
                      `}
                    >
                      {/* Bild-Position: Neben Aufgabe 1 (rechts gefloatet) */}
                      {tIdx === 0 && imagePosition === 'task1' && activeImageUrl && (
                        <div className="float-right ml-4 mb-2 flex items-center justify-center">
                          {renderImage('task1')}
                        </div>
                      )}

                      {/* Schlichte Aufgaben-Überschrift: 1. Schüttelsätze ordnen */}
                      <div className="flex items-baseline gap-2 mb-1.5">
                        <span className="font-bold text-base text-gray-950 flex-shrink-0">
                          {task.number}.
                        </span>
                        {hasCustomTitle && (
                          <h2
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            className="font-bold text-base text-gray-950 outline-none hover:bg-blue-50/30 focus:bg-white focus:ring-1 focus:ring-blue-400 focus:rounded px-1 transition-all cursor-text"
                            title="Klicken zum Bearbeiten"
                          >
                            {rawCleanTitle}
                          </h2>
                        )}
                        {showNotenraster && (
                          <span className="text-xs text-gray-400 ml-auto font-normal">
                            (___ P.)
                          </span>
                        )}
                      </div>

                      {/* Aufgaben-Inhalte */}
                      <div
                        className={`text-sm text-gray-800 leading-relaxed ${
                          isOnePage ? 'space-y-1.5' : 'space-y-2'
                        }`}
                      >
                        {task.items.map((item, i) => {
                          // Aufgabenstellung (halbfett / hervorgehoben)
                          if (item.type === 'instruction') {
                            return (
                              <p
                                key={i}
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                className={`font-semibold text-gray-900 text-sm leading-relaxed outline-none hover:bg-blue-50/30 focus:bg-white focus:ring-1 focus:ring-blue-400 focus:rounded px-1 py-0.5 transition-all cursor-text ${
                                  isOnePage ? 'mb-1.5' : 'mb-2'
                                }`}
                                title="Klicken zum Bearbeiten"
                              >
                                {item.content}
                              </p>
                            )
                          }

                          // Teilaufgabe (mit bedarfsgerechter Schreiblinie nach Didaktik)
                          if (item.type === 'subtask') {
                            const lineCount = item.linesCount ?? 0
                            return (
                              <div
                                key={i}
                                className={isOnePage ? 'my-1.5 space-y-0.5' : 'my-2 space-y-1'}
                              >
                                <div
                                  contentEditable={true}
                                  suppressContentEditableWarning={true}
                                  className="text-sm font-medium text-gray-900 outline-none hover:bg-blue-50/30 focus:bg-white focus:ring-1 focus:ring-blue-400 focus:rounded px-1 transition-all cursor-text"
                                  title="Klicken zum Bearbeiten"
                                >
                                  {item.content}
                                </div>
                                {lineCount > 0 && (
                                  <div className={lineCount > 1 ? 'space-y-2 pt-0.5' : 'pt-0.5'}>
                                    {Array.from({ length: lineCount }).map((_, lIdx) => (
                                      <div
                                        key={lIdx}
                                        className="border-b border-dotted border-gray-400 h-6"
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          }

                          // Multiple Choice Kästchen
                          if (item.type === 'choice') {
                            return (
                              <div
                                key={i}
                                className={`flex items-center gap-2.5 pl-0.5 ${
                                  isOnePage ? 'my-1' : 'my-1.5'
                                }`}
                              >
                                <span className="w-3.5 h-3.5 rounded-xs border border-gray-600 inline-block flex-shrink-0 bg-white" />
                                <span
                                  contentEditable={true}
                                  suppressContentEditableWarning={true}
                                  className="text-sm text-gray-800 outline-none hover:bg-blue-50/30 focus:bg-white focus:ring-1 focus:ring-blue-400 focus:rounded px-1 transition-all cursor-text"
                                  title="Klicken zum Bearbeiten"
                                >
                                  {item.content}
                                </span>
                              </div>
                            )
                          }

                          // Schreiblinien
                          if (item.type === 'lines') {
                            const count = isOnePage
                              ? Math.min(Math.max(item.linesCount || 2, 1), 2)
                              : Math.min(Math.max(item.linesCount || 2, 1), 3)
                            return (
                              <div
                                key={i}
                                className={`pt-0.5 ${
                                  isOnePage ? 'my-1.5 space-y-2' : 'my-2 space-y-2.5'
                                }`}
                              >
                                {Array.from({ length: count }).map((_, lineIdx) => (
                                  <div
                                    key={lineIdx}
                                    className="border-b border-dotted border-gray-400 h-6"
                                  />
                                ))}
                              </div>
                            )
                          }

                          // Normaler Text
                          return (
                            <div
                              key={i}
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              className="whitespace-pre-line leading-relaxed text-sm text-gray-800 outline-none hover:bg-blue-50/30 focus:bg-white focus:ring-1 focus:ring-blue-400 focus:rounded px-1 py-0.5 transition-all cursor-text"
                              title="Klicken zum Bearbeiten"
                            >
                              {item.content}
                            </div>
                          )
                        })}
                      </div>

                      {/* Kariertes Rechenkästchen-Feld für Mathematik */}
                      {showRechenkaestchen && (
                        <div className="mt-3 pt-2">
                          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 font-mono">
                            Rechenkästchen / Rechenweg:
                          </div>
                          <div
                            className={`w-full rounded border border-gray-300 ${
                              isOnePage ? 'h-16' : 'h-20'
                            }`}
                            style={{
                              backgroundImage:
                                'linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
                              backgroundSize: '16px 16px',
                              backgroundColor: '#fafbfc',
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Bild-Position: Zwischen Aufgabe 1 und 2 */}
                    {tIdx === 0 && imagePosition === 'betweenTask1And2' && activeImageUrl && (
                      <div className="my-3 py-2 border-y border-dashed border-gray-200 flex items-center justify-center">
                        {renderImage('betweenTask1And2')}
                      </div>
                    )}
                  </React.Fragment>
                )
              })}
            </div>

            {/* Bild-Position: Ganz unten auf dem Blatt */}
            {imagePosition === 'bottom' && activeImageUrl && (
              <div className="mt-4 pt-2 flex items-center justify-center">
                {renderImage('bottom')}
              </div>
            )}
          </div>

          {/* ── 5. SCHLICHTE FUßZEILE ───────────────────────── */}
          <div className="border-t border-gray-300 pt-2 mt-6 flex justify-between items-center text-xs text-gray-400 font-sans">
            <span>Schul-Assistent Grundschule</span>
            <span>Seite 1</span>
          </div>

          {/* ── LÖSUNGSBLATT FÜR DIE LEHRKRAFT ─────────────────── */}
          {formValues.show_loesung !== 'false' && parsed.solutions && (
            <div
              className={`
                mt-8 pt-6 border-t border-dashed border-gray-400 font-sans
                ${includeSolutionInPrint ? 'print-page-break' : 'print:hidden'}
                ${showSolutionScreen ? 'block' : 'hidden print:block'}
              `}
            >
              <div className="border border-gray-400 rounded-md p-4 bg-gray-50/60">
                <div className="flex items-center justify-between mb-2 border-b border-gray-300 pb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-gray-900">
                    <Check className="w-4 h-4 text-gray-700" />
                    <span>Lösungsblatt für die Lehrkraft (Musterlösung)</span>
                  </div>
                </div>

                <div
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  className="text-xs text-gray-800 whitespace-pre-line leading-relaxed outline-none hover:bg-white focus:bg-white focus:ring-1 focus:ring-blue-400 rounded p-1 transition-all cursor-text"
                  title="Klicken zum Bearbeiten"
                >
                  {parsed.solutions}
                </div>
              </div>

              <div className="mt-3 text-center text-xs text-gray-400">
                <span>Schul-Assistent Grundschule · Lösungsblatt</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
