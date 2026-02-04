"use client"

import { useState } from "react"
import { ArrowLeft, Home, Grid3x3, Newspaper, AlertTriangle, User } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import MemberLayout from "@/components/memberLayout"

export default function BusinessPage() {
  const [activeTab, setActiveTab] = useState("services")

  const businessServices = [
    {
      category: "Business Support",
      items: [
        { name: "Tax Assistance", description: "Business tax consultation", icon: "💰", link: "/dashboard/member/services/tax-assistance" },
        { name: "Business Development", description: "Growth and expansion support", icon: "📈" },
        { name: "Trade Fairs", description: "Participate in city trade events", icon: "🏪" },
      ],
    },
    {
      category: "Compliance",
      items: [
        { name: "Zoning Clearance", description: "Check zoning requirements", icon: "🗺️" },
        { name: "Environmental Compliance", description: "Environmental clearance", icon: "🌱" },
        { name: "Labor Compliance", description: "Employment regulations", icon: "👥" },
      ],
    },
  ]

  return (
    <MemberLayout>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white px-4 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/member">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Business Services</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 py-6 pb-24 overflow-y-auto">
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <h2 className="font-semibold text-gray-900 mb-2">Grow Your Business in Perpetual Village</h2>
              <p className="text-sm text-gray-700">
                Access permits, licenses, and business support services all in one place.
              </p>
            </CardContent>
          </Card>

          {businessServices.map((section, idx) => (
            <div key={idx} className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{section.category}</h2>
              <div className="space-y-3">
                {section.items.map((item, itemIdx) => (
                  <Card key={itemIdx} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        {item.link ? (
                          <Link href={item.link}>
                            <Button variant="ghost" size="sm" className="text-orange-600">
                              View
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-orange-600">
                            Apply
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </main>
      </div>
    </MemberLayout>
  )
}