'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api, Property, ProspectProperty } from '@/lib/api'
import { Search, MapPin, Calendar, Plus, Building } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'

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
  const [loadingProperties, setLoadingProperties] = useState(true)
  const [loadingProspects, setLoadingProspects] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchProperties()
    if (isAuthenticated) {
      fetchProspectProperties()
    }
  }, [selectedCategory, isAuthenticated])

  const fetchProperties = async () => {
    try {
      setLoadingProperties(true)
      console.log('Fetching properties with category:', selectedCategory) // Debug log
      
      // Fix: Use proper parameter types
      const params: {
        category?: string;
        limit?: number;
        offset?: number;
      } = {}
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory
      }
      
      const response = await api.getProperties(params)
      console.log('Properties response:', response) // Debug log
      
      if (response.success) {
        setProperties(response.data)
      } else {
        console.error('Properties API returned error:', response.error)
        toast.error(response.error || 'Error fetching properties. Please try again later.')
      }
    } catch (error) {
      console.error('Properties fetch error:', error) // Debug log
      toast.error('Error fetching properties. Please check your connection and try again.')
    } finally {
      setLoadingProperties(false)
    }
  }

  const fetchProspectProperties = async () => {
    try {
      setLoadingProspects(true)
      console.log('Fetching prospect properties with category:', selectedCategory) // Debug log
      
      // Fix: Use proper parameter types and structure
      const params: {
        category?: string;
        limit?: number;
        offset?: number;
        searchTerm?: string;
      } = { 
        limit: 3 
      }
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory
      }
      
      console.log('Prospect properties params:', params) // Debug log
      const response = await api.getProspectProperties(params)
      console.log('Prospect properties response:', response) // Debug log
      
      if (response.success) {
        setProspectProperties(response.data)
      } else {
        console.error('Prospect properties API returned error:', response.error)
        toast.error(response.error || 'Error fetching prospect properties. Please try again later.')
      }
    } catch (error) {
      console.error('Prospect properties fetch error:', error) // Debug log
      toast.error('Error fetching prospect properties. Please check your connection and try again.')
    } finally {
      setLoadingProspects(false)
    }
  }

  const filteredProperties = properties.filter(property =>
    [property.title, property.location, property.description].some(text =>
      text?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const filteredProspectProperties = prospectProperties.filter(prospect =>
    [prospect.title, prospect.location, prospect.description].some(text =>
      text?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* --- Properties for Evaluation --- */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Properties for Evaluation</h1>
          <Button asChild>
            <Link href="/add-property">
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Link>
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search properties..."
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

      {/* --- Properties Grid --- */}
      <section className="mb-12">
        {loadingProperties ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-40 bg-gray-200 rounded"></div>
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
                    <CardTitle className="line-clamp-1">{property.title}</CardTitle>
                    <Badge variant="secondary">{property.category_name || 'Uncategorized'}</Badge>
                  </div>
                  <CardDescription>
                    <MapPin className="inline-block h-3 w-3 mr-1" />
                    {property.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/properties/${property.id}`}>
                    {property.images && property.images.length > 0 ? (
                      <Image
                        src={property.images.find(img => img.is_primary)?.image_url || property.images[0].image_url}
                        alt={property.title}
                        width={400}
                        height={200}
                        className="rounded-md object-cover w-full h-40 hover:opacity-90 transition-opacity"
                      />
                    ) : (
                      <div className="h-40 bg-muted flex items-center justify-center text-muted-foreground rounded-md">
                        <Building className="h-8 w-8" />
                      </div>
                    )}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{property.description}</p>
                  {property.current_worth && (
                    <p className="text-sm font-semibold mt-2 text-green-600">
                      ₦{property.current_worth.toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No properties found for the selected category</p>
              <Button asChild className="mt-4">
                <Link href="/add-property">Add the first property</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* --- Prospect Properties --- */}
      {isAuthenticated && (
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Prospect Properties for you</h2>
            <Button asChild>
              <Link href="/prospect-properties">
                <Building className="mr-2 h-4 w-4" />
                View All Prospects
              </Link>
            </Button>
          </div>

          {loadingProspects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-40 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProspectProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProspectProperties.map((prospect) => (
                <Card key={prospect.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="line-clamp-1">{prospect.title}</CardTitle>
                      <Badge variant="outline">{prospect.category_name || 'Uncategorized'}</Badge>
                    </div>
                    <CardDescription>
                      <MapPin className="inline-block h-3 w-3 mr-1" />
                      {prospect.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/prospect-properties/${prospect.id}`}>
                      {/* Fix: Handle both old image_url and new images array */}
                      {prospect.images && prospect.images.length > 0 ? (
                        <Image
                          src={prospect.images.find(img => img.is_primary)?.image_url || prospect.images[0].image_url}
                          alt={prospect.title}
                          width={400}
                          height={200}
                          className="rounded-md object-cover w-full h-40 hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <div className="h-40 bg-muted flex items-center justify-center text-muted-foreground rounded-md">
                          <Building className="h-8 w-8" />
                        </div>
                      )}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{prospect.description}</p>
                    {prospect.estimated_worth && (
                      <p className="text-sm font-semibold mt-2 text-blue-600">
                        Est. ₦{prospect.estimated_worth.toLocaleString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No prospect properties found</p>
                <Button asChild className="mt-4">
                  <Link href="/prospect-properties">Add your first prospect</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>
      )}
    </div>
  )
}