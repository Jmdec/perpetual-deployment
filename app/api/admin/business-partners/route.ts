import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const queryParams = url.searchParams.toString()

    console.log("Fetching admin businesses from:", `${API_URL}/admin/business-partners${queryParams ? '?' + queryParams : ''}`)

    const res = await fetch(`${API_URL}/admin/business-partners${queryParams ? '?' + queryParams : ''}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    })

    console.log("Laravel response status:", res.status)

    const contentType = res.headers.get("content-type")
    let data

    if (contentType?.includes("application/json")) {
      data = await res.json()
      console.log("Laravel response data:", data)
    } else {
      const text = await res.text()
      console.error("Non-JSON response from Laravel:", text)
      return NextResponse.json({
        success: false,
        message: "Invalid response from server",
        debug: text.substring(0, 500) // First 500 chars for debugging
      }, { status: 500 })
    }

    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error("Server error:", err)
    return NextResponse.json({
      success: false,
      message: "Server error",
      error: err instanceof Error ? err.message : "Unknown error",
      details: err instanceof Error ? err.stack : undefined
    }, { status: 500 })
  }
}