"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { supabaseApi } from "@/lib/supabase-api"
import { useAuth } from "@/lib/auth"
import {
  ArrowLeft,
  Loader2,
  TrendingUp,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Star,
  BarChart3,
  Lightbulb,
  Target,
  Users,
  Building,
  Home,
  Briefcase,
  Zap,
  MapPin,
  Calendar,
  Eye
} from "lucide-react"
import { toast } from "sonner"

interface Prospect {
  id: string
  title: string
  description: string
  category: 'residential' | 'commercial' | 'mixed-use' | 'investment' | 'development'
  feasibilityScore: number
  estimatedRevenue: {
    min: number
    max: number
    timeframe: string
  }
  estimatedCost: {
    min: number
    max: number
    breakdown: string[]
  }
  timeline: {
    planning: string
    execution: string
    total: string
  }
  requirements: string[]
  benefits: string[]
  risks: string[]
  nextSteps: string[]
  tags: string[]
  marketDemand: 'low' | 'medium' | 'high'
  complexity: 'simple' | 'moderate' | 'complex'
}

interface ProspectAnalysis {
  prospects: Prospect[]
  summary: {
    totalProspects: number
    topRecommendation: Prospect
    averageFeasibility: number
    potentialRevenueRange: {
      min: number
      max: number
    }
  }
  analysisInsights: {
    propertyStrengths: string[]
    marketOpportunities: string[]
    considerations: string[]
  }
  generatedAt: string
  imageData?: string
}

const categoryIcons = {
  residential: Home,
  commercial: Building,
  'mixed-use': Briefcase,
  investment: TrendingUp,
  development: Target
}

const complexityColors = {
  simple: 'bg-green-100 text-green-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  complex: 'bg-red-100 text-red-800'
}

const demandColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-emerald-100 text-emerald-800'
}

export default function ProspectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [analysis, setAnalysis] = useState<ProspectAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProspect, setSelectedProspect] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const analysisId = params.id as string

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (analysisId) {
      fetchAnalysis()
    }
  }, [analysisId, isAuthenticated, router])

  const fetchAnalysis = async () => {
    try {
      setLoading(true)
      const response = await supabaseApi.getPropertyAnalysis(analysisId)

      if (response.success) {
        setAnalysis(response.data)
        if (response.data.prospects && response.data.prospects.length > 0) {
          setSelectedProspect(response.data.prospects[0])
        }
      } else {
        setError(response.error || 'Failed to fetch prospect analysis')
      }
    } catch (err) {
      console.error('Error fetching analysis:', err)
      setError('Failed to load prospect analysis')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const ProspectCard = ({ prospect, isSelected, onClick }: {
    prospect: Prospect
    isSelected: boolean
    onClick: () => void
  }) => {
    const CategoryIcon = categoryIcons[prospect.category as keyof typeof categoryIcons] || Building

    return (
      <div
        className={`cursor-pointer transition-all p-4 rounded-lg border ${
          isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
        }`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <CategoryIcon className="w-5 h-5 text-blue-600" />
            <Badge variant="outline" className="text-xs">
              {prospect.category}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">{prospect.feasibilityScore}%</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold leading-tight mb-2">
          {prospect.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
          {prospect.description.split('.')[0]}.
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Revenue Potential</span>
            <span className="font-medium">
              {formatCurrency(prospect.estimatedRevenue.min)} - {formatCurrency(prospect.estimatedRevenue.max)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Timeline</span>
            <span className="font-medium">{prospect.timeline.total}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-3">
          <Badge className={complexityColors[prospect.complexity as keyof typeof complexityColors]}>
            {prospect.complexity}
          </Badge>
          <Badge className={demandColors[prospect.marketDemand as keyof typeof demandColors]}>
            {prospect.marketDemand} demand
          </Badge>
        </div>
        <Progress value={prospect.feasibilityScore} className="h-2 mt-3" />
      </div>
    )
  }

  const ProspectDetails = ({ prospect }: { prospect: any }) => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">{prospect.title}</h3>
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
          {prospect.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="text-xl font-bold">₦</span>
              Financial Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-gray-500 mb-1">Revenue Potential</div>
              <div className="font-semibold text-green-600">
                {formatCurrency(prospect.estimatedRevenue.min)} - {formatCurrency(prospect.estimatedRevenue.max)}
              </div>
              <div className="text-xs text-gray-500">{prospect.estimatedRevenue.timeframe}</div>
            </div>
            <Separator />
            <div>
              <div className="text-sm text-gray-500 mb-1">Investment Required</div>
              <div className="font-semibold text-orange-600">
                {formatCurrency(prospect.estimatedCost.min)} - {formatCurrency(prospect.estimatedCost.max)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-2">Cost Breakdown</div>
              <ul className="space-y-1">
                {prospect.estimatedCost.breakdown.map((item: string, index: number) => (
                  <li key={index} className="text-xs text-gray-600 flex items-center gap-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5" />
              Timeline & Complexity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-gray-500 mb-1">Planning Phase</div>
              <div className="font-medium">{prospect.timeline.planning}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Execution Phase</div>
              <div className="font-medium">{prospect.timeline.execution}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Duration</div>
              <div className="font-semibold text-blue-600">{prospect.timeline.total}</div>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Complexity</span>
              <Badge className={complexityColors[prospect.complexity as keyof typeof complexityColors]}>
                {prospect.complexity}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Market Demand</span>
              <Badge className={demandColors[prospect.marketDemand as keyof typeof demandColors]}>
                {prospect.marketDemand}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Benefits
          </h4>
          <ul className="space-y-2">
            {prospect.benefits.map((benefit: string, index: number) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Risk Factors
          </h4>
          <ul className="space-y-2">
            {prospect.risks.map((risk: string, index: number) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                {risk}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Requirements
          </h4>
          <ul className="space-y-2">
            {prospect.requirements.map((req: string, index: number) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <ArrowLeft className="w-5 h-5 text-purple-600 rotate-180" />
            Next Steps
          </h4>
          <ol className="space-y-2">
            {prospect.nextSteps.map((step: string, index: number) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3">Tags</h4>
        <div className="flex flex-wrap gap-2">
          {prospect.tags.map((tag: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )

  if (!isAuthenticated) {
    return null
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

  if (error || !analysis) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Error Loading Prospect Analysis</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={fetchAnalysis}>
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/prospects">
                Back to Prospects
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm">
              <Link href="/prospects">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Back to Prospects
              </Link>
            </Button>
          </div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600 flex-shrink-0" />
            <span className="truncate">Prospect Analysis Details</span>
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">
            Generated on {new Date(analysis.generatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-4 lg:space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="prospects" className="text-xs sm:text-sm">Prospects</TabsTrigger>
          <TabsTrigger value="insights" className="text-xs sm:text-sm">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                  {analysis.summary.totalProspects}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Total Prospects</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                  {analysis.summary.averageFeasibility}%
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Avg Feasibility</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-sm sm:text-base lg:text-lg font-bold text-purple-600">
                  {formatCurrency(analysis.summary.potentialRevenueRange.min)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Min Revenue</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-sm sm:text-base lg:text-lg font-bold text-purple-600">
                  {formatCurrency(analysis.summary.potentialRevenueRange.max)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Max Revenue</div>
              </CardContent>
            </Card>
          </div>

          {/* Top Recommendation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Top Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProspectDetails prospect={analysis.summary.topRecommendation} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prospects" className="space-y-3 sm:space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            {/* Prospects List */}
            <div className="space-y-2 sm:space-y-3 lg:space-y-4">
              <h2 className="text-sm sm:text-base lg:text-lg font-semibold">
                All Generated Prospects ({analysis.prospects.length})
              </h2>
              {analysis.prospects.map((prospect) => (
                <ProspectCard
                  key={prospect.id}
                  prospect={prospect}
                  isSelected={selectedProspect?.id === prospect.id}
                  onClick={() => setSelectedProspect(prospect)}
                />
              ))}
            </div>

            {/* Selected Prospect Details */}
            <div className="lg:sticky lg:top-6">
              {selectedProspect ? (
                <Card>
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-sm sm:text-base lg:text-lg">Prospect Details</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <ScrollArea className="h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[600px] pr-2 sm:pr-4">
                      <ProspectDetails prospect={selectedProspect} />
                    </ScrollArea>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
                    <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-xs sm:text-sm lg:text-base text-gray-500">
                      Select a prospect to view detailed information
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-3 sm:space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Property Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.analysisInsights.propertyStrengths.map((strength, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Market Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.analysisInsights.marketOpportunities.map((opportunity, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      {opportunity}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Considerations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.analysisInsights.considerations.map((consideration, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      {consideration}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}