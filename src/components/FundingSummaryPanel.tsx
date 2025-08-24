import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Building2, 
  Coins, 
  TrendingUp,
  Eye,
  EyeOff
} from "lucide-react";
import { usePropertyData } from "@/contexts/PropertyDataContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { PROPERTY_METHODS, FUNDING_METHODS } from "@/types/presets";
import { formatCurrency } from "@/utils/formatters";

export const FundingSummaryPanel = () => {
  const { propertyData, calculateTotalProjectCost, calculateEquityLoanAmount, calculateAvailableEquity, calculateHoldingCosts } = usePropertyData();
  const isMobile = useIsMobile();
  const [showDetails, setShowDetails] = useState(false);
  
  // Calculate essential values
  const totalPurchaseCost = calculateTotalProjectCost();
  const mainLoanAmount = propertyData.loanAmount;
  const equityLoanAmount = calculateEquityLoanAmount();
  const cashDeposit = propertyData.depositAmount;
  const totalFunding = mainLoanAmount + equityLoanAmount + cashDeposit;
  const fundingCoverage = totalPurchaseCost > 0 ? (totalFunding / totalPurchaseCost) * 100 : 0;
  const fundingShortfall = Math.max(0, totalPurchaseCost - totalFunding);
  const holdingCosts = calculateHoldingCosts();
  
  // Calculate component costs
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

  const getFundingStatus = () => {
    if (fundingShortfall === 0) return 'complete';
    if (fundingShortfall <= totalPurchaseCost * 0.05) return 'warning';
    return 'error';
  };

  const status = getFundingStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                Funding & Finance Structure
                {status === 'complete' && <CheckCircle className="h-5 w-5 text-green-600" />}
                {status === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-600" />}
                {status === 'error' && <AlertTriangle className="h-5 w-5 text-red-600" />}
              </div>
              {(propertyData.currentPropertyMethod || propertyData.currentFundingMethod) && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {propertyData.currentPropertyMethod && (
                    <Badge variant="secondary" className="text-xs">
                      {PROPERTY_METHODS[propertyData.currentPropertyMethod].name}
                    </Badge>
                  )}
                  {propertyData.currentFundingMethod && (
                    <Badge variant="outline" className="text-xs">
                      {FUNDING_METHODS[propertyData.currentFundingMethod].name}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2"
            >
              {showDetails ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Hide Details
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Show Details
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Three Main Cards */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
        
        {/* 1. Purchase Costs Card */}
        <Card className="border-l-4 border-l-blue-500 bg-blue-50/30 hover:bg-blue-50/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-blue-700">
              <Building2 className="h-5 w-5" />
              Purchase Costs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {propertyData.isConstructionProject ? 'Land + Construction' : 'Property Price'}
                </span>
                <span className="font-semibold text-blue-700">
                  {formatCurrency(purchaseCosts)}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Transaction Costs</span>
                <span>{formatCurrency(totalTransactionCosts)}</span>
              </div>
              
              {propertyData.isConstructionProject && totalConstructionCosts > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Development Costs</span>
                  <span>{formatCurrency(totalConstructionCosts)}</span>
                </div>
              )}
              
              {propertyData.isConstructionProject && holdingCosts.total > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Interest During Construction</span>
                  <span>{formatCurrency(holdingCosts.total)}</span>
                </div>
              )}
            </div>
            
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between font-semibold">
                <span>Total Cost</span>
                <span className="text-blue-700 text-lg">
                  {formatCurrency(totalPurchaseCost)}
                </span>
              </div>
            </div>

            {/* Details accordion for costs */}
            {showDetails && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="cost-details" className="border-none">
                  <AccordionTrigger className="text-sm py-2 hover:no-underline">
                    View Breakdown
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-xs">
                    {propertyData.isConstructionProject ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Land Value</span>
                          <span>{formatCurrency(propertyData.landValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Construction Value</span>
                          <span>{formatCurrency(propertyData.constructionValue)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Purchase Price</span>
                        <span>{formatCurrency(propertyData.purchasePrice)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stamp Duty</span>
                      <span>{formatCurrency(propertyData.stampDuty)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Legal Fees</span>
                      <span>{formatCurrency(propertyData.legalFees)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Inspection Fees</span>
                      <span>{formatCurrency(propertyData.inspectionFees)}</span>
                    </div>
                    {propertyData.isConstructionProject && (
                      <>
                        {propertyData.councilFees > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Council Fees</span>
                            <span>{formatCurrency(propertyData.councilFees)}</span>
                          </div>
                        )}
                        {propertyData.architectFees > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Architect Fees</span>
                            <span>{formatCurrency(propertyData.architectFees)}</span>
                          </div>
                        )}
                        {propertyData.siteCosts > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Site Costs</span>
                            <span>{formatCurrency(propertyData.siteCosts)}</span>
                          </div>
                        )}
                      </>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* 2. Funding Sources Card */}
        <Card className="border-l-4 border-l-green-500 bg-green-50/30 hover:bg-green-50/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-green-700">
              <Coins className="h-5 w-5" />
              Funding Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {mainLoanAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Main Loan</span>
                  <span className="font-semibold text-green-700">
                    {formatCurrency(mainLoanAmount)}
                  </span>
                </div>
              )}
              
              {propertyData.useEquityFunding && equityLoanAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Equity Loan</span>
                  <span className="font-semibold text-green-700">
                    {formatCurrency(equityLoanAmount)}
                  </span>
                </div>
              )}
              
              {cashDeposit > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cash Deposit</span>
                  <span className="font-semibold text-green-700">
                    {formatCurrency(cashDeposit)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between font-semibold">
                <span>Total Funding</span>
                <span className="text-green-700 text-lg">
                  {formatCurrency(totalFunding)}
                </span>
              </div>
            </div>

            {/* Details accordion for funding */}
            {showDetails && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="funding-details" className="border-none">
                  <AccordionTrigger className="text-sm py-2 hover:no-underline">
                    View Details
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 text-xs">
                    {mainLoanAmount > 0 && (
                      <div className="space-y-1">
                        <div className="font-medium">Main Loan ({(propertyData.mainLoanType || 'pi').toUpperCase()})</div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Interest Rate</span>
                          <span>{propertyData.isConstructionProject ? propertyData.constructionInterestRate : propertyData.interestRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Term</span>
                          <span>{propertyData.loanTerm} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">LVR</span>
                          <span>{purchaseCosts > 0 ? ((mainLoanAmount / purchaseCosts) * 100).toFixed(1) : 0}%</span>
                        </div>
                      </div>
                    )}
                    
                    {propertyData.useEquityFunding && equityLoanAmount > 0 && (
                      <div className="space-y-1">
                        <div className="font-medium">Equity Loan ({(propertyData.equityLoanType || 'pi').toUpperCase()})</div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Interest Rate</span>
                          <span>{propertyData.equityLoanInterestRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Term</span>
                          <span>{propertyData.equityLoanTerm} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Available Equity</span>
                          <span>{formatCurrency(calculateAvailableEquity())}</span>
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* 3. Funding Status Card */}
        <Card className={`border-l-4 transition-colors ${
          status === 'complete' 
            ? 'border-l-green-500 bg-green-50/30 hover:bg-green-50/50' 
            : status === 'warning'
            ? 'border-l-amber-500 bg-amber-50/30 hover:bg-amber-50/50'
            : 'border-l-red-500 bg-red-50/30 hover:bg-red-50/50'
        }`}>
          <CardHeader className="pb-3">
            <CardTitle className={`flex items-center gap-2 text-base ${
              status === 'complete' 
                ? 'text-green-700'
                : status === 'warning'
                ? 'text-amber-700'
                : 'text-red-700'
            }`}>
              <TrendingUp className="h-5 w-5" />
              Coverage Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                status === 'complete' 
                  ? 'text-green-700'
                  : status === 'warning'
                  ? 'text-amber-700'
                  : 'text-red-700'
              }`}>
                {fundingCoverage.toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Funding Coverage</div>
            </div>
            
            <Progress 
              value={Math.min(100, fundingCoverage)} 
              className={`h-3 ${
                status === 'complete' 
                  ? '[&>div]:bg-green-600'
                  : status === 'warning'
                  ? '[&>div]:bg-amber-600'
                  : '[&>div]:bg-red-600'
              }`}
            />
            
            {fundingShortfall > 0 && (
              <div className="text-center">
                <div className="text-sm font-medium text-red-700">
                  Shortfall: {formatCurrency(fundingShortfall)}
                </div>
                <div className="text-xs text-red-600">
                  Additional funding needed
                </div>
              </div>
            )}
            
            {fundingShortfall === 0 && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  Fully Funded
                </div>
                <div className="text-xs text-green-600">
                  All costs are covered
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-2 border-t">
              <Badge 
                variant={status === 'complete' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}
                className="w-full justify-center"
              >
                {status === 'complete' ? '✓ Ready to Proceed' 
                  : status === 'warning' ? '⚠ Review Required'
                  : '⚠ Action Needed'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats (Mobile Only) */}
      {isMobile && (
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-blue-700">
                  {formatCurrency(totalPurchaseCost)}
                </div>
                <div className="text-xs text-muted-foreground">Total Cost</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-700">
                  {formatCurrency(totalFunding)}
                </div>
                <div className="text-xs text-muted-foreground">Total Funding</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};