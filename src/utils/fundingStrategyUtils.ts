import { PropertyData } from "@/contexts/PropertyDataContext";
import { FundingMethod, getFundingMethodData } from "@/types/presets";

/**
 * Funding Strategy Utilities
 *
 * This module provides functions to handle funding strategy selection and application
 * for new property purchases, as requested by the client.
 */

export interface FundingStrategyResult {
  success: boolean;
  data?: Partial<PropertyData>;
  error?: string;
}

/**
 * Apply a funding strategy to property data
 * This function creates the appropriate funds/loans based on the selected strategy
 *
 * @param propertyData - Current property data
 * @param strategy - Selected funding strategy
 * @returns Updated property data with funding strategy applied
 */
export const applyFundingStrategy = (
  propertyData: PropertyData,
  strategy: FundingMethod
): FundingStrategyResult => {
  try {
    // Only apply funding strategies to new properties
    if (propertyData.propertyType !== "new") {
      return {
        success: false,
        error: "Funding strategies can only be applied to new properties",
      };
    }

    // Get the property value for calculations
    const propertyValue = propertyData.isConstructionProject
      ? propertyData.landValue + propertyData.constructionValue
      : propertyData.purchasePrice;

    if (propertyValue <= 0) {
      return {
        success: false,
        error:
          "Property value must be greater than 0 to apply funding strategy",
      };
    }

    // Get funding strategy data
    const fundingData = getFundingMethodData(strategy, propertyValue);

    // Apply the funding strategy data
    const updatedData: Partial<PropertyData> = {
      ...fundingData,
      selectedFundingStrategy: strategy,
      currentFundingMethod: strategy,
    };

    return {
      success: true,
      data: updatedData,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to apply funding strategy: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

/**
 * Get available funding strategies for a property
 *
 * @param propertyData - Current property data
 * @returns Array of available funding strategies
 */
export const getAvailableFundingStrategies = (
  propertyData: PropertyData
): FundingMethod[] => {
  // All strategies are available for new properties
  if (propertyData.propertyType === "new") {
    return ["loan-cash", "loan-equity", "full-equity"];
  }

  // Current properties don't use funding strategies
  return [];
};

/**
 * Validate if a funding strategy can be applied
 *
 * @param propertyData - Current property data
 * @param strategy - Funding strategy to validate
 * @returns Validation result
 */
export const validateFundingStrategy = (
  propertyData: PropertyData,
  strategy: FundingMethod
): { isValid: boolean; error?: string } => {
  // Only new properties can use funding strategies
  if (propertyData.propertyType !== "new") {
    return {
      isValid: false,
      error: "Funding strategies can only be applied to new properties",
    };
  }

  // Check if property value is set
  const propertyValue = propertyData.isConstructionProject
    ? propertyData.landValue + propertyData.constructionValue
    : propertyData.purchasePrice;

  if (propertyValue <= 0) {
    return {
      isValid: false,
      error: "Property value must be set before applying funding strategy",
    };
  }

  // Check if strategy is available
  const availableStrategies = getAvailableFundingStrategies(propertyData);
  if (!availableStrategies.includes(strategy)) {
    return {
      isValid: false,
      error: `Funding strategy '${strategy}' is not available for this property type`,
    };
  }

  return { isValid: true };
};

/**
 * Get funding strategy description
 *
 * @param strategy - Funding strategy
 * @returns Human-readable description
 */
export const getFundingStrategyDescription = (
  strategy: FundingMethod
): string => {
  const descriptions = {
    "loan-cash":
      "80% Loan + Cash Deposit - Traditional financing with cash deposit",
    "loan-equity":
      "80% Loan + Equity Release - Use existing property equity for deposit",
    "full-equity":
      "Full Equity Funding - Use only equity from existing properties",
  };

  return descriptions[strategy] || "Unknown funding strategy";
};

/**
 * Calculate funding requirements for a property
 *
 * @param propertyData - Current property data
 * @returns Funding requirements breakdown
 */
export const calculateFundingRequirements = (propertyData: PropertyData) => {
  const propertyValue = propertyData.isConstructionProject
    ? propertyData.landValue + propertyData.constructionValue
    : propertyData.purchasePrice;

  const purchaseCosts =
    propertyData.stampDuty +
    propertyData.legalFees +
    propertyData.inspectionFees;
  const constructionCosts =
    propertyData.councilFees +
    propertyData.architectFees +
    propertyData.siteCosts;
  const totalProjectCost =
    propertyValue +
    purchaseCosts +
    constructionCosts +
    propertyData.totalHoldingCosts;

  return {
    propertyValue,
    purchaseCosts,
    constructionCosts,
    totalProjectCost,
    availableEquity: propertyData.useEquityFunding
      ? Math.max(
          0,
          propertyData.primaryPropertyValue * (propertyData.maxLVR / 100) -
            propertyData.existingDebt
        )
      : 0,
  };
};
