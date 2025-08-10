"use client"

import { Button } from "@/components/ui/button"
import { Menu, Bell, User, Home } from "lucide-react"
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

      {/* Right Actions */}
      <div className="flex items-center space-x-2">
        {isAuthenticated ? (
          <>
            <Link href="/" passHref>
            <Button variant="ghost" size="sm" className="p-2">
                <Home className="h-5 w-5" />
            </Button>
            </Link>
            <Link href="/notifications" passHref>
            <Button variant="ghost" size="sm" className="p-2">
              <Bell className="h-5 w-5" />
            </Button>
            </Link>
            <Link href="/profile" passHref>
            <Button variant="ghost" size="sm" className="p-2">
              <User className="h-5 w-5" />
            </Button>
            </Link>
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
