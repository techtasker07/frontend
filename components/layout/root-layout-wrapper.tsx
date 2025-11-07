'use client'

import type React from "react"
import { AuthProvider } from "@/lib/auth"
import { ResponsiveLayout } from "@/components/layout/responsive-layout"
import { Toaster } from "sonner"

export function RootLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
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
