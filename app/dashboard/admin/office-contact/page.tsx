"use client"
import { useState, useEffect } from "react"
import {
  Save,
  AlertCircle,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Clock,
  Map
} from "lucide-react"
import AdminLayout from "@/components/adminLayout"

export default function OfficeContactPage() {
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    office_location: "",
    phone_number: "",
    email: "",
    office_hours: "",
    map_link: "",
  })

  useEffect(() => {
    fetchOfficeContactData()
  }, [])

  const fetchOfficeContactData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/office-contact")

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setIsEdit(true)
          setFormData({
            office_location: data.data.office_location || "",
            phone_number: data.data.phone_number || "",
            email: data.data.email || "",
            office_hours: data.data.office_hours || "",
            map_link: data.data.map_link || "",
          })
        } else {
          setIsEdit(false)
        }
      } else if (response.status === 404) {
        setIsEdit(false)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch office contact data")
      }
    } catch (error) {
      console.error("Error fetching office contact data:", error)
      setError(
        error instanceof Error
          ? error.message
          : "Failed to connect to server. Please ensure Laravel backend is running."
      )
      setIsEdit(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      if (
        !formData.office_location ||
        !formData.phone_number ||
        !formData.email ||
        !formData.office_hours
      ) {
        alert("Please fill in all required fields")
        return
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        alert("Please enter a valid email address")
        return
      }

      setIsSubmitting(true)
      setError(null)

      const method = isEdit ? "PUT" : "POST"

      console.log("Submitting payload:", formData)

      const response = await fetch("/api/office-contact", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const text = await response.text()
      console.log("Raw response:", text)

      let data
      try {
        data = JSON.parse(text)
        console.log("Parsed JSON:", data)
      } catch {
        setError("Invalid server response")
        return
      }

      if (response.ok && data.success) {
        alert(`Office Contact ${isEdit ? "updated" : "created"} successfully`)
        fetchOfficeContactData()
      } else {
        setError(data.error || data.message || "Failed to save office contact")
        alert(data.error || data.message || "Failed to save office contact")
      }
    } catch (error) {
      console.error("Submit error:", error)
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to save office contact"
      setError(errorMessage)
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Office Contact Management</h1>
                  <p className="text-sm text-gray-500">Manage office contact information</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          )}

          {/* Retry Button */}
          {error && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <button
                onClick={fetchOfficeContactData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Loading Data
              </button>
            </div>
          )}

          {/* Contact Information Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h2>

            <div className="space-y-6">
              {/* Office Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    Office Location <span className="text-red-500">*</span>
                  </div>
                </label>
                <textarea
                  value={formData.office_location}
                  onChange={(e) => setFormData({ ...formData, office_location: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Enter complete office address"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the complete physical address of your office
                </p>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-indigo-600" />
                    Phone Number <span className="text-red-500">*</span>
                  </div>
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., +1 (555) 123-4567"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Contact phone number for inquiries
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    Email Address <span className="text-red-500">*</span>
                  </div>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., contact@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Official email address for correspondence
                </p>
              </div>

              {/* Office Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Office Hours <span className="text-red-500">*</span>
                  </div>
                </label>
                <textarea
                  value={formData.office_hours}
                  onChange={(e) => setFormData({ ...formData, office_hours: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="e.g., Monday - Friday: 9:00 AM - 5:00 PM"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Specify when the office is open for visitors
                </p>
              </div>

              {/* Map Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Map className="w-4 h-4 text-indigo-600" />
                    Map Link (Optional)
                  </div>
                </label>
                <input
                  type="url"
                  value={formData.map_link}
                  onChange={(e) => setFormData({ ...formData, map_link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., https://maps.google.com/..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Google Maps or other map service link to your location
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Contact Information
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
