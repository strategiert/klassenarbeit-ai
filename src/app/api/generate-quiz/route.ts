import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateQuizWithFallback } from '@/lib/ai-providers'

interface QuizQuestion {
  id: string
  question: string
  type: 'multiple-choice' | 'true-false' | 'short-answer'
  options?: string[]
  correctAnswer: string
  explanation: string
  topic: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface QuizData {
  title: string
  description: string
  questions: QuizQuestion[]
  totalQuestions: number
  estimatedTime: number
}


function generateSubdomain(): string {
  return Math.random().toString(36).substring(2, 8) + Date.now().toString(36)
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 API Request received')
    
    const body = await request.json()
    console.log('📦 Request body:', { title: body.title, contentLength: body.content?.length })
    
    const { title, content, teacherId = 'demo-teacher' } = body

    if (!title || !content) {
      console.log('❌ Missing title or content')
      return NextResponse.json(
        { error: 'Titel und Inhalt sind erforderlich' },
        { status: 400 }
      )
    }

    console.log('🤖 Starting AI quiz generation...')
    
    // Generate quiz using AI with fallback system
    const quizData = await generateQuizWithFallback(content, title)
    
    console.log('✅ Quiz generated successfully')
    
    // Generate unique subdomain
    const subdomain = generateSubdomain()
    
    // Save to Supabase database
    const { data, error } = await supabase
      .from('klassenarbeiten')
      .insert({
        title,
        content,
        teacher_id: teacherId,
        subdomain,
        quiz_data: quizData
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Speichern in der Datenbank' },
        { status: 500 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080'
    const quizUrl = `${appUrl}/quiz/${subdomain}`
    
    console.log('🔗 Quiz URL generated:', quizUrl)

    return NextResponse.json({
      success: true,
      quiz: data,
      url: quizUrl
    })

  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json(
      { error: `Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}` },
      { status: 500 }
    )
  }
}