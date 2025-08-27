import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

interface MobileFinancialSummaryProps {
  totalCost: number;
  totalFunding: number;
  fundingShortfall: number;
  weeklyRent: number;
  monthlyRepayment: number;
  weeklyCashFlow?: number;
}

export const MobileFinancialSummary = ({ 
  totalCost, 
  totalFunding, 
  fundingShortfall, 
  weeklyRent, 
  monthlyRepayment,
  weeklyCashFlow = 0
}: MobileFinancialSummaryProps) => {
  const fundingCoverage = totalCost > 0 ? (totalFunding / totalCost) * 100 : 0;
  const isFullyFunded = fundingShortfall === 0;
  const weeklyRepayment = monthlyRepayment / 4.33; // Convert monthly to weekly

  return (
    <Card className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b shadow-sm">
      <CardContent className="p-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Funding Status */}
          <div className="flex items-center gap-2">
            {isFullyFunded ? (
              <CheckCircle className="h-3 w-3 text-green-600" />
            ) : (
              <AlertTriangle className="h-3 w-3 text-amber-600" />
            )}
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">
                {formatCurrency(totalFunding)} / {formatCurrency(totalCost)}
              </div>
              <div className={`text-xs ${isFullyFunded ? 'text-green-600' : 'text-amber-600'}`}>
                {fundingCoverage.toFixed(0)}% Funded
              </div>
            </div>
          </div>

          {/* Weekly Cash Flow */}
          <div className="flex items-center gap-2">
            <TrendingUp className={`h-3 w-3 ${weeklyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">
                {weeklyCashFlow !== 0 ? formatCurrency(Math.abs(weeklyCashFlow)) : formatCurrency(weeklyRent - weeklyRepayment)}
              </div>
              <div className={`text-xs ${(weeklyCashFlow || (weeklyRent - weeklyRepayment)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(weeklyCashFlow || (weeklyRent - weeklyRepayment)) >= 0 ? 'Positive' : 'Negative'} Weekly CF
              </div>
            </div>
          </div>
        </div>

        {/* Shortfall Warning */}
        {fundingShortfall > 0 && (
          <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-amber-600 flex-shrink-0" />
              <span className="text-xs text-amber-800">
                Shortfall: {formatCurrency(fundingShortfall)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};