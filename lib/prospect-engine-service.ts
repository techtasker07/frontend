// In-app prospect engine service - replaces Vertex AI
import type { PropertyAnalysis } from './google-vision-service'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Types (keeping same structure as Vertex AI for compatibility)
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
  // Combined list for backward compatibility
  prospects: PropertyProspect[]
  // Grouped by sectors for UI toggling
  sectors: {
    valueMaximization: PropertyProspect[]
    alternativeUses: PropertyProspect[]
  }
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

type ProspectSector = 'value-maximization' | 'alternative-use'

interface ProspectTemplate {
  id: string
  title: string
  description: string
  category_id: string
  sector: ProspectSector
  property_types: string[]
  required_features: string[]
  preferred_features: string[]
  min_square_meters: number | null
  max_square_meters: number | null
  min_rooms: number | null
  max_rooms: number | null
  suitable_conditions: string[]
  suitable_locations: string[]
  feasibility_score: number
  min_revenue: number
  max_revenue: number
  revenue_timeframe: string
  min_cost: number
  max_cost: number
  cost_breakdown: string[]
  planning_time: string
  execution_time: string
  total_time: string
  requirements: string[]
  benefits: string[]
  risks: string[]
  next_steps: string[]
  market_demand: 'low' | 'medium' | 'high'
  complexity: 'simple' | 'moderate' | 'complex'
  tags: string[]
  priority: number
}

class ProspectEngineService {
  private supabase: any = null

  private initializeClient() {
    if (!this.supabase) {
      const cookieStore = cookies()
      this.supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            }
          }
        }
      )
    }
  }

  /**
   * Generate property prospects using in-app matching engine
   */
  async generatePropertyProspects(
    visionAnalysis: PropertyAnalysis,
    formData: PropertyFormData,
    userId?: string
  ): Promise<ProspectGenerationResult> {
    console.log('[PROSPECT ENGINE] Starting prospect generation:', {
      propertyType: visionAnalysis.propertyType,
      userId: userId || 'anonymous',
      formDataKeys: Object.keys(formData)
    })

    try {
      this.initializeClient()

      console.log('[PROSPECT ENGINE] Fetching prospect templates')
      const templates = await this.fetchProspectTemplates()
      console.log('[PROSPECT ENGINE] Found templates:', templates.length)

      console.log('[PROSPECT ENGINE] Assigning 8 random prospects by sector')
      // Split templates by sector
      const vmTemplates = templates.filter(t => t.sector === 'value-maximization')
      const auTemplates = templates.filter(t => t.sector === 'alternative-use')

      // FAST: Simple property type matching for speed, then random selection
      const vmFiltered = this.basicPropertyFilter(vmTemplates, visionAnalysis, formData)
      const auFiltered = this.basicPropertyFilter(auTemplates, visionAnalysis, formData)

      // Guarantee exactly 4 per sector (random selection)
      const vmTop = this.guaranteedRandomSample(vmFiltered, 4)
      const auTop = this.guaranteedRandomSample(auFiltered, 4)

      console.log('[PROSPECT ENGINE] Selected matches per sector:', { valueMaximization: vmTop.length, alternativeUses: auTop.length })

      console.log('[PROSPECT ENGINE] Converting to result format')
      const vmProspects = vmTop.map(match => this.convertTemplateToProspect(match.template, match.score, match.reasoning))
      const auProspects = auTop.map(match => this.convertTemplateToProspect(match.template, match.score, match.reasoning))

      // Combined list for backward compatibility
      const combinedProspects = [...vmProspects, ...auProspects]

      // Generate summary and insights on combined list
      const summary = this.generateSummary(combinedProspects)
      const analysisInsights = this.generateAnalysisInsights(visionAnalysis, formData, combinedProspects)

      const result: ProspectGenerationResult = {
        prospects: combinedProspects,
        sectors: {
          valueMaximization: vmProspects,
          alternativeUses: auProspects
        },
        summary,
        analysisInsights,
        generatedAt: new Date().toISOString()
      }

      // Store prospects in database if userId provided
      if (userId) {
        console.log('[PROSPECT ENGINE] Storing prospects in database for user:', userId)
        const allMatches = [...vmTop, ...auTop]
        await this.storeProspectsInDatabase(allMatches, visionAnalysis, formData, userId)
        console.log('[PROSPECT ENGINE] Prospects stored successfully')
      }

      console.log('[PROSPECT ENGINE] Prospect generation completed successfully')
      return result

    } catch (error) {
      console.error('[PROSPECT ENGINE] Generation failed:', error)
      // Return fallback data if database fails
      return this.generateFallbackProspects()
    }
  }

  /**
   * Fetch prospect templates from database
   */
  private async fetchProspectTemplates(): Promise<ProspectTemplate[]> {
    const { data, error } = await this.supabase
      .from('prospect_templates')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('feasibility_score', { ascending: false })

    if (error) {
      console.error('[PROSPECT ENGINE] Error fetching templates:', error)
      return []
    }

    return data || []
  }

  /**
   * Match prospects to property based on criteria
   */
  private matchProspectsToProperty(
    templates: ProspectTemplate[],
    visionAnalysis: PropertyAnalysis,
    formData: PropertyFormData
  ): Array<{ template: ProspectTemplate; score: number; reasoning: string }> {
    const matches: Array<{ template: ProspectTemplate; score: number; reasoning: string }> = []

    for (const template of templates) {
      const matchResult = this.calculateMatchScore(template, visionAnalysis, formData)
      if (matchResult.score >= 30) { // Only include prospects with reasonable match
        matches.push({
          template,
          score: matchResult.score,
          reasoning: matchResult.reasoning
        })
      }
    }

    // Sort by match score and return top 7
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 7)
  }

  /**
   * Calculate how well a prospect template matches a property
   */
  private calculateMatchScore(
    template: ProspectTemplate,
    visionAnalysis: PropertyAnalysis,
    formData: PropertyFormData
  ): { score: number; reasoning: string } {
    let score = 0
    const reasons: string[] = []

    // Property type match (40 points)
    if (template.property_types.includes(visionAnalysis.propertyType) || 
        template.property_types.includes(formData.propertyType.toLowerCase())) {
      score += 40
      reasons.push(`Property type (${visionAnalysis.propertyType}) matches template requirements`)
    } else if (template.property_types.includes('any') || template.property_types.length === 0) {
      score += 20
      reasons.push('Template accepts any property type')
    }

    // Required features match (30 points)
    if (template.required_features.length > 0) {
      const matchedFeatures = template.required_features.filter(feature =>
        visionAnalysis.features.some(vf => vf.toLowerCase().includes(feature.toLowerCase()))
      )
      const featureMatchRatio = matchedFeatures.length / template.required_features.length
      score += Math.floor(30 * featureMatchRatio)
      if (matchedFeatures.length > 0) {
        reasons.push(`Has required features: ${matchedFeatures.join(', ')}`)
      }
    } else {
      score += 30 // No specific requirements
      reasons.push('No specific feature requirements')
    }

    // Preferred features bonus (10 points)
    if (template.preferred_features.length > 0) {
      const matchedPreferred = template.preferred_features.filter(feature =>
        visionAnalysis.features.some(vf => vf.toLowerCase().includes(feature.toLowerCase()))
      )
      score += Math.min(10, matchedPreferred.length * 2)
      if (matchedPreferred.length > 0) {
        reasons.push(`Has preferred features: ${matchedPreferred.join(', ')}`)
      }
    }

    // Size constraints (10 points)
    const squareMeters = parseInt(formData.squareMeters) || 0
    if (squareMeters > 0) {
      const meetsMinSize = !template.min_square_meters || squareMeters >= template.min_square_meters
      const meetsMaxSize = !template.max_square_meters || squareMeters <= template.max_square_meters
      
      if (meetsMinSize && meetsMaxSize) {
        score += 10
        reasons.push(`Property size (${squareMeters}m²) fits requirements`)
      } else if (meetsMinSize || meetsMaxSize) {
        score += 5
        reasons.push(`Property size partially meets requirements`)
      }
    } else {
      score += 5 // Unknown size gets partial credit
    }

    // Room count constraints (10 points)
    const rooms = parseInt(formData.No_of_rooms) || 0
    if (rooms > 0) {
      const meetsMinRooms = !template.min_rooms || rooms >= template.min_rooms
      const meetsMaxRooms = !template.max_rooms || rooms <= template.max_rooms
      
      if (meetsMinRooms && meetsMaxRooms) {
        score += 10
        reasons.push(`Room count (${rooms}) fits requirements`)
      } else if (meetsMinRooms || meetsMaxRooms) {
        score += 5
        reasons.push(`Room count partially meets requirements`)
      }
    } else {
      score += 5 // Unknown rooms gets partial credit
    }

    return {
      score: Math.min(100, score),
      reasoning: reasons.join('; ')
    }
  }

  /**
   * Convert prospect template to PropertyProspect format
   */
  private convertTemplateToProspect(
    template: ProspectTemplate,
    matchScore: number,
    reasoning: string
  ): PropertyProspect {
    // Map category_id to category name
    const categoryMap: { [key: string]: string } = {
      '550e8400-e29b-41d4-a716-446655440001': 'residential',
      '550e8400-e29b-41d4-a716-446655440002': 'commercial',
      '550e8400-e29b-41d4-a716-446655440003': 'mixed-use',
      '550e8400-e29b-41d4-a716-446655440004': 'investment',
      '550e8400-e29b-41d4-a716-446655440005': 'development',
      '550e8400-e29b-41d4-a716-446655440006': 'renovation'
    }

    return {
      id: template.id,
      title: template.title,
      description: template.description,
      category: (categoryMap[template.category_id] as any) || 'investment',
      feasibilityScore: Math.floor((template.feasibility_score + matchScore) / 2), // Blend template and match scores
      estimatedRevenue: {
        min: template.min_revenue,
        max: template.max_revenue,
        timeframe: template.revenue_timeframe
      },
      estimatedCost: {
        min: template.min_cost,
        max: template.max_cost,
        breakdown: template.cost_breakdown
      },
      timeline: {
        planning: template.planning_time,
        execution: template.execution_time,
        total: template.total_time
      },
      requirements: template.requirements,
      benefits: template.benefits,
      risks: template.risks,
      nextSteps: template.next_steps,
      marketDemand: template.market_demand,
      complexity: template.complexity,
      tags: template.tags
    }
  }

  /**
   * Generate summary from prospects
   */
  private generateSummary(prospects: PropertyProspect[]) {
    if (prospects.length === 0) {
      return {
        totalProspects: 0,
        topRecommendation: {} as PropertyProspect,
        averageFeasibility: 0,
        potentialRevenueRange: { min: 0, max: 0 }
      }
    }

    const topRecommendation = prospects.reduce((best, current) =>
      current.feasibilityScore > best.feasibilityScore ? current : best
    )

    const averageFeasibility = Math.round(
      prospects.reduce((sum, p) => sum + p.feasibilityScore, 0) / prospects.length
    )

    const allMinRevenues = prospects.map(p => p.estimatedRevenue.min)
    const allMaxRevenues = prospects.map(p => p.estimatedRevenue.max)

    return {
      totalProspects: prospects.length,
      topRecommendation,
      averageFeasibility,
      potentialRevenueRange: {
        min: Math.min(...allMinRevenues),
        max: Math.max(...allMaxRevenues)
      }
    }
  }

  /**
   * FAST: Basic property filtering for speed (just property type matching)
   */
  private basicPropertyFilter(
    templates: ProspectTemplate[],
    visionAnalysis: PropertyAnalysis,
    formData: PropertyFormData
  ): Array<{ template: ProspectTemplate; score: number; reasoning: string }> {
    const filtered: Array<{ template: ProspectTemplate; score: number; reasoning: string }> = []
    
    for (const template of templates) {
      // Simple property type check for speed
      const propertyMatches = 
        template.property_types.length === 0 ||
        template.property_types.includes(visionAnalysis.propertyType) ||
        template.property_types.includes(formData.propertyType.toLowerCase())
        
      if (propertyMatches) {
        filtered.push({
          template,
          score: template.feasibility_score + Math.floor(Math.random() * 20), // Add randomness
          reasoning: `Property type compatible with ${visionAnalysis.propertyType}, located in ${formData.location?.city || 'provided area'}`
        })
      }
    }
    
    return filtered
  }

  /**
   * Guaranteed random sample - ensures we get exactly n items (or as many as available)
   */
  private guaranteedRandomSample<T>(arr: T[], n: number): T[] {
    if (arr.length === 0) {
      return []
    }
    
    // If we don't have enough, duplicate the array until we do
    let expanded = [...arr]
    while (expanded.length < n && arr.length > 0) {
      expanded = [...expanded, ...arr]
    }
    
    // Now randomly sample exactly n items
    const shuffled = this.shuffle(expanded.slice())
    return shuffled.slice(0, n)
  }

  /**
   * Randomly sample up to n items from an array (after shuffling)
   */
  private randomSample<T>(arr: T[], n: number): T[] {
    const copy = this.shuffle(arr.slice())
    return copy.slice(0, Math.min(n, copy.length))
  }

  private shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  /**
   * Generate analysis insights
   */
  private generateAnalysisInsights(
    visionAnalysis: PropertyAnalysis,
    formData: PropertyFormData,
    prospects: PropertyProspect[]
  ) {
    const propertyStrengths = [
      `Property type: ${visionAnalysis.propertyType} with ${(visionAnalysis.confidence * 100).toFixed(0)}% confidence`,
      `Key features: ${visionAnalysis.features.join(', ')}`,
      `Condition: ${visionAnalysis.condition}`,
      `Architectural style: ${visionAnalysis.architecturalStyle}`
    ]

    const marketOpportunities = [
      `${prospects.length} viable prospects identified`,
      'Strong potential for income generation',
      'Multiple investment categories available'
    ]

    // Add specific opportunities based on dominant categories
    const categories = prospects.map(p => p.category)
    const mostCommon = categories.reduce((a, b, i, arr) =>
      arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
    )
    marketOpportunities.push(`Strong ${mostCommon} opportunities in your area`)

    const considerations = [
      `Budget range: ${formData.budget}`,
      `Timeline: ${formData.timeline}`,
      `Current use: ${formData.currentUse}`,
      'Market research recommended for final decision'
    ]

    return {
      propertyStrengths,
      marketOpportunities,
      considerations
    }
  }

  /**
   * Store prospects in database
   */
  private async storeProspectsInDatabase(
    matches: Array<{ template: ProspectTemplate; score: number; reasoning: string }>,
    visionAnalysis: PropertyAnalysis,
    formData: PropertyFormData,
    userId: string
  ): Promise<void> {
    try {
      // Store each match
      for (const match of matches) {
        const { error } = await this.supabase
          .from('property_prospect_matches')
          .insert({
            user_id: userId,
            prospect_template_id: match.template.id,
            property_address: formData.address,
            property_type: formData.propertyType,
            square_meters: parseInt(formData.squareMeters) || null,
            num_rooms: parseInt(formData.No_of_rooms) || null,
            num_bathrooms: parseInt(formData.bathrooms) || null,
            current_use: formData.currentUse,
            ownership_status: formData.ownershipStatus,
            budget_range: formData.budget,
            timeline_requirement: formData.timeline,
            vision_features: visionAnalysis.features,
            vision_confidence: visionAnalysis.confidence,
            vision_condition: visionAnalysis.condition,
            vision_architectural_style: visionAnalysis.architecturalStyle,
            match_score: match.score,
            match_reasoning: match.reasoning
          })

        if (error) {
          console.error('[PROSPECT ENGINE] Error storing match:', error)
        }
      }
    } catch (error) {
      console.error('[PROSPECT ENGINE] Error storing prospects in database:', error)
    }
  }

  /**
   * Generate fallback prospects if database fails
   */
  private generateFallbackProspects(): ProspectGenerationResult {
    // Value Maximization prospects
    const valueMaxProspects: PropertyProspect[] = [
      {
        id: 'fallback-vm-1',
        title: 'Property Renovation & Modernization',
        description: `Enhance your property's value through strategic renovation and modernization. Focus on high-impact improvements like kitchen and bathroom upgrades, fresh paint, modern fixtures, and energy-efficient systems. This approach maximizes return on investment while making the property more attractive to buyers or renters.`,
        category: 'investment',
        feasibilityScore: 85,
        estimatedRevenue: {
          min: 300000,
          max: 1200000,
          timeframe: 'annually'
        },
        estimatedCost: {
          min: 800000,
          max: 3000000,
          breakdown: ['Kitchen Upgrade: ₦400K-1.2M', 'Bathroom Renovation: ₦200K-800K', 'Painting & Fixtures: ₦150K-600K']
        },
        timeline: {
          planning: '1-2 weeks',
          execution: '6-12 weeks',
          total: '2-3.5 months'
        },
        requirements: ['Property condition assessment', 'Renovation permits', 'Contractor selection'],
        benefits: ['Increased property value', 'Higher rental income potential', 'Faster sale/lease'],
        risks: ['Cost overruns', 'Construction delays', 'Market timing risks'],
        nextSteps: ['Get property valuation', 'Obtain renovation quotes', 'Secure financing'],
        marketDemand: 'high',
        complexity: 'moderate',
        tags: ['renovation', 'modernization', 'value-add']
      },
      {
        id: 'fallback-vm-2',
        title: 'Strategic Leasing Optimization',
        description: `Maximize rental income through strategic leasing optimization. This includes market research, competitive pricing, property staging, professional photography, and targeted marketing to attract high-quality tenants and minimize vacancy periods.`,
        category: 'investment',
        feasibilityScore: 80,
        estimatedRevenue: {
          min: 400000,
          max: 1500000,
          timeframe: 'annually'
        },
        estimatedCost: {
          min: 200000,
          max: 800000,
          breakdown: ['Property Staging: ₦100K-300K', 'Professional Photos: ₦30K-80K', 'Marketing: ₦50K-200K']
        },
        timeline: {
          planning: '1-3 weeks',
          execution: '2-4 weeks',
          total: '1-2 months'
        },
        requirements: ['Market rate analysis', 'Property preparation', 'Marketing strategy'],
        benefits: ['Optimized rental income', 'Reduced vacancy periods', 'Quality tenant attraction'],
        risks: ['Market rent fluctuations', 'Tenant turnover', 'Property maintenance costs'],
        nextSteps: ['Conduct market research', 'Prepare property for leasing', 'Develop marketing plan'],
        marketDemand: 'high',
        complexity: 'simple',
        tags: ['leasing', 'rental optimization', 'income maximization']
      },
      {
        id: 'fallback-vm-3',
        title: 'Energy Efficiency Upgrade',
        description: `Implement energy-efficient solutions to reduce operational costs and increase property value. Install solar panels, LED lighting, efficient HVAC systems, and smart home technology to attract environmentally conscious tenants and buyers.`,
        category: 'investment',
        feasibilityScore: 75,
        estimatedRevenue: {
          min: 150000,
          max: 600000,
          timeframe: 'annually'
        },
        estimatedCost: {
          min: 400000,
          max: 1500000,
          breakdown: ['Solar Installation: ₦300K-900K', 'LED Lighting: ₦50K-200K', 'Smart Systems: ₦50K-400K']
        },
        timeline: {
          planning: '2-4 weeks',
          execution: '4-8 weeks',
          total: '1.5-3 months'
        },
        requirements: ['Energy audit', 'Government incentive research', 'Certified installer selection'],
        benefits: ['Reduced utility costs', 'Increased property value', 'Environmental sustainability'],
        risks: ['Technology changes', 'Installation complexity', 'ROI uncertainty'],
        nextSteps: ['Conduct energy audit', 'Research incentives', 'Get installation quotes'],
        marketDemand: 'medium',
        complexity: 'moderate',
        tags: ['energy efficiency', 'sustainability', 'cost reduction']
      },
      {
        id: 'fallback-vm-4',
        title: 'Property Management Optimization',
        description: `Streamline property management operations through digital tools and professional systems. Implement online rent collection, maintenance tracking, tenant communication platforms, and automated processes to improve efficiency and tenant satisfaction.`,
        category: 'investment',
        feasibilityScore: 78,
        estimatedRevenue: {
          min: 100000,
          max: 500000,
          timeframe: 'annually'
        },
        estimatedCost: {
          min: 150000,
          max: 600000,
          breakdown: ['Software Setup: ₦50K-200K', 'System Integration: ₦50K-200K', 'Training: ₦50K-200K']
        },
        timeline: {
          planning: '1-2 weeks',
          execution: '3-6 weeks',
          total: '1-2 months'
        },
        requirements: ['Current process assessment', 'Software selection', 'Staff training'],
        benefits: ['Operational efficiency', 'Better tenant relations', 'Cost savings'],
        risks: ['Learning curve', 'Technology adoption', 'Initial setup complexity'],
        nextSteps: ['Assess current processes', 'Research management software', 'Plan implementation'],
        marketDemand: 'medium',
        complexity: 'simple',
        tags: ['property management', 'efficiency', 'technology']
      }
    ]

    // Alternative Use prospects
    const alternativeUseProspects: PropertyProspect[] = [
      {
        id: 'fallback-au-1',
        title: 'Short-term Rental (Airbnb) Conversion',
        description: `Transform your residential property into a profitable short-term rental business. With growing tourism and business travel, converting your property into an Airbnb can generate substantial monthly income through strategic furnishing and excellent guest service.`,
        category: 'commercial',
        feasibilityScore: 85,
        estimatedRevenue: {
          min: 150000,
          max: 800000,
          timeframe: 'monthly'
        },
        estimatedCost: {
          min: 300000,
          max: 1500000,
          breakdown: ['Furniture & Decor: ₦200K-800K', 'Utilities Setup: ₦50K-200K', 'Marketing: ₦50K-150K']
        },
        timeline: {
          planning: '2-4 weeks',
          execution: '4-6 weeks',
          total: '1.5-2.5 months'
        },
        requirements: ['Property renovation/furnishing', 'Business registration', 'Insurance coverage'],
        benefits: ['High monthly income potential', 'Flexible business model', 'Tax benefits'],
        risks: ['Market competition', 'Guest management challenges', 'Regulatory changes'],
        nextSteps: ['Research local regulations', 'Analyze competitor pricing', 'Plan renovation budget'],
        marketDemand: 'high',
        complexity: 'moderate',
        tags: ['airbnb', 'short-term rental', 'tourism']
      },
      {
        id: 'fallback-au-2',
        title: 'Co-working Space Conversion',
        description: `Convert part of your property into a modern co-working space. With the rise of remote work culture, there's increasing demand for professional workspace solutions. Create zones for different work functions with reliable internet and professional amenities.`,
        category: 'commercial',
        feasibilityScore: 75,
        estimatedRevenue: {
          min: 200000,
          max: 600000,
          timeframe: 'monthly'
        },
        estimatedCost: {
          min: 400000,
          max: 1200000,
          breakdown: ['Office Furniture: ₦250K-600K', 'IT Equipment: ₦150K-400K', 'Interior Design: ₦100K-300K']
        },
        timeline: {
          planning: '3-5 weeks',
          execution: '6-8 weeks',
          total: '2-3 months'
        },
        requirements: ['Space renovation', 'High-speed internet installation', 'Business licensing'],
        benefits: ['Steady monthly income', 'Low operational costs', 'Community building'],
        risks: ['Initial investment required', 'Member management', 'Competition from cafes'],
        nextSteps: ['Survey local remote workers', 'Design space layout', 'Source quality furniture'],
        marketDemand: 'high',
        complexity: 'moderate',
        tags: ['co-working', 'office space', 'remote work']
      },
      {
        id: 'fallback-au-3',
        title: 'Event Venue Conversion',
        description: `Transform your property into an event venue for weddings, parties, corporate events, and social gatherings. Focus on creating flexible spaces that can accommodate different event types while providing excellent service and amenities.`,
        category: 'commercial',
        feasibilityScore: 70,
        estimatedRevenue: {
          min: 100000,
          max: 500000,
          timeframe: 'per event'
        },
        estimatedCost: {
          min: 500000,
          max: 2000000,
          breakdown: ['Space Renovation: ₦300K-1M', 'Event Equipment: ₦150K-600K', 'Licenses: ₦50K-400K']
        },
        timeline: {
          planning: '4-6 weeks',
          execution: '8-12 weeks',
          total: '3-4.5 months'
        },
        requirements: ['Event space design', 'Permits and licenses', 'Catering partnerships'],
        benefits: ['High per-event revenue', 'Flexible scheduling', 'Community impact'],
        risks: ['Seasonal demand', 'Event management complexity', 'Insurance requirements'],
        nextSteps: ['Research local event demand', 'Design flexible spaces', 'Obtain necessary permits'],
        marketDemand: 'medium',
        complexity: 'complex',
        tags: ['events', 'venue', 'entertainment']
      },
      {
        id: 'fallback-au-4',
        title: 'Storage & Warehouse Facility',
        description: `Convert your property into a storage and warehouse facility for businesses and individuals. With growing e-commerce and urbanization, there's increasing demand for secure, accessible storage solutions in residential areas.`,
        category: 'commercial',
        feasibilityScore: 72,
        estimatedRevenue: {
          min: 150000,
          max: 400000,
          timeframe: 'monthly'
        },
        estimatedCost: {
          min: 300000,
          max: 1000000,
          breakdown: ['Security Systems: ₦150K-400K', 'Storage Units: ₦100K-400K', 'Access Control: ₦50K-200K']
        },
        timeline: {
          planning: '2-3 weeks',
          execution: '4-8 weeks',
          total: '1.5-2.5 months'
        },
        requirements: ['Security system installation', 'Storage unit construction', 'Business licensing'],
        benefits: ['Steady monthly income', 'Low maintenance', 'Scalable business model'],
        risks: ['Security concerns', 'Competition from commercial facilities', 'Zoning restrictions'],
        nextSteps: ['Check zoning requirements', 'Research local storage demand', 'Plan security systems'],
        marketDemand: 'medium',
        complexity: 'simple',
        tags: ['storage', 'warehouse', 'logistics']
      }
    ]

    const allProspects = [...valueMaxProspects, ...alternativeUseProspects]

    return {
      prospects: allProspects,
      sectors: {
        valueMaximization: valueMaxProspects,
        alternativeUses: alternativeUseProspects
      },
      summary: {
        totalProspects: allProspects.length,
        topRecommendation: valueMaxProspects[0], // Highest feasibility score
        averageFeasibility: Math.round(allProspects.reduce((sum, p) => sum + p.feasibilityScore, 0) / allProspects.length),
        potentialRevenueRange: {
          min: Math.min(...allProspects.map(p => p.estimatedRevenue.min)),
          max: Math.max(...allProspects.map(p => p.estimatedRevenue.max))
        }
      },
      analysisInsights: {
        propertyStrengths: ['Solid investment potential', 'Good location characteristics', 'Flexible usage options', 'Strong market positioning'],
        marketOpportunities: ['Growing rental market', 'Property value appreciation potential', 'Diverse income opportunities', 'Emerging business trends'],
        considerations: ['Market research needed', 'Budget allocation planning', 'Timeline flexibility important', 'Regulatory compliance required']
      },
      generatedAt: new Date().toISOString()
    }
  }
}

// Singleton instance
export const prospectEngineService = new ProspectEngineService()

// Export types for compatibility
export type { PropertyProspect, ProspectGenerationResult, PropertyFormData }
