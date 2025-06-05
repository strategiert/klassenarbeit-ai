import UploadForm from '@/components/UploadForm'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">KlassenarbeitAI</h1>
          <p className="text-gray-600 mt-1">Von Klassenarbeit zu interaktivem Quiz in Sekunden</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Klassenarbeiten automatisch in interaktive Quizzes verwandeln
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Einfach Klassenarbeit hochladen oder eingeben - unsere KI generiert automatisch 
            ein interaktives Quiz mit eigener URL für deine Schüler. Keine manuelle Arbeit mehr!
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <UploadForm />
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-3">⚡ Blitzschnell</h3>
            <p className="text-gray-600">Von Klassenarbeit zu fertigem Quiz in unter 30 Sekunden</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-3">🎯 Intelligent</h3>
            <p className="text-gray-600">KI analysiert Inhalte und erstellt passende Fragen automatisch</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-3">🔗 Einfach teilen</h3>
            <p className="text-gray-600">Jedes Quiz bekommt eine eigene URL zum direkten Teilen</p>
          </div>
        </div>
      </main>
    </div>
  )
}
