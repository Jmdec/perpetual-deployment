"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import MemberLayout from "@/components/memberLayout";

// Define interfaces
interface HistoryItem {
    id: string;
    title: string;
    description: string;
    year: string;
    image?: string;
}

interface ApiHistory {
    id: number;
    title: string;
    description: string;
    year: string;
    image_url: string | null;
}

// Static fallback content for demonstration or if API fails
const fallbackHistory: HistoryItem[] = [
    {
        id: "1",
        title: "Founding of the Chapter",
        description: "The Tau Gamma Phi TRISKELION’S Grand Fraternity chapter at the University of Perpetual Help - Las Piñas was established in [Year], marking the beginning of a legacy of brotherhood, service, and excellence. Founded by visionary leaders, it has grown to become a cornerstone of the university's community.",
        year: "1995",
        image: "/images/founding.jpg", // Placeholder image path
    },
    {
        id: "2",
        title: "First Major Event",
        description: "In [Year], the chapter organized its first major community service event, bringing together members and alumni to support local charities. This event set the tone for future initiatives focused on service and leadership.",
        year: "1998",
        image: "/images/first-event.jpg",
    },
    {
        id: "3",
        title: "Expansion and Growth",
        description: "Over the years, the chapter expanded its membership and influence, hosting numerous orientations, seminars, and collaborations. Key milestones include partnerships with alumni and recognition for academic and extracurricular achievements.",
        year: "2010",
        image: "/images/expansion.jpg",
    },
    {
        id: "4",
        title: "Recent Achievements",
        description: "In recent years, the chapter has continued to uphold its tenets through innovative projects, including digital initiatives and community outreach. Members have excelled in various fields, contributing to the fraternity's enduring legacy.",
        year: "2023",
        image: "/images/recent.jpg",
    },
];

export default function ChapterHistoryPage() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const transformHistory = (item: ApiHistory): HistoryItem => ({
        id: String(item.id),
        title: item.title,
        description: item.description,
        year: item.year,
        image: item.image_url ?? undefined, // Fixed syntax error
    });

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch("/api/chapter/history", {
                    credentials: "include",
                    headers: { Accept: "application/json" },
                });

                if (!res.ok) throw new Error("Failed to fetch history");

                const data = await res.json();
                const raw = data.data ?? [];

                if (raw.length > 0) {
                    setHistory(raw.map(transformHistory));
                } else {
                    // Use fallback if no data
                    setHistory(fallbackHistory);
                }
            } catch (err) {
                console.error("History fetch error:", err);
                setError("Unable to load history. Showing sample content.");
                // Fallback to static content on error
                setHistory(fallbackHistory);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    return (
        <MemberLayout>
            <div className="min-h-screen">
                {/* HEADER */}
                <header className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-10 shadow-md">
                    <div className="px-6 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">Chapter History</h1>
                            <p className="text-sm sm:text-base opacity-90 mt-1">
                                A section dedicated to the long history of our beloved chapter.
                                This serves as a reference for future orientations and collaborations with alumni and residents.
                            </p>
                        </div>
                    </div>
                </header>

                {/* INTRODUCTORY CONTENT */}
                <section className="max-w-6xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Our Legacy</h2>
                        <p className="text-gray-700 leading-relaxed">
                            The Tau Gamma Phi TRISKELION’S Grand Fraternity chapter at the University of Perpetual Help - Las Piñas has a rich history rooted in the principles of honor, loyalty, brotherhood, integrity, and service.
                            From its humble beginnings to its current stature, the chapter has fostered generations of leaders who contribute positively to society.
                            Below, explore key milestones and events that have shaped our journey.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            This page is dynamically updated with records from our database. If you're viewing sample content, it represents the spirit of our history.
                        </p>
                    </div>
                </section>

                {/* CONTENT */}
                <main className="max-w-6xl mx-auto px-4 py-6">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-16">
                            <p className="text-red-500 mb-4">{error}</p>
                            <p className="text-gray-500">Displaying sample history below.</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            No history records found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-xl border shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    {item.image && (
                                        <div className="relative aspect-video overflow-hidden rounded-t-xl">
                                            <Image
                                                src={item.image}
                                                alt={item.title}
                                                fill
                                                className="object-cover transition-transform duration-300 hover:scale-105"
                                            />
                                        </div>
                                    )}

                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                                                {item.year}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                {/* FOOTER CONTENT */}
                <footer className="max-w-6xl mx-auto px-4 py-8">
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border border-red-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Contribute to Our History</h3>
                        <p className="text-gray-700 mb-4">
                            If you have photos, stories, or records from past events, please contact the chapter officers to add them to our digital archive.
                            Together, we preserve and build upon our legacy.
                        </p>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                            Contact Officers
                        </button>
                    </div>
                </footer>
            </div>
        </MemberLayout>
    );
}