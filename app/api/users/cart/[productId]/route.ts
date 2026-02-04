// app/api/users/cart/[productId]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { quantity } = await request.json()

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, message: "Invalid quantity" },
        { status: 400 }
      )
    }

    // Fixed: Use /cart/{productId} instead of /api/cart/{productId}
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/cart/${(await params).productId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ quantity }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to update cart" },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Cart updated successfully",
      data: data.data,
    })
  } catch (error: any) {
    console.error("Update cart error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }
      console.log("Removing product ID:", (await params).productId) // Debug log


    // Fixed: Use /cart/{productId} instead of /api/cart/{productId}
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/cart/${(await params).productId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to remove item" },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
      data: data.data,
    })
  } catch (error: any) {
    console.error("Remove from cart error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}