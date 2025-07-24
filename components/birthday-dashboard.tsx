"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Cake, Gift, Mail, Phone, Calendar, Clock, Bell } from "lucide-react"
import { useState, useEffect } from "react"

interface Member {
  id: number
  fullName: string
  dateOfBirth: string
  email: string
  phone: string
  spouse?: {
    fullName: string
    dateOfBirth: string
    marriageAnniversary: string
  }
  children?: Array<{
    fullName: string
    dateOfBirth: string
  }>
}

interface BirthdayDashboardProps {
  members: Member[]
}

export function BirthdayDashboard({ members }: BirthdayDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getUpcomingBirthdays = () => {
    const today = new Date()
    const upcoming = []

    members.forEach((member) => {
      // Member birthday
      const birthDate = new Date(member.dateOfBirth)
      const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())

      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1)
      }

      const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntil <= 30) {
        upcoming.push({
          type: "birthday",
          name: member.fullName,
          date: thisYearBirthday,
          daysUntil,
          age: today.getFullYear() - birthDate.getFullYear(),
          contact: { email: member.email, phone: member.phone },
          member,
        })
      }

      // Spouse birthday
      if (member.spouse) {
        const spouseBirthDate = new Date(member.spouse.dateOfBirth)
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
            name: `${member.spouse.fullName} (${member.fullName}'s spouse)`,
            date: thisYearSpouseBirthday,
            daysUntil: spouseDaysUntil,
            age: today.getFullYear() - spouseBirthDate.getFullYear(),
            contact: { email: member.email, phone: member.phone },
            member,
          })
        }
      }

      // Marriage anniversary
      if (member.spouse) {
        const anniversaryDate = new Date(member.spouse.marriageAnniversary)
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
            name: `${member.fullName} & ${member.spouse.fullName}`,
            date: thisYearAnniversary,
            daysUntil: anniversaryDaysUntil,
            age: today.getFullYear() - anniversaryDate.getFullYear(),
            contact: { email: member.email, phone: member.phone },
            member,
          })
        }
      }

      // Children birthdays
      if (member.children) {
        member.children.forEach((child) => {
          const childBirthDate = new Date(child.dateOfBirth)
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
              name: `${child.fullName} (${member.fullName}'s child)`,
              date: thisYearChildBirthday,
              daysUntil: childDaysUntil,
              age: today.getFullYear() - childBirthDate.getFullYear(),
              contact: { email: member.email, phone: member.phone },
              member,
            })
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
              <Bell className="h-5 w-5" />🎉 TODAY'S CELEBRATIONS!
            </CardTitle>
            <CardDescription className="text-red-600">Don't forget to send your greetings!</CardDescription>
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
                  <Button size="sm" variant="outline" className="flex items-center gap-1 bg-transparent">
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center gap-1 bg-transparent">
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
                  <Badge variant={event.daysUntil <= 3 ? "destructive" : "secondary"}>
                    {event.daysUntil === 1 ? "Tomorrow" : `${event.daysUntil} days`}
                  </Badge>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
              <Mail className="h-6 w-6" />
              <span className="text-sm">Send Birthday Email</span>
            </Button>
            <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
              <Phone className="h-6 w-6" />
              <span className="text-sm">Make Birthday Call</span>
            </Button>
            <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
              <Gift className="h-6 w-6" />
              <span className="text-sm">Plan Surprise</span>
            </Button>
            <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Set Reminder</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
