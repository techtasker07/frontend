"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
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
  Sparkles,
  Eye,
  Calendar,
  CreditCard
} from "lucide-react"

interface PropertyFormData {
  // Image data
  imageFile: File | null
  imageUrl: string | null
  uploadMethod: 'camera' | 'upload' | null
  
  // Core property info (Boss requirements in order)
  propertySize: number | null // square meters
  stories: number | null // for buildings
  rooms: number | null // rooms/outlets count
  averageRoomSize: number | null // if known
  useCoordinates: boolean // "click here" for coordinates
  amenities: string[] // selected amenities
  currentUsage: string // current property usage
  location: string // property location
}

interface BossRequiredPropertyFormProps {
  onSubmit: (data: PropertyFormData & { shouldGenerateProspects: boolean }) => void
  onBack?: () => void
  onClose: () => void
  fromLogin?: boolean
}

// Amenities as specified by boss
const AVAILABLE_AMENITIES = [
  "Swimming Pool",
  "Gym/Fitness Center",
  "24/7 Security",
  "Parking/Garage",
  "Garden/Landscaping", 
  "Generator/Backup Power",
  "Water Treatment System",
  "Air Conditioning",
  "Elevator/Lift",
  "Balcony/Terrace",
  "Built-in Kitchen",
  "Modern Bathroom",
  "Tiled Floors",
  "POP Ceiling",
  "CCTV Surveillance",
  "Gated Community",
  "Shopping Center Nearby",
  "School Nearby",
  "Hospital Nearby",
  "Public Transport"
]

// Current usage options
const USAGE_OPTIONS = [
  "Residential - Family Home",
  "Residential - Rental Income",
  "Commercial - Office Space", 
  "Commercial - Retail Store",
  "Commercial - Restaurant/Hotel",
  "Industrial - Warehouse",
  "Industrial - Manufacturing",
  "Mixed Use - Residential & Commercial", 
  "Agricultural - Farming",
  "Vacant - Development Ready",
  "Under Construction",
  "Abandoned/Vacant",
  "Other"
]

export function BossRequiredPropertyForm({ 
  onSubmit, 
  onBack, 
  onClose, 
  fromLogin = false 
}: BossRequiredPropertyFormProps) {
  
  const [formData, setFormData] = useState<PropertyFormData>({
    imageFile: null,
    imageUrl: null,
    uploadMethod: null,
    propertySize: null,
    stories: null,
    rooms: null,
    averageRoomSize: null,
    useCoordinates: false,
    amenities: [],
    currentUsage: "",
    location: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Step management
  const STEPS = [
    { id: 1, title: "Property Image", description: "Camera or Upload" },
    { id: 2, title: "Property Size", description: "Square Meters" },
    { id: 3, title: "Building Details", description: "Stories & Rooms" },
    { id: 4, title: "Room Specifications", description: "Size or Coordinates" },
    { id: 5, title: "Amenities", description: "Available Features" },
    { id: 6, title: "Usage & Location", description: "Current State" },
    { id: 7, title: "Review", description: "Final Check" }
  ]

  const updateFormData = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear errors when user updates field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  // Image handling functions
  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click()
    }
  }

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImageSelected = (event: React.ChangeEvent<HTMLInputElement>, method: 'camera' | 'upload') => {
    const file = event.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      updateFormData('imageFile', file)
      updateFormData('imageUrl', imageUrl)
      updateFormData('uploadMethod', method)
      setCurrentStep(2) // Auto-advance to next step
    }
  }

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = formData.amenities
    const updatedAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity]
    updateFormData('amenities', updatedAmenities)
  }

  // Step validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.imageFile) {
          newErrors.image = "Property image is required"
        }
        break
      case 2:
        if (!formData.propertySize || formData.propertySize <= 0) {
          newErrors.propertySize = "Property size in square meters is required"
        }
        break
      case 3:
        // Stories required for buildings with large space
        if (formData.propertySize && formData.propertySize > 100) {
          if (!formData.stories || formData.stories < 1) {
            newErrors.stories = "Number of stories required for large properties"
          }
        }
        if (!formData.rooms || formData.rooms < 1) {
          newErrors.rooms = "Number of rooms/outlets is required"
        }
        break
      case 4:
        if (formData.rooms && formData.rooms > 0 && !formData.useCoordinates) {
          if (!formData.averageRoomSize || formData.averageRoomSize <= 0) {
            newErrors.averageRoomSize = "Average room size required, or select coordinates option"
          }
        }
        break
      case 6:
        if (!formData.currentUsage) {
          newErrors.currentUsage = "Current usage is required"
        }
        if (!formData.location.trim()) {
          newErrors.location = "Property location is required"
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    // Validate all steps
    let hasErrors = false
    for (let i = 1; i <= 6; i++) {
      if (!validateStep(i)) {
        hasErrors = true
      }
    }

    if (hasErrors) {
      // Go to first step with errors
      for (let i = 1; i <= 6; i++) {
        if (!validateStep(i)) {
          setCurrentStep(i)
          break
        }
      }
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({ ...formData, shouldGenerateProspects: true })
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="mr-2 h-5 w-5 text-purple-600" />
                Property Image
              </CardTitle>
              <p className="text-sm text-gray-600">
                Take a photo or upload an image of your property
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.imageUrl ? (
                <div className="space-y-4">
                  <img 
                    src={formData.imageUrl} 
                    alt="Property" 
                    className="w-full h-48 object-cover rounded-lg border-2 border-green-200" 
                  />
                  <Badge className="bg-green-100 text-green-800">
                    Image captured via {formData.uploadMethod}
                  </Badge>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={handleCameraCapture}
                    variant="outline"
                    size="lg"
                    className="h-32 border-2 border-purple-300 hover:bg-purple-50 flex-col gap-3"
                  >
                    <Camera className="h-8 w-8 text-purple-600" />
                    <span className="font-medium">Take Photo</span>
                    <span className="text-xs text-gray-500">Use camera</span>
                  </Button>
                  
                  <Button 
                    onClick={handleFileUpload}
                    variant="outline"
                    size="lg"
                    className="h-32 border-2 border-blue-300 hover:bg-blue-50 flex-col gap-3"
                  >
                    <Upload className="h-8 w-8 text-blue-600" />
                    <span className="font-medium">Upload Image</span>
                    <span className="text-xs text-gray-500">From gallery</span>
                  </Button>
                </div>
              )}
              
              {errors.image && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  {errors.image}
                </p>
              )}

              {/* Hidden file inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleImageSelected(e, 'camera')}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelected(e, 'upload')}
                className="hidden"
              />
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Ruler className="mr-2 h-5 w-5 text-purple-600" />
                Property Size
              </CardTitle>
              <p className="text-sm text-gray-600">
                Note: This is for properties with large space area
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="propertySize">Property Size (Square Meters) *</Label>
                <Input
                  id="propertySize"
                  type="number"
                  min="1"
                  value={formData.propertySize || ""}
                  onChange={(e) => updateFormData('propertySize', parseFloat(e.target.value) || null)}
                  placeholder="e.g., 500"
                  className={`text-lg ${errors.propertySize ? "border-red-500" : ""}`}
                />
                {errors.propertySize && (
                  <p className="text-sm text-red-600">{errors.propertySize}</p>
                )}
                <p className="text-xs text-gray-500">
                  Enter the total area including all spaces and land
                </p>
              </div>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5 text-purple-600" />
                Building Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stories - only show if property size indicates building */}
              {formData.propertySize && formData.propertySize > 100 && (
                <div className="space-y-2">
                  <Label htmlFor="stories">Number of Stories *</Label>
                  <Input
                    id="stories"
                    type="number"
                    min="1"
                    value={formData.stories || ""}
                    onChange={(e) => updateFormData('stories', parseInt(e.target.value) || null)}
                    placeholder="e.g., 2"
                    className={errors.stories ? "border-red-500" : ""}
                  />
                  {errors.stories && (
                    <p className="text-sm text-red-600">{errors.stories}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Required for buildings with multiple levels
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="rooms">Number of Rooms/Outlets *</Label>
                <Input
                  id="rooms"
                  type="number"
                  min="1"
                  value={formData.rooms || ""}
                  onChange={(e) => updateFormData('rooms', parseInt(e.target.value) || null)}
                  placeholder="e.g., 4"
                  className={errors.rooms ? "border-red-500" : ""}
                />
                {errors.rooms && (
                  <p className="text-sm text-red-600">{errors.rooms}</p>
                )}
                <p className="text-xs text-gray-500">
                  For apartments or buildings with more than one room or outlet
                </p>
              </div>
            </CardContent>
          </Card>
        )

      case 4:
        return (
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DoorOpen className="mr-2 h-5 w-5 text-purple-600" />
                Room Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useCoordinates"
                  checked={formData.useCoordinates}
                  onCheckedChange={(checked) => updateFormData('useCoordinates', !!checked)}
                />
                <Label htmlFor="useCoordinates" className="cursor-pointer">
                  Click here to get room coordinates instead
                </Label>
              </div>

              {!formData.useCoordinates ? (
                <div className="space-y-2">
                  <Label htmlFor="averageRoomSize">Average Size of Each Room/Outlet (Square Meters) *</Label>
                  <Input
                    id="averageRoomSize"
                    type="number"
                    min="1"
                    value={formData.averageRoomSize || ""}
                    onChange={(e) => updateFormData('averageRoomSize', parseFloat(e.target.value) || null)}
                    placeholder="e.g., 25"
                    className={errors.averageRoomSize ? "border-red-500" : ""}
                  />
                  {errors.averageRoomSize && (
                    <p className="text-sm text-red-600">{errors.averageRoomSize}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    If you already know the average size of each room
                  </p>
                </div>
              ) : (
                <Alert className="border-blue-200 bg-blue-50">
                  <Grid className="h-4 w-4 text-blue-600" />
                  <AlertDescription>
                    <strong className="text-blue-800">Room Coordinate Mapping</strong>
                    <br />
                    <span className="text-blue-700">
                      This feature will be available after basic details are submitted. 
                      You'll be able to click on room locations to get precise coordinates.
                    </span>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )

      case 5:
        return (
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-purple-600" />
                Available Amenities
              </CardTitle>
              <p className="text-sm text-gray-600">
                Select from below the available amenities in the property
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                {AVAILABLE_AMENITIES.map(amenity => (
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
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-purple-800 mb-2">
                    Selected Amenities ({formData.amenities.length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {formData.amenities.map(amenity => (
                      <Badge 
                        key={amenity}
                        variant="secondary"
                        className="bg-purple-100 text-purple-800 text-xs"
                      >
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 6:
        return (
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-purple-600" />
                Current Usage & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentUsage">Current Usage of the Property *</Label>
                <Select 
                  value={formData.currentUsage} 
                  onValueChange={(value) => updateFormData('currentUsage', value)}
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

              <div className="space-y-2">
                <Label htmlFor="location">Property Location *</Label>
                <Input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder="e.g., Victoria Island, Lagos"
                  className={errors.location ? "border-red-500" : ""}
                />
                {errors.location && (
                  <p className="text-sm text-red-600">{errors.location}</p>
                )}
                <p className="text-xs text-gray-500">
                  Provide the specific location of your property
                </p>
              </div>
            </CardContent>
          </Card>
        )

      case 7:
        return (
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <Eye className="mr-2 h-5 w-5" />
                Review & Generate Prospects
              </CardTitle>
              <p className="text-sm text-green-700">
                Review your property details before generating AI prospects
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Property Image */}
              {formData.imageUrl && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Property Image</h4>
                  <img 
                    src={formData.imageUrl} 
                    alt="Property" 
                    className="w-full h-32 object-cover rounded-lg border" 
                  />
                </div>
              )}

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Property Details</h4>
                  <p>Size: {formData.propertySize} sq meters</p>
                  {formData.stories && <p>Stories: {formData.stories}</p>}
                  <p>Rooms/Outlets: {formData.rooms}</p>
                  {formData.averageRoomSize && <p>Avg Room Size: {formData.averageRoomSize} sq meters</p>}
                  {formData.useCoordinates && <p>Using coordinate mapping</p>}
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Usage & Location</h4>
                  <p>Usage: {formData.currentUsage}</p>
                  <p>Location: {formData.location}</p>
                  <p>Amenities: {formData.amenities.length} selected</p>
                </div>
              </div>

              {/* AI Preview */}
              <Alert className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <AlertDescription>
                  <strong className="text-purple-800">Ready for AI Analysis!</strong>
                  <br />
                  <span className="text-purple-700">
                    The AI will first provide the financial value of your property as-is, 
                    then generate 5 different investment prospects with detailed analysis.
                  </span>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50 relative">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-purple-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center flex-1 min-w-0">
            {onBack && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="h-9 w-9 p-0 hover:bg-blue-100 mr-3 flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5 text-blue-600" />
              </Button>
            )}
            <Building className="mr-3 h-6 w-6 text-purple-600 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                Property Analysis Form
              </h1>
              <p className="text-xs text-gray-600 truncate">
                Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.description}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-9 w-9 p-0 hover:bg-red-100 flex-shrink-0"
          >
            <X className="h-5 w-5 text-red-600" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 pb-6 max-w-4xl mx-auto">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-sm border-t border-purple-200 p-4">
        <div className="flex gap-3 max-w-4xl mx-auto">
          {currentStep > 1 && (
            <Button 
              onClick={handlePrevious}
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          )}

          <div className="flex-1" />

          {currentStep < STEPS.length ? (
            <Button 
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  See Prospects
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
