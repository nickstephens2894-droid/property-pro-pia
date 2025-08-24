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

  // Generate timeline data for charts with improved projections
  const generateTimelineData = () => {
    if (selectedMetrics.length === 0) return [];
    
    const years = Array.from({ length: 10 }, (_, i) => i + 1);
    
    return years.map(year => {
      const dataPoint: any = { year: `Y${year}` }; // Better mobile display
      
      selectedMetrics.forEach(metric => {
        // More realistic projection calculations
        const propertyGrowthRate = 0.07; // 7% annual property growth
        const rentalGrowthRate = 0.05; // 5% annual rental growth
        const inflationRate = 0.03; // 3% inflation for expenses
        
        // Net equity projection: compound growth from final year value
        const projectedEquity = metric.netEquityAtYearTo * Math.pow(1 + propertyGrowthRate, (year / metric.analysisYearTo));
        
        // Weekly cashflow projection: starting from year 1, compound annually
        const projectedCashflow = metric.weeklyCashflowYear1 * Math.pow(1 + rentalGrowthRate, year - 1);
        
        // Ensure realistic minimums
        dataPoint[`${metric.name}_equity`] = Math.max(0, projectedEquity);
        dataPoint[`${metric.name}_cashflow`] = Math.max(0, projectedCashflow);
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
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Projection Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Compare investment projections across multiple instances
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={selectAllInstances} className="flex-1 sm:flex-none text-sm">
            Select All
          </Button>
          <Button variant="outline" onClick={clearSelection} className="flex-1 sm:flex-none text-sm">
            Clear Selection
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Instance Selection Panel */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="h-4 w-4 sm:h-5 sm:w-5" />
              Select Instances
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            {instances.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No instances available. Create some instances first.
              </p>
            ) : (
              instances.map((instance: Instance) => (
                <div key={instance.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={instance.id}
                    checked={selectedInstanceIds.includes(instance.id)}
                    onCheckedChange={() => handleInstanceToggle(instance.id)}
                    className="mt-1"
                  />
                  <label htmlFor={instance.id} className="flex-1 cursor-pointer min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <span className="font-medium text-sm sm:text-base truncate">{instance.name}</span>
                      <Badge variant="outline" className="self-start text-xs">{instance.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
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
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              Key Metrics Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMetrics.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 text-sm sm:text-base">
                Select instances to compare their key metrics
              </p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {selectedMetrics.map((metric, index) => (
                  <div key={metric.instanceId} className="p-3 sm:p-4 rounded-lg border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                      <h3 className="font-semibold text-sm sm:text-base">{metric.name}</h3>
                      <Badge className="self-start text-xs">{metric.analysisYearTo} year analysis</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                        <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-muted-foreground text-xs">Weekly Cashflow</p>
                          <p className="font-medium text-sm truncate">{formatCurrency(metric.weeklyCashflowYear1)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                        <Calculator className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-muted-foreground text-xs">Tax Savings (Y1)</p>
                          <p className="font-medium text-sm truncate">{formatCurrency(metric.taxSavingsYear1)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                        <PiggyBank className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-muted-foreground text-xs">Net Equity</p>
                          <p className="font-medium text-sm truncate">{formatCurrency(metric.netEquityAtYearTo)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                        <TrendingUp className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-muted-foreground text-xs">ROI</p>
                          <p className="font-medium text-sm truncate">{formatPercentage(metric.roiAtYearTo)}</p>
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
        <div className="space-y-4 sm:space-y-6">
          {/* Mobile: Stack charts vertically, Desktop: Side by side */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Net Equity Timeline */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Net Equity Projection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-48 sm:h-64 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={timelineData} 
                      margin={{ 
                        top: 10, 
                        right: window.innerWidth < 640 ? 10 : 20, 
                        left: window.innerWidth < 640 ? 10 : 20, 
                        bottom: 10 
                      }}
                    >
                      <XAxis 
                        dataKey="year" 
                        fontSize={window.innerWidth < 640 ? 10 : 12}
                        tickLine={false}
                        axisLine={false}
                        interval={window.innerWidth < 640 ? 1 : 0} // Show every other tick on mobile
                      />
                      <YAxis 
                        tickFormatter={(value) => {
                          // Shorter format for mobile
                          if (window.innerWidth < 640) {
                            return value >= 1000000 ? `$${(value / 1000000).toFixed(1)}M` : 
                                   value >= 1000 ? `$${(value / 1000).toFixed(0)}K` : 
                                   `$${value.toFixed(0)}`;
                          }
                          return formatCurrency(value);
                        }}
                        fontSize={window.innerWidth < 640 ? 10 : 12}
                        tickLine={false}
                        axisLine={false}
                        width={window.innerWidth < 640 ? 45 : 60}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value) => [formatCurrency(value as number), ""]}
                      />
                      {window.innerWidth >= 640 && (
                        <Legend 
                          wrapperStyle={{ fontSize: '11px' }}
                          iconType="line"
                        />
                      )}
                      {selectedMetrics.map((metric, index) => (
                        <Line
                          key={`${metric.instanceId}_equity`}
                          type="monotone"
                          dataKey={`${metric.name}_equity`}
                          stroke={`hsl(${(index * 60) % 360}, 70%, 50%)`}
                          strokeWidth={window.innerWidth < 640 ? 1.5 : 2}
                          name={metric.name}
                          dot={false}
                          activeDot={{ r: window.innerWidth < 640 ? 3 : 4 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
                
                {/* Mobile Legend */}
                {window.innerWidth < 640 && selectedMetrics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t">
                    {selectedMetrics.map((metric, index) => (
                      <div key={metric.instanceId} className="flex items-center gap-1">
                        <div 
                          className="w-3 h-0.5 rounded"
                          style={{ backgroundColor: `hsl(${(index * 60) % 360}, 70%, 50%)` }}
                        />
                        <span className="text-xs font-medium truncate max-w-20">{metric.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Cashflow Timeline */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Weekly Cashflow Projection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-48 sm:h-64 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={timelineData} 
                      margin={{ 
                        top: 10, 
                        right: window.innerWidth < 640 ? 10 : 20, 
                        left: window.innerWidth < 640 ? 10 : 20, 
                        bottom: 10 
                      }}
                    >
                      <XAxis 
                        dataKey="year" 
                        fontSize={window.innerWidth < 640 ? 10 : 12}
                        tickLine={false}
                        axisLine={false}
                        interval={window.innerWidth < 640 ? 1 : 0}
                      />
                      <YAxis 
                        tickFormatter={(value) => {
                          // Shorter format for mobile
                          if (window.innerWidth < 640) {
                            return value >= 1000 ? `$${(value / 1000).toFixed(1)}K` : `$${value.toFixed(0)}`;
                          }
                          return formatCurrency(value);
                        }}
                        fontSize={window.innerWidth < 640 ? 10 : 12}
                        tickLine={false}
                        axisLine={false}
                        width={window.innerWidth < 640 ? 40 : 60}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value) => [formatCurrency(value as number), ""]}
                      />
                      {window.innerWidth >= 640 && (
                        <Legend 
                          wrapperStyle={{ fontSize: '11px' }}
                          iconType="rect"
                        />
                      )}
                      {selectedMetrics.map((metric, index) => (
                        <Bar
                          key={`${metric.instanceId}_cashflow`}
                          dataKey={`${metric.name}_cashflow`}
                          fill={`hsl(${(index * 60 + 180) % 360}, 70%, 50%)`}
                          name={metric.name}
                          radius={[1, 1, 0, 0]} // Subtle rounded corners
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
                
                {/* Mobile Legend */}
                {window.innerWidth < 640 && selectedMetrics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t">
                    {selectedMetrics.map((metric, index) => (
                      <div key={metric.instanceId} className="flex items-center gap-1">
                        <div 
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: `hsl(${(index * 60 + 180) % 360}, 70%, 50%)` }}
                        />
                        <span className="text-xs font-medium truncate max-w-20">{metric.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Mobile: Additional chart info */}
          {window.innerWidth < 640 && (
            <Card className="sm:hidden">
              <CardContent className="pt-4">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Equity projections assume 7% annual property growth</p>
                  <p>• Cashflow projections assume 5% annual rental growth</p>
                  <p>• Tap and hold chart points for detailed values</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}