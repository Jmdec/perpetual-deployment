"use client"

import { Home, Briefcase, Newspaper, AlertCircle, User } from "lucide-react"

interface MemberBottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

/**
 * Member Bottom Navigation Component
 * A reusable bottom navigation bar for member-facing pages
 * 
 * @param {string} activeTab - Currently active tab id
 * @param {function} onTabChange - Callback function when tab is changed
 * 
 * Usage:
 * import MemberBottomNav from "@/components/member-bottom-nav"
 * 
 * <MemberBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
 */
export default function MemberBottomNav({ activeTab, onTabChange }: MemberBottomNavProps) {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "services", label: "Services", icon: Briefcase },
    { id: "news", label: "News", icon: Newspaper },
    { id: "emergency", label: "Emergency", icon: AlertCircle },
    { id: "account", label: "Account", icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-around h-20">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px] ${
                  isActive 
                    ? "text-orange-500" 
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? "scale-110" : ""}
                />
                <span className={`text-xs font-medium ${isActive ? "font-semibold" : ""}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* iOS-style home indicator */}
      <div className="flex justify-center pb-2">
        <div className="w-32 h-1 bg-gray-700 rounded-full" />
      </div>
    </nav>
  )
}