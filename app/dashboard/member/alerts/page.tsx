"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { AlertCircle, Loader, Bell } from "lucide-react"
import MemberLayout from "@/components/memberLayout"

interface AdminAlert {
  id: string
  disaster_type: string
  establishment_type: string
  suspension_start_date: string
  suspension_end_date: string
  status: string
  notes: string
  created_at: string
}

interface EarthquakeAlert {
  id: string
  magnitude: number
  location: string
  timestamp: string
  depth: number
  latitude: number
  longitude: number
}

interface TyphoonAlert {
  id: string
  name: string
  category: string
  windSpeed: number
  pressure: number
  location: string
  timestamp: string
  latitude: number
  longitude: number
}

interface EarthquakeFeature {
  id: string
  geometry: {
    coordinates: [number, number, number]
  }
  properties: {
    mag: number
    place: string
    time: number
  }
}

interface USGSResponse {
  features: EarthquakeFeature[]
}

export default function UserAlertsPage() {
  const [adminAlerts, setAdminAlerts] = useState<AdminAlert[]>([])
  const [earthquakeAlerts, setEarthquakeAlerts] = useState<EarthquakeAlert[]>([])
  const [typhoonAlerts, setTyphoonAlerts] = useState<TyphoonAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "active" | "earthquakes" | "typhoons">("all")

  useEffect(() => {
    fetchAllAlerts()
    // Poll for new alerts every 30 seconds
    const interval = setInterval(fetchAllAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAllAlerts = async () => {
    try {
      setError(null)

      // Fetch admin alerts
      try {
        const adminResponse = await fetch("/api/alerts")
        if (adminResponse.ok) {
          const adminData = await adminResponse.json()
          setAdminAlerts(adminData)
        }
      } catch (err) {
        console.error("Error fetching admin alerts:", err)
      }

      // Fetch earthquake data (USGS)
      try {
        const startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        const endTime = new Date().toISOString().split("T")[0]

        const earthquakeResponse = await fetch(
          `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startTime}&endtime=${endTime}&minlatitude=4.5&maxlatitude=21.5&minlongitude=116&maxlongitude=127&minmagnitude=2.5&orderby=time`,
          { cache: "no-store" },
        )

        if (earthquakeResponse.ok) {
          const result = (await earthquakeResponse.json()) as USGSResponse
          const data = result?.features || []

          const earthquakes: EarthquakeAlert[] = data.map((feature: EarthquakeFeature) => {
            const coords = feature.geometry.coordinates
            const lat = coords[1]
            const lon = coords[0]
            const depth = coords[2]

            let location = feature.properties.place || "Philippines"
            if (location.includes("Union")) {
              location = location.replace("Union", "Surigao del Norte")
            }
            if (!location.includes("Philippines") && !location.includes("Philippine")) {
              location = `${location}, Philippines`
            }

            return {
              id: feature.id,
              magnitude: feature.properties.mag || 0,
              location: location,
              timestamp: new Date(feature.properties.time).toLocaleString("en-PH", {
                timeZone: "Asia/Manila",
                dateStyle: "medium",
                timeStyle: "medium",
              }),
              depth: depth || 0,
              latitude: lat,
              longitude: lon,
            }
          })

          earthquakes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          setEarthquakeAlerts(earthquakes)
        }
      } catch (err) {
        console.error("Error fetching earthquake data:", err)
      }

      // Fetch typhoon data from our backend API (which fetches from GDACS)
      try {
        const typhoonResponse = await fetch('/api/typhoons', { cache: 'no-store' })
        
        if (typhoonResponse.ok) {
          const typhoons = await typhoonResponse.json()
          setTyphoonAlerts(typhoons)
        } else {
          console.error('Failed to fetch typhoons:', typhoonResponse.statusText)
          setTyphoonAlerts([])
        }
      } catch (err) {
        console.error("Error fetching typhoon data:", err)
        setTyphoonAlerts([])
      }

    } catch (err) {
      console.error("Error fetching alerts:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | number | Date) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }
    return date.toLocaleDateString("en-GB", options)
  }

  const isAlertActive = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    return now >= start && now <= end
  }

  const getDisasterColor = (disasterType: string) => {
    const colors: Record<string, string> = {
      Typhoon: "bg-blue-50 border-l-4 border-l-blue-500",
      Earthquake: "bg-red-50 border-l-4 border-l-red-500",
      Flood: "bg-cyan-50 border-l-4 border-l-cyan-500",
      Landslide: "bg-amber-50 border-l-4 border-l-amber-500",
      Fire: "bg-orange-50 border-l-4 border-l-orange-500",
      Weather: "bg-indigo-50 border-l-4 border-l-indigo-500",
      Other: "bg-gray-50 border-l-4 border-l-gray-500",
    }
    return colors[disasterType] || colors.Other
  }

  const getDisasterIcon = (disasterType: string) => {
    const icons: Record<string, string> = {
      Typhoon: "🌪️",
      Earthquake: "🌍",
      Flood: "🌊",
      Landslide: "⛰️",
      Fire: "🔥",
      Weather: "⛈️",
      Other: "⚠️",
    }
    return icons[disasterType] || icons.Other
  }

  const activeAdminAlerts = adminAlerts.filter((alert) => alert.status === "active")

  const filteredAlerts = (() => {
    if (filter === "active") {
      return activeAdminAlerts
    } else if (filter === "earthquakes") {
      return earthquakeAlerts
    } else if (filter === "typhoons") {
      return typhoonAlerts
    }
    return [...activeAdminAlerts, ...earthquakeAlerts, ...typhoonAlerts]
  })()

  const totalAlerts = activeAdminAlerts.length + earthquakeAlerts.length + typhoonAlerts.length

  return (
    <MemberLayout>
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-8 h-8 text-orange-600" />
              <h1 className="text-4xl font-bold text-foreground">Disaster Alerts</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Stay informed about active disaster alerts and real-time monitoring data for the Philippines
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Active Alerts: {activeAdminAlerts.length} | Earthquakes (7 days): {earthquakeAlerts.length} | Typhoons: {typhoonAlerts.length}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-3 mb-6 flex-wrap">
            {(["all", "active", "earthquakes", "typhoons"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === tab
                    ? "bg-orange-600 text-white"
                    : "bg-white text-foreground border border-border hover:bg-muted"
                }`}
              >
                {tab === "all" && `All (${totalAlerts})`}
                {tab === "active" && `Active Alerts (${activeAdminAlerts.length})`}
                {tab === "earthquakes" && `Earthquakes (${earthquakeAlerts.length})`}
                {tab === "typhoons" && `Typhoons (${typhoonAlerts.length})`}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <Card className="p-4 mb-6 bg-red-50 border border-red-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700">{error}</p>
              </div>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <Card className="p-12 text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto text-orange-600 mb-4" />
              <p className="text-muted-foreground">Loading alerts...</p>
            </Card>
          )}

          {/* Alerts List */}
          {!loading && (
            <>
              {filteredAlerts.length === 0 ? (
                <Card className="p-12 text-center bg-white">
                  <div className="text-5xl mb-4">✅</div>
                  <p className="text-muted-foreground text-lg">
                    {filter === "active" ? "No active alerts at the moment. Stay safe!" : "No alerts to display."}
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredAlerts.map((alert) => {
                    // Admin alert
                    if ("disaster_type" in alert) {
                      const adminAlert = alert as AdminAlert
                      const isCurrentlyActive = isAlertActive(
                        adminAlert.suspension_start_date,
                        adminAlert.suspension_end_date,
                      )

                      return (
                        <Card
                          key={adminAlert.id}
                          className={`p-6 transition-all hover:shadow-lg ${getDisasterColor(adminAlert.disaster_type)}`}
                        >
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <span className="text-4xl">{getDisasterIcon(adminAlert.disaster_type)}</span>
                                <div>
                                  <h3 className="text-2xl font-bold text-foreground">{adminAlert.disaster_type}</h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Affects: {adminAlert.establishment_type}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                                    isCurrentlyActive ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {isCurrentlyActive ? "🔴 ACTIVE" : "⚪ INACTIVE"}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-current border-opacity-10">
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                  Suspension Period
                                </p>
                                <p className="text-sm text-foreground mt-1">
                                  {formatDate(adminAlert.suspension_start_date)}
                                </p>
                                <p className="text-sm text-foreground">to {formatDate(adminAlert.suspension_end_date)}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                  Created
                                </p>
                                <p className="text-sm text-foreground mt-1">{formatDate(adminAlert.created_at)}</p>
                              </div>
                            </div>

                            {adminAlert.notes && (
                              <div className="pt-4 border-t border-current border-opacity-10">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                  Additional Information
                                </p>
                                <p className="text-sm text-foreground bg-white bg-opacity-50 p-3 rounded">
                                  {adminAlert.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </Card>
                      )
                    }
                    
                    // Earthquake alert
                    if ("magnitude" in alert) {
                      const earthquakeAlert = alert as EarthquakeAlert

                      return (
                        <Card
                          key={earthquakeAlert.id}
                          className="p-6 transition-all hover:shadow-lg border-l-4"
                          style={{
                            borderLeftColor:
                              earthquakeAlert.magnitude >= 6
                                ? "#dc2626"
                                : earthquakeAlert.magnitude >= 5
                                  ? "#f59e0b"
                                  : earthquakeAlert.magnitude >= 4
                                    ? "#eab308"
                                    : "#3b82f6",
                            backgroundColor:
                              earthquakeAlert.magnitude >= 6
                                ? "#fef2f2"
                                : earthquakeAlert.magnitude >= 5
                                  ? "#fffbeb"
                                  : earthquakeAlert.magnitude >= 4
                                    ? "#fefce8"
                                    : "#eff6ff",
                          }}
                        >
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <span className="text-4xl">🌍</span>
                                <div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl font-bold text-foreground">
                                      M {earthquakeAlert.magnitude.toFixed(1)}
                                    </span>
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        earthquakeAlert.magnitude >= 6
                                          ? "bg-red-100 text-red-700"
                                          : earthquakeAlert.magnitude >= 5
                                            ? "bg-orange-100 text-orange-700"
                                            : earthquakeAlert.magnitude >= 4
                                              ? "bg-yellow-100 text-yellow-700"
                                              : "bg-blue-100 text-blue-700"
                                      }`}
                                    >
                                      {earthquakeAlert.magnitude >= 6
                                        ? "Strong"
                                        : earthquakeAlert.magnitude >= 5
                                          ? "Moderate"
                                          : earthquakeAlert.magnitude >= 4
                                            ? "Light"
                                            : "Minor"}
                                    </span>
                                  </div>
                                  <h3 className="text-2xl font-bold text-foreground">{earthquakeAlert.location}</h3>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-current border-opacity-10">
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                  Timestamp
                                </p>
                                <p className="text-sm text-foreground mt-1">📅 {earthquakeAlert.timestamp}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                  Depth
                                </p>
                                <p className="text-sm text-foreground mt-1">📏 {earthquakeAlert.depth.toFixed(1)} km</p>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-current border-opacity-10">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                Coordinates
                              </p>
                              <p className="text-sm text-foreground bg-white bg-opacity-50 p-3 rounded">
                                📍 {earthquakeAlert.latitude.toFixed(3)}°N, {earthquakeAlert.longitude.toFixed(3)}°E
                              </p>
                            </div>
                          </div>
                        </Card>
                      )
                    }
                    
                    // Typhoon alert
                    if ("windSpeed" in alert) {
                      const typhoonAlert = alert as TyphoonAlert

                      return (
                        <Card
                          key={typhoonAlert.id}
                          className="p-6 transition-all hover:shadow-lg bg-blue-50 border-l-4 border-l-blue-600"
                        >
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <span className="text-4xl">🌪️</span>
                                <div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-2xl font-bold text-foreground">{typhoonAlert.name}</h3>
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        typhoonAlert.windSpeed >= 118
                                          ? "bg-red-100 text-red-700"
                                          : typhoonAlert.windSpeed >= 89
                                            ? "bg-orange-100 text-orange-700"
                                            : typhoonAlert.windSpeed >= 62
                                              ? "bg-yellow-100 text-yellow-700"
                                              : "bg-blue-100 text-blue-700"
                                      }`}
                                    >
                                      {typhoonAlert.category}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">📍 {typhoonAlert.location}</p>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-blue-200">
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                  Wind Speed
                                </p>
                                <p className="text-sm text-foreground mt-1">💨 {typhoonAlert.windSpeed} km/h</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                  Last Update
                                </p>
                                <p className="text-sm text-foreground mt-1">🕐 {typhoonAlert.timestamp}</p>
                              </div>
                            </div>

                            {typhoonAlert.pressure > 0 && (
                              <div className="pt-4 border-t border-blue-200">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                  Atmospheric Pressure
                                </p>
                                <p className="text-sm text-foreground bg-white bg-opacity-50 p-3 rounded">
                                  🌡️ {typhoonAlert.pressure} mb
                                </p>
                              </div>
                            )}
                          </div>
                        </Card>
                      )
                    }

                    return null
                  })}
                </div>
              )}
            </>
          )}

          {/* Footer Info */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Alerts are automatically updated every 30 seconds</p>
            <p className="mt-1">
              Data sources: USGS (Earthquakes) • GDACS (Typhoons) • Local Authorities
            </p>
          </div>
        </div>
      </div>
    </MemberLayout>
  )
}