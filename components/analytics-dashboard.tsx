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
import { TrendingUp, MapPin, Briefcase, GraduationCap } from "lucide-react"

interface Member {
  id: number
  fullName: string
  dateOfBirth: string
  nationality: string
  employed: boolean
  tertiaryEducation: boolean
  relationshipStatus: string
  children?: Array<{ fullName: string; dateOfBirth: string }>
}

interface AnalyticsDashboardProps {
  members: Member[]
}

export function AnalyticsDashboard({ members }: AnalyticsDashboardProps) {
  // Age distribution
  const ageGroups = members.reduce(
    (acc, member) => {
      const age = new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear()
      const group = age < 25 ? "18-24" : age < 30 ? "25-29" : age < 35 ? "30-34" : age < 40 ? "35-39" : "40+"
      acc[group] = (acc[group] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const ageData = Object.entries(ageGroups).map(([age, count]) => ({ age, count }))

  // Birth month distribution
  const birthMonths = members.reduce(
    (acc, member) => {
      const month = new Date(member.dateOfBirth).toLocaleDateString("en-US", { month: "short" })
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
      count: members.filter((m) => m.employed && m.tertiaryEducation).length,
    },
    {
      category: "Employed + No Tertiary",
      count: members.filter((m) => m.employed && !m.tertiaryEducation).length,
    },
    {
      category: "Unemployed + Educated",
      count: members.filter((m) => !m.employed && m.tertiaryEducation).length,
    },
    {
      category: "Unemployed + No Tertiary",
      count: members.filter((m) => !m.employed && !m.tertiaryEducation).length,
    },
  ]

  // Nationality distribution
  const nationalityStats = members.reduce(
    (acc, member) => {
      acc[member.nationality] = (acc[member.nationality] || 0) + 1
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
      acc[member.relationshipStatus] = (acc[member.relationshipStatus] || 0) + 1
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
                  {Math.round(
                    members.reduce((acc, m) => {
                      const age = new Date().getFullYear() - new Date(m.dateOfBirth).getFullYear()
                      return acc + age
                    }, 0) / members.length,
                  )}
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
                  {Math.round((members.filter((m) => m.employed).length / members.length) * 100)}%
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
                  {Math.round((members.filter((m) => m.tertiaryEducation).length / members.length) * 100)}%
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
                    (members.filter((m) => m.relationshipStatus === "Married").length / members.length) * 100,
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
                  {Math.round((members.filter((m) => m.employed).length / members.length) * 100)}% employment rate
                  across all members
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  {Math.round((members.filter((m) => m.tertiaryEducation).length / members.length) * 100)}% have
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
