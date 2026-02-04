"use client"

import { useEffect } from "react"

export default function ScreenshotProtection() {
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // Disable common screenshot shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Print Screen
      if (e.key === "PrintScreen") {
        e.preventDefault()
        navigator.clipboard.writeText("") // Clear clipboard
        alert("Screenshots are disabled on this website for security reasons.")
        return false
      }

      // Ctrl+Shift+S (Firefox screenshot)
      if (e.ctrlKey && e.shiftKey && e.key === "S") {
        e.preventDefault()
        alert("Screenshots are disabled on this website for security reasons.")
        return false
      }

      // Cmd+Shift+3/4/5 (Mac screenshots)
      if (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5")) {
        e.preventDefault()
        alert("Screenshots are disabled on this website for security reasons.")
        return false
      }

      // Windows+Shift+S (Windows Snipping Tool)
      if (e.metaKey && e.shiftKey && e.key === "s") {
        e.preventDefault()
        alert("Screenshots are disabled on this website for security reasons.")
        return false
      }

      // Disable F12 (Developer Tools)
      if (e.key === "F12") {
        e.preventDefault()
        return false
      }

      // Disable Ctrl+Shift+I (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault()
        return false
      }

      // Disable Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === "J") {
        e.preventDefault()
        return false
      }

      // Disable Ctrl+U (View Source)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault()
        return false
      }
    }

    // Detect if DevTools is open
    const detectDevTools = () => {
      const threshold = 160
      const widthThreshold = window.outerWidth - window.innerWidth > threshold
      const heightThreshold = window.outerHeight - window.innerHeight > threshold

      if (widthThreshold || heightThreshold) {
        document.body.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui;">
            <div style="text-align: center;">
              <h1 style="color: #dc2626; margin-bottom: 1rem;">Developer Tools Detected</h1>
              <p style="color: #6b7280;">Please close developer tools to continue.</p>
            </div>
          </div>
        `
      }
    }

    // Add blur overlay when user switches tabs/windows
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.body.style.filter = "blur(10px)"
      } else {
        document.body.style.filter = "none"
      }
    }

    // Prevent text selection (optional - can be annoying for users)
    const disableSelection = () => {
      document.body.style.userSelect = "none"
      document.body.style.webkitUserSelect = "none"
    }

    // Add watermark overlay
    const addWatermark = () => {
      const watermark = document.createElement("div")
      watermark.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        overflow: hidden;
      `
      watermark.id = "screenshot-watermark"
      
      // Create repeating watermark pattern
      let watermarkHTML = ''
      const rows = 8
      const cols = 4
      
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const top = (i * 15) + 5
          const left = (j * 25) + 5
          watermarkHTML += `
            <div style="
              position: absolute;
              top: ${top}%;
              left: ${left}%;
              transform: rotate(-45deg);
              font-size: 24px;
              font-weight: 700;
              color: rgba(220, 38, 38, 0.08);
              white-space: nowrap;
              font-family: system-ui, -apple-system, sans-serif;
              letter-spacing: 2px;
            ">TAU GAMMA PHI</div>
          `
        }
      }
      
      watermark.innerHTML = watermarkHTML
      document.body.appendChild(watermark)
    }

    // Initialize protections
    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    
    // Uncomment if you want to disable text selection
    // disableSelection()
    
    // Add watermark
    addWatermark()

    // Check for DevTools every second
    const devToolsInterval = setInterval(detectDevTools, 1000)

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      clearInterval(devToolsInterval)
      
      const watermark = document.getElementById("screenshot-watermark")
      if (watermark) {
        watermark.remove()
      }

      document.body.style.filter = "none"
      document.body.style.userSelect = "auto"
      document.body.style.webkitUserSelect = "auto"
    }
  }, [])

  return null
}