
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface MemberDeleteLegitimacyModalProps {
  isOpen: boolean
  itemName?: string
  onClose: () => void
  onConfirm: () => void
}

export function MemberDeleteLegitimacyModal({ isOpen, itemName, onClose, onConfirm }: MemberDeleteLegitimacyModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600">
          Are you sure you want to delete <span className="font-semibold">{itemName || "this item"}</span>? This action cannot be undone.
        </p>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
