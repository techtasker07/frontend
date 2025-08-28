"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api, type ProspectProperty, type Category } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { MapPin, Calendar, Plus, Search, Filter, Loader2, Lightbulb } from "lucide-react"
import { toast } from "sonner"
import { ImageUpload } from "@/components/ui/image-upload"
import ProspectButtons from "@/components/ProspectButtons"

export default function ProspectPropertiesPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [properties, setProperties] = useState<ProspectProperty[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all") // Updated default value
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState<string>("") // Declare setError variable

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category_id: "",
    estimated_worth: "",
    year_of_construction: "",
    image_url: "",
  })

  // Add after the existing formData state
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)

  useEffect(() => {
    fetchProperties()
    fetchCategories()
  }, [selectedCategory])

  const fetchProperties = async () => {
    try {
      const params = selectedCategory !== "all" ? { category: selectedCategory } : undefined
      const response = await api.getProspectProperties(params)
      if (response.success) {
        setProperties(response.data)
      }
    } catch (error) {
      toast.error("Failed to fetch properties")
    } finally {
      setLoading(false)
    }
  }

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

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error("Please login to create a property")
      return
    }

    setCreating(true)
    try {
      let imageUrl: string | undefined = formData.image_url

      // Handle file upload if a file is selected
      if (selectedImageFile) {
        try {
          const uploadResponse = await api.uploadFile(selectedImageFile)
          if (uploadResponse.success) {
            imageUrl = uploadResponse.data.url
            toast.success("Image uploaded successfully!")
          } else {
            throw new Error(uploadResponse.error || "Failed to upload image")
          }
        } catch (uploadError: any) {
          toast.error(`Failed to upload image: ${uploadError.message}`)
          setError(`Failed to upload image: ${uploadError.message}`)
          setCreating(false)
          return
        }
      }

      const propertyData = {
        ...formData,
        category_id: formData.category_id, // Keep as UUID string for Supabase
        estimated_worth: formData.estimated_worth ? Number.parseFloat(formData.estimated_worth) : undefined,
        year_of_construction: formData.year_of_construction
          ? Number.parseInt(formData.year_of_construction)
          : undefined,
        image_url: imageUrl, // Use uploaded URL or manual URL
      }

      const response = await api.createProspectProperty(propertyData)
      if (response.success) {
        toast.success("Property created successfully with AI prospects!")
        setIsDialogOpen(false)
        setFormData({
          title: "",
          description: "",
          location: "",
          category_id: "",
          estimated_worth: "",
          year_of_construction: "",
          image_url: "",
        })
        setSelectedImageFile(null) // Reset file selection
        fetchProperties()
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create property")
    } finally {
      setCreating(false)
    }
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImageFile(e.target.files[0])
    } else {
      setSelectedImageFile(null)
    }
  }

  const filteredProperties = properties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2"> My Prospect Properties</h1>
          <p className="text-muted-foreground">
            Discover properties with AI-powered investment and development suggestions
          </p>
        </div>

        {isAuthenticated && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0">
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[80vw] max-h-[80vh] w-[80vw] h-[80vh] flex flex-col">
              <form onSubmit={handleCreateProperty} className="flex flex-col h-full">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Add New Prospect Property</DialogTitle>
                  <DialogDescription>
                    Add a property to get AI-powered development and investment suggestions.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4">
                  <div className="grid gap-6 px-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                          className="h-11"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          required
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category_id}
                          onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                          required
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select category" />
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
                      <div className="grid gap-2">
                        <Label htmlFor="year_of_construction">Year of Construction</Label>
                        <Input
                          id="year_of_construction"
                          type="number"
                          value={formData.year_of_construction}
                          onChange={(e) => setFormData({ ...formData, year_of_construction: e.target.value })}
                          className="h-11"
                          min="1800"
                          max={new Date().getFullYear()}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="estimated_worth">Estimated Worth (₦)</Label>
                      <Input
                        id="estimated_worth"
                        type="number"
                        value={formData.estimated_worth}
                        onChange={(e) => setFormData({ ...formData, estimated_worth: e.target.value })}
                        className="h-11"
                        min="0"
                        step="1000"
                        placeholder="e.g., 25000000"
                      />
                    </div>

                    <div className="grid gap-2">
                      <ImageUpload
                        value={formData.image_url}
                        onChange={(url) => setFormData({ ...formData, image_url: url })}
                        onFileSelect={setSelectedImageFile}
                        disabled={creating}
                        label="Property Image"
                        description="Upload an image file or provide a direct image URL for the prospect property"
                      />
                    </div>

                    {/* Preview Section */}
                    {(formData.title || formData.location || formData.description) && (
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <h4 className="font-medium mb-3 text-sm text-muted-foreground">Preview</h4>
                        <div className="space-y-2">
                          {formData.title && <h5 className="font-semibold text-lg">{formData.title}</h5>}
                          {formData.location && (
                            <p className="text-sm text-muted-foreground flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {formData.location}
                            </p>
                          )}
                          {formData.description && <p className="text-sm line-clamp-3">{formData.description}</p>}
                          {formData.estimated_worth && (
                            <p className="text-sm font-medium text-green-600">
                              ₦{Number.parseFloat(formData.estimated_worth).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter className="flex-shrink-0 pt-4 border-t">
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={creating}
                      className="flex-1 sm:flex-none"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={creating} className="flex-1 sm:flex-none">
                      {creating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Property
                        </>
                      )}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
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
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem> {/* Updated value prop */}
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No properties found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedCategory !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Be the first to add a prospect property"}
          </p>
          {isAuthenticated && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Property
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <div className="relative h-48 rounded-t-lg overflow-hidden bg-muted flex items-center justify-center">
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
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-1">
                    <Link href={`/prospectProperties/${property.id}`} className="hover:text-primary">
                      {property.title}
                    </Link>
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {property.category_name}
                  </Badge>
                </div>
                <CardDescription className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {property.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{property.description}</p>

                <div className="flex justify-between items-center text-sm">
                  {property.estimated_worth && (
                    <div className="flex items-center">
                      <span className="font-medium">₦{property.estimated_worth.toLocaleString()}</span>
                    </div>
                  )}
                  {property.year_of_construction && (
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{property.year_of_construction}</span>
                    </div>
                  )}
                </div>

                {/* AI Prospects Buttons */}
                <ProspectButtons propertyId={property.id} prospects={property.prospects || []} className="mt-4" />

                <div className="flex items-center justify-between pt-2">
                  <Badge variant="outline" className="text-xs">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    AI Prospects Available
                  </Badge>
                  <Link href={`/prospectProperties/${property.id}`}>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Custom styles for the large modal */}
      <style jsx global>{`
        @media (max-width: 640px) {
          [data-radix-dialog-content] {
            width: 95vw !important;
            height: 90vh !important;
            max-width: 95vw !important;
            max-height: 90vh !important;
          }
        }
        
        @media (min-width: 641px) and (max-width: 1024px) {
          [data-radix-dialog-content] {
            width: 85vw !important;
            height: 85vh !important;
            max-width: 85vw !important;
            max-height: 85vh !important;
          }
        }
        
        /* Ensure the dialog overlay is properly styled */
        [data-radix-dialog-overlay] {
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
        }
        
        /* Custom scrollbar for the modal content */
        .modal-scroll::-webkit-scrollbar {
          width: 6px;
        }
        
        .modal-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .modal-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        
        .modal-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  )
}
