"use client"
import PageLayout from "@/components/page-layout"
import AnnouncementsSection from "@/components/announcements-section"
import CTASection from "@/components/cta-section"

export default function AnnouncementsPage() {
  return (
    <PageLayout
      title="Announcements"
      subtitle="Stay updated with the latest news from Perpetual Help College"
      image="/using-announcements.jpg"
    >
      <AnnouncementsSection />
      <CTASection />
    </PageLayout>
  )
}