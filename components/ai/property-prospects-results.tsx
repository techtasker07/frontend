"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowRight,
  TrendingUp,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Star,
  BarChart3,
  Lightbulb,
  Target,
  Calendar,
  Users,
  Building,
  Home,
  Briefcase,
  Zap,
  Download,
  Share2,
  BookmarkPlus
} from "lucide-react"
import { toast } from "sonner"
import type { ProspectGenerationResult, PropertyProspect } from "@/lib/prospect-engine-service"

interface PropertyProspectsResultsProps {
  results: ProspectGenerationResult
  imageData?: string
  onClose?: () => void
  onSaveProspects?: (prospects: PropertyProspect[]) => void
}

const categoryIcons = {
  residential: Home,
  commercial: Building,
  'mixed-use': Briefcase,
  investment: TrendingUp,
  development: Target
}

const complexityColors = {
  simple: 'bg-slate-100 text-slate-700',
  moderate: 'bg-amber-100 text-amber-700',
  complex: 'bg-red-100 text-red-700'
}

const demandColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-emerald-100 text-emerald-700'
}

export function PropertyProspectsResults({ 
  results, 
  imageData, 
  onClose,
  onSaveProspects 
}: PropertyProspectsResultsProps) {
  const router = useRouter()
  const [selectedProspect, setSelectedProspect] = useState<PropertyProspect | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [activeSector, setActiveSector] = useState<'valueMaximization' | 'alternativeUses'>('valueMaximization')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleSaveProspects = () => {
    if (onSaveProspects) {
      onSaveProspects(results.prospects)
      toast.success("Prospects saved successfully!")
    }
  }

  const handleAddToProspects = async () => {
    try {
      // Import supabaseApi here to save prospects
      const { supabaseApi } = await import("@/lib/supabase-api")

      // Save the prospect analysis results
      const saveResult = await supabaseApi.savePropertyAnalysis({
        property_address: "AI Generated Property Analysis", // Generic address since we don't have specific property details
        property_type: "analysis",
        square_meters: undefined,
        bedrooms: undefined,
        bathrooms: undefined,
        current_use: "analysis",
        budget_range: undefined,
        timeline: undefined,
        ownership_status: undefined,
        additional_info: "Generated via AI prospect analysis",
        property_image_url: imageData || undefined,
        vision_analysis: undefined, // No vision analysis in this context
        prospects: results.prospects,
        insights: results.analysisInsights
      })

      if (saveResult.success) {
        toast.success("Prospect analysis saved to your personal collection!")
        // Optionally navigate to prospects page
        setTimeout(() => {
          router.push('/prospects')
        }, 1500)
      } else {
        toast.error("Failed to save prospect analysis")
      }
    } catch (error) {
      console.error("Error saving prospects:", error)
      toast.error("Failed to save prospect analysis")
    }
  }

  const handleShareResults = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Property Prospect Analysis',
          text: `Found ${results.prospects.length} property prospects with an average feasibility score of ${results.summary.averageFeasibility}%`,
          url: window.location.href
        })
      } else {
        // Fallback to copying to clipboard
        const shareText = `Property Prospect Analysis: ${results.prospects.length} prospects found!`
        await navigator.clipboard.writeText(shareText)
        toast.success("Results copied to clipboard!")
      }
    } catch (error) {
      console.error("Error sharing:", error)
      toast.error("Failed to share results")
    }
  }

  const ProspectCard = ({ prospect, isSelected, onClick }: { 
    prospect: PropertyProspect
    isSelected: boolean
    onClick: () => void 
  }) => {
    const CategoryIcon = categoryIcons[prospect.category] || Building

    return (
      <div
        className={`cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={onClick}
      >
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
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
            <CardTitle className="text-lg leading-tight">
              {prospect.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600 line-clamp-3">
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

            <div className="flex flex-wrap gap-1">
              <Badge className={complexityColors[prospect.complexity]}>
                {prospect.complexity}
              </Badge>
              <Badge className={demandColors[prospect.marketDemand]}>
                {prospect.marketDemand} demand
              </Badge>
            </div>

            <Progress value={prospect.feasibilityScore} className="h-2" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const ProspectDetails = ({ prospect }: { prospect: PropertyProspect }) => (
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
                {prospect.estimatedCost.breakdown.map((item, index) => (
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
              <Badge className={complexityColors[prospect.complexity]}>
                {prospect.complexity}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Market Demand</span>
              <Badge className={demandColors[prospect.marketDemand]}>
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
            {prospect.benefits.map((benefit, index) => (
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
            {prospect.risks.map((risk, index) => (
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
            {prospect.requirements.map((req, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-purple-600" />
            Next Steps
          </h4>
          <ol className="space-y-2">
            {prospect.nextSteps.map((step, index) => (
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
          {prospect.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )

  if (!results || !results.prospects || results.prospects.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Results Available</h2>
          <p className="text-gray-600 mb-4">Unable to load property prospects. Please try generating them again.</p>
          <Button onClick={onClose || (() => router.push('/dashboard'))}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 flex-shrink-0" />
              <span className="truncate">Property Prospects Analysis</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mt-2">
              AI-generated alternative uses and optimization strategies for your property
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareResults}
              className="text-xs sm:text-sm"
            >
              <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/prospects')}
              className="text-xs sm:text-sm"
            >
              <BookmarkPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">View Prospects</span>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 sm:space-y-8">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="prospects" className="text-xs sm:text-sm">Prospects</TabsTrigger>
            <TabsTrigger value="insights" className="text-xs sm:text-sm">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-slate-700">
                    {results.summary.totalProspects}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Total Prospects</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-slate-700">
                    {results.summary.averageFeasibility}%
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Avg Feasibility</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-sm sm:text-lg font-bold text-slate-700">
                    {formatCurrency(results.summary.potentialRevenueRange.min)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Min Revenue</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-sm sm:text-lg font-bold text-slate-700">
                    {formatCurrency(results.summary.potentialRevenueRange.max)}
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
                <ProspectDetails prospect={results.summary.topRecommendation} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prospects" className="space-y-4 sm:space-y-6">
            {/* Sector Toggle */}
            {results.sectors && (
              <div className="flex justify-center mb-6">
                <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                  <button
                    onClick={() => setActiveSector('valueMaximization')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSector === 'valueMaximization'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Value Maximization ({results.sectors.valueMaximization.length})
                  </button>
                  <button
                    onClick={() => setActiveSector('alternativeUses')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSector === 'alternativeUses'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Alternative Uses ({results.sectors.alternativeUses.length})
                  </button>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Prospects List */}
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-base sm:text-lg font-semibold">
                  {activeSector === 'valueMaximization' ? 'Value Maximization Prospects' : 'Alternative Uses Prospects'}
                </h2>
                {(results.sectors && results.sectors[activeSector] ? results.sectors[activeSector] : results.prospects).map((prospect) => (
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
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">Prospect Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px] sm:h-[500px] lg:h-[600px] pr-2 sm:pr-4">
                        <ProspectDetails prospect={selectedProspect} />
                      </ScrollArea>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 sm:p-12 text-center">
                      <Lightbulb className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm sm:text-base text-gray-500">
                        Select a prospect to view detailed information
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Property Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.analysisInsights.propertyStrengths.map((strength, index) => (
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
                    {results.analysisInsights.marketOpportunities.map((opportunity, index) => (
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
                    {results.analysisInsights.considerations.map((consideration, index) => (
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-8 sm:mt-10">
          <Button
            variant="outline"
            onClick={onClose || (() => router.push('/dashboard'))}
            className="w-full sm:w-auto"
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={handleAddToProspects}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            Save to My Prospects
            <BookmarkPlus className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
