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
import { api, Category } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { Loader2, Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function AddProspectPropertyPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category_id: '',
    estimated_worth: '',
    year_of_construction: '',
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]) // For image files
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])

  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchCategories()
  }, [isAuthenticated])

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories()
      if (response.success) {
        setCategories(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Prospect title is required')
      return false
    }
    if (!formData.description.trim()) {
      setError('Prospect description is required')
      return false
    }
    if (!formData.location.trim()) {
      setError('Prospect location is required')
      return false
    }
    if (!formData.category_id) {
      setError('Prospect category is required')
      return false
    }
    if (selectedFiles.length === 0) {
      setError('At least one image is required')
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
      const uploadedImageUrls: string[] = []

      for (const file of selectedFiles) {
        try {
          const uploadResponse = await api.uploadFile(file)
          if (uploadResponse.success) {
            uploadedImageUrls.push(uploadResponse.data.url)
          } else {
            throw new Error(uploadResponse.error || 'Failed to upload image')
          }
        } catch (uploadError: any) {
          toast.error(`Failed to upload image ${file.name}: ${uploadError.message}`)
          setError(`Failed to upload image ${file.name}: ${uploadError.message}`)
          setLoading(false)
          return
        }
      }

      const prospectData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        category_id: parseInt(formData.category_id),
        ...(formData.estimated_worth && { estimated_worth: parseFloat(formData.estimated_worth) }),
        ...(formData.year_of_construction && { year_of_construction: parseInt(formData.year_of_construction) }),
        image_urls: uploadedImageUrls, // array instead of single URL
      }

      const response = await api.createProspectProperty(prospectData)

      if (response.success) {
        toast.success('Prospect property added successfully!')
        router.push(`/prospect-properties/${response.data.id}`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add prospect property. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/prospect-properties">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Prospects
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            Add New Prospect Property
          </CardTitle>
          <CardDescription>
            Add a new property prospect for AI analysis and community review
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
              <Label htmlFor="title">Prospect Title *</Label>
              <Input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Undeveloped land near city center"
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
                placeholder="Provide a detailed description of the prospect..."
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
                placeholder="e.g., Rural area, Springfield, IL"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Prospect Category *</Label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated_worth">Estimated Worth (USD)</Label>
                <Input
                  id="estimated_worth"
                  name="estimated_worth"
                  type="number"
                  value={formData.estimated_worth}
                  onChange={handleChange}
                  placeholder="e.g., 150000"
                  min="0"
                  step="1000"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year_of_construction">Year Built (if applicable)</Label>
                <Input
                  id="year_of_construction"
                  name="year_of_construction"
                  type="number"
                  value={formData.year_of_construction}
                  onChange={handleChange}
                  placeholder="e.g., 2023"
                  min="1800"
                  max={new Date().getFullYear() + 5}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Prospect Images *</Label>
              <Input
                id="images"
                name="images"
                type="file"
                multiple
                onChange={handleFileChange}
                disabled={loading}
                accept="image/*"
              />
              <p className="text-xs text-muted-foreground">Select one or more image files. First image will be primary.</p>
              {selectedFiles.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Selected: {selectedFiles.map(file => file.name).join(', ')}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Prospect...
                  </>
                ) : (
                  'Add Prospect Property'
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/prospect-properties">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
