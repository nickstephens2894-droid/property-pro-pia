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
  weeklyAfterTaxCashFlow: number;
  grossYield: number;
  cashOnCashReturn: number;
  taxDifference: number;
  annualRent: number;
  totalExpenses: number;
  marginalTaxRate: number;
  totalProjectCost: number;
  actualCashInvested: number;
  isConstructionProject: boolean;
}
export const PropertySummaryDashboard = ({
  weeklyAfterTaxCashFlow,
  grossYield,
  cashOnCashReturn,
  taxDifference,
  annualRent,
  totalExpenses,
  marginalTaxRate,
  totalProjectCost,
  actualCashInvested,
  isConstructionProject
}: PropertySummaryDashboardProps) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(true);
  const heroMetrics: SummaryMetric[] = [{
    label: "Weekly Cash Flow",
    value: `$${weeklyAfterTaxCashFlow.toFixed(2)}`,
    sublabel: "After-tax",
    type: weeklyAfterTaxCashFlow >= 0 ? 'positive' : 'negative',
    icon: DollarSign
  }, {
    label: "Gross Yield",
    value: `${grossYield.toFixed(2)}%`,
    sublabel: "Before expenses",
    type: 'neutral',
    icon: TrendingUp
  }, {
    label: taxDifference <= 0 ? "Tax Savings" : "Additional Tax",
    value: `$${Math.abs(taxDifference).toLocaleString()}`,
    sublabel: taxDifference <= 0 ? "Annual benefit" : "Annual cost",
    type: taxDifference <= 0 ? 'positive' : 'warning',
    icon: Calculator
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
                Investment Summary
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
            
            {/* Secondary Metrics - More detailed view */}
            <Card className="bg-muted/20 border-muted/50">
              <CardContent className="pt-6">
                <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
                  <div className="text-center space-y-2">
                    <div className={`text-xl font-bold ${cashOnCashReturn >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      {cashOnCashReturn.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Cash-on-Cash Return</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-xl font-bold text-foreground">
                      ${totalProjectCost.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Total Investment</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-xl font-bold text-foreground">
                      ${actualCashInvested.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Cash Required</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-xl font-bold text-foreground">
                      ${annualRent.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Annual Rent</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};