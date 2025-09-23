// Types for scenario comparison functionality
import { ScenarioWithInstances, YearProjection } from "./scenarios";

export interface ScenarioComparisonData {
  scenarioId: string;
  scenarioName: string;
  instanceCount: number;
  totalValue: number;
  totalWeeklyRent: number;
  totalAnnualRent: number;
  averageRentalYield: number;
  totalLoanAmount: number;
  averageLVR: number;
  projections: YearProjection[];
  keyMetrics: ScenarioKeyMetrics;
  performance: ScenarioPerformance;
  riskProfile: ScenarioRiskProfile;
}

export interface ScenarioKeyMetrics {
  // Financial metrics
  totalProjectCost: number;
  totalEquityRequired: number;
  totalCashRequired: number;
  totalFundingShortfall: number;
  totalFundingSurplus: number;

  // Rental metrics
  totalWeeklyRent: number;
  totalAnnualRent: number;
  averageRentalYield: number;
  averageWeeklyCashFlow: number;
  averageAnnualCashFlow: number;

  // Loan metrics
  totalLoanAmount: number;
  averageLVR: number;
  averageInterestRate: number;
  totalMonthlyPayments: number;

  // Tax metrics
  totalTaxBenefit: number;
  averageTaxBenefit: number;
  marginalTaxRate: number;
}

export interface ScenarioPerformance {
  // ROI metrics
  totalROI: number;
  annualizedROI: number;
  cashOnCashReturn: number;

  // Equity metrics
  totalEquityAtYear10: number;
  totalEquityAtYear20: number;
  totalEquityAtYear30: number;
  equityGrowthRate: number;

  // Cash flow metrics
  breakEvenYear: number;
  totalCumulativeCashFlow: number;
  averageAnnualCashFlow: number;
  cashFlowVolatility: number;

  // Risk metrics
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High";
  diversificationScore: number;
}

export interface ScenarioRiskProfile {
  // Concentration risk
  maxSinglePropertyValue: number;
  maxSinglePropertyPercentage: number;
  propertyCount: number;

  // Geographic risk
  stateDistribution: Record<string, number>;
  averagePropertyAge: number;

  // Financial risk
  averageLVR: number;
  maxLVR: number;
  averageInterestRate: number;
  interestRateSensitivity: number;

  // Market risk
  averageRentalYield: number;
  rentalYieldVolatility: number;
  capitalGrowthAssumption: number;
}

export interface ComparisonMetrics {
  // Comparison summary
  totalScenarios: number;
  bestPerformingScenario: string;
  worstPerformingScenario: string;
  averagePerformance: number;

  // Key differentiators
  topPerformers: {
    totalROI: string[];
    cashFlow: string[];
    riskAdjusted: string[];
  };

  // Risk analysis
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };

  // Performance spread
  performanceSpread: {
    min: number;
    max: number;
    median: number;
    standardDeviation: number;
  };
}

export interface ComparisonFilters {
  scenarios: string[];
  metrics: string[];
  timeHorizon: number;
  sortBy: keyof ScenarioKeyMetrics | keyof ScenarioPerformance;
  sortOrder: "asc" | "desc";
}

export interface ComparisonChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];
}

export interface ComparisonTableRow {
  metric: string;
  category: string;
  scenarios: Record<string, number | string>;
  bestScenario?: string;
  worstScenario?: string;
  difference?: number;
}
