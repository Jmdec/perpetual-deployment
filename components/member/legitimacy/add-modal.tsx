"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

interface LegitimacyForm {
  alias: string
  chapter: string
  position: string
  fraternity_number: string
}

interface Props {
  isOpen: boolean
  initialData?: LegitimacyForm
  onClose: () => void
  onSubmitSuccess: () => void
}

export default function MemberLegitimacyModal({ isOpen, initialData, onClose, onSubmitSuccess }: Props) {
  const [form, setForm] = useState<LegitimacyForm>({
    alias: "",
    chapter: "",
    position: "",
    fraternity_number: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setForm(initialData)
    }
  }, [initialData])

  const handleSubmit = async () => {
    if (!form.alias || !form.chapter || !form.position || !form.fraternity_number) {
      toast({
        title: "Error",
        description: "All fields are required.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch("/api/legitimacy", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast({
          title: "Success",
          description: "Legitimacy request submitted.",
        })
        onSubmitSuccess()
        onClose()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to submit request.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Server error.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Request Certificate of Legitimacy</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Alias</Label>
            <Input value={form.alias} onChange={(e) => setForm({ ...form, alias: e.target.value })} />
          </div>

          <div>
            <Label>Chapter</Label>
            <Input value={form.chapter} onChange={(e) => setForm({ ...form, chapter: e.target.value })} />
          </div>

          <div>
            <Label>Position</Label>
            <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
          </div>

          <div>
            <Label>Fraternity Number</Label>
            <Input value={form.fraternity_number} onChange={(e) => setForm({ ...form, fraternity_number: e.target.value })} />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
