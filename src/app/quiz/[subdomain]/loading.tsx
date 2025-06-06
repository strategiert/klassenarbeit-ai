export default function QuizLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Quiz wird geladen...</h2>
          <p className="text-gray-600">
            Das Quiz wird gerade vorbereitet. Bitte einen Moment Geduld.
          </p>
        </div>
      </div>
    </div>
  )
}