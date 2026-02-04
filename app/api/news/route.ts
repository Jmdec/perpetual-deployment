import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// GET - Fetch all news (admin)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()
    
    const endpoint = `${API_URL}/admin/news${queryString ? `?${queryString}` : ''}`
    console.log("[Admin News] GET - Fetching from:", endpoint)

    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      console.error("[Admin News] No auth token found")
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const responseText = await response.text()
    console.log("[Admin News] GET - Response status:", response.status)

    if (!response.ok) {
      console.error("[Admin News] GET - Error response:", responseText)
      try {
        const errorData = JSON.parse(responseText)
        return NextResponse.json(
          {
            success: false,
            message: errorData.message || "Failed to fetch news",
            errors: errorData.errors || errorData,
          },
          { status: response.status },
        )
      } catch {
        return NextResponse.json(
          { success: false, message: "Failed to fetch news from server" },
          { status: response.status }
        )
      }
    }

    const data = JSON.parse(responseText)
    console.log("[Admin News] GET - Success! News count:", data.data?.data?.length || 0)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Admin News] GET - Error:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// POST - Create new news
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    console.log("[Admin News] POST - Creating news")
    console.log("[Admin News] FormData entries:")
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`)
      } else {
        console.log(`  ${key}: ${value}`)
      }
    }

    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      console.error("[Admin News] No auth token found")
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    const endpoint = `${API_URL}/admin/news`
    console.log("[Admin News] POST - Endpoint:", endpoint)

    // IMPORTANT: Don't set Content-Type for FormData - browser will set it with boundary
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        // Don't include Content-Type - let browser set multipart/form-data with boundary
      },
    })

    const responseText = await response.text()
    console.log("[Admin News] POST - Response status:", response.status)
    console.log("[Admin News] POST - Response preview:", responseText.substring(0, 500))

    if (!response.ok) {
      console.error("[Admin News] POST - Error response:", responseText)
      try {
        const errorData = JSON.parse(responseText)
        console.log("[Admin News] POST - Parsed error:", errorData)
        return NextResponse.json(
          {
            success: false,
            message: errorData.message || "Failed to create news",
            errors: errorData.errors || errorData,
          },
          { status: response.status },
        )
      } catch {
        console.log("[Admin News] POST - HTML error detected")
        return NextResponse.json(
          {
            success: false,
            message: "Server error (check Laravel logs)",
            isHtmlError: responseText.includes("<html") || responseText.includes("<!DOCTYPE"),
          },
          { status: response.status },
        )
      }
    }

    const data = JSON.parse(responseText)
    console.log("[Admin News] POST - Success!")
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Admin News] POST - Error:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}