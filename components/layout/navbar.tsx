'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
DropdownMenu,
DropdownMenuContent,
DropdownMenuItem,
DropdownMenuSeparator,
DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth'
import { Home, Plus, BarChart3, User, LogOut, Menu, Brain } from 'lucide-react'

export function Navbar() {
const { user, logout, isAuthenticated } = useAuth()
const router = useRouter()

const handleLogout = () => {
  logout()
  router.push('/')
}

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

const NavLinks = () => (
  <>
    <Link href="/" className="flex items-center space-x-2 text-sm font-medium hover:text-primary">
      <Home className="h-4 w-4" />
      <span>Home</span>
    </Link>
    {isAuthenticated && (
      <>
        <Link href="/add-property" className="flex items-center space-x-2 text-sm font-medium hover:text-primary">
          <Plus className="h-4 w-4" />
          <span>Add Property</span>
        </Link>
        <Link href="/dashboard" className="flex items-center space-x-2 text-sm font-medium hover:text-primary">
          <BarChart3 className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
        {/* New Link for Prospects */}
        <Link href="/prospect-properties" className="flex items-center space-x-2 text-sm font-medium hover:text-primary">
          <Brain className="h-4 w-4" /> {/* Using Brain icon for prospects */}
          <span>Prospects</span>
        </Link>
      </>
    )}
  </>
)

return (
  <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container mx-auto px-4">
      <div className="flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">M</span>
          </div>
          <span className="font-bold text-xl">Mipripity</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <NavLinks />
        </div>

        {/* Auth Section */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profile_picture || "/placeholder.svg"} alt={user?.first_name} />
                    <AvatarFallback>
                      {user ? getInitials(user.first_name, user.last_name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          {/* Sheet component removed as per updates */}
        </div>
      </div>
    </div>
  </nav>
)
}
