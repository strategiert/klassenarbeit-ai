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
  const [currentSection, setCurrentSection] = useState(0)
  const [timeSpent, setTimeSpent] = useState(0)
  const [isReadingComplete, setIsReadingComplete] = useState(false)

  const sections = [
    { title: 'Konzept verstehen', content: content.text || 'Hier steht die Erklärung des Konzepts...', icon: '📚' },
    ...(content.examples ? [{ title: 'Beispiele erkunden', content: content.examples, icon: '💡' }] : []),
    ...(content.visualAids ? [{ title: 'Visualisierung', content: content.visualAids, icon: '🎨' }] : [])
  ]

  // Track reading time
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1)
      const progress = Math.min((timeSpent / 30) * 100, 100) // 30 seconds for full progress
      onProgress(progress)
      
      if (timeSpent >= 20 && !isReadingComplete) {
        setIsReadingComplete(true)
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [timeSpent, onProgress, isReadingComplete])

  return (
    <div className="space-y-6">
      {/* Reading Progress Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center">
            📖 Interaktives Lernen
          </h3>
          <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
            {timeSpent}s gelesen
          </div>
        </div>
        
        {/* Section Navigation */}
        <div className="flex space-x-2">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => setCurrentSection(index)}
              className={`flex-1 p-3 rounded-xl transition-all ${
                currentSection === index 
                  ? 'bg-white text-blue-600 shadow-lg' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <div className="text-lg mb-1">{section.icon}</div>
              <div className="text-xs font-medium">{section.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[300px]">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{sections[currentSection].icon}</div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">{sections[currentSection].title}</h4>
        </div>

        {currentSection === 0 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
              <p className="text-blue-800 leading-relaxed text-lg">
                {sections[currentSection].content}
              </p>
            </div>
          </div>
        )}

        {currentSection === 1 && content.examples && (
          <div className="space-y-4">
            <div className="grid gap-4">
              {content.examples.map((example: string, index: number) => (
                <div 
                  key={index}
                  className="bg-green-50 border border-green-200 p-4 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    // Could add interactive example exploration here
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl">💡</span>
                    <p className="text-green-800 font-medium">{example}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentSection === 2 && content.visualAids && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 p-6 rounded-xl">
              <div className="text-center mb-4">
                <span className="text-4xl">🎨</span>
              </div>
              <p className="text-purple-800 text-center leading-relaxed">
                {sections[currentSection].content}
              </p>
            </div>
          </div>
        )}

        {/* Reading Completion Reward */}
        {isReadingComplete && (
          <div className="mt-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white p-4 rounded-xl text-center animate-pulse">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-bold">Aufmerksam gelesen!</p>
                <p className="text-sm">+20 XP für gründliches Studium</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function QuizStation({ content, onProgress }: { content: any; onProgress: (progress: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [showResults, setShowResults] = useState(false)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  
  const questions = content.questions || []

  // Timer for each question
  useEffect(() => {
    if (currentQuestion < questions.length && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Auto-advance to next question
            if (currentQuestion < questions.length - 1) {
              setCurrentQuestion(prev => prev + 1)
              setQuestionStartTime(Date.now())
              return 30
            } else {
              setShowResults(true)
              return 0
            }
          }
          return prev - 1
        })
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [currentQuestion, questions.length, showResults])

  const handleAnswer = (answerIndex: number) => {
    const question = questions[currentQuestion]
    const isCorrect = answerIndex === question.correct
    const responseTime = Date.now() - questionStartTime
    
    // Update answers
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answerIndex
    }))

    // Calculate scoring with time bonus
    if (isCorrect) {
      const timeBonus = Math.max(0, Math.floor((30 - responseTime / 1000) / 5)) * 10
      const basePoints = 100
      const streakBonus = streak * 25
      const totalPoints = basePoints + timeBonus + streakBonus
      
      setScore(prev => prev + totalPoints)
      setStreak(prev => prev + 1)
    } else {
      setStreak(0)
    }

    // Progress
    const progress = ((currentQuestion + 1) / questions.length) * 100
    onProgress(Math.min(progress, 100))

    // Advance to next question after delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setQuestionStartTime(Date.now())
        setTimeLeft(30)
      } else {
        setShowResults(true)
      }
    }, 2000)
  }

  if (showResults) {
    const totalQuestions = questions.length
    const correctAnswers = Object.entries(answers).filter(([qIndex, answer]) => 
      answer === questions[parseInt(qIndex)].correct
    ).length
    const percentage = (correctAnswers / totalQuestions) * 100

    return (
      <div className="space-y-6">
        {/* Results Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-8 rounded-2xl text-center">
          <div className="text-6xl mb-4">
            {percentage >= 80 ? '🏆' : percentage >= 60 ? '🥈' : '🥉'}
          </div>
          <h3 className="text-2xl font-bold mb-2">Quiz abgeschlossen!</h3>
          <p className="text-lg">{correctAnswers} von {totalQuestions} richtig</p>
          <div className="text-3xl font-bold mt-2">{score} Punkte</div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-blue-600">{percentage.toFixed(0)}%</div>
            <div className="text-sm text-blue-800">Genauigkeit</div>
          </div>
          <div className="bg-green-50 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-green-600">{score}</div>
            <div className="text-sm text-green-800">Punkte</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-purple-600">{Math.max(...Object.values(answers).map((_, i) => answers[i] === questions[i]?.correct ? 1 : 0).reduce((acc, curr, i) => {
              if (curr) acc.push(i === 0 ? 1 : acc[acc.length - 1] + 1)
              else acc.push(0)
              return acc
            }, [] as number[]))}</div>
            <div className="text-sm text-purple-800">Beste Serie</div>
          </div>
        </div>

        {/* Achievement Unlock */}
        {percentage >= 80 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🏅</span>
              <div>
                <p className="font-bold text-yellow-800">Erfolg freigeschaltet!</p>
                <p className="text-yellow-700 text-sm">Quiz-Master - 80%+ Genauigkeit erreicht!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const question = questions[currentQuestion]
  const isAnswered = answers[currentQuestion] !== undefined

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">🧠 Quiz Challenge</h3>
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
              Frage {currentQuestion + 1}/{questions.length}
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {timeLeft}s
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-4">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Score & Streak */}
        <div className="flex justify-between text-sm">
          <span>Score: {score}</span>
          {streak > 0 && <span>🔥 Serie: {streak}</span>}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">❓</div>
          <h4 className="text-xl font-bold text-gray-900 mb-4">
            {question?.question}
          </h4>
        </div>

        <div className="space-y-3">
          {question?.options?.map((option: string, oIndex: number) => (
            <button
              key={oIndex}
              onClick={() => !isAnswered && handleAnswer(oIndex)}
              disabled={isAnswered}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                isAnswered
                  ? oIndex === question.correct
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : answers[currentQuestion] === oIndex
                    ? 'border-red-500 bg-red-50 text-red-800'
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                  : 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  isAnswered
                    ? oIndex === question.correct
                      ? 'bg-green-500 text-white'
                      : answers[currentQuestion] === oIndex
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                    : 'bg-indigo-100 text-indigo-600'
                }`}>
                  {String.fromCharCode(65 + oIndex)}
                </div>
                <span className="font-medium">{option}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Feedback */}
        {isAnswered && (
          <div className={`mt-6 p-4 rounded-xl ${
            answers[currentQuestion] === question.correct
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">
                {answers[currentQuestion] === question.correct ? '✅' : '❌'}
              </span>
              <div>
                <p className={`font-bold mb-1 ${
                  answers[currentQuestion] === question.correct ? 'text-green-800' : 'text-red-800'
                }`}>
                  {answers[currentQuestion] === question.correct ? 'Richtig!' : 'Leider falsch!'}
                </p>
                <p className={`text-sm ${
                  answers[currentQuestion] === question.correct ? 'text-green-700' : 'text-red-700'
                }`}>
                  {question.explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SimulationStation({ content, onProgress }: { content: any; onProgress: (progress: number) => void }) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [sortedItems, setSortedItems] = useState<string[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [attempts, setAttempts] = useState(0)
  
  // Use content from interactive elements or default sorting
  const items = content.items || content.content?.items || ['Element A', 'Element B', 'Element C']
  const instructions = content.instructions || content.content?.instructions || 'Sortiere die Elemente in die richtige Reihenfolge'

  const handleDragStart = (item: string) => {
    setDraggedItem(item)
  }

  const handleDrop = (targetIndex: number) => {
    if (!draggedItem) return
    
    const newSortedItems = [...sortedItems]
    const draggedIndex = newSortedItems.indexOf(draggedItem)
    
    if (draggedIndex > -1) {
      newSortedItems.splice(draggedIndex, 1)
    }
    
    newSortedItems.splice(targetIndex, 0, draggedItem)
    setSortedItems(newSortedItems)
    setDraggedItem(null)
  }

  const handleCheck = () => {
    setAttempts(prev => prev + 1)
    // For demo, consider any arrangement as correct after 2 attempts
    if (attempts >= 1 || sortedItems.length === items.length) {
      setIsCompleted(true)
      onProgress(100)
    }
  }

  const resetSorting = () => {
    setSortedItems([])
    setAttempts(0)
    setIsCompleted(false)
    onProgress(25)
  }

  return (
    <div className="space-y-6">
      {/* Simulation Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">🔬 Interaktive Simulation</h3>
          <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
            Versuche: {attempts}
          </div>
        </div>
        <p className="text-green-100">{instructions}</p>
      </div>

      {!isCompleted ? (
        <div className="space-y-6">
          {/* Available Items */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">📦 Verfügbare Elemente</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {items.filter(item => !sortedItems.includes(item)).map((item, index) => (
                <div
                  key={item}
                  draggable
                  onDragStart={() => handleDragStart(item)}
                  className="bg-blue-100 border-2 border-blue-300 p-4 rounded-xl cursor-move hover:bg-blue-200 transition-colors text-center font-medium text-blue-800"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Sorting Area */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">🎯 Sortierbereich</h4>
            <div className="space-y-3">
              {Array.from({ length: Math.max(items.length, 3) }, (_, index) => (
                <div
                  key={index}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  className={`min-h-[60px] border-2 border-dashed rounded-xl flex items-center justify-center text-center transition-colors ${
                    sortedItems[index] 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  {sortedItems[index] ? (
                    <div className="bg-green-100 border border-green-300 px-4 py-2 rounded-lg font-medium text-green-800">
                      {index + 1}. {sortedItems[index]}
                    </div>
                  ) : (
                    <span className="text-gray-400">Element hier ablegen</span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCheck}
                disabled={sortedItems.length === 0}
                className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors disabled:bg-gray-300"
              >
                ✓ Überprüfen
              </button>
              <button
                onClick={resetSorting}
                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                🔄 Zurücksetzen
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Simulation abgeschlossen!</h3>
          <p className="text-gray-600 mb-6">
            Großartig! Du hast die Elemente erfolgreich sortiert und das Konzept praktisch erfahren.
          </p>
          
          {/* Results Summary */}
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
            <h4 className="font-bold text-green-800 mb-2">Deine Lösung:</h4>
            <div className="space-y-2">
              {sortedItems.map((item, index) => (
                <div key={index} className="text-green-700">
                  {index + 1}. {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-bold text-blue-800">+30 XP für praktische Anwendung!</p>
                <p className="text-blue-700 text-sm">Hands-on Lernen gemeistert</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ReflectionStation({ content, onProgress }: { content: any; onProgress: (progress: number) => void }) {
  const [reflection, setReflection] = useState('')
  const [currentPrompt, setCurrentPrompt] = useState(0)
  const [insights, setInsights] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)

  const prompts = content.questions || [
    'Was hast du Neues gelernt?',
    'Wie kannst du das Wissen anwenden?', 
    'Welche Verbindungen siehst du zu anderen Themen?'
  ]

  const handleReflectionChange = (value: string) => {
    setReflection(value)
    const progress = Math.min((value.length / 50) * 100, 100)
    onProgress(Math.min((insights.length * 33) + (progress / 3), 100))
  }

  const saveInsight = () => {
    if (reflection.trim()) {
      setInsights(prev => [...prev, reflection.trim()])
      setReflection('')
      
      if (currentPrompt < prompts.length - 1) {
        setCurrentPrompt(prev => prev + 1)
      } else {
        setIsComplete(true)
        onProgress(100)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Reflection Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">💭 Reflexions-Labor</h3>
          <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
            {insights.length}/{prompts.length} Erkenntnisse
          </div>
        </div>
        <p className="text-yellow-100">Zeit zum Nachdenken und Verknüpfen!</p>
      </div>

      {!isComplete ? (
        <div className="space-y-6">
          {/* Current Question */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🤔</div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">
                {prompts[currentPrompt]}
              </h4>
            </div>

            <div className="space-y-4">
              <textarea
                value={reflection}
                onChange={(e) => handleReflectionChange(e.target.value)}
                placeholder="Teile deine Gedanken und Erkenntnisse..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none text-lg"
              />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {reflection.length} Zeichen
                </span>
                <button
                  onClick={saveInsight}
                  disabled={reflection.trim().length < 10}
                  className="bg-yellow-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-yellow-600 transition-colors disabled:bg-gray-300"
                >
                  💡 Erkenntnis festhalten
                </button>
              </div>
            </div>
          </div>

          {/* Previous Insights */}
          {insights.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">🌟 Deine Erkenntnisse</h4>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl">
                    <div className="flex items-start space-x-3">
                      <span className="text-yellow-500 font-bold">{index + 1}.</span>
                      <p className="text-yellow-800">{insight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">🧠</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Reflexion abgeschlossen!</h3>
          <p className="text-gray-600 mb-6">
            Fantastisch! Du hast alle Reflexionsfragen durchdacht und wertvolle Erkenntnisse gesammelt.
          </p>

          {/* Insights Summary */}
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl mb-6">
            <h4 className="font-bold text-yellow-800 mb-4">Deine Lernreise-Erkenntnisse:</h4>
            <div className="space-y-3 text-left">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="text-yellow-600 font-bold">{index + 1}.</span>
                  <p className="text-yellow-800 text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-xl">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎓</span>
              <div>
                <p className="font-bold text-purple-800">+25 XP für tiefe Reflexion!</p>
                <p className="text-purple-700 text-sm">Metacognitive Fähigkeiten entwickelt</p>
              </div>
            </div>
          </div>
        </div>
      )}
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