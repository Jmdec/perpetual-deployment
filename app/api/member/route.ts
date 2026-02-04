import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    console.log("Retrieved token:", token); // Debug log

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log("Request body:", body); // Debug log

    const res = await fetch(`${API_URL}/member/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("Laravel API response:", data); // Debug log

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to update profile",
          error: data.error,
        },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Error updating profile:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}