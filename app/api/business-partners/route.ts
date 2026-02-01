// app/api/business-partners/route.ts
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000"

// Helper function to transform photo URLs
function transformPhotoUrl(photoPath: string | null | undefined): string | null {
  if (!photoPath) return null
  
  // If already a full URL, return as is
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath
  }
  
  // Construct full URL from relative path
  const cleanPath = photoPath.startsWith('/') ? photoPath : `/${photoPath}`
  return `${IMAGE_BASE_URL}${cleanPath}`
}

// Public endpoint - Get all approved business partners
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const queryParams = url.searchParams.toString()

    console.log("Fetching public business partners from:", `${API_URL}/business-partners${queryParams ? '?' + queryParams : ''}`)

    const res = await fetch(`${API_URL}/business-partners${queryParams ? '?' + queryParams : ''}`, {
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      cache: 'no-store', // Disable caching to always get fresh data
    })

    const contentType = res.headers.get("content-type")
    let data

    if (contentType?.includes("application/json")) {
      data = await res.json()
      console.log("Laravel response:", data)
      
      // Transform photo URLs in the response
      if (data.success && data.data) {
        if (Array.isArray(data.data)) {
          // Handle array of business partners
          data.data = data.data.map((partner: any) => ({
            ...partner,
            photo: transformPhotoUrl(partner.photo)
          }))
        } else if (data.data.data && Array.isArray(data.data.data)) {
          // Handle paginated response
          data.data.data = data.data.data.map((partner: any) => ({
            ...partner,
            photo: transformPhotoUrl(partner.photo)
          }))
        }
      }
      
      console.log("Transformed response with full image URLs")
    } else {
      const text = await res.text()
      console.error("Non-JSON response from Laravel:", text)
      return NextResponse.json({ 
        success: false, 
        message: "Invalid response from server",
        debug: text.substring(0, 500)
      }, { status: 500 })
    }

    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error("Server error:", err)
    return NextResponse.json({ 
      success: false, 
      message: "Server error",
      error: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const formData = await req.formData()

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business-partners`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: formData,
      credentials: "include",
    })

    const contentType = res.headers.get("content-type")
    let data

    if (contentType?.includes("application/json")) {
      data = await res.json()
    } else {
      const text = await res.text()
      console.error("Non-JSON response from Laravel:", text)
      return NextResponse.json({ success: false, message: "Invalid response from server" }, { status: 500 })
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to create business",
          errors: data.errors,
          error: data.error,
        },
        { status: res.status },
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error("Error creating business:", err)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}