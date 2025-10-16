"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { PropertyTypeDialog } from "@/components/PropertyTypeDialog"
import { Home, Building, Plus, User, LogOut, UserPlus, LogIn, BarChart3, ShoppingBag, FileText, Zap, Grid3X3, DollarSign, Users } from "lucide-react"

interface SidebarProps {
  onClose?: () => void
}

interface NavigationItem {
  name: string
  href: string
  icon: any
  badge?: number
}

const publicNavigation: NavigationItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { name: "About Us", href: "/about", icon: User },
  { name: "Contact Us", href: "/contact", icon: User },
  { name: "Privacy Policy", href: "/privacy", icon: FileText },
  { name: "Terms of Service", href: "/terms", icon: FileText },
]

const authenticatedNavigation: NavigationItem[] = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Services", href: "#", icon: Grid3X3 },
    { name: "Privacy Policy", href: "/privacy", icon: FileText },
    { name: "Terms of Service", href: "/terms", icon: FileText },
  ]

const servicesSubNavigation: NavigationItem[] = [
  { name: "Poll", href: "/properties", icon: Building },
  { name: "Prospect", href: "/prospects", icon: Zap },
  { name: "Market Place", href: "/marketplace", icon: ShoppingBag },
  { name: "Crowd Funding", href: "/crowd-funding", icon: DollarSign },
  { name: "Re-es Party", href: "/re-es-party", icon: Users },
]

export function Sidebar({ onClose }: SidebarProps) {
   const pathname = usePathname()
   const { user, isAuthenticated, logout } = useAuth()
   const [showPropertyTypeDialog, setShowPropertyTypeDialog] = useState(false)
   const [servicesExpanded, setServicesExpanded] = useState(false)

  // Choose navigation based on authentication status
  const navigation = isAuthenticated ? authenticatedNavigation : publicNavigation

  return (
    <div className="flex h-full w-56 md:w-64 flex-col bg-white shadow-2xl">
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
            {navigation.map((item) => {
              const isActive = pathname === item.href

              // Special handling for Services
              if (item.name === "Services" && isAuthenticated) {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setServicesExpanded(!servicesExpanded)}
                      className={`flex items-center space-x-2 md:space-x-3 transition-colors text-sm md:text-base w-full text-left ${
                        servicesExpanded || servicesSubNavigation.some(sub => pathname === sub.href)
                          ? "text-blue-600 font-medium"
                          : "text-gray-700 hover:text-blue-600"
                      }`}
                    >
                      <item.icon className="h-4 w-4 md:h-5 md:w-5" />
                      <span>{item.name}</span>
                      <span className="ml-auto text-xs">{servicesExpanded ? "−" : "+"}</span>
                    </button>
                    {servicesExpanded && (
                      <div className="ml-4 mt-2 space-y-2">
                        {servicesSubNavigation.map((subItem) => {
                          const isSubActive = pathname === subItem.href
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              onClick={onClose}
                              className={`flex items-center space-x-2 md:space-x-3 transition-colors text-sm md:text-base ${
                                isSubActive
                                  ? "text-blue-600 font-medium"
                                  : "text-gray-700 hover:text-blue-600"
                              }`}
                            >
                              <subItem.icon className="h-4 w-4 md:h-5 md:w-5" />
                              <span>{subItem.name}</span>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              }

              // Special handling for Add Property
              if (item.name === "Add Property" && isAuthenticated) {
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setShowPropertyTypeDialog(true)
                      onClose?.()
                    }}
                    className={`flex items-center space-x-2 md:space-x-3 transition-colors text-sm md:text-base w-full text-left ${
                      isActive
                        ? "text-blue-600 font-medium"
                        : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    <item.icon className="h-4 w-4 md:h-5 md:w-5" />
                    <span>{item.name}</span>
                  </button>
                )
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center space-x-2 md:space-x-3 transition-colors text-sm md:text-base ${
                    isActive
                      ? "text-blue-600 font-medium"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  <item.icon className="h-4 w-4 md:h-5 md:w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
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
                <Link
                  href="/profile"
                  onClick={onClose}
                  className="flex items-center space-x-2 md:space-x-3 text-gray-700 hover:text-blue-600 transition-colors text-sm md:text-base"
                >
                  <User className="h-4 w-4 md:h-5 md:w-5" />
                  <span>Profile</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    onClose?.()
                  }}
                  className="flex items-center space-x-2 md:space-x-3 text-gray-700 hover:text-red-600 transition-colors text-sm md:text-base w-full"
                >
                  <LogOut className="h-4 w-4 md:h-5 md:w-5 rotate-180" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link href="/register" onClick={onClose}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
                <Link href="/login" onClick={onClose}>
                  <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 text-sm">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 md:hidden"
        >
          ×
        </Button>
      )}
      
      <PropertyTypeDialog 
        open={showPropertyTypeDialog} 
        onOpenChange={setShowPropertyTypeDialog} 
      />
    </div>
  )
}
