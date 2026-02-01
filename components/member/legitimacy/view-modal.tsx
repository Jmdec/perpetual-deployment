"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface MemberLegitimacy {
  id: number
  alias: string
  chapter: string
  position: string
  fraternity_number: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  admin_note?: string
}

interface ViewLegitimacyModalProps {
  isOpen: boolean
  selectedItem: MemberLegitimacy | null
  onClose: () => void
}

export default function ViewLegitimacyModal({ isOpen, selectedItem, onClose }: ViewLegitimacyModalProps) {
  if (!selectedItem) return null

  const statusConfig = {
    pending: {
      label: "Pending Review",
      description: "These are the details you submitted. Your request is currently under review.",
      badge: "secondary",
    },
    approved: {
      label: "Approved",
      description: "Your legitimacy request has been approved.",
      badge: "default",
    },
    rejected: {
      label: "Rejected",
      description: "Your legitimacy request was rejected.",
      badge: "destructive",
    },
  } as const

  const status = statusConfig[selectedItem.status]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Legitimacy Request</DialogTitle>
        </DialogHeader>

        {/* Status message */}
        <div className="rounded-md border p-3 text-sm bg-muted/40">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={status.badge}>{status.label}</Badge>
          </div>
          <p className="text-muted-foreground">{status.description}</p>
        </div>

        {/* Details */}
        <div className="space-y-3 text-sm">
          {selectedItem.status === "rejected" && selectedItem.admin_note && (
            <div>
              <span className="font-medium">Note:</span> {selectedItem?.admin_note || ""}
            </div>
          )}

          <div>
            <span className="font-medium">Alias:</span> {selectedItem.alias}
          </div>

          <div>
            <span className="font-medium">Chapter:</span> {selectedItem.chapter}
          </div>

          <div>
            <span className="font-medium">Position:</span> {selectedItem.position}
          </div>

          <div>
            <span className="font-medium">Fraternity #:</span> {selectedItem.fraternity_number}
          </div>

          <div className="text-xs text-muted-foreground pt-2">Submitted on {new Date(selectedItem.created_at).toLocaleDateString()}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
