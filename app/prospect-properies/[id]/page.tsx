'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { api, ProspectProperty, AIAnalysis } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { MapPin, Calendar, DollarSign, ArrowLeft, Loader2, Brain, Lightbulb, ShieldAlert, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

export default function ProspectPropertyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const [prospect, setProspect] = useState<ProspectProperty | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const prospectId = parseInt(params.id as string)

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to view prospect property details.')
      router.push('/login')
      return
    }
    if (prospectId) {
      fetchProspectProperty()
    }
  }, [prospectId, isAuthenticated])

  const fetchProspectProperty = async () => {
    try {
      setLoading(true)
      setAiError('')
      const response = await api.getProspectProperty(prospectId)
      if (response.success) {
        setProspect(response.data)
      } else {
        toast.error('Prospect property not found')
        router.push('/prospect-properties')
      }
    } catch (error: any) {
      setAiError(error.message || 'Failed to fetch prospect details or AI analysis.')
      toast.error('Failed to fetch prospect property details.')
      router.push('/prospect-properties')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-muted rounded"></div>
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!prospect) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Prospect Property not found</h1>
          <Button asChild>
            <Link href="/prospect-properties">Back to Prospects</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/prospect-properties">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Prospects
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prospect Image */}
          {prospect.image_url ? (
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
              <Image
                src={prospect.image_url || "/placeholder.svg"}
                alt={prospect.title}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-64 md:h-96 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">No image available</p>
            </div>
          )}

          {/* Prospect Details */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{prospect.title}</CardTitle>
                  <CardDescription className="flex items-center mt-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {prospect.location}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {prospect.category_name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{prospect.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prospect.estimated_worth && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>₦{prospect.estimated_worth.toLocaleString()} (Estimated)</strong>
                    </span>
                  </div>
                )}
                {prospect.year_of_construction && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Built in {prospect.year_of_construction}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - AI Analysis */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                AI Analysis
              </CardTitle>
              <CardDescription>
                Automated insights and recommendations for this prospect.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aiLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  <p className="text-muted-foreground">Analyzing...</p>
                </div>
              ) : aiError ? (
                <Alert variant="destructive">
                  <AlertDescription>{aiError}</AlertDescription>
                </Alert>
              ) : prospect.ai_analysis ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Overall Sentiment:</span>
                    <Badge variant={prospect.ai_analysis.overall_sentiment === 'Positive' ? 'default' : prospect.ai_analysis.overall_sentiment === 'Negative' ? 'destructive' : 'secondary'}>
                      {prospect.ai_analysis.overall_sentiment}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Confidence Score:</span>
                    <span className="text-muted-foreground">{prospect.ai_analysis.confidence_score * 100}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Estimated ROI:</span>
                    <span className="text-muted-foreground">{prospect.ai_analysis.estimated_roi}</span>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center text-sm">
                      <Lightbulb className="mr-1 h-4 w-4" /> Key Insights:
                    </h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {prospect.ai_analysis.key_insights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center text-sm">
                      <TrendingUp className="mr-1 h-4 w-4" /> Strategic Recommendations:
                    </h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {prospect.ai_analysis.strategic_recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center text-sm">
                      <ShieldAlert className="mr-1 h-4 w-4" /> Risk Factors:
                    </h4>
                    <p className="text-sm text-muted-foreground">{prospect.ai_analysis.risk_factors}</p>
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    Last analyzed: {new Date(prospect.ai_analysis.last_analyzed).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  AI analysis not available for this prospect.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
