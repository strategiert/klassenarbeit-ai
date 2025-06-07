import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-admin'
import { OpenAI } from 'openai'

// Quick synchronous test to see if DeepSeek API actually works
export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json()
    
    console.log('🧪 QUICK TEST: Direct DeepSeek API call')
    
    // Test DeepSeek API directly
    const client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com'
    })

    const prompt = `Erstelle für das Thema "${title}" mit dem Inhalt "${content}" eine kurze JSON-Antwort:

{
  "summary": "Kurze Zusammenfassung",
  "key_facts": ["Fakt 1", "Fakt 2"],
  "quiz_questions": [
    {
      "question": "Testfrage?",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "Erklärung"
    }
  ]
}

Antworte NUR mit JSON.`

    console.log('🚀 Calling DeepSeek...')
    
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.7
    })

    console.log('✅ DeepSeek response received!')
    
    const responseContent = response.choices[0].message.content
    console.log('📄 Response:', responseContent?.substring(0, 500))
    
    // Try to parse JSON
    let parsedData
    try {
      // Clean response
      let cleanContent = responseContent || '{}'
      if (cleanContent.includes('```json')) {
        cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/\s*```/g, '').trim()
      }
      
      parsedData = JSON.parse(cleanContent)
      console.log('✅ JSON parsing successful')
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      return NextResponse.json({
        success: false,
        error: 'JSON parsing failed',
        rawResponse: responseContent,
        parseError: parseError.message
      })
    }

    // Create discovery path directly in database
    const supabase = createClient()
    const subdomain = `quick-test-${Date.now()}`
    
    console.log('💾 Saving to database...')
    
    const { data, error } = await supabase
      .from('klassenarbeiten')
      .insert({
        title: `Quick Test - ${title}`,
        content,
        teacher_id: 'quick-test',
        subdomain,
        quiz_data: {
          type: 'discovery_path',
          status: 'completed',
          completed_at: new Date().toISOString(),
          
          // Discovery path structure
          id: `quick_${Date.now()}`,
          title: `Lernreise: ${title}`,
          description: `AI-generierte Lernreise für ${title}`,
          theme: 'AI-Test',
          subject: 'Test',
          
          // Simple objectives from AI data
          objectives: [
            {
              id: 'obj_1',
              title: 'Grundlagen verstehen',
              description: parsedData.summary || 'Grundlagen des Themas',
              difficulty: 'beginner',
              prerequisites: [],
              category: 'Grundlagen',
              estimatedTime: 20
            }
          ],
          
          // Simple stations
          stations: [
            {
              id: 'station_1',
              type: 'explanation',
              title: 'Konzept verstehen',
              content: {
                text: parsedData.summary || 'Erklärung des Konzepts',
                examples: parsedData.key_facts || [],
                visualAids: 'AI-generierte Visualisierung'
              },
              objective: 'obj_1',
              unlocked: true,
              completed: false,
              progress: 0
            },
            {
              id: 'station_2',
              type: 'quiz',
              title: 'Wissen testen',
              content: {
                questions: parsedData.quiz_questions || []
              },
              objective: 'obj_1',
              unlocked: false,
              completed: false,
              progress: 0
            }
          ],
          
          estimatedTotalTime: 30,
          difficulty: 'Einfach',
          
          // Store raw AI data
          research_data: parsedData
        }
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({
        success: false,
        error: 'Database save failed',
        details: error.message
      })
    }

    console.log('✅ Quick test completed successfully!')
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://klassenarbeit-ai.vercel.app'
    const testUrl = `${appUrl}/discover/${subdomain}`
    
    return NextResponse.json({
      success: true,
      message: 'DeepSeek API is working! Quick test completed.',
      discoveryUrl: testUrl,
      aiData: parsedData,
      rawResponse: responseContent,
      database: data
    })
    
  } catch (error) {
    console.error('❌ Quick test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}