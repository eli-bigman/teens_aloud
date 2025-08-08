"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Cake, Heart, Baby, Search, Filter, Briefcase, MessageCircle, Loader2, UserPlus, LogOut, Settings } from 'lucide-react'
import { BirthdayDashboard } from "@/components/birthday-dashboard"
import { MemberOverview } from "@/components/member-overview"
import { MemberTable } from "@/components/member-table"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { FamilyInsights } from "@/components/family-insights"
import { AddMemberModal } from "@/components/add-member-modal"
import { LoginScreen } from "@/components/login-screen"
import { AdminManagement } from "@/components/admin-management"
import { createBrowserClient } from "@/lib/supabase/client"
import { Member } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export default function AdminDashboard() {
  const { admin, loading: authLoading, login, logout, isAuthenticated } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState("all")
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false)
  const [tablesExist, setTablesExist] = useState<boolean | null>(null)

  // Initialize Supabase client
  const supabase = createBrowserClient()

  useEffect(() => {
    if (isAuthenticated) {
      checkTablesAndFetchMembers()
    }
  }, [isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

  // Show login screen if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} />
  }

  const checkTablesExist = async () => {
    try {
      // Test if tables exist by trying a simple query with limit 0
      const { error } = await supabase
        .from("members")
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
      
      const exist = await checkTablesExist()
      setTablesExist(exist)
      
      if (exist) {
        await fetchMembersOnly()
      } else {
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
      
      
      // Fetch all members
      const { data: allMembers, error: allMembersError } = await supabase
        .from("members")
        .select("*")
        .order("full_name")

      if (allMembersError) {
        console.error('Members fetch error:', allMembersError)
        throw allMembersError
      }

      
      

      // If no members, just return empty array
      if (!allMembers || allMembers.length === 0) {
        setMembers([])
        return
      }

      // Fetch spouses
      let spousesData = []
      try {
        const { data, error: spousesError } = await supabase
          .from("member_spouses")
          .select("*")

        if (spousesError && spousesError.code !== '42P01') {
          throw spousesError
        }
        spousesData = data || []
      } catch (err) {
        console.warn('Member spouses table may not exist yet:', err)
      }

      // Fetch children
      let childrenData = []
      try {
        const { data, error: childrenError } = await supabase
          .from("member_children")
          .select("*")

        if (childrenError && childrenError.code !== '42P01') {
          throw childrenError
        }
        childrenData = data || []
      } catch (err) {
        console.warn('Member children table may not exist yet:', err)
      }

      // Combine the data
      const membersWithRelations = allMembers.map(member => {
        const spouse = spousesData.find(s => s.member_id === member.id)
        const children = childrenData.filter(c => c.member_id === member.id)
        
        return {
          ...member,
          spouse: spouse || null,
          children: children || []
        }
      })

      
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
      if (!member.date_of_birth) return false
      const birthDate = new Date(member.date_of_birth)
      const currentMonth = new Date().getMonth()
      return birthDate.getMonth() === currentMonth
    } catch {
      return false
    }
  }).length || 0

  const anniversariesThisMonth = members?.filter((member) => {
    try {
      if (!member.spouse?.marriage_anniversary_date) return false
      const anniversaryDate = new Date(member.spouse.marriage_anniversary_date)
      const currentMonth = new Date().getMonth()
      return anniversaryDate.getMonth() === currentMonth
    } catch {
      return false
    }
  }).length || 0

  const employedMembers = members?.filter((m) => m.currently_employed).length || 0
  const whatsappMembers = members?.filter((m) => m.on_associate_whatsapp).length || 0

  // WhatsApp group handler with email functionality
  const handleWhatsAppShare = () => {
    const whatsappGroupLink = "https://chat.whatsapp.com/JfNae8QhqELAxwscQYmciS"
    const adminEmail = admin?.email || ""
    
    // Email subject and body
    const emailSubject = encodeURIComponent("Teens Aloud Foundation - Associates WhatsApp Group")
    const emailBody = encodeURIComponent(`Hello ${admin?.full_name || 'Admin'},

You can join the Teens Aloud Foundation Associates WhatsApp Group using the link below:

${whatsappGroupLink}

This group is for all Associates to stay connected, share updates, and collaborate on foundation activities.

Best regards,
Teens Aloud Foundation Admin Dashboard`)

    // Create email link
    const emailLink = `mailto:${adminEmail}?subject=${emailSubject}&body=${emailBody}`
    
    // Open WhatsApp link in new tab
    window.open(whatsappGroupLink, '_blank')
    
    // Show success message with option to email the link
    toast.success("WhatsApp group opened!", {
      description: "Click here to email the link to yourself",
      action: {
        label: "Email Link",
        onClick: () => {
          window.location.href = emailLink
        }
      },
      duration: 5000
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Logo Section */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-sm opacity-75 animate-pulse"></div>
                <Image
                  src="/associate_fellowship.png"
                  alt="Associates Fellowship Logo"
                  width={80}
                  height={80}
                  className="relative rounded-full border-4 border-white shadow-lg ring-2 ring-blue-500/20"
                  style={{ borderRadius: '50%' }}
                />
              </div>
              <div className="hidden sm:block">
                <h2 className="text-lg font-bold text-gray-800">Associates</h2>
                <p className="text-sm text-gray-600">Fellowship</p>
              </div>
            </div>

            {/* Center Title Section */}
            <div className="text-center flex-1 space-y-3">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TEENS ALOUD FOUNDATION
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 font-medium">Associates Admin Dashboard</p>
              </div>
              
              {/* Stats Bar */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">{totalMembers} Active Members</span>
                </div>
                
                {error && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full border border-red-200">
                    <span className="text-red-700 font-medium">Error: {error}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium">System Online</span>
                </div>
              </div>
            </div>

            {/* Admin Info & Actions */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Admin Profile Card */}
              <div className="hidden md:flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {admin?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AD'}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-medium">Welcome back,</p>
                  <p className="text-sm font-bold text-gray-800 truncate max-w-[120px]" title={admin?.full_name}>
                    {admin?.full_name || 'Administrator'}
                  </p>
                </div>
              </div>

              {/* Mobile Admin Info */}
              <div className="md:hidden flex items-center gap-2 p-2 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {admin?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AD'}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate">
                  {admin?.full_name?.split(' ')[0] || 'Admin'}
                </span>
              </div>

              {/* WhatsApp Group Button */}
              <Button
                variant="outline"
                onClick={() => handleWhatsAppShare()}
                className="flex items-center gap-2 px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 hover:border-green-300 transition-all duration-200 rounded-xl"
                title="Join Associates WhatsApp Group"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">WhatsApp Group</span>
              </Button>

              {/* Logout Button */}
              <Button
                variant="outline"
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200 rounded-xl"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
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
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg p-4 mb-6">
          <Tabs defaultValue="birthdays" className="space-y-6">
            {/* Desktop Tabs */}
            <div className="hidden md:block">
              <TabsList className="grid w-full grid-cols-6 bg-gray-50/80 backdrop-blur-sm rounded-xl p-1.5 border border-gray-200/50">
                <TabsTrigger 
                  value="birthdays" 
                  className="flex items-center gap-2 px-4 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                >
                  <Cake className="h-4 w-4" />
                  <span>Birthdays</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="overview" 
                  className="flex items-center gap-2 px-4 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                >
                  <Users className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="members" 
                  className="flex items-center gap-2 px-4 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                >
                  <Search className="h-4 w-4" />
                  <span>Members</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="flex items-center gap-2 px-4 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Analytics</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="family" 
                  className="flex items-center gap-2 px-4 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                >
                  <Baby className="h-4 w-4" />
                  <span>Family</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="admin" 
                  className="flex items-center gap-2 px-4 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Mobile Tabs - Horizontal Scrollable */}
            <div className="md:hidden">
              <TabsList className="flex w-full justify-start gap-2 bg-gray-50/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 overflow-x-auto">
                <TabsTrigger 
                  value="birthdays" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md whitespace-nowrap transition-all duration-200 min-w-fit"
                >
                  <Cake className="h-4 w-4" />
                  <span className="text-sm">Birthdays</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="overview" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md whitespace-nowrap transition-all duration-200 min-w-fit"
                >
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Overview</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="members" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md whitespace-nowrap transition-all duration-200 min-w-fit"
                >
                  <Search className="h-4 w-4" />
                  <span className="text-sm">Members</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md whitespace-nowrap transition-all duration-200 min-w-fit"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Analytics</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="family" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md whitespace-nowrap transition-all duration-200 min-w-fit"
                >
                  <Baby className="h-4 w-4" />
                  <span className="text-sm">Family</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="admin" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md whitespace-nowrap transition-all duration-200 min-w-fit"
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">Admin</span>
                </TabsTrigger>
              </TabsList>
            </div>

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

          <TabsContent value="admin">
            <AdminManagement currentAdmin={admin!} />
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
  </div>
  )

}

