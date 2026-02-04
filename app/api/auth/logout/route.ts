import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  const cookieStore = await cookies()
  
  // Clear the auth token cookie
  cookieStore.delete('auth_token')
  
  return NextResponse.json({ success: true, message: "Logged out successfully" })
}

// app/api/auth/me/route.ts - Get current user
