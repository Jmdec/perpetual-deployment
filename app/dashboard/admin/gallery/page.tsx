"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Edit, Image as ImageIcon, X, Upload } from "lucide-react"
import Image from "next/image"
import AdminLayout from "@/components/adminLayout"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/use-toast"

interface Gallery {
  id: number
  title: string
  description?: string
  image_url: string
  created_at: string
}

export default function AdminGalleryPage() {
  const { user, loading: authLoading } = useAuth(true)
  const { toast } = useToast()

  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mode, setMode] = useState<"create" | "edit">("create")
  const [editingId, setEditingId] = useState<number | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState("")

  /* ---------------- FETCH ---------------- */
  const fetchGalleries = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/galleries", { credentials: "include" })
      const data = await res.json()
      
      console.log('[Gallery] Fetched data:', data)
      
      // Set the galleries state with the fetched data
      if (Array.isArray(data)) {
        setGalleries(data)
      } else {
        console.error('[Gallery] Expected array, got:', data)
        setGalleries([])
      }
    } catch (error) {
      console.error('[Gallery] Fetch error:', error)
      toast({ variant: "destructive", title: "Failed to load gallery" })
      setGalleries([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) fetchGalleries()
  }, [authLoading, user])

  /* ---------------- IMAGE ---------------- */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 12 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Image too large",
        description: "Max 12MB",
      })
      return
    }

    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  /* ---------------- MODAL ---------------- */
  const openCreate = () => {
    setMode("create")
    setEditingId(null)
    setTitle("")
    setDescription("")
    setImage(null)
    setPreview("")
    setIsModalOpen(true)
  }

  const openEdit = (g: Gallery) => {
    setMode("edit")
    setEditingId(g.id)
    setTitle(g.title)
    setDescription(g.description ?? "")
    setPreview(g.image_url)
    setImage(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (!title || (!image && mode === "create")) {
      toast({ variant: "destructive", title: "Title & image required" })
      return
    }

    const form = new FormData()
    form.append("title", title)
    form.append("description", description)
    if (image) form.append("image", image)

    const url = mode === "edit" ? `/api/admin/galleries/${editingId}` : "/api/admin/galleries"
    const method = mode === "edit" ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        body: form,
      })

      const data = await res.json()
      console.log('[Gallery] Submit response:', data)

      if (res.ok) {
        toast({ 
          title: "✓ Success",
          description: `Gallery ${mode === "create" ? "added" : "updated"} successfully`,
          className: "bg-green-50 border-green-200"
        })
        closeModal()
        fetchGalleries()
      } else {
        toast({ 
          variant: "destructive", 
          title: "Failed to save",
          description: data.message || "An error occurred"
        })
      }
    } catch (error) {
      console.error('[Gallery] Submit error:', error)
      toast({ variant: "destructive", title: "Failed to save" })
    }
  }

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this image?")) return

    try {
      const res = await fetch(`/api/admin/galleries/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (res.ok) {
        toast({ 
          title: "✓ Deleted",
          description: "Gallery image removed successfully",
          className: "bg-green-50 border-green-200"
        })
        fetchGalleries()
      } else {
        toast({ variant: "destructive", title: "Failed to delete" })
      }
    } catch (error) {
      console.error('[Gallery] Delete error:', error)
      toast({ variant: "destructive", title: "Failed to delete" })
    }
  }

  if (authLoading) return null

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ImageIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
                  <p className="text-sm text-gray-500">Manage images and visual content</p>
                </div>
              </div>

              <button
                onClick={openCreate}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg hover:from-red-700 hover:to-orange-600 transition-all"
              >
                <Plus className="w-5 h-5" />
                New Image
              </button>

              <button
                onClick={openCreate}
                className="sm:hidden p-2 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg hover:from-red-700 hover:to-orange-600 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : galleries.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No images yet.</p>
            <p className="text-gray-400 text-sm">Click "New Image" to add your first gallery image.</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleries.map((g) => (
              <div key={g.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image 
                    src={g.image_url} 
                    alt={g.title || "Gallery image"} 
                    fill 
                    className="object-cover" 
                    unoptimized 
                  />
                </div>
                <div className="p-3 space-y-2">
                  <p className="font-medium truncate">{g.title || "Untitled"}</p>
                  {g.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">{g.description}</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => openEdit(g)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 border border-orange-200 text-orange-600 rounded hover:bg-orange-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-xs">Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(g.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 border border-red-200 text-red-600 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-xs">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-lg rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">
                  {mode === "create" ? "Add Image" : "Edit Image"}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X />
                </button>
              </div>

              <input 
                className="w-full border rounded px-3 py-2" 
                placeholder="Title *" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
              />

              <textarea
                className="w-full border rounded px-3 py-2 min-h-[80px]"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              {preview ? (
                <div className="space-y-2">
                  <div className="relative h-64 border rounded-lg overflow-hidden">
                    <Image src={preview} alt="Preview" fill className="object-cover" unoptimized />
                  </div>
                  <button
                    onClick={() => {
                      setImage(null)
                      setPreview("")
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove image
                  </button>
                </div>
              ) : (
                <label className="border-dashed border-2 border-gray-300 p-8 flex flex-col items-center cursor-pointer hover:border-orange-500 transition-colors rounded-lg">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload image</span>
                  <span className="text-xs text-gray-400 mt-1">Max 12MB</span>
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </label>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={closeModal} 
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit} 
                  className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}