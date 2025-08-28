'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { api, Property } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { Loader2, ArrowLeft, Edit } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
}

export default function EditPropertyPage() {
const params = useParams()
const router = useRouter()
const { user, isAuthenticated } = useAuth()

const [property, setProperty] = useState<Property | null>(null)
const [categories, setCategories] = useState<Category[]>([])
const [formData, setFormData] = useState({
  title: '',
  description: '',
  location: '',
  category_id: '',
  current_worth: '',
  year_of_construction: '',
})
const [loading, setLoading] = useState(true)
const [saving, setSaving] = useState(false)
const [error, setError] = useState('')

const propertyId = params.id as string

useEffect(() => {
  if (!isAuthenticated) {
    router.push('/login')
    return
  }
  fetchProperty()
}, [isAuthenticated, propertyId])

const fetchProperty = async () => {
  try {
    // Fetch both property and categories in parallel
    const [propertyResponse, categoriesResponse] = await Promise.all([
      api.getProperty(propertyId),
      api.getCategories()
    ])

    if (propertyResponse.success) {
      const propertyData = propertyResponse.data
      
      // Check if user owns this property
      if (propertyData.user_id !== user?.id) {
        toast.error('You can only edit your own properties')
        router.push(`/properties/${propertyId}`)
        return
      }

      setProperty(propertyData)
      setFormData({
        title: propertyData.title,
        description: propertyData.description,
        location: propertyData.location,
        category_id: propertyData.category_id,
        current_worth: propertyData.current_worth?.toString() || '',
        year_of_construction: propertyData.year_of_construction?.toString() || '',
      })
    } else {
      toast.error('Property not found')
      router.push('/dashboard')
      return
    }

    if (categoriesResponse.success) {
      setCategories(categoriesResponse.data)
    } else {
      toast.error('Failed to load categories')
    }
  } catch (error) {
    toast.error('Failed to fetch property details')
    router.push('/dashboard')
  } finally {
    setLoading(false)
  }
}

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target
  setFormData(prev => ({
    ...prev,
    [name]: value
  }))
}

const handleSelectChange = (name: string, value: string) => {
  setFormData(prev => ({
    ...prev,
    [name]: value
  }))
}

const validateForm = () => {
  if (!formData.title.trim()) {
    setError('Property title is required')
    return false
  }
  if (!formData.description.trim()) {
    setError('Property description is required')
    return false
  }
  if (!formData.location.trim()) {
    setError('Property location is required')
    return false
  }
  if (!formData.category_id) {
    setError('Property category is required')
    return false
  }
  return true
}

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')

  if (!validateForm()) {
    return
  }

  setSaving(true)

  try {
    const propertyData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      category_id: formData.category_id, // Keep as UUID string for Supabase
      ...(formData.current_worth && { current_worth: parseFloat(formData.current_worth) }),
      ...(formData.year_of_construction && { year_of_construction: parseInt(formData.year_of_construction) }),
    }

    const response = await api.updateProperty(propertyId, propertyData)
    
    if (response.success) {
      toast.success('Property updated successfully!')
      router.push(`/properties/${propertyId}`)
    }
  } catch (error: any) {
    setError(error.message || 'Failed to update property. Please try again.')
  } finally {
    setSaving(false)
  }
}

if (!isAuthenticated) {
  return null
}

if (loading) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="h-96 bg-muted rounded"></div>
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
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}

return (
  <div className="container mx-auto px-4 py-8 max-w-2xl">
    {/* Back Button */}
    <Button variant="ghost" asChild className="mb-6">
      <Link href={`/properties/${propertyId}`}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Property
      </Link>
    </Button>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Edit className="mr-2 h-5 w-5" />
          Edit Property
        </CardTitle>
        <CardDescription>
          Update your property information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Property Title *</Label>
            <Input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Modern 3-bedroom house in downtown"
              required
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a detailed description of the property..."
              rows={4}
              required
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., 123 Main St, New York, NY"
              required
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">Property Category *</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(value) => handleSelectChange('category_id', value)}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_worth">Current Worth (NGN)</Label>
              <Input
                id="current_worth"
                name="current_worth"
                type="number"
                value={formData.current_worth}
                onChange={handleChange}
                placeholder="e.g., 250000"
                min="0"
                step="1000"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year_of_construction">Year Built</Label>
              <Input
                id="year_of_construction"
                name="year_of_construction"
                type="number"
                value={formData.year_of_construction}
                onChange={handleChange}
                placeholder="e.g., 2020"
                min="1800"
                max={new Date().getFullYear()}
                disabled={saving}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Property...
                </>
              ) : (
                'Update Property'
              )}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={`/properties/${propertyId}`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
)
}