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
  const [analyses, setAnalyses] = useState<ProspectAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchUserAnalyses()
  }, [isAuthenticated, router])

  const fetchUserAnalyses = async () => {
    try {
      setLoading(true)
      const response = await supabaseApi.getUserPropertyAnalyses(50) // Get up to 50 analyses

      if (response.success) {
        setAnalyses(response.data)
      } else {
        setError(response.error || 'Failed to fetch prospect analyses')
      }
    } catch (err) {
      console.error('Error fetching analyses:', err)
      setError('Failed to load prospect analyses')
    } finally {
      setLoading(false)
    }
  }

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

  if (loading) {
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
          <Button onClick={fetchUserAnalyses}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm">
              <Link href="/dashboard">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
            My Property Prospects
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            View all your AI-generated property prospect analyses and investment opportunities
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button asChild size="sm" className="text-xs sm:text-sm">
            <Link href="/ai/camera-capture">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Generate New Prospect
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {analyses.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">
                {analyses.length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Total Analyses</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
                {analyses.reduce((sum, analysis) => sum + (analysis.property_analysis_insights?.total_prospects || 0), 0)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Total Prospects</div>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">
                {analyses.length > 0
                  ? Math.round(analyses.reduce((sum, analysis) => sum + (analysis.property_analysis_insights?.average_feasibility || 0), 0) / analyses.length)
                  : 0}%
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Avg Feasibility</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analyses List */}
      {analyses.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <Zap className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Prospect Analyses Yet</h2>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
            Start by analyzing your property with our AI to generate investment prospects and opportunities.
          </p>
          <Button asChild size="sm" className="sm:size-lg">
            <Link href="/ai/camera-capture">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Generate Your First Prospect Analysis
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {analyses.map((analysis) => (
            <Card key={analysis.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg leading-tight truncate">
                      {analysis.property_address || 'Property Analysis'}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      <span className="truncate text-xs sm:text-sm">{analysis.property_type}</span>
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-2 flex-shrink-0 text-xs">
                    {analysis.property_analysis_insights?.total_prospects || 0} prospects
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-500">Feasibility Score</span>
                    <span className="font-medium">
                      {analysis.property_analysis_insights?.average_feasibility || 0}%
                    </span>
                  </div>
                  <Progress
                    value={analysis.property_analysis_insights?.average_feasibility || 0}
                    className="h-2"
                  />
                </div>

                <div className="flex items-center text-xs sm:text-sm text-gray-500">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {formatDate(analysis.created_at)}
                </div>

                <Separator />

                <Button asChild className="w-full text-xs sm:text-sm">
                  <Link href={`/prospects/${analysis.id}`}>
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
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