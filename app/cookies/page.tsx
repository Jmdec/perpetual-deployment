"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { motion } from "framer-motion"

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h1 className="text-4xl font-bold bg-linear-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-4">
              Cookie Policy
            </h1>
            <p className="text-foreground/60">Last updated: November 2024</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="prose prose-lg max-w-none space-y-6"
          >
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">1. What Are Cookies?</h2>
              <p className="text-foreground/70">
                Cookies are small pieces of text stored on your device when you visit websites. They help websites
                remember your preferences and provide a better user experience. Cookies can be either session cookies
                (deleted when you close your browser) or persistent cookies (remain on your device).
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">2. Types of Cookies We Use</h2>
              <p className="text-foreground/70">Our website uses the following types of cookies:</p>
              <ul className="list-disc list-inside text-foreground/70 space-y-2 pl-4">
                <li>Essential Cookies: Required for basic website functionality</li>
                <li>Analytical Cookies: Help us understand how you use our website</li>
                <li>Preference Cookies: Remember your preferences and choices</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">3. Managing Your Cookies</h2>
              <p className="text-foreground/70">
                You can control and manage cookies in your browser settings. Most browsers allow you to refuse cookies
                or alert you when cookies are being sent. Please note that blocking some cookies may impact the
                functionality of our website.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">4. Third-Party Cookies</h2>
              <p className="text-foreground/70">
                In addition to our own cookies, we may allow third parties to place cookies on your device for analytics
                and advertising purposes. We encourage you to review their privacy policies to understand their cookie
                practices.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">5. Contact Us</h2>
              <p className="text-foreground/70">
                If you have questions about our cookie policy, please contact us at info@Perpetual Village.gov.ph or call +63
                (123) 456-7890.
              </p>
            </section>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
