import { NextRequest, NextResponse } from "next/server"

const LARAVEL_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// ✅ FIX: context.params is a Promise
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ referenceNumber: string }> }
) {
  try {
    // ✅ FIX: must await params
    const { referenceNumber } = await context.params

    const response = await fetch(
      `${LARAVEL_API_URL}/medical-assistance/reference/${referenceNumber}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    )

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error fetching application by reference:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch application" },
      { status: 500 }
    )
  }
}
