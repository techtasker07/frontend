import { ImageAnnotatorClient } from '@google-cloud/vision'
import path from 'path'

// Service account configuration
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'public', 'service-account-key.json')

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
  private client: ImageAnnotatorClient
  
  constructor() {
    // Initialize the Vision client with service account
    this.client = new ImageAnnotatorClient({
      keyFilename: SERVICE_ACCOUNT_PATH,
      projectId: 'techtasker-solutions'
    })
  }

  /**
   * Analyze property image using Google Vision API
   */
  async analyzePropertyImage(imageData: string): Promise<PropertyAnalysis> {
    try {
      // Convert base64 to buffer if needed
      const imageBuffer = this.base64ToBuffer(imageData)

      // Perform multiple types of analysis
      const [labelResult] = await this.client.labelDetection({
        image: { content: imageBuffer }
      })

      const [objectResult] = await this.client.objectLocalization({
        image: { content: imageBuffer }
      })

      const [landmarkResult] = await this.client.landmarkDetection({
        image: { content: imageBuffer }
      })

      const [textResult] = await this.client.textDetection({
        image: { content: imageBuffer }
      })

      const [propertiesResult] = await this.client.imageProperties({
        image: { content: imageBuffer }
      })

      const [safeSearchResult] = await this.client.safeSearchDetection({
        image: { content: imageBuffer }
      })

      const [webResult] = await this.client.webDetection({
        image: { content: imageBuffer }
      })

      // Compile results
      const visionData: VisionAnalysisResult = {
        labels: labelResult.labelAnnotations?.map(label => ({
          description: label.description || '',
          score: label.score || 0,
          topicality: label.topicality || 0
        })) || [],
        objects: objectResult.localizedObjectAnnotations?.map(obj => ({
          name: obj.name || '',
          score: obj.score || 0,
          boundingPoly: obj.boundingPoly
        })) || [],
        landmarks: landmarkResult.landmarkAnnotations?.map(landmark => ({
          description: landmark.description || '',
          score: landmark.score || 0,
          locations: landmark.locations || []
        })) || [],
        text: textResult.textAnnotations?.map(text => ({
          description: text.description || '',
          boundingPoly: text.boundingPoly
        })) || [],
        properties: propertiesResult.imagePropertiesAnnotation ? [propertiesResult.imagePropertiesAnnotation] : [],
        safeSearch: {
          adult: safeSearchResult.safeSearchAnnotation?.adult || 'UNKNOWN',
          spoof: safeSearchResult.safeSearchAnnotation?.spoof || 'UNKNOWN',
          medical: safeSearchResult.safeSearchAnnotation?.medical || 'UNKNOWN',
          violence: safeSearchResult.safeSearchAnnotation?.violence || 'UNKNOWN',
          racy: safeSearchResult.safeSearchAnnotation?.racy || 'UNKNOWN'
        },
        webDetection: {
          webEntities: webResult.webDetection?.webEntities?.map(entity => ({
            entityId: entity.entityId,
            score: entity.score || 0,
            description: entity.description
          })) || [],
          fullMatchingImages: webResult.webDetection?.fullMatchingImages || [],
          partialMatchingImages: webResult.webDetection?.partialMatchingImages || [],
          visuallySimilarImages: webResult.webDetection?.visuallySimilarImages || [],
          bestGuessLabels: webResult.webDetection?.bestGuessLabels?.map(label => ({
            label: label.label || '',
            languageCode: label.languageCode
          })) || []
        }
      }

      // Analyze and categorize the results
      const analysis = this.analyzePropertyFromVisionData(visionData)
      
      return analysis

    } catch (error) {
      console.error('Error analyzing image with Google Vision:', error)
      throw new Error(`Vision API analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Convert base64 image data to buffer
   */
  private base64ToBuffer(base64Data: string): Buffer {
    // Remove data:image/jpeg;base64, prefix if present
    const base64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '')
    return Buffer.from(base64, 'base64')
  }

  /**
   * Analyze property characteristics from Vision API data
   */
  private analyzePropertyFromVisionData(visionData: VisionAnalysisResult): PropertyAnalysis {
    const labels = visionData.labels.map(l => l.description.toLowerCase())
    const objects = visionData.objects.map(o => o.name.toLowerCase())
    const webLabels = visionData.webDetection.bestGuessLabels.map(l => l.label.toLowerCase())
    
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

    return 'property'
  }

  private calculateConfidence(labels: any[], propertyType: string): number {
    const relevantLabels = labels.filter(label => 
      label.description.toLowerCase().includes(propertyType) ||
      ['building', 'house', 'property', 'real estate'].some(keyword => 
        label.description.toLowerCase().includes(keyword)
      )
    )
    
    if (relevantLabels.length === 0) return 0.5
    
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

    return 'unknown'
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

    return 'unknown'
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

    return 'unknown'
  }
}

// Singleton instance
export const googleVisionService = new GoogleVisionService()

// Export types
export type { VisionAnalysisResult, PropertyAnalysis }
