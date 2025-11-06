import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { AuthProvider } from "@/lib/auth"
import { ResponsiveLayout } from "@/components/layout/responsive-layout"
import { Toaster } from "sonner"

// Alternative font loading to avoid lightningcss issues
const fontClass = "font-sans"

export const metadata: Metadata = {
  title: "Mipripity - Property Polling Platform",
  description: "Community-driven property evaluation and polling platform",
  keywords: ["property", "polling", "evaluation", "real estate", "community"],
  authors: [{ name: "Techtasker Solutions" }],
  creator: "Techtasker Solutions",
  publisher: "Techtasker Solutions",
  manifest: "/manifest.json",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontClass} antialiased`}>
        <AuthProvider>
          <ResponsiveLayout>{children}</ResponsiveLayout>
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "white",
              color: "black",
              border: "1px solid #e2e8f0",
            },
          }}
        />
      </body>
    </html>
  )
}
