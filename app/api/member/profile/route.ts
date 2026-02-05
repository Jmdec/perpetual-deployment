import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/* =======================
   GET: Fetch profile
======================= */
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${API_URL}/member/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const text = await res.text();
    let data: any = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.error("Invalid JSON response:", text);
      return NextResponse.json({ success: false, message: "Invalid backend response" }, { status: 502 });
    }

    if (!res.ok) {
      console.error("Laravel error:", data); // Debug log
      return NextResponse.json({ success: false, message: data.message || "Failed to fetch profile" }, { status: res.status });
    }

    console.log("Fetched profile data:", data.data); // Debug log
    return NextResponse.json({ success: true, data: data.data || data });
  } catch (err) {
    console.error("GET /member/profile error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

/* =======================
   PUT: Update profile
======================= */
export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch (err) {
      console.error("Invalid JSON in request body:", err);
      return NextResponse.json({ success: false, message: "Invalid JSON in request body" }, { status: 400 });
    }

    console.log("Sending to Laravel API:", body); // Debug log

    const res = await fetch(`${API_URL}/member/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data: any = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.error("Invalid JSON response:", text);
      return NextResponse.json({ success: false, message: "Invalid backend response" }, { status: 502 });
    }

    console.log("Laravel API response:", data); // Debug log

    if (!res.ok) {
      return NextResponse.json({ success: false, message: data.message || "Failed to update profile" }, { status: res.status });
    }

    // Return the data directly from Laravel
    return NextResponse.json({ success: true, message: "Profile updated successfully", data: data.data || data });
  } catch (err) {
    console.error("PUT /member/profile error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// Add POST and DELETE methods if needed, following the same structure.
