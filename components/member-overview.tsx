"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MapPin, Briefcase, GraduationCap, MessageCircle, Heart, Baby } from "lucide-react"

interface Member {
  id: number
  fullName: string
  nationality: string
  employed: boolean
  onWhatsApp: boolean
  relationshipStatus: string
  tertiaryEducation: boolean
  children?: Array<{ fullName: string; dateOfBirth: string }>
}

interface MemberOverviewProps {
  members: Member[]
}

export function MemberOverview({ members }: MemberOverviewProps) {
  const totalMembers = members.length
  const employedMembers = members.filter((m) => m.employed).length
  const whatsappMembers = members.filter((m) => m.onWhatsApp).length
  const marriedMembers = members.filter((m) => m.relationshipStatus === "Married").length
  const educatedMembers = members.filter((m) => m.tertiaryEducation).length
  const membersWithChildren = members.filter((m) => m.children && m.children.length > 0).length

  const nationalityStats = members.reduce(
    (acc, member) => {
      acc[member.nationality] = (acc[member.nationality] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topNationalities = Object.entries(nationalityStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-green-600" />
              Employment Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Employed</span>
                <span className="font-medium">
                  {employedMembers}/{totalMembers}
                </span>
              </div>
              <Progress value={(employedMembers / totalMembers) * 100} className="h-2" />
            </div>
            <div className="flex justify-between items-center">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {Math.round((employedMembers / totalMembers) * 100)}% Employment Rate
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              WhatsApp Connectivity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>On WhatsApp</span>
                <span className="font-medium">
                  {whatsappMembers}/{totalMembers}
                </span>
              </div>
              <Progress value={(whatsappMembers / totalMembers) * 100} className="h-2" />
            </div>
            <div className="flex justify-between items-center">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {Math.round((whatsappMembers / totalMembers) * 100)}% Connected
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-purple-600" />
              Education Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tertiary Education</span>
                <span className="font-medium">
                  {educatedMembers}/{totalMembers}
                </span>
              </div>
              <Progress value={(educatedMembers / totalMembers) * 100} className="h-2" />
            </div>
            <div className="flex justify-between items-center">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {Math.round((educatedMembers / totalMembers) * 100)}% Educated
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              Geographic Distribution
            </CardTitle>
            <CardDescription>Top 5 countries by member count</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topNationalities.map(([country, count]) => (
              <div key={country} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{country}</span>
                  <Badge variant="outline">{count} members</Badge>
                </div>
                <Progress value={(count / totalMembers) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-600" />
              Family Statistics
            </CardTitle>
            <CardDescription>Relationship and family insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Married Members</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{marriedMembers}</Badge>
                  <span className="text-sm text-gray-500">{Math.round((marriedMembers / totalMembers) * 100)}%</span>
                </div>
              </div>
              <Progress value={(marriedMembers / totalMembers) * 100} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Baby className="h-4 w-4" />
                  Members with Children
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{membersWithChildren}</Badge>
                  <span className="text-sm text-gray-500">
                    {Math.round((membersWithChildren / totalMembers) * 100)}%
                  </span>
                </div>
              </div>
              <Progress value={(membersWithChildren / totalMembers) * 100} className="h-2" />
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm text-gray-600">
                Total Children: {members.reduce((acc, m) => acc + (m.children?.length || 0), 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
          <CardDescription>Key observations about your member base</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{totalMembers}</div>
              <div className="text-sm text-blue-600">Total Members</div>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {Math.round((employedMembers / totalMembers) * 100)}%
              </div>
              <div className="text-sm text-green-600">Employment Rate</div>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">{Object.keys(nationalityStats).length}</div>
              <div className="text-sm text-purple-600">Countries Represented</div>
            </div>

            <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">
                {members.reduce((acc, m) => acc + (m.children?.length || 0), 0)}
              </div>
              <div className="text-sm text-orange-600">Total Children</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
