import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  ScenarioInstanceFunding,
  CreateScenarioFundingRequest,
  UpdateScenarioFundingRequest,
  ScenarioFundingApplication,
} from "@/types/scenarios";

export function useScenarioFunding(scenarioInstanceId?: string) {
  const { user } = useAuth();
  const [scenarioFundings, setScenarioFundings] = useState<
    ScenarioInstanceFunding[]
  >([]);
  const [fundingApplications, setFundingApplications] = useState<
    ScenarioFundingApplication[]
  >([]);
  const [loading, setLoading] = useState(false);

  const loadScenarioFundings = useCallback(async () => {
    if (!user || !scenarioInstanceId) return;

    setLoading(true);
    try {
      // Get scenario fundings for this specific scenario instance
      const { data: fundings, error: fundingsError } = await supabase
        .from("scenario_instance_fundings")
        .select("*")
        .eq("scenario_instance_id", scenarioInstanceId)
        .order("allocation_date", { ascending: false });

      if (fundingsError) throw fundingsError;

      if (!fundings || fundings.length === 0) {
        setScenarioFundings([]);
        return;
      }

      // Get loan funds and cash funds separately
      const loanFundIds = fundings
        .filter((f) => f.fund_type === "loan")
        .map((f) => f.fund_id);
      const cashFundIds = fundings
        .filter((f) => f.fund_type === "cash")
        .map((f) => f.fund_id);

      // Fetch loan funds
      const { data: loanFunds, error: loanFundsError } =
        loanFundIds.length > 0
          ? await supabase
              .from("loan_funds")
              .select("id, name, fund_amount")
              .in("id", loanFundIds)
          : { data: [], error: null };

      if (loanFundsError) throw loanFundsError;

      // Fetch cash funds
      const { data: cashFunds, error: cashFundsError } =
        cashFundIds.length > 0
          ? await supabase
              .from("cash_funds")
              .select("id, name, total_amount")
              .in("id", cashFundIds)
          : { data: [], error: null };

      if (cashFundsError) throw cashFundsError;

      // Create fund lookup maps
      const loanFundsMap = new Map(
        (loanFunds || []).map((fund) => [fund.id, fund])
      );
      const cashFundsMap = new Map(
        (cashFunds || []).map((fund) => [fund.id, fund])
      );

      // Map database fields to frontend interface
      const mappedFundings = fundings.map((funding) => {
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
          scenario_instance_id: funding.scenario_instance_id,
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
        };
      });

      setScenarioFundings(mappedFundings);
    } catch (error) {
      console.error("Error loading scenario fundings:", error);
      toast.error("Failed to load scenario fundings");
    } finally {
      setLoading(false);
    }
  }, [user, scenarioInstanceId]);

  const loadFundingApplications = useCallback(async () => {
    if (!user || !scenarioInstanceId) return;

    try {
      const { data: applications, error } = await supabase
        .from("scenario_funding_applications")
        .select("*")
        .eq("scenario_instance_id", scenarioInstanceId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setFundingApplications(applications || []);
    } catch (error) {
      console.error("Error loading funding applications:", error);
    }
  }, [user, scenarioInstanceId]);

  const addScenarioFunding = useCallback(
    async (funding: CreateScenarioFundingRequest) => {
      if (!user) {
        toast.error("You must be logged in to add funding");
        return null;
      }

      try {
        const { data, error } = await supabase
          .from("scenario_instance_fundings")
          .insert({
            scenario_instance_id: funding.scenario_instance_id,
            fund_id: funding.fund_id,
            fund_type: funding.fund_type,
            amount_allocated: funding.amount_allocated,
            notes: funding.notes,
          })
          .select()
          .single();

        if (error) throw error;

        toast.success("Funding added to scenario");
        await loadScenarioFundings();
        return data;
      } catch (error) {
        console.error("Error adding scenario funding:", error);
        toast.error("Failed to add funding to scenario");
        return null;
      }
    },
    [user, loadScenarioFundings]
  );

  const updateScenarioFunding = useCallback(
    async (id: string, updates: UpdateScenarioFundingRequest) => {
      if (!user) {
        toast.error("You must be logged in to update funding");
        return false;
      }

      try {
        const { error } = await supabase
          .from("scenario_instance_fundings")
          .update(updates)
          .eq("id", id);

        if (error) throw error;

        toast.success("Scenario funding updated");
        await loadScenarioFundings();
        return true;
      } catch (error) {
        console.error("Error updating scenario funding:", error);
        toast.error("Failed to update scenario funding");
        return false;
      }
    },
    [user, loadScenarioFundings]
  );

  const removeScenarioFunding = useCallback(
    async (id: string) => {
      if (!user) {
        toast.error("You must be logged in to remove funding");
        return false;
      }

      try {
        const { error } = await supabase
          .from("scenario_instance_fundings")
          .delete()
          .eq("id", id);

        if (error) throw error;

        toast.success("Funding removed from scenario");
        await loadScenarioFundings();
        return true;
      } catch (error) {
        console.error("Error removing scenario funding:", error);
        toast.error("Failed to remove funding from scenario");
        return false;
      }
    },
    [user, loadScenarioFundings]
  );

  const applyScenarioFunding = useCallback(
    async (targetInstanceId: string) => {
      if (!user || !scenarioInstanceId) {
        toast.error("Missing required data for applying funding");
        return false;
      }

      try {
        const { error } = await supabase.rpc("apply_scenario_funding", {
          p_scenario_instance_id: scenarioInstanceId,
          p_target_instance_id: targetInstanceId,
        });

        if (error) throw error;

        toast.success("Scenario funding applied successfully");
        await loadFundingApplications();
        return true;
      } catch (error) {
        console.error("Error applying scenario funding:", error);
        toast.error("Failed to apply scenario funding");
        return false;
      }
    },
    [user, scenarioInstanceId, loadFundingApplications]
  );

  const rollbackScenarioFunding = useCallback(async () => {
    if (!user || !scenarioInstanceId) {
      toast.error("Missing required data for rollback");
      return false;
    }

    try {
      const { error } = await supabase.rpc("rollback_scenario_funding", {
        p_scenario_instance_id: scenarioInstanceId,
      });

      if (error) throw error;

      toast.success("Scenario funding rolled back successfully");
      await loadFundingApplications();
      return true;
    } catch (error) {
      console.error("Error rolling back scenario funding:", error);
      toast.error("Failed to rollback scenario funding");
      return false;
    }
  }, [user, scenarioInstanceId, loadFundingApplications]);

  // Load data when component mounts or scenarioInstanceId changes
  useEffect(() => {
    loadScenarioFundings();
    loadFundingApplications();
  }, [loadScenarioFundings, loadFundingApplications]);

  return {
    scenarioFundings,
    fundingApplications,
    loading,
    addScenarioFunding,
    updateScenarioFunding,
    removeScenarioFunding,
    applyScenarioFunding,
    rollbackScenarioFunding,
    refreshScenarioFundings: loadScenarioFundings,
    refreshFundingApplications: loadFundingApplications,
  };
}
