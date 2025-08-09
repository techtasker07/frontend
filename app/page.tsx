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
      const params: Record<string, string> = {}
      if (selectedCategory !== 'all') {
        params.category = selectedCategory
      }
      const response = await api.getProperties(params)
      if (response.success) {
        setProperties(response.data)
      } else {
        toast.error('Error fetching properties. Please try again later.')
      }
    } catch {
      toast.error('Error fetching properties. Please try again later.')
    } finally {
      setLoadingProperties(false)
    }
  }

  const fetchProspectProperties = async () => {
    try {
      setLoadingProspects(true)
      const params: Record<string, string | number> = { limit: 3 }
      if (selectedCategory !== 'all') {
        params.category = selectedCategory
      }
      const response = await api.getProspectProperties(params)
      if (response.success) {
        setProspectProperties(response.data)
      } else {
        toast.error('Error fetching prospect properties. Please try again later.')
      }
    } catch {
      toast.error('Error fetching prospect properties. Please try again later.')
    } finally {
      setLoadingProspects(false)
    }
  }

  const filteredProperties = properties.filter(property =>
    [property.title, property.location, property.description].some(text =>
      text.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const filteredProspectProperties = prospectProperties.filter(prospect =>
    [prospect.title, prospect.location, prospect.description].some(text =>
      text.toLowerCase().includes(searchTerm.toLowerCase())
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
          <p>Loading properties...</p>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Card key={property.id}>
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle>{property.title}</CardTitle>
                    <Badge variant="secondary">{property.category_name || 'Uncategorized'}</Badge>
                  </div>
                  <CardDescription>
                    <MapPin className="inline-block h-3 w-3 mr-1" />
                    {property.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {property.images?.length ? (
                    <Image
                      src={property.images.find(img => img.is_primary)?.image_url || property.images[0].image_url}
                      alt={property.title}
                      width={400}
                      height={200}
                      className="rounded-md object-cover w-full"
                    />
                  ) : (
                    <div className="h-40 bg-muted flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">{property.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p>No properties found</p>
        )}
      </section>

      {/* --- Prospect Properties --- */}
      {isAuthenticated && (
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Prospect Properties for you</h2>
            <Button asChild>
              <Link href="/prospect-properties">
                <Plus className="mr-2 h-4 w-4" />
                Add Prospect
              </Link>
            </Button>
          </div>

          {loadingProspects ? (
            <p>Loading prospects...</p>
          ) : filteredProspectProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProspectProperties.map((prospect) => (
                <Card key={prospect.id}>
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle>{prospect.title}</CardTitle>
                      <Badge variant="secondary">{prospect.category_name || 'Uncategorized'}</Badge>
                    </div>
                    <CardDescription>
                      <MapPin className="inline-block h-3 w-3 mr-1" />
                      {prospect.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Image
                      src={prospect.image_url || '/placeholder.svg'}
                      alt={prospect.title}
                      width={400}
                      height={200}
                      className="rounded-md object-cover w-full"
                    />
                    <p className="text-sm text-muted-foreground mt-2">{prospect.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p>No prospect properties found</p>
          )}
        </section>
      )}
    </div>
  )
}
