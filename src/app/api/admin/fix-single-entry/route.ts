import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { subdomain } = await request.json()
    
    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain required' }, { status: 400 })
    }

    const supabase = createClient()
    
    // Direct update without checking first
    const { data, error } = await supabase
      .from('klassenarbeiten')
      .update({
        research_status: 'completed',
        quiz_generation_status: 'completed',
        research_completed_at: new Date().toISOString(),
        quiz_completed_at: new Date().toISOString()
      })
      .eq('subdomain', subdomain)
      .select('id, title, research_status, quiz_generation_status')

    if (error) {
      return NextResponse.json({ 
        error: error.message, 
        details: error 
      }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ 
        error: 'No rows updated - subdomain not found',
        subdomain 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      updated: data,
      subdomain,
      message: 'Status fields updated successfully'
    })

  } catch (error) {
    console.error('Fix entry error:', error)
    return NextResponse.json({ 
      error: 'Internal error', 
      details: error.message 
    }, { status: 500 })
  }
}