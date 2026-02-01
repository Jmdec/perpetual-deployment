import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
  
    

    const body = await request.json()

    // Forward request to Laravel backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/legitimacy/verify`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
    
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "include",
        body: JSON.stringify({
          fraternity_number: body.fraternity_number,
            name: body.name,
            email: body.email,
        }),
      }
    )

    const contentType = response.headers.get("content-type")
    let data

    if (contentType && contentType.includes("application/json")) {
      data = await response.json()
    } else {
      const text = await response.text()
      console.error("Non-JSON response from Laravel:", text)
      return NextResponse.json(
        { success: false, message: "Invalid response from server" },
        { status: 500 }
      )
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to verify user",
          errors: data.errors,
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error verifying user:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
