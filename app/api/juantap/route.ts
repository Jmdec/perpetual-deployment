import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function fetchLaravel(endpoint: string, method = "GET", body?: any) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ success: false, message: data.message || "Request failed", errors: data.errors }, { status: res.status });
  }

  return NextResponse.json(data);
}

export async function GET() {
  return fetchLaravel("/juantap");
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return fetchLaravel("/juantap", "POST", body);
}

export async function PUT(req: NextRequest) {
  const { id, ...body } = await req.json();
  return fetchLaravel(`/juantap/${id}`, "PUT", body);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  return fetchLaravel(`/juantap/${id}`, "DELETE");
}
