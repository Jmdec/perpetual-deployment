// app/api/admin/products/route.ts
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:8000/api"


export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  const { id } = params

  if (!id || id === "undefined") {
    return NextResponse.json(
      { success: false, message: "Invalid ID" },
      { status: 400 }
    )
  }

  const cookieStore = await cookies()
  const authToken = cookieStore.get("auth_token")

  if (!authToken) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    )
  }

  const formData = await request.formData()
  formData.append("_method", "PUT") // Laravel spoofing

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/products/${id}`,
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


export async function DELETE(
    _request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const { id } = params 

        const cookieStore = await cookies()
        const authToken = cookieStore.get("auth_token")

        if (!authToken) {
            return NextResponse.json(
                { success: false, message: "Authentication required" },
                { status: 401 }
            )
        }
        const response = await fetch(
            `${API_URL}/admin/products/${id}`,
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
        console.error("Error creating product:", error)
        return NextResponse.json(
            { success: false, message: "Failed to create product" },
            { status: 500 }
        )
    }
}