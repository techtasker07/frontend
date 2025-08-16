"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth"
import { Search, Building, TrendingUp, ArrowRight, BarChart3, Shield, Users, Target, Award, Home, LogIn, UserPlus } from "lucide-react"

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
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
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
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
        sidebarVisible ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <Image
              src="/images/mipripity.png"
              alt="MIPRIPITY Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <h2 className="text-xl font-bold text-gray-900">MIPRIPITY</h2>
          </div>

          <nav className="space-y-4">
            <Link href="/" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/properties" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors">
                  <Building className="h-5 w-5" />
                  <span>Properties</span>
                </Link>
                <Link href="/prospectProperties" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors">
                  <Target className="h-5 w-5" />
                  <span>Smart Prospects</span>
                </Link>
                <Link href="/polls" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors">
                  <Users className="h-5 w-5" />
                  <span>Community Polls</span>
                </Link>
                <Link href="/add-property" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors">
                  <Building className="h-5 w-5" />
                  <span>Add Property</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors">
                  <UserPlus className="h-5 w-5" />
                  <span>Sign Up</span>
                </Link>
                <Link href="/login" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors">
                  <LogIn className="h-5 w-5" />
                  <span>Login</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Site Name */}
            <div className="flex items-center space-x-4">
              <Image
                src="/images/mipripity.png"
                alt="MIPRIPITY Logo"
                width={50}
                height={50}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">MIPRIPITY</h1>
                <p className="text-sm text-white/80">Property Investment Platform</p>
              </div>
            </div>

            {/* Login Button */}
            <Button asChild variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <section
        className="relative min-h-[400px] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1973&q=80')`
        }}
      >
        <div className="container mx-auto px-4 text-center text-white">
          {/* Main Headline */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Properties. Prospects.<br />
            <span className="text-blue-400">Polls. Profits.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Discover investment opportunities with community-driven property evaluation and smart insights
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search properties by location, title, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 text-base bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get the insights you need to make smart property investment decisions
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Property Listings</h3>
              <div className="text-gray-600 text-sm h-10">
                <TypewriterText text="Browse comprehensive property listings with detailed information" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Smart Prospects</h3>
              <div className="text-gray-600 text-sm h-10">
                <TypewriterText text="Discover intelligent investment opportunities and insights" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Community Polls</h3>
              <div className="text-gray-600 text-sm h-10">
                <TypewriterText text="Participate in community-driven property evaluations" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Market Insights</h3>
              <div className="text-gray-600 text-sm h-10">
                <TypewriterText text="Access real-time market data and investment analytics" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Join our community and start making informed property investment decisions today
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Link href="/login">
                Get Started Today
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Link href="/register">
                Join Community Polls
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Property Categories Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Explore Prospect Categories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find the perfect investment opportunity across different property types
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div
              className="group cursor-pointer"
              onClick={() => handleProtectedNavigation('/prospectProperties?category=Residential')}
            >
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative">
                <div
                  className="h-64 bg-cover bg-center relative"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`
                  }}
                >
                  <div className="absolute top-4 left-4">
                    <Image
                      src="/residential.png"
                      alt="Residential"
                      width={40}
                      height={40}
                      className="bg-white/90 rounded-lg p-2"
                    />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Residential/Commercial Properties</h3>
                  <p className="text-gray-600">Houses, apartments, offices, and commercial buildings</p>
                </div>
              </div>
            </div>

            <div
              className="group cursor-pointer"
              onClick={() => handleProtectedNavigation('/prospectProperties?category=Land')}
            >
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative">
                <div
                  className="h-64 bg-cover bg-center relative"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`
                  }}
                >
                  <div className="absolute top-4 left-4">
                    <Image
                      src="/land.png"
                      alt="Land"
                      width={40}
                      height={40}
                      className="bg-white/90 rounded-lg p-2"
                    />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Land Properties</h3>
                  <p className="text-gray-600">Undeveloped land, agricultural properties, and plots</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Image
                  src="/images/mipripity.png"
                  alt="MIPRIPITY Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <h3 className="text-xl font-bold">MIPRIPITY</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Community-driven property evaluation and investment platform
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Quick Links</h4>
              <ul className="space-y-2 text-sm">
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
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm">
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
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Contact</h4>
              <div className="text-sm text-gray-300 space-y-2">
                <p>Email: info@mipripity.com</p>
                <p>Phone: +1 (555) 123-4567</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 MIPRIPITY. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
