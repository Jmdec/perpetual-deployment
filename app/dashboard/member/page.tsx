"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import MemberLayout from "@/components/memberLayout"
import { motion } from "framer-motion"
import AnnouncementsSection from "@/components/member-dashboard/member-announcement"
import NewsSection from "@/components/member-dashboard/member-news"
import { useAuth } from "@/hooks/useAuth"
import GalleryViewModal from "@/components/member/gallery/view-modal"
import { toast } from "sonner"
import Link from "next/link"

interface Gallery {
  id: number
  title: string
  description?: string
  image_url: string
  created_at: string
}

interface JuanTapProfile {
  id: number
  profile_url: string | null
  qr_code: string | null
  status: "active" | "inactive"
  subscription: "free" | "basic" | "premium"
}

interface User {
  id: number
  name: string
  email: string
  juantap_profile: JuanTapProfile | null
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(endpoint, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  })

  const text = await res.text()

  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    throw new Error("Invalid server response")
  }

  if (!res.ok) {
    console.error("API Error:", data)
    throw new Error(data.message || "Request failed")
  }

  return data
}

const userAPI = {
  me: () => fetchWithAuth("/api/auth/me"),
}

const juantapAPI = {
  get: () =>
    fetchWithAuth("/api/juantap", {
      method: "GET",
    }),
  create: (data: any) =>
    fetchWithAuth("/api/juantap", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (data: any) =>
    fetchWithAuth("/api/juantap", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: () =>
    fetchWithAuth("/api/juantap", {
      method: "DELETE",
    }),
}

export default function MemberDashboard() {
  const router = useRouter()
  const { user: authUser, loading: authLoading } = useAuth(true)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [qrPreview, setQrPreview] = useState<string | null>(null)
  const [galleries, setGalleries] = useState<Gallery[]>([])

  const [formData, setFormData] = useState({
    profile_url: "",
    qr_code: "",
    status: "inactive" as "active" | "inactive",
    subscription: "free" as "free" | "basic" | "premium",
  })
  const [juantapProfile, setJuanTapProfile] = useState<JuanTapProfile | null>(null)

  useEffect(() => {
    fetchUser()
    fetchGalleries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchGalleries = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/galleries", { credentials: "include" })
      const data = await res.json()
      setGalleries(data.data ?? data)
    } catch {
      toast.error("Failed to load gallery")
    } finally {
      setLoading(false)
    }
  }

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await userAPI.me()
      console.log("User data received:", res)
      setUser(res.user)

      await fetchJuanTapProfileData()
    } catch (err: any) {
      console.error("Error fetching user:", err)
      setError(err.message)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const fetchJuanTapProfileData = async () => {
    try {
      const res = await juantapAPI.get()
      console.log("JuanTap Profile response:", res)
      if (res.data) {
        setJuanTapProfile(res.data)
      }
    } catch (err: any) {
      console.log("No existing JuanTap profile found")
    }
  }

  const hasJuanTapProfile = Boolean(juantapProfile)

  const openModal = () => {
    if (juantapProfile) {
      setFormData({
        profile_url: juantapProfile.profile_url || "",
        qr_code: juantapProfile.qr_code || "",
        status: juantapProfile.status,
        subscription: juantapProfile.subscription,
      })
      setQrPreview(juantapProfile.qr_code || null)
    } else {
      setFormData({
        profile_url: "",
        qr_code: "",
        status: "inactive",
        subscription: "free",
      })
      setQrPreview(null)
    }
    setShowModal(true)
  }

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setFormData((prev) => ({ ...prev, qr_code: base64 }))
      setQrPreview(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError("")

    try {
      hasJuanTapProfile ? await juantapAPI.update(formData) : await juantapAPI.create(formData)

      await fetchJuanTapProfileData()
      setShowModal(false)
      toast.success(hasJuanTapProfile ? "Profile updated successfully" : "Profile created successfully")
    } catch (err: any) {
      setFormError(err.message)
      toast.error(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your JuanTap profile? This action cannot be undone.")) {
      return
    }

    setFormLoading(true)
    setFormError("")

    try {
      await juantapAPI.delete()
      await fetchJuanTapProfileData()
      setShowModal(false)
      toast.success("Profile deleted successfully")
    } catch (err: any) {
      setFormError(err.message)
      toast.error(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const getImageUrl = (videoUrl?: string): string => {
    if (!videoUrl) return "/placeholder.png"
    if (videoUrl.startsWith("http://") || videoUrl.startsWith("https://")) {
      return videoUrl
    }
    if (videoUrl.startsWith("/")) {
      return `${process.env.NEXT_PUBLIC_IMAGE_URL}${videoUrl}`
    }
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}/${videoUrl}`
  }

  if (loading) {
    return (
      <MemberLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </MemberLayout>
    )
  }

  if (error) {
    return (
      <MemberLayout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={() => fetchUser()} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              Retry
            </button>
          </div>
        </div>
      </MemberLayout>
    )
  }

  return (
    <div className="lg:py-10">
      <MemberLayout>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-emerald-600 to-orange-500 bg-clip-text text-transparent">
              Welcome, {user?.name || "Member"}!
            </span>
          </h1>
          <p className="text-gray-600 text-lg">Perpetual Help College Dashboard</p>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-8">
          <AnnouncementsSection />
          <NewsSection />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-11 h-11 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow">
                JT
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-800">JuanTap Profile</h3>
                <p className="text-sm text-gray-500 truncate">Digital identity &amp; smart profile</p>
              </div>
            </div>

            {hasJuanTapProfile ? (
              <>
                {(juantapProfile?.profile_url || juantapProfile?.qr_code) && (
                  <div className="flex gap-4 p-3 mb-4">
                    <div className="flex-1 justify-center text-center">
                      {juantapProfile?.qr_code && (
                        <img
                          src={juantapProfile.qr_code}
                          alt="QR Code"
                          className="w-50 lg:w-60 w-50 lg:h-60 rounded-lg border bg-white items-center mx-auto"
                        />
                      )}

                      {juantapProfile?.profile_url && (
                        <div className="flex-1 min-w-0 mt-2 lg:my-5">
                          <p className="text-md text-gray-500 mb-1">Profile URL</p>
                          <a
                            href={juantapProfile.profile_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg text-orange-600 hover:underline truncate block font-medium"
                          >
                            {juantapProfile.profile_url}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={openModal}
                  className="w-full py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-medium text-sm"
                >
                  {juantapProfile?.profile_url || juantapProfile?.qr_code ? "Update Profile" : "Add Details"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => window.open("https://www.juantap.info/", "_blank")}
                  className="w-full py-2.5 mb-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-medium text-sm"
                >
                  Avail JuanTap Subscription
                </button>

                <button
                  onClick={openModal}
                  className="w-full py-2.5 border-2 border-emerald-600 text-emerald-600 rounded-xl hover:bg-emerald-50 transition font-medium text-sm"
                >
                  Add Existing Profile
                </button>
              </>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-800">Gallery</h2>
              <Link href="/dashboard/member/gallery">
                <button className="text-sm font-medium text-emerald-600 hover:underline">View all</button>
              </Link>
            </div>

            <GalleryViewModal galleries={galleries} getImageUrl={getImageUrl} />
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-xl rounded-2xl shadow-xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">
                  {hasJuanTapProfile ? "Update JuanTap Profile" : "Add Existing JuanTap Profile"}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">JuanTap Profile URL</label>
                  <input
                    type="url"
                    value={formData.profile_url}
                    onChange={(e) => setFormData({ ...formData, profile_url: e.target.value })}
                    placeholder="https://juantap.info/your-profile"
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload QR Code</label>
                  <input type="file" accept="image/*" onChange={handleQrUpload} className="block w-full text-sm" />

                  {qrPreview && (
                    <div className="mt-3 flex justify-center">
                      <img src={qrPreview} alt="QR Preview" className="w-32 h-32 rounded-lg border" />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 border rounded-xl hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  {hasJuanTapProfile && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={formLoading}
                      className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50"
                    >
                      {formLoading ? "Deleting..." : "Delete"}
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50"
                  >
                    {formLoading ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </MemberLayout>
    </div>
  )
}