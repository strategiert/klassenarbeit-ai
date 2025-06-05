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
  
  // PURE LOGIC-BASED - NO AI CALLS!
  // Analyze content patterns to determine subject and create appropriate objectives
  
  const lowerContent = content.toLowerCase()
  const lowerTitle = title.toLowerCase()
  
  let subject = 'Allgemein'
  let objectives: LearningObjective[] = []
  
  // Detect subject based on keywords
  if (lowerContent.includes('funktion') || lowerContent.includes('gleichung') || lowerContent.includes('x²') || lowerTitle.includes('mathe')) {
    subject = 'Mathematik'
    objectives = [
      {
        id: 'obj_1',
        title: 'Grundbegriffe verstehen',
        description: `Die wichtigsten Begriffe und Definitionen zu "${title}" verstehen`,
        difficulty: 'beginner' as const,
        prerequisites: [],
        category: 'Grundlagen',
        estimatedTime: 15
      },
      {
        id: 'obj_2',
        title: 'Rechenmethoden anwenden',
        description: `Verschiedene Rechenwege und Methoden sicher anwenden können`,
        difficulty: 'intermediate' as const,
        prerequisites: ['obj_1'],
        category: 'Anwendung',
        estimatedTime: 25
      },
      {
        id: 'obj_3',
        title: 'Probleme lösen',
        description: `Komplexere Aufgaben systematisch lösen und Ergebnisse interpretieren`,
        difficulty: 'advanced' as const,
        prerequisites: ['obj_2'],
        category: 'Problemlösung',
        estimatedTime: 30
      }
    ]
  } else if (lowerContent.includes('geschichte') || lowerContent.includes('jahr') || lowerContent.includes('krieg') || lowerTitle.includes('geschichte')) {
    subject = 'Geschichte'
    objectives = [
      {
        id: 'obj_1',
        title: 'Historische Fakten kennen',
        description: `Wichtige Ereignisse, Daten und Personen zu "${title}" kennen`,
        difficulty: 'beginner' as const,
        prerequisites: [],
        category: 'Faktenwissen',
        estimatedTime: 20
      },
      {
        id: 'obj_2',
        title: 'Zusammenhänge verstehen',
        description: `Ursachen und Folgen historischer Ereignisse verstehen`,
        difficulty: 'intermediate' as const,
        prerequisites: ['obj_1'],
        category: 'Analyse',
        estimatedTime: 25
      },
      {
        id: 'obj_3',
        title: 'Historisch denken',
        description: `Geschichtliche Prozesse bewerten und eigene Schlüsse ziehen`,
        difficulty: 'advanced' as const,
        prerequisites: ['obj_2'],
        category: 'Bewertung',
        estimatedTime: 25
      }
    ]
  } else if (lowerContent.includes('sprache') || lowerContent.includes('grammatik') || lowerContent.includes('text') || lowerTitle.includes('deutsch')) {
    subject = 'Sprache'
    objectives = [
      {
        id: 'obj_1',
        title: 'Sprachstrukturen erkennen',
        description: `Die wichtigsten sprachlichen Strukturen und Regeln verstehen`,
        difficulty: 'beginner' as const,
        prerequisites: [],
        category: 'Grammatik',
        estimatedTime: 18
      },
      {
        id: 'obj_2',
        title: 'Texte analysieren',
        description: `Texte verstehen, interpretieren und analysieren können`,
        difficulty: 'intermediate' as const,
        prerequisites: ['obj_1'],
        category: 'Textarbeit',
        estimatedTime: 22
      },
      {
        id: 'obj_3',
        title: 'Sprache anwenden',
        description: `Eigene Texte verfassen und sprachlich korrekt ausdrücken`,
        difficulty: 'advanced' as const,
        prerequisites: ['obj_2'],
        category: 'Ausdruck',
        estimatedTime: 28
      }
    ]
  } else {
    // Generic objectives for any subject
    objectives = [
      {
        id: 'obj_1',
        title: 'Grundlagen verstehen',
        description: `Die wichtigsten Grundlagen zu "${title}" verstehen und erklären können`,
        difficulty: 'beginner' as const,
        prerequisites: [],
        category: 'Grundlagen',
        estimatedTime: 20
      },
      {
        id: 'obj_2',
        title: 'Wissen anwenden',
        description: `Das Gelernte in verschiedenen Situationen richtig anwenden`,
        difficulty: 'intermediate' as const,
        prerequisites: ['obj_1'],
        category: 'Anwendung',
        estimatedTime: 25
      },
      {
        id: 'obj_3',
        title: 'Verknüpfen und bewerten',
        description: `Verbindungen herstellen und selbstständig bewerten können`,
        difficulty: 'advanced' as const,
        prerequisites: ['obj_2'],
        category: 'Transfer',
        estimatedTime: 25
      }
    ]
  }
  
  console.log(`✅ Generated ${objectives.length} objectives for ${subject}`)
  return objectives
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