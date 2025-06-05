interface QuizData {
  title: string
  description: string
  questions: Array<{
    id: string
    question: string
    type: 'multiple-choice' | 'true-false' | 'short-answer'
    options?: string[]
    correctAnswer: string
    explanation: string
    topic: string
  }>
  totalQuestions: number
  estimatedTime: number
}

const QUIZ_PROMPT = (content: string, title: string) => `Du bist ein Experte für Bildung und Quiz-Erstellung. Analysiere die folgende Klassenarbeit und erstelle daraus ein interaktives Quiz.

KLASSENARBEIT TITEL: ${title}

KLASSENARBEIT INHALT:
${content}

Erstelle ein Quiz mit folgenden Spezifikationen:
- 10-15 abwechslungsreiche Fragen 
- Mix aus Multiple Choice, True/False und Kurz-Antwort Fragen
- Fragen sollen verschiedene Schwierigkeitsgrade haben
- Jede Frage braucht eine ausführliche Erklärung
- Ordne Fragen nach Themen

WICHTIG: Antworte NUR mit dem JSON-Format, keine zusätzlichen Erklärungen!

{
  "title": "Quiz-Titel",
  "description": "Kurze Beschreibung des Quiz",
  "questions": [
    {
      "id": "q1",
      "question": "Fragetext",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Ausführliche Erklärung warum diese Antwort richtig ist",
      "topic": "Themenbereich"
    }
  ],
  "totalQuestions": 12,
  "estimatedTime": 15
}`

export async function callDeepSeek(content: string, title: string): Promise<QuizData> {
  console.log('🚀 Trying DeepSeek API...')
  
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: QUIZ_PROMPT(content, title) }],
      max_tokens: 4000,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.statusText}`)
  }

  const data = await response.json()
  let quizText = data.choices[0].message.content
  
  console.log('🔍 Raw DeepSeek response:', quizText)
  
  // Clean up the response - extract JSON
  if (quizText.includes('```json')) {
    quizText = quizText.split('```json')[1].split('```')[0]
  } else if (quizText.includes('```')) {
    quizText = quizText.split('```')[1].split('```')[0]
  }
  
  // Find JSON object in the text
  const jsonStart = quizText.indexOf('{')
  const jsonEnd = quizText.lastIndexOf('}') + 1
  
  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    quizText = quizText.substring(jsonStart, jsonEnd)
  }
  
  console.log('🧹 Cleaned JSON:', quizText)
  
  return JSON.parse(quizText.trim())
}

export async function callClaude(content: string, title: string): Promise<QuizData> {
  console.log('🔄 Trying Claude API...')
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      messages: [{ role: 'user', content: QUIZ_PROMPT(content, title) }]
    })
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`)
  }

  const data = await response.json()
  let quizText = data.content[0].text
  
  console.log('🔍 Raw Claude response:', quizText)
  
  // Clean up the response - extract JSON
  if (quizText.includes('```json')) {
    quizText = quizText.split('```json')[1].split('```')[0]
  } else if (quizText.includes('```')) {
    quizText = quizText.split('```')[1].split('```')[0]
  }
  
  // Find JSON object in the text
  const jsonStart = quizText.indexOf('{')
  const jsonEnd = quizText.lastIndexOf('}') + 1
  
  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    quizText = quizText.substring(jsonStart, jsonEnd)
  }
  
  console.log('🧹 Cleaned Claude JSON:', quizText)
  
  return JSON.parse(quizText.trim())
}

export async function callOpenAI(content: string, title: string): Promise<QuizData> {
  console.log('🔄 Trying OpenAI API...')
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: QUIZ_PROMPT(content, title) }],
      max_tokens: 4000,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  let quizText = data.choices[0].message.content
  
  console.log('🔍 Raw OpenAI response:', quizText)
  
  // Clean up the response - extract JSON
  if (quizText.includes('```json')) {
    quizText = quizText.split('```json')[1].split('```')[0]
  } else if (quizText.includes('```')) {
    quizText = quizText.split('```')[1].split('```')[0]
  }
  
  // Find JSON object in the text
  const jsonStart = quizText.indexOf('{')
  const jsonEnd = quizText.lastIndexOf('}') + 1
  
  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    quizText = quizText.substring(jsonStart, jsonEnd)
  }
  
  console.log('🧹 Cleaned OpenAI JSON:', quizText)
  
  return JSON.parse(quizText.trim())
}

export async function generateQuizWithFallback(content: string, title: string): Promise<QuizData> {
  const providers = [
    { name: 'DeepSeek', fn: callDeepSeek, cost: '💰' },
    { name: 'Claude', fn: callClaude, cost: '💰💰' },
    { name: 'OpenAI', fn: callOpenAI, cost: '💰💰💰' }
  ]

  for (const provider of providers) {
    try {
      console.log(`🎯 Attempting ${provider.name} (${provider.cost})...`)
      const result = await provider.fn(content, title)
      console.log(`✅ Success with ${provider.name}!`)
      return result
    } catch (error) {
      console.log(`❌ ${provider.name} failed:`, error)
      continue
    }
  }

  // Ultimate fallback
  console.log('🆘 All APIs failed, using fallback quiz')
  return {
    title: `Quiz: ${title}`,
    description: `Interaktives Quiz basierend auf der Klassenarbeit "${title}" (Fallback)`,
    questions: [
      {
        id: 'q1',
        question: `Welches Hauptthema behandelt die Klassenarbeit "${title}"?`,
        type: 'short-answer' as const,
        correctAnswer: 'Individuell je nach Inhalt',
        explanation: 'Diese Frage bezieht sich auf das Hauptthema der eingereichten Klassenarbeit.',
        topic: 'Allgemein'
      },
      {
        id: 'q2',
        question: 'Die KI-APIs sind derzeit nicht verfügbar, aber das Quiz-System funktioniert.',
        type: 'true-false' as const,
        options: ['Wahr', 'Falsch'],
        correctAnswer: 'Wahr',
        explanation: 'Das ist korrekt! Auch ohne KI-APIs zeigt das System die grundlegende Funktionalität.',
        topic: 'System-Test'
      }
    ],
    totalQuestions: 2,
    estimatedTime: 5
  }
}