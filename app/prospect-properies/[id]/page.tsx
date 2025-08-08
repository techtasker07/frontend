'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { api, ProspectProperty } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { MapPin, Calendar, DollarSign, User, FlaskConical, Lightbulb, TrendingUp, ShieldAlert, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function ProspectPropertyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  const [prospectProperty, setProspectProperty] = useState<ProspectProperty | null>(null)
  const [loading, setLoading] = useState(true)

  const prospectPropertyId = parseInt(params.id as string)

  useEffect(() => {
    if (prospectPropertyId) {
      fetchProspectProperty()
    }
  }, [prospectPropertyId, isAuthenticated])

  const fetchProspectProperty = async () => {
    try {
      setLoading(true)
      const response = await api.getProspectProperty(prospectPropertyId)
      if (response.success) {
        setProspectProperty(response.data)
      } else {
        toast.error('Prospect property not found')
        router.push('/prospect-properties')
      }
    } catch (error) {
      toast.error('Failed to fetch prospect property details')
      router.push('/prospect-properties')
    } finally {
      setLoading(false)
    }
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

  if (!prospectProperty) {
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
      {/* Back Button */}
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
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            {prospectProperty.image_url ? (
              <Image
                src={prospectProperty.image_url || "/placeholder.svg"}
                alt={prospectProperty.title}
                fill
                className="object-cover"
                onError={(e) => (e.currentTarget.src = "/placeholder.svg")} // Fallback if image fails to load
              />
            ) : (
              <p className="text-muted-foreground">No image available</p>
            )}
          </div>

          {/* Prospect Details */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{prospectProperty.title}</CardTitle>
                  <CardDescription className="flex items-center mt-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {prospectProperty.location}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {prospectProperty.category_name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{prospectProperty.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prospectProperty.estimated_worth && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>₦{prospectProperty.estimated_worth.toLocaleString()}</strong> (Est.)
                    </span>
                  </div>
                )}
                {prospectProperty.year_of_construction && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Built in {prospectProperty.year_of_construction}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis Sidebar */}
        {isAuthenticated && prospectProperty.ai_analysis && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FlaskConical className="mr-2 h-5 w-5" />
                  AI Analysis
                </CardTitle>
                <CardDescription>
                  Insights generated on {new Date(prospectProperty.ai_analysis.last_analyzed).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold flex items-center mb-1">
                    <Lightbulb className="mr-2 h-4 w-4 text-primary" /> Overall Sentiment:
                  </h3>
                  <p>{prospectProperty.ai_analysis.overall_sentiment}</p>
                </div>
                <div>
                  <h3 className="font-semibold flex items-center mb-1">
                    <TrendingUp className="mr-2 h-4 w-4 text-primary" /> Estimated ROI:
                  </h3>
                  <p>{prospectProperty.ai_analysis.estimated_roi}</p>
                </div>
                <div>
                  <h3 className="font-semibold flex items-center mb-1">
                    <CheckCircle className="mr-2 h-4 w-4 text-primary" /> Key Insights:
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {prospectProperty.ai_analysis.key_insights.map((insight, index) => (
                      <li key={index}>{insight}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold flex items-center mb-1">
                    <Lightbulb className="mr-2 h-4 w-4 text-primary" /> Strategic Recommendations:
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {prospectProperty.ai_analysis.strategic_recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold flex items-center mb-1">
                    <ShieldAlert className="mr-2 h-4 w-4 text-destructive" /> Risk Factors:
                  </h3>
                  <p>{prospectProperty.ai_analysis.risk_factors}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {!isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FlaskConical className="mr-2 h-5 w-5" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  Log in to view detailed AI analysis for this prospect property.{' '}
                  <Link href="/login" className="font-medium text-primary hover:underline">
                    Sign in here
                  </Link>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
