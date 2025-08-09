"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Member } from "@/lib/supabase"
import { Gift, Mail, MessageCircle, Phone, Cake } from 'lucide-react'
import { toast } from "sonner"

interface WishBirthdayModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: Member | null
  onMemberWished: (memberId: string) => void
}

export function WishBirthdayModal({
  open,
  onOpenChange,
  member,
  onMemberWished
}: WishBirthdayModalProps) {
  const [wishMethod, setWishMethod] = useState<string>("")
  const [customMessage, setCustomMessage] = useState("")
  const [sending, setSending] = useState(false)

  if (!member) return null

  const calculateAge = (birthDate: Date) => {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const age = member.date_of_birth ? calculateAge(new Date(member.date_of_birth)) : 0

  const defaultMessages = {
    formal: `🎉 Happy Birthday ${member.full_name}! 🎂\n\nWishing you a wonderful ${age}th birthday filled with joy, success, and beautiful moments. May this new year of your life bring you happiness, good health, and all your heart desires.\n\nBest regards,\nTeens Aloud Foundation Family`,
    
    friendly: `🎈 Happy Birthday ${member.full_name}! 🎉\n\nHope your special day is absolutely amazing! Here's to another year of awesomeness and making great memories. Enjoy your ${age}th birthday celebration! 🎂✨\n\nWith love,\nYour Teens Aloud Family`,
    
    short: `🎂 Happy ${age}th Birthday ${member.full_name}! 🎉\n\nWishing you joy, success, and happiness on your special day!\n\n❤️ Teens Aloud Foundation`
  }

  const handleSendWish = async () => {
    if (!wishMethod) {
      toast.error("Please select a wish method")
      return
    }

    setSending(true)

    try {
      const message = customMessage || defaultMessages.friendly

      switch (wishMethod) {
        case 'email':
          if (member.email || member.second_email) {
            const email = member.email || member.second_email
            const subject = encodeURIComponent(`🎉 Happy Birthday ${member.full_name}!`)
            const body = encodeURIComponent(message)
            window.open(`mailto:${email}?subject=${subject}&body=${body}`)
          } else {
            toast.error("No email address available for this member")
            setSending(false)
            return
          }
          break

        case 'whatsapp':
          if (member.active_phone_number || member.other_phone_number) {
            const phone = (member.active_phone_number || member.other_phone_number)?.replace(/\D/g, '')
            const formattedMessage = encodeURIComponent(message)
            window.open(`https://wa.me/${phone}?text=${formattedMessage}`)
          } else {
            toast.error("No phone number available for this member")
            setSending(false)
            return
          }
          break

        case 'sms':
          if (member.active_phone_number || member.other_phone_number) {
            const phone = member.active_phone_number || member.other_phone_number
            const formattedMessage = encodeURIComponent(message)
            window.open(`sms:${phone}?body=${formattedMessage}`)
          } else {
            toast.error("No phone number available for this member")
            setSending(false)
            return
          }
          break

        case 'call':
          if (member.active_phone_number || member.other_phone_number) {
            const phone = member.active_phone_number || member.other_phone_number
            window.open(`tel:${phone}`)
          } else {
            toast.error("No phone number available for this member")
            setSending(false)
            return
          }
          break
      }

      // Mark as wished after a short delay
      setTimeout(() => {
        onMemberWished(member.id)
        toast.success(`Birthday wish sent to ${member.full_name}! 🎉`)
        setSending(false)
        setCustomMessage("")
        setWishMethod("")
      }, 1000)

    } catch {
      toast.error("Failed to send birthday wish")
      setSending(false)
    }
  }

  const resetForm = () => {
    setCustomMessage("")
    setWishMethod("")
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open)
      if (!open) resetForm()
    }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Cake className="h-6 w-6 text-pink-500" />
            Send Birthday Wish
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Member Info */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {member.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{member.full_name}</h3>
              <p className="text-sm text-gray-600">Turning {age} today! 🎂</p>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                {(member.email || member.second_email) && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </span>
                )}
                {(member.active_phone_number || member.other_phone_number) && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone
                  </span>
                )}
                {member.on_associate_whatsapp && (
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    WhatsApp
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Wish Method Selection */}
          <div className="space-y-2">
            <Label htmlFor="wish-method">How would you like to send the wish?</Label>
            <Select value={wishMethod} onValueChange={setWishMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select a method..." />
              </SelectTrigger>
              <SelectContent>
                {(member.email || member.second_email) && (
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  </SelectItem>
                )}
                {member.on_associate_whatsapp && (member.active_phone_number || member.other_phone_number) && (
                  <SelectItem value="whatsapp">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </div>
                  </SelectItem>
                )}
                {(member.active_phone_number || member.other_phone_number) && (
                  <SelectItem value="sms">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      SMS
                    </div>
                  </SelectItem>
                )}
                {(member.active_phone_number || member.other_phone_number) && (
                  <SelectItem value="call">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Call
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Message Templates */}
          {wishMethod && wishMethod !== 'call' && (
            <div className="space-y-3">
              <Label>Quick Message Templates</Label>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCustomMessage(defaultMessages.friendly)}
                  className="text-left justify-start h-auto p-3"
                >
                  <div>
                    <div className="font-medium">Friendly</div>
                    <div className="text-xs text-gray-500 truncate">Hope your special day is absolutely amazing...</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCustomMessage(defaultMessages.formal)}
                  className="text-left justify-start h-auto p-3"
                >
                  <div>
                    <div className="font-medium">Formal</div>
                    <div className="text-xs text-gray-500 truncate">Wishing you a wonderful birthday filled with joy...</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCustomMessage(defaultMessages.short)}
                  className="text-left justify-start h-auto p-3"
                >
                  <div>
                    <div className="font-medium">Short & Sweet</div>
                    <div className="text-xs text-gray-500 truncate">Happy Birthday! Wishing you joy and success...</div>
                  </div>
                </Button>
              </div>
            </div>
          )}

          {/* Custom Message */}
          {wishMethod && wishMethod !== 'call' && (
            <div className="space-y-2">
              <Label htmlFor="custom-message">Custom Message (Optional)</Label>
              <Textarea
                id="custom-message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Write a personal birthday message..."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Leave empty to use the friendly template
              </p>
            </div>
          )}

          {wishMethod === 'call' && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <Phone className="h-4 w-4 inline mr-1" />
                This will open your phone app to call {member.full_name} directly.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendWish}
            disabled={!wishMethod || sending}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Gift className="h-4 w-4 mr-2" />
                Send Birthday Wish
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
