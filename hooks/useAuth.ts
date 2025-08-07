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
      
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', credentials.username)
        .eq('password_hash', hashedPassword)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        return false
      }

      // Update last login
      await supabase
        .from('admins')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id)

      const adminData = { ...data, last_login: new Date().toISOString() }
      setAdmin(adminData)
      localStorage.setItem('teens_aloud_admin', JSON.stringify(adminData))
      
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
