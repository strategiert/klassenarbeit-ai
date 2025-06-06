import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-admin'

// Get user progress for a Discovery Path
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const klassenarbeitId = searchParams.get('klassenarbeitId')
    const discoveryPathId = searchParams.get('discoveryPathId')
    
    if (!userId || !klassenarbeitId) {
      return NextResponse.json(
        { error: 'userId and klassenarbeitId are required' },
        { status: 400 }
      )
    }
    
    const supabase = createClient()
    
    // Get user progress
    const { data: progress, error } = await supabase
      .from('user_discovery_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('klassenarbeit_id', klassenarbeitId)
      .maybeSingle()
    
    if (error) {
      console.error('Error fetching discovery progress:', error)
      return NextResponse.json(
        { error: 'Failed to fetch progress' },
        { status: 500 }
      )
    }
    
    // Get recent station activities
    const { data: activities } = await supabase
      .from('discovery_station_activities')
      .select('*')
      .eq('user_id', userId)
      .eq('progress_id', progress?.id)
      .order('created_at', { ascending: false })
      .limit(10)
    
    return NextResponse.json({
      success: true,
      progress: progress || null,
      recentActivities: activities || [],
      hasProgress: !!progress
    })
    
  } catch (error) {
    console.error('Discovery progress GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create or update user progress
export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      klassenarbeitId,
      discoveryPathId,
      currentObjectiveIndex,
      currentStationIndex,
      currentObjectiveId,
      currentStationId,
      completedObjectives,
      completedStations,
      stationProgress,
      progressPercentage,
      status,
      learningStyle
    } = await request.json()
    
    if (!userId || !klassenarbeitId || !discoveryPathId) {
      return NextResponse.json(
        { error: 'userId, klassenarbeitId, and discoveryPathId are required' },
        { status: 400 }
      )
    }
    
    const supabase = createClient()
    
    // Upsert progress record
    const { data: progress, error } = await supabase
      .from('user_discovery_progress')
      .upsert({
        user_id: userId,
        klassenarbeit_id: klassenarbeitId,
        discovery_path_id: discoveryPathId,
        current_objective_index: currentObjectiveIndex || 0,
        current_station_index: currentStationIndex || 0,
        current_objective_id: currentObjectiveId,
        current_station_id: currentStationId,
        completed_objectives: completedObjectives || [],
        completed_stations: completedStations || [],
        station_progress: stationProgress || {},
        progress_percentage: progressPercentage || 0,
        stations_completed_count: (completedStations || []).length,
        objectives_completed_count: (completedObjectives || []).length,
        status: status || 'started',
        learning_style_at_start: learningStyle,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,klassenarbeit_id,discovery_path_id'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error updating discovery progress:', error)
      return NextResponse.json(
        { error: 'Failed to update progress', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      progress,
      message: 'Progress updated successfully'
    })
    
  } catch (error) {
    console.error('Discovery progress POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Track station activity
export async function PUT(request: NextRequest) {
  try {
    const {
      userId,
      progressId,
      stationId,
      stationType,
      objectiveId,
      stationTitle,
      timeSpentSeconds,
      interactionsCount,
      correctAnswers,
      totalAnswers,
      activityData,
      difficultyRating,
      confidenceLevel,
      helpRequested,
      completionStatus,
      scorePercentage
    } = await request.json()
    
    if (!userId || !progressId || !stationId) {
      return NextResponse.json(
        { error: 'userId, progressId, and stationId are required' },
        { status: 400 }
      )
    }
    
    const supabase = createClient()
    
    // Create station activity record
    const { data: activity, error } = await supabase
      .from('discovery_station_activities')
      .insert({
        user_id: userId,
        progress_id: progressId,
        station_id: stationId,
        station_type: stationType,
        objective_id: objectiveId,
        station_title: stationTitle,
        time_spent_seconds: timeSpentSeconds,
        interactions_count: interactionsCount,
        correct_answers: correctAnswers,
        total_answers: totalAnswers,
        activity_data: activityData || {},
        difficulty_rating: difficultyRating,
        confidence_level: confidenceLevel,
        help_requested: helpRequested || false,
        completion_status: completionStatus || 'started',
        score_percentage: scorePercentage,
        completed_at: completionStatus === 'completed' ? new Date().toISOString() : null
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating station activity:', error)
      return NextResponse.json(
        { error: 'Failed to track station activity', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      activity,
      message: 'Station activity tracked successfully'
    })
    
  } catch (error) {
    console.error('Discovery station activity PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}