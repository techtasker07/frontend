"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth"
import { Search, Building, TrendingUp, ArrowRight, BarChart3, Shield, Users, Target, Award, Home, LogIn, UserPlus, User } from "lucide-react"

// Typewriter Text Component
function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      } else {
        // Reset after a pause
        setTimeout(() => {
          setDisplayText("")
          setCurrentIndex(0)
        }, 2000)
      }
    }, delay + (currentIndex === 0 ? 0 : 100))

    return () => clearTimeout(timer)
  }, [currentIndex, text, delay])

  return <span>{displayText}<span className="animate-pulse">|</span></span>
}

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [showMobilePrompt, setShowMobilePrompt] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()

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

  // Mobile prompt logic
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const isMobile = window.innerWidth < 768
    const hasSeenPrompt = localStorage.getItem('mipripity-sidebar-prompt-seen')

    if (isMobile && !hasSeenPrompt) {
      const timer = setTimeout(() => {
        setShowMobilePrompt(true)
      }, 2000) // Show after 2 seconds

      return () => clearTimeout(timer)
    }
  }, [])

  const dismissMobilePrompt = () => {
    setShowMobilePrompt(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('mipripity-sidebar-prompt-seen', 'true')
    }
  }

  const handleProtectedNavigation = (href: string) => {
    if (!isAuthenticated) {
      alert('Please login to access this feature')
      window.location.href = '/login'
      return
    }
    window.location.href = href
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-56 md:w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
        sidebarVisible ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 md:p-6">
          <div className="flex items-center space-x-2 md:space-x-3 mb-6 md:mb-8">
            <Image
              src="/images/mipripity.png"
              alt="MIPRIPITY Logo"
              width={32}
              height={32}
              className="rounded-lg md:w-[40px] md:h-[40px]"
            />
            <h2 className="text-lg md:text-xl font-bold text-gray-900">MIPRIPITY</h2>
          </div>

          <div className="flex flex-col h-full">
            {/* Top Navigation */}
            <nav className="space-y-3 md:space-y-4 flex-1">
              <Link href="/" className="flex items-center space-x-2 md:space-x-3 text-gray-700 hover:text-blue-600 transition-colors text-sm md:text-base">
                <Home className="h-4 w-4 md:h-5 md:w-5" />
                <span>Home</span>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="flex items-center space-x-2 md:space-x-3 text-gray-700 hover:text-blue-600 transition-colors text-sm md:text-base">
                    <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link href="/properties" className="flex items-center space-x-2 md:space-x-3 text-gray-700 hover:text-blue-600 transition-colors text-sm md:text-base">
                    <Building className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Properties</span>
                  </Link>
                  <Link href="/prospectProperties" className="flex items-center space-x-2 md:space-x-3 text-gray-700 hover:text-blue-600 transition-colors text-sm md:text-base">
                    <Target className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Smart Prospects</span>
                  </Link>
                  <Link href="/polls" className="flex items-center space-x-2 md:space-x-3 text-gray-700 hover:text-blue-600 transition-colors text-sm md:text-base">
                    <Users className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Community Polls</span>
                  </Link>
                  <Link href="/add-property" className="flex items-center space-x-2 md:space-x-3 text-gray-700 hover:text-blue-600 transition-colors text-sm md:text-base">
                    <Building className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Add Property</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/about" className="flex items-center space-x-2 md:space-x-3 text-gray-700 hover:text-blue-600 transition-colors text-sm md:text-base">
                    <Users className="h-4 w-4 md:h-5 md:w-5" />
                    <span>About Us</span>
                  </Link>
                  <Link href="/contact" className="flex items-center space-x-2 md:space-x-3 text-gray-700 hover:text-blue-600 transition-colors text-sm md:text-base">
                    <Users className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Contact Us</span>
                  </Link>
                </>
              )}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto pt-4 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="space-y-3">
                  {/* User Info */}
                  <div className="flex items-center space-x-2 md:space-x-3 p-2 bg-gray-50 rounded-lg">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-xs md:text-sm font-medium text-white">
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium text-gray-900 truncate">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>

                  {/* Profile & Sign Out */}
                  <Link href="/profile" className="flex items-center space-x-2 md:space-x-3 text-gray-700 hover:text-blue-600 transition-colors text-sm md:text-base">
                    <User className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Profile</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="flex items-center space-x-2 md:space-x-3 text-gray-700 hover:text-red-600 transition-colors text-sm md:text-base w-full"
                  >
                    <LogIn className="h-4 w-4 md:h-5 md:w-5 rotate-180" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm">
                    <Link href="/register">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Sign Up
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 text-sm">
                    <Link href="/login">
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Prompt */}
      {showMobilePrompt && (
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={dismissMobilePrompt}
                  className="flex-1"
                >
                  Skip
                </Button>
                <Button
                  size="sm"
                  onClick={dismissMobilePrompt}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Got it!
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-2 md:py-3">
          <div className="flex items-center justify-between">
            {/* Site Name Only */}
            <div>
              <h1 className="text-lg md:text-xl font-bold text-white">MIPRIPITY</h1>
              <p className="text-xs text-white/80 hidden sm:block">Property Investment Platform</p>
            </div>

            {/* Login Button */}
            <Button asChild variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-sm px-3 py-1.5">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <section
        className="relative min-h-[350px] md:min-h-[400px] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1973&q=80')`
        }}
      >
        <div className="container mx-auto px-4 text-center text-white">
          {/* Main Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 leading-tight">
            Properties. Prospects.<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            <span className="text-blue-400">Polls. Profits.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto opacity-90 px-2">
            Discover investment opportunities with community-driven property evaluation and smart insights
          </p>

          {/* Search Bar */}
          <div className="max-w-sm sm:max-w-md md:max-w-xl mx-auto px-4 sm:px-0">
            <div className="relative">
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-xl focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">
              Why Choose Our Platform?
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Get the insights you need to make smart property investment decisions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white rounded-lg shadow-md p-3 md:p-4 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Building className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1 md:mb-2">Property Listings</h3>
              <div className="text-gray-600 text-xs md:text-sm h-8 md:h-10">
                <TypewriterText text="Browse comprehensive property listings with detailed information" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-3 md:p-4 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Target className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1 md:mb-2">Smart Prospects</h3>
              <div className="text-gray-600 text-xs md:text-sm h-8 md:h-10">
                <TypewriterText text="Discover intelligent investment opportunities and insights" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-3 md:p-4 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1 md:mb-2">Community Polls</h3>
              <div className="text-gray-600 text-xs md:text-sm h-8 md:h-10">
                <TypewriterText text="Participate in community-driven property evaluations" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-3 md:p-4 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Award className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1 md:mb-2">Market Insights</h3>
              <div className="text-gray-600 text-xs md:text-sm h-8 md:h-10">
                <TypewriterText text="Access real-time market data and investment analytics" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-base md:text-lg text-gray-700 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Join our community and start making informed property investment decisions today
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base">
              <Link href="/login">
                Get Started Today
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 md:px-8 py-2.5 md:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base">
              <Link href="/register">
                Join Community Polls
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Property Categories Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">
              Explore Prospect Categories
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Find the perfect investment opportunity across different property types
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div
              className="group cursor-pointer"
              onClick={() => handleProtectedNavigation('/prospectProperties?category=Residential')}
            >
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative">
                <div
                  className="h-48 md:h-64 bg-cover bg-center relative"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`
                  }}
                >
                  <div className="absolute top-3 left-3 md:top-4 md:left-4">
                    <Image
                      src="/residential.png"
                      alt="Residential"
                      width={32}
                      height={32}
                      className="bg-white/90 rounded-lg p-1.5 md:w-[40px] md:h-[40px] md:p-2"
                    />
                  </div>
                </div>
                <div className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Residential/Commercial Properties</h3>
                  <p className="text-sm md:text-base text-gray-600">Houses, apartments, offices, and commercial buildings</p>
                </div>
              </div>
            </div>

            <div
              className="group cursor-pointer"
              onClick={() => handleProtectedNavigation('/prospectProperties?category=Land')}
            >
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative">
                <div
                  className="h-48 md:h-64 bg-cover bg-center relative"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`
                  }}
                >
                  <div className="absolute top-3 left-3 md:top-4 md:left-4">
                    <Image
                      src="/land.png"
                      alt="Land"
                      width={32}
                      height={32}
                      className="bg-white/90 rounded-lg p-1.5 md:w-[40px] md:h-[40px] md:p-2"
                    />
                  </div>
                </div>
                <div className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Land Properties</h3>
                  <p className="text-sm md:text-base text-gray-600">Undeveloped land, agricultural properties, and plots</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Company Info */}
            <div className="space-y-3 md:space-y-4 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-3">
                <Image
                  src="/images/mipripity.png"
                  alt="MIPRIPITY Logo"
                  width={32}
                  height={32}
                  className="rounded-lg md:w-[40px] md:h-[40px]"
                />
                <h3 className="text-lg md:text-xl font-bold">MIPRIPITY</h3>
              </div>
              <p className="text-gray-300 text-xs md:text-sm">
                Community-driven property evaluation and investment platform
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-3 md:space-y-4 text-center sm:text-left">
              <h4 className="text-base md:text-lg font-semibold">Quick Links</h4>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-gray-300 hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-3 md:space-y-4 text-center sm:text-left">
              <h4 className="text-base md:text-lg font-semibold">Legal</h4>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                <li>
                  <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 md:space-y-4 text-center sm:text-left">
              <h4 className="text-base md:text-lg font-semibold">Contact</h4>
              <div className="text-xs md:text-sm text-gray-300 space-y-1.5 md:space-y-2">
                <p>Email: mipripity@gmail.com</p>
                <p>Phone: +234 8022414124</p>
                <p>Location: 34, Rafiu Crescent, Mafoluku, Oshodi Lagos</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center">
            <p className="text-gray-400 text-xs md:text-sm">
              © 2025 MIPRIPITY by Techtasker Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
