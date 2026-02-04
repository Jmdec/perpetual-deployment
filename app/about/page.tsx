"use client"

import PageLayout from "@/components/page-layout"
import AboutSection from "@/components/about-section"
import CTASection from "@/components/cta-section"

export default function AboutPage() {
  return (
    <PageLayout
      title="About Perpetual Help College"
      subtitle="Explore our school's story and the mission behind what we do"
      image="/our-team2.jpg"
    >
      <AboutSection />
      <CTASection />
    </PageLayout>
  )
}
