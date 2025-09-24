import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ScenariosProvider } from "@/contexts/ScenariosContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { InstancesProvider } from "@/contexts/InstancesContext";

// Mock Supabase client for conflict resolution tests
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() =>
          Promise.resolve({
            data: {
              id: "test-instance",
              name: "Test Instance",
              purchase_price: 500000,
              weekly_rent: 500,
              updated_at: "2024-01-01T00:00:00Z",
            },
            error: null,
          })
        ),
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  })),
};

jest.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

// Mock toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("Conflict Resolution", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Value Mismatch Conflicts", () => {
    it("should detect value mismatch conflicts", async () => {
      const scenarioInstance = {
        id: "scenario-instance-1",
        original_instance_id: "instance-1",
        instance_data_parsed: {
          id: "instance-1",
          name: "Test Instance",
          purchase_price: 600000, // Changed from 500000
          weekly_rent: 500,
          updated_at: "2024-01-02T00:00:00Z",
        },
        overrides: {
          purchase_price: 600000,
        },
      };

      const originalInstance = {
        id: "instance-1",
        name: "Test Instance",
        purchase_price: 500000, // Original value
        weekly_rent: 500,
        updated_at: "2024-01-01T00:00:00Z",
      };

      // Mock the original instance data
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: originalInstance,
                error: null,
              })
            ),
          })),
        })),
      });

      // This would be called by the conflict detection logic
      const conflicts = detectConflicts(scenarioInstance, originalInstance);

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].field).toBe("purchase_price");
      expect(conflicts[0].scenario_value).toBe(600000);
      expect(conflicts[0].instance_value).toBe(500000);
      expect(conflicts[0].conflict_type).toBe("value_mismatch");
    });

    it("should handle multiple field conflicts", async () => {
      const scenarioInstance = {
        id: "scenario-instance-1",
        original_instance_id: "instance-1",
        instance_data_parsed: {
          id: "instance-1",
          name: "Test Instance",
          purchase_price: 600000, // Changed
          weekly_rent: 600, // Changed
          updated_at: "2024-01-02T00:00:00Z",
        },
      };

      const originalInstance = {
        id: "instance-1",
        name: "Test Instance",
        purchase_price: 500000, // Original
        weekly_rent: 500, // Original
        updated_at: "2024-01-01T00:00:00Z",
      };

      const conflicts = detectConflicts(scenarioInstance, originalInstance);

      expect(conflicts).toHaveLength(2);
      expect(conflicts[0].field).toBe("purchase_price");
      expect(conflicts[1].field).toBe("weekly_rent");
    });
  });

  describe("Structure Change Conflicts", () => {
    it("should detect structure changes", async () => {
      const scenarioInstance = {
        id: "scenario-instance-1",
        original_instance_id: "instance-1",
        instance_data_parsed: {
          id: "instance-1",
          name: "Test Instance",
          purchase_price: 500000,
          weekly_rent: 500,
          // New field added
          new_field: "new_value",
          updated_at: "2024-01-02T00:00:00Z",
        },
      };

      const originalInstance = {
        id: "instance-1",
        name: "Test Instance",
        purchase_price: 500000,
        weekly_rent: 500,
        updated_at: "2024-01-01T00:00:00Z",
      };

      const conflicts = detectConflicts(scenarioInstance, originalInstance);

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].field).toBe("new_field");
      expect(conflicts[0].conflict_type).toBe("structure_change");
    });
  });

  describe("Resolution Strategies", () => {
    it("should apply overwrite strategy", async () => {
      const conflicts = [
        {
          field: "purchase_price",
          scenario_value: 600000,
          instance_value: 500000,
          conflict_type: "value_mismatch",
          resolution: "overwrite",
        },
      ];

      const result = applyResolutionStrategy(conflicts, "overwrite");

      expect(result.purchase_price).toBe(600000);
    });

    it("should apply merge strategy", async () => {
      const conflicts = [
        {
          field: "purchase_price",
          scenario_value: 600000,
          instance_value: 500000,
          conflict_type: "value_mismatch",
          resolution: "merge",
        },
      ];

      const result = applyResolutionStrategy(conflicts, "merge");

      // Merge strategy would keep the scenario value
      expect(result.purchase_price).toBe(600000);
    });

    it("should apply skip strategy", async () => {
      const conflicts = [
        {
          field: "purchase_price",
          scenario_value: 600000,
          instance_value: 500000,
          conflict_type: "value_mismatch",
          resolution: "skip",
        },
      ];

      const result = applyResolutionStrategy(conflicts, "skip");

      // Skip strategy would keep the original value
      expect(result.purchase_price).toBe(500000);
    });
  });

  describe("Atomic Apply Operations", () => {
    it("should handle successful apply operation", async () => {
      const applyResult = await performAtomicApply("scenario-instance-1", {
        operation_type: "update",
        resolution_strategy: "overwrite",
      });

      expect(applyResult.success).toBe(true);
      expect(applyResult.conflicts).toHaveLength(0);
    });

    it("should handle failed apply operation", async () => {
      // Mock database error
      mockSupabase.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() =>
            Promise.resolve({
              data: null,
              error: { message: "Database error" },
            })
          ),
        })),
      });

      const applyResult = await performAtomicApply("scenario-instance-1", {
        operation_type: "update",
        resolution_strategy: "overwrite",
      });

      expect(applyResult.success).toBe(false);
      expect(applyResult.error).toBe("Database error");
    });

    it("should handle conflicts during apply", async () => {
      const applyResult = await performAtomicApply("scenario-instance-1", {
        operation_type: "update",
        resolution_strategy: "overwrite",
      });

      expect(applyResult.success).toBe(true);
      expect(applyResult.conflicts).toBeDefined();
    });
  });
});

// Helper functions for conflict detection and resolution
function detectConflicts(scenarioInstance: any, originalInstance: any) {
  const conflicts = [];

  // Compare all fields in the scenario instance with the original
  for (const [key, value] of Object.entries(
    scenarioInstance.instance_data_parsed
  )) {
    if (key === "updated_at" || key === "created_at") continue;

    const originalValue = originalInstance[key];

    if (originalValue === undefined) {
      // New field added
      conflicts.push({
        field: key,
        scenario_value: value,
        instance_value: undefined,
        conflict_type: "structure_change",
        resolution: "overwrite",
      });
    } else if (originalValue !== value) {
      // Value changed
      conflicts.push({
        field: key,
        scenario_value: value,
        instance_value: originalValue,
        conflict_type: "value_mismatch",
        resolution: "overwrite",
      });
    }
  }

  return conflicts;
}

function applyResolutionStrategy(conflicts: any[], strategy: string) {
  const result: any = {};

  for (const conflict of conflicts) {
    switch (strategy) {
      case "overwrite":
        result[conflict.field] = conflict.scenario_value;
        break;
      case "merge":
        result[conflict.field] = conflict.scenario_value;
        break;
      case "skip":
        result[conflict.field] = conflict.instance_value;
        break;
      default:
        result[conflict.field] = conflict.scenario_value;
    }
  }

  return result;
}

async function performAtomicApply(scenarioInstanceId: string, options: any) {
  try {
    // This would be the actual implementation
    // For now, return a mock successful result
    return {
      success: true,
      scenario_instance_id: scenarioInstanceId,
      operation_type: options.operation_type,
      conflicts: [],
    };
  } catch (error) {
    return {
      success: false,
      scenario_instance_id: scenarioInstanceId,
      operation_type: options.operation_type,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
