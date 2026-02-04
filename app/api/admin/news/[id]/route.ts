import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// GET - Fetch single news
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // CRITICAL FIX: Await params in Next.js 15+
    const { id } = await params
    
    const endpoint = `${API_URL}/admin/news/${id}`
    console.log("[Admin News ID] GET - Fetching:", endpoint)

    const token = request.cookies.get('auth_token')?.value

    if (!token) {
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
    console.log("[Admin News ID] GET - Response status:", response.status)

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText)
        return NextResponse.json(
          {
            success: false,
            message: errorData.message || "Failed to fetch news",
          },
          { status: response.status }
        )
      } catch {
        return NextResponse.json(
          { success: false, message: "Failed to fetch news" },
          { status: response.status }
        )
      }
    }

    const data = JSON.parse(responseText)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Admin News ID] GET - Error:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// POST - Update news (for FormData with file uploads)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // CRITICAL FIX: Await params in Next.js 15+
    const { id } = await params
    
    console.log("[Admin News ID] POST - News ID from params:", id)
    
    if (!id || id === 'undefined') {
      console.error("[Admin News ID] POST - Invalid ID:", id)
      return NextResponse.json(
        { success: false, message: "Invalid news ID" },
        { status: 400 }
      )
    }
    
    const formData = await request.formData()

    // Add _method field for Laravel to treat as PUT/PATCH
    formData.append('_method', 'PUT')

    console.log("[Admin News ID] POST - Updating news:", id)
    console.log("[Admin News ID] FormData entries:")
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`)
      } else {
        console.log(`  ${key}: ${value}`)
      }
    }

    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    const endpoint = `${API_URL}/admin/news/${id}`
    console.log("[Admin News ID] POST - Endpoint:", endpoint)

    // Don't set Content-Type for FormData - browser handles multipart boundary
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const responseText = await response.text()
    console.log("[Admin News ID] POST - Response status:", response.status)
    console.log("[Admin News ID] POST - Response preview:", responseText.substring(0, 500))

    if (!response.ok) {
      console.error("[Admin News ID] POST - Error response:", responseText)
      try {
        const errorData = JSON.parse(responseText)
        console.log("[Admin News ID] POST - Parsed error:", errorData)
        return NextResponse.json(
          {
            success: false,
            message: errorData.message || "Failed to update news",
            errors: errorData.errors || errorData,
          },
          { status: response.status }
        )
      } catch {
        return NextResponse.json(
          {
            success: false,
            message: "Server error (check Laravel logs)",
          },
          { status: response.status }
        )
      }
    }

    const data = JSON.parse(responseText)
    console.log("[Admin News ID] POST - Success!")
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Admin News ID] POST - Error:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete news
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // CRITICAL FIX: Await params in Next.js 15+
    const { id } = await params
    
    const endpoint = `${API_URL}/admin/news/${id}`
    console.log("[Admin News ID] DELETE - Deleting:", endpoint)

    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const responseText = await response.text()
    console.log("[Admin News ID] DELETE - Response status:", response.status)

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText)
        return NextResponse.json(
          {
            success: false,
            message: errorData.message || "Failed to delete news",
          },
          { status: response.status }
        )
      } catch {
        return NextResponse.json(
          { success: false, message: "Failed to delete news" },
          { status: response.status }
        )
      }
    }

    const data = JSON.parse(responseText)
    console.log("[Admin News ID] DELETE - Success!")
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Admin News ID] DELETE - Error:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}