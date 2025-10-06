"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  X, 
  MapPin, 
  Home, 
  Calendar,
  Ruler,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"

interface PropertyDetailsFormProps {
  isOpen: boolean
  onClose: () => void
  imageData: string
  visionAnalysis?: any
  onSubmit: (details: PropertyDetails) => void
}

interface PropertyDetails {
  address: string
  propertyType: string
  squareMeters: string
  No_of_rooms: string
  bathrooms: string
  currentUse: string
  ownershipStatus: string
  budget: string
  timeline: string
  additionalInfo: string
  location: {
    city: string
    state: string
    zipCode: string
  }
}

// Type alias to ensure compatibility with PropertyFormData
type PropertyFormData = PropertyDetails

export function PropertyDetailsForm({ 
  isOpen, 
  onClose, 
  imageData, 
  visionAnalysis,
  onSubmit 
}: PropertyDetailsFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<PropertyDetails>({
    address: "",
    propertyType: visionAnalysis?.propertyType || "",
    squareMeters: "",
    No_of_rooms: "",
    bathrooms: "",
    currentUse: "",
    ownershipStatus: "",
    budget: "",
    timeline: "",
    additionalInfo: "",
    location: {
      city: "",
      state: "",
      zipCode: ""
    }
  })

  const handleInputChange = (field: keyof Omit<PropertyDetails, 'location'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLocationChange = (field: keyof PropertyDetails['location'], value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Basic validation
      if (!formData.address || !formData.propertyType) {
        toast.error("Please fill in the required fields")
        return
      }

      toast.success("Property details saved! Generating prospects...")
      onSubmit(formData)
      
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("Failed to save property details")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={() => {}}>
      <DrawerContent className="max-h-[85vh] bg-white">
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader className="text-center pb-2">
            <DrawerTitle className="flex items-center justify-center gap-2 text-xl font-semibold">
              <Home className="w-5 h-5 text-blue-600" />
              Property Details
            </DrawerTitle>
            <DrawerDescription>
              Add details about your property to get better AI-powered suggestions
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-6 max-h-[60vh] overflow-y-auto">
            {/* Captured/Uploaded Image Display */}
            {imageData && (
              <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Property Image</span>
                  </div>
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={imageData}
                      alt="Property"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Basic Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Property Address *
                  </Label>
                  <Input
                    id="address"
                    placeholder="123 Main St, City, State, ZIP"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="propertyType" className="text-sm font-medium">
                      Property Type *
                    </Label>
                    <Select 
                      value={formData.propertyType}
                      onValueChange={(value) => handleInputChange('propertyType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="building">Building</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="space">Space</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentUse" className="text-sm font-medium">
                      Current Use
                    </Label>
                    <Input
                      id="currentUse"
                      placeholder="e.g., Residential"
                      value={formData.currentUse}
                      onChange={(e) => handleInputChange('currentUse', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Property Specifications */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Property Specifications
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="squareMeters" className="text-sm font-medium">
                    Property Size (Square Meters)
                  </Label>
                  <Input
                    id="squareMeters"
                    placeholder="e.g., 185"
                    value={formData.squareMeters}
                    onChange={(e) => handleInputChange('squareMeters', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    To get an accurate measurement of space, you can use AI tools like{' '}
                    <a 
                      href="https://iscanner.com/web/"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                    >
                      IScanner
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>

                {/* Conditional rooms/Bathrooms - only show for Building or Apartment */}
                {(formData.propertyType === 'building' || formData.propertyType === 'apartment') && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="No_of_rooms" className="text-sm font-medium">
                        Bedrooms
                      </Label>
                      <Input
                        id="No_of_rooms"
                        placeholder="e.g., 3"
                        value={formData.No_of_rooms}
                        onChange={(e) => handleInputChange('No_of_rooms', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bathrooms" className="text-sm font-medium">
                        Bathrooms
                      </Label>
                      <Input
                        id="bathrooms"
                        placeholder="e.g., 2.5"
                        value={formData.bathrooms}
                        onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Investment Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Investment Details
                </h3>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-sm font-medium">
                      Investment Budget
                    </Label>
                    <Select 
                      value={formData.budget}
                      onValueChange={(value) => handleInputChange('budget', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-5m">Under ₦5,000,000</SelectItem>
                        <SelectItem value="5m-20m">₦5,000,000 - ₦50,000,000</SelectItem>
                        <SelectItem value="20m-50m">₦50,000,000 - ₦100,000,000</SelectItem>
                        <SelectItem value="50m-100m">₦100,000,000 - ₦500,000,000</SelectItem>
                        <SelectItem value="100m-250m">₦500,000,000 - ₦1,000,000,000</SelectItem>
                        <SelectItem value="over-250m">Over ₦1,000,000,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timeline" className="text-sm font-medium">
                      Timeline
                    </Label>
                    <Select 
                      value={formData.timeline}
                      onValueChange={(value) => handleInputChange('timeline', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate (0-3 months)</SelectItem>
                        <SelectItem value="short-term">Short-term (3-6 months)</SelectItem>
                        <SelectItem value="medium-term">Medium-term (6-12 months)</SelectItem>
                        <SelectItem value="long-term">Long-term (1+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-center gap-2 w-full text-sm text-blue-600 hover:text-blue-800 transition-colors py-2"
              >
                Advanced Options
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Advanced Options */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="ownershipStatus" className="text-sm font-medium">
                        Ownership Status
                      </Label>
                      <Select 
                        value={formData.ownershipStatus}
                        onValueChange={(value) => handleInputChange('ownershipStatus', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="investor">Real Estate Investor</SelectItem>
                          <SelectItem value="agent">Real Estate Agent</SelectItem>
                          <SelectItem value="developer">Developer</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additionalInfo" className="text-sm font-medium">
                        Additional Information
                      </Label>
                      <Textarea
                        id="additionalInfo"
                        placeholder="Any additional details about the property, constraints, or special considerations..."
                        value={formData.additionalInfo}
                        onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Generate Prospects
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
