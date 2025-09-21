"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api, type VoteOption, type Category } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { Loader2, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function AddPropertyPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category_id: "",
    current_worth: "",
    year_of_construction: "",
    lister_phone_number: "",
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const [voteOptions, setVoteOptions] = useState<VoteOption[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    fetchVoteOptions()
    fetchCategories()
  }, [isAuthenticated])

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories()
      if (response.success) {
        setCategories(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const fetchVoteOptions = async () => {
    try {
      const response = await api.getVoteOptions()
      if (response.success) {
        setVoteOptions(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch vote options:", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Property title is required")
      return false
    }
    if (!formData.description.trim()) {
      setError("Property description is required")
      return false
    }
    if (!formData.location.trim()) {
      setError("Property location is required")
      return false
    }
    if (!formData.category_id) {
      setError("Property category is required")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const uploadedImageUrls: string[] = []
      setUploadProgress("Uploading images...")

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        setUploadProgress(`Uploading image ${i + 1} of ${selectedFiles.length}...`)

        try {
          const uploadResponse = await api.uploadFile(file)
          if (uploadResponse.success) {
            uploadedImageUrls.push(uploadResponse.data.url)
          } else {
            throw new Error(uploadResponse.error || "Failed to upload image")
          }
        } catch (uploadError: any) {
          toast.error(`Failed to upload image ${file.name}: ${uploadError.message}`)
          setError(`Failed to upload image ${file.name}: ${uploadError.message}`)
          setLoading(false)
          setUploadProgress("")
          return
        }
      }

      setUploadProgress("Creating property...")

      const propertyData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        category_id: formData.category_id, // Keep as UUID string for Supabase
        ...(formData.current_worth && { current_worth: Number.parseFloat(formData.current_worth) }),
        ...(formData.year_of_construction && { year_of_construction: Number.parseInt(formData.year_of_construction) }),
        ...(formData.lister_phone_number && { lister_phone_number: formData.lister_phone_number.trim() }),
        image_urls: uploadedImageUrls, // Send uploaded URLs to backend
      }

      const response = await api.createProperty(propertyData)

      if (response.success) {
        toast.success("Property added successfully!")
        router.push(`/properties/${response.data.id}`)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add property. Please try again.")
      setError(error.message || "Failed to add property. Please try again.")
    } finally {
      setLoading(false)
      setUploadProgress("")
    }
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  const selectedCategory = categories.find((cat) => cat.id === formData.category_id)
  const categoryVoteOptions = voteOptions.filter((option) => option.category_id === formData.category_id)

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
          <CardDescription>Share a property with the community for evaluation and voting</CardDescription>
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
                onValueChange={(value) => handleSelectChange("category_id", value)}
                disabled={loading}
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

            {/* Show vote options for selected category */}
            {selectedCategory && categoryVoteOptions.length > 0 && (
              <Alert>
                <AlertDescription>
                  <strong>Voting options for {selectedCategory.name}:</strong>
                  <ul className="mt-2 list-disc list-inside">
                    {categoryVoteOptions.map((option) => (
                      <li key={option.id} className="text-sm">
                        {option.name}
                      </li>
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
              <p className="text-xs text-muted-foreground">
                This number will be displayed on the property details page.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Property Images</Label>
              <Input
                id="images"
                name="images"
                type="file"
                multiple
                onChange={handleFileChange}
                disabled={loading}
                accept="image/*"
              />
              <p className="text-xs text-muted-foreground">
                Select one or more image files. First image will be primary.
              </p>
              {selectedFiles.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Selected: {selectedFiles.map((file) => file.name).join(", ")}
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadProgress || "Adding Property..."}
                </>
              ) : (
                "Add Property"
              )}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/">Cancel</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}