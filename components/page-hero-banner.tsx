"use client"

import { motion } from "framer-motion"

interface PageHeroBannerProps {
  title: string
  subtitle: string
  image: string
}

export default function PageHeroBanner({ title, subtitle, image }: PageHeroBannerProps) {
  return (
    <div className="relative w-full h-72 md:h-96 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${image}')`,
        }}
      />

      {/* Gradient Overlay - Red Orange Green - Darker for better readability */}
      {/* <div className="absolute inset-0 bg-linear-to-r from-red-800/90 via-orange-700/90 to-green-800/90" /> */}
        <div className="absolute inset-0 bg-linear-to-br from-yellow-800/90 via-[#800000]/90 to-[#800000]/90" />

      {/* Animated Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          {/* Decorative Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="w-24 h-1 bg-white rounded-full mx-auto mb-6"
          />

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 text-balance drop-shadow-lg">
            {title}
          </h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="w-32 h-1 bg-white/80 rounded-full mx-auto mb-6"
          />

          <p className="text-lg md:text-2xl text-white/95 max-w-3xl text-balance font-medium drop-shadow-md">
            {subtitle}
          </p>
        </motion.div>
      </div>

      {/* Bottom Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-16 md:h-24"
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 0L60 8.33333C120 16.6667 240 33.3333 360 41.6667C480 50 600 50 720 41.6667C840 33.3333 960 16.6667 1080 16.6667C1200 16.6667 1320 33.3333 1380 41.6667L1440 50V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V0Z"
            fill="#FCF2F0"
          />
        </svg>
      </div>
    </div>
  )
}