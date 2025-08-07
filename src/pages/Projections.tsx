import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, Download, TrendingUp, TrendingDown, ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePropertyData } from "@/contexts/PropertyDataContext";

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

const Projections = () => {
  const navigate = useNavigate();
  const { propertyData } = usePropertyData();
  
  // Calculate funding requirements from property data
  const calculateFundingFromPropertyData = () => {
    const baseCosts = propertyData.isConstructionProject 
      ? propertyData.landValue + propertyData.constructionValue 
      : propertyData.purchasePrice;
    
    const developmentCosts = propertyData.isConstructionProject 
      ? propertyData.councilFees + propertyData.architectFees + propertyData.siteCosts 
      : 0;
    
    const holdingCosts = propertyData.isConstructionProject 
      ? propertyData.landValue * (propertyData.constructionInterestRate / 100) * (propertyData.constructionPeriod / 12)
      : 0;
    
    const totalProjectCost = baseCosts + propertyData.stampDuty + propertyData.legalFees + 
                            propertyData.inspectionFees + developmentCosts + holdingCosts;

    if (propertyData.useEquityFunding) {
      const availableEquity = Math.max(0, (propertyData.primaryPropertyValue * propertyData.maxLVR / 100) - propertyData.existingDebt);
      const equityUsed = Math.min(availableEquity, totalProjectCost);
      return {
        mainLoanAmount: totalProjectCost * (propertyData.lvr / 100),
        equityLoanAmount: equityUsed,
        totalProjectCost
      };
    } else {
      return {
        mainLoanAmount: totalProjectCost * (propertyData.lvr / 100),
        equityLoanAmount: 0,
        totalProjectCost
      };
    }
  };

  const funding = calculateFundingFromPropertyData();
  
  // Property assumptions derived from property data but adjustable
  const [assumptions, setAssumptions] = useState({
    initialPropertyValue: propertyData.purchasePrice || funding.totalProjectCost,
    initialWeeklyRent: propertyData.weeklyRent,
    capitalGrowthRate: 4.0,
    rentalGrowthRate: propertyData.rentalGrowthRate,
    vacancyRate: propertyData.vacancyRate,
    initialMainLoanBalance: funding.mainLoanAmount,
    initialEquityLoanBalance: funding.equityLoanAmount,
    mainInterestRate: propertyData.interestRate,
    equityInterestRate: propertyData.equityLoanInterestRate,
    mainLoanTerm: propertyData.loanTerm,
    equityLoanTerm: propertyData.equityLoanTerm,
    mainLoanType: propertyData.mainLoanType,
    equityLoanType: propertyData.equityLoanType,
    mainIOTermYears: propertyData.ioTermYears,
    equityIOTermYears: propertyData.equityLoanIoTermYears,
    propertyManagementRate: propertyData.propertyManagement,
    councilRates: propertyData.councilRates,
    insurance: propertyData.insurance,
    repairs: propertyData.repairs,
    expenseInflationRate: 2.5,
    marginalTaxRate: 37.0,
    depreciationYear1: 15000
  });

  const [yearRange, setYearRange] = useState([1, 8]);
  const [showLoanDetails, setShowLoanDetails] = useState(false);

  // Validate year range (max 25 year span)
  const validatedYearRange = useMemo(() => {
    const [start, end] = yearRange;
    const span = end - start + 1;
    if (span > 25) {
      return [start, start + 24];
    }
    return [start, end];
  }, [yearRange]);

  const projections = useMemo(() => {
    const years: YearProjection[] = [];
    const annualRent = assumptions.initialWeeklyRent * 52;
    let mainLoanBalance = assumptions.initialMainLoanBalance;
    let equityLoanBalance = assumptions.initialEquityLoanBalance;
    
    // Calculate loan payments for both loans
    const calculateLoanPayment = (balance: number, rate: number, term: number) => {
      const monthlyRate = rate / 100 / 12;
      const totalMonths = term * 12;
      return balance * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    };

    const mainPIMonthlyPayment = calculateLoanPayment(assumptions.initialMainLoanBalance, assumptions.mainInterestRate, assumptions.mainLoanTerm);
    const mainIOMonthlyPayment = assumptions.initialMainLoanBalance * (assumptions.mainInterestRate / 100 / 12);
    
    const equityPIMonthlyPayment = assumptions.initialEquityLoanBalance > 0 
      ? calculateLoanPayment(assumptions.initialEquityLoanBalance, assumptions.equityInterestRate, assumptions.equityLoanTerm)
      : 0;
    const equityIOMonthlyPayment = assumptions.initialEquityLoanBalance * (assumptions.equityInterestRate / 100 / 12);
    
    let cumulativeCashFlow = 0;
    
    for (let year = 1; year <= 40; year++) {
      // Rental income with growth and vacancy
      const grossRentalIncome = annualRent * Math.pow(1 + assumptions.rentalGrowthRate / 100, year - 1);
      const rentalIncome = grossRentalIncome * (1 - assumptions.vacancyRate / 100);
      
      // Property value with capital growth
      const propertyValue = assumptions.initialPropertyValue * Math.pow(1 + assumptions.capitalGrowthRate / 100, year - 1);
      
      // Main loan calculations
      const mainIsIOPeriod = assumptions.mainLoanType === 'io' && year <= assumptions.mainIOTermYears;
      const mainLoanIOStatus: 'IO' | 'P&I' = mainIsIOPeriod ? 'IO' : 'P&I';
      const mainLoanPayment = mainIsIOPeriod ? mainIOMonthlyPayment * 12 : mainPIMonthlyPayment * 12;
      
      // Equity loan calculations
      const equityIsIOPeriod = assumptions.equityLoanType === 'io' && year <= assumptions.equityIOTermYears && assumptions.initialEquityLoanBalance > 0;
      const equityLoanIOStatus: 'IO' | 'P&I' = equityIsIOPeriod ? 'IO' : 'P&I';
      const equityLoanPayment = assumptions.initialEquityLoanBalance > 0 
        ? (equityIsIOPeriod ? equityIOMonthlyPayment * 12 : equityPIMonthlyPayment * 12)
        : 0;
      
      // Update loan balances for next year
      if (year > 1) {
        // Main loan balance calculation
        if (mainIsIOPeriod) {
          mainLoanBalance = assumptions.initialMainLoanBalance;
        } else {
          const monthsFromPIStart = Math.max(0, (year - (assumptions.mainIOTermYears + 1)) * 12);
          const remainingMonths = assumptions.mainLoanTerm * 12 - (assumptions.mainIOTermYears * 12);
          if (remainingMonths > 0 && monthsFromPIStart >= 0) {
            const monthlyRate = assumptions.mainInterestRate / 100 / 12;
            mainLoanBalance = assumptions.initialMainLoanBalance * 
              (Math.pow(1 + monthlyRate, remainingMonths) - Math.pow(1 + monthlyRate, monthsFromPIStart)) / 
              (Math.pow(1 + monthlyRate, remainingMonths) - 1);
          }
        }
        
        // Equity loan balance calculation
        if (assumptions.initialEquityLoanBalance > 0) {
          if (equityIsIOPeriod) {
            equityLoanBalance = assumptions.initialEquityLoanBalance;
          } else {
            const monthsFromPIStart = Math.max(0, (year - (assumptions.equityIOTermYears + 1)) * 12);
            const remainingMonths = assumptions.equityLoanTerm * 12 - (assumptions.equityIOTermYears * 12);
            if (remainingMonths > 0 && monthsFromPIStart >= 0) {
              const monthlyRate = assumptions.equityInterestRate / 100 / 12;
              equityLoanBalance = assumptions.initialEquityLoanBalance * 
                (Math.pow(1 + monthlyRate, remainingMonths) - Math.pow(1 + monthlyRate, monthsFromPIStart)) / 
                (Math.pow(1 + monthlyRate, remainingMonths) - 1);
            }
          }
        }
      }
      
      // Interest expense (tax deductible)
      const mainInterest = mainLoanBalance * (assumptions.mainInterestRate / 100);
      const equityInterest = equityLoanBalance * (assumptions.equityInterestRate / 100);
      const totalInterest = mainInterest + equityInterest;
      
      // Operating expenses with inflation
      const inflationMultiplier = Math.pow(1 + assumptions.expenseInflationRate / 100, year - 1);
      const propertyManagement = rentalIncome * (assumptions.propertyManagementRate / 100);
      const councilRates = assumptions.councilRates * inflationMultiplier;
      const insurance = assumptions.insurance * inflationMultiplier;
      const repairs = assumptions.repairs * inflationMultiplier;
      const otherExpenses = propertyManagement + councilRates + insurance + repairs;
      
      // Depreciation (diminishing over time)
      const depreciation = Math.max(0, assumptions.depreciationYear1 * Math.pow(0.95, year - 1));
      
      // Tax calculations
      const taxableIncome = rentalIncome - totalInterest - otherExpenses - depreciation;
      const taxBenefit = taxableIncome < 0 ? Math.abs(taxableIncome) * (assumptions.marginalTaxRate / 100) : -taxableIncome * (assumptions.marginalTaxRate / 100);
      
      // Cash flow calculations
      const totalLoanPayments = mainLoanPayment + equityLoanPayment;
      const afterTaxCashFlow = rentalIncome - otherExpenses - totalLoanPayments + taxBenefit;
      cumulativeCashFlow += afterTaxCashFlow;
      
      // Property equity
      const propertyEquity = propertyValue - mainLoanBalance - equityLoanBalance;
      
      // Total return (cash flow + equity growth)
      const totalReturn = afterTaxCashFlow + (year > 1 ? propertyValue - assumptions.initialPropertyValue * Math.pow(1 + assumptions.capitalGrowthRate / 100, year - 2) : 0);
      
      years.push({
        year,
        rentalIncome,
        propertyValue,
        mainLoanBalance,
        equityLoanBalance,
        totalInterest,
        mainLoanPayment,
        equityLoanPayment,
        mainLoanIOStatus,
        equityLoanIOStatus,
        otherExpenses,
        depreciation,
        taxableIncome,
        taxBenefit,
        afterTaxCashFlow,
        cumulativeCashFlow,
        propertyEquity,
        totalReturn
      });
    }
    
    return years;
  }, [assumptions]);

  // Filter projections based on selected year range
  const filteredProjections = projections.filter(p => 
    p.year >= validatedYearRange[0] && p.year <= validatedYearRange[1]
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const breakEvenYear = projections.find(p => p.afterTaxCashFlow > 0)?.year || 'Never';
  const totalCashInvested = Math.abs(Math.min(0, ...projections.map(p => p.cumulativeCashFlow)));
  const finalPropertyValue = projections[39]?.propertyValue || 0;
  const finalEquity = projections[39]?.propertyEquity || 0;
  const totalTaxBenefits = projections.reduce((sum, p) => sum + Math.max(0, p.taxBenefit), 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Analysis
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">40-Year Investment Projections</h1>
              <p className="text-muted-foreground">Year-over-year growth and cashflow analysis</p>
            </div>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export to CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Break-even Year</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{breakEvenYear}</div>
              <p className="text-xs text-muted-foreground">When cash flow turns positive</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Cash Invested</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCashInvested)}</div>
              <p className="text-xs text-muted-foreground">Including negative cash flows</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Year 40 Property Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(finalPropertyValue)}</div>
              <p className="text-xs text-muted-foreground">With {formatPercentage(assumptions.capitalGrowthRate)} growth</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Tax Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalTaxBenefits)}</div>
              <p className="text-xs text-muted-foreground">Cumulative over 40 years</p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Scenario Controls</CardTitle>
            <CardDescription>Adjust key assumptions and projection range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Year Range Selector */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Projection Range (Years {yearRange[0]} - {yearRange[1]})</label>
                <div className="px-3">
                  <Slider
                    value={yearRange}
                    onValueChange={setYearRange}
                    max={40}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="text-center text-sm text-muted-foreground">Maximum 25 year range</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Capital Growth Rate</label>
                  <div className="px-3">
                    <Slider
                      value={[assumptions.capitalGrowthRate]}
                      onValueChange={(value) => setAssumptions(prev => ({ ...prev, capitalGrowthRate: value[0] }))}
                      max={15}
                      min={0}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                  <div className="text-center text-sm text-muted-foreground">{formatPercentage(assumptions.capitalGrowthRate)}</div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rental Growth Rate</label>
                  <div className="px-3">
                    <Slider
                      value={[assumptions.rentalGrowthRate]}
                      onValueChange={(value) => setAssumptions(prev => ({ ...prev, rentalGrowthRate: value[0] }))}
                      max={10}
                      min={0}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                  <div className="text-center text-sm text-muted-foreground">{formatPercentage(assumptions.rentalGrowthRate)}</div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Main Interest Rate</label>
                  <div className="px-3">
                    <Slider
                      value={[assumptions.mainInterestRate]}
                      onValueChange={(value) => setAssumptions(prev => ({ ...prev, mainInterestRate: value[0] }))}
                      max={12}
                      min={3}
                      step={0.25}
                      className="w-full"
                    />
                  </div>
                  <div className="text-center text-sm text-muted-foreground">{formatPercentage(assumptions.mainInterestRate)}</div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Marginal Tax Rate</label>
                  <div className="px-3">
                    <Slider
                      value={[assumptions.marginalTaxRate]}
                      onValueChange={(value) => setAssumptions(prev => ({ ...prev, marginalTaxRate: value[0] }))}
                      max={47}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="text-center text-sm text-muted-foreground">{formatPercentage(assumptions.marginalTaxRate)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projections Table */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Analysis - Projections over {validatedYearRange[1] - validatedYearRange[0] + 1} years</CardTitle>
            <CardDescription>Financial breakdown with metrics in rows and years in columns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10 min-w-[180px]">End of year</TableHead>
                    <TableHead className="text-center bg-muted/30 font-medium">Input</TableHead>
                    {filteredProjections.map((projection) => (
                      <TableHead key={projection.year} className="text-center min-w-[100px] font-medium">
                        {projection.year}yr
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Property Value */}
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background z-10 font-medium">Property value</TableCell>
                    <TableCell className="text-center bg-muted/30 font-mono text-sm">{formatCurrency(assumptions.initialPropertyValue)}</TableCell>
                    {filteredProjections.map((projection) => (
                      <TableCell key={projection.year} className="text-center font-mono text-sm">{formatCurrency(projection.propertyValue)}</TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Main Loan Balance */}
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background z-10 font-medium">Main loan balance</TableCell>
                    <TableCell className="text-center bg-muted/30 font-mono text-sm">{formatCurrency(assumptions.initialMainLoanBalance)}</TableCell>
                    {filteredProjections.map((projection) => (
                      <TableCell key={projection.year} className="text-center font-mono text-sm">{formatCurrency(projection.mainLoanBalance)}</TableCell>
                    ))}
                  </TableRow>

                  {/* Annual Mortgage Repayments - Expandable */}
                  <Collapsible open={showLoanDetails} onOpenChange={setShowLoanDetails}>
                    <CollapsibleTrigger asChild>
                      <TableRow className="hover:bg-muted/50 cursor-pointer">
                        <TableCell className="sticky left-0 bg-background z-10 font-medium flex items-center gap-2">
                          {showLoanDetails ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          Annual mortgage repayments
                        </TableCell>
                        <TableCell className="text-center bg-muted/30 font-mono text-sm">
                          {formatCurrency((assumptions.initialMainLoanBalance * (assumptions.mainInterestRate / 100)) + 
                                         (assumptions.initialEquityLoanBalance * (assumptions.equityInterestRate / 100)))}
                        </TableCell>
                        {filteredProjections.map((projection) => (
                          <TableCell key={projection.year} className="text-center font-mono text-sm">
                            {formatCurrency(projection.mainLoanPayment + projection.equityLoanPayment)}
                          </TableCell>
                        ))}
                      </TableRow>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      {/* Main Loan Details */}
                      <TableRow className="bg-blue-50 dark:bg-blue-950/20">
                        <TableCell className="sticky left-0 bg-blue-50 dark:bg-blue-950/20 z-10 pl-8 text-sm">
                          Main Loan ({assumptions.mainLoanType.toUpperCase()})
                        </TableCell>
                        <TableCell className="text-center bg-blue-100 dark:bg-blue-900/30 font-mono text-xs">
                          {formatCurrency(assumptions.initialMainLoanBalance)} @ {formatPercentage(assumptions.mainInterestRate)}
                        </TableCell>
                        {filteredProjections.map((projection) => (
                          <TableCell key={projection.year} className="text-center font-mono text-xs">
                            <div>{formatCurrency(projection.mainLoanPayment)}</div>
                            <Badge variant={projection.mainLoanIOStatus === 'IO' ? 'secondary' : 'default'} className="text-xs">
                              {projection.mainLoanIOStatus}
                            </Badge>
                          </TableCell>
                        ))}
                      </TableRow>
                      
                      {/* Equity Loan Details (if applicable) */}
                      {assumptions.initialEquityLoanBalance > 0 && (
                        <TableRow className="bg-green-50 dark:bg-green-950/20">
                          <TableCell className="sticky left-0 bg-green-50 dark:bg-green-950/20 z-10 pl-8 text-sm">
                            Equity Loan ({assumptions.equityLoanType.toUpperCase()})
                          </TableCell>
                          <TableCell className="text-center bg-green-100 dark:bg-green-900/30 font-mono text-xs">
                            {formatCurrency(assumptions.initialEquityLoanBalance)} @ {formatPercentage(assumptions.equityInterestRate)}
                          </TableCell>
                          {filteredProjections.map((projection) => (
                            <TableCell key={projection.year} className="text-center font-mono text-xs">
                              <div>{formatCurrency(projection.equityLoanPayment)}</div>
                              <Badge variant={projection.equityLoanIOStatus === 'IO' ? 'secondary' : 'default'} className="text-xs">
                                {projection.equityLoanIOStatus}
                              </Badge>
                            </TableCell>
                          ))}
                        </TableRow>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                  
                  {/* Equity */}
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background z-10 font-medium">Equity</TableCell>
                    <TableCell className="text-center bg-muted/30 font-mono text-sm text-destructive">{formatCurrency(assumptions.initialPropertyValue - assumptions.initialMainLoanBalance - assumptions.initialEquityLoanBalance)}</TableCell>
                    {filteredProjections.map((projection) => (
                      <TableCell key={projection.year} className={`text-center font-mono text-sm ${projection.propertyEquity < 0 ? 'text-destructive' : 'text-foreground'}`}>
                        {formatCurrency(projection.propertyEquity)}
                      </TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Capital Growth Rate */}
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background z-10 font-medium">Capital growth rate</TableCell>
                    <TableCell className="text-center bg-muted/30 font-mono text-sm">{formatPercentage(assumptions.capitalGrowthRate)}</TableCell>
                    {filteredProjections.map((projection) => (
                      <TableCell key={projection.year} className="text-center font-mono text-sm">{formatPercentage(assumptions.capitalGrowthRate)}</TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Inflation Rate */}
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background z-10 font-medium">Inflation rate (CPI)</TableCell>
                    <TableCell className="text-center bg-muted/30 font-mono text-sm">{formatPercentage(assumptions.expenseInflationRate)}</TableCell>
                    {filteredProjections.map((projection) => (
                      <TableCell key={projection.year} className="text-center font-mono text-sm">{formatPercentage(assumptions.expenseInflationRate)}</TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Section Header - Gross rent/week */}
                  <TableRow className="bg-muted/50">
                    <TableCell className="sticky left-0 bg-muted/50 z-10 font-bold">Gross rent /week</TableCell>
                    <TableCell className="text-center bg-muted font-mono text-sm">${assumptions.initialWeeklyRent}</TableCell>
                    {filteredProjections.map((projection) => (
                      <TableCell key={projection.year} className="text-center bg-muted/50 font-mono text-sm">
                        {Math.round(projection.rentalIncome / 52)}
                      </TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Section Header - Cash deductions */}
                  <TableRow className="bg-muted/30">
                    <TableCell className="sticky left-0 bg-muted/30 z-10 font-bold">Cash deductions</TableCell>
                    <TableCell className="text-center bg-muted/60"></TableCell>
                    {filteredProjections.map((projection) => (
                      <TableCell key={projection.year} className="text-center bg-muted/30"></TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Interest */}
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background z-10 font-medium">Interest (I/O)</TableCell>
                    <TableCell className="text-center bg-muted/30 font-mono text-sm">{formatPercentage(assumptions.mainInterestRate)}</TableCell>
                    {filteredProjections.map((projection) => (
                      <TableCell key={projection.year} className="text-center font-mono text-sm">{formatCurrency(projection.totalInterest)}</TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Rental Expenses */}
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background z-10 font-medium">Rental expenses</TableCell>
                    <TableCell className="text-center bg-muted/30 font-mono text-sm">{formatPercentage(assumptions.propertyManagementRate)}</TableCell>
                    {filteredProjections.map((projection) => (
                      <TableCell key={projection.year} className="text-center font-mono text-sm">{formatCurrency(projection.otherExpenses)}</TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Pre-tax Cash Flow */}
                  <TableRow className="bg-muted/50">
                    <TableCell className="sticky left-0 bg-muted/50 z-10 font-bold">Pre-tax cash flow</TableCell>
                    <TableCell className="text-center bg-muted font-mono text-sm">$0</TableCell>
                    {filteredProjections.map((projection) => (
                      <TableCell key={projection.year} className={`text-center bg-muted/50 font-mono text-sm ${(projection.rentalIncome - projection.totalInterest - projection.otherExpenses) < 0 ? 'text-destructive' : 'text-foreground'}`}>
                        {formatCurrency(projection.rentalIncome - projection.totalInterest - projection.otherExpenses)}
                      </TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Section Header - Non-cash deductions */}
                  <TableRow className="bg-muted/30">
                    <TableCell className="sticky left-0 bg-muted/30 z-10 font-bold">Non-cash deductions</TableCell>
                    <TableCell className="text-center bg-muted/60"></TableCell>
                    {filteredProjections.map((projection) => (
                      <TableCell key={projection.year} className="text-center bg-muted/30"></TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Depreciation of building */}
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background z-10 font-medium">Deprec.of building</TableCell>
                    <TableCell className="text-center bg-muted/30 font-mono text-sm">2.50%</TableCell>
                    {filteredProjections.map((projection) => (
                      <TableCell key={projection.year} className="text-center font-mono text-sm">{formatCurrency(projection.depreciation * 0.6)}</TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Depreciation of fittings */}
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background z-10 font-medium">Deprec.of fittings</TableCell>
                    <TableCell className="text-center bg-muted/30 font-mono text-sm">$39,000</TableCell>
                    {filteredProjections.map((projection) => (
                      <TableCell key={projection.year} className="text-center font-mono text-sm">{formatCurrency(projection.depreciation * 0.4)}</TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Total deductions */}
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background z-10 font-medium">Total deductions</TableCell>
                    <TableCell className="text-center bg-muted/30"></TableCell>
                    {filteredProjections.map((projection) => (
                      <TableCell key={projection.year} className="text-center font-mono text-sm">{formatCurrency(projection.totalInterest + projection.otherExpenses + projection.depreciation)}</TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Tax credit */}
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background z-10 font-medium">Tax credit (joint)</TableCell>
                    <TableCell className="text-center bg-muted/30 font-mono text-sm">${assumptions.marginalTaxRate}%</TableCell>
                    {filteredProjections.map((projection) => (
                      <TableCell key={projection.year} className={`text-center font-mono text-sm ${projection.taxBenefit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.max(0, projection.taxBenefit))}
                      </TableCell>
                    ))}
                  </TableRow>
                  
                  {/* After-tax Cash Flow */}
                  <TableRow className="bg-muted/50 border-t-2">
                    <TableCell className="sticky left-0 bg-muted/50 z-10 font-bold">After-tax cash flow</TableCell>
                    <TableCell className="text-center bg-muted font-mono text-sm">$0</TableCell>
                    {filteredProjections.map((projection) => (
                      <TableCell key={projection.year} className={`text-center bg-muted/50 font-mono text-sm font-bold ${projection.afterTaxCashFlow >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                        {formatCurrency(projection.afterTaxCashFlow)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Projections;