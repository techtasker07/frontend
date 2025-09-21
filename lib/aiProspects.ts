export interface PropertyProspect {
  title: string
  description: string
  purchaseCostFactor: number
  developmentCostFactor: number
  realizationTips: string[]
  imageUrl: string
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
      imageUrl: "https://api.deepai.org/job-view-file/ad2691ee-50c2-4ceb-93da-affb25c03bd2/outputs/output.jpg",
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
      imageUrl: "https://api.deepai.org/job-view-file/7ecf1ec6-0c4e-4697-b82d-8f2479e95f9e/outputs/output.jpg",
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
      imageUrl: "https://api.deepai.org/job-view-file/f6805aa0-f27e-418a-ad86-89c2e0f3c472/outputs/output.jpg",
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
      imageUrl: "https://api.deepai.org/job-view-file/32f9d599-6c2b-4f3d-a783-7ff34b45c31f/outputs/output.jpg",
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
      imageUrl: "https://api.deepai.org/job-view-file/60160bde-812b-4e53-8087-ba1bfcc2a2ad/outputs/output.jpg",
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
      imageUrl: "https://api.deepai.org/job-view-file/ac10f607-71f0-4ee2-b088-ff11a43ecf8e/outputs/output.jpg",
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
      imageUrl: "https://api.deepai.org/job-view-file/8a90714d-7770-456c-98de-1e903a820f94/outputs/output.jpg",
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
      imageUrl: "https://api.deepai.org/job-view-file/990a0c7d-86ad-444a-b147-2c8d91963128/outputs/output.jpg",
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
      imageUrl: "https://api.deepai.org/job-view-file/d295a664-601d-4e1a-b0c9-77df41043d59/outputs/output.jpg",
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
      imageUrl: "https://api.deepai.org/job-view-file/7c061691-e328-4511-b9f1-1a7e8513df13/outputs/output.jpg",
    },
    {
      title: "Modular Housing Development",
      description:
        "Develop prefabricated, modular homes that can be quickly assembled and sold or rented at competitive prices, ideal for emerging suburban areas.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.12,
      realizationTips: [
        "Partner with modular home manufacturers for bulk supply",
        "Use container conversions for low-cost rapid builds",
        "Target young families and first-time homeowners",
        "Seek government or NGO grants for housing innovation",
        "Market on the speed and flexibility of delivery"
      ],
      imageUrl: "https://api.deepai.org/job-view-file/1e1be23c-ed37-4c56-9871-ccb0c819b402/outputs/output.jpg",
    },
    {
      title: "Urban Renewal Apartment Conversion",
      description:
        "Convert old, underutilised buildings in city centres into modern residential flats as part of urban regeneration drives.",
      purchaseCostFactor: 0.8,
      developmentCostFactor: 0.28,
      realizationTips: [
        "Target defunct commercial or colonial-era properties",
        "Partner with state urban renewal agencies",
        "Focus on mixed-income tenant strategies",
        "Incorporate modern utilities without losing heritage charm",
        "Market to upwardly mobile professionals"
      ],
      imageUrl: "https://api.deepai.org/job-view-file/3e970439-aafb-4f5b-8f3d-0669e378b9b0/outputs/output.jpg",
    },
    {
      title: "Build-to-Rent Micro Apartments",
      description:
        "Develop compact, affordable rental units designed for singles and young professionals in high-demand urban areas.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.18,
      realizationTips: [
        "Focus on 1-bedroom and studio layouts",
        "Provide high-speed internet and shared facilities",
        "Use modular kitchens and convertible furniture",
        "Advertise as a cost-effective city-living solution",
        "Partner with proptech platforms for digital leasing"
      ],
      imageUrl: "https://api.deepai.org/job-view-file/82598904-7914-4958-9290-e4134886f044/outputs/output.jpg",
    },
    {
      title: "Diaspora-Targeted Off-Plan Developments",
      description:
        "Create gated estates marketed to Nigerians abroad looking for secure property investments.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.25,
      realizationTips: [
        "Offer flexible payment plans in USD, GBP, or EUR",
        "Ensure top-tier title documentation and legal clarity",
        "Provide progress tracking via live-streamed site updates",
        "Include luxury security and facility management",
        "Leverage diaspora property expos"
      ],
      imageUrl: "https://api.deepai.org/job-view-file/5a340f1b-6c85-4820-82fa-77a3ca2b90d7/outputs/output.jpg",
    },
    {
      title: "Agricultural-Residential Hybrid Estates",
      description:
        "Combine residential housing with small farm plots or community gardens, targeting agri-entrepreneurs and food sustainability advocates.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.2,
      realizationTips: [
        "Allocate a portion of the estate for vegetable gardens",
        "Provide shared farming tools and storage facilities",
        "Partner with agricultural cooperatives",
        "Market to retirees and food enthusiasts",
        "Integrate renewable energy for irrigation systems"
      ],
      imageUrl: "https://api.deepai.org/job-view-file/ed0836f2-0b8c-4709-a212-531123181ece/outputs/output.jpg",
    },
    {
      title: "Remote Work-Friendly Suburban Villas",
      description:
        "Develop suburban or peri-urban housing optimised for remote workers seeking space, quiet, and better living costs.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.22,
      realizationTips: [
        "Include dedicated home office spaces",
        "Provide estate-wide fibre-optic internet",
        "Create co-working hubs within the estate",
        "Market to tech workers, freelancers, and SMEs",
        "Emphasise health, safety, and reduced city stress"
      ],
      imageUrl: "https://api.deepai.org/job-view-file/7c4291fa-83b4-4c4d-bd43-bcab6c0986b8/outputs/output.jpg",
    },
    {
      title: "Rent-to-Own Affordable Flats",
      description:
        "Create housing projects that allow tenants to transition into ownership through structured rent-to-own payment models.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.15,
      realizationTips: [
        "Partner with mortgage providers and microfinance banks",
        "Build durable, low-maintenance units",
        "Target civil servants and salaried workers",
        "Provide flexible 5–15-year payment plans",
        "Leverage government housing incentive schemes"
      ],
      imageUrl: "https://api.deepai.org/job-view-file/1e9a07c1-1572-4994-bf34-da0c38703ced/outputs/output.jpg",
    },
    {
      title: "Climate-Resilient Coastal Homes",
      description:
        "Develop flood-resistant residential properties in coastal or flood-prone cities using elevated designs and drainage innovations.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.3,
      realizationTips: [
        "Use stilts, reinforced concrete, and elevated utilities",
        "Incorporate water harvesting and flood diversion systems",
        "Target NGOs, expatriates, and climate-conscious buyers",
        "Obtain disaster-resilience certification",
        "Market as future-proof coastal living"
      ],
      imageUrl: "https://api.deepai.org/job-view-file/65253c98-8b1c-40cf-8c4a-14acebd1ef88/outputs/output.jpg",
    },
    {
      title: "Regeneration of Military/Police Barracks into Civil Housing",
      description:
        "Redevelop decommissioned or underused security force barracks into gated civilian residential communities.",
      purchaseCostFactor: 0.9,
      developmentCostFactor: 0.27,
      realizationTips: [
        "Negotiate acquisition with government agencies",
        "Retain existing road networks and utilities where possible",
        "Upgrade security infrastructure for civilian comfort",
        "Market to middle-income earners",
        "Integrate commercial strips for self-sufficiency"
      ],
      imageUrl: "https://api.deepai.org/job-view-file/42664e94-20d0-4c18-86c2-59c171d726d3/outputs/output.jpg",
    },
    {
      title: "Smart Compact Estates for Middle-Class Families",
      description:
        "Build tech-enabled mid-size estates with automation for energy, security, and utilities aimed at middle-class urbanites.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.26,
      realizationTips: [
        "Install solar and battery systems for 24/7 power",
        "Use smart locks, CCTV, and IoT-based metering",
        "Create app-based estate management",
        "Provide shared playgrounds and green zones",
        "Market as affordable smart living"
      ],
      imageUrl: "https://api.deepai.org/job-view-file/f9ad38e3-9deb-4dd2-a2b1-4b0b10641a47/outputs/output.jpg",
    },
    {
      title: "Mixed-Generation Co-Housing",
      description:
        "Design residential communities where multiple generations live together in shared but segmented spaces, fostering support networks and reducing living costs.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.28,
      realizationTips: [
        "Provide private units with shared kitchens and lounges",
        "Include childcare and eldercare facilities",
        "Promote social activities that bridge generations",
        "Offer flexible rental or ownership structures",
        "Market to families seeking community living"
      ],
      imageUrl: "https://api.deepai.org/job-view-file/3c788d87-c2f2-4c0f-a6fe-8b329f848456/outputs/output.jpg",
    },
    {
      title: "Wellness-Oriented Residential Communities",
      description:
        "Develop housing centred around health and wellness with access to nature, fitness facilities, and holistic healthcare services.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.3,
      realizationTips: [
        "Include on-site gyms, yoga studios, and walking trails",
        "Integrate air and water purification systems",
        "Partner with wellness brands and clinics",
        "Design open, green landscapes",
        "Market to health-conscious professionals and retirees"
      ],
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Live-Work Hybrid Lofts",
      description:
        "Create adaptable apartments that double as professional workspaces for freelancers, entrepreneurs, and small business owners.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.26,
      realizationTips: [
        "Provide soundproofed work zones within units",
        "Include communal meeting rooms and co-working hubs",
        "Offer high-speed internet and smart office tech",
        "Comply with mixed-use zoning laws",
        "Market to startups, remote workers, and creatives"
      ],
      imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Floating or Water-Edge Homes",
      description:
        "Develop floating or water-adjacent residential units for waterfront cities, integrating climate adaptation strategies.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.35,
      realizationTips: [
        "Use buoyant platforms and flood-resilient materials",
        "Incorporate renewable energy like tidal or solar",
        "Partner with marine architects",
        "Market as eco-luxury or climate-resilient housing",
        "Target tourism-driven waterfront economies"
      ],
      imageUrl: "https://images.unsplash.com/photo-1520637836862-4d197d17c11a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Circular Economy Housing",
      description:
        "Build residential developments using reclaimed materials and waste-to-resource strategies to reduce costs and carbon footprint.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.2,
      realizationTips: [
        "Source materials from deconstructed buildings",
        "Incorporate recycling and composting systems",
        "Partner with sustainability-focused NGOs",
        "Offer workshops on eco-living for residents",
        "Market to environmentally conscious buyers"
      ],
      imageUrl: "https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "High-Density Vertical Villages",
      description:
        "Construct tall, mixed-use residential towers that function like self-contained villages with shops, schools, and healthcare facilities.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.4,
      realizationTips: [
        "Incorporate vertical farming and rooftop gardens",
        "Ensure multiple communal areas for socialising",
        "Provide daycare, clinics, and small retail within the tower",
        "Use smart building technology for efficiency",
        "Market to urban professionals and young families"
      ],
      imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Energy-Positive Housing",
      description:
        "Develop homes that produce more energy than they consume through advanced renewable systems and storage solutions.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.35,
      realizationTips: [
        "Install oversized solar arrays with battery storage",
        "Incorporate passive heating and cooling designs",
        "Sell excess energy back to the grid",
        "Use smart monitoring to optimise consumption",
        "Market as a cost-saving and eco-forward investment"
      ],
      imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Cooperative Housing Models",
      description:
        "Establish residential cooperatives where residents jointly own and manage the property, reducing costs and fostering collaboration.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.18,
      realizationTips: [
        "Offer shared decision-making structures",
        "Create communal gardens, kitchens, and workshops",
        "Ensure transparent maintenance cost-sharing",
        "Partner with cooperative housing associations",
        "Market to budget-conscious communities"
      ],
      imageUrl: "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Resort-Style Retirement Villages",
      description:
        "Build upscale retirement communities offering hospitality-level amenities and medical support for aging populations.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.38,
      realizationTips: [
        "Include pools, spas, and gourmet dining options",
        "Provide on-site healthcare and emergency response",
        "Offer hobby and recreational facilities",
        "Market internationally to retirees seeking affordable luxury",
        "Design with full accessibility in mind"
      ],
      imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Digital Nomad Eco-Communities",
      description:
        "Create sustainable, globally connected residential hubs designed for location-independent professionals.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.32,
      realizationTips: [
        "Offer ultra-high-speed internet and co-working spaces",
        "Integrate renewable energy and eco-architecture",
        "Create community events for networking",
        "Partner with international travel visa programmes",
        "Market to digital nomads and remote-first companies"
      ],
      imageUrl: "https://images.unsplash.com/photo-1497436072909-f5e4be1d9126?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1523580846011-d3982bcd500e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1529417305485-480225b5bb97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Agro-Processing & Packaging Center",
      description:
        "Develop a commercial facility for processing, packaging, and distributing agricultural products to local and export markets.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.25,
      realizationTips: [
        "Install food-grade processing equipment",
        "Ensure compliance with NAFDAC and export standards",
        "Provide cold storage and warehousing",
        "Partner with farming cooperatives",
        "Market to supermarkets and export buyers"
      ],
      imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Transport Terminal & Commercial Hub",
      description:
        "Create a modern transport interchange with shops, ticketing offices, and passenger amenities in high-traffic zones.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.3,
      realizationTips: [
        "Include waiting lounges and restrooms",
        "Provide secure parking for buses and taxis",
        "Integrate retail and food vendors",
        "Comply with transport regulatory requirements",
        "Partner with major transport companies"
      ],
      imageUrl: "https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Solar Energy Showroom & Service Center",
      description:
        "Establish a retail and service hub for solar panels, batteries, and renewable energy solutions.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.22,
      realizationTips: [
        "Include demo installations for customers",
        "Offer repair and maintenance services",
        "Partner with international solar brands",
        "Market to residential estates and SMEs",
        "Provide financing options for buyers"
      ],
      imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Cold Chain Storage & Distribution Facility",
      description:
        "Develop a cold storage hub for perishable goods, supporting agriculture, fisheries, and pharmaceuticals.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.28,
      realizationTips: [
        "Install industrial refrigeration and backup power",
        "Ensure strict temperature monitoring",
        "Offer last-mile refrigerated delivery",
        "Target supermarkets, hospitals, and exporters",
        "Partner with logistics firms"
      ],
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Tech-Enabled Market Plaza",
      description:
        "Modernise traditional markets with digital payment systems, clean infrastructure, and organised stalls.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.2,
      realizationTips: [
        "Implement cashless payment solutions",
        "Ensure waste management and sanitation",
        "Provide security and CCTV monitoring",
        "Create designated loading/unloading zones",
        "Market to traders and cooperatives"
      ],
      imageUrl: "https://images.unsplash.com/photo-1555529669-2269763671c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Film & Media Production Studio",
      description:
        "Build a facility for Nollywood and digital content creators with studios, editing suites, and equipment rental.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.35,
      realizationTips: [
        "Install soundproof studios and green screens",
        "Offer high-end camera and lighting rentals",
        "Provide co-working spaces for creatives",
        "Partner with streaming platforms",
        "Market to filmmakers, advertisers, and influencers"
      ],
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Export Trade Showroom",
      description:
        "Create a permanent display centre for Nigerian export goods, connecting producers with international buyers.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.3,
      realizationTips: [
        "Curate high-quality, export-ready products",
        "Host trade fairs and networking events",
        "Partner with export councils",
        "Provide translation and documentation support",
        "Target foreign embassies and buyers"
      ],
      imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "ICT Training & Certification Center",
      description:
        "Establish a tech skills hub for coding, cybersecurity, and digital marketing training.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.25,
      realizationTips: [
        "Provide computer labs with high-speed internet",
        "Partner with global certification bodies",
        "Offer flexible payment and scholarship programs",
        "Market to students and working professionals",
        "Host tech community events"
      ],
      imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Business Incubator & Accelerator",
      description:
        "Develop a space for nurturing startups with mentorship, funding access, and shared resources.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.3,
      realizationTips: [
        "Include private offices, shared desks, and meeting rooms",
        "Partner with angel investors and VCs",
        "Offer business advisory services",
        "Host pitch competitions and demo days",
        "Market to early-stage entrepreneurs"
      ],
      imageUrl: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Urban Farming & Agri-Mall",
      description:
        "Combine rooftop and vertical farming with a retail marketplace for fresh produce.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.27,
      realizationTips: [
        "Install hydroponic or aquaponic systems",
        "Offer farm-to-table retail and dining options",
        "Partner with food delivery platforms",
        "Market to health-conscious urban consumers",
        "Provide training on urban agriculture"
      ],
      imageUrl: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Green Energy Business Park",
      description:
        "Develop a commercial complex powered entirely by renewable energy, targeting eco-conscious companies.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.35,
      realizationTips: [
        "Install large-scale solar arrays and battery storage",
        "Provide EV charging stations",
        "Offer green certification to tenants",
        "Market to sustainability-focused firms",
        "Integrate energy-efficient building materials"
      ],
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Experiential Retail Destination",
      description:
        "Create a shopping complex that blends retail with entertainment, art, and interactive experiences.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.4,
      realizationTips: [
        "Include VR zones, pop-up stores, and art exhibits",
        "Partner with global brands for flagship spaces",
        "Host seasonal themed events",
        "Market as a tourist and local attraction",
        "Incorporate social media-friendly design elements"
      ],
      imageUrl: "https://images.unsplash.com/photo-1537944434965-cf4679d1a598?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Bio-Tech Research & Innovation Center",
      description:
        "Develop a hub for biotechnology research and startups with laboratories, offices, and testing facilities.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.5,
      realizationTips: [
        "Provide state-of-the-art lab infrastructure",
        "Ensure compliance with biosafety standards",
        "Partner with universities and pharma companies",
        "Offer shared equipment rental",
        "Market to biotech startups and R&D teams"
      ],
      imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Data Center & Cloud Services Hub",
      description:
        "Construct a high-security, energy-efficient data center to host cloud computing and AI services.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.6,
      realizationTips: [
        "Ensure redundant power and cooling systems",
        "Implement advanced cybersecurity protocols",
        "Partner with telecom and cloud providers",
        "Market to fintech, AI, and enterprise clients",
        "Comply with international data regulations"
      ],
      imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Medical Tourism Facility",
      description:
        "Build a high-standard healthcare complex attracting international patients for specialised treatments.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.45,
      realizationTips: [
        "Include luxury patient accommodation",
        "Partner with global medical experts",
        "Offer multilingual staff and concierge services",
        "Market in regions seeking affordable healthcare",
        "Comply with international medical accreditation"
      ],
      imageUrl: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Circular Economy Business Hub",
      description:
        "Create a space for businesses focused on recycling, upcycling, and sustainable production.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.3,
      realizationTips: [
        "Provide shared machinery and workshops",
        "Host eco-innovation challenges",
        "Partner with waste management agencies",
        "Offer sustainability consultancy",
        "Market to green startups and social enterprises"
      ],
      imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Hybrid Hospitality & Workspace",
      description:
        "Develop a property offering both short-stay accommodations and co-working facilities for business travellers.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.32,
      realizationTips: [
        "Include flexible work zones and meeting rooms",
        "Offer high-speed internet and concierge services",
        "Partner with travel agencies and corporate clients",
        "Market to remote workers and business travellers",
        "Integrate app-based booking and service requests"
      ],
      imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Esports & Gaming Arena",
      description:
        "Build a competitive gaming venue with streaming facilities, training rooms, and spectator seating.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.38,
      realizationTips: [
        "Install high-performance gaming hardware",
        "Provide live-streaming and broadcasting equipment",
        "Host tournaments and gaming events",
        "Partner with esports teams and sponsors",
        "Market to youth and gaming communities"
      ],
      imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Luxury Brand Flagship Complex",
      description:
        "Develop a high-end retail space exclusively for luxury and designer brands.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.5,
      realizationTips: [
        "Design architecturally iconic storefronts",
        "Offer VIP lounges and concierge services",
        "Partner with luxury brand distributors",
        "Market in high-income and tourist districts",
        "Host exclusive brand events"
      ],
      imageUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Urban Mobility Hub",
      description:
        "Create a centralised hub integrating public transport, bike-sharing, EV rentals, and last-mile delivery services.",
      purchaseCostFactor: 1.0,
      developmentCostFactor: 0.28,
      realizationTips: [
        "Provide digital ticketing and navigation tools",
        "Include parking for micro-mobility vehicles",
        "Partner with transport tech companies",
        "Ensure safety and accessibility features",
        "Market to urban commuters and logistics operators"
      ],
      imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1559757172-35739e6cefd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1518021500542-5bb0c0b93ee7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1564883957739-4b3bb2cc0b3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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

export function generateCrossCategoryProspects(
  estimatedWorth?: number,
): Array<{
  title: string
  description: string
  estimatedCost: number
  category: string
  categoryId: number
  imageUrl: string
  realizationTips: string[]
}> {
  const categoryMap: { [key: string]: number } = {
    residential: 1,
    commercial: 2,
    industrial: 3,
    agricultural: 4,
  }

  // Collect all prospects from all categories
  const allProspects: Array<PropertyProspect & { category: string; categoryId: number }> = []
  
  Object.entries(MOCK_PROSPECTS).forEach(([categoryName, prospects]) => {
    prospects.forEach(prospect => {
      allProspects.push({
        ...prospect,
        category: categoryName,
        categoryId: categoryMap[categoryName] || 1
      })
    })
  })

  // Randomly select 5 different prospects from all categories
  const shuffled = [...allProspects].sort(() => 0.5 - Math.random())
  const selectedProspects = shuffled.slice(0, 5)

  const baseWorth = estimatedWorth || 10000000 // Default 10M if no estimated worth

  return selectedProspects.map((prospect) => {
    const purchaseCost = baseWorth * prospect.purchaseCostFactor
    const developmentCost = baseWorth * prospect.developmentCostFactor
    const estimatedCost = purchaseCost + developmentCost

    return {
      title: prospect.title,
      description: prospect.description,
      estimatedCost: Math.round(estimatedCost),
      category: prospect.category,
      categoryId: prospect.categoryId,
      imageUrl: prospect.imageUrl,
      realizationTips: prospect.realizationTips,
    }
  })
}
