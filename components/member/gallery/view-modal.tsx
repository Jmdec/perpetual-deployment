"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

interface Gallery {
  id: number
  title: string
  description?: string
  image_url: string
  created_at: string
}

interface GalleryViewModalProps {
  galleries: Gallery[]
  getImageUrl: (url?: string) => string
}

export default function GalleryViewModal({ galleries, getImageUrl }: GalleryViewModalProps) {
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null)

  // Ensure galleries is always an array
  const galleryList = Array.isArray(galleries) ? galleries : []

  if (galleryList.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No gallery items available</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {galleryList.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group cursor-pointer"
            onClick={() => setSelectedGallery(item)}
          >
            <img
              src={getImageUrl(item.image_url)}
              alt={item.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-xs font-medium truncate">{item.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      <Dialog open={!!selectedGallery} onOpenChange={(open) => !open && setSelectedGallery(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedGallery?.title}</DialogTitle>
          </DialogHeader>

          {selectedGallery && (
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={getImageUrl(selectedGallery.image_url)}
                  alt={selectedGallery.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {selectedGallery.description && (
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">Description</p>
                  <p>{selectedGallery.description}</p>
                </div>
              )}

              <div className="text-xs text-gray-500">
                Posted on {new Date(selectedGallery.created_at).toLocaleDateString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}