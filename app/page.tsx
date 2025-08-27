"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth"
import { api, Property } from "@/lib/api"
import { BudgetSearchModal } from "@/components/budget/budget-search-modal"
import { Search, Building, Target, Users, Award, LogIn, DollarSign, Info } from "lucide-react"

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
  const [budget, setBudget] = useState("")
  const [showBudgetTip, setShowBudgetTip] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [budgetProperties, setBudgetProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()

  const handleProtectedNavigation = (href: string) => {
    if (!isAuthenticated) {
      alert('Please login to access this feature')
      window.location.href = '/login'
      return
    }
    window.location.href = href
  }

  const handleBudgetSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      
      if (!isAuthenticated) {
        alert('Please login or register to search properties by budget')
        window.location.href = '/login'
        return
      }

      if (!budget || parseFloat(budget) <= 0) {
        alert('Please enter a valid budget amount')
        return
      }

      setLoading(true)
      try {
        const response = await api.getPropertiesByBudget(parseFloat(budget))
        if (response.success) {
          setBudgetProperties(response.data)
          setIsModalOpen(true)
        }
      } catch (error) {
        console.error('Failed to fetch properties by budget:', error)
        alert('Failed to search properties. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleBudgetFocus = () => {
    setShowBudgetTip(true)
  }

  const handleBudgetBlur = () => {
    setTimeout(() => setShowBudgetTip(false), 200)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-2 md:py-3">
          <div className="flex items-center justify-between">
            {/* Site Name Only */}
            <div>
              <h1 className="text-lg md:text-xl font-bold text-white">MIPRIPITY</h1>
              <p className="text-xs text-white/80 hidden sm:block">Property Investment Platform</p>
            </div>

            {/* Dynamic Login/Logout Button */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:flex items-center space-x-2 text-white/80 text-xs">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </span>
                  </div>
                  <span className="hidden md:block">{user?.first_name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="bg-white/10 border border-white/30 text-white hover:bg-white/20 text-sm px-3 py-1.5 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-sm px-3 py-1.5">
                  Login
                </Button>
              </Link>
            )}
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

          {/* Budget Search Bar */}
          <div className="max-w-sm sm:max-w-md md:max-w-xl mx-auto px-4 sm:px-0">
            <div className="relative">
              <span className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-slate-600 font-semibold">
                ₦
              </span>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Input your Budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                onKeyDown={handleBudgetSearch}
                onFocus={handleBudgetFocus}
                onBlur={handleBudgetBlur}
                className="pl-8 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-xl focus:ring-2 focus:ring-blue-500 focus:outline-none w-full text-black"
                disabled={loading}
              />
              {loading && (
                <div className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            
            {/* Budget Tip Notification */}
            {showBudgetTip && (
              <div className="absolute top-full left-0 right-0 mt-2 mx-4 sm:mx-0 z-10">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg">
                  <div className="flex items-start space-x-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Get suggestions based on your budget</p>
                      <p className="text-xs text-blue-600 mt-1">
                        Enter your budget and press Enter to find properties within your range
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
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

      {/* Call to Action Section - Hidden for logged-in users */}
      {!isAuthenticated && (
        <section className="py-12 md:py-16 bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-base md:text-lg text-gray-700 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              Join our community and start making informed property investment decisions today
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
              <Link href="/login">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base">
                  Get Started Today
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 md:px-8 py-2.5 md:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base">
                  Join Community Polls
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

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

      {/* Budget Search Modal */}
      <BudgetSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        properties={budgetProperties}
        budget={parseFloat(budget) || 0}
        loading={loading}
      />
    </div>
  )
}
