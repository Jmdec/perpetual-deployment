"use client"

import PageLayout from "@/components/page-layout"
import ServicesSection from "@/components/services-section"

export default function ServicesPage() {
  return (
    <PageLayout
      title="Community Services"
      subtitle="Explore all the services we offer to our members"
      image="/government-services-city-utilities.jpg"
    >
      <ServicesSection />
    </PageLayout>
  )
}
