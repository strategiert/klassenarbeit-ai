import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { subdomain } = await request.json()
    
    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain erforderlich' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    
    // Check if entry exists and has quiz_data
    const { data: existing, error: checkError } = await supabase
      .from('klassenarbeiten')
      .select('id, title, quiz_data, research_status, quiz_generation_status')
      .eq('subdomain', subdomain)
      .single()

    if (checkError || !existing) {
      return NextResponse.json(
        { error: 'Eintrag nicht gefunden' },
        { status: 404 }
      )
    }

    // Fix missing status fields
    const { data: updated, error: updateError } = await supabase
      .from('klassenarbeiten')
      .update({
        research_status: 'completed',
        quiz_generation_status: 'completed',
        research_completed_at: new Date().toISOString(),
        quiz_completed_at: new Date().toISOString()
      })
      .eq('subdomain', subdomain)
      .select()

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Status-Felder erfolgreich korrigiert',
      subdomain,
      updated_fields: {
        research_status: 'completed',
        quiz_generation_status: 'completed',
        research_completed_at: new Date().toISOString(),
        quiz_completed_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Fix status error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Korrigieren der Status-Felder' },
      { status: 500 }
    )
  }
}