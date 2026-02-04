import { NextResponse } from "next/server"

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
