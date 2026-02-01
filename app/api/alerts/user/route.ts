import { NextResponse } from "next/server"

export async function GET() {
  try {
    // This would fetch from your Laravel backend
    // For now, returning mock alerts
    const mockAlerts = [
      {
        id: "1",
        title: "Typhoon Warning",
        message:
          "Tropical Storm approaching Perpetual Village. Residents are advised to prepare emergency kits and stay updated.",
        type: "emergency",
        category: "Weather",
        timestamp: "2 hours ago",
        read: false,
        priority: "high",
      },
      {
        id: "2",
        title: "Road Closure Notice",
        message: "Main Street will be closed for repairs from Jan 15-20. Please use alternative routes.",
        type: "warning",
        category: "Traffic",
        timestamp: "5 hours ago",
        read: false,
        priority: "medium",
      },
      {
        id: "3",
        title: "Community Clean-up Drive",
        message: "Join us this Saturday for a city-wide clean-up drive. Meet at City Hall at 7:00 AM.",
        type: "info",
        category: "Events",
        timestamp: "1 day ago",
        read: true,
        priority: "low",
      },
      {
        id: "4",
        title: "Water Service Restored",
        message: "Water service in Brgy. Centro has been fully restored. Thank you for your patience.",
        type: "success",
        category: "Utilities",
        timestamp: "2 days ago",
        read: true,
        priority: "low",
      },
      {
        id: "5",
        title: "COVID-19 Vaccination Schedule",
        message: "Free COVID-19 booster shots available at City Health Center. Walk-ins welcome Mon-Fri 8AM-4PM.",
        type: "info",
        category: "Health",
        timestamp: "3 days ago",
        read: true,
        priority: "medium",
      },
    ]

    return NextResponse.json({
      success: true,
      alerts: mockAlerts,
    })
  } catch (error) {
    console.error("[v0] Error fetching alerts:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch alerts" }, { status: 500 })
  }
}
