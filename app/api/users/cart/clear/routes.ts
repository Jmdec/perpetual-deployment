import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// ✅ Remove /api suffix
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// DELETE - Clear cart
export async function DELETE(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("auth_token")?.value

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            )
        }

        // This will call: http://localhost:8000/cart/clear
        const response = await fetch(`${API_URL}/cart/clear`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            },
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
        
    } catch (error) {
        console.error("Error clearing cart:", error)
        return NextResponse.json(
            { success: false, message: "Failed to clear cart" },
            { status: 500 }
        )
    }
}