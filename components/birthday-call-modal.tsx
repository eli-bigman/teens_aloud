"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, User, Calendar, CheckCircle, Copy } from 'lucide-react'

interface Member {
  id: number
  full_name: string
  date_of_birth: string
  email: string
  active_phone_number: string
}

interface BirthdayCallModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: Member | null
  members: Member[]
}

export function BirthdayCallModal({ open, onOpenChange, member, members }: BirthdayCallModalProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(member)
  const [callNotes, setCallNotes] = useState("")
  const [callCompleted, setCallCompleted] = useState(false)

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

  const callScript = selectedMember ? `Hi ${selectedMember.full_name}! 

This is [Your Name] from TEENS ALOUD FOUNDATION ASSOCIATES. I'm calling to wish you a very happy ${calculateAge(selectedMember.date_of_birth)}th birthday! 

I hope you're having a wonderful day filled with joy, celebration, and all your favorite things. 

As a valued member of our community, we wanted to take a moment to let you know how much we appreciate you and your continued involvement with our foundation.

We hope this new year of life brings you lots of happiness, success, and amazing opportunities!

Is there anything special you're doing to celebrate today?

[Listen and engage with their response]

Well, I don't want to keep you too long from your celebrations. Have an absolutely fantastic birthday, and we look forward to seeing you at our upcoming events!

Take care and happy birthday again! 🎉` : ""

  const copyToClipboard = () => {
    navigator.clipboard.writeText(callScript)
  }

  const markCallCompleted = () => {
    setCallCompleted(true)
    // Here you would save the call log to your database
    console.log("Call completed for:", selectedMember?.full_name)
    console.log("Notes:", callNotes)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-600" />
            Make Birthday Call
          </DialogTitle>
          <DialogDescription>
            Call a member to wish them happy birthday with a personalized message
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Member Selection */}
          <div className="space-y-2">
            <Label>Select Member to Call</Label>
            <Select 
              value={selectedMember?.id.toString() || ""} 
              onValueChange={(value) => {
                const member = members.find(m => m.id.toString() === value)
                setSelectedMember(member || null)
                setCallCompleted(false)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a member to call..." />
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
            <>
              {/* Member Info Card */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500 text-white rounded-full">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedMember.full_name}</h3>
                        <p className="text-sm text-gray-600 font-mono">{selectedMember.active_phone_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        Age {calculateAge(selectedMember.date_of_birth)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Call Script */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Birthday Call Script</Label>
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Script
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm whitespace-pre-wrap leading-relaxed text-gray-700 max-h-64 overflow-y-auto">
                      {callScript}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Call Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Call Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about the call (optional)..."
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Call Status */}
              {callCompleted && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">Call Completed!</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Birthday call logged for {selectedMember.full_name} at {new Date().toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Quick Tips */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">💡 Call Tips:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Keep the call warm and personal</li>
                    <li>• Ask about their celebration plans</li>
                    <li>• Mention upcoming foundation events</li>
                    <li>• Keep it brief but meaningful (2-3 minutes)</li>
                    <li>• End with genuine birthday wishes</li>
                  </ul>
                </CardContent>
              </Card>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              {selectedMember && !callCompleted && (
                <Button onClick={markCallCompleted} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Call Complete
                </Button>
              )}
              {callCompleted && (
                <Button onClick={() => onOpenChange(false)} className="bg-blue-600 hover:bg-blue-700">
                  Done
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
