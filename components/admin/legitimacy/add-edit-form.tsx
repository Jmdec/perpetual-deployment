"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { Plus, X, User as UserIcon, Mail, Award, Building, FileText, Calendar, MapPin, Image } from "lucide-react"

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
  logo_url_2?: string
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
    logo_url_2: "",
    signatories: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [deletedSignatoryIds, setDeletedSignatoryIds] = useState<number[]>([])
  const [logoFile1, setLogoFile1] = useState<File | null>(null)
  const [logoFile2, setLogoFile2] = useState<File | null>(null)

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
        id: initialData.id,
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
        logo_url: initialData.logo_url ? `${imageBaseUrl}${initialData.logo_url}` : undefined,
        logo_url_2: initialData.logo_url_2 ? `${imageBaseUrl}${initialData.logo_url_2}` : undefined,
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
      setLogoFile1(null)
      setLogoFile2(null)
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
        logo_url_2: "",
        signatories: [],
      })
      setDeletedSignatoryIds([])
      setLogoFile1(null)
      setLogoFile2(null)
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
          : `/api/admin/legitimacy/${form.id}`

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

      // Add logo files if selected
      if (logoFile1) {
        payload.append("logo_file_1", logoFile1)
      }
      if (logoFile2) {
        payload.append("logo_file_2", logoFile2)
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
      <DialogContent className="sm:max-w-3xl w-full max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {mode === "create" ? "Create Legitimacy Request" : "Edit Legitimacy Request"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <div className="space-y-6">
            {/* Personal Information Card */}
            <div className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-2 border-red-800 rounded-lg p-5 shadow-lg">
              <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fraternity-number" className="text-red-800 font-semibold flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    Fraternity Number *
                  </Label>
                  <Input
                    id="fraternity-number"
                    value={form.fraternity_number}
                    onChange={(e) => setForm({ ...form, fraternity_number: e.target.value })}
                    disabled={mode === "edit"}
                    className={`border-red-300 focus:border-red-600 focus:ring-red-600 ${mode === "edit" ? "cursor-not-allowed bg-gray-100" : ""}`}
                  />
                </div>

                <div>
                  <Label htmlFor="alias" className="text-red-800 font-semibold flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Alias *
                  </Label>
                  <Input 
                    id="alias" 
                    value={form.alias} 
                    onChange={(e) => setForm({ ...form, alias: e.target.value })} 
                    className="border-red-300 focus:border-red-600 focus:ring-red-600"
                  />
                </div>

                <div>
                  <Label htmlFor="chapter" className="text-red-800 font-semibold flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    Chapter *
                  </Label>
                  <Input 
                    id="chapter" 
                    value={form.chapter} 
                    onChange={(e) => setForm({ ...form, chapter: e.target.value })} 
                    className="border-red-300 focus:border-red-600 focus:ring-red-600"
                  />
                </div>

                <div>
                  <Label htmlFor="position" className="text-red-800 font-semibold flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Position *
                  </Label>
                  <Input 
                    id="position" 
                    value={form.position} 
                    onChange={(e) => setForm({ ...form, position: e.target.value })} 
                    className="border-red-300 focus:border-red-600 focus:ring-red-600"
                  />
                </div>

                <div>
                  <Label htmlFor="status" className="text-red-800 font-semibold">Status</Label>
                  <select
                    id="status"
                    className="border-2 border-red-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as Legitimacy["status"] })}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="certificate-date" className="text-red-800 font-semibold flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Certificate Date *
                  </Label>
                  <Input
                    id="certificate-date"
                    type="date"
                    value={form.certificate_date || ""}
                    onChange={(e) => setForm({ ...form, certificate_date: e.target.value })}
                    className="border-red-300 focus:border-red-600 focus:ring-red-600"
                  />
                </div>
              </div>
            </div>

            {/* Certificate Information Card */}
            <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 border-2 border-amber-600 rounded-lg p-5 shadow-lg">
              <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Certificate Information
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="school-name" className="text-amber-800 font-semibold flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    School Name
                  </Label>
                  <Input
                    id="school-name"
                    value={form.school_name || ""}
                    onChange={(e) => setForm({ ...form, school_name: e.target.value })}
                    placeholder="e.g., University of the Philippines"
                    className="border-amber-300 focus:border-amber-600 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-amber-800 font-semibold flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={form.address || ""}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="e.g., Quezon City, Metro Manila"
                    className="border-amber-300 focus:border-amber-600 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <Label htmlFor="certification-details" className="text-amber-800 font-semibold flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    Certification Details
                  </Label>
                  <Textarea
                    id="certification-details"
                    value={form.certification_details || ""}
                    onChange={(e) => setForm({ ...form, certification_details: e.target.value })}
                    className="resize-none border-amber-300 focus:border-amber-600 focus:ring-amber-600"
                    rows={3}
                    placeholder="Additional certification details or notes"
                  />
                </div>

                {/* Certificate Logos */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-amber-800 font-semibold flex items-center gap-1">
                      <Image className="w-4 h-4" />
                      Certificate Logos
                    </Label>
                    <span className="text-xs text-amber-700 font-medium">Maximum 2 images</span>
                  </div>

                  {/* Logo 1 */}
                  <div className="bg-white p-4 border-2 border-amber-600 rounded-lg shadow-sm">
                    <Label htmlFor="logo-file-1" className="text-amber-800 font-semibold mb-2 block">Certificate Logo 1 (Left)</Label>
                    <Input
                      id="logo-file-1"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setLogoFile1(file)
                        }
                      }}
                      className="border-amber-300"
                    />
                    {logoFile1 && <p className="text-xs text-green-600 font-medium mt-2">✓ New logo 1 selected: {logoFile1.name}</p>}
                    
                    {(logoFile1 || form.logo_url) && (
                      <div className="mt-3">
                        <Label className="text-amber-800 text-sm font-semibold">{logoFile1 ? "New Logo 1 Preview" : "Current Logo 1"}</Label>
                        <div className="mt-2 p-3 border-2 border-amber-400 rounded-md bg-amber-50">
                          <img
                            src={logoFile1 ? URL.createObjectURL(logoFile1) : form.logo_url}
                            alt="Certificate logo 1"
                            className="w-32 h-32 object-contain mx-auto"
                            onLoad={(e) => {
                              if (logoFile1) {
                                URL.revokeObjectURL(e.currentTarget.src)
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Logo 2 */}
                  <div className="bg-white p-4 border-2 border-amber-600 rounded-lg shadow-sm">
                    <Label htmlFor="logo-file-2" className="text-amber-800 font-semibold mb-2 block">Certificate Logo 2 (Right)</Label>
                    <Input
                      id="logo-file-2"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setLogoFile2(file)
                        }
                      }}
                      className="border-amber-300"
                    />
                    {logoFile2 && <p className="text-xs text-green-600 font-medium mt-2">✓ New logo 2 selected: {logoFile2.name}</p>}
                    
                    {(logoFile2 || form.logo_url_2) && (
                      <div className="mt-3">
                        <Label className="text-amber-800 text-sm font-semibold">{logoFile2 ? "New Logo 2 Preview" : "Current Logo 2"}</Label>
                        <div className="mt-2 p-3 border-2 border-amber-400 rounded-md bg-amber-50">
                          <img
                            src={logoFile2 ? URL.createObjectURL(logoFile2) : form.logo_url_2}
                            alt="Certificate logo 2"
                            className="w-32 h-32 object-contain mx-auto"
                            onLoad={(e) => {
                              if (logoFile2) {
                                URL.revokeObjectURL(e.currentTarget.src)
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Note */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-600 rounded-lg p-5 shadow-lg">
              <Label htmlFor="admin-note" className="text-blue-900 font-semibold flex items-center gap-1 mb-2">
                <FileText className="w-4 h-4" />
                Admin Note
              </Label>
              <Textarea
                id="admin-note"
                value={form.admin_note || ""}
                onChange={(e) => setForm({ ...form, admin_note: e.target.value })}
                className="resize-none border-blue-300 focus:border-blue-600 focus:ring-blue-600"
                rows={3}
                placeholder="Internal notes visible only to admins"
              />
            </div>

            {/* Signatories Section */}
            <div className="bg-gradient-to-br from-red-50 via-rose-50 to-red-100 border-2 border-red-800 rounded-lg p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-red-900 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Signatories
                </h3>
                <span className="text-sm text-red-700 font-medium">
                  {form.signatories.length} signator{form.signatories.length !== 1 ? "ies" : "y"}
                </span>
              </div>

              <div className="space-y-3">
                {form.signatories.map((sig, idx) => (
                  <div key={sig.id ?? `new-${idx}`} className="p-4 border-2 border-amber-600 rounded-lg bg-gradient-to-r from-white to-amber-50 shadow-md">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <Label htmlFor={`signatory-name-${idx}`} className="text-amber-800 font-semibold">Name *</Label>
                          <Input
                            id={`signatory-name-${idx}`}
                            placeholder="Full name"
                            value={sig.name}
                            onChange={(e) => handleSignatoryChange(idx, "name", e.target.value)}
                            className="border-amber-300 focus:border-amber-600 focus:ring-amber-600"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-red-600 p-2 hover:bg-red-100 mt-6"
                          onClick={() => removeSignatory(idx)}
                          aria-label="Remove signatory"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>

                      <div>
                        <Label htmlFor={`signatory-role-${idx}`} className="text-amber-800 font-semibold">Role</Label>
                        <Input
                          id={`signatory-role-${idx}`}
                          placeholder="e.g., Approved, Noted, Reviewed"
                          value={sig.role || ""}
                          onChange={(e) => handleSignatoryChange(idx, "role", e.target.value)}
                          className="border-amber-300 focus:border-amber-600 focus:ring-amber-600"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`signatory-date-${idx}`} className="text-amber-800 font-semibold flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Signed Date
                        </Label>
                        <Input
                          id={`signatory-date-${idx}`}
                          type="date"
                          value={sig.signed_date || ""}
                          onChange={(e) => handleSignatoryChange(idx, "signed_date", e.target.value)}
                          className="border-amber-300 focus:border-amber-600 focus:ring-amber-600"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`signatory-file-${idx}`} className="text-amber-800 font-semibold">Signature Image</Label>
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
                          className="border-amber-300"
                        />
                        {sig.signature_file && <p className="text-xs text-green-600 font-medium mt-1">✓ New file selected: {sig.signature_file.name}</p>}
                      </div>

                      {sig.signature_url && !sig.signature_file && (
                        <div>
                          <Label className="text-amber-800 font-semibold">Current Signature</Label>
                          <div className="mt-2 p-3 border-2 border-red-800 rounded-lg bg-white shadow-sm">
                            <img
                              src={sig.signature_url}
                              alt={`Signature of ${sig.name || "signatory"}`}
                              className="w-40 h-24 object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addSignatory} 
                  className="w-full flex items-center justify-center gap-2 border-2 border-red-800 text-red-900 hover:bg-red-50 font-semibold"
                >
                  <Plus className="w-5 h-5" /> Add Signatory
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4 flex justify-end gap-3 border-t-2 border-gray-200 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="px-6">
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="px-6 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}