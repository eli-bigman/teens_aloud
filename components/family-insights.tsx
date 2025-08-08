"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Heart, Baby, Calendar, Gift, Users, Cake } from "lucide-react"
import { Member } from "@/lib/supabase"

interface FamilyInsightsProps {
  members: Member[]
}

export function FamilyInsights({ members }: FamilyInsightsProps) {
  // Early return if no members data
  if (!members || members.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Users className="h-16 w-16 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-600">No Family Data Available</h3>
                <p className="text-gray-500 max-w-md">
                  {!members || members.length === 0 
                    ? "Add members with family information to see family insights, anniversaries, and children data."
                    : "Unable to load family data. Please check your database connection and try again."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const marriedMembers = members.filter((m) => m.relationship_status === "Married")
  const membersWithChildren = members.filter((m) => m.children && m.children.length > 0)
  const totalChildren = members.reduce((acc, m) => acc + (m.children?.length || 0), 0)

  // Upcoming family events
  const getUpcomingFamilyEvents = () => {
    const today = new Date()
    const events: Array<{
      type: "anniversary" | "child_birthday"
      memberName?: string
      spouseName?: string
      childName?: string
      parentName?: string
      date: Date
      daysUntil: number
      years?: number
      age?: number
    }> = []

    members.forEach((member) => {
      // Marriage anniversaries
      if (member.spouse && member.spouse.marriage_anniversary_date) {
        const anniversaryDate = new Date(member.spouse.marriage_anniversary_date)
        const thisYearAnniversary = new Date(today.getFullYear(), anniversaryDate.getMonth(), anniversaryDate.getDate())

        if (thisYearAnniversary < today) {
          thisYearAnniversary.setFullYear(today.getFullYear() + 1)
        }

        const daysUntil = Math.ceil((thisYearAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntil <= 60) {
          events.push({
            type: "anniversary",
            memberName: member.full_name,
            spouseName: member.spouse.full_name,
            date: thisYearAnniversary,
            daysUntil,
            years: today.getFullYear() - anniversaryDate.getFullYear(),
          })
        }
      }

      // Children birthdays
      if (member.children) {
        member.children.forEach((child) => {
          const childBirthDate = new Date(child.date_of_birth)
          const thisYearChildBirthday = new Date(
            today.getFullYear(),
            childBirthDate.getMonth(),
            childBirthDate.getDate(),
          )

          if (thisYearChildBirthday < today) {
            thisYearChildBirthday.setFullYear(today.getFullYear() + 1)
          }

          const daysUntil = Math.ceil((thisYearChildBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

          if (daysUntil <= 60) {
            events.push({
              type: "child_birthday",
              childName: child.full_name,
              parentName: member.full_name,
              date: thisYearChildBirthday,
              daysUntil,
              age: today.getFullYear() - childBirthDate.getFullYear(),
            })
          }
        })
      }
    })

    return events.sort((a, b) => a.daysUntil - b.daysUntil)
  }

  const upcomingEvents = getUpcomingFamilyEvents()

  // Family size distribution
  const familySizes = membersWithChildren.reduce(
    (acc, member) => {
      const childCount = member.children?.length || 0
      const size = childCount === 1 ? "1 child" : childCount === 2 ? "2 children" : `${childCount}+ children`
      acc[size] = (acc[size] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Children age groups
  const childrenAges = members
    .flatMap((m) => m.children || [])
    .map((child) => {
      const age = new Date().getFullYear() - new Date(child.date_of_birth).getFullYear()
      return age
    })

  const childAgeGroups = childrenAges.reduce(
    (acc, age) => {
      const group = age < 2 ? "Infant (0-1)" : age < 5 ? "Toddler (2-4)" : age < 13 ? "Child (5-12)" : "Teen (13+)"
      acc[group] = (acc[group] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-6">
      {/* Family Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100">Married Couples</p>
                <p className="text-2xl font-bold">{marriedMembers.length}</p>
              </div>
              <Heart className="h-8 w-8 text-teal-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100">Families with Children</p>
                <p className="text-2xl font-bold">{membersWithChildren.length}</p>
              </div>
              <Users className="h-8 w-8 text-amber-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-slate-500 to-gray-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-100">Total Children</p>
                <p className="text-2xl font-bold">{totalChildren}</p>
              </div>
              <Baby className="h-8 w-8 text-slate-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-lime-500 to-green-400 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lime-100">Upcoming Events</p>
                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-lime-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Family Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-red-500" />
            Upcoming Family Celebrations
          </CardTitle>
          <CardDescription>Anniversaries and children&apos;s birthdays in the next 60 days</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming family events in the next 60 days</p>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.slice(0, 10).map((event, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        event.type === "anniversary" ? "bg-red-500" : "bg-blue-500"
                      } text-white`}
                    >
                      {event.type === "anniversary" ? <Heart className="h-5 w-5" /> : <Cake className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {event.type === "anniversary"
                          ? `${event.memberName} & ${event.spouseName}`
                          : `${event.childName}'s Birthday`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {event.type === "anniversary"
                          ? `${event.years} years of marriage • Parent: ${event.memberName}`
                          : `Turning ${event.age} • Parent: ${event.parentName}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {event.date.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={event.daysUntil <= 7 ? "destructive" : "secondary"}>
                    {event.daysUntil === 0 ? "Today" : event.daysUntil === 1 ? "Tomorrow" : `${event.daysUntil} days`}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Family Composition */}
        <Card>
          <CardHeader>
            <CardTitle>Family Composition</CardTitle>
            <CardDescription>Distribution of family sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(familySizes).map(([size, count]) => (
              <div key={size} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{size}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{count} families</Badge>
                    <span className="text-sm text-gray-500">
                      {Math.round((count / membersWithChildren.length) * 100)}%
                    </span>
                  </div>
                </div>
                <Progress value={(count / membersWithChildren.length) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Children Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Children Age Groups</CardTitle>
            <CardDescription>Age distribution of all children</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(childAgeGroups).map(([group, count]) => (
              <div key={group} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{group}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{count} children</Badge>
                    <span className="text-sm text-gray-500">{Math.round((count / totalChildren) * 100)}%</span>
                  </div>
                </div>
                <Progress value={(count / totalChildren) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Family Directory */}
      <Card>
        <CardHeader>
          <CardTitle>Family Directory</CardTitle>
          <CardDescription>Complete family information for all married members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {marriedMembers.map((member) => (
              <div key={member.id} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {member.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{member.full_name}</h3>
                      <p className="text-sm text-gray-600">
                        Born: {new Date(member.date_of_birth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    <Heart className="h-3 w-3 mr-1" />
                    Married
                  </Badge>
                </div>

                {member.spouse && (
                  <div className="ml-16 space-y-3">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="font-medium">Spouse: {member.spouse.full_name}</span>
                      <Badge variant="secondary" className="text-xs">
                        Born: {new Date(member.spouse.date_of_birth).toLocaleDateString()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">
                        Anniversary: {new Date(member.spouse.marriage_anniversary).toLocaleDateString()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {new Date().getFullYear() - new Date(member.spouse.marriage_anniversary).getFullYear()} years
                      </Badge>
                    </div>
                  </div>
                )}

                {member.children && member.children.length > 0 && (
                  <div className="ml-16 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Baby className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Children ({member.children.length}):</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
                      {member.children.map((child, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                          <span className="text-sm font-medium">{child.full_name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Age {new Date().getFullYear() - new Date(child.date_of_birth).getFullYear()}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(child.date_of_birth).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
