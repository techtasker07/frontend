"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Lightbulb, Plus, X, TrendingUp, DollarSign, Building, Zap } from "lucide-react"
import type { Category } from "@/lib/api"
import { formatCompactCurrency } from "@/lib/currency"

interface ProspectPreview {
  title: string
  description: string
  estimatedCost: number
  totalCost: number
}

interface ProspectPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onAddProperty: () => void
  imageUrl: string
  category: Category
  prospect: ProspectPreview
}

export function ProspectPreviewModal({
  isOpen,
  onClose,
  onAddProperty,
  imageUrl,
  category,
  prospect,
}: ProspectPreviewModalProps) {
  const [showProspectDetails, setShowProspectDetails] = useState(false)



  const handleProspectClick = () => {
    setShowProspectDetails(true)
  }

  const handleBackToPreview = () => {
    setShowProspectDetails(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 bg-gradient-to-br from-white via-purple-50 to-pink-50">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute top-0 -left-4 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 -right-4 w-32 h-32 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10">
          {!showProspectDetails ? (
            // Preview Mode
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center text-xl font-bold">
                  <Camera className="mr-3 h-6 w-6 text-purple-600" />
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    AI Prospect Generated!
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Property Image */}
                <div className="relative">
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt="Property preview"
                    className="w-full h-48 object-cover rounded-lg shadow-lg"
                  />
                  <Badge className="absolute top-3 left-3 bg-white/90 text-gray-800 shadow-md">
                    {category.name}
                  </Badge>
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                      <Lightbulb className="w-3 h-3 mr-1" />
                      AI Generated
                    </Badge>
                  </div>
                </div>

                {/* Prospect Button */}
                <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Investment Prospect</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      onClick={handleProspectClick}
                      variant="outline"
                      size="lg"
                      className="w-full justify-between h-auto p-4 text-left border-purple-300 hover:bg-purple-100 hover:border-purple-400 transition-all duration-200"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base text-purple-800 mb-1">{prospect.title}</div>
                        <div className="text-sm text-purple-600">
                          Investment: {formatCompactCurrency(prospect.totalCost)}
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-3 bg-purple-200 text-purple-800">
                        View Details
                      </Badge>
                    </Button>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={onAddProperty} 
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 py-3 text-base font-semibold"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add as Prospect Property
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
              <DialogHeader>
                <DialogTitle className="flex items-center text-xl font-bold">
                  <Lightbulb className="mr-3 h-6 w-6 text-yellow-500" />
                  {prospect.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Property Image */}
                <div className="relative">
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt="Property preview"
                    className="w-full h-32 object-cover rounded-lg shadow-lg"
                  />
                  <Badge className="absolute top-2 left-2 bg-white/90 text-gray-800 text-xs">
                    {category.name}
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
                    <p className="text-muted-foreground leading-relaxed">{prospect.description}</p>
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
                          {formatCompactCurrency(prospect.estimatedCost)}
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Investment</p>
                        <p className="text-lg font-semibold text-green-600">
                          {formatCompactCurrency(prospect.totalCost)}
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

        {/* Custom CSS for animations */}
        <style jsx global>{`
          .animation-delay-2000 {
            animation-delay: 2s;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  )
}
