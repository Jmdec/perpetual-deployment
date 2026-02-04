"use client"

import { useState } from "react"
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import MemberLayout from "@/components/memberLayout"

export default function StartupPage() {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  const toggleItem = (category: string, index: number) => {
    const key = `${category}-${index}`
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const startupServices = [
    {
      category: "Business Registration",
      items: [
        { 
          name: "Startup Registration", 
          description: "Register your startup business", 
          icon: "🚀",
          requirements: [
            "Valid government-issued ID",
            "Birth certificate (PSA copy)",
            "Business plan or concept paper",
            "Proof of address",
            "TIN (Tax Identification Number)",
            "Community Tax Certificate (Cedula)"
          ]
        },
        { 
          name: "Business Name Search", 
          description: "Check business name availability", 
          icon: "🔍",
          requirements: [
            "Valid government-issued ID",
            "3 proposed business names",
            "Business nature/description",
            "Online application form"
          ]
        },
        { 
          name: "DTI Registration", 
          description: "Department of Trade registration", 
          icon: "📋",
          requirements: [
            "Accomplished DTI application form",
            "Valid government-issued ID",
            "Proof of payment (registration fee)",
            "Business name verification slip",
            "Barangay clearance"
          ]
        },
      ],
    },
    {
      category: "Support Programs",
      items: [
        { 
          name: "Startup Grants", 
          description: "Apply for startup funding", 
          icon: "💰",
          requirements: [
            "Completed grant application form",
            "Detailed business plan (5-year projection)",
            "Financial statements/projections",
            "DTI/SEC registration certificate",
            "Mayor's permit (if applicable)",
            "Tax clearance",
            "Project proposal with budget"
          ]
        },
        { 
          name: "Mentorship Program", 
          description: "Connect with business mentors", 
          icon: "👥",
          requirements: [
            "Mentorship application form",
            "Business profile/summary",
            "Valid ID",
            "Business registration documents",
            "Statement of business challenges"
          ]
        },
        { 
          name: "Co-working Spaces", 
          description: "Access shared workspaces", 
          icon: "🏢",
          requirements: [
            "Co-working space application",
            "Valid government-issued ID",
            "Business registration proof",
            "Membership fee payment",
            "Signed facility usage agreement"
          ]
        },
      ],
    },
    {
      category: "Resources",
      items: [
        { 
          name: "Business Training", 
          description: "Free entrepreneurship training", 
          icon: "📚",
          requirements: [
            "Training registration form",
            "Valid government-issued ID",
            "Resume or business profile",
            "Commitment letter (for full attendance)",
            "Pre-assessment form"
          ]
        },
        { 
          name: "Market Research", 
          description: "Access market data and insights", 
          icon: "📊",
          requirements: [
            "Research request form",
            "Valid ID",
            "Business registration documents",
            "Research purpose statement",
            "Data confidentiality agreement"
          ]
        },
        { 
          name: "Networking Events", 
          description: "Connect with other entrepreneurs", 
          icon: "🤝",
          requirements: [
            "Event registration form",
            "Valid government-issued ID",
            "Business card or profile",
            "Payment (if applicable)",
            "Professional attire"
          ]
        },
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
            <h1 className="text-xl font-bold text-gray-900">Startup Hub</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 py-6 pb-24 overflow-y-auto">
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <h2 className="font-semibold text-gray-900 mb-2">Launch Your Startup in Perpetual Village</h2>
              <p className="text-sm text-gray-700">
                Access resources, funding, and support to turn your business idea into reality.
              </p>
            </CardContent>
          </Card>

          {startupServices.map((section, sectionIdx) => (
            <div key={sectionIdx} className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{section.category}</h2>
              <div className="space-y-3">
                {section.items.map((item, itemIdx) => {
                  const key = `${section.category}-${itemIdx}`
                  const isExpanded = expandedItems[key]
                  
                  return (
                    <Card key={itemIdx} className="border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-0 h-auto font-medium"
                              onClick={() => toggleItem(section.category, itemIdx)}
                            >
                              {isExpanded ? (
                                <>
                                  Hide Requirements <ChevronUp className="w-4 h-4 ml-1" />
                                </>
                              ) : (
                                <>
                                  View Requirements <ChevronDown className="w-4 h-4 ml-1" />
                                </>
                              )}
                            </Button>

                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Requirements:</h4>
                                <ul className="space-y-1.5">
                                  {item.requirements.map((req, reqIdx) => (
                                    <li key={reqIdx} className="text-sm text-gray-700 flex items-start gap-2">
                                      <span className="text-orange-600 mt-0.5">•</span>
                                      <span>{req}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </main>
      </div>
    </MemberLayout>
  )
}