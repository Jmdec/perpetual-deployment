import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const backendUrl = `${LARAVEL_API_URL}/barangay-blotter/${id}`
    console.log(`[v0] Updating barangay blotter at: ${backendUrl}`, body)

    const response = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] Backend error ${response.status}: ${errorText}`)
      return NextResponse.json(
        { message: `Backend error: ${response.status}`, detail: errorText },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("[v0] Error updating barangay blotter:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
