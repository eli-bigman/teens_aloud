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

interface AssociateForm {
  // Personal Details
  full_name: string
  email: string
  date_of_birth: string
  gender: string
  nationality: string
  
  // Contact Information
  active_phone_number: string
  other_phone_number: string
  current_address: string
  on_whatsapp: boolean
  
  // Education & Employment
  tertiary_education: boolean
  school: string
  year_of_completion: string
  currently_employed: boolean
  employer: string
  looking_for_job: boolean
  preferred_work_area: string
  
  // Relationship Status
  relationship_status: string
}

interface SpouseForm {
  full_name: string
  date_of_birth: string
  marriage_anniversary: string
  have_children: boolean
}

interface ChildForm {
  full_name: string
  date_of_birth: string
}

export function AddMemberModal({ open, onOpenChange, onMemberAdded }: AddMemberModalProps) {
  const [currentTab, setCurrentTab] = useState("personal")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState<AssociateForm>({
    full_name: "",
    email: "",
    date_of_birth: "",
    gender: "",
    nationality: "",
    active_phone_number: "",
    other_phone_number: "",
    current_address: "",
    on_whatsapp: false,
    tertiary_education: false,
    school: "",
    year_of_completion: "",
    currently_employed: false,
    employer: "",
    looking_for_job: false,
    preferred_work_area: "",
    relationship_status: "Single",
  })

  const [spouseData, setSpouseData] = useState<SpouseForm>({
    full_name: "",
    date_of_birth: "",
    marriage_anniversary: "",
    have_children: false,
  })

  const [children, setChildren] = useState<ChildForm[]>([])

  const supabase = createBrowserClient()

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      date_of_birth: "",
      gender: "",
      nationality: "",
      active_phone_number: "",
      other_phone_number: "",
      current_address: "",
      on_whatsapp: false,
      tertiary_education: false,
      school: "",
      year_of_completion: "",
      currently_employed: false,
      employer: "",
      looking_for_job: false,
      preferred_work_area: "",
      relationship_status: "Single",
    })
    setSpouseData({
      full_name: "",
      date_of_birth: "",
      marriage_anniversary: "",
      have_children: false,
    })
    setChildren([])
    setCurrentTab("personal")
  }

  const validateForm = () => {
    const errors = []
    
    // Required fields validation
    if (!formData.full_name.trim()) errors.push("Full name is required")
    if (!formData.email.trim()) errors.push("Email is required")
    if (!formData.date_of_birth) errors.push("Date of birth is required")
    if (!formData.gender) errors.push("Gender is required")
    if (!formData.nationality.trim()) errors.push("Nationality is required")
    if (!formData.active_phone_number.trim()) errors.push("Active phone number is required")
    if (!formData.current_address.trim()) errors.push("Current address is required")
    if (!formData.relationship_status) errors.push("Relationship status is required")
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push("Please enter a valid email address")
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
      if (!spouseData.marriage_anniversary) errors.push("Marriage anniversary is required when married")
    }
    
    // Children validation
    children.forEach((child, index) => {
      if (!child.full_name.trim()) errors.push(`Child ${index + 1} name is required`)
      if (!child.date_of_birth) errors.push(`Child ${index + 1} date of birth is required`)
    })
    
    return errors
  }

  const addChild = () => {
    setChildren([...children, { full_name: "", date_of_birth: "" }])
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
      const associateToInsert = {
        email: formData.email,
        full_name: formData.full_name,
        tertiary_education: formData.tertiary_education,
        school: formData.school || null,
        year_of_completion: formData.year_of_completion || null,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        nationality: formData.nationality,
        active_phone_number: formData.active_phone_number,
        other_phone_number: formData.other_phone_number || null,
        currently_employed: formData.currently_employed,
        employer: formData.employer || null,
        looking_for_job: formData.looking_for_job,
        preferred_work_area: formData.preferred_work_area || null,
        current_address: formData.current_address,
        on_whatsapp: formData.on_whatsapp,
        relationship_status: formData.relationship_status
      }

      
      
      // Insert associate
      const { data: associateData, error: associateError } = await supabase
        .from("associates")
        .insert([associateToInsert])
        .select()
        .single()

      if (associateError) {
        console.error('Error inserting associate:', associateError)
        
        // If the table doesn't exist, provide a helpful error message
        if (associateError.message.includes('does not exist') || associateError.message.includes('relation')) {
          throw new Error('Database tables not set up. Please contact your administrator to set up the database tables.')
        }
        
        throw associateError
      }

      
      const associateId = associateData.id

      // Insert spouse if married
      if (formData.relationship_status === "Married" && spouseData.full_name.trim()) {
        
        const spouseToInsert = {
          associate_id: associateId,
          full_name: spouseData.full_name,
          date_of_birth: spouseData.date_of_birth,
          marriage_anniversary: spouseData.marriage_anniversary,
          have_children: spouseData.have_children
        }

        const { error: spouseError } = await supabase
          .from("spouses")
          .insert([spouseToInsert])

        if (spouseError) {
          console.error('Error inserting spouse:', spouseError)
          // Don't fail the whole operation if spouse insertion fails
          console.warn('Spouse insertion failed, but associate was created successfully')
        } else {
          
        }
      }

      // Insert children if any
      if (children.length > 0) {
        
        const childrenToInsert = children
          .filter(child => child.full_name.trim()) // Only insert children with names
          .map(child => ({
            associate_id: associateId,
            full_name: child.full_name,
            date_of_birth: child.date_of_birth
          }))

        if (childrenToInsert.length > 0) {
          const { error: childrenError } = await supabase
            .from("children")
            .insert(childrenToInsert)

          if (childrenError) {
            console.error('Error inserting children:', childrenError)
            // Don't fail the whole operation if children insertion fails
            console.warn('Children insertion failed, but associate was created successfully')
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
                        id="on_whatsapp"
                        checked={formData.on_whatsapp}
                        onCheckedChange={(checked: boolean) => setFormData({ ...formData, on_whatsapp: !!checked })}
                      />
                      <Label htmlFor="on_whatsapp">Available on WhatsApp</Label>
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
                      id="tertiary_education"
                      checked={formData.tertiary_education}
                      onCheckedChange={(checked: boolean) => setFormData({ ...formData, tertiary_education: !!checked })}
                    />
                    <Label htmlFor="tertiary_education">Has tertiary education</Label>
                  </div>
                  
                  {formData.tertiary_education && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="school">School/Institution</Label>
                        <Input
                          id="school"
                          value={formData.school}
                          onChange={(e) => setFormData({ ...formData, school: e.target.value })}
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
                      <Label htmlFor="employer">Employer</Label>
                      <Input
                        id="employer"
                        value={formData.employer}
                        onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
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
                          <Label htmlFor="preferred_work_area">Preferred Work Area</Label>
                          <Input
                            id="preferred_work_area"
                            value={formData.preferred_work_area}
                            onChange={(e) => setFormData({ ...formData, preferred_work_area: e.target.value })}
                            placeholder="Enter preferred work area"
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
                      <Label htmlFor="marriage_anniversary">Marriage Anniversary *</Label>
                      <Input
                        id="marriage_anniversary"
                        type="date"
                        value={spouseData.marriage_anniversary}
                        onChange={(e) => setSpouseData({ ...spouseData, marriage_anniversary: e.target.value })}
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
