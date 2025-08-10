"use client"

import { Button } from "@/components/ui/button"
import { Menu, Bell, User } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"

interface MobileHeaderProps {
  onMenuClick: () => void
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { user, isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
      {/* Menu Button */}
      <Button variant="ghost" size="sm" onClick={onMenuClick} className="p-2 hover:bg-gray-100" aria-label="Open menu">
        <Menu className="h-6 w-6" />
      </Button>

      {/* Logo */}
      <Link href="/" className="flex items-center">
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          MIPRIPITY
        </span>
      </Link>

      {/* Right Actions */}
      <div className="flex items-center space-x-2">
        {isAuthenticated ? (
          <>
            <Button variant="ghost" size="sm" className="p-2">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <User className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <Button asChild size="sm" className="text-xs px-3 py-1">
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </header>
  )
}
