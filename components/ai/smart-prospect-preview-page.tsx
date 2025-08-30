"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, X, Home, ArrowLeft, Lightbulb, CheckCircle } from "lucide-react"
import { formatCompactCurrency } from "@/lib/currency"
import type { SmartProspect, IdentifiedCategory } from "@/lib/smartProspectGenerator"

interface SmartProspectPreviewPageProps {
  imageUrl: string
  prospects: SmartProspect[]
  identifiedCategory: IdentifiedCategory
  propertyDetails: {
    title: string
    location: string
    estimatedWorth: number
    yearBuilt?: number
  }
  onClose: () => void
  onRetakeImage: () => void
  onSelectProspect: (prospect: SmartProspect) => void
}

export function SmartProspectPreviewPage({
  imageUrl,
  prospects,
  identifiedCategory,
  propertyDetails,
  onClose,
  onRetakeImage,
  onSelectProspect,
}: SmartProspectPreviewPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50 relative overflow-x-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 -right-4 w-32 h-32 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header - Hidden on mobile */}
        <div className="hidden md:block sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-purple-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center flex-1 min-w-0">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onRetakeImage}
                className="h-9 w-9 p-0 hover:bg-blue-100 mr-3 flex-shrink-0"
                title="Retake Image"
              >
                <ArrowLeft className="h-5 w-5 text-blue-600" />
              </Button>
              <Camera className="mr-3 h-6 w-6 text-purple-600 flex-shrink-0" />
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                Smart Prospects Generated!
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

        {/* Mobile Navigation - Top corners */}
        <div className="md:hidden fixed top-4 left-4 right-4 z-30 flex justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRetakeImage}
            className="h-10 w-10 p-0 bg-white/90 hover:bg-blue-100 rounded-full shadow-lg"
            title="Retake Image"
          >
            <ArrowLeft className="h-5 w-5 text-blue-600" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-10 w-10 p-0 bg-white/90 hover:bg-red-100 rounded-full shadow-lg"
            title="Close and go to Dashboard"
          >
            <X className="h-5 w-5 text-red-600" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 pb-6 space-y-6">
          {/* Property Image with Category Badge */}
          <div className="relative">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt="Property preview"
              className="w-full h-48 sm:h-64 object-cover rounded-lg shadow-lg"
            />
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-green-500 text-white border-0 shadow-lg flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                {identifiedCategory.name.toUpperCase()}
              </Badge>
            </div>
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                <Lightbulb className="w-3 h-3 mr-1" />
                {prospects.length} Smart Prospects
              </Badge>
            </div>
          </div>

          {/* Property Information */}
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-blue-800">{propertyDetails.title}</h3>
              </div>
            </CardContent>
          </Card>

          {/* Smart Prospects Buttons */}
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-purple-800 mb-2">
                ✨ Smart Investment Prospects
              </h2>
              <p className="text-sm text-purple-600">
                Click any prospect below to view detailed analysis
              </p>
            </div>
            
            <div className="space-y-3">
              {prospects.map((prospect) => (
                <Button
                  key={prospect.id}
                  onClick={() => onSelectProspect(prospect)}
                  variant="outline"
                  size="lg"
                  className="w-full h-auto p-0 text-left border-purple-300 hover:bg-purple-100 hover:border-purple-400 transition-all duration-200 overflow-hidden"
                >
                  <div className="flex w-full">
                    {/* Prospect Image */}
                    <div className="w-20 h-20 flex-shrink-0">
                      <img
                        src={prospect.imageUrl || '/placeholder.svg'}
                        alt={prospect.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Content */}
                    <div className="flex-1 flex justify-between items-center p-4 min-w-0">
                      <div className="flex-1 min-w-0 mr-3">
                        <div className="font-semibold text-base mb-1 text-purple-800">
                          {prospect.title}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-purple-600">
                          Investment: {formatCompactCurrency(prospect.totalCost)}
                          <Badge className="bg-purple-200 text-purple-800 flex-shrink-0">
                            View Details
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed bottom action area */}
        <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-sm border-t border-purple-200 p-4">
          <div className="flex gap-3 max-w-2xl mx-auto">
            <Button 
              onClick={onRetakeImage}
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50 py-3"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retake Image
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="border-gray-300 text-gray-600 hover:bg-gray-50 py-3"
            >
              <Home className="mr-2 h-4 w-4" />
              Dashboard
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
