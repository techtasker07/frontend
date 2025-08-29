"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Lightbulb, Plus, ArrowLeft, TrendingUp, X, Home } from "lucide-react"
import type { Category } from "@/lib/api"
import { formatCompactCurrency } from "@/lib/currency"

interface ProspectPreview {
  title: string
  description: string
  estimatedCost: number
  totalCost: number
  imageUrl?: string
  realizationTips?: string[]
}

interface ProspectData {
  id: number
  categoryId: string | number // Support both string (new UUID) and number (old integer) for backwards compatibility
  categoryName: string
  propertyTitle: string
  location: string
  estimatedWorth: number
  yearBuilt?: number
  prospect: ProspectPreview
}

interface ProspectPreviewPageProps {
  onBack: () => void
  onClose: () => void
  onRetakeImage: () => void
  onSelectProspect: (prospect: ProspectData) => void
  onViewDetails: (prospect: ProspectData) => void
  imageUrl: string
  allProspects: ProspectData[]
  selectedProspect: ProspectData | null
  categories: Category[]
}

export function ProspectPreviewPage({
  onBack,
  onClose,
  onRetakeImage,
  onSelectProspect,
  onViewDetails,
  imageUrl,
  allProspects,
  selectedProspect,
  categories,
}: ProspectPreviewPageProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | number | null>(null)

  // Group prospects by category
  const prospectsByCategory = useMemo(() => {
    const grouped = allProspects.reduce((acc, prospect) => {
      if (!acc[prospect.categoryId]) {
        acc[prospect.categoryId] = []
      }
      acc[prospect.categoryId].push(prospect)
      return acc
    }, {} as Record<string | number, ProspectData[]>)
    return grouped
  }, [allProspects])

  // Available categories (only those with prospects)
  const availableCategories = useMemo(() => {
    return categories.filter(cat => prospectsByCategory[cat.id]?.length > 0)
  }, [categories, prospectsByCategory])

  // Current tab category (defaults to selected prospect's category)
  const currentCategoryId = selectedCategoryId || selectedProspect?.categoryId || availableCategories[0]?.id
  const currentProspects = prospectsByCategory[currentCategoryId] || []

  const handleProspectClick = (prospect: ProspectData) => {
    onSelectProspect(prospect)
    onViewDetails(prospect)
  }

  const handleCategoryChange = (categoryId: string) => {
    // Try to parse as number for backwards compatibility, otherwise use as string
    const numericId = parseInt(categoryId)
    const finalId = isNaN(numericId) ? categoryId : numericId
    setSelectedCategoryId(finalId)
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
                onClick={onRetakeImage}
                className="h-9 w-9 p-0 hover:bg-blue-100 mr-3 flex-shrink-0"
                title="Retake Image"
              >
                <ArrowLeft className="h-5 w-5 text-blue-600" />
              </Button>
              <Camera className="mr-3 h-6 w-6 text-purple-600 flex-shrink-0" />
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                Smart Prospect Generated!
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
        <div className="flex-1 p-4 pb-6 space-y-6">
          {/* Property Image */}
          <div className="relative">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt="Property preview"
              className="w-full h-48 sm:h-64 object-cover rounded-lg shadow-lg"
            />
            <Badge className="absolute top-3 left-3 bg-white/90 text-gray-800 shadow-md">
              {selectedProspect?.categoryName || "Property"}
            </Badge>
            <div className="absolute top-3 right-3">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                <Lightbulb className="w-3 h-3 mr-1" />
                Smart Generation ({allProspects.length} Options)
              </Badge>
            </div>
          </div>

          {/* Category Tabs with Prospects */}
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Investment Prospects by Category</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs value={currentCategoryId?.toString()} onValueChange={handleCategoryChange}>
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-6 h-auto p-1 gap-1">
                  {availableCategories.map((category) => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id.toString()} 
                      className="text-xs sm:text-sm py-2 px-3 flex flex-col items-center gap-1 h-auto min-h-[3rem] data-[state=active]:bg-purple-100 w-full"
                    >
                      <span className="font-medium truncate max-w-full">{category.name}</span>
                      <Badge className="text-xs scale-90" variant="secondary">
                        {prospectsByCategory[category.id]?.length || 0}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {availableCategories.map((category) => (
                  <TabsContent key={category.id} value={category.id.toString()} className="space-y-3">
                    {prospectsByCategory[category.id]?.map((prospect) => (
                      <Button
                        key={prospect.id}
                        onClick={() => handleProspectClick(prospect)}
                        variant={selectedProspect?.id === prospect.id ? "default" : "outline"}
                        size="lg"
                        className={`w-full h-auto p-0 text-left transition-all duration-200 ${
                          selectedProspect?.id === prospect.id
                            ? "bg-purple-600 text-white border-purple-600"
                            : "border-purple-300 hover:bg-purple-100 hover:border-purple-400"
                        } overflow-hidden`}
                      >
                        <div className="flex w-full">
                          {/* Prospect Image */}
                          <div className="w-20 h-20 flex-shrink-0">
                            <img
                              src={prospect.prospect.imageUrl || '/placeholder.svg'}
                              alt={prospect.prospect.title}
                              className="w-full h-full object-cover rounded-l-lg"
                            />
                          </div>
                          {/* Content */}
                          <div className="flex-1 flex justify-between items-center p-4 min-w-0">
                            <div className="flex-1 min-w-0 mr-3">
                              <div className={`font-semibold text-base mb-1 ${
                                selectedProspect?.id === prospect.id ? "text-white" : "text-purple-800"
                              }`}>
                                {prospect.prospect.title}
                              </div>
                              <div className={`text-sm ${
                                selectedProspect?.id === prospect.id ? "text-purple-100" : "text-purple-600"
                              }`}>
                                Investment: {formatCompactCurrency(prospect.prospect.totalCost)}
                              </div>
                            </div>
                            <Badge 
                              variant={selectedProspect?.id === prospect.id ? "outline" : "secondary"} 
                              className={`flex-shrink-0 ${
                                selectedProspect?.id === prospect.id
                                  ? "border-white text-white"
                                  : "bg-purple-200 text-purple-800"
                              }`}
                            >
                              View Details
                            </Badge>
                          </div>
                        </div>
                      </Button>
                    )) || []}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Fixed bottom action area */}
        <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-sm border-t border-purple-200 p-4">
          <div className="flex gap-3">
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
            <Button 
              onClick={() => selectedProspect && onViewDetails(selectedProspect)} 
              disabled={!selectedProspect}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 py-3 text-base font-semibold"
            >
              <Plus className="mr-2 h-5 w-5" />
              View Selected Prospect
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
