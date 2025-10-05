"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WelcomeBackPage } from "@/components/ai/welcome-back-page"
import { AIProspectFlowController } from "@/components/ai/ai-prospect-flow-controller"
import { PropertyProspectsResults } from "@/components/ai/property-prospects-results"
import type { ProspectGenerationResult } from "@/lib/vertex-ai-service"

// Mock data for testing
const mockProspectResults: ProspectGenerationResult = {
  prospects: [
    {
      id: "test-1",
      title: "Short-Term Rental Conversion",
      description: "Transform this property into a high-yield vacation rental. The location and layout make it ideal for tourists and business travelers seeking a comfortable stay.",
      category: "residential" as const,
      feasibilityScore: 88,
      estimatedRevenue: {
        min: 45000,
        max: 75000,
        timeframe: "annually"
      },
      estimatedCost: {
        min: 15000,
        max: 25000,
        breakdown: ["Furnishing: $8-12K", "Marketing setup: $2-3K", "Permits & licenses: $1-2K", "Professional photography: $1-2K", "Initial supplies: $3-6K"]
      },
      timeline: {
        planning: "2-3 weeks",
        execution: "4-6 weeks",
        total: "1.5-2 months"
      },
      requirements: ["Property management system", "Quality furnishing", "Local permits", "Insurance coverage", "Cleaning service"],
      benefits: ["High rental yield", "Flexible income", "Property appreciation", "Tax advantages", "Market demand"],
      risks: ["Market volatility", "Seasonal fluctuations", "Maintenance costs", "Regulatory changes", "Competition"],
      nextSteps: ["Research local regulations", "Analyze competition", "Get permits", "Design interior", "Set up booking channels"],
      marketDemand: "high" as const,
      complexity: "moderate" as const,
      tags: ["airbnb", "vacation rental", "hospitality", "tourism"]
    },
    {
      id: "test-2", 
      title: "Home Office & Co-working Space",
      description: "Convert unused areas into a professional home office or small co-working space. With remote work trends, there's growing demand for well-designed work environments.",
      category: "commercial" as const,
      feasibilityScore: 75,
      estimatedRevenue: {
        min: 18000,
        max: 36000,
        timeframe: "annually"
      },
      estimatedCost: {
        min: 8000,
        max: 18000,
        breakdown: ["Office furniture: $4-8K", "Tech infrastructure: $2-4K", "Renovation: $2-6K"]
      },
      timeline: {
        planning: "1-2 weeks",
        execution: "3-4 weeks", 
        total: "1-1.5 months"
      },
      requirements: ["High-speed internet", "Professional lighting", "Sound insulation", "Ergonomic furniture", "Meeting space"],
      benefits: ["Steady income", "Low maintenance", "Professional network", "Flexible hours", "Growing market"],
      risks: ["Market saturation", "Technology changes", "Economic downturn", "Competition from large operators"],
      nextSteps: ["Assess space potential", "Plan layout design", "Upgrade internet", "Source furniture", "Market to professionals"],
      marketDemand: "medium" as const,
      complexity: "simple" as const,
      tags: ["coworking", "office", "remote work", "productivity"]
    }
  ],
  summary: {
    totalProspects: 2,
    topRecommendation: {
      id: "test-1",
      title: "Short-Term Rental Conversion",
      description: "Transform this property into a high-yield vacation rental.",
      category: "residential" as const,
      feasibilityScore: 88,
      estimatedRevenue: { min: 45000, max: 75000, timeframe: "annually" },
      estimatedCost: { min: 15000, max: 25000, breakdown: ["Furnishing: $8-12K"] },
      timeline: { planning: "2-3 weeks", execution: "4-6 weeks", total: "1.5-2 months" },
      requirements: ["Property management system"],
      benefits: ["High rental yield"],
      risks: ["Market volatility"],
      nextSteps: ["Research local regulations"],
      marketDemand: "high" as const,
      complexity: "moderate" as const,
      tags: ["airbnb", "vacation rental"]
    },
    averageFeasibility: 82,
    potentialRevenueRange: {
      min: 18000,
      max: 75000
    }
  },
  analysisInsights: {
    propertyStrengths: ["Great location", "Good condition", "Attractive layout"],
    marketOpportunities: ["Tourism growth", "Remote work trend", "Rental demand"],
    considerations: ["Local regulations", "Market competition", "Seasonal factors"]
  },
  generatedAt: new Date().toISOString()
}

type TestView = 'menu' | 'welcome' | 'flow' | 'results'

export default function AITestPage() {
  const [currentView, setCurrentView] = useState<TestView>('menu')

  const renderView = () => {
    switch (currentView) {
      case 'welcome':
        return <WelcomeBackPage onCameraClick={() => setCurrentView('flow')} />
      
      case 'flow':
        return (
          <AIProspectFlowController 
            onComplete={(results) => {
              console.log('Flow completed:', results)
              setCurrentView('results')
            }}
            onCancel={() => setCurrentView('menu')}
          />
        )
      
      case 'results':
        return (
          <PropertyProspectsResults 
            results={mockProspectResults}
            onClose={() => setCurrentView('menu')}
            onSaveProspects={(prospects) => console.log('Saving:', prospects)}
          />
        )
      
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-8">
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="text-center">
                    🧪 AI Prospect System Test
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 text-center">
                    Test the AI prospect generation flow components
                  </p>
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={() => setCurrentView('welcome')}
                      className="w-full"
                      variant="outline"
                    >
                      Test Welcome Page
                    </Button>
                    
                    <Button 
                      onClick={() => setCurrentView('flow')}
                      className="w-full"
                      variant="outline"
                    >
                      Test Full AI Flow
                    </Button>
                    
                    <Button 
                      onClick={() => setCurrentView('results')}
                      className="w-full"
                      variant="outline"
                    >
                      Test Results Page (Mock Data)
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <Badge variant="secondary">Vision API</Badge>
                      <Badge variant="secondary">Vertex AI</Badge>
                      <Badge variant="secondary">Smart Camera</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  return renderView()
}
