import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-admin'
import QuizInterface from '@/components/QuizInterface'

interface QuizPageProps {
  params: Promise<{ subdomain: string }>
}

async function getQuiz(subdomain: string) {
  const supabase = createClient()
  
  try {
    const { data: quiz, error } = await supabase
      .from('klassenarbeiten')
      .select('*')
      .eq('subdomain', subdomain)
      .eq('is_active', true)
      .single()

    if (error || !quiz) {
      console.error('Quiz not found:', error)
      return { status: 'not_found', quiz: null }
    }

    // STRICT CHECKING: Both research AND quiz generation must be completed
    if (quiz.research_status !== 'completed' || quiz.quiz_generation_status !== 'completed') {
      console.log(`Quiz not ready: research=${quiz.research_status}, generation=${quiz.quiz_generation_status}`)
      return { 
        status: 'not_ready', 
        quiz: null,
        research_status: quiz.research_status,
        quiz_generation_status: quiz.quiz_generation_status,
        title: quiz.title,
        subdomain: quiz.subdomain
      }
    }

    // Additional check: quiz_data must exist and be valid
    if (!quiz.quiz_data || typeof quiz.quiz_data !== 'object') {
      console.error('Invalid quiz_data')
      return { status: 'not_ready', quiz: null }
    }

    // Increment view count only for fully ready quizzes
    await supabase
      .from('klassenarbeiten')
      .update({ views_count: quiz.views_count + 1 })
      .eq('id', quiz.id)

    return { status: 'ready', quiz }
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return { status: 'error', quiz: null }
  }
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { subdomain } = await params
  const result = await getQuiz(subdomain)

  // Handle different states
  if (result.status === 'not_found') {
    notFound()
  }

  if (result.status === 'not_ready') {
    // Show "Still Processing" page instead of 404
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-6xl mb-6">🧠</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lernwelt wird noch erstellt</h2>
          <p className="text-gray-600 mb-6">
            "{result.title}" ist noch nicht bereit. Unsere KI arbeitet gerade an hochwertigen, 
            fachspezifischen Inhalten für dich.
          </p>
          
          <div className="space-y-3 mb-6">
            <div className={`flex items-center space-x-3 p-2 rounded ${
              result.research_status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
            }`}>
              <span>{result.research_status === 'completed' ? '✅' : '🔄'}</span>
              <span className="text-sm">DeepSeek AI Forschung</span>
            </div>
            <div className={`flex items-center space-x-3 p-2 rounded ${
              result.quiz_generation_status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
            }`}>
              <span>{result.quiz_generation_status === 'completed' ? '✅' : '🔄'}</span>
              <span className="text-sm">Lernwelt Generierung</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              🔄 Status aktualisieren
            </button>
            <a
              href={`/api/status/${result.subdomain}`}
              target="_blank"
              className="inline-block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              📊 Live-Status verfolgen
            </a>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            💡 Tipp: Lass diese Seite offen und aktualisiere gelegentlich den Status
          </p>
        </div>
      </div>
    )
  }

  if (result.status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-6xl mb-6">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Fehler aufgetreten</h2>
          <p className="text-gray-600 mb-6">
            Beim Laden der Lernwelt ist ein Fehler aufgetreten. Bitte versuche es erneut.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            🏠 Zur Startseite
          </button>
        </div>
      </div>
    )
  }

  // Only render quiz if fully ready
  const quiz = result.quiz!
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{quiz.quiz_data.title}</h1>
          <p className="text-gray-600 mt-1">{quiz.quiz_data.description}</p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>📊 {quiz.quiz_data.totalQuestions} Fragen</span>
            <span>⏱️ ca. {quiz.quiz_data.estimatedTime} Minuten</span>
          </div>
        </div>
      </header>

      {/* Quiz Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QuizInterface quiz={quiz.quiz_data} quizId={quiz.id} />
      </main>
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: QuizPageProps) {
  const { subdomain } = await params
  const quiz = await getQuiz(subdomain)

  if (!quiz) {
    return {
      title: 'Quiz nicht gefunden',
    }
  }

  return {
    title: quiz.quiz_data.title,
    description: quiz.quiz_data.description,
  }
}