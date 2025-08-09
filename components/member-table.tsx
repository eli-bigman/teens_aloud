"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Member } from "@/lib/supabase"
import { MoreHorizontal, Mail, Phone, Edit, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { BirthdayEmailModal } from "@/components/birthday-email-modal"
import { BirthdayCallModal } from "@/components/birthday-call-modal"
import { EditMemberModal } from "@/components/edit-member-modal"

interface MemberTableProps {
  members: Member[]
  searchTerm: string
  filterBy: string
  onMemberUpdated: (updatedMember: Member) => void
}

export function MemberTable({ members, searchTerm, filterBy, onMemberUpdated }: MemberTableProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [callModalOpen, setCallModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  // Apply search filter
  const searchFilteredMembers = members.filter((member) =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.active_phone_number && member.active_phone_number.includes(searchTerm)) ||
    (member.nationality && member.nationality.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Apply additional filter
  const filteredMembers = searchFilteredMembers.filter((member) => {
    switch (filterBy) {
      case "employed":
        return member.currently_employed === true
      case "unemployed":
        return member.currently_employed === false || member.looking_for_job === true
      case "married":
        return member.relationship_status === "Married"
      case "single":
        return member.relationship_status === "Single"
      case "whatsapp":
        return member.on_associate_whatsapp === true
      case "all":
      default:
        return true
    }
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterBy])

  const calculateAge = (birthDate: string | null | undefined) => {
    if (!birthDate) return "N/A"
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  const handleEmailClick = (member: Member) => {
    setSelectedMember(member)
    setEmailModalOpen(true)
  }

  const handleCallClick = (member: Member) => {
    setSelectedMember(member)
    setCallModalOpen(true)
  }

  const handleEditClick = (member: Member) => {
    setSelectedMember(member)
    setEditModalOpen(true)
  }

  const handleViewClick = (member: Member) => {
    setSelectedMember(member)
    setViewModalOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Members Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Member</TableHead>
              <TableHead className="w-[180px]">Contact</TableHead>
              <TableHead className="w-[80px]">Age</TableHead>
              <TableHead className="w-[150px]">Location</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[120px]">Date Joined</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No members found matching your search." : "No members to display."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {getInitials(member.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          Member ID: {member.id.slice(0, 8)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {(member.email || member.second_email || member.active_email) && (
                        <div className="text-sm flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.email || member.second_email || member.active_email}
                        </div>
                      )}
                      {member.active_phone_number && (
                        <div className="text-sm flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {member.active_phone_number}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {calculateAge(member.date_of_birth)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    <div className="space-y-1">
                      {member.nationality && (
                        <div className="text-sm truncate">{member.nationality}</div>
                      )}
                      {member.current_address && (
                        <div className="text-xs text-muted-foreground truncate" title={member.current_address}>
                          {member.current_address}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={member.relationship_status === "Married" ? "default" : "secondary"}
                    >
                      {member.relationship_status || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(member.created_at)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewClick(member)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClick(member)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Member
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEmailClick(member)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCallClick(member)}>
                          <Phone className="mr-2 h-4 w-4" />
                          Make Call
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {filteredMembers.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredMembers.length)} of {filteredMembers.length} members
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}


      {/* Modals */}
      <BirthdayEmailModal 
        open={emailModalOpen} 
        onOpenChange={setEmailModalOpen}
        member={selectedMember}
        members={members}
      />
      <BirthdayCallModal 
        open={callModalOpen} 
        onOpenChange={setCallModalOpen}
        member={selectedMember}
        members={members}
      />
      <EditMemberModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        member={selectedMember}
        onMemberUpdated={onMemberUpdated}
      />

      {viewModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Member Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Full Name:</strong> {selectedMember.full_name}
                </div>
                <div>
                  <strong>Member ID:</strong> {selectedMember.id}
                </div>
                <div>
                  <strong>Date of Birth:</strong> {formatDate(selectedMember.date_of_birth)}
                </div>
                <div>
                  <strong>Age:</strong> {calculateAge(selectedMember.date_of_birth)}
                </div>
                <div>
                  <strong>Email:</strong> {selectedMember.email || selectedMember.second_email || selectedMember.active_email || "N/A"}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedMember.active_phone_number || "N/A"}
                </div>
                <div>
                  <strong>Nationality:</strong> {selectedMember.nationality || "N/A"}
                </div>
                <div>
                  <strong>Current Address:</strong> {selectedMember.current_address || "N/A"}
                </div>
                <div>
                  <strong>Relationship Status:</strong> {selectedMember.relationship_status || "N/A"}
                </div>
                <div>
                  <strong>Date Created:</strong> {formatDate(selectedMember.created_at)}
                </div>
              </div>
              {selectedMember.spouse && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Spouse Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Spouse Name:</strong> {selectedMember.spouse.full_name}
                    </div>
                    <div>
                      <strong>Date of Birth:</strong> {formatDate(selectedMember.spouse.date_of_birth)}
                    </div>
                    <div>
                      <strong>Marriage Anniversary:</strong> {formatDate(selectedMember.spouse.marriage_anniversary_date)}
                    </div>
                  </div>
                </div>
              )}
              {selectedMember.children && selectedMember.children.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Children ({selectedMember.children.length})</h4>
                  <div className="space-y-2">
                    {selectedMember.children.map((child, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 p-2 bg-gray-50 rounded">
                        <div>
                          <strong>Name:</strong> {child.full_name}
                        </div>
                        <div>
                          <strong>Date of Birth:</strong> {formatDate(child.date_of_birth)}
                        </div>
                        <div>
                          <strong>Age:</strong> {calculateAge(child.date_of_birth)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button onClick={() => setViewModalOpen(false)} className="mt-4">Close</Button>
          </div>
        </div>
      )}
    </div>
  )
}
