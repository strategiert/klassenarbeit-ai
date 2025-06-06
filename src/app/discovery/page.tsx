'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import DiscoveryExplorer from '@/components/DiscoveryExplorer'

function DiscoveryContent() {
  const searchParams = useSearchParams()
  const content = searchParams.get('content') || ''
  const title = searchParams.get('title') || 'Unbekanntes Thema'

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">❌ Kein Inhalt gefunden</h2>
          <p className="text-gray-600">Bitte gehe zurück und gib einen Klassenarbeit-Inhalt ein.</p>
        </div>
      </div>
    )
  }

  return <DiscoveryExplorer content={content} title={title} />
}

export default function DiscoveryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-purple-300 mb-6"></div>
          <h2 className="text-3xl font-bold text-white mb-4">🗺️ Lade deine Lernwelt...</h2>
        </div>
      </div>
    }>
      <DiscoveryContent />
    </Suspense>
  )
}