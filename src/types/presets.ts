import { PropertyData } from "@/contexts/PropertyDataContext";

export type PropertyMethod = 'house-land-construction' | 'built-first-owner' | 'built-second-owner';
export type FundingMethod = 'loan-cash' | 'loan-equity' | 'full-equity';

export interface PresetConfig {
  propertyMethod: PropertyMethod;
  fundingMethod: FundingMethod;
  data: Partial<PropertyData>;
}

// Property Method Presets
export const PROPERTY_METHODS = {
  'house-land-construction': {
    name: 'House & Land - Construction',
    description: 'New construction project from land purchase'
  },
  'built-first-owner': {
    name: 'Built Property - First Owner',
    description: 'New/off-the-plan property within 6 months'
  },
  'built-second-owner': {
    name: 'Built Property - Second Owner',
    description: 'Established property over 6 months old'
  }
} as const;

// Funding Method Presets
export const FUNDING_METHODS = {
  'loan-cash': {
    name: '80% Loan + Cash',
    description: 'Traditional lending with cash deposit'
  },
  'loan-equity': {
    name: '80% Loan + Equity',
    description: '80% loan with equity-funded deposit'
  },
  'full-equity': {
    name: 'Full Equity Funding',
    description: '100% funding through property equity'
  }
} as const;

// Base property configurations
const getPropertyMethodData = (method: PropertyMethod): Partial<PropertyData> => {
  const baseClients = [
    {
      id: '1',
      name: 'Investor 1',
      annualIncome: 180000,
      otherIncome: 0,
      hasMedicareLevy: true
    },
    {
      id: '2', 
      name: 'Investor 2',
      annualIncome: 65000,
      otherIncome: 0,
      hasMedicareLevy: false
    }
  ];

  const baseOwnership = [
    { clientId: '1', ownershipPercentage: 70 },
    { clientId: '2', ownershipPercentage: 30 }
  ];

  switch (method) {
    case 'house-land-construction':
      return {
        clients: baseClients,
        ownershipAllocations: baseOwnership,
        isConstructionProject: true,
        purchasePrice: 750000,
        landValue: 200000,
        constructionValue: 550000,
        constructionYear: 2024,
        constructionPeriod: 8,
        constructionInterestRate: 7.0,
        buildingValue: 495000, // 90% of construction value - fixed relationship
        plantEquipmentValue: 55000, // 10% of construction value - ensures total = 550000
        weeklyRent: 680,
        rentalGrowthRate: 3.0,
        vacancyRate: 2.0,
        // Construction costs
        councilFees: 8000,
        architectFees: 15000,
        siteCosts: 5000,
        // Purchase costs (land only)
        stampDuty: 8500,
        legalFees: 2000,
        inspectionFees: 800,
        // Annual expenses
        propertyManagement: 8.0,
        councilRates: 2800,
        insurance: 1800,
        repairs: 2000,
        // Depreciation
        depreciationMethod: 'prime-cost' as const,
        isNewProperty: true,
        // Holding costs will be auto-calculated
        landHoldingInterest: 0,
        constructionHoldingInterest: 0,
        totalHoldingCosts: 0
      };

    case 'built-first-owner':
      return {
        clients: baseClients,
        ownershipAllocations: baseOwnership,
        isConstructionProject: false,
        purchasePrice: 750000,
        constructionYear: 2024,
        buildingValue: 675000, // 90% of purchase price
        plantEquipmentValue: 75000, // 10% of purchase price
        weeklyRent: 680,
        rentalGrowthRate: 3.0,
        vacancyRate: 2.0,
        // No construction values
        landValue: 0,
        constructionValue: 0,
        constructionPeriod: 0,
        constructionInterestRate: 0,
        // Purchase costs
        stampDuty: 42000,
        legalFees: 2000,
        inspectionFees: 600,
        // No construction costs
        councilFees: 0,
        architectFees: 0,
        siteCosts: 0,
        // Annual expenses
        propertyManagement: 8.0,
        councilRates: 2800,
        insurance: 1800,
        repairs: 2000,
        // Depreciation
        depreciationMethod: 'prime-cost' as const,
        isNewProperty: true,
        // No holding costs
        landHoldingInterest: 0,
        constructionHoldingInterest: 0,
        totalHoldingCosts: 0
      };

    case 'built-second-owner':
      return {
        clients: baseClients,
        ownershipAllocations: baseOwnership,
        isConstructionProject: false,
        purchasePrice: 750000,
        constructionYear: 2018, // Older property
        buildingValue: 600000, // 80% of purchase price (some depreciation)
        plantEquipmentValue: 60000, // Limited plant & equipment value
        weeklyRent: 680,
        rentalGrowthRate: 3.0,
        vacancyRate: 2.0,
        // No construction values
        landValue: 0,
        constructionValue: 0,
        constructionPeriod: 0,
        constructionInterestRate: 0,
        // Purchase costs
        stampDuty: 42000,
        legalFees: 2000,
        inspectionFees: 600,
        // No construction costs
        councilFees: 0,
        architectFees: 0,
        siteCosts: 0,
        // Annual expenses
        propertyManagement: 8.0,
        councilRates: 2800,
        insurance: 1800,
        repairs: 2500, // Higher repairs for established property
        // Depreciation
        depreciationMethod: 'prime-cost' as const,
        isNewProperty: false,
        // No holding costs
        landHoldingInterest: 0,
        constructionHoldingInterest: 0,
        totalHoldingCosts: 0
      };

    default:
      return {};
  }
};

// Funding configurations
const getFundingMethodData = (method: FundingMethod, propertyValue: number = 750000): Partial<PropertyData> => {
  const totalCosts = propertyValue * 1.06; // Approximate total costs with transaction fees

  switch (method) {
    case 'loan-cash':
      return {
        useEquityFunding: false,
        loanAmount: propertyValue * 0.8, // 80% LVR
        lvr: 80,
        depositAmount: totalCosts - (propertyValue * 0.8),
        minimumDepositRequired: totalCosts - (propertyValue * 0.8),
        interestRate: 6.8, // Consistent with other presets
        loanTerm: 30,
        mainLoanType: 'io' as const,
        ioTermYears: 5,
        // Reset equity values
        primaryPropertyValue: 0,
        existingDebt: 0,
        maxLVR: 80,
        equityLoanType: 'io' as const,
        equityLoanIoTermYears: 5,
        equityLoanInterestRate: 7.2,
        equityLoanTerm: 30,
        holdingCostFunding: 'cash' as const,
        holdingCostCashPercentage: 100
      };

    case 'loan-equity':
      return {
        useEquityFunding: true,
        loanAmount: propertyValue * 0.8, // 80% LVR
        lvr: 80,
        depositAmount: 0, // Covered by equity
        minimumDepositRequired: totalCosts - (propertyValue * 0.8),
        interestRate: 6.8, // Consistent with other presets
        loanTerm: 30,
        mainLoanType: 'io' as const,
        ioTermYears: 5,
        // Equity funding setup
        primaryPropertyValue: 1200000,
        existingDebt: 350000,
        maxLVR: 80,
        equityLoanType: 'io' as const,
        equityLoanIoTermYears: 5,
        equityLoanInterestRate: 7.2,
        equityLoanTerm: 30,
        holdingCostFunding: 'debt' as const,
        holdingCostCashPercentage: 0
      };

    case 'full-equity':
      return {
        useEquityFunding: true,
        loanAmount: 0, // No main loan
        lvr: 0,
        depositAmount: 0, // All covered by equity
        minimumDepositRequired: totalCosts,
        interestRate: 6.8, // Consistent with other presets
        loanTerm: 30,
        mainLoanType: 'io' as const,
        ioTermYears: 5,
        // Larger equity property
        primaryPropertyValue: 1500000,
        existingDebt: 300000,
        maxLVR: 80,
        equityLoanType: 'io' as const,
        equityLoanIoTermYears: 5,
        equityLoanInterestRate: 7.2,
        equityLoanTerm: 30,
        holdingCostFunding: 'debt' as const,
        holdingCostCashPercentage: 0
      };

    default:
      return {};
  }
};

// Generate complete preset configuration
export const generatePreset = (propertyMethod: PropertyMethod, fundingMethod: FundingMethod): Partial<PropertyData> & { propertyMethod: PropertyMethod; fundingMethod: FundingMethod } => {
  const propertyData = getPropertyMethodData(propertyMethod);
  const propertyValue = propertyData.purchasePrice || 750000;
  const fundingData = getFundingMethodData(fundingMethod, propertyValue);

  return {
    ...propertyData,
    ...fundingData,
    propertyMethod,
    fundingMethod
  };
};

// Helper to get all preset combinations
export const getAllPresetCombinations = (): PresetConfig[] => {
  const combinations: PresetConfig[] = [];
  
  Object.keys(PROPERTY_METHODS).forEach(propertyMethod => {
    Object.keys(FUNDING_METHODS).forEach(fundingMethod => {
      combinations.push({
        propertyMethod: propertyMethod as PropertyMethod,
        fundingMethod: fundingMethod as FundingMethod,
        data: generatePreset(propertyMethod as PropertyMethod, fundingMethod as FundingMethod)
      });
    });
  });

  return combinations;
};