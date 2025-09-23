"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Camera, 
  Upload, 
  MapPin, 
  Building, 
  Home,
  Ruler,
  Layers,
  DoorOpen,
  Grid,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X,
  AlertCircle,
  Sparkles
} from "lucide-react"

interface PropertyDetails {
  // Image data
  imageFile: File | null
  imageUrl: string | null
  
  // Basic property info
  location: string
  propertySize: number | null // in square meters
  stories: number | null
  rooms: number | null
  averageRoomSize: number | null // in square meters
  useCoordinates: boolean // if true, user will click to get coordinates instead
  
  // Property usage and amenities
  currentUsage: string
  amenities: string[]
  
  // Additional context
  additionalNotes: string
}

interface EnhancedPropertyDetailsFormProps {
  imageFile: File | null
  imageUrl: string | null
  identifiedCategory?: {
    name: string
    confidence: number
  }
  onSubmit: (propertyDetails: PropertyDetails) => void
  onBack: () => void
  onClose: () => void
  fromLogin?: boolean
}

// Available amenities options
const AMENITIES_OPTIONS = [
  "Swimming Pool",
  "Gym/Fitness Center", 
  "Parking/Garage",
  "Garden/Landscaping",
  "Security System",
  "Generator/Backup Power",
  "Water Treatment/Borehole",
  "Air Conditioning",
  "Elevator/Lift",
  "Balcony/Terrace",
  "Built-in Wardrobes",
  "Modern Kitchen",
  "Tiled Floors",
  "POP Ceiling",
  "CCTV Surveillance",
  "Gated Community",
  "Shopping Mall Nearby",
  "School Nearby",
  "Hospital Nearby",
  "Public Transport Access"
]

// Property usage options
const USAGE_OPTIONS = [
  "Residential - Family Home",
  "Residential - Rental Property", 
  "Commercial - Office Space",
  "Commercial - Retail/Shop",
  "Commercial - Restaurant/Hotel",
  "Industrial - Warehouse",
  "Industrial - Manufacturing",
  "Mixed Use - Residential & Commercial",
  "Vacant Land - Development Ready",
  "Agricultural - Farming",
  "Vacant - Abandoned Property",
  "Under Construction",
  "Other"
]

export function EnhancedPropertyDetailsForm({
  imageFile,
  imageUrl,
  identifiedCategory,
  onSubmit,
  onBack,
  onClose,
  fromLogin = false
}: EnhancedPropertyDetailsFormProps) {
  
  const [formData, setFormData] = useState<PropertyDetails>({
    imageFile,
    imageUrl,
    location: "",
    propertySize: null,
    stories: null,
    rooms: null,
    averageRoomSize: null,
    useCoordinates: false,
    currentUsage: "",
    amenities: [],
    additionalNotes: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.location.trim()) {
      newErrors.location = "Location is required"
    }

    if (!formData.propertySize || formData.propertySize <= 0) {
      newErrors.propertySize = "Property size in square meters is required"
    }

    if (!formData.currentUsage) {
      newErrors.currentUsage = "Current usage is required"
    }

    // If it's a building with multiple stories, require stories count
    if (identifiedCategory?.name === 'building' && (!formData.stories || formData.stories < 1)) {
      newErrors.stories = "Number of stories is required for buildings"
    }

    // If property has rooms, require room count
    if ((identifiedCategory?.name === 'building' || identifiedCategory?.name === 'room') && 
        (!formData.rooms || formData.rooms < 1)) {
      newErrors.rooms = "Number of rooms/outlets is required"
    }

    // If rooms specified but no average size and not using coordinates
    if (formData.rooms && formData.rooms > 0 && !formData.useCoordinates && 
        (!formData.averageRoomSize || formData.averageRoomSize <= 0)) {
      newErrors.averageRoomSize = "Average room size is required, or select 'Get Coordinates'"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof PropertyDetails, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity) 
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting property details:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGetCoordinates = () => {
    // In a real implementation, this would open a map interface
    // For now, we'll simulate getting coordinates
    alert("Coordinate mapping feature coming soon! For now, please provide average room size.")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50 relative overflow-x-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 -right-4 w-32 h-32 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-purple-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center flex-1 min-w-0">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="h-9 w-9 p-0 hover:bg-blue-100 mr-3 flex-shrink-0"
                title="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-blue-600" />
              </Button>
              <Building className="mr-3 h-6 w-6 text-purple-600 flex-shrink-0" />
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                Property Details
              </h1>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-9 w-9 p-0 hover:bg-red-100 flex-shrink-0"
              title="Close and go to Dashboard"
            >
              <X className="h-5 w-5 text-red-600" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 pb-6 space-y-6 max-w-4xl mx-auto w-full">
          
          {/* Property Image Preview */}
          {imageUrl && (
            <Card className="border-2 border-purple-200">
              <CardContent className="p-4">
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Property"
                    className="w-full h-48 object-cover rounded-lg shadow-md"
                  />
                  {identifiedCategory && (
                    <Badge className="absolute top-3 left-3 bg-white/90 text-gray-800 shadow-md">
                      {identifiedCategory.name.toUpperCase()} ({Math.round(identifiedCategory.confidence * 100)}%)
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form */}
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-purple-600" />
                Property Information
              </CardTitle>
              <p className="text-sm text-gray-600">
                Provide detailed information about your property for AI-powered prospect analysis
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Basic Property Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  Location & Size
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Property Location *</Label>
                    <Input
                      id="location"
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., Victoria Island, Lagos"
                      className={errors.location ? "border-red-500" : ""}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-600">{errors.location}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertySize">Property Size (Square Meters) *</Label>
                    <Input
                      id="propertySize"
                      type="number"
                      min="1"
                      value={formData.propertySize || ""}
                      onChange={(e) => handleInputChange('propertySize', parseFloat(e.target.value) || null)}
                      placeholder="e.g., 500"
                      className={errors.propertySize ? "border-red-500" : ""}
                    />
                    {errors.propertySize && (
                      <p className="text-sm text-red-600">{errors.propertySize}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Total area of the property including all spaces
                    </p>
                  </div>
                </div>
              </div>

              {/* Building Structure */}
              {(identifiedCategory?.name === 'building' || identifiedCategory?.name === 'room') && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <Layers className="mr-2 h-4 w-4" />
                    Building Structure
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {identifiedCategory?.name === 'building' && (
                      <div className="space-y-2">
                        <Label htmlFor="stories">Number of Stories *</Label>
                        <Input
                          id="stories"
                          type="number"
                          min="1"
                          value={formData.stories || ""}
                          onChange={(e) => handleInputChange('stories', parseInt(e.target.value) || null)}
                          placeholder="e.g., 2"
                          className={errors.stories ? "border-red-500" : ""}
                        />
                        {errors.stories && (
                          <p className="text-sm text-red-600">{errors.stories}</p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="rooms">Number of Rooms/Outlets *</Label>
                      <Input
                        id="rooms"
                        type="number"
                        min="1"
                        value={formData.rooms || ""}
                        onChange={(e) => handleInputChange('rooms', parseInt(e.target.value) || null)}
                        placeholder="e.g., 4"
                        className={errors.rooms ? "border-red-500" : ""}
                      />
                      {errors.rooms && (
                        <p className="text-sm text-red-600">{errors.rooms}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Include bedrooms, bathrooms, living rooms, kitchens, etc.
                      </p>
                    </div>
                  </div>

                  {/* Room Size or Coordinates */}
                  {formData.rooms && formData.rooms > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="useCoordinates"
                          checked={formData.useCoordinates}
                          onCheckedChange={(checked) => handleInputChange('useCoordinates', !!checked)}
                        />
                        <Label htmlFor="useCoordinates" className="text-sm">
                          I'll provide coordinates instead of average room size
                        </Label>
                      </div>

                      {!formData.useCoordinates ? (
                        <div className="space-y-2">
                          <Label htmlFor="averageRoomSize">Average Room Size (Square Meters) *</Label>
                          <Input
                            id="averageRoomSize"
                            type="number"
                            min="1"
                            value={formData.averageRoomSize || ""}
                            onChange={(e) => handleInputChange('averageRoomSize', parseFloat(e.target.value) || null)}
                            placeholder="e.g., 25"
                            className={errors.averageRoomSize ? "border-red-500" : ""}
                          />
                          {errors.averageRoomSize && (
                            <p className="text-sm text-red-600">{errors.averageRoomSize}</p>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800 mb-2">
                            <Grid className="inline w-4 h-4 mr-1" />
                            Coordinate mapping will be available after basic details are submitted.
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleGetCoordinates}
                            className="border-blue-300 text-blue-700 hover:bg-blue-100"
                          >
                            Get Room Coordinates
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Property Usage */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <Home className="mr-2 h-4 w-4" />
                  Current Usage
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="currentUsage">What is the current usage of this property? *</Label>
                  <Select 
                    value={formData.currentUsage} 
                    onValueChange={(value) => handleInputChange('currentUsage', value)}
                  >
                    <SelectTrigger className={errors.currentUsage ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select current usage" />
                    </SelectTrigger>
                    <SelectContent>
                      {USAGE_OPTIONS.map(usage => (
                        <SelectItem key={usage} value={usage}>
                          {usage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.currentUsage && (
                    <p className="text-sm text-red-600">{errors.currentUsage}</p>
                  )}
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Available Amenities
                </h3>
                <p className="text-sm text-gray-600">
                  Select all amenities available at this property
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {AMENITIES_OPTIONS.map(amenity => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={() => handleAmenityToggle(amenity)}
                      />
                      <Label 
                        htmlFor={`amenity-${amenity}`} 
                        className="text-sm cursor-pointer"
                      >
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>

                {formData.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="text-sm font-medium text-gray-700">Selected:</span>
                    {formData.amenities.map(amenity => (
                      <Badge 
                        key={amenity}
                        variant="secondary"
                        className="bg-purple-100 text-purple-800"
                      >
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Notes */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Additional Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    placeholder="Any additional information that might help with the analysis..."
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    Include any special features, conditions, or context about the property
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* AI Analysis Preview */}
          <Alert className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <AlertDescription>
              <strong className="text-purple-800">Ready for AI Analysis!</strong>
              <br />
              <span className="text-purple-700">
                Our AI will analyze your property details and generate 5 investment prospects with:
              </span>
              <ul className="mt-2 text-sm text-purple-700 space-y-1">
                <li>• Current financial valuation</li>
                <li>• Investment opportunity analysis</li>
                <li>• Cost estimates and ROI projections</li>
                <li>• Business plan recommendations</li>
                <li>• Timeline and realization strategies</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        {/* Fixed bottom action area */}
        <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-sm border-t border-purple-200 p-4">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <Button 
              onClick={onBack}
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Image
            </Button>
            
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing Property...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Generate AI Prospects
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx global>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}
