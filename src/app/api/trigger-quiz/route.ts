import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { subdomain, id } = await request.json()

    if (!subdomain && !id) {
      return NextResponse.json(
        { error: 'Subdomain oder ID ist erforderlich' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    
    // Find the klassenarbeit
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

    // Check if research is completed
    if (klassenarbeit.research_status !== 'completed') {
      return NextResponse.json(
        { error: 'Forschung muss erst abgeschlossen werden' },
        { status: 400 }
      )
    }

    // Check if quiz generation is already in progress or completed
    if (klassenarbeit.quiz_generation_status === 'processing') {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Quiz-Generierung läuft bereits',
          status: 'processing'
        }
      )
    }

    if (klassenarbeit.quiz_generation_status === 'completed') {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Quiz bereits generiert',
          status: 'completed',
          subdomain: klassenarbeit.subdomain
        }
      )
    }

    // Trigger quiz generation by calling the generate-quiz endpoint
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080'}/api/generate-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subdomain: klassenarbeit.subdomain
        }),
      })

      if (!response.ok) {
        throw new Error(`Quiz generation failed: ${response.statusText}`)
      }

      const result = await response.json()

      return NextResponse.json({
        success: true,
        message: 'Quiz-Generierung gestartet',
        quiz: result.quiz,
        url: result.url
      })

    } catch (error) {
      console.error('Quiz generation trigger error:', error)
      
      // Mark as failed
      await supabase
        .from('klassenarbeiten')
        .update({
          quiz_generation_status: 'failed',
          error_message: error instanceof Error ? error.message : 'Fehler beim Starten der Quiz-Generierung'
        })
        .eq('id', klassenarbeit.id)

      return NextResponse.json(
        { error: 'Fehler beim Starten der Quiz-Generierung' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Trigger quiz API error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Verarbeiten der Anfrage' },
      { status: 500 }
    )
  }
}