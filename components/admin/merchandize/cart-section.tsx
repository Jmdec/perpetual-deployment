// components/admin/merchandize/cart-section.tsx
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import {
  ShoppingCart,
  Package,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  CreditCard,
  AlertCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface CartItem {
  id: number
  name: string
  description?: string
  category?: string
  price: number
  stock: number
  image_url?: string
  quantity: number
  subtotal: number
}

export default function CartSection() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())

  const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000"

  // Helper function to get full image URL
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

  // Fetch cart items from database
  const fetchCartItems = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/users/cart", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        credentials: "include",
        cache: "no-store",
      })

      const data = await response.json()

      console.log("Cart API Response:", data) // For debugging

      if (!response.ok) {
        // Handle authentication errors specifically
        if (response.status === 401) {
          setError("Please log in to view your cart")
          // Optionally redirect to login
          // router.push("/login")
          return
        }
        throw new Error(data.message || "Failed to fetch cart")
      }

      if (data.success) {
        const items = data.data || []
        setCartItems(items)
        // Select all items by default
        setSelectedItems(new Set(items.map((item: CartItem) => item.id)))
      } else {
        throw new Error(data.message || "Failed to load cart items")
      }
    } catch (err: any) {
      setError(err.message || "Failed to load cart")
      console.error("Error fetching cart:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCartItems()
  }, [])

  // Toggle individual item selection
  const toggleItemSelection = (itemId: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  // Toggle all items selection
  const toggleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(cartItems.map(item => item.id)))
    }
  }

  const formatPrice = (price: number | string) => {
    const numericPrice = Number(price)
    if (isNaN(numericPrice)) {
      return "₱0.00"
    }
    return `₱${numericPrice.toFixed(2)}`
  }

  const getTotalPrice = () => {
    return cartItems
      .filter(item => selectedItems.has(item.id))
      .reduce((total, item) => total + item.subtotal, 0)
  }

  const handleContinueShopping = () => {
    router.push("/products")
  }

  const handleUpdateQuantity = async (productId: number, newQuantity: number) => {
    try {
      setError(null)
      setUpdating(true)

      const response = await fetch(`/api/users/cart/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ quantity: newQuantity }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to update cart")
      }

      // Refresh cart from database
      await fetchCartItems()
    } catch (err: any) {
      setError(err.message || "Failed to update quantity")
      console.error("Error updating cart:", err)
    } finally {
      setUpdating(false)
    }
  }

  const handleRemoveItem = async (productId: number) => {
    try {
      setError(null)
      setUpdating(true)
      console.log("Removing product ID:", productId) // Debug log
      const response = await fetch(`/api/users/cart/${productId}`, {
        method: "DELETE",
        credentials: "include",
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to remove item")
      }

      setSuccess("Item removed from cart")
      setTimeout(() => setSuccess(null), 3000)

      // Remove from selected items
      setSelectedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })

      // Refresh cart from database
      await fetchCartItems()
    } catch (err: any) {
      setError(err.message || "Failed to remove item")
      console.error("Error removing from cart:", err)
    } finally {
      setUpdating(false)
    }
  }

  const handleClearCart = async () => {
    if (!confirm("Are you sure you want to clear your cart?")) return

    try {
      setError(null)
      setUpdating(true)

      const response = await fetch("/api/users/cart/clear", {
        method: "DELETE",
        credentials: "include",
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to clear cart")
      }

      setSuccess("Cart cleared successfully")
      setTimeout(() => setSuccess(null), 3000)

      // Clear selected items
      setSelectedItems(new Set())

      // Refresh cart from database
      await fetchCartItems()
    } catch (err: any) {
      setError(err.message || "Failed to clear cart")
      console.error("Error clearing cart:", err)
    } finally {
      setUpdating(false)
    }
  }

  const handleCheckout = async () => {
    try {
      setError(null)

      // Validate selected items
      if (selectedItems.size === 0) {
        setError("Please select at least one item to checkout")
        return
      }

      // Get selected cart items
      const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id))

      // Check stock availability for selected items
      for (const item of selectedCartItems) {
        if (item.quantity > item.stock) {
          setError(`Not enough stock for ${item.name}`)
          return
        }
      }

      // Store selected item IDs in sessionStorage
      sessionStorage.setItem('checkoutItems', JSON.stringify(Array.from(selectedItems)))
      
      console.log("Saved to sessionStorage:", Array.from(selectedItems)) // Debug log

      // Proceed to checkout
      router.push("/products/checkout")
    } catch (err: any) {
      setError(err.message || "Failed to proceed to checkout")
      console.error("Error during checkout:", err)
    }
  }

  if (loading) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-orange-50 min-h-screen">
        <div className="max-w-6xl mx-auto flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-orange-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleContinueShopping}
              className="p-2 hover:bg-white rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
                {selectedItems.size > 0 && selectedItems.size < cartItems.length && (
                  <span className="ml-2 text-orange-600">
                    ({selectedItems.size} selected)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Alert Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700 mb-4"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-700 mb-4"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}
        </div>

        {/* Cart Content */}
        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-12 text-center"
          >
            <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Add some products to get started
            </p>
            <button
              onClick={handleContinueShopping}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Continue Shopping
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Select All Checkbox */}
              <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
                />
                <label htmlFor="select-all" className="text-gray-700 font-medium cursor-pointer">
                  Select All Items
                </label>
              </div>

              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="flex items-start pt-2">
                      <input
                        type="checkbox"
                        id={`item-${item.id}`}
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                      {/* Product Image */}
                      <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={getImageUrl(item.image_url)}
                            alt={item.name}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row items-start justify-between mb-3">
                          <div className="mb-2 sm:mb-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {item.name}
                            </h3>
                            {item.category && (
                              <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                                {item.category}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={updating}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          {/* Quantity Controls */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <span className="text-sm text-gray-600 font-medium">Quantity:</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || updating}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <input
                                type="number"
                                min="1"
                                max={item.stock}
                                value={item.quantity}
                                onChange={(e) => {
                                  const newQty = parseInt(e.target.value) || 1
                                  if (newQty >= 1 && newQty <= item.stock) {
                                    handleUpdateQuantity(item.id, newQty)
                                  }
                                }}
                                disabled={updating}
                                className="w-16 text-center border border-gray-300 rounded-lg py-2 font-semibold disabled:opacity-50"
                              />
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.stock || updating}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <span className="text-sm text-gray-500">
                              ({item.stock} available)
                            </span>
                          </div>

                          {/* Price */}
                          <div className="text-left sm:text-right">
                            <p className="text-sm text-gray-500 mb-1">
                              {formatPrice(item.price)} each
                            </p>
                            <p className="text-xl font-bold text-orange-700">
                              {formatPrice(item.subtotal)}
                            </p>
                          </div>
                        </div>

                        {/* Stock Warning */}
                        {item.stock < 10 && item.stock > 0 && (
                          <div className="mt-3 text-sm text-yellow-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>Only {item.stock} left in stock</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-md p-6 sticky top-4"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  {/* Items Count */}
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Items ({selectedItems.size})</span>
                    <span className="font-semibold">
                      {formatPrice(getTotalPrice())}
                    </span>
                  </div>

                  {/* Shipping */}
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-sm">Calculated at checkout</span>
                  </div>

                  {/* Tax */}
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Tax</span>
                    <span className="text-sm">Included</span>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-orange-700">
                        {formatPrice(getTotalPrice())}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    disabled={updating || selectedItems.size === 0}
                    className="w-full py-3 bg-orange-700 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        <span>Proceed to Checkout</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleContinueShopping}
                    className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Continue Shopping
                  </button>

                  {cartItems.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      disabled={updating}
                      className="w-full mt-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      Clear Cart
                    </button>
                  )}
                </div>

                {/* Security Badge */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>Secure checkout</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}