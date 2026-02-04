import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

async function getAuthToken() {
  const cookieStore = await cookies()
  return cookieStore.get("auth_token")?.value
}

export async function GET(request: NextRequest) {
  try {
    console.log("[Objectives API] GET - Fetching from:", `${API_URL}/objectives`)

    const token = await getAuthToken()

    // Use public endpoint for unauthenticated requests, admin endpoint for authenticated
    const endpoint = token ? `${API_URL}/objectives/show` : `${API_URL}/objectives`
    
    console.log("[Objectives API] GET - Fetching from:", endpoint)

    const headers: any = {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(endpoint, {
      method: "GET",
      headers,
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

    // Parse JSON strings back to arrays when reading from Laravel
    if (data.success && data.data) {
      try {
        data.data.goals_card_icon = typeof data.data.goals_card_icon === 'string'
          ? JSON.parse(data.data.goals_card_icon)
          : data.data.goals_card_icon || []

        data.data.goals_card_title = typeof data.data.goals_card_title === 'string'
          ? JSON.parse(data.data.goals_card_title)
          : data.data.goals_card_title || []

        data.data.goals_card_content = typeof data.data.goals_card_content === 'string'
          ? JSON.parse(data.data.goals_card_content)
          : data.data.goals_card_content || []

        data.data.goals_card_list = typeof data.data.goals_card_list === 'string'
          ? JSON.parse(data.data.goals_card_list)
          : data.data.goals_card_list || []
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

    // Send arrays as-is to Laravel - Laravel will handle JSON encoding
    console.log("[Goals API] POST - Sending to:", `${API_URL}/goals`)
    console.log("[Goals API] POST - Payload:", JSON.stringify(body, null, 2))

   const response = await fetch(`${API_URL}/goals`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify(body),
  })

    const responseText = await response.text()
    console.log("[Goals API] POST - Status:", response.status)
    console.log("[Goals API] POST - Response:", responseText.substring(0, 500))

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText)
        console.log("[Goals API] POST - Error data:", errorData)
        return NextResponse.json(
          {
            success: false,
            error: errorData.message || "Failed to create goals data",
            details: errorData.errors || errorData,
          },
          { status: response.status },
        )
      } catch {
        console.log("[Goals API] POST - HTML error response")
        return NextResponse.json(
          {
            success: false,
            error: "Server returned an error. Check Laravel logs for details.",
            isHtmlError: responseText.includes("<html") || responseText.includes("<!DOCTYPE"),
          },
          { status: response.status },
        )
      }
    }

    const data = JSON.parse(responseText)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Goals API] POST - Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Send arrays as-is to Laravel - Laravel will handle JSON encoding
    console.log("[Goals API] PUT - Sending to:", `${API_URL}/goals`)
    console.log("[Goals API] PUT - Payload:", JSON.stringify(body, null, 2))

    const response = await fetch(`${API_URL}/goals`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const responseText = await response.text()
    console.log("[Goals API] PUT - Status:", response.status)
    console.log("[Goals API] PUT - Response:", responseText.substring(0, 500))

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
          {
            success: false,
            error: "Server returned an error. Check Laravel logs for details.",
            isHtmlError: responseText.includes("<html") || responseText.includes("<!DOCTYPE"),
          },
          { status: response.status },
        )
      }
    }

    const data = JSON.parse(responseText)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Goals API] PUT - Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("[Goals API] DELETE - Sending to:", `${API_URL}/goals`)

    const response = await fetch(`${API_URL}/goals`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    })

    const responseText = await response.text()
    console.log("[Goals API] DELETE - Status:", response.status)

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
          {
            success: false,
            error: "Server returned an error. Check Laravel logs for details.",
          },
          { status: response.status },
        )
      }
    }

    const data = JSON.parse(responseText)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Goals API] DELETE - Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}