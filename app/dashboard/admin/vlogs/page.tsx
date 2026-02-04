"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Eye, Edit, Trash2, ChevronRight, ChevronLeft } from "lucide-react"
import AdminLayout from "@/components/adminLayout"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/use-toast"
import ViewVlogsModal from "@/components/admin/vlogs/view-modal"
import AdminVlogsModal from "@/components/admin/vlogs/add-edit-modal"
import { AdminDeleteVlogsModal } from "@/components/admin/vlogs/delete-modal"

interface Vlog {
  id: number
  title: string
  category: string
  description?: string
  is_active: boolean
  date: string
  created_at: string
  video?: File | string
  content: string
}

interface PaginationData {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export default function AdminVlogsPage() {
  const { user, loading: authLoading } = useAuth(true)
  const { toast } = useToast()
  const [vlogs, setVlogs] = useState<Vlog[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [selectedVlog, setSelectedVlog] = useState<Vlog | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Vlog | null>(null)
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  })

  const fetchVlogs = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: pagination.per_page.toString(),
      })
      if (search) params.append("search", search)
      if (category) params.append("category", category)

      const res = await fetch(`/api/admin/vlogs?${params.toString()}`, {
        credentials: "include",
      })
      const json = await res.json()

      if (res.ok && json.success) {
        setVlogs(json.data.data)
        setPagination({
          current_page: json.data.current_page,
          last_page: json.data.last_page,
          per_page: json.data.per_page,
          total: json.data.total,
          from: json.data.from,
          to: json.data.to,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: json.message || "Failed to load vlogs",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Server error",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const uniqueCategories = Array.from(new Set(vlogs.map((vlog) => vlog.category)))
    setCategories(uniqueCategories)
  }, [vlogs])

  useEffect(() => {
    fetchVlogs(1)
  }, [search, category])

  useEffect(() => {
    if (!authLoading && user) fetchVlogs()
  }, [authLoading, user, pagination.current_page])

  const openCreateModal = () => {
    setSelectedVlog(null)
    setModalMode("create")
    setIsModalOpen(true)
  }

  const openEditModal = (vlog: Vlog) => {
    setSelectedVlog(vlog)
    setModalMode("edit")
    setIsModalOpen(true)
  }

  const openDeleteModal = (vlog: Vlog) => {
    setDeleteTarget(vlog)
    setIsDeleteOpen(true)
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })

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
      <div className="h-full overflow-auto bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Vlogs Management</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage and review all vlogs</p>
            </div>
            <button onClick={openCreateModal} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
              + New Vlog
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Search & Filter */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by title, category, or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchVlogs()}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Vlogs Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                </div>
              ) : vlogs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No vlogs found.</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vlogs.map((vlog) => (
                      <tr key={vlog.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">{vlog.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{vlog.category}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{formatDate(vlog.date) || "-"}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{vlog.is_active ? "Active" : "Inactive"}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(vlog.created_at)}</td>
                        <td className="px-6 py-4 text-sm flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedVlog(vlog)
                              setIsViewOpen(true)
                            }}
                            className="text-blue-400 p-1.5 rounded hover:bg-blue-50"
                          >
                            <Eye />
                          </button>
                          <button
                            onClick={() => (openEditModal(vlog), setSelectedVlog(vlog))}
                            className="text-orange-600 p-1.5 rounded hover:bg-orange-50"
                          >
                            <Edit />
                          </button>
                          <button
                            onClick={() => (openDeleteModal(vlog), setSelectedVlog(vlog))}
                            className="text-red-600 p-1.5 rounded hover:bg-red-50"
                          >
                            <Trash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {pagination.total > pagination.per_page && (
              <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing {pagination.from} to {pagination.to} of {pagination.total} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination((p) => ({ ...p, current_page: Math.max(p.current_page - 1, 1) }))}
                    disabled={pagination.current_page === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                      let pageNum
                      if (pagination.last_page <= 5) pageNum = i + 1
                      else if (pagination.current_page <= 3) pageNum = i + 1
                      else if (pagination.current_page >= pagination.last_page - 2) pageNum = pagination.last_page - 4 + i
                      else pageNum = pagination.current_page - 2 + i

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPagination((p) => ({ ...p, current_page: pageNum }))}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            pagination.current_page === pageNum ? "bg-orange-600 text-white" : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => setPagination((p) => ({ ...p, current_page: Math.min(p.current_page + 1, p.last_page) }))}
                    disabled={pagination.current_page === pagination.last_page}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Modals */}
        <ViewVlogsModal
          isOpen={isViewOpen}
          selectedItem={selectedVlog}
          onClose={() => {
            setIsViewOpen(false)
            setSelectedVlog(null)
          }}
        />
        {isModalOpen && (
          <AdminVlogsModal
            isOpen={isModalOpen}
            mode={modalMode}
            initialData={selectedVlog || undefined}
            onClose={() => setIsModalOpen(false)}
            onSubmitSuccess={fetchVlogs}
          />
        )}
        <AdminDeleteVlogsModal
          isOpen={isDeleteOpen}
          itemName={deleteTarget?.title || "Title"}
          vlogId={selectedVlog}
          onClose={() => {
            setIsDeleteOpen(false)
            setDeleteTarget(null)
          }}
          onDeleted={fetchVlogs}
        />
      </div>
    </AdminLayout>
  )
}
