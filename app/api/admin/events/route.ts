import { type NextRequest, NextResponse } from "next/server"

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function GET(req: NextRequest) {
  try {
    // Get the authorization token from cookies
    const cookie = req.headers.get("cookie") || ""
    
    // Get query parameters for pagination and search
    const searchParams = req.nextUrl.searchParams
    const params = new URLSearchParams()
    
    if (searchParams.has("page")) {
      params.append("page", searchParams.get("page") || "1")
    }
    if (searchParams.has("per_page")) {
      params.append("per_page", searchParams.get("per_page") || "15")
    }
    if (searchParams.has("search")) {
      params.append("search", searchParams.get("search") || "")
    }
    if (searchParams.has("sort_by")) {
      params.append("sort_by", searchParams.get("sort_by") || "date")
    }
    if (searchParams.has("sort_order")) {
      params.append("sort_order", searchParams.get("sort_order") || "desc")
    }

    const response = await fetch(`${LARAVEL_API_URL}/api/admin/events?${params}`, {
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
    })
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie") || ""
    const data = await req.json()

    const response = await fetch(`${LARAVEL_API_URL}/api/admin/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
