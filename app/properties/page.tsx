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
import { api, type Property, type Category } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import {
  MapPin,
  Calendar,
  DollarSign,
  Plus,
  Search,
  Filter,
  Loader2,
  Building,
  Vote,
  User,
  ArrowRight,
  Grid3X3,
  List,
  SortAsc,
} from "lucide-react"
import { toast } from "sonner"

type ViewMode = "grid" | "list"
type SortOption = "newest" | "oldest" | "price_high" | "price_low" | "title_asc" | "title_desc"

export default function PropertiesPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProperties, setTotalProperties] = useState(0)
  const propertiesPerPage = 12

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category_id: "",
    type: "poll",
    current_worth: "",
    year_of_construction: "",
    lister_phone_number: "",
  })

  useEffect(() => {
    fetchProperties()
    fetchCategories()
  }, [selectedCategory, currentPage, sortBy])

  const fetchProperties = async () => {
    try {
      const params: {
        category?: string
        limit?: number
        offset?: number
      } = {
        limit: propertiesPerPage,
        offset: (currentPage - 1) * propertiesPerPage,
      }

      if (selectedCategory !== "all") {
        params.category = selectedCategory
      }

      const response = await api.getProperties(params)
      if (response.success) {
        const sortedProperties = [...response.data]

        // Apply sorting
        switch (sortBy) {
          case "newest":
            sortedProperties.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            break
          case "oldest":
            sortedProperties.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            break
          case "price_high":
            sortedProperties.sort((a, b) => (b.current_worth || 0) - (a.current_worth || 0))
            break
          case "price_low":
            sortedProperties.sort((a, b) => (a.current_worth || 0) - (b.current_worth || 0))
            break
          case "title_asc":
            sortedProperties.sort((a, b) => a.title.localeCompare(b.title))
            break
          case "title_desc":
            sortedProperties.sort((a, b) => b.title.localeCompare(a.title))
            break
        }

        setProperties(sortedProperties)
        setTotalProperties(response.total || response.data.length)
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
      const propertyData = {
        ...formData,
        category_id: formData.category_id, // Keep as string for Supabase UUID
        current_worth: formData.current_worth ? Number.parseFloat(formData.current_worth) : undefined,
        year_of_construction: formData.year_of_construction
          ? Number.parseInt(formData.year_of_construction)
          : undefined,
      }

      const response = await api.createProperty(propertyData)
      if (response.success) {
        toast.success("Property created successfully!")
        setIsDialogOpen(false)
        setFormData({
          title: "",
          description: "",
          location: "",
          category_id: "",
          type: "poll",
          current_worth: "",
          year_of_construction: "",
          lister_phone_number: "",
        })
        fetchProperties()
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create property")
    } finally {
      setCreating(false)
    }
  }

  const filteredProperties = properties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalPages = Math.ceil(totalProperties / propertiesPerPage)

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case "newest":
        return "Newest First"
      case "oldest":
        return "Oldest First"
      case "price_high":
        return "Price: High to Low"
      case "price_low":
        return "Price: Low to High"
      case "title_asc":
        return "Title: A to Z"
      case "title_desc":
        return "Title: Z to A"
      default:
        return "Newest First"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded"></div>
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
          <h1 className="text-3xl font-bold mb-2">Properties</h1>
          <p className="text-muted-foreground">Browse and evaluate properties from our community-driven platform</p>
        </div>

        {isAuthenticated && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleCreateProperty}>
                <DialogHeader>
                  <DialogTitle>Add New Property</DialogTitle>
                  <DialogDescription>Add a property to get community feedback and evaluations.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Property Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="poll">Community Poll</SelectItem>
                        <SelectItem value="sale">For Sale</SelectItem>
                        <SelectItem value="rent">For Rent</SelectItem>
                        <SelectItem value="lease">For Lease</SelectItem>
                        <SelectItem value="booking">For Booking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                      required
                    >
                      <SelectTrigger>
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
                    <Label htmlFor="current_worth">Current Worth (₦)</Label>
                    <Input
                      id="current_worth"
                      type="number"
                      value={formData.current_worth}
                      onChange={(e) => setFormData({ ...formData, current_worth: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="year_of_construction">Year of Construction</Label>
                    <Input
                      id="year_of_construction"
                      type="number"
                      value={formData.year_of_construction}
                      onChange={(e) => setFormData({ ...formData, year_of_construction: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lister_phone_number">Contact Phone Number</Label>
                    <Input
                      id="lister_phone_number"
                      type="tel"
                      value={formData.lister_phone_number}
                      onChange={(e) => setFormData({ ...formData, lister_phone_number: e.target.value })}
                      placeholder="e.g., +234 123 456 7890"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={creating}>
                    {creating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Property"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SortAsc className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="title_asc">Title: A to Z</SelectItem>
              <SelectItem value="title_desc">Title: Z to A</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {filteredProperties.length} of {totalProperties} properties
          {selectedCategory !== "all" && ` in ${selectedCategory}`}
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
        <p className="text-sm text-muted-foreground">Sorted by {getSortLabel(sortBy)}</p>
      </div>

      {/* Properties Grid/List */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No properties found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedCategory !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Be the first to add a property"}
          </p>
          {isAuthenticated && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Property
            </Button>
          )}
        </div>
      ) : (
        <>
          <div
            className={
              viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"
            }
          >
            {filteredProperties.map((property) => (
              <Card
                key={property.id}
                className={`hover:shadow-lg transition-shadow cursor-pointer ${
                  viewMode === "list" ? "" : ""
                }`}
              >
                <Link href={`/properties/${property.id}`} className="block">
                  {viewMode === "grid" ? (
                    // Grid View - Title above image
                    <>
                      {/* Title and Header */}
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <Badge variant="secondary" className="text-xs ml-2 shrink-0">
                            {property.category_name}
                          </Badge>
                        </div>
                          <CardTitle className="line-clamp-2">
                            {property.title}
                          </CardTitle>
                      </CardHeader>
                      
                      {/* Property Image */}
                      <div className="relative overflow-hidden bg-muted flex items-center justify-center h-48">
                        {property.images && property.images.length > 0 ? (
                          <Image
                            src={
                              property.images.find((img) => img.is_primary)?.image_url ||
                              property.images[0].image_url ||
                              "/placeholder.svg"
                            }
                            alt={property.location || "Property location"}   // ✅ use location as alt
                            fill
                            className="object-cover"
                            onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                          />
                        ) : (
                          <Building className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>

                      <CardDescription className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {property.location}
                      </CardDescription>

                      {/* Content */}
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center text-sm mb-4">
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

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <div className="flex items-center">
                              <Vote className="h-3 w-3 mr-1" />
                              <span>{property.vote_count || 0} votes</span>
                            </div>
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              <span>{property.owner_name || "Anonymous"}</span>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </>
                  ) : (
                    // List View - Better mobile layout
                    <div className="flex flex-col sm:flex-row">
                      {/* Title and Header - Full width on mobile, left side on desktop */}
                      <div className="sm:flex-1 sm:min-w-0">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg line-clamp-2 sm:line-clamp-1">
                              {property.title}
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs ml-2 shrink-0">
                              {property.category_name}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {property.location}
                          </CardDescription>
                        </CardHeader>
                        
                        {/* Content - Only visible on mobile OR when there's space */}
                        <CardContent className="pt-0 sm:pt-0">
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {property.description}
                          </p>

                          <div className="flex flex-wrap gap-4 items-center text-sm mb-4">
                            {property.current_worth && (
                              <div className="flex items-center">
                                <span className="font-semibold">
                                  ₦{Number(property.current_worth).toLocaleString("en-US", {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  })}
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

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <Vote className="h-3 w-3 mr-1" />
                                <span>{property.vote_count || 0} votes</span>
                              </div>
                              <div className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                <span>{property.owner_name || "Anonymous"}</span>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </div>
                      
                      {/* Property Image - Full width on mobile, right side on desktop */}
                      <div className="sm:w-48 sm:flex-shrink-0">
                        <div className="relative overflow-hidden bg-muted flex items-center justify-center h-32 sm:h-full sm:min-h-[180px] sm:rounded-r-lg">
                          {property.images && property.images.length > 0 ? (
                            <Image
                              src={
                                property.images.find((img) => img.is_primary)?.image_url ||
                                property.images[0].image_url ||
                                "/placeholder.svg"
                              }
                              alt={property.title}
                              fill
                              className="object-cover"
                              onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                            />
                          ) : (
                            <Building className="h-12 w-12 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Link>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber: number
                  if (totalPages <= 5) {
                    pageNumber = i + 1
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i
                  } else {
                    pageNumber = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}