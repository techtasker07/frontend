import type { Metadata, Viewport } from "next"
import type React from "react"
import "./globals.css"
import { RootLayoutWrapper } from "@/components/layout/root-layout-wrapper"

// Alternative font loading to avoid lightningcss issues
const fontClass = "font-sans"

export const metadata: Metadata = {
  title: "",
  description: "Community-driven property evaluation and polling platform",
  keywords: "property, polling, evaluation, real estate, community",
  authors: [{ name: "Techtasker Solutions" }],
  creator: "Techtasker Solutions",
  publisher: "Techtasker Solutions",
  manifest: "/manifest.json",
  icons: {
    apple: "/apple-touch-icon.png",
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontClass} antialiased`}>
        <RootLayoutWrapper>{children}</RootLayoutWrapper>
      </body>
    </html>
  )
}
