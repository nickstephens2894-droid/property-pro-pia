import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  DollarSign,
  Home,
  Users,
  BarChart3,
  PieChart,
} from "lucide-react";
import {
  ScenarioComparisonData,
  ComparisonMetrics,
} from "@/types/scenarioComparison";
import { formatCurrency, formatPercentage } from "@/utils/formatters";

interface ScenarioComparisonSummaryProps {
  comparisonData: ScenarioComparisonData[];
  comparisonMetrics: ComparisonMetrics;
}

export const ScenarioComparisonSummary: React.FC<
  ScenarioComparisonSummaryProps
> = ({ comparisonData, comparisonMetrics }) => {
  // Sort scenarios by total ROI for ranking
  const sortedScenarios = [...comparisonData].sort(
    (a, b) => b.performance.totalROI - a.performance.totalROI
  );

  const getPerformanceBadge = (rank: number, total: number) => {
    if (rank === 1) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          🥇 Best
        </Badge>
      );
    } else if (rank === 2) {
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-200">
          🥈 2nd
        </Badge>
      );
    } else if (rank === 3) {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
          🥉 3rd
        </Badge>
      );
    } else {
      return <Badge variant="outline">#{rank}</Badge>;
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Low Risk
          </Badge>
        );
      case "Medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Medium Risk
          </Badge>
        );
      case "High":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            High Risk
          </Badge>
        );
      default:
        return <Badge variant="outline">{riskLevel}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Scenarios</p>
                <p className="text-2xl font-bold">
                  {comparisonMetrics.totalScenarios}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Best Performer</p>
                <p className="text-lg font-semibold truncate">
                  {comparisonMetrics.bestPerformingScenario}
                </p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average ROI</p>
                <p className="text-2xl font-bold">
                  {formatPercentage(comparisonMetrics.averagePerformance)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Performance Spread
                </p>
                <p className="text-lg font-semibold">
                  {formatPercentage(comparisonMetrics.performanceSpread.min)} -{" "}
                  {formatPercentage(comparisonMetrics.performanceSpread.max)}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scenario Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Scenario Rankings
          </CardTitle>
          <CardDescription>
            Scenarios ranked by total ROI performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedScenarios.map((scenario, index) => (
              <div
                key={scenario.scenarioId}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getPerformanceBadge(index + 1, sortedScenarios.length)}
                    <div>
                      <h4 className="font-semibold">{scenario.scenarioName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {scenario.instanceCount} instance
                        {scenario.instanceCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {formatPercentage(scenario.performance.totalROI)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total ROI
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Project Cost</p>
                    <p className="font-medium">
                      {formatCurrency(scenario.keyMetrics.totalProjectCost)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Annual Rent</p>
                    <p className="font-medium">
                      {formatCurrency(scenario.keyMetrics.totalAnnualRent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rental Yield</p>
                    <p className="font-medium">
                      {formatPercentage(scenario.keyMetrics.averageRentalYield)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Risk Level</p>
                    <div className="mt-1">
                      {getRiskBadge(scenario.performance.riskLevel)}
                    </div>
                  </div>
                </div>

                {/* Performance Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Performance Score</span>
                    <span>{Math.round(scenario.performance.totalROI)}%</span>
                  </div>
                  <Progress
                    value={Math.min(
                      100,
                      Math.max(0, scenario.performance.totalROI)
                    )}
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Analysis
          </CardTitle>
          <CardDescription>
            Distribution of risk levels across selected scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {comparisonMetrics.riskDistribution.low}
                </div>
                <div className="text-sm text-muted-foreground">Low Risk</div>
                <Badge className="bg-green-100 text-green-800 border-green-200 mt-1">
                  {comparisonMetrics.riskDistribution.low > 0
                    ? `${Math.round(
                        (comparisonMetrics.riskDistribution.low /
                          comparisonMetrics.totalScenarios) *
                          100
                      )}%`
                    : "0%"}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {comparisonMetrics.riskDistribution.medium}
                </div>
                <div className="text-sm text-muted-foreground">Medium Risk</div>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 mt-1">
                  {comparisonMetrics.riskDistribution.medium > 0
                    ? `${Math.round(
                        (comparisonMetrics.riskDistribution.medium /
                          comparisonMetrics.totalScenarios) *
                          100
                      )}%`
                    : "0%"}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {comparisonMetrics.riskDistribution.high}
                </div>
                <div className="text-sm text-muted-foreground">High Risk</div>
                <Badge className="bg-red-100 text-red-800 border-red-200 mt-1">
                  {comparisonMetrics.riskDistribution.high > 0
                    ? `${Math.round(
                        (comparisonMetrics.riskDistribution.high /
                          comparisonMetrics.totalScenarios) *
                          100
                      )}%`
                    : "0%"}
                </Badge>
              </div>
            </div>

            {/* Risk Distribution Chart */}
            <div className="mt-6">
              <div className="flex h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className="bg-green-500 h-full"
                  style={{
                    width: `${
                      (comparisonMetrics.riskDistribution.low /
                        comparisonMetrics.totalScenarios) *
                      100
                    }%`,
                  }}
                />
                <div
                  className="bg-yellow-500 h-full"
                  style={{
                    width: `${
                      (comparisonMetrics.riskDistribution.medium /
                        comparisonMetrics.totalScenarios) *
                      100
                    }%`,
                  }}
                />
                <div
                  className="bg-red-500 h-full"
                  style={{
                    width: `${
                      (comparisonMetrics.riskDistribution.high /
                        comparisonMetrics.totalScenarios) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Performers
          </CardTitle>
          <CardDescription>
            Best performing scenarios across different metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total ROI
              </h4>
              <div className="space-y-2">
                {comparisonMetrics.topPerformers.totalROI.map(
                  (scenarioName, index) => (
                    <div key={scenarioName} className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="w-6 h-6 p-0 flex items-center justify-center text-xs"
                      >
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{scenarioName}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Cash Flow
              </h4>
              <div className="space-y-2">
                {comparisonMetrics.topPerformers.cashFlow.map(
                  (scenarioName, index) => (
                    <div key={scenarioName} className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="w-6 h-6 p-0 flex items-center justify-center text-xs"
                      >
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{scenarioName}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Risk-Adjusted
              </h4>
              <div className="space-y-2">
                {comparisonMetrics.topPerformers.riskAdjusted.map(
                  (scenarioName, index) => (
                    <div key={scenarioName} className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="w-6 h-6 p-0 flex items-center justify-center text-xs"
                      >
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{scenarioName}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Performance Statistics
          </CardTitle>
          <CardDescription>
            Statistical analysis of scenario performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatPercentage(comparisonMetrics.performanceSpread.min)}
              </div>
              <div className="text-sm text-muted-foreground">Minimum ROI</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage(comparisonMetrics.performanceSpread.max)}
              </div>
              <div className="text-sm text-muted-foreground">Maximum ROI</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatPercentage(comparisonMetrics.performanceSpread.median)}
              </div>
              <div className="text-sm text-muted-foreground">Median ROI</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatPercentage(
                  comparisonMetrics.performanceSpread.standardDeviation
                )}
              </div>
              <div className="text-sm text-muted-foreground">Std Deviation</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
