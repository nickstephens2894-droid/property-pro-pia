import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScenarioComparison } from "@/components/ScenarioComparison";
import { ScenarioWithInstances } from "@/types/scenarios";

// Mock the comparison utilities
jest.mock("@/utils/scenarioComparisonUtils", () => ({
  calculateScenarioComparisonData: jest.fn((scenario) => ({
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    instanceCount: scenario.scenario_instances?.length || 0,
    totalValue: 1000000,
    totalWeeklyRent: 500,
    totalAnnualRent: 26000,
    averageRentalYield: 2.6,
    totalLoanAmount: 800000,
    averageLVR: 80,
    projections: [],
    keyMetrics: {
      totalProjectCost: 1000000,
      totalEquityRequired: 200000,
      totalCashRequired: 200000,
      totalFundingShortfall: 0,
      totalFundingSurplus: 0,
      totalWeeklyRent: 500,
      totalAnnualRent: 26000,
      averageRentalYield: 2.6,
      averageWeeklyCashFlow: 100,
      averageAnnualCashFlow: 5200,
      totalLoanAmount: 800000,
      averageLVR: 80,
      averageInterestRate: 6.0,
      totalMonthlyPayments: 4000,
      totalTaxBenefit: 1000,
      averageTaxBenefit: 1000,
      marginalTaxRate: 0.3,
    },
    performance: {
      totalROI: 150,
      annualizedROI: 0.05,
      cashOnCashReturn: 2.6,
      totalEquityAtYear10: 500000,
      totalEquityAtYear20: 1000000,
      totalEquityAtYear30: 2000000,
      equityGrowthRate: 0.07,
      breakEvenYear: 3,
      totalCumulativeCashFlow: 100000,
      averageAnnualCashFlow: 5200,
      cashFlowVolatility: 1000,
      riskScore: 45,
      riskLevel: "Medium",
      diversificationScore: 0.8,
    },
    riskProfile: {
      maxSinglePropertyValue: 1000000,
      maxSinglePropertyPercentage: 100,
      propertyCount: 1,
      stateDistribution: {},
      averagePropertyAge: 5,
      averageLVR: 80,
      maxLVR: 80,
      averageInterestRate: 6.0,
      interestRateSensitivity: 0.1,
      averageRentalYield: 2.6,
      rentalYieldVolatility: 0.05,
      capitalGrowthAssumption: 7,
    },
  })),
  calculateComparisonMetrics: jest.fn(() => ({
    totalScenarios: 2,
    bestPerformingScenario: "Scenario 1",
    worstPerformingScenario: "Scenario 2",
    averagePerformance: 125,
    topPerformers: {
      totalROI: ["Scenario 1", "Scenario 2"],
      cashFlow: ["Scenario 1", "Scenario 2"],
      riskAdjusted: ["Scenario 1", "Scenario 2"],
    },
    riskDistribution: { low: 0, medium: 2, high: 0 },
    performanceSpread: {
      min: 100,
      max: 150,
      median: 125,
      standardDeviation: 25,
    },
  })),
  generateComparisonChartData: jest.fn(() => ({
    labels: ["Scenario 1", "Scenario 2"],
    datasets: [
      {
        label: "Total ROI",
        data: [150, 100],
        backgroundColor: ["rgba(59, 130, 246, 0.1)", "rgba(16, 185, 129, 0.1)"],
        borderColor: ["rgba(59, 130, 246, 1)", "rgba(16, 185, 129, 1)"],
      },
    ],
  })),
  generateComparisonTableData: jest.fn(() => [
    {
      metric: "Total ROI",
      category: "Performance",
      scenarios: { "Scenario 1": 150, "Scenario 2": 100 },
      bestScenario: "Scenario 1",
      worstScenario: "Scenario 2",
      difference: 50,
    },
  ]),
}));

// Mock the formatters
jest.mock("@/utils/formatters", () => ({
  formatCurrency: (value: number) => `$${value.toLocaleString()}`,
  formatPercentage: (value: number) => `${value.toFixed(1)}%`,
}));

describe("ScenarioComparison", () => {
  const mockScenarios: ScenarioWithInstances[] = [
    {
      id: "1",
      name: "Scenario 1",
      description: "Test scenario 1",
      user_id: "user1",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      scenario_instances: [
        {
          id: "instance1",
          scenario_id: "1",
          original_instance_id: "orig1",
          instance_data: {},
          scenario_name: "Test Instance 1",
          overrides: {},
          status: "draft",
          last_synced_at: null,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          is_modified: false,
          has_conflicts: false,
          last_modified_at: "2024-01-01T00:00:00Z",
          instance_data_parsed: {
            id: "instance1",
            name: "Test Instance 1",
            status: "draft",
            property_method: "buy",
            funding_method: "loan",
            investors: [],
            ownership_allocations: [],
            is_construction_project: false,
            purchase_price: 1000000,
            weekly_rent: 500,
            rental_growth_rate: 5,
            vacancy_rate: 2,
            construction_year: 2020,
            building_value: 800000,
            plant_equipment_value: 50000,
            land_value: 150000,
            construction_value: 0,
            construction_period: 0,
            construction_interest_rate: 7,
            construction_progress_payments: [],
            deposit: 200000,
            loan_amount: 800000,
            interest_rate: 6,
            loan_term: 30,
            lvr: 80,
            main_loan_type: "pi",
            io_term_years: 0,
            use_equity_funding: false,
            primary_property_value: 0,
            existing_debt: 0,
            max_lvr: 80,
            equity_loan_type: "pi",
            equity_loan_io_term_years: 0,
            equity_loan_interest_rate: 7.2,
            equity_loan_term: 30,
            deposit_amount: 200000,
            minimum_deposit_required: 200000,
            holding_cost_funding: "cash",
            holding_cost_cash_percentage: 100,
            capitalize_construction_costs: false,
            construction_equity_repayment_type: "pi",
            land_holding_interest: 0,
            construction_holding_interest: 0,
            total_holding_costs: 0,
            stamp_duty: 50000,
            legal_fees: 2000,
            inspection_fees: 500,
            council_fees: 1000,
            architect_fees: 0,
            site_costs: 0,
            property_management: 7,
            council_rates: 2000,
            insurance: 1500,
            repairs: 2000,
            depreciation_method: "prime-cost",
            is_new_property: true,
            property_state: "VIC",
            total_project_cost: 1000000,
            equity_loan_amount: 0,
            available_equity: 0,
            minimum_cash_required: 200000,
            actual_cash_deposit: 200000,
            funding_shortfall: 0,
            funding_surplus: 0,
            projections: [],
            assumptions: {},
            weekly_cashflow_year1: 100,
            tax_savings_year1: 1000,
            tax_savings_total: 30000,
            net_equity_at_year_to: 500000,
            roi_at_year_to: 150,
            analysis_year_to: 30,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
        },
      ],
    },
    {
      id: "2",
      name: "Scenario 2",
      description: "Test scenario 2",
      user_id: "user1",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      scenario_instances: [],
    },
  ];

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders comparison interface", () => {
    render(
      <ScenarioComparison scenarios={mockScenarios} onClose={mockOnClose} />
    );

    expect(screen.getByText("Scenario Comparison")).toBeInTheDocument();
    expect(screen.getByText("Select Scenarios to Compare")).toBeInTheDocument();
  });

  it("shows scenario selection checkboxes", () => {
    render(
      <ScenarioComparison scenarios={mockScenarios} onClose={mockOnClose} />
    );

    expect(screen.getByText("Scenario 1")).toBeInTheDocument();
    expect(screen.getByText("Scenario 2")).toBeInTheDocument();
    expect(screen.getByText("Select All (2 scenarios)")).toBeInTheDocument();
  });

  it("allows selecting scenarios for comparison", () => {
    render(
      <ScenarioComparison scenarios={mockScenarios} onClose={mockOnClose} />
    );

    const scenario1Checkbox = screen.getByLabelText("Scenario 1");
    const scenario2Checkbox = screen.getByLabelText("Scenario 2");

    fireEvent.click(scenario1Checkbox);
    fireEvent.click(scenario2Checkbox);

    expect(scenario1Checkbox).toBeChecked();
    expect(scenario2Checkbox).toBeChecked();
  });

  it("shows comparison results when scenarios are selected", () => {
    render(
      <ScenarioComparison scenarios={mockScenarios} onClose={mockOnClose} />
    );

    // Select scenarios
    const scenario1Checkbox = screen.getByLabelText("Scenario 1");
    const scenario2Checkbox = screen.getByLabelText("Scenario 2");

    fireEvent.click(scenario1Checkbox);
    fireEvent.click(scenario2Checkbox);

    // Should show comparison tabs
    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(screen.getByText("Table")).toBeInTheDocument();
    expect(screen.getByText("Charts")).toBeInTheDocument();
    expect(screen.getByText("Analysis")).toBeInTheDocument();
  });

  it("shows empty state when no scenarios are selected", () => {
    render(
      <ScenarioComparison scenarios={mockScenarios} onClose={mockOnClose} />
    );

    expect(screen.getByText("Select Scenarios to Compare")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Choose 2 or more scenarios from the list above to start comparing their performance"
      )
    ).toBeInTheDocument();
  });

  it("calls onClose when back button is clicked", () => {
    render(
      <ScenarioComparison scenarios={mockScenarios} onClose={mockOnClose} />
    );

    const backButton = screen.getByText("Back to Scenarios");
    fireEvent.click(backButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
