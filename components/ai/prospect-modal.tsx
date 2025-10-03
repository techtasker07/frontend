"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Camera, 
  Lightbulb, 
  Plus, 
  ArrowLeft, 
  TrendingUp, 
  X, 
  Home,
  CheckCircle,
  ArrowUp,
  ArrowDown
} from "lucide-react"
import type { SmartProspect, IdentifiedCategory } from "@/lib/smartProspectGenerator"
import { formatCompactCurrency } from "@/lib/currency"

interface ProspectModalProps {
  isOpen: boolean
  onClose: () => void
  onRetakeImage: () => void
  onSelectProspect: (prospect: SmartProspect) => void
  imageUrl: string
  prospects: SmartProspect[]
  identifiedCategory: IdentifiedCategory
  propertyDetails: {
    title: string
    location: string
    estimatedWorth: number
    yearBuilt?: number
  }
}

export function ProspectModal({
  isOpen,
  onClose,
  onRetakeImage,
  onSelectProspect,
  imageUrl,
  prospects,
  identifiedCategory,
  propertyDetails,
}: ProspectModalProps) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showCloseHint, setShowCloseHint] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Handle scroll to calculate progress and auto-close
  const handleScroll = () => {
    if (!modalRef.current || !contentRef.current) return

    const modal = modalRef.current
    const content = contentRef.current
    const scrollTop = modal.scrollTop
    const scrollHeight = content.scrollHeight - modal.clientHeight
    const progress = (scrollTop / scrollHeight) * 100

    setScrollProgress(progress)

    // Show close hint when scrolled 80% down
    if (progress >= 80 && !showCloseHint) {
      setShowCloseHint(true)
    }

    // Auto-close when scrolled 95% down
    if (progress >= 95) {
      onClose()
    }
  }

  // Reset scroll position when modal opens
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.scrollTo(0, 0)
      setScrollProgress(0)
      setShowCloseHint(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="flex items-start justify-center min-h-full p-4">
        <div className="w-full max-w-2xl bg-white rounded-t-xl shadow-2xl">
          {/* Modal Header */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-purple-200 rounded-t-xl">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center flex-1 min-w-0">
                <Camera className="mr-3 h-6 w-6 text-purple-600 flex-shrink-0" />
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                  Smart Prospects Generated!
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onRetakeImage}
                  className="h-9 w-9 p-0 hover:bg-blue-100 flex-shrink-0"
                  title="Retake Image"
                >
                  <ArrowLeft className="h-4 w-4 text-blue-600" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose}
                  className="h-9 w-9 p-0 hover:bg-red-100 flex-shrink-0"
                  title="Close"
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>

            {/* Scroll Progress Indicator */}
            <div className="h-1 bg-gray-200">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
          </div>

          {/* Scrollable Content */}
          <div 
            ref={modalRef}
            className="max-h-[80vh] overflow-y-auto overscroll-contain"
            onScroll={handleScroll}
          >
            <div ref={contentRef} className="p-6 space-y-6">
              {/* Property Image with Category Badge */}
              <div className="relative">
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt="Property preview"
                  className="w-full h-48 object-cover rounded-lg shadow-lg"
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
                    {propertyDetails.location && (
                      <p className="text-sm text-blue-600">{propertyDetails.location}</p>
                    )}
                    {propertyDetails.estimatedWorth > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-600">Estimated Worth:</span>
                        <Badge className="bg-blue-100 text-blue-800">
                          {formatCompactCurrency(propertyDetails.estimatedWorth)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Smart Prospects */}
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-purple-800 mb-2 flex items-center justify-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    ✨ Smart Investment Prospects
                  </h2>
                  <p className="text-sm text-purple-600">
                    Click any prospect below to view detailed analysis
                  </p>
                </div>
                
                <div className="space-y-3">
                  {prospects.map((prospect, index) => (
                    <Button
                      key={prospect.id}
                      onClick={() => onSelectProspect(prospect)}
                      variant="outline"
                      size="lg"
                      className="w-full h-auto p-0 text-left border-purple-300 hover:bg-purple-100 hover:border-purple-400 transition-all duration-200 overflow-hidden group"
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
                            <div className="font-semibold text-base mb-1 text-purple-800 group-hover:text-purple-900">
                              {prospect.title}
                            </div>
                            <div className="text-sm text-purple-600 mb-2">
                              {prospect.description.substring(0, 80)}...
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-purple-600">Investment:</span>
                              <Badge className="bg-purple-200 text-purple-800">
                                {formatCompactCurrency(prospect.totalCost)}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              View Details
                            </Badge>
                            {prospect.estimatedCost && (
                              <span className="text-xs text-purple-600">
                                Initial: {formatCompactCurrency(prospect.estimatedCost)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Realization Tips */}
              {prospects.length > 0 && prospects[0].realizationTips && (
                <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-green-800 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      💡 Smart Tips for Success
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {prospects[0].realizationTips?.slice(0, 3).map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-green-700">
                          <CheckCircle className="w-3 h-3 mt-0.5 text-green-600 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Scroll Hint */}
              {showCloseHint && (
                <div className="text-center py-6">
                  <div className="animate-bounce">
                    <ArrowDown className="w-6 h-6 mx-auto text-purple-600 mb-2" />
                  </div>
                  <p className="text-sm text-purple-600 font-medium">
                    Keep scrolling to close
                  </p>
                </div>
              )}

              {/* Action Buttons at Bottom */}
              <div className="flex gap-3 pt-6 border-t border-purple-200">
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

              {/* Extra spacing for scroll-to-close */}
              <div className="h-32 flex items-center justify-center">
                <div className="text-center text-purple-400">
                  <ArrowUp className="w-4 h-4 mx-auto mb-1 animate-pulse" />
                  <p className="text-xs">Scroll up to browse more</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
