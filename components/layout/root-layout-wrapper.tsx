'use client'

import type React from "react"
import { useEffect, useState } from "react"
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
  const [isPWA, setIsPWA] = useState(false)

  const handleSplashComplete = () => {
    setSplashShown(true)
  }

  useEffect(() => {
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
      setIsPWA(isStandalone)
    }
    checkPWA()
  }, [])

  return (
    <>
      {!splashShown && isPWA && <SplashScreen onComplete={handleSplashComplete} />}
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
