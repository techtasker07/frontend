"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, AlertTriangle, DollarSign, MapPin, Calendar, Plus, X } from "lucide-react"
import type { Category } from "@/lib/api"
import { formatDisplayCurrency } from "@/lib/currency"

interface ProspectAnalysis {
  title: string
  location: string
  estimatedWorth: number
  yearBuilt?: number
  confidence: number
  sentiment: "Positive" | "Neutral" | "Negative"
  insights: string[]
  recommendations: string[]
  riskFactors: string[]
  estimatedROI: string
}

interface ProspectAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  onAddProperty: () => void
  imageUrl: string
  category: Category
  analysis: ProspectAnalysis
}

export function ProspectAnalysisModal({
  isOpen,
  onClose,
  onAddProperty,
  imageUrl,
  category,
  analysis,
}: ProspectAnalysisModalProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return "bg-green-100 text-green-800"
      case "Negative":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5 text-purple-600" />
            Smart Prospect Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Image */}
          <div className="relative">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt="Property analysis"
              className="w-full h-48 object-cover rounded-lg"
            />
            <Badge className="absolute top-2 left-2 bg-white/90 text-gray-800">{category.name}</Badge>
          </div>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{analysis.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{analysis.location}</span>
                </div>
                {analysis.yearBuilt && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Built in {analysis.yearBuilt}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold">{formatDisplayCurrency(analysis.estimatedWorth)}</span>
                </div>
                <Badge className={getSentimentColor(analysis.sentiment)}>{analysis.sentiment}</Badge>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Smart Confidence:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${analysis.confidence}%` }} />
                </div>
                <span className="text-sm font-medium">{analysis.confidence}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.insights.map((insight, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Strategic Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Risk Factors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Risk Factors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.riskFactors.map((risk, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{risk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* ROI Estimate */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Estimated ROI</p>
                <p className="text-2xl font-bold text-green-600">{analysis.estimatedROI}</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button onClick={onAddProperty} className="flex-1">
              <Plus className="mr-2 h-4 w-4" />
              Add as Prospect Property
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}