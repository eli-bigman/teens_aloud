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
import { Mail, Upload, Sparkles, Send, Image, User, Calendar, Heart, Loader2 } from 'lucide-react'

interface Member {
  id: number
  full_name: string
  date_of_birth: string
  email: string
  active_phone_number: string
}

interface BirthdayEmailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: Member | null
  members: Member[]
}

export function BirthdayEmailModal({ open, onOpenChange, member, members }: BirthdayEmailModalProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(member)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [emailTemplate, setEmailTemplate] = useState("birthday")

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const generateAIMessage = async () => {
    if (!selectedMember) return
    
    setIsGenerating(true)
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const age = calculateAge(selectedMember.date_of_birth)
    const templates = {
      birthday: `🎉 Happy Birthday, ${selectedMember.full_name}! 🎂

Dear ${selectedMember.full_name},

Wishing you a fantastic ${age}th birthday! May this special day bring you joy, laughter, and wonderful memories.

As a valued member of the TEENS ALOUD FOUNDATION ASSOCIATES, we're grateful for your continued participation and dedication to our community.

Here's to another year of growth, success, and amazing achievements!

With warm birthday wishes,
The TEENS ALOUD FOUNDATION Team

P.S. We hope your day is filled with cake, celebration, and all your favorite things! 🎈`,
      
      formal: `Dear ${selectedMember.full_name},

On behalf of the entire TEENS ALOUD FOUNDATION ASSOCIATES community, I would like to extend our warmest birthday wishes to you as you celebrate your ${age}th birthday.

Your commitment and valuable contributions to our organization have been truly appreciated, and we look forward to continuing our journey together in the year ahead.

May this new year of life bring you prosperity, good health, and continued success in all your endeavors.

Best regards,
TEENS ALOUD FOUNDATION
Administrative Team`,

      casual: `Hey ${selectedMember.full_name}! 🎉

Hope you're having an absolutely amazing ${age}th birthday! 

Just wanted to drop you a quick note to let you know we're thinking of you on your special day. You're such an important part of our TEENS ALOUD FOUNDATION family, and we're lucky to have you!

Enjoy every moment of your celebration - you deserve all the happiness in the world! 

Cheers to another year of awesomeness! 🥳

Much love,
Your TEENS ALOUD FOUNDATION friends`
    }
    
    setSubject(`🎂 Happy Birthday ${selectedMember.full_name}!`)
    setMessage(templates[emailTemplate as keyof typeof templates])
    setIsGenerating(false)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSendEmail = async () => {
    if (!selectedMember || !subject || !message) return
    
    setIsSending(true)
    
    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Here you would integrate with your email service
    console.log("Sending email to:", selectedMember.email)
    console.log("Subject:", subject)
    console.log("Message:", message)
    console.log("Image:", uploadedImage)
    
    setIsSending(false)
    onOpenChange(false)
    
    // Reset form
    setSubject("")
    setMessage("")
    setUploadedImage(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Send Birthday Email
          </DialogTitle>
          <DialogDescription>
            Compose and send a personalized birthday email to celebrate with your members
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
                <SelectValue placeholder="Choose a member to send birthday wishes..." />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{member.full_name}</span>
                      <Badge variant="outline" className="text-xs">
                        Age {calculateAge(member.date_of_birth)}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMember && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 text-white rounded-full">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedMember.full_name}</h3>
                      <p className="text-sm text-gray-600">{selectedMember.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-blue-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      Age {calculateAge(selectedMember.date_of_birth)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="compose" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="compose">Compose Email</TabsTrigger>
              <TabsTrigger value="ai-generate">AI Generate</TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-4">
              {/* Subject Line */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  placeholder="Enter email subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Write your birthday message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={12}
                  className="resize-none"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Attach Birthday Image</Label>
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="relative">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </Button>
                  {uploadedImage && (
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Image uploaded</span>
                    </div>
                  )}
                </div>
                {uploadedImage && (
                  <div className="mt-2">
                    <img 
                      src={uploadedImage || "/placeholder.svg"} 
                      alt="Birthday attachment" 
                      className="max-w-xs max-h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ai-generate" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Email Template Style</Label>
                  <Select value={emailTemplate} onValueChange={setEmailTemplate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="birthday">🎉 Fun Birthday</SelectItem>
                      <SelectItem value="formal">📝 Professional</SelectItem>
                      <SelectItem value="casual">😊 Casual & Friendly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={generateAIMessage}
                  disabled={!selectedMember || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Birthday Message
                    </>
                  )}
                </Button>

                {(subject || message) && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">Generated Subject:</Label>
                      <p className="text-sm mt-1 p-2 bg-white rounded border">{subject}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Generated Message:</Label>
                      <div className="text-sm mt-1 p-3 bg-white rounded border whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {message}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

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
                onClick={handleSendEmail}
                disabled={!selectedMember || !subject || !message || isSending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
