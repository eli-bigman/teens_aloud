"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Member } from "@/lib/supabase"
import { Save, X } from "lucide-react"
import { toast } from "sonner"

interface EditMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: Member | null
  onMemberUpdated: (updatedMember: Member) => void
}

export function EditMemberModal({
  open,
  onOpenChange,
  member,
  onMemberUpdated
}: EditMemberModalProps) {
  const [formData, setFormData] = useState({
    full_name: member?.full_name || "",
    date_of_birth: member?.date_of_birth || "",
    email: member?.email || "",
    active_phone_number: member?.active_phone_number || "",
    nationality: member?.nationality || "",
    current_address: member?.current_address || ""
  })
  const [saving, setSaving] = useState(false)

  // Update form data when member changes
  useEffect(() => {
    if (member) {
      setFormData({
        full_name: member.full_name || "",
        date_of_birth: member.date_of_birth || "",
        email: member.email || "",
        active_phone_number: member.active_phone_number || "",
        nationality: member.nationality || "",
        current_address: member.current_address || ""
      })
    }
  }, [member])

  if (!member) return null

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "N/A"
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      toast.error("Full name is required")
      return
    }

    if (!formData.email.trim()) {
      toast.error("Email is required")
      return
    }

    setSaving(true)

    try {
      // Here you would typically call your API to update the member
      // For now, we'll simulate the update
      await new Promise(resolve => setTimeout(resolve, 1000))

      const updatedMember: Member = {
        ...member,
        full_name: formData.full_name,
        date_of_birth: formData.date_of_birth,
        email: formData.email,
        active_phone_number: formData.active_phone_number,
        nationality: formData.nationality,
        current_address: formData.current_address,
        updated_at: new Date().toISOString()
      }

      onMemberUpdated(updatedMember)
      toast.success("Member details updated successfully!")
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to update member details")
      console.error("Error updating member:", error)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    if (member) {
      setFormData({
        full_name: member.full_name || "",
        date_of_birth: member.date_of_birth || "",
        email: member.email || "",
        active_phone_number: member.active_phone_number || "",
        nationality: member.nationality || "",
        current_address: member.current_address || ""
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open)
      if (!open) resetForm()
    }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-blue-600" />
            Edit Member Details
          </DialogTitle>
          <DialogDescription>
            Update the member information below. All changes will be saved to the database.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange("full_name", e.target.value)}
              placeholder="Enter full name"
              disabled={saving}
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
              disabled={saving}
            />
            {formData.date_of_birth && (
              <p className="text-sm text-gray-500">
                Age: {calculateAge(formData.date_of_birth)} years old
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter email address"
              disabled={saving}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.active_phone_number}
              onChange={(e) => handleInputChange("active_phone_number", e.target.value)}
              placeholder="Enter phone number"
              disabled={saving}
            />
          </div>

          {/* Nationality */}
          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality</Label>
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={(e) => handleInputChange("nationality", e.target.value)}
              placeholder="Enter nationality"
              disabled={saving}
            />
          </div>

          {/* Current Address */}
          <div className="space-y-2">
            <Label htmlFor="current_address">Current Address</Label>
            <Input
              id="current_address"
              value={formData.current_address}
              onChange={(e) => handleInputChange("current_address", e.target.value)}
              placeholder="Enter current address"
              disabled={saving}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
