"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

interface VerifyUser {
  name: string
  email: string
  fraternity_number: string
  alias?: string
  position?: string
  chapter?: string
  approved_at?: string
}

export default function VerifyUserForm() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ active: boolean; user?: VerifyUser; message?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", email: "", fraternityNumber: "" })
  const { name, email, fraternityNumber } = form

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)

    // ----- Frontend validations -----
    if (!name.trim()) {
      setError("Name is required.")
      return
    }
    if (!email.trim() || !validateEmail(email)) {
      setError("A valid email is required.")
      return
    }
    if (!fraternityNumber.trim()) {
      setError("Fraternity number is required.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/legitimacy/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fraternity_number: fraternityNumber, name, email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Something went wrong")
        return
      }

      if (data.success) {
        setResult({ active: data.active, user: data.data, message: data.message })
      } else {
        setError(data.message || "User not found")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-gradient-to-br from-amber-50 to-white rounded-lg shadow-lg border border-red-200">
      {/* Header */}
      <h1 className="text-2xl font-extrabold mb-2 text-center text-red-800">Member Verification Portal</h1>
      <p className="text-sm text-center text-red-600 mb-4">Complete the fields below to check active membership status.</p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="block text-sm font-medium text-red-700">
            Name
          </Label>
          <Input
            id="name"
            placeholder="Enter name"
            value={name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-red-300 focus:border-red-500 focus:ring-red-500"
          />
        </div>

        <div>
          <Label htmlFor="email" className="block text-sm font-medium text-red-700">
            Email
          </Label>
          <Input
            id="email"
            placeholder="Enter email"
            type="email"
            value={email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-red-300 focus:border-red-500 focus:ring-red-500"
          />
        </div>

        <div>
          <Label htmlFor="fraternityNumber" className="block text-sm font-medium text-red-700">
            Fraternity Number
          </Label>
          <Input
            id="fraternityNumber"
            placeholder="Enter fraternity number"
            value={fraternityNumber}
            onChange={(e) => handleChange("fraternityNumber", e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-red-300 focus:border-red-500 focus:ring-red-500"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold py-2 px-4 rounded-md shadow hover:from-red-700 hover:to-red-800 transition-all duration-300"
        >
          {loading ? "Verifying..." : "Verify Member"}
        </Button>
      </form>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mt-4 border-red-600">
          <AlertTitle className="text-red-700 font-bold">Error</AlertTitle>
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      )}

      {/* Result Alert */}
      {result && (
        <Alert
          variant={result.active ? "default" : "destructive"}
          className={`mt-4 flex flex-col gap-2 ${result.active ? "border-green-600" : "border-red-600"}`}
        >
          <AlertTitle className="font-bold">{result.active ? "User is Active" : "User Not Active"}</AlertTitle>
          <AlertDescription className="space-y-1 text-sm">
            {result.user && (
              <>
                {result.active && (
                  <>
                    <div>
                      <strong>Name:</strong> {result.user.name}
                    </div>
                    <div>
                      <strong>Email:</strong> {result.user.email}
                    </div>
                    <div>
                      <strong>Fraternity Number:</strong> {result.user.fraternity_number}
                    </div>
                    <div>
                      <strong>Chapter:</strong> {result.user.chapter}
                    </div>
                    <div>
                      <strong>Position:</strong> {result.user.position}
                    </div>
                    <div>
                      <strong>Alias:</strong> {result.user.alias}
                    </div>
                  </>
                )}
              </>
            )}
            {result.message && <div>{result.message}</div>}
          </AlertDescription>
        </Alert>
      )}
      {result?.active && (
        <div className="mt-6 text-center">
          <p className="text-sm text-red-700 mb-2">Want to request your official certificate?</p>
          <Button
            className="bg-gradient-to-r from-red-700 to-red-800 text-white font-semibold py-4 px-4 rounded-lg shadow hover:from-red-800 hover:to-red-900 transition-all duration-300"
            onClick={() => (window.location.href = "/login")}
          >
            Login to Access Certificate
          </Button>
        </div>
      )}
    </div>
  )
}
