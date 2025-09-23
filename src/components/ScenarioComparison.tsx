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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  CheckCircle,
  X,
  Download,
  Filter,
  SortAsc,
  SortDesc,
  Target,
  DollarSign,
  Home,
  Users,
  PieChart,
  LineChart,
  BarChart,
  Table,
} from "lucide-react";
import { ScenarioWithInstances } from "@/types/scenarios";
import {
  ScenarioComparisonData,
  ComparisonMetrics,
  ComparisonFilters,
  ComparisonChartData,
  ComparisonTableRow,
} from "@/types/scenarioComparison";
import {
  calculateScenarioComparisonData,
  calculateComparisonMetrics,
  generateComparisonChartData,
  generateComparisonTableData,
} from "@/utils/scenarioComparisonUtils";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import { ScenarioComparisonCharts } from "./ScenarioComparisonCharts";
import { ScenarioComparisonTable } from "./ScenarioComparisonTable";
import { ScenarioComparisonSummary } from "./ScenarioComparisonSummary";

interface ScenarioComparisonProps {
  scenarios: ScenarioWithInstances[];
  onClose: () => void;
}

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  scenarios,
  onClose,
}) => {
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [filters, setFilters] = useState<ComparisonFilters>({
    scenarios: [],
    metrics: [
      "totalROI",
      "totalProjectCost",
      "averageRentalYield",
      "riskScore",
    ],
    timeHorizon: 30,
    sortBy: "totalROI",
    sortOrder: "desc",
  });
  const [activeTab, setActiveTab] = useState("summary");

  // Calculate comparison data for selected scenarios
  const comparisonData = useMemo(() => {
    const selectedScenariosData = scenarios.filter((s) =>
      selectedScenarios.includes(s.id)
    );
    console.log("Selected scenarios data:", selectedScenariosData);
    try {
      const result = selectedScenariosData.map(calculateScenarioComparisonData);
      console.log("Generated comparison data:", result);
      return result;
    } catch (error) {
      console.error("Error generating comparison data:", error);
      return [];
    }
  }, [scenarios, selectedScenarios]);

  // Calculate comparison metrics
  const comparisonMetrics = useMemo(() => {
    return calculateComparisonMetrics(comparisonData);
  }, [comparisonData]);

  // Generate chart data
  const chartData = useMemo(() => {
    if (comparisonData.length === 0) return null;
    try {
      const result = generateComparisonChartData(
        comparisonData,
        filters.sortBy as any
      );
      console.log("Generated chart data:", result);
      return result;
    } catch (error) {
      console.error("Error generating chart data:", error);
      return null;
    }
  }, [comparisonData, filters.sortBy]);

  // Generate table data
  const tableData = useMemo(() => {
    return generateComparisonTableData(comparisonData);
  }, [comparisonData]);

  // Initialize with first 3 scenarios if none selected
  useEffect(() => {
    if (selectedScenarios.length === 0 && scenarios.length > 0) {
      const initialSelection = scenarios.slice(
        0,
        Math.min(3, scenarios.length)
      );
      setSelectedScenarios(initialSelection.map((s) => s.id));
    }
  }, [scenarios, selectedScenarios.length]);

  const handleScenarioToggle = (scenarioId: string) => {
    setSelectedScenarios((prev) =>
      prev.includes(scenarioId)
        ? prev.filter((id) => id !== scenarioId)
        : [...prev, scenarioId]
    );
  };

  const handleSelectAll = () => {
    if (selectedScenarios.length === scenarios.length) {
      setSelectedScenarios([]);
    } else {
      setSelectedScenarios(scenarios.map((s) => s.id));
    }
  };

  const handleSortChange = (sortBy: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortBy as any,
      sortOrder:
        prev.sortBy === sortBy && prev.sortOrder === "desc" ? "asc" : "desc",
    }));
  };

  const canCompare = selectedScenarios.length >= 2;
  const allSelected = selectedScenarios.length === scenarios.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Back to Scenarios
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BarChart3 className="h-8 w-8" />
                Scenario Comparison
              </h1>
              <p className="text-muted-foreground">
                Compare multiple scenarios side-by-side to make informed
                decisions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                /* Export functionality */
              }}
              disabled={!canCompare}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Scenario Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Select Scenarios to Compare
            </CardTitle>
            <CardDescription>
              Choose 2 or more scenarios to compare their performance and
              metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Select All Toggle */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="font-medium">
                  Select All ({scenarios.length} scenarios)
                </Label>
              </div>

              {/* Scenario List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedScenarios.includes(scenario.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handleScenarioToggle(scenario.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedScenarios.includes(scenario.id)}
                        onChange={() => {}} // Handled by parent click
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {scenario.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {scenario.scenario_instances.length} instance
                          {scenario.scenario_instances.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selection Summary */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {selectedScenarios.length} scenario
                  {selectedScenarios.length !== 1 ? "s" : ""} selected
                </div>
                {!canCompare && (
                  <div className="text-sm text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    Select at least 2 scenarios to compare
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Controls */}
        {canCompare && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Comparison Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="sort-by">Sort By</Label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={handleSortChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="totalROI">Total ROI</SelectItem>
                      <SelectItem value="totalProjectCost">
                        Project Cost
                      </SelectItem>
                      <SelectItem value="averageRentalYield">
                        Rental Yield
                      </SelectItem>
                      <SelectItem value="riskScore">Risk Score</SelectItem>
                      <SelectItem value="cashOnCashReturn">
                        Cash on Cash Return
                      </SelectItem>
                      <SelectItem value="breakEvenYear">
                        Break Even Year
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="time-horizon">Time Horizon</Label>
                  <Select
                    value={filters.timeHorizon.toString()}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        timeHorizon: parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 Years</SelectItem>
                      <SelectItem value="20">20 Years</SelectItem>
                      <SelectItem value="30">30 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sort-order">Sort Order</Label>
                  <Select
                    value={filters.sortOrder}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        sortOrder: value as "asc" | "desc",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">
                        <div className="flex items-center gap-2">
                          <SortDesc className="h-4 w-4" />
                          Descending
                        </div>
                      </SelectItem>
                      <SelectItem value="asc">
                        <div className="flex items-center gap-2">
                          <SortAsc className="h-4 w-4" />
                          Ascending
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        sortOrder: prev.sortOrder === "desc" ? "asc" : "desc",
                      }))
                    }
                    className="w-full"
                  >
                    {filters.sortOrder === "desc" ? (
                      <SortDesc className="h-4 w-4 mr-2" />
                    ) : (
                      <SortAsc className="h-4 w-4 mr-2" />
                    )}
                    Toggle Order
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comparison Results */}
        {canCompare && (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <Table className="h-4 w-4" />
                Table
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Charts
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <ScenarioComparisonSummary
                comparisonData={comparisonData}
                comparisonMetrics={comparisonMetrics}
              />
            </TabsContent>

            <TabsContent value="table">
              <ScenarioComparisonTable
                tableData={tableData}
                comparisonData={comparisonData}
                sortBy={filters.sortBy}
                sortOrder={filters.sortOrder}
              />
            </TabsContent>

            <TabsContent value="charts">
              {(() => {
                try {
                  return (
                    <ScenarioComparisonCharts
                      comparisonData={comparisonData}
                      chartData={chartData}
                      timeHorizon={filters.timeHorizon}
                    />
                  );
                } catch (error) {
                  console.error("Error rendering charts:", error);
                  return (
                    <Card>
                      <CardContent className="text-center py-12">
                        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          Error Loading Charts
                        </h3>
                        <p className="text-muted-foreground">
                          There was an error loading the charts. Please check
                          the console for details.
                        </p>
                      </CardContent>
                    </Card>
                  );
                }
              })()}
            </TabsContent>

            <TabsContent value="analysis">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Analysis</CardTitle>
                    <CardDescription>
                      Detailed analysis of scenario performance and risk
                      characteristics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Analysis Coming Soon
                      </h3>
                      <p className="text-muted-foreground">
                        Advanced analysis features will be available in a future
                        update
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Empty State */}
        {!canCompare && (
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Select Scenarios to Compare
              </h3>
              <p className="text-muted-foreground mb-4">
                Choose 2 or more scenarios from the list above to start
                comparing their performance
              </p>
              <Button
                onClick={() =>
                  setSelectedScenarios(scenarios.slice(0, 2).map((s) => s.id))
                }
              >
                Compare First 2 Scenarios
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
