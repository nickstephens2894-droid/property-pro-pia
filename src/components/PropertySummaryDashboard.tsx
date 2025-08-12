import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TrendingUp, TrendingDown, DollarSign, Calculator, AlertCircle, PiggyBank, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

interface SummaryMetric {
  label: string;
  value: string;
  sublabel?: string;
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  icon: React.ComponentType<{
    className?: string;
  }>;
}
interface PropertySummaryDashboardProps {
  weeklyCashflowYear1: number;
  taxSavingsYear1: number;
  taxSavingsTotal: number;
  netEquityAtYearTo: number;
  roiAtYearTo: number;
  yearTo: number;
}
export const PropertySummaryDashboard = ({
  weeklyCashflowYear1,
  taxSavingsYear1,
  taxSavingsTotal,
  netEquityAtYearTo,
  roiAtYearTo,
  yearTo
}: PropertySummaryDashboardProps) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(true);
  
  // Add safety checks for undefined values
  const safeWeeklyCashflow = weeklyCashflowYear1 ?? 0;
  const safeTaxSavingsYear1 = taxSavingsYear1 ?? 0;
  const safeTaxSavingsTotal = taxSavingsTotal ?? 0;
  const safeNetEquity = netEquityAtYearTo ?? 0;
  const safeROI = roiAtYearTo ?? 0;
  const safeYearTo = yearTo ?? 1;
  
  const heroMetrics: SummaryMetric[] = [{
    label: "Weekly Cashflow Year 1",
    value: `$${Math.round(safeWeeklyCashflow).toLocaleString()}`,
    sublabel: "After-tax weekly",
    type: safeWeeklyCashflow >= 0 ? 'positive' : 'negative',
    icon: DollarSign
  }, {
    label: "Tax Savings Year 1",
    value: `$${Math.round(Math.abs(safeTaxSavingsYear1)).toLocaleString()}`,
    sublabel: "Annual benefit",
    type: safeTaxSavingsYear1 >= 0 ? 'positive' : 'warning',
    icon: Calculator
  }, {
    label: `Tax Savings Total (Year ${safeYearTo})`,
    value: `$${Math.round(Math.abs(safeTaxSavingsTotal)).toLocaleString()}`,
    sublabel: `Cumulative to year ${safeYearTo}`,
    type: safeTaxSavingsTotal >= 0 ? 'positive' : 'warning',
    icon: PiggyBank
  }];
  const getMetricStyles = (type: SummaryMetric['type']) => {
    switch (type) {
      case 'positive':
        return {
          card: 'bg-gradient-to-br from-success/10 to-success/5 border-success/20',
          value: 'text-success',
          icon: 'text-success'
        };
      case 'negative':
        return {
          card: 'bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20',
          value: 'text-destructive',
          icon: 'text-destructive'
        };
      case 'warning':
        return {
          card: 'bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20',
          value: 'text-warning',
          icon: 'text-warning'
        };
      default:
        return {
          card: 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20',
          value: 'text-primary',
          icon: 'text-primary'
        };
    }
  };
  return (
    <Card className="bg-card border shadow-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground">
                Investment Results
              </CardTitle>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-6">
            {/* Hero Metrics - Main KPIs */}
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
              {heroMetrics.map((metric, index) => {
                const styles = getMetricStyles(metric.type);
                const Icon = metric.icon;
                
                return (
                  <Card key={index} className={`transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${styles.card} border`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {metric.label}
                        </CardTitle>
                        <div className={`p-2 rounded-full bg-background/50 ${styles.icon}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className={`text-3xl font-bold ${styles.value} mb-1`}>
                        {metric.value}
                      </div>
                      {metric.sublabel && (
                        <p className="text-xs text-muted-foreground">
                          {metric.sublabel}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* Net Equity and ROI - Side by side */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {/* Net Equity at Year To */}
              <Card className="bg-muted/20 border-muted/50">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <div className="text-3xl font-bold text-primary">
                      ${Math.round(safeNetEquity).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Net Equity at End of Year {safeYearTo}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Property value minus loan balances
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* ROI at Year To */}
              <Card className="bg-muted/20 border-muted/50">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <div className={`text-3xl font-bold ${safeROI >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {Math.round(safeROI)}%
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      ROI at End of Year {safeYearTo}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Net equity / cumulative cash contribution
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};