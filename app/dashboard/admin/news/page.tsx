"use client"
import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  Eye,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  X,
  Calendar,
  Upload,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react"
import Image from "next/image"
import AdminLayout from "@/components/adminLayout"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/use-toast"

interface News {
  id: number
  title: string
  content: string
  category: string
  status: "draft" | "published" | "archived"
  image_url?: string
  published_at?: string
  created_at: string
  updated_at: string
}

interface PaginationData {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export default function AdminNewsPage() {
  const { user, loading: authLoading } = useAuth(true)
  const { toast } = useToast()

  const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000"

  // Helper function to get full image URL
  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return ""

    // If the URL already includes http:// or https://, return as is
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl
    }

    // If it starts with a slash, concatenate with IMAGE_URL
    if (imageUrl.startsWith("/")) {
      return `${IMAGE_URL}${imageUrl}`
    }

    // For relative paths like 'images/news/file.png', add leading slash
    return `${IMAGE_URL}/${imageUrl}`
  }

  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedNews, setSelectedNews] = useState<News | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"view" | "create" | "edit">("view")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  })

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    status: "draft" as News["status"],
    published_at: "",
  })

  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")

  const categories = [
    { value: "Development", label: "Development", color: "bg-green-100 text-green-700" },
    { value: "Business", label: "Business", color: "bg-blue-100 text-blue-700" },
    { value: "Health", label: "Health", color: "bg-red-100 text-red-700" },
    { value: "Education", label: "Education", color: "bg-purple-100 text-purple-700" },
    { value: "Environment", label: "Environment", color: "bg-emerald-100 text-emerald-700" },
    { value: "Community", label: "Community", color: "bg-orange-100 text-orange-700" },
    { value: "Infrastructure", label: "Infrastructure", color: "bg-gray-100 text-gray-700" },
    { value: "Events", label: "Events", color: "bg-pink-100 text-pink-700" },
  ]

  useEffect(() => {
    if (!authLoading && user) {
      fetchNews()
    }
  }, [authLoading, user])

  useEffect(() => {
    if (!authLoading && user) {
      fetchNews()
    }
  }, [pagination.current_page, categoryFilter, statusFilter])

  const fetchNews = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        per_page: pagination.per_page.toString(),
      })

      if (categoryFilter !== "all") {
        params.append("category", categoryFilter)
      }

      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      if (searchQuery) {
        params.append("search", searchQuery)
      }

      const response = await fetch(`/api/admin/news?${params}`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        console.log("News response:", data)

        if (data.success && data.data) {
          setNews(data.data.data || [])
          setPagination({
            current_page: data.data.current_page || 1,
            last_page: data.data.last_page || 1,
            per_page: data.data.per_page || 15,
            total: data.data.total || 0,
            from: data.data.from || 0,
            to: data.data.to || 0,
          })
        }
      } else {
        const errorData = await response.json()
        console.error("Error response:", errorData)
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.message || "Failed to fetch news.",
        })
      }
    } catch (error) {
      console.error("Error fetching news:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load news.",
      })
    } finally {
      setLoading(false)
    }
  }

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

  const handleViewNews = (newsItem: News) => {
    setSelectedNews(newsItem)
    setModalMode("view")
    setIsModalOpen(true)
  }

  const handleCreateNew = () => {
    setFormData({
      title: "",
      content: "",
      category: "",
      status: "draft",
      published_at: "",
    })
    setImage(null)
    setPreview("")
    setSelectedNews(null)
    setModalMode("create")
    setIsModalOpen(true)
  }

  const [editingId, setEditingId] = useState<number | null>(null)

  const handleEdit = (newsItem: News) => {
    setSelectedNews(newsItem)
    setEditingId(newsItem.id) // Capture the ID separately
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      category: newsItem.category,
      status: newsItem.status,
      published_at: newsItem.published_at || "",
    })
    setPreview(getImageUrl(newsItem.image_url))
    setImage(null)
    setModalMode("edit")
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedNews(null)
    setFormData({
      title: "",
      content: "",
      category: "",
      status: "draft",
      published_at: "",
    })
    setImage(null)
    setPreview("")
  }

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.content || !formData.category) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all required fields.",
        })
        return
      }

      setIsSubmitting(true)

      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("content", formData.content)
      formDataToSend.append("category", formData.category)
      formDataToSend.append("status", formData.status)

      if (formData.published_at) {
        formDataToSend.append("published_at", formData.published_at)
      }

      if (image) {
        formDataToSend.append("image", image)
      }

      const isEdit = modalMode === "edit"
      const url = isEdit
        ? `/api/admin/news/${selectedNews?.id}`
        : "/api/admin/news"

      // Always use POST - Laravel will handle _method=PATCH internally
      const method = "POST"

      console.log("Submitting news:", { url, method, isEdit })

      const response = await fetch(url, {
        method,
        credentials: "include",
        body: formDataToSend,
      })

      const data = await response.json()
      console.log("Submit response:", data)

      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: `News ${modalMode === "create" ? "created" : "updated"} successfully.`,
        })
        closeModal()
        fetchNews()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to save news.",
        })
      }
    } catch (error) {
      console.error("Error saving news:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save news.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this news article?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/news/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "News deleted successfully.",
        })
        fetchNews()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to delete news.",
        })
      }
    } catch (error) {
      console.error("Error deleting news:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete news.",
      })
    }
  }

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current_page: 1 }))
    fetchNews()
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, current_page: page }))
  }

  const getCategoryBadge = (category: string) => {
    const cat = categories.find((c) => c.value === category)
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${cat?.color || "bg-gray-100 text-gray-700"}`}>
        {category}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-gray-100 text-gray-700",
      published: "bg-green-100 text-green-700",
      archived: "bg-yellow-100 text-yellow-700",
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
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
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Newspaper className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">News Management</h1>
                  <p className="text-sm text-gray-500">Manage news articles and updates</p>
                </div>
              </div>
              <button
                onClick={handleCreateNew}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#eda909b0] text-white rounded-lg hover:bg-yellow-500/90 transition-all"
              >
                <Plus className="w-5 h-5" />
                New Article
              </button>
              <button
                onClick={handleCreateNew}
                className="sm:hidden p-2 bg-gradient-to-r from-emerald-600 to-orange-500 text-white rounded-lg hover:bg-yellow-500/90 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value)
                    setPagination((prev) => ({ ...prev, current_page: 1 }))
                  }}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPagination((prev) => ({ ...prev, current_page: 1 }))
                  }}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="mt-4 w-full sm:w-auto px-6 py-2 bg-[#eda909b0] text-white rounded-lg hover:bg-yellow-500/90 transition-colors text-sm font-medium"
            >
              Search
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:hidden">
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <p className="text-xs text-gray-500 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <p className="text-xs text-gray-500 mb-1">Published</p>
              <p className="text-2xl font-bold text-green-600">
                {news.filter((n) => n.status === "published").length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <p className="text-xs text-gray-500 mb-1">Draft</p>
              <p className="text-2xl font-bold text-gray-400">
                {news.filter((n) => n.status === "draft").length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading news...</p>
                </div>
              </div>
            ) : news.length === 0 ? (
              <div className="text-center py-12">
                <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No news found</h3>
                <p className="text-gray-500 mb-4">Create your first news article</p>
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-2 bg-gradient-to-br from-yellow-600/90 via-red-600/90 to-red-800/90 text-white rounded-lg hover:shadow-orange-500/50 transition-colors"
                >
                  New Article
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Published
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {news.map((newsItem) => (
                        <tr key={newsItem.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {newsItem.image_url && (
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                  <Image
                                    src={getImageUrl(newsItem.image_url)}
                                    alt={newsItem.title}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                    unoptimized
                                  />
                                </div>
                              )}
                              <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                {newsItem.title}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getCategoryBadge(newsItem.category)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(newsItem.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {newsItem.published_at ? formatDate(newsItem.published_at) : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewNews(newsItem)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(newsItem)}
                                className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(newsItem.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {!loading && news.length > 0 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-700">
                      Showing {pagination.from} to {pagination.to} of {pagination.total} results
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                          let pageNum
                          if (pagination.last_page <= 5) {
                            pageNum = i + 1
                          } else if (pagination.current_page <= 3) {
                            pageNum = i + 1
                          } else if (pagination.current_page >= pagination.last_page - 2) {
                            pageNum = pagination.last_page - 4 + i
                          } else {
                            pageNum = pagination.current_page - 2 + i
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${pagination.current_page === pageNum
                                ? "bg-orange-600 text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                      </div>

                      <button
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.last_page}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
              <div className="border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {modalMode === "create" ? "Create News Article" : modalMode === "edit" ? "Edit News Article" : "News Details"}
                  </h2>
                  {selectedNews && (
                    <p className="text-sm text-gray-500 mt-1">ID #{selectedNews.id}</p>
                  )}
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="px-4 sm:px-6 py-4 overflow-y-auto flex-1">
                {modalMode === "view" && selectedNews ? (
                  <div className="space-y-6">
                    {selectedNews.image_url && (
                      <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={getImageUrl(selectedNews.image_url)}
                          alt={selectedNews.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Title</label>
                        <p className="text-base text-gray-900">{selectedNews.title}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                          <div>{getCategoryBadge(selectedNews.category)}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                          <div>{getStatusBadge(selectedNews.status)}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Published</label>
                          <p className="text-base text-gray-900">
                            {selectedNews.published_at ? formatDate(selectedNews.published_at) : "-"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Content</label>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-base text-gray-900 whitespace-pre-wrap">{selectedNews.content}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter news title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {categories.map((cat) => (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, category: cat.value })}
                            className={`px-3 py-2 rounded-lg border-2 font-medium text-xs transition-all ${formData.category === cat.value
                              ? `${cat.color} border-current`
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                              }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                        placeholder="Write your article content here..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Featured Image
                      </label>

                      {preview ? (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
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
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value as News["status"] })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>

                      {formData.status === "published" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Publish Date & Time
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="datetime-local"
                              value={formData.published_at}
                              onChange={(e) =>
                                setFormData({ ...formData, published_at: e.target.value })
                              }
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Leave empty to publish now</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 px-4 sm:px-6 py-3 bg-white shadow-lg flex-shrink-0">
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 w-full">
                  {modalMode === "view" ? (
                    <>
                      <button
                        onClick={closeModal}
                        className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => handleEdit(selectedNews!)}
                        className="w-full sm:w-auto px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                      >
                        Edit
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
                          modalMode === "create" ? "Create Article" : "Save Changes"
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
    </AdminLayout>
  )
}