import { PropertyData } from "@/contexts/PropertyDataContext";

export type CompletionStatus = 'complete' | 'warning' | 'incomplete' | 'error';

export const validatePersonalProfile = (propertyData: PropertyData): CompletionStatus => {
  // Check if all clients have income > 0
  const hasIncomeData = propertyData.clients.every(client => 
    client.annualIncome > 0 && client.name.trim() !== ''
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

  // If there is a main loan, interest rate and term are required
  if (hasMainLoan && (!hasInterestRate || !hasLoanTerm)) return 'error';

  // Total project cost
  const totalCost = propertyData.isConstructionProject
    ? propertyData.landValue + propertyData.constructionValue +
      propertyData.stampDuty + propertyData.legalFees + propertyData.inspectionFees +
      propertyData.councilFees + propertyData.architectFees + propertyData.siteCosts
    : propertyData.purchasePrice + propertyData.stampDuty + propertyData.legalFees + propertyData.inspectionFees;

  // Available equity and equity loan amount needed after cash deposit and main loan
  const availableEquity = propertyData.useEquityFunding
    ? Math.max(0, propertyData.primaryPropertyValue * (propertyData.maxLVR / 100) - propertyData.existingDebt)
    : 0;

  const equityLoanAmount = propertyData.useEquityFunding
    ? Math.min(availableEquity, Math.max(0, totalCost - propertyData.loanAmount - propertyData.depositAmount))
    : 0;

  const totalFunding = (propertyData.loanAmount || 0) + equityLoanAmount + (propertyData.depositAmount || 0);
  const fundingShortfall = Math.max(0, totalCost - totalFunding);

  if (totalCost > 0 && fundingShortfall > totalCost * 0.1) return 'warning';
  return 'complete';
};

export const validatePurchaseCosts = (propertyData: PropertyData): CompletionStatus => {
  const hasStampDuty = propertyData.stampDuty > 0;
  const hasLegalFees = propertyData.legalFees > 0;
  
  if (!hasStampDuty) return 'error';
  if (!hasLegalFees) return 'warning';
  
  if (propertyData.isConstructionProject) {
    const hasConstructionCosts = 
      propertyData.councilFees > 0 || 
      propertyData.architectFees > 0 || 
      propertyData.siteCosts > 0;
    
    if (!hasConstructionCosts) return 'warning';
  }
  
  return 'complete';
};

export const validateAnnualExpenses = (propertyData: PropertyData): CompletionStatus => {
  const hasPropertyManagement = propertyData.propertyManagement > 0;
  const hasCouncilRates = propertyData.councilRates > 0;
  const hasInsurance = propertyData.insurance > 0;
  
  if (!hasPropertyManagement || !hasCouncilRates || !hasInsurance) return 'warning';
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