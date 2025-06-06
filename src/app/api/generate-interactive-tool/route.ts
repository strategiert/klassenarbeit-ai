import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-admin'
import { generateInteractiveLearningTool } from '@/lib/ai-interaction-generator'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 AI: Starting custom interactive tool generation...')
    
    const { title, content, researchData, klassenarbeitId, subdomain } = await request.json()

    if (!title || !content || !researchData) {
      return NextResponse.json(
        { error: 'Title, content, and research data are required' },
        { status: 400 }
      )
    }

    console.log('🤖 AI: Analyzing topic and generating custom interactions...')
    
    // AI generates completely custom interactive learning tool
    const aiGeneratedTool = await generateInteractiveLearningTool(title, content, researchData)
    
    console.log('✅ AI: Generated custom tool with', aiGeneratedTool.interactiveElements.length, 'unique interactive elements')
    
    // Save the AI-generated tool to database
    const supabase = createClient()
    
    let data, error
    
    if (klassenarbeitId && subdomain) {
      // Update existing entry with AI-generated interactive tool
      console.log('💾 Saving AI-generated interactive tool to database...')
      
      const updateResult = await supabase
        .from('klassenarbeiten')
        .update({
          quiz_data: {
            type: 'ai_generated_tool',
            status: 'completed',
            completed_at: new Date().toISOString(),
            
            // AI-Generated Content
            aiTool: aiGeneratedTool,
            
            // Discovery Path Structure (for compatibility)
            id: aiGeneratedTool.id,
            title: `AI Lernwelt: ${title}`,
            description: `Individuell generierte Lernwelt für ${title} mit ${aiGeneratedTool.interactiveElements.length} maßgeschneiderten Interaktionen.`,
            theme: aiGeneratedTool.subject,
            subject: aiGeneratedTool.subject,
            
            // Convert AI elements to discovery objectives and stations
            objectives: generateObjectivesFromAITool(aiGeneratedTool),
            stations: generateStationsFromAITool(aiGeneratedTool),
            estimatedTotalTime: calculateEstimatedTime(aiGeneratedTool),
            difficulty: determineDifficulty(aiGeneratedTool),
            
            // Preserve research data
            research_data: researchData
          }
        })
        .eq('id', klassenarbeitId)
        .select()
        .single()
      
      data = updateResult.data
      error = updateResult.error
    } else {
      // Create new entry
      const newSubdomain = Math.random().toString(36).substring(2, 8) + Date.now().toString(36)
      
      const insertResult = await supabase
        .from('klassenarbeiten')
        .insert({
          title: aiGeneratedTool.topic,
          content,
          teacher_id: 'ai-generator',
          subdomain: newSubdomain,
          quiz_data: {
            type: 'ai_generated_tool',
            status: 'completed',
            completed_at: new Date().toISOString(),
            aiTool: aiGeneratedTool,
            
            id: aiGeneratedTool.id,
            title: `AI Lernwelt: ${title}`,
            description: `Individuell generierte Lernwelt für ${title}`,
            theme: aiGeneratedTool.subject,
            subject: aiGeneratedTool.subject,
            objectives: generateObjectivesFromAITool(aiGeneratedTool),
            stations: generateStationsFromAITool(aiGeneratedTool),
            estimatedTotalTime: calculateEstimatedTime(aiGeneratedTool),
            difficulty: determineDifficulty(aiGeneratedTool)
          }
        })
        .select()
        .single()
      
      data = insertResult.data
      error = insertResult.error
    }

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save AI-generated tool', details: error.message },
        { status: 500 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://klassenarbeit-ai.vercel.app'
    const toolUrl = `${appUrl}/discover/${data?.subdomain || subdomain}`
    
    console.log('🎉 AI-Generated Interactive Tool Ready:', toolUrl)
    
    return NextResponse.json({
      success: true,
      message: 'AI hat eine individuelle Lernwelt für dein Thema entwickelt!',
      aiTool: aiGeneratedTool,
      url: toolUrl,
      stats: {
        uniqueInteractions: aiGeneratedTool.interactiveElements.length,
        subject: aiGeneratedTool.subject,
        customComponents: aiGeneratedTool.customComponents.length,
        topicSpecific: true
      }
    })

  } catch (error) {
    console.error('❌ AI tool generation error:', error)
    return NextResponse.json(
      { error: `AI-Entwicklung fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}` },
      { status: 500 }
    )
  }
}

// Helper functions to convert AI-generated tools to discovery path format
function generateObjectivesFromAITool(aiTool: any) {
  return aiTool.interactiveElements.map((element: any, index: number) => ({
    id: `ai_obj_${index + 1}`,
    title: element.title,
    description: element.description,
    difficulty: index === 0 ? 'beginner' : index === aiTool.interactiveElements.length - 1 ? 'advanced' : 'intermediate',
    prerequisites: index === 0 ? [] : [`ai_obj_${index}`],
    category: aiTool.subject,
    estimatedTime: 15 + (index * 5)
  }))
}

function generateStationsFromAITool(aiTool: any) {
  const stations: any[] = []
  
  aiTool.interactiveElements.forEach((element: any, elemIndex: number) => {
    // Each AI element becomes multiple learning stations
    stations.push({
      id: `${element.id}_explanation`,
      type: 'explanation',
      title: `${element.title} verstehen`,
      content: {
        text: element.description,
        aiGenerated: true,
        customStyling: aiTool.styling,
        subject: aiTool.subject
      },
      objective: `ai_obj_${elemIndex + 1}`,
      unlocked: elemIndex === 0,
      completed: false,
      progress: 0
    })
    
    // AI-generated interactive station
    stations.push({
      id: `${element.id}_interactive`,
      type: 'ai_interactive',
      title: element.title,
      content: {
        aiElement: element,
        componentCode: aiTool.customComponents[elemIndex],
        config: element.config,
        customLogic: aiTool.logic,
        styling: aiTool.styling
      },
      objective: `ai_obj_${elemIndex + 1}`,
      unlocked: false,
      completed: false,
      progress: 0
    })
    
    // Reflection station
    stations.push({
      id: `${element.id}_reflection`,
      type: 'reflection',
      title: 'Wissen vertiefen und reflektieren',
      content: {
        questions: [
          `Was hast du bei "${element.title}" gelernt?`,
          `Wie würdest du "${element.title}" jemandem erklären?`,
          `Wo könntest du "${element.title}" im echten Leben anwenden?`
        ],
        topicSpecific: true,
        element: element.title
      },
      objective: `ai_obj_${elemIndex + 1}`,
      unlocked: false,
      completed: false,
      progress: 0
    })
  })
  
  return stations
}

function calculateEstimatedTime(aiTool: any) {
  // Base time + time per AI element + complexity factor
  return 30 + (aiTool.interactiveElements.length * 15) + (aiTool.customComponents.length * 10)
}

function determineDifficulty(aiTool: any) {
  const elementCount = aiTool.interactiveElements.length
  const customComponentCount = aiTool.customComponents.length
  
  if (elementCount >= 4 && customComponentCount >= 3) return 'Fortgeschritten'
  if (elementCount >= 2) return 'Mittel'
  return 'Einfach'
}