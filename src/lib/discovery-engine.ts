// Universal Learning Discovery Engine
// Extrahiert aus jeder Klassenarbeit eine adaptive Lernlandschaft

export interface LearningObjective {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  prerequisites: string[]
  category: string
  estimatedTime: number
}

export interface LearningStation {
  id: string
  type: 'explanation' | 'quiz' | 'simulation' | 'reflection' | 'challenge'
  title: string
  content: any
  objective: string
  unlocked: boolean
  completed: boolean
  progress: number
}

export interface DiscoveryPath {
  id: string
  title: string
  description: string
  theme: string
  objectives: LearningObjective[]
  stations: LearningStation[]
  estimatedTotalTime: number
  difficulty: string
  subject: string
}

export interface LearnerProfile {
  id: string
  strengths: string[]
  weaknesses: string[]
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed'
  completedObjectives: string[]
  currentPath?: string
  adaptiveLevel: number
}

// KI-Funktionen für Lernziel-Extraktion
export async function extractLearningObjectives(content: string, title: string): Promise<LearningObjective[]> {
  const prompt = `Analysiere diese Klassenarbeit und extrahiere die zugrundeliegenden Lernziele als strukturierte Lernreise.

KLASSENARBEIT: "${title}"
INHALT: ${content}

Identifiziere:
1. Hauptlernziele (3-8 Stück)
2. Voraussetzungen zwischen den Zielen
3. Schwierigkeitsstufen
4. Kategorien/Themenbereiche
5. Geschätzte Lernzeit pro Ziel

Erstelle eine logische Lernreihenfolge, die aufeinander aufbaut.

Antwortformat (JSON):
{
  "objectives": [
    {
      "id": "obj_1",
      "title": "Grundlagen verstehen",
      "description": "Grundlegende Konzepte und Definitionen beherrschen",
      "difficulty": "beginner",
      "prerequisites": [],
      "category": "Grundlagen",
      "estimatedTime": 15
    }
  ]
}`

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3000,
        temperature: 0.3
      })
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`)
    }

    const data = await response.json()
    let result = data.choices[0].message.content

    // Clean JSON extraction
    const jsonStart = result.indexOf('{')
    const jsonEnd = result.lastIndexOf('}') + 1
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      result = result.substring(jsonStart, jsonEnd)
    }

    const parsed = JSON.parse(result)
    return parsed.objectives || []

  } catch (error) {
    console.error('Error extracting learning objectives:', error)
    
    // Fallback objectives
    return [
      {
        id: 'obj_1',
        title: 'Grundlagen verstehen',
        description: 'Die grundlegenden Konzepte des Themas beherrschen',
        difficulty: 'beginner' as const,
        prerequisites: [],
        category: 'Grundlagen',
        estimatedTime: 15
      },
      {
        id: 'obj_2', 
        title: 'Anwendung üben',
        description: 'Das Gelernte in praktischen Aufgaben anwenden',
        difficulty: 'intermediate' as const,
        prerequisites: ['obj_1'],
        category: 'Anwendung',
        estimatedTime: 20
      }
    ]
  }
}

// Generiert adaptive Lernstationen basierend auf Lernzielen
export async function generateLearningStations(
  objective: LearningObjective, 
  learnerProfile: LearnerProfile,
  classContent: string
): Promise<LearningStation[]> {
  
  const prompt = `Erstelle eine Sequenz von Lernstationen für dieses Lernziel:

LERNZIEL: ${objective.title}
BESCHREIBUNG: ${objective.description}
SCHWIERIGKEIT: ${objective.difficulty}
LERNER-PROFIL: Stärken: ${learnerProfile.strengths.join(', ')}, Schwächen: ${learnerProfile.weaknesses.join(', ')}, Stil: ${learnerProfile.learningStyle}
KLASSENARBEITS-KONTEXT: ${classContent}

Erstelle 3-5 verschiedene Lernstationen:
1. EXPLANATION: Konzept erklären (visuell/auditiv je nach Lerntyp)
2. QUIZ: Verständnis testen (adaptiv zur Schwierigkeit)
3. SIMULATION: Praktische Anwendung (wenn möglich)
4. REFLECTION: Selbstreflexion und Verbindungen
5. CHALLENGE: Kreative Aufgabe oder Problem

Antwortformat (JSON):
{
  "stations": [
    {
      "type": "explanation",
      "title": "Konzept verstehen",
      "content": {
        "text": "Erklärung...",
        "examples": ["Beispiel 1"],
        "visualAids": "Beschreibung visueller Hilfsmittel"
      }
    }
  ]
}`

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3000,
        temperature: 0.5
      })
    })

    const data = await response.json()
    let result = data.choices[0].message.content

    // Clean JSON extraction
    const jsonStart = result.indexOf('{')
    const jsonEnd = result.lastIndexOf('}') + 1
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      result = result.substring(jsonStart, jsonEnd)
    }

    const parsed = JSON.parse(result)
    
    return parsed.stations?.map((station: any, index: number) => ({
      id: `${objective.id}_station_${index + 1}`,
      type: station.type,
      title: station.title,
      content: station.content,
      objective: objective.id,
      unlocked: index === 0, // Erste Station ist freigeschaltet
      completed: false,
      progress: 0
    })) || []

  } catch (error) {
    console.error('Error generating learning stations:', error)
    
    // Fallback stations
    return [
      {
        id: `${objective.id}_station_1`,
        type: 'explanation' as const,
        title: 'Grundlagen verstehen',
        content: {
          text: `Lass uns ${objective.title} Schritt für Schritt erkunden...`,
          examples: ['Praktisches Beispiel wird hier stehen'],
          visualAids: 'Diagramm oder Illustration'
        },
        objective: objective.id,
        unlocked: true,
        completed: false,
        progress: 0
      },
      {
        id: `${objective.id}_station_2`,
        type: 'quiz' as const,
        title: 'Wissen testen',
        content: {
          questions: [
            {
              question: `Was ist das wichtigste Merkmal von ${objective.title}?`,
              options: ['Option A', 'Option B', 'Option C'],
              correct: 0
            }
          ]
        },
        objective: objective.id,
        unlocked: false,
        completed: false,
        progress: 0
      }
    ]
  }
}

// Erstellt die komplette Discovery Path
export async function createDiscoveryPath(
  content: string, 
  title: string, 
  learnerProfile: LearnerProfile
): Promise<DiscoveryPath> {
  
  console.log('🗺️ Creating discovery path for:', title)
  
  // 1. Extrahiere Lernziele
  const objectives = await extractLearningObjectives(content, title)
  console.log('📋 Extracted objectives:', objectives.length)
  
  // 2. Generiere Lernstationen für jedes Ziel
  const allStations: LearningStation[] = []
  for (const objective of objectives) {
    const stations = await generateLearningStations(objective, learnerProfile, content)
    allStations.push(...stations)
  }
  
  console.log('🛤️ Generated stations:', allStations.length)
  
  // 3. Bestimme Gesamtthema und Schwierigkeit
  const totalTime = objectives.reduce((sum, obj) => sum + obj.estimatedTime, 0)
  const avgDifficulty = objectives.length > 0 ? 
    objectives.some(obj => obj.difficulty === 'advanced') ? 'Fortgeschritten' :
    objectives.some(obj => obj.difficulty === 'intermediate') ? 'Mittel' : 'Einfach'
    : 'Mittel'
  
  return {
    id: `path_${Date.now()}`,
    title: `Lernreise: ${title}`,
    description: `Entdecke ${title} durch eine adaptive, spielerische Lernreise mit ${objectives.length} Lernzielen.`,
    theme: objectives[0]?.category || 'Allgemein',
    objectives,
    stations: allStations,
    estimatedTotalTime: totalTime,
    difficulty: avgDifficulty,
    subject: 'Automatisch erkannt'
  }
}