import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { LoanFundWithUsage, FundUsageSummary } from "@/types/funding";

export interface LoanFund {
  id: string;
  name: string;
  fund_category: "Cash" | "Debt";

  // Financing
  loanBalance: number;
  interestRate: number;
  loanTerm: number;
  loanType: string;
  ioTerm: number;
  loanPurpose: string;
  fundsType: string;
  fundAmount: number;
  fundReturn: number;

  created_at: string;
  updated_at: string;
}

export interface CreateLoanFundData {
  name: string;
  fund_category: "Cash" | "Debt";
  loanBalance: number;
  interestRate: number;
  loanTerm: number;
  loanType: string;
  ioTerm: number;
  loanPurpose: string;
  fundsType: string;
  fundAmount: number;
  fundReturn: number;
}

export function useLoanFunds() {
  const { user } = useAuth();
  const [loanFunds, setLoanFunds] = useState<LoanFund[]>([]);
  const [loanFundsWithUsage, setLoanFundsWithUsage] = useState<
    LoanFundWithUsage[]
  >([]);
  const [loading, setLoading] = useState(false);

  const loadLoanFunds = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("loan_funds")
        .select("*")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map database fields to frontend interface
      const mappedLoanFunds = (data || []).map((fund) => ({
        id: fund.id,
        name: fund.name,
        fund_category: (fund.fund_category as "Cash" | "Debt") || "Debt",
        loanBalance: Number(fund.loan_balance) || 0,
        interestRate: Number(fund.interest_rate) || 0,
        loanTerm: Number(fund.loan_term) || 30,
        loanType: fund.loan_type || "IO,P&I",
        ioTerm: Number(fund.io_term) || 5,
        loanPurpose: fund.loan_purpose || "Investment",
        fundsType: fund.funds_type || "Savings",
        fundAmount: Number(fund.fund_amount) || 0,
        fundReturn: Number(fund.fund_return) || 0,
        created_at: fund.created_at,
        updated_at: fund.updated_at,
      }));

      setLoanFunds(mappedLoanFunds);

      // Load usage data for each fund
      await loadLoanFundsWithUsage(mappedLoanFunds);
    } catch (error) {
      console.error("Error loading loan funds:", error);
      toast.error("Failed to load loan funds");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadLoanFundsWithUsage = useCallback(
    async (funds: LoanFund[]) => {
      if (!user || funds.length === 0) return;

      try {
        const fundsWithUsage: LoanFundWithUsage[] = [];

        for (const fund of funds) {
          // Get usage summary for this fund
          const { data: usageData, error: usageError } = await supabase.rpc(
            "get_fund_usage_summary",
            {
              p_fund_id: fund.id,
              p_fund_type: "loan",
            }
          );

          if (usageError) {
            console.error("Error loading usage for fund:", fund.id, usageError);
            continue;
          }

          const usage = usageData?.[0] || {
            total_allocated: 0,
            total_used: 0,
            available_amount: fund.fundAmount,
            usage_percentage: 0,
          };

          fundsWithUsage.push({
            ...fund,
            available_amount: Number(usage.available_amount) || 0,
            used_amount: Number(usage.total_used) || 0,
            usage_percentage: Number(usage.usage_percentage) || 0,
          });
        }

        setLoanFundsWithUsage(fundsWithUsage);
      } catch (error) {
        console.error("Error loading loan funds usage:", error);
      }
    },
    [user]
  );

  const createLoanFund = useCallback(
    async (fundData: CreateLoanFundData) => {
      if (!user) return null;

      try {
        const { data, error } = await supabase
          .from("loan_funds")
          .insert({
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
            owner_user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        toast.success("Loan fund created successfully");
        await loadLoanFunds();
        return data;
      } catch (error) {
        console.error("Error creating loan fund:", error);
        toast.error("Failed to create loan fund");
        return null;
      }
    },
    [user, loadLoanFunds]
  );

  const updateLoanFund = useCallback(
    async (id: string, updates: Partial<CreateLoanFundData>) => {
      if (!user) return false;

      try {
        const dbUpdates: any = {};

        // Map frontend field names to database column names
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.fund_category !== undefined)
          dbUpdates.fund_category = updates.fund_category;
        if (updates.loanBalance !== undefined)
          dbUpdates.loan_balance = updates.loanBalance;
        if (updates.interestRate !== undefined)
          dbUpdates.interest_rate = updates.interestRate;
        if (updates.loanTerm !== undefined)
          dbUpdates.loan_term = updates.loanTerm;
        if (updates.loanType !== undefined)
          dbUpdates.loan_type = updates.loanType;
        if (updates.ioTerm !== undefined) dbUpdates.io_term = updates.ioTerm;
        if (updates.loanPurpose !== undefined)
          dbUpdates.loan_purpose = updates.loanPurpose;
        if (updates.fundsType !== undefined)
          dbUpdates.funds_type = updates.fundsType;
        if (updates.fundAmount !== undefined)
          dbUpdates.fund_amount = updates.fundAmount;
        if (updates.fundReturn !== undefined)
          dbUpdates.fund_return = updates.fundReturn;

        const { error } = await supabase
          .from("loan_funds")
          .update(dbUpdates)
          .eq("id", id)
          .eq("owner_user_id", user.id);

        if (error) throw error;
        toast.success("Loan fund updated successfully");
        await loadLoanFunds();
        return true;
      } catch (error) {
        console.error("Error updating loan fund:", error);
        toast.error("Failed to update loan fund");
        return false;
      }
    },
    [user, loadLoanFunds]
  );

  const deleteLoanFund = useCallback(
    async (id: string) => {
      if (!user) return false;

      try {
        // Check if fund is being used by any instances
        const { data: usage, error: usageError } = await supabase
          .from("instance_fundings")
          .select("id")
          .eq("fund_id", id)
          .eq("fund_type", "loan")
          .limit(1);

        if (usageError) throw usageError;

        if (usage && usage.length > 0) {
          toast.error("Cannot delete fund that is allocated to instances");
          return false;
        }

        const { error } = await supabase
          .from("loan_funds")
          .delete()
          .eq("id", id)
          .eq("owner_user_id", user.id);

        if (error) throw error;
        toast.success("Loan fund deleted successfully");
        await loadLoanFunds();
        return true;
      } catch (error) {
        console.error("Error deleting loan fund:", error);
        toast.error("Failed to delete loan fund");
        return false;
      }
    },
    [user, loadLoanFunds]
  );

  const getFundAvailability = useCallback(
    async (fundId: string, amount: number) => {
      if (!user)
        return {
          isAvailable: false,
          availableAmount: 0,
          requestedAmount: amount,
        };

      try {
        const { data, error } = await supabase.rpc("check_fund_availability", {
          p_fund_id: fundId,
          p_fund_type: "loan",
          p_amount: amount,
        });

        if (error) throw error;

        // Get available amount for better UX
        const { data: usageData } = await supabase.rpc(
          "get_fund_usage_summary",
          {
            p_fund_id: fundId,
            p_fund_type: "loan",
          }
        );

        const availableAmount = usageData?.[0]?.available_amount || 0;

        return {
          isAvailable: data,
          availableAmount,
          requestedAmount: amount,
          message: data
            ? undefined
            : `Insufficient funds. Available: $${availableAmount.toLocaleString()}`,
        };
      } catch (error) {
        console.error("Error checking fund availability:", error);
        return {
          isAvailable: false,
          availableAmount: 0,
          requestedAmount: amount,
          message: "Error checking fund availability",
        };
      }
    },
    [user]
  );

  useEffect(() => {
    if (user) {
      loadLoanFunds();
    }
  }, [user, loadLoanFunds]);

  return {
    loanFunds,
    loanFundsWithUsage,
    loading,
    loadLoanFunds,
    createLoanFund,
    updateLoanFund,
    deleteLoanFund,
    getFundAvailability,
  };
}
