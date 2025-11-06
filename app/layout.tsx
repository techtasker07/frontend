import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import ClientLayout from "./client-layout"

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
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
