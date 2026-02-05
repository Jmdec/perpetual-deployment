"use client"
import { useState, useEffect } from "react"
import {
    Search,
    Filter,
    Eye,
    Plus,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Clock,
    MapPin,
    Users,
    X,
    CheckCircle,
    XCircle,
    AlertCircle,
} from "lucide-react"
import AdminLayout from "@/components/adminLayout"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/use-toast"

interface Event {
    id: number
    title: string
    description: string
    date: string
    time: string
    location: string
    created_at: string
    updated_at: string
    stats?: {
        total_invites: number
        accepted: number
        declined: number
        pending: number
    }
}

interface EventResponse {
    id: number
    user_id: number
    user_name: string
    user_email: string
    response: "accepted" | "declined" | "pending"
    responded_at: string
}

interface EventDetail extends Event {
    responses: EventResponse[]
}

interface PaginationData {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
}

export default function AdminEventsPage() {
    const { user, loading: authLoading } = useAuth(true)
    const { toast } = useToast()

    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<"view" | "create" | "edit">("view")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showResponses, setShowResponses] = useState(false)

    const [pagination, setPagination] = useState<PaginationData>({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        from: 0,
        to: 0,
    })

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        time: "09:00",
        location: "",
    })

    // Fetch events on mount and when pagination changes
    useEffect(() => {
        if (!authLoading && user) {
            fetchEvents()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, user, pagination.current_page])

    const fetchEvents = async () => {
        try {
            setLoading(true)

            const params = new URLSearchParams({
                page: pagination.current_page.toString(),
                per_page: pagination.per_page.toString(),
            })

            if (searchQuery) {
                params.append("search", searchQuery)
            }

            const response = await fetch(
                `/api/admin/events?${params}`,
                {
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            )

            if (response.ok) {
                const data = await response.json()
                setEvents(data.data || [])
                setPagination({
                    current_page: data.current_page,
                    last_page: data.last_page,
                    per_page: data.per_page,
                    total: data.total,
                    from: data.from,
                    to: data.to,
                })
            } else if (response.status === 401) {
                toast({
                    title: "Unauthorized",
                    description: "Please log in again",
                    variant: "destructive",
                })
            } else {
                toast({
                    title: "Error",
                    description: "Failed to fetch events",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error fetching events:", error)
            toast({
                title: "Error",
                description: "Failed to fetch events",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const fetchEventDetail = async (eventId: number) => {
        try {
            const response = await fetch(`/api/admin/events/${eventId}`, {
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            })

            if (response.ok) {
                const data = await response.json()
                setSelectedEvent(data)
            }
        } catch (error) {
            console.error("Error fetching event detail:", error)
            toast({
                title: "Error",
                description: "Failed to fetch event details",
                variant: "destructive",
            })
        }
    }

    const handleCreateClick = () => {
        setFormData({
            title: "",
            description: "",
            date: new Date().toISOString().split("T")[0],
            time: "09:00",
            location: "",
        })
        setModalMode("create")
        setIsModalOpen(true)
    }

    const handleEditClick = (event: Event) => {
        setFormData({
            title: event.title,
            description: event.description,
            date: event.date,
            time: event.time,
            location: event.location,
        })
        setSelectedEvent(event as EventDetail)
        setModalMode("edit")
        setIsModalOpen(true)
    }

    const handleViewClick = async (event: Event) => {
        await fetchEventDetail(event.id)
        setModalMode("view")
        setIsModalOpen(true)
        setShowResponses(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const url =
                modalMode === "create"
                    ? "/api/admin/events"
                    : `/api/admin/events/${selectedEvent?.id}`
            const method = modalMode === "create" ? "POST" : "PUT"

            const response = await fetch(url, {
                method,
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                toast({
                    title: "Success",
                    description: `Event ${modalMode === "create" ? "created" : "updated"} successfully`,
                })
                setIsModalOpen(false)
                setPagination({ ...pagination, current_page: 1 })
                fetchEvents()
            } else {
                const error = await response.json()
                toast({
                    title: "Error",
                    description: error.message || "Failed to save event",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error saving event:", error)
            toast({
                title: "Error",
                description: "Failed to save event",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (eventId: number) => {
        if (!confirm("Are you sure you want to delete this event?")) return

        try {
            const response = await fetch(`/api/admin/events/${eventId}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            })

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Event deleted successfully",
                })
                fetchEvents()
            } else {
                toast({
                    title: "Error",
                    description: "Failed to delete event",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error deleting event:", error)
            toast({
                title: "Error",
                description: "Failed to delete event",
                variant: "destructive",
            })
        }
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
        setPagination({ ...pagination, current_page: 1 })
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setPagination({ ...pagination, current_page: 1 })
        fetchEvents()
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">School Events</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage school events and track attendee responses
                        </p>
                    </div>
                    <button
                        onClick={handleCreateClick}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        Add Event
                    </button>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search events by title, description, or location..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </form>

                {/* Events List */}
                <div className="bg-white rounded-lg shadow">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-gray-500">Loading events...</div>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Calendar className="text-gray-400" size={48} />
                            <p className="mt-4 text-gray-500">No events found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                            Event
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                            Date & Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                            Responses
                                        </th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {events.map((event) => (
                                        <tr key={event.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{event.title}</p>
                                                    <p className="text-sm text-gray-500 line-clamp-1">
                                                        {event.description}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <div className="flex items-center gap-1 text-gray-900">
                                                        <Calendar size={16} />
                                                        {new Date(event.date).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <Clock size={16} />
                                                        {event.time}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <MapPin size={16} />
                                                    {event.location}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    {event.stats && (
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <Users size={16} className="text-gray-500" />
                                                                <span className="font-medium">
                                                                    {event.stats.total_invites}
                                                                </span>
                                                            </div>
                                                            <div className="flex gap-4 text-xs">
                                                                <span className="flex items-center gap-1">
                                                                    <CheckCircle size={14} className="text-green-500" />
                                                                    {event.stats.accepted} accepted
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <XCircle size={14} className="text-red-500" />
                                                                    {event.stats.declined} declined
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <AlertCircle size={14} className="text-yellow-500" />
                                                                    {event.stats.pending} pending
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewClick(event)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                        title="View responses"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditClick(event)}
                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                                                        title="Edit event"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(event.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                        title="Delete event"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {pagination.from} to {pagination.to} of {pagination.total} events
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() =>
                                    setPagination({
                                        ...pagination,
                                        current_page: Math.max(1, pagination.current_page - 1),
                                    })
                                }
                                disabled={pagination.current_page === 1}
                                className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(
                                    (page) => (
                                        <button
                                            key={page}
                                            onClick={() =>
                                                setPagination({ ...pagination, current_page: page })
                                            }
                                            className={`px-3 py-1 rounded ${pagination.current_page === page
                                                    ? "bg-blue-600 text-white"
                                                    : "border border-gray-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}
                            </div>
                            <button
                                onClick={() =>
                                    setPagination({
                                        ...pagination,
                                        current_page: Math.min(
                                            pagination.last_page,
                                            pagination.current_page + 1
                                        ),
                                    })
                                }
                                disabled={pagination.current_page === pagination.last_page}
                                className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {modalMode === "view"
                                        ? "Event Details"
                                        : modalMode === "create"
                                            ? "Create Event"
                                            : "Edit Event"}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {modalMode === "view" && selectedEvent ? (
                                <div className="space-y-6">
                                    {/* Event Details */}
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-700">Title</h3>
                                            <p className="text-gray-900">{selectedEvent.title}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-700">Description</h3>
                                            <p className="text-gray-900">{selectedEvent.description}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <h3 className="font-semibold text-gray-700">Date</h3>
                                                <p className="text-gray-900">
                                                    {new Date(selectedEvent.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-700">Time</h3>
                                                <p className="text-gray-900">{selectedEvent.time}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-700">Location</h3>
                                            <p className="text-gray-900">{selectedEvent.location}</p>
                                        </div>
                                    </div>

                                    {/* Response Statistics */}
                                    {selectedEvent.stats && (
                                        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="text-sm text-gray-500">Total Invites</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {selectedEvent.stats.total_invites}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-green-600">Accepted</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {selectedEvent.stats.accepted}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-red-600">Declined</p>
                                                <p className="text-2xl font-bold text-red-600">
                                                    {selectedEvent.stats.declined}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-yellow-600">Pending</p>
                                                <p className="text-2xl font-bold text-yellow-600">
                                                    {selectedEvent.stats.pending}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Responses Table */}
                                    {showResponses && selectedEvent.responses && (
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-4">
                                                Attendee Responses
                                            </h3>
                                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                                <table className="w-full">
                                                    <thead className="bg-gray-50 border-b border-gray-200">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                                                Name
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                                                Email
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                                                Response
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                                                Responded At
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {selectedEvent.responses.map((response) => (
                                                            <tr key={response.id}>
                                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                                    {response.user_name}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                                    {response.user_email}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm">
                                                                    <span
                                                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${response.response === "accepted"
                                                                                ? "bg-green-100 text-green-700"
                                                                                : response.response === "declined"
                                                                                    ? "bg-red-100 text-red-700"
                                                                                    : "bg-yellow-100 text-yellow-700"
                                                                            }`}
                                                                    >
                                                                        {response.response === "accepted" && (
                                                                            <CheckCircle size={14} />
                                                                        )}
                                                                        {response.response === "declined" && (
                                                                            <XCircle size={14} />
                                                                        )}
                                                                        {response.response === "pending" && (
                                                                            <AlertCircle size={14} />
                                                                        )}
                                                                        {response.response.charAt(0).toUpperCase() +
                                                                            response.response.slice(1)}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                                    {new Date(response.responded_at).toLocaleDateString()}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Event Title *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) =>
                                                setFormData({ ...formData, title: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., School Graduation Ceremony"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description *
                                        </label>
                                        <textarea
                                            required
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData({ ...formData, description: e.target.value })
                                            }
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Describe the event..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Date *
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                value={formData.date}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, date: e.target.value })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Time *
                                            </label>
                                            <input
                                                type="time"
                                                required
                                                value={formData.time}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, time: e.target.value })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Location *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.location}
                                            onChange={(e) =>
                                                setFormData({ ...formData, location: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., School Gymnasium"
                                        />
                                    </div>

                                    <div className="flex gap-3 justify-end pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {isSubmitting
                                                ? "Saving..."
                                                : modalMode === "create"
                                                    ? "Create Event"
                                                    : "Update Event"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
