import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-admin'
import { OpenAI } from 'openai'

interface ResearchResult {
  summary: string
  key_facts: string[]
  detailed_explanations: string[]
  quiz_questions: Array<{
    question: string
    options: string[]
    correct: number
    explanation: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  }>
  interactive_elements: Array<{
    type: 'drag_drop' | 'sorting' | 'matching' | 'timeline'
    title: string
    description: string
    content: any
  }>
  additional_topics: string[]
  reasoning_process?: string
}

async function generateSubdomain(title: string): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30)
  
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  return `${baseSlug}-${randomSuffix}`
}

async function performResearch(topic: string, content: string): Promise<ResearchResult> {
  const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com'
  })

  const prompt = `Du bist ein Experte für Bildungsinhalte und Klassenarbeitsvorbereitung. 

THEMA: "${topic}"
KLASSENARBEIT-INHALT: "${content}"

Erstelle eine umfassende Lernressource mit folgenden Elementen:

1. TIEFE ANALYSE des Themas für Schüler der 8.-12. Klasse
2. 20-25 QUIZ-FRAGEN mit verschiedenen Schwierigkeitsgraden
3. INTERAKTIVE ELEMENTE (Drag&Drop, Sortierung, etc.)
4. DETAILLIERTE ERKLÄRUNGEN für besseres Verständnis

Antworte AUSSCHLIESSLICH mit diesem JSON-Format:
{
  "summary": "Kompakte, schülergerechte Zusammenfassung (3-4 Sätze)",
  "key_facts": ["10-15 wichtige Fakten als Bullet Points"],
  "detailed_explanations": ["5-7 ausführliche Erklärungen zu Kernkonzepten"],
  "quiz_questions": [
    {
      "question": "Präzise formulierte Frage",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Warum diese Antwort richtig ist",
      "difficulty": "beginner|intermediate|advanced"
    }
  ],
  "interactive_elements": [
    {
      "type": "drag_drop|sorting|matching|timeline",
      "title": "Interaktives Element Titel",
      "description": "Was soll der Schüler machen?",
      "content": {
        "items": ["Element 1", "Element 2"],
        "categories": ["Kategorie A", "Kategorie B"],
        "instructions": "Ziehe die Elemente in die richtige Reihenfolge"
      }
    }
  ],
  "additional_topics": ["Verwandte Themen für Vertiefung"]
}`

  try {
    console.log('🧠 Calling DeepSeek-Reasoner for comprehensive research...')
    console.log('📝 Topic:', topic.substring(0, 50), '...')
    console.log('📄 Content length:', content?.length || 0)
    console.log('🔑 API Key configured:', !!process.env.DEEPSEEK_API_KEY)
    
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 8000,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })

    const reasoning = response.choices[0].message.reasoning_content
    const responseContent = response.choices[0].message.content
    
    console.log('✅ DeepSeek research completed')
    console.log('📊 Response length:', responseContent?.length || 0)
    console.log('🧠 Has reasoning:', !!reasoning)
    
    let researchJson: ResearchResult
    try {
      researchJson = JSON.parse(responseContent || '{}')
      if (reasoning) {
        researchJson.reasoning_process = reasoning
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      throw new Error('Invalid JSON response from DeepSeek')
    }
    
    return researchJson
  } catch (error) {
    console.error('❌ DeepSeek API error:', error)
    
    // Fallback research data
    return {
      summary: `Das Thema "${topic}" ist ein wichtiger Bestandteil des Lehrplans und erfordert eine systematische Vorbereitung für die Klassenarbeit.`,
      key_facts: [
        'Grundlegende Konzepte verstehen',
        'Praktische Anwendungen kennen',
        'Zusammenhänge erkennen',
        'Kritisches Denken entwickeln',
        'Wissen anwenden können'
      ],
      detailed_explanations: [
        `Das Thema ${topic} umfasst verschiedene Aspekte, die Schüler verstehen sollten.`,
        'Eine systematische Herangehensweise hilft beim Lernen.',
        'Praktische Beispiele vertiefen das Verständnis.'
      ],
      quiz_questions: [
        {
          question: `Was ist ein wichtiger Aspekt von ${topic}?`,
          options: ['Grundverständnis', 'Anwendung', 'Reflexion', 'Alle genannten'],
          correct: 3,
          explanation: 'Alle Aspekte sind wichtig für ein vollständiges Verständnis.',
          difficulty: 'beginner' as const
        }
      ],
      interactive_elements: [
        {
          type: 'sorting' as const,
          title: 'Konzepte ordnen',
          description: 'Sortiere die Konzepte nach Wichtigkeit',
          content: {
            items: ['Grundlagen', 'Anwendung', 'Vertiefung'],
            instructions: 'Ziehe die Elemente in die richtige Reihenfolge'
          }
        }
      ],
      additional_topics: ['Verwandte Themen', 'Weiterführende Inhalte']
    }
  }
}

// Async research function that runs in background
async function performAsyncResearch(klassenarbeitId: string, title: string, content: string, mode: string = 'quiz') {
  const supabase = createClient()
  
  try {
    // Update status to processing - use only quiz_data for compatibility
    await supabase
      .from('klassenarbeiten')
      .update({
        quiz_data: { status: 'researching', progress: 10, step: 'Analysiere Inhalte...' }
      })
      .eq('id', klassenarbeitId)

    console.log(`🧠 Starting deep research for ${klassenarbeitId}`)

    // Perform research with retry logic
    let researchData
    let retryCount = 0
    const maxRetries = 3

    while (retryCount < maxRetries) {
      try {
        // Update progress
        await supabase
          .from('klassenarbeiten')
          .update({ 
            quiz_data: { status: 'researching', progress: 30 + (retryCount * 20), step: 'DeepSeek AI analysiert...' }
          })
          .eq('id', klassenarbeitId)

        researchData = await performResearch(title, content)
        break // Success - exit retry loop
      } catch (error) {
        retryCount++
        console.log(`🔄 Research attempt ${retryCount} failed:`, error.message)
        
        // DeepSeek-specific error handling
        if (error.status === 429) {
          // Rate limit - longer wait
          console.log('⚠️ DeepSeek rate limit hit, waiting longer...')
          await new Promise(resolve => setTimeout(resolve, retryCount * 10000)) // 10s, 20s, 30s
        } else if (error.status === 503) {
          // Server overloaded - exponential backoff
          console.log('⚠️ DeepSeek server overloaded, backing off...')
          await new Promise(resolve => setTimeout(resolve, retryCount * 5000)) // 5s, 10s, 15s
        } else if (error.status === 402) {
          // Insufficient balance - don't retry
          console.log('❌ DeepSeek insufficient balance - check account')
          throw new Error('DeepSeek API balance insufficient. Please check your account.')
        } else if (error.code === 'ETIMEDOUT') {
          // Timeout - with 180s this shouldn't happen, but just in case
          console.log('⚠️ DeepSeek timeout - content might be too complex')
          await new Promise(resolve => setTimeout(resolve, retryCount * 3000))
        } else {
          // Generic error - shorter wait
          await new Promise(resolve => setTimeout(resolve, retryCount * 2000))
        }
        
        if (retryCount >= maxRetries) {
          throw error
        }
      }
    }

    // Update with research results - store everything in quiz_data for compatibility
    await supabase
      .from('klassenarbeiten')
      .update({
        quiz_data: { 
          status: 'generating', 
          progress: 70, 
          step: 'Erstelle Lernwelt...',
          research_data: researchData,
          research_completed_at: new Date().toISOString()
        }
      })
      .eq('id', klassenarbeitId)

    console.log(`✅ Research completed for ${klassenarbeitId}`)

    // Trigger content generation
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    if (mode === 'discovery') {
      const response = await fetch(`${appUrl}/api/create-discovery-path`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          researchData,
          klassenarbeitId,
          subdomain: (await supabase.from('klassenarbeiten').select('subdomain').eq('id', klassenarbeitId).single()).data?.subdomain
        }),
      })
      
      if (!response.ok) {
        throw new Error('Discovery path generation failed')
      }
    } else {
      const response = await fetch(`${appUrl}/api/generate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain: (await supabase.from('klassenarbeiten').select('subdomain').eq('id', klassenarbeitId).single()).data?.subdomain
        }),
      })
      
      if (!response.ok) {
        throw new Error('Quiz generation failed')
      }
    }

    console.log(`🎉 Complete workflow finished for ${klassenarbeitId}`)

  } catch (error) {
    console.error('Async research failed:', error)
    
    // Get existing data to preserve research_data if it exists
    const { data: existing } = await supabase
      .from('klassenarbeiten')
      .select('quiz_data')
      .eq('id', klassenarbeitId)
      .single()
    
    // Mark as failed but preserve research data if it exists
    await supabase
      .from('klassenarbeiten')
      .update({
        quiz_data: { 
          ...(existing?.quiz_data?.research_data ? { research_data: existing.quiz_data.research_data } : {}),
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unbekannter Fehler', 
          step: 'Fehler aufgetreten',
          failed_at: new Date().toISOString()
        }
      })
      .eq('id', klassenarbeitId)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, teacherId, mode = 'quiz' } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Titel und Inhalt sind erforderlich' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    
    // Generate unique subdomain
    const subdomain = await generateSubdomain(title)
    
    // Create initial database entry - use only basic columns that definitely exist
    const { data: klassenarbeit, error: insertError } = await supabase
      .from('klassenarbeiten')
      .insert({
        title,
        content,
        teacher_id: teacherId || 'anonymous',
        subdomain,
        quiz_data: { status: 'pending', type: mode || 'quiz', started_at: new Date().toISOString() }
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { error: 'Fehler beim Erstellen des Eintrags' },
        { status: 500 }
      )
    }

    // Start async research process (no await - runs in background)
    console.log(`🔬 Starting async research process for ${klassenarbeit.id}`)
    
    // Trigger background research without waiting
    performAsyncResearch(klassenarbeit.id, title, content, mode)
      .catch(error => {
        console.error('Background research failed:', error)
      })

    // Return immediately - user gets instant response
    return NextResponse.json({
      success: true,
      id: klassenarbeit.id,
      subdomain: klassenarbeit.subdomain,
      status: {
        research: 'pending',
        quiz: 'pending',
        estimated_time_minutes: 3
      },
      message: 'Deine KI-Research wurde gestartet! Das dauert etwa 3-4 Minuten.',
      polling_url: `/api/status/${klassenarbeit.subdomain}`
    })

  } catch (error) {
    console.error('Process content API error:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Verarbeitung' },
      { status: 500 }
    )
  }
}