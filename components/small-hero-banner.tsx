
"use client"

import { motion } from "framer-motion"

interface SmallHeroBannerProps {
  title: string
  subtitle?: string
}

export default function SmallHeroBanner({ title, subtitle }: SmallHeroBannerProps) {
  return (
    <div className="w-full h-48 bg-linear-to-r from-emerald-400 via-orange-400 to-orange-500 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg text-balance"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-white/90 mt-2 drop-shadow-md text-balance"
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}
