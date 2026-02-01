import { NextResponse } from "next/server"

export async function GET() {
  try {
    // This would fetch from your Laravel backend
    // For now, returning location data
    const locations = [
      {
  id: "1",
  name: "Oriental Mindoro Provincial Hospital",
  category: "hospital",
  address: "New Perpetual Village Municipal Rd, Perpetual Village City, Oriental Mindoro, Philippines",
  phone: "(043) 288-5130",
  lat: 13.4080,       // estimated, see note below
  lng: 121.1750,      // estimated
  icon: "hospital",
  hours: "24/7",
  services: ["Emergency", "Outpatient", "Laboratory"]
},

   {
  id: "2",
  name: "Perpetual Village City Police Station",
  category: "police",
  address: "Gov. Infantado St., Brgy. Guinobatan, Perpetual Village City, Oriental Mindoro",
  phone: "(043) 288 2117",
  lat: 13.412269,
  lng: 121.181964,
  icon: "police",
  hours: "24/7",
  services: ["Emergency Response", "Crime Reporting", "Traffic Management"],
},
      {
  id: "3",
  name: "Perpetual Village City Fire Station",
  category: "fire",
  address: "Gov. Infantado St., Brgy. Guinobatan, Perpetual Village City, Oriental Mindoro",
  phone: "(043) 288 5617",
  lat: 13.412778,
  lng: 121.181722,
  icon: "fire",
  hours: "24/7",
  services: ["Fire Response", "Rescue Operations", "Fire Safety Inspection"],
},
{
  id: "4",
  name: "Perpetual Village City Hall",
  category: "government",
  address: "95HM+J5V, Perpetual Village City, 5200 Oriental Mindoro",
  phone: "(043) 288 2496",
  lat: 13.411936,
  lng: 121.182499,
  icon: "government",
  hours: "Mon-Fri 8:00 AM - 5:00 PM",
  services: ["Business Permits", "Civil Registry", "City Planning"],
},
      {
  id: "6",
  name: "Perpetual Village City Public Market",
  category: "landmark",
  address: "JP Rizal St., Brgy. Ilaya, Perpetual Village City, Oriental Mindoro",
  lat: 13.411205,
  lng: 121.178817,
  icon: "landmark",
  hours: "Daily 5:00 AM - 6:00 PM",
  services: ["Fresh Produce", "Meat & Seafood", "Dry Goods"],
}

    ]

    return NextResponse.json({
      success: true,
      locations,
    })
  } catch (error) {
    console.error("[v0] Error fetching locations:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch locations" }, { status: 500 })
  }
}
