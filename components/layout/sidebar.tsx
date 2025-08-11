"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth"
import { Home, Building, Lightbulb, Plus, User, Settings, LogOut, X, BarChart3, Search, Bell } from "lucide-react"

interface SidebarProps {
  onClose?: () => void
}

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Properties", href: "/properties", icon: Building },
  { name: "Prospect Properties", href: "/prospectProperties", icon: Lightbulb },
  { name: "Add Property", href: "/add-property", icon: Plus },
  { name: "Notifications", href: "/notifications", icon: Bell, badge: 3 },
  { name: "Search", href: "/search", icon: Search },
]

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200 shadow-lg md:fixed md:inset-y-0 md:left-0 md:z-40">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 flex-shrink-0">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Menu
          </span>
        </Link>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 md:hidden hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose} // Close mobile sidebar on navigation
                className={`
                  flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                <div className="flex items-center">
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-blue-700" : "text-gray-500"}`} />
                  {item.name}
                </div>
                {item.badge && item.badge > 0 && (
                  <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User Section */}
      <div className="border-t border-gray-200 p-4 flex-shrink-0">
        {isAuthenticated ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 px-3 py-2">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.first_name?.[0]}
                    {user?.last_name?.[0]}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-1">
              <Link
                href="/profile"
                onClick={onClose}
                className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <User className="mr-3 h-4 w-4" />
                Profile
              </Link>
              <button
                onClick={() => {
                  logout()
                  onClose?.()
                }}
                className="flex w-full items-center px-3 py-2 text-sm text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Button asChild className="w-full" size="sm">
              <Link href="/login" onClick={onClose}>
                Sign In
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent" size="sm">
              <Link href="/register" onClick={onClose}>
                Sign Up
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
