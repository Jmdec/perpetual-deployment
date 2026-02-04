"use client"

import React, { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authClient } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import {
  LayoutDashboard,
  Newspaper,
  Mail,
  LogOut,
  FileText,
  Megaphone,
  Handshake,
  Images,
  Menu,
  X,
  Camera,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react"

export default function AdminHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast();


  const [menuOpen, setMenuOpen] = useState(false)
  const [customizationOpen, setCustomizationOpen] = useState(false)

  const navigationItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/admin" },
    { icon: Newspaper, label: "News", path: "/dashboard/admin/news" },
    { icon: Megaphone, label: "Announcements", path: "/dashboard/admin/announcements" },
    { icon: Mail, label: "Contact Messages", path: "/dashboard/admin/contact" },
    { icon: FileText, label: "Legitimacy", path: "/dashboard/admin/legitimacy" },
    { icon: Camera, label: "Vlogs", path: "/dashboard/admin/vlogs" },
    { icon: User, label: "Users", path: "/dashboard/admin/users" },
  ]

  const customizationItems = [
    { icon: FileText, label: "About Us", path: "/dashboard/admin/about-us" },
    { icon: FileText, label: "Contact Information", path: "/dashboard/admin/office-contact" },
    { icon: Handshake, label: "Partnerships", path: "/dashboard/admin/partners" },
    { icon: Images, label: "Gallery", path: "/dashboard/admin/gallery" },
  ]

  const handleNavigate = (path: string) => {
    router.push(path)
    setMenuOpen(false)
    setCustomizationOpen(false)
  }

  const handleLogout = async () => {
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
    }
  };

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/")

  const isCustomizationActive = customizationItems.some(item =>
    isActive(item.path)
  )

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden lg:block bg-white shadow-sm sticky top-0 z-30" />

      {/* Mobile Header */}
      <header className="lg:hidden bg-white shadow-sm sticky top-0 z-30 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/perpetuallogo.jpg"
              alt="Perpetual Village Logo"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30 shadow-lg"
            />
            <div>
              <h1 className="font-bold text-sm">Perpetual Help College</h1>
              <p className="text-xs text-gray-500">Admin Dashboard</p>
            </div>
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Hamburger Menu */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-xl transition-transform duration-300 ${menuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <span className="font-bold text-lg">Admin Menu</span>
          <button onClick={() => setMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Menu Content */}
        <nav className="py-2">
          {/* Main Links */}
          {navigationItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleNavigate(item.path)}
              className={`w-full flex items-center gap-4 px-5 py-3 text-left transition-colors ${isActive(item.path)
                  ? "bg-orange-50 text-orange-600 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}

          {/* Customization Section */}
          <button
            onClick={() => setCustomizationOpen(prev => !prev)}
            className={`w-full flex items-center justify-between px-5 py-3 text-left transition-colors ${isCustomizationActive
                ? "bg-orange-50 text-orange-600 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <div className="flex items-center gap-4">
              <FileText size={20} />
              <span>Customization</span>
            </div>
            {customizationOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {customizationOpen && (
            <div className="pl-6">
              {customizationItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center gap-3 px-5 py-2 text-left text-sm transition-colors ${isActive(item.path)
                      ? "text-orange-600 font-semibold"
                      : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-3 text-left text-red-600 hover:bg-red-50 border-t mt-2"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </>
  )
}
