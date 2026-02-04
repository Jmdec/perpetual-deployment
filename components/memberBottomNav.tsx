"use client"

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  Grid3x3, 
  Newspaper, 
  AlertTriangle, 
  User,
  Menu,
  X,
  FileText,
  GraduationCap,
  Rocket,
  Building2,
  MapPin,
  Bell,
  LogOut,
  ChevronUp,
   File,
   BadgeCheck,
   Handshake,
   Megaphone,
} from 'lucide-react';

export default function MemberBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [showQuickAccess, setShowQuickAccess] = useState(false);

const mainNavigationItems = [
    { icon: Home, label: 'Home', path: '/dashboard/member' },
    { icon: Newspaper, label: 'News', path: '/dashboard/member/news' },
    { icon: Megaphone, label: 'Announcements', path: '/dashboard/member/announcement' },
    { icon: Handshake, label: 'Partners', path: '/dashboard/member/partners' },
    { icon: BadgeCheck, label: 'Certificate of Legitemacy', path: '/dashboard/member/legitimacy' },
  ];

  const isActive = (path: string) => pathname === path;

  const handleNavigation = (path: string) => {
    router.push(path);
    setShowQuickAccess(false);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
      {/* Main Bottom Navigation Bar */}
      <nav className="bg-white border-t border-gray-200 shadow-lg">
        {/* Toggle Button for Quick Access */}
        {showQuickAccess && (
          <button
            onClick={() => setShowQuickAccess(false)}
            className="w-full flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <ChevronUp size={18} />
            <span className="text-xs font-medium">Hide Quick Access</span>
          </button>
        )}

        <div className="flex items-center justify-around">
          {mainNavigationItems.map((item, index) => {
            const active = isActive(item.path);
            return (
              <button
                key={index}
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors flex-1 ${
                  active ? 'text-orange-600' : 'text-gray-600'
                }`}
              >
                <item.icon 
                  size={22} 
                  className={active ? 'text-orange-600' : 'text-gray-600'} 
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className={`text-xs font-medium ${active ? 'text-orange-600 font-semibold' : 'text-gray-600'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}