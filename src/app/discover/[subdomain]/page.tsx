import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DiscoveryExplorer from '@/components/DiscoveryExplorer'

interface DiscoveryPageProps {
  params: Promise<{ subdomain: string }>
}

async function getDiscoveryPath(subdomain: string) {
  const { data, error } = await supabase
    .from('klassenarbeiten')
    .select('*')
    .eq('subdomain', subdomain)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function DiscoveryPage({ params }: DiscoveryPageProps) {
  const { subdomain } = await params
  const discoveryData = await getDiscoveryPath(subdomain)

  if (!discoveryData || discoveryData.quiz_data?.type !== 'discovery_path') {
    notFound()
  }

  const discoveryPath = discoveryData.quiz_data

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{discoveryPath.title}</h1>
              <p className="text-gray-600 mt-1">{discoveryPath.description}</p>
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
        />
      </main>
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: DiscoveryPageProps) {
  const { subdomain } = await params
  const discoveryData = await getDiscoveryPath(subdomain)

  if (!discoveryData) {
    return {
      title: 'Lernreise nicht gefunden',
    }
  }

  return {
    title: discoveryData.quiz_data?.title || 'Lernreise',
    description: discoveryData.quiz_data?.description || 'Entdecke Wissen auf spielerische Art',
  }
}