"use client"

import { useState, useEffect } from "react"
import MemberLayout from "@/components/memberLayout"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface GalleryItem {
  id: number
  title: string
  description?: string
  image_url: string
  type: "photo" | "video" | "interaction" | "event" | "gathering"
  created_at: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const getImageUrl = (path?: string | null): string => {
  if (!path) return "/placeholder.png"
  if (path.startsWith("http")) return path
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`
}

export default function MemberGalleryPage() {
  const [galleries, setGalleries] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<GalleryItem | null>(null)
  const [filter, setFilter] = useState<GalleryItem["type"] | "all">("all")

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/galleries", { credentials: "include" })
        const data = await res.json()
        setGalleries(data)
      } catch (err) {
        console.error("Error fetching galleries:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchGalleries()
  }, [])

  // Filtered gallery list
  const filteredGalleries =
    filter === "all" ? galleries : galleries.filter((item) => item.type === filter)

  return (
    <MemberLayout>
      <div className="min-h-screen">
        {/* HEADER */}
        <header className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-10 shadow-md">
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Gallery</h1>
              <p className="text-sm sm:text-base opacity-90">Explore the latest images</p>
            </div>

            {/* FILTER BUTTONS */}
            <div className="flex flex-wrap gap-2">
              {["all", "photo", "video", "interaction", "event", "gathering"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type as GalleryItem["type"] | "all")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    filter === type
                      ? "bg-white text-red-600 shadow"
                      : "bg-white/30 text-white hover:bg-white/50"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* GALLERY GRID */}
        <main className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">Loading galleries…</div>
          ) : filteredGalleries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No gallery items available</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredGalleries.map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group cursor-pointer"
                  onClick={() => setSelected(item)}
                >
                  <img
                    src={getImageUrl(item.image_url)}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="text-white text-md font-medium p-10">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MODAL */}
          {selected && (
            <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
              <DialogContent className="max-w-3xl w-full p-0 overflow-hidden rounded-xl">
                <DialogHeader className="p-0">
                  <div className="w-full bg-gray-100">
                    <img
                      src={getImageUrl(selected.image_url)}
                      alt={selected.title}
                      className="w-full max-h-[70vh] object-contain"
                    />
                  </div>
                  <div className="p-4">
                    <DialogTitle className="text-lg font-bold">{selected.title}</DialogTitle>
                    {selected.description && (
                      <DialogDescription className="mt-2 text-sm text-gray-600">
                        {selected.description}
                      </DialogDescription>
                    )}
                  </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          )}
        </main>
      </div>
    </MemberLayout>
  )
}
