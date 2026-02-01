import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

/* ===================== POST (UPDATE) ===================== */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  if (!id || id === "undefined") {
    return NextResponse.json(
      { success: false, message: "Invalid ID" },
      { status: 400 }
    )
  }

  const cookieStore = cookies()
  const authToken = (await cookieStore).get("auth_token")

  if (!authToken) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    )
  }

  const formData = await request.formData()
  formData.append("_method", "PUT") // Laravel spoofing

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/legitimacy/${id}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${authToken.value}`,
        "X-Requested-With": "XMLHttpRequest",
      },
      body: formData,
    }
  )

  const text = await response.text()

  return new NextResponse(text, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  })
}

/* ===================== DELETE ===================== */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const cookieStore = cookies()
    const authToken = (await cookieStore).get("auth_token")

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/legitimacy/${id}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${authToken.value}`,
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    )

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
