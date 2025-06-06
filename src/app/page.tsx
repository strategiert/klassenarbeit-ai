'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [classContent, setClassContent] = useState('')
  const [classTitle, setClassTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const createDiscoveryPath = async () => {
    if (!classContent.trim() || !classTitle.trim()) return
    
    setIsCreating(true)
    
    // Encode content for URL
    const encodedContent = encodeURIComponent(classContent)
    const encodedTitle = encodeURIComponent(classTitle)
    
    // Navigate directly to discovery explorer
    window.location.href = `/discovery?content=${encodedContent}&title=${encodedTitle}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                🎯 KlassenarbeitAI
              </h1>
              <p className="text-gray-300 mt-2">Entdecke Wissen durch interaktive Lernreisen</p>
            </div>
            <Link 
              href="/admin" 
              className="bg-gray-800/50 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-700/50 transition-colors text-sm"
            >
              🛠️ Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl p-8 backdrop-blur-sm border border-white/10 mb-8">
            <h2 className="text-5xl font-bold text-white mb-6">
              🗺️ Discovery Learning Engine
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-4xl mx-auto leading-relaxed">
              Verwandle jede Klassenarbeit in eine <span className="text-purple-300 font-semibold">spielerische Lernreise</span>. 
              Unsere KI erstellt automatisch interaktive Lernlandschaften mit mehreren Stationen, 
              Achievements und adaptiven Pfaden.
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl mb-16">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">🚀 Starte deine Lernreise</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-3">
                📚 Titel deiner Klassenarbeit:
              </label>
              <input
                type="text"
                value={classTitle}
                onChange={(e) => setClassTitle(e.target.value)}
                placeholder="z.B. Quadratische Funktionen, Zweiter Weltkrieg, Deutsche Grammatik..."
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm"
              />
            </div>
            
            <div>
              <label className="block text-white font-medium mb-3">
                📝 Klassenarbeit-Inhalt einfügen:
              </label>
              <textarea
                value={classContent}
                onChange={(e) => setClassContent(e.target.value)}
                placeholder="Kopiere hier den Text deiner Klassenarbeit oder Aufgaben hinein..."
                rows={8}
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm resize-none"
              />
            </div>
            
            <button
              onClick={createDiscoveryPath}
              disabled={!classContent.trim() || !classTitle.trim() || isCreating}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-xl"
            >
              {isCreating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Erstelle deine Lernreise...
                </div>
              ) : (
                '🗺️ Lernreise erstellen'
              )}
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="text-4xl mb-4">🧭</div>
            <h3 className="text-xl font-bold text-white mb-3">Adaptive Pfade</h3>
            <p className="text-gray-200">Jeder Lernende bekommt seinen individuellen Pfad basierend auf Stärken und Schwächen</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-xl font-bold text-white mb-3">Gamification</h3>
            <p className="text-gray-200">Achievements, Streaks und XP-System machen das Lernen zu einem spannenden Abenteuer</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-3">Live Analytics</h3>
            <p className="text-gray-200">Detaillierte Einblicke in Lernfortschritt und Performance für Lehrer und Schüler</p>
          </div>
        </div>

        {/* Demo Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">🎯 Demo ausprobieren</h3>
            <p className="text-gray-200 mb-6">
              Noch keine Klassenarbeit zur Hand? Probiere unsere Demos mit Beispiel-Themen aus!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/discovery?content=Religion%20-%20Christentum%20(allgemeine%20Informationen%2C%20Urspr%C3%BCnge%2C%20Kernbotschaft(-en)%2FVerst%C3%A4ndnis%20von%20Gott%2C%20Jesus%20Christus%2C%20fr%C3%BChe%20Christen%2C%20die%20heilige%20Schrift%2C%20Konfessionen%20(inkl.%20Unterschiede)%20%2B%20Freikirchen%2C%20wichtige%20Symbole%2C%20Kirche%2F%20Gebetshaus%2C%20Verfolgung%20von%20Christen%2C%20heilige%20Orte%2C%20wichtige%20Feiertage%2F%20besondere%20Tage%2C%20wichtige%20Kunstwerke%2C%20wichtige%20Traditionen)%20Judentum%20(allgemeine%20Informationen%2C%20Urspr%C3%BCnge%2C%20Kernbotschaft(-en)%2FVerst%C3%A4ndnis%20von%20Gott%2C%20die%20heilige%20Schrift%2C%20verschiedene%20Richtungen%2C%20wichtige%20Symbole%2C%20Synagoge%2F%20Gebetshaus%2C%20Verfolgung%20von%20Juden%2C%20heilige%20Orte%2C%20wichtige%20Feiertage%2F%20besondere%20Tage%2C%20wichtige%20Traditionen)%20Islam%20(allgemeine%20Informationen%2C%20Urspr%C3%BCnge%2C%20Verst%C3%A4ndnis%20von%20Gott%2C%20die%20heilige%20Schrift%2C%20die%20f%C3%BCnf%20S%C3%A4ulen%2C%20verschiedene%20Richtungen%2C%20wichtige%20Symbole%2C%20Moschee%2F%20Gebetshaus%2C%20Verbreitung%2C%20heilige%20Orte%2C%20wichtige%20Feiertage%2F%20besondere%20Tage%2C%20wichtige%20Traditionen)%20Jesidentum%20(allgemeine%20Informationen%2C%20Urspr%C3%BCnge%2C%20Verst%C3%A4ndnis%20von%20Gott%2C%20die%20heilige%20Schrift%2C%20drei%20Kasten%2C%20wichtige%20Symbole%2C%20Gebetshaus%2C%20Verbreitung%2C%20Verfolgung%20von%20Jesiden%2C%20heilige%20Orte%2C%20wichtige%20Feiertage%2F%20besondere%20Tage%2C%20wichtige%20Traditionen)&title=Religion%20-%20Vier%20Weltreligionen"
                className="bg-orange-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-orange-700 transition-colors shadow-lg"
              >
                🕌 Demo: Religionen-Entdecker
              </Link>
              <Link 
                href="/discovery?content=Die%20quadratische%20Funktion%20f(x)%20%3D%20ax%C2%B2%20%2B%20bx%20%2B%20c%20ist%20eine%20der%20wichtigsten%20Funktionen%20in%20der%20Mathematik.%20Sie%20beschreibt%20Parabeln%20und%20hat%20viele%20Anwendungen%20in%20der%20Physik%20und%20Technik.&title=Quadratische%20Funktionen"
                className="bg-green-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-green-700 transition-colors shadow-lg"
              >
                🧮 Demo: Mathematik
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
