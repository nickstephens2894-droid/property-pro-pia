import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Calculator, AlertCircle, PiggyBank } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
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
  return <div className="space-y-6">
      {/* Hero Metrics */}
      <Card className="w-full">
        <CardHeader className="bg-gradient-to-r from-card to-accent border-b">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <TrendingUp className="h-5 w-5" />
            Investment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
            {heroMetrics.map((metric, index) => {
            const styles = getMetricStyles(metric.type);
            const Icon = metric.icon;
            return <div key={index} className={`p-4 rounded-lg border transition-all hover:shadow-md ${styles.card}`}>
                  <div className="flex items-start justify-between mb-3">
                    <Icon className={`h-5 w-5 ${styles.icon}`} />
                    {metric.type === 'negative' && <TrendingDown className="h-4 w-4 text-destructive" />}
                    {metric.type === 'positive' && <TrendingUp className="h-4 w-4 text-success" />}
                  </div>
                  <div className={`text-2xl font-bold mb-1 ${styles.value}`}>
                    {metric.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {metric.label}
                  </div>
                  {metric.sublabel && <div className="text-xs text-muted-foreground mt-1">
                      {metric.sublabel}
                    </div>}
                </div>;
          })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="w-full">
        
        
      </Card>
    </div>;
};