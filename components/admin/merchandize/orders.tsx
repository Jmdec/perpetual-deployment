"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  Truck,
  ChevronUp,
} from "lucide-react"

interface OrderItem {
  id: number
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
  total_price: string
  status: string
  payment_method: string
  ordered_at: string
  notes?: string
  order_items: OrderItem[]
}

const statusOptions = [
  { value: "pending", label: "Pending", icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-100" },
  { value: "confirmed", label: "Confirmed", icon: CheckCircle, color: "text-blue-600", bgColor: "bg-blue-100" },
  { value: "processing", label: "Processing", icon: Package, color: "text-purple-600", bgColor: "bg-purple-100" },
  { value: "shipped", label: "In Transit", icon: Truck, color: "text-indigo-600", bgColor: "bg-indigo-100" },
  { value: "completed", label: "Completed", icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100" },
  { value: "cancelled", label: "Cancelled", icon: XCircle, color: "text-red-600", bgColor: "bg-red-100" },
]

// Strict linear flow
const statusFlow = ["pending", "confirmed", "processing", "shipped", "completed"]

const getNextStatus = (currentStatus: string): { value: string; label: string } | null => {
  const currentIndex = statusFlow.indexOf(currentStatus)
  if (currentIndex === -1 || currentIndex >= statusFlow.length - 1) return null
  const nextValue = statusFlow[currentIndex + 1]
  const next = statusOptions.find(s => s.value === nextValue)
  return next ? { value: next.value, label: next.label } : null
}

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null)

  const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000"

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return ""
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl
    if (imageUrl.startsWith("/")) return `${IMAGE_URL}${imageUrl}`
    return `${IMAGE_URL}/${imageUrl}`
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users/orders", {
        credentials: "include",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setOrders(data.data || [])
      } else {
        setError(data.message || "Failed to load orders")
      }
    } catch (err: any) {
      setError(err.message || "Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      setUpdating(orderId)
      setError(null)

      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setOrders(orders.map(order =>
          order.id === orderId
            ? { ...order, status: newStatus }
            : order
        ))
        alert("Order status updated successfully!")
      } else {
        setError(data.message || "Failed to update order status")
        alert(data.message || "Failed to update order status")
      }
    } catch (err: any) {
      setError(err.message || "Failed to update order status")
      alert(err.message || "Failed to update order status")
    } finally {
      setUpdating(null)
    }
  }

  const formatPrice = (price: string | number) => {
    const amount = typeof price === "string" ? parseFloat(price) : price
    return `Rs. ${amount.toFixed(0)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const getStatusConfig = (status: string) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0]
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-600">Your order history will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const nextStatus = getNextStatus(order.status)
        const isTerminal = order.status === "completed" || order.status === "cancelled"
        const statusConfig = getStatusConfig(order.status)
        const StatusIcon = statusConfig.icon
        const isExpanded = expandedOrder === order.id

        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order</p>
                    <p className="text-lg font-semibold text-gray-900">
                      #{order.order_code || order.id}
                    </p>
                  </div>
                  <div className="hidden sm:block h-8 w-px bg-gray-300"></div>
                  <div className="hidden sm:block">
                    <p className="text-sm text-gray-500">Order Placed</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(order.ordered_at)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!isTerminal && nextStatus && (
                    <button
                      onClick={() => {
                        if (confirm(`Advance order to "${nextStatus.label}"?`)) {
                          handleStatusChange(order.id, nextStatus.value)
                        }
                      }}
                      disabled={updating === order.id}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating === order.id ? "Updating..." : `Move to ${nextStatus.label}`}
                    </button>
                  )}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6">
              <div className="space-y-4">
                {order.order_items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex gap-4 ${index !== order.order_items.length - 1 ? "pb-4 border-b border-gray-100" : ""
                      }`}
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.image_url ? (
                        <img
                          src={getImageUrl(item.product.image_url)}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h4>
                      {item.product.category && (
                        <p className="text-sm text-gray-500">By {item.product.category}</p>
                      )}
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                        <span>Size: S</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>

                    {/* Price & Status */}
                    <div className="text-right space-y-2">
                      <p className="font-semibold text-gray-900">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Status</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(order.ordered_at)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-gray-200 space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Payment Method</p>
                      <p className="font-medium text-gray-900">{order.payment_method}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Items</p>
                      <p className="font-medium text-gray-900">{order.order_items.length}</p>
                    </div>
                  </div>
                  {order.notes && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Order Notes</p>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{order.notes}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Paid using credit card ending with 7314
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(order.total_price)}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}