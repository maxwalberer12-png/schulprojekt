import ToolGrid from '@/components/dashboard/ToolGrid'
import { TOOLS, TOOL_CATEGORIES } from '@/config/tools.config'

export const metadata = {
  title: 'Dashboard – Schul-Assistent',
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Seitenheader */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Meine Tools</h1>
        <p className="text-gray-500 mt-1">
          Wähle ein Tool aus, um es zu nutzen. Alle Texte werden DSGVO-konform erstellt.
        </p>
      </div>

      {/* Filterbares Tool-Raster (Client Component) */}
      <ToolGrid tools={TOOLS} categories={TOOL_CATEGORIES} />
    </div>
  )
}
