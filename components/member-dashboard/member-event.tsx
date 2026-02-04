"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Calendar, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { toast } from "sonner";

interface Invitation {
    id: number;
    title: string;
    category: string;
    event_date: string;
    status: "pending" | "accepted" | "declined";
}

export default function EventsPreview() {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);

    /** Fetch invitations from Laravel API */
    const fetchInvitations = async () => {
        try {
            const res = await fetch("/api/events/invites", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });

            if (!res.ok) throw new Error("Failed to fetch events");

            const data = await res.json();

            // Map API invite_status -> status
            const invs: Invitation[] = Array.isArray(data.data)
                ? data.data.map((inv: any) => ({
                    id: inv.id,
                    title: inv.title,
                    category: inv.category ?? "General",
                    event_date: inv.event_date,
                    status: inv.invite_status,
                }))
                : [];

            setInvitations(invs);
        } catch (err) {
            console.error("Fetch invitations error:", err);
            toast.error("Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    /** Respond to invitation */
    const respond = async (id: number, action: "accept" | "decline") => {
        try {
            const res = await fetch(`/api/events/${id}/action`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });

            if (!res.ok) throw new Error("Action failed");

            const data = await res.json();

            // Update local state
            setInvitations((prev) =>
                prev.map((inv) =>
                    inv.id === id ? { ...inv, status: action === "accept" ? "accepted" : "declined" } : inv
                )
            );

            toast.success(`Invitation ${action === "accept" ? "accepted" : "declined"}`);
        } catch (err) {
            console.error("Respond error:", err);
            toast.error("Failed to respond to invitation");
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, []);

    return (
        <section>
            <Card className="border rounded-md border-gray-100">
                <CardContent>
                    <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-blue-600" /> Upcoming Events
                    </h2>

                    {loading && <p>Loading events...</p>}

                    {!loading && invitations.length === 0 && (
                        <p className="text-gray-500 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> No upcoming invitations
                        </p>
                    )}

                    <div className="flex flex-col gap-3 mt-3">
                        {invitations.map((inv) => (
                            <motion.div
                                key={inv.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="border rounded-md p-3 flex flex-col md:flex-row md:justify-between md:items-center gap-2"
                            >
                                <div>
                                    <h3 className="font-medium">{inv.title}</h3>
                                    <p className="text-sm text-gray-500">{inv.category}</p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(inv.event_date).toLocaleString()}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    {inv.status === "pending" && (
                                        <>
                                            <button
                                                onClick={() => respond(inv.id, "accept")}
                                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => respond(inv.id, "decline")}
                                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                                            >
                                                Decline
                                            </button>
                                        </>
                                    )}

                                    {inv.status === "accepted" && (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                                            Accepted
                                        </span>
                                    )}

                                    {inv.status === "declined" && (
                                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">
                                            Declined
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
