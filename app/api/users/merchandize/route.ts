// app/api/admin/products/route.ts
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:8000/api"

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const queryString = searchParams.toString()
        const cookieStore = await cookies()
        const token = cookieStore.get("auth_token")?.value

        if (!token) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        // Note: The Laravel route is already /api/admin/products, so don't double up
        const url = `${API_URL}/admin/products${queryString ? `?${queryString}` : ''}`
        
        console.log('GET Request URL:', url)

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
            credentials: "include",
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error("Error fetching products:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch products" },
            { status: 500 }
        )
    }
}


// Optional: POST endpoint for creating products (admin only)
export async function POST(request: NextRequest) {
  try {
    // Get token from HTTP-only cookie
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated. Please log in again." },
        { status: 401 }
      )
    }

    const body = await request.json()

    console.log("Creating product:", {
      hasAuth: !!token,
      productName: body.name,
    })

    const response = await fetch(`${API_URL}/users/merchandize`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(body),
    })

    // Get raw text first
    const responseText = await response.text()
    
    console.log("Laravel create product response:", {
      status: response.status,
      contentType: response.headers.get("content-type"),
      textLength: responseText.length,
      textPreview: responseText.substring(0, 200),
    })

    // Handle empty response
    if (!responseText || responseText.trim() === "") {
      if (response.ok) {
        return NextResponse.json({
          success: true,
          message: "Product created successfully",
        })
      } else {
        return NextResponse.json(
          {
            success: false,
            message: `Server returned status ${response.status} with empty response`,
          },
          { status: response.status }
        )
      }
    }

    // Try to parse as JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      console.error("Raw response:", responseText)
      
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON response from server",
          debug: {
            status: response.status,
            preview: responseText.substring(0, 500),
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error creating product:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create product",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}