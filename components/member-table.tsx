"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Mail, Phone, MapPin, MoreHorizontal, Eye, Edit, MessageCircle, Calendar } from "lucide-react"

interface MemberTableProps {
  members: Member[]
  searchTerm: string
  filterBy: string
}

interface Member {
  id: number
  email: string
  full_name: string
  date_of_birth: string
  gender: string
  nationality: string
  active_phone_number: string
  currently_employed: boolean
  employer?: string
  looking_for_job?: boolean
  current_address: string
  on_whatsapp: boolean
  relationship_status: string
  tertiary_education: boolean
  school?: string
  spouse?: {
    id: number
    associate_id: number
    full_name: string
    date_of_birth: string
    marriage_anniversary: string
    have_children: boolean
    created_at: string
    updated_at: string
  } | null
  children?: Array<{
    id: number
    associate_id: number
    full_name: string
    date_of_birth: string
    created_at: string
    updated_at: string
  }>
}

export function MemberTable({ members, searchTerm, filterBy }: MemberTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.current_address.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = (() => {
      switch (filterBy) {
        case "employed":
          return member.currently_employed
        case "unemployed":
          return !member.currently_employed
        case "married":
          return member.relationship_status === "Married"
        case "single":
          return member.relationship_status === "Single"
        case "whatsapp":
          return member.on_whatsapp
        default:
          return true
      }
    })()

    return matchesSearch && matchesFilter
  })

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + itemsPerPage)

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
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

    const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntil
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Members Directory ({filteredMembers.length})</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Export CSV
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Birthday</TableHead>
                <TableHead>Family</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMembers.map((member) => {
                const age = calculateAge(member.date_of_birth)
                const daysUntilBirthday = getNextBirthday(member.date_of_birth)

                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {member.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.full_name}</div>
                          <div className="text-sm text-gray-500">
                            {member.gender} • Age {age}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-32">{member.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          <span>{member.active_phone_number}</span>
                        </div>
                        {member.on_whatsapp && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            WhatsApp
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        <span>{member.nationality}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 truncate max-w-32">{member.current_address}</div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={member.currently_employed ? "default" : "secondary"}>
                          {member.currently_employed ? "Employed" : "Job Seeking"}
                        </Badge>
                        {member.employer && (
                          <div className="text-xs text-gray-500 truncate max-w-24">{member.employer}</div>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {member.relationship_status}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {new Date(member.date_of_birth).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <Badge variant={daysUntilBirthday <= 7 ? "destructive" : "secondary"} className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {daysUntilBirthday === 0
                            ? "Today!"
                            : daysUntilBirthday === 1
                              ? "Tomorrow"
                              : `${daysUntilBirthday} days`}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        {member.spouse && (
                          <Badge variant="outline" className="text-xs">
                            Spouse: {member.spouse.full_name.split(" ")[0]}
                          </Badge>
                        )}
                        {member.children && member.children.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {member.children.length} child{member.children.length > 1 ? "ren" : ""}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Member
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="h-4 w-4 mr-2" />
                            Call Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredMembers.length)} of{" "}
              {filteredMembers.length} members
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
