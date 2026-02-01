"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Bell, Calendar, X, AlertTriangle, ChevronRight } from "lucide-react"

interface Announcement {
    id: number
    title: string
    date: string
    category: "Update" | "Event" | "Alert" | "Development" | "Notice" | "Health"
    description: string
    content: string
    is_active: boolean
    priority: number
    image_url?: string
    created_at: string
    updated_at: string
}

export default function AnnouncementSection() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)

    useEffect(() => {
        fetchAnnouncements()
    }, [])

    const fetchAnnouncements = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch("/api/announcements?per_page=6")

            if (!response.ok) {
                const err = await response.json().catch(() => null)
                throw new Error(err?.message || "Failed to load announcements")
            }

            const data = await response.json()

            if (!data?.success || !data?.data) {
                throw new Error(data?.message || "Invalid API response")
            }

            const raw = data.data.data ?? data.data ?? []

            const normalized: Announcement[] = raw.map((item: any) => ({
                ...item,
                date: item.date || item.created_at,
                description: item.description || item.content?.slice(0, 140) || "",
            }))

            setAnnouncements(normalized)
        } catch (err) {
            console.error("Announcement fetch error:", err)
            setError(err instanceof Error ? err.message : "Failed to load announcements")
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })

    return (
        <>
            <section className="bg-white border rounded-md border-gray-200 shadow-xl p-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-yellow-600 via-red-600 to-red-900 bg-clip-text text-transparent mb-4">
                        Announcement
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Stay informed with the latest announcements, stories and highlights.
                    </p>
                </div>

                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {error && !loading && (
                    <div className="text-center py-16 bg-white rounded-xl">
                        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={fetchAnnouncements}
                            className="px-6 py-3 bg-gradient-to-r from-red-600 via-orange-600 to-green-600 text-white rounded-lg"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && announcements.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {announcements.map((a, i) => (
                            <motion.div
                                key={a.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                onClick={() => setSelectedAnnouncement(a)}
                                className="bg-white p-5 rounded-lg shadow hover:shadow-xl cursor-pointer"
                            >
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(a.date)}
                                </div>
                                <h3 className="font-bold text-lg mb-1">{a.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{a.description}</p>
                                <div className="text-orange-600 font-semibold text-sm flex items-center gap-1">
                                    Read More <ChevronRight className="w-4 h-4" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && !error && announcements.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-xl">
                        <Bell className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No announcements yet</p>
                    </div>
                )}
            </section>

            {selectedAnnouncement && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setSelectedAnnouncement(null)}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-xl max-w-2xl w-full p-6"
                    >
                        <div className="flex justify-between mb-4">
                            <h2 className="text-2xl font-bold">{selectedAnnouncement.title}</h2>
                            <button onClick={() => setSelectedAnnouncement(null)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-gray-700 whitespace-pre-line">
                            {selectedAnnouncement.content || selectedAnnouncement.description}
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </>
    )
}
