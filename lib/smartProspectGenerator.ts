import { MOCK_PROSPECTS, type PropertyProspect } from './aiProspects'
import { classifyImage } from './imageIdentifier'

export interface IdentifiedCategory {
  name: string
  confidence: number
}

export interface SmartProspect {
  id: number
  title: string
  description: string
  estimatedCost: number
  totalCost: number
  imageUrl: string
  realizationTips: string[]
  category: string
}

// Map image classifier categories to our prospect categories
// Note: 'human' is handled separately as it's not a property type
const categoryMapping: { [key: string]: keyof typeof MOCK_PROSPECTS } = {
  'building': 'residential',
  'room': 'residential', 
  'office space': 'commercial',
  'land': 'agricultural',
  'material': 'industrial',
  // Human is not mapped as it's not a valid property type
}

// Valid property categories (excluding human)
const validPropertyCategories = ['building', 'room', 'office space', 'land', 'material'];

// Generate property details for the identified image
export function generatePropertyDetails(category: string) {
  const locations = [
    'Victoria Island, Lagos',
    'Ikoyi, Lagos', 
    'Lekki Phase 1, Lagos',
    'Abuja Central',
    'GRA, Port Harcourt',
    'New Haven, Enugu',
    'Bodija, Ibadan',
    'Asokoro, Abuja'
  ]

  const propertyTypes: { [key: string]: string[] } = {
    'building': ['Residential Building', 'Apartment Complex', 'Housing Estate'],
    'room': ['Room Space', 'Living Area', 'Interior Space'],
    'office space': ['Office Building', 'Commercial Space', 'Business Center'],
    'land': ['Land Plot', 'Development Site', 'Investment Land'],
    'material': ['Material Warehouse', 'Storage Facility', 'Industrial Site']
  }

  const randomLocation = locations[Math.floor(Math.random() * locations.length)]
  const titles = propertyTypes[category] || propertyTypes['building']
  const randomTitle = titles[Math.floor(Math.random() * titles.length)]
  const basePrice = Math.floor(Math.random() * 50000000) + 10000000 // 10M to 60M Naira

  return {
    title: randomTitle,
    location: randomLocation,
    estimatedWorth: basePrice,
    yearBuilt: Math.random() > 0.3 ? Math.floor(Math.random() * 20) + 2005 : undefined
  }
}

// Identify image category using AI model
export async function identifyImageCategory(imageFile: File): Promise<IdentifiedCategory> {
  try {
    // Create image element for classification
    const img = new Image()
    const imageUrl = URL.createObjectURL(imageFile)
    
    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          const predictions = await classifyImage(img)
          URL.revokeObjectURL(imageUrl)
          
          if (predictions && predictions.length > 0) {
            const topPrediction = predictions[0]
            const predictedCategory = topPrediction.className.toLowerCase()
            
            // Return the prediction, including human if detected
            resolve({
              name: predictedCategory,
              confidence: topPrediction.probability
            })
          } else {
            // Fallback to random category (excluding human)
            const randomCategory = validPropertyCategories[Math.floor(Math.random() * validPropertyCategories.length)]
            resolve({
              name: randomCategory,
              confidence: 0.85
            })
          }
        } catch (error) {
          console.error('Image classification failed:', error)
          // Fallback to building category
          resolve({
            name: 'building',
            confidence: 0.75
          })
        }
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(imageUrl)
        // Fallback to building category
        resolve({
          name: 'building',
          confidence: 0.75
        })
      }
      
      img.src = imageUrl
    })
  } catch (error) {
    console.error('Image identification error:', error)
    // Fallback to building category
    return {
      name: 'building',
      confidence: 0.75
    }
  }
}

// Generate 5 smart prospects based on identified category
export function generateSmartProspects(
  identifiedCategory: IdentifiedCategory,
  propertyDetails: ReturnType<typeof generatePropertyDetails>
): SmartProspect[] {
  // Check if the identified category is "human"
  if (identifiedCategory.name === 'human') {
    // Return empty array for human images - they should be handled differently in the UI
    return [];
  }
  
  const mappedCategory = categoryMapping[identifiedCategory.name] || 'residential'
  const prospectCategory: string = mappedCategory as string
  const categoryProspects = MOCK_PROSPECTS[mappedCategory] || MOCK_PROSPECTS.residential
  
  // Shuffle and get 5 random prospects from the category
  const shuffled = [...categoryProspects].sort(() => 0.5 - Math.random())
  const selectedProspects = shuffled.slice(0, 5)
  
  return selectedProspects.map((prospect, index) => {
    const purchaseCost = propertyDetails.estimatedWorth * prospect.purchaseCostFactor
    const developmentCost = propertyDetails.estimatedWorth * prospect.developmentCostFactor
    const estimatedCost = purchaseCost + developmentCost
    
    return {
      id: index + 1,
      title: prospect.title,
      description: prospect.description,
      estimatedCost: Math.round(estimatedCost),
      totalCost: Math.round(propertyDetails.estimatedWorth + estimatedCost),
      imageUrl: prospect.imageUrl,
      realizationTips: prospect.realizationTips,
      category: prospectCategory
    }
  })
}

// Complete smart analysis process
export async function performSmartAnalysis(imageFile: File) {
  // Step 1: Identify image category
  const identifiedCategory = await identifyImageCategory(imageFile)
  
  // Check if this is a human image
  if (identifiedCategory.name === 'human') {
    return {
      identifiedCategory,
      isHumanImage: true,
      propertyDetails: null,
      smartProspects: []
    }
  }
  
  // Step 2: Generate property details
  const propertyDetails = generatePropertyDetails(identifiedCategory.name)
  
  // Step 3: Generate smart prospects
  const smartProspects = generateSmartProspects(identifiedCategory, propertyDetails)
  
  return {
    identifiedCategory,
    propertyDetails,
    smartProspects
  }
}
