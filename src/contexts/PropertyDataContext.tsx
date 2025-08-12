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
  PropertyState: 'ACT'|'NSW'|'NT'|'QLD'|'SA'|'TAS'|'VIC'|'WA';
  
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
  resetData: () => void;
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
  
  // Purchase Costs - Current market rates
  PropertyState: 'VIC',
  stampDuty: 42000, // Realistic VIC stamp duty for $750k
  legalFees: 2000,
  inspectionFees: 600,
  
  // Construction Costs (zero for built properties)
  councilFees: 0,
  architectFees: 0,
  siteCosts: 0,
  
  // Annual Expenses
  propertyManagement: 8,
  councilRates: 2800, // More realistic council rates
  insurance: 1800, // Higher insurance costs
  repairs: 2000,
  
  // Depreciation defaults
  depreciationMethod: 'prime-cost',
  isNewProperty: true,

  // Preset tracking
  currentPropertyMethod: undefined,
  currentFundingMethod: undefined,
};

export const PropertyDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [propertyData, setPropertyData] = useState<PropertyData>(defaultPropertyData);

  // Enhanced holding costs calculation with detailed breakdown
  const calculateHoldingCosts = () => {
    if (!propertyData.isConstructionProject) {
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
    const interestRate = propertyData.constructionInterestRate / 100;
    
    // Land value interest (full amount from day 1)
    const landInterest = propertyData.landValue * ((Math.pow(1 + interestRate, periodYears) - 1));
    
    // Stamp duty interest (paid upfront with land)
    const stampDutyInterest = propertyData.stampDuty * ((Math.pow(1 + interestRate, periodYears) - 1));
    
    // Progressive construction interest based on payment schedule
    let constructionInterest = 0;
    const progressPayments = propertyData.constructionProgressPayments || [];
    if (progressPayments.length > 0) {
      // Calculate interest based on actual payment schedule
      progressPayments.forEach(payment => {
        const paymentAmount = propertyData.constructionValue * (payment.percentage / 100);
        const monthsRemaining = Math.max(0, propertyData.constructionPeriod - payment.month);
        const yearsRemaining = monthsRemaining / 12;
        if (yearsRemaining > 0) {
          constructionInterest += paymentAmount * ((Math.pow(1 + interestRate, yearsRemaining) - 1));
        }
      });
    } else {
      // Fallback to 50% average drawdown method
      const averageConstructionDrawdown = propertyData.constructionValue * 0.5;
      constructionInterest = averageConstructionDrawdown * ((Math.pow(1 + interestRate, periodYears) - 1));
    }
    
    // Development costs interest (paid upfront or early in construction)
    const developmentCosts = propertyData.councilFees + propertyData.architectFees + propertyData.siteCosts;
    const developmentCostsInterest = developmentCosts * ((Math.pow(1 + interestRate, periodYears) - 1));
    
    // Transaction costs interest (legal fees paid upfront, inspection fees at end)
    const upfrontTransactionCosts = propertyData.legalFees;
    const transactionCostsInterest = upfrontTransactionCosts * ((Math.pow(1 + interestRate, periodYears) - 1));
    
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

  const calculateTotalProjectCost = () => {
    const baseCosts = propertyData.isConstructionProject 
      ? propertyData.landValue + propertyData.constructionValue 
      : propertyData.purchasePrice;
    
    const transactionCosts = propertyData.stampDuty + propertyData.legalFees + propertyData.inspectionFees;
    const developmentCosts = propertyData.isConstructionProject 
      ? propertyData.councilFees + propertyData.architectFees + propertyData.siteCosts 
      : 0;
    
    // Include holding costs only when capitalised during construction
    const holdingCosts = propertyData.isConstructionProject && (
      propertyData.capitalizeConstructionCosts ||
      propertyData.holdingCostFunding === 'debt' ||
      (propertyData.holdingCostFunding === 'hybrid' && propertyData.holdingCostCashPercentage < 100)
    ) ? calculateHoldingCosts().total : 0;
    
    return baseCosts + transactionCosts + developmentCosts + holdingCosts;
  };

  const calculateAvailableEquity = () => {
    return Math.max(0, (propertyData.primaryPropertyValue * propertyData.maxLVR / 100) - propertyData.existingDebt);
  };

  const calculateMinimumDeposit = () => {
    const totalProjectCost = calculateTotalProjectCost();
    if (propertyData.useEquityFunding) {
      // With equity funding, deposit is only what equity can't cover
      const availableEquity = calculateAvailableEquity();
      const fundingGap = totalProjectCost - propertyData.loanAmount;
      return Math.max(0, fundingGap - availableEquity);
    } else {
      // Traditional funding: total cost minus loan amount
      return Math.max(0, totalProjectCost - propertyData.loanAmount);
    }
  };

  const calculateEquityLoanAmount = () => {
    if (!propertyData.useEquityFunding) return 0;
    
    const totalProjectCost = calculateTotalProjectCost();
    const availableEquity = calculateAvailableEquity();
    const fundingGap = totalProjectCost - propertyData.loanAmount - propertyData.depositAmount;
    
    return Math.min(availableEquity, Math.max(0, fundingGap));
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

  const resetData = () => setPropertyData(defaultPropertyData);

  return (
    <PropertyDataContext.Provider value={{ 
      propertyData, 
      setPropertyData, 
      updateField, 
      updateFieldWithConfirmation,
      applyPreset,
      calculateEquityLoanAmount,
      calculateTotalProjectCost,
      calculateAvailableEquity,
      calculateHoldingCosts,
      calculateMinimumDeposit,
      resetData
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