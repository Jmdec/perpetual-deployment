import { NextResponse, NextRequest } from "next/server"
import { cookies } from "next/headers"

export const runtime = "nodejs"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function proxy(req: NextRequest, method: "GET" | "POST" | "PUT" | "DELETE") {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth_token')?.value
  const cookie = req.headers.get("cookie") ?? ""

  const options: RequestInit = {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
  }

  if (method !== "GET" && method !== "DELETE") {
    const body = await req.json()
    options.body = JSON.stringify(body)
  }

  try {
    const res = await fetch(`${API_URL}/juantap`, options)
    const text = await res.text()

    let data
    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      console.error("Laravel returned non-JSON:", text)
      return NextResponse.json(
        { message: "Invalid backend response" },
        { status: 502 }
      )
    }

    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error("Proxy fetch error:", err)
    return NextResponse.json(
      { message: "Failed to reach backend" },
      { status: 502 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    return await proxy(req, "GET")
  } catch (err) {
    console.error("GET/juantap error:", err)
    return NextResponse.json(
      { message: "JuanTap proxy failed" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    return await proxy(req, "POST")
  } catch (err) {
    console.error("POST/juantap error:", err)
    return NextResponse.json(
      { message: "JuanTap proxy failed" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    return await proxy(req, "PUT")
  } catch (err) {
    console.error("PUT/juantap error:", err)
    return NextResponse.json(
      { message: "JuanTap proxy failed" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    return await proxy(req, "DELETE")
  } catch (err) {
    console.error("DELETE/juantap error:", err)
    return NextResponse.json(
      { message: "JuanTap proxy failed" },
      { status: 500 }
    )
  }
}
