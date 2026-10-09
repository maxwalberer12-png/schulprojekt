# PROJECT_RULES.md – Schul-Assistent

## 🎯 Projektziel
DSGVO-konforme KI-Web-App für Grundschullehrkräfte, die Arbeitsaufwand reduziert und dabei Datenschutz garantiert.

---

## 💰 Kosten-Regel (STRIKT)
- **Ausschließlich Free Tiers** – kein Stripe, keine Paid-Plugins, kein Bezahlmodell.
- Alle verwendeten Dienste müssen dauerhaft kostenlos nutzbar sein (Supabase Free, Vercel Free, etc.).

---

## 🛠 Tech-Stack
| Bereich            | Technologie                                      |
|--------------------|--------------------------------------------------|
| Framework          | Next.js 14 (App Router, TypeScript)              |
| Styling            | Tailwind CSS                                     |
| Icons              | Lucide-React                                     |
| Auth & Datenbank   | Supabase (Region: **EU-Frankfurt / eu-central-1**) |
| Deployment         | Vercel (Free Tier)                               |
| KI-Backend         | Vercel AI SDK + OpenRouter / kostenlose LLMs     |

---

## 👩‍🏫 Zielgruppe & Design-Prinzipien
- **Zielgruppe:** Grundschullehrkräfte (nicht tech-affin, unter Zeitdruck)
- Design muss: extrem klar, aufgeräumt, barrierearm, vertrauenerweckend
- Schriftart: gut lesbar (mindestens 16px Basis), genug Kontrast
- Kein Dark-Mode-Zwang – helles, freundliches UI bevorzugt
- Sprache der UI: **Deutsch**

---

## 🔒 Datenschutz & DSGVO (NICHT VERHANDELBAR)
1. **Kein Prompt-Logging im Backend** – Prompts werden NICHT in der Datenbank gespeichert.
2. **PII-Filter vor LLM-Anfragen:** Alle Schülernamen und personenbezogenen Daten müssen automatisch anonymisiert werden, bevor ein Prompt an ein LLM gesendet wird.
3. **Supabase-Region:** Immer EU-Frankfurt (`eu-central-1`) – keine US-Region!
4. Keine Analytics-Tools, die personenbezogene Daten in Drittländer übertragen.

---

## 🚦 Modulare Arbeitsweise (STRIKT EINHALTEN)
- **Immer nur eine Phase** auf einmal implementieren.
- Vor dem Start der nächsten Phase **Test-Feedback abwarten**.
- Am Ende jeder Phase: Liste "Was du manuell tun musst" bereitstellen.

---

## 🔑 Schul-Zugangscode (Pilot)
- Pflichtfeld bei der Registrierung.
- Gültiger Code für den Piloten: **`PILOT-2026`**
- Bei falschem Code: Registrierung abbrechen, Fehlermeldung auf Deutsch:
  > *"Ungültiger Schul-Zugangscode. Bitte wende dich an deine Schulleitung."*

---

## 📁 Wichtige Dateien & Konventionen
- `.env.local` – Supabase-Keys (NICHT in Git committen, in `.gitignore` eintragen)
- `.env.local.example` – Vorlage für Keys (wird committet)
- Alle Routen unter `/app` (App Router)
- API-Routen unter `/app/api/`
- Wiederverwendbare Komponenten unter `/components/`
- Typen unter `/types/`
