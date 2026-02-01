import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

async function getAuthToken() {
    const cookieStore = await cookies()
    return cookieStore.get("auth_token")?.value
}

export async function GET(request: NextRequest) {
    try {
        console.log("[Office Contact API] GET - Fetching from:", `${API_URL}/office-contact`)

        const token = await getAuthToken()

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            )
        }

        const response = await fetch(`${API_URL}/office-contact`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        })

        const responseText = await response.text()
        console.log("[Office Contact API] GET - Response status:", response.status)

        if (!response.ok) {
            try {
                const errorData = JSON.parse(responseText)
                return NextResponse.json(
                    {
                        success: false,
                        error: errorData.message || "Failed to fetch office contact data",
                        details: errorData.errors || errorData,
                    },
                    { status: response.status },
                )
            } catch {
                return NextResponse.json(
                    { success: false, error: "Failed to fetch office contact data from server" },
                    { status: response.status }
                )
            }
        }

        const data = JSON.parse(responseText)
        return NextResponse.json(data)
    } catch (error) {
        console.error("[Office Contact API] GET - Error:", error)
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = await getAuthToken()

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()

        console.log("[Office Contact API] POST - Sending to:", `${API_URL}/office-contact`)
        console.log("[Office Contact API] POST - Payload:", JSON.stringify(body, null, 2))

        const response = await fetch(`${API_URL}/office-contact`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "X-Requested-With": "XMLHttpRequest",
            },
            body: JSON.stringify(body),
        })

        const responseText = await response.text()
        console.log("[Office Contact API] POST - Status:", response.status)
        console.log("[Office Contact API] POST - Response:", responseText.substring(0, 500))

        if (!response.ok) {
            try {
                const errorData = JSON.parse(responseText)
                console.log("[Office Contact API] POST - Error data:", errorData)
                return NextResponse.json(
                    {
                        success: false,
                        error: errorData.message || "Failed to create office contact data",
                        details: errorData.errors || errorData,
                    },
                    { status: response.status },
                )
            } catch {
                console.log("[Office Contact API] POST - HTML error response")
                return NextResponse.json(
                    {
                        success: false,
                        error: "Server returned an error. Check Laravel logs for details.",
                        isHtmlError: responseText.includes("<html") || responseText.includes("<!DOCTYPE"),
                    },
                    { status: response.status },
                )
            }
        }

        const data = JSON.parse(responseText)
        return NextResponse.json(data)
    } catch (error) {
        console.error("[Office Contact API] POST - Error:", error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const token = await getAuthToken()

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()

        console.log("[Office Contact API] PUT - Sending to:", `${API_URL}/office-contact`)
        console.log("[Office Contact API] PUT - Payload:", JSON.stringify(body, null, 2))

        const response = await fetch(`${API_URL}/office-contact`, {
            method: "PUT",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "X-Requested-With": "XMLHttpRequest",
            },
            body: JSON.stringify(body),
        })

        const responseText = await response.text()
        console.log("[Office Contact API] PUT - Status:", response.status)
        console.log("[Office Contact API] PUT - Response:", responseText.substring(0, 500))

        if (!response.ok) {
            try {
                const errorData = JSON.parse(responseText)
                return NextResponse.json(
                    {
                        success: false,
                        error: errorData.message || "Failed to update office contact data",
                        details: errorData.errors || errorData,
                    },
                    { status: response.status },
                )
            } catch {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Server returned an error. Check Laravel logs for details.",
                        isHtmlError: responseText.includes("<html") || responseText.includes("<!DOCTYPE"),
                    },
                    { status: response.status },
                )
            }
        }

        const data = JSON.parse(responseText)
        return NextResponse.json(data)
    } catch (error) {
        console.error("[Office Contact API] PUT - Error:", error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const token = await getAuthToken()

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            )
        }

        console.log("[Office Contact API] DELETE - Sending to:", `${API_URL}/office-contact`)

        const response = await fetch(`${API_URL}/office-contact`, {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
                "X-Requested-With": "XMLHttpRequest",
            },
        })

        const responseText = await response.text()
        console.log("[Office Contact API] DELETE - Status:", response.status)

        if (!response.ok) {
            try {
                const errorData = JSON.parse(responseText)
                return NextResponse.json(
                    {
                        success: false,
                        error: errorData.message || "Failed to delete office contact data",
                        details: errorData.errors || errorData,
                    },
                    { status: response.status },
                )
            } catch {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Server returned an error. Check Laravel logs for details.",
                    },
                    { status: response.status },
                )
            }
        }

        const data = JSON.parse(responseText)
        return NextResponse.json(data)
    } catch (error) {
        console.error("[Office Contact API] DELETE - Error:", error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        )
    }
}