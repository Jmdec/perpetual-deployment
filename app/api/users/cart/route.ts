import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // ✅ Use /cart (without /api prefix)
    const response = await fetch(`${API_URL}/cart`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error("❌ Error in cart API route:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch cart items",
        error: String(error),
      },
      { status: 500 }
    )
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("auth_token")?.value

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized - Please log in" },
                { status: 401 }
            )
        }

        const body = await request.json()

        // ✅ Fixed: Use /cart instead of /users/cart
        const response = await fetch(`${API_URL}/cart`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })

    } catch (error) {
        console.error("Error adding to cart:", error)
        return NextResponse.json(
            { success: false, message: "Failed to add item to cart" },
            { status: 500 }
        )
    }
}