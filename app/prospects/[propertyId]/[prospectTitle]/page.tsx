"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { api, type ProspectProperty, type PropertyProspect } from "@/lib/api"
import {
  ArrowLeft,
  Lightbulb,
  Calculator,
  TrendingUp,
  Target,
  CheckCircle,
  DollarSign,
  Building,
  Zap,
} from "lucide-react"
import { toast } from "sonner"
import { formatDisplayCurrency } from "@/lib/currency"

// Simple tips for each prospect type
const PROSPECT_TIPS: { [key: string]: string[] } = {
  "Short Let Plan": [
    "Furnish with modern furniture and essential appliances",
    "Offer 24/7 electricity via solar or generator backup",
    "List on Airbnb, Booking.com, and local property sites",
    "Market with professional photography and virtual tours",
    "Comply with local short-let licensing requirements",
  ],
  "Student Housing Investment": [
    "Divide large spaces into smaller rentable units",
    "Provide basic furnishings like beds, wardrobes, and desks",
    "Install prepaid electricity meters to manage usage",
    "Offer reliable water supply and security",
    "Partner with nearby universities for referrals",
  ],
  "Family Rental Hub": [
    "Install modern kitchen appliances and fixtures",
    "Create child-friendly spaces and safety features",
    "Provide parking spaces and security systems",
    "Ensure reliable power and water supply",
    "Market to expatriate families and professionals",
  ],
  "Co-living Space": [
    "Design flexible living spaces with privacy",
    "Install high-speed internet and work areas",
    "Create shared kitchens and recreational spaces",
    "Implement smart home technology",
    "Target tech workers and remote professionals",
  ],
  "Tech Hub & Co-working Space": [
    "Install high-speed fiber internet and backup power",
    "Create flexible workspaces with modern furniture",
    "Provide meeting rooms and event spaces",
    "Offer virtual office services and mail handling",
    "Partner with tech communities and startup incubators",
  ],
  "Retail Shopping Complex": [
    "Design attractive storefronts and common areas",
    "Provide ample parking and security systems",
    "Create anchor tenant spaces for major brands",
    "Implement modern POS and payment systems",
    "Market to both local and international retailers",
  ],
  "Residential Estate Development": [
    "Conduct thorough land survey and soil testing",
    "Obtain necessary permits and approvals",
    "Design modern infrastructure and utilities",
    "Create recreational facilities and green spaces",
    "Market to middle and upper-class families",
  ],
  "Commercial Plaza Development": [
    "Ensure strategic location with high foot traffic",
    "Design flexible commercial spaces",
    "Provide adequate parking and loading areas",
    "Install modern security and fire safety systems",
    "Target diverse business tenants",
  ],
}

export default function ProspectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<ProspectProperty | null>(null)
  const [prospect, setProspect] = useState<PropertyProspect | null>(null)
  const [loading, setLoading] = useState(true)

  const propertyId = params.propertyId as string
  const prospectTitle = decodeURIComponent(params.prospectTitle as string)

  useEffect(() => {
    if (propertyId && prospectTitle) {
      fetchPropertyAndProspect()
    }
  }, [propertyId, prospectTitle])

  const fetchPropertyAndProspect = async () => {
    try {
      console.log("Fetching prospect property with ID:", propertyId)
      const response = await api.getProspectProperty(propertyId)
      console.log("API response:", response)

      if (response.success) {
        setProperty(response.data)

        // Find the specific prospect
        const foundProspect = response.data.prospects?.find((p) => p.title === prospectTitle)
        console.log("Looking for prospect:", prospectTitle)
        console.log("Available prospects:", response.data.prospects)

        if (foundProspect) {
          setProspect(foundProspect)
        } else {
          toast.error("Prospect not found")
          router.push(`/prospectProperties/${propertyId}`)
        }
      } else {
        console.error("API error:", response.error)
        toast.error(response.error || "Property not found")
        router.push("/prospectProperties")
      }
    } catch (error: any) {
      console.error("Fetch error:", error)
      toast.error(`Failed to fetch property details: ${error.message}`)
      router.push("/prospectProperties")
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
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!property || !prospect) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Prospect not found</h1>
          <Button asChild>
            <Link href="/prospectProperties">Back to Properties</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Get tips for this prospect
  const tips = PROSPECT_TIPS[prospect.title] || [
    "Conduct market research and feasibility studies",
    "Obtain necessary permits and approvals",
    "Develop a comprehensive business plan",
    "Secure adequate funding and financing",
    "Partner with experienced professionals",
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href={`/prospectProperties/${propertyId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Property
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prospect Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center">
                    <Lightbulb className="mr-3 h-6 w-6 text-yellow-500" />
                    {prospect.title}
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">
                    AI-Generated Investment Prospect for {property.title}
                  </CardDescription>
                </div>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  AI Powered
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed text-lg">{prospect.description}</p>
            </CardContent>
          </Card>

          {/* Cost Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="mr-2 h-5 w-5 text-green-600" />
                Investment Analysis
              </CardTitle>
              <CardDescription>Detailed cost breakdown and investment requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-800">Property Value:</span>
                    <span className="font-bold text-blue-900">{formatDisplayCurrency(property.estimated_worth || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium text-orange-800">Development Cost:</span>
                    <span className="font-bold text-orange-900">{formatDisplayCurrency(prospect.estimated_cost)}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-purple-800">ROI Potential:</span>
                    <span className="font-bold text-purple-900">High</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-800">Market Demand:</span>
                    <span className="font-bold text-green-900">Strong</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-6 w-6 text-green-600 mr-2" />
                    <span className="text-lg font-semibold text-green-800">Total Investment Required:</span>
                  </div>
                  <span className="text-3xl font-bold text-green-900">{formatDisplayCurrency(prospect.total_cost)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Implementation Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5 text-blue-600" />
                Implementation Roadmap
              </CardTitle>
              <CardDescription>Step-by-step guide to realize this investment opportunity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700 leading-relaxed">{tip}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Building className="mr-2 h-5 w-5" />
                Property Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Property</h4>
                <p className="font-semibold">{property.title}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Location</h4>
                <p className="text-sm">{property.location}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Category</h4>
                <Badge variant="outline">{property.category_name}</Badge>
              </div>
              {property.year_of_construction && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Year Built</h4>
                  <p className="text-sm">{property.year_of_construction}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ROI Projection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                Investment Potential
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Market Opportunity</h4>
                <p className="text-sm text-green-700">
                  This AI-generated prospect is based on current market trends, property category analysis, and location
                  factors.
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Risk Assessment</h4>
                <p className="text-sm text-yellow-700">
                  Consider consulting with real estate professionals and conducting detailed feasibility studies before
                  proceeding.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href={`/prospectProperties/${propertyId}`}>View All Prospects</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent" size="lg">
              <Link href="/prospectProperties">Explore More Properties</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}