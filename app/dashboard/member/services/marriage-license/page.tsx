"use client"

import { useState } from "react"
import { ArrowLeft, Heart, FileText, CheckCircle2, MapPin, Clock, AlertCircle, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const steps = [
  { 
    id: 1, 
    name: "Requirements", 
    icon: FileText,
    description: "Documents needed for application"
  },
  { 
    id: 2, 
    name: "Application Process", 
    icon: Heart,
    description: "Step-by-step application guide"
  },
  { 
    id: 3, 
    name: "Important Information", 
    icon: AlertCircle,
    description: "Fees, validity, and notes"
  },
]

export default function MarriageLicenseGuidePage() {
  const [currentStep, setCurrentStep] = useState(1)

  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Marriage License Guide</h1>
            <p className="text-sm text-muted-foreground">
              How to get a marriage license in the Philippines
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep >= step.id ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > step.id ? <CheckCircle2 className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                  </div>
                  <span className="text-xs mt-2 text-center hidden sm:block">{step.name}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 ${currentStep > step.id ? "bg-orange-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].name}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Required Documents (for both parties)</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium mb-2">1. Certified True Copy of Birth Certificate (PSA)</h4>
                      <p className="text-sm text-gray-600">Original copy issued by the Philippine Statistics Authority</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium mb-2">2. Valid Government-Issued ID</h4>
                      <p className="text-sm text-gray-600">Examples: Passport, Driver's License, UMID, Postal ID, Voter's ID</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium mb-2">3. Certificate of No Marriage (CENOMAR)</h4>
                      <p className="text-sm text-gray-600">Also from PSA, proves you are single or not currently married</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium mb-2">4. Barangay Certificate of Residency</h4>
                      <p className="text-sm text-gray-600">Proof of residence for at least one month in the city/municipality</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium mb-2">5. Passport-sized Photos</h4>
                      <p className="text-sm text-gray-600">2 copies each (4 total) - recent colored photos with white background</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Additional Requirements (if applicable)</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium mb-2">For Widows/Widowers:</h4>
                      <p className="text-sm text-gray-600">Death Certificate of deceased spouse</p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium mb-2">For Divorced/Annulled:</h4>
                      <p className="text-sm text-gray-600">Court decree of divorce or annulment</p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium mb-2">For Minors (18-21 years old):</h4>
                      <p className="text-sm text-gray-600">Parental consent and parental advice certificate</p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium mb-2">For Foreign Nationals:</h4>
                      <p className="text-sm text-gray-600">Passport, Certificate of Legal Capacity to Contract Marriage from embassy</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex gap-2">
                    <MapPin className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-900">Where to Apply</h4>
                      <p className="text-sm text-orange-800 mt-1">
                        Local Civil Registrar's Office of the city or municipality where either party has resided for at least one month
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Step-by-Step Process</h3>
                  
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                        1
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Prepare all required documents</h4>
                        <p className="text-sm text-gray-600 mt-1">Gather all documents listed in the requirements section. Make sure all are original copies.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                        2
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Visit the Local Civil Registrar's Office</h4>
                        <p className="text-sm text-gray-600 mt-1">Both parties must appear together. Go to the office during business hours (usually 8am-5pm, Monday-Friday).</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                        3
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Fill out the Marriage License Application Form</h4>
                        <p className="text-sm text-gray-600 mt-1">Staff will provide the form. Fill it out completely and accurately.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                        4
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Submit documents and pay the fee</h4>
                        <p className="text-sm text-gray-600 mt-1">Submit all required documents along with the application fee.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                        5
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Attend the marriage counseling seminar</h4>
                        <p className="text-sm text-gray-600 mt-1">Required by law. Usually conducted by the Local Civil Registrar or authorized personnel.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                        6
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Marriage license posting</h4>
                        <p className="text-sm text-gray-600 mt-1">Your application will be posted publicly for 10 consecutive days to allow objections.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                        7
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Claim your marriage license</h4>
                        <p className="text-sm text-gray-600 mt-1">After the 10-day posting period, you can claim your marriage license.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex gap-2">
                      <DollarSign className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900">Application Fee</h4>
                        <p className="text-sm text-green-800 mt-1">
                          Fees vary by city/municipality, typically ranging from ₱200 to ₱500. Check with your local Civil Registrar's Office for exact amount.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-2">
                      <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Processing Time</h4>
                        <p className="text-sm text-blue-800 mt-1">
                          Minimum of 10 days due to the posting requirement. Total processing may take 2-3 weeks.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex gap-2">
                      <AlertCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-purple-900">Validity Period</h4>
                        <p className="text-sm text-purple-800 mt-1">
                          Marriage license is valid for 120 days from date of issuance. You must get married within this period.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Important Reminders</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm">
                        ✓ Both parties must be <strong>at least 18 years old</strong>. Those aged 18-21 need parental consent.
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm">
                        ✓ Both parties must <strong>appear in person together</strong> when applying.
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm">
                        ✓ The marriage ceremony can be held <strong>anywhere in the Philippines</strong> once you have the license.
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm">
                        ✓ You must have <strong>two witnesses</strong> (of legal age) present during the marriage ceremony.
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm">
                        ✓ After the ceremony, your solemnizing officer will register the marriage with the Local Civil Registrar.
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm">
                        ✓ You can request a <strong>Marriage Certificate</strong> from PSA after registration (usually available after a few months).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Grounds for Denial</h4>
                  <p className="text-sm text-red-800">
                    Your application may be denied if either party is already married, below legal age without consent, or if there are valid legal impediments to marriage.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
              )}
              {currentStep < steps.length ? (
                <Button onClick={handleNext} className="flex-1 bg-orange-500 hover:bg-orange-600">
                  Next
                </Button>
              ) : (
                <Button onClick={() => setCurrentStep(1)} className="flex-1 bg-orange-500 hover:bg-orange-600">
                  Back to Start
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}