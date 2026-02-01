import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
console.log("Forwarding to:", `${API_URL}/auth/register`);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Forward the FormData directly to Laravel
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      body: formData,
      // Don't set Content-Type header - let browser set it with boundary
    })
    console.log("API: ", API_URL);
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    // If registration successful, return data with token
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Registration API Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to server",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}