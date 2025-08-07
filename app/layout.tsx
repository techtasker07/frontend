import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Toaster } from 'sonner' // Import Toaster from sonner

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mipripity - Property Polling Platform',
  description: 'Community-driven property evaluation and polling platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
        <Toaster /> {/* Render the Toaster component */}
      </body>
    </html>
  )
}
