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
    console.log('📊 Research data from request:', !!researchData)
    
    // FALLBACK: If no research data in request, try to get it from database
    let finalResearchData = researchData
    if (!finalResearchData && (klassenarbeitId || subdomain)) {
      console.log('🔄 No research data in request, fetching from database...')
      
      try {
        const { data: dbRecord } = await supabase
          .from('klassenarbeiten')
          .select('quiz_data, research_data')
          .eq(klassenarbeitId ? 'id' : 'subdomain', klassenarbeitId || subdomain)
          .single()
        
        // Check both locations for research data
        finalResearchData = dbRecord?.research_data || dbRecord?.quiz_data?.research_data
        
        console.log('📚 Found research data in database:', !!finalResearchData)
        console.log('📍 Data location:', dbRecord?.research_data ? 'separate_column' : 'in_quiz_data')
        
      } catch (dbError) {
        console.error('❌ Failed to fetch research data from database:', dbError)
      }
    }
    
    console.log('🔍 Final research data keys:', finalResearchData ? Object.keys(finalResearchData) : 'none')
    
    // Validate research data
    if (!finalResearchData) {
      console.error('❌ No research data available from request or database!')
      return NextResponse.json(
        { error: 'Research data is required for discovery path generation. Research phase must be completed first.' },
        { status: 400 }
      )
    }
    
    // Create the discovery path using AI
    let discoveryPath
    try {
      discoveryPath = await createDiscoveryPath(content, title, profile, finalResearchData)
      
      console.log('✅ Discovery path created:', {
        objectives: discoveryPath.objectives.length,
        stations: discoveryPath.stations.length,
        totalTime: discoveryPath.estimatedTotalTime
      })
    } catch (discoveryError) {
      console.error('❌ Discovery path creation failed:', discoveryError)
      console.error('❌ Error details:', {
        message: discoveryError.message,
        stack: discoveryError.stack,
        researchDataAvailable: !!researchData,
        researchDataKeys: researchData ? Object.keys(researchData) : []
      })
      
      return NextResponse.json(
        { 
          error: 'Discovery path creation failed', 
          details: discoveryError.message,
          debug: {
            hasResearchData: !!researchData,
            researchDataKeys: researchData ? Object.keys(researchData) : []
          }
        },
        { status: 500 }
      )
    }

    let data
    let error
    let finalSubdomain = subdomain
    
    if (klassenarbeitId && subdomain) {
      // Update existing database entry with fallback strategy
      console.log('📝 Updating existing klassenarbeit with discovery path...')
      console.log('🔍 Using ID:', klassenarbeitId, 'Subdomain:', subdomain)
      
      // Get existing data to preserve research_data
      const { data: existing } = await supabase
        .from('klassenarbeiten')
        .select('quiz_data')
        .eq('id', klassenarbeitId)
        .single()
      
      console.log('📚 Existing research_data found:', !!existing?.quiz_data?.research_data)
      
      // First try to update by ID - PRESERVE research_data
      let updateResult = await supabase
        .from('klassenarbeiten')
        .update({
          quiz_data: {
            type: 'discovery_path',
            status: 'completed',
            completed_at: new Date().toISOString(),
            // ✅ PRESERVE existing research_data
            ...(existing?.quiz_data?.research_data ? { research_data: existing.quiz_data.research_data } : {}),
            // ✅ ADD discovery path data
            discovery_path: discoveryPath
          }
        })
        .eq('id', klassenarbeitId)
        .select()
        .single()
      
      // If update by ID fails, try by subdomain as fallback
      if (updateResult.error) {
        console.log('⚠️ Update by ID failed, trying subdomain fallback...')
        console.log('❌ ID Error:', updateResult.error)
        
        // Get existing data for subdomain fallback too
        const { data: existingBySubdomain } = await supabase
          .from('klassenarbeiten')
          .select('quiz_data')
          .eq('subdomain', subdomain)
          .single()
        
        updateResult = await supabase
          .from('klassenarbeiten')
          .update({
            quiz_data: {
              type: 'discovery_path', 
              status: 'completed',
              completed_at: new Date().toISOString(),
              // ✅ PRESERVE research_data in fallback too
              ...(existingBySubdomain?.quiz_data?.research_data ? { research_data: existingBySubdomain.quiz_data.research_data } : {}),
              // ✅ ADD discovery path data
              discovery_path: discoveryPath
            }
          })
          .eq('subdomain', subdomain)
          .select()
          .single()
          
        if (updateResult.error) {
          console.log('❌ Subdomain fallback also failed:', updateResult.error)
        } else {
          console.log('✅ Subdomain fallback successful!')
        }
      } else {
        console.log('✅ Update by ID successful!')
      }
      
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
            status: 'completed',
            completed_at: new Date().toISOString(),
            ...discoveryPath
          }
        })
        .select()
        .single()
      
      data = insertResult.data
      error = insertResult.error
      finalSubdomain = newSubdomain
    }

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json(
        { error: 'Fehler beim Speichern der Lernreise' },
        { status: 500 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://klassenarbeit-ai-ua7d.vercel.app'
    const discoveryUrl = `${appUrl}/discover/${finalSubdomain}`
    
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