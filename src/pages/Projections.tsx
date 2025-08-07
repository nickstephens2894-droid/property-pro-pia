import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface YearProjection {
  year: number;
  rentalIncome: number;
  propertyValue: number;
  mainLoanBalance: number;
  totalInterest: number;
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
  
  // Default property assumptions (would normally come from PropertyAnalysis state)
  const [assumptions, setAssumptions] = useState({
    initialPropertyValue: 750000,
    initialWeeklyRent: 650,
    capitalGrowthRate: 4.0,
    rentalGrowthRate: 3.0,
    vacancyRate: 2.0,
    initialLoanBalance: 600000,
    interestRate: 6.5,
    loanTerm: 30,
    isIOLoan: true,
    ioTermYears: 5,
    propertyManagementRate: 8.0,
    councilRates: 2500,
    insurance: 1200,
    repairs: 2000,
    expenseInflationRate: 2.5,
    marginalTaxRate: 37.0,
    depreciationYear1: 15000
  });

  const [yearRange, setYearRange] = useState([1, 8]);

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
    let loanBalance = assumptions.initialLoanBalance;
    
    // Calculate loan payment
    const monthlyRate = assumptions.interestRate / 100 / 12;
    const totalMonths = assumptions.loanTerm * 12;
    const piMonthlyPayment = loanBalance * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    const ioMonthlyPayment = loanBalance * monthlyRate;
    
    let cumulativeCashFlow = 0;
    
    for (let year = 1; year <= 40; year++) {
      // Rental income with growth and vacancy
      const grossRentalIncome = annualRent * Math.pow(1 + assumptions.rentalGrowthRate / 100, year - 1);
      const rentalIncome = grossRentalIncome * (1 - assumptions.vacancyRate / 100);
      
      // Property value with capital growth
      const propertyValue = assumptions.initialPropertyValue * Math.pow(1 + assumptions.capitalGrowthRate / 100, year - 1);
      
      // Loan balance calculation
      const isIOPeriod = assumptions.isIOLoan && year <= assumptions.ioTermYears;
      
      if (year > 1) {
        if (isIOPeriod) {
          // Interest only - balance doesn't change
          loanBalance = assumptions.initialLoanBalance;
        } else {
          // Principal and interest - calculate reducing balance
          const monthsFromPIStart = (year - (assumptions.ioTermYears + 1)) * 12;
          const remainingMonths = totalMonths - (assumptions.ioTermYears * 12);
          if (remainingMonths > 0 && monthsFromPIStart >= 0) {
            loanBalance = assumptions.initialLoanBalance * (Math.pow(1 + monthlyRate, remainingMonths) - Math.pow(1 + monthlyRate, monthsFromPIStart)) / (Math.pow(1 + monthlyRate, remainingMonths) - 1);
          }
        }
      }
      
      // Interest expense (tax deductible)
      const totalInterest = loanBalance * (assumptions.interestRate / 100);
      
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
      const loanPayments = isIOPeriod ? ioMonthlyPayment * 12 : piMonthlyPayment * 12;
      const afterTaxCashFlow = rentalIncome - otherExpenses - loanPayments + taxBenefit;
      cumulativeCashFlow += afterTaxCashFlow;
      
      // Property equity
      const propertyEquity = propertyValue - loanBalance;
      
      // Total return (cash flow + equity growth)
      const totalReturn = afterTaxCashFlow + (year > 1 ? propertyValue - assumptions.initialPropertyValue * Math.pow(1 + assumptions.capitalGrowthRate / 100, year - 2) : 0);
      
      years.push({
        year,
        rentalIncome,
        propertyValue,
        mainLoanBalance: loanBalance,
        totalInterest,
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
                  <label className="text-sm font-medium">Interest Rate</label>
                  <div className="px-3">
                    <Slider
                      value={[assumptions.interestRate]}
                      onValueChange={(value) => setAssumptions(prev => ({ ...prev, interestRate: value[0] }))}
                      max={12}
                      min={3}
                      step={0.25}
                      className="w-full"
                    />
                  </div>
                  <div className="text-center text-sm text-muted-foreground">{formatPercentage(assumptions.interestRate)}</div>
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
                  
                  {/* Loan Amount */}
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background z-10 font-medium">Loan amount</TableCell>
                    <TableCell className="text-center bg-muted/30 font-mono text-sm">{formatCurrency(assumptions.initialLoanBalance)}</TableCell>
                    {filteredProjections.map((projection) => (
                      <TableCell key={projection.year} className="text-center font-mono text-sm">{formatCurrency(projection.mainLoanBalance)}</TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Equity */}
                  <TableRow>
                    <TableCell className="sticky left-0 bg-background z-10 font-medium">Equity</TableCell>
                    <TableCell className="text-center bg-muted/30 font-mono text-sm text-destructive">{formatCurrency(assumptions.initialPropertyValue - assumptions.initialLoanBalance)}</TableCell>
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
                    <TableCell className="text-center bg-muted/30 font-mono text-sm">{formatPercentage(assumptions.interestRate)}</TableCell>
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