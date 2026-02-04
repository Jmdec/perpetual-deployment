"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface BusinessPartner {
  id: number
  business_name: string
  website_link?: string
  category?: string
  description?: string
  photo?: string
  status: "pending" | "approved" | "rejected"
  admin_note?: string
  created_at: string
  updated_at: string
}

interface ViewBusinessModalProps {
  isOpen: boolean
  selectedItem: BusinessPartner | null
  onClose: () => void
}

export default function ViewBusinessModal({ isOpen, selectedItem, onClose }: ViewBusinessModalProps) {
  if (!selectedItem) return null

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })

  // Construct proper image URL
  const getImageUrl = (photoPath: string | undefined | null): string | null => {
    if (!photoPath) return null
    
    // If photo already has full URL (starts with http), return as is
    if (photoPath.startsWith('http')) return photoPath
    
    // If photo starts with /, it's already a relative path from public folder
    // Use NEXT_PUBLIC_IMAGE_URL which should point to your Laravel public folder
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:8000'
    
    // Remove leading slash from photoPath if baseUrl already has trailing content
    const cleanPhotoPath = photoPath.startsWith('/') ? photoPath : `/${photoPath}`
    
    return `${baseUrl}${cleanPhotoPath}`
  }

  const imageUrl = getImageUrl(selectedItem.photo)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Business Partner Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {imageUrl && (
            <div className="w-full">
              <img 
                src={imageUrl} 
                alt={selectedItem.business_name} 
                className="w-full h-48 object-cover rounded border border-gray-200" 
                onError={(e) => {
                  // Hide image if it fails to load
                  e.currentTarget.style.display = 'none'
                  console.error('Failed to load image:', imageUrl)
                }}
              />
            </div>
          )}

          <div className="space-y-3">
            <div>
              <span className="font-semibold text-gray-700">Business Name:</span>
              <p className="mt-1 text-gray-900">{selectedItem.business_name}</p>
            </div>

            {selectedItem.website_link && (
              <div>
                <span className="font-semibold text-gray-700">Website:</span>
                <p className="mt-1">
                  <a 
                    href={selectedItem.website_link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {selectedItem.website_link}
                  </a>
                </p>
              </div>
            )}

            {selectedItem.category && (
              <div>
                <span className="font-semibold text-gray-700">Category:</span>
                <p className="mt-1 text-gray-900">{selectedItem.category}</p>
              </div>
            )}

            {selectedItem.description && (
              <div>
                <span className="font-semibold text-gray-700">Description:</span>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{selectedItem.description}</p>
              </div>
            )}

            <div>
              <span className="font-semibold text-gray-700 block mb-1">Status:</span>
              <Badge
                className={
                  selectedItem.status === "approved" 
                    ? "bg-green-100 text-green-700 hover:bg-green-100" 
                    : selectedItem.status === "pending" 
                    ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" 
                    : "bg-red-100 text-red-700 hover:bg-red-100"
                }
              >
                {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
              </Badge>
            </div>

            {selectedItem.admin_note && (
              <div className="pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-700">Admin Note:</span>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap bg-yellow-50 p-2 rounded border border-yellow-200">
                  {selectedItem.admin_note}
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-gray-200 text-xs text-gray-500">
              <p>Created: {formatDate(selectedItem.created_at)}</p>
              <p>Updated: {formatDate(selectedItem.updated_at)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}