export interface PropertyProspect {
  title: string
  description: string
  purchaseCostFactor: number
  developmentCostFactor: number
  realizationTips: string[]
}

export interface CategoryProspects {
  [key: string]: PropertyProspect[]
}

export const MOCK_PROSPECTS: CategoryProspects = {
  residential: [
    {
      title: "Short Let Plan",
      description:
        "Convert your residential property into a short-term rental for tourists, expatriates, or corporate guests. Works best in high-traffic cities like Lagos, Abuja, and Port Harcourt.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.15,
      realizationTips: [
        "Furnish with modern furniture and essential appliances",
        "Offer 24/7 electricity via solar or generator backup",
        "List on Airbnb, Booking.com, and local property sites",
        "Market with professional photography and virtual tours",
        "Comply with local short-let licensing requirements",
      ],
    },
    {
      title: "Student Housing Investment",
      description:
        "Repurpose your residential building into a hostel or shared apartments targeting university students in areas like Ibadan, Nsukka, or Benin City.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.25,
      realizationTips: [
        "Divide large spaces into smaller rentable units",
        "Provide basic furnishings like beds, wardrobes, and desks",
        "Install prepaid electricity meters to manage usage",
        "Offer reliable water supply and security",
        "Partner with nearby universities for referrals",
      ],
    },
    {
      title: "Family Rental Hub",
      description:
        "Transform your property into premium family housing with modern amenities targeting middle to upper-class families.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.2,
      realizationTips: [
        "Install modern kitchen appliances and fixtures",
        "Create child-friendly spaces and safety features",
        "Provide parking spaces and security systems",
        "Ensure reliable power and water supply",
        "Market to expatriate families and professionals",
      ],
    },
    {
      title: "Co-living Space",
      description:
        "Create a modern co-living space for young professionals and digital nomads with shared amenities and private rooms.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.3,
      realizationTips: [
        "Design flexible living spaces with privacy",
        "Install high-speed internet and work areas",
        "Create shared kitchens and recreational spaces",
        "Implement smart home technology",
        "Target tech workers and remote professionals",
      ],
    },
    {
      title: "Senior Living Facility",
      description:
        "Convert property into assisted living or senior-friendly housing with accessibility features and care services.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.35,
      realizationTips: [
        "Install accessibility ramps and grab bars",
        "Provide medical alert systems",
        "Create common areas for social activities",
        "Partner with healthcare providers",
        "Ensure 24/7 security and emergency response",
      ],
    },
    {
      title: "Luxury Apartment Complex",
      description:
        "Develop high-end residential units with premium amenities targeting affluent tenants in prime locations.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.4,
      realizationTips: [
        "Install premium finishes and appliances",
        "Provide concierge and maintenance services",
        "Create recreational facilities like gym and pool",
        "Implement smart building technology",
        "Market to high-income professionals and executives",
      ],
    },
    {
      title: "Affordable Housing Project",
      description:
        "Create budget-friendly housing units for low to middle-income families with government partnership opportunities.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.1,
      realizationTips: [
        "Use cost-effective building materials",
        "Apply for government housing subsidies",
        "Implement energy-efficient systems",
        "Create community spaces and playgrounds",
        "Partner with microfinance institutions",
      ],
    },
    {
      title: "Serviced Apartment Complex",
      description:
        "Develop fully serviced apartments with hotel-like amenities for business travelers and long-term guests.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.25,
      realizationTips: [
        "Provide housekeeping and laundry services",
        "Install business center and meeting rooms",
        "Offer airport shuttle and concierge services",
        "Market to corporate clients and travel agencies",
        "Maintain hotel-standard cleanliness and service",
      ],
    },
    {
      title: "Green Residential Development",
      description: "Create eco-friendly residential units with sustainable features and renewable energy systems.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.3,
      realizationTips: [
        "Install solar panels and rainwater harvesting",
        "Use sustainable building materials",
        "Implement waste management systems",
        "Create green spaces and gardens",
        "Market to environmentally conscious buyers",
      ],
    },
    {
      title: "Mixed-Use Residential",
      description:
        "Combine residential units with commercial spaces like shops or offices to maximize property utilization.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.35,
      realizationTips: [
        "Design separate entrances for residential and commercial",
        "Ensure proper zoning compliance",
        "Create parking solutions for both uses",
        "Market residential units to urban professionals",
        "Lease commercial spaces to complementary businesses",
      ],
    },
  ],
  commercial: [
    {
      title: "Tech Hub & Co-working Space",
      description:
        "Transform your commercial property into a modern co-working space targeting startups, freelancers, and remote workers.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.25,
      realizationTips: [
        "Install high-speed fiber internet and backup power",
        "Create flexible workspaces with modern furniture",
        "Provide meeting rooms and event spaces",
        "Offer virtual office services and mail handling",
        "Partner with tech communities and startup incubators",
      ],
    },
    {
      title: "Retail Shopping Complex",
      description:
        "Develop a multi-tenant retail space with diverse shops, restaurants, and service providers in high-traffic areas.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.3,
      realizationTips: [
        "Design attractive storefronts and common areas",
        "Provide ample parking and security systems",
        "Create anchor tenant spaces for major brands",
        "Implement modern POS and payment systems",
        "Market to both local and international retailers",
      ],
    },
    {
      title: "Medical Center Complex",
      description:
        "Convert property into a medical facility housing multiple healthcare providers, clinics, and diagnostic centers.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.4,
      realizationTips: [
        "Install medical-grade electrical and plumbing systems",
        "Ensure compliance with healthcare regulations",
        "Provide specialized medical equipment infrastructure",
        "Create patient-friendly waiting and consultation areas",
        "Partner with healthcare professionals and insurance providers",
      ],
    },
    {
      title: "Event & Conference Center",
      description:
        "Develop a versatile event space for weddings, corporate events, conferences, and social gatherings.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.35,
      realizationTips: [
        "Install professional audio-visual equipment",
        "Create flexible spaces with movable partitions",
        "Provide catering kitchen and service areas",
        "Ensure adequate parking and accessibility",
        "Market to event planners and corporate clients",
      ],
    },
    {
      title: "Logistics & Warehouse Hub",
      description:
        "Transform property into a modern logistics center with storage, distribution, and e-commerce fulfillment capabilities.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.2,
      realizationTips: [
        "Install loading docks and material handling equipment",
        "Implement inventory management systems",
        "Provide office spaces for logistics operations",
        "Ensure proximity to major transportation routes",
        "Partner with e-commerce and logistics companies",
      ],
    },
    {
      title: "Educational Training Center",
      description:
        "Create a modern training facility for vocational education, professional development, and skill acquisition programs.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.3,
      realizationTips: [
        "Install modern classroom technology and equipment",
        "Create specialized workshops and laboratory spaces",
        "Provide library and study areas",
        "Partner with educational institutions and certification bodies",
        "Market to government training programs and corporations",
      ],
    },
    {
      title: "Food Court & Restaurant Hub",
      description:
        "Develop a culinary destination with multiple restaurants, cafes, and food vendors in a shared dining environment.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.35,
      realizationTips: [
        "Install commercial kitchen infrastructure",
        "Create attractive dining areas with varied seating",
        "Provide shared utilities and waste management",
        "Implement food safety and hygiene standards",
        "Market to diverse culinary entrepreneurs",
      ],
    },
    {
      title: "Fitness & Wellness Center",
      description:
        "Transform property into a comprehensive fitness facility with gym equipment, studios, and wellness services.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.4,
      realizationTips: [
        "Install specialized flooring and ventilation systems",
        "Provide changing rooms and shower facilities",
        "Create diverse workout and studio spaces",
        "Partner with fitness professionals and wellness practitioners",
        "Market to health-conscious individuals and corporate wellness programs",
      ],
    },
    {
      title: "Auto Service Complex",
      description: "Create a comprehensive automotive service center with repair shops, car wash, and parts retail.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.25,
      realizationTips: [
        "Install automotive lifts and specialized equipment",
        "Provide parts storage and retail display areas",
        "Create customer waiting areas with amenities",
        "Ensure proper drainage and environmental compliance",
        "Partner with automotive brands and parts suppliers",
      ],
    },
    {
      title: "Creative Arts Studio Complex",
      description:
        "Develop artist studios, galleries, and creative spaces for painters, sculptors, photographers, and other artists.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.3,
      realizationTips: [
        "Provide natural lighting and ventilation",
        "Install specialized electrical and water systems",
        "Create exhibition and gallery spaces",
        "Offer storage and equipment rental services",
        "Market to art communities and creative professionals",
      ],
    },
  ],
  industrial: [
    {
      title: "Manufacturing Plant Conversion",
      description:
        "Transform industrial property into a modern manufacturing facility for local production and export opportunities.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.45,
      realizationTips: [
        "Install heavy-duty electrical and mechanical systems",
        "Provide specialized flooring for industrial equipment",
        "Ensure compliance with manufacturing regulations",
        "Create quality control and testing laboratories",
        "Partner with manufacturers and export agencies",
      ],
    },
    {
      title: "Cold Storage & Processing Facility",
      description:
        "Develop temperature-controlled storage and food processing capabilities for agricultural and pharmaceutical products.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.5,
      realizationTips: [
        "Install industrial refrigeration and freezing systems",
        "Provide specialized insulation and vapor barriers",
        "Implement food safety and pharmaceutical standards",
        "Create loading and processing areas",
        "Partner with farmers, food processors, and pharmaceutical companies",
      ],
    },
    {
      title: "Renewable Energy Production",
      description:
        "Convert industrial land into solar or wind energy production facility with grid connection capabilities.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.6,
      realizationTips: [
        "Install solar panels or wind turbines",
        "Provide electrical infrastructure and grid connections",
        "Ensure compliance with energy regulations",
        "Create maintenance and monitoring facilities",
        "Partner with utility companies and energy buyers",
      ],
    },
    {
      title: "Waste Management & Recycling Center",
      description:
        "Establish a comprehensive waste processing and recycling facility serving municipal and industrial clients.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.4,
      realizationTips: [
        "Install waste sorting and processing equipment",
        "Provide environmental protection systems",
        "Ensure compliance with environmental regulations",
        "Create collection and distribution logistics",
        "Partner with municipalities and waste generators",
      ],
    },
    {
      title: "Data Center & Server Farm",
      description:
        "Transform industrial space into a modern data center providing cloud services and data storage solutions.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.55,
      realizationTips: [
        "Install redundant power and cooling systems",
        "Provide high-speed internet connectivity",
        "Implement security and access control systems",
        "Create monitoring and maintenance facilities",
        "Partner with tech companies and cloud service providers",
      ],
    },
    {
      title: "Automotive Assembly Plant",
      description: "Create vehicle assembly and automotive parts manufacturing facility with modern production lines.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.65,
      realizationTips: [
        "Install assembly line equipment and robotics",
        "Provide specialized tools and testing equipment",
        "Ensure compliance with automotive standards",
        "Create parts storage and logistics areas",
        "Partner with automotive manufacturers and suppliers",
      ],
    },
    {
      title: "Textile & Garment Factory",
      description:
        "Establish modern textile production and garment manufacturing facility for local and export markets.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.35,
      realizationTips: [
        "Install industrial sewing and textile machinery",
        "Provide fabric storage and cutting areas",
        "Ensure compliance with labor and safety standards",
        "Create quality control and finishing departments",
        "Partner with fashion brands and textile suppliers",
      ],
    },
    {
      title: "Chemical Processing Plant",
      description:
        "Convert industrial property into chemical processing facility for pharmaceuticals, cosmetics, or industrial chemicals.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.7,
      realizationTips: [
        "Install specialized chemical processing equipment",
        "Provide safety and environmental protection systems",
        "Ensure compliance with chemical industry regulations",
        "Create laboratory and quality control facilities",
        "Partner with chemical companies and research institutions",
      ],
    },
    {
      title: "Logistics & Distribution Hub",
      description:
        "Develop large-scale logistics center with automated sorting, storage, and distribution capabilities.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.3,
      realizationTips: [
        "Install automated sorting and conveyor systems",
        "Provide fleet management and maintenance facilities",
        "Implement inventory tracking and management systems",
        "Create cross-docking and distribution areas",
        "Partner with e-commerce and logistics companies",
      ],
    },
    {
      title: "Mining & Quarry Operations",
      description:
        "Establish mining or quarrying operations for construction materials, minerals, or precious metals extraction.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.8,
      realizationTips: [
        "Install heavy mining and processing equipment",
        "Provide environmental monitoring and restoration systems",
        "Ensure compliance with mining regulations",
        "Create transportation and logistics infrastructure",
        "Partner with construction companies and mineral buyers",
      ],
    },
  ],
  agricultural: [
    {
      title: "Smart Greenhouse Complex",
      description:
        "Develop climate-controlled greenhouse facilities for year-round production of high-value crops and vegetables.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.4,
      realizationTips: [
        "Install automated climate control and irrigation systems",
        "Provide hydroponic or aeroponic growing systems",
        "Implement pest and disease monitoring technology",
        "Create post-harvest processing and packaging facilities",
        "Partner with restaurants, supermarkets, and export companies",
      ],
    },
    {
      title: "Organic Farm & Certification",
      description:
        "Convert agricultural land into certified organic farming operation producing premium organic products.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.25,
      realizationTips: [
        "Implement organic farming practices and certification",
        "Install organic-approved irrigation and pest control",
        "Create composting and soil improvement systems",
        "Develop direct-to-consumer marketing channels",
        "Partner with organic food retailers and health-conscious consumers",
      ],
    },
    {
      title: "Aquaculture & Fish Farming",
      description:
        "Establish modern fish farming operation with ponds, tanks, and processing facilities for local and export markets.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.35,
      realizationTips: [
        "Install water circulation and filtration systems",
        "Provide fish feed storage and distribution systems",
        "Implement water quality monitoring technology",
        "Create fish processing and cold storage facilities",
        "Partner with restaurants, markets, and seafood distributors",
      ],
    },
    {
      title: "Livestock Ranch & Dairy",
      description:
        "Develop modern livestock operation with cattle, goats, or poultry for meat, dairy, and egg production.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.3,
      realizationTips: [
        "Install modern animal housing and feeding systems",
        "Provide veterinary care and health monitoring",
        "Implement milking and egg collection automation",
        "Create feed storage and processing facilities",
        "Partner with dairy processors and meat distributors",
      ],
    },
    {
      title: "Agro-Processing Center",
      description: "Establish facility for processing raw agricultural products into value-added foods and beverages.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.45,
      realizationTips: [
        "Install food processing and packaging equipment",
        "Provide cold storage and preservation systems",
        "Ensure compliance with food safety regulations",
        "Create quality control and testing laboratories",
        "Partner with farmers, retailers, and export companies",
      ],
    },
    {
      title: "Seed Production & Research",
      description:
        "Develop specialized facility for producing high-quality seeds and conducting agricultural research.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.5,
      realizationTips: [
        "Install controlled environment growing facilities",
        "Provide seed processing and storage equipment",
        "Implement genetic testing and quality control",
        "Create research laboratories and field testing areas",
        "Partner with agricultural research institutions and farmers",
      ],
    },
    {
      title: "Medicinal Plant Cultivation",
      description:
        "Establish cultivation and processing of medicinal plants and herbs for pharmaceutical and wellness industries.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.35,
      realizationTips: [
        "Install specialized drying and processing equipment",
        "Provide organic certification and quality standards",
        "Implement extraction and purification systems",
        "Create packaging and labeling facilities",
        "Partner with pharmaceutical companies and wellness brands",
      ],
    },
    {
      title: "Vertical Farming Operation",
      description:
        "Create multi-level indoor farming system using LED lighting and hydroponic technology for maximum yield.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.6,
      realizationTips: [
        "Install LED growing lights and automation systems",
        "Provide hydroponic nutrient delivery systems",
        "Implement climate control and monitoring technology",
        "Create harvesting and packaging automation",
        "Partner with urban markets and premium restaurants",
      ],
    },
    {
      title: "Agritourism & Farm Experience",
      description:
        "Develop agricultural property into tourist destination with farm tours, accommodation, and educational programs.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.4,
      realizationTips: [
        "Create visitor facilities and accommodation",
        "Develop educational and recreational programs",
        "Install farm-to-table dining and retail spaces",
        "Provide guided tours and hands-on experiences",
        "Partner with tourism agencies and educational institutions",
      ],
    },
    {
      title: "Biofuel Production Facility",
      description:
        "Convert agricultural land for growing energy crops and producing biofuels like ethanol or biodiesel.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.55,
      realizationTips: [
        "Install biofuel processing and refining equipment",
        "Provide feedstock storage and handling systems",
        "Ensure compliance with energy and environmental regulations",
        "Create distribution and logistics infrastructure",
        "Partner with energy companies and government programs",
      ],
    },
  ],
}

export function generateProspectsForProperty(
  categoryId: number,
  estimatedWorth?: number,
): Array<{
  title: string
  description: string
  estimatedCost: number
}> {
  // Map category IDs to category names (adjust these based on your actual category IDs)
  const categoryMap: { [key: number]: string } = {
    1: "residential",
    2: "commercial",
    3: "industrial",
    4: "agricultural",
    5: "agricultural", // Assuming Land falls under agricultural for now
  }

  // Also handle by category name if passed as string
  const getCategoryProspects = (categoryId: number) => {
    const categoryName = categoryMap[categoryId] || "residential"
    return MOCK_PROSPECTS[categoryName] || MOCK_PROSPECTS.residential
  }

  const categoryProspects = getCategoryProspects(categoryId)

  // Randomly select 4 prospects from the category
  const shuffled = [...categoryProspects].sort(() => 0.5 - Math.random())
  const selectedProspects = shuffled.slice(0, 4)

  return selectedProspects.map((prospect) => {
    const baseWorth = estimatedWorth || 10000000 // Default 10M if no estimated worth
    const purchaseCost = baseWorth * prospect.purchaseCostFactor
    const developmentCost = baseWorth * prospect.developmentCostFactor
    const estimatedCost = purchaseCost + developmentCost

    return {
      title: prospect.title,
      description: prospect.description,
      estimatedCost: Math.round(estimatedCost),
    }
  })
}

export function getProspectDetails(categoryId: number, prospectTitle: string): PropertyProspect | null {
  const categoryMap: { [key: number]: string } = {
    1: "residential",
    2: "commercial",
    3: "industrial",
    4: "agricultural",
  }

  const categoryName = categoryMap[categoryId] || "residential"
  const categoryProspects = MOCK_PROSPECTS[categoryName] || MOCK_PROSPECTS.residential

  return categoryProspects.find((prospect) => prospect.title === prospectTitle) || null
}
