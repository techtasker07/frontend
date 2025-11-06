'use client'

import type React from "react"
import { useState } from "react"
import { AuthProvider } from "@/lib/auth"
import { ResponsiveLayout } from "@/components/layout/responsive-layout"
import { Toaster } from "sonner"
import SplashScreen from "@/components/SplashScreen"

export function RootLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [splashShown, setSplashShown] = useState(false)

  const handleSplashComplete = () => {
    setSplashShown(true)
  }

  return (
    <>
      {!splashShown && <SplashScreen onComplete={handleSplashComplete} />}
      <AuthProvider>
        <ResponsiveLayout>{children}</ResponsiveLayout>
      </AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 6000,
          style: {
            background: "white",
            color: "black",
            border: "0px solid #000000ff",
          },
        }}
      />
    </>
  )
}
