import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, MapPin, FileText, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import MemberLayout from "@/components/memberLayout"
export default function PoliceClearanceGuide() {
  return (
    <MemberLayout>
    <div className="min-h-screen bg-linear-to-br from-orange-50 to-red-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Police Clearance Guide</h1>
          <p className="text-gray-600">Learn how to obtain your police clearance certificate in Perpetual Village City</p>
        </div>

        <Card className="mb-6 border-l-4 border-l-orange-600">
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-1" />
              <div>
                <CardTitle className="text-lg">Important Notice</CardTitle>
                <CardDescription>
                  Police clearance is processed directly by the Philippine National Police (PNP). The City Government of Perpetual Village does not issue police clearance certificates.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-600" />
                What is Police Clearance?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Police clearance is a document issued by the Philippine National Police (PNP) that certifies an individual has no criminal record.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Common uses:</strong>
              </p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Local employment</li>
                <li>• Business permit applications</li>
                <li>• Visa applications</li>
                <li>• Government transactions</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Processing Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-1">Processing Time</h4>
                <p className="text-sm text-gray-600">Same day to 3 working days</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Validity Period</h4>
                <p className="text-sm text-gray-600">6 months to 1 year (depending on purpose)</p>
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
            <div className="space-y-4">
              <ul className="space-y-2">
                {[
                  "Valid Government-issued ID (original and photocopy)",
                  "Barangay Clearance",
                  "Community Tax Certificate (Cedula)",
                  "2 pieces 2x2 ID photos (white background)",
                  "Clearance fee (usually ₱50-₱150)",
                ].map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> Requirements may vary. It is best to contact the police station beforehand to confirm the complete list of requirements and fees.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-600" />
              Where to Apply in Perpetual Village City
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Perpetual Village City Police Station
              </h4>
              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <strong>Address:</strong> Perpetual Village City Police Station, Oriental Mindoro
                </p>
                <p>
                  <strong>Alternative:</strong> Visit your nearest police station in your barangay
                </p>
                <p>
                  <strong>Office Hours:</strong> Monday to Friday, 8:00 AM - 5:00 PM
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Note: Contact your local police station for specific location, requirements, and current fees
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step-by-Step Process</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {[
                {
                  title: "Prepare Requirements",
                  desc: "Gather all necessary documents (valid ID, barangay clearance, cedula, photos)",
                },
                {
                  title: "Visit Police Station",
                  desc: "Go to Perpetual Village City Police Station or your barangay police station",
                },
                {
                  title: "Fill Out Application Form",
                  desc: "Complete the police clearance application form provided at the station",
                },
                {
                  title: "Submit Documents",
                  desc: "Submit your requirements to the officer in charge",
                },
                {
                  title: "Pay the Fee",
                  desc: "Pay the clearance fee (usually ₱50-₱150)",
                },
                {
                  title: "Photo and Fingerprints",
                  desc: "Have your photo taken and fingerprints recorded",
                },
                {
                  title: "Wait for Processing",
                  desc: "Processing takes same day to 3 working days depending on the station",
                },
                {
                  title: "Claim Your Clearance",
                  desc: "Return to the police station to claim your police clearance certificate",
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

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-1">Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Visit the police station early in the morning to avoid long queues</li>
                <li>Bring extra photocopies of your documents</li>
                <li>Wear decent clothing for your photo</li>
                <li>Contact the police station beforehand to confirm requirements and fees</li>
                <li>Police clearance validity varies by purpose - check with the requesting party</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    </MemberLayout>
  )
}