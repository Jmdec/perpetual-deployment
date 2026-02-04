import { NextResponse } from "next/server"

export async function GET() {
  try {
    // This would fetch from your Laravel backend
    // For now, returning mock data
    const mockReports = [
      {
        id: "RPT-001",
        title: "Pothole on Main Street",
        category: "road",
        status: "in-progress",
        urgency: "high",
        date: "2 days ago",
        location: "Brgy. Lumangbayan",
      },
      {
        id: "RPT-002",
        title: "Broken street light",
        category: "streetlight",
        status: "pending",
        urgency: "medium",
        date: "5 days ago",
        location: "Brgy. San Vicente",
      },
      {
        id: "RPT-003",
        title: "Garbage not collected",
        category: "garbage",
        status: "resolved",
        urgency: "low",
        date: "1 week ago",
        location: "Brgy. Masipit",
      },
    ]

    return NextResponse.json({
      success: true,
      reports: mockReports,
    })
  } catch (error) {
    console.error("[v0] Error fetching user reports:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch reports" }, { status: 500 })
  }
}
