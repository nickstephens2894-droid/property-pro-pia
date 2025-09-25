import { PropertyData } from "@/contexts/PropertyDataContext";
import {
  VALIDATION_CONSTANTS,
  PROPERTY_CONSTANTS,
  FINANCE_CONSTANTS,
} from "./constants";
import { validatePropertyByType } from "./propertyTypeValidation";

export type CompletionStatus = "complete" | "warning" | "incomplete" | "error";

export const validatePersonalProfile = (
  propertyData: PropertyData
): CompletionStatus => {
  // Check if all investors have valid data
  const hasValidInvestors = propertyData.investors.every((investor) => {
    const hasValidIncome =
      investor.annualIncome >= VALIDATION_CONSTANTS.MIN_ANNUAL_INCOME;
    const hasValidName = investor.name.trim() !== "";
    const hasReasonableIncome = investor.annualIncome <= 10000000; // $10M max

    return hasValidIncome && hasValidName && hasReasonableIncome;
  });

  if (propertyData.investors.length === 0) return "error";
  if (!hasValidInvestors) return "error";
  return "complete";
};

export const validatePropertyBasics = (
  propertyData: PropertyData
): CompletionStatus => {
  if (propertyData.isConstructionProject) {
    const hasValidLandValue =
      propertyData.landValue >= VALIDATION_CONSTANTS.MIN_PURCHASE_PRICE;
    const hasValidConstructionValue =
      propertyData.constructionValue >= VALIDATION_CONSTANTS.MIN_PURCHASE_PRICE;
    const hasValidRent =
      propertyData.weeklyRent >= VALIDATION_CONSTANTS.MIN_WEEKLY_RENT;
    const hasValidConstructionPeriod =
      propertyData.constructionPeriod > 0 &&
      propertyData.constructionPeriod <= 60; // max 5 years

    // Check reasonable total value
    const totalValue = propertyData.landValue + propertyData.constructionValue;
    const isReasonableValue =
      totalValue <= VALIDATION_CONSTANTS.MAX_PROPERTY_VALUE;

    if (!hasValidLandValue || !hasValidConstructionValue || !isReasonableValue)
      return "error";
    if (!hasValidRent || !hasValidConstructionPeriod) return "warning";
    return "complete";
  } else {
    const hasValidPurchasePrice =
      propertyData.purchasePrice >= VALIDATION_CONSTANTS.MIN_PURCHASE_PRICE &&
      propertyData.purchasePrice <= VALIDATION_CONSTANTS.MAX_PROPERTY_VALUE;
    const hasValidRent =
      propertyData.weeklyRent >= VALIDATION_CONSTANTS.MIN_WEEKLY_RENT;
    const hasValidBuildingValue = propertyData.buildingValue > 0;

    if (!hasValidPurchasePrice) return "error";
    if (!hasValidRent || !hasValidBuildingValue) return "warning";
    return "complete";
  }
};

export const validateFinancing = (
  propertyData: PropertyData
): CompletionStatus => {
  const hasValidLoanAmount =
    propertyData.loanAmount >= VALIDATION_CONSTANTS.MIN_LOAN_AMOUNT;
  const hasValidInterestRate =
    propertyData.interestRate >= VALIDATION_CONSTANTS.MIN_INTEREST_RATE &&
    propertyData.interestRate <= VALIDATION_CONSTANTS.MAX_INTEREST_RATE;
  const hasValidLoanTerm =
    propertyData.loanTerm >= VALIDATION_CONSTANTS.MIN_LOAN_TERM &&
    propertyData.loanTerm <= VALIDATION_CONSTANTS.MAX_LOAN_TERM;

  // Skip IO period validation for now - will be addressed when property interface is updated
  const hasValidIOPeriod = true;

  if (
    !hasValidLoanAmount ||
    !hasValidInterestRate ||
    !hasValidLoanTerm ||
    !hasValidIOPeriod
  )
    return "error";

  // Check funding coverage
  const totalCost = propertyData.isConstructionProject
    ? propertyData.landValue +
      propertyData.constructionValue +
      propertyData.stampDuty +
      propertyData.legalFees +
      propertyData.inspectionFees +
      propertyData.councilFees +
      propertyData.architectFees +
      propertyData.siteCosts
    : propertyData.purchasePrice +
      propertyData.stampDuty +
      propertyData.legalFees +
      propertyData.inspectionFees;

  const equityLoanAmount = propertyData.useEquityFunding
    ? Math.min(
        propertyData.primaryPropertyValue * (propertyData.maxLVR / 100) -
          propertyData.existingDebt,
        totalCost - propertyData.loanAmount
      )
    : 0;

  const totalFunding = propertyData.loanAmount + equityLoanAmount;
  const fundingShortfall = Math.max(0, totalCost - totalFunding);

  if (
    fundingShortfall >
    totalCost * FINANCE_CONSTANTS.FUNDING_SHORTFALL_WARNING_THRESHOLD
  )
    return "warning";
  return "complete";
};

export const validatePurchaseCosts = (
  propertyData: PropertyData
): CompletionStatus => {
  const { stampDuty, legalFees, inspectionFees, councilFees } = propertyData;

  // Check if stamp duty is present and valid (required field with realistic minimum)
  const hasValidStampDuty =
    stampDuty !== undefined &&
    stampDuty !== null &&
    stampDuty >= VALIDATION_CONSTANTS.MIN_STAMP_DUTY;

  // Check if optional fields have been set (including 0 as valid)
  const hasLegalFees = legalFees !== undefined && legalFees !== null;
  const hasInspectionFees =
    inspectionFees !== undefined && inspectionFees !== null;
  const hasCouncilFees = councilFees !== undefined && councilFees !== null;

  if (!hasValidStampDuty) return "error";

  let missingOptionalFields = 0;
  if (!hasLegalFees) missingOptionalFields++;
  if (!hasInspectionFees) missingOptionalFields++;
  if (!hasCouncilFees) missingOptionalFields++;

  // For construction projects, also check architect fees and site costs
  if (propertyData.isConstructionProject) {
    const hasArchitectFees =
      propertyData.architectFees !== undefined &&
      propertyData.architectFees !== null;
    const hasSiteCosts =
      propertyData.siteCosts !== undefined && propertyData.siteCosts !== null;

    if (!hasArchitectFees) missingOptionalFields++;
    if (!hasSiteCosts) missingOptionalFields++;
  }

  if (missingOptionalFields === 0) return "complete";
  return missingOptionalFields <=
    VALIDATION_CONSTANTS.MISSING_OPTIONAL_FIELDS_WARNING
    ? "warning"
    : "incomplete";
};

export const validateAnnualExpenses = (
  propertyData: PropertyData
): CompletionStatus => {
  const hasPropertyManagement = propertyData.propertyManagement > 0;
  const hasCouncilRates = propertyData.councilRates > 0;
  const hasInsurance = propertyData.insurance > 0;

  if (!hasPropertyManagement || !hasCouncilRates || !hasInsurance)
    return "warning";
  return "complete";
};

export const validateConstruction = (
  propertyData: PropertyData
): CompletionStatus => {
  if (!propertyData.isConstructionProject) return "complete";

  const hasConstructionValue = propertyData.constructionValue > 0;
  const hasBuildingValue = propertyData.buildingValue > 0;
  const hasConstructionPeriod = propertyData.constructionPeriod > 0;
  const hasConstructionYear = propertyData.constructionYear > 0;

  if (!hasConstructionValue || !hasBuildingValue) return "error";
  if (!hasConstructionPeriod || !hasConstructionYear) return "warning";

  return "complete";
};

export const validateTaxOptimization = (
  propertyData: PropertyData
): CompletionStatus => {
  // Check if ownership totals 100%
  const totalOwnership = propertyData.ownershipAllocations.reduce(
    (sum, allocation) => sum + allocation.ownershipPercentage,
    0
  );

  if (
    Math.abs(totalOwnership - VALIDATION_CONSTANTS.OWNERSHIP_TOTAL_TARGET) >
    PROPERTY_CONSTANTS.PERCENTAGE_TOLERANCE
  )
    return "warning";
  return "complete";
};

/**
 * Validate property data based on property type (new vs current)
 * This is the main validation function that handles different workflows
 */
export const validatePropertyByTypeStatus = (
  propertyData: PropertyData
): CompletionStatus => {
  const result = validatePropertyByType(propertyData);

  if (result.errors.length > 0) return "error";
  if (result.warnings.length > 0) return "warning";
  return "complete";
};
