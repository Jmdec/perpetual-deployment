import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()
    
    // Construct the full endpoint URL
    const endpoint = `${API_URL}/news/published${queryString ? `?${queryString}` : ''}`
    
    console.log("=".repeat(50))
    console.log("[News API] 🔍 Fetching from:", endpoint)
    console.log("[News API] 📍 Base API_URL:", API_URL)
    console.log("[News API] 🔗 Query params:", queryString)
    console.log("=".repeat(50))

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: 'no-store'
    })

    const responseText = await response.text()
    console.log("[News API] ✅ Response status:", response.status)
    console.log("[News API] 📝 Response preview:", responseText.substring(0, 500))

    if (!response.ok) {
      console.error("[News API] ❌ Error - Full response:", responseText)
      try {
        const errorData = JSON.parse(responseText)
        return NextResponse.json(
          {
            success: false,
            error: errorData.message || "Failed to fetch news",
            details: errorData.errors || errorData,
          },
          { status: response.status },
        )
      } catch {
        return NextResponse.json(
          { 
            success: false,
            error: "Failed to fetch news from server",
            details: responseText 
          }, 
          { status: response.status }
        )
      }
    }

    const data = JSON.parse(responseText)
    console.log("[News API] 🎉 Success! News items:", data.data?.data?.length || 0)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[News API] 💥 Fatal error:", error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    )
  }
}