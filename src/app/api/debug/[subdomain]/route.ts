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
    
    // Get complete database record
    const { data: klassenarbeit, error } = await supabase
      .from('klassenarbeiten')
      .select('*')
      .eq('subdomain', subdomain)
      .single()

    if (error || !klassenarbeit) {
      return NextResponse.json({
        success: false,
        error: 'Klassenarbeit nicht gefunden',
        subdomain,
        timestamp: new Date().toISOString()
      })
    }

    // Analyze the data
    const analysis = {
      basic_info: {
        id: klassenarbeit.id,
        title: klassenarbeit.title,
        subdomain: klassenarbeit.subdomain,
        created_at: klassenarbeit.created_at,
        is_active: klassenarbeit.is_active,
        views_count: klassenarbeit.views_count
      },
      
      status_info: {
        research_status: klassenarbeit.research_status,
        quiz_generation_status: klassenarbeit.quiz_generation_status,
        research_completed_at: klassenarbeit.research_completed_at,
        quiz_completed_at: klassenarbeit.quiz_completed_at,
        error_message: klassenarbeit.error_message
      },
      
      content_analysis: {
        original_content_length: klassenarbeit.content?.length || 0,
        original_content_preview: klassenarbeit.content?.substring(0, 200) + '...',
        has_research_data: !!klassenarbeit.research_data,
        research_data_keys: klassenarbeit.research_data ? Object.keys(klassenarbeit.research_data) : [],
        has_quiz_data: !!klassenarbeit.quiz_data,
        quiz_data_keys: klassenarbeit.quiz_data ? Object.keys(klassenarbeit.quiz_data) : []
      },
      
      research_data_details: klassenarbeit.research_data ? {
        summary: klassenarbeit.research_data.summary?.substring(0, 200) + '...',
        key_facts_count: klassenarbeit.research_data.key_facts?.length || 0,
        quiz_questions_count: klassenarbeit.research_data.quiz_questions?.length || 0,
        interactive_elements_count: klassenarbeit.research_data.interactive_elements?.length || 0,
        additional_topics: klassenarbeit.research_data.additional_topics,
        reasoning_process_exists: !!klassenarbeit.research_data.reasoning_process
      } : null,
      
      quiz_data_details: klassenarbeit.quiz_data ? {
        title: klassenarbeit.quiz_data.title,
        description: klassenarbeit.quiz_data.description?.substring(0, 200) + '...',
        type: klassenarbeit.quiz_data.type,
        status: klassenarbeit.quiz_data.status,
        progress: klassenarbeit.quiz_data.progress,
        step: klassenarbeit.quiz_data.step,
        totalQuestions: klassenarbeit.quiz_data.totalQuestions,
        estimatedTime: klassenarbeit.quiz_data.estimatedTime,
        objectives_count: klassenarbeit.quiz_data.objectives?.length || 0,
        stations_count: klassenarbeit.quiz_data.stations?.length || 0
      } : null,
      
      environment_check: {
        has_deepseek_key: !!process.env.DEEPSEEK_API_KEY,
        deepseek_key_length: process.env.DEEPSEEK_API_KEY?.length || 0,
        app_url: process.env.NEXT_PUBLIC_APP_URL,
        node_env: process.env.NODE_ENV,
        vercel_env: process.env.VERCEL_ENV
      },
      
      full_raw_data: {
        complete_record: klassenarbeit,
        note: "This is the complete database record as stored"
      }
    }

    return NextResponse.json({
      success: true,
      subdomain,
      timestamp: new Date().toISOString(),
      analysis,
      debug_recommendations: [
        klassenarbeit.research_status !== 'completed' ? "Research not completed - check DeepSeek API" : null,
        klassenarbeit.quiz_generation_status !== 'completed' ? "Quiz generation not completed" : null,
        !klassenarbeit.research_data ? "No research data found - DeepSeek may have failed" : null,
        !process.env.DEEPSEEK_API_KEY ? "DEEPSEEK_API_KEY missing in environment" : null
      ].filter(Boolean)
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug API Fehler',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}