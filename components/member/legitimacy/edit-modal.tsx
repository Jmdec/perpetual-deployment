"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

interface Legitimacy {
  id?: number
  alias: string
  chapter: string
  position: string
  status: "pending" | "approved" | "rejected"
  certificate_date?: string
}

interface Props {
  isOpen: boolean
  initialData?: Legitimacy
  onClose: () => void
  onSubmitSuccess: () => void
}

export default function MemberLegitimacyEditModal({ isOpen, initialData, onClose, onSubmitSuccess }: Props) {
  const [form, setForm] = useState<Legitimacy>({
    alias: "",
    chapter: "",
    position: "",
    status: "pending",
    certificate_date: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setForm({
        alias: initialData.alias,
        chapter: initialData.chapter,
        position: initialData.position,
        status: initialData.status,
        certificate_date: initialData.certificate_date || "",
      })
    } else {
      setForm({
        alias: "",
        chapter: "",
        position: "",
        status: "pending",
        certificate_date: "",
      })
    }
  }, [initialData, isOpen])

  const handleSubmit = async () => {
    // Validation
    if (!form.alias || !form.chapter || !form.position) {
      toast({ title: "Error", description: "Please fill all required fields.", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const url = `/api/legitimacy/${initialData?.id}`
      
      const payload = {
        alias: form.alias.trim(),
        chapter: form.chapter.trim(),
        position: form.position.trim(),
      }

      console.log("Updating legitimacy:", payload)

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      })

      const data = await res.json()
      console.log("Response:", data)
      
      if (res.ok && data.success) {
        toast({
          title: "Success",
          description: "Legitimacy request updated successfully.",
        })
        onSubmitSuccess()
        setTimeout(() => {
          onClose()
        }, 100)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Submit error:", error)
      toast({ title: "Error", description: "Server error", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Edit Legitimacy Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="alias">Alias *</Label>
            <Input 
              id="alias" 
              value={form.alias} 
              onChange={(e) => setForm({ ...form, alias: e.target.value })}
              disabled={form.status !== 'pending'}
              className={form.status !== 'pending' ? 'bg-gray-100 cursor-not-allowed' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chapter">Chapter *</Label>
            <Input 
              id="chapter" 
              value={form.chapter} 
              onChange={(e) => setForm({ ...form, chapter: e.target.value })}
              disabled={form.status !== 'pending'}
              className={form.status !== 'pending' ? 'bg-gray-100 cursor-not-allowed' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position *</Label>
            <Input 
              id="position" 
              value={form.position} 
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              disabled={form.status !== 'pending'}
              className={form.status !== 'pending' ? 'bg-gray-100 cursor-not-allowed' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Input 
              id="status" 
              value={form.status.charAt(0).toUpperCase() + form.status.slice(1)} 
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          {form.status !== 'pending' && (
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
              Only pending requests can be edited.
            </p>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={isSubmitting || form.status !== 'pending'}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}