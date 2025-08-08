'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { api, VoteOption } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { Loader2, Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

const categories = [
  { id: 1, name: 'Residential' },
  { id: 2, name: 'Commercial' },
  { id: 3, name: 'Land' },
  { id: 4, name: 'Material' },
]

export default function AddPropertyPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category_id: '',
    current_worth: '',
    year_of_construction: '',
    lister_phone_number: '', // New field
    image_urls_input: '', // New field for comma-separated image URLs
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [voteOptions, setVoteOptions] = useState<VoteOption[]>([])

  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchVoteOptions()
  }, [isAuthenticated])

  const fetchVoteOptions = async () => {
    try {
      const response = await api.getVoteOptions()
      if (response.success) {
        setVoteOptions(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch vote options:', error)
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

    setLoading(true)

    try {
      const image_urls = formData.image_urls_input
        .split(',')
        .map(url => url.trim())
        .filter(url => url !== '');

      const propertyData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        category_id: parseInt(formData.category_id),
        ...(formData.current_worth && { current_worth: parseFloat(formData.current_worth) }),
        ...(formData.year_of_construction && { year_of_construction: parseInt(formData.year_of_construction) }),
        ...(formData.lister_phone_number && { lister_phone_number: formData.lister_phone_number.trim() }), // Include new field
        ...(image_urls.length > 0 && { image_urls }), // Include new field
      }

      const response = await api.createProperty(propertyData)
      
      if (response.success) {
        toast.success('Property added successfully!')
        router.push(`/properties/${response.data.id}`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add property. Please try again.')
      setError(error.message || 'Failed to add property. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  const selectedCategory = categories.find(cat => cat.id.toString() === formData.category_id)
  const categoryVoteOptions = voteOptions.filter(option => 
    option.category_id.toString() === formData.category_id
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            Add New Property
          </CardTitle>
          <CardDescription>
            Share a property with the community for evaluation and voting
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Property Category *</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => handleSelectChange('category_id', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Show vote options for selected category */}
            {selectedCategory && categoryVoteOptions.length > 0 && (
              <Alert>
                <AlertDescription>
                  <strong>Voting options for {selectedCategory.name}:</strong>
                  <ul className="mt-2 list-disc list-inside">
                    {categoryVoteOptions.map((option) => (
                      <li key={option.id} className="text-sm">{option.name}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current_worth">Current Worth (₦)</Label>
                <Input
                  id="current_worth"
                  name="current_worth"
                  type="number"
                  value={formData.current_worth}
                  onChange={handleChange}
                  placeholder="e.g., 25000000"
                  min="0"
                  step="1000"
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lister_phone_number">Lister's Phone Number (WhatsApp preferred)</Label>
              <Input
                id="lister_phone_number"
                name="lister_phone_number"
                type="text"
                value={formData.lister_phone_number}
                onChange={handleChange}
                placeholder="e.g., +2348012345678"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">This number will be displayed on the property details page.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_urls_input">Property Image URLs (comma-separated)</Label>
              <Textarea
                id="image_urls_input"
                name="image_urls_input"
                value={formData.image_urls_input}
                onChange={handleChange}
                placeholder="Paste image URLs separated by commas. First image will be primary."
                rows={3}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">e.g., https://example.com/img1.jpg, https://example.com/img2.png</p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Property...
                  </>
                ) : (
                  'Add Property'
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
