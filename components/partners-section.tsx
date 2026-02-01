"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface BusinessPartner {
  id: number
  business_name: string
  category?: string
  description?: string
  website_link?: string
  photo?: string
  status: "pending" | "approved" | "rejected"
  admin_note?: string
  created_at: string
  updated_at: string
}

export default function BusinessPartnersSection() {
  const [partners, setPartners] = useState<BusinessPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/business-partners')
        const data = await res.json()

        if (data.success && data.data) {
          // Get the actual data array from paginated response
          const partnersData = data.data.data || data.data
          setPartners(partnersData)
        } else {
          setError(data.message || 'Failed to load partners')
        }
      } catch (err) {
        console.error('Error fetching partners:', err)
        setError('Failed to load business partners')
      } finally {
        setLoading(false)
      }
    }

    fetchPartners()
  }, [])

  if (loading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-gray-900 mb-4"
            >
              Our Business Partners
            </motion.h2>
          </div>
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        </div>
      </section>
    )
  }

  if (error || partners.length === 0) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-gray-900 mb-4"
            >
              Our Business Partners
            </motion.h2>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-500">
              {error || 'No business partners to display at this time.'}
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-6 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Our Business Partners
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Collaborating with leading organizations to strengthen our community
          </motion.p>
        </div>

        {/* Partners Grid - 4 columns on all screen sizes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {partners.map((partner, i) => {
            const hasValidImage = !!(partner.photo)

            return (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-stretch"
              >
                {partner.website_link ? (
                  <a
                    href={partner.website_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <PartnerCard
                      partner={partner}
                      hasValidImage={hasValidImage}
                    />
                  </a>
                ) : (
                  <PartnerCard
                    partner={partner}
                    hasValidImage={hasValidImage}
                  />
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-gray-500 text-sm mt-12"
        >
          Partnerships shown reflect ongoing collaborations and community support initiatives.
        </motion.p>
      </div>
    </section>
  )
}

// Separate component for the partner card
function PartnerCard({
  partner,
  hasValidImage
}: {
  partner: BusinessPartner
  hasValidImage: boolean
}) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="relative w-full h-full bg-white rounded-xl border-2 border-gray-100 shadow-md hover:shadow-xl hover:border-orange-300 transition-all duration-300 flex flex-col items-center group">
      {/* Image Container - Fixed height */}
      <div className="relative w-72 h-64 flex items-center justify-center mb-3 flex-shrink-0">
        {hasValidImage && !imageError ? (
          <img
            src={partner.photo!}
            alt={partner.business_name}
            className="object-cover w-full h-full"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-orange-600">
              {partner.business_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Business Name - Flexible height with consistent spacing */}
      <div className="text-center w-full flex-grow flex flex-col justify-end">
        <p className="text-sm font-bold text-gray-700 line-clamp-2 group-hover:text-orange-600 transition-colors mb-1">
          {partner.business_name}
        </p>
        {partner.category && (
          <p className="text-xs text-gray-500 line-clamp-1">
            {partner.category}
          </p>
        )}
      </div>
    </div>
  )
}