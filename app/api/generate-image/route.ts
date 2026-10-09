import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { createClient } from '@/lib/supabase/server'
import { applyPiiFilter } from '@/lib/pii-filter'

export const maxDuration = 45 // Vercel-kompatibles Timeout

interface GenerateImageRequest {
  thema?: string
  fach?: string
  position?: 'header' | 'task1' | 'betweenTask1And2' | 'bottom'
  motiv?: string
  stil?: 'vektor' | 'sketch'
}

export async function POST(req: NextRequest) {
  try {
    // 1. Auth-Prüfung: Nur angemeldete Nutzer dürfen generieren
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert. Bitte melde dich an.' },
        { status: 401 }
      )
    }

    // 2. Request parsen & PII-Filter anwenden
    const body = (await req.json()) as GenerateImageRequest
    const rawThema = body.thema?.trim() || 'Grundschulunterricht'
    const rawMotiv = body.motiv?.trim() || ''
    const stil = body.stil || 'vektor'
    const fach = body.fach?.toLowerCase() || ''

    const filteredThema = applyPiiFilter(rawThema).filtered
    const filteredMotiv = applyPiiFilter(rawMotiv).filtered

    // 3. Prompt-Engineering nach Anforderung
    // Prüfe, ob es sich um ein abstraktes Sprachthema handelt (Deutsch, Rechtschreibung, Satzbau etc.)
    const isGrammarTopic =
      fach.includes('deutsch') ||
      /rechtschreib|satzbau|satzglieder|nomen|verben|adjektiv|wortart|grammatik|wörter ordnen|schüttelsatz/i.test(
        filteredThema
      )

    const subject = filteredMotiv
      ? filteredMotiv
      : isGrammarTopic
      ? 'cute educational character (like an owl with a notebook or a smiling pencil)'
      : filteredThema

    let promptStructure = ''
    if (stil === 'sketch') {
      promptStructure = `classic black and white line art coloring page illustration for children textbook, ${subject}, pure black ink line drawing on pure white background, isolated, minimalist contour art, no color, no grayscale shading, no 3d render, no messy details`
    } else if (isGrammarTopic && !filteredMotiv) {
      // Exakter Default-Prompt für FLUX bei Deutsch / Rechtschreibung / Satzbau
      promptStructure =
        'friendly children book illustration, cute educational character (like an owl with a notebook or a smiling pencil), crisp vector outlines, clean white background, isolated, minimalist textbook art, no 3d render, no messy details'
    } else {
      promptStructure = `friendly children book illustration, ${subject}, crisp vector outlines, clean white background, isolated, minimalist textbook art, no 3d render, no messy details`
    }

    const negativePrompt =
      'computer folder, 3d folder, office folder, desktop icon, software app logo, windows icon, photorealistic, 3d render, dark, gritty, ugly, complex, noisy background, text, typography, alphabet letters, words, watermark, cropped'

    const seed = Math.floor(Math.random() * 10000000)
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      promptStructure
    )}?model=flux&width=512&height=512&nologo=true&seed=${seed}&negative_prompt=${encodeURIComponent(
      negativePrompt
    )}`

    // 4. FLUX-Bild abrufen (mit AbortSignal für robustes Timeout)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 28000)

    let rawBuffer: Buffer
    try {
      const response = await fetch(pollinationsUrl, {
        signal: controller.signal,
        headers: {
          Accept: 'image/*',
        },
      })

      if (!response.ok) {
        throw new Error(`FLUX-Dienst meldete Fehlercode: ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      rawBuffer = Buffer.from(arrayBuffer)
    } finally {
      clearTimeout(timeoutId)
    }

    // 5. Automatische Weißwert-Maskierung (sharp Transparenz-Filter)
    // Entfernt den weißen/hellen Hintergrund nahtlos ohne harten Kasten
    const { data, info } = await sharp(rawBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    // Pixel-Verarbeitung: Hohe Helligkeit & geringe Farbsättigung = Hintergrund
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const minVal = Math.min(r, g, b)
      const maxVal = Math.max(r, g, b)
      const diff = maxVal - minVal

      // Reines oder fast reines Weiß mit dezentem Übergang (Anti-Aliasing)
      if (minVal > 246 && diff < 18) {
        data[i + 3] = 0 // Vollständig transparent
      } else if (minVal > 228 && diff < 16) {
        // Sanfter Alpha-Übergang an Kanten
        const alphaFactor = (246 - minVal) / (246 - 228)
        data[i + 3] = Math.round(data[i + 3] * Math.max(0, Math.min(1, alphaFactor)))
      }
    }

    // Zuschnitt (Trim) der leeren Ränder & PNG-Export
    let finalPngBuffer: Buffer
    try {
      finalPngBuffer = await sharp(data, {
        raw: { width: info.width, height: info.height, channels: 4 },
      })
        .trim({ threshold: 10 })
        .png({ quality: 90, compressionLevel: 9 })
        .toBuffer()
    } catch {
      // Fallback falls Trim fehlschlägt
      finalPngBuffer = await sharp(data, {
        raw: { width: info.width, height: info.height, channels: 4 },
      })
        .png({ quality: 90 })
        .toBuffer()
    }

    // 6. Als Base64-Data-URL zurückgeben
    const base64Image = `data:image/png;base64,${finalPngBuffer.toString('base64')}`

    return NextResponse.json({
      imageUrl: base64Image,
      promptUsed: promptStructure,
      position: body.position || 'header',
    })
  } catch (error: unknown) {
    console.error('[/api/generate-image] Fehler:', error)
    const message = error instanceof Error ? error.message : 'Unerwarteter Fehler'
    return NextResponse.json(
      { error: `Bildgenerierung fehlgeschlagen: ${message}` },
      { status: 500 }
    )
  }
}
