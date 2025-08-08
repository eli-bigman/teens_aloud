"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, MapPin, Briefcase, GraduationCap, BarChart3 } from "lucide-react"
import { Member } from "@/lib/supabase"

interface AnalyticsDashboardProps {
  members: Member[]
}

export function AnalyticsDashboard({ members }: AnalyticsDashboardProps) {
  // Early return if no members data
  if (!members || members.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <BarChart3 className="h-16 w-16 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-600">No Analytics Data Available</h3>
                <p className="text-gray-500 max-w-md">
                  {!members || members.length === 0 
                    ? "Add members to your database to see detailed analytics and insights about your community."
                    : "Unable to load analytics data. Please check your database connection and try again."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Age distribution
  const ageGroups = members.filter(member => member.date_of_birth).reduce(
    (acc, member) => {
      const age = new Date().getFullYear() - new Date(member.date_of_birth!).getFullYear()
      const group = age < 25 ? "18-24" : age < 30 ? "25-29" : age < 35 ? "30-34" : age < 40 ? "35-39" : "40+"
      acc[group] = (acc[group] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const ageData = Object.entries(ageGroups).map(([age, count]) => ({ age, count }))

  // Birth month distribution
  const birthMonths = members.filter(member => member.date_of_birth).reduce(
    (acc, member) => {
      const month = new Date(member.date_of_birth!).toLocaleDateString("en-US", { month: "short" })
      acc[month] = (acc[month] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const monthData = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
    (month) => ({
      month,
      count: birthMonths[month] || 0,
    }),
  )

  // Employment vs Education
  const employmentEducationData = [
    {
      category: "Employed + Educated",
      count: members.filter((m) => m.currently_employed && m.completed_tertiary).length,
    },
    {
      category: "Employed + No Tertiary",
      count: members.filter((m) => m.currently_employed && !m.completed_tertiary).length,
    },
    {
      category: "Unemployed + Educated",
      count: members.filter((m) => !m.currently_employed && m.completed_tertiary).length,
    },
    {
      category: "Unemployed + No Tertiary",
      count: members.filter((m) => !m.currently_employed && !m.completed_tertiary).length,
    },
  ]

  // Nationality distribution
  const nationalityStats = members.reduce(
    (acc, member) => {
      const nationality = member.nationality || 'Unknown'
      acc[nationality] = (acc[nationality] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const nationalityData = Object.entries(nationalityStats)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)

  // Relationship status
  const relationshipData = members.reduce(
    (acc, member) => {
      const status = member.relationship_status || 'Unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const relationshipChartData = Object.entries(relationshipData).map(([status, count]) => ({
    status,
    count,
    percentage: Math.round((count / members.length) * 100),
  }))

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1"]

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Age</p>
                <p className="text-2xl font-bold">
                  {members.length > 0 
                    ? Math.round(
                        members.filter(m => m.date_of_birth).reduce((acc, m) => {
                          const age = new Date().getFullYear() - new Date(m.date_of_birth!).getFullYear()
                          return acc + age
                        }, 0) / members.filter(m => m.date_of_birth).length,
                      )
                    : 0
                  }
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Countries</p>
                <p className="text-2xl font-bold">{Object.keys(nationalityStats).length}</p>
              </div>
              <MapPin className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Employment Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round((members.filter((m) => m.currently_employed).length / members.length) * 100)}%
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Education Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round((members.filter((m) => m.completed_tertiary).length / members.length) * 100)}%
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
            <CardDescription>Member count by age groups</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Birth Month Distribution</CardTitle>
            <CardDescription>When do most birthdays occur?</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Relationship Status</CardTitle>
            <CardDescription>Marital status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={relationshipChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percentage }) => `${status} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {relationshipChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment vs Education</CardTitle>
            <CardDescription>Career and education correlation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employmentEducationData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>Member distribution by nationality</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {nationalityData.map((item) => (
              <div key={item.country} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{item.country}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{item.count} members</Badge>
                    <span className="text-sm text-gray-500">{Math.round((item.count / members.length) * 100)}%</span>
                  </div>
                </div>
                <Progress value={(item.count / members.length) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>Data-driven observations about your member base</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Demographics</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Most members are in the {Object.entries(ageGroups).sort(([, a], [, b]) => b - a)[0][0]} age group
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {nationalityData[0].country} has the highest representation ({nationalityData[0].count} members)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  {Math.round(
                    (members.filter((m) => m.relationship_status === "Married").length / members.length) * 100,
                  )}
                  % of members are married
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Professional</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  {Math.round((members.filter((m) => m.currently_employed).length / members.length) * 100)}% employment
                  rate across all members
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  {Math.round((members.filter((m) => m.completed_tertiary).length / members.length) * 100)}% have
                  tertiary education
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  Strong correlation between education and employment
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
