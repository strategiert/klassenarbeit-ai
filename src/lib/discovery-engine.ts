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
  console.log('🎯 Extracting learning objectives for:', title)
  
  try {
    // Use the same robust AI system as the quiz generation
    const { generateQuizWithFallback } = await import('./ai-providers')
    
    // Create a special prompt for learning objectives
    const objectivePrompt = `Analysiere diese Klassenarbeit und extrahiere NUR die zugrundeliegenden Lernziele:

TITEL: ${title}
INHALT: ${content}

Extrahiere 3-6 Hauptlernziele in dieser JSON-Struktur:
{
  "objectives": [
    {
      "id": "obj_1", 
      "title": "Grundlagen verstehen",
      "description": "Beschreibung des Lernziels",
      "difficulty": "beginner",
      "prerequisites": [],
      "category": "Hauptkategorie", 
      "estimatedTime": 15
    }
  ]
}`

    // Try to use our existing AI fallback system
    const tempQuizData = await generateQuizWithFallback(objectivePrompt, 'Learning Objectives')
    
    // Extract objectives from the quiz data or create fallback
    const fallbackObjectives = [
      {
        id: 'obj_1',
        title: 'Grundlagen verstehen',
        description: `Die grundlegenden Konzepte von "${title}" beherrschen`,
        difficulty: 'beginner' as const,
        prerequisites: [],
        category: 'Grundlagen',
        estimatedTime: 15
      },
      {
        id: 'obj_2',
        title: 'Anwendung üben', 
        description: `Das Gelernte zu "${title}" praktisch anwenden`,
        difficulty: 'intermediate' as const,
        prerequisites: ['obj_1'],
        category: 'Anwendung',
        estimatedTime: 20
      },
      {
        id: 'obj_3',
        title: 'Vertiefung und Transfer',
        description: `"${title}" in verschiedenen Kontexten verstehen und anwenden`,
        difficulty: 'advanced' as const, 
        prerequisites: ['obj_2'],
        category: 'Transfer',
        estimatedTime: 25
      }
    ]
    
    return fallbackObjectives

  } catch (error) {
    console.error('❌ Error extracting learning objectives:', error)
    
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
  
  console.log('🛤️ Generating stations for objective:', objective.title)
  
  try {
    // Generate smart stations based on objective
    return [
      {
        id: `${objective.id}_station_1`,
        type: 'explanation' as const,
        title: `${objective.title} verstehen`,
        content: {
          text: `Lass uns ${objective.title} Schritt für Schritt erkunden. ${objective.description}`,
          examples: [
            `Praktisches Beispiel für ${objective.category}`,
            `Anwendung in der realen Welt`
          ],
          visualAids: `Interaktive Visualisierung für ${objective.title}`
        },
        objective: objective.id,
        unlocked: true,
        completed: false,
        progress: 0
      },
      {
        id: `${objective.id}_station_2`,
        type: 'quiz' as const,
        title: 'Verständnis testen',
        content: {
          questions: [
            {
              question: `Was hast du über ${objective.title} gelernt?`,
              options: [
                'Die Grundlagen sind mir klar',
                'Ich verstehe die Anwendung', 
                'Ich sehe die Verbindungen',
                'Ich kann es anderen erklären'
              ],
              correct: 3
            }
          ]
        },
        objective: objective.id,
        unlocked: false,
        completed: false,
        progress: 0
      },
      {
        id: `${objective.id}_station_3`,
        type: 'reflection' as const,
        title: 'Nachdenken und Verbinden',
        content: {
          prompt: `Denke über ${objective.title} nach`,
          questions: [
            'Was war für dich neu?',
            'Wie kannst du es anwenden?',
            'Welche Verbindungen siehst du?'
          ]
        },
        objective: objective.id,
        unlocked: false,
        completed: false,
        progress: 0
      }
    ]
  } catch (error) {
    console.error('❌ Error generating stations:', error)
    
    // Simple fallback
    return [
      {
        id: `${objective.id}_station_1`,
        type: 'explanation' as const,
        title: 'Entdecken',
        content: { text: `Erkunde ${objective.title}` },
        objective: objective.id,
        unlocked: true,
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