import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get the FormData from the request
    const formData = await request.formData()

    console.log('[Chunk Upload] Forwarding chunk to Laravel:', {
      chunk_index: formData.get('chunk_index'),
      total_chunks: formData.get('total_chunks'),
      filename: formData.get('filename'),
    })

    // Forward the entire FormData to Laravel
    const response = await fetch(`${LARAVEL_API_URL}/admin/vlogs/chunk-upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
      body: formData,
    })

    const data = await response.json()
    console.log('[Chunk Upload] Laravel response:', data)

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("[Chunk Upload] Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Chunk upload failed",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}