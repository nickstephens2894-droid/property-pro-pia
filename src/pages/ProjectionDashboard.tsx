import { useState, useEffect } from "react";
import { useInstances } from "@/contexts/InstancesContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, DollarSign, PiggyBank, Calculator, BarChart3, Building } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/utils/formatters";

type Instance = any; // Using the instance type from the service

interface MetricComparison {
  instanceId: string;
  name: string;
  weeklyCashflowYear1: number;
  taxSavingsYear1: number;
  taxSavingsTotal: number;
  netEquityAtYearTo: number;
  roiAtYearTo: number;
  analysisYearTo: number;
}

const chartConfig = {
  weeklycashflow: {
    label: "Weekly Cashflow",
    color: "hsl(var(--chart-1))",
  },
  netequity: {
    label: "Net Equity", 
    color: "hsl(var(--chart-2))",
  },
  roi: {
    label: "ROI %",
    color: "hsl(var(--chart-3))",
  },
  taxsavings: {
    label: "Tax Savings",
    color: "hsl(var(--chart-4))",
  },
};

export default function ProjectionDashboard() {
  const { instances, loading, error } = useInstances();
  const [selectedInstanceIds, setSelectedInstanceIds] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<MetricComparison[]>([]);

  useEffect(() => {
    if (selectedInstanceIds.length > 0 && instances.length > 0) {
      const metrics = selectedInstanceIds.map(id => {
        const instance = instances.find(i => i.id === id);
        if (!instance) return null;
        
        return {
          instanceId: instance.id,
          name: instance.name,
          weeklyCashflowYear1: instance.weekly_cashflow_year1 || 0,
          taxSavingsYear1: instance.tax_savings_year1 || 0,
          taxSavingsTotal: instance.tax_savings_total || 0,
          netEquityAtYearTo: instance.net_equity_at_year_to || 0,
          roiAtYearTo: instance.roi_at_year_to || 0,
          analysisYearTo: instance.analysis_year_to || 30,
        };
      }).filter(Boolean) as MetricComparison[];
      
      setSelectedMetrics(metrics);
    } else {
      setSelectedMetrics([]);
    }
  }, [selectedInstanceIds, instances]);

  const handleInstanceToggle = (instanceId: string) => {
    setSelectedInstanceIds(prev => 
      prev.includes(instanceId)
        ? prev.filter(id => id !== instanceId)
        : [...prev, instanceId]
    );
  };

  const selectAllInstances = () => {
    setSelectedInstanceIds(instances.map(i => i.id));
  };

  const clearSelection = () => {
    setSelectedInstanceIds([]);
  };

  // Generate timeline data for charts (simplified projection)
  const generateTimelineData = () => {
    if (selectedMetrics.length === 0) return [];
    
    const years = Array.from({ length: 10 }, (_, i) => i + 1);
    
    return years.map(year => {
      const dataPoint: any = { year };
      
      selectedMetrics.forEach(metric => {
        // Simple projection calculation for demo purposes
        const growthRate = 0.07; // 7% growth assumption
        const cashflowGrowth = 0.05; // 5% rental growth
        
        dataPoint[`${metric.name}_equity`] = metric.netEquityAtYearTo * Math.pow(1 + growthRate, year / metric.analysisYearTo);
        dataPoint[`${metric.name}_cashflow`] = metric.weeklyCashflowYear1 * Math.pow(1 + cashflowGrowth, year - 1);
      });
      
      return dataPoint;
    });
  };

  const timelineData = generateTimelineData();

  if (loading) {
    return <LoadingSpinner message="Loading instances..." />;
  }

  if (error) {
    return (
      <Card className="m-6">
        <CardContent className="pt-6">
          <p className="text-destructive">Error loading instances: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projection Dashboard</h1>
          <p className="text-muted-foreground">
            Compare investment projections across multiple instances
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={selectAllInstances}>
            Select All
          </Button>
          <Button variant="outline" onClick={clearSelection}>
            Clear Selection
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Instance Selection Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Select Instances
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {instances.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No instances available. Create some instances first.
              </p>
            ) : (
              instances.map((instance: Instance) => (
                <div key={instance.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={instance.id}
                    checked={selectedInstanceIds.includes(instance.id)}
                    onCheckedChange={() => handleInstanceToggle(instance.id)}
                  />
                  <label htmlFor={instance.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{instance.name}</span>
                      <Badge variant="outline">{instance.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(instance.purchase_price)} • {instance.location}
                    </p>
                  </label>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Key Metrics Comparison */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Key Metrics Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMetrics.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Select instances to compare their key metrics
              </p>
            ) : (
              <div className="space-y-4">
                {selectedMetrics.map((metric, index) => (
                  <div key={metric.instanceId} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{metric.name}</h3>
                      <Badge>{metric.analysisYearTo} year analysis</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-muted-foreground">Weekly Cashflow</p>
                          <p className="font-medium">{formatCurrency(metric.weeklyCashflowYear1)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-muted-foreground">Tax Savings (Y1)</p>
                          <p className="font-medium">{formatCurrency(metric.taxSavingsYear1)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <PiggyBank className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="text-muted-foreground">Net Equity</p>
                          <p className="font-medium">{formatCurrency(metric.netEquityAtYearTo)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                        <div>
                          <p className="text-muted-foreground">ROI</p>
                          <p className="font-medium">{formatPercentage(metric.roiAtYearTo)}</p>
                        </div>
                      </div>
                    </div>
                    
                    {index < selectedMetrics.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline Charts */}
      {selectedMetrics.length > 0 && timelineData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Net Equity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Net Equity Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <XAxis dataKey="year" />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value) => [formatCurrency(value as number), ""]}
                    />
                    <Legend />
                    {selectedMetrics.map((metric, index) => (
                      <Line
                        key={`${metric.instanceId}_equity`}
                        type="monotone"
                        dataKey={`${metric.name}_equity`}
                        stroke={`hsl(${(index * 60) % 360}, 70%, 50%)`}
                        strokeWidth={2}
                        name={metric.name}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Weekly Cashflow Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Cashflow Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timelineData}>
                    <XAxis dataKey="year" />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value) => [formatCurrency(value as number), ""]}
                    />
                    <Legend />
                    {selectedMetrics.map((metric, index) => (
                      <Bar
                        key={`${metric.instanceId}_cashflow`}
                        dataKey={`${metric.name}_cashflow`}
                        fill={`hsl(${(index * 60 + 180) % 360}, 70%, 50%)`}
                        name={metric.name}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}