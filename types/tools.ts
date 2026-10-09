// Typen für das Tool-System des Schul-Assistenten

export type ToolCategory =
  | 'zeugnisse'
  | 'eltern'
  | 'unterricht'
  | 'differenzierung'
  | 'verwaltung'
  | 'foerderung'

export type ToolInputType =
  | 'text'       // Freitext-Eingabe
  | 'textarea'   // Mehrzeiliger Text
  | 'select'     // Dropdown-Auswahl
  | 'number'     // Zahl
  | 'checkbox'   // Boolean

export interface ToolInputField {
  id: string
  label: string
  type: ToolInputType
  placeholder?: string
  required: boolean
  options?: string[]          // Nur für type: 'select'
  min?: number                // Nur für type: 'number'
  max?: number
  rows?: number               // Nur für type: 'textarea'
  helperText?: string         // Hinweistext unter dem Feld
  piiSensitive?: boolean      // Wenn true → PII-Filter anwenden
}

export interface Tool {
  id: string
  name: string
  shortDescription: string    // Kachel-Beschreibung (max. 80 Zeichen)
  fullDescription: string     // Detailansicht
  category: ToolCategory
  icon: string                // Name des Lucide-Icons
  color: string               // Tailwind-Farbklasse (bg-xxx-100, text-xxx-700)
  badge?: string              // z.B. "Neu", "Beliebt"
  estimatedTime: string       // z.B. "ca. 2 Min."
  inputs: ToolInputField[]
  promptTemplate: string      // Template mit {{variablen}}
  outputLabel: string         // Label über dem Output-Feld
  tags: string[]              // Für Suche/Filter
  isPremium: false            // Immer false (Free-only Projekt)
}

export interface ToolCategoryMeta {
  id: ToolCategory
  label: string
  icon: string
  color: string
  description: string
}
