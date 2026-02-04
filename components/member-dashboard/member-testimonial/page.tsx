"use client"

import React, { useState } from "react"
import MemberLayout from "@/components/memberLayout"
import { motion, AnimatePresence } from "framer-motion"
import { X, Quote, User } from "lucide-react"
import TestimonialForm from "./testimonial-form"

interface Testimonial {
    id: number
    name: string
    message: string
    role?: string
    created_at: string
}

export default function TestimonialsSection() {
    const [selected, setSelected] = useState<Testimonial | null>(null)
        const [showForm, setShowForm] = useState(false)
    
        const testimonials: Testimonial[] = [
            {
                id: 1,
                name: "Juan Dela Cruz",
                role: "Alumni",
                message:
                    "Perpetual Village helped me reconnect with fellow alumni and stay updated with community events.",
                created_at: "2025-01-10",
            },
            {
                id: 2,
                name: "Maria Santos",
                role: "Member",
                message:
                    "The digital services and announcements are very helpful and easy to access.",
                created_at: "2025-01-12",
            },
        ]

    return (
        <>
            <div className="max-w-6xl mx-auto py-12">
                            {/* Header */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="text-center mb-12"
                            >
                                <h1 className="text-4xl font-bold mb-4">
                                    <span className="bg-gradient-to-r from-emerald-600 to-orange-500 bg-clip-text text-transparent">
                                        Testimonials
                                    </span>
                                </h1>
                                <p className="text-gray-600 max-w-2xl mx-auto">
                                    Hear what our members say about Perpetual Village
                                </p>
            
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
                                >
                                    Share Your Experience
                                </button>
                            </motion.div>
            
                            {/* Testimonial Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {testimonials.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        whileHover={{ scale: 1.02 }}
                                        className="bg-white border rounded-2xl p-6 shadow-sm cursor-pointer"
                                        onClick={() => setSelected(item)}
                                    >
                                        <Quote className="text-orange-500 mb-3" size={28} />
                                        <p className="text-gray-700 line-clamp-3">
                                            {item.message}
                                        </p>
            
                                        <div className="flex items-center gap-3 mt-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                <User size={18} className="text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">{item.name}</p>
                                                <p className="text-xs text-gray-500">{item.role}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
            
                            {/* View Modal */}
                            <AnimatePresence>
                                {selected && (
                                    <motion.div
                                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <motion.div
                                            initial={{ scale: 0.9 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0.9 }}
                                            className="bg-white rounded-2xl p-6 max-w-lg w-full relative"
                                        >
                                            <button
                                                onClick={() => setSelected(null)}
                                                className="absolute top-4 right-4"
                                            >
                                                <X />
                                            </button>
            
                                            <Quote className="text-orange-500 mb-4" size={32} />
                                            <p className="text-gray-700 mb-6">
                                                {selected.message}
                                            </p>
            
                                            <p className="font-semibold">{selected.name}</p>
                                            <p className="text-sm text-gray-500">{selected.role}</p>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
            
                            {/* Form Modal */}
                            <AnimatePresence>
                                {showForm && (
                                    <TestimonialForm onClose={() => setShowForm(false)} />
                                )}
                            </AnimatePresence>
                        </div>
        </>
    )
}