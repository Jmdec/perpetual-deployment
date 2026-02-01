// app/api/emergency/ambulance/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated. Please log in again." },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { name, phone, address, emergency, notes, location, timestamp } = body

    console.log("Proxying ambulance request to Laravel:", {
      url: `${LARAVEL_API_URL}/emergency/ambulance`,
      hasAuth: !!token,
    })

    const response = await fetch(`${LARAVEL_API_URL}/admin/emergency/ambulance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({
        name,
        phone,
        address,
        emergency,
        notes,
        location,
        timestamp,
      }),
    })

    const data = await response.json()

    console.log("Laravel response:", {
      status: response.status,
      success: data.success,
      message: data.message,
    })

    if (response.status === 401) {
      return NextResponse.json(
        { success: false, message: "Session expired. Please log in again." },
        { status: 401 },
      )
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to process ambulance request",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated. Please log in again." },
        { status: 401 },
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const page = searchParams.get("page")
    const perPage = searchParams.get("per_page")

    // Build query string
    const queryParams = new URLSearchParams()
    if (status && status !== "all") queryParams.append("status", status)
    if (search) queryParams.append("search", search)
    if (page) queryParams.append("page", page)
    if (perPage) queryParams.append("per_page", perPage)

    const queryString = queryParams.toString()
    // Use admin route for fetching all ambulance requests
    const url = `${LARAVEL_API_URL}/admin/ambulance-requests${queryString ? `?${queryString}` : ""}`

    console.log("Fetching ambulance requests:", {
      url,
      hasAuth: !!token,
    })

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
      },
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch ambulance requests",
      },
      { status: 500 },
    )
  }
}