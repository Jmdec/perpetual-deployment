"use client"

import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Clock, CheckCircle, XCircle } from "lucide-react"
import PageLayout from "@/components/page-layout"
import Link from "next/link"
import { useState } from "react"
import CTASection from "@/components/cta-section"

function Map() {
  return (
    <div className="w-full h-[500px]">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3863.5080063712476!2d120.97978174729064!3d14.455493844679417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397cde32848c3d7%3A0xeeaef0ae39538a8b!2s1%20Metals%20Rd%2C%20Las%20Pi%C3%B1as%2C%201750%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1763974724562!5m2!1sen!2sph"
        className="w-full h-full rounded-xl border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
  }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })
    setErrors({})

    // Validation
    const newErrors: { name?: string; email?: string } = {}

    // Name validation - no numbers allowed
    if (/\d/.test(formData.name)) {
      newErrors.name = 'Name cannot contain numbers'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitStatus({
          type: 'success',
          message: data.message || 'Message sent successfully!'
        })
        setFormData({ name: "", email: "", subject: "", message: "" })
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.message || 'Failed to send message. Please try again.'
        })
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'An error occurred. Please try again later.'
      })
    } finally {
      setIsSubmitting(false)
      // Clear status after 5 seconds
      setTimeout(() => {
        setSubmitStatus({ type: null, message: '' })
      }, 5000)
    }
  }

  return (
    <PageLayout
      title="Contact Us"
      subtitle="Get in touch with Perpetual Village Community"
      image="/newspaper-journalism-city-news.jpg"
    >
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

              {submitStatus.type && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${submitStatus.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                    }`}
                >
                  {submitStatus.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <p className="text-sm font-medium">{submitStatus.message}</p>
                </motion.div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const value = e.target.value
                      // Block numbers from being typed
                      if (!/\d/.test(value)) {
                        setFormData({ ...formData, name: value })
                        if (errors.name) setErrors({ ...errors, name: undefined })
                      }
                    }}
                    onBlur={() => {
                      // Validate on blur
                      if (formData.name && /\d/.test(formData.name)) {
                        setErrors({ ...errors, name: 'Name cannot contain numbers' })
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-500' : 'border-orange-200'
                      } focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition`}
                    placeholder="Your name"
                    required
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value })
                      if (errors.email) setErrors({ ...errors, email: undefined })
                    }}
                    onBlur={() => {
                      // Validate on blur (when leaving the field)
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                      if (formData.email && !emailRegex.test(formData.email)) {
                        setErrors({ ...errors, email: 'Please enter a valid email address' })
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-orange-200'
                      } focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition`}
                    placeholder="your@email.com"
                    required
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                    placeholder="How can we help?"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-yellow-200 focus:border-yellow-500 focus:ring-2 focus:ring-orange-200 transition"
                    placeholder="Your message..."
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 rounded-full bg-linear-to-tl from-yellow-600 via-red-700 to-red-900 text-white font-bold hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {[
              {
                icon: MapPin,
                title: "Office Location",
                details: "P1 Metals Rd., Camella 4A, Las Piñas, Philippines",
                link: "https://maps.app.goo.gl/8kzbXckLdXSNE96z5",
                isExternal: true,
              },

              {
                icon: Phone,
                title: "Phone",
                details: "(02) 8872-9664",
                link: "tel:(02) 8872-9664",
                isExternal: false,
              },
              {
                icon: Mail,
                title: "Email",
                details: "taugamma-perpetual@gmail.com",
                link: "mailto:taugamma-perpetual@gmail.com",
                isExternal: false,
              },
              {
                icon: Clock,
                title: "Office Hours",
                details: "Monday - Friday: 8:00 AM - 5:00 PM",
                link: null,
                isExternal: false,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, x: 10 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 flex gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-yellow-400 via-red-600 to-[#800000]/900 flex items-center justify-center flex-shrink-0">
                  <item.icon className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  {item.link ? (
                    <a
                      href={item.link}
                      target={item.isExternal ? "_blank" : undefined}
                      rel={item.isExternal ? "noopener noreferrer" : undefined}
                      className="text-yellow-600 hover:text-yellow-700 text-sm hover:underline transition-colors"
                    >
                      {item.details}
                    </a>
                  ) : (
                    <p className="text-gray-600 text-sm">{item.details}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl overflow-hidden shadow-lg border border-orange-100"
        >
          <div className="w-full h-96 bg-linear-to-br from-orange-200 via-emerald-100 to-orange-100 flex items-center justify-center">
            <Map />
          </div>
        </motion.div>
      </section>

      <CTASection />
    </PageLayout>
  )
}
