// app/api/admin/orders/[orderCode]/status/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ orderCode: string }> }
) {
    try {
        const paramsObj = await params;
        const orderCode = paramsObj.orderCode;
        // For debugging purposes
        const { status } = await request.json();
        console.log(`Updating order ${orderCode} to status ${status}`);

        const cookieStore = await cookies()
        const token = cookieStore.get("auth_token")?.value

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            )
        }

        // Parse the request body to get the status
        const body = await request.json()
        const newStatus = body.status

        if (!newStatus) {
            return NextResponse.json(
                { success: false, message: "Status is required" },
                { status: 400 }
            )
        }

        // Make request to Laravel backend
        const res = await fetch(`${API_URL}/admin/orders/${orderCode}/status`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ status: newStatus }),
        })

        const data = await res.json()

        return NextResponse.json({
            success: true,
            message: `Order ${orderCode} updated to ${status}`
        });
    } catch (err: any) {
        console.error("[POST /api/admin/orders/:orderCode/status]", err)
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        )
    }
}