// app/api/users/orders/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            )
        }

        console.log('Fetching orders from:', `${API_URL}/users/orders`)

        const response = await fetch(`${API_URL}/users/orders`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
            cache: "no-store", // Ensure fresh data
        })

        console.log('Response status:', response.status)

        // Check if response is JSON
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text()
            console.error('Non-JSON response:', text.substring(0, 500))
            return NextResponse.json(
                {
                    success: false,
                    message: "Backend server error",
                },
                { status: 500 }
            )
        }

        const data = await response.json()
        
        // Return the data with the same status code from Laravel
        return NextResponse.json(data, { status: response.status })
    } catch (error: any) {
        console.error("Error fetching orders:", error)
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to fetch orders",
            },
            { status: 500 }
        )
    }
}