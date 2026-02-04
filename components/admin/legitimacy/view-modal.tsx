"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { User as UserIcon, Mail, Award, Building, MapPin, Calendar, FileText, Image } from "lucide-react"

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
  logo_url1?: string
  logo_url2?: string

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
      bgColor: "bg-amber-50",
      borderColor: "border-amber-400",
      textColor: "text-amber-900",
      iconColor: "text-amber-600",
    },
    approved: {
      label: "Approved",
      description: "This legitimacy request has been approved.",
      badge: "default",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-400",
      textColor: "text-emerald-900",
      iconColor: "text-emerald-600",
    },
    rejected: {
      label: "Rejected",
      description: "This legitimacy request was rejected.",
      badge: "destructive",
      bgColor: "bg-red-50",
      borderColor: "border-red-400",
      textColor: "text-red-900",
      iconColor: "text-red-600",
    },
  } as const

  const status = statusConfig[selectedItem.status]
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || ""

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">Legitimacy Request Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Status Banner */}
          <div className={`rounded-lg border-2 p-4 ${status.bgColor} ${status.borderColor}`}>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant={status.badge} className="text-sm px-3 py-1">{status.label}</Badge>
            </div>
            <p className={`text-sm ${status.textColor} font-medium`}>{status.description}</p>
          </div>

          {/* Rejection Note */}
          {selectedItem.status === "rejected" && selectedItem.admin_note && (
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg shadow-sm">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-red-900 block mb-1">Rejection Note:</span>
                  <p className="text-red-800">{selectedItem.admin_note}</p>
                </div>
              </div>
            </div>
          )}

          {/* Basic Information Card */}
          <div className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-2 border-red-800 rounded-lg p-5 shadow-lg">
            <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <UserIcon className="w-5 h-5 text-red-800 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-medium text-red-800 uppercase tracking-wide">Name</span>
                  <p className="text-gray-900 font-medium">{selectedItem.user.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-red-800 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-medium text-red-800 uppercase tracking-wide">Email</span>
                  <p className="text-gray-900 font-medium">{selectedItem.user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-red-800 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-medium text-red-800 uppercase tracking-wide">Alias</span>
                  <p className="text-gray-900 font-medium">{selectedItem.alias}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-red-800 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-medium text-red-800 uppercase tracking-wide">Chapter</span>
                  <p className="text-gray-900 font-medium">{selectedItem.chapter}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-red-800 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-medium text-red-800 uppercase tracking-wide">Position</span>
                  <p className="text-gray-900 font-medium">{selectedItem.position}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-red-800 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-medium text-red-800 uppercase tracking-wide">Fraternity #</span>
                  <p className="text-gray-900 font-medium">{selectedItem.fraternity_number}</p>
                </div>
              </div>

              {selectedItem.certificate_date && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <Calendar className="w-5 h-5 text-red-800 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-red-800 uppercase tracking-wide">Certificate Date</span>
                    <p className="text-gray-900 font-medium">
                      {new Date(selectedItem.certificate_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Certificate Information Card */}
          {(selectedItem.school_name || selectedItem.address || selectedItem.certification_details || selectedItem.logo_url1 || selectedItem.logo_url2) && (
            <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 border-2 border-amber-600 rounded-lg p-5 shadow-lg">
              <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Certificate Information
              </h3>

              <div className="space-y-4">
                {selectedItem.school_name && (
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-amber-800 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-amber-800 uppercase tracking-wide">School Name</span>
                      <p className="text-gray-900 font-medium">{selectedItem.school_name}</p>
                    </div>
                  </div>
                )}

                {selectedItem.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-amber-800 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-amber-800 uppercase tracking-wide">Address</span>
                      <p className="text-gray-900 font-medium">{selectedItem.address}</p>
                    </div>
                  </div>
                )}

                {selectedItem.certification_details && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-amber-800 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-amber-800 uppercase tracking-wide">Certification Details</span>
                      <p className="text-gray-900 whitespace-pre-wrap font-medium mt-1">{selectedItem.certification_details}</p>
                    </div>
                  </div>
                )}

                {/* Certificate Logos */}
                {(selectedItem.logo_url1 || selectedItem.logo_url2) && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Image className="w-5 h-5 text-amber-800" />
                      <span className="text-xs font-medium text-amber-800 uppercase tracking-wide">Certificate Logos</span>
                    </div>
                    
                    <div className="flex gap-4 flex-wrap">
                      {selectedItem.logo_url1 && (
                        <div className="flex-1 min-w-[200px]">
                          <p className="text-xs font-medium text-amber-800 mb-2">Logo 1 (Left)</p>
                          <div className="p-4 border-2 border-amber-600 rounded-lg bg-white shadow-sm">
                            <img
                              src={`${imageBaseUrl}${selectedItem.logo_url1}`}
                              alt="Certificate logo 1"
                              className="w-full h-32 object-contain"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Crect width='128' height='128' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='12'%3ELogo 1 not found%3C/text%3E%3C/svg%3E"
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {selectedItem.logo_url2 && (
                        <div className="flex-1 min-w-[200px]">
                          <p className="text-xs font-medium text-amber-800 mb-2">Logo 2 (Right)</p>
                          <div className="p-4 border-2 border-amber-600 rounded-lg bg-white shadow-sm">
                            <img
                              src={`${imageBaseUrl}${selectedItem.logo_url2}`}
                              alt="Certificate logo 2"
                              className="w-full h-32 object-contain"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Crect width='128' height='128' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='12'%3ELogo 2 not found%3C/text%3E%3C/svg%3E"
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Signatories Section */}
          {selectedItem.signatories && selectedItem.signatories.length > 0 && (
            <div className="bg-gradient-to-br from-red-50 via-rose-50 to-red-100 border-2 border-red-800 rounded-lg p-5 shadow-lg">
              <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Signatories ({selectedItem.signatories.length})
              </h3>

              <div className="space-y-3">
                {selectedItem.signatories.map((signatory, idx) => (
                  <div key={signatory.id ?? idx} className="p-4 border-2 border-amber-600 rounded-lg bg-gradient-to-r from-white to-amber-50 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <p className="font-semibold text-gray-900 text-lg">{signatory.name}</p>
                        {signatory.role && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-600 font-semibold">
                              {signatory.role}
                            </Badge>
                          </div>
                        )}
                        {signatory.signed_date && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar className="w-4 h-4 text-red-800" />
                            <span className="font-medium">Signed: {new Date(signatory.signed_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</span>
                          </div>
                        )}
                      </div>

                      {signatory.signature_url && (
                        <div className="border-2 border-red-800 rounded-lg p-3 bg-white shadow-md">
                          <img
                            src={`${imageBaseUrl}${signatory.signature_url}`}
                            alt={`Signature of ${signatory.name}`}
                            className="w-32 h-20 object-contain"
                            onError={(e) => {
                              e.currentTarget.src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='80'%3E%3Crect width='128' height='80' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='10'%3ENo signature%3C/text%3E%3C/svg%3E"
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
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-600 rounded-lg p-5 shadow-md">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-amber-800 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-medium text-amber-800 uppercase tracking-wide block mb-1">Admin Note</span>
                  <p className="text-gray-900 font-medium">{selectedItem.admin_note}</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-sm text-gray-700 pt-3 border-t-2 border-red-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-800" />
            <span className="font-semibold text-red-900">Submitted on:</span>
            <span className="font-medium">{new Date(selectedItem.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}