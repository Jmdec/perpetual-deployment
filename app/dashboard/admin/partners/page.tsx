"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Eye, Edit, Trash2, ChevronRight, ChevronLeft } from "lucide-react"
import AdminLayout from "@/components/adminLayout"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/use-toast"
import ViewBusinessModal from "@/components/admin/partners/view-modal"
import AdminBusinessModal from "@/components/admin/partners/edit-modal"
import { AdminDeleteBusinessModal } from "@/components/admin/partners/delete-modal"

interface BusinessPartner {
  id: number
  business_name: string
  category: string
  description?: string
  status: "pending" | "approved" | "rejected"
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

export default function AdminPartnersPage() {
  const { user, loading: authLoading } = useAuth(true)
  const { toast } = useToast()

  const [partners, setPartners] = useState<BusinessPartner[]>([])
  const [loading, setLoading] = useState(true)
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

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [selectedPartner, setSelectedPartner] = useState<BusinessPartner | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<BusinessPartner | null>(null)

  // Fetch partners
  const fetchPartners = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        per_page: pagination.per_page.toString(),
      })
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (searchQuery) params.append("search", searchQuery)

      const res = await fetch(`/api/admin/business-partners?${params.toString()}`, { credentials: "include" })
      const data = await res.json()

      if (res.ok && data.success) {
        setPartners(data.data.data || [])
        setPagination({
          current_page: data.data.current_page,
          last_page: data.data.last_page,
          per_page: data.data.per_page,
          total: data.data.total,
          from: data.data.from,
          to: data.data.to,
        })
      } else {
        toast({ variant: "destructive", title: "Error", description: data.message || "Failed to fetch partners" })
      }
    } catch (err) {
      console.error(err)
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch partners" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) fetchPartners()
  }, [authLoading, user, pagination.current_page, statusFilter])

  // Modal handlers
  const openCreateModal = () => {
    setSelectedPartner(null)
    setModalMode("create")
    setIsModalOpen(true)
  }

  const openEditModal = (partner: BusinessPartner) => {
    setSelectedPartner(partner)
    setModalMode("edit")
    setIsModalOpen(true)
  }

  const openDeleteModal = (partner: BusinessPartner) => {
    setDeleteTarget(partner)
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/business-partners/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Success", description: "Partner deleted successfully" })
        fetchPartners()
      } else {
        toast({ variant: "destructive", title: "Error", description: data.message || "Failed to delete partner" })
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete partner" })
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
              <h1 className="text-2xl font-bold text-gray-900">Business Partners Management</h1>
              <p className="text-sm text-gray-500">Manage all business partners showcase</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, category, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchPartners()}
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

          {/* Partners Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              </div>
            ) : partners.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No business partners found.</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {partners.map((partner) => (
                    <tr key={partner.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{partner.business_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{partner.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{partner.description || "-"}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            partner.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : partner.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(partner.created_at)}</td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedPartner(partner)
                            setIsViewOpen(true)
                          }}
                          className="text-blue-400 p-1.5 rounded hover:bg-blue-50"
                        >
                          <Eye />
                        </button>
                        <button onClick={() => openEditModal(partner)} className="text-orange-600 p-1.5 rounded hover:bg-orange-50">
                          <Edit />
                        </button>
                        <button onClick={() => openDeleteModal(partner)} className="text-red-600 p-1.5 rounded hover:bg-red-50">
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

        {/* Modals */}
        <ViewBusinessModal
          isOpen={isViewOpen}
          selectedItem={selectedPartner}
          onClose={() => {
            setIsViewOpen(false)
            setSelectedPartner(null)
          }}
        />
        {isModalOpen && (
          <AdminBusinessModal
            isOpen={isModalOpen}
            mode={modalMode}
            initialData={selectedPartner || undefined}
            onClose={() => setIsModalOpen(false)}
            onSubmitSuccess={fetchPartners}
          />
        )}
        <AdminDeleteBusinessModal
          isOpen={isDeleteOpen}
          itemName={deleteTarget?.business_name || "Partner"}
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
