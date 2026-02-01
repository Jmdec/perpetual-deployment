"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { Plus, X } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  fraternity_number: string
}

interface Signatory {
  id?: number
  name: string
  role?: string
  signed_date?: string
  signature_file?: File | null
  signature_url?: string
}

interface Legitimacy {
  id?: number
  alias: string
  chapter: string
  position: string
  fraternity_number: string
  status: "pending" | "approved" | "rejected"
  admin_note?: string | null
  certificate_date?: string
  certification_details?: string
  school_name?: string
  address?: string
  logo_url?: string
  signatories: Signatory[]
}

interface Props {
  isOpen: boolean
  mode: "create" | "edit"
  initialData?: Legitimacy
  onClose: () => void
  onSubmitSuccess: () => void
}

export default function AdminLegitimacyModal({ isOpen, mode, initialData, onClose, onSubmitSuccess }: Props) {
  const [form, setForm] = useState<Legitimacy>({
    alias: "",
    chapter: "",
    position: "",
    fraternity_number: "",
    status: "pending",
    admin_note: "",
    certificate_date: "",
    certification_details: "",
    school_name: "",
    address: "",
    logo_url: "",
    signatories: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [deletedSignatoryIds, setDeletedSignatoryIds] = useState<number[]>([])
  const [logoFile, setLogoFile] = useState<File | null>(null)

  // Fetch users with fraternity numbers
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true)
      try {
        const res = await fetch("/api/admin/users", {
          credentials: "include",
        })
        const data = await res.json()
        if (res.ok && data.success) {
          setUsers(data.data.data || data.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch users:", error)
      } finally {
        setLoadingUsers(false)
      }
    }

    if (isOpen && mode === "create") {
      fetchUsers()
    }
  }, [isOpen, mode])

  useEffect(() => {
    if (mode === "edit" && initialData) {
      const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || ""

      setForm({
        id: initialData.id, // 🔥 IMPORTANT: Store the ID in form state
        alias: initialData.alias,
        chapter: initialData.chapter,
        position: initialData.position,
        fraternity_number: initialData.fraternity_number,
        status: initialData.status,
        admin_note: initialData.admin_note || "",
        certificate_date: initialData.certificate_date || "",
        certification_details: initialData.certification_details || "",
        school_name: initialData.school_name || "",
        address: initialData.address || "",
        logo_url: initialData.logo_url || "",
        signatories:
          initialData.signatories?.map((sig) => ({
            id: sig.id,
            name: sig.name,
            role: sig.role || "",
            signed_date: sig.signed_date || "",
            signature_file: null,
            signature_url: sig.signature_url ? `${imageBaseUrl}${sig.signature_url}` : undefined,
          })) || [],
      })
      setDeletedSignatoryIds([])
      setLogoFile(null)
    } else {
      setForm({
        alias: "",
        chapter: "",
        position: "",
        fraternity_number: "",
        status: "pending",
        admin_note: "",
        certificate_date: "",
        certification_details: "",
        school_name: "",
        address: "",
        logo_url: "",
        signatories: [],
      })
      setDeletedSignatoryIds([])
      setLogoFile(null)
    }
  }, [mode, initialData, isOpen])

  const handleSignatoryChange = (index: number, key: keyof Signatory, value: string | File) => {
    const updated = [...form.signatories]
    updated[index] = { ...updated[index], [key]: value }
    setForm({ ...form, signatories: updated })
  }

  const addSignatory = () => {
    setForm({
      ...form,
      signatories: [...form.signatories, { name: "", signed_date: "", signature_file: null }],
    })
  }

  const removeSignatory = (index: number) => {
    const signatory = form.signatories[index]

    if (signatory.id) {
      setDeletedSignatoryIds([...deletedSignatoryIds, signatory.id])
    }

    const updated = form.signatories.filter((_, i) => i !== index)
    setForm({ ...form, signatories: updated })
  }

  const handleSubmit = async () => {
    // Validation
    if (!form.alias || !form.chapter || !form.position || !form.fraternity_number || !form.certificate_date) {
      toast({ title: "Error", description: "Please fill all required fields.", variant: "destructive" })
      return
    }

    // 🔥 CRITICAL: Validate that we have an ID when editing
    if (mode === "edit" && !form.id) {
      console.error("EDIT MODE ERROR: No legitimacy ID available", {
        form,
        initialData,
        formId: form.id,
        initialDataId: initialData?.id
      })
      toast({
        title: "Error",
        description: "Cannot update: Legitimacy ID is missing. Please close and reopen the modal.",
        variant: "destructive",
      })
      return
    }

    console.log("=== SUBMIT DEBUG ===", {
      mode,
      formId: form.id,
      initialDataId: initialData?.id,
      url: mode === "create" ? "/admin/legitimacy" : `/admin/legitimacy/${form.id}`
    })

    setIsSubmitting(true)
    try {
      const url =
        mode === "create"
          ? "/api/admin/legitimacy"
          : `/api/admin/legitimacy/${form.id}` // 🔥 USE form.id instead of initialData?.id

      console.log("Submitting to URL:", url, "Mode:", mode, "ID:", form.id)

      const payload = new FormData()

      payload.append("alias", form.alias)
      payload.append("chapter", form.chapter)
      payload.append("position", form.position)
      payload.append("fraternity_number", form.fraternity_number)
      payload.append("status", form.status)
      payload.append("certificate_date", form.certificate_date)
      payload.append("admin_note", form.admin_note || "")
      payload.append("certification_details", form.certification_details || "")
      payload.append("school_name", form.school_name || "")
      payload.append("address", form.address || "")




      // Add logo file if selected
      if (logoFile) {
        payload.append("logo_file", logoFile)
      }

      // Add deleted signatory IDs for update mode
      if (mode === "edit" && deletedSignatoryIds.length > 0) {
        deletedSignatoryIds.forEach((id) => {
          payload.append(`deleted_signatories[]`, id.toString())
        })
      }

      // Filter out signatories with empty names and add them properly indexed
      const validSignatories = form.signatories.filter(sig => sig.name.trim() !== "")

      validSignatories.forEach((sig, i) => {
        payload.append(`signatories[${i}][name]`, sig.name.trim())

        if (sig.id) {
          payload.append(`signatories[${i}][id]`, sig.id.toString())
        }

        if (sig.role && sig.role.trim()) {
          payload.append(`signatories[${i}][role]`, sig.role.trim())
        }

        if (sig.signed_date) {
          payload.append(`signatories[${i}][signed_date]`, sig.signed_date)
        }

        if (sig.signature_file instanceof File) {
          payload.append(`signatories[${i}][signature_file]`, sig.signature_file)
        }
      })

      const res = await fetch(url, {
        method: "POST",
        body: payload,
        credentials: "include",
      })

      const text = await res.text()
      let data = null

      try {
        data = text ? JSON.parse(text) : null
      } catch {
        console.error("Non-JSON response:", text)
      }

      if (res.ok && data?.success) {
        toast({
          title: "Success",
          description: `Legitimacy ${mode === "create" ? "created" : "updated"} successfully.`,
        })

        onSubmitSuccess()

        setTimeout(() => {
          onClose()
        }, 100)
      } else {
        toast({
          title: "Error",
          description: data?.message || data?.errors?.fraternity_number?.[0] || "Failed to save.",
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
      <DialogContent className="sm:max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Legitimacy Request" : "Edit Legitimacy Request"}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {/* Main Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fraternity-number">Fraternity Number *</Label>
                <Input
                  id="fraternity-number"
                  value={form.fraternity_number}
                  onChange={(e) => setForm({ ...form, fraternity_number: e.target.value })}
                  disabled={mode === "edit"}
                  className={` ${mode === "edit" ? "cursor-not-allowed bg-gray-100" : ""}`}
                />
              </div>

              <div>
                <Label htmlFor="alias">Alias *</Label>
                <Input id="alias" value={form.alias} onChange={(e) => setForm({ ...form, alias: e.target.value })} />
              </div>

              <div>
                <Label htmlFor="chapter">Chapter *</Label>
                <Input id="chapter" value={form.chapter} onChange={(e) => setForm({ ...form, chapter: e.target.value })} />
              </div>

              <div>
                <Label htmlFor="position">Position *</Label>
                <Input id="position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="border rounded px-3 py-2 w-full"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as Legitimacy["status"] })}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <Label htmlFor="certificate-date">Certificate Date *</Label>
                <Input
                  id="certificate-date"
                  type="date"
                  value={form.certificate_date || ""}
                  onChange={(e) => setForm({ ...form, certificate_date: e.target.value })}
                />
              </div>
            </div>

            {/* New Certificate Information Fields */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold">Certificate Information</h3>

              <div>
                <Label htmlFor="school-name">School Name</Label>
                <Input
                  id="school-name"
                  value={form.school_name || ""}
                  onChange={(e) => setForm({ ...form, school_name: e.target.value })}
                  placeholder="e.g., University of the Philippines"
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={form.address || ""}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g., Quezon City, Metro Manila"
                />
              </div>

              <div>
                <Label htmlFor="certification-details">Certification Details</Label>
                <Textarea
                  id="certification-details"
                  value={form.certification_details || ""}
                  onChange={(e) => setForm({ ...form, certification_details: e.target.value })}
                  className="resize-none"
                  rows={3}
                  placeholder="Additional certification details or notes"
                />
              </div>

              <div>
                <Label htmlFor="logo-file">Certificate Logo</Label>
                <Input
                  id="logo-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setLogoFile(file)
                    }
                  }}
                />
                {logoFile && <p className="text-xs text-green-600 mt-1">✓ New logo selected: {logoFile.name}</p>}
                {form.logo_url && !logoFile && (
                  <div className="mt-2">
                    <Label>Current Logo</Label>
                    <div className="mt-1 p-2 border rounded-md bg-white">
                      <img
                        src={form.logo_url}
                        alt="Certificate logo"
                        className="w-32 h-32 object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="admin-note">Admin Note</Label>
              <Textarea
                id="admin-note"
                value={form.admin_note || ""}
                onChange={(e) => setForm({ ...form, admin_note: e.target.value })}
                className="resize-none"
                rows={3}
              />
            </div>

            {/* Signatories */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Signatories</Label>
                <span className="text-xs text-gray-500">
                  {form.signatories.length} signator{form.signatories.length !== 1 ? "ies" : "y"}
                </span>
              </div>

              {form.signatories.map((sig, idx) => (
                <div key={sig.id ?? `new-${idx}`} className="flex flex-col gap-3 mb-4 p-4 border rounded-md bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label htmlFor={`signatory-name-${idx}`}>Name *</Label>
                      <Input
                        id={`signatory-name-${idx}`}
                        placeholder="Full name"
                        value={sig.name}
                        onChange={(e) => handleSignatoryChange(idx, "name", e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-red-500 p-2 ml-2 hover:bg-red-50"
                      onClick={() => removeSignatory(idx)}
                      aria-label="Remove signatory"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor={`signatory-role-${idx}`}>Role</Label>
                    <Input
                      id={`signatory-role-${idx}`}
                      placeholder="e.g., Founder, President"
                      value={sig.role || ""}
                      onChange={(e) => handleSignatoryChange(idx, "role", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`signatory-date-${idx}`}>Signed Date</Label>
                    <Input
                      id={`signatory-date-${idx}`}
                      type="date"
                      value={sig.signed_date || ""}
                      onChange={(e) => handleSignatoryChange(idx, "signed_date", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`signatory-file-${idx}`}>Signature Image</Label>
                    <Input
                      id={`signatory-file-${idx}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleSignatoryChange(idx, "signature_file", file)
                        }
                      }}
                    />
                    {sig.signature_file && <p className="text-xs text-green-600 mt-1">✓ New file selected: {sig.signature_file.name}</p>}
                  </div>

                  {sig.signature_url && !sig.signature_file && (
                    <div>
                      <Label>Current Signature</Label>
                      <div className="mt-1 p-2 border rounded-md bg-white">
                        <img
                          src={sig.signature_url}
                          alt={`Signature of ${sig.name || "signatory"}`}
                          className="w-40 h-24 object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addSignatory} className="mt-2 flex items-center gap-2 w-full">
                <Plus className="w-4 h-4" /> Add Signatory
              </Button>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}