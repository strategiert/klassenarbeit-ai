'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DebugData {
  environment?: any
  subdomain_data?: any
  error?: string
}

export default function DebugPage() {
  const [environmentData, setEnvironmentData] = useState<any>(null)
  const [subdomainInput, setSubdomainInput] = useState('')
  const [subdomainData, setSubdomainData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Load environment data on mount
  useEffect(() => {
    loadEnvironmentData()
  }, [])

  const loadEnvironmentData = async () => {
    try {
      const response = await fetch('/api/debug/environment')
      const data = await response.json()
      setEnvironmentData(data)
    } catch (error) {
      console.error('Failed to load environment data:', error)
    }
  }

  const loadSubdomainData = async () => {
    if (!subdomainInput.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/debug/${subdomainInput}`)
      const data = await response.json()
      setSubdomainData(data)
    } catch (error) {
      console.error('Failed to load subdomain data:', error)
      setSubdomainData({ error: error.message })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🔧 KlassenarbeitAI Debug Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Link href="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              ← Zurück zur App
            </Link>
            <button 
              onClick={loadEnvironmentData}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              🔄 Environment neu laden
            </button>
          </div>
        </div>

        {/* Environment Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🌍 Environment Status</h2>
          
          {environmentData ? (
            <div className="space-y-4">
              {/* Health Check */}
              <div className={`p-4 rounded-lg ${
                environmentData.health_check?.overall 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className="font-semibold mb-2">
                  {environmentData.health_check?.overall ? '✅ System OK' : '❌ Issues Detected'}
                </h3>
                {environmentData.health_check?.issues?.length > 0 && (
                  <ul className="text-sm text-red-700 list-disc list-inside">
                    {environmentData.health_check.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* API Keys */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-semibold mb-2">🔑 DeepSeek API</h4>
                  <p>Configured: {environmentData.environment?.api_keys?.deepseek?.configured ? '✅' : '❌'}</p>
                  <p>Length: {environmentData.environment?.api_keys?.deepseek?.key_length || 0}</p>
                  <p>Accessible: {environmentData.environment?.connectivity_tests?.deepseek?.accessible ? '✅' : '❌'}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-semibold mb-2">🗄️ Supabase</h4>
                  <p>Connected: {environmentData.environment?.connectivity_tests?.supabase?.connected ? '✅' : '❌'}</p>
                  <p>URL: {environmentData.environment?.api_keys?.supabase?.url_configured ? '✅' : '❌'}</p>
                  <p>Keys: {environmentData.environment?.api_keys?.supabase?.service_key_configured ? '✅' : '❌'}</p>
                </div>
              </div>

              {/* Recent Stats */}
              {environmentData.environment?.recent_processing_stats && (
                <div className="bg-blue-50 p-4 rounded">
                  <h4 className="font-semibold mb-2">📊 Recent Processing Stats</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>Total: {environmentData.environment.recent_processing_stats.total_recent}</div>
                    <div>Research ✅: {environmentData.environment.recent_processing_stats.research_completed}</div>
                    <div>Research ❌: {environmentData.environment.recent_processing_stats.research_failed}</div>
                    <div>Generation ✅: {environmentData.environment.recent_processing_stats.generation_completed}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Loading environment data...</div>
          )}
        </div>

        {/* Subdomain Inspector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🔍 Subdomain Inspector</h2>
          
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              value={subdomainInput}
              onChange={(e) => setSubdomainInput(e.target.value)}
              placeholder="Subdomain eingeben (z.B. 4d6ngvmbkv2614)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={loadSubdomainData}
              disabled={loading || !subdomainInput.trim()}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '🔄' : '🔍'} Analysieren
            </button>
          </div>

          {subdomainData && (
            <div className="mt-6 space-y-4">
              {subdomainData.success ? (
                <>
                  {/* Basic Info */}
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="font-semibold mb-2">ℹ️ Basic Info</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>ID: {subdomainData.analysis?.basic_info?.id}</div>
                      <div>Title: {subdomainData.analysis?.basic_info?.title}</div>
                      <div>Active: {subdomainData.analysis?.basic_info?.is_active ? '✅' : '❌'}</div>
                      <div>Views: {subdomainData.analysis?.basic_info?.views_count || 0}</div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="bg-yellow-50 p-4 rounded">
                    <h4 className="font-semibold mb-2">🎯 Status</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Research: <span className={`px-2 py-1 rounded text-xs ${
                        subdomainData.analysis?.status_info?.research_status === 'completed' ? 'bg-green-200' : 
                        subdomainData.analysis?.status_info?.research_status === 'failed' ? 'bg-red-200' : 'bg-yellow-200'
                      }`}>{subdomainData.analysis?.status_info?.research_status}</span></div>
                      <div>Generation: <span className={`px-2 py-1 rounded text-xs ${
                        subdomainData.analysis?.status_info?.quiz_generation_status === 'completed' ? 'bg-green-200' : 
                        subdomainData.analysis?.status_info?.quiz_generation_status === 'failed' ? 'bg-red-200' : 'bg-yellow-200'
                      }`}>{subdomainData.analysis?.status_info?.quiz_generation_status}</span></div>
                    </div>
                  </div>

                  {/* Content Analysis */}
                  <div className="bg-purple-50 p-4 rounded">
                    <h4 className="font-semibold mb-2">📄 Content Analysis</h4>
                    <div className="text-sm space-y-1">
                      <div>Original Content: {subdomainData.analysis?.content_analysis?.original_content_length} chars</div>
                      <div>Has Research Data: {subdomainData.analysis?.content_analysis?.has_research_data ? '✅' : '❌'}</div>
                      <div>Has Quiz Data: {subdomainData.analysis?.content_analysis?.has_quiz_data ? '✅' : '❌'}</div>
                      {subdomainData.analysis?.content_analysis?.original_content_preview && (
                        <div className="mt-2 p-2 bg-white rounded text-xs">
                          <strong>Preview:</strong> {subdomainData.analysis.content_analysis.original_content_preview}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Research Data Details */}
                  {subdomainData.analysis?.research_data_details && (
                    <div className="bg-green-50 p-4 rounded">
                      <h4 className="font-semibold mb-2">🧠 Research Data</h4>
                      <div className="text-sm space-y-1">
                        <div>Questions: {subdomainData.analysis.research_data_details.quiz_questions_count || 0}</div>
                        <div>Key Facts: {subdomainData.analysis.research_data_details.key_facts_count || 0}</div>
                        <div>Interactive Elements: {subdomainData.analysis.research_data_details.interactive_elements_count || 0}</div>
                        <div>Additional Topics: {subdomainData.analysis.research_data_details.additional_topics?.join(', ') || 'None'}</div>
                        {subdomainData.analysis.research_data_details.summary && (
                          <div className="mt-2 p-2 bg-white rounded text-xs">
                            <strong>Summary:</strong> {subdomainData.analysis.research_data_details.summary}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Debug Recommendations */}
                  {subdomainData.debug_recommendations?.length > 0 && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded">
                      <h4 className="font-semibold mb-2">⚠️ Issues Found</h4>
                      <ul className="text-sm text-red-700 list-disc list-inside">
                        {subdomainData.debug_recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Raw Data Toggle */}
                  <details className="bg-gray-100 p-4 rounded">
                    <summary className="font-semibold cursor-pointer">🔧 Raw Data (click to expand)</summary>
                    <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-96">
                      {JSON.stringify(subdomainData.analysis?.full_raw_data?.complete_record, null, 2)}
                    </pre>
                  </details>
                </>
              ) : (
                <div className="bg-red-50 border border-red-200 p-4 rounded">
                  <h4 className="font-semibold text-red-700">❌ Error</h4>
                  <p className="text-red-600">{subdomainData.error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/api/debug/environment" 
              target="_blank"
              className="bg-blue-100 hover:bg-blue-200 p-4 rounded text-center"
            >
              🌍 Environment JSON
            </a>
            <a 
              href="/api/status/4d6ngvmbkv2614" 
              target="_blank"
              className="bg-green-100 hover:bg-green-200 p-4 rounded text-center"
            >
              📊 Live Status API
            </a>
            <a 
              href="/admin" 
              className="bg-purple-100 hover:bg-purple-200 p-4 rounded text-center"
            >
              🛠️ Admin Panel
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}