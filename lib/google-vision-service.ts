// Mock implementation for build compatibility
// In production, this would use actual Google Vision API

interface VisionAnalysisResult {
  labels: Array<{
    description: string
    score: number
    topicality: number
  }>
  objects: Array<{
    name: string
    score: number
    boundingPoly: any
  }>
  landmarks: Array<{
    description: string
    score: number
    locations: any[]
  }>
  text: Array<{
    description: string
    boundingPoly: any
  }>
  properties: Array<{
    colors: any[]
  }>
  safeSearch: {
    adult: string
    spoof: string
    medical: string
    violence: string
    racy: string
  }
  webDetection: {
    webEntities: Array<{
      entityId?: string
      score: number
      description?: string
    }>
    fullMatchingImages?: any[]
    partialMatchingImages?: any[]
    visuallySimilarImages?: any[]
    bestGuessLabels?: Array<{
      label: string
      languageCode?: string
    }>
  }
}

interface PropertyAnalysis {
  propertyType: string
  confidence: number
  features: string[]
  structuralElements: string[]
  surroundingContext: string[]
  potentialUses: string[]
  condition: string
  architecturalStyle: string
  estimatedAge: string
  rawVisionData: VisionAnalysisResult
}

class GoogleVisionService {
  /**
   * Analyze property image - Mock implementation
   */
  async analyzePropertyImage(imageData: string): Promise<PropertyAnalysis> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock vision analysis result
    const mockVisionData: VisionAnalysisResult = {
      labels: [
        { description: 'House', score: 0.95, topicality: 0.92 },
        { description: 'Building', score: 0.89, topicality: 0.88 },
        { description: 'Property', score: 0.87, topicality: 0.85 },
        { description: 'Architecture', score: 0.82, topicality: 0.80 },
        { description: 'Residential', score: 0.78, topicality: 0.75 }
      ],
      objects: [
        { name: 'Window', score: 0.92, boundingPoly: {} },
        { name: 'Door', score: 0.88, boundingPoly: {} },
        { name: 'Roof', score: 0.85, boundingPoly: {} }
      ],
      landmarks: [],
      text: [],
      properties: [],
      safeSearch: {
        adult: 'VERY_UNLIKELY',
        spoof: 'VERY_UNLIKELY',
        medical: 'VERY_UNLIKELY',
        violence: 'VERY_UNLIKELY',
        racy: 'VERY_UNLIKELY'
      },
      webDetection: {
        webEntities: [
          { score: 0.85, description: 'Single family home' },
          { score: 0.78, description: 'Residential property' }
        ],
        bestGuessLabels: [
          { label: 'residential house', languageCode: 'en' }
        ]
      }
    }

    // Analyze and categorize the results
    const analysis = this.analyzePropertyFromVisionData(mockVisionData)
    return analysis
  }

  /**
   * Analyze property characteristics from Vision API data
   */
  private analyzePropertyFromVisionData(visionData: VisionAnalysisResult): PropertyAnalysis {
    const labels = visionData.labels.map(l => l.description.toLowerCase())
    const objects = visionData.objects.map(o => o.name.toLowerCase())
    const webLabels = visionData.webDetection.bestGuessLabels?.map(l => l.label.toLowerCase()) || []
    
    // Combine all detected elements
    const allDetections = [...labels, ...objects, ...webLabels]
    
    // Property type detection
    const propertyType = this.determinePropertyType(allDetections)
    const confidence = this.calculateConfidence(visionData.labels, propertyType)
    
    // Extract features
    const features = this.extractPropertyFeatures(allDetections)
    const structuralElements = this.extractStructuralElements(allDetections)
    const surroundingContext = this.extractSurroundingContext(allDetections)
    const potentialUses = this.generatePotentialUses(propertyType, features, structuralElements)
    
    // Estimate condition and style
    const condition = this.estimateCondition(allDetections)
    const architecturalStyle = this.determineArchitecturalStyle(allDetections)
    const estimatedAge = this.estimateAge(allDetections, architecturalStyle)

    return {
      propertyType,
      confidence,
      features,
      structuralElements,
      surroundingContext,
      potentialUses,
      condition,
      architecturalStyle,
      estimatedAge,
      rawVisionData: visionData
    }
  }

  private determinePropertyType(detections: string[]): string {
    const propertyTypeMap = {
      'house': ['house', 'home', 'residential', 'single family', 'dwelling'],
      'apartment': ['apartment', 'condo', 'condominium', 'flat', 'unit'],
      'office': ['office', 'commercial building', 'workplace', 'business'],
      'warehouse': ['warehouse', 'storage', 'industrial', 'factory'],
      'retail': ['store', 'shop', 'retail', 'commercial', 'shopping'],
      'land': ['land', 'plot', 'lot', 'vacant land', 'property'],
      'mixed-use': ['mixed use', 'mixed-use', 'multi purpose']
    }

    for (const [type, keywords] of Object.entries(propertyTypeMap)) {
      if (keywords.some(keyword => detections.some(d => d.includes(keyword)))) {
        return type
      }
    }

    // Default based on common building indicators
    if (detections.some(d => ['building', 'architecture', 'structure'].some(keyword => d.includes(keyword)))) {
      return 'building'
    }

    return 'house' // Default fallback
  }

  private calculateConfidence(labels: any[], propertyType: string): number {
    const relevantLabels = labels.filter(label => 
      label.description.toLowerCase().includes(propertyType) ||
      ['building', 'house', 'property', 'real estate'].some(keyword => 
        label.description.toLowerCase().includes(keyword)
      )
    )
    
    if (relevantLabels.length === 0) return 0.75 // Default confidence
    
    const avgScore = relevantLabels.reduce((sum, label) => sum + label.score, 0) / relevantLabels.length
    return Math.min(avgScore, 0.95) // Cap at 95%
  }

  private extractPropertyFeatures(detections: string[]): string[] {
    const featureKeywords = {
      'windows': ['window', 'glass', 'glazing'],
      'roof': ['roof', 'roofing', 'shingle', 'tile'],
      'door': ['door', 'entrance', 'entry'],
      'garage': ['garage', 'parking'],
      'garden': ['garden', 'yard', 'landscaping', 'plants'],
      'balcony': ['balcony', 'terrace', 'deck'],
      'stairs': ['stairs', 'steps', 'staircase'],
      'fence': ['fence', 'fencing', 'boundary'],
      'driveway': ['driveway', 'pathway', 'pavement'],
      'chimney': ['chimney', 'fireplace']
    }

    const features: string[] = []
    for (const [feature, keywords] of Object.entries(featureKeywords)) {
      if (keywords.some(keyword => detections.some(d => d.includes(keyword)))) {
        features.push(feature)
      }
    }

    // Add default features for demo
    if (features.length === 0) {
      features.push('windows', 'door', 'roof')
    }

    return features
  }

  private extractStructuralElements(detections: string[]): string[] {
    const structuralKeywords = {
      'foundation': ['foundation', 'base', 'basement'],
      'walls': ['wall', 'exterior', 'facade', 'siding'],
      'floors': ['floor', 'flooring', 'ground'],
      'ceiling': ['ceiling', 'roof interior'],
      'columns': ['column', 'pillar', 'support'],
      'beams': ['beam', 'timber', 'structural']
    }

    const elements: string[] = []
    for (const [element, keywords] of Object.entries(structuralKeywords)) {
      if (keywords.some(keyword => detections.some(d => d.includes(keyword)))) {
        elements.push(element)
      }
    }

    // Add default elements for demo
    if (elements.length === 0) {
      elements.push('walls', 'floors')
    }

    return elements
  }

  private extractSurroundingContext(detections: string[]): string[] {
    const contextKeywords = {
      'urban': ['city', 'urban', 'street', 'downtown'],
      'suburban': ['suburban', 'neighborhood', 'residential area'],
      'rural': ['rural', 'countryside', 'farm', 'field'],
      'waterfront': ['water', 'lake', 'river', 'ocean', 'beach'],
      'mountain': ['mountain', 'hill', 'elevation'],
      'forest': ['forest', 'trees', 'woods'],
      'commercial district': ['commercial', 'business district', 'shopping']
    }

    const context: string[] = []
    for (const [ctx, keywords] of Object.entries(contextKeywords)) {
      if (keywords.some(keyword => detections.some(d => d.includes(keyword)))) {
        context.push(ctx)
      }
    }

    // Add default context for demo
    if (context.length === 0) {
      context.push('suburban')
    }

    return context
  }

  private generatePotentialUses(propertyType: string, features: string[], structuralElements: string[]): string[] {
    const useCases: string[] = []

    // Base uses by property type
    const baseUses = {
      'house': ['Single family residence', 'Multi-family rental', 'Home office', 'Short-term rental (Airbnb)'],
      'apartment': ['Residential rental', 'Student housing', 'Co-living space', 'Corporate housing'],
      'office': ['Traditional office space', 'Co-working space', 'Professional services', 'Creative studio'],
      'warehouse': ['Storage facility', 'Distribution center', 'Manufacturing', 'Event space'],
      'retail': ['Retail store', 'Restaurant', 'Service business', 'Pop-up shop'],
      'land': ['Development opportunity', 'Agriculture', 'Recreation', 'Solar farm'],
      'mixed-use': ['Live-work space', 'Retail with residential', 'Office with retail', 'Community center']
    }

    // Add base uses
    useCases.push(...(baseUses[propertyType as keyof typeof baseUses] || ['General commercial use']))

    // Add feature-based uses
    if (features.includes('garage')) {
      useCases.push('Workshop space', 'Storage rental')
    }
    if (features.includes('garden')) {
      useCases.push('Event venue', 'Outdoor dining')
    }
    if (features.includes('balcony')) {
      useCases.push('Scenic accommodation', 'Photo studio')
    }

    return [...new Set(useCases)] // Remove duplicates
  }

  private estimateCondition(detections: string[]): string {
    const conditionKeywords = {
      'excellent': ['new', 'modern', 'renovated', 'pristine'],
      'good': ['well maintained', 'good condition', 'updated'],
      'fair': ['older', 'dated', 'worn'],
      'poor': ['damaged', 'deteriorated', 'needs repair']
    }

    for (const [condition, keywords] of Object.entries(conditionKeywords)) {
      if (keywords.some(keyword => detections.some(d => d.includes(keyword)))) {
        return condition
      }
    }

    return 'good' // Default condition
  }

  private determineArchitecturalStyle(detections: string[]): string {
    const styleKeywords = {
      'modern': ['modern', 'contemporary', 'minimalist'],
      'traditional': ['traditional', 'classic', 'colonial'],
      'industrial': ['industrial', 'warehouse', 'loft'],
      'victorian': ['victorian', 'ornate', 'detailed'],
      'ranch': ['ranch', 'single story', 'horizontal'],
      'craftsman': ['craftsman', 'bungalow', 'arts and crafts']
    }

    for (const [style, keywords] of Object.entries(styleKeywords)) {
      if (keywords.some(keyword => detections.some(d => d.includes(keyword)))) {
        return style
      }
    }

    return 'modern' // Default style
  }

  private estimateAge(detections: string[], architecturalStyle: string): string {
    // Simple age estimation based on style and visual cues
    const ageMap = {
      'victorian': '100+ years',
      'craftsman': '50-100 years',
      'ranch': '30-70 years',
      'modern': '0-30 years',
      'contemporary': '0-20 years'
    }

    if (ageMap[architecturalStyle as keyof typeof ageMap]) {
      return ageMap[architecturalStyle as keyof typeof ageMap]
    }

    // Fallback based on detections
    if (detections.some(d => ['new', 'modern', 'recent'].some(keyword => d.includes(keyword)))) {
      return '0-20 years'
    }
    if (detections.some(d => ['old', 'vintage', 'historic'].some(keyword => d.includes(keyword)))) {
      return '50+ years'
    }

    return '10-30 years' // Default age
  }
}

// Singleton instance
export const googleVisionService = new GoogleVisionService()

// Export types
export type { VisionAnalysisResult, PropertyAnalysis }
