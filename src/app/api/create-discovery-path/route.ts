import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createDiscoveryPath, LearnerProfile } from '@/lib/discovery-engine'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Creating discovery path...')
    
    const { title, content, learnerProfile } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Titel und Inhalt sind erforderlich' },
        { status: 400 }
      )
    }

    // Default learner profile if not provided
    const defaultProfile: LearnerProfile = {
      id: 'default',
      strengths: ['Neugierig', 'Motiviert'],
      weaknesses: ['Noch zu entdecken'],
      learningStyle: 'mixed',
      completedObjectives: [],
      adaptiveLevel: 1
    }

    const profile = learnerProfile || defaultProfile

    console.log('🧠 Generating adaptive learning path...')
    
    // Create the discovery path using AI
    const discoveryPath = await createDiscoveryPath(content, title, profile)
    
    console.log('✅ Discovery path created:', {
      objectives: discoveryPath.objectives.length,
      stations: discoveryPath.stations.length,
      totalTime: discoveryPath.estimatedTotalTime
    })

    // Generate unique subdomain for the discovery path
    const subdomain = Math.random().toString(36).substring(2, 8) + Date.now().toString(36)
    
    // Save to database
    const { data, error } = await supabase
      .from('klassenarbeiten')
      .insert({
        title: discoveryPath.title,
        content,
        teacher_id: 'discovery-engine',
        subdomain,
        quiz_data: {
          type: 'discovery_path',
          ...discoveryPath
        }
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Speichern der Lernreise' },
        { status: 500 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080'
    const discoveryUrl = `${appUrl}/discover/${subdomain}`
    
    return NextResponse.json({
      success: true,
      discoveryPath: data,
      url: discoveryUrl,
      stats: {
        objectives: discoveryPath.objectives.length,
        stations: discoveryPath.stations.length,
        estimatedTime: discoveryPath.estimatedTotalTime,
        difficulty: discoveryPath.difficulty
      }
    })

  } catch (error) {
    console.error('❌ Discovery path creation error:', error)
    return NextResponse.json(
      { error: `Fehler bei der Erstellung der Lernreise: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}` },
      { status: 500 }
    )
  }
}