import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-admin'

interface QuizQuestion {
  id: string
  question: string
  type: 'multiple-choice' | 'true-false' | 'short-answer'
  options?: string[]
  correctAnswer: string
  explanation: string
  topic: string
}

interface QuizData {
  title: string
  description: string
  questions: QuizQuestion[]
  totalQuestions: number
  estimatedTime: number
}

interface ResearchData {
  summary: string
  key_facts: string[]
  detailed_explanations: string[]
  quiz_questions: Array<{
    question: string
    options: string[]
    correct: number
    explanation: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  }>
  interactive_elements: Array<{
    type: 'drag_drop' | 'sorting' | 'matching' | 'timeline'
    title: string
    description: string
    content: any
  }>
  additional_topics: string[]
  reasoning_process?: string
}

async function convertResearchToQuiz(researchData: ResearchData, title: string): Promise<QuizData> {
  // Convert research quiz questions to our quiz format
  const questions: QuizQuestion[] = researchData.quiz_questions.map((q, index) => ({
    id: `q${index + 1}`,
    question: q.question,
    type: 'multiple-choice' as const,
    options: q.options,
    correctAnswer: q.options[q.correct],
    explanation: q.explanation,
    topic: q.difficulty
  }))

  return {
    title: `Quiz: ${title}`,
    description: researchData.summary,
    questions,
    totalQuestions: questions.length,
    estimatedTime: Math.max(5, Math.ceil(questions.length * 1.5))
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Quiz generation API request received')
    
    const body = await request.json()
    const { subdomain, id } = body

    if (!subdomain && !id) {
      return NextResponse.json(
        { error: 'Subdomain oder ID ist erforderlich' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    
    // Find the klassenarbeit by subdomain or id
    let query = supabase
      .from('klassenarbeiten')
      .select('*')
    
    if (subdomain) {
      query = query.eq('subdomain', subdomain)
    } else {
      query = query.eq('id', id)
    }
    
    const { data: klassenarbeit, error: fetchError } = await query.single()

    if (fetchError || !klassenarbeit) {
      return NextResponse.json(
        { error: 'Klassenarbeit nicht gefunden' },
        { status: 404 }
      )
    }

    // Check if research is completed - check both possible locations
    const researchData = klassenarbeit.research_data || klassenarbeit.quiz_data?.research_data
    const researchStatus = klassenarbeit.research_status || klassenarbeit.quiz_data?.status
    
    if (researchStatus !== 'completed' || !researchData) {
      return NextResponse.json(
        { error: 'Forschung noch nicht abgeschlossen' },
        { status: 400 }
      )
    }

    // Check if quiz is already generated
    if (klassenarbeit.quiz_generation_status === 'completed' && klassenarbeit.quiz_data) {
      console.log('✅ Quiz already exists, returning existing data')
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080'
      const quizUrl = `${appUrl}/quiz/${klassenarbeit.subdomain}`
      
      return NextResponse.json({
        success: true,
        quiz: {
          id: klassenarbeit.id,
          title: klassenarbeit.title,
          subdomain: klassenarbeit.subdomain,
          quiz_data: klassenarbeit.quiz_data
        },
        url: quizUrl
      })
    }

    // Update status to processing
    await supabase
      .from('klassenarbeiten')
      .update({ quiz_generation_status: 'processing' })
      .eq('id', klassenarbeit.id)

    console.log('🤖 Generating quiz from research data...')
    
    try {
      // Convert research data to quiz format
      const quizData = await convertResearchToQuiz(researchData, klassenarbeit.title)
      
      // Update database with quiz data
      const { error: updateError } = await supabase
        .from('klassenarbeiten')
        .update({
          quiz_data: quizData,
          quiz_generation_status: 'completed',
          quiz_completed_at: new Date().toISOString(),
          is_active: true
        })
        .eq('id', klassenarbeit.id)

      if (updateError) {
        console.error('Quiz update error:', updateError)
        
        // Mark as failed
        await supabase
          .from('klassenarbeiten')
          .update({
            quiz_generation_status: 'failed',
            error_message: 'Fehler beim Speichern der Quiz-Daten'
          })
          .eq('id', klassenarbeit.id)
          
        return NextResponse.json(
          { error: 'Fehler beim Speichern der Quiz-Daten' },
          { status: 500 }
        )
      }

      console.log('✅ Quiz generated successfully from research data')

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080'
      const quizUrl = `${appUrl}/quiz/${klassenarbeit.subdomain}`
      
      return NextResponse.json({
        success: true,
        quiz: {
          id: klassenarbeit.id,
          title: klassenarbeit.title,
          subdomain: klassenarbeit.subdomain,
          quiz_data: quizData
        },
        url: quizUrl
      })

    } catch (quizError) {
      console.error('Quiz generation error:', quizError)
      
      // Mark quiz generation as failed
      await supabase
        .from('klassenarbeiten')
        .update({
          quiz_generation_status: 'failed',
          error_message: quizError instanceof Error ? quizError.message : 'Unbekannter Fehler'
        })
        .eq('id', klassenarbeit.id)
        
      return NextResponse.json(
        { error: 'Fehler bei der Quiz-Generierung' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Quiz generation API error:', error)
    return NextResponse.json(
      { error: `Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}` },
      { status: 500 }
    )
  }
}