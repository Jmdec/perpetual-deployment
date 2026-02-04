"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Eye, Edit, Trash2, ChevronRight, ChevronLeft, Printer } from "lucide-react"
import AdminLayout from "@/components/adminLayout"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/use-toast"
import AdminLegitimacyModal from "@/components/admin/legitimacy/add-edit-form"
import { AdminDeleteLegitimacyModal } from "@/components/admin/legitimacy/delete-form"
import ViewLegitimacyModal from "@/components/admin/legitimacy/view-modal"

interface User {
  id: number
  name: string
  email: string
}

interface Signatory {
  id?: number
  name: string
  signed_date?: string
}

interface LegitimacyRequest {
  id: number
  alias: string
  chapter: string
  position: string
  fraternity_number: string
  status: "pending" | "approved" | "rejected"
  admin_note?: string
  certificate_date?: string
  signatories: Signatory[]
  approved_at?: string
  created_at: string
  updated_at: string
  user: User
}

interface PaginationData {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export default function AdminLegitimacyPage() {
  const { user, loading: authLoading } = useAuth(true)
  const { toast } = useToast()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<LegitimacyRequest | null>(null)
  const [applications, setApplications] = useState<LegitimacyRequest[]>([])
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [selectedApplication, setSelectedApplication] = useState<LegitimacyRequest | null>(null)

  // Fetch applications
  const fetchLegitimacy = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        per_page: pagination.per_page.toString(),
      })
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (searchQuery) params.append("search", searchQuery)

      const res = await fetch(`/api/admin/legitimacy?${params.toString()}`, {
        credentials: "include",
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setApplications(data.data.data || [])
        setPagination({
          current_page: data.data.current_page,
          last_page: data.data.last_page,
          per_page: data.data.per_page,
          total: data.data.total,
          from: data.data.from,
          to: data.data.to,
        })
      } else {
        toast({ variant: "destructive", title: "Error", description: data.message || "Failed to fetch applications" })
      }
    } catch (err) {
      console.error(err)
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch applications" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) fetchLegitimacy()
  }, [authLoading, user, pagination.current_page, statusFilter])

  // Modal handlers
  const openCreateModal = () => {
    setSelectedApplication(null)
    setModalMode("create")
    setIsModalOpen(true)
  }

  const openEditModal = (app: LegitimacyRequest) => {
    console.log("=== OPENING EDIT MODAL ===", {
      appId: app.id,
      appAlias: app.alias,
      fullApp: app
    })
    
    // 🔥 CRITICAL: Set the selected application FIRST
    setSelectedApplication(app)
    setModalMode("edit")
    
    // Then open modal on next tick to ensure state is updated
    setTimeout(() => {
      setIsModalOpen(true)
    }, 0)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    // Clear selected application after modal closes to prevent flicker
    setTimeout(() => {
      setSelectedApplication(null)
    }, 300)
  }

  const openDeleteModal = (app: LegitimacyRequest) => {
    setDeleteTarget(app)
    setIsDeleteOpen(true)
  }

  const handlePrint = async (app: LegitimacyRequest) => {
    try {
      const response = await fetch(`/api/admin/legitimacy/${app.id}/pdf`, {
        credentials: "include",
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `certificate-${app.alias}-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Success",
          description: "Certificate downloaded successfully",
        })
      } else {
        const errorData = await response.json()
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.message || "Failed to generate certificate",
        })
      }
    } catch (error) {
      console.error("Error downloading certificate:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download certificate",
      })
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/legitimacy/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Success", description: "Application deleted successfully" })
        fetchLegitimacy()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to delete application",
        })
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete application" })
    } finally {
      setIsDeleteOpen(false)
      setDeleteTarget(null)
    }
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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Certificate of Legitimacy Applications</h1>
              <p className="text-sm text-gray-500">Manage all applications</p>
            </div>
            <button onClick={openCreateModal} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
              + New Application
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by alias, chapter, or position..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchLegitimacy()}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPagination((p) => ({ ...p, current_page: 1 }))
                  }}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No applications found.</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alias</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chapter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificate Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{app.user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{app.user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{app.alias}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{app.chapter}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{app.position}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${app.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : app.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                            }`}
                        >
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{app.certificate_date ? formatDate(app.certificate_date) : "-"}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              console.log("VIEW button clicked", app.id)
                              setSelectedApplication(app)
                              setIsViewOpen(true)
                            }}
                            className="text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              console.log("PRINT button clicked", app.id)
                              handlePrint(app)
                            }}
                            disabled={app.status !== 'approved'}
                            className={`p-1.5 rounded transition-colors ${app.status === 'approved'
                              ? 'text-purple-600 hover:bg-purple-50'
                              : 'text-gray-400 cursor-not-allowed'
                              }`}
                            title={app.status === 'approved' ? 'Print certificate' : 'Only approved certificates can be downloaded'}
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              console.log("EDIT button clicked!", { 
                                appId: app.id, 
                                event: e,
                                app: app 
                              })
                              openEditModal(app)
                            }}
                            className="text-orange-600 p-1.5 rounded hover:bg-orange-50 transition-colors"
                            title="Edit application"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              console.log("DELETE button clicked", app.id)
                              openDeleteModal(app)
                            }}
                            className="text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
                            title="Delete application"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
                        onClick={() => setPagination((p) => ({ ...p, current_page: pageNum }))}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${pagination.current_page === pageNum ? "bg-orange-600 text-white" : "border border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() =>
                    setPagination((p) => ({
                      ...p,
                      current_page: Math.min(p.current_page + 1, p.last_page),
                    }))
                  }
                  disabled={pagination.current_page === pagination.last_page}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <ViewLegitimacyModal
          isOpen={isViewOpen}
          selectedItem={selectedApplication}
          onClose={() => {
            setIsViewOpen(false)
            setSelectedApplication(null)
          }}
        />
        
        {/* 🔥 CRITICAL FIX: Only render modal when we have data in edit mode OR when in create mode */}
        {isModalOpen && (modalMode === "create" || (modalMode === "edit" && selectedApplication?.id)) && (
          <AdminLegitimacyModal
            isOpen={isModalOpen}
            mode={modalMode}
            initialData={selectedApplication || undefined}
            onClose={closeModal}
            onSubmitSuccess={() => {
              fetchLegitimacy()
              closeModal()
            }}
          />
        )}
        
        <AdminDeleteLegitimacyModal
          isOpen={isDeleteOpen}
          itemName={deleteTarget?.alias || "Application"}
          onClose={() => {
            setIsDeleteOpen(false)
            setDeleteTarget(null)
          }}
          onConfirm={confirmDelete}
        />
      </div>
    </AdminLayout>
  )
}