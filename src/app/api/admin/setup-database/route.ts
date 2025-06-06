import { NextRequest, NextResponse } from 'next/server'
import { 
  createAdvancedTables, 
  setupAdvancedSecurity, 
  createDefaultAchievements,
  execSQL
} from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting automatic database setup...')
    
    // 1. First create the exec_sql function in Supabase
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
      RETURNS text
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql_query;
        RETURN 'Success';
      EXCEPTION
        WHEN OTHERS THEN
          RETURN 'Error: ' || SQLERRM;
      END;
      $$;
    `

    // Execute this first manually or via direct SQL
    console.log('📝 Creating exec_sql function...')
    
    // 2. Setup the database schema
    console.log('🏗️ Creating advanced tables...')
    const tablesResult = await createAdvancedTables()
    
    if (!tablesResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create tables: ' + tablesResult.error
      }, { status: 500 })
    }

    // 3. Setup security policies
    console.log('🔒 Setting up security...')
    const securityResult = await setupAdvancedSecurity()
    
    if (!securityResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to setup security: ' + securityResult.error
      }, { status: 500 })
    }

    // 4. Create default achievements
    console.log('🏆 Creating achievements...')
    const achievementsResult = await createDefaultAchievements()
    
    if (!achievementsResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create achievements: ' + achievementsResult.error
      }, { status: 500 })
    }

    console.log('✅ Database setup complete!')

    return NextResponse.json({
      success: true,
      message: 'KlassenarbeitAI database fully configured!',
      results: {
        tables: tablesResult,
        security: securityResult,
        achievements: achievementsResult
      }
    })

  } catch (error) {
    console.error('❌ Database setup error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Also add a GET endpoint to check database status
export async function GET() {
  try {
    // Check if our tables exist
    const checkTablesSQL = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user_profiles', 'schools', 'classes', 'learning_sessions', 'achievements');
    `
    
    const result = await execSQL(checkTablesSQL)
    
    return NextResponse.json({
      success: true,
      database_status: 'connected',
      custom_tables: result.data || [],
      message: 'Database is ready for KlassenarbeitAI!'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}