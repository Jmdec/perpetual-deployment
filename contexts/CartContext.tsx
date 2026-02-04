// contexts/CartContext.tsx
"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image_url?: string
  stock: number
  category?: string
  description?: string
  subtotal: number
}

interface CartContextType {
  items: CartItem[]
  loading: boolean
  addToCart: (product: Omit<CartItem, "quantity" | "subtotal">, quantity?: number) => Promise<void>
  removeFromCart: (productId: number) => Promise<void>
  updateQuantity: (productId: number, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getTotalItems: () => number
  getTotalPrice: () => number
  isInCart: (productId: number) => boolean
  getCartItem: (productId: number) => CartItem | undefined
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Fetch cart from database
  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users/cart", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setItems(data.data || [])
      } else if (response.status === 401) {
        // User not logged in, set empty cart
        setItems([])
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  // Load cart on mount
  useEffect(() => {
    fetchCart()
  }, [])

  const addToCart = async (product: Omit<CartItem, "quantity" | "subtotal">, quantity = 1) => {
    try {
      if (quantity > product.stock) {
        toast({
          variant: "destructive",
          title: "Cannot add to cart",
          description: `Only ${product.stock} items available in stock`,
        })
        return
      }

      // Optimistic update - update UI immediately
      const existingItem = items.find((item) => item.id === product.id)
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > product.stock) {
          toast({
            variant: "destructive",
            title: "Cannot add to cart",
            description: `Only ${product.stock} items available in stock`,
          })
          return
        }
        
        // Update existing item optimistically
        setItems(prevItems =>
          prevItems.map(item =>
            item.id === product.id
              ? { ...item, quantity: newQuantity, subtotal: item.price * newQuantity }
              : item
          )
        )
      } else {
        // Add new item optimistically
        const newItem: CartItem = {
          ...product,
          quantity,
          subtotal: product.price * quantity,
        }
        setItems(prevItems => [...prevItems, newItem])
      }

      // Show success toast immediately
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      })

      // Send request to backend (don't await to prevent blocking)
      const response = await fetch("/api/users/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          product_id: product.id,
          quantity: quantity,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        // Revert optimistic update on error
        await fetchCart()
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to add to cart. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      // Revert optimistic update on error
      await fetchCart()
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add item to cart",
      })
    }
  }

  const removeFromCart = async (productId: number) => {
    try {
      const item = items.find((item) => item.id === productId)
      
      // Optimistic update - remove immediately
      setItems(prevItems => prevItems.filter(item => item.id !== productId))

      toast({
        title: "Removed from cart",
        description: `${item?.name || "Item"} has been removed from your cart`,
      })

      const response = await fetch(`/api/users/cart/${productId}`, {
        method: "DELETE",
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        // Revert on error
        await fetchCart()
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to remove item",
        })
      }
    } catch (error) {
      console.error("Error removing from cart:", error)
      await fetchCart()
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove item from cart",
      })
    }
  }

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(productId)
      return
    }

    try {
      const item = items.find((item) => item.id === productId)
      
      if (item && quantity > item.stock) {
        toast({
          variant: "destructive",
          title: "Cannot update quantity",
          description: `Only ${item.stock} items available in stock`,
        })
        return
      }

      // Optimistic update
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === productId
            ? { ...item, quantity, subtotal: item.price * quantity }
            : item
        )
      )

      const response = await fetch(`/api/users/cart/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ quantity }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        // Revert on error
        await fetchCart()
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to update quantity",
        })
      }
    } catch (error) {
      console.error("Error updating cart:", error)
      await fetchCart()
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update quantity",
      })
    }
  }

  const clearCart = async () => {
    try {
      // Optimistic update - clear immediately
      const previousItems = items
      setItems([])

      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      })

      const response = await fetch("/api/users/cart/clear", {
        method: "DELETE",
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        // Revert on error
        setItems(previousItems)
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to clear cart",
        })
      }
    } catch (error) {
      console.error("Error clearing cart:", error)
      await fetchCart()
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear cart",
      })
    }
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.subtotal, 0)
  }

  const isInCart = (productId: number) => {
    return items.some((item) => item.id === productId)
  }

  const getCartItem = (productId: number) => {
    return items.find((item) => item.id === productId)
  }

  const refreshCart = async () => {
    await fetchCart()
  }

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        isInCart,
        getCartItem,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}