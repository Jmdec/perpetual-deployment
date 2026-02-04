import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()
    
    console.log("[v0] News API GET - Fetching from:", `${API_URL}/news/published${queryString ? `?${queryString}` : ''}`)

    const response = await fetch(`${API_URL}/news/published${queryString ? `?${queryString}` : ''}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    const responseText = await response.text()
    console.log("[v0] News API GET - Response status:", response.status)

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText)
        return NextResponse.json(
          {
            error: errorData.message || "Failed to fetch news",
            details: errorData.errors || errorData,
          },
          { status: response.status },
        )
      } catch {
        return NextResponse.json({ error: "Failed to fetch news from server" }, { status: response.status })
      }
    }

    const data = JSON.parse(responseText)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] News API GET - Error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    console.log("[v0] News API - Sending request to:", `${API_URL}/news`)
    console.log("[v0] News API - FormData entries:")
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`[v0]   ${key}: File(${value.name}, ${value.size} bytes)`)
      } else {
        console.log(`[v0]   ${key}: ${value}`)
      }
    }

    const response = await fetch(`${API_URL}/news`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    })

    const responseText = await response.text()
    console.log("[v0] News API - Response status:", response.status)
    console.log("[v0] News API - Response headers:", Object.fromEntries(response.headers.entries()))
    console.log("[v0] News API - Response body (first 500 chars):", responseText.substring(0, 500))

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText)
        console.log("[v0] News API - Parsed error data:", errorData)
        return NextResponse.json(
          {
            error: errorData.message || "Failed to create news",
            details: errorData.errors || errorData,
            status: response.status,
          },
          { status: response.status },
        )
      } catch {
        console.log("[v0] News API - Could not parse as JSON. Full response:")
        console.log(responseText)

        return NextResponse.json(
          {
            error: "Laravel returned an error (see server logs for details)",
            status: response.status,
            isHtmlError: responseText.includes("<html") || responseText.includes("<!DOCTYPE"),
          },
          { status: response.status },
        )
      }
    }

    const data = JSON.parse(responseText)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] News API - Catch block error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : ""
    console.error("[v0] News API - Error stack:", errorStack)

    return NextResponse.json(
      {
        error: errorMessage,
        type: error instanceof Error ? error.constructor.name : "Unknown",
      },
      { status: 500 },
    )
  }
}