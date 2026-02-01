import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Await params - this is the fix
    const { id } = await params
    
    const formData = await request.formData()

    console.log('[Chunk Upload - Edit] Forwarding chunk to Laravel:', {
      id: id,
      chunk_index: formData.get('chunk_index'),
      total_chunks: formData.get('total_chunks'),
      filename: formData.get('filename'),
    })

    const response = await fetch(
      `${LARAVEL_API_URL}/admin/vlogs/${id}/chunk-upload`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: formData,
      }
    )

    const data = await response.json()
    console.log('[Chunk Upload - Edit] Laravel response:', data)

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("[Chunk Upload - Edit] Error:", error)
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