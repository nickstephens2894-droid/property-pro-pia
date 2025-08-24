import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DollarSign, AlertTriangle, CheckCircle, TrendingUp, ChevronDown, ChevronRight } from "lucide-react";
import { usePropertyData } from "@/contexts/PropertyDataContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { PROPERTY_METHODS, FUNDING_METHODS } from "@/types/presets";

export const FundingSummaryPanel = () => {
  const { propertyData, calculateTotalProjectCost, calculateEquityLoanAmount, calculateAvailableEquity, calculateHoldingCosts } = usePropertyData();
  const isMobile = useIsMobile();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    if (isMobile) {
      // On mobile, only allow one section open at a time
      setExpandedSections(prev => 
        prev.includes(section) 
          ? []  // Close if already open
          : [section]  // Open only this section
      );
    } else {
      // On desktop, allow multiple sections open
      setExpandedSections(prev => 
        prev.includes(section) 
          ? prev.filter(s => s !== section)
          : [...prev, section]
      );
    }
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
  // Pre-calculate commonly used values
  const holdingCosts = calculateHoldingCosts();
  
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
        {/* Selected Presets */}
        {(propertyData.currentPropertyMethod || propertyData.currentFundingMethod) && (
          <div className="flex flex-wrap items-center gap-2 p-2 bg-muted/30 border border-border rounded">
            <span className="text-xs text-muted-foreground">Selected:</span>
            {propertyData.currentPropertyMethod && (
              <Badge variant="secondary">
                {PROPERTY_METHODS[propertyData.currentPropertyMethod].name}
              </Badge>
            )}
            {propertyData.currentFundingMethod && (
              <Badge variant="outline">
                {FUNDING_METHODS[propertyData.currentFundingMethod].name}
              </Badge>
            )}
          </div>
        )}
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

            {/* Detailed Interest During Construction */}
            {propertyData.isConstructionProject && (propertyData.constructionPeriod > 0 && propertyData.constructionInterestRate > 0) && (
              <Collapsible open={expandedSections.includes('holding-interest')} onOpenChange={() => toggleSection('holding-interest')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-sm hover:bg-muted/50 p-2 rounded">
                  <span>Interest During Construction</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">${holdingCosts.total > 0 ? holdingCosts.total.toLocaleString() : '0'}</span>
                    {expandedSections.includes('holding-interest') ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-3">
                  {/* Construction Parameters */}
                  <div className="bg-muted/30 p-3 rounded space-y-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Construction Parameters</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Period</span>
                        <span className="font-medium">{propertyData.constructionPeriod} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Interest Rate</span>
                        <span className="font-medium">{propertyData.constructionInterestRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Funding Method</span>
                        <span className="font-medium capitalize">{propertyData.holdingCostFunding}</span>
                      </div>
                      {propertyData.holdingCostFunding === 'hybrid' && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cash %</span>
                          <span className="font-medium">{propertyData.holdingCostCashPercentage}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interest Breakdown by Category */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Interest by Cost Category</div>
                    
                    {/* Land & Acquisition Costs */}
                    <div className="border rounded p-2 space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span>Land & Acquisition Costs</span>
                        <span>${(holdingCosts.landInterest + holdingCosts.stampDutyInterest).toLocaleString()}</span>
                      </div>
                      <div className="pl-2 space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>• Land value interest (${propertyData.landValue.toLocaleString()})</span>
                          <span>${holdingCosts.landInterest.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Stamp duty interest (${propertyData.stampDuty.toLocaleString()})</span>
                          <span>${holdingCosts.stampDutyInterest.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-xs text-orange-600 italic pl-2">Full amount from day 1</div>
                    </div>

                    {/* Construction Costs */}
                    <div className="border rounded p-2 space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span>Construction Costs</span>
                        <span>${holdingCosts.constructionInterest.toLocaleString()}</span>
                      </div>
                      <div className="pl-2 space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>• Construction value (${propertyData.constructionValue.toLocaleString()})</span>
                          <span>${holdingCosts.constructionInterest.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-xs text-blue-600 italic pl-2">Progressive drawdown (50% average)</div>
                    </div>

                    {/* Development & Professional Fees */}
                    {holdingCosts.developmentCostsInterest > 0 && (
                      <div className="border rounded p-2 space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span>Development & Professional Fees</span>
                          <span>${holdingCosts.developmentCostsInterest.toLocaleString()}</span>
                        </div>
                        <div className="pl-2 space-y-1 text-xs text-muted-foreground">
                          {propertyData.councilFees > 0 && (
                            <div className="flex justify-between">
                              <span>• Council fees (${propertyData.councilFees.toLocaleString()})</span>
                              <span>${Math.round(propertyData.councilFees * ((Math.pow(1 + propertyData.constructionInterestRate/100, propertyData.constructionPeriod/12) - 1))).toLocaleString()}</span>
                            </div>
                          )}
                          {propertyData.architectFees > 0 && (
                            <div className="flex justify-between">
                              <span>• Architect fees (${propertyData.architectFees.toLocaleString()})</span>
                              <span>${Math.round(propertyData.architectFees * ((Math.pow(1 + propertyData.constructionInterestRate/100, propertyData.constructionPeriod/12) - 1))).toLocaleString()}</span>
                            </div>
                          )}
                          {propertyData.siteCosts > 0 && (
                            <div className="flex justify-between">
                              <span>• Site costs (${propertyData.siteCosts.toLocaleString()})</span>
                              <span>${Math.round(propertyData.siteCosts * ((Math.pow(1 + propertyData.constructionInterestRate/100, propertyData.constructionPeriod/12) - 1))).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-green-600 italic pl-2">Paid upfront or early construction</div>
                      </div>
                    )}

                    {/* Transaction Costs */}
                    {holdingCosts.transactionCostsInterest > 0 && (
                      <div className="border rounded p-2 space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span>Transaction Costs</span>
                          <span>${holdingCosts.transactionCostsInterest.toLocaleString()}</span>
                        </div>
                        <div className="pl-2 space-y-1 text-xs text-muted-foreground">
                          <div className="flex justify-between">
                            <span>• Legal fees (${propertyData.legalFees.toLocaleString()})</span>
                            <span>${holdingCosts.transactionCostsInterest.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="text-xs text-purple-600 italic pl-2">Upfront costs only</div>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="bg-primary/5 border border-primary/20 p-3 rounded">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Total Interest During Construction</span>
                      <span>${holdingCosts.total.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <div className="flex justify-between">
                        <span>Monthly average</span>
                        <span>${Math.round(holdingCosts.total / propertyData.constructionPeriod).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-xs text-green-600 mt-2 italic">
                      ✓ Tax-deductible construction interest
                    </div>
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
                <span>Main Loan ({(propertyData.mainLoanType || 'pi').toUpperCase()})</span>
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
                  <span>{purchaseCosts > 0 ? ((mainLoanAmount / purchaseCosts) * 100).toFixed(1) : 0}%</span>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Equity Loan */}
            {propertyData.useEquityFunding && (
              <Collapsible open={expandedSections.includes('equity-loan')} onOpenChange={() => toggleSection('equity-loan')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-sm hover:bg-muted/50 p-2 rounded">
                  <span>Equity Loan ({(propertyData.equityLoanType || 'pi').toUpperCase()})</span>
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

      </CardContent>
    </Card>
  );
};