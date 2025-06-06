'use client'

import { useState, useEffect } from 'react'
import { renderAIGeneratedComponent } from '@/lib/ai-interaction-generator'

interface AIInteractiveStationProps {
  content: {
    aiElement: any
    componentCode: string
    config: any
    customLogic: string
    styling: string
  }
  onProgress: (progress: number) => void
}

export default function AIInteractiveStation({ content, onProgress }: AIInteractiveStationProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [interactionState, setInteractionState] = useState({
    started: false,
    progress: 0,
    completed: false,
    userActions: 0,
    startTime: null as Date | null
  })

  useEffect(() => {
    // Apply AI-generated styling
    if (content.styling) {
      const styleElement = document.createElement('style')
      styleElement.textContent = content.styling
      document.head.appendChild(styleElement)
      
      return () => {
        document.head.removeChild(styleElement)
      }
    }
  }, [content.styling])

  useEffect(() => {
    // Initialize AI interaction logic
    if (content.customLogic) {
      try {
        // Execute AI-generated interaction logic
        const logicFunction = new Function('useState', 'setInteractionState', 'onProgress', content.customLogic)
        logicFunction(useState, setInteractionState, onProgress)
        setIsLoaded(true)
      } catch (error) {
        console.error('Error loading AI interaction logic:', error)
        setError('Failed to load AI interaction')
      }
    } else {
      setIsLoaded(true)
    }
  }, [content.customLogic, onProgress])

  const handleInteractionStart = () => {
    setInteractionState(prev => ({
      ...prev,
      started: true,
      startTime: new Date()
    }))
  }

  const handleUserAction = () => {
    setInteractionState(prev => {
      const newActions = prev.userActions + 1
      const newProgress = Math.min((newActions / 10) * 100, 100) // Assume 10 actions for completion
      
      onProgress(newProgress)
      
      return {
        ...prev,
        userActions: newActions,
        progress: newProgress,
        completed: newProgress >= 100
      }
    })
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-red-800 mb-3">AI-Interaktion konnte nicht geladen werden</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <div className="bg-white p-4 rounded-lg border border-red-200">
          <h4 className="font-semibold text-red-800 mb-2">Fallback: Manuelle Interaktion</h4>
          <p className="text-red-700 text-sm">{content.aiElement.description}</p>
          <button
            onClick={() => {
              handleUserAction()
              if (interactionState.userActions >= 9) {
                setInteractionState(prev => ({ ...prev, completed: true }))
                onProgress(100)
              }
            }}
            className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Interaktion simulieren ({interactionState.userActions}/10)
          </button>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-8 rounded-2xl text-center">
        <div className="animate-spin text-4xl mb-4">🤖</div>
        <h3 className="text-xl font-bold mb-2">KI entwickelt deine individuelle Interaktion...</h3>
        <p className="text-purple-100">Erstelle maßgeschneiderte Lernelemente für dieses Thema</p>
        <div className="mt-4 w-full bg-white/20 rounded-full h-2">
          <div className="bg-white h-2 rounded-full animate-pulse w-3/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Interactive Element Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center">
            🤖 {content.aiElement.title}
          </h3>
          <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
            KI-generiert
          </div>
        </div>
        <p className="text-indigo-100 mb-4">{content.aiElement.description}</p>
        
        {/* Interaction Progress */}
        <div className="flex justify-between text-sm">
          <span>Fortschritt: {Math.round(interactionState.progress)}%</span>
          <span>Aktionen: {interactionState.userActions}</span>
          {interactionState.startTime && (
            <span>Zeit: {Math.round((Date.now() - interactionState.startTime.getTime()) / 1000)}s</span>
          )}
        </div>
        
        <div className="w-full bg-white/20 rounded-full h-2 mt-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-500"
            style={{ width: `${interactionState.progress}%` }}
          />
        </div>
      </div>

      {/* AI-Generated Interactive Content */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {!interactionState.started ? (
          // Start Screen
          <div className="p-8 text-center">
            <div className="text-6xl mb-6">🎯</div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">
              Bereit für deine personalisierte Interaktion?
            </h4>
            <p className="text-gray-600 mb-6">
              Diese Lernaktivität wurde speziell für "{content.aiElement.title}" entwickelt.
            </p>
            
            {/* AI Element Configuration Display */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h5 className="font-semibold text-gray-900 mb-3">KI-Konfiguration:</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Typ:</span>
                  <span className="ml-2 text-gray-600">{content.aiElement.type}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Schwierigkeit:</span>
                  <span className="ml-2 text-gray-600">{content.config.difficultyLevels?.[0] || 'Adaptiv'}</span>
                </div>
              </div>
              
              {content.config.visualElements && (
                <div className="mt-3">
                  <span className="font-medium text-gray-700">Elemente:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {content.config.visualElements.map((element: string, index: number) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {element}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleInteractionStart}
              className="bg-indigo-500 text-white px-8 py-4 rounded-xl font-medium hover:bg-indigo-600 transition-colors text-lg"
            >
              🚀 KI-Interaktion starten
            </button>
          </div>
        ) : (
          // AI-Generated Interactive Content
          <div className="p-8">
            <AIGeneratedInteractiveContent
              element={content.aiElement}
              config={content.config}
              componentCode={content.componentCode}
              onUserAction={handleUserAction}
              onComplete={() => {
                setInteractionState(prev => ({ ...prev, completed: true }))
                onProgress(100)
              }}
            />
          </div>
        )}

        {/* Completion State */}
        {interactionState.completed && (
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white p-6 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h4 className="text-xl font-bold mb-2">KI-Interaktion abgeschlossen!</h4>
            <p className="text-green-100 mb-4">
              Du hast erfolgreich mit der AI-generierten Lernaktivität für "{content.aiElement.title}" interagiert.
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-bold text-lg">{interactionState.userActions}</div>
                <div className="text-green-100">Aktionen</div>
              </div>
              <div>
                <div className="font-bold text-lg">
                  {interactionState.startTime ? Math.round((Date.now() - interactionState.startTime.getTime()) / 1000) : 0}s
                </div>
                <div className="text-green-100">Zeit</div>
              </div>
              <div>
                <div className="font-bold text-lg">+50</div>
                <div className="text-green-100">XP</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Component that renders AI-generated interactive content
function AIGeneratedInteractiveContent({ 
  element, 
  config, 
  componentCode, 
  onUserAction, 
  onComplete 
}: {
  element: any
  config: any
  componentCode: string
  onUserAction: () => void
  onComplete: () => void
}) {
  const [attemptedCustomRender, setAttemptedCustomRender] = useState(false)
  
  useEffect(() => {
    // Try to render AI-generated component
    if (componentCode && !attemptedCustomRender) {
      setAttemptedCustomRender(true)
      try {
        // This would be the AI-generated component rendering
        // In production, you'd want a sandboxed execution environment
        console.log('AI Component Code:', componentCode)
      } catch (error) {
        console.error('Error rendering AI component:', error)
      }
    }
  }, [componentCode, attemptedCustomRender])

  // Fallback: Create interactive elements based on AI configuration
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h4 className="text-xl font-bold text-gray-900 mb-2">{element.title}</h4>
        <p className="text-gray-600">{element.description}</p>
      </div>

      {/* AI-Configured Interactive Elements */}
      {config.interactionData && (
        <div className="bg-gray-50 rounded-xl p-6">
          <h5 className="font-semibold text-gray-900 mb-4">Interaktive Elemente:</h5>
          
          {/* Example: AI-configured drag and drop */}
          {element.type.includes('drag') || element.type.includes('sort') ? (
            <AIConfiguredDragDrop 
              config={config} 
              onUserAction={onUserAction}
              onComplete={onComplete}
            />
          ) : element.type.includes('quiz') || element.type.includes('question') ? (
            <AIConfiguredQuiz 
              config={config} 
              onUserAction={onUserAction}
              onComplete={onComplete}
            />
          ) : (
            <AIConfiguredGenericInteraction 
              element={element}
              config={config} 
              onUserAction={onUserAction}
              onComplete={onComplete}
            />
          )}
        </div>
      )}

      {/* AI-Generated Custom Component Placeholder */}
      <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">🤖</div>
        <h5 className="text-lg font-semibold text-blue-900 mb-2">KI-Generierte Komponente</h5>
        <p className="text-blue-700 text-sm mb-4">
          Hier würde die vollständig AI-generierte Interaktion für "{element.title}" gerendert werden.
        </p>
        <div className="bg-white rounded-lg p-4 text-left">
          <pre className="text-xs text-gray-600 overflow-auto max-h-32">
            {componentCode ? componentCode.substring(0, 200) + '...' : 'AI-generierter Code wird hier ausgeführt'}
          </pre>
        </div>
        <button
          onClick={() => {
            onUserAction()
            setTimeout(onComplete, 2000)
          }}
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          KI-Interaktion simulieren
        </button>
      </div>
    </div>
  )
}

// AI-configured interactive components
function AIConfiguredDragDrop({ config, onUserAction, onComplete }: any) {
  const [items] = useState(config.visualElements || ['Element 1', 'Element 2', 'Element 3'])
  const [sorted, setSorted] = useState<string[]>([])
  
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Sortiere diese Elemente (AI-konfiguriert):</p>
      <div className="grid grid-cols-3 gap-3">
        {items.map((item: string, index: number) => (
          <button
            key={index}
            onClick={() => {
              setSorted(prev => [...prev, item])
              onUserAction()
              if (sorted.length + 1 >= items.length) {
                setTimeout(onComplete, 1000)
              }
            }}
            className="bg-blue-100 border border-blue-300 p-3 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            disabled={sorted.includes(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-700">Sortierte Reihenfolge:</p>
        <div className="flex space-x-2 mt-2">
          {sorted.map((item, index) => (
            <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
              {index + 1}. {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function AIConfiguredQuiz({ config, onUserAction, onComplete }: any) {
  const [answered, setAnswered] = useState(false)
  
  return (
    <div className="space-y-4">
      <h6 className="font-medium text-gray-900">AI-generierte Frage:</h6>
      <p className="text-gray-700">Was ist das wichtigste Element in diesem Thema?</p>
      <div className="space-y-2">
        {['Option A', 'Option B', 'Option C'].map((option, index) => (
          <button
            key={index}
            onClick={() => {
              setAnswered(true)
              onUserAction()
              setTimeout(onComplete, 1500)
            }}
            disabled={answered}
            className={`w-full text-left p-3 rounded-lg border transition-colors ${
              answered 
                ? 'border-green-500 bg-green-50 text-green-800' 
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function AIConfiguredGenericInteraction({ element, config, onUserAction, onComplete }: any) {
  const [interacted, setInteracted] = useState(false)
  
  return (
    <div className="text-center space-y-4">
      <p className="text-gray-700">Spezielle Interaktion für: {element.type}</p>
      <button
        onClick={() => {
          setInteracted(true)
          onUserAction()
          setTimeout(onComplete, 2000)
        }}
        disabled={interacted}
        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
          interacted
            ? 'bg-green-500 text-white cursor-not-allowed'
            : 'bg-purple-500 text-white hover:bg-purple-600'
        }`}
      >
        {interacted ? '✓ Interaktion abgeschlossen' : `${element.title} starten`}
      </button>
    </div>
  )
}