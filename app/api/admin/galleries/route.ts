import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API = process.env.NEXT_PUBLIC_API_URL

export async function GET() {
  try {
    const res = await fetch(`${API}/galleries`, {
      credentials: "include",
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ message: "Failed to fetch galleries" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    const formData = await req.formData()

    const res = await fetch(`${API}/admin/galleries`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      credentials: "include",
    })
const contentType = res.headers.get("content-type") || ""

    let data
    if (contentType.includes("application/json")) {
      data = await res.json()
    } else {
      // Laravel sent HTML (error page)
      const text = await res.text()
      console.error("Non-JSON response from Laravel:", text)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid response from server",
          details: text,
        },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error("Gallery POST error:", err)
    return NextResponse.json(
      { success: false, message: "Failed to create gallery", error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}