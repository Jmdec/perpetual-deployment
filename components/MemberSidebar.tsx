"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  Grid3x3,
  Newspaper,
  AlertTriangle,
  User,
  FileText,
  GraduationCap,
  Rocket,
  Building2,
  MapPin,
  Bell,
  LogOut,
  File,
  Shield,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Handshake,
  Megaphone,
  BadgeCheck,
  Camera,
} from 'lucide-react';
import { authClient } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';

export default function MemberSidebar({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Dropdown state
  const [expandedSections, setExpandedSections] = React.useState({
    quickAccess: false,
    certificates: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);

    if (!isCollapsed) {
      setExpandedSections({
        quickAccess: false,
        certificates: false,
      });
    }
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoggingOut(true);

    try {
      await authClient.logout();

      toast({
        title: "✓ Logged Out Successfully",
        description: "You have been securely logged out.",
        className: "bg-green-50 border-green-200",
        duration: 2000,
      });

      setTimeout(() => {
        router.push('/login');
      }, 500);

    } catch (error) {
      console.error('Logout error:', error);

      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "An error occurred. Please try again.",
      });

      setIsLoggingOut(false);
    }
  };

  const isActive = (path: string) => {
    if (path === "/dashboard/member") {
      return pathname === path;
    }
    return pathname === path || pathname.startsWith(path + "/");
  };

  const isSectionActive = (items: { path: string }[]) =>
    items.some(item => isActive(item.path));

  const navigationItems = [
    { icon: Home, label: 'Home', path: '/dashboard/member' },
    { icon: Newspaper, label: 'News', path: '/dashboard/member/news' },
    { icon: Megaphone, label: 'Announcements', path: '/dashboard/member/announcement' },
    { icon: Handshake, label: 'Partners', path: '/dashboard/member/partners' },
    { icon: Camera, label: 'Gallery', path: '/dashboard/member/gallery' },
    { icon: BadgeCheck, label: 'Certificate of Legitemacy', path: '/dashboard/member/legitimacy' },
  ];

  return (
    <aside
      className={`hidden lg:block fixed top-0 left-0 h-full overflow-visible 
        bg-gradient-to-b from-yellow-600/90 via-red-800/90 to-red-900/90 
        text-white shadow-2xl z-50 transition-all duration-300 
        ${isCollapsed ? "w-[70px]" : "w-[300px]"}`}
    >
      <button
        onClick={toggleSidebar}
        className="absolute top-4 -right-3 bg-white text-slate-800 rounded-full p-1.5 shadow-lg hover:bg-slate-100 transition-colors z-[999]"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Scrollable Content */}
      <div
        className={`h-full overflow-y-auto overflow-x-hidden ${isCollapsed ? "py-8 px-4" : "py-8 px-8"
          } flex flex-col min-h-full`}
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#eda909b0 #992f2f",
        }}
      >
        {/* Logo Section */}
        <div
          className={`flex items-center gap-2 mb-4 py-3 ${isCollapsed ? "justify-center" : ""
            }`}
        >
          <div
            className="w-10 h-10 rounded-full
              bg-gradient-to-b from-yellow-600/90 via-red-800/90 to-red-900/90
              flex items-center justify-center flex-shrink-0
              ring-2 ring-white/30 shadow-lg"
          >
            <img
              src="/perpetuallogo.jpg"
              alt="Perpetual Help Logo"
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>

          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-base">Perpetual Help</h1>
              <p className="text-xs text-emerald-100">Member Portal</p>
            </div>
          )}
        </div>


        {/* Main Navigation */}
        <nav className="space-y-1 flex-1 py-2 border-t border-white/20">
          {navigationItems.map((item, index) => {
            const active = isActive(item.path)

            return (
              <div key={index} className="group">
                <button
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-2 px-3 py-3 rounded-lg text-left transition-colors text-sm
              ${isCollapsed ? "justify-center" : ""}
              ${active ? "bg-white/20 font-semibold shadow-lg" : "hover:bg-white/10"}`}
                >
                  <item.icon size={16} />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>

                {/* Collapsed Flyout */}
                {isCollapsed && (
                  <div className="absolute left-full w-44 -translate-y-1/2 -m-5 px-3 py-2 -ml-2 bg-emerald-600 text-white text-xs font-semibold rounded-md shadow-xl opacity-0 translate-x-2 invisible pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:visible group-hover:pointer-events-auto transition-all duration-200 z-[9999]">
                    {item.label}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="py-6 border-t border-white/20">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full flex items-center gap-2 px-3 py-3 rounded-lg hover:bg-red-500/20 transition-colors text-sm
        ${isCollapsed ? "justify-center" : ""}`}
          >
            {isLoggingOut ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {!isCollapsed && <span>Logging out...</span>}
              </>
            ) : (
              <>
                <LogOut size={16} />
                {!isCollapsed && <span>Logout</span>}
              </>
            )}
          </button>
        </div>
      </div>
    </aside>

  );
}