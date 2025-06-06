import { NextRequest, NextResponse } from 'next/server'
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

async function callDeepSeekResearch(topic: string, content: string): Promise<ResearchResult> {
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
    console.log('🧠 Calling DeepSeek-Chat for comprehensive research...')
    
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',  // Faster model!
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 8000,  // Reduced for speed
      response_format: { type: 'json_object' }
    })

    const reasoning = response.choices[0].message.reasoning_content
    const content = response.choices[0].message.content
    
    console.log('✅ DeepSeek research completed with reasoning')
    console.log('🧠 Reasoning length:', reasoning?.length || 0, 'chars')
    
    let researchJson: ResearchResult
    try {
      researchJson = JSON.parse(content || '{}')
      // Add reasoning process to result
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
    
    // Comprehensive fallback with more content
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

export async function POST(request: NextRequest) {
  try {
    const { topic, title, content } = await request.json()
    
    // Use title if topic is not provided (backward compatibility)
    const researchTopic = topic || title || 'Unbekanntes Thema'

    if (!researchTopic) {
      return NextResponse.json(
        { error: 'Thema ist erforderlich' },
        { status: 400 }
      )
    }

    const researchData = await callDeepSeekResearch(researchTopic, content || '')
    
    // Enhanced content combining original with research
    const enhancedContent = content ? 
      `${content}\n\nZusätzliche Recherche-Erkenntnisse:\n${researchData.summary}\n\nWichtige Fakten:\n${researchData.key_facts.join('\n- ')}` 
      : researchData.summary

    return NextResponse.json({
      success: true,
      research: researchData,
      enhancedContent: enhancedContent
    })

  } catch (error) {
    console.error('Research API error:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Recherche' },
      { status: 500 }
    )
  }
}