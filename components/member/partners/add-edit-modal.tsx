"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface MemberBusinessModalProps {
  isOpen: boolean
  mode: "create" | "edit"
  initialData?: any | null
  onClose: () => void
  onSubmitSuccess: () => void
}

export default function MemberBusinessModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmitSuccess,
}: MemberBusinessModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    id: null,
    business_name: "",
    website_link: "",
    description: "",
    category: "",
    photo: null as string | null,
  })

  const resetForm = () => {
    setFormData({
      id: null,
      business_name: "",
      website_link: "",
      description: "",
      category: "",
      photo: null,
    })
    setFile(null)
  }

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        id: initialData.id,
        business_name: initialData.business_name || "",
        website_link: initialData.website_link || "",
        description: initialData.description || "",
        category: initialData.category || "",
        photo: initialData.photo
          ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${initialData.photo}`
          : null,
      })
      setFile(null)
    } else {
      resetForm()
    }
  }, [mode, initialData])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const clearPhoto = () => {
    setFile(null)
    setFormData((prev) => ({ ...prev, photo: null }))
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.business_name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Business name is required.",
      })
      return
    }
    if (formData.website_link && !isValidUrl(formData.website_link)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid website link.",
      })
      return
    }

    try {
      setLoading(true)
      const payload = new FormData()

      // Append all fields except photo
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== "photo") {
          payload.append(key, value as string)
        }
      })

      // Append file or empty string to clear photo
      if (file) {
        payload.append("photo", file)
      } else if (formData.photo === null && mode === "edit") {
        payload.append("photo", "")
      }

      const url =
        mode === "create"
          ? "/api/business-partners"
          : `/api/business-partners/${formData.id}`
      const method = mode === "create" ? "POST" : "PUT"

      const res = await fetch(url, {
        method,
        body: payload,
        credentials: "include",
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast({ title: "Success", description: data.message })
        onSubmitSuccess()
        resetForm()
        onClose()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Server error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-md p-6 rounded-lg relative">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X />
        </button>

        <h2 className="text-lg font-semibold mb-4">
          {mode === "create" ? "Add Business" : "Edit Business"}
        </h2>

        <div className="space-y-3">
          <div>
            <Label>Business Name</Label>
            <Input
              name="business_name"
              placeholder="e.g. My Business"
              value={formData.business_name}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Website Link</Label>
            <Input
              name="website_link"
              placeholder="e.g. https://example.com"
              value={formData.website_link}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Photo</Label>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            {(file || formData.photo) && (
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={file ? URL.createObjectURL(file) : formData.photo!}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded border"
                />
                <Button
                  variant="ghost"
                  className="text-red-500"
                  onClick={clearPhoto}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              name="description"
              placeholder="e.g. A description of your business"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Category</Label>
            <Input
              name="category"
              placeholder="e.g. Retail, Technology, Food & Beverage"
              value={formData.category}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : mode === "create" ? "Add" : "Update"}
          </Button>
        </div>
      </div>
    </div>
  )
}
