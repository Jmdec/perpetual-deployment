import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const response = await fetch(`${API_URL}/api/health/${id}`)
    if (!response.ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching health:", error)
    return NextResponse.json({ error: "Failed to fetch health" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const response = await fetch(`${API_URL}/api/health/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("[v0] Error updating health:", error)
    return NextResponse.json({ error: "Failed to update health" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const response = await fetch(`${API_URL}/api/health/${id}`, {
      method: "DELETE",
    })
    return NextResponse.json({ success: true }, { status: response.status })
  } catch (error) {
    console.error("[v0] Error deleting health:", error)
    return NextResponse.json({ error: "Failed to delete health" }, { status: 500 })
  }
}