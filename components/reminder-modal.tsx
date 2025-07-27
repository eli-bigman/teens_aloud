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
import { Calendar, User, Clock, Bell, AlertCircle, CheckCircle } from 'lucide-react'

interface Member {
  id: number
  full_name: string
  date_of_birth: string
  email: string
  active_phone_number: string
}

interface ReminderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: Member | null
  members: Member[]
}

export function ReminderModal({ open, onOpenChange, member, members }: ReminderModalProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(member)
  const [reminderType, setReminderType] = useState("birthday")
  const [reminderDate, setReminderDate] = useState("")
  const [reminderTime, setReminderTime] = useState("09:00")
  const [reminderNote, setReminderNote] = useState("")
  const [reminderMethod, setReminderMethod] = useState("email")

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

  const getNextBirthday = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
    
    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1)
    }
    
    return thisYearBirthday.toISOString().split('T')[0]
  }

  const getDaysUntilBirthday = (dateOfBirth: string) => {
    const today = new Date()
    const nextBirthday = new Date(getNextBirthday(dateOfBirth))
    const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntil
  }

  const handleSetReminder = () => {
    // Here you would save the reminder to your database or notification system
    console.log("Reminder set for:", selectedMember?.full_name)
    console.log("Type:", reminderType)
    console.log("Date:", reminderDate)
    console.log("Time:", reminderTime)
    console.log("Method:", reminderMethod)
    console.log("Note:", reminderNote)
    
    onOpenChange(false)
  }

  const setQuickReminder = (days: number) => {
    if (!selectedMember) return
    
    const birthdayDate = new Date(getNextBirthday(selectedMember.date_of_birth))
    const reminderDate = new Date(birthdayDate)
    reminderDate.setDate(birthdayDate.getDate() - days)
    
    setReminderDate(reminderDate.toISOString().split('T')[0])
    setReminderNote(`Reminder: ${selectedMember.full_name}'s birthday is in ${days} day${days > 1 ? 's' : ''}!`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-600" />
            Set Birthday Reminder
          </DialogTitle>
          <DialogDescription>
            Create reminders so you never miss important birthdays and celebrations
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
                if (member) {
                  setReminderDate(getNextBirthday(member.date_of_birth))
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a member..." />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{member.full_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {getDaysUntilBirthday(member.date_of_birth)} days
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
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500 text-white rounded-full">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedMember.full_name}</h3>
                        <p className="text-sm text-gray-600">
                          Birthday: {new Date(selectedMember.date_of_birth).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-orange-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {getDaysUntilBirthday(selectedMember.date_of_birth)} days
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Reminder Buttons */}
              <div className="space-y-2">
                <Label>Quick Reminders</Label>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuickReminder(1)}
                  >
                    1 Day Before
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuickReminder(3)}
                  >
                    3 Days Before
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuickReminder(7)}
                  >
                    1 Week Before
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuickReminder(14)}
                  >
                    2 Weeks Before
                  </Button>
                </div>
              </div>

              {/* Reminder Type */}
              <div className="space-y-2">
                <Label>Reminder Type</Label>
                <Select value={reminderType} onValueChange={setReminderType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="birthday">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Birthday Reminder
                      </div>
                    </SelectItem>
                    <SelectItem value="preparation">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Preparation Reminder
                      </div>
                    </SelectItem>
                    <SelectItem value="followup">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Follow-up Reminder
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Reminder Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">Reminder Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                  />
                </div>

                {/* Reminder Time */}
                <div className="space-y-2">
                  <Label htmlFor="time">Reminder Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Reminder Method */}
              <div className="space-y-2">
                <Label>Reminder Method</Label>
                <Select value={reminderMethod} onValueChange={setReminderMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">📧 Email Notification</SelectItem>
                    <SelectItem value="sms">📱 SMS Text</SelectItem>
                    <SelectItem value="dashboard">🖥️ Dashboard Alert</SelectItem>
                    <SelectItem value="all">🔔 All Methods</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reminder Note */}
              <div className="space-y-2">
                <Label htmlFor="note">Reminder Note</Label>
                <Textarea
                  id="note"
                  placeholder="Add a custom note for this reminder..."
                  value={reminderNote}
                  onChange={(e) => setReminderNote(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Preview Card */}
              {reminderDate && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">📅 Reminder Preview</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p><strong>When:</strong> {new Date(reminderDate + 'T' + reminderTime).toLocaleString()}</p>
                      <p><strong>For:</strong> {selectedMember.full_name}'s {reminderType}</p>
                      <p><strong>Method:</strong> {reminderMethod}</p>
                      {reminderNote && <p><strong>Note:</strong> {reminderNote}</p>}
                    </div>
                  </CardContent>
                </Card>
              )}
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
                onClick={handleSetReminder}
                disabled={!selectedMember || !reminderDate}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Bell className="h-4 w-4 mr-2" />
                Set Reminder
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
