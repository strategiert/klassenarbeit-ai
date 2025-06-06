// Supabase Admin SDK für automatische Datenbank-Operationen
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Admin client mit Service Role Key - kann ALLES!
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database Schema Management
export async function createAdvancedTables() {
  console.log('🏗️ Setting up advanced database schema...')
  
  try {
    // 1. Users & Roles System
    const userManagementSQL = `
      -- Create enhanced user profiles
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID REFERENCES auth.users(id) PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- Basic Info
        email TEXT UNIQUE NOT NULL,
        full_name TEXT,
        avatar_url TEXT,
        
        -- Role System
        role TEXT CHECK (role IN ('teacher', 'student', 'admin', 'school_admin')) DEFAULT 'student',
        
        -- School Organization
        school_id UUID REFERENCES schools(id),
        class_ids UUID[] DEFAULT '{}',
        
        -- Learning Profile
        learning_style TEXT CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'mixed')) DEFAULT 'mixed',
        strengths TEXT[] DEFAULT '{}',
        weaknesses TEXT[] DEFAULT '{}',
        
        -- Analytics
        total_quizzes_completed INTEGER DEFAULT 0,
        total_learning_time_minutes INTEGER DEFAULT 0,
        average_score DECIMAL(5,2) DEFAULT 0.0,
        
        -- Preferences
        preferred_language TEXT DEFAULT 'de',
        notifications_enabled BOOLEAN DEFAULT true,
        
        -- Status
        is_active BOOLEAN DEFAULT true,
        last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Schools Management
      CREATE TABLE IF NOT EXISTS schools (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        name TEXT NOT NULL,
        address TEXT,
        city TEXT,
        country TEXT DEFAULT 'Germany',
        website TEXT,
        
        -- Subscription Info
        subscription_tier TEXT CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise')) DEFAULT 'free',
        max_teachers INTEGER DEFAULT 5,
        max_students INTEGER DEFAULT 100,
        
        -- Settings
        settings JSONB DEFAULT '{}',
        
        is_active BOOLEAN DEFAULT true
      );

      -- Classes Management  
      CREATE TABLE IF NOT EXISTS classes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        name TEXT NOT NULL,
        description TEXT,
        school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
        teacher_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        
        -- Class Info
        subject TEXT,
        grade_level TEXT,
        academic_year TEXT,
        
        -- Settings
        invite_code TEXT UNIQUE,
        max_students INTEGER DEFAULT 30,
        
        is_active BOOLEAN DEFAULT true
      );
    `

    await supabaseAdmin.rpc('exec_sql', { sql: userManagementSQL })
    console.log('✅ User management tables created')

    // 2. Enhanced Learning Analytics
    const analyticsSQL = `
      -- Learning Sessions Tracking
      CREATE TABLE IF NOT EXISTS learning_sessions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        klassenarbeit_id UUID REFERENCES klassenarbeiten(id) ON DELETE CASCADE,
        session_type TEXT CHECK (session_type IN ('quiz', 'discovery_path', 'explanation', 'practice')),
        
        -- Session Data
        start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        end_time TIMESTAMP WITH TIME ZONE,
        duration_minutes INTEGER,
        
        -- Results
        score DECIMAL(5,2),
        max_score DECIMAL(5,2),
        completion_percentage DECIMAL(5,2),
        
        -- Detailed Analytics
        questions_attempted INTEGER DEFAULT 0,
        questions_correct INTEGER DEFAULT 0,
        time_per_question JSONB DEFAULT '{}',
        difficulty_performance JSONB DEFAULT '{}',
        
        -- Learning Insights
        strengths_demonstrated TEXT[] DEFAULT '{}',
        areas_for_improvement TEXT[] DEFAULT '{}',
        recommended_next_steps TEXT[] DEFAULT '{}',
        
        -- Technical
        device_type TEXT,
        browser_info TEXT,
        ip_address INET
      );

      -- Teacher Dashboard Analytics
      CREATE TABLE IF NOT EXISTS class_analytics (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
        klassenarbeit_id UUID REFERENCES klassenarbeiten(id) ON DELETE CASCADE,
        
        -- Class Performance
        total_attempts INTEGER DEFAULT 0,
        average_score DECIMAL(5,2) DEFAULT 0.0,
        completion_rate DECIMAL(5,2) DEFAULT 0.0,
        
        -- Difficulty Analysis
        easy_questions_avg DECIMAL(5,2) DEFAULT 0.0,
        medium_questions_avg DECIMAL(5,2) DEFAULT 0.0,
        hard_questions_avg DECIMAL(5,2) DEFAULT 0.0,
        
        -- Common Issues
        frequently_missed_topics TEXT[] DEFAULT '{}',
        common_misconceptions TEXT[] DEFAULT '{}',
        
        -- Time Analytics
        average_completion_time INTEGER DEFAULT 0,
        fastest_completion INTEGER DEFAULT 0,
        slowest_completion INTEGER DEFAULT 0,
        
        -- Last Updated
        last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    await supabaseAdmin.rpc('exec_sql', { sql: analyticsSQL })
    console.log('✅ Analytics tables created')

    // 3. Gamification System
    const gamificationSQL = `
      -- Achievement System
      CREATE TABLE IF NOT EXISTS achievements (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        name TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        icon TEXT DEFAULT '🏆',
        category TEXT CHECK (category IN ('learning', 'streaks', 'mastery', 'social', 'exploration')) DEFAULT 'learning',
        
        -- Requirements
        requirement_type TEXT CHECK (requirement_type IN ('quiz_count', 'score_average', 'streak_days', 'discovery_paths', 'time_spent')),
        requirement_value INTEGER NOT NULL,
        
        -- Rewards
        xp_reward INTEGER DEFAULT 0,
        badge_color TEXT DEFAULT '#3B82F6',
        
        -- Visibility
        is_active BOOLEAN DEFAULT true,
        unlock_level INTEGER DEFAULT 1
      );

      -- User Achievements
      CREATE TABLE IF NOT EXISTS user_achievements (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
        
        -- Progress
        current_progress INTEGER DEFAULT 0,
        is_completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP WITH TIME ZONE,
        
        UNIQUE(user_id, achievement_id)
      );

      -- Learning Streaks
      CREATE TABLE IF NOT EXISTS learning_streaks (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
        
        -- Current Streak
        current_streak_days INTEGER DEFAULT 0,
        last_activity_date DATE DEFAULT CURRENT_DATE,
        
        -- All Time Records
        longest_streak_days INTEGER DEFAULT 0,
        total_active_days INTEGER DEFAULT 0,
        
        -- Weekly Goals
        weekly_goal_minutes INTEGER DEFAULT 60,
        current_week_minutes INTEGER DEFAULT 0,
        week_start_date DATE DEFAULT CURRENT_DATE
      );
    `

    await supabaseAdmin.rpc('exec_sql', { sql: gamificationSQL })
    console.log('✅ Gamification tables created')

    return { success: true, message: 'All tables created successfully!' }

  } catch (error) {
    console.error('❌ Error creating tables:', error)
    return { success: false, error: error.message }
  }
}

// Row Level Security Policies
export async function setupAdvancedSecurity() {
  console.log('🔒 Setting up advanced security policies...')
  
  const securitySQL = `
    -- Enable RLS on all tables
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
    ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE class_analytics ENABLE ROW LEVEL SECURITY;
    ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
    ALTER TABLE learning_streaks ENABLE ROW LEVEL SECURITY;

    -- User Profiles Policies
    CREATE POLICY "Users can view own profile" ON user_profiles
      FOR SELECT USING (auth.uid() = id);
    
    CREATE POLICY "Users can update own profile" ON user_profiles
      FOR UPDATE USING (auth.uid() = id);
    
    CREATE POLICY "Teachers can view students in their classes" ON user_profiles
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM classes 
          WHERE teacher_id = auth.uid() 
          AND user_profiles.id = ANY(
            SELECT unnest(class_ids)
          )
        )
      );

    -- Classes Policies
    CREATE POLICY "Teachers can manage own classes" ON classes
      FOR ALL USING (teacher_id = auth.uid());
    
    CREATE POLICY "Students can view their classes" ON classes
      FOR SELECT USING (
        id = ANY(
          SELECT unnest(class_ids) FROM user_profiles 
          WHERE user_profiles.id = auth.uid()
        )
      );

    -- Learning Sessions Policies
    CREATE POLICY "Users can manage own sessions" ON learning_sessions
      FOR ALL USING (user_id = auth.uid());
    
    CREATE POLICY "Teachers can view class sessions" ON learning_sessions
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM classes c
          JOIN user_profiles up ON up.id = learning_sessions.user_id
          WHERE c.teacher_id = auth.uid()
          AND c.id = ANY(up.class_ids)
        )
      );

    -- Achievements are public read
    CREATE POLICY "Anyone can view achievements" ON achievements
      FOR SELECT USING (is_active = true);

    -- User achievements are private
    CREATE POLICY "Users can manage own achievements" ON user_achievements
      FOR ALL USING (user_id = auth.uid());

    -- Learning streaks are private
    CREATE POLICY "Users can manage own streaks" ON learning_streaks
      FOR ALL USING (user_id = auth.uid());
  `

  try {
    await supabaseAdmin.rpc('exec_sql', { sql: securitySQL })
    console.log('✅ Security policies created')
    return { success: true }
  } catch (error) {
    console.error('❌ Error setting up security:', error)
    return { success: false, error: error.message }
  }
}

// Create default achievements
export async function createDefaultAchievements() {
  console.log('🏆 Creating default achievements...')
  
  const achievements = [
    {
      name: 'Erste Schritte',
      description: 'Dein erstes Quiz erfolgreich abgeschlossen!',
      icon: '🎯',
      category: 'learning',
      requirement_type: 'quiz_count',
      requirement_value: 1,
      xp_reward: 50
    },
    {
      name: 'Quiz Master',
      description: '10 Quizzes erfolgreich abgeschlossen',
      icon: '🧠',
      category: 'learning', 
      requirement_type: 'quiz_count',
      requirement_value: 10,
      xp_reward: 200
    },
    {
      name: 'Perfektionist',
      description: 'Durchschnittliche Punktzahl von 90% erreicht',
      icon: '⭐',
      category: 'mastery',
      requirement_type: 'score_average',
      requirement_value: 90,
      xp_reward: 300
    },
    {
      name: 'Entdecker',
      description: 'Erste Discovery-Lernreise abgeschlossen',
      icon: '🗺️',
      category: 'exploration',
      requirement_type: 'discovery_paths',
      requirement_value: 1,
      xp_reward: 100
    },
    {
      name: 'Wissenssammler',
      description: '5 Discovery-Lernreisen erfolgreich erkundet',
      icon: '🎒',
      category: 'exploration',
      requirement_type: 'discovery_paths', 
      requirement_value: 5,
      xp_reward: 250
    },
    {
      name: 'Ausdauer-Champion',
      description: '7 Tage hintereinander gelernt',
      icon: '🔥',
      category: 'streaks',
      requirement_type: 'streak_days',
      requirement_value: 7,
      xp_reward: 400
    }
  ]

  try {
    const { data, error } = await supabaseAdmin
      .from('achievements')
      .upsert(achievements, { onConflict: 'name' })

    if (error) throw error

    console.log('✅ Default achievements created:', data?.length)
    return { success: true, count: data?.length }
  } catch (error) {
    console.error('❌ Error creating achievements:', error)
    return { success: false, error: error.message }
  }
}

// Execute SQL directly
export async function execSQL(sql: string) {
  try {
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql })
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('❌ SQL execution error:', error)
    return { success: false, error: error.message }
  }
}