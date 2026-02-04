'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Instagram, CreditCard } from 'lucide-react'
import { useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  verified: boolean
}

interface JuanTapProfile {
  id: string
  profile_url: string
  qr_code: string
  status: 'active' | 'inactive'
  subscription: 'free' | 'basic' | 'premium'
}

export default function Footer() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<JuanTapProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  /** 🔐 Check logged-in user */
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data?.user))
      .catch(() => setUser(null))
  }, [])

  /** 🪪 Check JuanTap profile */
  useEffect(() => {
    if (!user) return

    fetch('/api/juantap', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => setProfile(data?.data))
      .finally(() => setLoadingProfile(false))
      .catch(() => setLoadingProfile(false))
  }, [user])

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-red-500 via-orange-500 to-green-500" />

      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

          {/* BRAND */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h3 className="text-2xl font-bold mb-3 bg-linear-to-r from-red-400 via-orange-400 to-green-400 bg-clip-text text-transparent">
              Perpetual Help College
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Excellence in education, commitment to community, and empowerment for the future
            </p>

            <div className="flex gap-3">
              <a href="https://www.facebook.com/perpetualhelpcollege" target="_blank" rel="noopener noreferrer">
                <Facebook className="w-5 h-5 text-gray-400 hover:text-orange-400" />
              </a>
              <a href="https://www.instagram.com/perpetualhelpcollege/" target="_blank" rel="noopener noreferrer">
                <Instagram className="w-5 h-5 text-gray-400 hover:text-orange-400" />
              </a>
            </div>
          </motion.div>

          {/* NAV */}
          <div>
            <h4 className="font-bold mb-4">Navigation</h4>
            {[
              { name: 'Home', path: '/' },
              { name: 'About', path: '/about' },
              { name: 'Services', path: '/services' },
              { name: 'News', path: '/news' },
              { name: 'Announcements', path: '/announcements' },
              { name: 'Contact', path: '/contact' }
            ].map(({ name, path }) => (
              <Link key={name} href={path} className="block text-sm text-gray-400 hover:text-orange-400">
                {name}
              </Link>
            ))}
          </div>

          {/* CONTACT */}
          <div>
            <h4 className="font-bold mb-4">Contact Us</h4>
            <p className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <Phone className="w-4 h-4" /> (02) 8872-9664
            </p>
            <p className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <Mail className="w-4 h-4" /> info@perpetualhelpCollege.edu.ph
            </p>
            <p className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="w-4 h-4" /> Las Piñas City, Philippines
            </p>
          </div>

          {/* 🔥 JUANTAP NFC PROFILE */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-xl p-4 border border-gray-700"
            >
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-400" />
                JuanTap NFC Profile
              </h4>

              {loadingProfile ? (
                <p className="text-sm text-gray-400">Checking profile…</p>
              ) : profile ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${profile.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-orange-900 text-orange-300'}`}>
                      {profile.status === 'active' ? '✓ Active' : '○ Inactive'}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">{profile.subscription}</span>
                  </div>
                  {profile.profile_url && (
                    <a
                      href={profile.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-orange-400 hover:underline block mb-2 truncate"
                    >
                      View Profile →
                    </a>
                  )}
                  <Link
                    href="/dashboard/member"
                    className="block text-xs text-gray-400 hover:text-orange-400"
                  >
                    Manage Profile
                  </Link>
                </>
              ) : (
                <Link
                  href="/dashboard/member"
                  className="inline-block text-sm bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                >
                  Create JuanTap Profile
                </Link>
              )}
            </motion.div>
          )}
        </div>

        {/* BOTTOM */}
        <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Perpetual Help College. All Rights Reserved.
          <div className="mt-2">
            <span>Building Leaders | Shaping Futures | Serving Communities</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
