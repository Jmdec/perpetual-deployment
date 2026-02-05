"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { toast } from "sonner";

interface MemberProfile {
    name: string;
    alias?: string;
    tenure?: string;
    membership?: string;
    projects?: string;
    status: string;
    positions?: string;
    achievements?: string;
    membership_id?: string;
    member_since?: number;
    profile_image?: string;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    phone_number?: string;
    address?: string;
    fraternity_number?: string;
    member_profile?: MemberProfile;
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const res = await fetch(endpoint, {
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options,
    });

    const text = await res.text();
    let data;

    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        throw new Error("Invalid server response");
    }

    if (!res.ok) {
        console.error("API Error:", data);
        throw new Error(data.message || "Request failed");
    }

    return data;
}

const userAPI = {
    me: () => fetchWithAuth("/api/auth/me"),
    profile: () => fetchWithAuth("/api/member/profile"),
};

export default function ProfilePreview() {
    const router = useRouter();
    const [profile, setProfile] = useState<MemberProfile | null>(null);
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const [userRes, profileRes] = await Promise.all([
                userAPI.me(),
                userAPI.profile(),
            ]);
            setUser(userRes.user);
            setProfile(profileRes.data || profileRes);
        } catch (err) {
            console.error("Error fetching profile:", err);
            toast.error("Failed to load profile");
            router.push("/login");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <section>
                <Card className="border rounded-md border-gray-100">
                    <CardContent className="p-6">
                        <div className="animate-pulse flex items-center gap-4">
                            <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>
        );
    }

    // Check if profile is incomplete
    const isProfileIncomplete =
        !profile?.alias ||
        !profile?.positions ||
        !profile?.tenure ||
        !profile?.member_since;

    // If incomplete, show only warning
    if (isProfileIncomplete) {
        return (
            <div className="flex items-center gap-2 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded m-4">
                <AlertTriangle className="w-5 h-5 text-yellow-700" />
                <p className="text-sm text-yellow-800 flex-1">
                    Your profile is incomplete. Please update your profile to get the best experience.
                </p>
                <button
                    onClick={() => router.push("/dashboard/member/profile")}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-sm"
                >
                    Update Profile
                </button>
            </div>
        );
    }

    // If profile is complete, show profile card
    return (
        <section className="m-4">
            <Card className="border rounded-md border-gray-100">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        {/* Profile Image */}
                        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            {profile?.profile_image ? (
                                <Image
                                    src={profile.profile_image}
                                    alt={user?.name || "Profile"}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                                    <User className="w-10 h-10 text-white" />
                                </div>
                            )}
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {user?.name || "Member"}
                            </h3>
                            <p className="text-sm text-gray-600">{profile?.alias || "—"}</p>

                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">
                                    #{profile?.membership_id || "—"}
                                </span>
                                {profile?.status && (
                                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                        {profile.status}
                                    </span>
                                )}
                            </div>

                            {profile?.member_since && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Member since{" "}
                                    {typeof profile.member_since === 'number'
                                        ? new Date(profile.member_since * 1000).toLocaleDateString()
                                        : new Date(profile.member_since).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Additional Info */}
                    {(profile?.positions || profile?.tenure) && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-gray-500 text-xs">Position</p>
                                    <p className="font-medium text-gray-900 truncate">
                                        {profile.positions || "—"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs">Tenure</p>
                                    <p className="font-medium text-gray-900">
                                        {profile.tenure || "—"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}
