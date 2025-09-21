"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Lightbulb, Building, DollarSign, Plus, X, Home, Camera, MapPin, Calendar } from "lucide-react"
import { formatCompactCurrency } from "@/lib/currency"
import type { SmartProspect, IdentifiedCategory } from "@/lib/smartProspectGenerator"

interface PropertyDetails {
  title: string
  location: string
  estimatedWorth: number
  yearBuilt?: number
}

interface SmartProspectDetailsPageProps {
  prospect: SmartProspect
  imageUrl: string
  identifiedCategory: IdentifiedCategory
  propertyDetails: PropertyDetails
  onBack: () => void
  onClose: () => void
  onAddProperty: () => void
  onRetakeImage: () => void
}

export function SmartProspectDetailsPage({
  prospect,
  imageUrl,
  identifiedCategory,
  propertyDetails,
  onBack,
  onClose,
  onAddProperty,
  onRetakeImage,
}: SmartProspectDetailsPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50 relative overflow-x-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 -right-4 w-32 h-32 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header - hidden on mobile */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-purple-200 hidden md:block">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center flex-1 min-w-0">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="h-9 w-9 p-0 hover:bg-blue-100 mr-3 flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5 text-blue-600" />
              </Button>
              <Lightbulb className="mr-3 h-6 w-6 text-yellow-500 flex-shrink-0" />
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                {prospect.title}
              </h1>
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
        </div>

        {/* Fixed close button for mobile */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="fixed top-4 right-4 z-30 h-9 w-9 p-0 hover:bg-red-100 bg-white/90 backdrop-blur-sm shadow-lg rounded-full border border-gray-200 md:hidden"
        >
          <X className="h-5 w-5 text-red-600" />
        </Button>

        {/* Content */}
        <div className="flex-1 p-4 pb-6 space-y-6">
          {/* Property Image */}
          <div className="relative">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt="Property preview"
              className="w-full h-40 sm:h-48 object-cover rounded-lg shadow-lg"
            />
            <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
              <Badge className="bg-white/90 text-gray-800 text-xs sm:text-sm shadow-md">
                {identifiedCategory.name.toUpperCase()}
              </Badge>
              <Badge className="bg-blue-500/90 text-white text-xs shadow-md">
                {Math.round(identifiedCategory.confidence * 100)}% confident
              </Badge>
            </div>
          </div>

          {/* Prospect Preview Image */}
          {prospect.imageUrl && (
            <div className="relative">
              <img
                src={prospect.imageUrl}
                alt={prospect.title}
                className="w-full h-32 sm:h-40 object-cover rounded-lg shadow-lg"
              />
              <Badge className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                <Lightbulb className="w-3 h-3 mr-1" />
                Smart Prospect
              </Badge>
            </div>
          )}

          {/* Prospect Title and Category */}
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
                  {prospect.title}
                </CardTitle>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {prospect.category}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Description */}
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Investment Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                {prospect.description}
              </p>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                Investment Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Development Cost</p>
                  <p className="text-xl sm:text-2xl font-semibold text-blue-600">
                    {formatCompactCurrency(prospect.estimatedCost)}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Investment</p>
                  <p className="text-xl sm:text-2xl font-semibold text-green-600">
                    {formatCompactCurrency(prospect.totalCost)}
                  </p>
                </div>
              </div>

              {/* Additional property info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Property Worth</p>
                  <p className="text-lg font-semibold text-purple-600">
                    {formatCompactCurrency(propertyDetails.estimatedWorth)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Implementation Tips */}
          {prospect.realizationTips && prospect.realizationTips.length > 0 && (
            <Card className="border-2 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5 text-yellow-600" />
                  Smart Implementation Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {prospect.realizationTips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm text-yellow-800 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Property Details */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Property Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600 flex items-center">
                  <Building className="w-4 h-4 mr-1" />
                  Property Title:
                </span>
                <span className="text-sm font-semibold text-gray-800 text-right flex-1 ml-2">
                  {propertyDetails.title}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-1" />
                  AI Category:
                </span>
                <Badge className="bg-purple-100 text-purple-800">
                  {identifiedCategory.name.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fixed bottom action area */}
        <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-sm border-t border-purple-200 p-4">
          <div className="flex gap-3">
            <Button 
              onClick={onBack}
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50 py-3"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={onAddProperty} 
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 py-3 text-base font-semibold"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add as Prospect Property
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
