import { NextRequest, NextResponse } from 'next/server'
import { execSQL } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { sql } = await request.json()
    
    if (!sql || typeof sql !== 'string') {
      return NextResponse.json(
        { success: false, error: 'SQL query is required' },
        { status: 400 }
      )
    }

    console.log('🔧 Executing SQL:', sql.substring(0, 100) + '...')
    
    const result = await execSQL(sql)
    
    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ SQL execution error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}