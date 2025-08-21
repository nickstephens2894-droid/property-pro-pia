import { PropertyData } from "@/contexts/PropertyDataContext";

// Centralized calculation utilities to ensure consistency across the app

export const calculateCompoundInterest = (principal: number, rate: number, timeInYears: number): number => {
  return principal * ((Math.pow(1 + rate, timeInYears) - 1));
};

export const calculateLoanPayment = (principal: number, annualRate: number, termYears: number, frequency: 'weekly' | 'monthly' = 'weekly'): number => {
  const periodsPerYear = frequency === 'weekly' ? 52 : 12;
  const periodRate = annualRate / 100 / periodsPerYear;
  const totalPeriods = termYears * periodsPerYear;
  
  if (periodRate === 0) return principal / totalPeriods;
  
  return (principal * periodRate * Math.pow(1 + periodRate, totalPeriods)) / 
         (Math.pow(1 + periodRate, totalPeriods) - 1);
};

export const calculateInterestOnlyPayment = (principal: number, annualRate: number, frequency: 'weekly' | 'monthly' = 'weekly'): number => {
  const periodsPerYear = frequency === 'weekly' ? 52 : 12;
  const periodRate = annualRate / 100 / periodsPerYear;
  
  return principal * periodRate;
};

export const calculateCurrentLoanPayment = (
  principal: number, 
  annualRate: number, 
  termYears: number, 
  interestOnlyPeriodYears: number,
  currentYear: number,
  frequency: 'weekly' | 'monthly' = 'monthly'
): number => {
  // If still in interest-only period
  if (currentYear <= interestOnlyPeriodYears) {
    return calculateInterestOnlyPayment(principal, annualRate, frequency);
  }
  
  // Calculate P&I payment for remaining term
  const remainingTermYears = termYears - interestOnlyPeriodYears;
  return calculateLoanPayment(principal, annualRate, remainingTermYears, frequency);
};

export const validatePropertyValues = (propertyData: PropertyData): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  // Construction project validations
  if (propertyData.isConstructionProject) {
    const totalConstructionValue = propertyData.landValue + propertyData.constructionValue;
    if (Math.abs(totalConstructionValue - propertyData.purchasePrice) > 100) {
      errors.push(`Land value (${propertyData.landValue}) + Construction value (${propertyData.constructionValue}) should equal Purchase price (${propertyData.purchasePrice})`);
    }
    
    const totalBuildingValue = propertyData.buildingValue + propertyData.plantEquipmentValue;
    if (Math.abs(totalBuildingValue - propertyData.constructionValue) > 100) {
      errors.push(`Building value (${propertyData.buildingValue}) + Plant & Equipment (${propertyData.plantEquipmentValue}) should equal Construction value (${propertyData.constructionValue})`);
    }
  }
  
  // Ownership percentage validation
  const totalOwnership = propertyData.ownershipAllocations.reduce((sum, allocation) => sum + allocation.ownershipPercentage, 0);
  if (Math.abs(totalOwnership - 100) > 0.1) {
    errors.push(`Total ownership percentages (${totalOwnership}%) must equal 100%`);
  }
  
  // Interest rate consistency
  if (propertyData.useEquityFunding && propertyData.equityLoanInterestRate < propertyData.interestRate) {
    errors.push(`Equity loan interest rate (${propertyData.equityLoanInterestRate}%) should typically be higher than main loan rate (${propertyData.interestRate}%)`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const calculateTaxBracket = (income: number): { rate: number; bracket: string } => {
  if (income <= 18200) return { rate: 0, bracket: 'Tax-free threshold' };
  if (income <= 45000) return { rate: 0.16, bracket: '16% bracket' };
  if (income <= 135000) return { rate: 0.30, bracket: '30% bracket' };
  if (income <= 190000) return { rate: 0.37, bracket: '37% bracket' };
  return { rate: 0.45, bracket: '45% bracket' };
};

export const formatFinancialValue = (value: number, currency = true): string => {
  if (currency) {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
  return new Intl.NumberFormat('en-AU').format(value);
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};