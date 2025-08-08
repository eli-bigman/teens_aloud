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

// Database types based on the updated Google Forms schema
export interface Member {
  id: string
  timestamp: string
  full_name: string
  email?: string
  second_email?: string
  active_email?: string
  
  // Personal Information
  date_of_birth?: string
  gender?: "Male" | "Female" | "Other"
  nationality?: string
  relationship_status?: "Single" | "Married" | "Divorced" | "Widowed"
  
  // Contact Information
  active_phone_number?: string
  other_phone_number?: string
  current_address?: string
  
  // Employment Status
  currently_employed: boolean
  current_employer?: string
  prefered_work_industry?: string
  area_of_work?: string
  looking_for_job: boolean
  
  // Education
  year_of_completion?: number
  postgrad_year_of_completion?: number
  tertiary_institution_name?: string
  completed_tertiary: boolean
  
  // Family Information
  has_children: boolean
  number_of_children: number
  
  // WhatsApp Association
  on_associate_whatsapp: boolean
  
  // Metadata
  created_at: string
  updated_at: string
  
  // Related data (joined from other tables)
  spouse?: MemberSpouse | null
  children?: MemberChild[]
}

export interface MemberSpouse {
  id: string
  member_id: string
  full_name: string
  date_of_birth?: string
  marriage_anniversary_date?: string
  created_at: string
}

export interface MemberChild {
  id: string
  member_id: string
  full_name?: string
  date_of_birth?: string
  child_order: number
  created_at: string
}

// Legacy interfaces for backward compatibility
export interface Associate extends Member {}
export interface Spouse extends MemberSpouse {
  associate_id: string
  marriage_anniversary?: string
  have_children?: boolean
  updated_at?: string
}
export interface Child extends MemberChild {
  associate_id: string
  updated_at?: string
}
