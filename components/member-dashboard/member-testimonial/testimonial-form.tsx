"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"

interface Props {
    onClose: () => void
}

export default function TestimonialForm({ onClose }: Props) {
    const [form, setForm] = useState({
        name: "",
        role: "",
        message: "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // TODO: connect to Laravel API
        console.log(form)

        onClose()
    }

    return (
        <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.form
                onSubmit={handleSubmit}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full relative"
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4"
                >
                    <X />
                </button>

                <h2 className="text-xl font-semibold mb-4">
                    Share Your Testimonial
                </h2>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Your Name"
                        className="w-full border rounded-xl px-4 py-2"
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                        required
                    />

                    <input
                        type="text"
                        placeholder="Your Role (optional)"
                        className="w-full border rounded-xl px-4 py-2"
                        value={form.role}
                        onChange={(e) =>
                            setForm({ ...form, role: e.target.value })
                        }
                    />

                    <textarea
                        placeholder="Your Message"
                        className="w-full border rounded-xl px-4 py-2 h-28 resize-none"
                        value={form.message}
                        onChange={(e) =>
                            setForm({ ...form, message: e.target.value })
                        }
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="mt-6 w-full bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600 transition"
                >
                    Submit Testimonial
                </button>
            </motion.form>
        </motion.div>
    )
}
