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
  Users,
  X,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  FileText,
  CreditCard,
  AlertCircle,
  Hash,
  Printer,
} from "lucide-react"
import AdminLayout from "@/components/adminLayout"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: number
  name: string
  email: string
  phone_number?: string
  address?: string
  fraternity_number?: string
  status: "pending" | "approved" | "rejected" | "deactivated"
  rejection_reason?: string
  role: string
  created_at: string
  updated_at: string
  email_verified_at?: string
}

interface PaginationData {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth(true)
  const { toast } = useToast()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [actionType, setActionType] = useState<"approved" | "rejected" | "deactivated" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
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
      fetchUsers()
    }
  }, [authLoading, user, pagination.current_page, statusFilter])

  const fetchUsers = async () => {
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

      const response = await fetch(`/api/users?${params}`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setUsers(data.data.data || [])
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
          description: "Failed to fetch users.",
        })
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
    setIsConfirmModalOpen(false)
    setActionType(null)
    setRejectionReason("")
  }

  const openConfirmModal = (type: "approved" | "rejected" | "deactivated") => {
    setActionType(type)
    setIsConfirmModalOpen(true)
  }

 const handleUpdateStatus = async () => {
  if (!selectedUser || !actionType) return

  try {
    if ((actionType === "rejected" || actionType === "deactivated") && !rejectionReason.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `${actionType === "rejected" ? "Rejection" : "Deactivation"} reason is required.`,
      })
      return
    }

    const response = await fetch(`/api/users`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        userId: selectedUser.id,
        status: actionType,
        rejection_reason: actionType === "rejected" || actionType === "deactivated" ? rejectionReason : null,
      }),
    })

    // Check if response has content
    const contentType = response.headers.get('content-type')
    let data

    if (contentType && contentType.includes('application/json')) {
      const text = await response.text()
      
      if (text && text.trim() !== '') {
        try {
          data = JSON.parse(text)
        } catch (parseError) {
          console.error('JSON parse error:', parseError)
          console.error('Response text:', text)
          throw new Error('Invalid response from server')
        }
      } else {
        // Empty response but successful
        if (response.ok) {
          data = { success: true, message: 'Status updated successfully' }
        } else {
          throw new Error(`Server returned ${response.status} with empty response`)
        }
      }
    } else {
      // Not JSON response
      const text = await response.text()
      console.error('Non-JSON response:', text)
      throw new Error('Server did not return JSON response')
    }

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to update status')
    }

    toast({
      title: "Success",
      description: data.message || `User ${actionType} successfully.`,
    })
    
    closeModal()
    fetchUsers()

  } catch (error) {
    console.error("Error updating status:", error)
    toast({
      variant: "destructive",
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to update user status.",
    })
  }
}

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current_page: 1 }))
    fetchUsers()
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, current_page: page }))
  }

  const handlePrintPDF = async () => {
    try {
      const params = new URLSearchParams()

      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      if (searchQuery) {
        params.append("search", searchQuery)
      }

      const queryString = params.toString()

      // FIXED: Changed from /api/export-pdf to /api/users/export/pdf
      const url = queryString ? `/api/export-pdf?${queryString}` : "/api/export-pdf"

      console.log("Downloading PDF from:", url)

      const response = await fetch(url, {
        credentials: "include",
      })

      if (response.ok) {
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = downloadUrl
        a.download = `users-report-${new Date().toISOString().split("T")[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(downloadUrl)
        document.body.removeChild(a)

        toast({
          title: "Success",
          description: "PDF report generated successfully.",
        })
      } else {
        const errorData = await response.json()
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.message || "Failed to generate PDF report.",
        })
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF report.",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-orange-100 text-orange-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      deactivated: "bg-gray-100 text-gray-700",
    }

    const icons = {
      pending: <Clock className="w-3 h-3" />,
      approved: <CheckCircle className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />,
      deactivated: <XCircle className="w-3 h-3" />,
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage and review student registrations</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-5 h-5" />
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
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="deactivated">Deactivated</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                  >
                    Search
                  </button>

                  <button
                    onClick={handlePrintPDF}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Print PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards - Mobile */}
            <div className="grid grid-cols-3 gap-2 sm:hidden mb-4">
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-lg font-bold text-orange-600">{users.filter((u) => u.status === "pending").length}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <p className="text-xs text-gray-600">Approved</p>
                <p className="text-lg font-bold text-green-600">{users.filter((u) => u.status === "approved").length}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <p className="text-xs text-gray-600">Rejected</p>
                <p className="text-lg font-bold text-red-600">{users.filter((u) => u.status === "rejected").length}</p>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-3"></div>
                    <p className="text-gray-600 text-sm">Loading users...</p>
                  </div>
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-gray-600 font-medium">No users found</p>
                  <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                <>
                  {/* Scrollable Table */}
                  <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-linear-to-r from-red-600 to-orange-500 text-white">
                          <tr>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Name</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Email</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Phone</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Address</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Status</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Registered</th>
                            <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold uppercase whitespace-nowrap sticky right-0 bg-linear-to-r from-red-600 to-orange-500">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-3 sm:px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                                <div className="max-w-[150px] truncate" title={user.name}>
                                  {user.name}
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                <div className="max-w-[180px] truncate" title={user.email}>
                                  {user.email}
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{user.phone_number || "N/A"}</td>
                              <td className="px-3 sm:px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                <div className="max-w-[200px] truncate" title={user.address || ""}>
                                  {user.address || "N/A"}
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-3 whitespace-nowrap">{getStatusBadge(user.status)}</td>
                              <td className="px-3 sm:px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(user.created_at)}</td>
                              <td className="px-3 sm:px-4 py-3 text-center whitespace-nowrap sticky right-0 bg-white">
                                <button
                                  onClick={() => handleViewUser(user)}
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
            {!loading && users.length > 0 && (
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
                              pagination.current_page === pageNum ? "bg-orange-600 text-white" : "border border-gray-300 hover:bg-gray-50"
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
        {isModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white sm:rounded-xl shadow-2xl w-full sm:max-w-3xl h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="bg-linear-to-r from-red-600 to-orange-500 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold truncate">Citizen Details</h2>
                    <p className="text-xs sm:text-sm text-white/90">User #{selectedUser.id}</p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain">
                <div className="space-y-4 sm:space-y-6 pb-4">
                  {/* Status Section */}
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-sm font-medium text-gray-700">Account Status</span>
                      {getStatusBadge(selectedUser.status)}
                    </div>
                    {selectedUser.rejection_reason && (selectedUser.status === "rejected" || selectedUser.status === "deactivated") && (
                      <div
                        className={`mt-2 p-3 border rounded-lg ${
                          selectedUser.status === "deactivated" ? "bg-gray-50 border-gray-300" : "bg-red-50 border-red-200"
                        }`}
                      >
                        <p className={`text-sm flex items-start gap-2 ${selectedUser.status === "deactivated" ? "text-gray-800" : "text-red-800"}`}>
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>
                            <span className="font-medium">{selectedUser.status === "deactivated" ? "Deactivation" : "Rejection"} Reason: </span>
                            {selectedUser.rejection_reason}
                          </span>
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
                        <label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                          <User className="w-3 h-3 sm:w-4 sm:h-4" />
                          Full Name
                        </label>
                        <p className="text-sm sm:text-base text-gray-900 break-words">{selectedUser.name}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                          Email Address
                        </label>
                        <p className="text-sm sm:text-base text-gray-900 break-all">{selectedUser.email}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                          Phone Number
                        </label>
                        <p className="text-sm sm:text-base text-gray-900">{selectedUser.phone_number || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Role</label>
                        <p className="text-sm sm:text-base text-gray-900 capitalize">{selectedUser.role}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                          Address
                        </label>
                        <p className="text-sm sm:text-base text-gray-900 break-words">{selectedUser.address || "Not provided"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Registration Numbers */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                      <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      Registration Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="border rounded-lg p-3 bg-gray-50">
                        <label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                          <Hash className="w-3 h-3 sm:w-4 sm:h-4" />
                          Fraternity Number
                        </label>
                        <p className="text-sm sm:text-base text-gray-900 mt-1 font-mono">{selectedUser.fraternity_number || "Not provided"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      Account Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Registration Date</label>
                        <p className="text-sm sm:text-base text-gray-900">{formatDate(selectedUser.created_at)}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Last Updated</label>
                        <p className="text-sm sm:text-base text-gray-900">{formatDate(selectedUser.updated_at)}</p>
                      </div>
                      {selectedUser.email_verified_at && (
                        <div>
                          <label className="text-xs sm:text-sm font-medium text-gray-500">Email Verified</label>
                          <p className="text-sm sm:text-base text-gray-900">{formatDate(selectedUser.email_verified_at)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 px-4 sm:px-6 py-3 bg-white shadow-lg flex-shrink-0">
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 w-full">
                  {selectedUser.status === "pending" ? (
                    <>
                      <button
                        onClick={closeModal}
                        className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => openConfirmModal("rejected")}
                        className="w-full sm:w-auto px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => openConfirmModal("approved")}
                        className="w-full sm:w-auto px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Approve
                      </button>
                    </>
                  ) : selectedUser.status === "rejected" ? (
                    <>
                      <button
                        onClick={closeModal}
                        className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => openConfirmModal("approved")}
                        className="w-full sm:w-auto px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Re-approve User
                      </button>
                    </>
                  ) : selectedUser.status === "approved" ? (
                    <>
                      <button
                        onClick={closeModal}
                        className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => openConfirmModal("deactivated")}
                        className="w-full sm:w-auto px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Deactivate User
                      </button>
                    </>
                  ) : selectedUser.status === "deactivated" ? (
                    <>
                      <button
                        onClick={closeModal}
                        className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => openConfirmModal("approved")}
                        className="w-full sm:w-auto px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Reactivate User
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

        {/* Confirmation Modal */}
        {isConfirmModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
              {/* Confirmation Header */}
              <div
                className={`px-6 py-4 ${
                  actionType === "approved" ? "bg-green-600" : actionType === "deactivated" ? "bg-gray-600" : "bg-red-600"
                } text-white`}
              >
                <h3 className="text-lg font-bold flex items-center gap-2">
                  {actionType === "approved" ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      {selectedUser.status === "rejected"
                        ? "Re-approve User"
                        : selectedUser.status === "deactivated"
                          ? "Reactivate User"
                          : "Approve User"}
                    </>
                  ) : actionType === "deactivated" ? (
                    <>
                      <XCircle className="w-5 h-5" />
                      Deactivate User
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      Reject User
                    </>
                  )}
                </h3>
              </div>

              {/* Confirmation Content */}
              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  {actionType === "approved"
                    ? selectedUser.status === "rejected"
                      ? `Are you sure you want to re-approve ${selectedUser.name}'s registration? This will override the previous rejection and grant them access to the system.`
                      : selectedUser.status === "deactivated"
                        ? `Are you sure you want to reactivate ${selectedUser.name}'s account? They will regain access to the system.`
                        : `Are you sure you want to approve ${selectedUser.name}'s registration? They will be able to access the system.`
                    : actionType === "deactivated"
                      ? `Are you sure you want to deactivate ${selectedUser.name}'s account? They will no longer be able to access the system until reactivated.`
                      : `Are you sure you want to reject ${selectedUser.name}'s registration? Please provide a reason.`}
                </p>

                {(actionType === "rejected" || actionType === "deactivated") && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {actionType === "deactivated" ? "Deactivation" : "Rejection"} Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder={`Enter reason for ${actionType === "deactivated" ? "deactivation" : "rejection"}...`}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">This reason will be saved and displayed to administrators.</p>
                  </div>
                )}

                {actionType === "approved" && selectedUser.rejection_reason && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        <span className="font-medium">Previous {selectedUser.status === "deactivated" ? "deactivation" : "rejection"} reason: </span>
                        {selectedUser.rejection_reason}
                      </span>
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsConfirmModalOpen(false)
                      setActionType(null)
                      setRejectionReason("")
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors text-sm font-medium ${
                      actionType === "approved"
                        ? "bg-green-600 hover:bg-green-700"
                        : actionType === "deactivated"
                          ? "bg-gray-600 hover:bg-gray-700"
                          : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {actionType === "approved"
                      ? selectedUser.status === "rejected"
                        ? "Re-approve"
                        : selectedUser.status === "deactivated"
                          ? "Reactivate"
                          : "Approve"
                      : actionType === "deactivated"
                        ? "Deactivate"
                        : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
