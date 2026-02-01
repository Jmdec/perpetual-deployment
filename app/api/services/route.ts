import { type NextRequest, NextResponse } from "next/server"

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function GET(req: NextRequest) {
  try {
    // TODO: Fetch services from Laravel API
    const response = await fetch(`${LARAVEL_API_URL}/api/services`, {
      headers: { "Content-Type": "application/json" },
    })
    return NextResponse.json(await response.json())
  } catch (error) {
    console.error("Services error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    // TODO: Submit service request to Laravel API
    const response = await fetch(`${LARAVEL_API_URL}/api/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return NextResponse.json(await response.json())
  } catch (error) {
    console.error("Services POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
