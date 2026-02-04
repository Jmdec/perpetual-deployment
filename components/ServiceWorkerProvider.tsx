"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Download } from "lucide-react"

export default function ServiceWorkerProvider() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if running in standalone mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://")
      setIsStandalone(isStandaloneMode)
    }

    checkStandalone()

    // Check if iOS
    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase()
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)
      setIsIOS(isIOSDevice)
    }

    checkIOS()

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Check if user has previously dismissed the prompt
      const hasBeenPrompted = localStorage.getItem("pwa-install-prompted")
      if (!hasBeenPrompted && !isStandalone) {
        setShowInstallPrompt(true)
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Show iOS install prompt if on iOS and not standalone
    if (isIOS && !isStandalone) {
      const hasBeenPrompted = localStorage.getItem("pwa-install-prompted")
      if (!hasBeenPrompted) {
        setTimeout(() => setShowInstallPrompt(true), 3000)
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [isIOS, isStandalone])

  const handleInstallClick = async () => {
    if (!deferredPrompt && !isIOS) {
      return
    }

    if (isIOS) {
      // For iOS, just show instructions since we can't programmatically trigger install
      setShowInstallPrompt(true)
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      console.log("User accepted the install prompt")
    } else {
      console.log("User dismissed the install prompt")
    }

    // Clear the deferred prompt
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
    localStorage.setItem("pwa-install-prompted", "true")
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    localStorage.setItem("pwa-install-prompted", "true")
  }

  if (!showInstallPrompt || isStandalone) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-linear-to-r from-orange-600 to-orange-500 text-white rounded-lg shadow-2xl p-4 border border-orange-400">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Install Perpetual Village App</h3>
              <p className="text-sm text-red-50">
                Get quick access to village services
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isIOS ? (
          <div className="mt-3 text-sm text-orange-50 space-y-2">
            <p className="font-semibold">To install on iOS:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Tap the Share button (square with arrow)</li>
              <li>Scroll down and tap &apos;Add to Home Screen&apos;</li>
              <li>Tap &quot;Add&quot; to confirm</li>
            </ol>
          </div>
        ) : (
          <Button
            onClick={handleInstallClick}
            className="w-full mt-3 bg-white text-orange-600 hover:bg-orange-50 font-semibold"
          >
            Install Now
          </Button>
        )}
      </div>
    </div>
  )
}