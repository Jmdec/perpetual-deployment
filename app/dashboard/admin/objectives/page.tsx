"use client"
import { useState, useEffect } from "react"
import {
  Save,
  AlertCircle,
  RefreshCw,
  Target,
  Plus,
  Trash2
} from "lucide-react"
import AdminLayout from "@/components/adminLayout"

interface ObjectiveCard {
  title: string
  content: string
}

export default function ObjectivesPage() {
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [titles, setTitles] = useState<string[]>([])

  const [formData, setFormData] = useState({
    objectives_header: "",
    objectives_title: "",
    objectives_description: "",
  })


  const [cards, setCards] = useState<ObjectiveCard[]>([
    { title: "", content: "" }
  ])

  useEffect(() => {
    fetchObjectivesData()
  }, [])

  const fetchObjectivesData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/objectives")

      if (response.ok) {
        const data = await response.json()

        if (data.success && data.data) {
          setIsEdit(true)
          setFormData({
            objectives_header: data.data.objectives_header || "",
            objectives_title: data.data.objectives_title || "",
            objectives_description: data.data.objectives_description || "",
          })

          // Ensure we have arrays - parse if they're strings
          let titles = data.data.objectives_card_title || []
          let contents = data.data.objectives_card_content || []

          // Parse if they come as JSON strings
          if (typeof titles === 'string') {
            try {
              titles = JSON.parse(titles)
            } catch (e) {
              console.error("Error parsing titles:", e)
              titles = []
            }
          }

          if (typeof contents === 'string') {
            try {
              contents = JSON.parse(contents)
            } catch (e) {
              console.error("Error parsing contents:", e)
              contents = []
            }
          }

          // Ensure they're arrays
          if (!Array.isArray(titles)) titles = []
          if (!Array.isArray(contents)) contents = []

          if (titles.length > 0 && contents.length > 0) {
            const loadedCards = titles.map((title:string, index:number) => ({
              title: title || "",
              content: contents[index] || "",
            }))
            setCards(loadedCards)
          } else {
            // Set default card if no data
            setCards([{ title: "", content: "" }])
          }
        } else {
          setIsEdit(false)
          setCards([{ title: "", content: "" }])
        }
      } else if (response.status === 404) {
        setIsEdit(false)
        setCards([{ title: "", content: "" }])
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch objectives data")
      }
    } catch (error) {
      console.error("Error fetching objectives data:", error)
      setError(
        error instanceof Error
          ? error.message
          : "Failed to connect to server. Please ensure Laravel backend is running."
      )
      setIsEdit(false)
      setCards([{ title: "", content: "" }])
    } finally {
      setLoading(false)
    }
  }

  const handleAddCard = () => {
    setCards([...cards, { title: "", content: "" }])
  }

  const handleRemoveCard = (index: number) => {
    if (cards.length > 1) {
      setCards(cards.filter((_, i) => i !== index))
    }
  }

  const handleCardChange = (index: number, field: keyof ObjectiveCard, value: string) => {
    const newCards = [...cards]
    newCards[index][field] = value
    setCards(newCards)
  }

  const handleSubmit = async () => {
    try {
      if (
        !formData.objectives_header ||
        !formData.objectives_title ||
        !formData.objectives_description
      ) {
        alert("Please fill in all required header fields")
        return
      }

      const hasEmptyCards = cards.some(card => !card.title.trim() || !card.content.trim())
      if (hasEmptyCards) {
        alert("Please fill in all objective card titles and contents")
        return
      }

      setIsSubmitting(true)
      setError(null)

      const method = isEdit ? "PUT" : "POST"

      const payload = {
        ...formData,
        objectives_card_title: cards.map(card => card.title),
        objectives_card_content: cards.map(card => card.content),
      }

      console.log("Submitting payload:", payload)

      const response = await fetch("/api/objectives", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
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
        alert(`Objectives ${isEdit ? "updated" : "created"} successfully`)
        fetchObjectivesData()
      } else {
        setError(data.error || data.message || "Failed to save objectives")
        alert(data.error || data.message || "Failed to save objectives")
      }
    } catch (error) {
      console.error("Submit error:", error)
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to save objectives"
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
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Objectives Management</h1>
                  <p className="text-sm text-gray-500">Manage organizational objectives</p>
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
                onClick={fetchObjectivesData}
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
                  value={formData.objectives_header}
                  onChange={(e) => setFormData({ ...formData, objectives_header: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter header (e.g., Our Objectives)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.objectives_title}
                  onChange={(e) => setFormData({ ...formData, objectives_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.objectives_description}
                  onChange={(e) => setFormData({ ...formData, objectives_description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Enter description"
                />
              </div>
            </div>
          </div>

          {/* Objectives Cards */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Objective Cards</h2>
              <button
                onClick={handleAddCard}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Objective
              </button>
            </div>

            <div className="space-y-4">
              {cards.map((card, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">Objective {index + 1}</h3>
                    {cards.length > 1 && (
                      <button
                        onClick={() => handleRemoveCard(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => handleCardChange(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter objective title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={card.content}
                        onChange={(e) => handleCardChange(index, 'content', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        placeholder="Enter objective content"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {cards.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">No objectives added yet</p>
                <button
                  onClick={handleAddCard}
                  className="mt-3 text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  Add your first objective
                </button>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  Save Objectives
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}