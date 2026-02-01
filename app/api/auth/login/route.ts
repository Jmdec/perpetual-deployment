import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("Login attempt:", { email: body.email, apiUrl: API_URL })

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      credentials: "include",
      body: JSON.stringify(body),
    })

    const data = await response.json()

    console.log("Laravel response:", { status: response.status, data })

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    // Store token in HTTP-only cookie
    const cookieStore = await cookies()
    
    cookieStore.set('auth_token', data.token, {
      httpOnly: true,        // Cannot be accessed by JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax',       // CSRF protection
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    // Return user data WITHOUT token (token is now in cookie)
    const responseData = {
      success: true,
      message: "Login successful",
      user: data.user,
    }

    return NextResponse.json(responseData, { status: 200 })
    
  } catch (error) {
    console.error("Login API Error:", error)
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to Laravel backend server",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}