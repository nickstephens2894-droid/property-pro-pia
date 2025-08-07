import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { DollarSign, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { PropertyData } from "@/contexts/PropertyDataContext";

interface FundingSummaryProps {
  propertyData: PropertyData;
}

export const FundingSummaryPanel = ({ propertyData }: FundingSummaryProps) => {
  // Calculate total purchase costs
  const purchaseCosts = propertyData.isConstructionProject
    ? propertyData.landValue + propertyData.constructionValue
    : propertyData.purchasePrice;
  
  const totalTransactionCosts = 
    propertyData.stampDuty + 
    propertyData.legalFees + 
    propertyData.inspectionFees;
  
  const totalConstructionCosts = propertyData.isConstructionProject
    ? propertyData.councilFees + propertyData.architectFees + propertyData.siteCosts
    : 0;
  
  const totalPurchaseCost = purchaseCosts + totalTransactionCosts + totalConstructionCosts;

  // Calculate funding sources
  const mainLoanAmount = propertyData.loanAmount;
  const equityLoanAmount = propertyData.useEquityFunding 
    ? Math.min(
        propertyData.primaryPropertyValue * (propertyData.maxLVR / 100) - propertyData.existingDebt,
        totalPurchaseCost - mainLoanAmount
      )
    : 0;
  
  const totalLoans = mainLoanAmount + equityLoanAmount;
  const cashRequired = Math.max(0, totalPurchaseCost - totalLoans);
  const fundingCoverage = totalPurchaseCost > 0 ? (totalLoans / totalPurchaseCost) * 100 : 0;
  const fundingShortfall = Math.max(0, totalPurchaseCost - totalLoans);

  const getFundingStatus = () => {
    if (fundingShortfall === 0) return 'complete';
    if (fundingShortfall <= cashRequired * 0.1) return 'warning';
    return 'error';
  };

  const status = getFundingStatus();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-primary" />
          Funding Summary
          {status === 'complete' && <CheckCircle className="h-4 w-4 text-success" />}
          {status === 'warning' && <AlertTriangle className="h-4 w-4 text-warning" />}
          {status === 'error' && <AlertTriangle className="h-4 w-4 text-destructive" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Purchase Cost Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Purchase Costs
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                {propertyData.isConstructionProject ? 'Land + Construction' : 'Purchase Price'}
              </span>
              <span className="font-medium">${purchaseCosts.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Transaction Costs</span>
              <span className="font-medium">${totalTransactionCosts.toLocaleString()}</span>
            </div>
            {propertyData.isConstructionProject && (
              <div className="flex justify-between text-sm">
                <span>Development Costs</span>
                <span className="font-medium">${totalConstructionCosts.toLocaleString()}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total Purchase Cost</span>
              <span className="text-primary">${totalPurchaseCost.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Funding Sources */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Funding Sources
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Main Loan ({propertyData.mainLoanType.toUpperCase()})</span>
              <span className="font-medium">${mainLoanAmount.toLocaleString()}</span>
            </div>
            {propertyData.useEquityFunding && (
              <div className="flex justify-between text-sm">
                <span>Equity Loan ({propertyData.equityLoanType.toUpperCase()})</span>
                <span className="font-medium">${equityLoanAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Cash Required</span>
              <span className="font-medium">${cashRequired.toLocaleString()}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total Funding</span>
              <span className="text-primary">${(totalLoans + cashRequired).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Funding Coverage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Funding Coverage
            </h4>
            <Badge variant={status === 'complete' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}>
              {fundingCoverage.toFixed(0)}%
            </Badge>
          </div>
          <Progress value={Math.min(100, fundingCoverage)} className="h-2" />
          
          {fundingShortfall > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                <AlertTriangle className="h-4 w-4" />
                Funding Shortfall
              </div>
              <div className="text-sm text-destructive/80 mt-1">
                ${fundingShortfall.toLocaleString()} additional funding required
              </div>
            </div>
          )}
          
          {fundingShortfall === 0 && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-success text-sm font-medium">
                <CheckCircle className="h-4 w-4" />
                Fully Funded
              </div>
              <div className="text-sm text-success/80 mt-1">
                All purchase costs are covered by loans and cash
              </div>
            </div>
          )}
        </div>

        {/* LVR Summary */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Loan Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Main LVR:</span>
              <div className="font-medium">
                {totalPurchaseCost > 0 ? ((mainLoanAmount / totalPurchaseCost) * 100).toFixed(1) : 0}%
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Total LVR:</span>
              <div className="font-medium">
                {totalPurchaseCost > 0 ? ((totalLoans / totalPurchaseCost) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};