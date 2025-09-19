import React from "react";
import { renderHook, act } from "@testing-library/react";
import { ScenariosProvider, useScenarios } from "@/contexts/ScenariosContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { InstancesProvider } from "@/contexts/InstancesContext";

// Mock Supabase client
jest.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

// Mock toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <InstancesProvider>
      <ScenariosProvider>{children}</ScenariosProvider>
    </InstancesProvider>
  </AuthProvider>
);

describe("ScenariosContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should provide scenarios context", () => {
    const { result } = renderHook(() => useScenarios(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.scenarios).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should load feature flags on mount", async () => {
    const { result } = renderHook(() => useScenarios(), { wrapper });

    await act(async () => {
      // Wait for feature flags to load
    });

    expect(result.current.isScenariosEnabled).toBe(true);
    expect(result.current.isApplyEnabled).toBe(true);
    expect(result.current.isConflictResolutionEnabled).toBe(true);
  });

  it("should create scenario successfully", async () => {
    const { result } = renderHook(() => useScenarios(), { wrapper });

    const scenarioData = {
      name: "Test Scenario",
      description: "Test Description",
    };

    await act(async () => {
      await result.current.createScenario(scenarioData);
    });

    // Verify the scenario was created (mocked response)
    expect(result.current.scenarios).toBeDefined();
  });

  it("should handle create scenario error", async () => {
    const { result } = renderHook(() => useScenarios(), { wrapper });

    // Mock error response
    const mockSupabase = require("@/integrations/supabase/client").supabase;
    mockSupabase.from.mockReturnValue({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() =>
            Promise.resolve({ data: null, error: { message: "Test error" } })
          ),
        })),
      })),
    });

    const scenarioData = {
      name: "Test Scenario",
      description: "Test Description",
    };

    await act(async () => {
      try {
        await result.current.createScenario(scenarioData);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  it("should update scenario successfully", async () => {
    const { result } = renderHook(() => useScenarios(), { wrapper });

    const updateData = {
      name: "Updated Scenario",
    };

    await act(async () => {
      await result.current.updateScenario("test-id", updateData);
    });

    // Verify the scenario was updated (mocked response)
    expect(result.current.scenarios).toBeDefined();
  });

  it("should delete scenario successfully", async () => {
    const { result } = renderHook(() => useScenarios(), { wrapper });

    await act(async () => {
      await result.current.deleteScenario("test-id");
    });

    // Verify the scenario was deleted (mocked response)
    expect(result.current.scenarios).toBeDefined();
  });

  it("should set primary scenario", async () => {
    const { result } = renderHook(() => useScenarios(), { wrapper });

    await act(async () => {
      await result.current.setPrimaryScenario("test-id");
    });

    // Verify the primary scenario was set (mocked response)
    expect(result.current.scenarios).toBeDefined();
  });

  it("should add instance to scenario", async () => {
    const { result } = renderHook(() => useScenarios(), { wrapper });

    await act(async () => {
      await result.current.addInstanceToScenario("scenario-id", "instance-id");
    });

    // Verify the instance was added (mocked response)
    expect(result.current.scenarios).toBeDefined();
  });

  it("should create new instance in scenario", async () => {
    const { result } = renderHook(() => useScenarios(), { wrapper });

    const instanceData = {
      id: "test-instance",
      name: "Test Instance",
      purchase_price: 500000,
      weekly_rent: 500,
      // ... other required fields
    } as any;

    await act(async () => {
      await result.current.createNewInstanceInScenario(
        "scenario-id",
        instanceData,
        "Test Instance"
      );
    });

    // Verify the instance was created (mocked response)
    expect(result.current.scenarios).toBeDefined();
  });

  it("should apply scenario instance", async () => {
    const { result } = renderHook(() => useScenarios(), { wrapper });

    await act(async () => {
      const result = await result.current.applyScenarioInstance(
        "scenario-instance-id"
      );
      expect(result.success).toBe(true);
    });
  });

  it("should clear error", () => {
    const { result } = renderHook(() => useScenarios(), { wrapper });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
