'use client'

import { useState, useEffect } from 'react'
import { DiscoveryPath, LearningObjective, LearningStation, LearnerProfile } from '@/lib/discovery-engine'
import { getSubjectTheme, SubjectTheme } from '@/lib/subject-themes'

interface DiscoveryExplorerProps {
  discoveryPath: DiscoveryPath
  pathId: string
  content?: string
}

export default function DiscoveryExplorer({ discoveryPath, pathId, content }: DiscoveryExplorerProps) {
  // Safety check - if discoveryPath is invalid, show error
  if (!discoveryPath || typeof discoveryPath !== 'object') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lernreise nicht verfügbar</h2>
          <p className="text-gray-600">Die Lernreise-Daten konnten nicht geladen werden.</p>
        </div>
      </div>
    )
  }

  // Get theme based on content and title (with BULLETPROOF fallback)
  let theme
  try {
    theme = getSubjectTheme(content || '', discoveryPath?.title || '')
    if (!theme || typeof theme !== 'object') {
      throw new Error('Invalid theme')
    }
  } catch (error) {
    console.error('Theme error, using fallback:', error)
    theme = {
      subjectSpecificTerms: { learningWorld: 'Lernlandkarte' },
      visualElements: { completedIcon: '✅' },
      primaryColor: '#3B82F6',
      secondaryColor: '#60A5FA',
      stationIcons: {
        explanation: '📚',
        quiz: '🧠', 
        simulation: '🔬',
        reflection: '💭',
        challenge: '🎯'
      }
    }
  }
  
  const [currentObjective, setCurrentObjective] = useState<string | null>(null)
  const [currentStation, setCurrentStation] = useState<string | null>(null)
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile>({
    id: 'explorer',
    strengths: [],
    weaknesses: [],
    learningStyle: 'mixed',
    completedObjectives: [],
    adaptiveLevel: 1
  })
  const [stationProgress, setStationProgress] = useState<Record<string, number>>({})
  const [completedStations, setCompletedStations] = useState<Set<string>>(new Set())
  const [selectedAvatar, setSelectedAvatar] = useState('🎓')
  const [totalXP, setTotalXP] = useState(0)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [achievements, setAchievements] = useState<string[]>([])
  const [showAvatarSelection, setShowAvatarSelection] = useState(false)
  const [showAchievement, setShowAchievement] = useState<string | null>(null)

  // Avatar options
  const avatarOptions = ['🎓', '🚀', '🦄', '🌟', '🔥', '⚡', '🎯', '🏆', '💎', '🌈']
  
  // Calculate level from XP (100 XP per level)
  useEffect(() => {
    const newLevel = Math.floor(totalXP / 100) + 1
    if (newLevel > currentLevel) {
      setCurrentLevel(newLevel)
      setAchievements(prev => [...prev, `Level ${newLevel} erreicht!`])
    }
  }, [totalXP, currentLevel])

  // Initialize with first objective
  useEffect(() => {
    if (discoveryPath.objectives?.length > 0 && !currentObjective) {
      setCurrentObjective(discoveryPath.objectives[0].id)
    }
  }, [discoveryPath.objectives, currentObjective])

  const getStationsForObjective = (objectiveId: string): LearningStation[] => {
    return discoveryPath.stations?.filter(station => station.objective === objectiveId) || []
  }

  const isObjectiveUnlocked = (objective: LearningObjective): boolean => {
    // Check if all prerequisites are completed
    return objective.prerequisites.every(prereq => 
      learnerProfile.completedObjectives.includes(prereq)
    ) || objective.prerequisites.length === 0
  }

  const isStationUnlocked = (station: LearningStation): boolean => {
    const objectiveStations = getStationsForObjective(station.objective)
    const stationIndex = objectiveStations.findIndex(s => s.id === station.id)
    
    if (stationIndex === 0) return true // First station is always unlocked
    
    // Check if previous station is completed
    const previousStation = objectiveStations[stationIndex - 1]
    return previousStation ? completedStations.has(previousStation.id) : false
  }

  const completeStation = (stationId: string) => {
    setCompletedStations(prev => new Set([...prev, stationId]))
    setStationProgress(prev => ({ ...prev, [stationId]: 100 }))
    
    // Award XP based on station type
    const station = discoveryPath.stations?.find(s => s.id === stationId)
    const xpReward = station?.type === 'challenge' ? 50 : station?.type === 'quiz' ? 30 : 20
    setTotalXP(prev => prev + xpReward)
    
    // Check for achievements with notifications
    const newCompletedCount = completedStations.size + 1
    let newAchievement = null
    if (newCompletedCount === 1) {
      newAchievement = '🎯 Erste Station abgeschlossen!'
    } else if (newCompletedCount === 5) {
      newAchievement = '🌟 5 Stationen gemeistert!'
    } else if (newCompletedCount === 10) {
      newAchievement = '🏆 Lern-Champion!'
    }
    
    if (newAchievement) {
      setAchievements(prev => [...prev, newAchievement!])
      setShowAchievement(newAchievement)
      setTimeout(() => setShowAchievement(null), 3000)
    }
    
    if (station) {
      const objectiveStations = getStationsForObjective(station.objective)
      const completedObjectiveStations = objectiveStations.filter(s => 
        completedStations.has(s.id) || s.id === stationId
      )
      
      if (completedObjectiveStations.length === objectiveStations.length) {
        // Objective completed!
        setLearnerProfile(prev => ({
          ...prev,
          completedObjectives: [...prev.completedObjectives, station.objective]
        }))
        setTotalXP(prev => prev + 100) // Bonus XP for completing objective
        setAchievements(prev => [...prev, `🎉 "${discoveryPath.objectives?.find(obj => obj.id === station.objective)?.title}" abgeschlossen!`])
      }
    }
  }

  const getObjectiveProgress = (objectiveId: string): number => {
    const stations = getStationsForObjective(objectiveId)
    if (stations.length === 0) return 0
    
    const completed = stations.filter(s => completedStations.has(s.id)).length
    return Math.round((completed / stations.length) * 100)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500'
      case 'intermediate': return 'bg-yellow-500'
      case 'advanced': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStationIcon = (type: string) => {
    switch (type) {
      case 'explanation': return theme?.stationIcons?.explanation || '📚'
      case 'quiz': return theme?.stationIcons?.quiz || '🧠'
      case 'simulation': return theme?.stationIcons?.simulation || '🔬'
      case 'reflection': return theme?.stationIcons?.reflection || '💭'
      case 'challenge': return theme?.stationIcons?.challenge || '🎯'
      default: return '📝'
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Player Profile Header */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <div 
              className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl cursor-pointer hover:bg-white/30 transition-colors"
              onClick={() => setShowAvatarSelection(!showAvatarSelection)}
            >
              {selectedAvatar}
            </div>
            <div>
              <h3 className="font-bold text-lg">Lern-Explorer</h3>
              <p className="text-purple-100 text-sm">Level {currentLevel}</p>
            </div>
          </div>

          {/* XP and Level Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>XP</span>
              <span>{totalXP}/{currentLevel * 100}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((totalXP % 100) / 100) * 100}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{completedStations.size}</div>
              <div className="text-xs text-purple-100">Stationen</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{learnerProfile.completedObjectives.length}</div>
              <div className="text-xs text-purple-100">Ziele</div>
            </div>
          </div>

          {/* Achievements */}
          <div className="flex flex-wrap gap-1">
            {achievements.slice(-3).map((achievement, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-medium"
                title={achievement}
              >
                🏆
              </span>
            ))}
          </div>
        </div>

        {/* Avatar Selection */}
        {showAvatarSelection && (
          <div className="mt-4 p-4 bg-white/10 rounded-xl">
            <p className="text-sm mb-3">Wähle deinen Avatar:</p>
            <div className="flex space-x-2">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => {
                    setSelectedAvatar(avatar)
                    setShowAvatarSelection(false)
                  }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors ${
                    selectedAvatar === avatar 
                      ? 'bg-white text-purple-600' 
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Achievement Notification */}
      {showAchievement && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-xl shadow-2xl transform animate-bounce">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="font-bold">Erfolg freigeschaltet!</p>
              <p className="text-sm">{showAchievement}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Learning Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Learning Map - Left Sidebar */}
        <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            🗺️ {theme?.subjectSpecificTerms?.learningWorld || 'Lernlandkarte'}
          </h2>
          
          <div className="space-y-4">
            {(discoveryPath.objectives || []).map((objective, index) => {
              const isUnlocked = isObjectiveUnlocked(objective)
              const progress = getObjectiveProgress(objective.id)
              const isActive = currentObjective === objective.id
              
              return (
                <div key={objective.id} className="relative">
                  {/* Connection Line */}
                  {index > 0 && (
                    <div className="absolute -top-4 left-4 w-0.5 h-4 bg-gray-300"></div>
                  )}
                  
                  <button
                    onClick={() => isUnlocked ? setCurrentObjective(objective.id) : null}
                    disabled={!isUnlocked}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      isActive 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : isUnlocked
                        ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        : 'border-gray-100 bg-gray-50 opacity-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        progress === 100 ? 'bg-green-500' : isUnlocked ? `bg-[${theme?.primaryColor || '#3B82F6'}]` : 'bg-gray-400'
                      }`}>
                        {progress === 100 ? (theme?.visualElements?.completedIcon || '✅') : index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {objective.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {objective.description}
                        </p>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`inline-block w-2 h-2 rounded-full ${getDifficultyColor(objective.difficulty)}`}></span>
                          <span className="text-xs text-gray-400">
                            {objective.estimatedTime}min
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="h-1 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${progress}%`,
                              backgroundColor: theme?.primaryColor || '#3B82F6'
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
          
          {/* Overall Progress */}
          <div className="mt-6 pt-4 border-t">
            <div className="text-sm text-gray-600 mb-2">Gesamtfortschritt</div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(discoveryPath.objectives || []).length > 0 ? 
                      (learnerProfile.completedObjectives.length / (discoveryPath.objectives || []).length) * 100 
                      : 0}%`,
                    background: `linear-gradient(to right, ${theme?.primaryColor || '#3B82F6'}, ${theme?.secondaryColor || '#60A5FA'})`
                  }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {(discoveryPath.objectives || []).length > 0 ? 
                  Math.round((learnerProfile.completedObjectives.length / (discoveryPath.objectives || []).length) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3">
        {currentObjective && discoveryPath.objectives && (
          <ObjectiveExplorer
            objective={discoveryPath.objectives.find(obj => obj.id === currentObjective)!}
            stations={getStationsForObjective(currentObjective)}
            currentStation={currentStation}
            setCurrentStation={setCurrentStation}
            completedStations={completedStations}
            onCompleteStation={completeStation}
            isStationUnlocked={isStationUnlocked}
            theme={theme}
          />
        )}
        </div>
      </div>
    </div>
  )
}

// Sub-component for exploring an objective
interface ObjectiveExplorerProps {
  objective: LearningObjective
  stations: LearningStation[]
  currentStation: string | null
  setCurrentStation: (stationId: string | null) => void
  completedStations: Set<string>
  onCompleteStation: (stationId: string) => void
  isStationUnlocked: (station: LearningStation) => boolean
  theme: any
}

function ObjectiveExplorer({ 
  objective, 
  stations, 
  currentStation, 
  setCurrentStation,
  completedStations,
  onCompleteStation,
  isStationUnlocked,
  theme
}: ObjectiveExplorerProps) {
  
  const getStationIcon = (type: string) => {
    switch (type) {
      case 'explanation': return theme?.stationIcons?.explanation || '📚'
      case 'quiz': return theme?.stationIcons?.quiz || '🧠'
      case 'simulation': return theme?.stationIcons?.simulation || '🔬'
      case 'reflection': return theme?.stationIcons?.reflection || '💭'
      case 'challenge': return theme?.stationIcons?.challenge || '🎯'
      default: return '📝'
    }
  }

  if (!currentStation && stations.length > 0) {
    // Show station selection
    return (
      <div className="space-y-6">
        {/* Objective Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{objective.title}</h1>
          <p className="text-lg text-gray-600 mb-6">{objective.description}</p>
          
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              {objective.difficulty === 'beginner' ? 'Einfach' : 
               objective.difficulty === 'intermediate' ? 'Mittel' : 'Schwer'}
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              {objective.estimatedTime} Minuten
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              {objective.category}
            </span>
          </div>
        </div>

        {/* Station Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stations.map((station, index) => {
            const isUnlocked = isStationUnlocked(station)
            const isCompleted = completedStations.has(station.id)
            
            return (
              <button
                key={station.id}
                onClick={() => isUnlocked ? setCurrentStation(station.id) : null}
                disabled={!isUnlocked}
                className={`text-left p-6 rounded-2xl border-2 transition-all hover:scale-105 ${
                  isCompleted
                    ? 'border-green-500 bg-green-50 shadow-lg'
                    : isUnlocked
                    ? 'border-blue-200 bg-white hover:border-blue-400 hover:shadow-lg'
                    : 'border-gray-200 bg-gray-50 opacity-50'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`text-4xl ${isCompleted ? 'grayscale-0' : isUnlocked ? 'grayscale-0' : 'grayscale'}`}>
                    {getStationIcon(station.type)}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {station.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {station.type === 'explanation' ? 'Konzept verstehen und lernen' :
                       station.type === 'quiz' ? 'Wissen testen und vertiefen' :
                       station.type === 'simulation' ? 'Praktisch ausprobieren' :
                       station.type === 'reflection' ? 'Über das Gelernte nachdenken' :
                       station.type === 'challenge' ? 'Kreative Herausforderung' :
                       'Lernaktivität'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        station.type === 'explanation' ? 'bg-blue-100 text-blue-800' :
                        station.type === 'quiz' ? 'bg-purple-100 text-purple-800' :
                        station.type === 'simulation' ? 'bg-green-100 text-green-800' :
                        station.type === 'reflection' ? 'bg-yellow-100 text-yellow-800' :
                        station.type === 'challenge' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {station.type === 'explanation' ? 'Verstehen' :
                         station.type === 'quiz' ? 'Testen' :
                         station.type === 'simulation' ? 'Anwenden' :
                         station.type === 'reflection' ? 'Reflektieren' :
                         station.type === 'challenge' ? 'Herausfordern' :
                         'Lernen'}
                      </span>
                      
                      {isCompleted && (
                        <span className="text-green-600 font-semibold text-sm">
                          ✓ Abgeschlossen
                        </span>
                      )}
                      
                      {!isUnlocked && (
                        <span className="text-gray-400 text-sm">
                          🔒 Gesperrt
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Show individual station content
  const station = stations.find(s => s.id === currentStation)
  if (!station) return null

  return (
    <StationContent 
      station={station}
      onComplete={() => onCompleteStation(station.id)}
      onBack={() => setCurrentStation(null)}
      isCompleted={completedStations.has(station.id)}
    />
  )
}

// Component for individual station content
interface StationContentProps {
  station: LearningStation
  onComplete: () => void
  onBack: () => void
  isCompleted: boolean
}

function StationContent({ station, onComplete, onBack, isCompleted }: StationContentProps) {
  const [progress, setProgress] = useState(0)

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Zurück zur Übersicht
        </button>
        
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{station.type === 'explanation' ? '📚' : 
                                     station.type === 'quiz' ? '🧠' : 
                                     station.type === 'simulation' ? '🔬' : 
                                     station.type === 'reflection' ? '💭' : '🎯'}</span>
          <h2 className="text-2xl font-bold text-gray-900">{station.title}</h2>
        </div>
      </div>

      {/* Content based on station type */}
      <div className="mb-8">
        {station.type === 'explanation' && (
          <ExplanationStation content={station.content} onProgress={setProgress} />
        )}
        
        {station.type === 'quiz' && (
          <QuizStation content={station.content} onProgress={setProgress} />
        )}
        
        {station.type === 'simulation' && (
          <SimulationStation content={station.content} onProgress={setProgress} />
        )}
        
        {station.type === 'reflection' && (
          <ReflectionStation content={station.content} onProgress={setProgress} />
        )}
        
        {station.type === 'challenge' && (
          <ChallengeStation content={station.content} onProgress={setProgress} />
        )}
      </div>

      {/* Progress and completion */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            Fortschritt: {Math.round(progress)}%
          </div>
          
          {progress >= 80 && !isCompleted && (
            <button
              onClick={onComplete}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              ✓ Station abschließen
            </button>
          )}
          
          {isCompleted && (
            <span className="text-green-600 font-semibold">
              ✓ Abgeschlossen
            </span>
          )}
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

// Individual station components
function ExplanationStation({ content, onProgress }: { content: any; onProgress: (progress: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onProgress(100), 3000) // Auto-complete after reading time
    return () => clearTimeout(timer)
  }, [onProgress])

  return (
    <div className="prose max-w-none">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
        <p className="text-blue-800 leading-relaxed">
          {content.text || 'Hier steht die Erklärung des Konzepts...'}
        </p>
      </div>
      
      {content.examples && (
        <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-6">
          <h4 className="text-green-800 font-semibold mb-3">Beispiele:</h4>
          <ul className="text-green-700 space-y-2">
            {content.examples.map((example: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {example}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {content.visualAids && (
        <div className="bg-purple-50 border-l-4 border-purple-500 p-6">
          <h4 className="text-purple-800 font-semibold mb-3">Visuelles Hilfsmittel:</h4>
          <p className="text-purple-700">{content.visualAids}</p>
        </div>
      )}
    </div>
  )
}

function QuizStation({ content, onProgress }: { content: any; onProgress: (progress: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const questions = content.questions || []

  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }))
    
    const progress = ((Object.keys(answers).length + 1) / questions.length) * 100
    onProgress(Math.min(progress, 100))
  }

  return (
    <div className="space-y-6">
      {questions.map((question: any, qIndex: number) => (
        <div key={qIndex} className="bg-gray-50 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            {qIndex + 1}. {question.question}
          </h4>
          
          <div className="space-y-3">
            {question.options?.map((option: string, oIndex: number) => (
              <button
                key={oIndex}
                onClick={() => handleAnswer(qIndex, oIndex)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  answers[qIndex] === oIndex
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          
          {answers[qIndex] !== undefined && (
            <div className={`mt-4 p-3 rounded-lg ${
              answers[qIndex] === question.correct
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}>
              {answers[qIndex] === question.correct ? '✓ Richtig!' : '✗ Leider falsch.'}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function SimulationStation({ content, onProgress }: { content: any; onProgress: (progress: number) => void }) {
  useEffect(() => {
    onProgress(50) // Start with some progress
  }, [onProgress])

  return (
    <div className="bg-green-50 border-2 border-dashed border-green-300 rounded-xl p-8 text-center">
      <div className="text-6xl mb-4">🔬</div>
      <h3 className="text-xl font-semibold text-green-800 mb-3">Interaktive Simulation</h3>
      <p className="text-green-700 mb-6">
        Hier würde eine interaktive Simulation stehen, die das Konzept praktisch erfahrbar macht.
      </p>
      <button
        onClick={() => onProgress(100)}
        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
      >
        Simulation starten
      </button>
    </div>
  )
}

function ReflectionStation({ content, onProgress }: { content: any; onProgress: (progress: number) => void }) {
  const [reflection, setReflection] = useState('')

  const handleReflectionChange = (value: string) => {
    setReflection(value)
    const progress = Math.min((value.length / 100) * 100, 100) // 100 characters for full progress
    onProgress(progress)
  }

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6">
        <h4 className="text-yellow-800 font-semibold mb-3">Reflexionsfragen:</h4>
        <ul className="text-yellow-700 space-y-2">
          <li>• Was hast du Neues gelernt?</li>
          <li>• Wie kannst du das Wissen anwenden?</li>
          <li>• Welche Verbindungen siehst du zu anderen Themen?</li>
        </ul>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deine Gedanken:
        </label>
        <textarea
          value={reflection}
          onChange={(e) => handleReflectionChange(e.target.value)}
          placeholder="Nimm dir Zeit zum Nachdenken und schreibe deine Gedanken auf..."
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="text-sm text-gray-500 mt-2">
          {reflection.length}/100 Zeichen (empfohlen für vollständige Reflexion)
        </p>
      </div>
    </div>
  )
}

function ChallengeStation({ content, onProgress }: { content: any; onProgress: (progress: number) => void }) {
  const [challengeCompleted, setChallengeCompleted] = useState(false)

  const handleChallengeComplete = () => {
    setChallengeCompleted(true)
    onProgress(100)
  }

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border-l-4 border-red-500 p-6">
        <h4 className="text-red-800 font-semibold mb-3">🎯 Kreative Herausforderung</h4>
        <p className="text-red-700">
          Erstelle etwas Eigenes mit dem gelernten Wissen. Das kann ein kleines Projekt, 
          ein Erklärvideo, eine Präsentation oder eine kreative Lösung für ein Problem sein.
        </p>
      </div>
      
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <h5 className="font-semibold text-gray-900 mb-3">Deine Aufgabe:</h5>
        <p className="text-gray-700 mb-4">
          {content.challenge || 'Wende das Gelernte in einer kreativen Art und Weise an.'}
        </p>
        
        {!challengeCompleted ? (
          <button
            onClick={handleChallengeComplete}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            Herausforderung angenommen! ✓
          </button>
        ) : (
          <div className="text-green-600 font-semibold">
            🎉 Herausforderung gemeistert!
          </div>
        )}
      </div>
    </div>
  )
}