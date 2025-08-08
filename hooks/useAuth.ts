import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

interface Admin {
  id: number
  username: string
  email: string
  full_name: string
  last_login: string | null
  created_at: string
  created_by: number | null
  is_active: boolean
}

export function useAuth() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    // Check if user is already logged in
    const savedAdmin = localStorage.getItem('teens_aloud_admin')
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin))
      } catch (error) {
        localStorage.removeItem('teens_aloud_admin')
      }
    }
    setLoading(false)
  }, [])

  const login = async (credentials: { username: string; password: string }): Promise<boolean> => {
    try {
      // Hash the password for comparison
      const hashedPassword = await hashPassword(credentials.password)
      
      // First, verify credentials (only fetch id and password_hash)
      const { data: authData, error: authError } = await supabase
        .from('admins')
        .select('id, password_hash')
        .eq('username', credentials.username)
        .eq('is_active', true)
        .single()

      if (authError || !authData) {
        return false
      }

      // Verify password hash
      if (authData.password_hash !== hashedPassword) {
        return false
      }

      // Now fetch safe admin data (without password hash)
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('id, username, email, full_name, is_active, created_at, created_by')
        .eq('id', authData.id)
        .single()

      if (adminError || !adminData) {
        return false
      }

      // Update last login
      await supabase
        .from('admins')
        .update({ last_login: new Date().toISOString() })
        .eq('id', authData.id)

      const safeAdminData = { ...adminData, last_login: new Date().toISOString() }
      setAdmin(safeAdminData)
      localStorage.setItem('teens_aloud_admin', JSON.stringify(safeAdminData))
      
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    setAdmin(null)
    localStorage.removeItem('teens_aloud_admin')
  }

  // Simple password hashing (use bcrypt or similar in production)
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(password + "salt_teens_aloud_2025")
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  return {
    admin,
    loading,
    login,
    logout,
    isAuthenticated: !!admin
  }
}
