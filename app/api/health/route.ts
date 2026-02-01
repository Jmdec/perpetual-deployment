import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.API_URL || "http://localhost:8000"

export async function GET() {
  try {
    console.log("[v0] Health API GET - Fetching from:", `${API_URL}/api/health`)

    const response = await fetch(`${API_URL}/api/health`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    const responseText = await response.text()
    console.log("[v0] Health API GET - Response status:", response.status)

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText)
        return NextResponse.json(
          {
            error: errorData.message || "Failed to fetch health info",
            details: errorData.errors || errorData,
          },
          { status: response.status },
        )
      } catch {
        return NextResponse.json({ error: "Failed to fetch health info from server" }, { status: response.status })
      }
    }

    const data = JSON.parse(responseText)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Health API GET - Error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const data: Record<string, FormDataEntryValue> = {}
    for (const [key, value] of formData.entries()) {
      data[key] = value
    }

    console.log("[v0] Health API - Sending request to:", `${API_URL}/api/health`)
    console.log("[v0] Health API - Request body:", JSON.stringify(data, null, 2))

    const response = await fetch(`${API_URL}/api/health`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    })

    const responseText = await response.text()
    console.log("[v0] Health API - Response status:", response.status)
    console.log("[v0] Health API - Response headers:", Object.fromEntries(response.headers.entries()))
    console.log("[v0] Health API - Response body:", responseText)

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText)
        console.log("[v0] Health API - Parsed error data:", errorData)
        return NextResponse.json(
          {
            error: errorData.message || "Failed to create health info",
            details: errorData.errors || errorData,
            status: response.status,
          },
          { status: response.status },
        )
      } catch {
        console.log("[v0] Health API - Could not parse error as JSON, returning raw text")
        return NextResponse.json(
          {
            error: responseText || "Failed to create health info",
            status: response.status,
          },
          { status: response.status },
        )
      }
    }

    const data_response = JSON.parse(responseText)
    return NextResponse.json(data_response)
  } catch (error) {
    console.error("[v0] Health API - Catch block error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : ""
    console.error("[v0] Health API - Error stack:", errorStack)

    return NextResponse.json(
      {
        error: errorMessage,
        type: error instanceof Error ? error.constructor.name : "Unknown",
      },
      { status: 500 },
    )
  }
}