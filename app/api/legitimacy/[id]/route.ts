import { NextRequest, NextResponse } from "next/server"

export async function PUT(
    request: NextRequest,
    context: { params: { id: string } | Promise<{ id: string }> }
) {
    const params = await context.params
    const id = params.id

    try {
        const authToken = await request.cookies.get("auth_token")?.value

        if (!authToken) {
            return NextResponse.json(
                { success: false, message: "Authentication required" },
                { status: 401 }
            )
        }

        const body = await request.json()

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/legitimacy/${id}`,
            {
                method: "PUT",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "include",
                body: JSON.stringify({
                    alias: body.alias,
                    chapter: body.chapter,
                    position: body.position,
                }),
            }
        )

        const contentType = response.headers.get("content-type")
        let data

        if (contentType?.includes("application/json")) {
            data = await response.json()
        } else {
            const text = await response.text()
            console.error("Non-JSON response from Laravel:", text)
            return NextResponse.json(
                { success: false, message: "Invalid response from server" },
                { status: 500 }
            )
        }

        if (!response.ok) {
            return NextResponse.json(
                {
                    success: false,
                    message: data.message || "Failed to update legitimacy request",
                    errors: data.errors,
                },
                { status: response.status }
            )
        }

        return NextResponse.json(data, { status: 200 })
    } catch (error) {
        console.error("Error updating legitimacy request:", error)
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}
