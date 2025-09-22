import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { useInstances } from "./InstancesContext";
import {
  ScenariosContextType,
  ScenarioWithInstances,
  ScenarioInstanceWithData,
  CreateScenarioRequest,
  UpdateScenarioRequest,
  CreateScenarioInstanceRequest,
  UpdateScenarioInstanceRequest,
  ApplyScenarioInstanceRequest,
  ApplyResult,
  ScenarioProjections,
  InstanceData,
  ApplyScenarioFundingRequest,
  ScenarioFundingConflict,
} from "@/types/scenarios";
import { toast } from "sonner";

const ScenariosContext = createContext<ScenariosContextType | undefined>(
  undefined
);

export const useScenarios = () => {
  const context = useContext(ScenariosContext);
  if (context === undefined) {
    throw new Error("useScenarios must be used within a ScenariosProvider");
  }
  return context;
};

interface ScenariosProviderProps {
  children: React.ReactNode;
}

export const ScenariosProvider: React.FC<ScenariosProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const { instances, refreshInstances } = useInstances();

  // State
  const [scenarios, setScenarios] = useState<ScenarioWithInstances[]>([]);
  const [currentScenario, setCurrentScenario] =
    useState<ScenarioWithInstances | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Feature flags
  const [isScenariosEnabled, setIsScenariosEnabled] = useState(false);
  const [isApplyEnabled, setIsApplyEnabled] = useState(false);
  const [isConflictResolutionEnabled, setIsConflictResolutionEnabled] =
    useState(false);

  // Load feature flags
  const loadFeatureFlags = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("feature_flags")
        .select("*")
        .in("flag_name", [
          "feature:scenarios",
          "feature:scenarios:apply",
          "feature:scenarios:conflict_resolution",
        ]);

      if (error) throw error;

      const flags = data || [];
      setIsScenariosEnabled(
        flags.find((f) => f.flag_name === "feature:scenarios")?.enabled || false
      );
      setIsApplyEnabled(
        flags.find((f) => f.flag_name === "feature:scenarios:apply")?.enabled ||
          false
      );
      setIsConflictResolutionEnabled(
        flags.find(
          (f) => f.flag_name === "feature:scenarios:conflict_resolution"
        )?.enabled || false
      );
    } catch (err) {
      console.error("Error loading feature flags:", err);
      // Default to enabled for development
      setIsScenariosEnabled(true);
      setIsApplyEnabled(true);
      setIsConflictResolutionEnabled(true);
    }
  }, []);

  // Load scenarios with instances
  const loadScenarios = useCallback(async () => {
    if (!user || !isScenariosEnabled) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("scenarios")
        .select(
          `
          *,
          scenario_instances (
            *,
            original_instance_id
          )
        `
        )
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const scenariosWithInstances: ScenarioWithInstances[] = (data || []).map(
        (scenario) => ({
          ...scenario,
          scenario_instances: (scenario.scenario_instances || []).map(
            (si: any) => ({
              ...si,
              is_modified: si.status === "draft" || si.status === "conflict",
              has_conflicts: si.status === "conflict",
              last_modified_at: si.updated_at,
              instance_data_parsed: si.instance_data as InstanceData,
            })
          ),
        })
      );

      setScenarios(scenariosWithInstances);
    } catch (err) {
      console.error("Error loading scenarios:", err);
      setError(err instanceof Error ? err.message : "Failed to load scenarios");
    } finally {
      setLoading(false);
    }
  }, [user, isScenariosEnabled]);

  // Create scenario
  const createScenario = useCallback(
    async (data: CreateScenarioRequest): Promise<ScenarioWithInstances> => {
      if (!user) throw new Error("User not authenticated");
      if (!isScenariosEnabled) throw new Error("Scenarios feature is disabled");

      try {
        const { data: scenario, error } = await supabase
          .from("scenarios")
          .insert({
            user_id: user.id,
            name: data.name,
            description: data.description,
            settings: data.settings || {},
            tags: data.tags || [],
          })
          .select()
          .single();

        if (error) throw error;

        const newScenario: ScenarioWithInstances = {
          ...scenario,
          scenario_instances: [],
          description: (scenario as any).description || data.description,
          status: (scenario as any).status || "draft",
          is_primary: (scenario as any).is_primary || false,
        };

        setScenarios((prev) => [newScenario, ...prev]);
        toast.success("Scenario created successfully");

        return newScenario;
      } catch (err) {
        console.error("Error creating scenario:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create scenario";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      }
    },
    [user, isScenariosEnabled]
  );

  // Update scenario
  const updateScenario = useCallback(
    async (
      id: string,
      data: UpdateScenarioRequest
    ): Promise<ScenarioWithInstances> => {
      if (!user) throw new Error("User not authenticated");
      if (!isScenariosEnabled) throw new Error("Scenarios feature is disabled");

      try {
        const { data: scenario, error } = await supabase
          .from("scenarios")
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;

        setScenarios((prev) =>
          prev.map((s) => (s.id === id ? { ...s, ...scenario } : s))
        );
        if (currentScenario?.id === id) {
          setCurrentScenario((prev) =>
            prev ? { ...prev, ...scenario } : null
          );
        }

        toast.success("Scenario updated successfully");
        return scenario;
      } catch (err) {
        console.error("Error updating scenario:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update scenario";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      }
    },
    [user, isScenariosEnabled, currentScenario]
  );

  // Delete scenario
  const deleteScenario = useCallback(
    async (id: string): Promise<void> => {
      if (!user) throw new Error("User not authenticated");
      if (!isScenariosEnabled) throw new Error("Scenarios feature is disabled");

      try {
        const { error } = await supabase
          .from("scenarios")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) throw error;

        setScenarios((prev) => prev.filter((s) => s.id !== id));
        if (currentScenario?.id === id) {
          setCurrentScenario(null);
        }

        toast.success("Scenario deleted successfully");
      } catch (err) {
        console.error("Error deleting scenario:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete scenario";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      }
    },
    [user, isScenariosEnabled, currentScenario]
  );

  // Set primary scenario
  const setPrimaryScenario = useCallback(
    async (id: string): Promise<void> => {
      if (!user) throw new Error("User not authenticated");
      if (!isScenariosEnabled) throw new Error("Scenarios feature is disabled");

      try {
        // First unset all primary scenarios
        await supabase
          .from("scenarios")
          .update({ is_primary: false })
          .eq("user_id", user.id);

        // Then set the selected one as primary
        const { error } = await supabase
          .from("scenarios")
          .update({ is_primary: true })
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) throw error;

        setScenarios((prev) =>
          prev.map((s) => ({ ...s, is_primary: s.id === id }))
        );
        toast.success("Primary scenario updated");
      } catch (err) {
        console.error("Error setting primary scenario:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to set primary scenario";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      }
    },
    [user, isScenariosEnabled]
  );

  // Add instance to scenario (copy from existing with comprehensive data)
  const addInstanceToScenario = useCallback(
    async (
      scenarioId: string,
      instanceId: string,
      scenarioName?: string
    ): Promise<ScenarioInstanceWithData> => {
      if (!user) throw new Error("User not authenticated");
      if (!isScenariosEnabled) throw new Error("Scenarios feature is disabled");

      try {
        // Get the original instance
        const originalInstance = instances.find((i) => i.id === instanceId);
        if (!originalInstance) throw new Error("Instance not found");

        // Use comprehensive copying function
        const { data: copyResult, error: copyError } = await supabase.rpc(
          "copy_instance_to_scenario_comprehensive",
          {
            p_scenario_id: scenarioId,
            p_instance_id: instanceId,
            p_scenario_name: scenarioName || originalInstance.name,
          }
        );

        if (copyError) throw copyError;

        const result = copyResult?.[0];
        if (!result || !result.success) {
          throw new Error(
            result?.message || "Failed to copy instance to scenario"
          );
        }

        // Get the created scenario instance with all data
        const { data: scenarioInstance, error: scenarioInstanceError } =
          await supabase
            .from("scenario_instances")
            .select("*")
            .eq("id", result.scenario_instance_id)
            .single();

        if (scenarioInstanceError) throw scenarioInstanceError;

        // Convert instance to InstanceData format
        const instanceData: InstanceData = {
          ...originalInstance,
          // Add any additional fields that might be missing
        } as InstanceData;

        const newScenarioInstance: ScenarioInstanceWithData = {
          ...scenarioInstance,
          is_modified: false,
          has_conflicts: false,
          last_modified_at: scenarioInstance.updated_at,
          instance_data_parsed: instanceData,
        };

        // Update scenarios state
        setScenarios((prev) =>
          prev.map((s) =>
            s.id === scenarioId
              ? {
                  ...s,
                  scenario_instances: [
                    ...s.scenario_instances,
                    newScenarioInstance,
                  ],
                }
              : s
          )
        );

        const fundingMessage =
          result.copied_funding_count > 0
            ? ` with ${result.copied_funding_count} funding allocation${
                result.copied_funding_count !== 1 ? "s" : ""
              }`
            : "";

        toast.success(`Instance added to scenario${fundingMessage}`);
        return newScenarioInstance;
      } catch (err) {
        console.error("Error adding instance to scenario:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to add instance to scenario";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      }
    },
    [user, isScenariosEnabled, instances]
  );

  // Create new instance in scenario
  const createNewInstanceInScenario = useCallback(
    async (
      scenarioId: string,
      instanceData: InstanceData,
      scenarioName: string
    ): Promise<ScenarioInstanceWithData> => {
      if (!user) throw new Error("User not authenticated");
      if (!isScenariosEnabled) throw new Error("Scenarios feature is disabled");

      try {
        const { data: scenarioInstance, error } = await supabase
          .from("scenario_instances")
          .insert({
            scenario_id: scenarioId,
            instance_data: instanceData,
            scenario_name: scenarioName,
            overrides: {},
          })
          .select()
          .single();

        if (error) throw error;

        const newScenarioInstance: ScenarioInstanceWithData = {
          ...scenarioInstance,
          is_modified: true,
          has_conflicts: false,
          last_modified_at: scenarioInstance.updated_at,
          instance_data_parsed: instanceData,
        };

        // Update scenarios state
        setScenarios((prev) =>
          prev.map((s) =>
            s.id === scenarioId
              ? {
                  ...s,
                  scenario_instances: [
                    ...s.scenario_instances,
                    newScenarioInstance,
                  ],
                }
              : s
          )
        );

        toast.success("New instance created in scenario");
        return newScenarioInstance;
      } catch (err) {
        console.error("Error creating new instance in scenario:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to create new instance in scenario";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      }
    },
    [user, isScenariosEnabled]
  );

  // Update scenario instance
  const updateScenarioInstance = useCallback(
    async (
      scenarioInstanceId: string,
      data: UpdateScenarioInstanceRequest
    ): Promise<ScenarioInstanceWithData> => {
      if (!user) throw new Error("User not authenticated");
      if (!isScenariosEnabled) throw new Error("Scenarios feature is disabled");

      try {
        const { data: scenarioInstance, error } = await supabase
          .from("scenario_instances")
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", scenarioInstanceId)
          .select()
          .single();

        if (error) throw error;

        const updatedScenarioInstance: ScenarioInstanceWithData = {
          ...scenarioInstance,
          is_modified:
            scenarioInstance.status === "draft" ||
            scenarioInstance.status === "conflict",
          has_conflicts: scenarioInstance.status === "conflict",
          last_modified_at: scenarioInstance.updated_at,
          instance_data_parsed: scenarioInstance.instance_data as InstanceData,
        };

        // Update scenarios state
        setScenarios((prev) =>
          prev.map((s) => ({
            ...s,
            scenario_instances: s.scenario_instances.map((si) =>
              si.id === scenarioInstanceId ? updatedScenarioInstance : si
            ),
          }))
        );

        toast.success("Scenario instance updated");
        return updatedScenarioInstance;
      } catch (err) {
        console.error("Error updating scenario instance:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to update scenario instance";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      }
    },
    [user, isScenariosEnabled]
  );

  // Remove instance from scenario
  const removeInstanceFromScenario = useCallback(
    async (scenarioInstanceId: string): Promise<void> => {
      if (!user) throw new Error("User not authenticated");
      if (!isScenariosEnabled) throw new Error("Scenarios feature is disabled");

      try {
        const { error } = await supabase
          .from("scenario_instances")
          .delete()
          .eq("id", scenarioInstanceId);

        if (error) throw error;

        // Update scenarios state
        setScenarios((prev) =>
          prev.map((s) => ({
            ...s,
            scenario_instances: s.scenario_instances.filter(
              (si) => si.id !== scenarioInstanceId
            ),
          }))
        );

        toast.success("Instance removed from scenario");
      } catch (err) {
        console.error("Error removing instance from scenario:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to remove instance from scenario";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      }
    },
    [user, isScenariosEnabled]
  );

  // Refresh scenario instance from parent instance
  const refreshScenarioInstance = useCallback(
    async (scenarioInstanceId: string): Promise<ScenarioInstanceWithData> => {
      if (!user) throw new Error("User not authenticated");
      if (!isScenariosEnabled) throw new Error("Scenarios feature is disabled");

      try {
        console.log(
          "🔄 Starting refresh for scenario instance:",
          scenarioInstanceId
        );

        let updatedScenarioInstance;

        // Try using the database function first
        try {
          const { data: refreshResult, error: refreshError } =
            await supabase.rpc("refresh_scenario_instance" as any, {
              p_scenario_instance_id: scenarioInstanceId,
            });

          console.log("📊 Refresh result:", { refreshResult, refreshError });

          if (refreshError) {
            console.error("❌ Refresh error:", refreshError);
            throw refreshError;
          }

          const result = refreshResult?.[0];
          if (!result || !result.success) {
            console.error("❌ Refresh failed:", result);
            throw new Error(
              result?.message || "Failed to refresh scenario instance"
            );
          }

          console.log("✅ Refresh successful:", result);

          // Get the updated scenario instance after RPC refresh
          const { data: updatedInstance, error: fetchError } = await supabase
            .from("scenario_instances" as any)
            .select("*")
            .eq("id", scenarioInstanceId)
            .single();

          if (fetchError) throw fetchError;
          updatedScenarioInstance = updatedInstance;
        } catch (rpcError) {
          console.log(
            "⚠️ RPC function not available, falling back to manual refresh"
          );

          // Fallback: Manual refresh if RPC function doesn't exist
          const { data: scenarioInstance, error: fetchError } = await supabase
            .from("scenario_instances" as any)
            .select("*")
            .eq("id", scenarioInstanceId)
            .single();

          if (fetchError) throw fetchError;
          if (!scenarioInstance.original_instance_id) {
            throw new Error("Cannot refresh - no parent instance found");
          }

          // Get the current parent instance data
          const { data: parentInstance, error: parentError } = await supabase
            .from("instances")
            .select("*")
            .eq("id", scenarioInstance.original_instance_id)
            .single();

          if (parentError) throw parentError;

          // Update the scenario instance with fresh data from parent
          const { data: updatedInstance, error: updateError } = await supabase
            .from("scenario_instances" as any)
            .update({
              instance_data: parentInstance,
              last_synced_at: new Date().toISOString(),
              status: "synced",
              updated_at: new Date().toISOString(),
            })
            .eq("id", scenarioInstanceId)
            .select()
            .single();

          if (updateError) throw updateError;
          updatedScenarioInstance = updatedInstance;

          // Refresh funding data from parent instance
          console.log("🔄 Refreshing funding data from parent instance");

          // Delete existing scenario funding
          const { error: deleteFundingError } = await supabase
            .from("scenario_instance_fundings" as any)
            .delete()
            .eq("scenario_instance_id", scenarioInstanceId);

          if (deleteFundingError) {
            console.warn(
              "⚠️ Warning: Could not delete existing funding:",
              deleteFundingError
            );
          }

          // Get parent instance funding
          const { data: parentFunding, error: fundingError } = await supabase
            .from("instance_fundings")
            .select("*")
            .eq("instance_id", scenarioInstance.original_instance_id);

          if (fundingError) {
            console.warn(
              "⚠️ Warning: Could not fetch parent funding:",
              fundingError
            );
          } else if (parentFunding && parentFunding.length > 0) {
            // Copy funding data to scenario
            const fundingInserts = parentFunding.map((funding) => ({
              scenario_instance_id: scenarioInstanceId,
              fund_id: funding.fund_id,
              fund_type: funding.fund_type,
              amount_allocated: funding.amount_allocated,
              amount_used: funding.amount_used,
              allocation_date: funding.allocation_date,
              notes: funding.notes,
            }));

            const { error: insertFundingError } = await supabase
              .from("scenario_instance_fundings" as any)
              .insert(fundingInserts);

            if (insertFundingError) {
              console.warn(
                "⚠️ Warning: Could not insert funding data:",
                insertFundingError
              );
            } else {
              console.log(
                `✅ Refreshed ${parentFunding.length} funding records`
              );
            }
          }

          console.log("✅ Manual refresh successful");
        }

        // Convert to ScenarioInstanceWithData format
        const refreshedInstance: ScenarioInstanceWithData = {
          ...updatedScenarioInstance,
          is_modified: false,
          has_conflicts: false,
          last_modified_at: updatedScenarioInstance.updated_at,
          instance_data_parsed:
            updatedScenarioInstance.instance_data as InstanceData,
        };

        // Update scenarios state
        setScenarios((prev) =>
          prev.map((s) => ({
            ...s,
            scenario_instances: s.scenario_instances.map((si) =>
              si.id === scenarioInstanceId ? refreshedInstance : si
            ),
          }))
        );

        toast.success(
          "Scenario instance and funding refreshed with latest parent data"
        );
        return refreshedInstance;
      } catch (err) {
        console.error("Error refreshing scenario instance:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to refresh scenario instance";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      }
    },
    [user, isScenariosEnabled]
  );

  // Apply scenario instance (create or update real instance)
  const applyScenarioInstance = useCallback(
    async (
      scenarioInstanceId: string,
      options?: ApplyScenarioInstanceRequest
    ): Promise<ApplyResult> => {
      if (!user) throw new Error("User not authenticated");
      if (!isScenariosEnabled || !isApplyEnabled)
        throw new Error("Apply feature is disabled");

      try {
        // Get the scenario instance
        const scenarioInstance = scenarios
          .flatMap((s) => s.scenario_instances)
          .find((si) => si.id === scenarioInstanceId);

        if (!scenarioInstance) throw new Error("Scenario instance not found");

        // Check for conflicts first
        const { data: conflictCheck, error: conflictError } =
          await supabase.rpc("check_scenario_instance_conflicts", {
            p_scenario_instance_id: scenarioInstanceId,
          });

        if (conflictError) throw conflictError;

        const hasConflicts = conflictCheck?.[0]?.has_conflicts || false;
        const conflicts = conflictCheck?.[0]?.conflicts || [];

        // If conflicts exist and resolution strategy is not overwrite, handle them
        if (hasConflicts && options?.resolution_strategy !== "overwrite") {
          if (options?.resolution_strategy === "skip") {
            // Update scenario instance status to conflict
            await supabase
              .from("scenario_instances")
              .update({
                status: "conflict",
                updated_at: new Date().toISOString(),
              })
              .eq("id", scenarioInstanceId);

            toast.warning("Conflicts detected, apply skipped");
            return {
              success: false,
              scenario_instance_id: scenarioInstanceId,
              operation_type: scenarioInstance.original_instance_id
                ? "update"
                : "create",
              conflicts: conflicts,
              error: "Conflicts detected, apply skipped",
            };
          }
        }

        // Apply the scenario instance using the database function with merge logic
        const { data: applyResult, error: applyError } = await supabase.rpc(
          "apply_scenario_instance",
          {
            p_scenario_instance_id: scenarioInstanceId,
            p_resolution_strategy: options?.resolution_strategy || "merge",
          }
        );

        if (applyError) throw applyError;

        const result = applyResult?.[0];
        if (!result) throw new Error("No result returned from apply function");

        if (result.success) {
          // Refresh instances to show the updated/created instance
          await refreshInstances();

          // Refresh scenarios to update the scenario instance status
          await loadScenarios();

          toast.success(result.message);
          return {
            success: true,
            scenario_instance_id: scenarioInstanceId,
            target_instance_id: result.target_instance_id,
            operation_type: result.operation_type,
            conflicts: result.conflicts || [],
          };
        } else {
          toast.error(result.message);
          return {
            success: false,
            scenario_instance_id: scenarioInstanceId,
            operation_type: result.operation_type,
            conflicts: result.conflicts || [],
            error: result.message,
          };
        }
      } catch (err) {
        console.error("Error applying scenario instance:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to apply scenario instance";
        setError(errorMessage);
        toast.error(errorMessage);
        return {
          success: false,
          scenario_instance_id: scenarioInstanceId,
          operation_type: options?.operation_type || "update",
          error: errorMessage,
        };
      }
    },
    [
      user,
      isScenariosEnabled,
      isApplyEnabled,
      scenarios,
      refreshInstances,
      loadScenarios,
    ]
  );

  // Check for conflicts before applying
  const checkScenarioInstanceConflicts = useCallback(
    async (scenarioInstanceId: string): Promise<ConflictCheckResult> => {
      if (!user) throw new Error("User not authenticated");
      if (!isScenariosEnabled) throw new Error("Scenarios feature is disabled");

      try {
        const { data, error } = await supabase.rpc(
          "check_scenario_instance_conflicts",
          {
            p_scenario_instance_id: scenarioInstanceId,
          }
        );

        if (error) throw error;

        const result = data?.[0];
        return {
          has_conflicts: result?.has_conflicts || false,
          conflicts: result?.conflicts || [],
          last_instance_update: result?.last_instance_update,
          last_scenario_update: result?.last_scenario_update,
        };
      } catch (err) {
        console.error("Error checking conflicts:", err);
        throw err;
      }
    },
    [user, isScenariosEnabled]
  );

  // Apply all scenario instances
  const applyAllScenarioInstances = useCallback(
    async (scenarioId: string): Promise<ApplyResult[]> => {
      const scenario = scenarios.find((s) => s.id === scenarioId);
      if (!scenario) throw new Error("Scenario not found");

      const results: ApplyResult[] = [];

      for (const scenarioInstance of scenario.scenario_instances) {
        try {
          const result = await applyScenarioInstance(scenarioInstance.id);
          results.push(result);
        } catch (err) {
          results.push({
            success: false,
            scenario_instance_id: scenarioInstance.id,
            operation_type: scenarioInstance.original_instance_id
              ? "update"
              : "create",
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }

      return results;
    },
    [scenarios, applyScenarioInstance]
  );

  // Apply scenario funding to real instances
  const applyScenarioFunding = useCallback(
    async (request: ApplyScenarioFundingRequest): Promise<boolean> => {
      if (!user) throw new Error("User not authenticated");
      if (!isScenariosEnabled || !isApplyEnabled)
        throw new Error("Apply feature is disabled");

      try {
        const { error } = await supabase.rpc("apply_scenario_funding", {
          p_scenario_instance_id: request.scenario_instance_id,
          p_target_instance_id: request.target_instance_id,
        });

        if (error) throw error;

        toast.success("Scenario funding applied successfully");
        await refreshInstances(); // Refresh real instances to show updated funding
        return true;
      } catch (error) {
        console.error("Error applying scenario funding:", error);
        toast.error("Failed to apply scenario funding");
        return false;
      }
    },
    [user, isScenariosEnabled, isApplyEnabled, refreshInstances]
  );

  // Rollback scenario funding
  const rollbackScenarioFunding = useCallback(
    async (scenarioInstanceId: string): Promise<boolean> => {
      if (!user) throw new Error("User not authenticated");

      try {
        const { error } = await supabase.rpc("rollback_scenario_funding", {
          p_scenario_instance_id: scenarioInstanceId,
        });

        if (error) throw error;

        toast.success("Scenario funding rolled back successfully");
        await refreshInstances(); // Refresh real instances
        return true;
      } catch (error) {
        console.error("Error rolling back scenario funding:", error);
        toast.error("Failed to rollback scenario funding");
        return false;
      }
    },
    [user, refreshInstances]
  );

  // Check for funding conflicts
  const checkFundingConflicts = useCallback(
    async (scenarioInstanceId: string): Promise<ScenarioFundingConflict[]> => {
      if (!user) throw new Error("User not authenticated");

      try {
        // Get scenario fundings
        const { data: scenarioFundings, error: scenarioError } = await supabase
          .from("scenario_instance_fundings")
          .select("*")
          .eq("scenario_instance_id", scenarioInstanceId);

        if (scenarioError) throw scenarioError;

        // Get the scenario instance to find target instance
        const scenarioInstance = scenarios
          .flatMap((s) => s.scenario_instances)
          .find((si) => si.id === scenarioInstanceId);

        if (!scenarioInstance?.original_instance_id) {
          return []; // No conflicts for new instances
        }

        // Get real instance fundings
        const { data: realFundings, error: realError } = await supabase
          .from("instance_fundings")
          .select("*")
          .eq("instance_id", scenarioInstance.original_instance_id);

        if (realError) throw realError;

        const conflicts: ScenarioFundingConflict[] = [];

        // Check for conflicts
        for (const scenarioFunding of scenarioFundings || []) {
          const realFunding = realFundings?.find(
            (rf) =>
              rf.fund_id === scenarioFunding.fund_id &&
              rf.fund_type === scenarioFunding.fund_type
          );

          if (realFunding) {
            if (
              realFunding.amount_allocated !== scenarioFunding.amount_allocated
            ) {
              conflicts.push({
                scenario_funding: scenarioFunding,
                real_funding: realFunding,
                conflict_type: "amount_mismatch",
                resolution_strategy: "overwrite",
              });
            }
          } else {
            conflicts.push({
              scenario_funding: scenarioFunding,
              real_funding: undefined,
              conflict_type: "new_allocation",
              resolution_strategy: "overwrite",
            });
          }
        }

        return conflicts;
      } catch (error) {
        console.error("Error checking funding conflicts:", error);
        return [];
      }
    },
    [user, scenarios]
  );

  // Calculate scenario projections
  const calculateScenarioProjections = useCallback(
    async (scenarioId: string): Promise<ScenarioProjections> => {
      const scenario = scenarios.find((s) => s.id === scenarioId);
      if (!scenario) throw new Error("Scenario not found");

      // This would integrate with the existing projection calculation logic
      // For now, return a placeholder structure
      const projections: ScenarioProjections = {
        total_rental_income: 0,
        total_property_value: 0,
        total_loan_balance: 0,
        total_equity_loan_balance: 0,
        total_interest: 0,
        total_loan_payment: 0,
        total_equity_loan_payment: 0,
        total_other_expenses: 0,
        total_depreciation: 0,
        total_taxable_income: 0,
        total_tax_benefit: 0,
        total_after_tax_cash_flow: 0,
        total_cumulative_cash_flow: 0,
        total_property_equity: 0,
        total_return: 0,
        yearly_projections: [],
      };

      // TODO: Implement actual projection calculation
      // This would aggregate projections from all scenario instances

      return projections;
    },
    [scenarios]
  );

  // Refresh scenario projections
  const refreshScenarioProjections = useCallback(
    async (scenarioId: string): Promise<void> => {
      try {
        const projections = await calculateScenarioProjections(scenarioId);

        // Update the scenario with new projections
        await supabase
          .from("scenarios")
          .update({
            aggregated_projections: projections,
            last_calculated_at: new Date().toISOString(),
          })
          .eq("id", scenarioId);

        // Refresh scenarios
        await loadScenarios();
      } catch (err) {
        console.error("Error refreshing scenario projections:", err);
        setError(
          err instanceof Error ? err.message : "Failed to refresh projections"
        );
      }
    },
    [calculateScenarioProjections, loadScenarios]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load data on mount and when user changes
  useEffect(() => {
    if (user) {
      loadFeatureFlags();
    }
  }, [user, loadFeatureFlags]);

  useEffect(() => {
    if (user && isScenariosEnabled) {
      loadScenarios();
    }
  }, [user, isScenariosEnabled, loadScenarios]);

  const value: ScenariosContextType = {
    // Data
    scenarios,
    currentScenario,
    loading,
    error,

    // Feature flags
    isScenariosEnabled,
    isApplyEnabled,
    isConflictResolutionEnabled,

    // CRUD operations
    createScenario,
    updateScenario,
    deleteScenario,
    setPrimaryScenario,

    // Scenario instance operations
    addInstanceToScenario,
    createNewInstanceInScenario,
    updateScenarioInstance,
    removeInstanceFromScenario,
    refreshScenarioInstance,

    // Apply operations
    applyScenarioInstance,
    applyAllScenarioInstances,
    checkScenarioInstanceConflicts,

    // Funding operations
    applyScenarioFunding,
    rollbackScenarioFunding,
    checkFundingConflicts,

    // Projections
    calculateScenarioProjections,
    refreshScenarioProjections,

    // Navigation
    setCurrentScenario,

    // State management
    refreshScenarios: loadScenarios,
    clearError,
  };

  return (
    <ScenariosContext.Provider value={value}>
      {children}
    </ScenariosContext.Provider>
  );
};
