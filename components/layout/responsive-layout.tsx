"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { MobileHeader } from "./mobile-header"
import { Footer } from "./footer"
import { LoginSuccessHandler } from "../ai/login-success-handler"

interface ResponsiveLayoutProps {
  children: React.ReactNode
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  // If it's the homepage, just return the children without the layout
  if (isHomePage) {
    return <>{children}</>
  }

  // Mouse hover effect for sidebar
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX <= 50) {
        setSidebarVisible(true)
      } else if (e.clientX > 300) {
        setSidebarVisible(false)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden">
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
      </div>

      {/* Desktop Hover Sidebar */}
      <div className={`hidden md:block fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ${
        sidebarVisible ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content - No left margin since sidebar is now overlay */}
      <div className="w-full">
        <main className="min-h-screen pt-16 md:pt-0">{children}</main>
        <Footer />
      </div>

      {/* Login Success Handler - Global AI Prospect Feature */}
      <LoginSuccessHandler />
    </div>
  )
}
