"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Vlog {
  id?: number
  title: string
  category: string
  description?: string
  content: string
  date: string
  is_active: boolean | string | number
  video?: File | string
  poster?: File | string
}

interface Props {
  isOpen: boolean
  mode: "create" | "edit"
  initialData?: Vlog
  onClose: () => void
  onSubmitSuccess: () => void
}

const CHUNK_SIZE = 2 * 1024 * 1024 // 2MB

export default function AdminVlogsModal({ isOpen, mode, initialData, onClose, onSubmitSuccess }: Props) {
  const { toast } = useToast()

  const defaultForm: Vlog = {
    title: "",
    category: "",
    description: "",
    content: "",
    date: "",
    is_active: true,
  }

  const [form, setForm] = useState<Vlog>(defaultForm)
  const [video, setVideo] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [poster, setPoster] = useState<File | null>(null)

  const normalizeIsActive = (value: boolean | string | number): boolean => {
    if (typeof value === "boolean") return value
    if (typeof value === "string") return value === "1" || value.toLowerCase() === "true"
    if (typeof value === "number") return value === 1
    return false
  }

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setForm({
          ...initialData,
          is_active: normalizeIsActive(initialData.is_active),
        })
      } else {
        setForm(defaultForm)
      }
      setVideo(null)
      setPoster(null)
      setProgress(0)
    }
  }, [isOpen, mode, initialData])

  if (!isOpen) return null

  // Fixed chunked upload - sends all chunks sequentially
  const uploadChunks = async (file: File, formData: Vlog, mode: "create" | "edit", id?: number) => {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
    console.log(`[Upload] Starting chunked upload: ${totalChunks} chunks, file size: ${file.size} bytes`)

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, file.size)
      const blobChunk = file.slice(start, end)

      console.log(`[Upload] Chunk ${chunkIndex + 1}/${totalChunks}: ${start}-${end} bytes`)

      const formDataChunk = new FormData()
      formDataChunk.append("chunk", blobChunk, file.name)
      formDataChunk.append("chunk_index", String(chunkIndex))
      formDataChunk.append("total_chunks", String(totalChunks))
      formDataChunk.append("filename", file.name)

      // Include metadata only on first chunk
      if (chunkIndex === 0) {
        formDataChunk.append("title", formData.title)
        formDataChunk.append("category", formData.category)
        formDataChunk.append("date", formData.date)
        formDataChunk.append("content", formData.content)
        formDataChunk.append("is_active", normalizeIsActive(formData.is_active) ? "1" : "0")
        if (formData.description) formDataChunk.append("description", formData.description)
        if (poster) formDataChunk.append("poster", poster)
      }

      // Determine API endpoint
      const endpoint = mode === "create" 
        ? "/api/admin/vlogs/chunk-upload"
        : `/api/admin/vlogs/${id}/chunk-upload`

      const res = await fetch(endpoint, {
        method: "POST",
        body: formDataChunk,
        credentials: "include",
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error(`[Upload] Chunk ${chunkIndex + 1} failed:`, errorData)
        throw new Error(errorData.message || `Chunk ${chunkIndex + 1} upload failed`)
      }

      const responseData = await res.json()
      console.log(`[Upload] Chunk ${chunkIndex + 1} response:`, responseData)

      // Update progress
      setProgress(Math.round(((chunkIndex + 1) / totalChunks) * 100))
    }

    console.log("[Upload] All chunks uploaded successfully")
  }

  const updateMetadataOnly = async (formData: Vlog, id: number) => {
    const data = new FormData()
    data.append("title", formData.title)
    data.append("category", formData.category)
    data.append("date", formData.date)
    data.append("content", formData.content)
    data.append("is_active", normalizeIsActive(formData.is_active) ? "1" : "0")
    if (formData.description) data.append("description", formData.description)
    if (poster) data.append("poster", poster)

    const res = await fetch(`/api/admin/vlogs/${id}`, {
      method: "PUT",
      body: data,
      credentials: "include",
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.message || "Update failed")
    }
  }

  const handleSubmit = async () => {
    if (mode === "create" && !video) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a video file",
      })
      return
    }

    if (!form.title || !form.category || !form.date || !form.content) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      })
      return
    }

    setLoading(true)
    setProgress(0)

    try {
      if (mode === "create") {
        await uploadChunks(video as File, form, "create")
      } else if (mode === "edit" && initialData?.id) {
        if (video) {
          // Uploading new video
          await uploadChunks(video, form, "edit", initialData.id)
        } else {
          // Only updating metadata
          await updateMetadataOnly(form, initialData.id)
        }
      }

      toast({
        title: "✓ Success",
        description: `Vlog ${mode === "create" ? "created" : "updated"} successfully`,
        className: "bg-green-50 border-green-200",
      })

      onSubmitSuccess()
      onClose()
    } catch (err: any) {
      console.error("[Submit Error]", err)
      toast({
        variant: "destructive",
        title: "Failed",
        description: err.message || "Something went wrong",
      })
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  const getMediaUrl = (mediaUrl?: string): string => {
    if (!mediaUrl) return "/placeholder.png"
    if (mediaUrl.startsWith("http://") || mediaUrl.startsWith("https://")) {
      return mediaUrl
    }
    if (mediaUrl.startsWith("/")) {
      return `${process.env.NEXT_PUBLIC_IMAGE_URL}${mediaUrl}`
    }
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}/${mediaUrl}`
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-lg w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-4 sm:p-6 relative overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X />
        </button>

        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4">
          {mode === "create" ? "Add Vlog" : "Edit Vlog"}
        </h2>

        <div className="space-y-4">
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base"
            placeholder="Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base"
            placeholder="Category *"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          
          <input
            type="date"
            className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base"
            placeholder="Short description"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base"
            placeholder="Content (required) *"
            rows={4}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Poster Image</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              onChange={(e) => setPoster(e.target.files?.[0] || null)}
              className="text-sm sm:text-base w-full"
            />
            {mode === "edit" && initialData?.poster && !poster && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">Current poster:</p>
                <img
                  src={getMediaUrl(typeof initialData.poster === "string" ? initialData.poster : "")}
                  alt="Current poster"
                  className="w-full max-h-48 rounded-lg border object-cover mt-1"
                />
              </div>
            )}
            {poster && (
              <p className="text-xs text-green-600 mt-1">New poster selected: {poster.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video File {mode === "create" && "*"}
            </label>
            <input
              type="file"
              accept="video/mp4,video/mov,video/avi,video/webm"
              onChange={(e) => setVideo(e.target.files?.[0] || null)}
              className="text-sm sm:text-base w-full"
            />
            {video && (
              <p className="text-xs text-blue-600 mt-1">
                Selected: {video.name} ({(video.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
            {mode === "edit" && initialData?.video && !video && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">Current video:</p>
                <video
                  src={getMediaUrl(typeof initialData.video === "string" ? initialData.video : "")}
                  controls
                  className="w-full max-h-64 rounded-lg border mt-1"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base"
              value={normalizeIsActive(form.is_active) ? "1" : "0"}
              onChange={(e) => setForm({ ...form, is_active: e.target.value === "1" })}
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-center mt-1 text-gray-600">Uploading... {progress}%</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border rounded-lg text-sm sm:text-base hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm sm:text-base hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? `Saving... ${progress}%` : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}