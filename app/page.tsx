"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Cake, Heart, Baby, Search, Filter, Briefcase, MessageCircle, Loader2, UserPlus } from 'lucide-react'
import { BirthdayDashboard } from "@/components/birthday-dashboard"
import { MemberOverview } from "@/components/member-overview"
import { MemberTable } from "@/components/member-table"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { FamilyInsights } from "@/components/family-insights"
import { AddMemberModal } from "@/components/add-member-modal"
import { createBrowserClient } from "@/lib/supabase/client"
import { Associate } from "@/lib/supabase"
import { toast } from "sonner"

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState("all")
  const [members, setMembers] = useState<Associate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false)
  const [tablesExist, setTablesExist] = useState<boolean | null>(null)

  // Initialize Supabase client
  const supabase = createBrowserClient()

  useEffect(() => {
    checkTablesAndFetchMembers()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkTablesExist = async () => {
    try {
      // Test if tables exist by trying a simple query with limit 0
      const { error } = await supabase
        .from("associates")
        .select("id")
        .limit(0)

      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('relation')) {
          return false // Tables don't exist
        }
        throw error // Other database error
      }
      return true // Tables exist
    } catch (error) {
      console.error('Error checking tables:', error)
      throw error
    }
  }

  const checkTablesAndFetchMembers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Checking if tables exist...')
      const exist = await checkTablesExist()
      setTablesExist(exist)
      
      if (exist) {
        console.log('Tables exist, fetching members...')
        await fetchMembersOnly()
      } else {
        console.log('Tables do not exist, showing empty state')
        setMembers([])
      }
    } catch (err) {
      console.error("Error during initialization:", err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Database connection error: ${errorMessage}`)
      setTablesExist(false)
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMembersOnly = async () => {
    try {
      console.log('Fetching members from existing tables...')
      
      // Fetch all associates
      const { data: allAssociates, error: allAssociatesError } = await supabase
        .from("associates")
        .select("*")
        .order("full_name")

      if (allAssociatesError) {
        console.error('Associates fetch error:', allAssociatesError)
        throw allAssociatesError
      }

      console.log('Fetched associates:', allAssociates?.length || 0)
      console.log('Associates data:', allAssociates)

      // If no associates, just return empty array
      if (!allAssociates || allAssociates.length === 0) {
        setMembers([])
        return
      }

      // Fetch spouses
      let spousesData = []
      try {
        const { data, error: spousesError } = await supabase
          .from("spouses")
          .select("*")

        if (spousesError && spousesError.code !== '42P01') {
          throw spousesError
        }
        spousesData = data || []
      } catch (err) {
        console.warn('Spouses table may not exist yet:', err)
      }

      // Fetch children
      let childrenData = []
      try {
        const { data, error: childrenError } = await supabase
          .from("children")
          .select("*")

        if (childrenError && childrenError.code !== '42P01') {
          throw childrenError
        }
        childrenData = data || []
      } catch (err) {
        console.warn('Children table may not exist yet:', err)
      }

      // Combine the data
      const membersWithRelations = allAssociates.map(associate => {
        const spouse = spousesData.find(s => s.associate_id === associate.id)
        const children = childrenData.filter(c => c.associate_id === associate.id)
        
        return {
          ...associate,
          spouse: spouse || null,
          children: children || []
        }
      })

      console.log('Combined members with relations:', membersWithRelations.length)
      setMembers(membersWithRelations)
    } catch (err) {
      console.error("Error fetching members:", err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to fetch members: ${errorMessage}`)
      setMembers([])
    }
  }

  const handleAddMemberClick = async () => {
    // Check if tables exist before opening modal
    if (tablesExist === false) {
      // Tables don't exist, show instructions instead of auto-creating
      toast.error("Database Setup Required", {
        description: "Please set up the database tables first. Go to your Supabase project dashboard > SQL Editor and run the SQL scripts from the /scripts folder.",
        duration: 8000
      })
    } else {
      // Tables exist, just open the modal
      setAddMemberModalOpen(true)
    }
  }

  const handleMemberAdded = async () => {
    // After a member is added, refresh the data
    await checkTablesAndFetchMembers()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-700">Loading Dashboard...</h2>
          <p className="text-gray-500">Fetching member data from database</p>
        </div>
      </div>
    )
  }

  // Calculate stats from real data - safely handle empty arrays
  const totalMembers = members?.length || 0
  const birthdaysThisMonth = members?.filter((member) => {
    try {
      const birthDate = new Date(member.date_of_birth)
      const currentMonth = new Date().getMonth()
      return birthDate.getMonth() === currentMonth
    } catch {
      return false
    }
  }).length || 0

  const anniversariesThisMonth = members?.filter((member) => {
    try {
      if (!member.spouse?.marriage_anniversary) return false
      const anniversaryDate = new Date(member.spouse.marriage_anniversary)
      const currentMonth = new Date().getMonth()
      return anniversaryDate.getMonth() === currentMonth
    } catch {
      return false
    }
  }).length || 0

  const employedMembers = members?.filter((m) => m.currently_employed).length || 0
  const whatsappMembers = members?.filter((m) => m.on_whatsapp).length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">TEENS ALOUD FOUNDATION</h1>
          <p className="text-xl text-gray-600">Associates Admin Dashboard</p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{totalMembers} Active Members</span>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-600">
                <span>Error: {error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100">Birthdays This Month</p>
                  <p className="text-2xl font-bold">{birthdaysThisMonth}</p>
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
                  <p className="text-2xl font-bold">{anniversariesThisMonth}</p>
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
                  <p className="text-2xl font-bold">{employedMembers}</p>
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
                  <p className="text-2xl font-bold">{whatsappMembers}</p>
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
              <span className="hidden sm:inline">Birthdays</span>
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Members</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="family" className="flex items-center gap-2">
              <Baby className="h-4 w-4" />
              <span className="hidden sm:inline">Family</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="birthdays">
            <BirthdayDashboard members={members} />
          </TabsContent>

          <TabsContent value="overview">
            <MemberOverview members={members} />
          </TabsContent>

          <TabsContent value="members">
            <div className="space-y-4">
              {/* Header with Add Member Button */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold">Members Directory</h2>
                      <p className="text-sm text-gray-600">{totalMembers} active members</p>
                    </div>
                    <Button 
                      onClick={handleAddMemberClick}
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Add New Member
                    </Button>
                  </div>

                  {/* Search and Filter - only show if we have members */}
                  {members.length > 0 && (
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
                  )}
                </CardContent>
              </Card>

              {/* Content Area */}
              {members.length === 0 && !loading ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Members Found</h3>
                    <p className="text-gray-500 mb-4">
                      {tablesExist === false
                        ? "Database tables don't exist yet. Please set up the database tables first using the SQL scripts in the /scripts folder."
                        : error 
                          ? "There was an error loading members from the database." 
                          : "Start by adding your first member to the database."
                      }
                    </p>
                    {error && (
                      <div className="space-y-2">
                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
                        <div className="flex gap-2 justify-center">
                          <Button onClick={checkTablesAndFetchMembers} variant="outline" size="sm">
                            Try Again
                          </Button>
                        </div>
                      </div>
                    )}
                    {tablesExist === false && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg text-left">
                        <h4 className="font-semibold text-blue-800 mb-2">Database Setup Instructions:</h4>
                        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                          <li>Go to your Supabase project dashboard</li>
                          <li>Navigate to SQL Editor</li>
                          <li>Run the SQL scripts from the <code>/scripts/create-database-schema.sql</code> file</li>
                          <li>Refresh this page to start adding members</li>
                        </ol>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <MemberTable 
                  members={members} 
                  searchTerm={searchTerm} 
                  filterBy={filterBy} 
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard members={members} />
          </TabsContent>

          <TabsContent value="family">
            <FamilyInsights members={members} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Member Modal */}
      <AddMemberModal 
        open={addMemberModalOpen}
        onOpenChange={setAddMemberModalOpen}
        onMemberAdded={handleMemberAdded}
      />
    </div>
  )
}
