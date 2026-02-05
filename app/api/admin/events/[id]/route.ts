import { type NextRequest, NextResponse } from "next/server"

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookie = req.headers.get("cookie") || ""
    const eventId = params.id

    const response = await fetch(`${LARAVEL_API_URL}/api/admin/events/${eventId}`, {
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookie = req.headers.get("cookie") || ""
    const eventId = params.id
    const data = await req.json()

    const response = await fetch(`${LARAVEL_API_URL}/api/admin/events/${eventId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookie = req.headers.get("cookie") || ""
    const eventId = params.id

    const response = await fetch(`${LARAVEL_API_URL}/api/admin/events/${eventId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
