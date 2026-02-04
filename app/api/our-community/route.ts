import { type NextRequest, NextResponse } from "next/server"

import { cookies } from "next/headers"

async function getAuthToken() {
  const cookieStore = await cookies()
  return cookieStore.get("auth_token")?.value
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function GET(request: NextRequest) {
  try {
    console.log("[Community API] GET - Fetching from:", `${API_URL}/our-community`)

    const token = await getAuthToken()

    // Use public endpoint for unauthenticated requests, admin endpoint for authenticated
    const endpoint = token ? `${API_URL}/our-community/show` : `${API_URL}/our-community`
    
    console.log("[Community API] GET - Fetching from:", endpoint)

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
    })

    const responseText = await response.text()
    console.log("[Community API] GET - Response status:", response.status)

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText)
        return NextResponse.json(
          {
            success: false,
            error: errorData.message || "Failed to fetch community data",
            details: errorData.errors || errorData,
          },
          { status: response.status },
        )
      } catch {
        return NextResponse.json(
          { success: false, error: "Failed to fetch community data from server" },
          { status: response.status }
        )
      }
    }

    const data = JSON.parse(responseText)

    // Parse JSON strings back to arrays when reading from Laravel
    if (data.success && data.data) {
      try {
        data.data.community_list = typeof data.data.community_list === 'string'
          ? JSON.parse(data.data.community_list)
          : data.data.community_list || []

        data.data.community_card_icon = typeof data.data.community_card_icon === 'string'
          ? JSON.parse(data.data.community_card_icon)
          : data.data.community_card_icon || []

        data.data.community_card_number = typeof data.data.community_card_number === 'string'
          ? JSON.parse(data.data.community_card_number)
          : data.data.community_card_number || []

        data.data.community_card_category = typeof data.data.community_card_category === 'string'
          ? JSON.parse(data.data.community_card_category)
          : data.data.community_card_category || []
      } catch (parseError) {
        console.error("[Community API] GET - Error parsing arrays:", parseError)
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[Community API] GET - Error:", error)
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

    // Convert arrays to JSON strings before sending to Laravel
    const processedBody = {
      ...body,
      community_list: Array.isArray(body.community_list)
        ? JSON.stringify(body.community_list)
        : body.community_list,
      community_card_icon: Array.isArray(body.community_card_icon)
        ? JSON.stringify(body.community_card_icon)
        : body.community_card_icon,
      community_card_number: Array.isArray(body.community_card_number)
        ? JSON.stringify(body.community_card_number)
        : body.community_card_number,
      community_card_category: Array.isArray(body.community_card_category)
        ? JSON.stringify(body.community_card_category)
        : body.community_card_category,
    }

    console.log("[Community API] POST - Sending to:", `${API_URL}/our-community`)
    console.log("[Community API] POST - Payload:", JSON.stringify(processedBody, null, 2))

    const response = await fetch(`${API_URL}/our-community`, {
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
    console.log("[Community API] POST - Status:", response.status)
    console.log("[Community API] POST - Response:", responseText.substring(0, 500))

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText)
        console.log("[Community API] POST - Error data:", errorData)
        return NextResponse.json(
          {
            success: false,
            error: errorData.message || "Failed to create community data",
            details: errorData.errors || errorData,
          },
          { status: response.status },
        )
      } catch {
        console.log("[Community API] POST - HTML error response")
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
    console.error("[Community API] POST - Error:", error)
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
    const token = await getAuthToken()

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Convert arrays to JSON strings before sending to Laravel
    const processedBody = {
      ...body,
      community_list: Array.isArray(body.community_list)
        ? JSON.stringify(body.community_list)
        : body.community_list,
      community_card_icon: Array.isArray(body.community_card_icon)
        ? JSON.stringify(body.community_card_icon)
        : body.community_card_icon,
      community_card_number: Array.isArray(body.community_card_number)
        ? JSON.stringify(body.community_card_number)
        : body.community_card_number,
      community_card_category: Array.isArray(body.community_card_category)
        ? JSON.stringify(body.community_card_category)
        : body.community_card_category,
    }

    console.log("[Community API] PUT - Sending to:", `${API_URL}/our-community`)
    console.log("[Community API] PUT - Payload:", JSON.stringify(processedBody, null, 2))

    const response = await fetch(`${API_URL}/our-community`, {
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
    console.log("[Community API] PUT - Status:", response.status)
    console.log("[Community API] PUT - Response:", responseText.substring(0, 500))

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText)
        return NextResponse.json(
          {
            success: false,
            error: errorData.message || "Failed to update community data",
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
    console.error("[Community API] PUT - Error:", error)
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
    console.log("[Community API] DELETE - Sending to:", `${API_URL}/our-community`)

    const token = await getAuthToken()

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const response = await fetch(`${API_URL}/our-community`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
      },
    })

    const responseText = await response.text()
    console.log("[Community API] DELETE - Status:", response.status)

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText)
        return NextResponse.json(
          {
            success: false,
            error: errorData.message || "Failed to delete community data",
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
    console.error("[Community API] DELETE - Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}