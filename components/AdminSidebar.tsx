"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  Mail,
  User,
  LogOut,
  FileText,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Handshake,
  Images,
  Video,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

export default function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (v: boolean) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
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

      setTimeout(() => router.push("/login"), 500);
    } catch (error) {
      console.error("Logout error:", error);

      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "An error occurred. Please try again.",
      });

      setIsLoggingOut(false);
    }
  };

  const isActive = (path: string) => {
    if (path === "/dashboard/admin") {
      return pathname === path;
    }
    return pathname === path || pathname.startsWith(path + "/");
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    closeMobileSidebar();
  };

  const navigationItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/admin" },
    { icon: Newspaper, label: "News", path: "/dashboard/admin/news" },
    { icon: Megaphone, label: "Announcements", path: "/dashboard/admin/announcements" },
    { icon: Mail, label: "Contact Messages", path: "/dashboard/admin/contact" },
    { icon: FileText, label: "Legitimacy", path: "/dashboard/admin/legitimacy" },
    { icon: User, label: "Users", path: "/dashboard/admin/users" },
  ];

  const customization = [
    { icon: FileText, label: "About Us", path: "/dashboard/admin/about-us" },
    { icon: FileText, label: "Contact Information", path: "/dashboard/admin/office-contact" },
    { icon: Handshake, label: "Partnerships", path: "/dashboard/admin/partners" },
    { icon: Images, label: "Gallery", path: "/dashboard/admin/gallery" },
    { icon: Video, label: "Vlogs", path: "/dashboard/admin/vlogs" },
  ];

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div
        className={`flex items-center gap-2 mb-4 py-3 ${
          isCollapsed ? "justify-center lg:justify-center" : ""
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
            alt="Perpetual Village Logo"
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>
        {!isCollapsed && (
          <div>
            <h1 className="font-bold text-base">Perpetual Help</h1>
            <p className="text-xs text-emerald-100">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1 py-2 border-t border-white/20">
        {navigationItems.map((item, index) => {
          const active = isActive(item.path);

          return (
            <div key={index} className="group relative">
              <button
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors text-sm
                  ${isCollapsed ? "lg:justify-center" : ""}
                  ${
                    active
                      ? "bg-white/20 font-semibold shadow-lg"
                      : "hover:bg-white/10"
                  }`}
              >
                <item.icon size={16} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>

              {/* Collapsed Flyout - Desktop only */}
              {isCollapsed && (
                <div className="hidden lg:block absolute left-full top-1/2 ml-2 -translate-y-1/2 px-3 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-md shadow-xl opacity-0 translate-x-2 invisible pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:visible group-hover:pointer-events-auto transition-all duration-200 z-[9999] whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Customization Section */}
      <div className="py-2 mt-2 border-t border-white/20">
        {!isCollapsed && (
          <h3 className="text-xs font-semibold text-emerald-100 mb-2 px-3">
            CUSTOMIZATION
          </h3>
        )}
        <nav className="space-y-1">
          {customization.map((item, index) => {
            const active = isActive(item.path);

            return (
              <div key={index} className="group relative">
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-2 px-3 py-3 rounded-lg text-left transition-colors text-sm
                    ${isCollapsed ? "lg:justify-center" : ""}
                    ${
                      active
                        ? "bg-white/20 font-semibold shadow-lg"
                        : "hover:bg-white/10"
                    }`}
                >
                  <item.icon size={16} />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>

                {/* Collapsed Flyout - Desktop only */}
                {isCollapsed && (
                  <div className="hidden lg:block absolute left-full top-1/2 ml-2 -translate-y-1/2 px-3 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-md shadow-xl opacity-0 translate-x-2 invisible pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:visible group-hover:pointer-events-auto transition-all duration-200 z-[9999] whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="py-3 mt-2 border-t border-white/20">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-red-500/20 transition-colors text-sm
            ${isCollapsed ? "lg:justify-center" : ""}`}
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
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:fixed lg:block top-0 left-0 h-full overflow-visible 
          bg-gradient-to-b from-yellow-600/90 via-red-800/90 to-red-900/90 
          text-white shadow-2xl z-50 transition-all duration-300 
          ${isCollapsed ? "w-[70px]" : "w-[300px]"}`}
      >
        <button
          onClick={toggleSidebar}
          className="absolute top-4 -right-3 bg-white text-slate-800 rounded-full p-1.5 shadow-lg hover:bg-slate-100 transition-colors z-[9999]"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Scrollable Content */}
        <div
          className={`h-full overflow-y-auto overflow-x-hidden ${
            isCollapsed ? "py-8 px-4" : "py-8 px-8"
          } flex flex-col min-h-full`}
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#eda909b0 #992f2f",
          }}
        >
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed lg:hidden top-0 left-0 h-full overflow-visible 
          bg-gradient-to-b from-yellow-600/90 via-red-800/90 to-red-900/90 
          text-white shadow-2xl z-50 transition-transform duration-300 w-[280px]
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Close Button */}
        <button
          onClick={closeMobileSidebar}
          className="absolute top-4 right-4 bg-white text-slate-800 rounded-full p-1.5 shadow-lg hover:bg-slate-100 transition-colors z-[9999]"
        >
          <X size={16} />
        </button>

        {/* Scrollable Content */}
        <div
          className="h-full overflow-y-auto overflow-x-hidden py-8 px-6 flex flex-col min-h-full"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#eda909b0 #992f2f",
          }}
        >
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}