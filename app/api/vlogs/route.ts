import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export const GET = async () => {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    console.log('API Route /api/auth/me - Token exists:', !!token)

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      )
    }


    const res = await fetch(`${API_URL}/vlogs`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      credentials: "include",
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ success: false, message: `Backend error: ${text}` }, { status: res.status })
    }

    const backendData = await res.json()
    const vlogs = backendData?.data || []

    // Rewrite video URLs to Next.js public folder
    const updatedVlogs = vlogs.map((vlog: any) => ({
      ...vlog,
      video: vlog.video
        ? `/vlogs/videos/${vlog.video.split("/").pop()}` // only keep filename
        : null,
    }))

    return NextResponse.json({ success: true, data: updatedVlogs }, { status: 200 })
  } catch (err: any) {
    console.error("API /vlogs error:", err)
    return NextResponse.json({ success: false, message: err.message || "Something went wrong" }, { status: 500 })
  }
}
