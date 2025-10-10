"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { supabaseApi, type Property, type MarketplaceListing } from "@/lib/supabase-api"
import { useAuth } from "@/lib/auth"
import {
  ArrowLeft,
  Loader2,
  TrendingUp,
  MapPin,
  Calendar,
  Eye,
  Zap,
  AlertTriangle,
  Building,
  ShoppingBag,
  Grid3X3,
  Plus,
  Search,
  Filter
} from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

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

export default function GalleryPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>([])
  const [pollProperties, setPollProperties] = useState<Property[]>([])
  const [prospectAnalyses, setProspectAnalyses] = useState<ProspectAnalysis[]>([])
  const [loading, setLoading] = useState({
    marketplace: true,
    poll: true,
    prospects: true
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchUserData()
  }, [isAuthenticated, router])

  const fetchUserData = async () => {
    try {
      await Promise.all([
        fetchUserMarketplaceListings(),
        fetchUserPollProperties(),
        fetchUserProspectAnalyses()
      ])
    } catch (err) {
      console.error('Error fetching user data:', err)
      setError('Failed to load gallery data')
    }
  }

  const fetchUserMarketplaceListings = async () => {
    try {
      setLoading(prev => ({ ...prev, marketplace: true }))
      const response = await supabaseApi.getMarketplaceListings({ limit: 100 })
      if (response.success) {
        // Filter for user's listings
        const userListings = response.data.filter(listing => listing.user_id === user?.id)
        setMarketplaceListings(userListings)
      }
    } catch (err) {
      console.error('Error fetching marketplace listings:', err)
    } finally {
      setLoading(prev => ({ ...prev, marketplace: false }))
    }
  }

  const fetchUserPollProperties = async () => {
    try {
      setLoading(prev => ({ ...prev, poll: true }))
      const response = await supabaseApi.getProperties({
        source: 'poll',
        user_id: user?.id,
        limit: 100
      })
      if (response.success) {
        setPollProperties(response.data)
      }
    } catch (err) {
      console.error('Error fetching poll properties:', err)
    } finally {
      setLoading(prev => ({ ...prev, poll: false }))
    }
  }

  const fetchUserProspectAnalyses = async () => {
    try {
      setLoading(prev => ({ ...prev, prospects: true }))
      const response = await supabaseApi.getUserPropertyAnalyses(100)
      if (response.success) {
        setProspectAnalyses(response.data)
      }
    } catch (err) {
      console.error('Error fetching prospect analyses:', err)
    } finally {
      setLoading(prev => ({ ...prev, prospects: false }))
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

  const formatPrice = (price: number, currency: string = '₦') => {
    return `${currency}${price.toLocaleString()}`
  }

  const getImageUrl = (listing: MarketplaceListing) => {
    if (listing.images?.length && listing.images.length > 0) {
      const primaryImage = listing.images.find((img: any) => img.is_primary)
      return primaryImage?.image_url || listing.images[0]?.image_url
    }
    return '/api/placeholder/400/300'
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Error Loading Gallery</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchUserData}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
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
            <Grid3X3 className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
            My Gallery
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            View and track all your property listings across Marketplace, Polls, and Prospects
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="marketplace" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Marketplace ({marketplaceListings.length})
          </TabsTrigger>
          <TabsTrigger value="poll" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Poll ({pollProperties.length})
          </TabsTrigger>
          <TabsTrigger value="prospects" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Prospects ({prospectAnalyses.length})
          </TabsTrigger>
        </TabsList>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="mt-6">
          {loading.marketplace ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-300 rounded-t-lg" />
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4" />
                    <div className="h-3 bg-gray-300 rounded w-1/2" />
                    <div className="h-6 bg-gray-300 rounded w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : marketplaceListings.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No Marketplace Listings</h2>
              <p className="text-gray-600 mb-4">
                You haven't created any marketplace listings yet.
              </p>
              <Button asChild>
                <Link href="/marketplace/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Listing
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketplaceListings.map((listing) => (
                <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <Image
                        src={getImageUrl(listing)}
                        alt={listing.title || 'Property'}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {listing.title}
                      </h3>
                      <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="line-clamp-1">{listing.location}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(listing.price || 0)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {listing.category?.name}
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button asChild className="w-full">
                        <Link href={`/marketplace/${listing.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Poll Tab */}
        <TabsContent value="poll" className="mt-6">
          {loading.poll ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-300 rounded-t-lg" />
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4" />
                    <div className="h-3 bg-gray-300 rounded w-1/2" />
                    <div className="h-6 bg-gray-300 rounded w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pollProperties.length === 0 ? (
            <div className="text-center py-12">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No Poll Properties</h2>
              <p className="text-gray-600 mb-4">
                You haven't created any poll properties yet.
              </p>
              <Button onClick={() => router.push('/add-property')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pollProperties.map((property) => (
                <Card key={property.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary" className="text-xs">
                        {property.category_name}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-2">
                      {property.title}
                    </CardTitle>
                  </CardHeader>
                  <div className="relative overflow-hidden bg-muted flex items-center justify-center h-48">
                    {property.images && property.images.length > 0 ? (
                      <Image
                        src={property.images.find((img) => img.is_primary)?.image_url ||
                             property.images[0].image_url ||
                             "/placeholder.svg"}
                        alt={property.location || "Property location"}
                        fill
                        className="object-cover"
                        onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                      />
                    ) : (
                      <Building className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <CardContent className="pt-4">
                    <CardDescription className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {property.location}
                    </CardDescription>
                    <div className="flex justify-between items-center text-sm mt-4">
                      {property.current_worth && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">
                            <strong>
                              ₦
                              {Number(property.current_worth).toLocaleString("en-US", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })}
                            </strong>
                          </span>
                        </div>
                      )}
                      {property.year_of_construction && (
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{property.year_of_construction}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <span>{property.vote_count || 0} votes</span>
                        </div>
                      </div>
                    </div>
                    <Button asChild className="w-full mt-4">
                      <Link href={`/properties/${property.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Prospects Tab */}
        <TabsContent value="prospects" className="mt-6">
          {loading.prospects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4" />
                    <div className="h-3 bg-gray-300 rounded w-1/2" />
                    <div className="h-6 bg-gray-300 rounded w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : prospectAnalyses.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No Prospect Analyses</h2>
              <p className="text-gray-600 mb-4">
                You haven't generated any prospect analyses yet.
              </p>
              <Button asChild>
                <Link href="/ai">
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Prospect Analysis
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prospectAnalyses.map((analysis) => (
                <Card key={analysis.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base leading-tight truncate">
                          {analysis.property_address || 'Property Analysis'}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate text-xs">{analysis.property_type}</span>
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="ml-2 flex-shrink-0 text-xs">
                        {analysis.property_analysis_insights?.total_prospects || 0} prospects
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
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
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(analysis.created_at)}
                    </div>
                    <Button asChild className="w-full text-xs">
                      <Link href={`/prospects/${analysis.id}`}>
                        <Eye className="w-3 h-3 mr-2" />
                        View Details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}