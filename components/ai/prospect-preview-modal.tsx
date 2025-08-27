"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Lightbulb, Plus, X, TrendingUp, DollarSign, Building, Zap, ArrowLeft } from "lucide-react"
import type { Category } from "@/lib/api"
import { formatCompactCurrency } from "@/lib/currency"

interface ProspectPreview {
  title: string
  description: string
  estimatedCost: number
  totalCost: number
  imageUrl?: string
}

interface ProspectData {
  id: number
  categoryId: number
  categoryName: string
  propertyTitle: string
  location: string
  estimatedWorth: number
  yearBuilt?: number
  prospect: ProspectPreview
}

interface ProspectPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onBack?: () => void
  onAddProperty: () => void
  imageUrl: string
  allProspects: ProspectData[]
  selectedProspect: ProspectData | null
  onSelectProspect: (prospect: ProspectData) => void
  categories: Category[]
}

export function ProspectPreviewModal({
  isOpen,
  onClose,
  onBack,
  onAddProperty,
  imageUrl,
  allProspects,
  selectedProspect,
  onSelectProspect,
  categories,
}: ProspectPreviewModalProps) {
  const [showProspectDetails, setShowProspectDetails] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

  // Group prospects by category
  const prospectsByCategory = useMemo(() => {
    const grouped = allProspects.reduce((acc, prospect) => {
      if (!acc[prospect.categoryId]) {
        acc[prospect.categoryId] = []
      }
      acc[prospect.categoryId].push(prospect)
      return acc
    }, {} as Record<number, ProspectData[]>)
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
    setShowProspectDetails(true)
  }

  const handleBackToPreview = () => {
    setShowProspectDetails(false)
  }

  const handleCategoryChange = (categoryId: string) => {
    const numericId = parseInt(categoryId)
    setSelectedCategoryId(numericId)
    // Don't auto-select any prospect when changing categories
    // Let user explicitly choose
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[calc(100vw-1rem)] sm:max-w-2xl h-[calc(100vh-2rem)] sm:h-[90vh] max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-hidden border-0 bg-gradient-to-br from-white via-purple-50 to-pink-50 p-3 sm:p-6 rounded-lg mx-2 sm:mx-auto">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute top-0 -left-4 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 -right-4 w-32 h-32 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {!showProspectDetails ? (
            // Preview Mode
            <>
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="flex items-center justify-between text-lg sm:text-xl font-bold">
                  <div className="flex items-center">
                    {onBack && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={onBack}
                        className="h-8 w-8 p-0 hover:bg-blue-100 mr-2"
                      >
                        <ArrowLeft className="h-4 w-4 text-blue-600" />
                      </Button>
                    )}
                    <Camera className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Smart Prospect Generated!
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onClose}
                    className="h-8 w-8 p-0 hover:bg-red-100"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </Button>
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto space-y-4 mt-4 pr-2 pb-4">
                {/* Property Image */}
                <div className="relative">
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt="Property preview"
                    className="w-full h-48 object-cover rounded-lg shadow-lg"
                  />
                  <Badge className="absolute top-3 left-3 bg-white/90 text-gray-800 shadow-md">
                    {selectedProspect?.categoryName || "Property"}
                  </Badge>
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                      <Lightbulb className="w-3 h-3 mr-1" />
                      Smart Generated ({allProspects.length} Options)
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
                      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mb-6 h-auto p-1">
                        {availableCategories.map((category) => (
                          <TabsTrigger 
                            key={category.id} 
                            value={category.id.toString()} 
                            className="text-xs py-2 px-3 flex flex-col items-center gap-1 h-auto min-h-[3rem] data-[state=active]:bg-purple-100"
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
                                <div className="w-16 h-16 flex-shrink-0">
                                  <img
                                    src={prospect.prospect.imageUrl || '/placeholder.svg'}
                                    alt={prospect.prospect.title}
                                    className="w-full h-full object-cover rounded-l-lg"
                                  />
                                </div>
                                {/* Content */}
                                <div className="flex-1 flex justify-between items-center p-3 min-w-0">
                                  <div className="flex-1 min-w-0 mr-2">
                                    <div className={`font-semibold text-sm mb-1 ${
                                      selectedProspect?.id === prospect.id ? "text-white" : "text-purple-800"
                                    }`}>
                                      {prospect.prospect.title}
                                    </div>
                                    <div className={`text-xs ${
                                      selectedProspect?.id === prospect.id ? "text-purple-100" : "text-purple-600"
                                    }`}>
                                      Investment: {formatCompactCurrency(prospect.prospect.totalCost)}
                                    </div>
                                  </div>
                                  <Badge 
                                    variant={selectedProspect?.id === prospect.id ? "outline" : "secondary"} 
                                    className={`text-xs flex-shrink-0 ${
                                      selectedProspect?.id === prospect.id
                                        ? "border-white text-white"
                                        : "bg-purple-200 text-purple-800"
                                    }`}
                                  >
                                    {selectedProspect?.id === prospect.id ? "Selected" : "View Details"}
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

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={onAddProperty} 
                    disabled={!selectedProspect}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 py-3 text-base font-semibold"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Selected Prospect
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="border-purple-200 text-purple-600 hover:bg-purple-50 py-3"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Close
                  </Button>
                </div>
              </div>
            </>
          ) : (
            // Prospect Details Mode
            <>
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="flex items-center justify-between text-lg sm:text-xl font-bold">
                  <div className="flex items-center">
                    <Lightbulb className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                    <span className="truncate">{selectedProspect?.prospect.title}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onClose}
                    className="h-8 w-8 p-0 hover:bg-red-100 flex-shrink-0"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </Button>
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto space-y-4 mt-4 pr-2 pb-4">
                {/* Property Image */}
                <div className="relative">
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt="Property preview"
                    className="w-full h-32 object-cover rounded-lg shadow-lg"
                  />
                  <Badge className="absolute top-2 left-2 bg-white/90 text-gray-800 text-xs">
                    {selectedProspect?.categoryName}
                  </Badge>
                </div>

                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Building className="mr-2 h-5 w-5" />
                      Project Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{selectedProspect?.prospect.description}</p>
                  </CardContent>
                </Card>

                {/* Cost Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                      Investment Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Development Cost</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {selectedProspect ? formatCompactCurrency(selectedProspect.prospect.estimatedCost) : 'N/A'}
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Investment</p>
                        <p className="text-lg font-semibold text-green-600">
                          {selectedProspect ? formatCompactCurrency(selectedProspect.prospect.totalCost) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleBackToPreview}
                    variant="outline"
                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    ← Back
                  </Button>
                  <Button 
                    onClick={onAddProperty} 
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add as Prospect Property
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Custom CSS for animations and mobile fixes */}
        <style jsx global>{`
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          
          /* Mobile-specific modal fixes */
          @media (max-width: 640px) {
            [data-radix-dialog-overlay] {
              padding: 0.5rem !important;
            }
            
            [data-radix-dialog-content] {
              width: calc(100vw - 1rem) !important;
              max-width: calc(100vw - 1rem) !important;
              height: calc(100vh - 2rem) !important;
              max-height: calc(100vh - 2rem) !important;
              margin: 0.5rem !important;
              border-radius: 0.75rem !important;
              box-sizing: border-box;
              overflow: hidden !important;
            }
            
            /* Ensure scroll container works properly */
            [data-radix-dialog-content] .overflow-y-auto {
              -webkit-overflow-scrolling: touch;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  )
}
