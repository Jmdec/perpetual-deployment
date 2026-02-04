"use client"

import { useState, useEffect, useMemo } from "react"
import { Calendar, CheckCircle, XCircle, MapPin, Users } from "lucide-react"
import Image from "next/image"
import MemberLayout from "@/components/memberLayout"

interface EventItem {
    id: string
    title: string
    description: string
    category: string
    image?: string
    eventDate: string
    location: string
    status: "pending" | "accepted" | "declined"
    organizer: string
}

interface ApiEvent {
    id: number
    title: string
    description: string
    category: string
    image_url: string | null
    event_date: string
    location: string
    invite_status: "pending" | "accepted" | "declined"
    organizer: { name: string } | null
}

export default function EventsPage() {
    const [events, setEvents] = useState<EventItem[]>([])
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [loading, setLoading] = useState(true)

    const transformEvent = (event: ApiEvent): EventItem => ({
        id: String(event.id),
        title: event.title,
        description: event.description,
        category: event.category ?? "General",
        image: event.image_url ?? undefined,
        eventDate: new Date(event.event_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }),
        location: event.location,
        status: event.invite_status,
        organizer: event.organizer?.name || "Admin",
    })

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true)
            try {
                const res = await fetch("/api/events/invites", {
                    credentials: "include",
                    headers: { Accept: "application/json" },
                })
                if (!res.ok) throw new Error("Failed to fetch events")

                const data = await res.json()
                const raw: ApiEvent[] = Array.isArray(data.data) ? data.data : []
                setEvents(raw.map(transformEvent))
            } catch (err) {
                console.error("Event fetch error:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchEvents()
    }, [])

    const categories = useMemo(() => {
        const set = new Set(events.map(e => e.category))
        return [
            { value: "all", label: `All (${events.length})` },
            ...Array.from(set).map(cat => ({
                value: cat,
                label: `${cat} (${events.filter(e => e.category === cat).length})`,
            })),
        ]
    }, [events])

    const filteredEvents =
        selectedCategory === "all"
            ? events
            : events.filter(e => e.category === selectedCategory)

    const handleInviteAction = async (id: string, action: "accept" | "decline") => {
        try {
            const res = await fetch(`/api/events/${id}/action`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            })

            if (!res.ok) throw new Error("Action failed")

            setEvents(prev =>
                prev.map(e =>
                    e.id === id
                        ? { ...e, status: action === "accept" ? "accepted" : "declined" }
                        : e
                )
            )
        } catch (err) {
            console.error("Invite action error:", err)
        }
    }

    return (
        <MemberLayout>
            <div className="min-h-screen">
                {/* HEADER */}
                <header className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-10 shadow-md">
                    <div className="px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">College Events</h1>
                            <p className="text-sm sm:text-base opacity-90">
                                View and respond to your event invitations
                            </p>
                        </div>

                        {/* CATEGORY FILTER */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.value}
                                    aria-pressed={selectedCategory === cat.value}
                                    onClick={() => setSelectedCategory(cat.value)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${selectedCategory === cat.value
                                        ? "bg-white text-red-600 shadow"
                                        : "bg-white/30 text-white hover:bg-white/50"
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* CONTENT */}
                <main className="px-6 py-6 max-w-7xl mx-auto">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">No events found.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredEvents.map(event => (
                                <div
                                    key={event.id}
                                    className="bg-white rounded-xl border shadow hover:shadow-lg transition"
                                >
                                    {event.image && (
                                        <div className="relative aspect-video">
                                            <Image
                                                src={event.image}
                                                alt={event.title}
                                                fill
                                                className="object-cover rounded-t-xl"
                                            />
                                        </div>
                                    )}

                                    <div className="p-5">
                                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-500 text-white">
                                            {event.category}
                                        </span>

                                        <h3 className="font-bold text-lg mt-2">{event.title}</h3>

                                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                            {event.description}
                                        </p>

                                        <div className="text-xs text-gray-500 mt-3 space-y-1">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {event.eventDate}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {event.location}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {event.organizer}
                                            </div>
                                        </div>

                                        {/* INVITE ACTIONS */}
                                        {event.status === "pending" ? (
                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => handleInviteAction(event.id, "accept")}
                                                    className="flex-1 flex items-center justify-center gap-1 bg-orange-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-orange-700"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleInviteAction(event.id, "decline")}
                                                    className="flex-1 flex items-center justify-center gap-1 bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Decline
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                className={`mt-4 text-sm font-bold text-center ${event.status === "accepted" ? "text-orange-600" : "text-red-500"
                                                    }`}
                                            >
                                                {event.status.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </MemberLayout>
    )
}
