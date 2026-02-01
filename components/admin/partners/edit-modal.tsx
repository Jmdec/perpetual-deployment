"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { X } from "lucide-react"

interface BusinessPartner {
  id?: number | null
  business_name: string
  website_link?: string
  category?: string
  description?: string
  photo?: string | File | null
  status?: "pending" | "approved" | "rejected"
  admin_note?: string
}

interface AdminBusinessModalProps {
  isOpen: boolean
  mode: "create" | "edit"
  initialData?: BusinessPartner
  onClose: () => void
  onSubmitSuccess: () => void
}

export default function AdminBusinessModal({ isOpen, mode, initialData, onClose, onSubmitSuccess }: AdminBusinessModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<BusinessPartner>({
    business_name: "",
    website_link: "",
    category: "",
    description: "",
    status: "pending",
    admin_note: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [existingPhotoPath, setExistingPhotoPath] = useState<string | File | null>(null)

  // Helper function to get proper image URL
  const getImageUrl = (photoPath: string | File | null | undefined): string | null => {
    if (!photoPath) return null
    
    // If it's a File object, return null (shouldn't happen in practice)
    if (photoPath instanceof File) return null
    
    // If it's already a full URL or blob URL, return as is
    if (photoPath.startsWith('http')) return photoPath
    if (photoPath.startsWith('blob:')) return photoPath
    
    // Construct URL from relative path
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:8000'
    const cleanPhotoPath = photoPath.startsWith('/') ? photoPath : `/${photoPath}`
    return `${baseUrl}${cleanPhotoPath}`
  }

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        id: initialData.id,
        business_name: initialData.business_name || "",
        website_link: initialData.website_link || "",
        description: initialData.description || "",
        category: initialData.category || "",
        status: initialData.status || "pending",
        admin_note: initialData.admin_note || "",
      })
      
      // Set existing photo path and preview
      if (initialData.photo && typeof initialData.photo === 'string') {
        setExistingPhotoPath(initialData.photo)
        const imageUrl = getImageUrl(initialData.photo)
        setPreviewUrl(imageUrl)
      } else {
        setExistingPhotoPath(null)
        setPreviewUrl(null)
      }
    } else {
      // Reset for create mode
      setFormData({
        business_name: "",
        website_link: "",
        description: "",
        category: "",
        status: "pending",
        admin_note: "",
      })
      setExistingPhotoPath(null)
      setPreviewUrl(null)
    }
    setFile(null)
  }, [mode, initialData, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      
      // Create preview URL for the new file
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleRemovePhoto = () => {
    setFile(null)
    setPreviewUrl(null)
    setExistingPhotoPath(null)
    // Reset the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleSubmit = async () => {
    if (!formData.business_name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Business name is required",
      })
      return
    }

    try {
      setLoading(true)
      const payload = new FormData()

      // Add all text fields to FormData
      payload.append("business_name", formData.business_name)
      if (formData.website_link) payload.append("website_link", formData.website_link)
      if (formData.category) payload.append("category", formData.category)
      if (formData.description) payload.append("description", formData.description)
      if (formData.status) payload.append("status", formData.status)
      if (formData.admin_note) payload.append("admin_note", formData.admin_note)

      // Handle photo
      if (file) {
        // New file selected
        payload.append("photo", file)
      } else if (!existingPhotoPath && mode === "edit") {
        // Photo was removed (existing photo deleted, no new file)
        payload.append("photo", "")
      }
      // If existingPhotoPath exists and no new file, don't send photo field (keep existing)

      // Debug: Log what we're sending
      console.log("=== FORM SUBMISSION ===")
      console.log("Mode:", mode)
      console.log("Business ID:", formData.id)
      console.log("Has new file:", !!file)
      console.log("Existing photo path:", existingPhotoPath)
      console.log("FormData contents:")
      for (const [key, value] of payload.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `[File: ${value.name}, ${value.size} bytes]` : value)
      }

      const url = mode === "create" ? `/api/admin/business-partners` : `/api/admin/business-partners/${formData.id}`
      const method = mode === "create" ? "POST" : "PUT"

      const res = await fetch(url, { 
        method, 
        body: payload, 
        credentials: "include" 
      })
      
      const data = await res.json()

      console.log("Server response:", data)

      if (res.ok && data.success) {
        toast({ 
          title: "Success", 
          description: data.message || (mode === "create" ? "Business created successfully" : "Business updated successfully")
        })
        onSubmitSuccess()
        onClose()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || data.error || "Failed to save business",
        })
      }
    } catch (err) {
      console.error("Submit error:", err)
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: err instanceof Error ? err.message : "Server error occurred" 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add New Business Partner" : "Edit Business Partner"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name <span className="text-red-500">*</span>
            </label>
            <Input 
              name="business_name" 
              value={formData.business_name} 
              onChange={handleChange}
              placeholder="Enter business name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website Link</label>
            <Input 
              name="website_link" 
              value={formData.website_link || ""} 
              onChange={handleChange}
              placeholder="https://example.com"
              type="url"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <Input 
              name="category" 
              value={formData.category || ""} 
              onChange={handleChange}
              placeholder="e.g., Technology, Food, Services"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[80px]"
              placeholder="Brief description of the business"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status || "pending"}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Note</label>
            <textarea
              name="admin_note"
              value={formData.admin_note || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[80px]"
              placeholder="Internal notes (visible to admins only)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
            <Input 
              type="file" 
              onChange={handleFileChange}
              accept="image/*"
            />
            {previewUrl && (
              <div className="mt-2 relative inline-block">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded border border-gray-300" 
                  onError={(e) => {
                    console.error('Failed to load preview image:', previewUrl)
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128"%3E%3Crect fill="%23ddd" width="128" height="128"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  {file ? "New photo selected" : "Current photo"}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !formData.business_name.trim()}>
              {loading ? "Saving..." : mode === "create" ? "Add Business" : "Update Business"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}