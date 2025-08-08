"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Phone, Briefcase, GraduationCap, Heart, Baby, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface AddMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMemberAdded: () => void
}

interface MemberForm {
  // Personal Details
  full_name: string
  email?: string
  second_email?: string
  active_email?: string
  date_of_birth: string
  gender: string
  nationality: string
  
  // Contact Information
  active_phone_number: string
  other_phone_number?: string
  current_address: string
  on_associate_whatsapp: boolean
  
  // Education & Employment
  completed_tertiary: boolean
  tertiary_institution_name?: string
  year_of_completion?: string
  postgrad_year_of_completion?: string
  currently_employed: boolean
  current_employer?: string
  prefered_work_industry?: string
  area_of_work?: string
  looking_for_job?: boolean
  
  // Relationship Status
  relationship_status: string
  has_children: boolean
  number_of_children?: string
}

interface SpouseForm {
  full_name: string
  date_of_birth: string
  marriage_anniversary_date: string
}

interface ChildForm {
  full_name: string
  date_of_birth: string
  child_order: number
}

export function AddMemberModal({ open, onOpenChange, onMemberAdded }: AddMemberModalProps) {
  const [currentTab, setCurrentTab] = useState("personal")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState<MemberForm>({
    full_name: "",
    email: "",
    second_email: "",
    active_email: "",
    date_of_birth: "",
    gender: "",
    nationality: "",
    active_phone_number: "",
    other_phone_number: "",
    current_address: "",
    on_associate_whatsapp: false,
    completed_tertiary: false,
    tertiary_institution_name: "",
    year_of_completion: "",
    postgrad_year_of_completion: "",
    currently_employed: false,
    current_employer: "",
    prefered_work_industry: "",
    area_of_work: "",
    looking_for_job: false,
    relationship_status: "Single",
    has_children: false,
    number_of_children: "",
  })

  const [spouseData, setSpouseData] = useState<SpouseForm>({
    full_name: "",
    date_of_birth: "",
    marriage_anniversary_date: "",
  })

  const [children, setChildren] = useState<ChildForm[]>([])

  const supabase = createBrowserClient()

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      second_email: "",
      active_email: "",
      date_of_birth: "",
      gender: "",
      nationality: "",
      active_phone_number: "",
      other_phone_number: "",
      current_address: "",
      on_associate_whatsapp: false,
      completed_tertiary: false,
      tertiary_institution_name: "",
      year_of_completion: "",
      postgrad_year_of_completion: "",
      currently_employed: false,
      current_employer: "",
      prefered_work_industry: "",
      area_of_work: "",
      looking_for_job: false,
      relationship_status: "Single",
      has_children: false,
      number_of_children: "",
    })
    setSpouseData({
      full_name: "",
      date_of_birth: "",
      marriage_anniversary_date: "",
    })
    setChildren([])
    setCurrentTab("personal")
  }

  const validateForm = () => {
    const errors = []
    
    // Required fields validation
    if (!formData.full_name.trim()) errors.push("Full name is required")
    if (!formData.email?.trim() && !formData.second_email?.trim()) errors.push("At least one email is required")
    if (!formData.date_of_birth) errors.push("Date of birth is required")
    if (!formData.gender) errors.push("Gender is required")
    if (!formData.nationality.trim()) errors.push("Nationality is required")
    if (!formData.active_phone_number.trim()) errors.push("Active phone number is required")
    if (!formData.current_address.trim()) errors.push("Current address is required")
    if (!formData.relationship_status) errors.push("Relationship status is required")
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push("Please enter a valid primary email address")
    }
    if (formData.second_email && !emailRegex.test(formData.second_email)) {
      errors.push("Please enter a valid secondary email address")
    }
    if (formData.active_email && !emailRegex.test(formData.active_email)) {
      errors.push("Please enter a valid active email address")
    }
    
    // Date validation
    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth)
      const today = new Date()
      if (birthDate > today) {
        errors.push("Date of birth cannot be in the future")
      }
    }
    
    // Spouse validation if married
    if (formData.relationship_status === "Married") {
      if (!spouseData.full_name.trim()) errors.push("Spouse name is required when married")
      if (!spouseData.date_of_birth) errors.push("Spouse date of birth is required when married")
      if (!spouseData.marriage_anniversary_date) errors.push("Marriage anniversary is required when married")
    }
    
    // Children validation
    children.forEach((child, index) => {
      if (!child.full_name.trim()) errors.push(`Child ${index + 1} name is required`)
      if (!child.date_of_birth) errors.push(`Child ${index + 1} date of birth is required`)
    })
    
    return errors
  }

  const addChild = () => {
    setChildren([...children, { full_name: "", date_of_birth: "", child_order: children.length + 1 }])
  }

  const removeChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index))
  }

  const updateChild = (index: number, field: keyof ChildForm, value: string) => {
    const updatedChildren = children.map((child, i) => 
      i === index ? { ...child, [field]: value } : child
    )
    setChildren(updatedChildren)
  }

  const handleSubmit = async () => {
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      toast.error("Validation Error", {
        description: validationErrors.join(", ")
      })
      return
    }

    setIsSubmitting(true)

    try {
      
      
      
      // Prepare the data for insertion - ensure all required fields are present
      const memberToInsert = {
        full_name: formData.full_name,
        email: formData.email || null,
        second_email: formData.second_email || null,
        active_email: formData.active_email || null,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        nationality: formData.nationality,
        active_phone_number: formData.active_phone_number,
        other_phone_number: formData.other_phone_number || null,
        current_address: formData.current_address,
        on_associate_whatsapp: formData.on_associate_whatsapp,
        completed_tertiary: formData.completed_tertiary,
        tertiary_institution_name: formData.tertiary_institution_name || null,
        year_of_completion: formData.year_of_completion || null,
        postgrad_year_of_completion: formData.postgrad_year_of_completion || null,
        currently_employed: formData.currently_employed,
        current_employer: formData.current_employer || null,
        prefered_work_industry: formData.prefered_work_industry || null,
        area_of_work: formData.area_of_work || null,
        relationship_status: formData.relationship_status,
        has_children: formData.has_children || children.length > 0,
        number_of_children: formData.number_of_children || (children.length > 0 ? children.length.toString() : null)
      }

      
      
      // Insert member
      const { data: memberData, error: memberError } = await supabase
        .from("members")
        .insert([memberToInsert])
        .select()
        .single()

      if (memberError) {
        console.error('Error inserting member:', memberError)
        
        // If the table doesn't exist, provide a helpful error message
        if (memberError.message.includes('does not exist') || memberError.message.includes('relation')) {
          throw new Error('Database tables not set up. Please contact your administrator to set up the database tables.')
        }
        
        throw memberError
      }

      
      const memberId = memberData.id

      // Insert spouse if married
      if (formData.relationship_status === "Married" && spouseData.full_name.trim()) {
        
        const spouseToInsert = {
          member_id: memberId,
          full_name: spouseData.full_name,
          date_of_birth: spouseData.date_of_birth,
          marriage_anniversary_date: spouseData.marriage_anniversary_date
        }

        const { error: spouseError } = await supabase
          .from("member_spouses")
          .insert([spouseToInsert])

        if (spouseError) {
          console.error('Error inserting spouse:', spouseError)
          // Don't fail the whole operation if spouse insertion fails
          console.warn('Spouse insertion failed, but member was created successfully')
        } else {
          
        }
      }

      // Insert children if any
      if (children.length > 0) {
        
        const childrenToInsert = children
          .filter(child => child.full_name.trim()) // Only insert children with names
          .map((child, index) => ({
            member_id: memberId,
            full_name: child.full_name,
            date_of_birth: child.date_of_birth,
            child_order: index + 1
          }))

        if (childrenToInsert.length > 0) {
          const { error: childrenError } = await supabase
            .from("member_children")
            .insert(childrenToInsert)

          if (childrenError) {
            console.error('Error inserting children:', childrenError)
            // Don't fail the whole operation if children insertion fails
            console.warn('Children insertion failed, but member was created successfully')
          } else {
            
          }
        }
      }

      toast.success("Success!", {
        description: `${formData.full_name} has been successfully added to the database.`
      })
      
      
      // Call the callback to refresh the member list
      onMemberAdded()
      
      // Reset form and close modal
      resetForm()
      onOpenChange(false)

    } catch (error) {
      console.error("Error adding member:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      toast.error("Error Adding Member", {
        description: `Failed to add member: ${errorMessage}`
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm()
      onOpenChange(false)
    }
  }

  const getTabStatus = (tabName: string) => {
    const errors = validateForm()
    
    switch (tabName) {
      case "personal":
        return errors.some(e => 
          e.includes("Full name") || 
          e.includes("Email") || 
          e.includes("Date of birth") || 
          e.includes("Gender") || 
          e.includes("Nationality") ||
          e.includes("valid email") ||
          e.includes("future")
        ) ? "error" : "complete"
      case "contact":
        return errors.some(e => 
          e.includes("phone") || 
          e.includes("address")
        ) ? "error" : "complete"
      case "professional":
        return "complete" // No required fields here
      case "family":
        return errors.some(e => 
          e.includes("Spouse") || 
          e.includes("Child") || 
          e.includes("anniversary")
        ) ? "error" : "complete"
      default:
        return "incomplete"
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Add New Member
          </DialogTitle>
          <DialogDescription>
            Fill in the member details across the different sections. Required fields are marked with *.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Personal</span>
              {getTabStatus("personal") === "error" && <AlertCircle className="h-3 w-3 text-red-500" />}
              {getTabStatus("personal") === "complete" && formData.full_name && <CheckCircle className="h-3 w-3 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Contact</span>
              {getTabStatus("contact") === "error" && <AlertCircle className="h-3 w-3 text-red-500" />}
              {getTabStatus("contact") === "complete" && formData.active_phone_number && <CheckCircle className="h-3 w-3 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="professional" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Professional</span>
              <CheckCircle className="h-3 w-3 text-green-500" />
            </TabsTrigger>
            <TabsTrigger value="family" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Family</span>
              {getTabStatus("family") === "error" && <AlertCircle className="h-3 w-3 text-red-500" />}
              {getTabStatus("family") === "complete" && <CheckCircle className="h-3 w-3 text-green-500" />}
            </TabsTrigger>
          </TabsList>

          {/* Personal Details Tab */}
          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Basic personal details and identification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="nationality">Nationality *</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      placeholder="Enter nationality"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information Tab */}
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>Phone numbers, address, and communication preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="active_phone_number">Active Phone Number *</Label>
                    <Input
                      id="active_phone_number"
                      value={formData.active_phone_number}
                      onChange={(e) => setFormData({ ...formData, active_phone_number: e.target.value })}
                      placeholder="Enter active phone number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="other_phone_number">Other Phone Number</Label>
                    <Input
                      id="other_phone_number"
                      value={formData.other_phone_number}
                      onChange={(e) => setFormData({ ...formData, other_phone_number: e.target.value })}
                      placeholder="Enter alternative phone number"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="current_address">Current Address *</Label>
                    <Textarea
                      id="current_address"
                      value={formData.current_address}
                      onChange={(e) => setFormData({ ...formData, current_address: e.target.value })}
                      placeholder="Enter current address"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="on_associate_whatsapp"
                        checked={formData.on_associate_whatsapp}
                        onCheckedChange={(checked: boolean) => setFormData({ ...formData, on_associate_whatsapp: !!checked })}
                      />
                      <Label htmlFor="on_associate_whatsapp">Available on WhatsApp</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Information Tab */}
          <TabsContent value="professional" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Education Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                  <CardDescription>Educational background and qualifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="completed_tertiary"
                      checked={formData.completed_tertiary}
                      onCheckedChange={(checked: boolean) => setFormData({ ...formData, completed_tertiary: !!checked })}
                    />
                    <Label htmlFor="completed_tertiary">Has tertiary education</Label>
                  </div>
                  
                  {formData.completed_tertiary && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="tertiary_institution_name">School/Institution</Label>
                        <Input
                          id="tertiary_institution_name"
                          value={formData.tertiary_institution_name}
                          onChange={(e) => setFormData({ ...formData, tertiary_institution_name: e.target.value })}
                          placeholder="Enter school/institution name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="year_of_completion">Year of Completion</Label>
                        <Input
                          id="year_of_completion"
                          value={formData.year_of_completion}
                          onChange={(e) => setFormData({ ...formData, year_of_completion: e.target.value })}
                          placeholder="Enter year of completion"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Employment Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Employment
                  </CardTitle>
                  <CardDescription>Current employment status and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="currently_employed"
                      checked={formData.currently_employed}
                      onCheckedChange={(checked: boolean) => setFormData({ ...formData, currently_employed: !!checked })}
                    />
                    <Label htmlFor="currently_employed">Currently employed</Label>
                  </div>
                  
                  {formData.currently_employed && (
                    <div className="space-y-2">
                      <Label htmlFor="current_employer">Employer</Label>
                      <Input
                        id="current_employer"
                        value={formData.current_employer}
                        onChange={(e) => setFormData({ ...formData, current_employer: e.target.value })}
                        placeholder="Enter employer name"
                      />
                    </div>
                  )}
                  
                  {!formData.currently_employed && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="looking_for_job"
                          checked={formData.looking_for_job}
                          onCheckedChange={(checked: boolean) => setFormData({ ...formData, looking_for_job: !!checked })}
                        />
                        <Label htmlFor="looking_for_job">Looking for job</Label>
                      </div>
                      
                      {formData.looking_for_job && (
                        <div className="space-y-2">
                          <Label htmlFor="prefered_work_industry">Preferred Work Industry</Label>
                          <Input
                            id="prefered_work_industry"
                            value={formData.prefered_work_industry}
                            onChange={(e) => setFormData({ ...formData, prefered_work_industry: e.target.value })}
                            placeholder="Enter preferred work industry"
                          />
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Family Information Tab */}
          <TabsContent value="family" className="space-y-4">
            {/* Relationship Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Relationship Status
                </CardTitle>
                <CardDescription>Marital status and family information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="relationship_status">Relationship Status *</Label>
                  <Select 
                    value={formData.relationship_status} 
                    onValueChange={(value) => setFormData({ ...formData, relationship_status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Spouse Information */}
            {formData.relationship_status === "Married" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Spouse Information
                  </CardTitle>
                  <CardDescription>Details about spouse</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="spouse_name">Spouse Full Name *</Label>
                      <Input
                        id="spouse_name"
                        value={spouseData.full_name}
                        onChange={(e) => setSpouseData({ ...spouseData, full_name: e.target.value })}
                        placeholder="Enter spouse's full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="spouse_dob">Spouse Date of Birth *</Label>
                      <Input
                        id="spouse_dob"
                        type="date"
                        value={spouseData.date_of_birth}
                        onChange={(e) => setSpouseData({ ...spouseData, date_of_birth: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="marriage_anniversary_date">Marriage Anniversary *</Label>
                      <Input
                        id="marriage_anniversary_date"
                        type="date"
                        value={spouseData.marriage_anniversary_date}
                        onChange={(e) => setSpouseData({ ...spouseData, marriage_anniversary_date: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Children Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Baby className="h-5 w-5" />
                  Children Information
                </CardTitle>
                <CardDescription>Add information about children</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {children.length > 0 && (
                  <div className="space-y-4">
                    {children.map((child, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-4">
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">Child {index + 1}</Badge>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => removeChild(index)}
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`child_name_${index}`}>Child&apos;s Full Name *</Label>
                            <Input
                              id={`child_name_${index}`}
                              value={child.full_name}
                              onChange={(e) => updateChild(index, 'full_name', e.target.value)}
                              placeholder="Enter child's full name"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`child_dob_${index}`}>Child&apos;s Date of Birth *</Label>
                            <Input
                              id={`child_dob_${index}`}
                              type="date"
                              value={child.date_of_birth}
                              onChange={(e) => updateChild(index, 'date_of_birth', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={addChild}
                  className="w-full"
                >
                  <Baby className="h-4 w-4 mr-2" />
                  Add Child
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          <div className="flex gap-2">
            {currentTab !== "personal" && (
              <Button 
                variant="outline"
                onClick={() => {
                  const tabs = ["personal", "contact", "professional", "family"]
                  const currentIndex = tabs.indexOf(currentTab)
                  if (currentIndex > 0) {
                    setCurrentTab(tabs[currentIndex - 1])
                  }
                }}
                disabled={isSubmitting}
              >
                Previous
              </Button>
            )}
            
            {currentTab !== "family" ? (
              <Button 
                onClick={() => {
                  const tabs = ["personal", "contact", "professional", "family"]
                  const currentIndex = tabs.indexOf(currentTab)
                  if (currentIndex < tabs.length - 1) {
                    setCurrentTab(tabs[currentIndex + 1])
                  }
                }}
                disabled={isSubmitting}
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding Member...
                  </>
                ) : (
                  "Add Member"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
