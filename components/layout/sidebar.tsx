'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth'
import { Home, Plus, BarChart3, User, LogOut, Brain, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export function Sidebar() {
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const navItems = [
    { href: '/', icon: Home, label: 'Home', requiresAuth: false },
    { href: '/add-property', icon: Plus, label: 'Add Property', requiresAuth: true },
    { href: '/dashboard', icon: BarChart3, label: 'Dashboard', requiresAuth: true },
    { href: '/prospectProperties', icon: Brain, label: 'Prospects', requiresAuth: true },
  ]

  const renderNavLinks = (isMobile = false) => (
    <nav className={cn("space-y-1", isMobile ? "flex flex-col" : "")}>
      {navItems.map((item) => (
        (item.requiresAuth && !isAuthenticated) ? null : (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              {
                "bg-muted text-primary": pathname === item.href,
              }
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      ))}
    </nav>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 border-r bg-sidebar text-sidebar-foreground p-4 fixed top-0 left-0">
        <div className="flex items-center gap-2 mb-6">
          <Image src="/images/mipripity.png" alt="Mipripity Logo" width={32} height={32} />
          <span className="font-bold text-xl">Mipripity</span>
        </div>

        {isAuthenticated && user ? (
          <div className="flex flex-col items-center text-center mb-6">
            <Avatar className="h-16 w-16 mb-2">
              <AvatarImage src={user.profile_picture || "/placeholder.svg"} alt={user.first_name} />
              <AvatarFallback className="text-lg">
                {getInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>
            <p className="font-semibold text-lg">{user.first_name} {user.last_name}</p>
            <p className="text-sm text-muted-foreground truncate w-full px-2">{user.email}</p>
            <Button variant="ghost" size="sm" asChild className="mt-2">
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </Button>
            <Separator className="my-4" />
          </div>
        ) : (
          <div className="mb-6 space-y-2">
            <Button asChild className="w-full">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/register">Sign Up</Link>
            </Button>
            <Separator className="my-4" />
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {renderNavLinks()}
        </div>

        {isAuthenticated && (
          <div className="mt-auto pt-4 border-t border-sidebar-border">
            <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        )}
      </aside>

      {/* Mobile Header with Sheet */}
      <header className="md:hidden sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col w-64 bg-sidebar text-sidebar-foreground p-4">
            <div className="flex items-center gap-2 mb-6">
              <Image src="/images/mipripity.png" alt="Mipripity Logo" width={32} height={32} />
              <span className="font-bold text-xl">Mipripity</span>
            </div>
            {isAuthenticated && user ? (
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="h-16 w-16 mb-2">
                  <AvatarImage src={user.profile_picture || "/placeholder.svg"} alt={user.first_name} />
                  <AvatarFallback className="text-lg">
                    {getInitials(user.first_name, user.last_name)}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold text-lg">{user.first_name} {user.last_name}</p>
                <p className="text-sm text-muted-foreground truncate w-full px-2">{user.email}</p>
                <Button variant="ghost" size="sm" asChild className="mt-2">
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </Button>
                <Separator className="my-4" />
              </div>
            ) : (
              <div className="mb-6 space-y-2">
                <Button asChild className="w-full">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/register">Sign Up</Link>
                </Button>
                <Separator className="my-4" />
              </div>
            )}
            <div className="flex-1 overflow-y-auto">
              {renderNavLinks(true)}
            </div>
            {isAuthenticated && (
              <div className="mt-auto pt-4 border-t border-sidebar-border">
                <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/images/mipripity.png" alt="Mipripity Logo" width={32} height={32} />
          <span className="font-bold text-xl">Mipripity</span>
        </Link>
      </header>
    </>
  )
}