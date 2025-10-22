"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { supabaseApi } from "@/lib/supabase-api"
import { useAuth } from "@/lib/auth"
import {
  ArrowLeft,
  Loader2,
  TrendingUp,
  MapPin,
  Calendar,
  Eye,
  Zap,
  AlertTriangle
} from "lucide-react"
import { toast } from "sonner"
import useSWR from 'swr'

interface ProspectAnalysis {
  id: string
  property_address: string
  property_type: string
  created_at: string
  property_analysis_insights: {
    total_prospects: number
    average_feasibility: number
  } | null
}

export default function ProspectsPage() {
   const router = useRouter()
   const { user, isAuthenticated } = useAuth()

   useEffect(() => {
     if (!isAuthenticated) {
       router.push('/login')
       return
     }
   }, [isAuthenticated, router])

   // Use SWR for instant data fetching and caching
   const { data: analyses = [], error, isLoading } = useSWR(
     isAuthenticated ? 'user-prospect-analyses' : null,
     async () => {
       const response = await supabaseApi.getUserPropertyAnalyses(50) // Get up to 50 analyses
       if (response.success) {
         return response.data
       } else {
         throw new Error(response.error || 'Failed to fetch prospect analyses')
       }
     },
     {
       revalidateOnFocus: false,
       revalidateOnReconnect: true,
       dedupingInterval: 30000,
       errorRetryCount: 3,
       errorRetryInterval: 1000,
     }
   )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-48 bg-muted rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Error Loading Prospects</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold">Property Prospects</h1>
          <p className="text-muted-foreground">
            View all your AI-generated property prospect analyses and investment opportunities
          </p>
        </div>
        <Button asChild variant="secondary" size="lg" className="shrink-0">
          <Link href="/ai/camera-capture">
            <Zap className="mr-2 h-5 w-5" />
            Generate New Prospect
          </Link>
        </Button>
      </div>

      {/* Analyses List */}
      {analyses.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <Zap className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium">No Prospect Analyses Yet</h3>
            <p className="text-gray-500">
              Start by analyzing your property with our AI to generate investment prospects and opportunities.
            </p>
            <Button asChild size="lg">
              <Link href="/ai/camera-capture">
                <Zap className="mr-2 h-5 w-5" />
                Generate Your First Prospect Analysis
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyses.map((analysis) => (
            <Card key={analysis.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {analysis.property_address || 'Property Analysis'}
                  </h3>
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">{analysis.property_type}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Feasibility Score</span>
                    <span className="font-medium text-sm">
                      {analysis.property_analysis_insights?.average_feasibility || 0}%
                    </span>
                  </div>
                  <Progress
                    value={analysis.property_analysis_insights?.average_feasibility || 0}
                    className="h-2"
                  />
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(analysis.created_at)}</span>
                  </div>
                  <Badge variant="secondary">
                    {analysis.property_analysis_insights?.total_prospects || 0} prospects
                  </Badge>
                </div>

                <Separator />

                <Button asChild className="w-full">
                  <Link href={`/prospects/${analysis.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}