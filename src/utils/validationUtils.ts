import { PropertyData } from "@/contexts/PropertyDataContext";

export type CompletionStatus = 'complete' | 'warning' | 'incomplete' | 'error';

export const validatePersonalProfile = (propertyData: PropertyData): CompletionStatus => {
  // Check if all investors have income > 0
  const hasIncomeData = propertyData.investors.every(investor => 
    investor.annualIncome > 0 && investor.name.trim() !== ''
  );
  
  if (!hasIncomeData) return 'error';
  return 'complete';
};

export const validatePropertyBasics = (propertyData: PropertyData): CompletionStatus => {
  if (propertyData.isConstructionProject) {
    const hasLandValue = propertyData.landValue > 0;
    const hasConstructionValue = propertyData.constructionValue > 0;
    const hasRent = propertyData.weeklyRent > 0;
    const hasConstructionPeriod = propertyData.constructionPeriod > 0;
    
    if (!hasLandValue || !hasConstructionValue) return 'error';
    if (!hasRent || !hasConstructionPeriod) return 'warning';
    return 'complete';
  } else {
    const hasPurchasePrice = propertyData.purchasePrice > 0;
    const hasRent = propertyData.weeklyRent > 0;
    const hasBuildingValue = propertyData.buildingValue > 0;
    
    if (!hasPurchasePrice) return 'error';
    if (!hasRent || !hasBuildingValue) return 'warning';
    return 'complete';
  }
};

export const validateFinancing = (propertyData: PropertyData): CompletionStatus => {
  const hasMainLoan = propertyData.loanAmount > 0;
  const hasInterestRate = propertyData.interestRate > 0;
  const hasLoanTerm = propertyData.loanTerm > 0;
  
  if (!hasMainLoan || !hasInterestRate || !hasLoanTerm) return 'error';
  
  // Check funding coverage
  const totalCost = propertyData.isConstructionProject
    ? propertyData.landValue + propertyData.constructionValue + 
      propertyData.stampDuty + propertyData.legalFees + propertyData.inspectionFees +
      propertyData.councilFees + propertyData.architectFees + propertyData.siteCosts
    : propertyData.purchasePrice + propertyData.stampDuty + propertyData.legalFees + propertyData.inspectionFees;
  
  const equityLoanAmount = propertyData.useEquityFunding 
    ? Math.min(
        propertyData.primaryPropertyValue * (propertyData.maxLVR / 100) - propertyData.existingDebt,
        totalCost - propertyData.loanAmount
      )
    : 0;
  
  const totalFunding = propertyData.loanAmount + equityLoanAmount;
  const fundingShortfall = Math.max(0, totalCost - totalFunding);
  
  if (fundingShortfall > totalCost * 0.1) return 'warning';
  return 'complete';
};

export const validatePurchaseCosts = (propertyData: PropertyData): CompletionStatus => {
  const { stampDuty, legalFees, inspectionFees, councilFees } = propertyData;
  
  // Check if all basic purchase costs are present (including 0 as valid)
  const hasStampDuty = stampDuty !== undefined && stampDuty !== null && stampDuty > 0;
  const hasLegalFees = legalFees !== undefined && legalFees !== null;
  const hasInspectionFees = inspectionFees !== undefined && inspectionFees !== null;
  const hasCouncilFees = councilFees !== undefined && councilFees !== null;
  
  if (!hasStampDuty) return 'error';
  
  let missingOptionalFields = 0;
  if (!hasLegalFees) missingOptionalFields++;
  if (!hasInspectionFees) missingOptionalFields++;
  if (!hasCouncilFees) missingOptionalFields++;
  
  // For construction projects, also check architect fees and site costs
  if (propertyData.isConstructionProject) {
    const hasArchitectFees = propertyData.architectFees !== undefined && propertyData.architectFees !== null;
    const hasSiteCosts = propertyData.siteCosts !== undefined && propertyData.siteCosts !== null;
    
    if (!hasArchitectFees) missingOptionalFields++;
    if (!hasSiteCosts) missingOptionalFields++;
  }
  
  if (missingOptionalFields === 0) return 'complete';
  return missingOptionalFields <= 2 ? 'warning' : 'incomplete';
};

export const validateAnnualExpenses = (propertyData: PropertyData): CompletionStatus => {
  const hasPropertyManagement = propertyData.propertyManagement > 0;
  const hasCouncilRates = propertyData.councilRates > 0;
  const hasInsurance = propertyData.insurance > 0;
  
  if (!hasPropertyManagement || !hasCouncilRates || !hasInsurance) return 'warning';
  return 'complete';
};

export const validateConstruction = (propertyData: PropertyData): CompletionStatus => {
  if (!propertyData.isConstructionProject) return 'complete';
  
  const hasConstructionValue = propertyData.constructionValue > 0;
  const hasBuildingValue = propertyData.buildingValue > 0;
  const hasConstructionPeriod = propertyData.constructionPeriod > 0;
  const hasConstructionYear = propertyData.constructionYear > 0;
  
  if (!hasConstructionValue || !hasBuildingValue) return 'error';
  if (!hasConstructionPeriod || !hasConstructionYear) return 'warning';
  
  return 'complete';
};

export const validateTaxOptimization = (propertyData: PropertyData): CompletionStatus => {
  // Check if ownership totals 100%
  const totalOwnership = propertyData.ownershipAllocations.reduce(
    (sum, allocation) => sum + allocation.ownershipPercentage, 0
  );
  
  if (Math.abs(totalOwnership - 100) > 0.1) return 'warning';
  return 'complete';
};