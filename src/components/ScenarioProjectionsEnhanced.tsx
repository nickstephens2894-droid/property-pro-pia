import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  BarChart3,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Home,
  AlertCircle,
  Calculator,
  PiggyBank,
  Building2,
  Users,
  PieChart,
  LineChart,
} from "lucide-react";
import { ScenarioWithInstances, ScenarioProjections } from "@/types/scenarios";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PropertySummaryDashboard } from "./PropertySummaryDashboard";
import { ProjectionsTable } from "./ProjectionsTable";
import { InvestmentResultsDetailed } from "./InvestmentResultsDetailed";
import { ScenarioProjectionCharts } from "./ScenarioProjectionCharts";

interface ScenarioProjectionsEnhancedProps {
  scenario: ScenarioWithInstances;
  onRefresh: () => void;
}

interface YearProjection {
  year: number;
  rentalIncome: number;
  propertyValue: number;
  mainLoanBalance: number;
  equityLoanBalance: number;
  totalInterest: number;
  mainLoanPayment: number;
  equityLoanPayment: number;
  mainInterestYear: number;
  equityInterestYear: number;
  mainLoanIOStatus: "IO" | "P&I";
  equityLoanIOStatus: "IO" | "P&I";
  otherExpenses: number;
  depreciation: number;
  buildingDepreciation: number;
  fixturesDepreciation: number;
  taxableIncome: number;
  taxBenefit: number;
  afterTaxCashFlow: number;
  cumulativeCashFlow: number;
  propertyEquity: number;
  totalReturn: number;
}

interface InstanceContribution {
  instanceId: string;
  instanceName: string;
  contribution: {
    totalValue: number;
    weeklyRent: number;
    loanAmount: number;
    annualRent: number;
    rentalYield: number;
    lvr: number;
    weeklyCashflow: number;
    taxSavings: number;
    propertyEquity: number;
  };
}

export const ScenarioProjectionsEnhanced: React.FC<
  ScenarioProjectionsEnhancedProps
> = ({ scenario, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [yearRange, setYearRange] = useState<[number, number]>([1, 30]);
  const [viewMode, setViewMode] = useState<"year" | "table">("table");

  // Calculate comprehensive projections for all instances
  const aggregatedProjections = useMemo(() => {
    if (scenario.scenario_instances.length === 0) return [];

    const years: YearProjection[] = [];
    const instanceContributions: InstanceContribution[] = [];

    // Calculate projections for each instance and aggregate
    scenario.scenario_instances.forEach((scenarioInstance) => {
      const data = scenarioInstance.instance_data_parsed;

      // Calculate basic metrics for this instance
      const weeklyRent = data.weekly_rent || 0;
      const annualRent = weeklyRent * 52;
      const purchasePrice = data.purchase_price || 0;
      const loanAmount = data.loan_amount || 0;
      const lvr = data.lvr || 0;
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
      let cumulativeCashFlow = 0;

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
        const equityInterestYear = (equityLoanBalance * 7.2) / 100; // Default equity rate
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
        cumulativeCashFlow += afterTaxCashFlow;

        // Property equity
        const propertyEquity =
          propertyValue - mainLoanBalance - equityLoanBalance;

        // Update loan balances (simplified)
        if (year === 1) {
          mainLoanBalance = Math.max(0, mainLoanBalance - loanAmount * 0.05); // 5% principal reduction
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

      // Calculate instance contribution
      const year1Data = years.find((p) => p.year === 1);
      instanceContributions.push({
        instanceId: scenarioInstance.id,
        instanceName:
          scenarioInstance.scenario_name ||
          `Instance ${scenarioInstance.id.slice(0, 8)}`,
        contribution: {
          totalValue: purchasePrice,
          weeklyRent: weeklyRent,
          loanAmount: loanAmount,
          annualRent: annualRent,
          rentalYield:
            purchasePrice > 0 ? (annualRent / purchasePrice) * 100 : 0,
          lvr: lvr,
          weeklyCashflow: year1Data
            ? year1Data.afterTaxCashFlow /
              scenario.scenario_instances.length /
              52
            : 0,
          taxSavings: year1Data
            ? year1Data.taxBenefit / scenario.scenario_instances.length
            : 0,
          propertyEquity: year1Data
            ? year1Data.propertyEquity / scenario.scenario_instances.length
            : 0,
        },
      });
    });

    // Update cumulative cash flow
    let cumulativeCashFlow = 0;
    years.forEach((projection) => {
      cumulativeCashFlow += projection.afterTaxCashFlow;
      projection.cumulativeCashFlow = cumulativeCashFlow;
    });

    return { projections: years, instanceContributions };
  }, [scenario.scenario_instances]);

  // Calculate investment summary for the scenario
  const investmentSummary = useMemo(() => {
    const year1Data = aggregatedProjections.projections.find(
      (p) => p.year === 1
    );
    const yearToData = aggregatedProjections.projections.find(
      (p) => p.year === yearRange[1]
    );

    if (!year1Data) {
      return {
        weeklyAfterTaxCashFlowSummary: 0,
        taxBenefitFromProjections: 0,
        taxSavingsTotal: 0,
        equityAtYearTo: 0,
        roiAtYearTo: 0,
        annualRentFromProjections: 0,
      };
    }

    const weeklyAfterTaxCashFlowSummary = year1Data.afterTaxCashFlow / 52;
    const taxBenefitFromProjections = year1Data.taxBenefit;
    const taxSavingsTotal = aggregatedProjections.projections
      .slice(0, yearRange[1])
      .reduce((sum, p) => sum + Math.max(0, p.taxBenefit), 0);
    const equityAtYearTo = yearToData?.propertyEquity ?? 0;
    const roiAtYearTo = 0; // Simplified for now

    return {
      weeklyAfterTaxCashFlowSummary,
      taxBenefitFromProjections,
      taxSavingsTotal,
      equityAtYearTo,
      roiAtYearTo,
      annualRentFromProjections: year1Data.rentalIncome,
    };
  }, [aggregatedProjections, yearRange]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onRefresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to refresh projections"
      );
    } finally {
      setLoading(false);
    }
  };

  if (scenario.scenario_instances.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Scenario Projections
          </CardTitle>
          <CardDescription>
            Aggregated projections across all instances in this scenario
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No instances in scenario
          </h3>
          <p className="text-muted-foreground">
            Add instances to this scenario to see aggregated projections
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <BarChart3 className="h-5 w-5" />
                Scenario Projections
              </CardTitle>
              <CardDescription className="text-sm">
                Aggregated projections across{" "}
                {scenario.scenario_instances.length} instance
                {scenario.scenario_instances.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Projection Period</label>
              <div className="mt-2">
                <Slider
                  value={yearRange}
                  onValueChange={(value) =>
                    setYearRange(value as [number, number])
                  }
                  min={1}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mt-2">
                  <span>Year {yearRange[0]}</span>
                  <span>Year {yearRange[1]}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Summary Dashboard */}
      <PropertySummaryDashboard
        weeklyCashflowYear1={investmentSummary.weeklyAfterTaxCashFlowSummary}
        taxSavingsYear1={investmentSummary.taxBenefitFromProjections}
        taxSavingsTotal={investmentSummary.taxSavingsTotal}
        netEquityAtYearTo={investmentSummary.equityAtYearTo}
        roiAtYearTo={investmentSummary.roiAtYearTo}
        yearTo={yearRange[1]}
      />

      {/* Instance Contributions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <PieChart className="h-5 w-5" />
            Instance Contributions
          </CardTitle>
          <CardDescription>
            How much each instance contributes to the overall scenario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aggregatedProjections.instanceContributions.map(
              (contribution, index) => (
                <div
                  key={contribution.instanceId}
                  className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <h4 className="font-medium text-sm sm:text-base truncate">
                      {contribution.instanceName}
                    </h4>
                    <Badge variant="outline" className="text-xs w-fit">
                      Instance {index + 1}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-muted-foreground">Value</span>
                      <div className="font-medium">
                        {formatCurrency(contribution.contribution.totalValue)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Weekly Rent</span>
                      <div className="font-medium">
                        {formatCurrency(contribution.contribution.weeklyRent)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Rental Yield
                      </span>
                      <div className="font-medium">
                        {formatPercentage(
                          contribution.contribution.rentalYield
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">LVR</span>
                      <div className="font-medium">
                        {formatPercentage(contribution.contribution.lvr)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Projection Charts */}
      <ScenarioProjectionCharts
        projections={aggregatedProjections.projections}
        yearRange={yearRange}
      />

      {/* Projections Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>
              Investment Analysis - Projections over{" "}
              {yearRange[1] - yearRange[0] + 1} years
            </CardTitle>
            <CardDescription>
              Aggregated financial breakdown across all scenario instances
            </CardDescription>
          </div>
          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as "year" | "table")}
          >
            <TabsList>
              <TabsTrigger value="year">Year by Year</TabsTrigger>
              <TabsTrigger value="table">Full Table</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <ProjectionsTable
            projections={aggregatedProjections.projections}
            assumptions={{} as any}
            validatedYearRange={yearRange}
            formatCurrency={formatCurrency}
            formatPercentage={formatPercentage}
            viewMode={viewMode}
          />
        </CardContent>
      </Card>

      {/* Investment Results Detailed */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Results Summary</CardTitle>
          <CardDescription>
            Comprehensive analysis of your scenario performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvestmentResultsDetailed
            projections={aggregatedProjections.projections}
            yearTo={yearRange[1]}
            initialPropertyValue={aggregatedProjections.instanceContributions.reduce(
              (sum, c) => sum + c.contribution.totalValue,
              0
            )}
            totalProjectCost={aggregatedProjections.instanceContributions.reduce(
              (sum, c) => sum + c.contribution.totalValue,
              0
            )}
            cpiRate={2.5}
            formatCurrency={formatCurrency}
            formatPercentage={formatPercentage}
          />
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Error loading projections</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="mt-2"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
