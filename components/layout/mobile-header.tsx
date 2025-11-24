"use client"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth"
import { Menu, Bell, User } from 'lucide-react'

interface MobileHeaderProps {
  onMenuClick: () => void
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { user, isAuthenticated } = useAuth()

  return (
    <header className="w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/images/mipripity.png"
            alt="MIPRIPITY Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900">MIPRIPITY</span>
            <span className="text-xs text-gray-500">Property Platform</span>
          </div>
        </Link>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* Notifications - Only show for authenticated users */}
          {isAuthenticated && (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="relative p-2 hover:bg-gray-100"
            >
              <Link href="/notifications">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5">
                  3
                </Badge>
              </Link>
            </Button>
          )}

          {/* User Profile */}
          {isAuthenticated ? (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-gray-100"
            >
              <Link href="/profile">
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {user?.first_name?.[0]}
                    {user?.last_name?.[0]}
                  </span>
                </div>
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-gray-100"
            >
              <Link href="/login">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
