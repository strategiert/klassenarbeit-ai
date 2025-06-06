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

// Extract learning objectives from DeepSeek research data
export async function extractLearningObjectives(researchData: any, title: string): Promise<LearningObjective[]> {
  console.log('🎯 Extracting learning objectives from DeepSeek research for:', title)
  
  // STRICT: No fallback content - research data is required
  if (!researchData) {
    console.error('❌ No research data available - Discovery content requires DeepSeek research first!')
    throw new Error('DeepSeek research data is required for discovery content generation')
  }

  // Extract subject and topics from DeepSeek research data
  const keyFacts = researchData.key_facts || []
  const detailedExplanations = researchData.detailed_explanations || []
  
  // Create objectives based on DeepSeek's content analysis
  const objectives: LearningObjective[] = []
  
  // Create beginner objective from summary
  if (researchData.summary) {
    objectives.push({
      id: 'obj_1',
      title: 'Grundlagen verstehen',
      description: researchData.summary,
      difficulty: 'beginner' as const,
      prerequisites: [],
      category: 'Grundlagen',
      estimatedTime: 20
    })
  }
  
  // Create intermediate objectives from detailed explanations
  if (detailedExplanations.length > 0) {
    detailedExplanations.slice(0, 2).forEach((explanation, index) => {
      objectives.push({
        id: `obj_${objectives.length + 1}`,
        title: `Vertiefung ${index + 1}`,
        description: explanation,
        difficulty: 'intermediate' as const,
        prerequisites: objectives.length > 0 ? [objectives[objectives.length - 1].id] : [],
        category: 'Vertiefung',
        estimatedTime: 25
      })
    })
  }
  
  // Create advanced objective for application
  if (researchData.additional_topics && researchData.additional_topics.length > 0) {
    objectives.push({
      id: `obj_${objectives.length + 1}`,
      title: 'Anwendung und Transfer',
      description: `Wissen anwenden und Verbindungen zu verwandten Themen herstellen: ${researchData.additional_topics.join(', ')}`,
      difficulty: 'advanced' as const,
      prerequisites: objectives.length > 0 ? [objectives[objectives.length - 1].id] : [],
      category: 'Transfer',
      estimatedTime: 30
    })
  }
  
  console.log(`✅ Generated ${objectives.length} objectives from DeepSeek research data`)
  return objectives
}

// Generiert adaptive Lernstationen basierend auf Lernzielen
export async function generateLearningStations(
  objective: LearningObjective, 
  learnerProfile: LearnerProfile,
  classContent: string,
  researchData?: any
): Promise<LearningStation[]> {
  
  console.log('🛤️ Generating stations for objective:', objective.title)
  
  // STRICT: No fallback content - research data is required
  if (!researchData) {
    console.error('❌ No research data available - Station generation requires DeepSeek research first!')
    throw new Error('DeepSeek research data is required for station generation')
  }
  
  try {
    // Research-first station generation based on DeepSeek data
    const stations: LearningStation[] = []
    
    // Station 1: Explanation based on research data
    stations.push({
      id: `${objective.id}_station_1`,
      type: 'explanation' as const,
      title: `${objective.title} verstehen`,
      content: {
        text: researchData.detailed_explanations?.[0] || researchData.summary || objective.description,
        examples: researchData.key_facts?.slice(0, 3) || [],
        visualAids: `Basierend auf DeepSeek Analyse für ${objective.title}`
      },
      objective: objective.id,
      unlocked: true,
      completed: false,
      progress: 0
    })
    
    // Station 2: Quiz from research questions
    if (researchData.quiz_questions && researchData.quiz_questions.length > 0) {
      stations.push({
        id: `${objective.id}_station_2`,
        type: 'quiz' as const,
        title: 'Wissen prüfen',
        content: {
          questions: researchData.quiz_questions.slice(0, 10) // Limit to 10 questions per station
        },
        objective: objective.id,
        unlocked: false,
        completed: false,
        progress: 0
      })
    }
    
    // Station 3: Interactive element if available
    if (researchData.interactive_elements && researchData.interactive_elements.length > 0) {
      const interactiveElement = researchData.interactive_elements[0]
      stations.push({
        id: `${objective.id}_station_3`,
        type: interactiveElement.type as any || 'simulation',
        title: interactiveElement.title || 'Interaktive Übung',
        content: {
          ...interactiveElement.content,
          description: interactiveElement.description
        },
        objective: objective.id,
        unlocked: false,
        completed: false,
        progress: 0
      })
    }
    
    // Station 4: Reflection based on additional topics
    if (researchData.additional_topics && researchData.additional_topics.length > 0) {
      stations.push({
        id: `${objective.id}_station_4`,
        type: 'reflection' as const,
        title: 'Verknüpfen und Reflektieren',
        content: {
          prompt: `Denke über ${objective.title} und verwandte Themen nach`,
          questions: [
            'Was hast du Neues gelernt?',
            'Wie verbindest du das mit bereits Bekanntem?',
            `Wie könnte sich das auf ${researchData.additional_topics.join(', ')} auswirken?`
          ]
        },
        objective: objective.id,
        unlocked: false,
        completed: false,
        progress: 0
      })
    }
    
    return stations
    
  } catch (error) {
    console.error('❌ Error generating stations:', error)
    throw new Error(`Failed to generate learning stations: ${error.message}`)
  }
}

// Erstellt die komplette Discovery Path
export async function createDiscoveryPath(
  content: string, 
  title: string, 
  learnerProfile: LearnerProfile,
  researchData?: any
): Promise<DiscoveryPath> {
  
  console.log('🗺️ Creating discovery path for:', title)
  
  // 1. Extrahiere Lernziele aus DeepSeek research data
  const objectives = await extractLearningObjectives(researchData, title)
  console.log('📋 Extracted objectives:', objectives.length)
  
  // 2. Generiere Lernstationen für jedes Ziel
  const allStations: LearningStation[] = []
  for (const objective of objectives) {
    const stations = await generateLearningStations(objective, learnerProfile, content, researchData)
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