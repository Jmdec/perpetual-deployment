"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle } from "lucide-react"
import MemberLayout from "@/components/memberLayout"
import { authClient } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"

export default function BarangayBlotterPage() {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [userLoaded, setUserLoaded] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    age: "",
    gender: "",
    address: "",
    contactNumber: "",
    incidentType: "",
    incidentDate: "",
    incidentTime: "",
    incidentLocation: "",
    narrative: "",
    complaintAgainst: "",
    witness1Name: "",
    witness1Contact: "",
    witness2Name: "",
    witness2Contact: "",
  })

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await authClient.getCurrentUser()
        if (user) {
          setFormData((prev) => ({
            ...prev,
            fullName: user.name || "",
            email: user.email || "",
            address: user.address || "",
            contactNumber: user.phone_number || "",
            gender: user.sex || "",
          }))
          toast({
            title: "Welcome",
            description: "Your profile information has been auto-filled.",
          })
        }
      } catch (err) {
        console.error("Error loading user data:", err)
      } finally {
        setUserLoaded(true)
      }
    }

    loadUserData()
  }, [toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      e.preventDefault()
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      return !!(
        formData.fullName &&
        formData.email &&
        formData.age &&
        formData.gender &&
        formData.address &&
        formData.contactNumber
      )
    }
    if (step === 2) {
      return !!(
        formData.incidentType &&
        formData.incidentDate &&
        formData.incidentTime &&
        formData.incidentLocation &&
        formData.complaintAgainst &&
        formData.narrative
      )
    }
    return true
  }

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      toast({
        variant: "destructive",
        title: "Incomplete Information",
        description: "Please fill in all required fields before proceeding.",
      })
      return
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/barangay-blotter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit blotter")
      }

      setSuccess(true)
      toast({
        title: "Success",
        description: "Your blotter report has been submitted successfully.",
      })

      setTimeout(() => {
        setSuccess(false)
        setCurrentStep(1)
        setFormData({
          fullName: "",
          email: "",
          age: "",
          gender: "",
          address: "",
          contactNumber: "",
          incidentType: "",
          incidentDate: "",
          incidentTime: "",
          incidentLocation: "",
          narrative: "",
          complaintAgainst: "",
          witness1Name: "",
          witness1Contact: "",
          witness2Name: "",
          witness2Contact: "",
        })
      }, 3000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred"
      setError(errorMsg)
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      })
    } finally {
      setLoading(false)
    }
  }

  if (!userLoaded) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="text-white text-lg">Loading...</div>
        </div>
      </MemberLayout>
    )
  }

  return (
    <MemberLayout>
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Barangay Blotter</h1>
            <p className="text-slate-300 text-lg">File an incident report with your barangay</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-linear-to-r from-green-600 to-emerald-600 rounded-xl p-5 flex items-center gap-3 shadow-lg border border-green-500/20">
              <CheckCircle className="w-6 h-6 text-white flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white text-lg">Blotter Report Submitted</h3>
                <p className="text-green-50">Your incident report has been successfully filed.</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-linear-to-r from-red-600 to-rose-600 rounded-xl p-5 flex items-center gap-3 shadow-lg border border-red-500/20">
              <AlertCircle className="w-6 h-6 text-white flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white text-lg">Error</h3>
                <p className="text-red-50">{error}</p>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="mb-10 bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-slate-700/50">
            <div className="flex justify-between items-center">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex flex-col items-center flex-1 relative">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-lg ${
                      step <= currentStep
                        ? "bg-linear-to-br from-orange-500 to-orange-600 text-white shadow-orange-500/50"
                        : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {step}
                  </div>
                  <div className={`text-sm mt-3 text-center font-medium ${
                    step <= currentStep ? "text-orange-400" : "text-slate-500"
                  }`}>
                    {step === 1 && "Personal Info"}
                    {step === 2 && "Incident Details"}
                    {step === 3 && "Witnesses"}
                    {step === 4 && "Review"}
                  </div>
                  {step < 4 && (
                    <div
                      className={`absolute top-6 left-[calc(50%+24px)] h-1 w-[calc(100%-48px)] transition-all duration-300 rounded-full ${
                        step < currentStep ? "bg-linear-to-r from-orange-500 to-orange-600" : "bg-slate-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-700/50">
                <h2 className="text-2xl font-bold text-white mb-6">Personal Information</h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Full Name *</label>
                    <Input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter your full name"
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter email"
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/20"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Age *</label>
                      <Input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter age"
                        className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Gender *</label>
                      <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)} required>
                        <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white focus:border-orange-500 focus:ring-orange-500/20">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="male" className="text-white focus:bg-slate-700">Male</SelectItem>
                          <SelectItem value="female" className="text-white focus:bg-slate-700">Female</SelectItem>
                          <SelectItem value="other" className="text-white focus:bg-slate-700">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Address *</label>
                    <Input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter your address"
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Contact Number *</label>
                    <Input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter contact number"
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/20"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Incident Details */}
            {currentStep === 2 && (
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-700/50">
                <h2 className="text-2xl font-bold text-white mb-6">Incident Details</h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Incident Type *</label>
                    <Select
                      value={formData.incidentType}
                      onValueChange={(value) => handleSelectChange("incidentType", value)}
                      required
                    >
                      <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white focus:border-orange-500 focus:ring-orange-500/20">
                        <SelectValue placeholder="Select incident type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="theft" className="text-white focus:bg-slate-700">Theft</SelectItem>
                        <SelectItem value="harassment" className="text-white focus:bg-slate-700">Harassment</SelectItem>
                        <SelectItem value="disturbance" className="text-white focus:bg-slate-700">Disturbance</SelectItem>
                        <SelectItem value="accident" className="text-white focus:bg-slate-700">Accident</SelectItem>
                        <SelectItem value="property_damage" className="text-white focus:bg-slate-700">Property Damage</SelectItem>
                        <SelectItem value="lost_found" className="text-white focus:bg-slate-700">Lost & Found</SelectItem>
                        <SelectItem value="other" className="text-white focus:bg-slate-700">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Date of Incident *</label>
                      <Input
                        type="date"
                        name="incidentDate"
                        value={formData.incidentDate}
                        onChange={handleInputChange}
                        className="bg-slate-900/50 border-slate-600 text-white focus:border-orange-500 focus:ring-orange-500/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Time of Incident *</label>
                      <Input
                        type="time"
                        name="incidentTime"
                        value={formData.incidentTime}
                        onChange={handleInputChange}
                        className="bg-slate-900/50 border-slate-600 text-white focus:border-orange-500 focus:ring-orange-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Location of Incident *</label>
                    <Input
                      type="text"
                      name="incidentLocation"
                      value={formData.incidentLocation}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter incident location"
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Complaint Against *</label>
                    <Input
                      type="text"
                      name="complaintAgainst"
                      value={formData.complaintAgainst}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Name of person involved (if known)"
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Narrative / Description *</label>
                    <Textarea
                      name="narrative"
                      value={formData.narrative}
                      onChange={handleInputChange}
                      placeholder="Describe the incident in detail..."
                      className="h-32 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/20"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Witnesses */}
            {currentStep === 3 && (
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-700/50">
                <h2 className="text-2xl font-bold text-white mb-6">Witnesses (Optional)</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-orange-400 mb-3 text-lg">Witness 1</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                        <Input
                          type="text"
                          name="witness1Name"
                          value={formData.witness1Name}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyDown}
                          placeholder="Witness name"
                          className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Contact Number</label>
                        <Input
                          type="tel"
                          name="witness1Contact"
                          value={formData.witness1Contact}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyDown}
                          placeholder="Contact number"
                          className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-orange-400 mb-3 text-lg">Witness 2</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                        <Input
                          type="text"
                          name="witness2Name"
                          value={formData.witness2Name}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyDown}
                          placeholder="Witness name"
                          className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Contact Number</label>
                        <Input
                          type="tel"
                          name="witness2Contact"
                          value={formData.witness2Contact}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyDown}
                          placeholder="Contact number"
                          className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-400 italic mt-4 bg-slate-900/30 p-4 rounded-lg border border-slate-700/50">
                    Witness information helps us better document the incident. You may leave blank if no witnesses.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-700/50">
                <h2 className="text-2xl font-bold text-white mb-6">Review Your Report</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-orange-400 mb-3 text-lg">Personal Information</h3>
                    <div className="bg-slate-900/50 p-5 rounded-xl text-sm space-y-2 border border-slate-700/50">
                      <p className="text-slate-300">
                        <span className="font-medium text-white">Name:</span> {formData.fullName}
                      </p>
                      <p className="text-slate-300">
                        <span className="font-medium text-white">Email:</span> {formData.email}
                      </p>
                      <p className="text-slate-300">
                        <span className="font-medium text-white">Age:</span> {formData.age} |{" "}
                        <span className="font-medium text-white">Gender:</span> {formData.gender}
                      </p>
                      <p className="text-slate-300">
                        <span className="font-medium text-white">Address:</span> {formData.address}
                      </p>
                      <p className="text-slate-300">
                        <span className="font-medium text-white">Contact:</span> {formData.contactNumber}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-orange-400 mb-3 text-lg">Incident Details</h3>
                    <div className="bg-slate-900/50 p-5 rounded-xl text-sm space-y-2 border border-slate-700/50">
                      <p className="text-slate-300">
                        <span className="font-medium text-white">Type:</span> {formData.incidentType}
                      </p>
                      <p className="text-slate-300">
                        <span className="font-medium text-white">Date & Time:</span> {formData.incidentDate} at{" "}
                        {formData.incidentTime}
                      </p>
                      <p className="text-slate-300">
                        <span className="font-medium text-white">Location:</span> {formData.incidentLocation}
                      </p>
                      <p className="text-slate-300">
                        <span className="font-medium text-white">Against:</span> {formData.complaintAgainst}
                      </p>
                      <p className="text-slate-300">
                        <span className="font-medium text-white">Description:</span> {formData.narrative}
                      </p>
                    </div>
                  </div>

                  {(formData.witness1Name || formData.witness2Name) && (
                    <div>
                      <h3 className="font-semibold text-orange-400 mb-3 text-lg">Witnesses</h3>
                      <div className="bg-slate-900/50 p-5 rounded-xl text-sm space-y-2 border border-slate-700/50">
                        {formData.witness1Name && (
                          <p className="text-slate-300">
                            <span className="font-medium text-white">Witness 1:</span> {formData.witness1Name} (
                            {formData.witness1Contact})
                          </p>
                        )}
                        {formData.witness2Name && (
                          <p className="text-slate-300">
                            <span className="font-medium text-white">Witness 2:</span> {formData.witness2Name} (
                            {formData.witness2Contact})
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-linear-to-r from-orange-900/40 to-orange-800/40 border border-orange-600/30 rounded-xl p-5 text-sm text-orange-100 mt-6">
                  By submitting this blotter report, I confirm that the information provided is true and accurate to the
                  best of my knowledge.
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handlePrevious} 
                disabled={currentStep === 1 || loading}
                className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button 
                  type="button" 
                  onClick={handleNext} 
                  className="flex-1 bg-linear-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold shadow-lg shadow-orange-500/30" 
                  disabled={loading}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={handleSubmit} 
                  disabled={loading} 
                  className="flex-1 bg-linear-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold shadow-lg shadow-orange-500/30"
                >
                  {loading ? "Submitting..." : "Submit Report"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </MemberLayout>
  )
}