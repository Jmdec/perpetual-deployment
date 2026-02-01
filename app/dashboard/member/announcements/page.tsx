"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Eye, Calendar, Bell, X, Upload, ToggleLeft, ToggleRight, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import MemberLayout from "@/components/memberLayout"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/use-toast"

interface Announcement {
  id: number
  title: string
  date: string
  category: "Update" | "Event" | "Alert" | "Development" | "Health" | "Notice"
  description: string
  content: string
  is_active: boolean
  priority: number
  image_url?: string
  created_at: string
  updated_at: string
}

export default function AnnouncementsPage() {
  const { user, loading: authLoading } = useAuth(true)
  const { toast } = useToast()

  const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000"

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return ""
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl
    }
    if (imageUrl.startsWith("/")) {
      return `${IMAGE_URL}${imageUrl}`
    }
    return `${IMAGE_URL}/${imageUrl}`
  }

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"view" | "create" | "edit">("view")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    category: "Update" as Announcement["category"],
    description: "",
    content: "",
    is_active: true,
    priority: 0,
  })

  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")

  const categories = [
    { value: "all", label: "All Announcements" },
    { value: "Update", label: "Updates" },
    { value: "Event", label: "Events" },
    { value: "Alert", label: "Alerts" },
    { value: "Development", label: "Development" },
    { value: "Health", label: "Health" },
    { value: "Notice", label: "Notices" },
  ]

  useEffect(() => {
    if (!authLoading && user) {
      fetchAnnouncements()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/announcements`, {
        credentials: "include",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          const announcementsData = Array.isArray(data.data) ? data.data : data.data.data || []
          setAnnouncements(announcementsData)
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch announcements.",
        })
      }
    } catch (error) {
      console.error("Error fetching announcements:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load announcements.",
      })
    } finally {
      setLoading(false)
    }
  }

  const getFilteredAnnouncements = () => {
    if (selectedCategory === "all") {
      return announcements
    }
    return announcements.filter(a => a.category === selectedCategory)
  }

  const filteredAnnouncements = getFilteredAnnouncements()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Image must be less than 10MB.",
        })
        return
      }
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImage(null)
    setPreview("")
  }

  const handleViewAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setModalMode("view")
    setModalOpen(true)
  }

  const handleCreateNew = () => {
    setFormData({
      title: "",
      date: new Date().toISOString().split("T")[0],
      category: "Update",
      description: "",
      content: "",
      is_active: true,
      priority: 0,
    })
    setImage(null)
    setPreview("")
    setSelectedAnnouncement(null)
    setModalMode("create")
    setModalOpen(true)
  }

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      date: announcement.date,
      category: announcement.category,
      description: announcement.description,
      content: announcement.content,
      is_active: announcement.is_active,
      priority: announcement.priority,
    })
    setPreview(getImageUrl(announcement.image_url))
    setImage(null)
    setModalMode("edit")
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedAnnouncement(null)
    setFormData({
      title: "",
      date: new Date().toISOString().split("T")[0],
      category: "Update",
      description: "",
      content: "",
      is_active: true,
      priority: 0,
    })
    setImage(null)
    setPreview("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("date", formData.date)
      formDataToSend.append("category", formData.category)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("content", formData.content)
      formDataToSend.append("is_active", formData.is_active ? "1" : "0")
      formDataToSend.append("priority", String(formData.priority))

      if (image) {
        formDataToSend.append("image", image)
      }

      const isEdit = modalMode === "edit"
      const url = isEdit ? `/api/announcements/${selectedAnnouncement!.id}` : `/api/announcements`

      if (isEdit) {
        formDataToSend.append("_method", "PATCH")
      }

      const res = await fetch(url, {
        method: "POST",
        body: formDataToSend,
        credentials: "include",
      })

      let data = null
      const text = await res.text()

      if (text) {
        try {
          data = JSON.parse(text)
        } catch (e) {
          console.error("Response is not JSON:", text)
        }
      }

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Error",
          description: data?.message || "Failed to save announcement.",
        })
        return
      }

      toast({
        title: "Success",
        description: modalMode === "create" ? "Announcement created successfully." : "Announcement updated successfully.",
      })

      closeModal()
      fetchAnnouncements()
    } catch (error) {
      console.error("Error saving announcement:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      Alert: "bg-red-500 text-white",
      Event: "bg-purple-500 text-white",
      Update: "bg-blue-500 text-white",
      Development: "bg-indigo-500 text-white",
      Health: "bg-green-500 text-white",
      Notice: "bg-yellow-500 text-white",
    }
    return styles[category] || styles.Update
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <MemberLayout>
      <div className="h-screen overflow-auto bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-emerald-600 to-orange-500 text-white px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-10 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/" className="hover:bg-white/10 p-1 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Announcements</h1>
                <p className="text-white/90 text-xs sm:text-sm mt-0.5">Latest updates from Perpetual Village City</p>
              </div>
            </div>
            <button
              onClick={handleCreateNew}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">New</span>
            </button>
            <button
              onClick={handleCreateNew}
              className="sm:hidden p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Category Filter Tabs */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 sticky top-[60px] sm:top-[68px] z-10 shadow-sm">
          <div className="max-w-7xl mx-auto overflow-x-auto">
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap transition-all ${selectedCategory === category.value
                      ? "bg-gradient-to-r from-emerald-600 to-orange-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading announcements...</p>
                </div>
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No announcements</h3>
                <p className="text-gray-600 text-center max-w-sm mb-4">Check back later for updates from the city.</p>
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-orange-500 text-white rounded-lg hover:from-emerald-700 hover:to-orange-600 transition-all"
                >
                  Create First Announcement
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    onClick={() => handleViewAnnouncement(announcement)}
                    className="group block bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 cursor-pointer"
                  >
                    {announcement.image_url && (
                      <div className="relative aspect-video bg-gradient-to-br from-emerald-100 to-orange-100 overflow-hidden">
                        <Image
                          src={getImageUrl(announcement.image_url)}
                          alt={announcement.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          unoptimized
                        />
                      </div>
                    )}

                    <div className="p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full shadow-sm ${getCategoryBadge(announcement.category)}`}>
                          {announcement.category}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(announcement.date)}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 mb-2 text-base sm:text-lg leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2">
                        {announcement.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">
                        {announcement.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          {announcement.is_active ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <ToggleRight className="w-4 h-4" />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-400">
                              <ToggleLeft className="w-4 h-4" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {modalMode === "create" ? "Create Announcement" : modalMode === "edit" ? "Edit Announcement" : "Announcement Details"}
                  </h2>
                  {selectedAnnouncement && (
                    <p className="text-sm text-gray-500 mt-1">ID #{selectedAnnouncement.id}</p>
                  )}
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="px-4 sm:px-6 py-4 overflow-y-auto flex-1">
                {modalMode === "view" && selectedAnnouncement ? (
                  <div className="space-y-6">
                    {selectedAnnouncement.image_url && (
                      <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={getImageUrl(selectedAnnouncement.image_url)}
                          alt={selectedAnnouncement.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Status</span>
                      <div className="flex items-center gap-2">
                        {selectedAnnouncement.is_active ? (
                          <ToggleRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                        )}
                        <span className={`text-sm font-medium ${selectedAnnouncement.is_active ? "text-green-600" : "text-gray-400"}`}>
                          {selectedAnnouncement.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Title</label>
                        <p className="text-base text-gray-900">{selectedAnnouncement.title}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                          <span className={`inline-block px-3 py-1 text-sm font-bold rounded-full ${getCategoryBadge(selectedAnnouncement.category)}`}>
                            {selectedAnnouncement.category}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
                          <p className="text-base text-gray-900">{formatDate(selectedAnnouncement.date)}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                        <p className="text-base text-gray-900">{selectedAnnouncement.description}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Content</label>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-base text-gray-900 whitespace-pre-wrap">{selectedAnnouncement.content}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Priority</label>
                        <p className="text-base text-gray-900">{selectedAnnouncement.priority}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter announcement title"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value as Announcement["category"] })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="Update">Update</option>
                          <option value="Event">Event</option>
                          <option value="Alert">Alert</option>
                          <option value="Notice">Notice</option>
                          <option value="Development">Development</option>
                          <option value="Health">Health</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Brief description (max 500 characters)"
                        maxLength={500}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Full announcement content"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
                      {preview ? (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors">
                          <div className="flex flex-col items-center">
                            <Upload className="w-12 h-12 text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-600">Upload featured image</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (max 10MB)</p>
                          </div>
                          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority (0-100)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Higher priority appears first</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <div className="flex items-center gap-2 h-[42px]">
                          <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                          />
                          <label htmlFor="is_active" className="text-sm text-gray-700">
                            Active (visible to public)
                          </label>
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 px-4 sm:px-6 py-3 bg-white shadow-lg flex-shrink-0">
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 w-full">
                  {modalMode === "view" ? (
                    <>
                      <button
                        onClick={closeModal}
                        className="w-full sm:w-auto px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                      >
                        Close
                      </button>
                      
                    </>
                  ) : (
                    <>
                      <button
                        onClick={closeModal}
                        className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-4 py-3 bg-gradient-to-r from-emerald-600 to-orange-500 text-white rounded-lg hover:from-emerald-700 hover:to-orange-600 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            {modalMode === "create" ? "Creating..." : "Saving..."}
                          </>
                        ) : (
                          modalMode === "create" ? "Create Announcement" : "Save Changes"
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MemberLayout>
  )
}