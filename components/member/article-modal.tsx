"use client"

import * as React from "react"
import Image from "next/image"
import { Calendar, Eye, Share2, Bookmark, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"

interface Article {
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

interface ArticleModalProps {
  article: Article | null
  isOpen: boolean
  onClose: () => void
}

export const ArticleModal = ({ article, isOpen, onClose }: ArticleModalProps) => {
  if (!article) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-0 sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {article.image && (
          <div className="relative w-full h-64 md:h-80 bg-gray-100">
            <Image src={article.image} alt={article.title} fill className="object-cover rounded-t-xl" />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 bg-amber-600 text-white text-xs font-bold rounded-full shadow-sm">{article.category}</span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {article.publishedAt}
            </span>
          </div>

          <DialogTitle className="text-xl font-bold mb-4">{article.title}</DialogTitle>
          <p className="text-gray-700 mb-4">{article.content}</p>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
            <span className="font-medium text-gray-700">By {article.author}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {article.views}
              </span>
              <Share2 className="w-3.5 h-3.5 cursor-pointer hover:text-emerald-600 transition-colors" />
              <Bookmark className="w-3.5 h-3.5 cursor-pointer hover:text-orange-600 transition-colors" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
