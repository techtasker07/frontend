// Billing calculation service for documentations
export interface BillingItem {
  description: string;
  amount: number;
  quantity?: number;
  unitPrice?: number;
}

export interface BillingBreakdown {
  items: BillingItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
}

// Survey fee interfaces
export interface SurveyFeeRequest {
  zone: 'A' | 'B' | 'C' | 'D';
  plotSize: number; // in square meters
  surveyType: 'standard' | 'strata' | 'layout' | 'details' | 'as-built' | 're-establishment' | 'survey-plan' | 'certificate-occupancy' | 'gazette';
  serviceSubtype?: 'fresh-survey' | 'existing-coordinates' | 'direct-verification' | 'retaking-points'; // for survey-plan and layout
  titleType?: 'private' | 'commercial' | 'industrial';
  strataUnits?: number; // for strata surveys
  plotCount?: number; // for layout surveys
  missingBeacons?: number; // for re-establishment
  totalBeacons?: number; // for re-establishment
}

// Survey zones data
const SURVEY_ZONES: Record<string, ZoneData> = {
  A: {
    name: 'Zone A',
    lgas: [
      'Apapa LGA', 'Eti-Osa LGA', 'Ikeja LGA', 'Lagos Island', 'Waterfront properties',
      'Properties along major highways (200m Corridor)', 'Atlantic Ocean', 'Lagos Lagoon', 'Badagry Creek',
      'Ikorodu Road - from Costain roundabout to Maryland(odo-iyalaro)', 'Lagos/Badagry Expressway - from Orile-Iganmu to LASU Gate',
      'Apapa/Oshodi Expressway - from Apapa/Tin Can Port to Ifako-Gbagada', 'Muritala Muhamed Airport Road',
      'Agege Motor Road - from Ojuelegba to Ile Zik Intersection',
      'Lagos/Abeokuta Expressway - from Ile Zik Intersection to Abule-Egba (By Jubilee Bridge)',
      'Lagos/Ibadan Expressway - from foot of 3rd Mainland Bridge to Lagos-Ogun boundary.'
    ],
    fees: [
      { min: 0, max: 700, fee: 1575000 },
      { min: 701, max: 1500, fee: 2105400 },
      { min: 1501, max: 2100, fee: 2635875 },
      { min: 2101, max: 2800, fee: 3153465 },
      { min: 2801, max: 3500, fee: 3619825 },
      { min: 3501, max: 4200, fee: 4086180 },
      { min: 4201, max: 5000, fee: 4132828 },
      { min: 5001, max: 10000, fee: 5124695 }, // 1 HA = 10000 sq.m
      { min: 10001, max: 20000, fee: 6720670 }, // 2 HA
      { min: 20001, max: 40000, fee: 9773785 }, // 4 HA
      { min: 40001, max: 60000, fee: 12826900 }, // 6 HA
      { min: 60001, max: 80000, fee: 15880100 }, // 8 HA
      { min: 80001, max: 100000, fee: 18933125 }, // 10 HA
      { min: 100001, max: 150000, fee: 21933125 }, // 15 HA
      { min: 150001, max: 200000, fee: 23933125 }, // 20 HA
      { min: 200001, max: 250000, fee: 27933125 }, // 25 HA
      { min: 250001, max: 300000, fee: 30933125 }, // 30 HA
      { min: 300001, max: 350000, fee: 33933125 }, // 35 HA
      { min: 350001, max: 400000, fee: 36933125 }, // 40 HA
      { min: 400001, max: 450000, fee: 39933125 }, // 45 HA
      { min: 450001, max: 500000, fee: 42933125 }  // 50 HA
    ],
    additionalHectareFee: 400000
  },
  B: {
    name: 'Zone B',
    lgas: [
      'Kosofe LGA', 'Lagos Mainland LGA', 'Mushin LGA', 'Surulere LGA', 'Somolu LGA',
      'Properties Along Ikorodu Road within 100m corridor(from Maryland to Ikorodu Roundabout)',
      'Properties Along Lekki Epe Expressway within 200m corridor, From Abijo (Eti-Osa/Ibeju-Lekki boundary) to Epe T-Junction'
    ],
    fees: [
      { min: 0, max: 700, fee: 1000000 },
      { min: 701, max: 1500, fee: 1336700 },
      { min: 1501, max: 2100, fee: 1673570 },
      { min: 2101, max: 2800, fee: 2002200 },
      { min: 2801, max: 3500, fee: 2298300 },
      { min: 3501, max: 4200, fee: 2594400 },
      { min: 4201, max: 5000, fee: 2890500 },
      { min: 5001, max: 10000, fee: 3584220 },
      { min: 10001, max: 20000, fee: 4700455 },
      { min: 20001, max: 40000, fee: 6835870 },
      { min: 40001, max: 60000, fee: 8971285 },
      { min: 60001, max: 80000, fee: 11106700 },
      { min: 80001, max: 100000, fee: 13242200 },
      { min: 100001, max: 150000, fee: 15242200 },
      { min: 150001, max: 200000, fee: 18242200 },
      { min: 200001, max: 250000, fee: 20242200 },
      { min: 250001, max: 300000, fee: 23242200 },
      { min: 300001, max: 350000, fee: 25242200 },
      { min: 350001, max: 400000, fee: 28242200 },
      { min: 400001, max: 450000, fee: 30242200 },
      { min: 450001, max: 500000, fee: 33242200 }
    ],
    additionalHectareFee: 300000
  },
  C: {
    name: 'Zone C',
    lgas: [
      'Agege LGA', 'Alimosho LGA', 'Amuwo-Odofin LGA', 'Ibeju-Lekki LGA', 'Ifako-Ijaiye',
      'Oshodi / Isolo LGA', 'Ojo LGA',
      'Properties Along Lagos / Badagry Expressway within 200m corridor (from LASU Gate to Badagry Roundabout)'
    ],
    fees: [
      { min: 0, max: 700, fee: 750000 },
      { min: 701, max: 1500, fee: 1002590 },
      { min: 1501, max: 2100, fee: 1255180 },
      { min: 2101, max: 2800, fee: 1501650 },
      { min: 2801, max: 3500, fee: 1723725 },
      { min: 3501, max: 4200, fee: 1945800 },
      { min: 4201, max: 5000, fee: 2167875 },
      { min: 5001, max: 10000, fee: 2688165 },
      { min: 10001, max: 20000, fee: 3525340 },
      { min: 20001, max: 40000, fee: 5126900 },
      { min: 40001, max: 60000, fee: 6728465 },
      { min: 60001, max: 80000, fee: 8330025 },
      { min: 80001, max: 100000, fee: 9931590 },
      { min: 100001, max: 150000, fee: 11931590 },
      { min: 150001, max: 200000, fee: 13931590 },
      { min: 200001, max: 250000, fee: 15931590 },
      { min: 250001, max: 300000, fee: 17931590 },
      { min: 300001, max: 350000, fee: 19931590 },
      { min: 350001, max: 400000, fee: 21931590 },
      { min: 400001, max: 450000, fee: 23931590 },
      { min: 450001, max: 500000, fee: 25931590 }
    ],
    additionalHectareFee: 200000
  },
  D: {
    name: 'Zone D',
    lgas: ['Ajeromi-Ifelodun LGA', 'Badagry LGA', 'Epe LGA', 'Ikorodu LGA'],
    fees: [
      { min: 0, max: 700, fee: 425000 },
      { min: 701, max: 1500, fee: 529625 },
      { min: 1501, max: 2100, fee: 768770 },
      { min: 2101, max: 2800, fee: 956985 },
      { min: 2801, max: 3500, fee: 1118350 },
      { min: 3501, max: 4200, fee: 1279720 },
      { min: 4201, max: 5000, fee: 1451660 },
      { min: 5001, max: 10000, fee: 1858790 },
      { min: 10001, max: 20000, fee: 2533920 },
      { min: 20001, max: 40000, fee: 3820970 },
      { min: 40001, max: 60000, fee: 5108010 },
      { min: 60001, max: 80000, fee: 6395050 },
      { min: 80001, max: 100000, fee: 7682100 },
      { min: 100001, max: 150000, fee: 8932100 },
      { min: 150001, max: 200000, fee: 10182100 },
      { min: 200001, max: 250000, fee: 11432100 },
      { min: 250001, max: 300000, fee: 12682100 },
      { min: 300001, max: 350000, fee: 13921100 },
      { min: 350001, max: 400000, fee: 15182100 },
      { min: 400001, max: 450000, fee: 16142100 },
      { min: 450001, max: 500000, fee: 17682100 }
    ],
    additionalHectareFee: 100000
  }
};

// Layout survey percentages
const LAYOUT_SURVEY_PERCENTAGES = [
  { min: 1, max: 10, percentage: 0.8 },
  { min: 11, max: 20, percentage: 0.75 },
  { min: 21, max: 40, percentage: 0.7 },
  { min: 41, max: 60, percentage: 0.65 },
  { min: 61, max: 80, percentage: 0.6 },
  { min: 81, max: 100, percentage: 0.55 },
  { min: 101, max: Infinity, percentage: 0.5 }
];

export interface ZoneData {
  name: string;
  lgas: string[];
  fees: { min: number; max: number; fee: number }[];
  additionalHectareFee: number;
}

// Base fees for different services
const BASE_FEES = {
  surveyPlan: {
    standard: 5000,
    express: 2000
  },
  certificateOfOccupancy: {
    standard: 3000,
    express: 1500
  },
  gazette: {
    publication: 15000,
    search: 2000,
    verification: 5000,
    express: 1500
  },
  layoutSurvey: {
    standard: 8000,
    express: 3000
  },
  surveyChart: {
    base: 1000,
    perPoint: 100
  }
};

// Due diligence fees for land information and charting
const DUE_DILIGENCE_FEES = {
  landInformation: {
    individual: [
      { min: 1, max: 1000, fee: 30000 },
      { min: 1001, max: 2000, fee: 35000 },
      { min: 2001, max: 3000, fee: 45000 },
      { min: 3001, max: 4000, fee: 50000 },
      { min: 4001, max: 5000, fee: 60000 },
      { min: 5001, max: 10000, fee: 70000 }, // 5001 M2 - 1 Hectare
      { min: 10001, max: 50000, fee: 80000 }, // 1 hectare - 5 hectares
      { min: 50001, max: 100000, fee: 120000 }, // 5 hectares - 10 hectares
      { min: 100001, max: 200000, fee: 160000 }, // 10 hectares - 20 hectares
      { min: 200001, max: 300000, fee: 200000 }, // 20 hectares - 30 hectares
      { min: 300001, max: 1000000, fee: 300000 }, // 30 hectares - 100 hectares
      { min: 1000001, max: Infinity, fee: 500000 } // Above 100 hectares
    ],
    corporate: [
      { min: 1, max: 1000, fee: 60000 },
      { min: 1001, max: 2000, fee: 70000 },
      { min: 2001, max: 3000, fee: 90000 },
      { min: 3001, max: 4000, fee: 100000 },
      { min: 4001, max: 5000, fee: 120000 },
      { min: 5001, max: 10000, fee: 140000 }, // 5001 M2 - 1 Hectare
      { min: 10001, max: 50000, fee: 160000 }, // 1 hectare - 5 hectares
      { min: 50001, max: 100000, fee: 240000 }, // 5 hectares - 10 hectares
      { min: 100001, max: 200000, fee: 320000 }, // 10 hectares - 20 hectares
      { min: 200001, max: 300000, fee: 400000 }, // 20 hectares - 30 hectares
      { min: 300001, max: 1000000, fee: 600000 }, // 30 hectares - 100 hectares
      { min: 1000001, max: Infinity, fee: 1000000 } // Above 100 hectares
    ]
  },
  chartingInformation: {
    individual: [
      { min: 1, max: 1000, fee: 15000 },
      { min: 1001, max: 2000, fee: 17500 },
      { min: 2001, max: 3000, fee: 22500 },
      { min: 3001, max: 4000, fee: 25000 },
      { min: 4001, max: 5000, fee: 30000 },
      { min: 5001, max: 10000, fee: 35000 }, // 5001 M2 - 1 Hectare
      { min: 10001, max: 50000, fee: 40000 }, // 1 hectare - 5 hectares
      { min: 50001, max: 100000, fee: 60000 }, // 5 hectares - 10 hectares
      { min: 100001, max: 200000, fee: 80000 }, // 10 hectares - 20 hectares
      { min: 200001, max: 300000, fee: 100000 }, // 20 hectares - 30 hectares
      { min: 300001, max: 1000000, fee: 150000 }, // 30 hectares - 100 hectares
      { min: 1000001, max: Infinity, fee: 250000 } // Above 100 hectares
    ],
    corporate: [
      { min: 1, max: 1000, fee: 30000 },
      { min: 1001, max: 2000, fee: 35000 },
      { min: 2001, max: 3000, fee: 45000 },
      { min: 3001, max: 4000, fee: 50000 },
      { min: 4001, max: 5000, fee: 60000 },
      { min: 5001, max: 10000, fee: 70000 }, // 5001 M2 - 1 Hectare
      { min: 10001, max: 50000, fee: 80000 }, // 1 hectare - 5 hectares
      { min: 50001, max: 100000, fee: 120000 }, // 5 hectares - 10 hectares
      { min: 100001, max: 200000, fee: 160000 }, // 10 hectares - 20 hectares
      { min: 200001, max: 300000, fee: 200000 }, // 20 hectares - 30 hectares
      { min: 300001, max: 1000000, fee: 300000 }, // 30 hectares - 100 hectares
      { min: 1000001, max: Infinity, fee: 500000 } // Above 100 hectares
    ]
  }
};

// Tax rate (13% VAT in Nigeria)
const TAX_RATE = 0.13;

// Additional fees based on property characteristics
const ADDITIONAL_FEES = {
  largeProperty: {
    threshold: 1000, // sqm
    fee: 2000
  },
  commercialProperty: 1500,
  multipleBuildings: {
    threshold: 5,
    feePerBuilding: 500
  },
  complexLayout: 3000
};

export class BillingCalculator {
  static calculateSurveyPlanFee(
    landArea?: string,
    isExpress: boolean = false,
    propertyType?: string
  ): BillingBreakdown {
    const items: BillingItem[] = [];
    let subtotal = 0;

    // Base processing fee
    const baseFee = isExpress ? BASE_FEES.surveyPlan.express : BASE_FEES.surveyPlan.standard;
    items.push({
      description: `Survey Plan Processing (${isExpress ? 'Express' : 'Standard'})`,
      amount: baseFee
    });
    subtotal += baseFee;

    // Large property fee
    if (landArea) {
      const area = parseFloat(landArea);
      if (area > ADDITIONAL_FEES.largeProperty.threshold) {
        items.push({
          description: 'Large Property Processing Fee',
          amount: ADDITIONAL_FEES.largeProperty.fee
        });
        subtotal += ADDITIONAL_FEES.largeProperty.fee;
      }
    }

    // Commercial property fee
    if (propertyType === 'commercial') {
      items.push({
        description: 'Commercial Property Fee',
        amount: ADDITIONAL_FEES.commercialProperty
      });
      subtotal += ADDITIONAL_FEES.commercialProperty;
    }

    return this.calculateTotal(items, subtotal);
  }

  static calculateCertificateOfOccupancyFee(
    buildingArea?: string,
    zoning?: string,
    isExpress: boolean = false
  ): BillingBreakdown {
    const items: BillingItem[] = [];
    let subtotal = 0;

    // Base processing fee
    const baseFee = isExpress ? BASE_FEES.certificateOfOccupancy.express : BASE_FEES.certificateOfOccupancy.standard;
    items.push({
      description: `Certificate of Occupancy Processing (${isExpress ? 'Express' : 'Standard'})`,
      amount: baseFee
    });
    subtotal += baseFee;

    // Large building fee
    if (buildingArea) {
      const area = parseFloat(buildingArea);
      if (area > ADDITIONAL_FEES.largeProperty.threshold) {
        items.push({
          description: 'Large Building Processing Fee',
          amount: ADDITIONAL_FEES.largeProperty.fee
        });
        subtotal += ADDITIONAL_FEES.largeProperty.fee;
      }
    }

    // Commercial zoning fee
    if (zoning === 'commercial' || zoning === 'mixed') {
      items.push({
        description: 'Commercial Zoning Fee',
        amount: ADDITIONAL_FEES.commercialProperty
      });
      subtotal += ADDITIONAL_FEES.commercialProperty;
    }

    return this.calculateTotal(items, subtotal);
  }

  static calculateGazetteFee(
    serviceType: 'publish' | 'search' | 'verify',
    isExpress: boolean = false
  ): BillingBreakdown {
    const items: BillingItem[] = [];
    let subtotal = 0;

    // Base service fee
    let baseFee = 0;
    let serviceName = '';

    switch (serviceType) {
      case 'publish':
        baseFee = BASE_FEES.gazette.publication;
        serviceName = 'Gazette Publication';
        break;
      case 'search':
        baseFee = BASE_FEES.gazette.search;
        serviceName = 'Gazette Search';
        break;
      case 'verify':
        baseFee = BASE_FEES.gazette.verification;
        serviceName = 'Gazette Verification';
        break;
    }

    items.push({
      description: serviceName,
      amount: baseFee
    });
    subtotal += baseFee;

    // Express service fee
    if (isExpress) {
      items.push({
        description: 'Express Processing Fee',
        amount: BASE_FEES.gazette.express
      });
      subtotal += BASE_FEES.gazette.express;
    }

    return this.calculateTotal(items, subtotal);
  }

  static calculateLayoutSurveyFee(
    totalArea?: string,
    buildingCount?: string,
    layoutType?: string,
    isExpress: boolean = false
  ): BillingBreakdown {
    const items: BillingItem[] = [];
    let subtotal = 0;

    // Base processing fee
    const baseFee = isExpress ? BASE_FEES.layoutSurvey.express : BASE_FEES.layoutSurvey.standard;
    items.push({
      description: `Layout Survey Processing (${isExpress ? 'Express' : 'Standard'})`,
      amount: baseFee
    });
    subtotal += baseFee;

    // Large area fee
    if (totalArea) {
      const area = parseFloat(totalArea);
      if (area > ADDITIONAL_FEES.largeProperty.threshold * 2) { // Higher threshold for layout surveys
        items.push({
          description: 'Large Area Processing Fee',
          amount: ADDITIONAL_FEES.largeProperty.fee * 2
        });
        subtotal += ADDITIONAL_FEES.largeProperty.fee * 2;
      }
    }

    // Multiple buildings fee
    if (buildingCount) {
      const count = parseInt(buildingCount);
      if (count > ADDITIONAL_FEES.multipleBuildings.threshold) {
        const extraBuildings = count - ADDITIONAL_FEES.multipleBuildings.threshold;
        const fee = extraBuildings * ADDITIONAL_FEES.multipleBuildings.feePerBuilding;
        items.push({
          description: `Additional Buildings Fee (${extraBuildings} buildings)`,
          amount: fee,
          quantity: extraBuildings,
          unitPrice: ADDITIONAL_FEES.multipleBuildings.feePerBuilding
        });
        subtotal += fee;
      }
    }

    // Complex layout fee
    if (layoutType === 'mixed-use' || layoutType === 'industrial') {
      items.push({
        description: 'Complex Layout Processing Fee',
        amount: ADDITIONAL_FEES.complexLayout
      });
      subtotal += ADDITIONAL_FEES.complexLayout;
    }

    return this.calculateTotal(items, subtotal);
  }

  static calculateSurveyChartFee(
    pointCount: number,
    isExpress: boolean = false
  ): BillingBreakdown {
    const items: BillingItem[] = [];
    let subtotal = 0;

    // Base fee
    items.push({
      description: 'Survey Chart Base Fee',
      amount: BASE_FEES.surveyChart.base
    });
    subtotal += BASE_FEES.surveyChart.base;

    // Per point fee
    if (pointCount > 0) {
      const pointFee = pointCount * BASE_FEES.surveyChart.perPoint;
      items.push({
        description: `Survey Points (${pointCount} points)`,
        amount: pointFee,
        quantity: pointCount,
        unitPrice: BASE_FEES.surveyChart.perPoint
      });
      subtotal += pointFee;
    }

    // Express processing
    if (isExpress) {
      items.push({
        description: 'Express Processing Fee',
        amount: 1000
      });
      subtotal += 1000;
    }

    return this.calculateTotal(items, subtotal);
  }

  private static calculateTotal(items: BillingItem[], subtotal: number): BillingBreakdown {
    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + tax;

    return {
      items,
      subtotal,
      tax,
      total,
      currency: 'NGN'
    };
  }

  // Calculate survey fees based on Lagos schedule
  static calculateSurveyFee(request: SurveyFeeRequest): BillingBreakdown {
    const items: BillingItem[] = [];
    let subtotal = 0;

    const zone = SURVEY_ZONES[request.zone];
    if (!zone) {
      throw new Error(`Invalid zone: ${request.zone}`);
    }

    // Find base fee for plot size
    let baseFee = 0;
    const plotSizeSqm = request.plotSize;
    const plotSizeHa = plotSizeSqm / 10000; // Convert to hectares for large plots

    for (const feeRange of zone.fees) {
      if (plotSizeSqm >= feeRange.min && plotSizeSqm <= feeRange.max) {
        baseFee = feeRange.fee;
        break;
      }
    }

    // Handle additional hectares for plots over 50 HA (500,000 sqm)
    if (plotSizeHa > 50) {
      const additionalHa = Math.ceil(plotSizeHa - 50);
      const additionalFee = additionalHa * zone.additionalHectareFee;
      baseFee += additionalFee;
      items.push({
        description: `Additional Hectares (${additionalHa} HA @ ${this.formatCurrency(zone.additionalHectareFee)})`,
        amount: additionalFee,
        quantity: additionalHa,
        unitPrice: zone.additionalHectareFee
      });
      subtotal += additionalFee;
    }

    // Calculate service charge (20,000 per 600 sq m) - not visible to user
    // Note: Service charge is not added for survey-plan to ensure total matches displayed items
    const serviceCharge = request.surveyType !== 'survey-plan' ? Math.ceil(plotSizeSqm / 600) * 20000 : 0;
    subtotal += serviceCharge;

    // Apply commercial/industrial multiplier
    let surveyFee = baseFee;
    if (request.titleType === 'commercial' || request.titleType === 'industrial') {
      surveyFee *= 2;
      items.push({
        description: 'Commercial/Industrial Title Multiplier (2x)',
        amount: baseFee
      });
      subtotal += baseFee;
    }

    // Calculate survey fee based on type
    let finalSurveyFee = 0;
    switch (request.surveyType) {
      case 'standard':
        finalSurveyFee = surveyFee;
        items.push({
          description: `Standard Survey Fee - ${zone.name}`,
          amount: finalSurveyFee
        });
        break;

      case 'strata':
        if (!request.strataUnits || request.strataUnits <= 0) {
          throw new Error('Strata units count is required for strata surveys');
        }
        finalSurveyFee = surveyFee * request.strataUnits;
        items.push({
          description: `Strata Survey Fee - ${zone.name} (${request.strataUnits} units)`,
          amount: finalSurveyFee,
          quantity: request.strataUnits,
          unitPrice: surveyFee
        });
        break;

      case 'layout':
        if (!request.plotCount || request.plotCount <= 0) {
          throw new Error('Plot count is required for layout surveys');
        }
        const plotCount = request.plotCount;
        const percentage = LAYOUT_SURVEY_PERCENTAGES.find(p =>
          plotCount >= p.min && plotCount <= p.max
        )?.percentage || 0.5;
        finalSurveyFee = surveyFee * percentage;

        // Handle service subtypes for layout survey
        let serviceDescription = `Layout Survey Fee - ${plotCount} plots (${(percentage * 100).toFixed(0)}% of base fee)`;
        if (request.serviceSubtype === 'fresh-survey') {
          const coordinatesPickingFee = this.calculateCoordinatesPickingFee(baseFee);
          finalSurveyFee += coordinatesPickingFee; // Coordinates picking cost
          items.push({
            description: 'Coordinates Picking Service',
            amount: coordinatesPickingFee
          });
          serviceDescription = `Fresh Layout Survey Processing - ${plotCount} plots`;
        } else if (request.serviceSubtype === 'existing-coordinates') {
          serviceDescription = `Layout Survey Processing with Existing Coordinates - ${plotCount} plots`;
        } else if (request.serviceSubtype === 'direct-verification') {
          serviceDescription = `Layout Survey Direct Verification - ${plotCount} plots`;
        } else if (request.serviceSubtype === 'retaking-points') {
          serviceDescription = `Layout Survey Verification by Retaking Points - ${plotCount} plots`;
        }

        items.push({
          description: serviceDescription,
          amount: finalSurveyFee
        });
        break;

      case 'survey-plan':
        finalSurveyFee = surveyFee;

        // Handle service subtypes for survey plan
        if (request.serviceSubtype === 'fresh-survey') {
          // Add 29% fee (24% affiliate + 5% service charge) to the survey fee for fresh survey
          const freshSurveyFeeWithMarkup = surveyFee + Math.round(surveyFee * 0.29);
          const coordinatesPickingFee = this.calculateCoordinatesPickingFee(baseFee);
          finalSurveyFee = freshSurveyFeeWithMarkup + coordinatesPickingFee; // Coordinates picking cost
          items.push({
            description: 'Coordinates Picking Service',
            amount: coordinatesPickingFee
          });
          items.push({
            description: 'Fresh Survey Plan Processing - ' + zone.name,
            amount: freshSurveyFeeWithMarkup
          });
        } else if (request.serviceSubtype === 'existing-coordinates') {
          finalSurveyFee = surveyFee + Math.round(surveyFee * 0.29);
          items.push({
            description: 'Survey Plan Processing with Existing Coordinates - ' + zone.name,
            amount: finalSurveyFee
          });
        } else if (request.serviceSubtype === 'direct-verification') {
          finalSurveyFee = 10000;
          items.push({
            description: 'Survey Plan Direct Verification - ' + zone.name,
            amount: finalSurveyFee
          });
        } else if (request.serviceSubtype === 'retaking-points') {
          finalSurveyFee = 10000;
          const coordinatesPickingFee = this.calculateCoordinatesPickingFee(baseFee);
          finalSurveyFee += coordinatesPickingFee;
          items.push({
            description: 'Coordinates Picking Service',
            amount: coordinatesPickingFee
          });
          items.push({
            description: 'Survey Plan Verification by Retaking Points - ' + zone.name,
            amount: 10000
          });
        } else {
          items.push({
            description: `Survey Plan Fee - ${zone.name}`,
            amount: finalSurveyFee
          });
        }
        break;

      case 'details':
        finalSurveyFee = surveyFee * 0.75;
        items.push({
          description: 'Details Survey Fee (75% of minimum survey fee)',
          amount: finalSurveyFee
        });
        break;

      case 'as-built':
        finalSurveyFee = surveyFee * 1.2;
        items.push({
          description: 'As-Built Survey Fee (120% of minimum survey fee)',
          amount: finalSurveyFee
        });
        break;

      case 're-establishment':
        if (!request.missingBeacons || !request.totalBeacons) {
          throw new Error('Missing beacons and total beacons count required for re-establishment');
        }
        const ratio = request.missingBeacons / request.totalBeacons;
        finalSurveyFee = Math.pow(ratio, 2) * surveyFee;
        items.push({
          description: `Re-establishment of Beacons (${request.missingBeacons}/${request.totalBeacons} missing)`,
          amount: finalSurveyFee
        });
        break;

      case 'certificate-occupancy':
        throw new Error('Certificate of Occupancy service is coming soon!');

      case 'gazette':
        throw new Error('Gazette service is coming soon!');

      default:
        throw new Error(`Invalid survey type: ${request.surveyType}`);
    }

    subtotal += finalSurveyFee;

    // Add 29% fee (24% affiliate + 5% service charge) of minimum survey fee for non-fresh survey types
    if (request.serviceSubtype !== 'fresh-survey' && request.serviceSubtype !== 'existing-coordinates' && request.serviceSubtype !== 'direct-verification' && request.serviceSubtype !== 'retaking-points') {
      const additionalFee = Math.round(baseFee * 0.29);
      subtotal += additionalFee;
    }

    // For survey-plan, return total without tax to match displayed items
    if (request.surveyType === 'survey-plan') {
      return {
        items,
        subtotal,
        tax: 0,
        total: subtotal,
        currency: 'NGN'
      };
    }

    return this.calculateTotal(items, subtotal);
  }

  // Get available zones
  static getSurveyZones(): Record<string, ZoneData> {
    return SURVEY_ZONES;
  }

  // Get zone by LGA
  static getZoneByLGA(lga: string): string | null {
    for (const [zoneKey, zoneData] of Object.entries(SURVEY_ZONES)) {
      if (zoneData.lgas.some(zoneLga => zoneLga.toLowerCase().includes(lga.toLowerCase()))) {
        return zoneKey;
      }
    }
    return null;
  }

  // Calculate due diligence fees for acquisition services
  static calculateDueDiligenceFee(
    landAreaSqm: number,
    clientType: 'individual' | 'corporate'
  ): BillingBreakdown {
    const items: BillingItem[] = [];
    let subtotal = 0;

    // Find base land information fee
    let landInfoFee = 0;
    for (const feeRange of DUE_DILIGENCE_FEES.landInformation[clientType]) {
      if (landAreaSqm >= feeRange.min && landAreaSqm <= feeRange.max) {
        landInfoFee = feeRange.fee;
        break;
      }
    }

    // Find base charting information fee
    let chartingFee = 0;
    for (const feeRange of DUE_DILIGENCE_FEES.chartingInformation[clientType]) {
      if (landAreaSqm >= feeRange.min && landAreaSqm <= feeRange.max) {
        chartingFee = feeRange.fee;
        break;
      }
    }

    // Apply markup to individual fees: Service charge (10%) + Affiliate charges (23%) = 33% total markup
    const markupMultiplier = 1 + 0.10 + 0.23; // 1.33
    const markedUpLandInfoFee = Math.round(landInfoFee * markupMultiplier);
    const markedUpChartingFee = Math.round(chartingFee * markupMultiplier);

    items.push({
      description: `Land Information Fee (${clientType.charAt(0).toUpperCase() + clientType.slice(1)})`,
      amount: markedUpLandInfoFee
    });
    subtotal += markedUpLandInfoFee;

    items.push({
      description: `Charting Information Fee (${clientType.charAt(0).toUpperCase() + clientType.slice(1)})`,
      amount: markedUpChartingFee
    });
    subtotal += markedUpChartingFee;

    return this.calculateTotal(items, subtotal);
  }

  // Calculate coordinates picking fee: 9.4% of minimum fee, rounded up to nearest 10,000
  static calculateCoordinatesPickingFee(minimumFee: number): number {
    const percentageFee = minimumFee * 0.094;
    return Math.ceil(percentageFee / 10000) * 10000;
  }

  // Format currency for display
  static formatCurrency(amount: number, currency: string = 'NGN'): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}