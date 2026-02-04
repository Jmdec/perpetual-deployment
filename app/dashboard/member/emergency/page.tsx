"use client"

import { useState } from "react"
import { Phone, Ambulance, FireExtinguisher, Shield, ChevronLeft, MapPin, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import MemberLayout from "@/components/memberLayout"

export default function EmergencyPage() {
  const [calling, setCalling] = useState(false)

  const emergencyContacts = [
    {
      icon: Phone,
      label: "Emergency Hotline",
      number: "911",
      color: "bg-linear-to-br from-red-500 to-red-600",
    },
    {
      icon: Ambulance,
      label: "Ambulance",
      number: "(043) 288-8888",
      color: "bg-linear-to-br from-blue-500 to-blue-600",
    },
    {
      icon: FireExtinguisher,
      label: "Fire Department",
      number: "(043) 288-7777",
      color: "bg-linear-to-br from-orange-500 to-orange-600",
    },
    {
      icon: Shield,
      label: "Police Station",
      number: "(043) 288-6666",
      color: "bg-linear-to-br from-indigo-500 to-indigo-600",
    },
  ]

  const handleEmergencyCall = async (number: string) => {
    setCalling(true)
    setTimeout(() => {
      window.location.href = `tel:${number}`
      setCalling(false)
    }, 500)
  }

  return (
    <MemberLayout>
      <div className="h-screen overflow-auto bg-gray-50">
      {/* Header */}
      <header className="bg-linear-to-r from-emerald-600 to-orange-500 text-white px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/dashboard/member" className="hover:bg-white/10 p-1 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Emergency Services</h1>
              <p className="text-white/90 text-xs sm:text-sm mt-0.5">Quick access to emergency contacts</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <Clock className="w-5 h-5" />
            <span className="font-medium">24/7 Available</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          {/* Emergency Alert */}
          <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg mb-6 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-900 font-semibold text-sm sm:text-base">
                  For life-threatening emergencies, call{" "}
                  <span className="text-red-600 font-extrabold text-lg">911</span>{" "}
                  immediately
                </p>
                <p className="text-red-700 text-xs sm:text-sm mt-1">
                  Available 24/7 for medical, fire, and police emergencies
                </p>
              </div>
            </div>
          </div>

          {/* One-Tap Emergency Call */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-red-600" />
              One-Tap Emergency Call
            </h2>
            <button
              onClick={() => handleEmergencyCall("911")}
              disabled={calling}
              className="w-full bg-linear-to-br from-red-600 to-red-500 text-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl active:scale-98 transition-all disabled:opacity-50 group"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Phone className="w-10 h-10 sm:w-12 sm:h-12 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold">
                    Call <span className="text-yellow-300">911</span>
                  </p>
                  <p className="text-red-100 text-sm mt-1">Emergency Hotline</p>
                </div>
              </div>
            </button>
          </div>

          {/* Emergency Contacts Grid */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              Emergency Contacts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {emergencyContacts.map((contact, index) => (
                <button
                  key={index}
                  onClick={() => handleEmergencyCall(contact.number)}
                  className="flex items-center gap-4 bg-gray-50 hover:bg-gray-100 p-4 sm:p-5 rounded-xl border border-gray-200 hover:border-gray-300 active:scale-98 transition-all group w-full"
                >
                  <div
                    className={`${contact.color} w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0`}
                  >
                    <contact.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">
                      {contact.label}
                    </h3>
                    <p
                      className={`text-sm sm:text-base mt-0.5 ${
                        contact.number === "911"
                          ? "text-red-600 font-bold"
                          : "text-gray-600"
                      }`}
                    >
                      {contact.number}
                    </p>
                  </div>
                  <Phone className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Request Assistance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Ambulance className="w-5 h-5 text-orange-600" />
              Request Assistance
            </h2>
            <Link
              href="/dashboard/member/emergency/ambulance"
              className="flex items-center gap-4 bg-linear-to-r from-emerald-500 to-orange-500 text-white p-5 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all group w-full"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <Ambulance className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <h3 className="font-bold text-lg sm:text-xl">Request Ambulance</h3>
                <p className="text-white/90 text-xs sm:text-sm mt-1">
                  Share your location for quick response
                </p>
              </div>
              <MapPin className="w-5 h-5 text-white/80 group-hover:text-white transition-colors flex-shrink-0" />
            </Link>
          </div>

          {/* Safety Tips */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="font-bold text-gray-900 text-lg sm:text-xl mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Safety Tips
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-blue-600 font-bold text-lg flex-shrink-0">1</span>
                <span className="text-sm sm:text-base text-gray-700">
                  Stay calm and speak clearly when calling emergency services
                </span>
              </div>
              <div className="flex gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                <span className="text-green-600 font-bold text-lg flex-shrink-0">2</span>
                <span className="text-sm sm:text-base text-gray-700">
                  Provide your exact location and describe the emergency
                </span>
              </div>
              <div className="flex gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                <span className="text-orange-600 font-bold text-lg flex-shrink-0">3</span>
                <span className="text-sm sm:text-base text-gray-700">
                  Follow the dispatcher's instructions carefully
                </span>
              </div>
              <div className="flex gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <span className="text-purple-600 font-bold text-lg flex-shrink-0">4</span>
                <span className="text-sm sm:text-base text-gray-700">
                  Don't hang up until told to do so by the operator
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </MemberLayout>
  )
}