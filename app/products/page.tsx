"use client"

import CTASection from "@/components/cta-section"
import PageLayout from "@/components/page-layout"
import MerchandiseSection from "@/components/admin/merchandize/merchandize-section"
import VerifyUserForm from "@/components/verification-form"

export default function ServicesPage() {
  return (
    <PageLayout
      title="Our Merchandize"
      subtitle="Proud collaborations with institutions and organizations supporting
                community growth and development"
      image="/government-services-city-utilities.jpg"
    >
         <MerchandiseSection />

    </PageLayout>
  )
}
