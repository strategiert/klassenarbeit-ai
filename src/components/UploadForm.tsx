'use client'

import { useState } from 'react'

export default function UploadForm() {
  const [inputMethod, setInputMethod] = useState<'text' | 'file'>('text')
  const [textContent, setTextContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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

      // Call API to generate quiz
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          inputMethod,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Fehler beim Generieren des Quiz')
      }

      const result = await response.json()
      
      // Show success with better UX
      window.location.href = `/success?url=${encodeURIComponent(result.url)}&title=${encodeURIComponent(title)}`
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
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
          '🚀 Quiz generieren'
        )}
      </button>
    </form>
  )
}