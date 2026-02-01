import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

async function getAuthToken(request: NextRequest): Promise<string | null> {
  // Try cookie first
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get("auth_token")?.value
  if (cookieToken) return cookieToken

  // Try Authorization header
  const authHeader = request.headers.get("Authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }

  return null
}

// GET method for fetching good moral certificates (admin view)
export async function GET(request: NextRequest) {
  try {
    console.log("[v0] === Good Moral Certificate GET Request ===")
    console.log("[v0] Request URL:", request.url)

    const token = await getAuthToken(request)
    console.log("[v0] Auth token found:", !!token)

    if (!token) {
      console.log("[v0] No token - returning 401")
      return NextResponse.json(
        {
          success: false,
          message: "No authentication token found. Please log in again.",
        },
        { status: 401 },
      )
    }

    // Get query parameters from the URL
    const searchParams = request.nextUrl.searchParams
    const page = searchParams.get("page") || "1"
    const perPage = searchParams.get("per_page") || "15"
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    // Build query string
    const params = new URLSearchParams({
      page,
      per_page: perPage,
    })

    if (status && status !== "all") {
      params.append("status", status)
    }

    if (search) {
      params.append("search", search)
    }

    const backendUrl = `${API_URL}/admin/good-moral-certificates?${params}`
    console.log("[v0] Fetching from backend:", backendUrl)

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
      },
    })

    console.log("[v0] Backend response status:", response.status)

    const data = await response.json()
    console.log("[v0] Backend response data:", JSON.stringify(data, null, 2))

    if (!response.ok) {
      console.log("[v0] Backend error - returning error response")
      return NextResponse.json(data, { status: response.status })
    }

    console.log("[v0] Success - returning data")
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("[v0] EXCEPTION in Good Moral Certificate GET:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack")

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch good moral certificates",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST method for creating good moral certificates
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Get token from cookie or header
    const token = await getAuthToken(request)

    console.log("Token found:", token ? "Yes" : "No")

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "No authentication token found. Please log in again.",
        },
        { status: 401 },
      )
    }

    console.log("Submitting good moral certificate application...")

    const response = await fetch(`${API_URL}/good-moral-certificate`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
      },
      body: formData,
    })

    const data = await response.json()

    console.log("Laravel response:", { status: response.status, data })

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Good Moral Certificate API Error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit application",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
