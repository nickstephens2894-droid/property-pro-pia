import { PropertyData } from "@/contexts/PropertyDataContext";
import {
  validatePersonalProfile,
  validatePropertyBasics,
  validateFinancing,
  validatePurchaseCosts,
  validateAnnualExpenses,
  validateConstruction,
  validateTaxOptimization,
  type CompletionStatus,
} from "@/utils/validationUtils";

export type SectionKey =
  | "personal-profile"
  | "property-basics"
  | "construction"
  | "construction-timeline"
  | "funding-finance"
  | "transaction-costs"
  | "ongoing-income-expenses"
  | "tax-optimization";

export const getSectionGuidance = (
  propertyData: PropertyData,
  section: SectionKey
): { title: string; items: string[]; status: CompletionStatus } => {
  let items: string[] = [];
  let status: CompletionStatus = "complete";

  switch (section) {
    case "personal-profile": {
      status = validatePersonalProfile(propertyData);
      propertyData.investors.forEach((c, idx) => {
        if (!c.name || c.name.trim() === "") {
          items.push(`Enter name for investor ${idx + 1}`);
        }
        if (!c.annualIncome || c.annualIncome <= 0) {
          items.push(`Enter annual income for ${c.name?.trim() || `investor ${idx + 1}`}`);
        }
      });
      break;
    }
    case "property-basics": {
      status = validatePropertyBasics(propertyData);
      if (propertyData.isConstructionProject) {
        if (!propertyData.landValue || propertyData.landValue <= 0) items.push("Enter land value");
        if (!propertyData.constructionValue || propertyData.constructionValue <= 0)
          items.push("Enter construction contract value");
        if (!propertyData.constructionPeriod || propertyData.constructionPeriod <= 0)
          items.push("Set construction period (months)");
        if (!propertyData.weeklyRent || propertyData.weeklyRent <= 0)
          items.push("Enter expected weekly rent");
      } else {
        if (!propertyData.purchasePrice || propertyData.purchasePrice <= 0)
          items.push("Enter purchase price");
        if (!propertyData.buildingValue || propertyData.buildingValue <= 0)
          items.push("Enter building value");
        if (!propertyData.weeklyRent || propertyData.weeklyRent <= 0)
          items.push("Enter expected weekly rent");
      }
      break;
    }
    case "construction": {
      status = validateConstruction(propertyData);
      if (!propertyData.constructionValue || propertyData.constructionValue <= 0)
        items.push("Enter total construction contract value");
      if (!propertyData.buildingValue || propertyData.buildingValue <= 0)
        items.push("Enter building value for depreciation");
      if (!propertyData.constructionYear || propertyData.constructionYear <= 0)
        items.push("Enter construction completion year");
      break;
    }
    case "construction-timeline": {
      status = validateConstruction(propertyData);
      if (!propertyData.constructionPeriod || propertyData.constructionPeriod <= 0)
        items.push("Set construction period (months)");
      if (!propertyData.constructionInterestRate || propertyData.constructionInterestRate <= 0)
        items.push("Enter construction interest rate");
      if (!propertyData.constructionProgressPayments || propertyData.constructionProgressPayments.length === 0)
        items.push("Add construction progress payments");
      else {
        const totalPercentage = propertyData.constructionProgressPayments.reduce((sum, p) => sum + p.percentage, 0);
        if (Math.abs(totalPercentage - 100) > 0.1)
          items.push("Progress payments should total 100%");
      }
      break;
    }
    case "funding-finance": {
      status = validateFinancing(propertyData);
      if (propertyData.loanAmount > 0) {
        if (!propertyData.interestRate || propertyData.interestRate <= 0)
          items.push("Enter loan interest rate");
        if (!propertyData.loanTerm || propertyData.loanTerm <= 0) items.push("Enter loan term (years)");
      }

      const totalCost = propertyData.isConstructionProject
        ? propertyData.landValue +
          propertyData.constructionValue +
          propertyData.stampDuty +
          propertyData.legalFees +
          propertyData.inspectionFees +
          propertyData.councilFees +
          propertyData.architectFees +
          propertyData.siteCosts
        : propertyData.purchasePrice + propertyData.stampDuty + propertyData.legalFees + propertyData.inspectionFees;

      const availableEquity = propertyData.useEquityFunding
        ? Math.max(0, propertyData.primaryPropertyValue * (propertyData.maxLVR / 100) - propertyData.existingDebt)
        : 0;

      const equityLoanAmount = propertyData.useEquityFunding
        ? Math.min(
            availableEquity,
            Math.max(0, totalCost - propertyData.loanAmount - (propertyData.depositAmount || 0))
          )
        : 0;

      const totalFunding = (propertyData.loanAmount || 0) + equityLoanAmount + (propertyData.depositAmount || 0);
      const fundingShortfall = Math.max(0, totalCost - totalFunding);
      if (totalCost > 0 && fundingShortfall > totalCost * 0.1) {
        items.push(
          `Funding shortfall ~ ${Math.round(fundingShortfall).toLocaleString("en-AU", { maximumFractionDigits: 0 })}. Increase loan/equity or reduce costs.`
        );
      }
      break;
    }
    case "transaction-costs": {
      status = validatePurchaseCosts(propertyData);
      if (!propertyData.stampDuty || propertyData.stampDuty <= 0)
        items.push("Enter stamp duty (or use calculator)");
      if (!propertyData.legalFees || propertyData.legalFees <= 0) items.push("Enter legal fees");
      if (!propertyData.inspectionFees || propertyData.inspectionFees < 300) 
        items.push("Enter realistic inspection fees (typically $300-$800)");
      if (
        propertyData.isConstructionProject &&
        !propertyData.councilFees &&
        !propertyData.architectFees &&
        !propertyData.siteCosts
      ) {
        items.push("Add development costs: council fees, architect/design, or site costs");
      }
      break;
    }
    case "ongoing-income-expenses": {
      status = validateAnnualExpenses(propertyData);
      if (!propertyData.propertyManagement || propertyData.propertyManagement <= 0)
        items.push("Enter property management fee");
      if (!propertyData.councilRates || propertyData.councilRates <= 0) items.push("Enter council rates");
      if (!propertyData.insurance || propertyData.insurance <= 0) items.push("Enter insurance premium");
      break;
    }
    case "tax-optimization": {
      status = validateTaxOptimization(propertyData);
      const totalOwnership = propertyData.ownershipAllocations.reduce((sum, a) => sum + a.ownershipPercentage, 0);
      if (Math.abs(totalOwnership - 100) > 0.1) {
        items.push(`Ownership allocations must total 100% (currently ${totalOwnership.toFixed(1)}%).`);
      }
      break;
    }
  }

  const title =
    status === "complete"
      ? "All key fields complete"
      : status === "warning"
      ? "Recommended fields to complete"
      : "Action required";

  return { title, items, status };
}; 