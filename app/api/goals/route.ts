import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

async function getAuthToken() {
  const cookieStore = await cookies()
  return cookieStore.get("auth_token")?.value
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function GET(request: NextRequest) {
  try {
    console.log("[Goals API] GET - Fetching from:", `${API_URL}/goals`)

    const response = await fetch(`${API_URL}/goals`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      cache: "no-store",
    })

    const responseText = await response.text()
    console.log("[Goals API] GET - Response status:", response.status)

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText)
        return NextResponse.json(
          {
            success: false,
            error: errorData.message || "Failed to fetch goals data",
            details: errorData.errors || errorData,
          },
          { status: response.status },
        )
      } catch {
        return NextResponse.json(
          { success: false, error: "Failed to fetch goals data from server" },
          { status: response.status }
        )
      }
    }

    const data = JSON.parse(responseText)

    // Parse JSON strings back to arrays
    if (data.success && data.data) {
      try {
        const fields = ['goals_card_icon', 'goals_card_title', 'goals_card_content', 'goals_card_list']
        
        fields.forEach(field => {
          if (data.data[field]) {
            data.data[field] = typeof data.data[field] === 'string'
              ? JSON.parse(data.data[field])
              : data.data[field] || []
          }
        })
      } catch (parseError) {
        console.error("[Goals API] GET - Error parsing arrays:", parseError)
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[Goals API] GET - Error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthToken()

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Convert arrays to JSON strings
    const processedBody = {
      ...body,
      goals_card_icon: Array.isArray(body.goals_card_icon)
        ? JSON.stringify(body.goals_card_icon)
        : body.goals_card_icon,
      goals_card_title: Array.isArray(body.goals_card_title)
        ? JSON.stringify(body.goals_card_title)
        : body.goals_card_title,
      goals_card_content: Array.isArray(body.goals_card_content)
        ? JSON.stringify(body.goals_card_content)
        : body.goals_card_content,
      goals_card_list: Array.isArray(body.goals_card_list)
        ? JSON.stringify(body.goals_card_list)
        : body.goals_card_list,
    }

    const response = await fetch(`${API_URL}/goals`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(processedBody),
    })

    const responseText = await response.text()

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText)
        return NextResponse.json(
          {
            success: false,
            error: errorData.message || "Failed to create goals data",
            details: errorData.errors || errorData,
          },
          { status: response.status },
        )
      } catch {
        return NextResponse.json(
          { success: false, error: "Server error" },
          { status: response.status },
        )
      }
    }

    const data = JSON.parse(responseText)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Goals API] POST - Error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = await getAuthToken()

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Convert arrays to JSON strings
    const processedBody = {
      ...body,
      goals_card_icon: Array.isArray(body.goals_card_icon)
        ? JSON.stringify(body.goals_card_icon)
        : body.goals_card_icon,
      goals_card_title: Array.isArray(body.goals_card_title)
        ? JSON.stringify(body.goals_card_title)
        : body.goals_card_title,
      goals_card_content: Array.isArray(body.goals_card_content)
        ? JSON.stringify(body.goals_card_content)
        : body.goals_card_content,
      goals_card_list: Array.isArray(body.goals_card_list)
        ? JSON.stringify(body.goals_card_list)
        : body.goals_card_list,
    }

    const response = await fetch(`${API_URL}/goals`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(processedBody),
    })

    const responseText = await response.text()

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText)
        return NextResponse.json(
          {
            success: false,
            error: errorData.message || "Failed to update goals data",
            details: errorData.errors || errorData,
          },
          { status: response.status },
        )
      } catch {
        return NextResponse.json(
          { success: false, error: "Server error" },
          { status: response.status },
        )
      }
    }

    const data = JSON.parse(responseText)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Goals API] PUT - Error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await getAuthToken()

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const response = await fetch(`${API_URL}/goals`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
      },
    })

    const responseText = await response.text()

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText)
        return NextResponse.json(
          {
            success: false,
            error: errorData.message || "Failed to delete goals data",
            details: errorData.errors || errorData,
          },
          { status: response.status },
        )
      } catch {
        return NextResponse.json(
          { success: false, error: "Server error" },
          { status: response.status },
        )
      }
    }

    const data = JSON.parse(responseText)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Goals API] DELETE - Error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}