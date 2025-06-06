import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-admin'
import DiscoveryExplorer from '@/components/DiscoveryExplorer'
import { getSubjectTheme } from '@/lib/subject-themes'

interface DiscoveryPageProps {
  params: Promise<{ subdomain: string }>
}

async function getDiscoveryPath(subdomain: string) {
  const supabase = createClient()
  
  try {
    const { data: discovery, error } = await supabase
      .from('klassenarbeiten')
      .select('*')
      .eq('subdomain', subdomain)
      .eq('is_active', true)
      .single()

    if (error || !discovery) {
      console.error('Discovery not found:', error)
      return { status: 'not_found', discovery: null }
    }

    // FALLBACK CHECKING: Check if status fields exist, otherwise assume completed if quiz_data exists
    const hasStatusFields = discovery.research_status !== undefined && discovery.quiz_generation_status !== undefined
    
    if (hasStatusFields) {
      // If status fields exist, use strict checking
      if (discovery.research_status !== 'completed' || discovery.quiz_generation_status !== 'completed') {
        console.log(`Discovery not ready: research=${discovery.research_status}, generation=${discovery.quiz_generation_status}`)
        return { 
          status: 'not_ready', 
          discovery: null,
          research_status: discovery.research_status,
          quiz_generation_status: discovery.quiz_generation_status,
          title: discovery.title,
          subdomain: discovery.subdomain
        }
      }
    } else {
      // Fallback: If no status fields, check if quiz_data exists and is complete
      if (!discovery.quiz_data || !discovery.quiz_data.stations || discovery.quiz_data.stations.length === 0) {
        console.log('Discovery not ready: no complete quiz_data found')
        return { 
          status: 'not_ready', 
          discovery: null,
          research_status: 'unknown',
          quiz_generation_status: 'unknown',
          title: discovery.title,
          subdomain: discovery.subdomain
        }
      }
    }

    // Additional check: quiz_data must exist and be valid
    if (!discovery.quiz_data || typeof discovery.quiz_data !== 'object') {
      console.error('Invalid quiz_data')
      return { status: 'not_ready', discovery: null }
    }

    // Check if this is an AI-generated tool
    if (discovery.quiz_data.type === 'ai_generated_tool') {
      console.log('✅ AI-generated interactive tool detected')
      console.log('🤖 Tool stats:', {
        uniqueInteractions: discovery.quiz_data.aiTool?.interactiveElements?.length || 0,
        subject: discovery.quiz_data.aiTool?.subject,
        customComponents: discovery.quiz_data.aiTool?.customComponents?.length || 0
      })
    }

    // Increment view count only for fully ready discoveries
    await supabase
      .from('klassenarbeiten')
      .update({ views_count: discovery.views_count + 1 })
      .eq('id', discovery.id)

    return { status: 'ready', discovery }
  } catch (error) {
    console.error('Error fetching discovery:', error)
    return { status: 'error', discovery: null }
  }
}

export default async function DiscoveryPage({ params }: DiscoveryPageProps) {
  const { subdomain } = await params
  const result = await getDiscoveryPath(subdomain)

  // Handle different states
  if (result.status === 'not_found') {
    notFound()
  }

  if (result.status === 'not_ready') {
    // Show "Still Processing" page instead of 404
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-6xl mb-6">🗺️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lernreise wird noch erstellt</h2>
          <p className="text-gray-600 mb-6">
            "{result.title}" ist noch nicht bereit. Unsere KI arbeitet gerade an hochwertigen, 
            fachspezifischen Inhalten für deine Lernreise.
          </p>
          
          <div className="space-y-3 mb-6">
            <div className={`flex items-center space-x-3 p-2 rounded ${
              result.research_status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
            }`}>
              <span>{result.research_status === 'completed' ? '✅' : '🔄'}</span>
              <span className="text-sm">DeepSeek AI Forschung</span>
            </div>
            <div className={`flex items-center space-x-3 p-2 rounded ${
              result.quiz_generation_status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
            }`}>
              <span>{result.quiz_generation_status === 'completed' ? '✅' : '🔄'}</span>
              <span className="text-sm">Lernreise Generierung</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <a
              href={`/discover/${result.subdomain}`}
              className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-600 transition-colors text-center block"
            >
              🔄 Status aktualisieren
            </a>
            <a
              href={`/api/status/${result.subdomain}`}
              target="_blank"
              className="inline-block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              📊 Live-Status verfolgen
            </a>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            💡 Tipp: Lass diese Seite offen und aktualisiere gelegentlich den Status
          </p>
        </div>
      </div>
    )
  }

  if (result.status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-6xl mb-6">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Fehler aufgetreten</h2>
          <p className="text-gray-600 mb-6">
            Beim Laden der Lernreise ist ein Fehler aufgetreten. Bitte versuche es erneut.
          </p>
          <a
            href="/"
            className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-600 transition-colors text-center block"
          >
            🏠 Zur Startseite
          </a>
        </div>
      </div>
    )
  }

  // Only render discovery if fully ready
  const discoveryData = result.discovery!
  
  console.log('🔍 Discovery Data:', discoveryData)
  console.log('🔍 Quiz Data:', discoveryData.quiz_data)
  
  const discoveryPath = discoveryData.quiz_data
  
  // Get theme for dynamic styling (with safe fallback)
  const theme = getSubjectTheme(discoveryData?.content || '', discoveryPath?.title || '')

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme?.backgroundGradient || 'from-indigo-50 via-blue-50 to-purple-100'}`}>
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {theme?.headerIcon || '🎓'} {discoveryPath?.title || 'Lernreise'}
              </h1>
              <p className="text-gray-600 mt-1">{discoveryPath?.description || ''}</p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {discoveryPath.objectives?.length || 0} Lernziele
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {discoveryPath.stations?.length || 0} Stationen
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                ~{discoveryPath.estimatedTotalTime || 0} Min
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Discovery Explorer */}
      <main className="container mx-auto px-4 py-8">
        <DiscoveryExplorer 
          discoveryPath={discoveryPath} 
          pathId={discoveryData.id}
          content={discoveryData.content}
        />
      </main>
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: DiscoveryPageProps) {
  const { subdomain } = await params
  const result = await getDiscoveryPath(subdomain)

  if (result.status !== 'ready' || !result.discovery) {
    return {
      title: 'Lernreise nicht gefunden',
    }
  }

  return {
    title: result.discovery.quiz_data?.title || 'Lernreise',
    description: result.discovery.quiz_data?.description || 'Entdecke Wissen auf spielerische Art',
  }
}