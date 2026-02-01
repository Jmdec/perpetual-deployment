"use client"
import { useState, useEffect } from "react"
import {
    Save,
    Target,
    Eye,
    AlertCircle,
    RefreshCw,
    Compass
} from "lucide-react"
import AdminLayout from "@/components/adminLayout"

export default function MissionAndVisionPage() {
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isEdit, setIsEdit] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        mission_and_vision_header: "",
        mission_and_vision_title: "",
        mission_and_vision_description: "",
        mission_content: "",
        vision_content: "",
    })

    useEffect(() => {
        fetchMissionVisionData()
    }, [])

    const fetchMissionVisionData = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch("/api/mission-and-vision")

            if (response.ok) {
                const data = await response.json()
                if (data.success && data.data) {
                    setIsEdit(true)
                    setFormData({
                        mission_and_vision_header: data.data.mission_and_vision_header || "",
                        mission_and_vision_title: data.data.mission_and_vision_title || "",
                        mission_and_vision_description: data.data.mission_and_vision_description || "",
                        mission_content: data.data.mission_content || "",
                        vision_content: data.data.vision_content || "",
                    })
                } else {
                    setIsEdit(false)
                }
            } else if (response.status === 404) {
                setIsEdit(false)
            } else {
                const errorData = await response.json()
                setError(errorData.error || "Failed to fetch mission and vision data")
            }
        } catch (error) {
            console.error("Error fetching mission and vision data:", error)
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
                !formData.mission_and_vision_header ||
                !formData.mission_and_vision_title ||
                !formData.mission_and_vision_description ||
                !formData.mission_content ||
                !formData.vision_content
            ) {
                alert("Please fill in all required fields")
                return
            }

            setIsSubmitting(true)
            setError(null)

            const method = isEdit ? "PUT" : "POST"

            console.log("Submitting payload:", formData)

            const response = await fetch("/api/mission-and-vision", {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
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
                alert(`Mission and Vision ${isEdit ? "updated" : "created"} successfully`)
                fetchMissionVisionData()
            } else {
                setError(data.error || data.message || "Failed to save mission and vision")
                alert(data.error || data.message || "Failed to save mission and vision")
            }
        } catch (error) {
            console.error("Submit error:", error)
            const errorMessage = error instanceof Error
                ? error.message
                : "Failed to save mission and vision"
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
        <>
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Compass className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Mission & Vision Management</h1>
                                    <p className="text-sm text-gray-500">Manage mission and vision information</p>
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
                                onClick={fetchMissionVisionData}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Retry Loading Data
                            </button>
                        </div>
                    )}

                    {/* Header Information Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">General Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Header <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.mission_and_vision_header}
                                    onChange={(e) => setFormData({ ...formData, mission_and_vision_header: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter header (e.g., Our Purpose)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.mission_and_vision_title}
                                    onChange={(e) => setFormData({ ...formData, mission_and_vision_title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.mission_and_vision_description}
                                    onChange={(e) => setFormData({ ...formData, mission_and_vision_description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Enter description"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mission and Vision Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Mission Card */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Target className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-semibold text-gray-900">Mission</h2>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mission Statement <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.mission_content}
                                    onChange={(e) => setFormData({ ...formData, mission_content: e.target.value })}
                                    rows={8}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Enter your organization's mission statement..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Describe your organization's purpose and what it aims to achieve
                                </p>
                            </div>
                        </div>

                        {/* Vision Card */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Eye className="w-5 h-5 text-purple-600" />
                                <h2 className="text-lg font-semibold text-gray-900">Vision</h2>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vision Statement <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.vision_content}
                                    onChange={(e) => setFormData({ ...formData, vision_content: e.target.value })}
                                    rows={8}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    placeholder="Enter your organization's vision statement..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Describe your organization's future aspirations and long-term goals
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                                    Save Mission & Vision
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}