-- KlassenarbeitAI Database Schema
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create the main table for storing klassenarbeiten and quizzes
CREATE TABLE IF NOT EXISTS klassenarbeiten (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Basic info
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    subdomain TEXT UNIQUE NOT NULL,
    
    -- Research data (stored from initial processing)
    research_data JSONB,
    research_status TEXT DEFAULT 'pending' CHECK (research_status IN ('pending', 'processing', 'completed', 'failed')),
    research_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Generated quiz data (JSON)
    quiz_data JSONB,
    quiz_generation_status TEXT DEFAULT 'pending' CHECK (quiz_generation_status IN ('pending', 'processing', 'completed', 'failed')),
    quiz_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Processing errors
    error_message TEXT,
    
    -- Metadata
    views_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create index for faster subdomain lookups
CREATE INDEX IF NOT EXISTS idx_klassenarbeiten_subdomain ON klassenarbeiten(subdomain);
CREATE INDEX IF NOT EXISTS idx_klassenarbeiten_teacher ON klassenarbeiten(teacher_id);
CREATE INDEX IF NOT EXISTS idx_klassenarbeiten_created ON klassenarbeiten(created_at DESC);

-- Indexes for research-first architecture
CREATE INDEX IF NOT EXISTS idx_klassenarbeiten_research_status ON klassenarbeiten(research_status);
CREATE INDEX IF NOT EXISTS idx_klassenarbeiten_quiz_status ON klassenarbeiten(quiz_generation_status);
CREATE INDEX IF NOT EXISTS idx_klassenarbeiten_processing ON klassenarbeiten(research_status, quiz_generation_status);

-- Optional: Create table for tracking quiz attempts (for analytics)
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- References
    klassenarbeit_id UUID REFERENCES klassenarbeiten(id) ON DELETE CASCADE,
    
    -- Student info (optional, could be anonymous)
    student_name TEXT,
    student_email TEXT,
    
    -- Results
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    time_spent_seconds INTEGER,
    answers JSONB NOT NULL,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT
);

-- Create index for quiz attempts
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_klassenarbeit ON quiz_attempts(klassenarbeit_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created ON quiz_attempts(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE klassenarbeiten ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for klassenarbeiten
-- Allow public read access to active quizzes that have completed quiz generation
CREATE POLICY "Public can view active completed klassenarbeiten" ON klassenarbeiten
    FOR SELECT USING (is_active = true AND quiz_generation_status = 'completed');

-- Allow anyone to insert new klassenarbeiten (for now - you might want to restrict this)
CREATE POLICY "Anyone can create klassenarbeiten" ON klassenarbeiten
    FOR INSERT WITH CHECK (true);

-- Allow teachers to update their own klassenarbeiten
CREATE POLICY "Teachers can update own klassenarbeiten" ON klassenarbeiten
    FOR UPDATE USING (teacher_id = current_setting('app.current_user_id', true));

-- RLS Policies for quiz_attempts
-- Allow public insert (students taking quizzes)
CREATE POLICY "Anyone can create quiz attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (true);

-- Allow viewing attempts for the klassenarbeit owner
CREATE POLICY "Teachers can view attempts for their klassenarbeiten" ON quiz_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM klassenarbeiten k 
            WHERE k.id = quiz_attempts.klassenarbeit_id 
            AND k.teacher_id = current_setting('app.current_user_id', true)
        )
    );

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_klassenarbeiten_updated_at 
    BEFORE UPDATE ON klassenarbeiten 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(quiz_subdomain TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE klassenarbeiten 
    SET views_count = views_count + 1 
    WHERE subdomain = quiz_subdomain;
END;
$$ LANGUAGE plpgsql;

-- Insert some demo data (optional)
INSERT INTO klassenarbeiten (title, content, teacher_id, subdomain, quiz_data) VALUES
(
    'Demo Quiz - Mathematik',
    'Thema: Quadratische Funktionen\nInhalt: Berechnung von Nullstellen, Scheitelpunkt und Funktionsgleichungen.',
    'demo-teacher',
    'demo-math-quiz',
    '{
        "title": "Quiz: Quadratische Funktionen",
        "description": "Teste dein Wissen über quadratische Funktionen",
        "questions": [
            {
                "id": "q1",
                "question": "Was ist die allgemeine Form einer quadratischen Funktion?",
                "type": "multiple-choice",
                "options": ["ax² + bx + c", "ax + b", "ax³ + bx² + cx + d", "a/x + b"],
                "correctAnswer": "ax² + bx + c",
                "explanation": "Die allgemeine Form einer quadratischen Funktion ist f(x) = ax² + bx + c, wobei a ≠ 0.",
                "topic": "Grundlagen"
            }
        ],
        "totalQuestions": 1,
        "estimatedTime": 5
    }'::jsonb
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON klassenarbeiten TO anon, authenticated;
GRANT ALL ON quiz_attempts TO anon, authenticated;