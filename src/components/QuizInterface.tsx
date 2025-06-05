'use client'

import { useState, useEffect } from 'react'

interface QuizQuestion {
  id: string
  question: string
  type: 'multiple-choice' | 'true-false' | 'short-answer'
  options?: string[]
  correctAnswer: string
  explanation: string
  topic: string
}

interface QuizData {
  title: string
  description: string
  questions: QuizQuestion[]
  totalQuestions: number
  estimatedTime: number
}

interface QuizInterfaceProps {
  quiz: QuizData
  quizId: string
}

interface UserAnswer {
  questionId: string
  answer: string
  isCorrect: boolean
  timeSpent: number
}

export default function QuizInterface({ quiz }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [showExplanation, setShowExplanation] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)
  const [startTime] = useState<number>(Date.now())
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())
  const [score, setScore] = useState(0)

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1

  useEffect(() => {
    setQuestionStartTime(Date.now())
  }, [currentQuestionIndex])

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
  }

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return

    const timeSpent = Date.now() - questionStartTime
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer
    
    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      isCorrect,
      timeSpent
    }

    setUserAnswers(prev => [...prev, userAnswer])
    setShowExplanation(true)
    
    if (isCorrect) {
      setScore(prev => prev + 1)
    }
  }

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      setQuizComplete(true)
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer('')
      setShowExplanation(false)
    }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreEmoji = (percentage: number) => {
    if (percentage >= 90) return '🎉'
    if (percentage >= 80) return '😊'
    if (percentage >= 60) return '😐'
    return '😔'
  }

  if (quizComplete) {
    const percentage = Math.round((score / quiz.questions.length) * 100)
    const totalTime = Math.round((Date.now() - startTime) / 1000 / 60)
    
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">{getScoreEmoji(percentage)}</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz abgeschlossen!</h2>
        
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className={`text-4xl font-bold mb-2 ${getScoreColor(percentage)}`}>
            {score} / {quiz.questions.length}
          </div>
          <div className={`text-2xl font-semibold ${getScoreColor(percentage)}`}>
            {percentage}%
          </div>
          <p className="text-gray-600 mt-2">
            Zeit: {totalTime} Minuten
          </p>
        </div>

        {/* Topic Analysis */}
        <div className="text-left">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Deine Leistung nach Themen:</h3>
          {Object.entries(
            userAnswers.reduce((acc, answer) => {
              const question = quiz.questions.find(q => q.id === answer.questionId)!
              if (!acc[question.topic]) {
                acc[question.topic] = { correct: 0, total: 0 }
              }
              acc[question.topic].total++
              if (answer.isCorrect) acc[question.topic].correct++
              return acc
            }, {} as Record<string, { correct: number; total: number }>)
          ).map(([topic, stats]) => (
            <div key={topic} className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">{topic}</span>
              <span className={`font-bold ${getScoreColor((stats.correct / stats.total) * 100)}`}>
                {stats.correct}/{stats.total}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            🔄 Quiz wiederholen
          </button>
          <button
            onClick={() => window.close()}
            className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            ✅ Fertig
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Frage {currentQuestionIndex + 1} von {quiz.questions.length}
          </span>
          <span className="text-sm text-gray-500">
            Thema: {currentQuestion.topic}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {currentQuestion.question}
        </h2>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.options?.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              disabled={showExplanation}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                selectedAnswer === option
                  ? showExplanation
                    ? option === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-blue-500 bg-blue-50'
                  : showExplanation && option === currentQuestion.correctAnswer
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center">
                <span className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
                {showExplanation && option === currentQuestion.correctAnswer && (
                  <span className="ml-auto text-green-600">✓</span>
                )}
                {showExplanation && selectedAnswer === option && option !== currentQuestion.correctAnswer && (
                  <span className="ml-auto text-red-600">✗</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Erklärung:</h3>
          <p className="text-blue-800">{currentQuestion.explanation}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <div className="text-sm text-gray-500">
          Richtige Antworten: {score} / {currentQuestionIndex + (showExplanation ? 1 : 0)}
        </div>
        
        <div className="space-x-3">
          {!showExplanation ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className="bg-blue-500 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Antwort abgeben
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="bg-green-500 text-white py-2 px-6 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              {isLastQuestion ? 'Quiz beenden' : 'Nächste Frage'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}