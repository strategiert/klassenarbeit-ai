'use client'

import { useState } from 'react'

export default function AdminDashboard() {
  const [setupStatus, setSetupStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const setupDatabase = async () => {
    setSetupStatus('loading')
    setError('')
    
    try {
      const response = await fetch('/api/admin/setup-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSetupStatus('success')
        setResults(data)
      } else {
        setSetupStatus('error')
        setError(data.error || 'Setup failed')
      }
    } catch (err) {
      setSetupStatus('error')
      setError(err instanceof Error ? err.message : 'Network error')
    }
  }

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch('/api/admin/setup-database')
      const data = await response.json()
      setResults(data)
      setSetupStatus(data.success ? 'success' : 'error')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check status')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">🛠️ KlassenarbeitAI Admin</h1>
          <p className="text-gray-600 mt-2">Live Database Management & Setup</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Database Setup Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            🗄️ Database Setup & Management
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={setupDatabase}
              disabled={setupStatus === 'loading'}
              className="bg-blue-500 text-white p-6 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-2xl mb-2">🚀</div>
              <h3 className="font-semibold mb-2">Complete Database Setup</h3>
              <p className="text-sm opacity-90">
                Creates all tables, security policies, and default data
              </p>
              {setupStatus === 'loading' && (
                <div className="mt-3 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="ml-2">Setting up...</span>
                </div>
              )}
            </button>

            <button
              onClick={checkDatabaseStatus}
              className="bg-green-500 text-white p-6 rounded-xl hover:bg-green-600 transition-colors"
            >
              <div className="text-2xl mb-2">🔍</div>
              <h3 className="font-semibold mb-2">Check Database Status</h3>
              <p className="text-sm opacity-90">
                Verify current database configuration
              </p>
            </button>
          </div>

          {/* Status Display */}
          {setupStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <h3 className="text-green-800 font-semibold mb-3 flex items-center">
                ✅ Database Setup Complete!
              </h3>
              <div className="text-green-700 space-y-2">
                <p>🏗️ All tables created successfully</p>
                <p>🔒 Security policies configured</p>
                <p>🏆 Default achievements loaded</p>
                <p>📊 Analytics system ready</p>
              </div>
            </div>
          )}

          {setupStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <h3 className="text-red-800 font-semibold mb-3">❌ Setup Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Setup Results:</h3>
              <pre className="text-sm text-gray-700 overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="font-semibold text-gray-900 mb-2">User Management</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Teacher/Student roles</li>
              <li>• School organization</li>
              <li>• Class management</li>
              <li>• Learning profiles</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Learning session tracking</li>
              <li>• Performance analytics</li>
              <li>• Class statistics</li>
              <li>• Progress insights</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="font-semibold text-gray-900 mb-2">Gamification</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Achievement system</li>
              <li>• Learning streaks</li>
              <li>• XP & rewards</li>
              <li>• Progress badges</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-semibold text-gray-900 mb-2">Security & Privacy</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Row Level Security</li>
              <li>• Role-based access</li>
              <li>• Data protection</li>
              <li>• GDPR compliance</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Learning</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Adaptive difficulty</li>
              <li>• Learning style detection</li>
              <li>• Personalized paths</li>
              <li>• AI recommendations</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="font-semibold text-gray-900 mb-2">Multi-Platform</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Web application</li>
              <li>• Mobile responsive</li>
              <li>• Cross-device sync</li>
              <li>• Offline support</li>
            </ul>
          </div>
        </div>

        {/* Manual SQL Execution */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">💻 Manual SQL Execution</h2>
          <p className="text-gray-600 mb-4">
            Execute custom SQL commands directly on the database:
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ <strong>Warning:</strong> This executes SQL directly on your production database. 
              Use with caution and ensure you have backups.
            </p>
          </div>

          <SQLExecutor />
        </div>
      </main>
    </div>
  )
}

// SQL Executor Component
function SQLExecutor() {
  const [sql, setSql] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const executeSql = async () => {
    if (!sql.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/admin/execute-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql })
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          SQL Command:
        </label>
        <textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          placeholder="SELECT * FROM user_profiles LIMIT 5;"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
        />
      </div>
      
      <button
        onClick={executeSql}
        disabled={loading || !sql.trim()}
        className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
      >
        {loading ? 'Executing...' : 'Execute SQL'}
      </button>
      
      {result && (
        <div className="bg-gray-50 rounded-lg p-4">
          <pre className="text-sm text-gray-700 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}