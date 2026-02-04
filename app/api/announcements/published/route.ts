import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    // Fix: Use /announcements/published endpoint
    const url = `${LARAVEL_API_URL}/announcements/published${queryString ? `?${queryString}` : ''}`
    console.log('[Announcements API] Fetching from:', url)

    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    })

    console.log('[Announcements API] Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Announcements API] Error response:', errorText)
      
      return NextResponse.json(
        {
          success: false,
          message: `Laravel API error: ${response.status}`,
          error: errorText
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('[Announcements API] Success:', data)

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("[Announcements API] Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch announcements",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated. Please log in again.",
        },
        { status: 401 }
      )
    }

    const formData = await request.formData()

    console.log('[Announcements API] Creating announcement')

    const response = await fetch(`${LARAVEL_API_URL}/announcements`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
      },
      body: formData,
    })

    const data = await response.json()
    console.log('[Announcements API] Create response:', data)

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("[Announcements API] Create error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create announcement",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}