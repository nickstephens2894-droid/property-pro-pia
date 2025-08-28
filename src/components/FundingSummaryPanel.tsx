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
  EyeOff,
  ChevronRight
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
    <div className="space-y-4">
      {/* Main Header */}
      <Card className="w-full border-l-4 border-l-primary">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl font-semibold">
                  Funding & Finance Structure
                </CardTitle>
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
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="min-h-[44px] px-4"
            >
              {showDetails ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  {!isMobile && "Hide Details"}
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  {!isMobile && "Show Details"}
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Three Main Summary Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        
        {/* Purchase Costs Summary */}
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/50 to-blue-100/30 hover:from-blue-50/70 hover:to-blue-100/50 transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Building2 className="h-5 w-5" />
              <span className="text-base font-semibold">Total Costs</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {formatCurrency(totalPurchaseCost)}
              </div>
              <div className="text-sm text-muted-foreground">
                {propertyData.isConstructionProject ? 'Land + Construction + Costs' : 'Purchase + Transaction Costs'}
              </div>
            </div>
            
            {/* Key Cost Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  {propertyData.isConstructionProject ? 'Land + Construction' : 'Purchase Price'}
                </span>
                <span className="font-medium">{formatCurrency(purchaseCosts)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Transaction Costs</span>
                <span className="font-medium">{formatCurrency(totalTransactionCosts)}</span>
              </div>
              {propertyData.isConstructionProject && totalConstructionCosts > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Development Costs</span>
                  <span className="font-medium">{formatCurrency(totalConstructionCosts)}</span>
                </div>
              )}
              {propertyData.isConstructionProject && holdingCosts.total > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Interest During Construction</span>
                  <span className="font-medium">{formatCurrency(holdingCosts.total)}</span>
                </div>
              )}
            </div>

            {/* Detailed Breakdown (Expandable) */}
            {showDetails && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="cost-breakdown" className="border-none">
                    <AccordionTrigger className="text-sm py-2 text-blue-700 hover:no-underline min-h-[44px]">
                      <span className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        Detailed Breakdown
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 text-xs pt-2">
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Funding Sources Summary */}
        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50/50 to-green-100/30 hover:from-green-50/70 hover:to-green-100/50 transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Coins className="h-5 w-5" />
              <span className="text-base font-semibold">Total Funding</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-green-700 mb-1">
                {formatCurrency(totalFunding)}
              </div>
              <div className="text-sm text-muted-foreground">
                Available Funding Sources
              </div>
            </div>
            
            {/* Key Funding Sources */}
            <div className="space-y-2 text-sm">
              {mainLoanAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Main Loan</span>
                  <span className="font-medium">{formatCurrency(mainLoanAmount)}</span>
                </div>
              )}
              {propertyData.useEquityFunding && equityLoanAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Equity Loan</span>
                  <span className="font-medium">{formatCurrency(equityLoanAmount)}</span>
                </div>
              )}
              {cashDeposit > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cash Deposit</span>
                  <span className="font-medium">{formatCurrency(cashDeposit)}</span>
                </div>
              )}
            </div>

            {/* Detailed Funding Info (Expandable) */}
            {showDetails && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="funding-details" className="border-none">
                    <AccordionTrigger className="text-sm py-2 text-green-700 hover:no-underline min-h-[44px]">
                      <span className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        Loan Details
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 text-xs pt-2">
                      {mainLoanAmount > 0 && (
                        <div className="space-y-1 p-3 bg-white/50 rounded-lg">
                          <div className="font-medium text-green-700">Main Loan ({(propertyData.mainLoanType || 'pi').toUpperCase()})</div>
                          <div className="space-y-1">
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
                        </div>
                      )}
                      
                      {propertyData.useEquityFunding && equityLoanAmount > 0 && (
                        <div className="space-y-1 p-3 bg-white/50 rounded-lg">
                          <div className="font-medium text-green-700">Equity Loan ({(propertyData.equityLoanType || 'pi').toUpperCase()})</div>
                          <div className="space-y-1">
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
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Funding Coverage Status */}
        <Card className={`border-l-4 transition-all duration-200 ${
          status === 'complete' 
            ? 'border-l-green-500 bg-gradient-to-br from-green-50/50 to-green-100/30 hover:from-green-50/70 hover:to-green-100/50' 
            : status === 'warning'
            ? 'border-l-amber-500 bg-gradient-to-br from-amber-50/50 to-amber-100/30 hover:from-amber-50/70 hover:to-amber-100/50'
            : 'border-l-red-500 bg-gradient-to-br from-red-50/50 to-red-100/30 hover:from-red-50/70 hover:to-red-100/50'
        }`}>
          <CardHeader className="pb-3">
            <CardTitle className={`flex items-center gap-2 text-base font-semibold ${
              status === 'complete' 
                ? 'text-green-700'
                : status === 'warning'
                ? 'text-amber-700'
                : 'text-red-700'
            }`}>
              {status === 'complete' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              Coverage Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center mb-4">
              <div className={`text-3xl font-bold mb-2 ${
                status === 'complete' 
                  ? 'text-green-700'
                  : status === 'warning'
                  ? 'text-amber-700'
                  : 'text-red-700'
              }`}>
                {fundingCoverage.toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                Funding Coverage
              </div>
              
              <Progress 
                value={Math.min(100, fundingCoverage)} 
                className={`h-3 mb-3 ${
                  status === 'complete' 
                    ? '[&>div]:bg-green-600'
                    : status === 'warning'
                    ? '[&>div]:bg-amber-600'
                    : '[&>div]:bg-red-600'
                }`}
              />
            </div>
            
            {/* Status Message */}
            <div className="text-center">
              {fundingShortfall > 0 ? (
                <div className="space-y-2">
                  <div className="text-lg font-bold text-red-700">
                    {formatCurrency(fundingShortfall)}
                  </div>
                  <div className="text-sm text-red-600">
                    Funding Shortfall
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Fully Funded</span>
                  </div>
                  <div className="text-sm text-green-600">
                    All costs are covered
                  </div>
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className="mt-4 pt-4 border-t">
              <Badge 
                variant={status === 'complete' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}
                className="w-full justify-center py-2 text-sm font-medium min-h-[40px] items-center"
              >
                {status === 'complete' ? '✓ Ready to Proceed' 
                  : status === 'warning' ? '⚠ Review Required'
                  : '⚠ Action Needed'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Summary Footer */}
      {isMobile && (
        <Card className="bg-muted/20 border-dashed">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Total Cost</div>
                <div className="text-lg font-bold text-blue-700">
                  {formatCurrency(totalPurchaseCost)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Total Funding</div>
                <div className="text-lg font-bold text-green-700">
                  {formatCurrency(totalFunding)}
                </div>
              </div>
            </div>
            {fundingShortfall > 0 && (
              <div className="mt-3 pt-3 border-t text-center">
                <div className="text-sm font-medium text-muted-foreground">Shortfall</div>
                <div className="text-lg font-bold text-red-700">
                  {formatCurrency(fundingShortfall)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};