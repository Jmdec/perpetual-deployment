import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const LARAVEL_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// ✅ FIX — params must be awaited because Next.js passes Promise<{ id: string }>
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated. Please log in again." },
        { status: 401 }
      )
    }

    // ✅ FIX — await params
    const { id } = await context.params

    const body = await request.json()

    console.log("Updating medical assistance status:", {
      id,
      status: body.status,
      hasRejectionReason: !!body.rejection_reason,
    })

    const response = await fetch(
      `${LARAVEL_API_URL}/admin/medical-assistance/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(body),
      }
    )

    const data = await response.json()

    console.log("Laravel response:", {
      status: response.status,
      success: data.success,
      message: data.message,
    })

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}
