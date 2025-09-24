import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
} from "lucide-react";
import {
  ScenarioComparisonData,
  ComparisonTableRow,
} from "@/types/scenarioComparison";
import { formatCurrency, formatPercentage } from "@/utils/formatters";

interface ScenarioComparisonTableProps {
  tableData: ComparisonTableRow[];
  comparisonData: ScenarioComparisonData[];
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export const ScenarioComparisonTable: React.FC<
  ScenarioComparisonTableProps
> = ({ tableData, comparisonData, sortBy, sortOrder }) => {
  const getValueDisplay = (value: number | string, metric: string): string => {
    if (typeof value === "string") return value;

    // Format based on metric type
    if (
      metric.includes("Cost") ||
      metric.includes("Amount") ||
      metric.includes("Rent")
    ) {
      return formatCurrency(value);
    } else if (
      metric.includes("%") ||
      metric.includes("Yield") ||
      metric.includes("ROI") ||
      metric.includes("LVR")
    ) {
      return formatPercentage(value);
    } else if (metric.includes("Year")) {
      return `${value} years`;
    } else {
      return value.toLocaleString();
    }
  };

  const getValueColor = (
    value: number,
    metric: string,
    isBest: boolean,
    isWorst: boolean
  ): string => {
    if (isBest) return "text-green-600 font-semibold";
    if (isWorst) return "text-red-600 font-semibold";

    // Color coding based on metric type
    if (
      metric.includes("ROI") ||
      metric.includes("Yield") ||
      metric.includes("Return")
    ) {
      return value > 0 ? "text-green-600" : "text-red-600";
    } else if (metric.includes("Risk") || metric.includes("Year")) {
      return value > 50
        ? "text-red-600"
        : value > 25
        ? "text-yellow-600"
        : "text-green-600";
    } else {
      return "text-foreground";
    }
  };

  const getSortIcon = (metricKey: string) => {
    if (sortBy !== metricKey) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4 text-primary" />
    ) : (
      <ArrowDown className="h-4 w-4 text-primary" />
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Financial":
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case "Rental":
        return <Award className="h-4 w-4 text-green-500" />;
      case "Performance":
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      case "Risk":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Financial":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Rental":
        return "bg-green-100 text-green-800 border-green-200";
      case "Performance":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Risk":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Table className="h-5 w-5" />
          Detailed Comparison Table
        </CardTitle>
        <CardDescription>
          Side-by-side comparison of all key metrics across selected scenarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] sticky left-0 bg-background z-10">
                  <div className="flex items-center gap-2">
                    <span>Metric</span>
                  </div>
                </TableHead>
                {comparisonData.map((scenario) => (
                  <TableHead
                    key={scenario.scenarioId}
                    className="min-w-[150px] text-center"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className="font-semibold truncate max-w-[120px]"
                        title={scenario.scenarioName}
                      >
                        {scenario.scenarioName}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {scenario.instanceCount} instance
                        {scenario.instanceCount !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-[100px] text-center">Best</TableHead>
                <TableHead className="w-[100px] text-center">Worst</TableHead>
                <TableHead className="w-[100px] text-center">Spread</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="sticky left-0 bg-background z-10">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(row.category)}
                      <div>
                        <div className="font-medium">{row.metric}</div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getCategoryColor(
                            row.category
                          )}`}
                        >
                          {row.category}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>

                  {comparisonData.map((scenario) => {
                    const value = row.scenarios[scenario.scenarioName];
                    const isBest = row.bestScenario === scenario.scenarioName;
                    const isWorst = row.worstScenario === scenario.scenarioName;

                    return (
                      <TableCell
                        key={scenario.scenarioId}
                        className="text-center"
                      >
                        <div
                          className={`${getValueColor(
                            typeof value === "number" ? value : 0,
                            row.metric,
                            isBest,
                            isWorst
                          )}`}
                        >
                          {getValueDisplay(value, row.metric)}
                        </div>
                        {(isBest || isWorst) && (
                          <div className="mt-1">
                            {isBest && (
                              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                <Award className="h-3 w-3 mr-1" />
                                Best
                              </Badge>
                            )}
                            {isWorst && (
                              <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Worst
                              </Badge>
                            )}
                          </div>
                        )}
                      </TableCell>
                    );
                  })}

                  <TableCell className="text-center">
                    {row.bestScenario && (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-medium text-green-600">
                          {row.bestScenario}
                        </span>
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          Best
                        </Badge>
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    {row.worstScenario && (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-medium text-red-600">
                          {row.worstScenario}
                        </span>
                        <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Worst
                        </Badge>
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    {row.difference !== undefined && (
                      <div className="text-sm">
                        <div className="font-medium">
                          {getValueDisplay(row.difference, row.metric)}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          difference
                        </div>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary Statistics */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-3">Summary Statistics</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total Metrics</div>
              <div className="font-semibold">{tableData.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Scenarios Compared</div>
              <div className="font-semibold">{comparisonData.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Categories</div>
              <div className="font-semibold">
                {new Set(tableData.map((row) => row.category)).size}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Best Overall</div>
              <div className="font-semibold text-green-600">
                {comparisonData.length > 0
                  ? comparisonData[0].scenarioName
                  : "N/A"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
