"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserPlus, Eye, EyeOff, Trash2, User, Mail, Calendar, AlertTriangle, Edit } from 'lucide-react'
import { toast } from "sonner"
import { createBrowserClient } from "@/lib/supabase/client"
import bcrypt from "bcryptjs"

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

interface AdminManagementProps {
  currentAdmin: Admin
}

export function AdminManagement({ currentAdmin }: AdminManagementProps) {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false)
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
    confirmPassword: ""
  })
  
  // Password change form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createBrowserClient()

  useEffect(() => {
    fetchAdmins()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      // Use secure view or explicit column selection to avoid password_hash
      const { data, error } = await supabase
        .from("admin_secure_view")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        // Fallback to explicit column selection if view doesn't exist
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("admins")
          .select("id, username, email, full_name, last_login, created_at, created_by, is_active")
          .order("created_at", { ascending: false })
        
        if (fallbackError) throw fallbackError
        setAdmins(fallbackData || [])
      } else {
        setAdmins(data || [])
      }
    } catch (error) {
      console.error("Error fetching admins:", error)
      toast.error("Failed to load admin accounts")
    } finally {
      setLoading(false)
    }
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.username.trim() || !formData.email.trim() || !formData.full_name.trim() || !formData.password) {
      toast.error("Please fill in all fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    setIsSubmitting(true)

    try {
      // Check if username or email already exists
      const { data: existingAdmin } = await supabase
        .from("admins")
        .select("username, email")
        .or(`username.eq.${formData.username.trim()},email.eq.${formData.email.trim()}`)
        .single()

      if (existingAdmin) {
        toast.error("Username or email already exists")
        setIsSubmitting(false)
        return
      }

      // Hash password (in a real app, this should be done server-side)
      const hashedPassword = await bcrypt.hash(formData.password, 12)

      const { error } = await supabase
        .from("admins")
        .insert({
          username: formData.username.trim(),
          email: formData.email.trim(),
          full_name: formData.full_name.trim(),
          password_hash: hashedPassword,
          created_by: currentAdmin.id,
          is_active: true
        })

      if (error) throw error

      toast.success("Admin account created successfully")
      setFormData({ username: "", email: "", full_name: "", password: "", confirmPassword: "" })
      setIsAddModalOpen(false)
      fetchAdmins()
    } catch (error) {
      console.error("Error creating admin:", error)
      toast.error("Failed to create admin account")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return

    if (adminToDelete.id === currentAdmin.id) {
      toast.error("You cannot delete your own account")
      return
    }

    try {
      const { error } = await supabase
        .from("admins")
        .update({ is_active: false })
        .eq("id", adminToDelete.id)

      if (error) throw error

      toast.success("Admin account deactivated successfully")
      setIsDeleteModalOpen(false)
      setAdminToDelete(null)
      fetchAdmins()
    } catch (error) {
      console.error("Error deactivating admin:", error)
      toast.error("Failed to deactivate admin account")
    }
  }

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword.trim()) {
      toast.error("Current password is required")
      return
    }

    if (!passwordData.newPassword.trim()) {
      toast.error("New password is required")
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error("New password must be different from current password")
      return
    }

    try {
      setIsSubmitting(true)

      // First, verify the current password
      const { data: adminData, error: fetchError } = await supabase
        .from("admins")
        .select("password_hash")
        .eq("id", currentAdmin.id)
        .single()

      if (fetchError) throw fetchError

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(passwordData.currentPassword, adminData.password_hash)
      
      if (!isCurrentPasswordValid) {
        toast.error("Current password is incorrect")
        return
      }

      // Hash the new password
      const saltRounds = 12
      const hashedNewPassword = await bcrypt.hash(passwordData.newPassword, saltRounds)

      // Update the password
      const { error: updateError } = await supabase
        .from("admins")
        .update({ 
          password_hash: hashedNewPassword,
          updated_at: new Date().toISOString()
        })
        .eq("id", currentAdmin.id)

      if (updateError) throw updateError

      toast.success("Password changed successfully!")
      setIsPasswordChangeModalOpen(false)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
      })
    } catch (error) {
      console.error("Error changing password:", error)
      toast.error("Failed to change password")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Simple password hashing (use bcrypt or similar in production)
  // const hashPassword = async (password: string): Promise<string> => {
  //   const encoder = new TextEncoder()
  //   const data = encoder.encode(password + "salt_teens_aloud_2025")
  //   const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  //   const hashArray = Array.from(new Uint8Array(hashBuffer))
  //   return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  // }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Management</h2>
          <p className="text-gray-600">Manage administrator accounts and permissions</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add New Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Administrator</DialogTitle>
              <DialogDescription>
                Create a new admin account for the Teens Aloud Foundation dashboard.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@teensaloud.org"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Admin"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Admin List */}
      <Card>
        <CardHeader>
          <CardTitle>Administrator Accounts</CardTitle>
          <CardDescription>
            {admins.length} total admin accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading admin accounts...</div>
          ) : admins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No admin accounts found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin Details</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{admin.full_name}</div>
                          <div className="text-sm text-gray-500">@{admin.username}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{admin.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={admin.is_active ? "default" : "secondary"}>
                        {admin.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {admin.id === currentAdmin.id && (
                        <Badge variant="outline" className="ml-2">Current User</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {admin.last_login 
                          ? new Date(admin.last_login).toLocaleDateString()
                          : "Never"
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      {admin.id === currentAdmin.id ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsPasswordChangeModalOpen(true)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Change Password
                        </Button>
                      ) : admin.is_active && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAdminToDelete(admin)
                            setIsDeleteModalOpen(true)
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Account Deactivation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate this admin account? This action will prevent the user from logging in.
            </DialogDescription>
          </DialogHeader>
          {adminToDelete && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Name:</strong> {adminToDelete.full_name}</p>
              <p><strong>Username:</strong> {adminToDelete.username}</p>
              <p><strong>Email:</strong> {adminToDelete.email}</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDeleteAdmin}
            >
              Deactivate Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordChangeModalOpen} onOpenChange={setIsPasswordChangeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-500" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Update your admin account password. Make sure to use a strong password.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter your current password"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={isSubmitting}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter your new password"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isSubmitting}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-new-password"
                  type={showConfirmNewPassword ? "text" : "password"}
                  value={passwordData.confirmNewPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                  placeholder="Confirm your new password"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  disabled={isSubmitting}
                >
                  {showConfirmNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsPasswordChangeModalOpen(false)
                setPasswordData({
                  currentPassword: "",
                  newPassword: "",
                  confirmNewPassword: ""
                })
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handlePasswordChange}
              disabled={isSubmitting || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmNewPassword}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Changing...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
