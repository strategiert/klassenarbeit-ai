import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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