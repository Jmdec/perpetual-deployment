import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API = process.env.NEXT_PUBLIC_API_URL!

type Context = {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, { params }: Context) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }
  const formData = await req.formData()
  formData.append("_method", "PUT")

  try {
    const res = await fetch(`${API}/admin/galleries/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ message: "Failed to update gallery" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }
  try {
    const res = await fetch(`${API}/admin/galleries/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ message: "Failed to delete gallery" }, { status: 500 })
  }
}
