import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
        <div className="text-6xl mb-4">⏳</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz nicht verfügbar</h2>
        <p className="text-gray-600 mb-6">
          Das Quiz ist noch nicht fertig erstellt oder existiert nicht. 
          Möglicherweise läuft die Generierung noch im Hintergrund.
        </p>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Bitte warte einen Moment und lade die Seite neu, oder überprüfe den Link.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              🔄 Seite neu laden
            </button>
            <Link
              href="/"
              className="inline-block w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Zur Startseite
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}