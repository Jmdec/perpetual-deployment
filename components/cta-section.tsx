"use client"

import Link from "next/link"

export default function CTASection() {
  return (
    <section className="py-20 bg-linear-to-br from-[#800000] to-yellow-700 text-white text-center">
        <h2 className="text-3xl lg:text-5xl font-bold mb-6 px-5">
          Start Your Journey at Perpetual College
        </h2>
        <p className="text-lg mb-10 max-w-2xl mx-auto">
          Excellence, innovation, and holistic education await you.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <button className="px-10 py-4 bg-white text-red-700 font-bold rounded-full">
              Apply Now
            </button>
          </Link>
          <Link href="/contact">
            <button className="px-10 py-4 border-2 border-white rounded-full">
              Inquire Now
            </button>
          </Link>
        </div>
      </section>
  )
}
