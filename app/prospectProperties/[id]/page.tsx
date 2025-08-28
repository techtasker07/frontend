"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { api, type ProspectProperty, type PropertyProspect } from "@/lib/api"
import { MapPin, Calendar, ArrowLeft, Lightbulb, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import ProspectButtons from "@/components/ProspectButtons"

export default function ProspectPropertyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<ProspectProperty | null>(null)
  const [selectedProspect, setSelectedProspect] = useState<PropertyProspect | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const propertyId = params.id as string

  useEffect(() => {
    if (propertyId) {
      fetchProperty()
    }
  }, [propertyId])

  const fetchProperty = async () => {
    try {
      const response = await api.getProspectProperty(propertyId)
      if (response.success) {
        setProperty(response.data)
      } else {
        toast.error("Property not found")
        router.push("/prospectProperties")
      }
    } catch (error) {
      toast.error("Failed to fetch property details")
      router.push("/prospectProperties")
    } finally {
      setLoading(false)
    }
  }

  const handleProspectClick = (prospect: PropertyProspect) => {
    setSelectedProspect(prospect)
    setIsDialogOpen(true)
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

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Property not found</h1>
          <Button asChild>
            <Link href="/prospectProperties">Back to Properties</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/prospectProperties">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Prospect Properties
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Image */}
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            {property.image_url ? (
              <Image
                src={property.image_url || "/placeholder.svg"}
                alt={property.title}
                fill
                className="object-cover"
                onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
              />
            ) : (
              <p className="text-muted-foreground">No image available</p>
            )}
          </div>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{property.title}</CardTitle>
                  <CardDescription className="flex items-center mt-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {property.category_name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{property.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.estimated_worth && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">
                      <strong>₦{property.estimated_worth.toLocaleString()}</strong>
                    </span>
                  </div>
                )}
                {property.year_of_construction && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Built in {property.year_of_construction}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Prospects Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
                AI Investment Prospects
              </CardTitle>
              <CardDescription>Click on any prospect to view detailed analysis and cost breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ProspectButtons propertyId={property.id} prospects={property.prospects || []} />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {property.prospects && property.prospects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Investment Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Available Prospects:</span>
                    <span className="font-medium">{property.prospects.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Min Investment:</span>
                    <span className="font-medium">
                      ₦{Math.min(...property.prospects.map((p) => p.estimated_cost)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max Investment:</span>
                    <span className="font-medium">
                      ₦{Math.max(...property.prospects.map((p) => p.estimated_cost)).toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Property Worth:</span>
                    <span className="font-medium">₦{property.estimated_worth?.toLocaleString() || "N/A"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Prospect Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedProspect && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
                  {selectedProspect.title}
                </DialogTitle>
                <DialogDescription>AI-generated investment prospect and cost analysis</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h4 className="font-medium mb-2">Project Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedProspect.description}</p>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-4">
                  <h4 className="font-medium">Cost Analysis</h4>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Project Investment:</span>
                      <span className="font-medium">₦{selectedProspect.estimated_cost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Property Value:</span>
                      <span className="font-medium">₦{property.estimated_worth?.toLocaleString() || "N/A"}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Investment:</span>
                      <span className="font-bold text-lg">₦{selectedProspect.total_cost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* ROI Projection */}
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-400">Investment Potential</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    This AI-generated prospect is based on current market trends and property category analysis.
                    Consider consulting with real estate professionals for detailed feasibility studies.
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
