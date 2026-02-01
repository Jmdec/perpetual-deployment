"use client"

import React, { useState } from "react"
import { useRouter, usePathname } from "next/navigation"

import { authClient } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import {
  Bell,
  LogOut,
  Menu,
  X,
  Home,
  Newspaper,
  Megaphone,
  Handshake,
  BadgeCheck,
} from "lucide-react"

export default function MemberHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false)

  const navigationItems = [
    { icon: Home, label: "Home", path: "/dashboard/member" },
    { icon: Newspaper, label: "News", path: "/dashboard/member/news" },
    { icon: Megaphone, label: "Announcements", path: "/dashboard/member/announcement" },
    { icon: Handshake, label: "Partners", path: "/dashboard/member/partners" },
    { icon: BadgeCheck, label: "Certificate of Legitimacy", path: "/dashboard/member/legitimacy" },
  ]

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

  const handleNavigate = (path: string) => {
    router.push(path)
    setMenuOpen(false)
  }

  const isActive = (path: string) => pathname === path

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
                    <p className="text-xs text-gray-500">Member Dashboard</p>
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

      {/* Slide-down Menu */}
      <div
        className={`fixed top-0 right-0 left-0 z-50 bg-white shadow-xl transform transition-transform duration-300 ${menuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
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
          <span className="font-bold text-lg">Perpetual Help College</span>
          <button onClick={() => setMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="py-2">
          {navigationItems.map((item, index) => {
            const active = isActive(item.path)
            return (
              <button
                key={index}
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-4 px-5 py-3 text-left transition-colors ${active
                    ? "bg-orange-50 text-orange-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            )
          })}

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
