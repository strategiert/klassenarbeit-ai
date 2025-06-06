import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createDiscoveryPath, LearnerProfile } from '@/lib/discovery-engine'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Creating discovery path...')
    
    const { title, content, learnerProfile, researchData, klassenarbeitId, subdomain } = await request.json()

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
    const discoveryPath = await createDiscoveryPath(content, title, profile, researchData)
    
    console.log('✅ Discovery path created:', {
      objectives: discoveryPath.objectives.length,
      stations: discoveryPath.stations.length,
      totalTime: discoveryPath.estimatedTotalTime
    })

    let data
    let error
    
    if (klassenarbeitId && subdomain) {
      // Update existing database entry
      console.log('📝 Updating existing klassenarbeit with discovery path...')
      const updateResult = await supabase
        .from('klassenarbeiten')
        .update({
          quiz_data: {
            type: 'discovery_path',
            ...discoveryPath
          },
          // Ensure status fields are set correctly
          quiz_generation_status: 'completed',
          quiz_completed_at: new Date().toISOString()
        })
        .eq('id', klassenarbeitId)
        .select()
        .single()
      
      data = updateResult.data
      error = updateResult.error
    } else {
      // Create new database entry (fallback for old workflow)
      console.log('➕ Creating new klassenarbeit for discovery path...')
      const newSubdomain = Math.random().toString(36).substring(2, 8) + Date.now().toString(36)
      
      const insertResult = await supabase
        .from('klassenarbeiten')
        .insert({
          title: discoveryPath.title,
          content,
          teacher_id: 'discovery-engine',
          subdomain: newSubdomain,
          quiz_data: {
            type: 'discovery_path',
            ...discoveryPath
          },
          // Fix: Add missing status fields for research-first architecture
          research_status: 'completed',
          quiz_generation_status: 'completed',
          research_completed_at: new Date().toISOString(),
          quiz_completed_at: new Date().toISOString()
        })
        .select()
        .single()
      
      data = insertResult.data
      error = insertResult.error
      subdomain = newSubdomain
    }

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Speichern der Lernreise' },
        { status: 500 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://klassenarbeit-ai-ua7d.vercel.app'
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