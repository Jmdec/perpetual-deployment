// app/api/events/route.ts
import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// GET all events
export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/events`)
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch events" }, { status: response.status })
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

// POST - Create new event with image
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    console.log("[v0] Creating event at:", `${API_URL}/api/events`)
    console.log("[v0] FormData fields:", Array.from(formData.keys()))
    
    // Forward the FormData directly to Laravel
    const response = await fetch(`${API_URL}/api/events`, {
      method: "POST",
      body: formData, // Send FormData as-is
    })
    
    console.log("[v0] Backend response status:", response.status)
    
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      console.error("[v0] Backend returned non-JSON response:", text.substring(0, 200))
      return NextResponse.json(
        { error: "Backend API returned invalid response. Check if the API is running correctly." }, 
        { status: 500 }
      )
    }
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error("[v0] Backend error:", data)
      return NextResponse.json(data, { status: response.status })
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating event:", error)
    return NextResponse.json({ 
      error: "Failed to create event", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}