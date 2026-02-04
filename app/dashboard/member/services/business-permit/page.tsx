"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, Building2, User, MapPin, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import MemberLayout from "@/components/memberLayout"
import { authClient } from "@/lib/auth"

const steps = [
  { id: 1, name: "Business Information", icon: Building2 },
  { id: 2, name: "Owner Information", icon: User },
  { id: 3, name: "Location Details", icon: MapPin },
  { id: 4, name: "Review & Submit", icon: FileText },
]

const validateStep = (stepNumber: number, formData: typeof initialFormData) => {
  const errors: Record<string, string> = {}

  if (stepNumber === 1) {
    if (!formData.businessName?.trim()) errors.businessName = "Business name is required"
    if (!formData.businessType) errors.businessType = "Business type is required"
    if (!formData.businessCategory) errors.businessCategory = "Business category is required"
    if (formData.businessCategory === "other" && !formData.businessCategoryOther?.trim()) {
      errors.businessCategoryOther = "Please specify your business category"
    }
    if (!formData.businessDescription?.trim()) errors.businessDescription = "Business description is required"
  } else if (stepNumber === 2) {
    if (!formData.ownerName?.trim()) errors.ownerName = "Full name is required"
    if (!formData.ownerEmail?.trim()) errors.ownerEmail = "Email address is required"
    if (formData.ownerEmail && !isValidEmail(formData.ownerEmail)) errors.ownerEmail = "Please enter a valid email address"
    if (!formData.ownerPhone?.trim()) errors.ownerPhone = "Contact number is required"
    if (!formData.ownerAddress?.trim()) errors.ownerAddress = "Residential address is required"
  } else if (stepNumber === 3) {
    if (!formData.businessAddress?.trim()) errors.businessAddress = "Business address is required"
    if (!formData.barangay?.trim()) errors.barangay = "Barangay is required"
    if (!formData.floorArea) errors.floorArea = "Floor area is required"
    const floorAreaNum = parseFloat(formData.floorArea)
    if (isNaN(floorAreaNum) || floorAreaNum <= 0) errors.floorArea = "Please enter a valid floor area"
  }

  return errors
}

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const getDetailedErrorMessage = (status: number, data: any): string => {
  switch (status) {
    case 400:
      return "Invalid form data. Please review your entries and try again."
    case 401:
      return "Your session has expired. Please log in again."
    case 403:
      return "You don't have permission to submit this application."
    case 404:
      return "The service is temporarily unavailable. Please try again later."
    case 422:
      if (data?.errors) {
        const errorMessages = Object.entries(data.errors)
          .map(([key, messages]: [string, any]) => 
            Array.isArray(messages) ? messages[0] : messages
          )
          .join(", ")
        return `Validation error: ${errorMessages}`
      }
      return data?.message || "Please check your form entries and try again."
    case 500:
      return "Server error occurred. Please try again later."
    case 503:
      return "Service is temporarily unavailable. Please try again later."
    default:
      return data?.message || "An unexpected error occurred. Please try again."
  }
}

const initialFormData = {
  businessName: "",
  businessType: "",
  businessCategory: "",
  businessCategoryOther: "",
  businessDescription: "",
  ownerName: "",
  ownerEmail: "",
  ownerPhone: "",
  ownerAddress: "",
  businessAddress: "",
  barangay: "",
  lotNumber: "",
  floorArea: "",
}

export default function BusinessPermitPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState(initialFormData)
  const [isLoadingUserData, setIsLoadingUserData] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Fetch user data from the API (which uses the HTTP-only cookie)
        const user = await authClient.getCurrentUser()

        if (user) {
          setFormData((prev) => ({
            ...prev,
            ownerName: user.name || "",
            ownerEmail: user.email || "",
            ownerPhone: user.phone_number || "",
            ownerAddress: user.address || "",
          }))

          toast({
            title: "Welcome Back",
            description: "Your profile information has been pre-filled.",
          })
        } else {
          // User not authenticated, redirect to login
          toast({
            title: "Authentication Required",
            description: "Please log in to continue.",
            variant: "destructive",
          })
          router.push('/login')
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        toast({
          title: "Error",
          description: "Failed to load your profile information.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingUserData(false)
      }
    }

    loadUserData()
  }, [toast, router])

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const updated = { ...prev }
        delete updated[field]
        return updated
      })
    }
  }

  const handleNext = () => {
    const errors = validateStep(currentStep, formData)
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      const firstErrorField = Object.keys(errors)[0]
      toast({
        title: "Validation Error",
        description: `Please fill in all required fields. ${errors[firstErrorField]}`,
        variant: "destructive",
      })
      return
    }

    setValidationErrors({})
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
      toast({
        title: "Step Complete",
        description: `You're on step ${currentStep + 1} of ${steps.length}`,
      })
    }
  }

  const handleBack = () => {
    setValidationErrors({})
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    const errors = validateStep(4, formData)
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      toast({
        title: "Validation Error",
        description: "Please review your application information and correct any errors.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setValidationErrors({})

    try {
      console.log('Submitting business permit application...')

      // The cookie is automatically sent with the request
      const response = await fetch("/api/business-permit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: Include cookies
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      
      console.log('Response received:', {
        status: response.status,
        success: data.success,
        message: data.message
      })

      if (response.status === 401) {
        // Session expired, redirect to login
        toast({
          title: "Session Expired",
          description: "Please log in again to continue.",
          variant: "destructive",
        })
        setTimeout(() => {
          router.push("/login")
        }, 2000)
        return
      }

      if (response.ok && data.success) {
        toast({
          title: "Success!",
          description: "Your business permit application has been submitted successfully.",
        })
        
        setTimeout(() => {
          router.push("/dashboard/member/account/applications?success=business-permit")
        }, 1500)
      } else {
        const errorMessage = getDetailedErrorMessage(response.status, data)
        
        toast({
          title: "Application Failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred. Please try again."
      
      if (error instanceof TypeError) {
        if (error.message.includes("Failed to fetch")) {
          errorMessage = "Network connection error. Please check your internet connection and try again."
        } else {
          errorMessage = error.message
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      console.error('Submission error:', error)

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MemberLayout>
      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
        {isLoadingUserData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your profile information...</p>
            </div>
          </div>
        )}

        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Business Permit Application</h1>
              <p className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 lg:p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        currentStep >= step.id ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {currentStep > step.id ? <CheckCircle2 className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                    </div>
                    <span className="text-xs mt-2 text-center hidden sm:block">{step.name}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 ${currentStep > step.id ? "bg-orange-500" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].name}</CardTitle>
              <CardDescription>
                {currentStep === 1 && "Enter your business details"}
                {currentStep === 2 && "Provide owner information"}
                {currentStep === 3 && "Specify business location"}
                {currentStep === 4 && "Review your application before submitting"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      placeholder="Enter business name"
                      value={formData.businessName}
                      onChange={(e) => updateFormData("businessName", e.target.value)}
                      className={validationErrors.businessName ? "border-red-500" : ""}
                      aria-invalid={!!validationErrors.businessName}
                    />
                    {validationErrors.businessName && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {validationErrors.businessName}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type *</Label>
                      <Select
                        value={formData.businessType}
                        onValueChange={(value) => updateFormData("businessType", value)}
                      >
                        <SelectTrigger className={validationErrors.businessType ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="corporation">Corporation</SelectItem>
                        </SelectContent>
                      </Select>
                      {validationErrors.businessType && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {validationErrors.businessType}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessCategory">Business Category *</Label>
                      <Select
                        value={formData.businessCategory}
                        onValueChange={(value) => updateFormData("businessCategory", value)}
                      >
                        <SelectTrigger className={validationErrors.businessCategory ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retail">Retail Store</SelectItem>
                          <SelectItem value="food">Food & Beverage</SelectItem>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="cafe">Cafe/Coffee Shop</SelectItem>
                          <SelectItem value="services">Professional Services</SelectItem>
                          <SelectItem value="salon">Salon/Spa</SelectItem>
                          <SelectItem value="automotive">Automotive Services</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="construction">Construction</SelectItem>
                          <SelectItem value="healthcare">Healthcare Services</SelectItem>
                          <SelectItem value="education">Education/Training</SelectItem>
                          <SelectItem value="technology">Technology/IT Services</SelectItem>
                          <SelectItem value="real-estate">Real Estate</SelectItem>
                          <SelectItem value="wholesale">Wholesale/Distribution</SelectItem>
                          <SelectItem value="entertainment">Entertainment/Recreation</SelectItem>
                          <SelectItem value="hotel">Hotel/Accommodation</SelectItem>
                          <SelectItem value="transportation">Transportation Services</SelectItem>
                          <SelectItem value="agriculture">Agriculture/Farming</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {validationErrors.businessCategory && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {validationErrors.businessCategory}
                        </p>
                      )}
                    </div>
                  </div>
                  {formData.businessCategory === "other" && (
                    <div className="space-y-2">
                      <Label htmlFor="businessCategoryOther">Please specify business category *</Label>
                      <Input
                        id="businessCategoryOther"
                        placeholder="Enter your business category"
                        value={formData.businessCategoryOther}
                        onChange={(e) => updateFormData("businessCategoryOther", e.target.value)}
                        className={validationErrors.businessCategoryOther ? "border-red-500" : ""}
                      />
                      {validationErrors.businessCategoryOther && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {validationErrors.businessCategoryOther}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="businessDescription">Business Description *</Label>
                    <Textarea
                      id="businessDescription"
                      placeholder="Describe your business activities"
                      rows={4}
                      value={formData.businessDescription}
                      onChange={(e) => updateFormData("businessDescription", e.target.value)}
                      className={validationErrors.businessDescription ? "border-red-500" : ""}
                    />
                    {validationErrors.businessDescription && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {validationErrors.businessDescription}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Full Name *</Label>
                    <Input
                      id="ownerName"
                      placeholder="Enter full name"
                      value={formData.ownerName}
                      onChange={(e) => updateFormData("ownerName", e.target.value)}
                      className={validationErrors.ownerName ? "border-red-500" : ""}
                    />
                    {validationErrors.ownerName && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {validationErrors.ownerName}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ownerEmail">Email Address *</Label>
                      <Input
                        id="ownerEmail"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.ownerEmail}
                        onChange={(e) => updateFormData("ownerEmail", e.target.value)}
                        className={validationErrors.ownerEmail ? "border-red-500" : ""}
                      />
                      {validationErrors.ownerEmail && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {validationErrors.ownerEmail}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownerPhone">Contact Number *</Label>
                      <Input
                        id="ownerPhone"
                        placeholder="09XX XXX XXXX"
                        value={formData.ownerPhone}
                        onChange={(e) => updateFormData("ownerPhone", e.target.value)}
                        className={validationErrors.ownerPhone ? "border-red-500" : ""}
                      />
                      {validationErrors.ownerPhone && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {validationErrors.ownerPhone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerAddress">Residential Address *</Label>
                    <Textarea
                      id="ownerAddress"
                      placeholder="Street, Barangay, City"
                      rows={3}
                      value={formData.ownerAddress}
                      onChange={(e) => updateFormData("ownerAddress", e.target.value)}
                      className={validationErrors.ownerAddress ? "border-red-500" : ""}
                    />
                    {validationErrors.ownerAddress && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {validationErrors.ownerAddress}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessAddress">Business Address *</Label>
                    <Textarea
                      id="businessAddress"
                      placeholder="Street, Building Name/Number"
                      rows={3}
                      value={formData.businessAddress}
                      onChange={(e) => updateFormData("businessAddress", e.target.value)}
                      className={validationErrors.businessAddress ? "border-red-500" : ""}
                    />
                    {validationErrors.businessAddress && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {validationErrors.businessAddress}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barangay">Barangay *</Label>
                    <Input
                      id="barangay"
                      placeholder="Enter barangay"
                      value={formData.barangay}
                      onChange={(e) => updateFormData("barangay", e.target.value)}
                      className={validationErrors.barangay ? "border-red-500" : ""}
                    />
                    {validationErrors.barangay && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {validationErrors.barangay}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lotNumber">Lot Number</Label>
                      <Input
                        id="lotNumber"
                        placeholder="Enter lot number"
                        value={formData.lotNumber}
                        onChange={(e) => updateFormData("lotNumber", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="floorArea">Floor Area (sq.m) *</Label>
                      <Input
                        id="floorArea"
                        type="number"
                        placeholder="Enter floor area"
                        value={formData.floorArea}
                        onChange={(e) => updateFormData("floorArea", e.target.value)}
                        className={validationErrors.floorArea ? "border-red-500" : ""}
                      />
                      {validationErrors.floorArea && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {validationErrors.floorArea}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Business Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Business Name:</span> {formData.businessName}
                        </p>
                        <p>
                          <span className="font-medium">Type:</span> {formData.businessType}
                        </p>
                        <p>
                          <span className="font-medium">Category:</span>{" "}
                          {formData.businessCategory === "other" && formData.businessCategoryOther
                            ? formData.businessCategoryOther
                            : formData.businessCategory}
                        </p>
                        <p>
                          <span className="font-medium">Description:</span> {formData.businessDescription}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Owner Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Name:</span> {formData.ownerName}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span> {formData.ownerEmail}
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span> {formData.ownerPhone}
                        </p>
                        <p>
                          <span className="font-medium">Address:</span> {formData.ownerAddress}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Location Details</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Business Address:</span> {formData.businessAddress}
                        </p>
                        <p>
                          <span className="font-medium">Barangay:</span> {formData.barangay}
                        </p>
                        <p>
                          <span className="font-medium">Lot Number:</span> {formData.lotNumber || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Floor Area:</span> {formData.floorArea} sq.m
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                    Back
                  </Button>
                )}
                {currentStep < steps.length ? (
                  <Button onClick={handleNext} className="flex-1 bg-orange-500 hover:bg-orange-600">
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MemberLayout>
  )
}