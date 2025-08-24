import { useState, useEffect } from "react";
import { useInstances } from "@/contexts/InstancesContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, PieChart, Pie, Cell, ReferenceLine } from "recharts";
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
  const isMobile = useIsMobile();
  const [selectedInstanceIds, setSelectedInstanceIds] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<MetricComparison[]>([]);
  const [startYear, setStartYear] = useState<number>(1); // Starting year of 10-year window

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

  // Generate timeline data for charts with improved, more realistic projections
  const generateTimelineData = () => {
    if (selectedMetrics.length === 0) return [];
    
    const endYear = startYear + 9; // Always show 10 years
    const years = Array.from({ length: 10 }, (_, i) => startYear + i);
    
    return years.map(year => {
      const dataPoint: any = { year: isMobile ? `Y${year}` : `Year ${year}` };
      
      selectedMetrics.forEach(metric => {
        // Realistic market-based growth rates
        const propertyGrowthRate = 0.07; // 7% annual property value growth
        const rentalGrowthRate = 0.04; // 4% annual rental growth (more conservative)
        const expenseInflationRate = 0.03; // 3% expense inflation
        
        // Net equity projection: compound growth based on property appreciation
        // Start from current equity and project forward with market growth
        let projectedEquity;
        if (year <= metric.analysisYearTo) {
          // Linear interpolation to the analysis year
          const equityGrowthPerYear = metric.netEquityAtYearTo / metric.analysisYearTo;
          projectedEquity = equityGrowthPerYear * year;
        } else {
          // Beyond analysis period, use compound growth from final value
          const yearsOver = year - metric.analysisYearTo;
          projectedEquity = metric.netEquityAtYearTo * Math.pow(1 + propertyGrowthRate, yearsOver);
        }
        
        // Weekly cashflow projection: compound growth from year 1 baseline
        // Account for rental increases minus expense inflation
        const netGrowthRate = rentalGrowthRate - (expenseInflationRate * 0.3); // Expenses are ~30% of rental income
        const projectedCashflow = metric.weeklyCashflowYear1 * Math.pow(1 + netGrowthRate, year - 1);
        
        // Debug logging for cashflow calculations
        console.log(`📊 Cashflow projection for ${metric.name}, Year ${year}:`, {
          baseWeeklyCashflow: metric.weeklyCashflowYear1,
          rentalGrowthRate,
          expenseInflationRate,
          netGrowthRate,
          growthMultiplier: Math.pow(1 + netGrowthRate, year - 1),
          projectedCashflow
        });
        
        // Apply realistic minimums and maximums
        dataPoint[`${metric.name}_equity`] = Math.max(0, projectedEquity);
        dataPoint[`${metric.name}_cashflow`] = projectedCashflow; // Allow negative cashflow values
      });
      
      return dataPoint;
    });
  };

  const timelineData = generateTimelineData();

  // Get summary data for the selected range
  const getSummaryData = (type: 'equity' | 'cashflow') => {
    if (timelineData.length === 0) return null;
    
    const startData = timelineData[0];
    const endData = timelineData[timelineData.length - 1];
    
    return selectedMetrics.map(metric => {
      const startValue = startData[`${metric.name}_${type}`];
      const endValue = endData[`${metric.name}_${type}`];
      return {
        name: metric.name,
        startValue,
        endValue,
        growth: startValue > 0 ? ((endValue - startValue) / startValue) * 100 : 0
      };
    });
  };

  const equitySummary = getSummaryData('equity');
  const cashflowSummary = getSummaryData('cashflow');

  // Calculate expense coverage breakdown for pie chart (Rent vs Tax vs Owner)
  const getExpenseBreakdown = () => {
    if (selectedMetrics.length === 0) return [];
    
    let totalRentIncome = 0;
    let totalTaxSavings = 0;
    let totalOwnerOutOfPocket = 0;
    
    selectedMetrics.forEach(metric => {
      // Get the actual instance data to calculate properly
      const instance = instances.find(i => i.id === metric.instanceId);
      if (!instance) return;
      
      console.log('🏠 Processing instance:', {
        name: instance.name,
        weeklyRent: instance.weekly_rent,
        weeklyCashflow: instance.weekly_cashflow_year1,
        taxSavings: instance.tax_savings_year1
      });
      
      const annualRent = (instance.weekly_rent || 0) * 52;
      const annualTaxSavings = instance.tax_savings_year1 || 0;
      const annualCashflow = (instance.weekly_cashflow_year1 || 0) * 52;
      
      // Rent income contribution
      totalRentIncome += annualRent;
      
      // Tax savings contribution  
      totalTaxSavings += annualTaxSavings;
      
      // If there's still negative cashflow after rent and tax benefits, it's owner out-of-pocket
      const netResult = annualRent + annualTaxSavings + annualCashflow;
      if (netResult < 0) {
        totalOwnerOutOfPocket += Math.abs(netResult);
      }
    });
    
    console.log('💰 Expense breakdown totals:', {
      totalRentIncome,
      totalTaxSavings, 
      totalOwnerOutOfPocket
    });
    
    const breakdown = [];
    
    if (totalRentIncome > 0) {
      breakdown.push({
        name: 'Rent Income',
        value: totalRentIncome,
        color: 'hsl(var(--chart-1))'
      });
    }
    
    if (totalTaxSavings > 0) {
      breakdown.push({
        name: 'Tax Savings',
        value: totalTaxSavings, 
        color: 'hsl(var(--chart-2))'
      });
    }
    
    if (totalOwnerOutOfPocket > 0) {
      breakdown.push({
        name: 'Owner Out-of-Pocket',
        value: totalOwnerOutOfPocket,
        color: 'hsl(var(--chart-3))'
      });
    }
    
    return breakdown;
  };

  const expenseBreakdown = getExpenseBreakdown();

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

      {/* Expense Coverage Breakdown */}
      {selectedMetrics.length > 0 && expenseBreakdown.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              Property Expense Coverage (Annual)
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              How property expenses are covered: rent income, tax savings, and owner out-of-pocket
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="flex justify-center">
                <ChartContainer config={chartConfig} className="h-64 w-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value) => [formatCurrency(value as number), ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              
              <div className="space-y-4">
                {expenseBreakdown.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.name === 'Rent Income' ? 'Rental income covers expenses' : 
                           item.name === 'Tax Savings' ? 'Tax deductions offset costs' :
                           'Owner contributes additional funds'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(item.value)}</div>
                      <div className="text-sm text-muted-foreground">
                        {((item.value / expenseBreakdown.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                {/* Summary Statement */}
                {equitySummary && equitySummary.length > 0 && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    {equitySummary.map(summary => (
                      <div key={summary.name} className="flex justify-between items-center">
                        <span className="font-medium">{summary.name}:</span>
                        <span>{formatCurrency(summary.startValue)} → {formatCurrency(summary.endValue)} ({summary.growth > 0 ? '+' : ''}{summary.growth.toFixed(1)}%)</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className={`${isMobile ? "h-64" : "h-80"} overflow-hidden`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={timelineData} 
                      margin={{ 
                        top: 10, 
                        right: isMobile ? 8 : 20, 
                        left: isMobile ? 8 : 20, 
                        bottom: 10 
                      }}
                    >
                      <XAxis 
                        dataKey="year" 
                        fontSize={isMobile ? 10 : 12}
                        tickLine={false}
                        axisLine={false}
                        interval={isMobile ? 1 : 0}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        tickFormatter={(value) => {
                          if (isMobile) {
                            return value >= 1000000 ? `$${(value / 1000000).toFixed(1)}M` : 
                                   value >= 1000 ? `$${(value / 1000).toFixed(0)}K` : 
                                   `$${value.toFixed(0)}`;
                          }
                          return formatCurrency(value);
                        }}
                        fontSize={isMobile ? 9 : 11}
                        tickLine={false}
                        axisLine={false}
                        width={isMobile ? 50 : 80}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value) => [formatCurrency(value as number), ""]}
                      />
                      {!isMobile && (
                        <Legend 
                          wrapperStyle={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}
                          iconType="rect"
                        />
                      )}
                      {selectedMetrics.map((metric, index) => (
                        <Bar
                          key={`${metric.instanceId}_equity`}
                          dataKey={`${metric.name}_equity`}
                          fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                          name={metric.name}
                          radius={[2, 2, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
                
                
                {/* Mobile Legend */}
                {isMobile && selectedMetrics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                    {selectedMetrics.map((metric, index) => (
                      <div key={metric.instanceId} className="flex items-center gap-1.5">
                        <div 
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))` }}
                        />
                        <span className="text-xs font-medium text-muted-foreground truncate max-w-24">{metric.name}</span>
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
                {/* Summary Statement */}
                {cashflowSummary && cashflowSummary.length > 0 && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    {cashflowSummary.map(summary => (
                      <div key={summary.name} className="flex justify-between items-center">
                        <span className="font-medium">{summary.name}:</span>
                        <span>{formatCurrency(summary.startValue)} → {formatCurrency(summary.endValue)} ({summary.growth > 0 ? '+' : ''}{summary.growth.toFixed(1)}%)</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className={`${isMobile ? "h-64" : "h-80"} overflow-hidden`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={timelineData} 
                      margin={{ 
                        top: 10, 
                        right: isMobile ? 8 : 20, 
                        left: isMobile ? 8 : 20, 
                        bottom: 10 
                      }}
                    >
                      <XAxis 
                        dataKey="year" 
                        fontSize={isMobile ? 10 : 12}
                        tickLine={false}
                        axisLine={false}
                        interval={isMobile ? 1 : 0}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={(value) => {
                          if (isMobile) {
                            return value >= 1000 ? `$${(value / 1000).toFixed(1)}K` : `$${value.toFixed(0)}`;
                          }
                          return formatCurrency(value);
                        }}
                        fontSize={isMobile ? 9 : 11}
                        tickLine={false}
                        axisLine={false}
                        width={isMobile ? 45 : 80}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value) => [formatCurrency(value as number), ""]}
                      />
                      {!isMobile && (
                        <Legend 
                          wrapperStyle={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}
                          iconType="rect"
                        />
                      )}
                      {selectedMetrics.map((metric, index) => (
                        <Bar
                          key={`${metric.instanceId}_cashflow`}
                          dataKey={`${metric.name}_cashflow`}
                          fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                          name={metric.name}
                          radius={[2, 2, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
                
                
                {/* Mobile Legend */}
                {isMobile && selectedMetrics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                    {selectedMetrics.map((metric, index) => (
                      <div key={metric.instanceId} className="flex items-center gap-1.5">
                        <div 
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))` }}
                        />
                        <span className="text-xs font-medium text-muted-foreground truncate max-w-24">{metric.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Shared Year Range Slider */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Timeline Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Display Period:</span>
                  <span className="text-sm text-muted-foreground">
                    Year {startYear} - {startYear + 9} (10 years)
                  </span>
                </div>
                <Slider
                  value={[startYear]}
                  onValueChange={([value]) => setStartYear(value)}
                  max={21}
                  min={1}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Years 1-10</span>
                  <span>Years 6-15</span>
                  <span>Years 11-20</span>
                  <span>Years 16-25</span>
                  <span>Years 21-30</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Mobile: Additional chart info */}
          {isMobile && (
            <Card className="sm:hidden">
              <CardContent className="pt-4">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Equity projections: 7% annual property growth</p>
                  <p>• Cashflow projections: 4% rental growth minus 3% expense inflation</p>
                  <p>• Tap chart points for detailed values</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}