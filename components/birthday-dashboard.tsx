"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Cake, Gift, Mail, Phone, Calendar, Clock, Bell, Heart } from 'lucide-react'
import { useState, useEffect } from "react"
import { BirthdayEmailModal } from "@/components/birthday-email-modal"
import { BirthdayCallModal } from "@/components/birthday-call-modal"
import { SurpriseModal } from "@/components/surprise-modal"
import { ReminderModal } from "@/components/reminder-modal"
import { WishBirthdayModal } from "@/components/wish-birthday-modal"
import { Member } from "@/lib/supabase"

interface BirthdayDashboardProps {
  members: Member[]
}

export function BirthdayDashboard({ members }: BirthdayDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [callModalOpen, setCallModalOpen] = useState(false)
  const [surpriseModalOpen, setSurpriseModalOpen] = useState(false)
  const [reminderModalOpen, setReminderModalOpen] = useState(false)
  const [wishModalOpen, setWishModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [wishedMembers, setWishedMembers] = useState<Set<string>>(new Set())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getUpcomingBirthdays = () => {
    const today = new Date()
    const upcoming: Array<{
      type: "birthday" | "spouse_birthday" | "anniversary" | "child_birthday"
      name: string
      date: Date
      daysUntil: number
      age: number
      contact: { email: string; phone: string }
      member: Member
    }> = []

    members.forEach((member) => {
      // Member birthday
      if (member.date_of_birth) {
        const birthDate = new Date(member.date_of_birth)
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())

        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1)
        }

        const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntil <= 30) {
          upcoming.push({
            type: "birthday",
            name: member.full_name,
            date: thisYearBirthday,
            daysUntil,
            age: today.getFullYear() - birthDate.getFullYear(),
            contact: { 
              email: member.email || member.second_email || member.active_email || '', 
              phone: member.active_phone_number || '' 
            },
            member,
          })
        }
      }

      // Spouse birthday
      if (member.spouse && member.spouse.date_of_birth) {
        const spouseBirthDate = new Date(member.spouse.date_of_birth)
        const thisYearSpouseBirthday = new Date(
          today.getFullYear(),
          spouseBirthDate.getMonth(),
          spouseBirthDate.getDate(),
        )

        if (thisYearSpouseBirthday < today) {
          thisYearSpouseBirthday.setFullYear(today.getFullYear() + 1)
        }

        const spouseDaysUntil = Math.ceil((thisYearSpouseBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (spouseDaysUntil <= 30) {
          upcoming.push({
            type: "spouse_birthday",
            name: `${member.spouse.full_name} (${member.full_name}'s spouse)`,
            date: thisYearSpouseBirthday,
            daysUntil: spouseDaysUntil,
            age: today.getFullYear() - spouseBirthDate.getFullYear(),
            contact: { 
              email: member.email || member.second_email || member.active_email || '', 
              phone: member.active_phone_number || '' 
            },
            member,
          })
        }
      }

      // Marriage anniversary
      if (member.spouse && member.spouse.marriage_anniversary_date) {
        const anniversaryDate = new Date(member.spouse.marriage_anniversary_date)
        const thisYearAnniversary = new Date(today.getFullYear(), anniversaryDate.getMonth(), anniversaryDate.getDate())

        if (thisYearAnniversary < today) {
          thisYearAnniversary.setFullYear(today.getFullYear() + 1)
        }

        const anniversaryDaysUntil = Math.ceil(
          (thisYearAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        )

        if (anniversaryDaysUntil <= 30) {
          upcoming.push({
            type: "anniversary",
            name: `${member.full_name} & ${member.spouse.full_name}`,
            date: thisYearAnniversary,
            daysUntil: anniversaryDaysUntil,
            age: today.getFullYear() - anniversaryDate.getFullYear(),
            contact: { 
              email: member.email || member.second_email || member.active_email || '', 
              phone: member.active_phone_number || '' 
            },
            member,
          })
        }
      }

      // Children birthdays
      if (member.children) {
        member.children.forEach((child) => {
          if (child.date_of_birth) {
            const childBirthDate = new Date(child.date_of_birth)
            const thisYearChildBirthday = new Date(
              today.getFullYear(),
              childBirthDate.getMonth(),
              childBirthDate.getDate(),
            )

            if (thisYearChildBirthday < today) {
              thisYearChildBirthday.setFullYear(today.getFullYear() + 1)
            }

            const childDaysUntil = Math.ceil((thisYearChildBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

            if (childDaysUntil <= 30) {
              upcoming.push({
                type: "child_birthday",
                name: `${child.full_name} (${member.full_name}'s child)`,
                date: thisYearChildBirthday,
                daysUntil: childDaysUntil,
                age: today.getFullYear() - childBirthDate.getFullYear(),
                contact: { 
                  email: member.email || member.second_email || member.active_email || '', 
                  phone: member.active_phone_number || '' 
                },
                member,
              })
            }
          }
        })
      }
    })

    return upcoming.sort((a, b) => a.daysUntil - b.daysUntil)
  }

  const upcomingEvents = getUpcomingBirthdays()
  const todayEvents = upcomingEvents.filter((event) => event.daysUntil === 0)
  const thisWeekEvents = upcomingEvents.filter((event) => event.daysUntil > 0 && event.daysUntil <= 7)
  const thisMonthEvents = upcomingEvents.filter((event) => event.daysUntil > 7 && event.daysUntil <= 30)
  
  // Get members who have birthdays this week (including today) for dropdown filtering
  const thisWeekBirthdayMembers = members.filter(member => {
    if (!member.date_of_birth) return false
    
    const today = new Date()
    const birthDate = new Date(member.date_of_birth)
    const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
    
    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1)
    }
    
    const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntil >= 0 && daysUntil <= 7
  })

  const getEventIcon = (type: string) => {
    switch (type) {
      case "birthday":
      case "spouse_birthday":
      case "child_birthday":
        return <Cake className="h-5 w-5" />
      case "anniversary":
        return <Gift className="h-5 w-5" />
      default:
        return <Calendar className="h-5 w-5" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "birthday":
        return "bg-pink-500"
      case "spouse_birthday":
        return "bg-purple-500"
      case "child_birthday":
        return "bg-blue-500"
      case "anniversary":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleEmailClick = (member?: Member) => {
    setSelectedMember(member || null)
    setEmailModalOpen(true)
  }

  const handleCallClick = (member?: Member) => {
    setSelectedMember(member || null)
    setCallModalOpen(true)
  }

  const handleSurpriseClick = (member?: Member) => {
    setSelectedMember(member || null)
    setSurpriseModalOpen(true)
  }

  const handleReminderClick = (member?: Member) => {
    setSelectedMember(member || null)
    setReminderModalOpen(true)
  }

  const handleWishClick = (member?: Member) => {
    setSelectedMember(member || null)
    setWishModalOpen(true)
  }

  const handleMemberWished = (memberId: string) => {
    setWishedMembers(prev => new Set(prev).add(memberId))
  }

  return (
    <div className="space-y-6">
      {/* Current Time & Alert Banner */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Birthday Command Center</h2>
              <p className="text-indigo-100">Never miss a special moment!</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-mono font-bold">{currentTime.toLocaleTimeString()}</div>
              <div className="text-indigo-200">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Events */}
      {todayEvents.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Bell className="h-5 w-5" />🎉 TODAY&apos;S CELEBRATIONS!
            </CardTitle>
            <CardDescription className="text-red-600">Don&apos;t forget to send your greetings!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayEvents.map((event, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${getEventColor(event.type)} text-white`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{event.name}</h3>
                    <p className="text-sm text-gray-600">
                      {event.type === "anniversary" ? `${event.age} years together` : `Turning ${event.age}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex items-center gap-1 bg-transparent"
                    onClick={() => handleEmailClick(event.member)}
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex items-center gap-1 bg-transparent"
                    onClick={() => handleCallClick(event.member)}
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* This Week */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              This Week ({thisWeekEvents.length})
            </CardTitle>
            <CardDescription>Upcoming celebrations in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {thisWeekEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No events this week</p>
            ) : (
              thisWeekEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={getEventColor(event.type) + " text-white"}>
                        {event.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{event.name}</p>
                      <p className="text-xs text-gray-600">
                        {event.date.toLocaleDateString()} •{" "}
                        {event.type === "anniversary" ? `${event.age} years` : `Age ${event.age}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={event.daysUntil <= 3 ? "destructive" : "secondary"}>
                      {event.daysUntil === 1 ? "Tomorrow" : `${event.daysUntil} days`}
                    </Badge>
                    {event.type === "birthday" && (
                      <Button
                        size="sm"
                        variant={wishedMembers.has(event.member.id) ? "default" : "outline"}
                        className={`flex items-center gap-1 ${
                          wishedMembers.has(event.member.id)
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "hover:bg-pink-50"
                        }`}
                        onClick={() => handleWishClick(event.member)}
                      >
                        <Heart className={`h-3 w-3 ${wishedMembers.has(event.member.id) ? "fill-current" : ""}`} />
                        {wishedMembers.has(event.member.id) ? "Wished" : "Wish"}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* This Month */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              This Month ({thisMonthEvents.length})
            </CardTitle>
            <CardDescription>Plan ahead for upcoming celebrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {thisMonthEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No events this month</p>
            ) : (
              thisMonthEvents.slice(0, 5).map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getEventColor(event.type)} text-white`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{event.name}</p>
                      <p className="text-xs text-gray-600">{event.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{event.daysUntil} days</Badge>
                </div>
              ))
            )}
            {thisMonthEvents.length > 5 && (
              <p className="text-sm text-gray-500 text-center">+{thisMonthEvents.length - 5} more events this month</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Streamline your celebration workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Button 
              className="h-20 flex-col gap-2 bg-transparent" 
              variant="outline"
              onClick={() => handleEmailClick()}
            >
              <Mail className="h-6 w-6" />
              <span className="text-sm">Send Birthday Email</span>
            </Button>
            <Button 
              className="h-20 flex-col gap-2 bg-transparent" 
              variant="outline"
              onClick={() => handleCallClick()}
            >
              <Phone className="h-6 w-6" />
              <span className="text-sm">Make Birthday Call</span>
            </Button>
            <Button 
              className="h-20 flex-col gap-2 bg-transparent" 
              variant="outline"
              onClick={() => handleWishClick()}
            >
              <Heart className="h-6 w-6" />
              <span className="text-sm">Send Birthday Wish</span>
            </Button>
            <Button 
              className="h-20 flex-col gap-2 bg-transparent" 
              variant="outline"
              onClick={() => handleSurpriseClick()}
            >
              <Gift className="h-6 w-6" />
              <span className="text-sm">Plan Surprise</span>
            </Button>
            <Button 
              className="h-20 flex-col gap-2 bg-transparent" 
              variant="outline"
              onClick={() => handleReminderClick()}
            >
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Set Reminder</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <BirthdayEmailModal 
        open={emailModalOpen} 
        onOpenChange={setEmailModalOpen}
        member={selectedMember}
        members={thisWeekBirthdayMembers}
      />
      <BirthdayCallModal 
        open={callModalOpen} 
        onOpenChange={setCallModalOpen}
        member={selectedMember}
        members={thisWeekBirthdayMembers}
      />
      <SurpriseModal 
        open={surpriseModalOpen} 
        onOpenChange={setSurpriseModalOpen}
        member={selectedMember}
        members={thisWeekBirthdayMembers}
      />
      <ReminderModal 
        open={reminderModalOpen} 
        onOpenChange={setReminderModalOpen}
        member={selectedMember}
        members={thisWeekBirthdayMembers}
      />
      <WishBirthdayModal 
        open={wishModalOpen} 
        onOpenChange={setWishModalOpen}
        member={selectedMember}
        onMemberWished={handleMemberWished}
      />
    </div>
  )
}
