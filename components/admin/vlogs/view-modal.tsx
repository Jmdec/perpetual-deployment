"use client"

import { X } from "lucide-react"

interface Vlog {
  id: number
  title: string
  category: string
  description?: string
  is_active: boolean
  date: string
  created_at: string
  video?: string | File  // Add File type here
  poster?: string
  content: string
}

interface Props {
  isOpen: boolean
  selectedItem: Vlog | null
  onClose: () => void
}

export default function ViewVlogsModal({ isOpen, selectedItem, onClose }: Props) {
  if (!isOpen || !selectedItem) return null

  const getVideoUrl = (videoUrl?: string | File) => {  // Update parameter type
    if (!videoUrl) return ""
    
    // Handle File objects
    if (videoUrl instanceof File) {
      return URL.createObjectURL(videoUrl)
    }
    
    // Handle string URLs
    if (videoUrl.startsWith("http://") || videoUrl.startsWith("https://")) {
      return videoUrl
    }
    if (videoUrl.startsWith("/")) {
      return `${process.env.NEXT_PUBLIC_IMAGE_URL}${videoUrl}`
    }
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}/${videoUrl}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 relative overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X />
        </button>

        <h2 className="text-xl font-bold mb-4">View Vlog</h2>

        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium">Title:</span> {selectedItem.title}
          </div>
          <div>
            <span className="font-medium">Category:</span> {selectedItem.category}
          </div>
          <div>
            <span className="font-medium">Date:</span> {formatDate(selectedItem.date)}
          </div>
          <div>
            <span className="font-medium">Status:</span> {selectedItem.is_active ? "Active" : "Inactive"}
          </div>
          <div>
            <span className="font-medium">Description:</span>
            <p className="text-gray-600 mt-1">{selectedItem.description || "-"}</p>
          </div>

          {selectedItem.poster && (
            <div className="mt-4">
              <span className="font-medium">Poster:</span>
              <img src={getVideoUrl(selectedItem.poster)} alt="Video poster" className="w-full max-h-64 rounded-lg border mt-1" />
            </div>
          )}

          {selectedItem.video && (
            <div className="mt-4">
              <span className="font-medium">Video:</span>
              <video src={getVideoUrl(selectedItem.video)} controls className="w-full max-h-64 rounded-lg border mt-1" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}