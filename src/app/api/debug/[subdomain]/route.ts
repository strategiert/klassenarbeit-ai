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
        // NEW: Read status from quiz_data (current data structure)
        overall_status: klassenarbeit.quiz_data?.status || 'unknown',
        research_status: klassenarbeit.research_status || (klassenarbeit.quiz_data?.research_data ? 'completed' : 'unknown'),
        quiz_generation_status: klassenarbeit.quiz_generation_status || (klassenarbeit.quiz_data?.type === 'discovery_path' ? 'completed' : klassenarbeit.quiz_data?.status),
        research_completed_at: klassenarbeit.research_completed_at || klassenarbeit.quiz_data?.research_completed_at,
        quiz_completed_at: klassenarbeit.quiz_completed_at || klassenarbeit.quiz_data?.completed_at,
        error_message: klassenarbeit.error_message || klassenarbeit.quiz_data?.error,
        current_step: klassenarbeit.quiz_data?.step,
        progress: klassenarbeit.quiz_data?.progress
      },
      
      content_analysis: {
        original_content_length: klassenarbeit.content?.length || 0,
        original_content_preview: klassenarbeit.content?.substring(0, 200) + '...',
        // FIXED: Check research_data in both old and new location
        has_research_data: !!(klassenarbeit.research_data || klassenarbeit.quiz_data?.research_data),
        research_data_location: klassenarbeit.research_data ? 'separate_column' : klassenarbeit.quiz_data?.research_data ? 'in_quiz_data' : 'none',
        research_data_keys: (klassenarbeit.research_data || klassenarbeit.quiz_data?.research_data) ? Object.keys(klassenarbeit.research_data || klassenarbeit.quiz_data?.research_data) : [],
        has_quiz_data: !!klassenarbeit.quiz_data,
        quiz_data_keys: klassenarbeit.quiz_data ? Object.keys(klassenarbeit.quiz_data) : [],
        has_discovery_path: !!(klassenarbeit.quiz_data?.discovery_path || klassenarbeit.quiz_data?.type === 'discovery_path')
      },
      
      research_data_details: (() => {
        // FIXED: Check research_data in both locations
        const researchData = klassenarbeit.research_data || klassenarbeit.quiz_data?.research_data;
        return researchData ? {
          summary: researchData.summary?.substring(0, 200) + '...',
          key_facts_count: researchData.key_facts?.length || 0,
          quiz_questions_count: researchData.quiz_questions?.length || 0,
          interactive_elements_count: researchData.interactive_elements?.length || 0,
          additional_topics: researchData.additional_topics,
          reasoning_process_exists: !!researchData.reasoning_process,
          data_location: klassenarbeit.research_data ? 'separate_column' : 'in_quiz_data'
        } : null;
      })(),
      
      quiz_data_details: klassenarbeit.quiz_data ? {
        type: klassenarbeit.quiz_data.type,
        status: klassenarbeit.quiz_data.status,
        progress: klassenarbeit.quiz_data.progress,
        step: klassenarbeit.quiz_data.step,
        error: klassenarbeit.quiz_data.error,
        failed_at: klassenarbeit.quiz_data.failed_at,
        completed_at: klassenarbeit.quiz_data.completed_at,
        // Discovery Path specific
        objectives_count: klassenarbeit.quiz_data.discovery_path?.objectives?.length || klassenarbeit.quiz_data.objectives?.length || 0,
        stations_count: klassenarbeit.quiz_data.discovery_path?.stations?.length || klassenarbeit.quiz_data.stations?.length || 0,
        total_time: klassenarbeit.quiz_data.discovery_path?.estimatedTotalTime || klassenarbeit.quiz_data.estimatedTotalTime,
        difficulty: klassenarbeit.quiz_data.discovery_path?.difficulty || klassenarbeit.quiz_data.difficulty,
        // Legacy Quiz specific  
        totalQuestions: klassenarbeit.quiz_data.totalQuestions,
        estimatedTime: klassenarbeit.quiz_data.estimatedTime,
        title: klassenarbeit.quiz_data.title,
        description: klassenarbeit.quiz_data.description?.substring(0, 200) + '...'
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

    // NEW: Improved debug recommendations based on actual data structure
    const researchData = klassenarbeit.research_data || klassenarbeit.quiz_data?.research_data;
    const debugRecommendations = [];

    // Check research phase
    if (!researchData) {
      debugRecommendations.push("❌ No research data found - DeepSeek API failed or not started");
    } else {
      debugRecommendations.push("✅ Research data found - DeepSeek API successful");
    }

    // Check discovery path generation
    if (klassenarbeit.quiz_data?.status === 'failed') {
      debugRecommendations.push(`❌ Discovery path generation failed: ${klassenarbeit.quiz_data.error}`);
    } else if (klassenarbeit.quiz_data?.type === 'discovery_path') {
      debugRecommendations.push("✅ Discovery path successfully generated");
    } else if (klassenarbeit.quiz_data?.status === 'researching') {
      debugRecommendations.push("🔄 Currently in research phase - wait for completion");
    } else if (klassenarbeit.quiz_data?.status === 'generating') {
      debugRecommendations.push("🔄 Currently generating discovery path - wait for completion");
    } else {
      debugRecommendations.push("⚠️ Unknown generation status - check quiz_data.status");
    }

    // Check environment
    if (!process.env.DEEPSEEK_API_KEY) {
      debugRecommendations.push("❌ DEEPSEEK_API_KEY missing in environment");
    }

    // Check data consistency
    if (researchData && klassenarbeit.quiz_data?.status === 'failed') {
      debugRecommendations.push("💡 Research successful but discovery generation failed - likely create-discovery-path issue");
    }

    return NextResponse.json({
      success: true,
      subdomain,
      timestamp: new Date().toISOString(),
      analysis,
      debug_recommendations: debugRecommendations
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