import { notFound } from 'next/navigation'
import { getToolById } from '@/config/tools.config'
import ToolDetailClient from '@/components/dashboard/ToolDetailClient'
import type { Metadata } from 'next'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = getToolById(params.id)
  if (!tool) return { title: 'Tool nicht gefunden' }
  return { title: `${tool.name} – Schul-Assistent` }
}

export default function ToolPage({ params }: Props) {
  const tool = getToolById(params.id)
  if (!tool) notFound()

  return <ToolDetailClient tool={tool} />
}
