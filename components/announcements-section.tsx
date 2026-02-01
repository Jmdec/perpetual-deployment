"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Calendar, Loader2, X, Tag, Sparkles, AlertTriangle } from "lucide-react"

interface Announcement {
  id: number
  title: string
  date: string
  category: "Update" | "Event" | "Alert" | "Development" | "Health" | "Notice"
  description: string
  content: string
  is_active: boolean
  priority: number
  created_at: string
  updated_at: string
}

export default function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [subscribing, setSubscribing] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching announcements...')
      
      const response = await fetch(`/api/announcements?per_page=12`)
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch announcements' }))
        console.error('API error:', errorData)
        throw new Error(errorData.message || 'Failed to load announcements')
      }

      const data = await response.json()
      console.log('API response:', data)

      if (data.success && data.data) {
        const announcementsArray = data.data.data || data.data || []
        console.log('Announcements:', announcementsArray)
        setAnnouncements(announcementsArray)
      } else {
        throw new Error(data.message || "Failed to load announcements")
      }
    } catch (err) {
      console.error("Error fetching announcements:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load announcements"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      alert("Please enter a valid email address.")
      return
    }

    setSubscribing(true)

    try {
      const subscribeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscribers/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const subscribeData = await subscribeResponse.json()

      if (!subscribeData.success) {
        alert(subscribeData.message || 'Failed to subscribe. Please try again.')
        setSubscribing(false)
        return
      }

      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          type: 'verification',
          data: {
            email: email,
            verifyUrl: `${window.location.origin}/verify-subscription?token=${subscribeData.data.token}`,
          },
        }),
      })

      const emailData = await emailResponse.json()

      if (emailData.success) {
        setEmail("")
        alert("Successfully subscribed! Please check your email to verify your subscription.")
      } else {
        alert("Subscribed, but failed to send verification email. Please contact support.")
      }

    } catch (error) {
      console.error('Subscription error:', error)
      alert("Failed to subscribe. Please try again later.")
    } finally {
      setSubscribing(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Alert: "bg-gradient-to-r from-red-500 to-orange-500 text-white",
      Event: "bg-gradient-to-r from-orange-500 to-red-400 text-white",
      Update: "bg-gradient-to-r from-green-500 to-orange-400 text-white",
      Development: "bg-gradient-to-r from-red-400 to-green-500 text-white",
      Health: "bg-gradient-to-r from-green-600 to-green-400 text-white",
      Notice: "bg-gradient-to-r from-orange-600 to-red-500 text-white",
    }
    return colors[category as keyof typeof colors] || "bg-gradient-to-r from-gray-600 to-gray-400 text-white"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden z-10 bg-gradient-to-br from-red-50 to-orange-50">
      {/* Animated Background */}
      <div className="absolute inset-0" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-200/30 via-orange-200/30 to-green-200/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-green-200/30 via-orange-200/30 to-red-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
          </motion.div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-transparent border-t-red-500 border-r-orange-500 border-b-yellow-500 rounded-full"
                />
              </div>
              <p className="text-gray-700 font-medium">Loading announcements...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Unable to Load Announcements</h3>
            <p className="text-red-700 mb-2 font-semibold text-lg">{error}</p>
            <p className="text-gray-600 mb-6 text-sm max-w-md mx-auto">
              There was an issue connecting to the server. Please check your connection and try again.
            </p>
            <button
              onClick={fetchAnnouncements}
              className="px-8 py-4 bg-gradient-to-r from-red-600 via-orange-600 to-green-600 text-white rounded-full hover:shadow-2xl transition-all font-semibold text-lg hover:scale-105"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Announcements Grid */}
        {!loading && !error && announcements.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              {announcements.map((announcement, i) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -12, scale: 1.02 }}
                  onClick={() => setSelectedAnnouncement(announcement)}
                  className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-gray-100 hover:border-yellow-300"
                >
                  {/* Hover Gradient Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-orange-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Content */}
                  <div className="p-6 relative z-10">
                    {/* Category Badge */}
                    <div className="mb-4">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase shadow-lg ${getCategoryColor(announcement.category)}`}>
                        <Tag className="w-3 h-3" />
                        {announcement.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">
                        {formatDate(announcement.date)}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:bg-gradient-to-r group-hover:from-yellow-600 group-hover:via-red-600 group-hover:to-red-900 group-hover:bg-clip-text group-hover:text-transparent transition-all line-clamp-2">
                      {announcement.title}
                    </h3>

                    <p className="text-gray-600 line-clamp-3 leading-relaxed mb-4">
                      {announcement.description}
                    </p>

                    <motion.div
                      whileHover={{ x: 5 }}
                      className="inline-flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-yellow-600 via-red-600 to-red-900 bg-clip-text text-transparent"
                    >
                      Read More
                      <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-3xl bg-white border-4 border-transparent bg-clip-padding p-10 md:p-16 text-center shadow-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(white, white) padding-box, linear-gradient(to right, #dc2626, #ea580c, #059669) border-box'
              }}
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-600 to-green-600" />
              </div>

              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-red-600 via-orange-600 to-green-600 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-red-600 via-orange-600 to-green-600 bg-clip-text text-transparent">
                  Never Miss an Update
                </h2>
                <p className="text-gray-700 mb-8 max-w-2xl mx-auto text-lg font-medium">
                  Subscribe to receive the latest announcements and community news directly to your inbox
                </p>

                <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                    placeholder="Enter your email address"
                    className="flex-1 px-6 py-4 rounded-full text-gray-900 bg-gray-50 border-2 border-gray-200 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 shadow-md text-lg font-medium"
                  />
                  <motion.button
                    onClick={handleSubscribe}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={subscribing}
                    className="px-8 py-4 bg-gradient-to-r from-red-600 via-orange-600 to-green-600 text-white font-bold rounded-full hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap shadow-xl text-lg"
                  >
                    {subscribing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Subscribing...
                      </>
                    ) : (
                      'Subscribe Now'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && announcements.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 via-red-600 to-[#800000]/90 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Bell className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-green-600 bg-clip-text text-transparent mb-3">
              No Announcements Yet
            </h3>
            <p className="text-gray-600 text-lg">Check back later for community updates and news.</p>
          </motion.div>
        )}
      </div>

      {/* Announcement Modal - Portal to body level */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAnnouncement(null)}
            className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[80vh] shadow-2xl relative flex flex-col my-8"
            >
              {/* Close Button - Fixed at top right */}
              <div className="flex-shrink-0 flex justify-end p-3 sm:p-4 bg-white rounded-t-2xl sm:rounded-t-3xl border-b border-gray-100">
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all shadow-md bg-white"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="px-4 pb-6 sm:px-8 sm:pb-8 md:px-12 md:pb-12 overflow-y-auto flex-1">
                {/* Icon and Category */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-400 via-red-600 to-red-900 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <Tag className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs sm:text-sm font-semibold capitalize">
                      {selectedAnnouncement.category}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                  {selectedAnnouncement.title}
                </h2>

                {/* Date */}
                <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">
                  {formatDate(selectedAnnouncement.date)}
                </p>

                {/* Content */}
                <div className="prose prose-sm sm:prose-lg max-w-none">
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap mb-4 sm:mb-6">
                    {selectedAnnouncement.description}
                  </p>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {selectedAnnouncement.content}
                  </p>
                </div>

                {/* Action Button */}
                <div className="mt-6 sm:mt-8 flex gap-4">
                  <button
                    onClick={() => setSelectedAnnouncement(null)}
                    className="flex-1 px-6 py-2.5 sm:py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold transition-all text-sm sm:text-base"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}