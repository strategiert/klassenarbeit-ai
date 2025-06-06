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
  } else if (lowerContent.includes('religion') || lowerContent.includes('christentum') || lowerContent.includes('islam') || lowerContent.includes('judentum') || lowerContent.includes('jesidentum') || lowerTitle.includes('religion')) {
    subject = 'Religion'
    objectives = [
      {
        id: 'obj_1',
        title: 'Christentum entdecken',
        description: 'Die Grundlagen des Christentums verstehen: Ursprünge, Kernbotschaften, Jesus Christus und wichtige Traditionen',
        difficulty: 'beginner' as const,
        prerequisites: [],
        category: 'Christentum',
        estimatedTime: 25
      },
      {
        id: 'obj_2',
        title: 'Judentum erforschen',
        description: 'Das Judentum kennenlernen: Geschichte, Glaube, heilige Schriften und wichtige Traditionen',
        difficulty: 'beginner' as const,
        prerequisites: [],
        category: 'Judentum',
        estimatedTime: 25
      },
      {
        id: 'obj_3',
        title: 'Islam verstehen',
        description: 'Den Islam entdecken: Die fünf Säulen, heilige Orte, Traditionen und Glaubensrichtungen',
        difficulty: 'beginner' as const,
        prerequisites: [],
        category: 'Islam',
        estimatedTime: 25
      },
      {
        id: 'obj_4',
        title: 'Jesidentum kennenlernen',
        description: 'Das Jesidentum erforschen: Ursprünge, Glaubensinhalte, heilige Stätten und Traditionen',
        difficulty: 'intermediate' as const,
        prerequisites: [],
        category: 'Jesidentum',
        estimatedTime: 20
      },
      {
        id: 'obj_5',
        title: 'Religionen vergleichen',
        description: 'Gemeinsamkeiten und Unterschiede zwischen den vier Religionen analysieren und reflektieren',
        difficulty: 'advanced' as const,
        prerequisites: ['obj_1', 'obj_2', 'obj_3', 'obj_4'],
        category: 'Vergleich',
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
  } else if (lowerContent.includes('biologie') || lowerContent.includes('zelle') || 
      lowerContent.includes('tier') || lowerContent.includes('pflanze') ||
      lowerContent.includes('evolution') || lowerContent.includes('dna') ||
      lowerTitle.includes('bio')) {
    subject = 'Biologie'
    objectives = [
      {
        id: 'obj_1',
        title: 'Biologische Grundlagen',
        description: `Die Grundlagen des Lebens und biologische Strukturen verstehen`,
        difficulty: 'beginner' as const,
        prerequisites: [],
        category: 'Grundlagen',
        estimatedTime: 20
      },
      {
        id: 'obj_2',
        title: 'Lebende Systeme erforschen',
        description: `Wie Organismen funktionieren und zusammenwirken`,
        difficulty: 'intermediate' as const,
        prerequisites: ['obj_1'],
        category: 'Systeme',
        estimatedTime: 25
      },
      {
        id: 'obj_3',
        title: 'Evolution und Anpassung',
        description: `Evolutionäre Prozesse und Anpassungsstrategien verstehen`,
        difficulty: 'advanced' as const,
        prerequisites: ['obj_2'],
        category: 'Evolution',
        estimatedTime: 30
      }
    ]
  } else if (lowerContent.includes('physik') || lowerContent.includes('kraft') || 
      lowerContent.includes('energie') || lowerContent.includes('atom') ||
      lowerContent.includes('welle') || lowerContent.includes('elektr') ||
      lowerTitle.includes('physik')) {
    subject = 'Physik'
    objectives = [
      {
        id: 'obj_1',
        title: 'Physikalische Größen',
        description: `Grundlegende physikalische Konzepte und Messgrößen verstehen`,
        difficulty: 'beginner' as const,
        prerequisites: [],
        category: 'Grundlagen',
        estimatedTime: 22
      },
      {
        id: 'obj_2',
        title: 'Kräfte und Bewegung',
        description: `Mechanik und Bewegungsgesetze anwenden können`,
        difficulty: 'intermediate' as const,
        prerequisites: ['obj_1'],
        category: 'Mechanik',
        estimatedTime: 28
      },
      {
        id: 'obj_3',
        title: 'Energie und Felder',
        description: `Energieformen und physikalische Felder verstehen`,
        difficulty: 'advanced' as const,
        prerequisites: ['obj_2'],
        category: 'Energie',
        estimatedTime: 32
      }
    ]
  } else if (lowerContent.includes('chemie') || lowerContent.includes('reaktion') || 
      lowerContent.includes('element') || lowerContent.includes('molekül') ||
      lowerContent.includes('säure') || lowerContent.includes('base') ||
      lowerTitle.includes('chemie')) {
    subject = 'Chemie'
    objectives = [
      {
        id: 'obj_1',
        title: 'Atome und Elemente',
        description: `Aufbau der Materie und Periodensystem verstehen`,
        difficulty: 'beginner' as const,
        prerequisites: [],
        category: 'Atombau',
        estimatedTime: 24
      },
      {
        id: 'obj_2',
        title: 'Chemische Bindungen',
        description: `Wie Atome sich verbinden und Moleküle entstehen`,
        difficulty: 'intermediate' as const,
        prerequisites: ['obj_1'],
        category: 'Bindungen',
        estimatedTime: 26
      },
      {
        id: 'obj_3',
        title: 'Reaktionen verstehen',
        description: `Chemische Reaktionen vorhersagen und berechnen`,
        difficulty: 'advanced' as const,
        prerequisites: ['obj_2'],
        category: 'Reaktionen',
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
    // Religion-specific content generation
    if (objective.category === 'Christentum') {
      return [
        {
          id: `${objective.id}_station_1`,
          type: 'explanation' as const,
          title: 'Das Christentum entdecken',
          content: {
            text: `Das Christentum ist eine der größten Weltreligionen. Es entstand vor etwa 2000 Jahren in Palästina und basiert auf den Lehren von Jesus Christus. Christen glauben, dass Jesus der Sohn Gottes ist und durch seinen Tod und seine Auferstehung die Menschen erlöst hat.`,
            examples: [
              'Die Bergpredigt als zentrale Lehre Jesu',
              'Das Vaterunser als wichtigstes Gebet',
              'Die Goldene Regel: "Behandle andere so, wie du behandelt werden möchtest"'
            ],
            visualAids: 'Karte der Ausbreitung des Christentums, Bilder von Kirchen verschiedener Konfessionen'
          },
          objective: objective.id,
          unlocked: true,
          completed: false,
          progress: 0
        },
        {
          id: `${objective.id}_station_2`,
          type: 'quiz' as const,
          title: 'Christentum-Quiz',
          content: {
            questions: [
              {
                question: 'Wer ist Jesus Christus für die Christen?',
                options: [
                  'Ein wichtiger Prophet',
                  'Der Sohn Gottes und Erlöser',
                  'Ein weiser Lehrer',
                  'Ein politischer Führer'
                ],
                correct: 1
              },
              {
                question: 'Welches Symbol ist das wichtigste im Christentum?',
                options: [
                  'Der Halbmond',
                  'Der Davidstern',
                  'Das Kreuz',
                  'Das Rad'
                ],
                correct: 2
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
          title: 'Christliche Werte reflektieren',
          content: {
            prompt: 'Denke über die christlichen Werte nach',
            questions: [
              'Welche christlichen Werte findest du besonders wichtig?',
              'Wie zeigen sich christliche Traditionen in unserer Gesellschaft?',
              'Was denkst du über die Botschaft der Nächstenliebe?'
            ]
          },
          objective: objective.id,
          unlocked: false,
          completed: false,
          progress: 0
        }
      ]
    }

    if (objective.category === 'Judentum') {
      return [
        {
          id: `${objective.id}_station_1`,
          type: 'explanation' as const,
          title: 'Das Judentum erkunden',
          content: {
            text: `Das Judentum ist eine der ältesten monotheistischen Religionen der Welt. Es entstand vor etwa 4000 Jahren mit Abraham. Juden glauben an einen einzigen Gott und folgen den Lehren der Tora. Das Judentum hat eine reiche Geschichte und Tradition.`,
            examples: [
              'Die Tora als heilige Schrift',
              'Der Sabbat als wöchentlicher Ruhetag',
              'Bar/Bat Mitzwa als Übergangsritus'
            ],
            visualAids: 'Bilder der Synagoge, Thorarolle, Davidstern'
          },
          objective: objective.id,
          unlocked: true,
          completed: false,
          progress: 0
        },
        {
          id: `${objective.id}_station_2`,
          type: 'quiz' as const,
          title: 'Judentum-Quiz',
          content: {
            questions: [
              {
                question: 'Wie heißt die heilige Schrift des Judentums?',
                options: [
                  'Die Bibel',
                  'Der Koran',
                  'Die Tora',
                  'Die Veden'
                ],
                correct: 2
              },
              {
                question: 'Welches Symbol repräsentiert das Judentum?',
                options: [
                  'Das Kreuz',
                  'Der Davidstern',
                  'Der Halbmond',
                  'Das Om-Zeichen'
                ],
                correct: 1
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

    if (objective.category === 'Islam') {
      return [
        {
          id: `${objective.id}_station_1`,
          type: 'explanation' as const,
          title: 'Den Islam verstehen',
          content: {
            text: `Der Islam ist eine monotheistische Religion, die im 7. Jahrhundert durch den Propheten Mohammed in Arabien entstand. Muslime glauben an Allah als den einen Gott und folgen den fünf Säulen des Islam. Der Koran ist ihre heilige Schrift.`,
            examples: [
              'Die fünf täglichen Gebete (Salah)',
              'Die Pilgerfahrt nach Mekka (Hadsch)',
              'Das Fasten im Ramadan (Sawm)'
            ],
            visualAids: 'Bilder der Kaaba in Mekka, Moschee-Architektur, Kalligrafie'
          },
          objective: objective.id,
          unlocked: true,
          completed: false,
          progress: 0
        },
        {
          id: `${objective.id}_station_2`,
          type: 'quiz' as const,
          title: 'Islam-Quiz',
          content: {
            questions: [
              {
                question: 'Wie viele Säulen hat der Islam?',
                options: [
                  'Drei',
                  'Vier',
                  'Fünf',
                  'Sechs'
                ],
                correct: 2
              },
              {
                question: 'Wie heißt die heilige Schrift des Islam?',
                options: [
                  'Die Tora',
                  'Die Bibel',
                  'Der Koran',
                  'Die Veden'
                ],
                correct: 2
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

    if (objective.category === 'Jesidentum') {
      return [
        {
          id: `${objective.id}_station_1`,
          type: 'explanation' as const,
          title: 'Das Jesidentum kennenlernen',
          content: {
            text: `Das Jesidentum ist eine alte monotheistische Religion der Kurden. Jesiden glauben an einen Gott und verehren den Engel Melek Taus (Pfauenengel). Ihre Religion ist über 4000 Jahre alt und hat sowohl alte mesopotamische als auch zoroastrische Einflüsse.`,
            examples: [
              'Lalish als heiligster Ort der Jesiden',
              'Das Fest Çarşema Sor (Roter Mittwoch)',
              'Die drei Kasten: Scheichs, Pirs und Murids'
            ],
            visualAids: 'Bilder des Lalish-Tempels, Pfauenengel-Symbol'
          },
          objective: objective.id,
          unlocked: true,
          completed: false,
          progress: 0
        },
        {
          id: `${objective.id}_station_2`,
          type: 'quiz' as const,
          title: 'Jesidentum-Quiz',
          content: {
            questions: [
              {
                question: 'Welcher Engel ist im Jesidentum besonders wichtig?',
                options: [
                  'Gabriel',
                  'Michael',
                  'Melek Taus',
                  'Raphael'
                ],
                correct: 2
              },
              {
                question: 'Wie heißt der heiligste Ort der Jesiden?',
                options: [
                  'Mekka',
                  'Jerusalem',
                  'Lalish',
                  'Varanasi'
                ],
                correct: 2
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

    if (objective.category === 'Vergleich') {
      return [
        {
          id: `${objective.id}_station_1`,
          type: 'explanation' as const,
          title: 'Religionen im Vergleich',
          content: {
            text: `Alle vier Religionen haben Gemeinsamkeiten und Unterschiede. Sie sind alle monotheistisch (glauben an einen Gott), haben heilige Schriften, Gebetshäuser und wichtige Feiertage. Gleichzeitig unterscheiden sie sich in ihren Traditionen, Ritualen und historischen Entwicklungen.`,
            examples: [
              'Gemeinsam: Glaube an einen Gott, Gebet, Nächstenliebe',
              'Unterschiede: Verschiedene heilige Schriften und Propheten',
              'Ähnliche Werte: Barmherzigkeit, Gerechtigkeit, Gemeinschaft'
            ],
            visualAids: 'Vergleichstabelle der vier Religionen'
          },
          objective: objective.id,
          unlocked: true,
          completed: false,
          progress: 0
        },
        {
          id: `${objective.id}_station_2`,
          type: 'simulation' as const,
          title: 'Interreligiöser Dialog',
          content: {
            simulation: 'Führe einen respektvollen Dialog zwischen Vertretern der vier Religionen',
            scenarios: [
              'Gespräch über gemeinsame Werte',
              'Diskussion über Unterschiede',
              'Friedliches Zusammenleben'
            ]
          },
          objective: objective.id,
          unlocked: false,
          completed: false,
          progress: 0
        },
        {
          id: `${objective.id}_station_3`,
          type: 'challenge' as const,
          title: 'Toleranz-Projekt',
          content: {
            challenge: 'Erstelle ein Projekt, das zeigt, wie Menschen verschiedener Religionen respektvoll zusammenleben können. Das kann eine Präsentation, ein Plakat oder ein Video sein.'
          },
          objective: objective.id,
          unlocked: false,
          completed: false,
          progress: 0
        }
      ]
    }

    // Generic fallback for other subjects
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