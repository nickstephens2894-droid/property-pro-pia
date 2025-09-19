import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Home,
  AlertCircle,
} from "lucide-react";
import { ScenarioWithInstances, ScenarioProjections } from "@/types/scenarios";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ScenarioProjectionsPanelProps {
  scenario: ScenarioWithInstances;
  onRefresh: () => void;
}

export const ScenarioProjectionsPanel: React.FC<
  ScenarioProjectionsPanelProps
> = ({ scenario, onRefresh }) => {
  const [projections, setProjections] = useState<ScenarioProjections | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate basic aggregated metrics
  const calculateBasicMetrics = () => {
    if (scenario.scenario_instances.length === 0) {
      return {
        totalInstances: 0,
        totalPurchasePrice: 0,
        totalWeeklyRent: 0,
        totalLoanAmount: 0,
        averageLVR: 0,
        averageRentalYield: 0,
      };
    }

    const totals = scenario.scenario_instances.reduce(
      (acc, instance) => {
        const data = instance.instance_data_parsed;
        return {
          totalPurchasePrice:
            acc.totalPurchasePrice + (data.purchase_price || 0),
          totalWeeklyRent: acc.totalWeeklyRent + (data.weekly_rent || 0),
          totalLoanAmount: acc.totalLoanAmount + (data.loan_amount || 0),
          totalLVR: acc.totalLVR + (data.lvr || 0),
          count: acc.count + 1,
        };
      },
      {
        totalPurchasePrice: 0,
        totalWeeklyRent: 0,
        totalLoanAmount: 0,
        totalLVR: 0,
        count: 0,
      }
    );

    const averageLVR = totals.count > 0 ? totals.totalLVR / totals.count : 0;
    const annualRent = totals.totalWeeklyRent * 52;
    const averageRentalYield =
      totals.totalPurchasePrice > 0
        ? (annualRent / totals.totalPurchasePrice) * 100
        : 0;

    return {
      totalInstances: totals.count,
      totalPurchasePrice: totals.totalPurchasePrice,
      totalWeeklyRent: totals.totalWeeklyRent,
      totalLoanAmount: totals.totalLoanAmount,
      averageLVR,
      averageRentalYield,
    };
  };

  const basicMetrics = calculateBasicMetrics();

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call - in real implementation, this would call the context method
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For now, just refresh the parent
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
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Scenario Projections
              </CardTitle>
              <CardDescription>
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
      </Card>

      {/* Basic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Value</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {formatCurrency(basicMetrics.totalPurchasePrice)}
            </div>
            <div className="text-xs text-muted-foreground">
              {basicMetrics.totalInstances} propert
              {basicMetrics.totalInstances !== 1 ? "ies" : "y"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Weekly Rent</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {formatCurrency(basicMetrics.totalWeeklyRent)}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatCurrency(basicMetrics.totalWeeklyRent * 52)} annually
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Rental Yield</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {formatPercentage(basicMetrics.averageRentalYield)}
            </div>
            <div className="text-xs text-muted-foreground">
              Average across portfolio
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financing Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total Loan Amount
              </span>
              <span className="font-medium">
                {formatCurrency(basicMetrics.totalLoanAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average LVR</span>
              <span className="font-medium">
                {formatPercentage(basicMetrics.averageLVR)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total Equity Required
              </span>
              <span className="font-medium">
                {formatCurrency(
                  basicMetrics.totalPurchasePrice - basicMetrics.totalLoanAmount
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Portfolio Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Number of Properties
              </span>
              <span className="font-medium">{basicMetrics.totalInstances}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Average Property Value
              </span>
              <span className="font-medium">
                {formatCurrency(
                  basicMetrics.totalPurchasePrice / basicMetrics.totalInstances
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Average Weekly Rent
              </span>
              <span className="font-medium">
                {formatCurrency(
                  basicMetrics.totalWeeklyRent / basicMetrics.totalInstances
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projection Charts Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Projection Analysis</CardTitle>
          <CardDescription>
            Detailed year-by-year projections and cash flow analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Projection Charts</h3>
            <p className="text-muted-foreground mb-4">
              Detailed projection charts and analysis will be available here
            </p>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              Coming Soon
            </Badge>
          </div>
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
