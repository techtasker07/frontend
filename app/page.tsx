'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api, Property, ProspectProperty } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { Search, MapPin, Calendar, DollarSign, Vote, TrendingUp, Users, Building } from 'lucide-react'
import { toast } from 'sonner'

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'Residential', label: 'Residential' },
  { value: 'Commercial', label: 'Commercial' },
  { value: 'Land', label: 'Land' },
  { value: 'Material', label: 'Material' },
]

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [prospectProperties, setProspectProperties] = useState<ProspectProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [stats, setStats] = useState<any>(null)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchProperties()
    fetchStats()
    fetchProspectPropertiesPreview()
  }, [selectedCategory])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {}
      const response = await api.getProperties(params)
      if (response.success) {
        setProperties(response.data)
      } else {
        toast.error('Error fetching properties. Please try again later.')
      }
    } catch (error) {
      toast.error('Error fetching properties. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.getPlatformStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchProspectPropertiesPreview = async () => {
    try {
      const response = await api.getProspectProperties({ limit: 3, category: selectedCategory !== 'all' ? selectedCategory : undefined })
      if (response.success) {
        setProspectProperties(response.data)
      } else {
        console.error('Failed to fetch prospect properties preview:', response.error)
      }
    } catch (error) {
      console.error('Failed to fetch prospect properties preview:', error)
    }
  }

  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-12 mb-12">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/mipripity.png"
            alt="Mipripity Logo"
            width={200}
            height={200}
            className="h-auto w-auto"
            priority
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Hello Mipripity!
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          If you see this, your frontend is loading!
        </p>
        {!isAuthenticated && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        )}
      </section>
      {/* Stats Section */}
      {stats && (
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_properties || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
              <Vote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_votes || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Property Images</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_images || 0}</div>
            </CardContent>
          </Card>
        </section>
      )}
      {/* Search and Filter Section */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search properties by title, location, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>
      {/* Properties Grid */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {selectedCategory === 'all' ? 'All Properties' : `${selectedCategory} Properties`}
          </h2>
          {isAuthenticated && (
            <Button asChild>
              <Link href="/add-property">Add Property</Link>
            </Button>
          )}
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{property.title}</CardTitle>
                    <Badge variant="secondary">{property.category_name}</Badge>
                  </div>
                  <CardDescription className="flex items-center text-sm">
                    <MapPin className="h-3 w-3 mr-1" />
                    {property.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {property.images && property.images.length > 0 && (
                    <div className="relative h-40 w-full mb-4 rounded-md overflow-hidden">
                      <Image
                        src={property.images.find(img => img.is_primary)?.image_url || property.images[0].image_url || "/placeholder.svg"}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {property.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    {property.current_worth && (
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-3 w-3 mr-1" />
                        <span>₦{property.current_worth.toLocaleString()}</span>
                      </div>
                    )}
                    {property.year_of_construction && (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Built in {property.year_of_construction}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm">
                      <Vote className="h-3 w-3 mr-1" />
                      <span>{property.vote_count || 0} votes</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/properties/${property.id}`}>View Details</Link>
                    </Button>
                    {isAuthenticated && (
                      <Button variant="outline" asChild>
                        <Link href={`/properties/${property.id}#vote`}>Vote</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Try adjusting your search terms or filters"
                : "Be the first to add a property in this category"
              }
            </p>
            {isAuthenticated && (
              <Button asChild>
                <Link href="/add-property">Add Property</Link>
              </Button>
            )}
          </div>
        )}
      </section>
      {/* Prospect Properties Preview */}
      <section className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Prospect Properties Preview</h2>
          {isAuthenticated && (
            <Button asChild>
              <Link href="/prospect-properties">View All Prospects</Link>
            </Button>
          )}
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : prospectProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prospectProperties.map((prospect) => (
              <Card key={prospect.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{prospect.title}</CardTitle>
                    <Badge variant="secondary">{prospect.category_name}</Badge>
                  </div>
                  <CardDescription className="flex items-center text-sm">
                    <MapPin className="h-3 w-3 mr-1" />
                    {prospect.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {prospect.image_url && (
                    <div className="relative h-40 w-full mb-4 rounded-md overflow-hidden">
                      <Image
                        src={prospect.image_url || "/placeholder.svg"}
                        alt={prospect.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {prospect.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    {prospect.estimated_worth && (
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-3 w-3 mr-1" />
                        <span>₦{prospect.estimated_worth.toLocaleString()} (Est.)</span>
                      </div>
                    )}
                    {prospect.year_of_construction && (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Built in {prospect.year_of_construction}</span>
                      </div>
                    )}
                  </div>
                  <Button asChild className="w-full">
                    <Link href={isAuthenticated ? `/prospect-properties/${prospect.id}` : '/login'}>
                      View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Building className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No prospect properties available for preview.</p>
          </div>
        )}
      </section>
    </div>
  )
}
