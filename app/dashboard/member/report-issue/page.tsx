"use client"

import type React from "react"
import { useState } from "react"
import { ChevronLeft, MapPin, Upload, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import MemberLayout from "@/components/memberLayout"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/use-toast"

interface ApiResponse {
  success: boolean
  message: string
  data?: {
    report_id: string
    id: number
    status: string
    files: Array<{
      id: number
      name: string
      url: string
    }>
  }
  errors?: Record<string, string[]>
}

export default function ReportIssuePage() {
  const { user, loading: authLoading } = useAuth(true)
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    location: "",
    urgency: "medium",
  })
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const categories = [
    { value: "road", label: "Road Damage", icon: "🛣️" },
    { value: "streetlight", label: "Street Light", icon: "💡" },
    { value: "garbage", label: "Garbage/Waste", icon: "🗑️" },
    { value: "drainage", label: "Drainage/Flood", icon: "💧" },
    { value: "traffic", label: "Traffic Issue", icon: "🚦" },
    { value: "vandalism", label: "Vandalism", icon: "🎨" },
    { value: "noise", label: "Noise Complaint", icon: "🔊" },
    { value: "other", label: "Other", icon: "📋" },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    // Validate file size (10MB max)
    const validFiles = selectedFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "warning",
          title: "File too large",
          description: `${file.name} exceeds 10MB limit.`,
        })
        return false
      }
      return true
    })

    const newFiles = [...files, ...validFiles].slice(0, 5) // Max 5 files
    setFiles(newFiles)

    // Create previews
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
    setPreviews(newPreviews)
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    
    // Revoke the object URL to free memory
    URL.revokeObjectURL(previews[index])
    
    setFiles(newFiles)
    setPreviews(newPreviews)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate required fields
      if (!formData.category) {
        setError("Please select a category")
        setLoading(false)
        return
      }

      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append("category", formData.category)
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("location", formData.location)
      formDataToSend.append("urgency", formData.urgency)
      formDataToSend.append("timestamp", new Date().toISOString())

      // Append files
      files.forEach((file, index) => {
        formDataToSend.append(`file_${index}`, file)
      })

      // Submit to API (this will automatically include the session cookie)
      const response = await fetch("/api/reports/submit", {
        method: "POST",
        credentials: "include", // Important: Send cookies
        body: formDataToSend,
      })

      const result: ApiResponse = await response.json()

      if (response.ok && result.success) {
        // Success - Show toast notification
        toast({
          variant: "success",
          title: "Report Submitted!",
          description: `Report ID: ${result.data?.report_id || "N/A"}. Track it in your reports section.`,
        })
        
        // Clean up object URLs
        previews.forEach(preview => URL.revokeObjectURL(preview))
        
        // Reset form
        setFormData({
          category: "",
          title: "",
          description: "",
          location: "",
          urgency: "medium",
        })
        setFiles([])
        setPreviews([])
      } else {
        // Handle validation errors
        if (result.errors) {
          const firstError = Object.values(result.errors)[0][0]
          setError(firstError)
        } else {
          setError(result.message || "Failed to submit report. Please try again.")
        }
      }
    } catch (error) {
      console.error("Error submitting report:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <MemberLayout>
        <div className="flex flex-col min-h-screen bg-white items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </MemberLayout>
    )
  }

  return (
    <MemberLayout>
      <div className="flex flex-col min-h-screen bg-white">
        {/* Header */}
        <header className="bg-orange-600 text-white px-4 py-4">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard/member/">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-bold">Report an Issue</h1>
          </div>
          <p className="text-orange-100 text-sm">Help us improve Perpetual Village City</p>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 py-6 pb-24">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-900">
                  <p className="font-semibold mb-1">Error</p>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Issue Category *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.category === cat.value
                        ? "border-orange-600 bg-orange-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">{cat.icon}</div>
                    <div className="text-sm font-medium text-gray-900">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Issue Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief description of the issue"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Detailed Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide more details about the issue..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Street, Barangay, or landmark"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Urgency Level *
              </label>
              <div className="flex gap-3">
                {[
                  { value: "low", label: "Low", color: "bg-green-100 text-green-700 border-green-300" },
                  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
                  { value: "high", label: "High", color: "bg-red-100 text-red-700 border-red-300" },
                ].map((urgency) => (
                  <button
                    key={urgency.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, urgency: urgency.value })}
                    className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                      formData.urgency === urgency.value
                        ? urgency.color
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {urgency.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo/Video Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Photos/Videos (Optional, max 5)
              </label>

              {/* File Previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors z-10"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              {files.length < 5 && (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors">
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-600">Upload photos or videos</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, MP4 (max 10MB each)</p>
                  </div>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*,video/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                </label>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Your report helps improve our city</p>
                <p className="text-blue-700">
                  All reports are reviewed by city officials. You will receive updates on the status of your report.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.category}
              className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-98 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting Report..." : "Submit Report"}
            </button>
          </form>
        </main>
      </div>
    </MemberLayout>
  )
}