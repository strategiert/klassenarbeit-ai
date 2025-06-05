import { NextRequest, NextResponse } from 'next/server'

interface ResearchResult {
  summary: string
  key_facts: string[]
  sources: Array<{
    title: string
    url: string
    description: string
  }>
  additional_topics: string[]
}

async function callPerplexityAPI(topic: string): Promise<ResearchResult> {
  const prompt = `Führe eine umfassende Recherche zum Thema "${topic}" für eine Klassenarbeitsvorbereitung durch. 

Fokussiere dich auf:
- Grundlegende Konzepte und Definitionen
- Wichtige Formeln, Regeln oder Prinzipien
- Häufige Prüfungsthemen und typische Aufgaben
- Praktische Beispiele und Anwendungen
- Häufige Fehlerquellen bei Schülern

Antworte im folgenden JSON-Format:
{
  "summary": "Kurze Zusammenfassung des Themas (2-3 Sätze)",
  "key_facts": ["Wichtiger Fakt 1", "Wichtiger Fakt 2", "Wichtiger Fakt 3"],
  "sources": [
    {
      "title": "Quelle 1 Titel",
      "url": "https://example.com",
      "description": "Kurze Beschreibung der Quelle"
    }
  ],
  "additional_topics": ["Verwandtes Thema 1", "Verwandtes Thema 2"]
}`

  try {
    console.log('🔍 Calling Perplexity API for research...')
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Perplexity API error: ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log('✅ Perplexity research completed')
    
    let researchText = data.choices[0].message.content
    
    // Clean up JSON if needed
    if (researchText.includes('```json')) {
      researchText = researchText.split('```json')[1].split('```')[0]
    }
    
    const researchJson = JSON.parse(researchText.trim())
    
    return researchJson as ResearchResult
  } catch (error) {
    console.error('❌ Perplexity API error:', error)
    
    // Fallback
    return {
      summary: `Grundlegende Informationen zum Thema "${topic}" konnten nicht abgerufen werden.`,
      key_facts: [
        'Thema ist relevant für die Klassenarbeit',
        'Weitere Recherche empfohlen',
        'Fallback-Modus aktiv'
      ],
      sources: [
        {
          title: 'Fallback-Quelle',
          url: '#',
          description: 'API-Fehler aufgetreten'
        }
      ],
      additional_topics: ['Verwandte Themen', 'Weitere Recherche nötig']
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json()

    if (!topic) {
      return NextResponse.json(
        { error: 'Thema ist erforderlich' },
        { status: 400 }
      )
    }

    const researchData = await callPerplexityAPI(topic)
    
    return NextResponse.json({
      success: true,
      research: researchData
    })

  } catch (error) {
    console.error('Research API error:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Recherche' },
      { status: 500 }
    )
  }
}