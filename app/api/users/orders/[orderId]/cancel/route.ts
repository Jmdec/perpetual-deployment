// app/api/users/orders/[orderId]/cancel/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            )
        }

        const { orderId } = await params

        console.log('Cancelling order code:', orderId)
        console.log('Full API URL:', `${API_URL}/users/orders/${orderId}/cancel`)

        const response = await fetch(`${API_URL}/users/orders/${orderId}/cancel`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        })

        // Check if response is JSON
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text()
            console.error('Laravel returned non-JSON:', text.substring(0, 500))
            return NextResponse.json(
                {
                    success: false,
                    message: "Backend server error",
                },
                { status: 500 }
            )
        }

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error: any) {
        console.error("Error cancelling order:", error)
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to cancel order",
            },
            { status: 500 }
        )
    }
}