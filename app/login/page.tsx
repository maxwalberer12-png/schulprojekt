'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, GraduationCap, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

type Mode = 'login' | 'register'

const PILOT_CODE = 'PILOT-2026'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [schulCode, setSchulCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      if (mode === 'register') {
        // Schul-Zugangscode validieren
        if (schulCode.trim().toUpperCase() !== PILOT_CODE) {
          setError('Ungültiger Schul-Zugangscode. Bitte wende dich an deine Schulleitung.')
          setIsLoading(false)
          return
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              schul_code: schulCode.trim().toUpperCase(),
            },
          },
        })

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            setError('Diese E-Mail-Adresse ist bereits registriert. Bitte melde dich an.')
          } else if (signUpError.message.includes('Password should be at least')) {
            setError('Das Passwort muss mindestens 6 Zeichen lang sein.')
          } else {
            setError('Registrierung fehlgeschlagen. Bitte versuche es erneut.')
          }
          return
        }

        setSuccess(
          'Registrierung erfolgreich! Bitte überprüfe deine E-Mails und bestätige dein Konto.'
        )
        setMode('login')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            setError('E-Mail oder Passwort ist falsch. Bitte erneut versuchen.')
          } else if (signInError.message.includes('Email not confirmed')) {
            setError('Bitte bestätige zuerst deine E-Mail-Adresse.')
          } else {
            setError('Anmeldung fehlgeschlagen. Bitte versuche es erneut.')
          }
          return
        }

        router.push('/dashboard')
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = (newMode: Mode) => {
    setMode(newMode)
    setError(null)
    setSuccess(null)
    setSchulCode('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Schul-Assistent</h1>
          <p className="mt-2 text-gray-500 text-sm">
            Ihr KI-Assistent für den Grundschulalltag
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tab-Switcher */}
          <div className="flex border-b border-gray-100">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                mode === 'login'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Anmelden
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                mode === 'register'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Registrieren
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Fehlermeldung */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Erfolgsmeldung */}
            {success && (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* E-Mail */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                E-Mail-Adresse
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="name@schule.de"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-base"
              />
            </div>

            {/* Passwort */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Passwort
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder={mode === 'register' ? 'Mindestens 6 Zeichen' : '••••••••'}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Schul-Zugangscode (nur bei Registrierung) */}
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="schulCode"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Schul-Zugangscode{' '}
                  <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="schulCode"
                  type="text"
                  value={schulCode}
                  onChange={(e) => setSchulCode(e.target.value)}
                  required
                  placeholder="z. B. PILOT-2026"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-base font-mono tracking-wider"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Dieser Code wird von Ihrer Schulleitung bereitgestellt.
                </p>
              </div>
            )}

            {/* Absenden */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-base shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{mode === 'login' ? 'Anmelden...' : 'Konto erstellen...'}</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Anmelden' : 'Konto erstellen'}</span>
              )}
            </button>

            {/* DSGVO-Hinweis */}
            <p className="text-center text-xs text-gray-400 pt-1">
              🔒 DSGVO-konform · Daten verbleiben in der EU
            </p>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Schul-Assistent · Datenschutz · Nur für registrierte Lehrkräfte
        </p>
      </div>
    </div>
  )
}
