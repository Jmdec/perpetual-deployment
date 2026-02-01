"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { motion } from "framer-motion"

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h1 className="text-4xl font-bold bg-linear-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-4">
              Privacy Policy
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
              <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
              <p className="text-foreground/70">
                Perpetual Village City Government ("we" or "us" or "our") operates the website. This page informs you of our
                policies regarding the collection, use, and disclosure of personal data when you use our service and the
                choices you have associated with that data.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">2. Information Collection</h2>
              <p className="text-foreground/70">
                We collect several different types of information for various purposes to provide and improve our
                service to you.
              </p>
              <ul className="list-disc list-inside text-foreground/70 space-y-2 pl-4">
                <li>Personal Data: Name, email address, phone number, and other identifying information</li>
                <li>
                  Usage Data: Information about how you use our website, including IP address, browser type, pages
                  visited
                </li>
                <li>Cookies: Small data files stored on your device to enhance user experience</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">3. Use of Data</h2>
              <p className="text-foreground/70">
                Perpetual Village City Government uses the collected data for various purposes:
              </p>
              <ul className="list-disc list-inside text-foreground/70 space-y-2 pl-4">
                <li>To provide and maintain our service</li>
                <li>To notify you about changes to our service</li>
                <li>To allow you to participate in interactive features of our service</li>
                <li>To provide customer care and support</li>
                <li>To gather analysis or valuable information to improve our service</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">4. Security of Data</h2>
              <p className="text-foreground/70">
                The security of your data is important to us, but remember that no method of transmission over the
                Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable
                means to protect your personal data, we cannot guarantee its absolute security.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">5. Changes to This Privacy Policy</h2>
              <p className="text-foreground/70">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
                Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
              </p>
            </section>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
