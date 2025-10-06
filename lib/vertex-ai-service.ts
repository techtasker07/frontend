// Vertex AI service for property prospect generation
import { VertexAI } from '@google-cloud/vertexai'
import type { PropertyAnalysis } from './google-vision-service'
import { supabase } from './supabase'

interface PropertyProspect {
  id: string
  title: string
  description: string
  category: 'residential' | 'commercial' | 'mixed-use' | 'investment' | 'development'
  feasibilityScore: number
  estimatedRevenue: {
    min: number
    max: number
    timeframe: string
  }
  estimatedCost: {
    min: number
    max: number
    breakdown: string[]
  }
  timeline: {
    planning: string
    execution: string
    total: string
  }
  requirements: string[]
  benefits: string[]
  risks: string[]
  nextSteps: string[]
  marketDemand: 'low' | 'medium' | 'high'
  complexity: 'simple' | 'moderate' | 'complex'
  tags: string[]
}

interface ProspectGenerationResult {
  prospects: PropertyProspect[]
  summary: {
    totalProspects: number
    topRecommendation: PropertyProspect
    averageFeasibility: number
    potentialRevenueRange: {
      min: number
      max: number
    }
  }
  analysisInsights: {
    propertyStrengths: string[]
    marketOpportunities: string[]
    considerations: string[]
  }
  generatedAt: string
}

interface PropertyFormData {
  address: string
  propertyType: string
  squareMeters: string
  No_of_rooms: string
  bathrooms: string
  currentUse: string
  ownershipStatus: string
  budget: string
  timeline: string
  additionalInfo: string
  location: {
    city: string
    state: string
    zipCode: string
  }
}

class VertexAIService {
  private vertexAI: VertexAI
  private model: any

  constructor() {
    // Initialize Vertex AI client
    this.vertexAI = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT!,
      location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
    })
    this.model = this.vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    })
  }

  /**
   * Generate property prospects using Vertex AI
   */
  async generatePropertyProspects(
    visionAnalysis: PropertyAnalysis,
    formData: PropertyFormData,
    userId?: string
  ): Promise<ProspectGenerationResult> {
    try {
      const prompt = this.buildProspectPrompt(visionAnalysis, formData)

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      const prospectData = this.parseProspectResponse(text)

      // Store prospects in Supabase if userId provided
      if (userId) {
        await this.storeProspectsInDatabase(prospectData.prospects, visionAnalysis, formData, userId)
      }

      return {
        ...prospectData,
        generatedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Vertex AI generation error:', error)
      // Fallback to mock data if AI fails
      const mockProspects = this.generateFallbackProspects()
      return {
        ...mockProspects,
        generatedAt: new Date().toISOString()
      }
    }
  }


  /**
   * Build the prompt for Vertex AI
   */
  private buildProspectPrompt(visionAnalysis: PropertyAnalysis, formData: PropertyFormData): string {
    return `
You are an expert real estate AI analyst specializing in property prospect generation and alternative use analysis. 

PROPERTY VISION ANALYSIS:
- Property Type: ${visionAnalysis.propertyType}
- Confidence: ${(visionAnalysis.confidence * 100).toFixed(1)}%
- Features Detected: ${visionAnalysis.features.join(', ')}
- Structural Elements: ${visionAnalysis.structuralElements.join(', ')}
- Surrounding Context: ${visionAnalysis.surroundingContext.join(', ')}
- Condition: ${visionAnalysis.condition}
- Architectural Style: ${visionAnalysis.architecturalStyle}
- Estimated Age: ${visionAnalysis.estimatedAge}

PROPERTY DETAILS:
- Address: ${formData.address}
- Property Type: ${formData.propertyType}
- Square Meters: ${formData.squareMeters}
- No of Rooms: ${formData.No_of_rooms}
- Bathrooms: ${formData.bathrooms}
- Current Use: ${formData.currentUse}
- Ownership Status: ${formData.ownershipStatus}

PROJECT PARAMETERS:
- Investment Budget: ${formData.budget}
- Timeline: ${formData.timeline}
- Project Goal: Results to maximize property value and alternative uses
- Additional Info: ${formData.additionalInfo}

TASK:
Generate 5-7 detailed property prospect recommendations that maximize the property's potential based on:
1. AI vision analysis insights
2. Property specifications
3. Owner's goals and constraints
4. Market opportunities
5. Financial feasibility

For each prospect, provide:
- Unique identifier
- Compelling title
- Detailed description (2-3 paragraphs)
- Category (residential/commercial/mixed-use/investment/development)
- Feasibility score (0-100)
- Revenue estimates (min/max/timeframe)
- Cost estimates (min/max/breakdown)
- Timeline (planning/execution/total)
- Requirements list
- Benefits list
- Risk factors
- Next steps
- Market demand level
- Complexity level
- Relevant tags

RESPONSE FORMAT:
Return ONLY a valid JSON object with this exact structure:

{
  "prospects": [
    {
      "id": "unique-id-1",
      "title": "Prospect Title",
      "description": "Detailed multi-paragraph description...",
      "category": "residential|commercial|mixed-use|investment|development",
      "feasibilityScore": 85,
      "estimatedRevenue": {
        "min": 50000,
        "max": 120000,
        "timeframe": "annually"
      },
      "estimatedCost": {
        "min": 15000,
        "max": 35000,
        "breakdown": ["Item 1: $10-15K", "Item 2: $5-20K"]
      },
      "timeline": {
        "planning": "2-4 weeks",
        "execution": "6-12 weeks",
        "total": "2-4 months"
      },
      "requirements": ["requirement 1", "requirement 2"],
      "benefits": ["benefit 1", "benefit 2"],
      "risks": ["risk 1", "risk 2"],
      "nextSteps": ["step 1", "step 2"],
      "marketDemand": "high|medium|low",
      "complexity": "simple|moderate|complex",
      "tags": ["tag1", "tag2", "tag3"]
    }
  ],
  "summary": {
    "totalProspects": 5,
    "topRecommendation": { /* copy of highest scoring prospect */ },
    "averageFeasibility": 78.5,
    "potentialRevenueRange": {
      "min": 25000,
      "max": 250000
    }
  },
  "analysisInsights": {
    "propertyStrengths": ["strength 1", "strength 2"],
    "marketOpportunities": ["opportunity 1", "opportunity 2"],
    "considerations": ["consideration 1", "consideration 2"]
  }
}

Focus on practical, actionable prospects that align with the owner's budget and timeline. Be creative but realistic. Consider both traditional and innovative uses.
`
  }

  /**
   * Parse the Vertex AI response
   */
  private parseProspectResponse(responseText: string): Omit<ProspectGenerationResult, 'generatedAt'> {
    try {
      // Clean the response text
      const cleanedText = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()
      
      const prospectData = JSON.parse(cleanedText)
      
      // Validate and ensure required structure
      if (!prospectData.prospects || !Array.isArray(prospectData.prospects)) {
        throw new Error('Invalid response format: missing prospects array')
      }

      // Set top recommendation if not provided
      if (!prospectData.summary?.topRecommendation && prospectData.prospects.length > 0) {
        prospectData.summary = prospectData.summary || {}
        prospectData.summary.topRecommendation = prospectData.prospects
          .sort((a: PropertyProspect, b: PropertyProspect) => b.feasibilityScore - a.feasibilityScore)[0]
      }

      // Calculate average feasibility if not provided
      if (!prospectData.summary?.averageFeasibility && prospectData.prospects.length > 0) {
        prospectData.summary = prospectData.summary || {}
        const totalScore = prospectData.prospects.reduce(
          (sum: number, prospect: PropertyProspect) => sum + prospect.feasibilityScore, 
          0
        )
        prospectData.summary.averageFeasibility = Math.round(totalScore / prospectData.prospects.length)
      }

      return prospectData

    } catch (parseError) {
      console.error('Error parsing Vertex AI response:', parseError)
      console.error('Raw response:', responseText)
      
      // Return fallback data if parsing fails
      return this.generateFallbackProspects()
    }
  }

  /**
   * Store generated prospects in Supabase database
   */
  private async storeProspectsInDatabase(
    prospects: PropertyProspect[],
    visionAnalysis: PropertyAnalysis,
    formData: PropertyFormData,
    userId: string
  ): Promise<void> {
    try {
      // First, create or get prospect property record
      const { data: prospectProperty, error: propertyError } = await supabase
        .from('prospect_properties')
        .insert({
          title: `${formData.propertyType} at ${formData.address}`,
          description: `Property analysis for ${formData.propertyType} with ${visionAnalysis.features.join(', ')}`,
          location: formData.address,
          category_id: await this.getCategoryId(formData.propertyType),
          estimated_worth: parseFloat(formData.budget.replace(/[^\d]/g, '')) || null,
          image_url: null // Could be added later
        })
        .select()
        .single()

      if (propertyError) {
        console.error('Error creating prospect property:', propertyError)
        return
      }

      // Insert each prospect
      for (const prospect of prospects) {
        const { error: prospectError } = await supabase
          .from('property_prospects')
          .insert({
            prospect_property_id: prospectProperty.id,
            title: prospect.title,
            description: prospect.description,
            estimated_cost: prospect.estimatedCost.min,
            total_cost: prospect.estimatedCost.max,
            category: prospect.category,
            feasibility_score: prospect.feasibilityScore,
            estimated_revenue: prospect.estimatedRevenue,
            estimated_cost_breakdown: prospect.estimatedCost.breakdown,
            timeline: prospect.timeline,
            requirements: prospect.requirements,
            benefits: prospect.benefits,
            risks: prospect.risks,
            next_steps: prospect.nextSteps,
            market_demand: prospect.marketDemand,
            complexity: prospect.complexity,
            tags: prospect.tags
          })

        if (prospectError) {
          console.error('Error inserting prospect:', prospectError)
        }
      }
    } catch (error) {
      console.error('Error storing prospects in database:', error)
    }
  }

  /**
   * Get category ID from category name
   */
  private async getCategoryId(categoryName: string): Promise<string> {
    const categoryMap: { [key: string]: string } = {
      'residential': '550e8400-e29b-41d4-a716-446655440001',
      'commercial': '550e8400-e29b-41d4-a716-446655440002',
      'land': '550e8400-e29b-41d4-a716-446655440003',
      'industrial': '550e8400-e29b-41d4-a716-446655440004',
      'materials': '550e8400-e29b-41d4-a716-446655440005',
      'mixed-use': '550e8400-e29b-41d4-a716-446655440006'
    }

    return categoryMap[categoryName.toLowerCase()] || categoryMap['residential']
  }

  /**
   * Generate fallback prospects if AI fails
   */
  private generateFallbackProspects(): Omit<ProspectGenerationResult, 'generatedAt'> {
    const fallbackProspect: PropertyProspect = {
      id: 'fallback-1',
      title: 'Traditional Property Use Optimization',
      description: `Based on the property analysis, we recommend optimizing the current use of your property. This involves enhancing existing features and making strategic improvements to maximize value and functionality.

      Consider updating key areas, improving curb appeal, and modernizing systems to increase market appeal and potential rental income. This approach minimizes risk while providing steady returns on investment.`,
      category: 'investment',
      feasibilityScore: 75,
      estimatedRevenue: {
        min: 8000000,
        max: 20000000,
        timeframe: 'annually'
      },
      estimatedCost: {
        min: 4000000,
        max: 10000000,
        breakdown: ['Renovations: ₦3.2-6M', 'Professional Services: ₦800K-2M', 'Marketing: ₦400-1.2M']
      },
      timeline: {
        planning: '2-3 weeks',
        execution: '4-8 weeks',
        total: '1.5-3 months'
      },
      requirements: ['Property inspection', 'Budget allocation', 'Contractor selection'],
      benefits: ['Increased property value', 'Better rental potential', 'Improved marketability'],
      risks: ['Market fluctuations', 'Unexpected costs', 'Construction delays'],
      nextSteps: ['Schedule property inspection', 'Get renovation quotes', 'Plan timeline'],
      marketDemand: 'medium',
      complexity: 'moderate',
      tags: ['optimization', 'renovation', 'value-add']
    }

    return {
      prospects: [fallbackProspect],
      summary: {
        totalProspects: 1,
        topRecommendation: fallbackProspect,
        averageFeasibility: 75,
        potentialRevenueRange: {
          min: 8000000,
          max: 20000000
        }
      },
      analysisInsights: {
        propertyStrengths: ['Good foundation for improvement', 'Existing structure'],
        marketOpportunities: ['Property optimization market', 'Value-add potential'],
        considerations: ['Budget constraints', 'Market conditions', 'Timeline flexibility']
      }
    }
  }
}

// Singleton instance
export const vertexAIService = new VertexAIService()

// Export types
export type { PropertyProspect, ProspectGenerationResult, PropertyFormData }
