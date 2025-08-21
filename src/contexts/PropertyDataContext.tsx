import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PropertyMethod, FundingMethod } from '@/types/presets';

interface Investor {
  id: string;
  name: string;
  annualIncome: number;
  otherIncome: number;
  hasMedicareLevy: boolean;
}

interface OwnershipAllocation {
  investorId: string;
  ownershipPercentage: number;
}

export interface PropertyData {
  // Multi-investor structure
  investors: Investor[];
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

  // Property State for stamp duty calculations
  propertyState: 'ACT' | 'NSW' | 'NT' | 'QLD' | 'SA' | 'TAS' | 'VIC' | 'WA';

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
  calculateFundingAnalysis: () => {
    totalProjectCost: number;
    mainLoanAmount: number;
    equityLoanAmount: number;
    availableEquity: number;
    minimumCashRequired: number;
    actualCashDeposit: number;
    fundingShortfall: number;
    fundingSurplus: number;
    isEquityEnabled: boolean;
    equitySurplus: number;
    offsetAccountBalance: number;
  };
}

const PropertyDataContext = createContext<PropertyDataContextType | undefined>(undefined);

const defaultPropertyData: PropertyData = {
  // Multi-investor structure - Start with empty investors
  investors: [],
  ownershipAllocations: [],
  
  // Project Type
  isConstructionProject: false,
  
  // Basic Property Details - Enhanced (Start empty, populated from model)
  purchasePrice: 0,
  weeklyRent: 0,
  rentalGrowthRate: 0,
  vacancyRate: 0,
  constructionYear: 2024,
  buildingValue: 0,
  plantEquipmentValue: 0,
  
  // Construction-specific (for construction projects) - Start empty
  landValue: 0,
  constructionValue: 0,
  constructionPeriod: 0,
  constructionInterestRate: 0,
  
  // Construction Progress Payments
  constructionProgressPayments: [
    { id: '1', percentage: 10, month: 1, description: 'Site preparation & slab' },
    { id: '2', percentage: 20, month: 2, description: 'Frame & roof' },
    { id: '3', percentage: 25, month: 4, description: 'Lock-up stage' },
    { id: '4', percentage: 25, month: 6, description: 'Fixing stage' },
    { id: '5', percentage: 20, month: 8, description: 'Completion' }
  ],
  
  // Traditional Financing (Start empty, populated from model)
  deposit: 0,
  loanAmount: 0,
  interestRate: 0,
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
  
  // Purchase Costs (Start empty, populated from model)
  stampDuty: 0,
  legalFees: 0,
  inspectionFees: 0,
  
  // Construction Costs (Start empty, populated from model)
  councilFees: 0,
  architectFees: 0,
  siteCosts: 0,
  
  // Annual Expenses (Start empty, populated from model)
  propertyManagement: 0,
  councilRates: 0,
  insurance: 0,
  repairs: 0,
  
  // Depreciation / Tax
  depreciationMethod: 'prime-cost',
  isNewProperty: true,
  
  // Property State for stamp duty calculations
  propertyState: 'VIC',

  // Preset tracking
  currentPropertyMethod: undefined,
  currentFundingMethod: undefined,
};

export const PropertyDataProvider = ({ children }: { children: ReactNode }) => {
  const [propertyData, setPropertyData] = useState<PropertyData>(defaultPropertyData);

  // Centralized calculations (existing code omitted for brevity)
  const calculateEquityLoanAmount = () => {
    if (!propertyData.useEquityFunding) return 0;
    
    const totalProjectCost = calculateTotalProjectCost();
    const shortfallAfterMainLoan = Math.max(0, totalProjectCost - propertyData.loanAmount);
    const availableEquity = Math.max(0, propertyData.primaryPropertyValue * (propertyData.maxLVR / 100) - propertyData.existingDebt);
    
    // Use equity to cover shortfall up to available equity
    return Math.min(shortfallAfterMainLoan, availableEquity);
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
    const fundingAnalysis = calculateFundingAnalysis();
    return fundingAnalysis.minimumCashRequired;
  };

  const calculateFundingAnalysis = () => {
    const totalProjectCost = calculateTotalProjectCost();
    const availableEquity = calculateAvailableEquity();
    
    // Calculate equity loan amount first (without circular dependency)
    const shortfallAfterMainLoan = Math.max(0, totalProjectCost - propertyData.loanAmount);
    const equityLoanAmount = propertyData.useEquityFunding 
      ? Math.min(shortfallAfterMainLoan, availableEquity)
      : 0;
    
    // Calculate what's needed after main loan and equity
    const shortfallAfterLoans = Math.max(0, totalProjectCost - propertyData.loanAmount - equityLoanAmount);
    const actualCashDeposit = propertyData.depositAmount || 0;
    
    // Total funding provided
    const totalFunding = propertyData.loanAmount + equityLoanAmount + actualCashDeposit;
    
    return {
      totalProjectCost,
      mainLoanAmount: propertyData.loanAmount,
      equityLoanAmount,
      availableEquity,
      minimumCashRequired: shortfallAfterLoans,
      actualCashDeposit,
      fundingShortfall: Math.max(0, totalProjectCost - totalFunding),
      fundingSurplus: Math.max(0, totalFunding - totalProjectCost),
      isEquityEnabled: propertyData.useEquityFunding,
      equitySurplus: Math.max(0, availableEquity - equityLoanAmount),
      offsetAccountBalance: Math.max(0, totalFunding - totalProjectCost),
    };
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
      calculateMinimumDeposit,
      calculateFundingAnalysis
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