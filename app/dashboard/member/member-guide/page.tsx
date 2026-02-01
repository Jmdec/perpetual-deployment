"use client"

import { useState } from "react"
import { ArrowLeft, Home, Grid3x3, Newspaper, AlertTriangle, User, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import MemberLayout from "@/components/memberLayout"
export default function MemberGuidePage() {
  const [activeTab, setActiveTab] = useState("services")

  const guides = [
    {
      category: "Getting Started",
      items: [
        {
          title: "How to Register",
          content: "Learn how to register as a member of Perpetual Village City and access all services.",
          fullContent: (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                To register as a member of Perpetual Village City and access all online services, follow these simple steps:
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Step 1: Visit the Registration Page</h4>
                  <p className="text-sm text-gray-600">
                    Go to the Account section and click on Register or Sign Up.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Step 2: Provide Personal Information</h4>
                  <p className="text-sm text-gray-600">
                    Fill in your full name, email address, contact number, and complete address. Make sure all
                    information is accurate.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Step 3: Set Your Password</h4>
                  <p className="text-sm text-gray-600">
                   Create a strong password (minimum 8 characters) and confirm it. Use a mix of uppercase, lowercase, numbers, and symbols for better security.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Step 4: Complete Your Profile</h4>
                  <p className="text-sm text-gray-600">
                    Upload a valid government-issued ID (Voters ID.) and a clear selfie photo. Files must be in PNG, JPG, or GIF format and not exceed 5MB.
                  </p>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-orange-800">
                  <strong>Note:</strong> Once registered, you can access all online services including permit
                  applications, document requests, and more.
                </p>
              </div>
            </div>
          ),
        },
       
      ],
    },
    {
      category: "Government Services",
      items: [
        {
          title: "Business Permit Application",
          content: "Step-by-step guide to apply for a business permit in Perpetual Village City.",
          fullContent: (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Applying for a business permit in Perpetual Village City is now easier with our online application system.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>DTI Registration (for sole proprietorship) or SEC Registration (for corporation)</li>
                    <li>Barangay Business Clearance</li>
                    <li>Community Tax Certificate (Cedula)</li>
                    <li>Fire Safety Inspection Certificate</li>
                    <li>Sanitary Permit (for food establishments)</li>
                    <li>Contract of Lease or Proof of Ownership</li>
                    <li>Valid ID of the business owner</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Application Process</h4>
                  <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                    <li>Complete the online application form</li>
                    <li>Upload required documents</li>
                    <li>Pay the application fee</li>
                    <li>Wait for assessment (3-5 business days)</li>
                    <li>Receive notification for permit release</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Processing Time</h4>
                  <p className="text-sm text-gray-600">
                    New applications: 5-7 business days
                    <br />
                    Renewal applications: 3-5 business days
                  </p>
                </div>
              </div>
              <Link href="/dashboard/member/services/business-permit">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 mt-4">Apply for Business Permit</Button>
              </Link>
            </div>
          ),
        },
        {
          title: "Building Permit Process",
          content: "Requirements and procedures for obtaining a building permit.",
          fullContent: (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                A building permit is required for any construction, renovation, or structural modification in Perpetual Village
                City.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Required Documents</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Building Plans (signed and sealed by a licensed architect/engineer)</li>
                    <li>Land Title or Tax Declaration</li>
                    <li>Barangay Clearance</li>
                    <li>Locational Clearance</li>
                    <li>Structural Analysis (for buildings over 2 stories)</li>
                    <li>Fire Safety Evaluation Clearance</li>
                    <li>Environmental Compliance Certificate (if applicable)</li>
                    <li>Valid ID of property owner</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Types of Building Permits</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>
                      <strong>New Construction:</strong> For building new structures
                    </li>
                    <li>
                      <strong>Renovation:</strong> For major repairs or modifications
                    </li>
                    <li>
                      <strong>Addition:</strong> For expanding existing structures
                    </li>
                    <li>
                      <strong>Repair:</strong> For minor structural repairs
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Processing Timeline</h4>
                  <p className="text-sm text-gray-600">
                    Simple structures (1-2 floors): 7-10 business days
                    <br />
                    Complex structures (3+ floors): 15-20 business days
                  </p>
                </div>
              </div>
              <Link href="/services/building-permit">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 mt-4">Apply for Building Permit</Button>
              </Link>
            </div>
          ),
        },
        {
          title: "Community Tax Certificate",
          content: "How to get your Cedula (Community Tax Certificate).",
          fullContent: (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                The Community Tax Certificate (Cedula) is a basic tax document required for various transactions in the
                Philippines.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Who Needs a Cedula?</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>All Filipino members 18 years old and above</li>
                    <li>Individuals engaging in business or profession</li>
                    <li>Anyone requiring it for government transactions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Valid government-issued ID</li>
                    <li>Proof of income (for employed individuals)</li>
                    <li>Proof of business registration (for business owners)</li>
                    <li>Proof of residency in Perpetual Village City</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tax Rates</h4>
                  <p className="text-sm text-gray-600">
                    Basic Community Tax: ₱5.00
                    <br />
                    Additional tax based on income/property value
                    <br />
                    Maximum amount: ₱5,000.00
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Validity</h4>
                  <p className="text-sm text-gray-600">
                    Valid for one calendar year (January 1 to December 31)
                    <br />
                    Must be renewed annually
                  </p>
                </div>
              </div>
              <Link href="/services/cedula">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 mt-4">Apply for Cedula</Button>
              </Link>
            </div>
          ),
        },
      ],
    },
    {
      category: "Emergency Procedures",
      items: [
        {
          title: "Emergency Hotlines",
          content: "Important contact numbers for police, fire, medical emergencies.",
          fullContent: (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Keep these emergency numbers handy. In case of emergency, stay calm and provide clear information about
                your location and situation.
              </p>
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">National Emergency Hotline</h4>
                  <p className="text-2xl font-bold text-red-600">911</p>
                  <p className="text-sm text-red-700 mt-1">For all types of emergencies</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Perpetual Village City Police Station</h4>
                  <p className="text-lg font-semibold text-gray-700">(043) 288-2222</p>
                  <p className="text-sm text-gray-600">Available 24/7</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Perpetual Village Fire Station</h4>
                  <p className="text-lg font-semibold text-gray-700">(043) 288-3333</p>
                  <p className="text-sm text-gray-600">Fire emergencies and rescue operations</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Perpetual Village City Hospital</h4>
                  <p className="text-lg font-semibold text-gray-700">(043) 288-4444</p>
                  <p className="text-sm text-gray-600">Medical emergencies and ambulance services</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Disaster Risk Reduction Office</h4>
                  <p className="text-lg font-semibold text-gray-700">(043) 288-5555</p>
                  <p className="text-sm text-gray-600">Natural disasters and evacuation assistance</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Red Cross Perpetual Village</h4>
                  <p className="text-lg font-semibold text-gray-700">(043) 288-6666</p>
                  <p className="text-sm text-gray-600">Emergency medical services and blood bank</p>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-orange-800">
                  <strong>Tip:</strong> Save these numbers in your phone contacts for quick access during emergencies.
                </p>
              </div>
            </div>
          ),
        },
        {
          title: "Disaster Preparedness",
          content: "What to do before, during, and after natural disasters.",
          fullContent: (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Perpetual Village City is prone to typhoons, floods, and earthquakes. Being prepared can save lives.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Before a Disaster</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Prepare an emergency kit (food, water, first aid, flashlight, radio, batteries)</li>
                    <li>Know your evacuation routes and nearest evacuation center</li>
                    <li>Keep important documents in waterproof containers</li>
                    <li>Charge all electronic devices and power banks</li>
                    <li>Store enough food and water for at least 3 days</li>
                    <li>Secure loose objects that could become projectiles</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">During a Typhoon/Flood</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Stay indoors and away from windows</li>
                    <li>Monitor weather updates via radio or mobile phone</li>
                    <li>Evacuate immediately if ordered by authorities</li>
                    <li>Never walk or drive through flooded areas</li>
                    <li>Turn off electricity and gas if flooding is imminent</li>
                    <li>Move to higher ground if water starts rising</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">During an Earthquake</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>DROP, COVER, and HOLD ON</li>
                    <li>Stay away from windows, mirrors, and heavy objects</li>
                    <li>If outdoors, move to an open area away from buildings</li>
                    <li>If in a vehicle, stop safely and stay inside</li>
                    <li>Do not use elevators</li>
                    <li>Be prepared for aftershocks</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">After a Disaster</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Check yourself and others for injuries</li>
                    <li>Inspect your home for damage before entering</li>
                    <li>Avoid damaged buildings and power lines</li>
                    <li>Boil water before drinking if water supply is compromised</li>
                    <li>Document damage for insurance claims</li>
                    <li>Follow instructions from local authorities</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Evacuation Centers in Perpetual Village</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Perpetual Village City Sports Complex</li>
                    <li>Perpetual Village National High School</li>
                    <li>Various Barangay Halls (check with your barangay)</li>
                  </ul>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
  ]

  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({})

  const toggleExpanded = (key: string) => {
    setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

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
          <h1 className="text-xl font-bold text-gray-900">Member Guide</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 pb-24 overflow-y-auto">
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <h2 className="font-semibold text-gray-900 mb-2">Welcome to Perpetual Village City!</h2>
            <p className="text-sm text-gray-700">
              This guide will help you navigate city services, understand procedures, and access important information.
            </p>
          </CardContent>
        </Card>

        {guides.map((guide, idx) => (
          <div key={idx} className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{guide.category}</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {guide.items.map((item, itemIdx) => {
                const itemKey = `item-${idx}-${itemIdx}`
                const isExpanded = expandedItems[itemKey]
                return (
                  <AccordionItem key={itemIdx} value={itemKey} className="border rounded-lg bg-white">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <span className="font-medium text-gray-900">{item.title}</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      {!isExpanded ? (
                        <>
                          <p className="text-sm text-gray-600">{item.content}</p>
                          <Button
                            variant="link"
                            className="text-orange-600 px-0 mt-2"
                            onClick={() => toggleExpanded(itemKey)}
                          >
                            Read more <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </>
                      ) : (
                        <>
                          {item.fullContent}
                          <Button
                            variant="link"
                            className="text-orange-600 px-0 mt-2"
                            onClick={() => toggleExpanded(itemKey)}
                          >
                            Show less
                          </Button>
                        </>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </div>
        ))}
      </main>

     
    </div>
       </MemberLayout>
  )
}
