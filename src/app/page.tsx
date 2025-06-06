import Link from 'next/link'
import UploadForm from '@/components/UploadForm'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                🎯 KlassenarbeitAI
              </h1>
              <p className="text-gray-600 mt-2">Erstelle intelligente Quizzes und Lernreisen mit KI</p>
            </div>
            <Link 
              href="/admin" 
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              🛠️ Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            KI-gestützte Lernwelten für jeden Klassenarbeit-Inhalt
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Unser DeepSeek AI-System analysiert deine Klassenarbeit-Inhalte tiefgreifend und erstellt 
            maßgeschneiderte Quizzes oder Discovery-Lernreisen mit echten, fachspezifischen Inhalten.
          </p>
          
          {/* Process Timeline */}
          <div className="bg-blue-50 rounded-xl p-6 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">📋 So funktioniert's:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl mb-2">📝</div>
                <div className="font-medium text-gray-900 mb-1">1. Content eingeben</div>
                <div className="text-gray-600">Klassenarbeit-Text oder Thema hochladen</div>
                <div className="text-xs text-blue-600 mt-2">⚡ Sofort</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl mb-2">🧠</div>
                <div className="font-medium text-gray-900 mb-1">2. KI-Analyse</div>
                <div className="text-gray-600">DeepSeek erforscht und strukturiert deine Inhalte</div>
                <div className="text-xs text-orange-600 mt-2">⏱️ 3-5 Minuten</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-medium text-gray-900 mb-1">3. Lernwelt bereit</div>
                <div className="text-gray-600">Interaktive Quiz oder Discovery-Reise</div>
                <div className="text-xs text-green-600 mt-2">✅ Hochqualitativ</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Wichtig:</strong> Die KI-Analyse dauert 3-5 Minuten für qualitativ hochwertige, 
                fachspezifische Inhalte. Keine Lernwelt wird vor Abschluss der Analyse verfügbar.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <UploadForm />
        </div>

        {/* Quality Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Research-First Quizzes</h3>
            <p className="text-gray-600 mb-4">
              DeepSeek AI analysiert deine Inhalte tiefgreifend und erstellt 20+ fachspezifische Fragen 
              mit verschiedenen Schwierigkeitsgraden.
            </p>
            <div className="text-sm text-blue-600 space-y-1">
              <div>✓ Subject-spezifische Terminologie</div>
              <div>✓ Adaptive Schwierigkeitsgrade</div>
              <div>✓ Detaillierte Erklärungen</div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">KI-generierte Lernreisen</h3>
            <p className="text-gray-600 mb-4">
              Spielerische Lernpfade mit interaktiven Stationen, die auf echter Inhaltsanalyse 
              und automatischer Themen-Erkennung basieren.
            </p>
            <div className="text-sm text-purple-600 space-y-1">
              <div>✓ Automatische Themen-Detection</div>
              <div>✓ Progressive Learning Paths</div>
              <div>✓ Interaktive Elemente</div>
            </div>
          </div>
        </div>

        {/* Quality Promise */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Warum warten lohnt sich</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h4 className="font-semibold text-gray-900 mb-2">Fachspezifische Präzision</h4>
              <p className="text-sm text-gray-600">DeepSeek erkennt automatisch dein Fach (Mathe, Geschichte, etc.) und erstellt passgenaue Inhalte</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">📊</div>
              <h4 className="font-semibold text-gray-900 mb-2">Qualitative Tiefe</h4>
              <p className="text-sm text-gray-600">20+ durchdachte Fragen statt oberflächlicher Automatik-Inhalte</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🔬</div>
              <h4 className="font-semibold text-gray-900 mb-2">Echte KI-Analyse</h4>
              <p className="text-sm text-gray-600">Keine Shortcuts oder Templates - jede Lernwelt ist einzigartig</p>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <div className="inline-block bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-green-700">Qualität braucht Zeit:</span> 
                3-5 Minuten KI-Research = Stunden gesparte Vorbereitungszeit
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
