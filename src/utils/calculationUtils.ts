import { PropertyData } from "@/contexts/PropertyDataContext";
import { 
  FINANCE_CONSTANTS, 
  PROPERTY_CONSTANTS, 
  VALIDATION_CONSTANTS,
  FORMAT_CONSTANTS 
} from "./constants";

// Centralized calculation utilities to ensure consistency across the app

export const calculateCompoundInterest = (principal: number, rate: number, timeInYears: number): number => {
  return principal * ((Math.pow(1 + rate, timeInYears) - 1));
};

export const calculateLoanPayment = (principal: number, annualRate: number, termYears: number, frequency: 'weekly' | 'monthly' = 'weekly'): number => {
  const periodsPerYear = frequency === 'weekly' 
    ? FINANCE_CONSTANTS.WEEKLY_PERIODS_PER_YEAR 
    : FINANCE_CONSTANTS.MONTHLY_PERIODS_PER_YEAR;
  const periodRate = annualRate / 100 / periodsPerYear;
  const totalPeriods = termYears * periodsPerYear;
  
  if (periodRate === 0) return principal / totalPeriods;
  
  return (principal * periodRate * Math.pow(1 + periodRate, totalPeriods)) / 
         (Math.pow(1 + periodRate, totalPeriods) - 1);
};

export const calculateInterestOnlyPayment = (principal: number, annualRate: number, frequency: 'weekly' | 'monthly' = 'weekly'): number => {
  const periodsPerYear = frequency === 'weekly' 
    ? FINANCE_CONSTANTS.WEEKLY_PERIODS_PER_YEAR 
    : FINANCE_CONSTANTS.MONTHLY_PERIODS_PER_YEAR;
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
    const priceDifference = Math.abs(totalConstructionValue - propertyData.purchasePrice);
    if (priceDifference > PROPERTY_CONSTANTS.VALUE_TOLERANCE) {
      errors.push(`Land + Construction values (${formatFinancialValue(totalConstructionValue)}) should equal Purchase price (${formatFinancialValue(propertyData.purchasePrice)}). Difference: ${formatFinancialValue(priceDifference)}. This may occur when switching property methods - values will auto-sync.`);
    }
    
    const totalBuildingValue = propertyData.buildingValue + propertyData.plantEquipmentValue;
    if (Math.abs(totalBuildingValue - propertyData.constructionValue) > PROPERTY_CONSTANTS.VALUE_TOLERANCE) {
      errors.push(`Building value (${propertyData.buildingValue}) + Plant & Equipment (${propertyData.plantEquipmentValue}) should equal Construction value (${propertyData.constructionValue})`);
    }
  }
  
  // Ownership percentage validation
  const totalOwnership = propertyData.ownershipAllocations.reduce((sum, allocation) => sum + allocation.ownershipPercentage, 0);
  if (Math.abs(totalOwnership - VALIDATION_CONSTANTS.OWNERSHIP_TOTAL_TARGET) > PROPERTY_CONSTANTS.PERCENTAGE_TOLERANCE) {
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

// DEPRECATED: Use marginalRateAU from tax.ts instead
// This function has incorrect tax brackets and should not be used
export const calculateTaxBracket = (income: number): { rate: number; bracket: string } => {
  console.warn('calculateTaxBracket is deprecated - use marginalRateAU from tax.ts instead');
  // Redirect to correct tax calculation
  const { marginalRateAU } = require('./tax');
  const rate = marginalRateAU(income);
  
  if (income <= 18200) return { rate, bracket: 'Tax-free threshold' };
  if (income <= 45000) return { rate, bracket: '19% bracket' };
  if (income <= 120000) return { rate, bracket: '32.5% bracket' };
  if (income <= 180000) return { rate, bracket: '37% bracket' };
  return { rate, bracket: '45% bracket' };
};

export const formatFinancialValue = (value: number, currency = true): string => {
  if (currency) {
    return new Intl.NumberFormat(FORMAT_CONSTANTS.CURRENCY_LOCALE, {
      style: 'currency',
      currency: FORMAT_CONSTANTS.CURRENCY_CODE,
      minimumFractionDigits: FORMAT_CONSTANTS.CURRENCY_MIN_DECIMALS,
      maximumFractionDigits: FORMAT_CONSTANTS.CURRENCY_MAX_DECIMALS
    }).format(value);
  }
  return new Intl.NumberFormat(FORMAT_CONSTANTS.NUMBER_LOCALE).format(value);
};

export const formatPercentage = (value: number, decimals = FORMAT_CONSTANTS.PERCENTAGE_DEFAULT_DECIMALS): string => {
  return `${value.toFixed(decimals)}%`;
};