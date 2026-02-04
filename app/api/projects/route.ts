import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.API_URL || "http://localhost:8000"

// Helper to check if response is JSON
function isJsonResponse(response: Response): boolean {
  const contentType = response.headers.get("content-type")
  return contentType?.includes("application/json") ?? false
}

// Helper to safely parse response
async function parseResponse(response: Response) {
  const responseText = await response.text()
  
  if (!responseText) {
    throw new Error("Empty response from server")
  }

  // Check if it's HTML (error page)
  if (responseText.trim().startsWith("<!DOCTYPE") || responseText.trim().startsWith("<html")) {
    throw new Error("Server returned HTML instead of JSON. The API endpoint may not exist or the server may be misconfigured.")
  }

  try {
    return JSON.parse(responseText)
  } catch {
    throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`)
  }
}

export async function GET() {
  try {
    console.log("[v0] Projects API GET - Fetching from:", `${API_URL}/api/projects`)

    const response = await fetch(`${API_URL}/api/projects`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    console.log("[v0] Projects API GET - Response status:", response.status)
    console.log("[v0] Projects API GET - Content-Type:", response.headers.get("content-type"))

    // Check if response is JSON
    if (!isJsonResponse(response)) {
      const text = await response.text()
      console.error("[v0] Projects API GET - Non-JSON response:", text.substring(0, 200))
      return NextResponse.json(
        { 
          error: "Server returned non-JSON response",
          details: "The backend API is not responding correctly. Please check if the server is running and the endpoint exists.",
          receivedContentType: response.headers.get("content-type")
        },
        { status: 502 } // Bad Gateway
      )
    }

    const data = await parseResponse(response)

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.message || "Failed to fetch projects",
          details: data.errors || data,
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Projects API GET - Error:", error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === "AbortError" || error.name === "TimeoutError") {
        return NextResponse.json(
          { 
            error: "Request timeout",
            details: "The backend server did not respond in time. Please check if it's running."
          },
          { status: 504 }
        )
      }
      
      if (error.message.includes("fetch failed") || error.message.includes("ECONNREFUSED")) {
        return NextResponse.json(
          { 
            error: "Cannot connect to backend server",
            details: `Failed to connect to ${API_URL}/api/projects. Please ensure the backend server is running.`,
            apiUrl: API_URL
          },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Unknown error",
        type: error instanceof Error ? error.constructor.name : "Unknown"
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    console.log("[v0] Projects API POST - Sending request to:", `${API_URL}/api/projects`)
    console.log("[v0] Projects API POST - FormData entries:")
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`[v0]   ${key}: File(${value.name}, ${value.size} bytes)`)
      } else {
        console.log(`[v0]   ${key}: ${value}`)
      }
    }

    const response = await fetch(`${API_URL}/api/projects`, {
      method: "POST",
      body: formData,
      // Add timeout
      signal: AbortSignal.timeout(30000), // 30 second timeout for uploads
    })

    console.log("[v0] Projects API POST - Response status:", response.status)
    console.log("[v0] Projects API POST - Content-Type:", response.headers.get("content-type"))

    // Check if response is JSON
    if (!isJsonResponse(response)) {
      const text = await response.text()
      console.error("[v0] Projects API POST - Non-JSON response:", text.substring(0, 200))
      return NextResponse.json(
        { 
          error: "Server returned non-JSON response",
          details: "The backend API is not responding correctly. Please check if the server is running and the endpoint exists.",
          receivedContentType: response.headers.get("content-type")
        },
        { status: 502 }
      )
    }

    const data = await parseResponse(response)

    if (!response.ok) {
      console.log("[v0] Projects API POST - Error response:", data)
      return NextResponse.json(
        {
          error: data.message || "Failed to create project",
          details: data.errors || data,
          status: response.status,
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Projects API POST - Error:", error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === "AbortError" || error.name === "TimeoutError") {
        return NextResponse.json(
          { 
            error: "Request timeout",
            details: "The upload took too long. Please try with a smaller file or check your connection."
          },
          { status: 504 }
        )
      }
      
      if (error.message.includes("fetch failed") || error.message.includes("ECONNREFUSED")) {
        return NextResponse.json(
          { 
            error: "Cannot connect to backend server",
            details: `Failed to connect to ${API_URL}/api/projects. Please ensure the backend server is running.`,
            apiUrl: API_URL
          },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        type: error instanceof Error ? error.constructor.name : "Unknown",
      },
      { status: 500 }
    )
  }
}