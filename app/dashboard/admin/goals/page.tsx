"use client"
import { useState, useEffect } from "react"
import {
  Plus,
  Trash2,
  Building2,
  Hash,
  Tag,
  Save,
  Target,
  AlertCircle,
  RefreshCw,
  Award,
  Users,
  Globe,
  Home,
  Leaf
} from "lucide-react"

type GoalsCard = {
  id: number;
  goals_card_icon: string;
  goals_card_title: string;
  goals_card_content: string;
  goals_card_list: string;
};

export default function AboutGoalsPage() {
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    goals_header: "",
    goals_title: "",
    goals_description: "",
  })

  const [goalsCards, setGoalsCards] = useState<GoalsCard[]>([
    {
      id: Date.now(),
      goals_card_icon: "",
      goals_card_title: "",
      goals_card_content: "",
      goals_card_list: "",
    },
  ])

  useEffect(() => {
    fetchGoalsData()
  }, [])

  const fetchGoalsData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/goals")

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setIsEdit(true)
          setFormData({
            goals_header: data.data.goals_header || "",
            goals_title: data.data.goals_title || "",
            goals_description: data.data.goals_description || "",
          })

          // Parse arrays - handle both parsed and string formats
          let icons = data.data.goals_card_icon || []
          let titles = data.data.goals_card_title || []
          let contents = data.data.goals_card_content || []
          let lists = data.data.goals_card_list || []

          // Parse if they come as JSON strings
          if (typeof icons === 'string') {
            try {
              icons = JSON.parse(icons)
            } catch (e) {
              console.error("Error parsing icons:", e)
              icons = []
            }
          }
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
          if (typeof lists === 'string') {
            try {
              lists = JSON.parse(lists)
            } catch (e) {
              console.error("Error parsing lists:", e)
              lists = []
            }
          }

          // Ensure they're arrays
          if (!Array.isArray(icons)) icons = []
          if (!Array.isArray(titles)) titles = []
          if (!Array.isArray(contents)) contents = []
          if (!Array.isArray(lists)) lists = []

          const maxLength = Math.max(
            icons.length,
            titles.length,
            contents.length,
            lists.length,
            1
          )

          const cards = Array.from({ length: maxLength }, (_, index) => ({
            id: Date.now() + index,
            goals_card_icon: icons[index] || "",
            goals_card_title: titles[index] || "",
            goals_card_content: contents[index] || "",
            goals_card_list: lists[index] || "",
          }))

          setGoalsCards(cards)
        } else {
          setIsEdit(false)
        }
      } else if (response.status === 404) {
        setIsEdit(false)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch goals data")
      }
    } catch (error) {
      console.error("Error fetching goals data:", error)
      setError(
        error instanceof Error
          ? error.message
          : "Failed to connect to server"
      )
      setIsEdit(false)
    } finally {
      setLoading(false)
    }
  }

  const addGoalsCard = () => {
    setGoalsCards([
      ...goalsCards,
      {
        id: Date.now(),
        goals_card_icon: "",
        goals_card_title: "",
        goals_card_content: "",
        goals_card_list: "",
      },
    ])
  }

  const removeGoalsCard = (id: number) => {
    if (goalsCards.length > 1) {
      setGoalsCards(goalsCards.filter((card) => card.id !== id))
    }
  }

  const updateGoalsCard = (id: number, field: string, value: string) => {
    setGoalsCards(
      goalsCards.map((card) =>
        card.id === id ? { ...card, [field]: value } : card
      )
    )
  }

  const handleSubmit = async () => {
    try {
      if (
        !formData.goals_header ||
        !formData.goals_title ||
        !formData.goals_description
      ) {
        setError("Please fill in all required fields")
        return
      }

      setIsSubmitting(true)
      setError(null)

      const method = isEdit ? "PUT" : "POST"

      const payload = {
        goals_header: formData.goals_header,
        goals_title: formData.goals_title,
        goals_description: formData.goals_description,
        goals_card_icon: goalsCards.map(card => card.goals_card_icon),
        goals_card_title: goalsCards.map(card => card.goals_card_title),
        goals_card_content: goalsCards.map(card => card.goals_card_content),
        goals_card_list: goalsCards.map(card => card.goals_card_list),
      }

      console.log("Submitting payload:", payload)

      const response = await fetch("/api/goals", {
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
        setError(null)
        alert(`Goals ${isEdit ? "updated" : "created"} successfully`)
        fetchGoalsData()
      } else {
        setError(data.message || "Failed to save goals")
        alert(data.message || "Failed to save goals")
      }
    } catch (error) {
      console.error("Submit error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to save goals"
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
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Goals Management</h1>
                  <p className="text-sm text-gray-500">Manage goals information and cards</p>
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
                onClick={fetchGoalsData}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Loading Data
              </button>
            </div>
          )}

          {/* Main Information Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Goals Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Header <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.goals_header}
                  onChange={(e) => setFormData({ ...formData, goals_header: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter goals header"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.goals_title}
                  onChange={(e) => setFormData({ ...formData, goals_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter goals title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.goals_description}
                  onChange={(e) => setFormData({ ...formData, goals_description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Enter goals description"
                />
              </div>
            </div>
          </div>

          {/* Goals Cards */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Goals Cards</h2>
              <button
                onClick={addGoalsCard}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-orange-500 text-white rounded-lg hover:from-emerald-700 hover:to-orange-600 transition-all text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Card
              </button>
            </div>

            <div className="space-y-4">
              {goalsCards.map((card, index) => (
                <div
                  key={card.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">Card #{index + 1}</h3>
                    {goalsCards.length > 1 && (
                      <button
                        onClick={() => removeGoalsCard(card.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          Card Icon
                        </div>
                      </label>
                      <select
                        value={card.goals_card_icon}
                        onChange={(e) =>
                          updateGoalsCard(card.id, "goals_card_icon", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select an icon</option>
                        <option value="Target">Target</option>
                        <option value="Award">Award</option>
                        <option value="Building2">Building</option>
                        <option value="Users">Users</option>
                        <option value="Globe">Globe</option>
                        <option value="Leaf">Leaf</option>
                        <option value="Home">Home</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Title
                      </label>
                      <input
                        type="text"
                        value={card.goals_card_title}
                        onChange={(e) =>
                          updateGoalsCard(card.id, "goals_card_title", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter card title"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Content
                      </label>
                      <textarea
                        value={card.goals_card_content}
                        onChange={(e) =>
                          updateGoalsCard(card.id, "goals_card_content", e.target.value)
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                        placeholder="Enter card content"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <div className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          Card List (Optional)
                        </div>
                      </label>
                      <input
                        type="text"
                        value={card.goals_card_list}
                        onChange={(e) =>
                          updateGoalsCard(card.id, "goals_card_list", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter list items (comma separated)"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-orange-500 text-white rounded-lg hover:from-emerald-700 hover:to-orange-600 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  Save Goals
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}