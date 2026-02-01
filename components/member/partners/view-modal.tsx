"use client"

import { X, ExternalLink } from "lucide-react"

interface BusinessPartner {
  id: number
  business_name: string
  category: string
  description?: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
  photo?: string
  website_link?: string
  admin_note?: string
}

interface MemberViewBusinessModalProps {
  isOpen: boolean
  selectedItem: BusinessPartner | null
  onClose: () => void
}

export default function MemberViewBusinessModal({ isOpen, selectedItem, onClose }: MemberViewBusinessModalProps) {
  if (!isOpen || !selectedItem) return null

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return ""

    // If the URL already includes http:// or https://, return as is
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl
    }

    // If it starts with a slash, concatenate with IMAGE_URL
    if (imageUrl.startsWith("/")) {
      return `${process.env.NEXT_PUBLIC_IMAGE_URL}${imageUrl}`
    }

    // For relative paths like 'images/announcements/file.png', add leading slash
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}/${imageUrl}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-md p-6 rounded-lg relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X />
        </button>

        <h2 className="text-lg font-semibold mb-4">{selectedItem.business_name}</h2>

        <div className="space-y-2">
          {selectedItem.photo && <img src={`${getImageUrl(selectedItem.photo)}`} alt="Business" className="w-full h-40 object-cover rounded" />}

          {selectedItem.website_link && (
            <div className="flex items-center gap-1 text-blue-600">
              <ExternalLink className="w-4 h-4" />
              <a href={selectedItem.website_link} target="_blank" rel="noreferrer">
                {selectedItem.website_link}
              </a>
            </div>
          )}

          <p>
            <strong>Category:</strong> {selectedItem.category || "-"}
          </p>
          <p>
            <strong>Description:</strong> {selectedItem.description || "-"}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                selectedItem.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : selectedItem.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
            </span>
          </p>
          {selectedItem.admin_note && (
            <p>
              <strong>Admin Note:</strong> {selectedItem.admin_note}
            </p>
          )}
          <p>
            <strong>Created At:</strong> {formatDate(selectedItem.created_at)}
          </p>
        </div>
      </div>
    </div>
  )
}
