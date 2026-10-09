'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import {
  GraduationCap,
  LogOut,
  FileText,
  Mail,
  BookOpen,
  Layers,
  TrendingUp,
  ClipboardList,
  ChevronRight,
  Shield,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react'
import { TOOL_CATEGORIES } from '@/config/tools.config'
import type { ToolCategoryMeta } from '@/types/tools'

const ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  Mail,
  BookOpen,
  Layers,
  TrendingUp,
  ClipboardList,
  LayoutDashboard,
}

interface DashboardShellProps {
  user: User
  children: React.ReactNode
}

export default function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const userInitial = (user.email ?? 'L').charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-30
          flex flex-col shadow-xl
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:shadow-none lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-gray-900 text-base leading-tight block">
              Schul-Assistent
            </span>
            <span className="text-xs text-gray-400">KI für Grundschule</span>
          </div>
          {/* Mobile Close */}
          <button
            className="ml-auto lg:hidden text-gray-400 hover:text-gray-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {/* Alle Tools */}
          <Link
            href="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all
              ${pathname === '/dashboard'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            <span>Alle Tools</span>
            {pathname === '/dashboard' && (
              <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
            )}
          </Link>

          {/* Kategorien */}
          <div className="mt-4 mb-2 px-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Kategorien
            </span>
          </div>

          {TOOL_CATEGORIES.map((cat: ToolCategoryMeta) => {
            const Icon = ICON_MAP[cat.icon] ?? FileText
            const href = `/dashboard?category=${cat.id}`
            return (
              <Link
                key={cat.id}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all group"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cat.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{cat.label}</span>
                <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />
              </Link>
            )
          })}
        </nav>

        {/* User & Logout */}
        <div className="border-t border-gray-100 p-4 space-y-3">
          {/* DSGVO-Badge */}
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-xl">
            <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-xs text-green-700 font-medium">DSGVO-konform · EU-Daten</span>
          </div>

          {/* User */}
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{user.email}</p>
              <p className="text-xs text-gray-400">Lehrkraft</p>
            </div>
          </div>

          {/* Logout */}
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Abmelden</span>
            </button>
          </form>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4 sticky top-0 z-10">
          {/* Mobile Hamburger */}
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
            onClick={() => setSidebarOpen(true)}
            aria-label="Menü öffnen"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Greeting */}
          <div className="flex-1">
            <p className="text-sm text-gray-500 hidden sm:block">
              Guten Tag! Was möchtest du heute erstellen?
            </p>
          </div>

          {/* Mobile Logo (when sidebar closed) */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Schul-Assistent</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
