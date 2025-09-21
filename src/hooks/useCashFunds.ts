import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  CashFund,
  CreateCashFundRequest,
  UpdateCashFundRequest,
} from "@/types/funding";

export function useCashFunds() {
  const { user } = useAuth();
  const [cashFunds, setCashFunds] = useState<CashFund[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCashFunds = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("cash_funds")
        .select("*")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Calculate available amounts dynamically for each fund
      const mappedCashFunds = await Promise.all(
        (data || []).map(async (fund) => {
          // Get usage summary for this fund
          const { data: usageData, error: usageError } = await supabase.rpc(
            "get_fund_usage_summary",
            {
              p_fund_id: fund.id,
              p_fund_type: "cash",
            }
          );

          const usage = usageData?.[0] || {
            total_allocated: 0,
            total_used: 0,
            available_amount: Number(fund.total_amount) || 0,
            usage_percentage: 0,
          };

          return {
            id: fund.id,
            name: fund.name,
            fund_category: (fund.fund_category as "Cash" | "Debt") || "Cash",
            fund_type: fund.fund_type || "Savings",
            total_amount: Number(fund.total_amount) || 0,
            available_amount: Number(usage.available_amount) || 0,
            return_rate: Number(fund.return_rate) || 0,
            created_at: fund.created_at,
            updated_at: fund.updated_at,
          };
        })
      );

      setCashFunds(mappedCashFunds);
    } catch (error) {
      console.error("Error loading cash funds:", error);
      toast.error("Failed to load cash funds");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createCashFund = useCallback(
    async (fundData: CreateCashFundRequest) => {
      if (!user) return null;

      try {
        const { data, error } = await supabase
          .from("cash_funds")
          .insert({
            name: fundData.name,
            fund_category: fundData.fund_category,
            fund_type: fundData.fund_type,
            total_amount: fundData.total_amount,
            available_amount: fundData.total_amount, // Initially all is available
            return_rate: fundData.return_rate,
            owner_user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        toast.success("Cash fund created successfully");
        await loadCashFunds();
        return data;
      } catch (error) {
        console.error("Error creating cash fund:", error);
        toast.error("Failed to create cash fund");
        return null;
      }
    },
    [user, loadCashFunds]
  );

  const updateCashFund = useCallback(
    async (id: string, updates: UpdateCashFundRequest) => {
      if (!user) return false;

      try {
        const dbUpdates: any = {};

        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.fund_category !== undefined)
          dbUpdates.fund_category = updates.fund_category;
        if (updates.fund_type !== undefined)
          dbUpdates.fund_type = updates.fund_type;
        if (updates.total_amount !== undefined) {
          dbUpdates.total_amount = updates.total_amount;
          // Recalculate available amount when total changes
          const { data: usage } = await supabase
            .from("instance_fundings")
            .select("amount_allocated")
            .eq("fund_id", id)
            .eq("fund_type", "cash");

          const allocated =
            usage?.reduce(
              (sum, row) => sum + Number(row.amount_allocated),
              0
            ) || 0;
          dbUpdates.available_amount = updates.total_amount - allocated;
        }
        if (updates.return_rate !== undefined)
          dbUpdates.return_rate = updates.return_rate;

        const { error } = await supabase
          .from("cash_funds")
          .update(dbUpdates)
          .eq("id", id)
          .eq("owner_user_id", user.id);

        if (error) throw error;
        toast.success("Cash fund updated successfully");
        await loadCashFunds();
        return true;
      } catch (error) {
        console.error("Error updating cash fund:", error);
        toast.error("Failed to update cash fund");
        return false;
      }
    },
    [user, loadCashFunds]
  );

  const deleteCashFund = useCallback(
    async (id: string) => {
      if (!user) return false;

      try {
        // Check if fund is being used by any instances
        const { data: usage, error: usageError } = await supabase
          .from("instance_fundings")
          .select("id")
          .eq("fund_id", id)
          .eq("fund_type", "cash")
          .limit(1);

        if (usageError) throw usageError;

        if (usage && usage.length > 0) {
          toast.error("Cannot delete fund that is allocated to instances");
          return false;
        }

        const { error } = await supabase
          .from("cash_funds")
          .delete()
          .eq("id", id)
          .eq("owner_user_id", user.id);

        if (error) throw error;
        toast.success("Cash fund deleted successfully");
        await loadCashFunds();
        return true;
      } catch (error) {
        console.error("Error deleting cash fund:", error);
        toast.error("Failed to delete cash fund");
        return false;
      }
    },
    [user, loadCashFunds]
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
          p_fund_type: "cash",
          p_amount: amount,
        });

        if (error) throw error;

        return {
          isAvailable: data,
          availableAmount: 0, // Will be calculated separately
          requestedAmount: amount,
        };
      } catch (error) {
        console.error("Error checking fund availability:", error);
        return {
          isAvailable: false,
          availableAmount: 0,
          requestedAmount: amount,
        };
      }
    },
    [user]
  );

  useEffect(() => {
    if (user) {
      loadCashFunds();
    }
  }, [user, loadCashFunds]);

  return {
    cashFunds,
    loading,
    loadCashFunds,
    createCashFund,
    updateCashFund,
    deleteCashFund,
    getFundAvailability,
  };
}
