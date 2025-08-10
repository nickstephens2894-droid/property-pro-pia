import { useState } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, Wallet, CreditCard, Layers, Banknote, FileText, PiggyBank, Home, Landmark, TrendingUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { resolve } from "@/utils/overrides";

interface YearProjection {
  year: number;
  rentalIncome: number;
  propertyValue: number;
  mainLoanBalance: number;
  equityLoanBalance: number;
  totalInterest: number;
  mainLoanPayment: number;
  equityLoanPayment: number;
  mainInterestYear: number;
  equityInterestYear: number;
  mainLoanIOStatus: 'IO' | 'P&I';
  equityLoanIOStatus: 'IO' | 'P&I';
  otherExpenses: number;
  depreciation: number;
  taxableIncome: number;
  taxBenefit: number;
  afterTaxCashFlow: number;
  cumulativeCashFlow: number;
  propertyEquity: number;
  totalReturn: number;
}

interface ProjectionsTableProps {
  projections: YearProjection[];
  assumptions: any;
  validatedYearRange: [number, number];
  formatCurrency: (amount: number) => string;
  formatPercentage: (value: number) => string;
  viewMode?: 'year' | 'table';
}

const ProjectionsTable = ({ 
  projections, 
  assumptions, 
  validatedYearRange, 
  formatCurrency, 
  formatPercentage,
  viewMode = 'table'
}: ProjectionsTableProps) => {
  const isMobile = useIsMobile();
  const [showLoanDetails, setShowLoanDetails] = useState(false);
  const [showMortgageDetails, setShowMortgageDetails] = useState(false);
  const [showOperatingDetails, setShowOperatingDetails] = useState(false);
  const [showDepreciationDetails, setShowDepreciationDetails] = useState(false);
  const [showCashFlowDetails, setShowCashFlowDetails] = useState(false);
  const [currentYearIndex, setCurrentYearIndex] = useState(0);
  
  const filteredProjections = projections.filter(p => 
    p.year >= validatedYearRange[0] && p.year <= validatedYearRange[1]
  );

const isMobileView = isMobile || viewMode === 'year';

return (
  isMobileView ? (
    <MobileProjectionsView 
      projections={filteredProjections}
      assumptions={assumptions}
      currentYearIndex={currentYearIndex}
      setCurrentYearIndex={setCurrentYearIndex}
      showLoanDetails={showLoanDetails}
      setShowLoanDetails={setShowLoanDetails}
      formatCurrency={formatCurrency}
      formatPercentage={formatPercentage}
    />
  ) : (
    <DesktopProjectionsTable 
      projections={filteredProjections}
      assumptions={assumptions}
      showLoanDetails={showLoanDetails}
      setShowLoanDetails={setShowLoanDetails}
      showMortgageDetails={showMortgageDetails}
      setShowMortgageDetails={setShowMortgageDetails}
      showOperatingDetails={showOperatingDetails}
      setShowOperatingDetails={setShowOperatingDetails}
      showDepreciationDetails={showDepreciationDetails}
      setShowDepreciationDetails={setShowDepreciationDetails}
      showCashFlowDetails={showCashFlowDetails}
      setShowCashFlowDetails={setShowCashFlowDetails}
      formatCurrency={formatCurrency}
      formatPercentage={formatPercentage}
    />
  )
);
};


const MobileProjectionsView = ({ 
  projections, 
  assumptions, 
  currentYearIndex, 
  setCurrentYearIndex, 
  showLoanDetails, 
  setShowLoanDetails,
  formatCurrency, 
  formatPercentage 
}: any) => {
  const currentProjection = projections[currentYearIndex];
  
  if (!currentProjection) return null;

  const nextYear = () => {
    if (currentYearIndex < projections.length - 1) {
      setCurrentYearIndex(currentYearIndex + 1);
    }
  };

  const prevYear = () => {
    if (currentYearIndex > 0) {
      setCurrentYearIndex(currentYearIndex - 1);
    }
  };
  const incomeTotal = currentProjection.rentalIncome;
  const repaymentsTotal = currentProjection.mainLoanPayment + currentProjection.equityLoanPayment;
  const expensesTotal = repaymentsTotal + currentProjection.otherExpenses;
  const nonCashTotal = currentProjection.depreciation + Math.max(0, currentProjection.taxBenefit);
  const rentalPct = incomeTotal ? (currentProjection.rentalIncome / incomeTotal) * 100 : 0;
  const repaymentPct = expensesTotal ? (repaymentsTotal / expensesTotal) * 100 : 0;
  const operatingPct = expensesTotal ? (currentProjection.otherExpenses / expensesTotal) * 100 : 0;
  const depreciationPct = nonCashTotal ? (currentProjection.depreciation / nonCashTotal) * 100 : 0;
  const taxBenefitNonCashPct = nonCashTotal ? (Math.max(0, currentProjection.taxBenefit) / nonCashTotal) * 100 : 0;
  const taxTotal = currentProjection.taxBenefit;
  const weeklyCashflow = currentProjection.afterTaxCashFlow / 52;
  const equityRatio = currentProjection.propertyValue > 0 ? Math.max(0, Math.min(100, (currentProjection.propertyEquity / currentProjection.propertyValue) * 100)) : 0;
  const lvrRatio = Math.max(0, Math.min(100, 100 - equityRatio));

  // Expand/collapse state for sections (default collapsed)
  const [showIncomeDetails, setShowIncomeDetails] = useState(false);
  const [showExpensesDetails, setShowExpensesDetails] = useState(false);
  const [showValueDetails, setShowValueDetails] = useState(false);
  const [showEquityDetails, setShowEquityDetails] = useState(false);
  const [showTaxDetails, setShowTaxDetails] = useState(false);
  const [showCashFlowDetailsMobile, setShowCashFlowDetailsMobile] = useState(false);
  
  const expandAll = () => {
    setShowValueDetails(true);
    setShowEquityDetails(true);
    setShowLoanDetails(true);
    setShowExpensesDetails(true);
    setShowIncomeDetails(true);
    setShowTaxDetails(true);
    setShowCashFlowDetailsMobile(true);
  };
  const collapseAll = () => {
    setShowValueDetails(false);
    setShowEquityDetails(false);
    setShowLoanDetails(false);
    setShowExpensesDetails(false);
    setShowIncomeDetails(false);
    setShowTaxDetails(false);
    setShowCashFlowDetailsMobile(false);
  };
  
  const prevValue = currentYearIndex > 0 ? projections[currentYearIndex - 1].propertyValue : currentProjection.propertyValue;
  const yoyChange = prevValue > 0 ? ((currentProjection.propertyValue - prevValue) / prevValue) * 100 : 0;
  return (
    <div className="space-y-4">
      {/* Year Navigation moved to fixed bottom bar */}

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={expandAll}>Expand all</Button>
        <Button variant="ghost" size="sm" onClick={collapseAll}>Collapse all</Button>
      </div>

      {/* Mobile Metrics Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* Property Value */}
        <Card>
          <Collapsible open={showValueDetails} onOpenChange={setShowValueDetails}>
            <CollapsibleTrigger asChild>
              <CardContent className="pt-4 cursor-pointer">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    Property Value
                  </span>
                  <div className="flex items-center gap-2">
                    {showValueDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <span className="font-bold">{formatCurrency(currentProjection.propertyValue)}</span>
                  </div>
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {yoyChange >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-primary" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-destructive" />
                    )}
                    <span>YoY {Math.abs(yoyChange).toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Equity (moved under Property Value) */}
        <Card>
          <Collapsible open={showEquityDetails} onOpenChange={setShowEquityDetails}>
            <CollapsibleTrigger asChild>
              <CardContent className="pt-4 cursor-pointer">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    Equity
                  </span>
                  <div className="flex items-center gap-2">
                    {showEquityDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <span className={`font-bold ${currentProjection.propertyEquity < 0 ? 'text-destructive' : 'text-foreground'}`}>
                      {formatCurrency(currentProjection.propertyEquity)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Equity ratio</span>
                    <span>{Math.round(equityRatio)}%</span>
                  </div>
                  <Progress value={Math.round(equityRatio)} className="mt-1" />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Loans + Annual Repayments - Combined Expandable */}
        <Card>
          <Collapsible open={showLoanDetails} onOpenChange={setShowLoanDetails}>
            <CollapsibleTrigger asChild>
              <CardContent className="pt-4 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Loans</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {showLoanDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <span className="font-bold">{formatCurrency(currentProjection.mainLoanBalance + currentProjection.equityLoanBalance)}</span>
                  </div>
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Main Loan Balance</span>
                    <span className="font-bold">{formatCurrency(currentProjection.mainLoanBalance)}</span>
                  </div>
                  {assumptions.initialEquityLoanBalance > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Equity Loan Balance</span>
                      <span className="font-bold">{formatCurrency(currentProjection.equityLoanBalance)}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>LVR</span>
                    <span>{Math.round(lvrRatio)}%</span>
                  </div>
                  <Progress value={Math.round(lvrRatio)} className="mt-1" />
                </div>

                {/* Annual Repayments */}
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Annual repayments</span>
                    </div>
                    <span className="font-bold">{formatCurrency(repaymentsTotal)}</span>
                  </div>

                  {/* Main Loan Details */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 mt-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Main Loan ({assumptions.mainLoanType.toUpperCase()})</span>
                      <Badge variant={currentProjection.mainLoanIOStatus === 'IO' ? 'secondary' : 'default'}>
                        {currentProjection.mainLoanIOStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(assumptions.initialMainLoanBalance)} @ {formatPercentage(assumptions.mainInterestRate)}
                      </span>
                      <span className="font-bold">{formatCurrency(currentProjection.mainLoanPayment)}</span>
                    </div>
                    {currentProjection.mainLoanIOStatus === 'P\u0026I' && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground">Interest component</span>
                        <span className="font-mono text-xs">{formatCurrency(currentProjection.mainInterestYear)}</span>
                      </div>
                    )}
                  </div>

                  {/* Equity Loan Details */}
                  {assumptions.initialEquityLoanBalance > 0 && (
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 mt-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Equity Loan ({assumptions.equityLoanType.toUpperCase()})</span>
                        <Badge variant={currentProjection.equityLoanIOStatus === 'IO' ? 'secondary' : 'default'}>
                          {currentProjection.equityLoanIOStatus}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(assumptions.initialEquityLoanBalance)} @ {formatPercentage(assumptions.equityInterestRate)}
                        </span>
                        <span className="font-bold">{formatCurrency(currentProjection.equityLoanPayment)}</span>
                      </div>
                      {currentProjection.equityLoanIOStatus === 'P\u0026I' && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-muted-foreground">Interest component</span>
                          <span className="font-mono text-xs">{formatCurrency(currentProjection.equityInterestYear)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>


        {/* Expenses - Expandable */}
        <Card>
          <Collapsible open={showExpensesDetails} onOpenChange={setShowExpensesDetails}>
            <CollapsibleTrigger asChild>
              <CardContent className="pt-4 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium">Expenses</span>
                    {showExpensesDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                  <span className="font-bold text-destructive">-{formatCurrency(Math.abs(expensesTotal))}</span>
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      Loan repayments
                    </span>
                    <span className="font-mono text-sm">{formatCurrency(repaymentsTotal)}</span>
                  </div>
                  
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Operating expenses
                    </span>
                    <span className="font-mono text-sm">{formatCurrency(currentProjection.otherExpenses)}</span>
                  </div>
                  <div className="mt-2 space-y-1 pl-6 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Property management ({formatPercentage(resolve<number>(assumptions.propertyManagementRate) ?? 0)})</span>
                      <span className="font-mono">{formatCurrency(currentProjection.rentalIncome * ((resolve<number>(assumptions.propertyManagementRate) ?? 0) / 100))}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Council rates</span>
                      <span className="font-mono">{formatCurrency(assumptions.councilRates * Math.pow(1 + assumptions.expenseInflationRate / 100, currentProjection.year - 1))}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Insurance</span>
                      <span className="font-mono">{formatCurrency(assumptions.insurance * Math.pow(1 + assumptions.expenseInflationRate / 100, currentProjection.year - 1))}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Repairs & maintenance</span>
                      <span className="font-mono">{formatCurrency(assumptions.repairs * Math.pow(1 + assumptions.expenseInflationRate / 100, currentProjection.year - 1))}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Income - Expandable */}
        <Card>
          <Collapsible open={showIncomeDetails} onOpenChange={setShowIncomeDetails}>
            <CollapsibleTrigger asChild>
              <CardContent className="pt-4 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Income</span>
                    {showIncomeDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                  <span className="font-bold text-primary">+{formatCurrency(Math.abs(incomeTotal))}</span>
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                      Rental income
                    </span>
                    <span className="font-mono text-sm">{formatCurrency(currentProjection.rentalIncome)}</span>
                  </div>
                  
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Tax benefits - Expandable */}
        <Card>
          <Collapsible open={showTaxDetails} onOpenChange={setShowTaxDetails}>
            <CollapsibleTrigger asChild>
              <CardContent className="pt-4 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Tax benefits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {showTaxDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <span className={`font-bold ${taxTotal >= 0 ? 'text-primary' : 'text-destructive'}`}>{taxTotal >= 0 ? '+' : '-'}{formatCurrency(Math.abs(taxTotal))}</span>
                  </div>
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      Depreciation
                    </span>
                    <span className="font-mono text-sm">{formatCurrency(currentProjection.depreciation)}</span>
                  </div>
                  
                </div>
                {currentProjection.taxBenefit > 0 && (
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        <PiggyBank className="h-4 w-4 text-muted-foreground" />
                        Tax benefit
                      </span>
                      <span className="font-mono text-sm">{formatCurrency(currentProjection.taxBenefit)}</span>
                    </div>
                    
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Cash flow - Expandable */}
        <Card>
          <Collapsible open={showCashFlowDetailsMobile} onOpenChange={setShowCashFlowDetailsMobile}>
            <CollapsibleTrigger asChild>
              <CardContent className="pt-4 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Cash flow</span>
                    {showCashFlowDetailsMobile ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                  <span className={`font-bold ${weeklyCashflow >= 0 ? 'text-primary' : 'text-destructive'}`}>{weeklyCashflow >= 0 ? '+' : '-'}{formatCurrency(Math.abs(weeklyCashflow))}</span>
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-center gap-2">
                    {weeklyCashflow >= 0 ? (
                      <ArrowUpRight className="h-5 w-5 text-primary" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-destructive" />
                    )}
                    <span className="text-sm text-muted-foreground">Weekly</span>
                  </div>
                  <span className={`text-2xl font-bold ${weeklyCashflow >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {formatCurrency(weeklyCashflow)}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium">After-tax cash flow (year)</span>
                  <span className={`font-semibold ${currentProjection.afterTaxCashFlow >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {formatCurrency(currentProjection.afterTaxCashFlow)}
                  </span>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>

      {/* Spacer so content isn't hidden behind fixed year controls + bottom nav */}
      <div className="h-24 md:hidden" aria-hidden="true" />

      {/* Fixed Year Controls (mobile) */}
      {typeof document !== "undefined" &&
        createPortal(
          <div className="md:hidden fixed bottom-16 left-0 right-0 z-[60] px-4 pb-[env(safe-area-inset-bottom)]">
            <Card className="shadow-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <CardHeader className="py-2">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevYear}
                    disabled={currentYearIndex === 0}
                    aria-label="Previous year"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="text-center">
                    <h3 className="text-base font-semibold">Year {currentProjection.year}</h3>
                    <p className="text-xs text-muted-foreground">
                      {currentYearIndex + 1} of {projections.length}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextYear}
                    disabled={currentYearIndex === projections.length - 1}
                    aria-label="Next year"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </div>,
          document.body
        )}
    </div>
  );
};

const DesktopProjectionsTable = ({ 
  projections, 
  assumptions, 
  showLoanDetails, 
  setShowLoanDetails,
  showMortgageDetails,
  setShowMortgageDetails,
  showOperatingDetails,
  setShowOperatingDetails,
  showDepreciationDetails,
  setShowDepreciationDetails,
  showCashFlowDetails,
  setShowCashFlowDetails,
  formatCurrency, 
  formatPercentage 
}: any) => {
  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse">
        <thead>
<tr>
  <th className="sticky left-0 top-0 bg-background z-20 min-w-[180px] text-left p-3 border-b">End of year</th>
  {assumptions.isConstructionProject && assumptions.constructionPeriod > 0 && (
    <th className="sticky top-0 bg-muted/30 z-20 text-center font-medium p-3 border-b">Construction</th>
  )}
  {projections.map((projection: YearProjection) => (
    <th key={projection.year} className="sticky top-0 bg-background z-20 text-center min-w-[100px] font-medium p-3 border-b">
      {projection.year === 0 ? 'Construction' : `Year ${projection.year}`}
    </th>
  ))}
</tr>
        </thead>
        <tbody>
{/* Property Value */}
<tr className="border-b">
  <td className="sticky left-0 bg-background z-10 font-medium p-3">Property value</td>
  {projections.map((projection: YearProjection) => (
    <td key={projection.year} className="text-center font-mono text-sm p-3">
      {projection.year === 0 ? "—" : formatCurrency(projection.propertyValue)}
    </td>
  ))}
</tr>

{/* Equity */}
<tr className="border-b">
  <td className="sticky left-0 bg-background z-10 font-medium p-3">Equity</td>
  {projections.map((projection: YearProjection) => (
    <td key={projection.year} className={`text-center font-mono text-sm p-3 ${projection.year === 0 ? 'text-muted-foreground' : projection.propertyEquity < 0 ? 'text-destructive' : 'text-foreground'}`}>
      {projection.year === 0 ? "—" : formatCurrency(projection.propertyEquity)}
    </td>
  ))}
</tr>

{/* Total Loan Balance - Expandable */}
<tr className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => setShowLoanDetails(!showLoanDetails)}>
  <td className="sticky left-0 bg-background z-10 font-medium p-3">
    <div className="flex items-center gap-2">
      {showLoanDetails ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      Total loan balance
    </div>
  </td>
  {projections.map((projection: YearProjection) => (
    <td key={projection.year} className="text-center font-mono text-sm p-3">
      {projection.year === 0 ? "—" : formatCurrency(projection.mainLoanBalance + projection.equityLoanBalance)}
    </td>
  ))}
</tr>

{/* Main Loan Balance Details */}
{showLoanDetails && (
  <tr className="bg-blue-50 dark:bg-blue-950/20 border-b">
    <td className="sticky left-0 bg-blue-50 dark:bg-blue-950/20 z-10 pl-8 text-sm p-3">
      Main loan balance
    </td>
    {projections.map((projection: YearProjection) => (
      <td key={projection.year} className="text-center font-mono text-xs p-3">
        {projection.year === 0 ? "—" : formatCurrency(projection.mainLoanBalance)}
      </td>
    ))}
  </tr>
)}

{/* Equity Loan Balance Details */}
{showLoanDetails && assumptions.initialEquityLoanBalance > 0 && (
  <tr className="bg-green-50 dark:bg-green-950/20 border-b">
    <td className="sticky left-0 bg-green-50 dark:bg-green-950/20 z-10 pl-8 text-sm p-3">
      Equity loan balance
    </td>
    {projections.map((projection: YearProjection) => (
      <td key={projection.year} className="text-center font-mono text-xs p-3">
        {projection.year === 0 ? "—" : formatCurrency(projection.equityLoanBalance)}
      </td>
    ))}
  </tr>
)}

{/* Expenses Header */}
<tr className="bg-muted/30 border-y">
  <td className="sticky left-0 bg-muted/30 z-10 font-semibold p-3">Expenses</td>
  {projections.map((p: YearProjection) => (
    <td key={p.year} className="bg-muted/30 p-3" />
  ))}
</tr>

{/* Annual Mortgage Repayments - Expandable */}
<tr className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => setShowMortgageDetails(!showMortgageDetails)}>
  <td className="sticky left-0 bg-background z-10 font-medium p-3">
    <div className="flex items-center gap-2">
      {showMortgageDetails ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      Annual mortgage repayments
      <Badge variant="outline" className="ml-2">
        {/* Check if any loan is IO */}
        {projections[0]?.mainLoanIOStatus === 'IO' || projections[0]?.equityLoanIOStatus === 'IO' ? 'IO' : 'P\u0026I'}
      </Badge>
    </div>
  </td>
  {projections.map((projection: YearProjection) => (
    <td key={projection.year} className="text-center font-mono text-sm p-3">
      {formatCurrency(projection.mainLoanPayment + projection.equityLoanPayment)}
    </td>
  ))}
</tr>

{/* Interest Components (P&I years) */}
{showMortgageDetails && (
  <tr className="bg-blue-50 dark:bg-blue-950/20 border-b">
    <td className="sticky left-0 bg-blue-50 dark:bg-blue-950/20 z-10 pl-8 text-sm p-3">
      Main loan interest component (P\u0026I)
    </td>
    {projections.map((projection: YearProjection) => (
      <td key={projection.year} className="text-center font-mono text-xs p-3">
        {projection.mainLoanIOStatus === 'P\u0026I' ? formatCurrency(projection.mainInterestYear) : '—'}
      </td>
    ))}
  </tr>
)}
{showMortgageDetails && assumptions.initialEquityLoanBalance > 0 && (
  <tr className="bg-green-50 dark:bg-green-950/20 border-b">
    <td className="sticky left-0 bg-green-50 dark:bg-green-950/20 z-10 pl-8 text-sm p-3">
      Equity loan interest component (P\u0026I)
    </td>
    {projections.map((projection: YearProjection) => (
      <td key={projection.year} className="text-center font-mono text-xs p-3">
        {projection.equityLoanIOStatus === 'P\u0026I' ? formatCurrency(projection.equityInterestYear) : '—'}
      </td>
    ))}
  </tr>
)}

{/* Interest Expense */}
{showMortgageDetails && (
  <tr className="bg-red-50 dark:bg-red-950/20 border-b">
    <td className="sticky left-0 bg-red-50 dark:bg-red-950/20 z-10 pl-8 text-sm p-3">
      Net interest expense
    </td>
    {projections.map((projection: YearProjection) => (
      <td key={projection.year} className="text-center font-mono text-xs p-3">{formatCurrency(projection.totalInterest)}</td>
    ))}
  </tr>
)}

{/* Operating Expenses - Expandable */}
<tr className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => setShowOperatingDetails(!showOperatingDetails)}>
  <td className="sticky left-0 bg-background z-10 font-medium p-3">
    <div className="flex items-center gap-2">
      {showOperatingDetails ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      Operating expenses
    </div>
  </td>
  {projections.map((projection: YearProjection) => (
    <td key={projection.year} className="text-center font-mono text-sm p-3">{formatCurrency(projection.otherExpenses)}</td>
  ))}
</tr>

{/* Income Header */}
<tr className="bg-muted/30 border-y">
  <td className="sticky left-0 bg-muted/30 z-10 font-semibold p-3">Income</td>
  {projections.map((p: YearProjection) => (
    <td key={p.year} className="bg-muted/30 p-3" />
  ))}
</tr>

{/* Rental Income */}
<tr className="border-b">
  <td className="sticky left-0 bg-background z-10 font-medium p-3">Rental income</td>
  {projections.map((projection: YearProjection) => (
    <td key={projection.year} className="text-center font-mono text-sm p-3">{formatCurrency(projection.rentalIncome)}</td>
  ))}
</tr>

{/* Property Management */}
{showOperatingDetails && (
  <tr className="bg-orange-50 dark:bg-orange-950/20 border-b">
    <td className="sticky left-0 bg-orange-50 dark:bg-orange-950/20 z-10 pl-8 text-sm p-3">
      Property management
    </td>
    {projections.map((projection: YearProjection) => (
      <td key={projection.year} className="text-center font-mono text-xs p-3">
        {formatCurrency(projection.rentalIncome * ((resolve<number>(assumptions.propertyManagementRate) ?? 0) / 100))}
      </td>
    ))}
  </tr>
)}

{/* Council Rates */}
{showOperatingDetails && (
  <tr className="bg-orange-50 dark:bg-orange-950/20 border-b">
    <td className="sticky left-0 bg-orange-50 dark:bg-orange-950/20 z-10 pl-8 text-sm p-3">
      Council rates
    </td>
    {projections.map((projection: YearProjection) => (
      <td key={projection.year} className="text-center font-mono text-xs p-3">
        {formatCurrency(assumptions.councilRates * Math.pow(1 + assumptions.expenseInflationRate / 100, projection.year - 1))}
      </td>
    ))}
  </tr>
)}

{/* Insurance */}
{showOperatingDetails && (
  <tr className="bg-orange-50 dark:bg-orange-950/20 border-b">
    <td className="sticky left-0 bg-orange-50 dark:bg-orange-950/20 z-10 pl-8 text-sm p-3">
      Insurance
    </td>
    {projections.map((projection: YearProjection) => (
      <td key={projection.year} className="text-center font-mono text-xs p-3">
        {formatCurrency(assumptions.insurance * Math.pow(1 + assumptions.expenseInflationRate / 100, projection.year - 1))}
      </td>
    ))}
  </tr>
)}

{/* Repairs & Maintenance */}
{showOperatingDetails && (
  <tr className="bg-orange-50 dark:bg-orange-950/20 border-b">
    <td className="sticky left-0 bg-orange-50 dark:bg-orange-950/20 z-10 pl-8 text-sm p-3">
      Repairs & maintenance
    </td>
    {projections.map((projection: YearProjection) => (
      <td key={projection.year} className="text-center font-mono text-xs p-3">
        {formatCurrency(assumptions.repairs * Math.pow(1 + assumptions.expenseInflationRate / 100, projection.year - 1))}
      </td>
    ))}
  </tr>
)}

{/* Non-cash Header */}
<tr className="bg-muted/30 border-y">
  <td className="sticky left-0 bg-muted/30 z-10 font-semibold p-3">Non-cash</td>
  {projections.map((p: YearProjection) => (
    <td key={p.year} className="bg-muted/30 p-3" />
  ))}
</tr>

{/* Depreciation - Expandable */}
<tr className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => setShowDepreciationDetails(!showDepreciationDetails)}>
  <td className="sticky left-0 bg-background z-10 font-medium p-3">
    <div className="flex items-center gap-2">
      {showDepreciationDetails ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      Depreciation
    </div>
  </td>
  {projections.map((projection: YearProjection) => (
    <td key={projection.year} className="text-center font-mono text-sm p-3">{formatCurrency(projection.depreciation)}</td>
  ))}
</tr>

{/* Building Depreciation */}
{showDepreciationDetails && (
  <tr className="bg-purple-50 dark:bg-purple-950/20 border-b">
    <td className="sticky left-0 bg-purple-50 dark:bg-purple-950/20 z-10 pl-8 text-sm p-3">
      Building depreciation
    </td>
    {projections.map((projection: YearProjection) => (
      <td key={projection.year} className="text-center font-mono text-xs p-3">
        {formatCurrency(projection.depreciation * 0.6)} {/* Assume 60% is building */}
      </td>
    ))}
  </tr>
)}

{/* Fixtures & Fittings Depreciation */}
{showDepreciationDetails && (
  <tr className="bg-purple-50 dark:bg-purple-950/20 border-b">
    <td className="sticky left-0 bg-purple-50 dark:bg-purple-950/20 z-10 pl-8 text-sm p-3">
      Fixtures & fittings
    </td>
    {projections.map((projection: YearProjection) => (
      <td key={projection.year} className="text-center font-mono text-xs p-3">
        {formatCurrency(projection.depreciation * 0.4)} {/* Assume 40% is fixtures */}
      </td>
    ))}
  </tr>
)}

{/* Tax Benefit */}
<tr className="border-b">
  <td className="sticky left-0 bg-background z-10 font-medium p-3">Tax benefit</td>
  {projections.map((projection: YearProjection) => (
    <td key={projection.year} className={`text-center font-mono text-sm p-3 ${projection.taxBenefit > 0 ? 'text-green-600' : 'text-destructive'}`}>
      {formatCurrency(projection.taxBenefit)}
    </td>
  ))}
</tr>

{/* After-tax Cash Flow (Weekly) - Expandable */}
<tr className="bg-muted/50 border-t-2 border-b hover:bg-muted/60 cursor-pointer" onClick={() => setShowCashFlowDetails(!showCashFlowDetails)}>
  <td className="sticky left-0 bg-muted/50 z-10 font-bold p-3">
    <div className="flex items-center gap-2">
      {showCashFlowDetails ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      After-tax cash flow (weekly)
    </div>
  </td>
  {projections.map((projection: YearProjection) => (
    <td key={projection.year} className={`text-center bg-muted/50 font-mono text-sm font-bold p-3 ${(projection.afterTaxCashFlow / 52) >= 0 ? 'text-green-600' : 'text-destructive'}`}>
      {formatCurrency(projection.afterTaxCashFlow / 52)}
    </td>
  ))}
</tr>

{/* After-tax Cash Flow (Annual) */}
{showCashFlowDetails && (
  <tr className="bg-yellow-50 dark:bg-yellow-950/20 border-b">
    <td className="sticky left-0 bg-yellow-50 dark:bg-yellow-950/20 z-10 pl-8 text-sm p-3">
      After-tax cash flow (annual)
    </td>
    {projections.map((projection: YearProjection) => (
      <td key={projection.year} className={`text-center font-mono text-xs p-3 ${projection.afterTaxCashFlow >= 0 ? 'text-green-600' : 'text-destructive'}`}>
        {formatCurrency(projection.afterTaxCashFlow)}
      </td>
    ))}
  </tr>
)}

{/* Cumulative Cash Flow */}
{showCashFlowDetails && (
  <tr className="bg-yellow-50 dark:bg-yellow-950/20 border-b">
    <td className="sticky left-0 bg-yellow-50 dark:bg-yellow-950/20 z-10 pl-8 text-sm p-3">
      Cumulative cash flow
    </td>
    {projections.map((projection: YearProjection) => (
      <td key={projection.year} className="text-center font-mono text-xs p-3">{formatCurrency(projection.cumulativeCashFlow)}</td>
    ))}
  </tr>
)}

{/* Total Return */}
<tr>
  <td className="sticky left-0 bg-background z-10 font-medium p-3">Total return</td>
  {projections.map((projection: YearProjection) => (
    <td key={projection.year} className="text-center font-mono text-sm p-3">{formatCurrency(projection.totalReturn)}</td>
  ))}
</tr>
        </tbody>
      </table>
    </div>
  );
};

export default ProjectionsTable;