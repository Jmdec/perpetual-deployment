import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ⚠️ params is a Promise in Next.js 15+
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // ⚠️ Await params to get the actual ID
    const { id } = await params

    const laravelUrl = `${API_URL}/admin/legitimacy/${id}/pdf`

    console.log("Fetching legitimacy PDF from:", laravelUrl)
    console.log("ID parameter:", id) // Debug log

    const response = await fetch(laravelUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/pdf",
      },
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("Laravel PDF generation error:", {
        status: response.status,
        body: text,
      })

      return NextResponse.json(
        {
          success: false,
          message: "Failed to generate certificate PDF",
          error: text,
        },
        { status: response.status }
      )
    }

    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${id}.pdf"`,
        "Content-Length": buffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("PDF API route error:", error)
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