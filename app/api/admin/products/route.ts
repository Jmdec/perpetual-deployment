// app/api/admin/products/route.ts
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:8000/api"

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const queryString = searchParams.toString()
        const cookieStore = await cookies()
        const token = cookieStore.get("auth_token")?.value

        if (!token) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        // Note: The Laravel route is already /api/admin/products, so don't double up
        const url = `${API_URL}/admin/products${queryString ? `?${queryString}` : ''}`
        
        console.log('GET Request URL:', url)

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
            credentials: "include",
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error("Error fetching products:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch products" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const cookieStore = await cookies()
        const token = cookieStore.get("auth_token")?.value

        if (!token) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        // Debug logging
        console.log('=== Product Creation Debug ===')
        console.log('API URL:', API_URL)
        console.log('Token exists:', !!token)
        console.log('FormData entries:')
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`)
            } else {
                console.log(`  ${key}:`, value)
            }
        }

        const url = `${API_URL}/admin/products`
        console.log('POST Request URL:', url)

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
            body: formData,
        })

        console.log('Response Status:', response.status)
        console.log('Response Headers:', Object.fromEntries(response.headers.entries()))

        let data
        const contentType = response.headers.get('content-type')
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json()
        } else {
            const text = await response.text()
            console.error('Non-JSON response:', text)
            return NextResponse.json(
                { 
                    success: false, 
                    message: "Server returned non-JSON response",
                    details: text.substring(0, 500) // First 500 chars for debugging
                },
                { status: 500 }
            )
        }

        console.log('Response Data:', data)

        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error("Error creating product:", error)
        return NextResponse.json(
            { 
                success: false, 
                message: "Failed to create product",
                error: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        )
    }
}