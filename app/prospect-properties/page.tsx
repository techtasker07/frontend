'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api, ProspectProperty } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { Search, MapPin, Calendar, DollarSign, Plus, Building } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'Residential', label: 'Residential' },
  { value: 'Commercial', label: 'Commercial' },
  { value: 'Land', label: 'Land' },
  { value: 'Material', label: 'Material' },
]

export default function ProspectPropertiesPage() {
  const [prospectProperties, setProspectProperties] = useState<ProspectProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [page, setPage] = useState(1)
  const limit = 9

  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchProspectProperties()
  }, [selectedCategory, searchTerm, page])

  const fetchProspectProperties = async () => {
    try {
      setLoading(true)
      const params: Record<string, string | number> = {
        limit,
        offset: (page - 1) * limit
      }
      if (selectedCategory !== 'all') {
        params.category = selectedCategory
      }
      if (searchTerm.trim()) {
        params.searchTerm = searchTerm
      }

      const response = await api.getProspectProperties(params)
      if (response.success) {
        setProspectProperties(response.data)
      } else {
        toast.error('Error fetching prospects. Please try again later.')
      }
    } catch (error) {
      toast.error('Error fetching prospects. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const ProspectImage = ({ src, alt }: { src: string, alt: string }) => {
    const [imgSrc, setImgSrc] = useState(src || '/placeholder.svg')
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setImgSrc('/placeholder.svg')}
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Prospect Properties</h1>
          {isAuthenticated && (
            <Button asChild>
              <Link href="/prospect-properties/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Prospect
              </Link>
            </Button>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search prospects..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value)
              setPage(1)
            }}
          >
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

      <section>
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
        ) : prospectProperties.length > 0 ? (
          <>
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
                    <div className="relative h-40 w-full mb-4 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                      <ProspectImage src={prospect.image_url || '/placeholder.svg'} alt={prospect.title} />
                    </div>
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
                      <Link href={`/prospect-properties/${prospect.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination controls */}
            <div className="flex justify-center mt-8 gap-4">
              <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No prospect properties found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Try adjusting your search terms or filters"
                : "Be the first to add a prospect property"}
            </p>
            {isAuthenticated && (
              <Button asChild>
                <Link href="/prospect-properties/add">Add Prospect Property</Link>
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
