'use client'

import { useState, useRef } from 'react'
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

const SUBJECT_CONFIGS: Record<
  string,
  {
    taskTypes: string[]
    defaultTaskTypes: string[]
    extraOptionLabel: string
    extraOptionKey: string
  }
> = {
  Mathematik: {
    taskTypes: [
      'Kopfrechnen',
      'Sach-/Textaufgaben',
      'Zahlenmauern',
      'Größen umrechnen',
      'Größer-Kleiner (< > =)',
      'Knobelaufgaben',
    ],
    defaultTaskTypes: ['Kopfrechnen', 'Sach-/Textaufgaben'],
    extraOptionLabel: 'Kariertes Rechenkästchen-Feld anzeigen',
    extraOptionKey: 'show_rechenkaestchen',
  },
  Deutsch: {
    taskTypes: [
      'Schüttelsätze',
      'Lückentext',
      'Wortarten bestimmen',
      'Satzzeichen setzen',
      'Leseverständnis',
      'Freies Schreiben',
    ],
    defaultTaskTypes: ['Schüttelsätze', 'Satzzeichen setzen'],
    extraOptionLabel: 'Wortspeicher-Box oben anzeigen',
    extraOptionKey: 'show_wortspeicher',
  },
  Sachunterricht: {
    taskTypes: [
      'Lückentext mit Fachbegriffen',
      'Zuordnungsaufgabe',
      'Richtig/Falsch',
      'Abläufe sortieren',
      'Erklärfragen',
    ],
    defaultTaskTypes: ['Lückentext mit Fachbegriffen', 'Zuordnungsaufgabe'],
    extraOptionLabel: 'Wortspeicher-Box oben anzeigen',
    extraOptionKey: 'show_wortspeicher',
  },
  Englisch: {
    taskTypes: [
      'Vokabelzuordnung',
      'Lückentext',
      'Matching (Bild/Wort)',
      'Kurzantworten',
    ],
    defaultTaskTypes: ['Vokabelzuordnung', 'Lückentext'],
    extraOptionLabel: 'Wortspeicher-Box oben anzeigen',
    extraOptionKey: 'show_wortspeicher',
  },
}

interface ToolDetailClientProps {
  tool: Tool
}

export default function ToolDetailClient({ tool }: ToolDetailClientProps) {
  const isWorksheet = tool.id === 'aufgaben-differenziert' || tool.category === 'differenzierung'

  const [formValues, setFormValues] = useState<Record<string, string>>({
    fach: 'Deutsch',
    seitenumfang: '1 DIN-A4-Seite (Kompakt)',
    diff_modus: 'Alle Niveaustufen auf einem Blatt (Stern-System)',
    show_wortspeicher: 'true',
    show_rechenkaestchen: 'false',
    show_loesung: 'true',
    show_notenraster: 'false',
    show_illustration: 'true',
    illustration_position: 'header',
    bild_motiv: '',
    bild_stil: 'vektor',
    aufgabentypen: 'Schüttelsätze, Satzzeichen setzen',
  })

  const [output, setOutput] = useState<string>('')
  const [illustrationUrl, setIllustrationUrl] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<'worksheet' | 'markdown'>(isWorksheet ? 'worksheet' : 'markdown')
  const abortControllerRef = useRef<AbortController | null>(null)

  const Icon = ICON_MAP[tool.icon] ?? FileText
  const catMeta = getCategoryMeta(tool.category)
  const styles = CATEGORY_STYLES[tool.category] ?? CATEGORY_STYLES.verwaltung

  const handleChange = (fieldId: string, value: string) => {
    if (fieldId === 'fach' && isWorksheet) {
      const cfg = SUBJECT_CONFIGS[value] ?? SUBJECT_CONFIGS['Deutsch']
      setFormValues((prev) => ({
        ...prev,
        fach: value,
        aufgabentypen: cfg.defaultTaskTypes.join(', '),
        show_wortspeicher: value === 'Mathematik' ? 'false' : 'true',
        show_rechenkaestchen: value === 'Mathematik' ? 'true' : 'false',
      }))
      return
    }
    setFormValues((prev) => ({ ...prev, [fieldId]: value }))
  }

  // Umschalten von Aufgabentypen (Chips)
  const handleToggleTaskType = (type: string) => {
    const currentList = (formValues.aufgabentypen || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    let newList: string[]
    if (currentList.includes(type)) {
      // Wenn mindestens 2 aktiv sind, darf abgewählt werden
      if (currentList.length > 2) {
        newList = currentList.filter((t) => t !== type)
      } else {
        return // Mindestens 2 müssen aktiv bleiben
      }
    } else {
      newList = [...currentList, type]
    }

    setFormValues((prev) => ({
      ...prev,
      aufgabentypen: newList.join(', '),
    }))
  }

  const isFormValid = tool.inputs
    .filter((f) => f.required)
    .every((f) => (formValues[f.id] ?? '').trim() !== '')

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

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: tool.id,
          fields: formValues,
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

  const activeTaskTypes = (formValues.aufgabentypen || '')
    .split(',')
    .map((t) => t.trim())

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
              {tool.inputs.map((field: ToolInputField) => (
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

                  {/* Text Input */}
                  {field.type === 'text' && (
                    <input
                      id={field.id}
                      type="text"
                      disabled={isGenerating}
                      value={formValues[field.id] ?? ''}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  )}

                  {/* Textarea */}
                  {field.type === 'textarea' && (
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
                  )}

                  {/* Select */}
                  {field.type === 'select' && (
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
                  )}

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
                    const currentFach = formValues.fach || 'Deutsch'
                    const subjectCfg =
                      SUBJECT_CONFIGS[currentFach] ?? SUBJECT_CONFIGS['Deutsch']
                    return (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-medium text-gray-700">
                            Aufgabentypen ({currentFach}):
                          </label>
                          <span className="text-[11px] text-gray-400">
                            {activeTaskTypes.length} aktiv
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {subjectCfg.taskTypes.map((type) => {
                            const isActive = activeTaskTypes.includes(type)
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => handleToggleTaskType(type)}
                                className={`
                                  px-2.5 py-1 rounded-md text-xs font-medium border transition-colors
                                  ${
                                    isActive
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                  }
                                `}
                              >
                                {isActive ? '✓ ' : '+ '}
                                {type}
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
                  disabled={!isFormValid}
                  className={`
                    w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-semibold text-sm transition-all
                    ${isFormValid
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md active:scale-[0.98]'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <Wand2 className="w-4 h-4" />
                  <span>{output ? 'Erneut generieren' : 'KI-Text generieren'}</span>
                  <Sparkles className="w-4 h-4 opacity-70" />
                </button>
              )}

              {!isFormValid && (
                <p className="text-xs text-center text-gray-400 mt-2">
                  Bitte alle Pflichtfelder ausfüllen.
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
