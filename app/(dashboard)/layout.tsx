import type React from "react"
import { ResponsiveLayout } from "@/components/layout/responsive-layout"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ResponsiveLayout>{children}</ResponsiveLayout>
}
