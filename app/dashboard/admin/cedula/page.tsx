"use client"

import { useState, useEffect } from "react"
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  X,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  Briefcase,
  CreditCard,
  Ruler,
  Weight
} from "lucide-react"
import AdminLayout from "@/components/adminLayout"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/use-toast"

interface Cedula {
  id: number
  full_name: string
  email: string
  phone: string
  address: string
  birth_date: string
  civil_status: string
  citizenship: string
  occupation: string
  tin_number?: string
  height: number
  height_unit: string
  weight: number
  weight_unit: string
  status: "pending" | "processing" | "approved" | "rejected"
  rejection_reason?: string
  cedula_number?: string
  approved_at?: string
  expires_at?: string
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

export default function AdminCedulaPage() {
  const { user, loading: authLoading } = useAuth(true)
  const { toast } = useToast()
  
  const [cedulas, setCedulas] = useState<Cedula[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedCedula, setSelectedCedula] = useState<Cedula | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  })

  useEffect(() => {
    if (!authLoading && user) {
      fetchCedulas()
    }
  }, [authLoading, user, pagination.current_page, statusFilter])

  const fetchCedulas = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        per_page: pagination.per_page.toString(),
      })
      
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }
      
      if (searchQuery) {
        params.append("search", searchQuery)
      }

      const response = await fetch(`/api/cedula?${params}`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setCedulas(data.data.data || [])
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
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch cedula applications.",
        })
      }
    } catch (error) {
      console.error("Error fetching cedulas:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load applications.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewCedula = (cedula: Cedula) => {
    setSelectedCedula(cedula)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedCedula(null)
  }

  const handleUpdateStatus = async (id: number, newStatus: "approved" | "rejected") => {
    try {
      const rejectionReason = newStatus === "rejected" 
        ? prompt("Please provide a rejection reason:")
        : null

      if (newStatus === "rejected" && !rejectionReason) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Rejection reason is required.",
        })
        return
      }

      const response = await fetch(`/api/cedula/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: newStatus,
          rejection_reason: rejectionReason,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: `Cedula ${newStatus === "approved" ? "approved" : "rejected"} successfully.`,
        })
        
        closeModal()
        fetchCedulas()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to update status.",
        })
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update cedula status.",
      })
    }
  }

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current_page: 1 }))
    fetchCedulas()
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, current_page: page }))
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-orange-100 text-orange-700",
      processing: "bg-blue-100 text-blue-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    }
    
    const icons = {
      pending: <Clock className="w-3 h-3" />,
      processing: <Clock className="w-3 h-3" />,
      approved: <CheckCircle className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />,
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
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
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-600">Loading...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="h-full overflow-auto bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Cedula Applications</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage and review community tax certificate requests</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <FileText className="w-5 h-5" />
              <span className="font-medium">{pagination.total} Total</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="max-w-7xl mx-auto">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex gap-2">
                  <div className="relative flex-1 sm:flex-none sm:w-40">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value)
                        setPagination((prev) => ({ ...prev, current_page: 1 }))
                      }}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards - Mobile */}
            <div className="grid grid-cols-3 gap-2 sm:hidden mb-4">
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-lg font-bold text-orange-600">
                  {cedulas.filter((c) => c.status === "pending").length}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <p className="text-xs text-gray-600">Approved</p>
                <p className="text-lg font-bold text-green-600">
                  {cedulas.filter((c) => c.status === "approved").length}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <p className="text-xs text-gray-600">Rejected</p>
                <p className="text-lg font-bold text-red-600">
                  {cedulas.filter((c) => c.status === "rejected").length}
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-3"></div>
                    <p className="text-gray-600 text-sm">Loading applications...</p>
                  </div>
                </div>
              ) : cedulas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-gray-600 font-medium">No applications found</p>
                  <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                <>
                  {/* Scrollable Table */}
                  <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-linear-to-r from-emerald-600 to-orange-500 text-white">
                          <tr>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Full Name</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Email</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Phone</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Civil Status</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Occupation</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Status</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Date</th>
                            <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold uppercase whitespace-nowrap sticky right-0 bg-linear-to-r from-emerald-600 to-orange-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {cedulas.map((cedula) => (
                            <tr key={cedula.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-3 sm:px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                                <div className="max-w-[150px] truncate" title={cedula.full_name}>
                                  {cedula.full_name}
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                <div className="max-w-[150px] truncate" title={cedula.email}>
                                  {cedula.email}
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                {cedula.phone}
                              </td>
                              <td className="px-3 sm:px-4 py-3 text-sm text-gray-600 whitespace-nowrap capitalize">
                                {cedula.civil_status}
                              </td>
                              <td className="px-3 sm:px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                <div className="max-w-[120px] truncate" title={cedula.occupation}>
                                  {cedula.occupation}
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                                {getStatusBadge(cedula.status)}
                              </td>
                              <td className="px-3 sm:px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                {formatDate(cedula.created_at)}
                              </td>
                              <td className="px-3 sm:px-4 py-3 text-center whitespace-nowrap sticky right-0 bg-white">
                                <button
                                  onClick={() => handleViewCedula(cedula)}
                                  className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-200 transition-colors"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span className="hidden sm:inline">View</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Scroll Hint */}
                  <div className="lg:hidden bg-orange-50 border-t border-orange-100 px-4 py-2 text-center">
                    <p className="text-xs text-orange-700 flex items-center justify-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                      </svg>
                      Swipe left to see more
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Pagination */}
            {!loading && cedulas.length > 0 && (
              <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-sm text-gray-600">
                    Showing {pagination.from} to {pagination.to} of {pagination.total} results
                  </p>
                  
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
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                              pagination.current_page === pageNum
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
              </div>
            )}
          </div>
        </main>

        {/* View Modal */}
        {isModalOpen && selectedCedula && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white sm:rounded-xl shadow-2xl w-full sm:max-w-4xl h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="bg-linear-to-r from-emerald-600 to-orange-500 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold truncate">Cedula Details</h2>
                    <p className="text-xs sm:text-sm text-white/90">Application #{selectedCedula.id}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain">
                <div className="space-y-4 sm:space-y-6 pb-4">
                  {/* Status Section */}
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-sm font-medium text-gray-700">Application Status</span>
                      {getStatusBadge(selectedCedula.status)}
                    </div>
                    {selectedCedula.rejection_reason && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          <span className="font-medium">Rejection Reason: </span>
                          {selectedCedula.rejection_reason}
                        </p>
                      </div>
                    )}
                    {selectedCedula.cedula_number && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          <span className="font-medium">Cedula Number: </span>
                          {selectedCedula.cedula_number}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Personal Information */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Full Name</label>
                        <p className="text-sm sm:text-base text-gray-900 font-medium break-words">{selectedCedula.full_name}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                          Email
                        </label>
                        <p className="text-sm sm:text-base text-gray-900 break-all">{selectedCedula.email}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                          Phone
                        </label>
                        <p className="text-sm sm:text-base text-gray-900">{selectedCedula.phone}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          Birth Date
                        </label>
                        <p className="text-sm sm:text-base text-gray-900">{formatDate(selectedCedula.birth_date)}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                          Address
                        </label>
                        <p className="text-sm sm:text-base text-gray-900 break-words">{selectedCedula.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Civil & Citizenship Information */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      Civil & Citizenship Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Civil Status</label>
                        <p className="text-sm sm:text-base text-gray-900 capitalize">{selectedCedula.civil_status}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Citizenship</label>
                        <p className="text-sm sm:text-base text-gray-900">{selectedCedula.citizenship}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                          <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
                          Occupation
                        </label>
                        <p className="text-sm sm:text-base text-gray-900">{selectedCedula.occupation}</p>
                      </div>
                      {selectedCedula.tin_number && (
                        <div>
                          <label className="text-xs sm:text-sm font-medium text-gray-500">TIN Number</label>
                          <p className="text-sm sm:text-base text-gray-900">{selectedCedula.tin_number}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Physical Information */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                      <Ruler className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      Physical Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                          <Ruler className="w-3 h-3 sm:w-4 sm:h-4" />
                          Height
                        </label>
                        <p className="text-sm sm:text-base text-gray-900">
                          {selectedCedula.height} {selectedCedula.height_unit}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                          <Weight className="w-3 h-3 sm:w-4 sm:h-4" />
                          Weight
                        </label>
                        <p className="text-sm sm:text-base text-gray-900">
                          {selectedCedula.weight} {selectedCedula.weight_unit}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Application Dates */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      Important Dates
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Application Date</label>
                        <p className="text-sm sm:text-base text-gray-900">{formatDate(selectedCedula.created_at)}</p>
                      </div>
                      {selectedCedula.approved_at && (
                        <div>
                          <label className="text-xs sm:text-sm font-medium text-gray-500">Approved Date</label>
                          <p className="text-sm sm:text-base text-gray-900">{formatDate(selectedCedula.approved_at)}</p>
                        </div>
                      )}
                      {selectedCedula.expires_at && (
                        <div>
                          <label className="text-xs sm:text-sm font-medium text-gray-500">Expiration Date</label>
                          <p className="text-sm sm:text-base text-gray-900">{formatDate(selectedCedula.expires_at)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 px-4 sm:px-6 py-3 bg-white shadow-lg flex-shrink-0">
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 w-full">
                  {selectedCedula.status === "pending" ? (
                    <>
                      <button
                        onClick={closeModal}
                        className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
                      >
                        Close
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(selectedCedula.id, "rejected")}
                        className="w-full sm:w-auto px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(selectedCedula.id, "approved")}
                        className="w-full sm:w-auto px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Approve
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={closeModal}
                      className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
                    >
                      Close
                    </button>
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