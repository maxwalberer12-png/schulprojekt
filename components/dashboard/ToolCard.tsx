'use client'

import Link from 'next/link'
import {
  FileText, Mail, BookOpen, Layers, TrendingUp, ClipboardList,
  Clock, ArrowRight, Star, Sparkles, ClipboardCheck, CalendarDays,
  Target, LayoutGrid, BookMarked, Search, FileSignature, Stamp,
} from 'lucide-react'
import type { Tool } from '@/types/tools'

const ICON_MAP: Record<string, React.ElementType> = {
  FileText, Mail, BookOpen, Layers, TrendingUp, ClipboardList,
  ClipboardCheck, CalendarDays, Target, LayoutGrid, BookMarked,
  Search, FileSignature, Stamp,
}

// Kategorie → Farbschema
const CATEGORY_STYLES: Record<string, {
  border: string
  badge: string
  hover: string
  iconBg: string
}> = {
  zeugnisse: {
    border: 'border-t-violet-400',
    badge: 'bg-violet-100 text-violet-700',
    hover: 'hover:border-violet-200',
    iconBg: 'bg-violet-100 text-violet-700',
  },
  eltern: {
    border: 'border-t-blue-400',
    badge: 'bg-blue-100 text-blue-700',
    hover: 'hover:border-blue-200',
    iconBg: 'bg-blue-100 text-blue-700',
  },
  unterricht: {
    border: 'border-t-green-400',
    badge: 'bg-green-100 text-green-700',
    hover: 'hover:border-green-200',
    iconBg: 'bg-green-100 text-green-700',
  },
  differenzierung: {
    border: 'border-t-orange-400',
    badge: 'bg-orange-100 text-orange-700',
    hover: 'hover:border-orange-200',
    iconBg: 'bg-orange-100 text-orange-700',
  },
  foerderung: {
    border: 'border-t-pink-400',
    badge: 'bg-pink-100 text-pink-700',
    hover: 'hover:border-pink-200',
    iconBg: 'bg-pink-100 text-pink-700',
  },
  verwaltung: {
    border: 'border-t-gray-400',
    badge: 'bg-gray-100 text-gray-700',
    hover: 'hover:border-gray-300',
    iconBg: 'bg-gray-100 text-gray-700',
  },
}

interface ToolCardProps {
  tool: Tool
}

export default function ToolCard({ tool }: ToolCardProps) {
  const Icon = ICON_MAP[tool.icon] ?? FileText
  const styles = CATEGORY_STYLES[tool.category] ?? CATEGORY_STYLES.verwaltung

  return (
    <Link
      href={`/dashboard/tool/${tool.id}`}
      className={`
        group relative bg-white rounded-2xl border-2 border-t-4 border-gray-100 p-5
        flex flex-col gap-3 cursor-pointer
        shadow-sm hover:shadow-md
        transition-all duration-200 ease-out
        hover:-translate-y-0.5
        ${styles.border} ${styles.hover}
      `}
    >
      {/* Badges oben rechts */}
      <div className="absolute top-4 right-4 flex gap-1.5">
        {tool.badge === 'Beliebt' && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
            <Star className="w-3 h-3 fill-current" />
            Beliebt
          </span>
        )}
        {tool.badge === 'Neu' && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
            <Sparkles className="w-3 h-3" />
            Neu
          </span>
        )}
      </div>

      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${styles.iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pr-4">
        <h3 className="font-semibold text-gray-900 text-base leading-snug group-hover:text-blue-700 transition-colors">
          {tool.name}
        </h3>
        <p className="text-gray-500 text-sm mt-1 leading-relaxed line-clamp-2">
          {tool.shortDescription}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{tool.estimatedTime}</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-blue-600 group-hover:gap-2 transition-all">
          <span>Öffnen</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  )
}
