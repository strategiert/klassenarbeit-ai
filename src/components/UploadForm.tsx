'use client'

import { useState, useEffect } from 'react'

interface ProcessingStatus {
  id: string
  subdomain: string
  title: string
  status: 'processing' | 'completed' | 'failed'
  stages: Array<{
    name: string
    label: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    completed_at: string | null
    progress: number
  }>
  progress: {
    current: number
    step: string
    elapsed_time: {
      minutes: number
      seconds: number
      total_seconds: number
    }
    estimated_remaining_minutes: number
  }
  error_message?: string
  ready_for_quiz: boolean
  redirect_url?: string
}

export default function UploadForm() {
  const [inputMethod, setInputMethod] = useState<'text' | 'file'>('text')
  const [mode, setMode] = useState<'quiz' | 'discovery'>('quiz')
  const [textContent, setTextContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState<ProcessingStatus | null>(null)
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null)

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [pollInterval])

  const pollStatus = async (subdomain: string) => {
    try {
      const response = await fetch(`/api/status/${subdomain}`)
      if (response.ok) {
        const status = await response.json()
        setProcessing(status)
        
        // If processing is complete, stop polling
        if (status.status === 'completed' || status.status === 'failed') {
          if (pollInterval) {
            clearInterval(pollInterval)
            setPollInterval(null)
          }
          
          // If ready for quiz, redirect
          if (status.ready_for_quiz) {
            setTimeout(() => {
              const appUrl = window.location.origin
              const quizUrl = `${appUrl}/quiz/${status.subdomain}`
              window.location.href = `/success?url=${encodeURIComponent(quizUrl)}&title=${encodeURIComponent(status.title)}`
            }, 2000)
          }
        }
      }
    } catch (err) {
      console.error('Error polling status:', err)
    }
  }

  const startPolling = (subdomain: string) => {
    // Poll every 2 seconds
    const interval = setInterval(() => pollStatus(subdomain), 2000)
    setPollInterval(interval)
    
    // Initial poll
    pollStatus(subdomain)
  }

  const triggerQuizGeneration = async (subdomain: string) => {
    try {
      const response = await fetch('/api/trigger-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subdomain }),
      })

      if (!response.ok) {
        throw new Error('Failed to trigger quiz generation')
      }
    } catch (err) {
      console.error('Error triggering quiz generation:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!title.trim()) {
        throw new Error('Bitte gib einen Titel für die Klassenarbeit ein')
      }

      if (inputMethod === 'text' && !textContent.trim()) {
        throw new Error('Bitte gib den Inhalt der Klassenarbeit ein')
      }

      if (inputMethod === 'file' && !file) {
        throw new Error('Bitte wähle eine Datei aus')
      }

      let content = textContent

      // Handle file upload
      if (inputMethod === 'file' && file) {
        if (file.type === 'application/pdf') {
          // For now, show error for PDF - we'd need PDF parsing library
          throw new Error('PDF-Upload wird in der nächsten Version unterstützt. Bitte nutze Text-Eingabe.')
        } else {
          // Handle text files
          content = await file.text()
        }
      }

      // Use research-first workflow for both quiz and discovery modes
      const response = await fetch('/api/process-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          teacherId: 'user-' + Date.now(),
          mode, // Pass the mode to the API
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Fehler beim Verarbeiten des Inhalts')
      }

      const result = await response.json()
      
      // Switch to processing view
      setIsLoading(false)
      setProcessing({
        id: result.id,
        subdomain: result.subdomain,
        title: title,
        status: 'processing',
        stages: [
          { name: 'research', label: 'DeepSeek AI Forschung', status: 'processing', completed_at: null, progress: 0 },
          { name: 'generation', label: mode === 'discovery' ? 'Lernreise-Generierung' : 'Quiz-Generierung', status: 'pending', completed_at: null, progress: 0 }
        ],
        progress: {
          current: 0,
          step: 'Starte KI-Research...',
          elapsed_time: { minutes: 0, seconds: 0, total_seconds: 0 },
          estimated_remaining_minutes: result.status?.estimated_time_minutes || 3
        },
        ready_for_quiz: false
      })
      
      // Start polling for status updates
      startPolling(result.subdomain)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file type
      const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Bitte wähle eine PDF, Word oder Text-Datei aus')
        return
      }
      setFile(selectedFile)
      setError('')
    }
  }

  // Show processing status if quiz is being processed
  if (processing) {
    const { progress, stages } = processing
    const isCompleted = processing.status === 'completed'
    const isFailed = processing.status === 'failed'
    
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">
              {isCompleted ? '🎉' : isFailed ? '❌' : '🧠'}
            </div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">
              {isCompleted ? 'Lernwelt ist bereit!' : isFailed ? 'Ein Fehler ist aufgetreten' : 'Deine KI forscht intensiv...'}
            </h2>
            <p className="text-blue-700 mb-4">"{processing.title}"</p>
            
            {!isCompleted && !isFailed && (
              <div className="flex justify-center items-center space-x-4 text-sm text-blue-600">
                <span>☕ Zeit für einen Kaffee!</span>
                <span>•</span>
                <span>⏱️ {progress.elapsed_time.minutes}:{progress.elapsed_time.seconds.toString().padStart(2, '0')} vergangen</span>
                {progress.estimated_remaining_minutes > 0 && (
                  <>
                    <span>•</span>
                    <span>🕐 ~{progress.estimated_remaining_minutes} Min. verbleibend</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Overall Progress Bar */}
          {!isCompleted && !isFailed && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-700">{progress.step}</span>
                <span className="text-sm text-blue-600">{Math.round(progress.current)}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.max(5, progress.current)}%` }}
                >
                  <div className="h-full bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Stages */}
          <div className="space-y-4">
            {stages.map((stage, index) => (
              <div key={stage.name} className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  stage.status === 'completed' 
                    ? 'bg-green-500 text-white' 
                    : stage.status === 'processing'
                    ? 'bg-blue-500 text-white'
                    : stage.status === 'failed'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {stage.status === 'completed' ? (
                    '✓'
                  ) : stage.status === 'processing' ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : stage.status === 'failed' ? (
                    '✗'
                  ) : (
                    index + 1
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium ${
                      stage.status === 'completed' ? 'text-green-700' : 
                      stage.status === 'processing' ? 'text-blue-700' :
                      stage.status === 'failed' ? 'text-red-700' :
                      'text-gray-700'
                    }`}>
                      {stage.label}
                    </p>
                    {stage.status === 'processing' && stage.progress > 0 && (
                      <span className="text-sm text-blue-600">{Math.round(stage.progress)}%</span>
                    )}
                  </div>
                  
                  {/* Stage Progress Bar */}
                  {stage.status === 'processing' && stage.progress > 0 && (
                    <div className="w-full bg-blue-100 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(2, stage.progress)}%` }}
                      ></div>
                    </div>
                  )}
                  
                  {stage.status === 'completed' && stage.completed_at && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Abgeschlossen um {new Date(stage.completed_at).toLocaleTimeString()}
                    </p>
                  )}
                  
                  {stage.status === 'processing' && (
                    <p className="text-xs text-blue-600 mt-1">
                      🔄 Läuft gerade...
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {isFailed && processing.error_message && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-red-500">⚠️</span>
                <p className="text-red-700 font-medium">Fehler:</p>
              </div>
              <p className="text-red-600 mt-1">{processing.error_message}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-3 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors"
              >
                🔄 Erneut versuchen
              </button>
            </div>
          )}

          {/* Success State */}
          {isCompleted && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-700 font-medium mb-3">
                🎉 Deine Lernwelt wurde erfolgreich erstellt!
              </p>
              {processing.redirect_url && (
                <p className="text-green-600 text-sm">
                  Du wirst in wenigen Sekunden weitergeleitet...
                </p>
              )}
            </div>
          )}

          {/* Manual Actions */}
          {!isCompleted && !isFailed && progress.elapsed_time.total_seconds > 300 && ( // After 5 minutes
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-700 mb-3">
                🕐 Das dauert länger als erwartet...
              </p>
              <p className="text-yellow-600 text-sm mb-3">
                DeepSeek arbeitet besonders gründlich an deinen Inhalten.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-4 py-2 rounded-lg transition-colors"
              >
                🔄 Status aktualisieren
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title Input */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Titel der Klassenarbeit
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="z.B. Mathematik Klassenarbeit - Quadratische Funktionen"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {/* Mode Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Welchen Modus möchtest du verwenden?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setMode('quiz')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              mode === 'quiz'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🧠</span>
              <div>
                <h3 className="font-semibold text-gray-900">Klassisches Quiz</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Traditionelles Quiz mit Fragen und sofortiger Auswertung
                </p>
              </div>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setMode('discovery')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              mode === 'discovery'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🗺️</span>
              <div>
                <h3 className="font-semibold text-gray-900">Discovery Modus</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Spielerische Lernreise mit verschiedenen Stationen und Aktivitäten
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Input Method Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Wie möchtest du die Klassenarbeit eingeben?
        </label>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setInputMethod('text')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              inputMethod === 'text'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            📝 Text eingeben
          </button>
          <button
            type="button"
            onClick={() => setInputMethod('file')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              inputMethod === 'file'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            📎 Datei hochladen
          </button>
        </div>
      </div>

      {/* Content Input */}
      {inputMethod === 'text' ? (
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Inhalt der Klassenarbeit
          </label>
          <textarea
            id="content"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Gib hier den kompletten Inhalt deiner Klassenarbeit ein..."
            rows={12}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
          />
          <p className="text-sm text-gray-500 mt-2">
            Tipp: Je detaillierter du die Themen beschreibst, desto besser wird das generierte Quiz
          </p>
        </div>
      ) : (
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
            Datei auswählen
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              accept=".pdf,.txt,.doc,.docx"
              className="hidden"
            />
            <label
              htmlFor="file"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <div className="text-4xl">📄</div>
              {file ? (
                <div>
                  <p className="text-green-600 font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">Klicke um eine andere Datei zu wählen</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 font-medium">Datei auswählen oder hierher ziehen</p>
                  <p className="text-sm text-gray-500">PDF, Word oder Text-Dateien unterstützt</p>
                </div>
              )}
            </label>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Generiere Quiz...</span>
          </div>
        ) : (
          mode === 'discovery' ? '🗺️ Lernreise erstellen' : '🚀 Quiz generieren'
        )}
      </button>
    </form>
  )
}