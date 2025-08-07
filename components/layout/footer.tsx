import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">M</span>
              </div>
              <span className="font-bold text-xl">Mipripity</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The premier platform for property polling and community-driven property evaluation.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link></li>
              <li><Link href="/properties" className="text-muted-foreground hover:text-foreground">Properties</Link></li>
              <li><Link href="/categories" className="text-muted-foreground hover:text-foreground">Categories</Link></li>
              {/* New Link for Prospects */}
              <li><Link href="/prospect-properties" className="text-muted-foreground hover:text-foreground">Prospects</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="text-muted-foreground hover:text-foreground">Login</Link></li>
              <li><Link href="/register" className="text-muted-foreground hover:text-foreground">Sign Up</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help" className="text-muted-foreground hover:text-foreground">Help Center</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Mipripity. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
