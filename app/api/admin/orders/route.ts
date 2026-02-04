// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            )
        }

        // Get query parameters from the request
        const searchParams = request.nextUrl.searchParams
        const params = new URLSearchParams()
        
        // Forward all query parameters
        searchParams.forEach((value, key) => {
            params.append(key, value)
        })

        const url = `${API_URL}/admin/orders?${params.toString()}`
        console.log('Fetching admin orders from:', url)

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        })

        console.log('Response status:', response.status)

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to fetch orders' }))
            return NextResponse.json(
                {
                    success: false,
                    message: errorData.message || "Failed to fetch orders",
                },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data, { status: 200 })
    } catch (error: any) {
        console.error("Error fetching admin orders:", error)
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Internal server error",
            },
            { status: 500 }
        )
    }
}