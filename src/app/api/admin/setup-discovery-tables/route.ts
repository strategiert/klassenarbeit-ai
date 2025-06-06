import { NextRequest, NextResponse } from 'next/server'
import { createAdvancedTables } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Setting up Discovery Path tables...')
    
    // Call the existing createAdvancedTables function which now includes Discovery tables
    await createAdvancedTables()
    
    console.log('✅ Discovery Path tables setup completed!')
    
    return NextResponse.json({
      success: true,
      message: 'Discovery Path tables created successfully',
      tables: [
        'user_discovery_progress',
        'discovery_station_activities'
      ],
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Error setting up Discovery Path tables:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to setup Discovery Path tables',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Allow GET for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST to setup Discovery Path tables',
    endpoint: '/api/admin/setup-discovery-tables',
    method: 'POST'
  })
}