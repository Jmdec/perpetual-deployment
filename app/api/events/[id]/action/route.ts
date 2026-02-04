import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest, context: { params: any }) {
    try {
        // ✅ Await params
        const params = await context.params;
        const id = params.id;
        if (!id) return NextResponse.json({ error: "Event ID missing" }, { status: 400 });

        // ✅ Await cookies
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // ✅ Parse request body
        const { action } = await req.json();
        if (!["accept", "decline"].includes(action))
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });

        // ✅ Call Laravel
        const laravelRes = await fetch(`http://localhost:8000/api/events/${id}/respond`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action }),
        });

        if (!laravelRes.ok) {
            const text = await laravelRes.text();
            console.error("Laravel error:", text);
            return NextResponse.json({ error: "Laravel request failed", details: text }, { status: laravelRes.status });
        }

        const data = await laravelRes.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Next API route error:", err);
        return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
    }
}
