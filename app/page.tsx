"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Users, Cake, Heart, Baby, Search, Filter, Briefcase, MessageCircle } from "lucide-react"
import { BirthdayDashboard } from "@/components/birthday-dashboard"
import { MemberOverview } from "@/components/member-overview"
import { MemberTable } from "@/components/member-table"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { FamilyInsights } from "@/components/family-insights"

// Sample data - in a real app, this would come from your database
const sampleMembers = [
  {
    id: 1,
    email: "john.doe@email.com",
    fullName: "John Doe",
    dateOfBirth: "1995-03-15",
    gender: "Male",
    nationality: "Nigerian",
    phone: "+234-801-234-5678",
    employed: true,
    employer: "Tech Solutions Ltd",
    address: "Lagos, Nigeria",
    onWhatsApp: true,
    relationshipStatus: "Married",
    tertiaryEducation: true,
    school: "University of Lagos",
    yearOfCompletion: "2018",
    spouse: {
      fullName: "Jane Doe",
      dateOfBirth: "1997-07-22",
      marriageAnniversary: "2020-12-25",
    },
    children: [{ fullName: "Little John", dateOfBirth: "2022-05-10" }],
  },
  {
    id: 2,
    email: "sarah.wilson@email.com",
    fullName: "Sarah Wilson",
    dateOfBirth: "1993-11-08",
    gender: "Female",
    nationality: "Ghanaian",
    phone: "+233-24-567-8901",
    employed: false,
    lookingForJob: true,
    preferredWork: "Marketing",
    address: "Accra, Ghana",
    onWhatsApp: true,
    relationshipStatus: "Single",
    tertiaryEducation: true,
    school: "University of Ghana",
    yearOfCompletion: "2016",
  },
  {
    id: 3,
    email: "mike.johnson@email.com",
    fullName: "Michael Johnson",
    dateOfBirth: "1990-12-30",
    gender: "Male",
    nationality: "Kenyan",
    phone: "+254-70-123-4567",
    employed: true,
    employer: "Banking Corp",
    address: "Nairobi, Kenya",
    onWhatsApp: false,
    relationshipStatus: "Married",
    tertiaryEducation: true,
    school: "University of Nairobi",
    yearOfCompletion: "2014",
    spouse: {
      fullName: "Grace Johnson",
      dateOfBirth: "1992-04-18",
      marriageAnniversary: "2018-08-15",
    },
    children: [
      { fullName: "Emma Johnson", dateOfBirth: "2019-09-12" },
      { fullName: "David Johnson", dateOfBirth: "2021-03-25" },
    ],
  },
]

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState("all")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">TEENS ALOUD FOUNDATION</h1>
          <p className="text-xl text-gray-600">Associates Admin Dashboard</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>{sampleMembers.length} Active Members</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100">Birthdays This Month</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Cake className="h-8 w-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Anniversaries</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <Heart className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Employed Members</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
                <Briefcase className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">WhatsApp Active</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
                <MessageCircle className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="birthdays" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="birthdays" className="flex items-center gap-2">
              <Cake className="h-4 w-4" />
              Birthdays
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="family" className="flex items-center gap-2">
              <Baby className="h-4 w-4" />
              Family
            </TabsTrigger>
          </TabsList>

          <TabsContent value="birthdays">
            <BirthdayDashboard members={sampleMembers} />
          </TabsContent>

          <TabsContent value="overview">
            <MemberOverview members={sampleMembers} />
          </TabsContent>

          <TabsContent value="members">
            <div className="space-y-4">
              {/* Search and Filter */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search members by name, email, or location..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={filterBy} onValueChange={setFilterBy}>
                      <SelectTrigger className="w-full md:w-48">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Members</SelectItem>
                        <SelectItem value="employed">Employed</SelectItem>
                        <SelectItem value="unemployed">Job Seeking</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="whatsapp">On WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <MemberTable members={sampleMembers} searchTerm={searchTerm} filterBy={filterBy} />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard members={sampleMembers} />
          </TabsContent>

          <TabsContent value="family">
            <FamilyInsights members={sampleMembers} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
