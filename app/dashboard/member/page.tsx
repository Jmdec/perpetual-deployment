"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MemberLayout from "@/components/memberLayout";
import { motion } from "framer-motion";
import AnnouncementsSection from "@/components/member-dashboard/member-announcement";
import NewsSection from "@/components/member-dashboard/member-news";
import EventsPreview from "@/components/member-dashboard/member-event";
import ProfilePreview from "@/components/member-dashboard/member-profile";
import GalleryViewModal from "@/components/member/gallery/view-modal";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

interface Gallery {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(endpoint, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
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
};

export default function MemberDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [galleries, setGalleries] = useState<Gallery[]>([]);

  useEffect(() => {
    fetchUser();
    fetchGalleries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/galleries", { credentials: "include" });
      const data = await res.json();
      setGalleries(data.data ?? data);
    } catch {
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await userAPI.me();
      setUser(res.user);
    } catch {
      toast.error("An error occurred");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (videoUrl?: string): string => {
    if (!videoUrl) return "/placeholder.png";
    if (videoUrl.startsWith("http://") || videoUrl.startsWith("https://")) return videoUrl;
    if (videoUrl.startsWith("/")) return `${process.env.NEXT_PUBLIC_IMAGE_URL}${videoUrl}`;
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}/${videoUrl}`;
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </MemberLayout>
    );
  }

  if (error) {
    return (
      <MemberLayout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={fetchUser} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              Retry
            </button>
          </div>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-linear-to-r from-emerald-600 to-orange-500 bg-clip-text text-transparent">
            Welcome, {user?.name || "Member"}!
          </span>
        </h1>
        <p className="text-gray-600 text-lg">Perpetual Help College Dashboard</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-8">
        <ProfilePreview />
        <EventsPreview />
      </div>
      <div className="grid grid-cols-1 gap-4 mb-8">
        <AnnouncementsSection />
        <NewsSection />
      </div>
    </MemberLayout>
  );
}