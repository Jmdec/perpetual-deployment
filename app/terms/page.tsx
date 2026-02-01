"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { motion } from "framer-motion"

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h1 className="text-4xl font-bold bg-linear-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-4">
              Terms of Service
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
              <h2 className="text-2xl font-bold text-foreground">1. Agreement to Terms</h2>
              <p className="text-foreground/70">
                By accessing and using the Perpetual Village City Government System website, you accept and agree to be bound by
                the terms and provision of this agreement. If you do not agree to abide by the above, please do not use
                this service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">2. Use License</h2>
              <p className="text-foreground/70">
                Permission is granted to temporarily download one copy of the materials (information or software) on
                Perpetual Village City Government System for personal, non-commercial transitory viewing only. This is the grant
                of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-foreground/70 space-y-2 pl-4">
                <li>Modifying or copying the materials</li>
                <li>Using the materials for any commercial purpose or for any public display</li>
                <li>Attempting to decompile or reverse engineer any software contained on the website</li>
                <li>Transferring the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">3. Disclaimer</h2>
              <p className="text-foreground/70">
                The materials on Perpetual Village City Government System are provided on an 'as is' basis. Perpetual Village City
                Government makes no warranties, expressed or implied, and hereby disclaims and negates all other
                warranties including, without limitation, implied warranties or conditions of merchantability, fitness
                for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">4. Limitations</h2>
              <p className="text-foreground/70">
                In no event shall Perpetual Village City Government or its suppliers be liable for any damages (including, without
                limitation, damages for loss of data or profit, or due to business interruption) arising out of the use
                or inability to use the materials on Perpetual Village City Government's website.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">5. Accuracy of Materials</h2>
              <p className="text-foreground/70">
                The materials appearing on Perpetual Village City Government's website could include technical, typographical, or
                photographic errors. Perpetual Village City Government does not warrant that any of the materials on its website
                are accurate, complete, or current.
              </p>
            </section>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
