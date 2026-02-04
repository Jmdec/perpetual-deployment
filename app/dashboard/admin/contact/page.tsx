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
  Mail,
  X,
  Send,
  User,
  Calendar,
  MessageSquare,
  Contact
} from "lucide-react"
import AdminLayout from "@/components/adminLayout"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/use-toast"

interface ContactMessage {
  id: number
  name: string
  email: string
  subject: string
  message: string
  status: "unread" | "read" | "replied"
  created_at: string
  updated_at: string
  replies?: ContactReply[]
}

interface ContactReply {
  id: number
  contact_id: number
  admin_id: number
  message: string
  sent_at: string
  created_at: string
  admin: {
    id: number
    name: string
    email: string
  }
}

interface PaginationData {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export default function AdminContactMessagesPage() {
  const { user, loading: authLoading } = useAuth(true)
  const { toast } = useToast()

  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [replyMessage, setReplyMessage] = useState("")
  const [isSendingReply, setIsSendingReply] = useState(false)
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
      fetchMessages()
    }
  }, [authLoading, user, pagination.current_page, statusFilter])

  const fetchMessages = async () => {
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

      const response = await fetch(`/api/contact/admin?${params}`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setMessages(data.data.data || [])
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
          description: "Failed to fetch contact messages.",
        })
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load contact messages.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message)
    setIsModalOpen(true)
    setReplyMessage("")
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedMessage(null)
    setReplyMessage("")
  }

  const handleSendReply = async () => {
    if (!selectedMessage || !replyMessage.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a reply message.",
      })
      return
    }

    try {
      setIsSendingReply(true)

      const response = await fetch(`/api/contact/admin/${selectedMessage.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          message: replyMessage,
          recipientEmail: selectedMessage.email,
          recipientName: selectedMessage.name,
          originalSubject: selectedMessage.subject,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Reply sent successfully!",
        })

        setReplyMessage("")
        closeModal()
        fetchMessages()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to send reply.",
        })
      }
    } catch (error) {
      console.error("Error sending reply:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send reply.",
      })
    } finally {
      setIsSendingReply(false)
    }
  }

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current_page: 1 }))
    fetchMessages()
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, current_page: page }))
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      unread: "bg-orange-100 text-orange-700",
      read: "bg-blue-100 text-blue-700",
      replied: "bg-green-100 text-green-700",
    }

    const icons = {
      unread: <Clock className="w-3 h-3" />,
      read: <Eye className="w-3 h-3" />,
      replied: <CheckCircle className="w-3 h-3" />,
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
      hour: "2-digit",
      minute: "2-digit",
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
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Contact Management</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage and review contact messages</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <Contact className="w-5 h-5" />
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
                    placeholder="Search by name, email, subject..."
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
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-[#eda909b0] text-white rounded-lg text-sm font-medium hover:bg-yellow-500/90 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards - Mobile */}
            <div className="grid grid-cols-3 gap-2 sm:hidden mb-4">
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <p className="text-xs text-gray-600">Unread</p>
                <p className="text-lg font-bold text-orange-600">
                  {messages.filter((m) => m.status === "unread").length}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <p className="text-xs text-gray-600">Read</p>
                <p className="text-lg font-bold text-blue-600">
                  {messages.filter((m) => m.status === "read").length}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <p className="text-xs text-gray-600">Replied</p>
                <p className="text-lg font-bold text-green-600">
                  {messages.filter((m) => m.status === "replied").length}
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-3"></div>
                    <p className="text-gray-600 text-sm">Loading messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Mail className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-gray-600 font-medium">No messages found</p>
                  <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                <>
                  {/* Scrollable Table */}
                  <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-linear-to-r from-orange-600 to-orange-500 text-white">
                          <tr>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Name</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Email</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Subject</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Message</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Status</th>
                            <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap">Date</th>
                            <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold uppercase whitespace-nowrap sticky right-0 bg-linear-to-r from-orange-600 to-orange-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {messages.map((message) => (
                            <tr key={message.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-3 sm:px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                                <div className="max-w-[150px] truncate" title={message.name}>
                                  {message.name}
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                <div className="max-w-[180px] truncate" title={message.email}>
                                  {message.email}
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                <div className="max-w-[200px] truncate" title={message.subject}>
                                  {message.subject}
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                <div className="max-w-[250px] truncate" title={message.message}>
                                  {message.message}
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                                {getStatusBadge(message.status)}
                              </td>
                              <td className="px-3 sm:px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                {formatDate(message.created_at)}
                              </td>
                              <td className="px-3 sm:px-4 py-3 text-center whitespace-nowrap sticky right-0 bg-white">
                                <button
                                  onClick={() => handleViewMessage(message)}
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
            {!loading && messages.length > 0 && (
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
              </div>
            )}
          </div>
        </main>

        {/* View/Reply Modal */}
        {isModalOpen && selectedMessage && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white sm:rounded-xl shadow-2xl w-full sm:max-w-4xl h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div style={{ background: 'linear-gradient(to right, rgb(5, 150, 105), rgb(249, 115, 22))' }} className="text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold truncate">Contact Message</h2>
                    <p className="text-xs sm:text-sm text-white/90">Message #{selectedMessage.id}</p>
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
                  {/* Status */}
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                    <span className="text-sm font-medium text-gray-700 block mb-2">Status</span>
                    {getStatusBadge(selectedMessage.status)}
                  </div>

                  {/* Sender Information */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      Sender Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                          <User className="w-3 h-3 sm:w-4 sm:h-4" />
                          Name
                        </label>
                        <p className="text-sm sm:text-base text-gray-900 font-medium break-words">{selectedMessage.name}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                          Email
                        </label>
                        <a href={`mailto:${selectedMessage.email}`} className="text-sm sm:text-base text-orange-600 hover:text-orange-700 font-medium break-all">
                          {selectedMessage.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      Message
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Subject</label>
                        <p className="text-sm sm:text-base text-gray-900 font-semibold break-words">{selectedMessage.subject}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Message</label>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                          <p className="text-sm sm:text-base text-gray-900 break-words whitespace-pre-wrap">{selectedMessage.message}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          Received
                        </label>
                        <p className="text-sm sm:text-base text-gray-900">{formatDate(selectedMessage.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Previous Replies */}
                  {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                        Previous Replies
                      </h3>
                      <div className="space-y-3">
                        {selectedMessage.replies.map((reply) => (
                          <div key={reply.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-linear-to-r from-orange-600 to-orange-500 text-white rounded-full text-sm font-semibold shadow-sm">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                  </svg>
                                  Admin - {reply.admin.name}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">{formatDate(reply.sent_at)}</p>
                            </div>
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reply Form */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                      <Send className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      Send Reply
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Your Reply</label>
                        <textarea
                          rows={6}
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                          placeholder="Type your reply here..."
                          disabled={isSendingReply}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 px-4 sm:px-6 py-3 bg-white shadow-lg flex-shrink-0">
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 w-full">
                  <button
                    onClick={closeModal}
                    disabled={isSendingReply}
                    className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSendReply}
                    disabled={isSendingReply || !replyMessage.trim()}
                    className="w-full sm:w-auto px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-900 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSendingReply ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Reply
                      </>
                    )}
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
