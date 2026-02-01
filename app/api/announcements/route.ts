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

    // Use /announcements/published for public access (no auth required)
    // Use /announcements for authenticated users (requires auth)
    const endpoint = token ? 'announcements' : 'announcements/published'
    const url = `${LARAVEL_API_URL}/${endpoint}${queryString ? `?${queryString}` : ''}`
    
    console.log('[Announcements API] Fetching from:', url)
    console.log('[Announcements API] Has token:', !!token)

    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    })

    console.log('[Announcements API] Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Announcements API] Error response:', errorText)
      
      // If 401 and we tried the authenticated endpoint, fall back to public
      if (response.status === 401 && endpoint === 'announcements') {
        console.log('[Announcements API] Auth failed, trying public endpoint')
        
        const publicUrl = `${LARAVEL_API_URL}/announcements/published${queryString ? `?${queryString}` : ''}`
        const publicResponse = await fetch(publicUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          cache: "no-store",
        })
        
        if (publicResponse.ok) {
          const data = await publicResponse.json()
          return NextResponse.json(data, { status: publicResponse.status })
        }
      }
      
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
    console.log('[Announcements API] Success')

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