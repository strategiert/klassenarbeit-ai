import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    // Test Supabase connection
    let supabaseTest = { connected: false, error: null }
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('klassenarbeiten').select('id').limit(1)
      supabaseTest = { connected: !error, error: error?.message || null }
    } catch (e) {
      supabaseTest = { connected: false, error: e.message }
    }

    // Test DeepSeek API
    let deepseekTest = { configured: false, accessible: false, error: null }
    if (process.env.DEEPSEEK_API_KEY) {
      deepseekTest.configured = true
      try {
        // Simple test call to DeepSeek
        const { OpenAI } = await import('openai')
        const client = new OpenAI({
          apiKey: process.env.DEEPSEEK_API_KEY,
          baseURL: 'https://api.deepseek.com'
        })
        
        const response = await client.chat.completions.create({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Test' }],
          max_tokens: 5
        })
        
        deepseekTest.accessible = !!response.choices[0]
      } catch (e) {
        deepseekTest.error = e.message
      }
    }

    const environment = {
      timestamp: new Date().toISOString(),
      node_env: process.env.NODE_ENV,
      vercel_env: process.env.VERCEL_ENV,
      app_url: process.env.NEXT_PUBLIC_APP_URL,
      
      api_keys: {
        deepseek: {
          configured: !!process.env.DEEPSEEK_API_KEY,
          key_length: process.env.DEEPSEEK_API_KEY?.length || 0,
          key_prefix: process.env.DEEPSEEK_API_KEY?.substring(0, 8) + '...' || 'not set'
        },
        supabase: {
          url_configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          anon_key_configured: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          service_key_configured: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        }
      },
      
      connectivity_tests: {
        supabase: supabaseTest,
        deepseek: deepseekTest
      },

      recent_processing_stats: null // Will be filled below
    }

    // Get recent processing statistics
    try {
      const supabase = createClient()
      const { data: recentEntries, error } = await supabase
        .from('klassenarbeiten')
        .select('id, title, created_at, research_status, quiz_generation_status, error_message')
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && recentEntries) {
        environment.recent_processing_stats = {
          total_recent: recentEntries.length,
          research_completed: recentEntries.filter(e => e.research_status === 'completed').length,
          research_failed: recentEntries.filter(e => e.research_status === 'failed').length,
          generation_completed: recentEntries.filter(e => e.quiz_generation_status === 'completed').length,
          generation_failed: recentEntries.filter(e => e.quiz_generation_status === 'failed').length,
          recent_errors: recentEntries.filter(e => e.error_message).map(e => ({
            id: e.id,
            title: e.title,
            error: e.error_message
          }))
        }
      }
    } catch (e) {
      environment.recent_processing_stats = { error: e.message }
    }

    return NextResponse.json({
      success: true,
      environment,
      health_check: {
        overall: supabaseTest.connected && deepseekTest.configured,
        issues: [
          !supabaseTest.connected ? 'Supabase connection failed' : null,
          !deepseekTest.configured ? 'DeepSeek API key not configured' : null,
          deepseekTest.configured && !deepseekTest.accessible ? 'DeepSeek API not accessible' : null
        ].filter(Boolean)
      }
    })

  } catch (error) {
    console.error('Environment debug error:', error)
    return NextResponse.json({
      success: false,
      error: 'Environment check failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}