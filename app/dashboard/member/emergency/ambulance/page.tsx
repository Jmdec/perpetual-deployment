"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ChevronLeft, MapPin, User, Phone, AlertCircle, Siren, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import MemberLayout from "@/components/memberLayout"
import { authClient } from "@/lib/auth"

export default function AmbulanceRequestPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [detectedAddress, setDetectedAddress] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [isLoadingUserData, setIsLoadingUserData] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    emergency: "",
    notes: "",
  })

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await authClient.getCurrentUser()
        if (user) {
          setFormData((prev) => ({
            ...prev,
            name: user.name || "",
            phone: user.phone_number || "",
            address: user.address || "",
          }))
        } else {
          toast({
            title: "Authentication Required",
            description: "Please log in to continue.",
            variant: "destructive",
          })
          router.push("/login")
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        toast({
          title: "Error",
          description: "Failed to load your profile information.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingUserData(false)
      }
    }
    loadUserData()
  }, [toast, router])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setLocation(coords)

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'AmbulanceRequestApp/1.0'
                }
              }
            )
            const data = await response.json()
            
            if (data.display_name) {
              setDetectedAddress(data.display_name)
              if (!formData.address) {
                setFormData(prev => ({
                  ...prev,
                  address: data.display_name
                }))
              }
            }
          } catch (error) {
            console.error("Reverse geocoding error:", error)
          }
        },
        () => {
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enter your address manually.",
            variant: "destructive",
          })
        },
      )
    }
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/emergency/ambulance", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          location,
          timestamp: new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (response.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue.",
          variant: "destructive",
        })
        setTimeout(() => {
          router.push("/login")
        }, 2000)
        return
      }

      if (response.ok && data.success) {
        toast({
          title: "Ambulance Request Submitted",
          description: `Request ID: ${data.data.requestId}. Estimated arrival: ${data.data.estimatedArrival}`,
        })
        
        setFormData(prev => ({
          ...prev,
          emergency: "",
          notes: "",
        }))
        
        setTimeout(() => {
          router.push("/dashboard/member/emergency/ambulance-requests")
        }, 2000)
      } else {
        toast({
          title: "Request Failed",
          description: data.message || "Failed to submit request. Please call emergency hotline.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting ambulance request:", error)
      toast({
        title: "Request Failed",
        description: "Failed to submit request. Please call emergency hotline.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const emergencyTypes = [
    { value: "cardiac", label: "Cardiac Arrest", icon: "❤️" },
    { value: "breathing", label: "Breathing Difficulty", icon: "🫁" },
    { value: "accident", label: "Accident", icon: "🚗" },
    { value: "medical", label: "Medical Emergency", icon: "🏥" },
    { value: "injury", label: "Severe Injury", icon: "🩹" },
    { value: "other", label: "Other", icon: "⚕️" },
  ]

  return (
    <MemberLayout>
      {isLoadingUserData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-orange-600 rounded-full border-t-transparent animate-spin"></div>
              <Siren className="absolute inset-0 m-auto w-8 h-8 text-orange-600" />
            </div>
            <p className="text-gray-700 font-semibold">Loading emergency system...</p>
          </div>
        </div>
      )}

      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-linear-to-r from-green-600 via-yellow-500 to-orange-500 text-white px-6 py-5 shadow-lg sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Link href="/emergency" className="hover:bg-white/20 p-2 rounded-lg transition-all active:scale-95">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                <Siren className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Emergency Ambulance</h1>
                <p className="text-white/90 text-sm">⚡ Fast Response • 24/7 Available</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Left Column - Info Cards */}
            <div className="lg:col-span-1 space-y-4">
              {/* Location Card */}
              <div className="bg-linear-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-5 shadow-lg">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">📍 Location Detected</p>
                  </div>
                </div>
                {location ? (
                  <div className="space-y-2">
                    <p className="text-sm font-mono bg-white/10 px-3 py-1.5 rounded">
                      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </p>
                    {detectedAddress && (
                      <p className="text-sm opacity-90 leading-relaxed">{detectedAddress}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                    <p className="text-sm">Detecting location...</p>
                  </div>
                )}
              </div>

              {/* Profile Card */}
              <div className="bg-linear-to-r from-green-500 to-yellow-500 text-white rounded-2xl p-5 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold">✓ Profile Auto-filled</p>
                    <p className="text-xs opacity-90">Your info is ready. Edit if needed.</p>
                  </div>
                </div>
              </div>

              {/* Emergency Hotline */}
              <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-green-200">
                <p className="text-sm font-semibold text-gray-700 mb-3 text-center">📞 Emergency Hotline</p>
                <a
                  href="tel:(043)288-8888"
                  className="flex items-center justify-center gap-3 bg-linear-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-800 transition-all"
                >
                  <Phone className="w-5 h-5" />
                  (043) 288-8888
                </a>
              </div>

              {/* Warning */}
              <div className="bg-linear-to-r from-yellow-50 to-orange-50 border-2 border-orange-300 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-orange-900 font-bold mb-1">⚠️ Emergency Use Only</p>
                    <p className="text-xs text-orange-800">False reports may result in penalties and delay actual emergencies.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Form Header */}
                <div className="bg-linear-to-r from-orange-500 to-orange-600 px-6 py-4">
                  <h2 className="text-white font-bold text-xl flex items-center gap-2">
                    <Clock className="w-6 h-6" />
                    Request Details
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Name & Phone - 2 columns */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">👤 Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">📱 Contact Number *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="09XX XXX XXXX"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">🏠 Exact Address *</label>
                    <textarea
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street, Barangay, Landmarks"
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all"
                    />
                  </div>

                  {/* Emergency Type */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">🚨 Type of Emergency *</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {emergencyTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, emergency: type.value })}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.emergency === type.value
                              ? "bg-linear-to-br from-orange-500 to-orange-600 text-white border-transparent shadow-lg scale-105"
                              : "bg-white border-gray-200 hover:border-orange-300 hover:shadow-md"
                          }`}
                        >
                          <div className="text-3xl mb-2">{type.icon}</div>
                          <div className={`text-sm font-semibold ${
                            formData.emergency === type.value ? "text-white" : "text-gray-700"
                          }`}>
                            {type.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">📝 Additional Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Patient condition, floor number, special instructions..."
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !location || isLoadingUserData}
                    className="w-full bg-linear-to-r from-green-600 via-yellow-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-green-700 hover:via-yellow-600 hover:to-orange-700 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Submitting Request...
                      </>
                    ) : (
                      <>
                        <Siren className="w-5 h-5" />
                        Request Ambulance Now
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </MemberLayout>
  )
}