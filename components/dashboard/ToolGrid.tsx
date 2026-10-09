'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import ToolCard from './ToolCard'
import type { Tool, ToolCategoryMeta } from '@/types/tools'

interface ToolGridProps {
  tools: Tool[]
  categories: ToolCategoryMeta[]
}

export default function ToolGrid({ tools, categories }: ToolGridProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>(
    searchParams.get('category') ?? 'all'
  )

  // Sync URL-Parameter mit State
  useEffect(() => {
    const cat = searchParams.get('category') ?? 'all'
    setActiveCategory(cat)
  }, [searchParams])

  // Kategorie wechseln + URL aktualisieren
  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId)
    setSearchQuery('')
    if (catId === 'all') {
      router.push('/dashboard', { scroll: false })
    } else {
      router.push(`/dashboard?category=${catId}`, { scroll: false })
    }
  }

  // Gefilterte Tools berechnen
  const filteredTools = useMemo(() => {
    let result = tools

    if (activeCategory !== 'all') {
      result = result.filter((t) => t.category === activeCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.shortDescription.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.includes(q))
      )
    }

    return result
  }, [tools, activeCategory, searchQuery])

  const activeCategoryLabel =
    categories.find((c) => c.id === activeCategory)?.label ?? 'Alle Tools'

  return (
    <div className="space-y-6">
      {/* ── Suchleiste & Filter-Chips ─────────────────────── */}
      <div className="space-y-4">
        {/* Suchleiste */}
        <div className="relative max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tool suchen (z. B. Zeugnis, Elternbrief...)"
            className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-shadow"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Suche löschen"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Kategorie-Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            Alle
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Ergebnis-Info ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-500">
          {searchQuery ? (
            <>
              <span className="text-gray-900 font-semibold">{filteredTools.length}</span>{' '}
              Ergebnis{filteredTools.length !== 1 ? 'se' : ''} für &bdquo;{searchQuery}&ldquo;
            </>
          ) : (
            <>
              <span className="text-gray-900 font-semibold">{filteredTools.length}</span>{' '}
              {filteredTools.length !== 1 ? 'Tools' : 'Tool'} ·{' '}
              {activeCategoryLabel}
            </>
          )}
        </h2>
      </div>

      {/* ── Tool-Raster ───────────────────────────────────── */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Kein Tool gefunden</p>
          <p className="text-gray-400 text-sm mt-1">
            Versuche einen anderen Suchbegriff oder wähle eine andere Kategorie.
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              handleCategoryChange('all')
            }}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            Filter zurücksetzen
          </button>
        </div>
      )}
    </div>
  )
}
