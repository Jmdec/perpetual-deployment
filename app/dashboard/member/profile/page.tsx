"use client";

import React, { useEffect, useState } from "react";
import MemberLayout from "@/components/memberLayout";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
    User,
    Trophy,
    Mail,
    Phone,
    MapPin,
    Hash,
    Edit,
    Save,
    Loader2,
    Camera,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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

interface JuanTapProfile {
    id: number;
    profile_url: string | null;
    qr_code: string | null;
    status: "active" | "inactive";
    subscription: "silver" | "gold" | "black";
}

interface User {
    id: number;
    name: string;
    email: string;
    phone_number?: string;
    address?: string;
    fraternity_number?: string;
    membership_id?: string;
    juantap_profile: JuanTapProfile | null;
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const res = await fetch(endpoint, { ...options, credentials: "include" });
    const text = await res.text();
    let data;

    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        throw new Error("Invalid server response");
    }

    if (!res.ok) {
        throw new Error(data.message || "Request failed");
    }

    // Always return data.data or null
    return data?.data ?? null;
}

const juantapAPI = {
    get: async () => {
        const data = await fetchWithAuth("/api/juantap");
        return data ?? null;
    },
    create: (payload: MemberProfilePayload) =>
        fetchWithAuth("/api/juantap", { method: "POST", body: JSON.stringify(payload) }),
    update: (id: number, payload: MemberProfilePayload) =>
        fetchWithAuth("/api/juantap", { method: "PUT", body: JSON.stringify({ id, ...payload }) }),
    delete: (id: number) =>
        fetchWithAuth("/api/juantap", { method: "DELETE", body: JSON.stringify({ id }) }),
};

interface MemberProfilePayload {
    alias?: string;
    tenure?: string;
    member_since?: string;
    projects?: string;
    positions?: string;
    achievements?: string;
    profile_image?: string;
    juantap_nfc?: boolean;
    status?: string;
}

const memberAPI = {
    get: async (): Promise<MemberProfilePayload | null> => {
        const data = await fetchWithAuth("/api/member/profile");
        return data ?? null;
    },
    update: async (payload: MemberProfilePayload): Promise<MemberProfilePayload> => {
        const data = await fetchWithAuth("/api/member/profile", {
            method: "PUT",
            body: JSON.stringify(payload),
            headers: { "Content-Type": "application/json" },
        });
        return data;
    },
    create: async (payload: MemberProfilePayload): Promise<MemberProfilePayload> => {
        const data = await fetchWithAuth("/api/member/profile", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: { "Content-Type": "application/json" },
        });
        return data;
    },
    delete: async (id: number): Promise<void> => {
        await fetchWithAuth(`/api/member/profile/${id}`, {
            method: "DELETE",
        });
    },
};

export default function MemberProfilePage() {
    const { user } = useAuth(true);
    const [juantapProfile, setJuanTapProfile] = useState<JuanTapProfile | null>(null);
    const [profile, setProfile] = useState<MemberProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [qrPreview, setQrPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        alias: "",
        tenure: "",
        member_since: "",
        projects: "",
        positions: "",
        achievements: "",
        juantap_nfc: false,
        profile_url: "",
        qr_code: "",
        status: "" as string,
        member_status: "inactive" as "active" | "inactive",
        subscription: "silver" as "silver" | "gold" | "black",
    });

    const [profileImage, setProfileImage] = useState<string | null>(null); // preview

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        setProfileImage(previewUrl);
    };

    const fetchJuanTapProfileData = async () => {
        try {
            const data = await juantapAPI.get();
            if (data) {
                setJuanTapProfile(data);
                setFormData((prev) => ({ ...prev, juantap_nfc: true }));
            } else {
                setJuanTapProfile(null);
                setFormData((prev) => ({ ...prev, juantap_nfc: false }));
            }
        } catch (err) {
            console.error(err);
            setJuanTapProfile(null);
            setFormData((prev) => ({ ...prev, juantap_nfc: false }));
        }
    };

    useEffect(() => {
        if (!user?.id) return;

        const fetchProfile = async () => {
            setLoading(true);
            try {
                const profileData = await memberAPI.get();

                setProfile(profileData);
                setProfileImage(profileData?.profile_image || null);

                // Convert member_since to date string if it exists
                const memberSinceDateString = profileData?.member_since
                    ? new Date(profileData.member_since).toISOString().split('T')[0]
                    : "";

                setFormData({
                    alias: profileData?.alias || "",
                    tenure: profileData?.tenure || "",
                    member_since: memberSinceDateString,
                    projects: profileData?.projects || "",
                    positions: profileData?.positions || "",
                    achievements: profileData?.achievements || "",
                    juantap_nfc: profileData?.juantap_nfc ?? false,
                    profile_url: "",
                    qr_code: "",
                    status: profileData?.status || "",
                    member_status: "inactive",
                    subscription: "silver",
                });


                await fetchJuanTapProfileData();
            } catch (err) {
                console.error(err);
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleSave = async () => {
        try {
            setIsSaving(true);

            // Convert date string to timestamp if it exists
            let memberSinceTimestamp: string | undefined = undefined;
            if (formData.member_since) {
                const date = new Date(formData.member_since);
                memberSinceTimestamp = Math.floor(date.getTime() / 1000).toString();
            }

            const payload: MemberProfilePayload = {
                alias: formData.alias || undefined,
                tenure: formData.tenure || undefined,
                projects: formData.projects || undefined,
                positions: formData.positions || undefined,
                achievements: formData.achievements || undefined,
                profile_image: profileImage || undefined,
                juantap_nfc: formData.juantap_nfc,
                member_since: memberSinceTimestamp,
                status: formData.status || undefined
            };

            const saveResult = await memberAPI.update(payload);

            // Use the response data if available, otherwise refetch
            if (saveResult) {
                setProfile(saveResult);
                setProfileImage(saveResult.profile_image || null);
                const memberSinceDateString = saveResult?.member_since
                    ? typeof saveResult.member_since === 'number'
                        ? new Date(saveResult.member_since * 1000).toISOString().split('T')[0]
                        : new Date(saveResult.member_since).toISOString().split('T')[0]
                    : "";
                setFormData({
                    alias: saveResult.alias || "",
                    tenure: saveResult.tenure || "",
                    member_since: memberSinceDateString,
                    projects: saveResult.projects || "",
                    positions: saveResult.positions || "",
                    achievements: saveResult.achievements || "",
                    juantap_nfc: saveResult.juantap_nfc ?? false,
                    profile_url: "",
                    qr_code: "",
                    status: saveResult.status || "",
                    member_status: "inactive",
                    subscription: "silver",
                });
            } else {
                // Fallback: refetch if response is empty
                const updatedProfile = await memberAPI.get();
                if (updatedProfile) {
                    setProfile(updatedProfile);
                    setProfileImage(updatedProfile.profile_image || null);
                    const memberSinceDateString = updatedProfile?.member_since
                        ? typeof updatedProfile.member_since === 'number'
                            ? new Date(updatedProfile.member_since * 1000).toISOString().split('T')[0]
                            : new Date(updatedProfile.member_since).toISOString().split('T')[0]
                        : "";
                    setFormData({
                        alias: updatedProfile.alias || "",
                        tenure: updatedProfile.tenure || "",
                        member_since: memberSinceDateString,
                        projects: updatedProfile.projects || "",
                        positions: updatedProfile.positions || "",
                        achievements: updatedProfile.achievements || "",
                        juantap_nfc: updatedProfile.juantap_nfc ?? false,
                        profile_url: "",
                        qr_code: "",
                        status: updatedProfile.status || "",
                        member_status: "inactive",
                        subscription: "silver",
                    });
                }
            }

            toast.success("Profile updated successfully");
            setIsEditing(false);
        } catch (err) {
            console.error("Error saving profile:", err);
            toast.error(err instanceof Error ? err.message : "Failed to save profile");
        } finally {
            setIsSaving(false);
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    };

    const openModal = () => {
        if (juantapProfile) {
            setFormData({
                profile_url: juantapProfile.profile_url || "",
                qr_code: juantapProfile.qr_code || "",
                member_status: juantapProfile.status,
                subscription: juantapProfile.subscription,
                alias: formData.alias,
                tenure: formData.tenure,
                member_since: formData.member_since,
                projects: formData.projects,
                positions: formData.positions,
                achievements: formData.achievements,
                status: formData.status,
                juantap_nfc: true,
            });
            setQrPreview(juantapProfile.qr_code || null);
        } else {
            setFormData((prev) => ({
                ...prev,
                profile_url: "",
                qr_code: "",
                member_status: "inactive",
                subscription: "silver",
                juantap_nfc: false,
            }));
            setQrPreview(null);
        }
        setShowModal(true);
    };

    const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setFormData((prev) => ({ ...prev, qr_code: base64 }));
            setQrPreview(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError("");

        try {
            const payload = {
                ...profile,
                member_since: profile?.member_since?.toString(), // Convert to string for payload
            };

            const juantapPayload: MemberProfilePayload = {
                member_since: payload.member_since,
            };

            if (juantapProfile) {
                await juantapAPI.update(juantapProfile.id, juantapPayload);
            } else {
                await juantapAPI.create(juantapPayload);
            }

            await fetchJuanTapProfileData();
            setShowModal(false);
            toast.success("JuanTap profile saved");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to save profile";
            setFormError(message);
            toast.error(message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!juantapProfile) return;

        if (!confirm("Delete your JuanTap profile? This cannot be undone.")) return;

        setFormLoading(true);

        try {
            await juantapAPI.delete(juantapProfile.id);
            setJuanTapProfile(null);
            setShowModal(false);
            toast.success("JuanTap profile deleted");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Delete failed");
        } finally {
            setFormLoading(false);
        }
    };

    if (loading) {
        return (
            <MemberLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
                </div>
            </MemberLayout>
        );
    }

    if (!profile) {
        return (
            <MemberLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <p className="text-gray-500">Profile not found.</p>
                </div>
            </MemberLayout>
        );
    }

    return (
        <MemberLayout>
            <div className="min-h-screen">
                {/* MEMBER PROFILE */}
                <header className="mb-5 bg-linear-to-r from-red-500 to-orange-500 text-white px-4 sm:px-6 py-3 sm:py-4 shadow-md">
                    <div className="px-6 py-4 flex flex-col sm:flex-row sm:justify-between gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                            {/* Avatar */}
                            <div className="relative shrink-0 self-center sm:self-start">
                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden bg-gray-200 shadow-md">
                                    <Image
                                        src={profileImage || "/default-profile.png"}
                                        alt="Profile"
                                        width={160}
                                        height={160}
                                        className="object-cover w-full h-full"
                                    />
                                </div>

                                {isEditing && (
                                    <label className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition">
                                        <Camera className="w-5 h-5 text-white" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Identity */}
                            <div className="space-y-2 text-center sm:text-left">
                                <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                                    {user?.status}
                                </span>

                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-200">
                                        {user.name}
                                    </h1>
                                    <span className="text-gray-200 text-sm">
                                        #{user.membership_id}
                                    </span>
                                </div>

                                <p className="text-gray-300 text-sm">
                                    Member since {profile.member_since || "—"}
                                </p>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex lg:justify-end lg:items-start">
                            {isEditing ? (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="p-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 transition flex items-center gap-2"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                                        {isSaving ? "Saving…" : "Save Changes"}
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="p-3 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-3 rounded-xl bg-red-100 text-red-900 hover:bg-red-300 transition"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                {/* MEMBER DETAILS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-8"
                    >
                        {/* CONTACT INFO */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Info icon={Mail} label="Email" value={user?.email || ""} />
                            <Info icon={Phone} label="Phone" value={user?.phone_number || ""} />
                            <Info icon={MapPin} label="Address" value={user?.address || ""} />
                            <Info icon={Hash} label="Fraternity #" value={user?.fraternity_number || ""} />
                        </div>

                        {/* PROFILE FIELDS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-5">
                            <Field label="Alias" name="alias" value={isEditing ? formData.alias : profile?.alias || ""} editable={isEditing} onChange={handleChange} />
                            <Field label="Tenure" name="tenure" value={isEditing ? formData.tenure : profile.tenure || ""} editable={isEditing} onChange={handleChange} />
                            <Field label="Member Since" name="member_since" value={isEditing ? formData.member_since : (profile.member_since ? new Date(profile.member_since).toISOString().split('T')[0] : "")} editable={isEditing} onChange={handleChange} type="date" />
                            <Field label="Status" name="status" value={isEditing ? formData.status : profile.status || ""} editable={isEditing} onChange={handleChange} />
                        </div>
                    </motion.div>

                    {/* JUANTAP */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Section title="JuanTap Profile" icon={User}>
                            {juantapProfile ? (
                                <>
                                    {(juantapProfile?.profile_url || juantapProfile?.qr_code) && (
                                        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-8">
                                            <div className="flex justify-center items-center">
                                                {juantapProfile?.qr_code ? (
                                                    <div className="border border-gray-300 rounded-xl p-3 text-center">
                                                        <Image
                                                            src={juantapProfile.qr_code}
                                                            alt="JuanTap QR Code"
                                                            width={200}
                                                            height={200}
                                                            className="mx-auto rounded-lg border"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-50 rounded-xl p-3 text-center flex items-center justify-center">
                                                        <p className="text-sm text-gray-400">No QR code uploaded</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                                    <p className="text-xs text-gray-500">Subscription</p>
                                                    <p className="font-semibold text-gray-700 capitalize">
                                                        {juantapProfile?.subscription}
                                                    </p>
                                                </div>

                                                {juantapProfile?.profile_url && (
                                                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                                                        <p className="text-xs text-gray-500">Profile URL</p>
                                                        <a
                                                            href={juantapProfile.profile_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-orange-600 hover:underline break-all"
                                                        >
                                                            {juantapProfile.profile_url}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={openModal}
                                        className="w-full py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-medium"
                                    >
                                        {juantapProfile?.profile_url || juantapProfile?.qr_code ? "Update Profile" : "Add Details"}
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <button
                                        onClick={() => window.open("https://www.juantap.info/", "_blank")}
                                        className="w-full py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-medium"
                                    >
                                        Avail JuanTap Subscription
                                    </button>

                                    <button
                                        onClick={openModal}
                                        className="w-full py-3 border-2 border-emerald-600 text-emerald-600 rounded-xl hover:bg-emerald-50 transition font-medium"
                                    >
                                        Add Existing Profile
                                    </button>
                                </div>
                            )}
                        </Section>
                    </motion.div>
                </div>

                {/* PROJECTS & ACHIEVEMENTS */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-8"
                >
                    <Section title="Projects & Achievements" icon={Trophy}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Projects" name="projects" value={isEditing ? formData.projects : profile.projects || ""} editable={isEditing} onChange={handleChange} />
                            <Field label="Achievements" name="achievements" value={isEditing ? formData.achievements : profile.achievements || ""} editable={isEditing} onChange={handleChange} />
                            <Field label="Positions" name="positions" value={isEditing ? formData.positions : profile.positions || ""} editable={isEditing} onChange={handleChange} />
                        </div>
                    </Section>
                </motion.div>

                {/* MODAL */}
                <AnimatePresence>
                    {showModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white w-full max-w-xl rounded-2xl shadow-xl"
                            >
                                <div className="flex items-center justify-between px-6 py-4 border-b">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {juantapProfile ? "Update JuanTap Profile" : "Add Existing JuanTap Profile"}
                                    </h2>
                                    <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                        ✕
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                    {formError && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                            {formError}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">JuanTap Profile URL</label>
                                        <input
                                            type="url"
                                            value={formData.profile_url}
                                            onChange={(e) => setFormData({ ...formData, profile_url: e.target.value })}
                                            placeholder="https://juantap.info/your-profile"
                                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload QR Code</label>
                                        <input type="file" accept="image/*" onChange={handleQrUpload} className="block w-full text-sm" />

                                        {qrPreview && (
                                            <div className="mt-3 flex justify-center">
                                                <Image
                                                    src={qrPreview}
                                                    alt="QR Preview"
                                                    width={128}
                                                    height={128}
                                                    className="rounded-lg border"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subscription</label>
                                        <select
                                            name="subscription"
                                            value={formData.subscription}
                                            onChange={(e) => setFormData({ ...formData, subscription: e.target.value as "silver" | "gold" | "black" })}
                                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500"
                                        >
                                            <option value="silver">Silver</option>
                                            <option value="gold">Gold</option>
                                            <option value="black">Black</option>
                                        </select>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 px-4 py-3 border rounded-xl hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        {juantapProfile && (
                                            <button
                                                type="button"
                                                onClick={handleDelete}
                                                disabled={formLoading}
                                                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50"
                                            >
                                                {formLoading ? "Deleting..." : "Delete"}
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={formLoading}
                                            className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50"
                                        >
                                            {formLoading ? "Saving..." : "Save Profile"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </MemberLayout >
    );
}

interface SectionProps {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}

function Section({ title, icon: Icon, children }: SectionProps) {
    return (
        <section className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Icon className="w-5 h-5 text-gray-400" />
                {title}
            </h2>
            {children}
        </section>
    );
}

interface FieldProps {
    label: string;
    name: string;
    value: string | boolean;
    editable: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: "text" | "checkbox" | "date";
}

function Field({ label, name, value, editable, onChange, type = "text" }: FieldProps) {
    return (
        <div className="space-y-1">
            <label className="text-sm text-gray-500">{label}</label>
            {editable ? (
                type === "checkbox" ? (
                    <input
                        type="checkbox"
                        name={name}
                        checked={value as boolean}
                        onChange={onChange}
                        className="h-4 w-4"
                    />
                ) : (
                    <input
                        type={type}
                        name={name}
                        value={value as string || ""}
                        onChange={onChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                )
            ) : (
                <p className="font-medium text-gray-900">{type === "checkbox" ? (value ? "Yes" : "No") : value || "Not specified"}</p>
            )}
        </div>
    );
}

interface InfoProps {
    icon: React.ElementType;
    label: string;
    value: string;
}

function Info({ icon: Icon, label, value }: InfoProps) {
    return (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
            <Icon className="w-5 h-5 text-gray-400" />
            <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="font-medium text-sm text-gray-900">
                    {value}
                </p>
            </div>
        </div>
    );
}