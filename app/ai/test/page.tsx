"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import WelcomeBackPageProps from "@/components/ai/welcome-back-page"
import { AIProspectFlowController } from "@/components/ai/ai-prospect-flow-controller"
import { PropertyProspectsResults } from "@/components/ai/property-prospects-results"
import type { ProspectGenerationResult } from "@/lib/prospect-engine-service"

// Test data will be fetched from the API

type TestView = 'menu' | 'welcome' | 'flow' | 'results'

// Component to test real API data fetching
function TestResultsPage({ onClose }: { onClose: () => void }) {
  const [results, setResults] = useState<ProspectGenerationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        setLoading(true)
        // Use sample data for testing the API
        const testVisionAnalysis = {
          propertyType: "house",
          features: ["windows", "door", "walls"],
          confidence: 0.85,
          condition: "good",
          architecturalStyle: "modern"
        }

        const testFormData = {
          address: "123 Test Street, Lagos",
          propertyType: "house",
          squareMeters: "150",
          No_of_rooms: "3",
          bathrooms: "2",
          currentUse: "residential",
          ownershipStatus: "owned",
          budget: "5000000-10000000",
          timeline: "6-12 months",
          additionalInfo: "Test property for prospect generation",
          location: {
            city: "Lagos",
            state: "Lagos",
            zipCode: "100001"
          }
        }

        const response = await fetch('/api/ai/generate-prospects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            visionAnalysis: testVisionAnalysis,
            formData: testFormData
          })
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        setResults(data.prospects)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch prospects')
      } finally {
        setLoading(false)
      }
    }

    fetchTestData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Fetching prospects from database...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={onClose} variant="outline">Back to Menu</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">No prospects generated</p>
            <Button onClick={onClose} variant="outline">Back to Menu</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <PropertyProspectsResults
      results={results}
      onClose={onClose}
      onSaveProspects={(prospects) => console.log('Saving:', prospects)}
    />
  )
}

export default function AITestPage() {
  const [currentView, setCurrentView] = useState<TestView>('menu')

  const renderView = () => {
    switch (currentView) {
      case 'welcome':
        return (
          <WelcomeBackPageProps 
            userName="Test User"
            onStartAnalysis={() => setCurrentView('flow')}
            onSkip={() => setCurrentView('menu')}
            onClose={() => setCurrentView('menu')}
          />
        )
      
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
          <TestResultsPage
            onClose={() => setCurrentView('menu')}
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
                       Test Results Page (Database Data)
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
