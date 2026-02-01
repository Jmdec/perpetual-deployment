import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:8000/api"

function getAuthToken(request: NextRequest): string | null {
  const cookieToken = request.cookies.get("auth_token")?.value
  if (cookieToken) return cookieToken

  const authHeader = request.headers.get("Authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }

  return null
}

// GET method for fetching blotters
export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request)

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "No authentication token found. Please log in again.",
        },
        { status: 401 },
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = searchParams.get("page") || "1"
    const perPage = searchParams.get("per_page") || "15"
    const incidentType = searchParams.get("incident_type")
    const search = searchParams.get("search")

    const params = new URLSearchParams({
      page,
      per_page: perPage,
    })

    if (incidentType && incidentType !== "all") {
      params.append("incident_type", incidentType)
    }

    if (search) {
      params.append("search", search)
    }

    const response = await fetch(`${API_URL}/admin/barangay-blotters?${params}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Barangay Blotter GET API Error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch blotters",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST method for creating blotters
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Request body:", JSON.stringify(body, null, 2))

    const token = getAuthToken(request)
    console.log("[v0] Auth token present:", !!token)

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "No authentication token found. Please log in again.",
        },
        { status: 401 },
      )
    }

    console.log("[v0] Sending to Laravel API:", `${LARAVEL_API_URL}/barangay-blotter`)

    const response = await fetch(`${LARAVEL_API_URL}/barangay-blotter`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    console.log("[v0] Laravel response status:", response.status)
    console.log("[v0] Laravel response data:", JSON.stringify(data, null, 2))

    if (!response.ok) {
      console.error("[v0] Error response from Laravel:", data)
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("[v0] Barangay Blotter POST Error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit blotter",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
