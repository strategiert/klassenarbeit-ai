'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const url = searchParams.get('url') || ''
  const title = searchParams.get('title') || 'Dein Quiz'
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  // Extract subdomain from URL for direct link
  const subdomain = url.split('/quiz/')[1] || ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-3xl font-bold text-gray-900 hover:text-blue-600">
            KlassenarbeitAI
          </Link>
          <p className="text-gray-600 mt-1">Von Klassenarbeit zu interaktivem Quiz in Sekunden</p>
        </div>
      </header>

      {/* Success Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="text-6xl mb-6">🎉</div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Quiz erfolgreich erstellt!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Dein Quiz <strong>"{title}"</strong> wurde automatisch von der KI generiert und ist bereit!
          </p>

          {/* URL Display */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Quiz-URL zum Teilen:</h2>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-mono text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                {copied ? '✅ Kopiert!' : '📋 Kopieren'}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {subdomain && (
              <Link
                href={`/quiz/${subdomain}`}
                className="block w-full bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                🚀 Quiz jetzt ansehen
              </Link>
            )}
            
            <Link
              href="/"
              className="block w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              📝 Neues Quiz erstellen
            </Link>
          </div>

          {/* Instructions */}
          <div className="mt-8 text-left bg-blue-50 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-3">💡 So geht es weiter:</h3>
            <ul className="text-blue-800 space-y-2">
              <li>✅ <strong>Teile die URL</strong> mit deinen Schülern</li>
              <li>✅ <strong>Schüler öffnen den Link</strong> und können sofort starten</li>
              <li>✅ <strong>Automatische Auswertung</strong> mit Erklärungen</li>
              <li>✅ <strong>Themen-Analyse</strong> zeigt Stärken und Schwächen</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <p className="text-gray-600">Lade Quiz-Details...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}