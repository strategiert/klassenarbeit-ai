import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import QuizInterface from '@/components/QuizInterface'

interface QuizPageProps {
  params: Promise<{ subdomain: string }>
}

async function getQuiz(subdomain: string) {
  // Demo-Modus: Da keine echte Datenbank, zeige Demo-Quiz
  return {
    id: subdomain,
    title: 'Demo Quiz - Funktioniert!',
    quiz_data: {
      title: "Demo: KI-generiertes Quiz",
      description: "Dieses Quiz wurde automatisch von der KI erstellt",
      questions: [
        {
          id: "q1",
          question: "Die KlassenarbeitAI funktioniert ohne Datenbank im Demo-Modus.",
          type: "true-false",
          options: ["Wahr", "Falsch"],
          correctAnswer: "Wahr",
          explanation: "Richtig! Die App läuft jetzt im Demo-Modus und generiert echte Quizzes mit DeepSeek AI.",
          topic: "Demo"
        },
        {
          id: "q2",
          question: "Welche AI-APIs sind in dieser App integriert?",
          type: "multiple-choice",
          options: ["Nur ChatGPT", "DeepSeek, Claude, OpenAI", "Nur Google AI", "Keine AI"],
          correctAnswer: "DeepSeek, Claude, OpenAI",
          explanation: "Korrekt! Die App hat ein Multi-AI Fallback-System mit DeepSeek (günstig), Claude und OpenAI als Backup.",
          topic: "Technologie"
        }
      ],
      totalQuestions: 2,
      estimatedTime: 3
    }
  }
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { subdomain } = await params
  const quiz = await getQuiz(subdomain)

  if (!quiz) {
    notFound()
  }

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