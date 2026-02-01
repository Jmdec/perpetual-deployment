"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Upload, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
    fraternityNumber: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const loginLink = "/login";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("") // Clear error on input change
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, '')
    
    // Limit to 11 digits
    const limitedValue = digitsOnly.slice(0, 11)
    
    setFormData((prev) => ({ ...prev, phoneNumber: limitedValue }))
    
    // Real-time validation
    if (limitedValue.length === 0) {
      setPhoneError("")
    } else if (!limitedValue.startsWith('09')) {
      setPhoneError("Phone number must start with 09")
    } else if (limitedValue.length < 11) {
      setPhoneError(`Phone number must be 11 digits (${limitedValue.length}/11)`)
    } else {
      setPhoneError("")
    }
    
    setError("") // Clear general error
  }

  const handleRegister = async () => {
    // Phone validation
    if (!formData.phoneNumber.startsWith('09')) {
      setPhoneError("Phone number must start with 09")
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Phone number must start with 09",
        duration: 5000,
      })
      return
    }

    if (formData.phoneNumber.length !== 11) {
      setPhoneError("Phone number must be exactly 11 digits")
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Phone number must be exactly 11 digits",
        duration: 5000,
      })
      return
    }

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "The passwords you entered do not match. Please try again.",
        duration: 5000,
      })
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Your password must be at least 8 characters long for security.",
        duration: 5000,
      })
      return
    }

    setLoading(true)
    setError("")

    toast({
      title: "Creating Account...",
      description: "Please wait while we process your registration.",
      duration: 3000,
    })

    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("email", formData.email);
      fd.append("password", formData.password);
      fd.append("phone_number", formData.phoneNumber);
      fd.append("address", formData.address);
      fd.append("fraternity_number", formData.fraternityNumber);
      console.log("Submitting:", formData);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: fd,
      });

      const result = await response.json()

      if (!response.ok) {
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat().join(", ")
          setError(errorMessages)
          toast({
            variant: "destructive",
            title: "Registration Failed",
            description: errorMessages,
            duration: 6000,
          })
        } else {
          setError(result.message || "Registration failed")
          toast({
            variant: "destructive",
            title: "Registration Failed",
            description: result.message || "Unable to create your account. Please try again.",
            duration: 6000,
          })
        }
        return
      }

      toast({
        title: "Account Created Successfully! 🎉",
        description: "Your account has been created and is pending verification. You'll receive a notification once approved.",
        duration: 6000,
        className: "bg-green-50 border-green-200",
      })

      setTimeout(() => {
        router.push("/login")
      }, 1500)

    } catch (err) {
      console.error("Registration error:", err)
      const errorMessage = "An unexpected error occurred. Please check your connection and try again."
      setError(errorMessage)

      toast({
        variant: "destructive",
        title: "Connection Error",
        description: errorMessage,
        duration: 6000,
      })
    } finally {
      setLoading(false)
    }
  }

  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const fieldVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-orange-50 flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Home Navigation */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 shadow-sm transition-all hover:shadow-md"
        >
          ← Home
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-2xl shadow-xl p-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4">
              <Image 
                src="/perpetuallogo.jpg" 
                alt="Perpetual Village Logo" 
                width={80} 
                height={80}
                className="rounded-full object-cover"
              />
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Create Account</h1>
            <p className="text-gray-600 text-lg">Join Perpetual Village City System as a member</p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            >
              <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </motion.div>
          )}

          <div className="space-y-4">
            <motion.div
              variants={formVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* name */}
              <motion.div variants={fieldVariants}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                  placeholder="Juan Dela Cruz"
                  required
                />
              </motion.div>
              
              {/* email */}
              <motion.div variants={fieldVariants}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                  placeholder="juan@email.com"
                  required
                />
              </motion.div>

              {/* phone number */}
              <motion.div variants={fieldVariants}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handlePhoneChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    phoneError 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : formData.phoneNumber.length === 11 && formData.phoneNumber.startsWith('09')
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                      : 'border-orange-200 focus:border-orange-500 focus:ring-orange-200'
                  } focus:ring-2 transition`}
                  placeholder="09123456789"
                  required
                  inputMode="numeric"
                />
                {phoneError && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {phoneError}
                  </p>
                )}
                {!phoneError && formData.phoneNumber.length === 11 && formData.phoneNumber.startsWith('09') && (
                  <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Valid phone number
                  </p>
                )}
              </motion.div>

              <motion.div variants={fieldVariants}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fraternity Number *</label>
                <input
                  type="text"
                  name="fraternityNumber"
                  value={formData.fraternityNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                  placeholder="Fraternity Number"
                  required
                />
              </motion.div>

              <motion.div variants={fieldVariants}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </motion.div>

              <motion.div variants={fieldVariants}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </motion.div>

              <motion.div variants={fieldVariants} className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                  placeholder="123 Main Street, Barangay 1, Perpetual Village"
                  required
                />
              </motion.div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRegister}
              disabled={loading || !!phoneError}
              className="w-full px-6 py-4 rounded-lg bg-linear-to-br from-yellow-700/90 via-red-700/60 to-[#800000]/90 text-white font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Creating Account..." : "Create Account"}
              <ArrowRight size={18} />
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 pt-8 border-t border-orange-100 text-center"
          >
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href={loginLink} className="text-yellow-600 font-bold hover:text-yellow-500">
                Sign in here
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </main>
  )
}