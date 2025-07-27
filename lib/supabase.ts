import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: { 'x-my-custom-header': 'teens-aloud-app' },
  },
})

// For server-side operations (if needed) - only create if service role key is available
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null

// Database types based on your form fields
export interface Associate {
  id: number
  email: string
  full_name: string
  tertiary_education: boolean
  school?: string
  year_of_completion?: string
  date_of_birth: string
  gender: "Male" | "Female"
  nationality: string
  active_phone_number: string
  other_phone_number?: string
  currently_employed: boolean
  employer?: string
  looking_for_job?: boolean
  preferred_work_area?: string
  current_address: string
  on_whatsapp: boolean
  relationship_status: "Single" | "Married"
  created_at: string
  updated_at: string
  spouse?: Spouse | null
  children?: Child[]
}

export interface Spouse {
  id: number
  associate_id: number
  full_name: string
  date_of_birth: string
  marriage_anniversary: string
  have_children: boolean
  created_at: string
  updated_at: string
}

export interface Child {
  id: number
  associate_id: number
  full_name: string
  date_of_birth: string
  created_at: string
  updated_at: string
}
