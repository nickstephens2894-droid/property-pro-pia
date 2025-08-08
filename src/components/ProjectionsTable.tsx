import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface YearProjection {
  year: number;
  rentalIncome: number;
  propertyValue: number;
  mainLoanBalance: number;
  equityLoanBalance: number;
  totalInterest: number;
  mainLoanPayment: number;
  equityLoanPayment: number;
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
const [showOperatingDetails, setShowOperatingDetails] = useState(false);
const [showDepreciationDetails, setShowDepreciationDetails] = useState(false);
const [showCashFlowDetails, setShowCashFlowDetails] = useState(false);
  
  const filteredProjections = projections.filter(p => 
    p.year >= validatedYearRange[0] && p.year <= validatedYearRange[1]
  );

if (isMobile || viewMode === 'year') {
  const [currentYearIndex, setCurrentYearIndex] = useState(0);
  
  return <MobileProjectionsView 
    projections={filteredProjections}
    assumptions={assumptions}
    currentYearIndex={currentYearIndex}
    setCurrentYearIndex={setCurrentYearIndex}
    showLoanDetails={showLoanDetails}
    setShowLoanDetails={setShowLoanDetails}
    formatCurrency={formatCurrency}
    formatPercentage={formatPercentage}
  />;
}

return <DesktopProjectionsTable 
  projections={filteredProjections}
  assumptions={assumptions}
  showLoanDetails={showLoanDetails}
  setShowLoanDetails={setShowLoanDetails}
  showOperatingDetails={showOperatingDetails}
  setShowOperatingDetails={setShowOperatingDetails}
  showDepreciationDetails={showDepreciationDetails}
  setShowDepreciationDetails={setShowDepreciationDetails}
  showCashFlowDetails={showCashFlowDetails}
  setShowCashFlowDetails={setShowCashFlowDetails}
  formatCurrency={formatCurrency}
  formatPercentage={formatPercentage}
/>;
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

  return (
    <div className="space-y-4">
      {/* Year Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={prevYear}
              disabled={currentYearIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold">Year {currentProjection.year}</h3>
              <p className="text-sm text-muted-foreground">
                {currentYearIndex + 1} of {projections.length}
              </p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={nextYear}
              disabled={currentYearIndex === projections.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Mobile Metrics Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* Property Value */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Property Value</span>
              <span className="font-bold">{formatCurrency(currentProjection.propertyValue)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Loan Balances */}
        <Card>
          <CardContent className="pt-4">
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
          </CardContent>
        </Card>

        {/* Mortgage Repayments - Expandable */}
        <Card>
          <Collapsible open={showLoanDetails} onOpenChange={setShowLoanDetails}>
            <CollapsibleTrigger asChild>
              <CardContent className="pt-4 cursor-pointer">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Annual Mortgage Repayments</span>
                    {showLoanDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                  <span className="font-bold">
                    {formatCurrency(currentProjection.mainLoanPayment + currentProjection.equityLoanPayment)}
                  </span>
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-3">
                {/* Main Loan Details */}
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
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
                </div>
                
                {/* Equity Loan Details */}
                {assumptions.initialEquityLoanBalance > 0 && (
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
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
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Equity */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Equity</span>
              <span className={`font-bold ${currentProjection.propertyEquity < 0 ? 'text-destructive' : 'text-foreground'}`}>
                {formatCurrency(currentProjection.propertyEquity)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Income & Expenses */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Income & Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Rental Income</span>
              <span className="font-mono text-sm">{formatCurrency(currentProjection.rentalIncome)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Interest Expense</span>
              <span className="font-mono text-sm">{formatCurrency(currentProjection.totalInterest)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Operating Expenses</span>
              <span className="font-mono text-sm">{formatCurrency(currentProjection.otherExpenses)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Depreciation</span>
              <span className="font-mono text-sm">{formatCurrency(currentProjection.depreciation)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Tax & Cash Flow */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tax & Cash Flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Tax Benefit</span>
              <span className={`font-mono text-sm ${currentProjection.taxBenefit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.max(0, currentProjection.taxBenefit))}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium">After-tax Cash Flow</span>
              <span className={`font-bold ${currentProjection.afterTaxCashFlow >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                {formatCurrency(currentProjection.afterTaxCashFlow)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Weekly</span>
              <span className={`text-xs font-mono ${currentProjection.afterTaxCashFlow >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                {formatCurrency(currentProjection.afterTaxCashFlow / 52)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const DesktopProjectionsTable = ({ 
  projections, 
  assumptions, 
  showLoanDetails, 
  setShowLoanDetails,
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

{/* Rental Income */}
<tr className="border-b">
  <td className="sticky left-0 bg-background z-10 font-medium p-3">Rental income</td>
  {projections.map((projection: YearProjection) => (
    <td key={projection.year} className="text-center font-mono text-sm p-3">{formatCurrency(projection.rentalIncome)}</td>
  ))}
</tr>

{/* Annual Mortgage Repayments */}
<tr className="border-b">
  <td className="sticky left-0 bg-background z-10 font-medium p-3">Annual mortgage repayments</td>
  {projections.map((projection: YearProjection) => (
    <td key={projection.year} className="text-center font-mono text-sm p-3">
      {formatCurrency(projection.mainLoanPayment + projection.equityLoanPayment)}
    </td>
  ))}
</tr>

{/* Interest Expense */}
<tr className="border-b">
  <td className="sticky left-0 bg-background z-10 font-medium p-3">Interest expense</td>
  {projections.map((projection: YearProjection) => (
    <td key={projection.year} className="text-center font-mono text-sm p-3">{formatCurrency(projection.totalInterest)}</td>
  ))}
</tr>

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

{/* Property Management */}
{showOperatingDetails && (
  <tr className="bg-orange-50 dark:bg-orange-950/20 border-b">
    <td className="sticky left-0 bg-orange-50 dark:bg-orange-950/20 z-10 pl-8 text-sm p-3">
      Property management
    </td>
    {projections.map((projection: YearProjection) => (
      <td key={projection.year} className="text-center font-mono text-xs p-3">
        {formatCurrency(projection.rentalIncome * (assumptions.propertyManagementRate / 100))}
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