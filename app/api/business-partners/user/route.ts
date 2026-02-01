import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Business Partners - User Access 
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const queryParams = url.searchParams.toString()

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/business-partners?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    const data = await res.json()
    console.log("Laravel response:", data)

    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error("Server error:", err)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
