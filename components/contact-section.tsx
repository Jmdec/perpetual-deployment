"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Send } from "lucide-react"
import { useState } from "react"

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    setFormData({ name: "", email: "", message: "" })
  }

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      info: "+63-43-288-0123",
    },
    {
      icon: Mail,
      title: "Email",
      info: "info@Perpetual Villagecity.gov.ph",
    },
    {
      icon: MapPin,
      title: "Address",
      info: "Perpetual Village City, Oriental Mindoro",
    },
  ]

  return (
    <section id="contact" className="px-4 sm:px-6 lg:px-8 bg-linear-to-br from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">Get In Touch</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Have questions? We&apos;d love to hear from you. Send us a message anytime.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {contactInfo.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="p-6 rounded-2xl bg-linear-to-br from-white to-gray-50 border border-gray-100 text-center"
              >
                <motion.div
                  className="inline-flex p-4 rounded-full bg-linear-to-br from-emerald-100 to-orange-100 mb-4"
                  whileHover={{ scale: 1.1 }}
                >
                  <Icon className="w-6 h-6 text-emerald-600" />
                </motion.div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.info}</p>
              </motion.div>
            )
          })}
        </div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto p-8 rounded-2xl bg-linear-to-br from-emerald-50 to-orange-50 border border-emerald-100"
        >
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <input
              type="text"
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-4 py-3 rounded-lg bg-white border border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors"
            />
            <input
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="px-4 py-3 rounded-lg bg-white border border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>
          <textarea
            placeholder="Your Message"
            rows={5}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors mb-6"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-linear-to-r from-emerald-500 to-orange-400 text-white font-bold hover:shadow-lg transition-shadow"
          >
            Send Message <Send className="w-4 h-4" />
          </motion.button>
        </motion.form>
      </div>
    </section>
  )
}