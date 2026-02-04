"use client"

import React, { useEffect, useState } from "react"
import MemberLayout from "@/components/memberLayout"
import {
  User,
  Mail,
  Phone,
  MapPin,
  BadgeCheck,
} from "lucide-react"

type Member = {
  id: number
  name: string
  email: string
  phone_number?: string
  address?: string
  fraternity_number?: string
  role: string
  status: string
  created_at: string
}

export default function MemberPage() {
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
        })

        const json = await res.json()

        if (!res.ok) {
          throw new Error(json.message || "Failed to fetch user")
        }

        // Handle Laravel response structure: json.data.user
        setMember(json.data.user)
      } catch (err) {
        console.error("Failed to fetch member", err)
        setError(err instanceof Error ? err.message : "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    fetchMember()
  }, [])

  if (loading) {
    return (
      <MemberLayout>
        <div className="py-20 text-center text-gray-500">
          Loading profile…
        </div>
      </MemberLayout>
    )
  }

  if (error || !member) {
    return (
      <MemberLayout>
        <div className="py-20 text-center text-red-500">
          {error || "Failed to load profile"}
        </div>
      </MemberLayout>
    )
  }

  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="lg:py-10">
      <MemberLayout>
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Profile Header */}
          <div className="bg-white border rounded-2xl p-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                {initials}
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800">
                  {member.name}
                </h1>
                <p className="text-sm text-gray-500 capitalize">
                  {member.role}
                </p>

                {member.status === "approved" && (
                  <div className="flex items-center gap-2 mt-2">
                    <BadgeCheck size={16} className="text-emerald-500" />
                    <span className="text-sm text-emerald-600 font-medium">
                      Verified Member
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Personal Info */}
            <div className="bg-white border rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">
                Personal Information
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <User size={16} className="text-gray-400" />
                  <span>{member.name}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-400" />
                  <span>{member.email}</span>
                </div>

                {member.phone_number && (
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-400" />
                    <span>{member.phone_number}</span>
                  </div>
                )}

                {member.address && (
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{member.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Membership Info */}
            <div className="bg-white border rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">
                Membership Details
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-semibold capitalize">
                    {member.status}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Fraternity No.</span>
                  <span className="font-semibold">
                    {member.fraternity_number || "—"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Joined</span>
                  <span className="font-semibold">
                    {new Date(member.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </MemberLayout>
    </div>
  )
}