// app/api/member/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/* =======================
   GET: Fetch profile
======================= */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const res = await fetch(`${API_URL}/member/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        message: data.message || "Failed to fetch profile",
      }, { status: res.status });
    }

    // Ensure frontend-friendly defaults
    const profile = data.data || {};
    return NextResponse.json({
      success: true,
      data: {
        name: profile.name || "",
        status: profile.status || "inactive",
        membership_id: profile.membership_id || null,
        member_since: profile.member_since || null,
        alias: profile.alias || null,
        tenure: profile.tenure || null,
        projects: profile.projects || null,
        positions: profile.positions || null,
        achievements: profile.achievements || null,
        profile_image: profile.profile_image || null,
        juantap_nfc: profile.juantap_nfc ?? false,
        profile_url: profile.profile_url || null,
        qr_code: profile.qr_code || null,
        subscription: profile.subscription || "silver",
      },
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
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
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    let body: any;
    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData
      const formData = await req.formData();
      body = new FormData();

      formData.forEach((value, key) => {
        body.append(key, value === "" ? "" : value);
      });
      // Don't set Content-Type for FormData
    } else {
      // JSON payload
      const json = await req.json();
      body = JSON.stringify({
        alias: json.alias ?? null,
        tenure: json.tenure ?? null,
        projects: json.projects ?? null,
        positions: json.positions ?? null,
        achievements: json.achievements ?? null,
        profile_image: json.profile_image ?? null,
      });
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_URL}/member/profile`, {
      method: "PUT",
      headers,
      body,
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      return NextResponse.json({
        success: false,
        message: "Laravel returned non-JSON response",
        raw: text,
      }, { status: 500 });
    }

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        message: data.message || "Failed to update profile",
        errors: data.errors || null,
      }, { status: res.status });
    }

    // Ensure frontend-friendly keys
    const profile = data.data || {};
    return NextResponse.json({
      success: true,
      message: data.message || "Profile updated successfully",
      data: {
        name: profile.name || "",
        status: profile.status || "inactive",
        membership_id: profile.membership_id || null,
        member_since: profile.member_since || null,
        alias: profile.alias || null,
        tenure: profile.tenure || null,
        projects: profile.projects || null,
        positions: profile.positions || null,
        achievements: profile.achievements || null,
        profile_image: profile.profile_image || null,
      },
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: err instanceof Error ? err.message : "Unknown error",
    }, { status: 500 });
  }
}
