import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  InstanceFunding,
  CreateInstanceFundingRequest,
  UpdateInstanceFundingRequest,
  FundAvailabilityCheck,
} from "@/types/funding";

export function useInstanceFundings(
  instanceId?: string,
  onFundingChange?: () => void
) {
  const { user } = useAuth();
  const [instanceFundings, setInstanceFundings] = useState<InstanceFunding[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  const loadInstanceFundings = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // First, get the user's instances with names
      const { data: userInstances, error: instancesError } = await supabase
        .from("instances")
        .select("id, name")
        .eq("user_id", user.id);

      if (instancesError) throw instancesError;

      if (!userInstances || userInstances.length === 0) {
        setInstanceFundings([]);
        return;
      }

      const instanceIds = userInstances.map((instance) => instance.id);

      // Create instance names lookup map
      const instancesMap = new Map(
        userInstances.map((instance) => [instance.id, instance.name])
      );

      // Get instance fundings for user's instances
      const { data: fundings, error: fundingsError } = await supabase
        .from("instance_fundings")
        .select("*")
        .in("instance_id", instanceIds)
        .order("allocation_date", { ascending: false });

      if (fundingsError) throw fundingsError;

      if (!fundings || fundings.length === 0) {
        setInstanceFundings([]);
        return;
      }

      // Get loan funds and cash funds separately
      const loanFundIds = fundings
        .filter((f) => f.fund_type === "loan")
        .map((f) => f.fund_id);
      const cashFundIds = fundings
        .filter((f) => f.fund_type === "cash")
        .map((f) => f.fund_id);

      const [loanFundsResult, cashFundsResult] = await Promise.all([
        loanFundIds.length > 0
          ? supabase
              .from("loan_funds")
              .select("id, name, fund_amount")
              .in("id", loanFundIds)
          : Promise.resolve({ data: [], error: null }),
        cashFundIds.length > 0
          ? supabase
              .from("cash_funds")
              .select("id, name, total_amount")
              .in("id", cashFundIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (loanFundsResult.error) throw loanFundsResult.error;
      if (cashFundsResult.error) throw cashFundsResult.error;

      // Create lookup maps
      const loanFundsMap = new Map(
        loanFundsResult.data?.map((fund) => [fund.id, fund]) || []
      );
      const cashFundsMap = new Map(
        cashFundsResult.data?.map((fund) => [fund.id, fund]) || []
      );

      const data = fundings;

      // Map database fields to frontend interface
      const mappedFundings = (data || []).map((funding) => {
        let fundName = "Unknown Fund";
        let fundTotalAmount = 0;

        if (funding.fund_type === "loan") {
          const loanFund = loanFundsMap.get(funding.fund_id);
          if (loanFund) {
            fundName = loanFund.name;
            fundTotalAmount = Number(loanFund.fund_amount);
          }
        } else if (funding.fund_type === "cash") {
          const cashFund = cashFundsMap.get(funding.fund_id);
          if (cashFund) {
            fundName = cashFund.name;
            fundTotalAmount = Number(cashFund.total_amount);
          }
        }

        return {
          id: funding.id,
          instance_id: funding.instance_id,
          fund_id: funding.fund_id,
          fund_type: funding.fund_type as "loan" | "cash",
          amount_allocated: Number(funding.amount_allocated) || 0,
          amount_used: Number(funding.amount_used) || 0,
          allocation_date: funding.allocation_date,
          notes: funding.notes,
          created_at: funding.created_at,
          updated_at: funding.updated_at,
          fund_name: fundName,
          fund_total_amount: fundTotalAmount,
          fund_available_amount:
            fundTotalAmount - Number(funding.amount_allocated) || 0,
          instance_name:
            instancesMap.get(funding.instance_id) || "Unknown Instance",
        };
      });

      setInstanceFundings(mappedFundings);
    } catch (error) {
      console.error("Error loading instance fundings:", error);
      toast.error("Failed to load instance fundings");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addInstanceFunding = useCallback(
    async (fundingData: CreateInstanceFundingRequest) => {
      if (!user) return null;

      try {
        // Check fund availability first
        const availability = await checkFundAvailability(
          fundingData.fund_id,
          fundingData.fund_type,
          fundingData.amount_allocated
        );

        if (!availability.isAvailable) {
          toast.error(availability.message || "Insufficient fund availability");
          return null;
        }

        const { data, error } = await supabase
          .from("instance_fundings")
          .insert({
            instance_id: fundingData.instance_id,
            fund_id: fundingData.fund_id,
            fund_type: fundingData.fund_type,
            amount_allocated: fundingData.amount_allocated,
            notes: fundingData.notes,
          })
          .select("*")
          .single();

        if (error) throw error;

        // Update the fund's available amount in the database
        if (data.fund_type === "loan") {
          await supabase.rpc("update_loan_fund_available_amount", {
            fund_id: data.fund_id,
          });
        } else if (data.fund_type === "cash") {
          await supabase.rpc("update_cash_fund_available_amount", {
            fund_id: data.fund_id,
          });
        }

        // Get fund details separately
        let fundName = "Unknown Fund";
        let fundTotalAmount = 0;

        if (data.fund_type === "loan") {
          const { data: loanFund } = await supabase
            .from("loan_funds")
            .select("name, fund_amount")
            .eq("id", data.fund_id)
            .single();
          if (loanFund) {
            fundName = loanFund.name;
            fundTotalAmount = Number(loanFund.fund_amount);
          }
        } else if (data.fund_type === "cash") {
          const { data: cashFund } = await supabase
            .from("cash_funds")
            .select("name, total_amount")
            .eq("id", data.fund_id)
            .single();
          if (cashFund) {
            fundName = cashFund.name;
            fundTotalAmount = Number(cashFund.total_amount);
          }
        }

        const newFunding: InstanceFunding = {
          id: data.id,
          instance_id: data.instance_id,
          fund_id: data.fund_id,
          fund_type: data.fund_type as "loan" | "cash",
          amount_allocated: Number(data.amount_allocated) || 0,
          amount_used: Number(data.amount_used) || 0,
          allocation_date: data.allocation_date,
          notes: data.notes,
          created_at: data.created_at,
          updated_at: data.updated_at,
          fund_name: fundName,
          fund_total_amount: fundTotalAmount,
          fund_available_amount:
            fundTotalAmount - Number(data.amount_allocated) || 0,
        };

        setInstanceFundings((prev) => [newFunding, ...prev]);

        // Refresh funds if callback provided
        if (onFundingChange) {
          onFundingChange();
        }

        toast.success("Funding added successfully");
        return newFunding;
      } catch (error) {
        console.error("Error adding instance funding:", error);
        toast.error("Failed to add funding");
        return null;
      }
    },
    [user]
  );

  const updateInstanceFunding = useCallback(
    async (id: string, updates: UpdateInstanceFundingRequest) => {
      if (!user) return false;

      try {
        // Get the current funding to know which fund to update
        const currentFunding = instanceFundings.find((f) => f.id === id);
        if (!currentFunding) {
          toast.error("Funding not found");
          return false;
        }

        const { error } = await supabase
          .from("instance_fundings")
          .update(updates)
          .eq("id", id);

        if (error) throw error;

        // Update the fund's available amount in the database
        if (currentFunding.fund_type === "loan") {
          await supabase.rpc("update_loan_fund_available_amount", {
            fund_id: currentFunding.fund_id,
          });
        } else if (currentFunding.fund_type === "cash") {
          await supabase.rpc("update_cash_fund_available_amount", {
            fund_id: currentFunding.fund_id,
          });
        }

        setInstanceFundings((prev) =>
          prev.map((funding) =>
            funding.id === id
              ? { ...funding, ...updates, updated_at: new Date().toISOString() }
              : funding
          )
        );

        // Refresh funds if callback provided
        if (onFundingChange) {
          onFundingChange();
        }

        toast.success("Funding updated successfully");
        return true;
      } catch (error) {
        console.error("Error updating instance funding:", error);
        toast.error("Failed to update funding");
        return false;
      }
    },
    [user, instanceFundings, onFundingChange]
  );

  const removeInstanceFunding = useCallback(
    async (id: string) => {
      if (!user) return false;

      try {
        // Get the current funding to know which fund to update
        const currentFunding = instanceFundings.find((f) => f.id === id);
        if (!currentFunding) {
          toast.error("Funding not found");
          return false;
        }

        const { error } = await supabase
          .from("instance_fundings")
          .delete()
          .eq("id", id);

        if (error) throw error;

        // Update the fund's available amount in the database
        if (currentFunding.fund_type === "loan") {
          await supabase.rpc("update_loan_fund_available_amount", {
            fund_id: currentFunding.fund_id,
          });
        } else if (currentFunding.fund_type === "cash") {
          await supabase.rpc("update_cash_fund_available_amount", {
            fund_id: currentFunding.fund_id,
          });
        }

        setInstanceFundings((prev) =>
          prev.filter((funding) => funding.id !== id)
        );

        // Refresh funds if callback provided
        if (onFundingChange) {
          onFundingChange();
        }

        toast.success("Funding removed successfully");
        return true;
      } catch (error) {
        console.error("Error removing instance funding:", error);
        toast.error("Failed to remove funding");
        return false;
      }
    },
    [user, instanceFundings, onFundingChange]
  );

  const checkFundAvailability = useCallback(
    async (
      fundId: string,
      fundType: "loan" | "cash",
      amount: number
    ): Promise<FundAvailabilityCheck> => {
      if (!user) {
        return {
          isAvailable: false,
          availableAmount: 0,
          requestedAmount: amount,
        };
      }

      try {
        const { data, error } = await supabase.rpc("check_fund_availability", {
          p_fund_id: fundId,
          p_fund_type: fundType,
          p_amount: amount,
        });

        if (error) throw error;

        // Get available amount for better UX
        const { data: usageData } = await supabase.rpc(
          "get_fund_usage_summary",
          {
            p_fund_id: fundId,
            p_fund_type: fundType,
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

  const getFundingSummary = useCallback(() => {
    const totalAllocated = instanceFundings.reduce(
      (sum, funding) => sum + funding.amount_allocated,
      0
    );
    const totalUsed = instanceFundings.reduce(
      (sum, funding) => sum + funding.amount_used,
      0
    );

    return {
      totalAllocated,
      totalUsed,
      fundings: instanceFundings,
    };
  }, [instanceFundings]);

  // Real-time subscription for funding updates
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel("instance-funding-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "instance_fundings",
        },
        (payload) => {
          console.log("Funding update received:", payload);
          // Reload fundings when changes occur
          loadInstanceFundings();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, loadInstanceFundings]);

  useEffect(() => {
    if (user) {
      loadInstanceFundings();
    }
  }, [user, loadInstanceFundings]);

  return {
    instanceFundings,
    loading,
    loadInstanceFundings,
    addInstanceFunding,
    updateInstanceFunding,
    removeInstanceFunding,
    checkFundAvailability,
    getFundingSummary,
  };
}
