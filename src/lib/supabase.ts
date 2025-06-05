import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zunqwunibwyymzjdxjko.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1bnF3dW5pYnd5eW16amR4amtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNjM0MDgsImV4cCI6MjA2NDczOTQwOH0.D09m0cqIEaGjPiu16JukJp9xmmSMTHw3TSNjnXAkVEo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      klassenarbeiten: {
        Row: {
          id: string
          created_at: string
          title: string
          content: string
          teacher_id: string
          subdomain: string
          quiz_data: object
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          content: string
          teacher_id: string
          subdomain: string
          quiz_data?: object
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          content?: string
          teacher_id?: string
          subdomain?: string
          quiz_data?: object
        }
      }
    }
  }
}