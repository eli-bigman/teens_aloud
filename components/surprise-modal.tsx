"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gift, User, Calendar, MapPin, DollarSign, Users, Cake, Heart, Star } from 'lucide-react'
import { Member } from "@/lib/supabase"

interface SurpriseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: Member | null
  members: Member[]
}

export function SurpriseModal({ open, onOpenChange, member, members }: SurpriseModalProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(member)
  const [surpriseType, setSurpriseType] = useState("gift")
  const [surpriseTitle, setSurpriseTitle] = useState("")
  const [surpriseDescription, setSurpriseDescription] = useState("")
  const [budget, setBudget] = useState("")
  const [location, setLocation] = useState("")
  const [collaborators, setCollaborators] = useState<string[]>([])

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff === 0 && today.getDate() < birthDate.getDate()) {
      age--
    }
    return age
  }

  const calculateDaysUntilBirthday = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    const thisYearBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
    
    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1)
    }
    
    const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntil
  }

  const getBirthdayTimingText = (birthDate: string) => {
    if (!birthDate) return ""
    const daysUntil = calculateDaysUntilBirthday(birthDate)
    
    if (daysUntil === 0) return "Today! 🎉"
    if (daysUntil === 1) return "Tomorrow"
    if (daysUntil <= 7) return `In ${daysUntil} days`
    return `In ${daysUntil} days`
  }

  const surpriseIdeas = {
    gift: [
      "Personalized photo album with foundation memories",
      "Custom TEENS ALOUD FOUNDATION branded merchandise",
      "Professional development book related to their field",
      "Gift card to their favorite restaurant or store",
      "Handwritten birthday card from the team"
    ],
    party: [
      "Virtual birthday celebration with all members",
      "Small surprise gathering at the office",
      "Birthday lunch with close foundation friends",
      "Themed birthday party based on their interests",
      "Surprise video montage from fellow members"
    ],
    experience: [
      "Workshop or seminar in their area of interest",
      "Mentorship session with a foundation leader",
      "Networking event invitation",
      "Conference or training opportunity",
      "Special recognition at the next foundation meeting"
    ]
  }

  const handleSaveSurprise = () => {
    // Here you would save the surprise plan to your database  
    
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-600" />
            Plan Birthday Surprise
          </DialogTitle>
          <DialogDescription>
            Organize a special surprise to make their birthday unforgettable
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Member Selection */}
          <div className="space-y-2">
            <Label>Select Member</Label>
            <Select 
              value={selectedMember?.id.toString() || ""} 
              onValueChange={(value) => {
                const member = members.find(m => m.id.toString() === value)
                setSelectedMember(member || null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a member to surprise..." />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{member.full_name}</span>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {member.date_of_birth && (
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                            {getBirthdayTimingText(member.date_of_birth)}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          Age {member.date_of_birth ? calculateAge(member.date_of_birth) : 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMember && (
            <>
              {/* Member Info Card */}
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500 text-white rounded-full">
                        <Gift className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedMember.full_name}</h3>
                        <p className="text-sm text-gray-600">Planning surprise celebration</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-purple-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        Age {selectedMember.date_of_birth ? calculateAge(selectedMember.date_of_birth) : 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="plan" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="plan">Plan Surprise</TabsTrigger>
                  <TabsTrigger value="ideas">Get Ideas</TabsTrigger>
                </TabsList>

                <TabsContent value="plan" className="space-y-4">
                  {/* Surprise Type */}
                  <div className="space-y-2">
                    <Label>Surprise Type</Label>
                    <Select value={surpriseType} onValueChange={setSurpriseType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gift">
                          <div className="flex items-center gap-2">
                            <Gift className="h-4 w-4" />
                            Gift Surprise
                          </div>
                        </SelectItem>
                        <SelectItem value="party">
                          <div className="flex items-center gap-2">
                            <Cake className="h-4 w-4" />
                            Party/Celebration
                          </div>
                        </SelectItem>
                        <SelectItem value="experience">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Experience/Activity
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Surprise Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Surprise Title</Label>
                    <Input
                      id="title"
                      placeholder="Give your surprise a name..."
                      value={surpriseTitle}
                      onChange={(e) => setSurpriseTitle(e.target.value)}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description & Details</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the surprise in detail..."
                      value={surpriseDescription}
                      onChange={(e) => setSurpriseDescription(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Budget */}
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="budget"
                          placeholder="0.00"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="location"
                          placeholder="Where will this happen?"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Collaborators */}
                  <div className="space-y-2">
                    <Label>Collaborators</Label>
                    <Select onValueChange={(value) => {
                      if (!collaborators.includes(value)) {
                        setCollaborators([...collaborators, value])
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add team members to help..." />
                      </SelectTrigger>
                      <SelectContent>
                        {members
                          .filter(m => m.id !== selectedMember.id)
                          .map((member) => (
                            <SelectItem key={member.id} value={member.full_name}>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {member.full_name}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {collaborators.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {collaborators.map((collaborator, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {collaborator}
                            <button
                              onClick={() => setCollaborators(collaborators.filter((_, i) => i !== index))}
                              className="ml-1 text-xs hover:text-red-600"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="ideas" className="space-y-4">
                  <div className="grid gap-4">
                    {Object.entries(surpriseIdeas).map(([type, ideas]) => (
                      <Card key={type}>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 capitalize">
                            {type === 'gift' && <Gift className="h-4 w-4 text-purple-600" />}
                            {type === 'party' && <Cake className="h-4 w-4 text-pink-600" />}
                            {type === 'experience' && <Star className="h-4 w-4 text-yellow-600" />}
                            {type} Ideas
                          </h4>
                          <ul className="space-y-2">
                            {ideas.map((idea, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <Heart className="h-3 w-3 text-red-400 mt-0.5 flex-shrink-0" />
                                <span>{idea}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">
                Save Draft
              </Button>
              <Button 
                onClick={handleSaveSurprise}
                disabled={!selectedMember || !surpriseTitle}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Gift className="h-4 w-4 mr-2" />
                Plan Surprise
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
