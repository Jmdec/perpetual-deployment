"use client"

import { useState } from "react"
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import MemberLayout from "@/components/memberLayout"

export default function StudentsPage() {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  const toggleItem = (category: string, index: number) => {
    const key = `${category}-${index}`
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const studentServices = [
    {
      category: "Scholarships",
      items: [
        { 
          name: "City Scholarship Program", 
          description: "Apply for city-funded scholarships", 
          icon: "🎓",
          requirements: [
            "Valid Student ID",
            "Certificate of Enrollment",
            "Proof of Residency (Barangay Certificate)",
            "Income Tax Return or Certificate of Indigency",
            "Grade Report (for renewal)",
            "Birth Certificate (PSA)",
            "2x2 ID Photo (2 copies)"
          ]
        },
        { 
          name: "Merit Scholarship", 
          description: "For outstanding students", 
          icon: "🏆",
          requirements: [
            "Academic Excellence Certificate",
            "Certificate of Enrollment",
            "Transcript of Records",
            "Proof of Residency",
            "Recommendation Letter from School",
            "Birth Certificate (PSA)",
            "2x2 ID Photo (2 copies)"
          ]
        },
        { 
          name: "Financial Assistance", 
          description: "Educational financial aid", 
          icon: "💰",
          requirements: [
            "Certificate of Indigency",
            "Certificate of Enrollment",
            "Proof of Residency",
            "Income Documents of Parents/Guardians",
            "Birth Certificate (PSA)",
            "Valid ID of Parent/Guardian",
            "2x2 ID Photo (2 copies)"
          ]
        },
      ],
    },
    {
      category: "Student Services",
      items: [
        { 
          name: "Student ID Application", 
          description: "Get your student ID", 
          icon: "🪪",
          requirements: [
            "Certificate of Enrollment",
            "Proof of Residency",
            "Birth Certificate (PSA)",
            "2x2 ID Photo (2 copies)",
            "Valid School ID"
          ]
        },
        { 
          name: "Library Card", 
          description: "Access city library resources", 
          icon: "📚",
          requirements: [
            "Valid Student ID or School ID",
            "Proof of Residency",
            "1x1 ID Photo (1 copy)",
            "Parent/Guardian Consent (for minors)"
          ]
        },
        { 
          name: "Internship Programs", 
          description: "City government internships", 
          icon: "💼",
          requirements: [
            "Endorsement Letter from School",
            "Certificate of Enrollment",
            "Resume/CV",
            "Transcript of Records",
            "Medical Certificate",
            "Police Clearance",
            "2x2 ID Photo (2 copies)",
            "Valid ID"
          ]
        },
      ],
    },
    {
      category: "Youth Programs",
      items: [
        { 
          name: "Skills Training", 
          description: "Free skills development programs", 
          icon: "🛠️",
          requirements: [
            "Certificate of Enrollment or Student ID",
            "Proof of Residency",
            "Birth Certificate",
            "Parent/Guardian Consent (for minors)",
            "1x1 ID Photo (2 copies)",
            "Medical Certificate (if required)"
          ]
        },
        { 
          name: "Sports Programs", 
          description: "Youth sports and athletics", 
          icon: "⚽",
          requirements: [
            "Medical Certificate",
            "Proof of Residency",
            "Birth Certificate",
            "Parent/Guardian Consent (for minors)",
            "1x1 ID Photo (2 copies)",
            "School ID or Student ID"
          ]
        },
        { 
          name: "Arts & Culture", 
          description: "Cultural programs for youth", 
          icon: "🎨",
          requirements: [
            "Proof of Residency",
            "Birth Certificate",
            "Parent/Guardian Consent (for minors)",
            "1x1 ID Photo (2 copies)",
            "Portfolio (if applicable)",
            "School ID or Student ID"
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
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Student Services</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 py-6 pb-24 overflow-y-auto">
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <h2 className="font-semibold text-gray-900 mb-2">Empowering Perpetual Village Youth</h2>
              <p className="text-sm text-gray-700">
                Access scholarships, educational programs, and youth development opportunities.
              </p>
            </CardContent>
          </Card>

          {studentServices.map((section, sectionIdx) => (
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