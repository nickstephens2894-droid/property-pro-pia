import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  DollarSign,
  Home,
  Target,
  Download,
} from "lucide-react";
import {
  ScenarioComparisonData,
  ComparisonChartData,
} from "@/types/scenarioComparison";
import { formatCurrency, formatPercentage } from "@/utils/formatters";

interface ScenarioComparisonChartsProps {
  comparisonData: ScenarioComparisonData[];
  chartData: ComparisonChartData | null;
  timeHorizon: number;
}

export const ScenarioComparisonCharts: React.FC<
  ScenarioComparisonChartsProps
> = ({ comparisonData, chartData, timeHorizon }) => {
  const [selectedMetric, setSelectedMetric] = useState("totalROI");
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");

  // Debug logging
  console.log("ScenarioComparisonCharts props:", {
    comparisonData,
    chartData,
    timeHorizon,
  });

  // Generate colors for charts
  const generateColors = (count: number, alpha: number = 0.1) => {
    const colors = [
      `rgba(59, 130, 246, ${alpha})`, // Blue
      `rgba(16, 185, 129, ${alpha})`, // Green
      `rgba(245, 158, 11, ${alpha})`, // Yellow
      `rgba(239, 68, 68, ${alpha})`, // Red
      `rgba(139, 92, 246, ${alpha})`, // Purple
      `rgba(236, 72, 153, ${alpha})`, // Pink
      `rgba(14, 165, 233, ${alpha})`, // Sky
      `rgba(34, 197, 94, ${alpha})`, // Emerald
    ];

    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };

  // Early return for empty data
  if (!comparisonData.length) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Data to Display</h3>
          <p className="text-muted-foreground">
            Select scenarios to compare to see charts and visualizations
          </p>
        </CardContent>
      </Card>
    );
  }

  const availableMetrics = [
    { key: "totalROI", label: "Total ROI", icon: TrendingUp },
    { key: "totalProjectCost", label: "Project Cost", icon: DollarSign },
    { key: "averageRentalYield", label: "Rental Yield", icon: Home },
    { key: "riskScore", label: "Risk Score", icon: Target },
    { key: "cashOnCashReturn", label: "Cash on Cash Return", icon: BarChart3 },
    { key: "breakEvenYear", label: "Break Even Year", icon: Target },
  ];

  // Generate chart data for selected metric
  const currentChartData = useMemo(() => {
    if (!comparisonData.length) return null;

    const labels = comparisonData.map((data) => data.scenarioName);
    const data = comparisonData.map((data) => {
      if (selectedMetric in data.keyMetrics) {
        return data.keyMetrics[
          selectedMetric as keyof typeof data.keyMetrics
        ] as number;
      } else {
        return data.performance[
          selectedMetric as keyof typeof data.performance
        ] as number;
      }
    });

    return {
      labels,
      datasets: [
        {
          label:
            availableMetrics.find((m) => m.key === selectedMetric)?.label ||
            selectedMetric,
          data,
          backgroundColor: generateColors(data.length),
          borderColor: generateColors(data.length, 0.8),
          borderWidth: 2,
        },
      ],
    };
  }, [comparisonData, selectedMetric]);

  // Calculate performance over time data
  const performanceOverTimeData = useMemo(() => {
    if (!comparisonData.length) return null;

    const years = Array.from({ length: timeHorizon }, (_, i) => i + 1);
    const datasets = comparisonData.map((scenario, index) => ({
      label: scenario.scenarioName,
      data: years.map((year) => {
        const projection = scenario.projections.find((p) => p.year === year);
        return projection ? projection.propertyEquity : 0;
      }),
      borderColor: generateColors(comparisonData.length, 1)[index],
      backgroundColor: generateColors(comparisonData.length, 0.1)[index],
      borderWidth: 2,
      fill: false,
    }));

    return {
      labels: years.map((year) => `Year ${year}`),
      datasets,
    };
  }, [comparisonData, timeHorizon]);

  // Calculate risk vs return data
  const riskReturnData = useMemo(() => {
    if (!comparisonData.length) return null;

    return {
      labels: comparisonData.map((data) => data.scenarioName),
      datasets: [
        {
          label: "Risk vs Return",
          data: comparisonData.map((data) => ({
            x: data.performance.riskScore,
            y: data.performance.totalROI,
            label: data.scenarioName,
          })),
          backgroundColor: generateColors(comparisonData.length, 0.6),
          borderColor: generateColors(comparisonData.length, 1),
          borderWidth: 2,
        },
      ],
    };
  }, [comparisonData]);

  const renderBarChart = () => (
    <div className="h-96 flex items-center justify-center">
      <div className="w-full h-full">
        <div className="text-center text-muted-foreground mb-4">
          Bar Chart -{" "}
          {availableMetrics.find((m) => m.key === selectedMetric)?.label}
        </div>
        <div className="grid grid-cols-1 gap-4">
          {currentChartData?.labels.map((label, index) => {
            const value = currentChartData.datasets[0].data[index];
            const maxValue = Math.max(...currentChartData.datasets[0].data);
            const percentage = (value / maxValue) * 100;

            return (
              <div key={label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">
                    {selectedMetric.includes("Cost") ||
                    selectedMetric.includes("Amount")
                      ? formatCurrency(value)
                      : selectedMetric.includes("%") ||
                        selectedMetric.includes("Yield") ||
                        selectedMetric.includes("ROI")
                      ? formatPercentage(value)
                      : value.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-4">
                  <div
                    className="bg-primary h-4 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderLineChart = () => (
    <div className="h-96 flex items-center justify-center">
      <div className="w-full h-full">
        <div className="text-center text-muted-foreground mb-4">
          Line Chart - Performance Over Time
        </div>
        <div className="space-y-4">
          {performanceOverTimeData?.datasets.map((dataset, index) => (
            <div key={dataset.label} className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: dataset.borderColor }}
                />
                <span className="font-medium">{dataset.label}</span>
              </div>
              <div className="grid grid-cols-10 gap-1">
                {dataset.data.slice(0, 10).map((value, yearIndex) => (
                  <div key={yearIndex} className="text-center">
                    <div className="text-xs text-muted-foreground">
                      Y{yearIndex + 1}
                    </div>
                    <div className="text-xs font-medium">
                      {formatCurrency(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPieChart = () => (
    <div className="h-96 flex items-center justify-center">
      <div className="w-full h-full">
        <div className="text-center text-muted-foreground mb-4">
          Pie Chart -{" "}
          {availableMetrics.find((m) => m.key === selectedMetric)?.label}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {currentChartData?.labels.map((label, index) => {
            const value = currentChartData.datasets[0].data[index];
            const total = currentChartData.datasets[0].data.reduce(
              (sum, val) => sum + val,
              0
            );
            const percentage = (value / total) * 100;

            return (
              <div
                key={label}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <div
                  className="w-6 h-6 rounded-full"
                  style={{
                    backgroundColor:
                      currentChartData.datasets[0].backgroundColor[index],
                  }}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}% of total
                  </div>
                </div>
                <div className="text-sm font-medium">
                  {selectedMetric.includes("Cost") ||
                  selectedMetric.includes("Amount")
                    ? formatCurrency(value)
                    : selectedMetric.includes("%") ||
                      selectedMetric.includes("Yield") ||
                      selectedMetric.includes("ROI")
                    ? formatPercentage(value)
                    : value.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderRiskReturnChart = () => (
    <div className="h-96 flex items-center justify-center">
      <div className="w-full h-full">
        <div className="text-center text-muted-foreground mb-4">
          Risk vs Return Analysis
        </div>
        <div className="grid grid-cols-1 gap-4">
          {riskReturnData?.datasets[0].data.map((point, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-3 border rounded-lg"
            >
              <div
                className="w-6 h-6 rounded-full"
                style={{
                  backgroundColor:
                    riskReturnData.datasets[0].backgroundColor[index],
                }}
              />
              <div className="flex-1">
                <div className="font-medium">{point.label}</div>
                <div className="text-sm text-muted-foreground">
                  Risk: {point.x.toFixed(1)} | Return:{" "}
                  {formatPercentage(point.y)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {formatPercentage(point.y)}
                </div>
                <div className="text-xs text-muted-foreground">ROI</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Chart Controls
          </CardTitle>
          <CardDescription>
            Customize the charts and visualizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Metric</label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableMetrics.map((metric) => (
                    <SelectItem key={metric.key} value={metric.key}>
                      <div className="flex items-center gap-2">
                        <metric.icon className="h-4 w-4" />
                        {metric.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Chart Type
              </label>
              <Select
                value={chartType}
                onValueChange={(value: any) => setChartType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Bar Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="line">
                    <div className="flex items-center gap-2">
                      <LineChart className="h-4 w-4" />
                      Line Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="pie">
                    <div className="flex items-center gap-2">
                      <PieChart className="h-4 w-4" />
                      Pie Chart
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Chart
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Charts */}
      <Tabs defaultValue="metric" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metric">Metric Comparison</TabsTrigger>
          <TabsTrigger value="performance">Performance Over Time</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="metric">
          <Card>
            <CardHeader>
              <CardTitle>
                {availableMetrics.find((m) => m.key === selectedMetric)?.label}{" "}
                Comparison
              </CardTitle>
              <CardDescription>
                {chartType === "bar" &&
                  "Bar chart showing metric values across scenarios"}
                {chartType === "line" &&
                  "Line chart showing metric trends over time"}
                {chartType === "pie" &&
                  "Pie chart showing distribution of metric values"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartType === "bar" && renderBarChart()}
              {chartType === "line" && renderLineChart()}
              {chartType === "pie" && renderPieChart()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
              <CardDescription>
                Property equity growth over {timeHorizon} years for each
                scenario
              </CardDescription>
            </CardHeader>
            <CardContent>{renderLineChart()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card>
            <CardHeader>
              <CardTitle>Risk vs Return Analysis</CardTitle>
              <CardDescription>
                Risk score vs total ROI for each scenario
              </CardDescription>
            </CardHeader>
            <CardContent>{renderRiskReturnChart()}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
