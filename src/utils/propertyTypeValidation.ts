import { PropertyData } from "@/contexts/PropertyDataContext";

/**
 * Property Type Validation Utilities
 *
 * This module provides validation logic that differs between new and current properties
 * as requested by the client.
 */

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

/**
 * Validate property data based on property type
 *
 * @param propertyData - Property data to validate
 * @returns Validation result with errors and warnings
 */
export const validatePropertyByType = (
  propertyData: PropertyData
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (propertyData.propertyType === "new") {
    return validateNewProperty(propertyData);
  } else if (propertyData.propertyType === "current") {
    return validateCurrentProperty(propertyData);
  } else {
    return {
      isValid: false,
      errors: ['Invalid property type. Must be "new" or "current".'],
      warnings: [],
    };
  }
};

/**
 * Validate new property (to be purchased) - Rigid/Validated workflow
 *
 * @param propertyData - Property data to validate
 * @returns Validation result
 */
const validateNewProperty = (propertyData: PropertyData): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic property validation
  if (propertyData.purchasePrice <= 0) {
    errors.push("Purchase price must be greater than 0 for new properties");
  }

  if (propertyData.weeklyRent <= 0) {
    errors.push("Weekly rent must be greater than 0 for new properties");
  }

  // Funding validation - strict for new properties
  if (propertyData.loanAmount <= 0) {
    errors.push("Loan amount must be greater than 0 for new properties");
  }

  if (propertyData.interestRate <= 0) {
    errors.push("Interest rate must be greater than 0 for new properties");
  }

  if (propertyData.loanTerm <= 0) {
    errors.push("Loan term must be greater than 0 for new properties");
  }

  // Check funding coverage
  const totalProjectCost = calculateTotalProjectCost(propertyData);
  const totalFunding =
    propertyData.loanAmount +
    (propertyData.equityLoanAmount || 0) +
    (propertyData.depositAmount || 0);
  const fundingShortfall = Math.max(0, totalProjectCost - totalFunding);

  if (fundingShortfall > totalProjectCost * 0.1) {
    errors.push(
      `Funding shortfall of $${Math.round(
        fundingShortfall
      ).toLocaleString()} exceeds 10% of total project cost`
    );
  }

  // Construction project validation
  if (propertyData.isConstructionProject) {
    if (propertyData.landValue <= 0) {
      errors.push(
        "Land value must be greater than 0 for construction projects"
      );
    }
    if (propertyData.constructionValue <= 0) {
      errors.push(
        "Construction value must be greater than 0 for construction projects"
      );
    }
    if (propertyData.constructionPeriod <= 0) {
      errors.push(
        "Construction period must be greater than 0 for construction projects"
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate current property (already owned) - Input-based workflow
 *
 * @param propertyData - Property data to validate
 * @returns Validation result
 */
const validateCurrentProperty = (
  propertyData: PropertyData
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic property validation
  if (propertyData.currentPropertyValue <= 0) {
    errors.push(
      "Current property value must be greater than 0 for current properties"
    );
  }

  if (propertyData.weeklyRent <= 0) {
    errors.push("Weekly rent must be greater than 0 for current properties");
  }

  // Historical data validation
  if (propertyData.originalPurchasePrice <= 0) {
    warnings.push(
      "Original purchase price should be provided for accurate tax calculations"
    );
  }

  if (!propertyData.originalPurchaseDate) {
    warnings.push(
      "Original purchase date should be provided for accurate tax calculations"
    );
  }

  // Current loan balance validation (no strict requirements)
  if (propertyData.currentLoanBalance < 0) {
    errors.push("Current loan balance cannot be negative");
  }

  if (propertyData.currentEquityLoanBalance < 0) {
    errors.push("Current equity loan balance cannot be negative");
  }

  // No funding strategy validation for current properties
  // Users input their current loan balances, no need to validate funding coverage

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Calculate total project cost for validation
 *
 * @param propertyData - Property data
 * @returns Total project cost
 */
const calculateTotalProjectCost = (propertyData: PropertyData): number => {
  const purchaseCosts =
    propertyData.stampDuty +
    propertyData.legalFees +
    propertyData.inspectionFees;
  const constructionCosts =
    propertyData.councilFees +
    propertyData.architectFees +
    propertyData.siteCosts;
  const baseCost = propertyData.isConstructionProject
    ? propertyData.landValue + propertyData.constructionValue
    : propertyData.purchasePrice;
  return (
    baseCost +
    purchaseCosts +
    constructionCosts +
    propertyData.totalHoldingCosts
  );
};

/**
 * Get validation requirements for property type
 *
 * @param propertyType - Property type
 * @returns Array of required fields
 */
export const getRequiredFieldsForType = (
  propertyType: "new" | "current"
): string[] => {
  if (propertyType === "new") {
    return [
      "purchasePrice",
      "weeklyRent",
      "loanAmount",
      "interestRate",
      "loanTerm",
    ];
  } else {
    return ["currentPropertyValue", "weeklyRent"];
  }
};

/**
 * Get optional fields for property type
 *
 * @param propertyType - Property type
 * @returns Array of optional fields
 */
export const getOptionalFieldsForType = (
  propertyType: "new" | "current"
): string[] => {
  if (propertyType === "new") {
    return ["equityLoanAmount", "depositAmount", "useEquityFunding"];
  } else {
    return [
      "originalPurchasePrice",
      "originalPurchaseDate",
      "originalStampDuty",
      "originalLegalFees",
      "originalInspectionFees",
      "currentLoanBalance",
      "currentEquityLoanBalance",
    ];
  }
};
