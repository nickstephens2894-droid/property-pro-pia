import { ScenarioWithInstances, YearProjection } from "@/types/scenarios";
import {
  ScenarioComparisonData,
  ScenarioKeyMetrics,
  ScenarioPerformance,
  ScenarioRiskProfile,
  ComparisonMetrics,
  ComparisonChartData,
  ComparisonTableRow,
} from "@/types/scenarioComparison";

// Calculate comprehensive comparison data for a scenario
export const calculateScenarioComparisonData = (
  scenario: ScenarioWithInstances
): ScenarioComparisonData => {
  const instances = scenario.scenario_instances || [];

  // Calculate aggregated projections
  const projections = calculateAggregatedProjections(instances);

  // Calculate key metrics
  const keyMetrics = calculateKeyMetrics(instances, projections);

  // Calculate performance metrics
  const performance = calculatePerformanceMetrics(projections, keyMetrics);

  // Calculate risk profile
  const riskProfile = calculateRiskProfile(instances, projections);

  return {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    instanceCount: instances.length,
    totalValue: keyMetrics.totalProjectCost,
    totalWeeklyRent: keyMetrics.totalWeeklyRent,
    totalAnnualRent: keyMetrics.totalAnnualRent,
    averageRentalYield: keyMetrics.averageRentalYield,
    totalLoanAmount: keyMetrics.totalLoanAmount,
    averageLVR: keyMetrics.averageLVR,
    projections,
    keyMetrics,
    performance,
    riskProfile,
  };
};

// Calculate aggregated projections across all instances
const calculateAggregatedProjections = (instances: any[]): YearProjection[] => {
  if (instances.length === 0) return [];

  const years: YearProjection[] = [];

  // Calculate projections for each instance and aggregate
  instances.forEach((scenarioInstance) => {
    const data = scenarioInstance.instance_data_parsed;

    // Calculate basic metrics for this instance
    const weeklyRent = data.weekly_rent || 0;
    const annualRent = weeklyRent * 52;
    const purchasePrice = data.purchase_price || 0;
    const loanAmount = data.loan_amount || 0;
    const interestRate = data.interest_rate || 6;
    const rentalGrowthRate = data.rental_growth_rate || 5;
    const capitalGrowthRate = 7; // Default 7% capital growth
    const vacancyRate = data.vacancy_rate || 5;
    const propertyManagementRate = data.property_management || 7;
    const councilRates = data.council_rates || 0;
    const insurance = data.insurance || 0;
    const repairs = data.repairs || 0;
    const buildingValue = data.building_value || 0;
    const plantEquipmentValue = data.plant_equipment_value || 0;

    // Calculate instance-specific projections
    let mainLoanBalance = loanAmount;
    let equityLoanBalance = 0;

    for (let year = 1; year <= 30; year++) {
      // Rental income with growth and vacancy
      const rentalGrowth = rentalGrowthRate / 100;
      const vacancy = vacancyRate / 100;
      const grossRentalIncome =
        annualRent * Math.pow(1 + rentalGrowth, year - 1);
      const rentalIncome = grossRentalIncome * (1 - vacancy);

      // Property value with capital growth
      const capitalGrowth = capitalGrowthRate / 100;
      const propertyValue =
        purchasePrice * Math.pow(1 + capitalGrowth, year - 1);

      // Calculate loan payments
      const mainInterestYear = (mainLoanBalance * interestRate) / 100;
      const equityInterestYear = (equityLoanBalance * 7.2) / 100;
      const totalInterest = mainInterestYear + equityInterestYear;

      // Operating expenses
      const pmRate = propertyManagementRate / 100;
      const propertyManagement = rentalIncome * pmRate;
      const otherExpenses =
        propertyManagement + councilRates + insurance + repairs;

      // Depreciation
      const buildingDepreciation = buildingValue * 0.025;
      const fixturesDepreciation = plantEquipmentValue * 0.15;
      const depreciation = buildingDepreciation + fixturesDepreciation;

      // Tax calculations
      const taxableIncome =
        rentalIncome - totalInterest - otherExpenses - depreciation;
      const taxBenefit = -taxableIncome * 0.3; // Simplified 30% tax rate

      // Cash flow calculations
      const afterTaxCashFlow =
        rentalIncome - otherExpenses - totalInterest + taxBenefit;

      // Property equity
      const propertyEquity =
        propertyValue - mainLoanBalance - equityLoanBalance;

      // Update loan balances (simplified)
      if (year === 1) {
        mainLoanBalance = Math.max(0, mainLoanBalance - loanAmount * 0.05);
      }

      // Find or create year projection
      let yearProjection = years.find((p) => p.year === year);
      if (!yearProjection) {
        yearProjection = {
          year,
          rentalIncome: 0,
          propertyValue: 0,
          mainLoanBalance: 0,
          equityLoanBalance: 0,
          totalInterest: 0,
          mainLoanPayment: 0,
          equityLoanPayment: 0,
          mainInterestYear: 0,
          equityInterestYear: 0,
          mainLoanIOStatus: "IO" as "IO" | "P&I",
          equityLoanIOStatus: "IO" as "IO" | "P&I",
          otherExpenses: 0,
          depreciation: 0,
          buildingDepreciation: 0,
          fixturesDepreciation: 0,
          taxableIncome: 0,
          taxBenefit: 0,
          afterTaxCashFlow: 0,
          cumulativeCashFlow: 0,
          propertyEquity: 0,
          totalReturn: 0,
        };
        years.push(yearProjection);
      }

      // Aggregate values
      yearProjection.rentalIncome += rentalIncome;
      yearProjection.propertyValue += propertyValue;
      yearProjection.mainLoanBalance += mainLoanBalance;
      yearProjection.equityLoanBalance += equityLoanBalance;
      yearProjection.totalInterest += totalInterest;
      yearProjection.mainInterestYear += mainInterestYear;
      yearProjection.equityInterestYear += equityInterestYear;
      yearProjection.otherExpenses += otherExpenses;
      yearProjection.depreciation += depreciation;
      yearProjection.buildingDepreciation += buildingDepreciation;
      yearProjection.fixturesDepreciation += fixturesDepreciation;
      yearProjection.taxableIncome += taxableIncome;
      yearProjection.taxBenefit += taxBenefit;
      yearProjection.afterTaxCashFlow += afterTaxCashFlow;
      yearProjection.propertyEquity += propertyEquity;
      yearProjection.totalReturn += afterTaxCashFlow;
    }
  });

  // Update cumulative cash flow
  let cumulativeCashFlow = 0;
  years.forEach((projection) => {
    cumulativeCashFlow += projection.afterTaxCashFlow;
    projection.cumulativeCashFlow = cumulativeCashFlow;
  });

  return years;
};

// Calculate key financial metrics
const calculateKeyMetrics = (
  instances: any[],
  projections: YearProjection[]
): ScenarioKeyMetrics => {
  const totalProjectCost = instances.reduce(
    (sum, inst) => sum + (inst.instance_data_parsed.purchase_price || 0),
    0
  );

  const totalLoanAmount = instances.reduce(
    (sum, inst) => sum + (inst.instance_data_parsed.loan_amount || 0),
    0
  );

  const totalWeeklyRent = instances.reduce(
    (sum, inst) => sum + (inst.instance_data_parsed.weekly_rent || 0),
    0
  );

  const totalAnnualRent = totalWeeklyRent * 52;
  const averageRentalYield =
    totalProjectCost > 0 ? (totalAnnualRent / totalProjectCost) * 100 : 0;

  const year1Data = projections.find((p) => p.year === 1);
  const averageWeeklyCashFlow = year1Data ? year1Data.afterTaxCashFlow / 52 : 0;
  const averageAnnualCashFlow = year1Data ? year1Data.afterTaxCashFlow : 0;

  const averageLVR =
    instances.length > 0
      ? instances.reduce(
          (sum, inst) => sum + (inst.instance_data_parsed.lvr || 0),
          0
        ) / instances.length
      : 0;

  const averageInterestRate =
    instances.length > 0
      ? instances.reduce(
          (sum, inst) => sum + (inst.instance_data_parsed.interest_rate || 0),
          0
        ) / instances.length
      : 0;

  const totalMonthlyPayments = instances.reduce((sum, inst) => {
    const loanAmount = inst.instance_data_parsed.loan_amount || 0;
    const interestRate = inst.instance_data_parsed.interest_rate || 0;
    return sum + (loanAmount * interestRate) / 100 / 12;
  }, 0);

  const totalTaxBenefit = year1Data ? year1Data.taxBenefit : 0;
  const averageTaxBenefit =
    instances.length > 0 ? totalTaxBenefit / instances.length : 0;

  return {
    totalProjectCost,
    totalEquityRequired: totalProjectCost - totalLoanAmount,
    totalCashRequired: totalProjectCost - totalLoanAmount,
    totalFundingShortfall: 0, // Would need more complex calculation
    totalFundingSurplus: 0, // Would need more complex calculation
    totalWeeklyRent,
    totalAnnualRent,
    averageRentalYield,
    averageWeeklyCashFlow,
    averageAnnualCashFlow,
    totalLoanAmount,
    averageLVR,
    averageInterestRate,
    totalMonthlyPayments,
    totalTaxBenefit,
    averageTaxBenefit,
    marginalTaxRate: 0.3, // Simplified
  };
};

// Calculate performance metrics
const calculatePerformanceMetrics = (
  projections: YearProjection[],
  keyMetrics: ScenarioKeyMetrics
): ScenarioPerformance => {
  const year1Data = projections.find((p) => p.year === 1);
  const year10Data = projections.find((p) => p.year === 10);
  const year20Data = projections.find((p) => p.year === 20);
  const year30Data = projections.find((p) => p.year === 30);

  const totalROI =
    year30Data && year1Data
      ? (year30Data.propertyEquity / year1Data.propertyValue) * 100
      : 0;

  const annualizedROI =
    year30Data && year1Data
      ? Math.pow(year30Data.propertyEquity / year1Data.propertyValue, 1 / 30) -
        1
      : 0;

  const cashOnCashReturn =
    year1Data && keyMetrics.totalCashRequired > 0
      ? (year1Data.afterTaxCashFlow / keyMetrics.totalCashRequired) * 100
      : 0;

  const breakEvenYear =
    projections.findIndex((p) => p.cumulativeCashFlow > 0) + 1;
  const totalCumulativeCashFlow =
    projections[projections.length - 1]?.cumulativeCashFlow || 0;
  const averageAnnualCashFlow =
    projections.reduce((sum, p) => sum + p.afterTaxCashFlow, 0) /
    projections.length;

  // Calculate cash flow volatility (standard deviation)
  const cashFlowValues = projections.map((p) => p.afterTaxCashFlow);
  const mean =
    cashFlowValues.reduce((sum, val) => sum + val, 0) / cashFlowValues.length;
  const variance =
    cashFlowValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    cashFlowValues.length;
  const cashFlowVolatility = Math.sqrt(variance);

  // Calculate risk score (simplified)
  const riskScore = Math.min(
    100,
    Math.max(
      0,
      keyMetrics.averageLVR * 0.3 +
        cashFlowVolatility * 0.2 +
        breakEvenYear * 0.3 +
        keyMetrics.averageInterestRate * 0.2
    )
  );

  const riskLevel = riskScore < 30 ? "Low" : riskScore < 70 ? "Medium" : "High";

  return {
    totalROI,
    annualizedROI,
    cashOnCashReturn,
    totalEquityAtYear10: year10Data?.propertyEquity || 0,
    totalEquityAtYear20: year20Data?.propertyEquity || 0,
    totalEquityAtYear30: year30Data?.propertyEquity || 0,
    equityGrowthRate:
      year30Data && year1Data
        ? Math.pow(
            year30Data.propertyEquity / year1Data.propertyValue,
            1 / 30
          ) - 1
        : 0,
    breakEvenYear,
    totalCumulativeCashFlow,
    averageAnnualCashFlow,
    cashFlowVolatility,
    riskScore,
    riskLevel,
    diversificationScore: 0, // Would need more complex calculation
  };
};

// Calculate risk profile
const calculateRiskProfile = (
  instances: any[],
  projections: YearProjection[]
): ScenarioRiskProfile => {
  const propertyValues = instances.map(
    (inst) => inst.instance_data_parsed.purchase_price || 0
  );
  const totalValue = propertyValues.reduce((sum, val) => sum + val, 0);

  const maxSinglePropertyValue = Math.max(...propertyValues);
  const maxSinglePropertyPercentage =
    totalValue > 0 ? (maxSinglePropertyValue / totalValue) * 100 : 0;

  const lvrs = instances.map((inst) => inst.instance_data_parsed.lvr || 0);
  const averageLVR = lvrs.reduce((sum, lvr) => sum + lvr, 0) / lvrs.length;
  const maxLVR = Math.max(...lvrs);

  const interestRates = instances.map(
    (inst) => inst.instance_data_parsed.interest_rate || 0
  );
  const averageInterestRate =
    interestRates.reduce((sum, rate) => sum + rate, 0) / interestRates.length;

  const rentalYields = instances.map((inst) => {
    const weeklyRent = inst.instance_data_parsed.weekly_rent || 0;
    const purchasePrice = inst.instance_data_parsed.purchase_price || 0;
    return purchasePrice > 0 ? ((weeklyRent * 52) / purchasePrice) * 100 : 0;
  });
  const averageRentalYield =
    rentalYields.reduce((sum, rentalYield) => sum + rentalYield, 0) /
    rentalYields.length;

  return {
    maxSinglePropertyValue,
    maxSinglePropertyPercentage,
    propertyCount: instances.length,
    stateDistribution: {}, // Would need state data
    averagePropertyAge: 0, // Would need construction year data
    averageLVR,
    maxLVR,
    averageInterestRate,
    interestRateSensitivity: 0, // Would need more complex calculation
    averageRentalYield,
    rentalYieldVolatility: 0, // Would need more complex calculation
    capitalGrowthAssumption: 7, // Default assumption
  };
};

// Calculate comparison metrics across multiple scenarios
export const calculateComparisonMetrics = (
  comparisonData: ScenarioComparisonData[]
): ComparisonMetrics => {
  if (comparisonData.length === 0) {
    return {
      totalScenarios: 0,
      bestPerformingScenario: "",
      worstPerformingScenario: "",
      averagePerformance: 0,
      topPerformers: { totalROI: [], cashFlow: [], riskAdjusted: [] },
      riskDistribution: { low: 0, medium: 0, high: 0 },
      performanceSpread: { min: 0, max: 0, median: 0, standardDeviation: 0 },
    };
  }

  // Sort by total ROI
  const sortedByROI = [...comparisonData].sort(
    (a, b) => b.performance.totalROI - a.performance.totalROI
  );

  const bestPerformingScenario = sortedByROI[0]?.scenarioName || "";
  const worstPerformingScenario =
    sortedByROI[sortedByROI.length - 1]?.scenarioName || "";

  const averagePerformance =
    comparisonData.reduce((sum, data) => sum + data.performance.totalROI, 0) /
    comparisonData.length;

  // Calculate risk distribution
  const riskDistribution = comparisonData.reduce(
    (acc, data) => {
      acc[data.performance.riskLevel.toLowerCase() as keyof typeof acc]++;
      return acc;
    },
    { low: 0, medium: 0, high: 0 }
  );

  // Calculate performance spread
  const roiValues = comparisonData.map((data) => data.performance.totalROI);
  const min = Math.min(...roiValues);
  const max = Math.max(...roiValues);
  const median = roiValues.sort((a, b) => a - b)[
    Math.floor(roiValues.length / 2)
  ];
  const mean = roiValues.reduce((sum, val) => sum + val, 0) / roiValues.length;
  const standardDeviation = Math.sqrt(
    roiValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      roiValues.length
  );

  return {
    totalScenarios: comparisonData.length,
    bestPerformingScenario,
    worstPerformingScenario,
    averagePerformance,
    topPerformers: {
      totalROI: sortedByROI.slice(0, 3).map((data) => data.scenarioName),
      cashFlow: [...comparisonData]
        .sort(
          (a, b) =>
            b.performance.averageAnnualCashFlow -
            a.performance.averageAnnualCashFlow
        )
        .slice(0, 3)
        .map((data) => data.scenarioName),
      riskAdjusted: [...comparisonData]
        .sort(
          (a, b) =>
            b.performance.totalROI / b.performance.riskScore -
            a.performance.totalROI / a.performance.riskScore
        )
        .slice(0, 3)
        .map((data) => data.scenarioName),
    },
    riskDistribution,
    performanceSpread: { min, max, median, standardDeviation },
  };
};

// Generate chart data for comparison
export const generateComparisonChartData = (
  comparisonData: ScenarioComparisonData[],
  metric: keyof ScenarioKeyMetrics | keyof ScenarioPerformance
): ComparisonChartData => {
  const labels = comparisonData.map((data) => data.scenarioName);
  const data = comparisonData.map((data) => {
    if (metric in data.keyMetrics) {
      return data.keyMetrics[metric as keyof ScenarioKeyMetrics] as number;
    } else {
      return data.performance[metric as keyof ScenarioPerformance] as number;
    }
  });

  return {
    labels,
    datasets: [
      {
        label: metric
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),
        data,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgba(59, 130, 246, 1)",
      },
    ],
  };
};

// Generate comparison table data
export const generateComparisonTableData = (
  comparisonData: ScenarioComparisonData[]
): ComparisonTableRow[] => {
  const metrics = [
    {
      key: "totalProjectCost",
      label: "Total Project Cost",
      category: "Financial",
    },
    { key: "totalAnnualRent", label: "Total Annual Rent", category: "Rental" },
    {
      key: "averageRentalYield",
      label: "Average Rental Yield (%)",
      category: "Rental",
    },
    {
      key: "totalLoanAmount",
      label: "Total Loan Amount",
      category: "Financial",
    },
    { key: "averageLVR", label: "Average LVR (%)", category: "Financial" },
    { key: "totalROI", label: "Total ROI (%)", category: "Performance" },
    {
      key: "cashOnCashReturn",
      label: "Cash on Cash Return (%)",
      category: "Performance",
    },
    { key: "breakEvenYear", label: "Break Even Year", category: "Performance" },
    { key: "riskScore", label: "Risk Score", category: "Risk" },
  ];

  return metrics.map((metric) => {
    const scenarioValues: Record<string, number | string> = {};
    let bestValue = -Infinity;
    let worstValue = Infinity;
    let bestScenario = "";
    let worstScenario = "";

    comparisonData.forEach((data) => {
      let value: number;
      if (metric.key in data.keyMetrics) {
        value = data.keyMetrics[
          metric.key as keyof ScenarioKeyMetrics
        ] as number;
      } else {
        value = data.performance[
          metric.key as keyof ScenarioPerformance
        ] as number;
      }

      scenarioValues[data.scenarioName] = value;

      if (value > bestValue) {
        bestValue = value;
        bestScenario = data.scenarioName;
      }
      if (value < worstValue) {
        worstValue = value;
        worstScenario = data.scenarioName;
      }
    });

    return {
      metric: metric.label,
      category: metric.category,
      scenarios: scenarioValues,
      bestScenario,
      worstScenario,
      difference: bestValue - worstValue,
    };
  });
};
