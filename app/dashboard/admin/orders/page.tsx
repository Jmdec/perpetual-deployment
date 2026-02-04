"use client"
import { useState, useEffect, useRef } from "react"
import {
  Search,
  Eye,
  Package,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react"
import AdminLayout from "@/components/adminLayout"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/use-toast"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface OrderItem {
  id: number
  product_id: number
  quantity: number
  price: string
  subtotal: string
  product: {
    id: number
    name: string
    image_url?: string
    category?: string
  }
}

interface Order {
  id: number
  order_code: string
  user_id: number
  total_price: string
  status: string
  payment_method: string
  proof_of_payment?: string
  proof_of_payment_url?: string
  notes?: string
  ordered_at: string
  created_at: string
  updated_at: string
  order_items: OrderItem[]
  user?: {
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

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------
const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    bgClass: "bg-yellow-100",
    textClass: "text-yellow-700",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle,
    bgClass: "bg-blue-100",
    textClass: "text-blue-700",
  },
  processing: {
    label: "Processing",
    icon: Package,
    bgClass: "bg-purple-100",
    textClass: "text-purple-700",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    bgClass: "bg-indigo-100",
    textClass: "text-indigo-700",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    bgClass: "bg-green-100",
    textClass: "text-green-700",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    bgClass: "bg-red-100",
    textClass: "text-red-700",
  },
}

type StatusKey = keyof typeof statusConfig
type StatusFilter = "all" | StatusKey

// ---------------------------------------------------------------------------
// Inline status dropdown (three-dot menu per row)
// ---------------------------------------------------------------------------
function StatusDropdown({
  order,
  onUpdate,
  isUpdating,
}: {
  order: Order
  onUpdate: (orderCode: string, status: string) => Promise<void>
  isUpdating: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [])

  return (
    <div ref={ref} className="relative">
      {/* trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isUpdating || order.status === "cancelled"}
        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
        title={order.status === "cancelled" ? "Cannot update a cancelled order" : "Update status"}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* dropdown panel */}
      {open && (
        <div className="absolute right-0 mt-1 w-44 z-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 overflow-hidden">
          <p className="px-3 pt-1 pb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Update Status
          </p>
          {(Object.entries(statusConfig) as [StatusKey, (typeof statusConfig)[StatusKey]][]).map(
            ([key, cfg]) => {
              const Icon = cfg.icon
              const isCurrent = order.status === key
              const isCancelled = order.status === "cancelled"
              const isDisabled = isCurrent || (isCancelled && !isCurrent)
              return (
                <button
                  key={key}
                  disabled={isDisabled}
                  onClick={async () => {
                    setOpen(false)
                    await onUpdate(order.order_code, key)
                  }}
                  className={`
                    w-full flex items-center gap-2.5 px-3 py-1.5 text-sm transition-colors
                    ${isCurrent
                      ? "bg-gray-50 cursor-default"
                      : isCancelled
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-50 cursor-pointer"
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isCurrent ? cfg.textClass : isCancelled ? "text-gray-300" : "text-gray-400"}`} />
                  <span className={isCurrent ? `font-semibold ${cfg.textClass}` : isCancelled ? "text-gray-300" : ""}>
                    {cfg.label}
                  </span>
                  {isCurrent && (
                    <span className="ml-auto text-xs font-medium text-gray-400">current</span>
                  )}
                </button>
              )
            }
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AdminOrderManagementPage() {
  const { user, loading: authLoading } = useAuth(true)
  const { toast } = useToast()

  const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000"

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return ""
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl
    if (imageUrl.startsWith("/")) return `${IMAGE_URL}${imageUrl}`
    return `${IMAGE_URL}/${imageUrl}`
  }

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

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
      fetchOrders()
    }
  }, [authLoading, user])

  useEffect(() => {
    if (!authLoading && user) {
      fetchOrders()
    }
  }, [pagination.current_page, statusFilter])

  // ── fetch ──
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        per_page: pagination.per_page.toString(),
      })
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (searchQuery) params.append("search", searchQuery)

      const response = await fetch(`/api/admin/orders?${params}`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setOrders(data.data.data || [])
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
        toast({ variant: "destructive", title: "Error", description: errorData.message || "Failed to fetch orders." })
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({ variant: "destructive", title: "Error", description: "Failed to load orders." })
    } finally {
      setLoading(false)
    }
  }

  // ── status update (uses Next.js API route) ──
  const handleUpdateStatus = async (orderCode: string, newStatus: string) => {
    try {
      setUpdatingId(orderCode)
      console.log(`Updating order ${orderCode} to status ${newStatus}`)

      const response = await fetch(`/api/admin/orders/${orderCode}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server Error:", errorText)
        throw new Error(`Server returned ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Order status updated successfully."
        })

        setOrders((prev) =>
          prev.map((o) => (o.order_code === orderCode ? { ...o, status: newStatus } : o))
        )

        if (selectedOrder?.order_code === orderCode) {
          setSelectedOrder((prev) => prev && { ...prev, status: newStatus })
        }

      } else {
        toast({ variant: "destructive", title: "Error", description: data.message || "Failed to update." })
      }
    } catch (error) {
      console.error("Detailed Error:", error)
      toast({ variant: "destructive", title: "Error", description: "Failed to update order status." })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current_page: 1 }))
    fetchOrders()
  }

  const handlePageChange = (page: number) => setPagination((prev) => ({ ...prev, current_page: page }))

  const formatPrice = (price: string | number) => `₱${(typeof price === "string" ? parseFloat(price) : price).toFixed(2)}`
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  const getTotalItems = (order: Order) => order.order_items.reduce((s, i) => s + i.quantity, 0)

  const statusCounts = {
    all: pagination.total,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  }

  // ── auth loading ──
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto" />
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const filterKeys: StatusFilter[] = ["all", "pending", "confirmed", "processing", "shipped", "completed", "cancelled"]
  const filterLabels: Record<StatusFilter, string> = {
    all: "All Orders",
    pending: "Pending",
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    completed: "Completed",
    cancelled: "Cancelled",
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                <p className="text-sm text-gray-500">Manage and process customer orders</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Search */}
          <div className="flex justify-between bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-start gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by order code, customer name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-md pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-[#eda909b0] text-white rounded-lg hover:bg-yellow-500/90 transition-colors text-sm font-medium"
              >
                Search
              </button>
            </div>
            {/* dropdown filter */}
            <div className="flex items-center justify-end gap-4 border-none py-4">
              <div className="flex items-center gap-3">
                <label htmlFor="status-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Filter by Status:
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as StatusFilter)
                    setPagination((prev) => ({ ...prev, current_page: 1 }))
                  }}
                  className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                >
                  {filterKeys.map((key) => (
                    <option key={key} value={key}>
                      {filterLabels[key]} ({statusCounts[key]})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Status Filter + Table card */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">


            {/* table / states */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">
                  {statusFilter === "all" ? "No orders have been placed yet." : `No ${statusFilter} orders found.`}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {["Order Code", "Customer", "Items", "Total", "Status", "Date", "Actions"].map((h) => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => {
                        const status = statusConfig[order.status as StatusKey]
                        const StatusIcon = status.icon
                        return (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.order_code}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{order.user?.name || "N/A"}</div>
                              <div className="text-sm text-gray-500">{order.user?.email || "N/A"}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {getTotalItems(order)} items
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatPrice(order.total_price)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.bgClass} ${status.textClass}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(order.ordered_at)}
                            </td>
                            {/* Actions: eye + three-dot */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                {/* eye – open detail modal */}
                                <button
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setIsModalOpen(true)
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* three-dot – inline status update */}
                                <StatusDropdown
                                  order={order}
                                  isUpdating={updatingId === order.order_code}
                                  onUpdate={handleUpdateStatus}
                                />
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
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
                        let pageNum: number
                        if (pagination.last_page <= 5) pageNum = i + 1
                        else if (pagination.current_page <= 3) pageNum = i + 1
                        else if (pagination.current_page >= pagination.last_page - 2) pageNum = pagination.last_page - 4 + i
                        else pageNum = pagination.current_page - 2 + i
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${pagination.current_page === pageNum ? "bg-orange-600 text-white" : "border border-gray-300 hover:bg-gray-50"
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
              </>
            )}
          </div>
        </div>

        {/* ── Order Detail Modal ── */}
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              {/* header */}
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Order Details #{selectedOrder.order_code}</h2>
                  <p className="text-sm text-gray-500 mt-1">{formatDate(selectedOrder.ordered_at)}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* body */}
              <div className="px-6 py-4 overflow-y-auto flex-1 space-y-6">
                {/* Customer */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Customer Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="text-sm font-medium text-gray-900">{selectedOrder.user?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{selectedOrder.user?.email || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Status pills in modal */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Order Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(statusConfig) as [StatusKey, (typeof statusConfig)[StatusKey]][]).map(([key, cfg]) => {
                      const Icon = cfg.icon
                      const isActive = selectedOrder.status === key
                      const isCancelled = selectedOrder.status === "cancelled"
                      const isDisabled = updatingId === selectedOrder.order_code || isActive || (isCancelled && !isActive)
                      return (
                        <button
                          key={key}
                          onClick={() => !isDisabled && handleUpdateStatus(selectedOrder.order_code, key)}
                          disabled={isDisabled}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isActive
                            ? `${cfg.bgClass} ${cfg.textClass} ring-2 ring-offset-2 ring-gray-300`
                            : isCancelled
                              ? "bg-gray-50 text-gray-300"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            } disabled:cursor-not-allowed`}
                        >
                          <Icon className="w-4 h-4" />
                          {cfg.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.image_url ? (
                            <img src={getImageUrl(item.product.image_url)} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          {item.product.category && <p className="text-sm text-gray-500">{item.product.category}</p>}
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                            <span className="text-sm text-gray-600">{formatPrice(item.price)} each</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-orange-700">{formatPrice(item.subtotal)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Method</h3>
                    <p className="text-gray-900">{selectedOrder.payment_method}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Total Amount</h3>
                    <p className="text-2xl font-bold text-orange-700">{formatPrice(selectedOrder.total_price)}</p>
                  </div>
                </div>

                {/* Proof of payment */}
                {selectedOrder.proof_of_payment && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Proof of Payment</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <img src={getImageUrl(`/images/${selectedOrder.proof_of_payment}`)} alt="Proof of Payment" className="w-full max-h-96 object-contain bg-gray-50" />
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedOrder.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Order Notes</h3>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              {/* footer */}
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex-shrink-0">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}