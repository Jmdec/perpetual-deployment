"use client"

import { useState, useEffect, useMemo } from "react"
import { ChevronLeft, Calendar, Eye, Share2, Bookmark, Newspaper } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import MemberLayout from "@/components/memberLayout"
import { ArticleModal } from "@/components/member/article-modal"

interface AnnouncementArticle {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  image?: string
  publishedAt: string
  views: number
  author: string
}

interface ApiAnnouncementArticle {
  id: number
  title: string
  description: string
  category: string
  content: string
  image_url: string | null
  status: string
  priority: string
  published_at: string | null
  created_at: string
  updated_at: string
  author: { name: string } | null
}

export default function NewsPage() {
  const [news, setNews] = useState<AnnouncementArticle[]>([])
  const [announcements, setAnnouncements] = useState<AnnouncementArticle[]>([])

  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState<AnnouncementArticle | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const transformArticle = (article: ApiAnnouncementArticle, category: string): AnnouncementArticle => {
    const apiUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000"
    return {
      id: `${category}-${article.id}`,
      title: article.title,
      excerpt: article.description || article.content?.substring(0, 150) + "...",
      content: article.content,
      category: article.category,
      image: article.image_url ? `${article.image_url}` : undefined,
      publishedAt: article.published_at
        ? new Date(article.published_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
        : article.created_at
          ? new Date(article.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
          : "Date not available",
      views: Math.floor(Math.random() * 1000),
      author: article.author?.name || "Admin",
    }
  }

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true)

        const res = await fetch("/api/announcements")

        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || "Failed to fetch announcements")
        }

        const data = await res.json()

        if (!data?.success || !data?.data) {
          throw new Error(data?.message || "Invalid API response")
        }

        const raw = data.data.data ?? data.data ?? []

        const transformed = raw.map((article: ApiAnnouncementArticle) =>
          transformArticle(article, "announcements")
        )

        setAnnouncements(transformed)
      } catch (error) {
        console.error("Announcements fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])


  const allArticles = [...announcements]

  const categories = useMemo(() => {
    const catSet = new Set<string>()
    allArticles.forEach((a) => catSet.add(a.category))
    const dynamicCategories = Array.from(catSet).map((cat) => ({
      value: cat,
      label: `${cat.charAt(0).toUpperCase() + cat.slice(1)} (${allArticles.filter((a) => a.category === cat).length})`,
    }))
    return [{ value: "all", label: `All (${allArticles.length})` }, ...dynamicCategories]
  }, [allArticles])

  const filteredNews = selectedCategory === "all" ? allArticles : allArticles.filter((a) => a.category === selectedCategory)

  return (
    <MemberLayout>
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        <header className="sticky top-0 z-20 bg-linear-to-r from-amber-600 to-red-500 text-white shadow-md">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg lg:text-2xl font-bold leading-tight truncate">
                    Perpetual Help College Announcements
                  </h1>
                  <p className="text-[11px] sm:text-sm text-white/90 leading-tight">
                    Latest announcements from Perpetual Help College
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-sm whitespace-nowrap">
                <Newspaper className="w-5 h-5" />
                <span className="font-medium">{filteredNews.length} Articles</span>
              </div>
            </div>
          </div>
        </header>

        <div className="sticky top-[56px] sm:top-[68px] z-10 bg-white border-b shadow-sm">
          <div className="px-4 sm:px-6 py-3 overflow-x-auto flex items-center justify-center">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 w-max snap-x snap-mandatory">
              {categories.map(category => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`snap-start px-4 sm:px-5 py-2 rounded-full sm:rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap transition-all ${selectedCategory === category.value
                      ? "bg-linear-to-r from-amber-600 to-red-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <main className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-emerald-100 to-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                  No announcements
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 max-w-xs">
                  Check back later for updates from the college.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredNews.map(article => (
                  <div
                    key={article.id}
                    onClick={() => {
                      setSelectedArticle(article)
                      setModalOpen(true)
                    }}
                    className="bg-white rounded-xl overflow-hidden border shadow-sm hover:shadow-lg transition cursor-pointer"
                  >
                    {article.image && (
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    )}

                    <div className="p-4 sm:p-5">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold text-white bg-linear-to-r from-amber-600 to-red-500">
                          {article.category}
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {article.publishedAt}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm sm:text-base mb-2 leading-snug line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-4">
                        {article.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-500 border-t pt-3">
                        <span className="truncate max-w-[140px]">
                          By {article.author}
                        </span>

                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {article.views}
                          </span>

                          <button
                            onClick={e => e.stopPropagation()}
                            className="hover:text-emerald-600"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={e => e.stopPropagation()}
                            className="hover:text-orange-600"
                          >
                            <Bookmark className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <ArticleModal
              article={selectedArticle}
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
            />
          </div>
        </main>
      </div>
    </MemberLayout>
  )
}
