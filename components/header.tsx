"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Download, Smartphone, LayoutDashboard, User, LogOut, ShoppingCart, ShoppingBag} from "lucide-react"
import { useCart } from "@/contexts/CartContext"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/announcements", label: "Announcements" },
  { href: "/news", label: "News" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
]

const loginLink = "/login"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

interface UserData {
  id: number
  name: string
  email: string
  role: string
}

declare global {
  interface Navigator {
    standalone?: boolean
  }
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    console.log("📲 Global beforeinstallprompt captured!")
    e.preventDefault()
    globalDeferredPrompt = e as BeforeInstallPromptEvent
  })
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  
  // Cart functionality - get count of unique products
  const { items } = useCart()
  const cartItemCount = items.length // Number of unique products, not total quantity

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    console.log("🔄 Header mounted, checking PWA status...")

    const checkIOS = () => {
      const ua = window.navigator.userAgent.toLowerCase()
      const isIOSDevice = /iphone|ipad|ipod/.test(ua)
      setIsIOS(isIOSDevice)
      console.log(`📱 iOS Device: ${isIOSDevice}`)
      return isIOSDevice
    }

    const iosDetected = checkIOS()

    const checkInstalled = () => {
      const isStandaloneDisplay = window.matchMedia("(display-mode: standalone)").matches
      const isIOSStandalone = window.navigator.standalone === true
      const isAndroidApp = document.referrer.includes("android-app://")

      const installed = isStandaloneDisplay || isIOSStandalone || isAndroidApp

      if (installed) {
        console.log("✅ App is already installed!")
        setIsInstalled(true)
        setShowInstallButton(false)
        return true
      }

      console.log("ℹ️ App not yet installed")
      return false
    }

    if (checkInstalled()) {
      return
    }

    setShowInstallButton(true)

    if (iosDetected) {
      console.log("📱 iOS: Showing install button")
      return
    }

    if (globalDeferredPrompt) {
      console.log("✅ Using globally captured install prompt")
      setDeferredPrompt(globalDeferredPrompt)
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("📲 beforeinstallprompt event in component")
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      globalDeferredPrompt = promptEvent
      setDeferredPrompt(promptEvent)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    const handleAppInstalled = () => {
      console.log("🎉 App successfully installed!")
      setIsInstalled(true)
      setShowInstallButton(false)
      setDeferredPrompt(null)
      globalDeferredPrompt = null
    }

    window.addEventListener("appinstalled", handleAppInstalled)

    setTimeout(() => {
      console.log("📊 PWA Debug Info:", {
        hasPrompt: !!deferredPrompt || !!globalDeferredPrompt,
        isStandalone: window.matchMedia("(display-mode: standalone)").matches,
        isIOS: iosDetected,
        showButton: showInstallButton,
        userAgent: navigator.userAgent,
      })
    }, 2000)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true)
      return
    }

    if (!deferredPrompt && !globalDeferredPrompt) {
      console.warn("⚠️ No install prompt available")
      alert(
        "Install prompt not available. Please try:\n• Using Chrome or Edge browser\n• Ensuring site is served over HTTPS\n• Refreshing the page"
      )
      return
    }

    const prompt = deferredPrompt || globalDeferredPrompt

    try {
      console.log("🚀 Showing install prompt...")
      await prompt!.prompt()

      const { outcome } = await prompt!.userChoice
      console.log(`👤 User response: ${outcome}`)

      if (outcome === "accepted") {
        console.log("✅ User accepted installation")
      } else {
        console.log("❌ User dismissed installation")
      }

      setDeferredPrompt(null)
      globalDeferredPrompt = null
    } catch (error) {
      console.error("❌ Install error:", error)
      alert("Installation failed. Please try again later.")
    }
  }

  const dismissIOSInstructions = () => {
    setShowIOSInstructions(false)
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        setUser(null)
        setShowUserMenu(false)
        router.push("/login")
        router.refresh()
      }
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const getDashboardLink = () => {
    if (!user) return "/"
    return user.role === "admin" ? "/dashboard/admin" : "/dashboard/member"
  }
  const getOrdersLink = () => {
    if (!user) return "/"
    return "/orders"
  }

  const handleCartClick = () => {
    router.push("/products/cart")
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-yellow-200">
        <nav className="max-w-8xl mx-24 px-4 sm:px-6 lg:px-8 py-3 md:py-4 flex items-center justify-between relative">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 md:gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gradient-to-b from-yellow-600/90 via-red-800/90 to-red-900/90 flex items-center justify-center flex-shrink-0 ring-2 ring-white/30 shadow-lg">
                <img src="/perpetuallogo.jpg" alt="Perpetual Village Logo" className="w-10 h-10 rounded-full object-cover" />
              </div>
              <span className="text-base md:text-lg font-bold gradient-text">Perpetual Help</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4">
            {navLinks.map((link, i) => (
              <motion.div key={link.href} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link
                  href={link.href}
                  className={`text-sm font-semibold transition-all relative group px-2 py-1 ${
                    pathname === link.href ? "text-yellow-600" : "text-gray-700 hover:text-yellow-600"
                  }`}
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-yellow-600 to-yellow-500 group-hover:w-full transition-all duration-300" />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Desktop Action Buttons */}
          <motion.div className="hidden lg:flex items-center gap-2 xl:gap-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <AnimatePresence mode="wait">
              {showInstallButton && !isInstalled && (
                <motion.button
                  key="install-button"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onClick={handleInstallClick}
                  className="px-3 xl:px-4 py-2 xl:py-2.5 rounded-full bg-linear-to-r from-yellow-600 to-yellow-500 text-white text-sm font-semibold hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 xl:gap-2"
                >
                  <Download size={16} className="xl:w-[18px] xl:h-[18px]" />
                  <span className="hidden xl:inline">{isIOS ? "Install" : "Install App"}</span>
                  <span className="xl:hidden">Install</span>
                </motion.button>
              )}
            </AnimatePresence>

            {/* User is logged in - show cart, dashboard & user menu */}
            {user ? (
              <>
                {/* Cart Icon */}
                <button
                  onClick={handleCartClick}
                  className="relative p-2 xl:p-2.5 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 transition-all hover:scale-105 active:scale-95"
                  title="View Cart"
                >
                  <ShoppingCart size={18} className="xl:w-5 xl:h-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </button>

                <Link
                  href={getDashboardLink()}
                  className="px-3 xl:px-4 py-2 xl:py-2.5 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-sm font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 xl:gap-2"
                >
                  <LayoutDashboard size={16} className="xl:w-[18px] xl:h-[18px]" />
                  <span className="hidden xl:inline">Dashboard</span>
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 xl:px-4 py-2 xl:py-2.5 rounded-full bg-linear-to-tl from-red-900 via-red-700 to-yellow-700/70 text-white text-sm font-semibold hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                  >
                    <User size={16} className="xl:w-[18px] xl:h-[18px]" />
                    <span className="hidden xl:inline max-w-[120px] truncate">{user.name}</span>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link
                          href={getDashboardLink()}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboard size={16} />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href={getOrdersLink()}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <ShoppingBag size={16} />
                          <span>My Orders</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <Link
                href={loginLink}
                className="pointer-events-auto px-4 xl:px-6 py-2 xl:py-2.5 rounded-full bg-linear-to-tl from-red-900 via-red-700 to-yellow-700/70 text-white text-sm font-semibold hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                Login
              </Link>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-yellow-50 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden bg-white border-t border-yellow-100 px-4 py-4 space-y-2.5 overflow-y-auto max-h-[calc(100vh-80px)] absolute top-full left-0 w-full z-[60] shadow-md"
              >
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block text-sm font-medium py-2.5 px-2 rounded-lg transition-colors ${
                      pathname === link.href ? "text-yellow-600 font-semibold bg-yellow-50" : "text-gray-700 hover:text-yellow-600 hover:bg-yellow-50"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                {showInstallButton && !isInstalled && (
                  <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={() => {
                      handleInstallClick()
                      setIsOpen(false)
                    }}
                    className="block w-full px-4 py-3 rounded-lg bg-linear-to-r from-yellow-600 to-yellow-500 text-white font-medium text-sm text-center flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95"
                  >
                    <Download size={18} />
                    <span>Install App</span>
                  </motion.button>
                )}

                {user ? (
                  <>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="px-2 py-2 mb-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      
                      {/* Cart Button for Mobile */}
                      <button
                        onClick={() => {
                          handleCartClick()
                          setIsOpen(false)
                        }}
                        className="block w-full px-4 py-3 mb-2 rounded-lg bg-orange-100 text-orange-700 font-medium text-sm text-center flex items-center justify-center gap-2 relative"
                      >
                        <ShoppingCart size={18} />
                        <span>View Cart</span>
                        {cartItemCount > 0 && (
                          <span className="absolute right-3 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {cartItemCount}
                          </span>
                        )}
                      </button>

                      <Link
                        href={getDashboardLink()}
                        onClick={() => setIsOpen(false)}
                        className="block w-full px-4 py-3 rounded-lg bg-yellow-100 text-yellow-700 font-medium text-sm text-center flex items-center justify-center gap-2"
                      >
                        <LayoutDashboard size={18} />
                        <span>Go to Dashboard</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout()
                          setIsOpen(false)
                        }}
                        className="block w-full px-4 py-3 mt-2 rounded-lg bg-red-50 text-red-600 font-medium text-sm text-center flex items-center justify-center gap-2"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <Link
                    href={loginLink}
                    onClick={() => setIsOpen(false)}
                    className="block w-full px-4 py-3 rounded-lg bg-linear-to-tl from-red-900 via-red-700 to-yellow-700/70 text-white font-medium text-sm text-center"
                  >
                    Login
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      {/* iOS Install Instructions Modal */}
      <AnimatePresence>
        {showIOSInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={dismissIOSInstructions}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 md:p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={dismissIOSInstructions} className="absolute top-3 right-3 md:top-4 md:right-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 md:p-3 bg-yellow-100 rounded-full">
                  <Smartphone className="text-yellow-600" size={22} />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">Install App</h3>
                  <p className="text-xs md:text-sm text-gray-500">Add to Home Screen</p>
                </div>
              </div>

              <div className="space-y-3.5 md:space-y-4 mt-5 md:mt-6">
                <div className="flex items-start gap-2.5 md:gap-3">
                  <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold text-sm">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-sm md:text-base text-gray-700">
                      Tap the <strong>Share</strong> button <span className="text-xl md:text-2xl">⬆️</span> at the bottom of your browser
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 md:gap-3">
                  <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold text-sm">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-sm md:text-base text-gray-700">
                      Scroll down and tap <strong>"Add to Home Screen"</strong> <span className="text-xl md:text-2xl">➕</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 md:gap-3">
                  <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold text-sm">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-sm md:text-base text-gray-700">
                      Tap <strong>"Add"</strong> to confirm installation
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={dismissIOSInstructions}
                className="w-full mt-5 md:mt-6 px-4 py-2.5 md:py-3 bg-linear-to-r from-yellow-600 to-yellow-500 text-white font-semibold text-sm md:text-base rounded-lg hover:shadow-lg transition-all active:scale-95"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}