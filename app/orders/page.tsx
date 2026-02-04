"use client"

import PageLayout from "@/components/page-layout"
import OrdersSection from "@/components/admin/merchandize/orders-section"

export default function ServicesPage() {
  return (
    <PageLayout
      title="My Orders"
      subtitle="Collection of your purchased products"
      image="/government-services-city-utilities.jpg"
    >
         <OrdersSection />

    </PageLayout>
  )
}
