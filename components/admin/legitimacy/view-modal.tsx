"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface User {
  id: number
  name: string
  email: string
}

interface Signatory {
  id?: number
  name: string
  role?: string
  signed_date?: string
  signature_url?: string
}

interface Legitimacy {
  id: number
  user: User
  alias: string
  chapter: string
  position: string
  fraternity_number: string
  status: "pending" | "approved" | "rejected"
  created_at: string

  admin_note?: string
  certificate_date?: string

  // ✅ Certificate fields
  certification_details?: string
  school_name?: string
  address?: string
  logo_url?: string

  signatories?: Signatory[]
}

interface ViewLegitimacyModalProps {
  isOpen: boolean
  selectedItem: Legitimacy | null
  onClose: () => void
}

export default function ViewLegitimacyModal({ isOpen, selectedItem, onClose }: ViewLegitimacyModalProps) {
  if (!selectedItem) return null

  const statusConfig = {
    pending: {
      label: "Pending Review",
      description: "This legitimacy request is currently under review.",
      badge: "secondary",
    },
    approved: {
      label: "Approved",
      description: "This legitimacy request has been approved.",
      badge: "default",
    },
    rejected: {
      label: "Rejected",
      description: "This legitimacy request was rejected.",
      badge: "destructive",
    },
  } as const

  const status = statusConfig[selectedItem.status]
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || ""

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Legitimacy Request Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status message */}
          <div className="rounded-md border p-3 text-sm bg-muted/40">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={status.badge}>{status.label}</Badge>
            </div>
            <p className="text-muted-foreground">{status.description}</p>
          </div>

          {/* Basic Details */}
          <div className="space-y-3 text-sm">
            {selectedItem.status === "rejected" && selectedItem.admin_note && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <span className="font-medium text-red-900">Rejection Note:</span>
                <p className="text-red-700 mt-1">{selectedItem.admin_note}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="font-medium text-gray-500">Name:</span>
                <p className="text-gray-900">{selectedItem.user.name}</p>
              </div>

              <div>
                <span className="font-medium text-gray-500">Email:</span>
                <p className="text-gray-900">{selectedItem.user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="font-medium text-gray-500">Alias:</span>
                <p className="text-gray-900">{selectedItem.alias}</p>
              </div>

              <div>
                <span className="font-medium text-gray-500">Chapter:</span>
                <p className="text-gray-900">{selectedItem.chapter}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="font-medium text-gray-500">Position:</span>
                <p className="text-gray-900">{selectedItem.position}</p>
              </div>

              <div>
                <span className="font-medium text-gray-500">Fraternity #:</span>
                <p className="text-gray-900">{selectedItem.fraternity_number}</p>
              </div>
            </div>

            {selectedItem.certificate_date && (
              <div>
                <span className="font-medium text-gray-500">Certificate Date:</span>
                <p className="text-gray-900">{new Date(selectedItem.certificate_date).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          {/* Certificate Information Section */}
          {(selectedItem.school_name || selectedItem.address || selectedItem.certification_details || selectedItem.logo_url) && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">Certificate Information</h3>

              <div className="space-y-3 text-sm">
                {selectedItem.school_name && (
                  <div>
                    <span className="font-medium text-gray-500">School Name:</span>
                    <p className="text-gray-900">{selectedItem.school_name}</p>
                  </div>
                )}

                {selectedItem.address && (
                  <div>
                    <span className="font-medium text-gray-500">Address:</span>
                    <p className="text-gray-900">{selectedItem.address}</p>
                  </div>
                )}

                {selectedItem.certification_details && (
                  <div>
                    <span className="font-medium text-gray-500">Certification Details:</span>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedItem.certification_details}</p>
                  </div>
                )}

                {selectedItem.logo_url && (
                  <div>
                    <span className="font-medium text-gray-500">Certificate Logo:</span>
                    <div className="mt-2 p-3 border rounded-md bg-gray-50 inline-block">
                      <img
                        src={`${imageBaseUrl}${selectedItem.logo_url}`}
                        alt="Certificate logo"
                        className="w-32 h-32 object-contain"
                        onError={(e) => {
                          e.currentTarget.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Crect width='128' height='128' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='12'%3ELogo not found%3C/text%3E%3C/svg%3E"
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Signatories Section */}
          {selectedItem.signatories && selectedItem.signatories.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">Signatories ({selectedItem.signatories.length})</h3>

              <div className="space-y-3">
                {selectedItem.signatories.map((signatory, idx) => (
                  <div key={signatory.id ?? idx} className="p-3 border rounded-md bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <p className="font-medium text-gray-900">{signatory.name}</p>
                        {signatory.role && (
                          <p className="text-sm text-gray-600">Role: {signatory.role}</p>
                        )}
                        {signatory.signed_date && (
                          <p className="text-xs text-gray-500">
                            Signed: {new Date(signatory.signed_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {signatory.signature_url && (
                        <div className="border rounded p-2 bg-white">
                          <img
                            src={`${imageBaseUrl}${signatory.signature_url}`}
                            alt={`Signature of ${signatory.name}`}
                            className="w-24 h-16 object-contain"
                            onError={(e) => {
                              e.currentTarget.src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='64'%3E%3Crect width='96' height='64' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='10'%3ENo signature%3C/text%3E%3C/svg%3E"
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Note (if not rejected) */}
          {selectedItem.status !== "rejected" && selectedItem.admin_note && (
            <div className="border-t pt-4">
              <div>
                <span className="font-medium text-gray-500">Admin Note:</span>
                <p className="text-gray-900 mt-1">{selectedItem.admin_note}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Submitted on {new Date(selectedItem.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}