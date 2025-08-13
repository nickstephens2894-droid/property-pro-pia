import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PropertyMethod, FundingMethod } from '@/types/presets';

interface Client {
  id: string;
  name: string;
  annualIncome: number;
  otherIncome: number;
  hasMedicareLevy: boolean;
}

interface OwnershipAllocation {
  clientId: string;
  ownershipPercentage: number;
}

export interface PropertyData {
  // Multi-client structure
  clients: Client[];
  ownershipAllocations: OwnershipAllocation[];
  
  // Project Type
  isConstructionProject: boolean;
  
  // Basic Property Details - Enhanced
  purchasePrice: number;
  weeklyRent: number;
  rentalGrowthRate: number;
  vacancyRate: number;
  constructionYear: number;
  buildingValue: number;
  plantEquipmentValue: number;
  
  // Construction-specific
  landValue: number;
  constructionValue: number;
  constructionPeriod: number; // months
  constructionInterestRate: number;
  
  // Construction Progress Payments
  constructionProgressPayments: Array<{
    id: string;
    percentage: number;
    month: number;
    description: string;
  }>; 
  
  // Traditional Financing
  deposit: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  lvr: number; // Loan to Value Ratio
  
  // Enhanced Loan Options
  mainLoanType: 'io' | 'pi';
  ioTermYears: number;
  
  // Equity Funding Enhanced
  useEquityFunding: boolean;
  primaryPropertyValue: number;
  existingDebt: number;
  maxLVR: number;
  equityLoanType: 'io' | 'pi';
  equityLoanIoTermYears: number;
  equityLoanInterestRate: number;
  equityLoanTerm: number;
  
  // Deposit Management
  depositAmount: number;
  minimumDepositRequired: number;
  
  // Holding Costs During Construction
  holdingCostFunding: 'cash' | 'debt' | 'hybrid';
  holdingCostCashPercentage: number; // For hybrid funding
  // Capitalisation option and equity repayments during construction
  capitalizeConstructionCosts: boolean;
  constructionEquityRepaymentType: 'io' | 'pi';
  
  // Separate interest calculations for tax purposes
  landHoldingInterest: number; // Land-related interest (non-deductible)
  constructionHoldingInterest: number; // Construction-related interest (deductible)
  totalHoldingCosts: number; // Total holding costs during construction
  
  // Purchase Costs
  stampDuty: number;
  legalFees: number;
  inspectionFees: number;
  
  // Construction Costs
  councilFees: number;
  architectFees: number;
  siteCosts: number;
  
  // Annual Expenses
  propertyManagement: number;
  councilRates: number;
  insurance: number;
  repairs: number;
  
  // Depreciation fields
  depreciationMethod: 'prime-cost' | 'diminishing-value';
  isNewProperty: boolean;

  // Preset tracking
  currentPropertyMethod?: PropertyMethod;
  currentFundingMethod?: FundingMethod;
}

interface PropertyDataContextType {
  propertyData: PropertyData;
  setPropertyData: React.Dispatch<React.SetStateAction<PropertyData>>;
  updateField: (field: keyof PropertyData, value: number | boolean | string) => void;
  updateFieldWithConfirmation: (
    field: keyof PropertyData, 
    value: number | boolean | string,
    onConfirm?: () => void
  ) => void;
  applyPreset: (presetData: Partial<PropertyData>, propertyMethod?: PropertyMethod, fundingMethod?: FundingMethod) => void;
  loadScenario: (scenarioData: PropertyData) => void;
  resetToDefaults: () => void;
  calculateEquityLoanAmount: () => number;
  calculateTotalProjectCost: () => number;
  calculateAvailableEquity: () => number;
  calculateHoldingCosts: () => { 
    landInterest: number; 
    stampDutyInterest: number;
    constructionInterest: number; 
    developmentCostsInterest: number;
    transactionCostsInterest: number;
    total: number;
    monthlyBreakdown: any[];
  };
  calculateMinimumDeposit: () => number;
}

const PropertyDataContext = createContext<PropertyDataContextType | undefined>(undefined);

const defaultPropertyData: PropertyData = {
  // Multi-client structure
  clients: [
    {
      id: '1',
      name: 'Investor 1',
      annualIncome: 180000, // High income earner (37% bracket)
      otherIncome: 0,
      hasMedicareLevy: true,
    },
    {
      id: '2',
      name: 'Investor 2',
      annualIncome: 65000, // Mid income earner (30% bracket)
      otherIncome: 0,
      hasMedicareLevy: false,
    }
  ],
  ownershipAllocations: [
    { clientId: '1', ownershipPercentage: 70 }, // Optimized split
    { clientId: '2', ownershipPercentage: 30 }
  ],
  
  // Project Type
  isConstructionProject: false,
  
  // Basic Property Details - Enhanced
  purchasePrice: 750000,
  weeklyRent: 680, // ~4.7% gross yield
  rentalGrowthRate: 5.0,
  vacancyRate: 2.0,
  constructionYear: 2024,
  buildingValue: 600000,
  plantEquipmentValue: 40000, // Ensures building + plant = total if needed
  
  // Construction-specific (for construction projects)
  landValue: 200000,
  constructionValue: 550000, // Ensures land + construction = purchase price
  constructionPeriod: 8, // months
  constructionInterestRate: 7.0, // typically higher than standard rate
  
  // Construction Progress Payments
  constructionProgressPayments: [
    { id: '1', percentage: 10, month: 1, description: 'Site preparation & slab' },
    { id: '2', percentage: 20, month: 2, description: 'Frame & roof' },
    { id: '3', percentage: 25, month: 4, description: 'Lock-up stage' },
    { id: '4', percentage: 25, month: 6, description: 'Fixing stage' },
    { id: '5', percentage: 20, month: 8, description: 'Completion' }
  ],
  
  // Traditional Financing
  deposit: 150000,
  loanAmount: 600000, // 80% of purchase price
  interestRate: 6.0, // Current market rates
  loanTerm: 30,
  lvr: 80,
  
  // Enhanced Loan Options
  mainLoanType: 'pi',
  ioTermYears: 5,
  
  // Equity Funding Enhanced
  useEquityFunding: false,
  primaryPropertyValue: 1000000,
  existingDebt: 400000,
  maxLVR: 80,
  equityLoanType: 'pi',
  equityLoanIoTermYears: 3,
  equityLoanInterestRate: 7.2, // Higher rate for equity loans
  equityLoanTerm: 25,
  
  // Deposit Management - Auto-calculated
  depositAmount: 194600, // Actual amount needed for 20% + costs
  minimumDepositRequired: 194600,
  
  // Holding Costs During Construction
  holdingCostFunding: 'cash',
  holdingCostCashPercentage: 100,
  capitalizeConstructionCosts: false,
  constructionEquityRepaymentType: 'io',
  
  // Separate interest calculations for tax purposes - Auto-calculated
  landHoldingInterest: 0,
  constructionHoldingInterest: 0,
  totalHoldingCosts: 0,
  
  // Purchase Costs
  stampDuty: 0,
  legalFees: 1500,
  inspectionFees: 600,
  
  // Construction Costs
  councilFees: 3000,
  architectFees: 8000,
  siteCosts: 12000,
  
  // Annual Expenses
  propertyManagement: 6.5,
  councilRates: 2200,
  insurance: 1200,
  repairs: 1500,
  
  // Depreciation / Tax
  depreciationMethod: 'prime-cost',
  isNewProperty: true,
  
  // Preset tracking
  currentPropertyMethod: undefined,
  currentFundingMethod: undefined,
};

export const PropertyDataProvider = ({ children }: { children: ReactNode }) => {
  const [propertyData, setPropertyData] = useState<PropertyData>(defaultPropertyData);

  // Centralized calculations (existing code omitted for brevity)
  const calculateEquityLoanAmount = () => {
    const equityAvailable = Math.max(0, propertyData.primaryPropertyValue * (propertyData.maxLVR / 100) - propertyData.existingDebt);
    return propertyData.useEquityFunding ? Math.min(equityAvailable, propertyData.depositAmount) : 0;
  };

  const calculateTotalProjectCost = () => {
    const purchaseCosts = propertyData.stampDuty + propertyData.legalFees + propertyData.inspectionFees;
    const constructionCosts = propertyData.councilFees + propertyData.architectFees + propertyData.siteCosts;
    const baseCost = propertyData.isConstructionProject 
      ? propertyData.landValue + propertyData.constructionValue 
      : propertyData.purchasePrice;
    return baseCost + purchaseCosts + constructionCosts + propertyData.totalHoldingCosts;
  };

  const calculateAvailableEquity = () => {
    return Math.max(0, propertyData.primaryPropertyValue * (propertyData.maxLVR / 100) - propertyData.existingDebt);
  };

  const calculateHoldingCosts = () => {
    // Only calculate for construction projects
    if (!propertyData.isConstructionProject || propertyData.constructionPeriod === 0 || propertyData.constructionInterestRate === 0) {
      return {
        landInterest: 0,
        stampDutyInterest: 0,
        constructionInterest: 0,
        developmentCostsInterest: 0,
        transactionCostsInterest: 0,
        total: 0,
        monthlyBreakdown: []
      };
    }

    const periodYears = propertyData.constructionPeriod / 12;
    const interestMultiplier = Math.pow(1 + propertyData.constructionInterestRate / 100, periodYears) - 1;

    // Land Interest (Non-deductible): Interest on land value over construction period
    const landInterest = propertyData.landValue * interestMultiplier;

    // Stamp Duty Interest: Interest on stamp duty over construction period
    const stampDutyInterest = propertyData.stampDuty * interestMultiplier;

    // Construction Interest (Deductible): Interest on construction progress payments
    let constructionInterest = 0;
    for (const payment of propertyData.constructionProgressPayments) {
      const paymentAmount = (payment.percentage / 100) * propertyData.constructionValue;
      const monthsRemaining = propertyData.constructionPeriod - payment.month;
      if (monthsRemaining > 0) {
        const paymentPeriodYears = monthsRemaining / 12;
        const paymentInterestMultiplier = Math.pow(1 + propertyData.constructionInterestRate / 100, paymentPeriodYears) - 1;
        constructionInterest += paymentAmount * paymentInterestMultiplier;
      }
    }

    // Development Costs Interest: Interest on upfront development costs
    const developmentCosts = propertyData.councilFees + propertyData.architectFees + propertyData.siteCosts;
    const developmentCostsInterest = developmentCosts * interestMultiplier;

    // Transaction Costs Interest: Interest on legal and inspection fees
    const transactionCosts = propertyData.legalFees + propertyData.inspectionFees;
    const transactionCostsInterest = transactionCosts * interestMultiplier;

    const total = landInterest + stampDutyInterest + constructionInterest + developmentCostsInterest + transactionCostsInterest;

    return {
      landInterest: Math.round(landInterest),
      stampDutyInterest: Math.round(stampDutyInterest),
      constructionInterest: Math.round(constructionInterest),
      developmentCostsInterest: Math.round(developmentCostsInterest),
      transactionCostsInterest: Math.round(transactionCostsInterest),
      total: Math.round(total),
      monthlyBreakdown: []
    };
  };

  const calculateMinimumDeposit = () => {
    // Placeholder for minimum deposit calculation
    return propertyData.minimumDepositRequired;
  };

  const updateField = (field: keyof PropertyData, value: number | boolean | string) => {
    setPropertyData(prev => ({ ...prev, [field]: value }));
  };

  const updateFieldWithConfirmation = (
    field: keyof PropertyData, 
    value: number | boolean | string,
    onConfirm?: () => void
  ) => {
    updateField(field, value);
    onConfirm?.();
  };

  const applyPreset = (presetData: Partial<PropertyData>, propertyMethod?: PropertyMethod, fundingMethod?: FundingMethod) => {
    setPropertyData(prev => ({
      ...prev,
      ...presetData,
      currentPropertyMethod: propertyMethod ?? prev.currentPropertyMethod,
      currentFundingMethod: fundingMethod ?? prev.currentFundingMethod
    }));
  };

  const loadScenario = (scenarioData: PropertyData) => {
    setPropertyData(scenarioData);
  };

  const resetToDefaults = () => {
    // Deep clone to avoid accidental mutation of shared defaults
    const cloned: PropertyData = JSON.parse(JSON.stringify(defaultPropertyData));
    setPropertyData(cloned);
  };

  return (
    <PropertyDataContext.Provider value={{ 
      propertyData, 
      setPropertyData, 
      updateField, 
      updateFieldWithConfirmation,
      applyPreset,
      loadScenario,
      resetToDefaults,
      calculateEquityLoanAmount,
      calculateTotalProjectCost,
      calculateAvailableEquity,
      calculateHoldingCosts,
      calculateMinimumDeposit
    }}>
      {children}
    </PropertyDataContext.Provider>
  );
};

export const usePropertyData = () => {
  const context = useContext(PropertyDataContext);
  if (context === undefined) {
    throw new Error('usePropertyData must be used within a PropertyDataProvider');
  }
  return context;
};