"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface MemberDeleteBusinessModalProps {
  isOpen: boolean
  itemName: string
  onClose: () => void
  onConfirm: () => void
}

export function MemberDeleteBusinessModal({
  isOpen,
  itemName,
  onClose,
  onConfirm,
}: MemberDeleteBusinessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Business</DialogTitle>
        </DialogHeader>

        <p className="mt-2 text-sm text-gray-600">
          Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be undone.
        </p>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
