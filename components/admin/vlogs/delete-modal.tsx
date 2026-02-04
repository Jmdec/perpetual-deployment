"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

interface Vlog {
  id: number
  title: string
  category: string
  description?: string
  content: string
  date: string
  is_active: boolean
  video?: File | string
}

interface Props {
  isOpen: boolean
  itemName: string
  vlogId: Vlog | null
  onClose: () => void
  onDeleted: () => void
}

export function AdminDeleteVlogsModal({ isOpen, itemName, vlogId, onClose, onDeleted }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  if (!isOpen || !vlogId) return null

  const handleConfirm = async () => {
    try {
      setLoading(true)

      const res = await fetch(`/api/admin/vlogs/${vlogId.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast({
          title: "Deleted",
          description: `Vlog "${itemName}" has been deleted successfully.`,
        })
        onDeleted()
        onClose()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to delete vlog",
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

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-sm p-6">
        <h2 className="text-lg font-bold mb-2">Delete Vlog</h2>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  )
}