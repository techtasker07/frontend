"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { MobileHeader } from "./mobile-header"
import { DesktopHeader } from "./desktop-header"
import { Footer } from "./footer"
import { LoginSuccessHandler } from "../ai/login-success-handler"

interface ResponsiveLayoutProps {
  children: React.ReactNode
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [showMobilePrompt, setShowMobilePrompt] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const isAuthPage = pathname === "/login" || pathname === "/register"
  const isAIProspectPage = pathname.startsWith("/ai/")
  const isDashboardPage = pathname === "/dashboard"

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

  // Mobile prompt logic for homepage
  useEffect(() => {
    // Only run on client side and on homepage
    if (typeof window === 'undefined' || !isHomePage) return

    const isMobile = window.innerWidth < 768
    const hasSeenPrompt = localStorage.getItem('mipripity-sidebar-prompt-seen')

    if (isMobile && !hasSeenPrompt) {
      const timer = setTimeout(() => {
        setShowMobilePrompt(true)
      }, 2000) // Show after 2 seconds

      return () => clearTimeout(timer)
    }
  }, [isHomePage])

  const dismissMobilePrompt = () => {
    setShowMobilePrompt(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('mipripity-sidebar-prompt-seen', 'true')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Only show on non-auth and non-AI prospect pages */}
      {!isAuthPage && !isAIProspectPage && (
        <div className="md:hidden">
          <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
        </div>
      )}

      {/* Desktop Header - Only show on non-auth and non-AI prospect pages */}
      {!isAuthPage && !isAIProspectPage && (
        <div className="hidden md:block">
          <DesktopHeader onMenuClick={() => setSidebarOpen(true)} />
        </div>
      )}

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

      {/* Mobile Sidebar Prompt - Only show on homepage */}
      {isHomePage && showMobilePrompt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 md:hidden">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-auto shadow-2xl">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="flex space-x-1">
                    <div className="w-1 h-6 bg-blue-600 rounded animate-pulse"></div>
                    <div className="w-1 h-6 bg-blue-600 rounded animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-1 h-6 bg-blue-600 rounded animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Discover the Sidebar!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Tap the left edge of your screen to reveal the navigation menu. Tap outside to hide it.
                </p>
                <div className="flex items-center justify-center space-x-2 text-blue-600 mb-4">
                  <span className="text-2xl">👈</span>
                  <span className="text-sm font-medium">Swipe from left edge</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={dismissMobilePrompt}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={dismissMobilePrompt}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full">
        <main className={`min-h-screen ${!isAuthPage && !isAIProspectPage ? 'pt-16 md:pt-16' : ''}`}>
          {children}
        </main>
        <Footer />
      </div>

      {/* Login Success Handler - Global AI Prospect Feature */}
      <LoginSuccessHandler />
    </div>
  )
}