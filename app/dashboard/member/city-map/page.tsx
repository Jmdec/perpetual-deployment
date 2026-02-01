"use client"

import { useState, useEffect } from "react"
import {
  ChevronLeft,
  MapPin,
  Navigation,
  Search,
  Phone,
  Building2,
  Hospital,
  Shield,
  FireExtinguisher,
  School,
  Landmark,
} from "lucide-react"
import Link from "next/link"
import MemberLayout from "@/components/memberLayout"
interface Location {
  id: string
  name: string
  category: string
  address: string
  phone?: string
  lat: number
  lng: number
  icon: string
}

export default function MapPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  const categories = [
    { value: "all", label: "All", icon: MapPin, color: "bg-orange-500" },
    { value: "hospital", label: "Hospitals", icon: Hospital, color: "bg-red-500" },
    { value: "police", label: "Police", icon: Shield, color: "bg-blue-600" },
    { value: "fire", label: "Fire Dept", icon: FireExtinguisher, color: "bg-orange-600" },
    { value: "government", label: "Gov't", icon: Building2, color: "bg-purple-600" },
    { value: "school", label: "Schools", icon: School, color: "bg-green-600" },
    { value: "landmark", label: "Landmarks", icon: Landmark, color: "bg-teal-600" },
  ]

  const locations: Location[] = [
    {
      id: "1",
      name: "Perpetual Village City Hospital",
      category: "hospital",
      address: "J.P. Rizal St, Perpetual Village City",
      phone: "(043) 288-8888",
      lat: 13.4119,
      lng: 121.1803,
      icon: "hospital",
    },
    {
      id: "2",
      name: "Perpetual Village City Police Station",
      category: "police",
      address: "Guinobatan, Perpetual Village City",
      phone: "(043) 288-6666",
      lat: 13.4125,
      lng: 121.1795,
      icon: "police",
    },
    {
      id: "3",
      name: "Perpetual Village Fire Station",
      category: "fire",
      address: "Guinobatan, Perpetual Village City",
      phone: "(043) 288-7777",
      lat: 13.413,
      lng: 121.181,
      icon: "fire",
    },
    {
      id: "4",
      name: "Perpetual Village City Hall",
      category: "government",
      address: "Guinobatan, Perpetual Village City",
      phone: "(043) 288-5555",
      lat: 13.4115,
      lng: 121.18,
      icon: "government",
    },
    {
      id: "5",
      name: "Oriental Mindoro National Highschool",
      category: "school",
      address: "Camilmil, Perpetual Village City",
      phone: "(043) 288-4444",
      lat: 13.41,
      lng: 121.182,
      icon: "school",
    },
    {
      id: "6",
      name: "Perpetual Village City Public Market",
      category: "landmark",
      address: "San Vicente Central, Perpetual Village City",
      lat: 13.412,
      lng: 121.179,
      icon: "landmark",
    },
  ]

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
        }
      )
    }
  }, [])

  const filteredLocations = locations.filter((location) => {
    const matchesCategory = selectedCategory === "all" || location.category === selectedCategory
    const matchesSearch =
      searchQuery === "" ||
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getLocationIcon = (category: string) => {
    const cat = categories.find((c) => c.value === category)
    return cat ? cat.icon : MapPin
  }

  const getLocationColor = (category: string) => {
    const cat = categories.find((c) => c.value === category)
    return cat ? cat.color : "bg-gray-500"
  }

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return (R * c).toFixed(1)
  }

  return (
    <MemberLayout>
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="bg-orange-600 text-white px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">City Map</h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-300" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search locations..."
            className="w-full pl-11 pr-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
      </header>

      {/* Category Filter */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 overflow-x-auto">
        <div className="flex gap-2">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                  selectedCategory === category.value
                    ? `${category.color} text-white`
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Default Map Embed */}
      <div className="relative h-64 border-b border-gray-200">
        <iframe
          src="https://www.google.com/maps?q=Perpetual Village+City+Hall,+Perpetual Village+City,+Oriental+Mindoro&z=15&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>

        {userLocation && (
          <div className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg">
            <Navigation className="w-5 h-5 text-orange-600" />
          </div>
        )}
      </div>

      {/* Locations List */}
      <main className="flex-1 px-4 py-4 overflow-y-auto pb-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {filteredLocations.length} Location{filteredLocations.length !== 1 ? "s" : ""}
          </h2>
          {userLocation && (
            <button className="text-sm text-orange-600 font-semibold flex items-center gap-1">
              <Navigation className="w-4 h-4" />
              Sort by distance
            </button>
          )}
        </div>

        <div className="space-y-3">
          {filteredLocations.map((location) => {
            const Icon = getLocationIcon(location.category)
            const distance =
              userLocation && calculateDistance(userLocation.lat, userLocation.lng, location.lat, location.lng)

            const mapsUrl = userLocation
              ? `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${location.lat},${location.lng}`
              : `https://www.google.com/maps?q=${location.lat},${location.lng}`

            return (
              <a
                key={location.id}
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`${getLocationColor(location.category)} w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{location.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 flex items-start gap-1">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{location.address}</span>
                    </p>

                    <div className="flex items-center gap-4">
                      {location.phone && (
                        <a
                          href={`tel:${location.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm text-orange-600 font-semibold flex items-center gap-1"
                        >
                          <Phone className="w-4 h-4" />
                          {location.phone}
                        </a>
                      )}
                      {distance && (
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Navigation className="w-4 h-4" />
                          {distance} km away
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </main>
    </div>
    </MemberLayout>
  )
}
