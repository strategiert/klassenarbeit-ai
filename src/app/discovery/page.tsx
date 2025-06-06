'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function DiscoveryContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const content = searchParams.get('content') || ''
  const title = searchParams.get('title') || 'Unbekanntes Thema'
  
  const [status, setStatus] = useState('starting')
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('Vorbereitung...')

  useEffect(() => {
    if (!content) return

    const createDiscoveryPath = async () => {
      try {
        // Step 1: Research starten
        setStatus('researching')
        setProgress(20)
        setCurrentStep('🔍 Deep Research läuft...')
        
        let researchData = { enhancedContent: content }
        
        try {
          const researchResponse = await fetch('/api/research', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
          })
          
          if (researchResponse.ok) {
            researchData = await researchResponse.json()
            console.log('✅ Research successful:', researchData)
          } else {
            const errorText = await researchResponse.text()
            console.log('⚠️ Research failed:', researchResponse.status, errorText)
          }
        } catch (researchError) {
          console.log('⚠️ Research error, continuing with original content:', researchError)
        }
        
        // Step 2: Discovery Path generieren
        setProgress(60)
        setCurrentStep('🎯 Lernreise wird erstellt...')
        
        const discoveryResponse = await fetch('/api/create-discovery-path', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title, 
            content: researchData.enhancedContent || content,
            researchData: researchData.research || null
          })
        })
        
        if (!discoveryResponse.ok) throw new Error('Discovery creation failed')
        const discoveryData = await discoveryResponse.json()
        
        // Step 3: Fertig!
        setProgress(100)
        setCurrentStep('✅ Lernwelt ist bereit!')
        
        // Weiterleitung zur fertigen Discovery Path
        setTimeout(() => {
          router.push(discoveryData.url)
        }, 1500)
        
      } catch (error) {
        console.error('❌ Error creating discovery path:', error)
        setStatus('error')
        setCurrentStep('❌ Fehler beim Erstellen der Lernreise')
      }
    }

    createDiscoveryPath()
  }, [content, title, router])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center p-8">
        {/* Loading Animation */}
        <div className="mb-8">
          <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-purple-300 mx-auto mb-6"></div>
          <div className="text-4xl mb-4">🚀</div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-4">
          Deine Lernwelt wird erstellt!
        </h1>
        <h2 className="text-2xl text-purple-200 mb-8">
          "{title}"
        </h2>

        {/* Progress Bar */}
        <div className="bg-purple-800 rounded-full h-4 mb-6 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-purple-400 to-pink-400 h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Current Step */}
        <p className="text-xl text-purple-100 mb-8">
          {currentStep}
        </p>

        {/* Steps Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className={`p-4 rounded-lg ${progress >= 20 ? 'bg-purple-700 text-white' : 'bg-purple-800 text-purple-300'}`}>
            <div className="text-2xl mb-2">🔍</div>
            <div>Deep Research</div>
          </div>
          <div className={`p-4 rounded-lg ${progress >= 60 ? 'bg-purple-700 text-white' : 'bg-purple-800 text-purple-300'}`}>
            <div className="text-2xl mb-2">🎯</div>
            <div>Lernreise Design</div>
          </div>
          <div className={`p-4 rounded-lg ${progress >= 100 ? 'bg-purple-700 text-white' : 'bg-purple-800 text-purple-300'}`}>
            <div className="text-2xl mb-2">🎉</div>
            <div>Fertigstellung</div>
          </div>
        </div>

        {/* Error State */}
        {status === 'error' && (
          <div className="mt-8 p-4 bg-red-900 text-red-100 rounded-lg">
            <p>Es gab einen Fehler beim Erstellen der Lernreise.</p>
            <button 
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-2 bg-red-700 hover:bg-red-600 rounded-lg transition-colors"
            >
              Zurück zur Startseite
            </button>
          </div>
        )}
      </div>
    </div>
  )
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