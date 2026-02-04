"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface GalleryItem {
  id: number
  title: string
  description?: string
  image_url: string
  created_at: string
}

interface GalleryViewModalProps {
  galleries: GalleryItem[]
  getImageUrl: (url: string) => string
}

export default function GalleryViewModal({ galleries, getImageUrl }: GalleryViewModalProps) {
  const [selected, setSelected] = useState<GalleryItem | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {galleries.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group cursor-pointer"
            onClick={() => setSelected(item)}
          >
            <img src={getImageUrl(item.image_url)} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span className="text-white text-xs font-medium">View</span>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className="max-w-lg w-full p-0 overflow-hidden rounded-xl">
            <DialogHeader className="p-0">
              <Image
                src={getImageUrl(selected.image_url)}
                alt={selected.title}
                width={600}
                height={600}
                className="w-full aspect-square object-cover"
              />
              <div className="p-4">
                <DialogTitle className="text-lg font-bold">{selected.title}</DialogTitle>
                {selected.description && <DialogDescription className="mt-2 text-sm text-gray-600">{selected.description}</DialogDescription>}
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
