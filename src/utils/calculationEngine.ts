// Centralized calculation engine to eliminate duplicate logic
// This module consolidates all financial calculations for consistency

import { PropertyData } from "@/contexts/PropertyDataContext";
import { 
  ECONOMIC_CONSTANTS, 
  FINANCE_CONSTANTS, 
  PROPERTY_CONSTANTS,
  MANAGEMENT_CONSTANTS,
  DERIVED_CONSTANTS 
} from "./constants";
import { totalTaxAU, incomeTaxAU, marginalRateAU } from "./tax";

// =========================
// DEPRECIATION CALCULATIONS
// =========================

export const calculateAnnualDepreciation = (
  buildingValue: number, 
  plantEquipmentValue: number,
  year: number
): { buildingDepreciation: number; plantDepreciation: number; totalDepreciation: number } => {
  // Building depreciation: 2.5% prime cost method (straight line)
  const buildingDepreciation = buildingValue * PROPERTY_CONSTANTS.BUILDING_DEPRECIATION_RATE;
  
  // Plant & Equipment: 15% diminishing value method (simplified)
  const remainingPlantValue = plantEquipmentValue * Math.pow(1 - PROPERTY_CONSTANTS.PLANT_EQUIPMENT_RATE, year - 1);
  const plantDepreciation = remainingPlantValue * PROPERTY_CONSTANTS.PLANT_EQUIPMENT_RATE;
  
  return {
    buildingDepreciation,
    plantDepreciation,
    totalDepreciation: buildingDepreciation + plantDepreciation
  };
};

// =========================
// LOAN PAYMENT CALCULATIONS
// =========================

export const calculateLoanPayments = (
  principal: number,
  annualRate: number,
  termYears: number,
  ioTermYears: number = 0,
  currentYear: number = 1,
  frequency: 'weekly' | 'monthly' = 'monthly'
): { interestOnlyPayment: number; principalAndInterestPayment: number; currentPayment: number } => {
  const periodsPerYear = frequency === 'weekly' 
    ? FINANCE_CONSTANTS.WEEKLY_PERIODS_PER_YEAR 
    : FINANCE_CONSTANTS.MONTHLY_PERIODS_PER_YEAR;
  const periodRate = annualRate / 100 / periodsPerYear;
  
  // Interest-only payment
  const interestOnlyPayment = principal * periodRate;
  
  // Principal & Interest payment for full term
  const totalPeriods = termYears * periodsPerYear;
  const principalAndInterestPayment = periodRate === 0 
    ? principal / totalPeriods
    : (principal * periodRate * Math.pow(1 + periodRate, totalPeriods)) / 
      (Math.pow(1 + periodRate, totalPeriods) - 1);
  
  // Current payment based on IO period
  const currentPayment = currentYear <= ioTermYears 
    ? interestOnlyPayment 
    : principalAndInterestPayment;
  
  return {
    interestOnlyPayment,
    principalAndInterestPayment,
    currentPayment
  };
};

// =========================
// LOAN BALANCE CALCULATIONS
// =========================

export const calculateLoanBalance = (
  initialPrincipal: number,
  annualRate: number,
  termYears: number,
  ioTermYears: number,
  currentYear: number,
  frequency: 'weekly' | 'monthly' = 'monthly'
): number => {
  if (currentYear <= 0) return initialPrincipal;
  
  const periodsPerYear = frequency === 'weekly' 
    ? FINANCE_CONSTANTS.WEEKLY_PERIODS_PER_YEAR 
    : FINANCE_CONSTANTS.MONTHLY_PERIODS_PER_YEAR;
  const periodRate = annualRate / 100 / periodsPerYear;
  
  let balance = initialPrincipal;
  
  // Process each year
  for (let year = 1; year <= currentYear; year++) {
    const yearPeriods = periodsPerYear;
    
    if (year <= ioTermYears) {
      // Interest-only period - balance doesn't change
      continue;
    } else {
      // Principal & Interest period
      const remainingTermYears = termYears - Math.max(0, ioTermYears);
      const remainingPeriods = remainingTermYears * periodsPerYear;
      const piPayment = (balance * periodRate * Math.pow(1 + periodRate, remainingPeriods)) / 
                       (Math.pow(1 + periodRate, remainingPeriods) - 1);
      
      // Calculate balance after this year
      for (let period = 1; period <= yearPeriods && balance > 0; period++) {
        const interestPayment = balance * periodRate;
        const principalPayment = piPayment - interestPayment;
        balance = Math.max(0, balance - principalPayment);
      }
    }
  }
  
  return Math.max(0, balance);
};

// =========================
// PROPERTY VALUE CALCULATIONS
// =========================

export const calculatePropertyValue = (
  initialValue: number,
  growthRate: number,
  year: number
): number => {
  return initialValue * Math.pow(1 + growthRate / 100, year);
};

// =========================
// TAX CALCULATIONS
// =========================

export interface TaxCalculationResult {
  baseIncomeTax: number;
  propertyIncomeTax: number;
  taxBenefit: number;
  marginalRate: number;
  effectiveRate: number;
}

export const calculateInvestorTax = (
  baseIncome: number,
  propertyIncome: number,
  propertyLoss: number,
  depreciation: number,
  hasMedicareLevy: boolean,
  cpiAdjustment: number = 1
): TaxCalculationResult => {
  // Apply CPI adjustment to income
  const adjustedBaseIncome = baseIncome * cpiAdjustment;
  
  // Calculate tax on base income only
  const baseIncomeTax = totalTaxAU(adjustedBaseIncome, hasMedicareLevy);
  
  // Calculate tax including property income/loss
  const totalTaxableIncome = adjustedBaseIncome + propertyIncome - propertyLoss - depreciation;
  const propertyIncomeTax = totalTaxAU(Math.max(0, totalTaxableIncome), hasMedicareLevy);
  
  // Tax benefit is the difference
  const taxBenefit = baseIncomeTax - propertyIncomeTax;
  
  // Calculate rates
  const marginalRate = marginalRateAU(adjustedBaseIncome);
  const effectiveRate = adjustedBaseIncome > 0 ? (baseIncomeTax / adjustedBaseIncome) * 100 : 0;
  
  return {
    baseIncomeTax,
    propertyIncomeTax,
    taxBenefit,
    marginalRate,
    effectiveRate
  };
};

// =========================
// RENTAL INCOME CALCULATIONS
// =========================

export const calculateRentalIncome = (
  weeklyRent: number,
  growthRate: number,
  year: number,
  vacancyRate: number = 0
): number => {
  const adjustedRent = weeklyRent * Math.pow(1 + growthRate / 100, year - 1);
  const annualRent = adjustedRent * MANAGEMENT_CONSTANTS.WEEKS_PER_YEAR;
  return annualRent * (1 - vacancyRate / 100);
};

// =========================
// CPI CALCULATIONS
// =========================

export const calculateCPIAdjustment = (
  baseAmount: number,
  year: number,
  cpiRate: number = ECONOMIC_CONSTANTS.DEFAULT_CPI_RATE
): number => {
  return baseAmount * Math.pow(1 + cpiRate / 100, year - 1);
};

// =========================
// CASH FLOW CALCULATIONS
// =========================

export interface CashFlowComponents {
  rentalIncome: number;
  loanInterest: number;
  otherExpenses: number;
  depreciation: number;
  pretaxCashFlow: number;
  taxBenefit: number;
  afterTaxCashFlow: number;
}

export const calculateCashFlowComponents = (
  weeklyRent: number,
  rentalGrowthRate: number,
  loanBalance: number,
  loanRate: number,
  otherExpenses: number,
  depreciation: number,
  taxBenefit: number,
  year: number,
  vacancyRate: number = 0
): CashFlowComponents => {
  const rentalIncome = calculateRentalIncome(weeklyRent, rentalGrowthRate, year, vacancyRate);
  const loanInterest = loanBalance * (loanRate / 100);
  
  const pretaxCashFlow = rentalIncome - loanInterest - otherExpenses;
  const afterTaxCashFlow = pretaxCashFlow + taxBenefit;
  
  return {
    rentalIncome,
    loanInterest,
    otherExpenses,
    depreciation,
    pretaxCashFlow,
    taxBenefit,
    afterTaxCashFlow
  };
};

// =========================
// VALIDATION HELPERS
// =========================

export const validateCalculationInputs = (propertyData: PropertyData): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Critical validations
  if (propertyData.weeklyRent <= 0) {
    errors.push("Weekly rent must be greater than 0");
  }
  
  if (propertyData.loanAmount <= 0) {
    errors.push("Loan amount must be greater than 0");
  }
  
  if (propertyData.interestRate < 0 || propertyData.interestRate > 20) {
    errors.push("Interest rate must be between 0% and 20%");
  }
  
  // Warning validations
  if (propertyData.rentalGrowthRate < 0 || propertyData.rentalGrowthRate > 10) {
    warnings.push("Rental growth rate seems unusual (expected 0-10%)");
  }
  
  if (propertyData.buildingValue <= 0) {
    warnings.push("Building value is required for depreciation calculations");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// =========================
// ROUNDING UTILITIES
// =========================

export const roundToNearest = (value: number, precision: number = 2): number => {
  return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
};

export const roundCurrency = (value: number): number => {
  return Math.round(value);
};

export const roundPercentage = (value: number): number => {
  return Math.round(value * 100) / 100;
};