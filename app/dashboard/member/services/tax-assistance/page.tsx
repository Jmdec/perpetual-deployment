"use client"

import { useState } from "react"
import { ChevronRight, Calculator, HelpCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import MemberLayout from "@/components/memberLayout"

export default function TaxAssistanceGuide() {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  const toggleExpanded = (key: string) => {
    setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const taxGuides = [
    {
      category: "Tax Assistance",
      items: [
        {
          title: "Business Tax Consultation",
          content: "Get expert guidance on business tax obligations, rates, and compliance requirements in the Philippines.",
          fullContent: (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Understanding your business tax obligations is crucial for compliance and avoiding penalties. Our tax consultation services help you navigate Philippine tax laws.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Types of Business Taxes in the Philippines</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li><strong>Income Tax:</strong> Corporate income tax (25% for large corporations, 20% for MSMEs)</li>
                    <li><strong>Value-Added Tax (VAT):</strong> 12% on sale of goods and services</li>
                    <li><strong>Percentage Tax:</strong> For VAT-exempt businesses (1-3% of gross sales)</li>
                    <li><strong>Local Business Tax:</strong> City or municipal tax based on gross sales/receipts</li>
                    <li><strong>Withholding Tax:</strong> Tax withheld on payments to suppliers and employees</li>
                    <li><strong>Documentary Stamp Tax:</strong> On certain documents and transactions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Who Should Get a Tax Consultation?</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>New business owners unsure about tax obligations</li>
                    <li>Businesses planning to expand or change business structure</li>
                    <li>Companies with complex transactions or multiple revenue streams</li>
                    <li>Businesses facing tax audits or compliance issues</li>
                    <li>Entrepreneurs seeking tax optimization strategies</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">What to Prepare for Your Consultation</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Business registration documents (DTI/SEC)</li>
                    <li>BIR registration certificate (Form 2303)</li>
                    <li>Financial statements (Income Statement, Balance Sheet)</li>
                    <li>Recent tax returns (if applicable)</li>
                    <li>Books of accounts or accounting records</li>
                    <li>List of specific tax questions or concerns</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Consultation Services Offered</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Tax registration assistance (BIR, City permits)</li>
                    <li>Tax compliance review and planning</li>
                    <li>Guidance on proper bookkeeping and documentation</li>
                    <li>Tax return preparation and filing assistance</li>
                    <li>VAT vs Percentage Tax assessment</li>
                    <li>Tax incentive evaluation (for eligible businesses)</li>
                    <li>Assistance with tax audit responses</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Schedule & Fees</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Walk-in Consultations:</strong> Monday to Friday, 8:00 AM - 5:00 PM<br />
                    <strong>Appointment Booking:</strong> Available online or by phone<br />
                    <strong>Initial Consultation:</strong> Free (30 minutes)<br />
                    <strong>Extended Consultation:</strong> ₱500/hour<br />
                    <strong>Tax Filing Assistance:</strong> Varies by business size and complexity
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Important Tax Deadlines</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Monthly:</strong> 15th of the following month (VAT, Withholding Tax)<br />
                      <strong>Quarterly:</strong> Within 60 days after quarter end (Income Tax)<br />
                      <strong>Annual:</strong> April 15 (Income Tax Return)<br />
                      <strong>Business Tax Renewal:</strong> January 20 (Local Business Tax)
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-orange-800">
                  <strong>Note:</strong> Tax laws and rates are subject to change. Always verify current regulations with the Bureau of Internal Revenue (BIR) or consult with a certified tax professional.
                </p>
              </div>
             
            </div>
          ),
        },
        {
          title: "Real Property Tax",
          content: "Learn about property tax assessment, payment procedures, and available discounts in Perpetual Village City.",
          fullContent: (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Real Property Tax (RPT) is an annual tax on property ownership. Timely payment helps fund local government services and infrastructure.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">What is Real Property Tax?</h4>
                  <p className="text-sm text-gray-600">
                    RPT is a local tax imposed on real property (land, buildings, machinery) based on its assessed value. The tax rate in Perpetual Village City is determined by local ordinance.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Who Must Pay?</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Property owners (individuals or corporations)</li>
                    <li>Property administrators or beneficial users (if owner is exempt)</li>
                    <li>Both residential and commercial property owners</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tax Rates in Perpetual Village City</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Basic Real Property Tax: 1-2% of assessed value</li>
                    <li>Special Education Fund (SEF): 1% additional</li>
                    <li>Idle Land Tax: May apply to undeveloped properties</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Payment Schedule & Discounts</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <strong>Early Payment Discounts:</strong><br />
                      • Pay in January: 20% discount<br />
                      • Pay in February: 15% discount<br />
                      • Pay in March: 10% discount<br />
                      • Pay after March: Full amount + penalties for late payment
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">How to Pay</h4>
                  <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                    <li>Get your Tax Declaration Number</li>
                    <li>Visit the City Treasurer's Office or authorized payment centers</li>
                    <li>Present your previous tax receipt or Tax Declaration</li>
                    <li>Pay the assessed amount</li>
                    <li>Receive your Official Receipt</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Required Documents</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Tax Declaration of the property</li>
                    <li>Previous year's Official Receipt (if available)</li>
                    <li>Valid government-issued ID</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Property Tax Exemptions</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Government properties used for public purposes</li>
                    <li>Religious and charitable institutions (limited)</li>
                    <li>Senior members (for one residential property up to ₱10M value)</li>
                    <li>Properties with assessed value below ₱175,000 (certain conditions)</li>
                  </ul>
                </div>
              </div>
              
            </div>
          ),
        },
        {
          title: "Tax Delinquency & Payment Plans",
          content: "Options for settling unpaid taxes and avoiding property foreclosure.",
          fullContent: (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                If you have unpaid property taxes, it's important to settle them promptly to avoid penalties and potential legal action.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Consequences of Tax Delinquency</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>2% interest per month on unpaid balance</li>
                    <li>Cannot process property transactions (sale, transfer, mortgage)</li>
                    <li>Cannot obtain certain business permits and clearances</li>
                    <li>Property may be subject to public auction after 3+ years</li>
                    <li>Legal proceedings for collection</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Payment Plan Options</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Perpetual Village City offers installment plans for taxpayers with delinquent accounts:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li><strong>Quarterly Installment:</strong> Pay in 4 equal installments throughout the year</li>
                    <li><strong>Extended Plan:</strong> For large balances, negotiate payment terms</li>
                    <li><strong>Amnesty Programs:</strong> Watch for tax amnesty periods with reduced penalties</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">How to Apply for Payment Plan</h4>
                  <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                    <li>Visit the City Treasurer's Office</li>
                    <li>Request a Statement of Account for your property</li>
                    <li>Submit a letter requesting installment payment</li>
                    <li>Provide proof of financial capacity or hardship</li>
                    <li>Wait for approval (typically 5-7 business days)</li>
                    <li>Sign payment agreement and make initial payment</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Required Documents</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Valid government-issued ID</li>
                    <li>Tax Declaration of property</li>
                    <li>Proof of ownership (title, deed of sale)</li>
                    <li>Letter of request for payment plan</li>
                    <li>Proof of income or financial capacity</li>
                  </ul>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">
                    <strong>Important:</strong> Don't wait until your property is scheduled for auction. Contact the City Treasurer's Office immediately if you're unable to pay your property taxes in full.
                  </p>
                </div>
              </div>
            
            </div>
          ),
        },
        {
          title: "Business Tax Incentives",
          content: "Explore available tax incentives for businesses in Perpetual Village City.",
          fullContent: (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Perpetual Village City offers various tax incentives to encourage business development and job creation.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Types of Business Tax Incentives</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li><strong>New Business Registration:</strong> Reduced business tax for first year of operation</li>
                    <li><strong>Small Business Exemption:</strong> Reduced rates for businesses with gross sales below ₱500,000</li>
                    <li><strong>Job Creation Incentive:</strong> Tax reduction for businesses hiring local residents</li>
                    <li><strong>Green Business Incentive:</strong> Benefits for eco-friendly businesses</li>
                    <li><strong>Technology-Based Incentive:</strong> For IT and tech startups</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">National Tax Incentives (via PEZA, BOI)</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Income Tax Holiday (4-8 years for qualified projects)</li>
                    <li>Exemption from local and national taxes on imported equipment</li>
                    <li>Special 5% tax rate on gross income after ITH period</li>
                    <li>VAT exemption on local purchases</li>
                    <li>Simplified import/export procedures</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Eligibility Requirements</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Registered business in Perpetual Village City</li>
                    <li>Compliance with all local and national regulations</li>
                    <li>Updated tax payments and business permits</li>
                    <li>Meets specific criteria for the incentive program</li>
                    <li>Submits complete application with supporting documents</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">How to Apply</h4>
                  <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                    <li>Determine which incentive program your business qualifies for</li>
                    <li>Prepare required documents (business registration, financial statements, etc.)</li>
                    <li>Submit application to City Business Permits and Licensing Office</li>
                    <li>Attend evaluation meeting if required</li>
                    <li>Wait for approval (15-30 business days)</li>
                    <li>Comply with monitoring and reporting requirements</li>
                  </ol>
                </div>
              </div>
             
            </div>
          ),
        },
      ],
    },
  ]

  return (
    <MemberLayout>
      <div className="space-y-6 p-4">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Calculator className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Tax Assistance Services</h2>
                <p className="text-sm text-gray-700">
                  Get help with business taxes, property taxes, tax planning, and compliance. Our team is here to guide you through Philippine tax regulations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {taxGuides.map((guide, idx) => (
          <div key={idx}>
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

        <Card className="border-blue-200 bg-blue-50 mt-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Need More Help?</h3>
                <p className="text-sm text-gray-700 mb-3">
                  For complex tax matters or personalized assistance, schedule a consultation with our tax specialists.
                </p>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-700"><strong>Office Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM</p>
                  <p className="text-gray-700"><strong>Contact:</strong> (043) 288-7777 | tax@Perpetual Villagecity.gov.ph</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MemberLayout>
  )
}