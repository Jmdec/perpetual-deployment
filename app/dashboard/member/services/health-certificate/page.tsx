"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import MemberLayout from "@/components/memberLayout";
import { authClient } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

export default function HealthCertificatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
    age: "",
    sex: "",
    purpose: "",
    hasAllergies: false,
    allergies: "",
    hasMedications: false,
    medications: "",
    hasConditions: false,
    conditions: "",
  });

  // Auto-fill form with logged-in user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await authClient.getCurrentUser();

        if (user) {
          // Calculate age from birth date if available
          let calculatedAge = "";
          if (user.birth_date) {
            const birthDate = new Date(user.birth_date);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
            calculatedAge = age.toString();
          }

          setFormData((prev) => ({
            ...prev,
            fullName: user.name || "",
            email: user.email || "",
            phone: user.phone_number || "",
            address: user.address || "",
            birthDate: user.birth_date || "",
            age: calculatedAge,
            sex: user.sex || "",
          }));

          toast({
            title: "Welcome Back",
            description: "Your profile information has been pre-filled.",
          });
        } else {
          toast({
            title: "Authentication Required",
            description: "Please log in to continue.",
            variant: "destructive",
          });
          router.push("/login");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast({
          title: "Error",
          description: "Failed to load your profile information.",
          variant: "destructive",
        });
        // Don't redirect on error, might be a temporary network issue
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [toast, router]);

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate age when birth date changes
      if (field === "birthDate" && typeof value === "string" && value) {
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        updated.age = age.toString();
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate required medical history fields
      if (formData.hasAllergies && !formData.allergies.trim()) {
        toast({
          title: "Validation Error",
          description: "Please specify your allergies or uncheck the option.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (formData.hasMedications && !formData.medications.trim()) {
        toast({
          title: "Validation Error",
          description: "Please list your medications or uncheck the option.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (formData.hasConditions && !formData.conditions.trim()) {
        toast({
          title: "Validation Error",
          description: "Please specify your conditions or uncheck the option.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/health-certificate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        toast({
          title: "Server Error",
          description: "Invalid response format. Please try again later.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (response.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        setTimeout(() => {
          router.push("/login");
        }, 2000);
        return;
      }

      if (response.ok) {
        toast({
          title: "Success!",
          description: `Your health certificate application has been submitted. Reference: ${data.data?.reference_number || 'N/A'}`,
        });
        router.push("/dashboard/member/account/applications?success=health-certificate");
      } else {
        toast({
          title: "Application Failed",
          description: data.message || "Failed to submit application. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      const errorMsg =
        error instanceof TypeError && error.message.includes("Failed to fetch")
          ? "Network connection error. Please check your internet connection."
          : "An unexpected error occurred. Please try again.";

      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <MemberLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            <p className="text-sm text-muted-foreground">Loading your information...</p>
          </div>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Heart className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  Health Certificate Application
                </h1>
                <p className="text-sm text-muted-foreground">
                  Apply for a health certificate
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 lg:p-6">
          {/* Info Banner */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ℹ️ Your personal information has been pre-filled from your account. You can edit any field if needed.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Personal & Health Information</CardTitle>
                <CardDescription>
                  Provide your details for health certificate issuance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) =>
                        updateFormData("fullName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          updateFormData("email", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Contact Number *</Label>
                      <Input
                        id="phone"
                        placeholder="09XX XXX XXXX"
                        value={formData.phone}
                        onChange={(e) =>
                          updateFormData("phone", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Complete Address *</Label>
                    <Input
                      id="address"
                      placeholder="Street, Barangay, City"
                      value={formData.address}
                      onChange={(e) =>
                        updateFormData("address", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Date of Birth *</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) =>
                          updateFormData("birthDate", e.target.value)
                        }
                        max={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="0"
                        value={formData.age}
                        onChange={(e) => updateFormData("age", e.target.value)}
                        readOnly={!!formData.birthDate}
                        required
                      />
                      {formData.birthDate && (
                        <p className="text-xs text-gray-500">
                          Auto-calculated from birth date
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sex">Sex *</Label>
                      <Select
                        value={formData.sex}
                        onValueChange={(value) => updateFormData("sex", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose *</Label>
                    <Select
                      value={formData.purpose}
                      onValueChange={(value) =>
                        updateFormData("purpose", value)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employment">Employment</SelectItem>
                        <SelectItem value="school">
                          School Requirement
                        </SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="food-handling">
                          Food Handling
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <h3 className="font-semibold">Medical History</h3>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="hasAllergies"
                          checked={formData.hasAllergies}
                          onCheckedChange={(checked) =>
                            updateFormData("hasAllergies", checked as boolean)
                          }
                        />
                        <Label htmlFor="hasAllergies" className="font-normal">
                          I have allergies
                        </Label>
                      </div>
                      {formData.hasAllergies && (
                        <Input
                          placeholder="Please specify allergies"
                          value={formData.allergies}
                          onChange={(e) =>
                            updateFormData("allergies", e.target.value)
                          }
                          required={formData.hasAllergies}
                        />
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="hasMedications"
                          checked={formData.hasMedications}
                          onCheckedChange={(checked) =>
                            updateFormData("hasMedications", checked as boolean)
                          }
                        />
                        <Label htmlFor="hasMedications" className="font-normal">
                          I am currently taking medications
                        </Label>
                      </div>
                      {formData.hasMedications && (
                        <Input
                          placeholder="Please list medications"
                          value={formData.medications}
                          onChange={(e) =>
                            updateFormData("medications", e.target.value)
                          }
                          required={formData.hasMedications}
                        />
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="hasConditions"
                          checked={formData.hasConditions}
                          onCheckedChange={(checked) =>
                            updateFormData("hasConditions", checked as boolean)
                          }
                        />
                        <Label htmlFor="hasConditions" className="font-normal">
                          I have existing medical conditions
                        </Label>
                      </div>
                      {formData.hasConditions && (
                        <Input
                          placeholder="Please specify conditions"
                          value={formData.conditions}
                          onChange={(e) =>
                            updateFormData("conditions", e.target.value)
                          }
                          required={formData.hasConditions}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-orange-800">
                    <strong>Note:</strong> You will need to visit the City
                    Health Office for physical examination. Processing time is
                    1-2 business days after examination.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </MemberLayout>
  );
}