import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Scenarios from "@/pages/Scenarios";
import { ScenariosProvider } from "@/contexts/ScenariosContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { InstancesProvider } from "@/contexts/InstancesContext";

// Mock the scenarios context
jest.mock("@/contexts/ScenariosContext", () => ({
  ...jest.requireActual("@/contexts/ScenariosContext"),
  useScenarios: () => ({
    scenarios: [
      {
        id: "1",
        name: "Test Scenario 1",
        description: "Test Description 1",
        status: "active",
        is_primary: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        scenario_instances: [],
      },
      {
        id: "2",
        name: "Test Scenario 2",
        description: "Test Description 2",
        status: "draft",
        is_primary: false,
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
        scenario_instances: [],
      },
    ],
    currentScenario: null,
    loading: false,
    error: null,
    isScenariosEnabled: true,
    isApplyEnabled: true,
    isConflictResolutionEnabled: true,
    createScenario: jest.fn(),
    updateScenario: jest.fn(),
    deleteScenario: jest.fn(),
    setPrimaryScenario: jest.fn(),
    addInstanceToScenario: jest.fn(),
    createNewInstanceInScenario: jest.fn(),
    removeInstanceFromScenario: jest.fn(),
    applyScenarioInstance: jest.fn(),
    applyAllScenarioInstances: jest.fn(),
    setCurrentScenario: jest.fn(),
    refreshScenarios: jest.fn(),
    clearError: jest.fn(),
  }),
}));

// Mock the instances context
jest.mock("@/contexts/InstancesContext", () => ({
  ...jest.requireActual("@/contexts/InstancesContext"),
  useInstances: () => ({
    instances: [
      {
        id: "instance-1",
        name: "Test Instance 1",
        purchase_price: 500000,
        weekly_rent: 500,
      },
    ],
  }),
}));

// Mock the auth context
jest.mock("@/contexts/AuthContext", () => ({
  ...jest.requireActual("@/contexts/AuthContext"),
  useAuth: () => ({
    user: { id: "test-user-id" },
  }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <InstancesProvider>
          <ScenariosProvider>{component}</ScenariosProvider>
        </InstancesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe("Scenarios Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders scenarios list", () => {
    renderWithProviders(<Scenarios />);

    expect(screen.getByText("Scenarios")).toBeInTheDocument();
    expect(screen.getByText("Test Scenario 1")).toBeInTheDocument();
    expect(screen.getByText("Test Scenario 2")).toBeInTheDocument();
  });

  it("shows create scenario button", () => {
    renderWithProviders(<Scenarios />);

    expect(screen.getByText("Create Scenario")).toBeInTheDocument();
  });

  it("shows scenario details when scenario is selected", () => {
    const mockUseScenarios =
      require("@/contexts/ScenariosContext").useScenarios;
    mockUseScenarios.mockReturnValue({
      ...mockUseScenarios(),
      selectedScenarioId: "1",
      currentScenario: {
        id: "1",
        name: "Test Scenario 1",
        description: "Test Description 1",
        status: "active",
        is_primary: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        scenario_instances: [],
      },
    });

    renderWithProviders(<Scenarios />);

    expect(screen.getByText("Test Scenario 1")).toBeInTheDocument();
    expect(screen.getByText("Test Description 1")).toBeInTheDocument();
  });

  it("shows empty state when no scenarios", () => {
    const mockUseScenarios =
      require("@/contexts/ScenariosContext").useScenarios;
    mockUseScenarios.mockReturnValue({
      ...mockUseScenarios(),
      scenarios: [],
    });

    renderWithProviders(<Scenarios />);

    expect(screen.getByText("No scenarios yet")).toBeInTheDocument();
    expect(screen.getByText("Create First Scenario")).toBeInTheDocument();
  });

  it("shows feature disabled message when scenarios are disabled", () => {
    const mockUseScenarios =
      require("@/contexts/ScenariosContext").useScenarios;
    mockUseScenarios.mockReturnValue({
      ...mockUseScenarios(),
      isScenariosEnabled: false,
    });

    renderWithProviders(<Scenarios />);

    expect(screen.getByText("Feature Disabled")).toBeInTheDocument();
    expect(
      screen.getByText("The Scenarios feature is currently disabled")
    ).toBeInTheDocument();
  });

  it("shows loading state", () => {
    const mockUseScenarios =
      require("@/contexts/ScenariosContext").useScenarios;
    mockUseScenarios.mockReturnValue({
      ...mockUseScenarios(),
      loading: true,
    });

    renderWithProviders(<Scenarios />);

    expect(screen.getByText("Loading scenarios...")).toBeInTheDocument();
  });

  it("shows error state", () => {
    const mockUseScenarios =
      require("@/contexts/ScenariosContext").useScenarios;
    mockUseScenarios.mockReturnValue({
      ...mockUseScenarios(),
      error: "Test error message",
    });

    renderWithProviders(<Scenarios />);

    expect(screen.getByText("Error Loading Scenarios")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("handles scenario click", () => {
    const mockSetCurrentScenario = jest.fn();
    const mockUseScenarios =
      require("@/contexts/ScenariosContext").useScenarios;
    mockUseScenarios.mockReturnValue({
      ...mockUseScenarios(),
      setCurrentScenario: mockSetCurrentScenario,
    });

    renderWithProviders(<Scenarios />);

    fireEvent.click(screen.getByText("Test Scenario 1"));

    expect(mockSetCurrentScenario).toHaveBeenCalled();
  });

  it("handles create scenario dialog", async () => {
    renderWithProviders(<Scenarios />);

    fireEvent.click(screen.getByText("Create Scenario"));

    await waitFor(() => {
      expect(screen.getByText("Create New Scenario")).toBeInTheDocument();
    });
  });

  it("handles delete scenario", async () => {
    const mockDeleteScenario = jest.fn();
    const mockUseScenarios =
      require("@/contexts/ScenariosContext").useScenarios;
    mockUseScenarios.mockReturnValue({
      ...mockUseScenarios(),
      deleteScenario: mockDeleteScenario,
      selectedScenarioId: "1",
      currentScenario: {
        id: "1",
        name: "Test Scenario 1",
        description: "Test Description 1",
        status: "active",
        is_primary: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        scenario_instances: [],
      },
    });

    renderWithProviders(<Scenarios />);

    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(screen.getByText("Delete Scenario")).toBeInTheDocument();
    });
  });
});
