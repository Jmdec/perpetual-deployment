"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, User, Newspaper, Clock } from "lucide-react"

interface NewsArticle {
    id: number
    title: string
    content: string
    category: string
    image?: string
    status: string
    published_at?: string
    created_at: string
    author?: {
        id: number
        name: string
        email: string
    }
}

const ITEMS_PER_PAGE = 6

export default function NewsSection() {
    const [news, setNews] = React.useState<NewsArticle[]>([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [selectedArticle, setSelectedArticle] = React.useState<NewsArticle | null>(null)
    const [currentPage, setCurrentPage] = React.useState(1)

    const getImageUrl = (imagePath?: string) => {
        if (!imagePath) return "/placeholder.svg"
        if (imagePath.startsWith("http")) return imagePath
        const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000"
        return `${baseUrl}/${imagePath.replace(/^\/+/, "")}`
    }

    React.useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true)
                const response = await fetch("/api/news/published?per_page=50")
                const result = await response.json()
                if (result.success) {
                    setNews(result.data?.data || result.data || [])
                } else {
                    throw new Error(result.message)
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load news")
            } finally {
                setLoading(false)
            }
        }
        fetchNews()
    }, [])

    React.useEffect(() => {
        document.body.style.overflow = selectedArticle ? "hidden" : "unset"
    }, [selectedArticle])

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })

    const totalPages = Math.ceil(news.length / ITEMS_PER_PAGE)

    const paginatedNews = React.useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return news.slice(start, start + ITEMS_PER_PAGE)
    }, [news, currentPage])

    return (
        <>
            <section className="bg-white border rounded-md border-gray-200 shadow-xl p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-yellow-600 via-red-600 to-red-900 bg-clip-text text-transparent mb-4">
                            Latest News & Updates
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Stay informed with the latest announcements, stories, and community highlights.
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 font-semibold">Loading news...</div>
                    ) : error ? (
                        <div className="text-center py-20 text-red-600 font-semibold">
                            Failed to load news: {error}
                        </div>
                    ) : paginatedNews.length === 0 ? (
                        <div className="text-center py-20">
                            <Newspaper className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 text-lg">No news available</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {paginatedNews.map((article, index) => (
                                    <motion.div
                                        key={article.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        viewport={{ once: true }}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        onClick={() => setSelectedArticle(article)}
                                        className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl cursor-pointer border border-gray-200"
                                    >
                                        <div className="h-56 overflow-hidden">
                                            <img
                                                src={getImageUrl(article.image)}
                                                alt={article.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition"
                                            />
                                        </div>

                                        <div className="p-6">
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                                <Clock className="w-4 h-4" />
                                                {formatDate(article.published_at || article.created_at)}
                                            </div>

                                            <h3 className="text-xl font-bold mb-2 line-clamp-2">
                                                {article.title}
                                            </h3>

                                            <p className="text-gray-600 line-clamp-3">
                                                {article.content.slice(0, 150)}...
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-6 mt-12">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        className="px-6 py-3 rounded-full font-bold text-white bg-gray-400 disabled:opacity-40"
                                    >
                                        Previous
                                    </button>

                                    <span className="font-semibold text-gray-700">
                                        Page {currentPage} of {totalPages}
                                    </span>

                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        className="px-6 py-3 rounded-full font-bold text-white bg-gradient-to-r from-yellow-600 via-red-600 to-red-900 disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* ===== MODAL (UNCHANGED) ===== */}
            <AnimatePresence>
                {selectedArticle && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedArticle(null)}
                        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl max-w-2xl w-full p-8"
                        >
                            <h2 className="text-3xl font-bold mb-4">
                                {selectedArticle.title}
                            </h2>
                            <p className="text-gray-700 whitespace-pre-line">
                                {selectedArticle.content}
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
