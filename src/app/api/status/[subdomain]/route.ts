import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain ist erforderlich' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    
    const { data: klassenarbeit, error } = await supabase
      .from('klassenarbeiten')
      .select('id, title, created_at, research_status, quiz_generation_status, research_completed_at, quiz_completed_at, error_message, is_active, quiz_data')
      .eq('subdomain', subdomain)
      .single()

    if (error || !klassenarbeit) {
      return NextResponse.json(
        { error: 'Klassenarbeit nicht gefunden' },
        { status: 404 }
      )
    }

    // Extract progress info from quiz_data
    const quizData = klassenarbeit.quiz_data || {}
    const currentProgress = quizData.progress || 0
    const currentStep = quizData.step || 'Vorbereitung...'
    const startedAt = quizData.started_at || klassenarbeit.created_at
    
    // Calculate elapsed time
    const elapsedMs = new Date().getTime() - new Date(startedAt).getTime()
    const elapsedMinutes = Math.floor(elapsedMs / 60000)
    const elapsedSeconds = Math.floor((elapsedMs % 60000) / 1000)
    
    // Estimate remaining time based on progress
    let estimatedRemainingMinutes = 0
    if (currentProgress > 0 && currentProgress < 100) {
      const totalEstimatedMs = (elapsedMs / currentProgress) * 100
      const remainingMs = totalEstimatedMs - elapsedMs
      estimatedRemainingMinutes = Math.max(0, Math.floor(remainingMs / 60000))
    }

    // Calculate processing stages with detailed info
    const stages = [
      {
        name: 'research',
        label: 'DeepSeek AI Forschung',
        status: klassenarbeit.research_status,
        completed_at: klassenarbeit.research_completed_at,
        progress: klassenarbeit.research_status === 'completed' ? 100 : 
                 klassenarbeit.research_status === 'processing' ? currentProgress : 0
      },
      {
        name: 'generation',
        label: 'Lernwelt Generierung',
        status: klassenarbeit.quiz_generation_status,
        completed_at: klassenarbeit.quiz_completed_at,
        progress: klassenarbeit.quiz_generation_status === 'completed' ? 100 :
                 klassenarbeit.quiz_generation_status === 'processing' ? Math.min(currentProgress - 50, 50) : 0
      }
    ]

    // Determine overall status
    let overallStatus = 'processing'
    if (klassenarbeit.quiz_generation_status === 'completed') {
      overallStatus = 'completed'
    } else if (klassenarbeit.research_status === 'failed' || klassenarbeit.quiz_generation_status === 'failed') {
      overallStatus = 'failed'
    }

    return NextResponse.json({
      success: true,
      id: klassenarbeit.id,
      subdomain: subdomain,
      title: klassenarbeit.title,
      status: overallStatus,
      stages,
      progress: {
        current: currentProgress,
        step: currentStep,
        elapsed_time: {
          minutes: elapsedMinutes,
          seconds: elapsedSeconds,
          total_seconds: Math.floor(elapsedMs / 1000)
        },
        estimated_remaining_minutes: estimatedRemainingMinutes
      },
      error_message: klassenarbeit.error_message,
      is_active: klassenarbeit.is_active,
      ready_for_quiz: klassenarbeit.quiz_generation_status === 'completed' && klassenarbeit.is_active,
      redirect_url: klassenarbeit.quiz_generation_status === 'completed' ? 
        `/quiz/${subdomain}` : null,
      
      // DEBUG INFO
      debug_info: {
        created_at: klassenarbeit.created_at,
        research_completed_at: klassenarbeit.research_completed_at,
        quiz_completed_at: klassenarbeit.quiz_completed_at,
        has_research_data: !!klassenarbeit.research_data,
        has_quiz_data: !!klassenarbeit.quiz_data,
        content_preview: klassenarbeit.content?.substring(0, 100) + '...',
        research_data_summary: klassenarbeit.research_data?.summary?.substring(0, 100) + '...' || 'No research data',
        quiz_data_type: klassenarbeit.quiz_data?.type || 'Unknown',
        environment: {
          has_deepseek_key: !!process.env.DEEPSEEK_API_KEY,
          app_url: process.env.NEXT_PUBLIC_APP_URL,
          vercel_env: process.env.VERCEL_ENV
        }
      }
    })

  } catch (error) {
    console.error('Status API error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen des Status' },
      { status: 500 }
    )
  }
}