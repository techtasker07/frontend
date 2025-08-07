import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { Sidebar } from '@/components/layout/sidebar' // Import Sidebar
import { Footer } from '@/components/layout/footer'
import { Toaster } from 'sonner'

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
          <div className="flex min-h-screen">
            <Sidebar /> {/* Render the Sidebar */}
            <div className="flex flex-col flex-1 md:ml-64"> {/* Adjust margin for desktop sidebar */}
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </div>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}
