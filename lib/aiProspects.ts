export interface AIProspectTemplate {
  title: string
  description: string
  estimatedCost: number
  categoryId: number
}

// Mock AI dataset for property prospects based on categories
export const AI_PROSPECT_TEMPLATES: Record<string, AIProspectTemplate[]> = {
  // Residential Properties (category_id: 1)
  "1": [
    {
      title: "Modern Kitchen Renovation",
      description:
        "Transform your kitchen with contemporary fixtures, energy-efficient appliances, and smart storage solutions. Includes granite countertops, custom cabinetry, and LED lighting systems.",
      estimatedCost: 2500000,
      categoryId: 1,
    },
    {
      title: "Smart Home Automation",
      description:
        "Upgrade to a fully automated smart home system with IoT devices, security cameras, smart locks, and energy management systems for enhanced comfort and security.",
      estimatedCost: 1800000,
      categoryId: 1,
    },
    {
      title: "Luxury Bathroom Upgrade",
      description:
        "Create a spa-like bathroom experience with premium fixtures, heated floors, rainfall shower systems, and modern vanities with smart mirrors.",
      estimatedCost: 1500000,
      categoryId: 1,
    },
    {
      title: "Energy-Efficient Solar Installation",
      description:
        "Install solar panels and battery storage systems to reduce electricity costs by 80% while increasing property value and environmental sustainability.",
      estimatedCost: 3200000,
      categoryId: 1,
    },
    {
      title: "Outdoor Living Space Development",
      description:
        "Design and build an outdoor entertainment area with pergola, outdoor kitchen, fire pit, and landscaped garden for year-round enjoyment.",
      estimatedCost: 2200000,
      categoryId: 1,
    },
  ],

  // Commercial Properties (category_id: 2)
  "2": [
    {
      title: "Co-working Space Conversion",
      description:
        "Transform the property into a modern co-working facility with flexible workstations, meeting rooms, high-speed internet infrastructure, and collaborative spaces.",
      estimatedCost: 8500000,
      categoryId: 2,
    },
    {
      title: "Retail Shopping Complex",
      description:
        "Develop a multi-tenant retail space with modern storefronts, central air conditioning, parking facilities, and digital advertising displays.",
      estimatedCost: 15000000,
      categoryId: 2,
    },
    {
      title: "Medical Center Development",
      description:
        "Convert to a specialized medical facility with consultation rooms, diagnostic equipment spaces, pharmacy, and patient waiting areas with modern amenities.",
      estimatedCost: 12000000,
      categoryId: 2,
    },
    {
      title: "Tech Hub and Innovation Center",
      description:
        "Create a technology incubator with high-speed fiber internet, server rooms, presentation theaters, and flexible office spaces for startups and tech companies.",
      estimatedCost: 18000000,
      categoryId: 2,
    },
    {
      title: "Restaurant and Food Court",
      description:
        "Develop a culinary destination with multiple restaurant spaces, commercial kitchens, dining areas, and food delivery infrastructure.",
      estimatedCost: 10500000,
      categoryId: 2,
    },
  ],

  // Land Properties (category_id: 3)
  "3": [
    {
      title: "Residential Estate Development",
      description:
        "Develop a gated residential community with modern homes, recreational facilities, security systems, and green spaces. Includes infrastructure development and utilities.",
      estimatedCost: 45000000,
      categoryId: 3,
    },
    {
      title: "Agricultural Farm Setup",
      description:
        "Establish a modern agricultural operation with irrigation systems, greenhouse facilities, storage barns, and equipment for sustainable farming practices.",
      estimatedCost: 8500000,
      categoryId: 3,
    },
    {
      title: "Industrial Park Development",
      description:
        "Create an industrial complex with warehouses, manufacturing facilities, loading docks, and transportation infrastructure for logistics and manufacturing businesses.",
      estimatedCost: 35000000,
      categoryId: 3,
    },
    {
      title: "Recreational Park and Resort",
      description:
        "Develop a leisure destination with accommodation facilities, recreational activities, event spaces, and natural landscape preservation for tourism and hospitality.",
      estimatedCost: 28000000,
      categoryId: 3,
    },
    {
      title: "Solar Farm Installation",
      description:
        "Establish a large-scale solar energy facility with photovoltaic panels, inverters, and grid connection infrastructure to generate renewable energy for commercial sale.",
      estimatedCost: 22000000,
      categoryId: 3,
    },
  ],

  // Material Properties (category_id: 4)
  "4": [
    {
      title: "Premium Building Materials Supply",
      description:
        "Establish a high-end building materials distribution center with quality cement, steel, tiles, and finishing materials for construction projects.",
      estimatedCost: 5500000,
      categoryId: 4,
    },
    {
      title: "Sustainable Construction Materials",
      description:
        "Develop eco-friendly building materials including recycled concrete, bamboo products, and energy-efficient insulation materials for green construction.",
      estimatedCost: 4200000,
      categoryId: 4,
    },
    {
      title: "Smart Building Components",
      description:
        "Create a supply chain for intelligent building materials including smart glass, automated systems, and IoT-enabled construction components.",
      estimatedCost: 6800000,
      categoryId: 4,
    },
    {
      title: "Luxury Finishing Materials",
      description:
        "Curate premium finishing materials including imported marble, hardwood flooring, designer fixtures, and high-end architectural elements.",
      estimatedCost: 7500000,
      categoryId: 4,
    },
    {
      title: "Construction Equipment Rental",
      description:
        "Establish a construction equipment rental business with modern machinery, tools, and vehicles to serve the growing construction industry.",
      estimatedCost: 12000000,
      categoryId: 4,
    },
  ],
}

export function generateProspectsForProperty(categoryId: number, propertyWorth?: number): AIProspectTemplate[] {
  const templates = AI_PROSPECT_TEMPLATES[categoryId.toString()] || []

  // Select 4 random prospects from the category
  const shuffled = [...templates].sort(() => 0.5 - Math.random())
  const selectedProspects = shuffled.slice(0, 4)

  // Adjust costs based on property worth if provided
  if (propertyWorth) {
    return selectedProspects.map((prospect) => ({
      ...prospect,
      estimatedCost: Math.round(prospect.estimatedCost * (propertyWorth / 10000000)), // Scale based on property worth
    }))
  }

  return selectedProspects
}
