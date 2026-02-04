import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const PUT = async (req: NextRequest, { params }: { params: { id: string } | Promise<{ id: string }> }) => {
  const resolvedParams = await params
  return proxyUpdate(req, resolvedParams.id)
}

//  DELETE VLOG
export const DELETE = async (req: NextRequest, { params }: { params: { id: string } | Promise<{ id: string }> }) => {
  const resolvedParams = await params
  const id = resolvedParams.id
  const token = req.cookies.get("auth_token")?.value

  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  try {
    const res = await fetch(`${API_URL}/admin/vlogs/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// SHARED UPDATE PROXY
async function proxyUpdate(req: NextRequest, id: string) {
  const token = req.cookies.get("auth_token")?.value

  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  try {
    let body: BodyInit

    const contentType = req.headers.get("content-type") || ""

    if (contentType.includes("multipart/form-data")) {
      body = await req.formData()
    } else {
      const json = await req.json()
      body = JSON.stringify(json)
    }

    const backendRes = await fetch(`${API_URL}/admin/vlogs/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body,
    })

    const data = await backendRes.json()
    return NextResponse.json(data, { status: backendRes.status })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
