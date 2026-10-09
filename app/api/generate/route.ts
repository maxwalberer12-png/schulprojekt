import { streamText } from 'ai'
import { mistral } from '@ai-sdk/mistral'
import { createClient } from '@/lib/supabase/server'
import { filterPromptFields, buildPrompt } from '@/lib/pii-filter'
import { getToolById } from '@/config/tools.config'
import { getCurriculumPromptGuidelines } from '@/lib/curriculum/lehrplanplus-grundschule'

// ── Typen ──────────────────────────────────────────────────────
interface GenerateRequest {
  toolId: string
  fields: Record<string, string>
}

const SYSTEM_PROMPT =
  'Du bist ein hilfreicher Assistent für Grundschullehrkräfte in Deutschland. ' +
  'Du schreibst professionelle, pädagogisch wertvolle Texte auf Deutsch. ' +
  'Antworte ausschließlich auf Deutsch. Sei präzise und praxisnah.'

export const maxDuration = 60

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
    const { toolId, fields } = body

    if (!toolId || !fields) {
      return new Response(
        JSON.stringify({ error: 'Ungültige Anfrage: toolId und fields sind erforderlich.' }),
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

    // 5. Prompt zusammenbauen
    const prompt = buildPrompt(tool.promptTemplate, filteredFields)

    let effectiveSystemPrompt = SYSTEM_PROMPT
    if (toolId === 'aufgaben-differenziert') {
      const seitenumfang = fields.seitenumfang ?? '1 DIN-A4-Seite (Kompakt)'
      const isOnePage = seitenumfang.includes('1 DIN-A4-Seite')
      const diffModus = fields.diff_modus ?? 'Alle Niveaustufen auf einem Blatt (Stern-System)'
      const showWortspeicher = fields.show_wortspeicher !== 'false'
      const showLoesung = fields.show_loesung !== 'false'
      const showNotenraster = fields.show_notenraster === 'true'
      const aufgabentypen = fields.aufgabentypen || 'Schüttelsätze, Satzzeichen/Korrektur'

      effectiveSystemPrompt =
        'Du bist ein erfahrener Grundschullehrer und Didaktik-Experte (LehrplanPLUS Grundschule, 1. bis 4. Klasse).\n' +
        'Erstelle ein fachlich und didaktisch einwandfreies, druckfertiges Grundschul-Arbeitsblatt.\n\n' +
        'STRIKTE DIDAKTISCHE VORGABEN:\n' +
        '1. TITEL: Verwende einen sachlichen, schulgerechten Titel (z. B. "Satzbau und Satzzeichen", "Satzglieder bestimmen", "Nomen, Verben und Adjektive"). KEINE erfundenen Kunsttitel wie "Satzbauparty" oder "Rechtschreibabenteuer"!\n' +
        '3. SCHÜTTELSÄTZE & SATZBILDUNG (DIDAKTISCH EINDEUTIG & KLAR):\n' +
        '   - DIDAKTISCHE EINDEUTIGKEIT: Wenn Schüttelsätze generiert werden, müssen sie didaktisch eindeutig sein mit einer klaren Subjekt-Prädikat-Objekt-Struktur (S-P-O).\n' +
        '   - SATZANFANG FAIR ÜBEN: Um das Erkennen des Satzanfangs fair zu üben, müssen die Wörter so gewählt sein, dass nicht fälschlicherweise das Objekt am Anfang großgeschrieben ist, wenn es nicht der Satzanfang sein soll.\n' +
        '   - BEISPIEL & REGELUNG BEI NOMEN: Wenn Nomen vorkommen, achte darauf: z. B. Vorgabe: "lisa / zur / schule / geht" -> Aufgabe: "Schreibe den Satz richtig auf und beachte den Satzanfang und Nomen!" (Lösung: Lisa geht zur Schule.). Oder bei Vorgabe mit Artikel am Satzanfang: "Ball / mit / dem / spielen / Kinder / Die" -> Lösung: "Die Kinder spielen mit dem Ball."\n' +
        '   - SATZANFANGS-REGEL (WICHTIG): Wenn das Wort, das an den Satzanfang gehört, KEIN Nomen ist (sondern z. B. ein Artikel oder Pronomen wie "Die", "Der", "Das", "Wir", "Heute"), MUSS dieses Wort in den Schüttelwörtern ebenfalls bereits GROSSGESCHRIEBEN vorgegeben werden!\n' +
        '   - NOMEN-REGEL: Alle Nomen (Substantive) und Eigennamen müssen im fertigen Satz großgeschrieben werden.\n' +
        '   - KEINE VERWIRRUNG: Niemals irreführende Großschreibung am Satzobjekt vorgeben, die fälschlich den Satzanfang suggeriert!\n' +
        '   - KEINE SEPARATEN SCHREIBLINIEN-TEXTE: Gib hinter Schüttelsätzen (a, b, c) KEINE separaten "[SCHREIBLINIEN: 2]" oder "[SCHREIBLINIEN: 3]" Zeilen an, da jede Teilaufgabe im Layout automatisch genau eine eigene Schreiblinie erhält.\n' +
        '4. LEBENSWELT: Verwende kindgerechte, alltägliche Sätze aus dem Grundschulalltag (Schule, Tiere, Familie, Spielplatz, Hobbys, Sport).\n' +
        '5. KEINE ECKIGEN KLAMMERN BEI ANWEISUNGEN: Schreibe die Aufgabenanweisung direkt als klaren, normalen Text (z. B. "Bringe die durcheinandergewürfelten Wörter in die richtige Reihenfolge und schreibe die Sätze auf." - NIEMALS "[Aufgabenstellung: ...]").\n' +
        `6. GEWÄHLTE AUFGABENTYPEN: Berücksichtige folgende Aufgabentypen: ${aufgabentypen}.\n` +
        `7. DIFFERENZIERUNG: Modus "${diffModus}".\n` +
        (isOnePage
          ? '7. SEITENUMFANG: WICHTIG: Begrenze den Umfang exakt so, dass alle Aufgaben ohne Überhang auf genau eine DIN-A4-Druckseite passen (max. 3 kompakte Aufgaben mit jeweils 2-3 Teilaufgaben).\n'
          : '7. SEITENUMFANG: 2 Seiten ausführlicher Umfang (je 3-4 Teilaufgaben pro Niveau).\n') +
        (showNotenraster
          ? '8. PUNKTE: Gib für jede Aufgabe in Klammern die erreichbaren Punkte an (z. B. "(5 Punkte)").\n'
          : '') +
        (!showWortspeicher
          ? '9. WORTSPEICHER: Lasse den Abschnitt # WORTSPEICHER komplett weg.\n'
          : '') +
        (!showLoesung
          ? '10. LÖSUNGEN: Lasse den Abschnitt # LÖSUNGEN komplett weg.\n'
          : '') +
        '11. FORMATIERUNG: Beginne direkt mit "# TITEL:". Halte dich an die Abschnitte (# TITEL:, # UNTERZEILE:, ' +
        (showWortspeicher ? '# WORTSPEICHER:, ' : '') +
        '# AUFGABE 1 [⭐]:, # AUFGABE 2 [⭐⭐]:, # AUFGABE 3 [⭐⭐⭐]:' +
        (showLoesung ? ', # LÖSUNGEN:' : '') +
        ').'

      // 12. LehrplanPLUS-Leitplanken dynamisch anhand von Fach und Klassenstufe anbinden
      const curriculumGuidelines = getCurriculumPromptGuidelines(
        fields.fach,
        fields.klasse,
        fields.thema
      )
      effectiveSystemPrompt += '\n\n' + curriculumGuidelines
    }

    const provider = process.env.AI_PROVIDER ?? 'local'

    // ── FALL A: Lokaler Modus via Ollama (qwen2.5:14b) ─────────
    if (provider === 'local') {
      const ollamaBaseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/api'
      const chatUrl = ollamaBaseUrl.endsWith('/api')
        ? `${ollamaBaseUrl}/chat`
        : `${ollamaBaseUrl}/api/chat`
      const ollamaModel = process.env.OLLAMA_MODEL ?? 'qwen2.5:14b'

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
