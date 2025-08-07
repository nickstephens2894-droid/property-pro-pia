import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DollarSign, AlertTriangle, CheckCircle, TrendingUp, ChevronDown, ChevronRight } from "lucide-react";
import { usePropertyData } from "@/contexts/PropertyDataContext";
import { useState } from "react";

export const FundingSummaryPanel = () => {
  const { propertyData, calculateTotalProjectCost, calculateEquityLoanAmount, calculateAvailableEquity } = usePropertyData();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Calculate breakdown for display
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

  // Calculate total purchase costs using centralized function
  const totalPurchaseCost = calculateTotalProjectCost();
  
  // Calculate funding sources using centralized function
  const mainLoanAmount = propertyData.loanAmount;
  const equityLoanAmount = calculateEquityLoanAmount();
  const availableEquity = calculateAvailableEquity();
  
  // Use the actual deposit amount entered by the user
  const cashDeposit = propertyData.depositAmount;
  const totalFunding = mainLoanAmount + equityLoanAmount + cashDeposit;
  const fundingCoverage = totalPurchaseCost > 0 ? (totalFunding / totalPurchaseCost) * 100 : 0;
  const fundingShortfall = Math.max(0, totalPurchaseCost - totalFunding);

  const getFundingStatus = () => {
    if (fundingShortfall === 0) return 'complete';
    if (fundingShortfall <= totalPurchaseCost * 0.05) return 'warning'; // 5% threshold
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
            
            {/* Main Purchase Cost */}
            <Collapsible open={expandedSections.includes('purchase-base')} onOpenChange={() => toggleSection('purchase-base')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full text-sm hover:bg-muted/50 p-2 rounded">
                <span>
                  {propertyData.isConstructionProject ? 'Land + Construction' : 'Purchase Price'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">${purchaseCosts.toLocaleString()}</span>
                  {expandedSections.includes('purchase-base') ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 space-y-1">
                {propertyData.isConstructionProject ? (
                  <>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Land Value</span>
                      <span>${propertyData.landValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Construction Value</span>
                      <span>${propertyData.constructionValue.toLocaleString()}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Property Purchase Price</span>
                    <span>${propertyData.purchasePrice.toLocaleString()}</span>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Transaction Costs */}
            <Collapsible open={expandedSections.includes('transaction-costs')} onOpenChange={() => toggleSection('transaction-costs')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full text-sm hover:bg-muted/50 p-2 rounded">
                <span>Transaction Costs</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">${totalTransactionCosts.toLocaleString()}</span>
                  {expandedSections.includes('transaction-costs') ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Stamp Duty</span>
                  <span>${propertyData.stampDuty.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Legal Fees</span>
                  <span>${propertyData.legalFees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Inspection Fees</span>
                  <span>${propertyData.inspectionFees.toLocaleString()}</span>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Development Costs (Construction only) */}
            {propertyData.isConstructionProject && (
              <Collapsible open={expandedSections.includes('development-costs')} onOpenChange={() => toggleSection('development-costs')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-sm hover:bg-muted/50 p-2 rounded">
                  <span>Development Costs</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">${totalConstructionCosts.toLocaleString()}</span>
                    {expandedSections.includes('development-costs') ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Council Fees</span>
                    <span>${propertyData.councilFees.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Architect Fees</span>
                    <span>${propertyData.architectFees.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Site Costs</span>
                    <span>${propertyData.siteCosts.toLocaleString()}</span>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Construction Holding Interest (Construction only) */}
            {propertyData.isConstructionProject && propertyData.constructionHoldingInterest > 0 && (
              <Collapsible open={expandedSections.includes('holding-interest')} onOpenChange={() => toggleSection('holding-interest')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-sm hover:bg-muted/50 p-2 rounded">
                  <span>Construction Holding Interest</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">${propertyData.constructionHoldingInterest.toLocaleString()}</span>
                    {expandedSections.includes('holding-interest') ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Construction Period</span>
                    <span>{propertyData.constructionPeriod} months</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Interest Rate</span>
                    <span>{propertyData.constructionInterestRate}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Funding Method</span>
                    <span className="capitalize">{propertyData.holdingCostFunding}</span>
                  </div>
                  {propertyData.holdingCostFunding === 'hybrid' && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Cash Percentage</span>
                      <span>{propertyData.holdingCostCashPercentage}%</span>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground/80 mt-1 italic">
                    Tax-deductible construction interest
                  </div>
                </CollapsibleContent>
              </Collapsible>
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
            
            {/* Main Loan */}
            <Collapsible open={expandedSections.includes('main-loan')} onOpenChange={() => toggleSection('main-loan')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full text-sm hover:bg-muted/50 p-2 rounded">
                <span>Main Loan ({propertyData.mainLoanType.toUpperCase()})</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">${mainLoanAmount.toLocaleString()}</span>
                  {expandedSections.includes('main-loan') ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Interest Rate</span>
                  <span>{propertyData.interestRate}%</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Loan Term</span>
                  <span>{propertyData.loanTerm} years</span>
                </div>
                {propertyData.mainLoanType === 'io' && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>IO Period</span>
                    <span>{propertyData.ioTermYears} years</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>LVR</span>
                  <span>{totalPurchaseCost > 0 ? ((mainLoanAmount / totalPurchaseCost) * 100).toFixed(1) : 0}%</span>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Equity Loan */}
            {propertyData.useEquityFunding && (
              <Collapsible open={expandedSections.includes('equity-loan')} onOpenChange={() => toggleSection('equity-loan')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-sm hover:bg-muted/50 p-2 rounded">
                  <span>Equity Loan ({propertyData.equityLoanType.toUpperCase()})</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">${equityLoanAmount.toLocaleString()}</span>
                    {expandedSections.includes('equity-loan') ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Interest Rate</span>
                    <span>{propertyData.equityLoanInterestRate}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Loan Term</span>
                    <span>{propertyData.equityLoanTerm} years</span>
                  </div>
                  {propertyData.equityLoanType === 'io' && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>IO Period</span>
                      <span>{propertyData.equityLoanIoTermYears} years</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Primary Property Value</span>
                    <span>${propertyData.primaryPropertyValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Available Equity</span>
                    <span>${availableEquity.toLocaleString()}</span>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Cash Deposit */}
            <Collapsible open={expandedSections.includes('cash-deposit')} onOpenChange={() => toggleSection('cash-deposit')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full text-sm hover:bg-muted/50 p-2 rounded">
                <span>Cash Deposit</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">${cashDeposit.toLocaleString()}</span>
                  {expandedSections.includes('cash-deposit') ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 space-y-1">
                {propertyData.useEquityFunding ? (
                  <div className="text-xs text-muted-foreground">
                    Using equity funding - no cash deposit required
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Cash contribution towards purchase
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
            
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total Funding</span>
              <span className="text-primary">${totalFunding.toLocaleString()}</span>
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
          
          <Collapsible open={expandedSections.includes('lvr-details')} onOpenChange={() => toggleSection('lvr-details')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <div className="grid grid-cols-2 gap-4 text-sm flex-1">
                <div>
                  <span className="text-muted-foreground">Main LVR:</span>
                  <div className="font-medium">
                    {totalPurchaseCost > 0 ? ((mainLoanAmount / totalPurchaseCost) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total LVR:</span>
                  <div className="font-medium">
                    {totalPurchaseCost > 0 ? (((mainLoanAmount + equityLoanAmount) / totalPurchaseCost) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
              {expandedSections.includes('lvr-details') ? 
                <ChevronDown className="h-4 w-4 ml-2" /> : 
                <ChevronRight className="h-4 w-4 ml-2" />
              }
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-2">
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Main Loan Amount:</span>
                  <span>${mainLoanAmount.toLocaleString()}</span>
                </div>
                {propertyData.useEquityFunding && (
                  <div className="flex justify-between">
                    <span>Equity Loan Amount:</span>
                    <span>${equityLoanAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Total Loan Amount:</span>
                  <span>${(mainLoanAmount + equityLoanAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Property Value:</span>
                  <span>${totalPurchaseCost.toLocaleString()}</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
};