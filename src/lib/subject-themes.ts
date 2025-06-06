// Universal Subject Theme Engine
// Generiert automatisch passende Lernwelt-Designs für jedes Thema

export interface SubjectTheme {
  name: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundGradient: string
  headerIcon: string
  stationIcons: {
    explanation: string
    quiz: string
    simulation: string
    reflection: string
    challenge: string
  }
  visualElements: {
    progressIcon: string
    completedIcon: string
    lockedIcon: string
    difficultyIcons: {
      beginner: string
      intermediate: string
      advanced: string
    }
  }
  motivationalMessages: string[]
  subjectSpecificTerms: {
    learningWorld: string
    explorer: string
    journey: string
    discovery: string
  }
}

// Dynamische Themen-Erkennung basierend auf Inhalten
export function detectSubjectFromContent(content: string, title: string): string {
  const lowerContent = content.toLowerCase()
  const lowerTitle = title.toLowerCase()
  
  // Religion
  if (lowerContent.includes('religion') || lowerContent.includes('christentum') || 
      lowerContent.includes('islam') || lowerContent.includes('judentum') || 
      lowerContent.includes('jesidentum') || lowerContent.includes('glaube') ||
      lowerTitle.includes('religion')) {
    return 'religion'
  }
  
  // Mathematik
  if (lowerContent.includes('funktion') || lowerContent.includes('gleichung') || 
      lowerContent.includes('x²') || lowerContent.includes('integral') ||
      lowerContent.includes('derivat') || lowerContent.includes('geometrie') ||
      lowerTitle.includes('mathe') || lowerTitle.includes('mathematik')) {
    return 'mathematics'
  }
  
  // Geschichte
  if (lowerContent.includes('geschichte') || lowerContent.includes('jahr') || 
      lowerContent.includes('krieg') || lowerContent.includes('kaiser') ||
      lowerContent.includes('mittelalter') || lowerContent.includes('revolution') ||
      lowerTitle.includes('geschichte')) {
    return 'history'
  }
  
  // Deutsch/Sprache
  if (lowerContent.includes('sprache') || lowerContent.includes('grammatik') || 
      lowerContent.includes('text') || lowerContent.includes('gedicht') ||
      lowerContent.includes('literatur') || lowerContent.includes('autor') ||
      lowerTitle.includes('deutsch')) {
    return 'language'
  }
  
  // Biologie
  if (lowerContent.includes('biologie') || lowerContent.includes('zelle') || 
      lowerContent.includes('tier') || lowerContent.includes('pflanze') ||
      lowerContent.includes('evolution') || lowerContent.includes('dna') ||
      lowerTitle.includes('bio')) {
    return 'biology'
  }
  
  // Physik
  if (lowerContent.includes('physik') || lowerContent.includes('kraft') || 
      lowerContent.includes('energie') || lowerContent.includes('atom') ||
      lowerContent.includes('welle') || lowerContent.includes('elektr') ||
      lowerTitle.includes('physik')) {
    return 'physics'
  }
  
  // Chemie
  if (lowerContent.includes('chemie') || lowerContent.includes('reaktion') || 
      lowerContent.includes('element') || lowerContent.includes('molekül') ||
      lowerContent.includes('säure') || lowerContent.includes('base') ||
      lowerTitle.includes('chemie')) {
    return 'chemistry'
  }
  
  // Geographie
  if (lowerContent.includes('geographie') || lowerContent.includes('erdkunde') || 
      lowerContent.includes('land') || lowerContent.includes('kontinent') ||
      lowerContent.includes('klima') || lowerContent.includes('stadt') ||
      lowerTitle.includes('geo') || lowerTitle.includes('erdkunde')) {
    return 'geography'
  }
  
  // Englisch
  if (lowerContent.includes('english') || lowerContent.includes('grammar') || 
      lowerContent.includes('vocabulary') || lowerTitle.includes('englisch') ||
      lowerTitle.includes('english')) {
    return 'english'
  }
  
  // Kunst
  if (lowerContent.includes('kunst') || lowerContent.includes('malerei') || 
      lowerContent.includes('skulptur') || lowerContent.includes('farbe') ||
      lowerContent.includes('künstler') || lowerTitle.includes('kunst')) {
    return 'art'
  }
  
  // Musik
  if (lowerContent.includes('musik') || lowerContent.includes('instrument') || 
      lowerContent.includes('note') || lowerContent.includes('rhythmus') ||
      lowerContent.includes('komponist') || lowerTitle.includes('musik')) {
    return 'music'
  }
  
  // Sport
  if (lowerContent.includes('sport') || lowerContent.includes('training') || 
      lowerContent.includes('fitness') || lowerContent.includes('spiel') ||
      lowerTitle.includes('sport')) {
    return 'sports'
  }
  
  // Informatik
  if (lowerContent.includes('informatik') || lowerContent.includes('computer') || 
      lowerContent.includes('programm') || lowerContent.includes('algorithmus') ||
      lowerContent.includes('daten') || lowerTitle.includes('informatik')) {
    return 'computer_science'
  }
  
  return 'general'
}

// Vollständige Themendefinitionen
export const subjectThemes: Record<string, SubjectTheme> = {
  religion: {
    name: 'Glaubens-Entdecker',
    primaryColor: '#8B5CF6',
    secondaryColor: '#A78BFA', 
    accentColor: '#F3E8FF',
    backgroundGradient: 'from-purple-50 via-blue-50 to-indigo-100',
    headerIcon: '🕊️',
    stationIcons: {
      explanation: '📿',
      quiz: '⛪',
      simulation: '🤝',
      reflection: '🙏',
      challenge: '🌍'
    },
    visualElements: {
      progressIcon: '✨',
      completedIcon: '🌟',
      lockedIcon: '🔮',
      difficultyIcons: {
        beginner: '🌱',
        intermediate: '🌸',
        advanced: '🌳'
      }
    },
    motivationalMessages: [
      'Entdecke die Vielfalt der Religionen! 🕊️',
      'Verstehe verschiedene Glaubensrichtungen! 🌍',
      'Finde Gemeinsamkeiten und respektiere Unterschiede! 🤝'
    ],
    subjectSpecificTerms: {
      learningWorld: 'Glaubens-Entdecker Lernwelt',
      explorer: 'Glaubens-Entdecker',
      journey: 'Spirituelle Reise',
      discovery: 'Glaubens-Erkundung'
    }
  },
  
  mathematics: {
    name: 'Mathe-Entdecker',
    primaryColor: '#3B82F6',
    secondaryColor: '#60A5FA',
    accentColor: '#EFF6FF',
    backgroundGradient: 'from-blue-50 via-indigo-50 to-cyan-100',
    headerIcon: '🧮',
    stationIcons: {
      explanation: '📐',
      quiz: '🔢',
      simulation: '📊',
      reflection: '🤔',
      challenge: '🎯'
    },
    visualElements: {
      progressIcon: '⚡',
      completedIcon: '✅',
      lockedIcon: '🔒',
      difficultyIcons: {
        beginner: '🟢',
        intermediate: '🟡',
        advanced: '🔴'
      }
    },
    motivationalMessages: [
      'Entdecke die Schönheit der Mathematik! 🧮',
      'Löse Gleichungen und finde Muster! 📐',
      'Mathematik ist überall um uns herum! 🌟'
    ],
    subjectSpecificTerms: {
      learningWorld: 'Mathe-Entdecker Lernwelt',
      explorer: 'Zahlen-Forscher',
      journey: 'Mathematische Expedition',
      discovery: 'Formel-Entdeckung'
    }
  },
  
  history: {
    name: 'Zeit-Entdecker',
    primaryColor: '#92400E',
    secondaryColor: '#D97706',
    accentColor: '#FEF3C7',
    backgroundGradient: 'from-amber-50 via-orange-50 to-yellow-100',
    headerIcon: '🏛️',
    stationIcons: {
      explanation: '📜',
      quiz: '👑',
      simulation: '⚔️',
      reflection: '🏺',
      challenge: '🗺️'
    },
    visualElements: {
      progressIcon: '⏳',
      completedIcon: '🏆',
      lockedIcon: '🔐',
      difficultyIcons: {
        beginner: '📚',
        intermediate: '🗿',
        advanced: '🏰'
      }
    },
    motivationalMessages: [
      'Reise durch die Geschichte! 🏛️',
      'Entdecke vergangene Epochen! ⏳',
      'Lerne aus der Vergangenheit! 📜'
    ],
    subjectSpecificTerms: {
      learningWorld: 'Zeit-Entdecker Lernwelt',
      explorer: 'Geschichts-Forscher',
      journey: 'Zeitreise',
      discovery: 'Historische Entdeckung'
    }
  },
  
  language: {
    name: 'Sprach-Entdecker',
    primaryColor: '#DC2626',
    secondaryColor: '#F87171',
    accentColor: '#FEE2E2',
    backgroundGradient: 'from-red-50 via-pink-50 to-rose-100',
    headerIcon: '📖',
    stationIcons: {
      explanation: '✍️',
      quiz: '💬',
      simulation: '🎭',
      reflection: '💭',
      challenge: '📝'
    },
    visualElements: {
      progressIcon: '📈',
      completedIcon: '🎉',
      lockedIcon: '📚',
      difficultyIcons: {
        beginner: 'A',
        intermediate: 'B',
        advanced: 'C'
      }
    },
    motivationalMessages: [
      'Entdecke die Kraft der Sprache! 📖',
      'Verbessere deine Ausdrucksfähigkeit! ✍️',
      'Worte können Welten erschaffen! 🌟'
    ],
    subjectSpecificTerms: {
      learningWorld: 'Sprach-Entdecker Lernwelt',
      explorer: 'Wort-Forscher',
      journey: 'Sprachreise',
      discovery: 'Sprach-Erkundung'
    }
  },
  
  biology: {
    name: 'Leben-Entdecker',
    primaryColor: '#059669',
    secondaryColor: '#34D399',
    accentColor: '#D1FAE5',
    backgroundGradient: 'from-green-50 via-emerald-50 to-teal-100',
    headerIcon: '🌱',
    stationIcons: {
      explanation: '🔬',
      quiz: '🧬',
      simulation: '🦋',
      reflection: '🌿',
      challenge: '🧪'
    },
    visualElements: {
      progressIcon: '🌱',
      completedIcon: '🌟',
      lockedIcon: '🌰',
      difficultyIcons: {
        beginner: '🌱',
        intermediate: '🌿',
        advanced: '🌳'
      }
    },
    motivationalMessages: [
      'Entdecke die Wunder des Lebens! 🌱',
      'Erforsche die Natur! 🔬',
      'Das Leben ist voller Geheimnisse! 🧬'
    ],
    subjectSpecificTerms: {
      learningWorld: 'Leben-Entdecker Lernwelt',
      explorer: 'Bio-Forscher',
      journey: 'Naturexpedition',
      discovery: 'Lebens-Erkundung'
    }
  },
  
  physics: {
    name: 'Kraft-Entdecker',
    primaryColor: '#7C3AED',
    secondaryColor: '#A78BFA',
    accentColor: '#F3E8FF',
    backgroundGradient: 'from-violet-50 via-purple-50 to-indigo-100',
    headerIcon: '⚡',
    stationIcons: {
      explanation: '🧲',
      quiz: '⚛️',
      simulation: '🔬',
      reflection: '💡',
      challenge: '🚀'
    },
    visualElements: {
      progressIcon: '⚡',
      completedIcon: '💫',
      lockedIcon: '🔋',
      difficultyIcons: {
        beginner: '💡',
        intermediate: '⚡',
        advanced: '💥'
      }
    },
    motivationalMessages: [
      'Entdecke die Gesetze des Universums! ⚡',
      'Verstehe Kräfte und Energie! 🧲',
      'Physik erklärt unsere Welt! 🚀'
    ],
    subjectSpecificTerms: {
      learningWorld: 'Kraft-Entdecker Lernwelt',
      explorer: 'Physik-Forscher',
      journey: 'Wissenschaftsreise',
      discovery: 'Physik-Entdeckung'
    }
  },
  
  chemistry: {
    name: 'Element-Entdecker',
    primaryColor: '#DC2626',
    secondaryColor: '#F87171',
    accentColor: '#FEE2E2',
    backgroundGradient: 'from-red-50 via-orange-50 to-yellow-100',
    headerIcon: '🧪',
    stationIcons: {
      explanation: '⚗️',
      quiz: '🔬',
      simulation: '💥',
      reflection: '🤓',
      challenge: '🧬'
    },
    visualElements: {
      progressIcon: '🔥',
      completedIcon: '✨',
      lockedIcon: '🥽',
      difficultyIcons: {
        beginner: '🧪',
        intermediate: '⚗️',
        advanced: '💥'
      }
    },
    motivationalMessages: [
      'Entdecke die Welt der Elemente! 🧪',
      'Verstehe chemische Reaktionen! ⚗️',
      'Chemie ist überall! 🔬'
    ],
    subjectSpecificTerms: {
      learningWorld: 'Element-Entdecker Lernwelt',
      explorer: 'Chemie-Forscher',
      journey: 'Molekülreise',
      discovery: 'Element-Erkundung'
    }
  },
  
  geography: {
    name: 'Welt-Entdecker',
    primaryColor: '#059669',
    secondaryColor: '#10B981',
    accentColor: '#D1FAE5',
    backgroundGradient: 'from-green-50 via-blue-50 to-cyan-100',
    headerIcon: '🌍',
    stationIcons: {
      explanation: '🗺️',
      quiz: '🌎',
      simulation: '🏔️',
      reflection: '🌊',
      challenge: '🧭'
    },
    visualElements: {
      progressIcon: '🗺️',
      completedIcon: '🌟',
      lockedIcon: '🗝️',
      difficultyIcons: {
        beginner: '🌱',
        intermediate: '🏔️',
        advanced: '🌍'
      }
    },
    motivationalMessages: [
      'Entdecke unseren Planeten! 🌍',
      'Erkunde Länder und Kulturen! 🗺️',
      'Die Erde steckt voller Wunder! 🌊'
    ],
    subjectSpecificTerms: {
      learningWorld: 'Welt-Entdecker Lernwelt',
      explorer: 'Geo-Forscher',
      journey: 'Weltreise',
      discovery: 'Geo-Erkundung'
    }
  },
  
  general: {
    name: 'Wissens-Entdecker',
    primaryColor: '#6366F1',
    secondaryColor: '#818CF8',
    accentColor: '#E0E7FF',
    backgroundGradient: 'from-indigo-50 via-blue-50 to-purple-100',
    headerIcon: '🎓',
    stationIcons: {
      explanation: '📚',
      quiz: '🧠',
      simulation: '🔬',
      reflection: '💭',
      challenge: '🎯'
    },
    visualElements: {
      progressIcon: '📈',
      completedIcon: '🎉',
      lockedIcon: '🔒',
      difficultyIcons: {
        beginner: '🟢',
        intermediate: '🟡',
        advanced: '🔴'
      }
    },
    motivationalMessages: [
      'Entdecke neues Wissen! 🎓',
      'Lerne und wachse! 📚',
      'Jede Entdeckung macht dich klüger! 🧠'
    ],
    subjectSpecificTerms: {
      learningWorld: 'Wissens-Entdecker Lernwelt',
      explorer: 'Lern-Forscher',
      journey: 'Wissensreise',
      discovery: 'Erkenntnis-Entdeckung'
    }
  }
}

// Hilfsfunktion um Theme basierend auf Inhalt zu erhalten
export function getSubjectTheme(content: string = '', title: string = ''): SubjectTheme {
  try {
    const detectedSubject = detectSubjectFromContent(content, title)
    return subjectThemes[detectedSubject] || subjectThemes.general
  } catch (error) {
    console.error('Error getting subject theme:', error)
    return subjectThemes.general
  }
}

// Generiert CSS-Variablen für ein Theme
export function generateThemeCSS(theme: SubjectTheme): string {
  return `
    :root {
      --theme-primary: ${theme.primaryColor};
      --theme-secondary: ${theme.secondaryColor};
      --theme-accent: ${theme.accentColor};
      --theme-gradient: linear-gradient(135deg, ${theme.backgroundGradient.replace('from-', '').replace(' via-', ', ').replace(' to-', ', ')});
    }
  `
}

// Generiert Theme-spezifische Tailwind-Klassen
export function getThemeClasses(theme: SubjectTheme) {
  return {
    background: `bg-gradient-to-br ${theme.backgroundGradient}`,
    primaryButton: `bg-[${theme.primaryColor}] hover:bg-[${theme.secondaryColor}] text-white`,
    accent: `bg-[${theme.accentColor}]`,
    progressBar: `bg-[${theme.primaryColor}]`,
    completedBadge: `bg-[${theme.secondaryColor}] text-white`
  }
}