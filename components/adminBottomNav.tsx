"use client"

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Newspaper, 
  Mail, 
  User,
  FileText,
  Building,
  ScrollText,
  Heart,
  UserCheck,
  Ambulance,
  MapPin,
  Home,
  HandHelping,
  ShieldCheck,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  MoreHorizontal
} from 'lucide-react';

type NavItem = {
  icon: any;
  label: string;
  type: 'link' | 'dropup';
  path?: string;
  items?: Array<{
    icon: any;
    label: string;
    path: string;
  }>;
};

export default function AdminBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeDropup, setActiveDropup] = useState<string | null>(null);

  // ---------------------------
  // CATEGORIZED LIKE SIDEBAR
  // ---------------------------

  const governmentServices = [
    { icon: FileText, label: 'Business Permit', path: '/dashboard/admin/business-permit' },
    { icon: Building, label: 'Building Permit', path: '/dashboard/admin/building-permit' },
    { icon: ScrollText, label: 'Cedula', path: '/dashboard/admin/cedula' },
    { icon: Heart, label: 'Marriage License', path: '/dashboard/admin/marriage-license' },
  ];

  const civilRegistry = [
    { icon: MapPin, label: 'Residency Certificate', path: '/dashboard/admin/residency-certificate' },
    { icon: Home, label: 'Indigency Certificate', path: '/dashboard/admin/indigency-certificate' },
    { icon: HandHelping, label: 'Good Moral Certificate', path: '/dashboard/admin/good-moral-certificate' },
  ];

  const healthServices = [
    { icon: UserCheck, label: 'Health Certificate', path: '/dashboard/admin/health-certificate' },
    { icon: Heart, label: 'Medical Assistance', path: '/dashboard/admin/medical-assistance' },
    { icon: Ambulance, label: 'Ambulance Request', path: '/dashboard/admin/ambulance-request' },
  ];

  const publicSafety = [
    { icon: FileText, label: 'Barangay Clearance', path: '/dashboard/admin/barangay-clearance' },
    { icon: ShieldCheck, label: 'Barangay Blotter', path: '/dashboard/admin/barangay-blotter' },
  ];

  const newsAndUpdates = [
    { icon: Newspaper, label: 'News', path: '/dashboard/admin/news' },
    { icon: ScrollText, label: 'Announcements', path: '/dashboard/admin/announcements' },
  ];

  // ---------------------------
  // BOTTOM NAV GROUPS
  // ---------------------------

  const allNavItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/admin', type: 'link' },
    { icon: FileText, label: 'Gov Services', type: 'dropup', items: governmentServices },
    { icon: ScrollText, label: 'Civil Registry', type: 'dropup', items: civilRegistry },
    { icon: Heart, label: 'Health', type: 'dropup', items: healthServices },
    { icon: ShieldCheck, label: 'Public Safety', type: 'dropup', items: publicSafety },
    { icon: Newspaper, label: 'Updates', type: 'dropup', items: newsAndUpdates },
    { icon: Mail, label: 'Messages', path: '/dashboard/admin/contact', type: 'link' },
  ];

  // Show first 4 items + More button
  const primaryNavItems = allNavItems.slice(0, 4);
  const moreNavItems = allNavItems.slice(4);

  const isActive = (path: string) => {
    if (path === '/dashboard/admin') {
      return pathname === path;
    }
    return pathname === path || pathname.startsWith(path + '/');
  };

  const isGroupActive = (items: Array<{icon: any; label: string; path: string}>) => {
    return items.some(item => isActive(item.path));
  };

  const isMoreActive = () => {
    return moreNavItems.some(item => {
      if (item.type === 'link' && item.path) {
        return isActive(item.path);
      } else if (item.type === 'dropup' && item.items) {
        return isGroupActive(item.items);
      }
      return false;
    });
  };

  const handleNavClick = (item: NavItem) => {
    if (item.type === 'link' && item.path) {
      router.push(item.path);
      setActiveDropup(null);
    } else if (item.type === 'dropup') {
      setActiveDropup(activeDropup === item.label ? null : item.label);
    }
  };

  const handleSubItemClick = (path: string) => {
    router.push(path);
    setActiveDropup(null);
  };

  const getDropupItems = () => {
    if (activeDropup === 'Gov Services') return governmentServices;
    if (activeDropup === 'Civil Registry') return civilRegistry;
    if (activeDropup === 'Health') return healthServices;
    if (activeDropup === 'Public Safety') return publicSafety;
    if (activeDropup === 'Updates') return newsAndUpdates;
    if (activeDropup === 'More') return moreNavItems;
    return [];
  };

  return (
    <>
      {/* Backdrop */}
      {activeDropup && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
          onClick={() => setActiveDropup(null)}
        />
      )}

      {/* Dropup Menu */}
      {activeDropup && (
        <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 animate-in slide-in-from-bottom duration-300">
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200  bg-linear-to-tl from-yellow-500/90 via-red-800/90 to-red-900/90 text-white">
              {/* Back button for sub-categories */}
              {activeDropup !== 'More' && 
               activeDropup !== 'Dashboard' && 
               activeDropup !== 'Gov Services' && 
               activeDropup !== 'Civil Registry' && 
               activeDropup !== 'Health' && (
                <button 
                  onClick={() => setActiveDropup('More')}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors mr-2"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <h3 className="font-semibold text-sm flex-1">{activeDropup}</h3>
              <button 
                onClick={() => setActiveDropup(null)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-2">
              {activeDropup === 'More' ? (
                // Display More menu items as categories
                (getDropupItems() as NavItem[]).map((item, index) => {
                  const isLinkItem = item.type === 'link';
                  const isDropupItem = item.type === 'dropup';
                  const itemActive = isLinkItem && item.path ? isActive(item.path) : false;
                  const groupItemActive = isDropupItem && item.items ? isGroupActive(item.items) : false;

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (isLinkItem && item.path) {
                          handleSubItemClick(item.path);
                        } else if (isDropupItem) {
                          setActiveDropup(item.label);
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        itemActive || groupItemActive
                          ? 'bg-linear-to-r from-yellow-50 to-orange-50 text-yellow-500 font-semibold' 
                          : 'hover:bg-gray-50 text-gray-500'
                      }`}
                    >
                      <item.icon size={20} className={
                        itemActive || groupItemActive
                          ? 'text-yellow-500' 
                          : 'text-gray-500'
                      } />
                      <span className="text-sm">{item.label}</span>
                      {isDropupItem && (
                        <ChevronRight size={16} className="ml-auto text-gray-400" />
                      )}
                    </button>
                  );
                })
              ) : (
                // Display subcategory items - check if items exist
                (() => {
                  const items = getDropupItems();
                  // If it's a NavItem array (from More menu), map differently
                  if (items.length > 0 && 'type' in items[0]) {
                    return (items as NavItem[]).map((item, index) => {
                      if (item.type === 'link' && item.path) {
                        const active = isActive(item.path);
                        return (
                          <button
                            key={index}
                            onClick={() => handleSubItemClick(item.path!)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                              active 
                                ? 'bg-linear-to-r from-yellow-50 to-orange-50 text-yellow-500 font-semibold' 
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <item.icon size={20} className={active ? 'text-yellow-500' : 'text-gray-500'} />
                            <span className="text-sm">{item.label}</span>
                          </button>
                        );
                      }
                      return null;
                    });
                  }
                  // Otherwise it's a regular sub-items array
                  return items.map((item: any, index) => {
                    const active = item.path ? isActive(item.path) : false;
                    return (
                      <button
                        key={index}
                        onClick={() => item.path && handleSubItemClick(item.path)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          active 
                            ? 'bg-linear-to-r from-yellow-50 to-orange-50 text-yellow-500 font-semibold' 
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <item.icon size={20} className={active ? 'text-yellow-500' : 'text-gray-500'} />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    );
                  });
                })()
              )}
            </div>

          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
        <div className="flex items-center justify-around">
          {/* Primary Nav Items */}
          {primaryNavItems.map((item, index) => {
            const active = item.type === 'link' && item.path
              ? isActive(item.path) 
              : item.type === 'dropup' && item.items
              ? isGroupActive(item.items)
              : false;
            const isDropupOpen = activeDropup === item.label;

            return (
              <button
                key={index}
                onClick={() => handleNavClick(item)}
                className={`flex-1 flex flex-col items-center py-3 transition-colors relative ${
                  active || isDropupOpen
                    ? 'text-yellow-500'
                    : 'text-gray-500'
                }`}
              >
                <div className="relative">
                  <item.icon 
                    size={22} 
                    className={active || isDropupOpen ? 'text-yellow-500' : ''} 
                  />
                  {item.type === 'dropup' && (
                    <ChevronUp 
                      size={12} 
                      className={`absolute -top-1 -right-1 transition-transform ${
                        isDropupOpen ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </div>

                <span className="text-[10px] mt-1 font-medium">{item.label}</span>

                {(active || isDropupOpen) && (
                  <div className="absolute bottom-0 w-10 h-1 bg-linear-to-r from-yellow-500 via-yellow-500 to-red-600 rounded-t-full" />
                )}
              </button>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setActiveDropup(activeDropup === 'More' ? null : 'More')}
            className={`flex-1 flex flex-col items-center py-3 transition-colors relative ${
              isMoreActive() || activeDropup === 'More'
                ? 'text-yellow-500'
                : 'text-gray-500'
            }`}
          >
            <div className="relative">
              <MoreHorizontal 
                size={22} 
                className={isMoreActive() || activeDropup === 'More' ? 'text-yellow-500' : ''} 
              />
            </div>

            <span className="text-[10px] mt-1 font-medium">More</span>

            {(isMoreActive() || activeDropup === 'More') && (
              <div className="absolute bottom-0 w-10 h-1 bg-linear-to-r from-yellow-500 via-yellow-500 to-red-600 rounded-t-full" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
}