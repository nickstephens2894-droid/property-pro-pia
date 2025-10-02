import { supabase } from "@/integrations/supabase/client";
import { FundingMethod } from "@/types/presets";
import { PropertyData } from "@/types/property";

export interface FundingStrategyResult {
  success: boolean;
  createdFunds: Array<{
    id: string;
    name: string;
    type: "loan" | "cash";
    amount: number;
  }>;
  error?: string;
}

/**
 * Creates funds automatically based on the selected funding strategy
 * This implements the client's requirement: 2 or 3 funds based on strategy
 */
export const createFundsForStrategy = async (
  strategy: FundingMethod,
  instanceId: string,
  propertyData: PropertyData,
  userId: string
): Promise<FundingStrategyResult> => {
  try {
    const createdFunds: Array<{
      id: string;
      name: string;
      type: "loan" | "cash";
      amount: number;
    }> = [];

    // Calculate property value
    const propertyValue = propertyData.isConstructionProject
      ? propertyData.landValue + propertyData.constructionValue
      : propertyData.purchasePrice;

    const totalCosts = propertyValue * 1.06; // Approximate total costs with transaction fees
    const mainLoanAmount = propertyValue * 0.8; // 80% LVR
    const depositAmount = totalCosts - mainLoanAmount;

    switch (strategy) {
      case "loan-cash":
        // Strategy: 80% Loan + Cash (2 funds)
        console.log("Creating funds for loan-cash strategy");

        // 1. Create Main Loan Fund
        const mainLoanFund = await createLoanFund({
          name: `Main Loan - ${propertyData.name || "Property"}`,
          fund_category: "Debt",
          loanBalance: mainLoanAmount,
          interestRate: propertyData.interestRate || 6.8,
          loanTerm: propertyData.loanTerm || 30,
          loanType: propertyData.mainLoanType === "io" ? "IO" : "P&I",
          ioTerm: propertyData.ioTermYears || 5,
          loanPurpose: "Investment Mortgage",
          fundsType: "Savings",
          fundAmount: mainLoanAmount,
          fundReturn: 0,
          owner_user_id: userId,
        });

        if (mainLoanFund) {
          createdFunds.push({
            id: mainLoanFund.id,
            name: mainLoanFund.name,
            type: "loan",
            amount: mainLoanAmount,
          });
        }

        // 2. Create Cash Fund for deposit
        const cashFund = await createCashFund({
          name: `Cash Deposit - ${propertyData.name || "Property"}`,
          fund_category: "Cash",
          fund_type: "Savings",
          total_amount: depositAmount,
          return_rate: 0,
          owner_user_id: userId,
        });

        if (cashFund) {
          createdFunds.push({
            id: cashFund.id,
            name: cashFund.name,
            type: "cash",
            amount: depositAmount,
          });
        }

        break;

      case "loan-equity":
        // Strategy: 80% Loan + Equity (2 funds)
        console.log("Creating funds for loan-equity strategy");

        // 1. Create Main Loan Fund
        const mainLoanFund2 = await createLoanFund({
          name: `Main Loan - ${propertyData.name || "Property"}`,
          fund_category: "Debt",
          loanBalance: mainLoanAmount,
          interestRate: propertyData.interestRate || 6.8,
          loanTerm: propertyData.loanTerm || 30,
          loanType: propertyData.mainLoanType === "io" ? "IO" : "P&I",
          ioTerm: propertyData.ioTermYears || 5,
          loanPurpose: "Investment Mortgage",
          fundsType: "Savings",
          fundAmount: mainLoanAmount,
          fundReturn: 0,
          owner_user_id: userId,
        });

        if (mainLoanFund2) {
          createdFunds.push({
            id: mainLoanFund2.id,
            name: mainLoanFund2.name,
            type: "loan",
            amount: mainLoanAmount,
          });
        }

        // 2. Create Equity Loan Fund
        const equityLoanAmount = propertyData.equityLoanAmount || depositAmount;
        const equityLoanFund = await createLoanFund({
          name: `Equity Loan - ${propertyData.name || "Property"}`,
          fund_category: "Debt",
          loanBalance: equityLoanAmount,
          interestRate: propertyData.equityLoanInterestRate || 7.2,
          loanTerm: propertyData.equityLoanTerm || 30,
          loanType: propertyData.equityLoanType === "io" ? "IO" : "P&I",
          ioTerm: propertyData.equityLoanIoTermYears || 5,
          loanPurpose: "Equity Release",
          fundsType: "Equity",
          fundAmount: equityLoanAmount,
          fundReturn: 0,
          owner_user_id: userId,
        });

        if (equityLoanFund) {
          createdFunds.push({
            id: equityLoanFund.id,
            name: equityLoanFund.name,
            type: "loan",
            amount: equityLoanAmount,
          });
        }

        break;

      case "full-equity":
        // Strategy: Full Equity (1 fund - but we'll create 2 for consistency)
        console.log("Creating funds for full-equity strategy");

        // 1. Create Equity Loan Fund (covers full amount)
        const fullEquityAmount = totalCosts;
        const fullEquityLoanFund = await createLoanFund({
          name: `Full Equity Loan - ${propertyData.name || "Property"}`,
          fund_category: "Debt",
          loanBalance: fullEquityAmount,
          interestRate: propertyData.equityLoanInterestRate || 7.2,
          loanTerm: propertyData.equityLoanTerm || 30,
          loanType: propertyData.equityLoanType === "io" ? "IO" : "P&I",
          ioTerm: propertyData.equityLoanIoTermYears || 5,
          loanPurpose: "Equity Release",
          fundsType: "Equity",
          fundAmount: fullEquityAmount,
          fundReturn: 0,
          owner_user_id: userId,
        });

        if (fullEquityLoanFund) {
          createdFunds.push({
            id: fullEquityLoanFund.id,
            name: fullEquityLoanFund.name,
            type: "loan",
            amount: fullEquityAmount,
          });
        }

        // 2. Create a small cash fund for any remaining costs
        const remainingCash = Math.max(0, totalCosts - fullEquityAmount);
        if (remainingCash > 0) {
          const remainingCashFund = await createCashFund({
            name: `Remaining Cash - ${propertyData.name || "Property"}`,
            fund_category: "Cash",
            fund_type: "Savings",
            total_amount: remainingCash,
            return_rate: 0,
            owner_user_id: userId,
          });

          if (remainingCashFund) {
            createdFunds.push({
              id: remainingCashFund.id,
              name: remainingCashFund.name,
              type: "cash",
              amount: remainingCash,
            });
          }
        }

        break;

      default:
        throw new Error(`Unknown funding strategy: ${strategy}`);
    }

    // Allocate the created funds to the instance
    for (const fund of createdFunds) {
      await allocateFundToInstance(instanceId, fund.id, fund.type, fund.amount);
    }

    return {
      success: true,
      createdFunds,
    };
  } catch (error) {
    console.error("Error creating funds for strategy:", error);
    return {
      success: false,
      createdFunds: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Helper function to create a loan fund
 */
const createLoanFund = async (fundData: any) => {
  // Map camelCase to snake_case for database
  const mappedData = {
    name: fundData.name,
    fund_category: fundData.fund_category,
    loan_balance: fundData.loanBalance,
    interest_rate: fundData.interestRate,
    loan_term: fundData.loanTerm,
    loan_type: fundData.loanType,
    io_term: fundData.ioTerm,
    loan_purpose: fundData.loanPurpose,
    funds_type: fundData.fundsType,
    fund_amount: fundData.fundAmount,
    fund_return: fundData.fundReturn,
    owner_user_id: fundData.owner_user_id,
  };

  const { data, error } = await supabase
    .from("loan_funds")
    .insert(mappedData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Helper function to create a cash fund
 */
const createCashFund = async (fundData: any) => {
  // Map to correct database fields
  const mappedData = {
    name: fundData.name,
    fund_type: fundData.fund_type,
    total_amount: fundData.total_amount,
    available_amount: fundData.total_amount, // Initially all amount is available
    return_rate: fundData.return_rate,
    owner_user_id: fundData.owner_user_id,
  };

  const { data, error } = await supabase
    .from("cash_funds")
    .insert(mappedData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Helper function to allocate a fund to an instance
 */
const allocateFundToInstance = async (
  instanceId: string,
  fundId: string,
  fundType: "loan" | "cash",
  amount: number
) => {
  const { data, error } = await supabase
    .from("instance_fundings")
    .insert({
      instance_id: instanceId,
      fund_id: fundId,
      fund_type: fundType,
      amount_allocated: amount,
      notes: "Auto-created from funding strategy",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
