import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    console.log('Deleting announcement:', id)

    const response = await fetch(`${LARAVEL_API_URL}/announcements/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
      },
    })

    console.log('Laravel delete response status:', response.status)

    // Handle empty response body
    const text = await response.text()
    let data

    if (text) {
      try {
        data = JSON.parse(text)
      } catch (e) {
        console.error('Failed to parse response as JSON:', text)
        data = { message: text }
      }
    } else {
      // Empty response is considered success for DELETE
      data = { success: true, message: "Announcement deleted successfully" }
    }

    console.log('Laravel delete response data:', data)

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to delete announcement",
          error: data
        },
        { status: response.status }
      )
    }

    return NextResponse.json(
      { success: true, message: "Announcement deleted successfully", data },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting announcement:", error)
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete announcement",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// Handle POST for updates (with _method=PATCH from frontend)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const formData = await request.formData()

    console.log('Updating announcement:', id)

    // Forward to Laravel with POST + _method=PATCH
    const response = await fetch(`${LARAVEL_API_URL}/announcements/${id}`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
      },
      body: formData,
    })

    console.log('Laravel update response status:', response.status)

    const text = await response.text()
    let data

    if (text) {
      try {
        data = JSON.parse(text)
      } catch (e) {
        console.error('Failed to parse response as JSON:', text)
        data = { message: text }
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || "Failed to update announcement",
          error: data
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error updating announcement:", error)
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update announcement",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// Keep PATCH handler for direct PATCH requests (optional)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()

    console.log('Patching announcement:', id)

    const response = await fetch(`${LARAVEL_API_URL}/announcements/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(body),
    })

    console.log('Laravel patch response status:', response.status)

    const data = await response.json()
    console.log('Laravel patch response data:', data)

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to update announcement",
          error: data
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error updating announcement:", error)
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update announcement",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}