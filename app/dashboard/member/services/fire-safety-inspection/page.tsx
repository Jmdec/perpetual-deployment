import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, MapPin, FileText, Clock, AlertCircle, CheckCircle2, Building2 } from "lucide-react"
import MemberLayout from "@/components/memberLayout";
export default function FireSafetyGuide() {
  return (
    <MemberLayout>
    <div className="min-h-screen bg-linear-to-br from-orange-50 to-red-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mb-4">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Fire Safety Inspection Guide</h1>
          <p className="text-gray-600">Learn how to get your Fire Safety Inspection Certificate (FSIC) in Perpetual Village City</p>
        </div>

        <Card className="mb-6 border-l-4 border-l-orange-600">
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-1" />
              <div>
                <CardTitle className="text-lg">Important Notice</CardTitle>
                <CardDescription>
                  Fire Safety Inspection Certificate (FSIC) is processed directly by the Bureau of Fire Protection (BFP). The City Government of Perpetual Village does not issue FSIC. Please visit the BFP Perpetual Village City Fire Station.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-600" />
                What is FSIC?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Fire Safety Inspection Certificate is a mandatory requirement for:
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  "Business permit renewal",
                  "New business establishments",
                  "Building occupancy permits",
                  "Event permits for large gatherings",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Processing Time & Validity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-1">Processing Time</h4>
                <p className="text-sm text-gray-600">3-5 working days after inspection</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Validity Period</h4>
                <p className="text-sm text-gray-600">1 year from date of issuance</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Inspection Duration</h4>
                <p className="text-sm text-gray-600">30 minutes to 2 hours (depends on establishment size)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h4 className="font-semibold mb-2">Documentary Requirements:</h4>
              <ul className="space-y-2">
                {[
                  "Application form (available at BFP office)",
                  "Occupancy Permit or Certificate of Occupancy",
                  "Building Plan approved by the City Engineer's Office",
                  "Fire Safety Evaluation Clearance (for new buildings)",
                  "Business Permit (for renewal applicants)",
                  "Location Plan/Vicinity Map",
                  "Proof of ownership (Title, Tax Declaration) or Lease Contract",
                  "Electrical Plan (if applicable)",
                  "Mechanical/Plumbing Plan (if applicable)",
                ].map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> All documents should be photocopied. Bring original copies for verification.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-600" />
              Fire Safety Equipment Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Your establishment must have the following fire safety equipment (depending on building type and size):
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-sm">
                {[
                  "Fire Extinguishers (proper type and quantity)",
                  "Fire Alarm System",
                  "Emergency Lights",
                  "Exit Signs (illuminated)",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <ul className="space-y-2 text-sm">
                {[
                  "Fire Exit (properly marked and accessible)",
                  "Sprinkler System (for large buildings)",
                  "Fire Hose and Hose Reel",
                  "Smoke Detectors",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-600" />
              Where to Apply
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Bureau of Fire Protection - Perpetual Village City
              </h4>
              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <strong>Office:</strong> BFP Perpetual Village City Fire Station
                </p>
                <p>
                  <strong>Address:</strong> Perpetual Village City, Oriental Mindoro
                </p>
                <p>
                  <strong>Office Hours:</strong> Monday to Friday, 8:00 AM - 5:00 PM
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Note: Contact the BFP Perpetual Village office for exact location and to schedule your inspection
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Step-by-Step Process</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {[
                {
                  title: "Prepare Requirements",
                  desc: "Gather all necessary documents and ensure fire safety equipment is installed",
                },
                {
                  title: "Visit BFP Perpetual Village",
                  desc: "Go to BFP Perpetual Village Fire Station and submit application form with requirements",
                },
                {
                  title: "Pay Inspection Fee",
                  desc: "Pay the required fee (amount varies by establishment type and size)",
                },
                {
                  title: "Schedule Inspection",
                  desc: "BFP will schedule a date and time for the actual fire safety inspection",
                },
                {
                  title: "Actual Inspection",
                  desc: "BFP inspector will visit your establishment to check compliance with fire safety standards",
                },
                {
                  title: "Compliance Check",
                  desc: "If deficiencies are found, you must address them and request re-inspection",
                },
                {
                  title: "Issuance of FSIC",
                  desc: "Once compliant, FSIC will be issued within 3-5 working days",
                },
                {
                  title: "Claim Certificate",
                  desc: "Return to BFP office to claim your Fire Safety Inspection Certificate",
                },
              ].map((step, index) => (
                <li key={index} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="text-gray-600">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Inspection fees vary depending on establishment type, floor area, and building occupancy classification:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <p>
                <strong>Small Establishments:</strong> ₱500 - ₱1,500
              </p>
              <p>
                <strong>Medium Establishments:</strong> ₱1,500 - ₱5,000
              </p>
              <p>
                <strong>Large Establishments:</strong> ₱5,000 and above
              </p>
              <p className="text-xs text-gray-600 mt-3">
                Note: Exact fees should be confirmed with BFP Perpetual Village office as rates may vary
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-1">Important Reminders:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Apply at least 2 weeks before your business permit renewal deadline</li>
                <li>Ensure all fire safety equipment is working and accessible during inspection</li>
                <li>Keep fire exits clear and properly marked</li>
                <li>Have a designated employee present during the inspection</li>
                <li>FSIC must be renewed annually</li>
                <li>Display your FSIC prominently in your establishment</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    </MemberLayout>
  )
}