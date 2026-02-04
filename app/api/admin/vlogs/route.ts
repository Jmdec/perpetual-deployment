import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const queryParams = url.searchParams.toString()

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/vlogs?${queryParams}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    })

    const data = await res.json()

    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("Fetch vlogs error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export const POST = async (req: NextRequest) => {
  const token = req.cookies.get("auth_token")?.value

  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()

  try {
    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/vlogs/chunk-upload`, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    const data = await backendRes.json()

    return NextResponse.json(data, { status: backendRes.status })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
