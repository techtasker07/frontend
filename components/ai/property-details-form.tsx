"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Ruler, Building, DoorOpen, Home, Eye } from "lucide-react"
import type { SmartProspect, IdentifiedCategory } from "@/lib/smartProspectGenerator"

interface PropertyDetails {
  size: string
  stories: string
  rooms: string
  averageRoomSize: string
  amenities: string[]
  usage: string
  location: string
}

interface PropertyDetailsFormProps {
  imageUrl: string
  identifiedCategory: IdentifiedCategory
  propertyDetails: any
  prospects: SmartProspect[]
  onSeeProspects: (details: PropertyDetails) => void
  onBack: () => void
}

const AMENITIES_OPTIONS = [
  "Parking Space",
  "Garden",
  "Swimming Pool",
  "Gym/Fitness Center",
  "Security System",
  "Elevator",
  "Air Conditioning",
  "Heating System",
  "Internet/WiFi",
  "Water Supply",
  "Electricity Backup",
  "Fire Safety",
  "Playground",
  "Laundry Facilities",
  "Storage Room"
]

const USAGE_OPTIONS = [
  "Residential",
  "Commercial",
  "Industrial",
  "Mixed Use",
  "Vacant Land",
  "Agricultural",
  "Institutional"
]

export function PropertyDetailsForm({
  imageUrl,
  identifiedCategory,
  propertyDetails,
  prospects,
  onSeeProspects,
  onBack
}: PropertyDetailsFormProps) {
  const [formData, setFormData] = useState<PropertyDetails>({
    size: "",
    stories: "",
    rooms: "",
    averageRoomSize: "",
    amenities: [],
    usage: "",
    location: ""
  })

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSeeProspects(formData)
  }

  const isFormValid = formData.size && formData.location && formData.usage

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
                title="Back to capture"
              >
                <MapPin className="h-5 w-5 text-blue-600" />
              </Button>
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                Property Details
              </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 pb-6 space-y-6 max-w-2xl mx-auto w-full">
          {/* Image Preview */}
          <Card className="border-2 border-purple-200">
            <CardContent className="p-4">
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="Property preview"
                  className="w-full h-48 object-cover rounded-lg shadow-lg"
                />
                <div className="absolute bottom-3 left-3">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {identifiedCategory.name.toUpperCase()}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {prospects.length} Prospects Ready
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Property Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-purple-600" />
                  Property Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="size" className="flex items-center gap-2">
                      <Ruler className="h-4 w-4" />
                      Size (sq meters) *
                    </Label>
                    <Input
                      id="size"
                      type="number"
                      placeholder="e.g. 120"
                      value={formData.size}
                      onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="stories" className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Number of Stories
                    </Label>
                    <Input
                      id="stories"
                      type="number"
                      placeholder="e.g. 2"
                      value={formData.stories}
                      onChange={(e) => setFormData(prev => ({ ...prev, stories: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="rooms" className="flex items-center gap-2">
                      <DoorOpen className="h-4 w-4" />
                      Number of Rooms/Outlets
                    </Label>
                    <Input
                      id="rooms"
                      type="number"
                      placeholder="e.g. 4"
                      value={formData.rooms}
                      onChange={(e) => setFormData(prev => ({ ...prev, rooms: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="averageRoomSize" className="flex items-center gap-2">
                      <Ruler className="h-4 w-4" />
                      Average Room Size (sq meters)
                    </Label>
                    <Input
                      id="averageRoomSize"
                      type="number"
                      placeholder="e.g. 25"
                      value={formData.averageRoomSize}
                      onChange={(e) => setFormData(prev => ({ ...prev, averageRoomSize: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Or <button type="button" className="text-purple-600 underline">click here</button> to get coordinates
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="usage">Current Usage *</Label>
                  <Select value={formData.usage} onValueChange={(value) => setFormData(prev => ({ ...prev, usage: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property usage" />
                    </SelectTrigger>
                    <SelectContent>
                      {USAGE_OPTIONS.map((usage) => (
                        <SelectItem key={usage} value={usage}>
                          {usage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location *
                  </Label>
                  <Textarea
                    id="location"
                    placeholder="Enter property location/address"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Available Amenities</CardTitle>
                <p className="text-sm text-gray-600">Select all that apply</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {AMENITIES_OPTIONS.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                      />
                      <Label htmlFor={amenity} className="text-sm">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-purple-200 p-4 -mx-4">
              <Button
                type="submit"
                disabled={!isFormValid}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-lg font-semibold"
              >
                <Eye className="mr-2 h-5 w-5" />
                See Prospects
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}