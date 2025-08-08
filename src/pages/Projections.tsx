import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ArrowLeft, Download, Users, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePropertyData } from "@/contexts/PropertyDataContext";
import ProjectionsTable from "@/components/ProjectionsTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertySummaryDashboard } from "@/components/PropertySummaryDashboard";
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
  const {
    propertyData,
    setPropertyData
  } = usePropertyData();

  // Use centralized calculations from context
  const {
    calculateTotalProjectCost,
    calculateEquityLoanAmount,
    calculateHoldingCosts
  } = usePropertyData();
  const funding = {
    mainLoanAmount: propertyData.loanAmount,
    equityLoanAmount: calculateEquityLoanAmount(),
    totalProjectCost: calculateTotalProjectCost()
  };

  // Property assumptions derived from property data but adjustable
  const [assumptions, setAssumptions] = useState({
    initialPropertyValue: propertyData.purchasePrice || funding.totalProjectCost,
    initialWeeklyRent: propertyData.weeklyRent,
    capitalGrowthRate: 7.0,
    rentalGrowthRate: 5.0,
    vacancyRate: propertyData.vacancyRate,
    initialMainLoanBalance: funding.mainLoanAmount,
    initialEquityLoanBalance: funding.equityLoanAmount,
    mainInterestRate: 6.0,
    equityInterestRate: propertyData.equityLoanInterestRate || 7.2,
    // Default if not set
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
    depreciationYear1: 15000
  });
  const [yearRange, setYearRange] = useState<[number, number]>([1, 30]);
  const [clientAccordionOpen, setClientAccordionOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'year' | 'table'>("table");
  // Separate state for input values to allow free editing - initialize once
  const [inputValues, setInputValues] = useState({
    yearFrom: yearRange[0].toString(),
    yearTo: yearRange[1].toString(),
    capitalGrowth: assumptions.capitalGrowthRate.toString(),
    rentalGrowth: assumptions.rentalGrowthRate.toString(),
    interestRate: assumptions.mainInterestRate.toString()
  });

  // Calculate per-client progressive tax instead of weighted average
  const calculateClientTax = (client: any, totalIncome: number) => {
    let tax = 0;

    // 2024-25 Australian tax brackets
    const brackets = [{
      min: 0,
      max: 18200,
      rate: 0
    }, {
      min: 18201,
      max: 45000,
      rate: 0.19
    }, {
      min: 45001,
      max: 120000,
      rate: 0.325
    }, {
      min: 120001,
      max: 180000,
      rate: 0.37
    }, {
      min: 180001,
      max: Infinity,
      rate: 0.45
    }];
    for (const bracket of brackets) {
      if (totalIncome <= bracket.min) break;
      const taxableInThisBracket = Math.min(totalIncome - bracket.min, bracket.max - bracket.min);
      if (taxableInThisBracket > 0) {
        tax += taxableInThisBracket * bracket.rate;
      }
    }

    // Add Medicare levy (2%) for applicable clients
    if (client.hasMedicareLevy && totalIncome > 26000) {
      tax += totalIncome * 0.02;
    }
    return tax;
  };
  const calculateTotalTaxDifference = (propertyTaxableIncome: number) => {
    let totalDifference = 0;
    propertyData.clients.forEach(client => {
      const ownership = propertyData.ownershipAllocations.find(o => o.clientId === client.id);
      const ownershipPercentage = ownership ? ownership.ownershipPercentage / 100 : 0;
      if (ownershipPercentage > 0) {
        const baseIncome = client.annualIncome + client.otherIncome;
        const allocatedPropertyIncome = propertyTaxableIncome * ownershipPercentage;
        const taxWithoutProperty = calculateClientTax(client, baseIncome);
        const taxWithProperty = calculateClientTax(client, baseIncome + allocatedPropertyIncome);
        totalDifference += taxWithProperty - taxWithoutProperty;
      }
    });
    return totalDifference;
  };

  // Validate year range (max 25 year span)
  const validatedYearRange = useMemo((): [number, number] => {
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
    const equityPIMonthlyPayment = assumptions.initialEquityLoanBalance > 0 ? calculateLoanPayment(assumptions.initialEquityLoanBalance, assumptions.equityInterestRate, assumptions.equityLoanTerm) : 0;
    const equityIOMonthlyPayment = assumptions.initialEquityLoanBalance * (assumptions.equityInterestRate / 100 / 12);
    let cumulativeCashFlow = 0;

    // Construction period calculation (if applicable)
    const holdingCosts = calculateHoldingCosts();
    let constructionPeriodProjection = null;
    if (propertyData.isConstructionProject && propertyData.constructionPeriod > 0) {
      // Calculate construction period loan payments
      const constructionMonths = propertyData.constructionPeriod;
      const constructionMainPayment = mainIOMonthlyPayment * constructionMonths; // Assume IO during construction
      const constructionEquityPayment = equityIOMonthlyPayment * constructionMonths;
      const totalConstructionPayments = constructionMainPayment + constructionEquityPayment;

      // Tax benefit from holding costs (interest only is deductible)
      const constructionTaxableIncome = -holdingCosts.total; // Negative income from interest deductions
      const constructionTaxBenefit = -calculateTotalTaxDifference(constructionTaxableIncome);

      // After-tax cash flow for construction period
      const constructionAfterTaxCashFlow = -totalConstructionPayments + constructionTaxBenefit;
      cumulativeCashFlow += constructionAfterTaxCashFlow;
      constructionPeriodProjection = {
        year: 0,
        // Construction period
        rentalIncome: 0,
        propertyValue: 0,
        // Not applicable during construction
        mainLoanBalance: 0,
        // Not applicable during construction
        equityLoanBalance: 0,
        // Not applicable during construction
        totalInterest: holdingCosts.total,
        mainLoanPayment: constructionMainPayment,
        equityLoanPayment: constructionEquityPayment,
        mainLoanIOStatus: 'IO' as const,
        equityLoanIOStatus: 'IO' as const,
        otherExpenses: 0,
        depreciation: 0,
        taxableIncome: constructionTaxableIncome,
        taxBenefit: constructionTaxBenefit,
        afterTaxCashFlow: constructionAfterTaxCashFlow,
        cumulativeCashFlow,
        propertyEquity: 0,
        // Not applicable during construction
        totalReturn: constructionAfterTaxCashFlow
      };
    }
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
      const equityLoanPayment = assumptions.initialEquityLoanBalance > 0 ? equityIsIOPeriod ? equityIOMonthlyPayment * 12 : equityPIMonthlyPayment * 12 : 0;

      // Update loan balances for current year (before calculating interest)
      // Main loan balance calculation
      if (mainIsIOPeriod) {
        // During IO period, balance stays the same
        mainLoanBalance = assumptions.initialMainLoanBalance;
      } else {
        // During P&I period, calculate amortized balance
        if (assumptions.mainLoanType === 'pi') {
          // P&I from start - calculate balance after (year-1) years of payments
          const monthsElapsed = (year - 1) * 12;
          const totalMonths = assumptions.mainLoanTerm * 12;
          const monthlyRate = assumptions.mainInterestRate / 100 / 12;
          if (monthsElapsed >= totalMonths) {
            mainLoanBalance = 0;
          } else {
            // Standard amortization formula: remaining balance after n payments
            mainLoanBalance = assumptions.initialMainLoanBalance * (Math.pow(1 + monthlyRate, totalMonths) - Math.pow(1 + monthlyRate, monthsElapsed)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
          }
        } else {
          // IO first, then P&I - calculate balance after IO period ended
          const monthsFromPIStart = Math.max(0, (year - (assumptions.mainIOTermYears + 1)) * 12);
          const remainingMonths = assumptions.mainLoanTerm * 12 - assumptions.mainIOTermYears * 12;
          if (remainingMonths > 0 && monthsFromPIStart >= 0) {
            const monthlyRate = assumptions.mainInterestRate / 100 / 12;
            mainLoanBalance = assumptions.initialMainLoanBalance * (Math.pow(1 + monthlyRate, remainingMonths) - Math.pow(1 + monthlyRate, monthsFromPIStart)) / (Math.pow(1 + monthlyRate, remainingMonths) - 1);
          }
        }
      }

      // Equity loan balance calculation  
      if (assumptions.initialEquityLoanBalance > 0) {
        if (equityIsIOPeriod) {
          // During IO period, balance stays the same
          equityLoanBalance = assumptions.initialEquityLoanBalance;
        } else {
          // During P&I period, calculate amortized balance
          if (assumptions.equityLoanType === 'pi') {
            // P&I from start - calculate balance after (year-1) years of payments
            const monthsElapsed = (year - 1) * 12;
            const totalMonths = assumptions.equityLoanTerm * 12;
            const monthlyRate = assumptions.equityInterestRate / 100 / 12;
            if (monthsElapsed >= totalMonths) {
              equityLoanBalance = 0;
            } else {
              // Standard amortization formula: remaining balance after n payments
              equityLoanBalance = assumptions.initialEquityLoanBalance * (Math.pow(1 + monthlyRate, totalMonths) - Math.pow(1 + monthlyRate, monthsElapsed)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
            }
          } else {
            // IO first, then P&I - calculate balance after IO period ended
            const monthsFromPIStart = Math.max(0, (year - (assumptions.equityIOTermYears + 1)) * 12);
            const remainingMonths = assumptions.equityLoanTerm * 12 - assumptions.equityIOTermYears * 12;
            if (remainingMonths > 0 && monthsFromPIStart >= 0) {
              const monthlyRate = assumptions.equityInterestRate / 100 / 12;
              equityLoanBalance = assumptions.initialEquityLoanBalance * (Math.pow(1 + monthlyRate, remainingMonths) - Math.pow(1 + monthlyRate, monthsFromPIStart)) / (Math.pow(1 + monthlyRate, remainingMonths) - 1);
            }
          }
        }
      }

      // Interest expense (tax deductible) - calculated on current year's balance
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

      // Tax calculations using progressive tax method
      const taxableIncome = rentalIncome - totalInterest - otherExpenses - depreciation;
      const taxBenefit = -calculateTotalTaxDifference(taxableIncome);

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

    // Include construction period at the beginning if applicable
    if (constructionPeriodProjection) {
      return [constructionPeriodProjection, ...years];
    }
    return years;
  }, [assumptions, propertyData, calculateTotalTaxDifference, calculateHoldingCosts]);

  // Filter projections based on selected year range
  const filteredProjections = projections.filter(p => p.year >= validatedYearRange[0] && p.year <= validatedYearRange[1]);
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
  const equityAtYearTo = projections.find(p => p.year === validatedYearRange[1])?.propertyEquity ?? 0;

  // Investment Summary metrics based on Year From
  const yearFrom = validatedYearRange[0];
  const currentYearData = projections.find(p => p.year === yearFrom);
  const weeklyAfterTaxCashFlowSummary = (currentYearData?.afterTaxCashFlow ?? 0) / 52;
  const grossYieldSummary = funding.totalProjectCost ? (currentYearData?.rentalIncome ?? 0) / funding.totalProjectCost * 100 : 0;
  const cashOnCashReturnSummary = propertyData.depositAmount > 0 ? (currentYearData?.afterTaxCashFlow ?? 0) / propertyData.depositAmount * 100 : 0;
  const taxDifferenceSummary = -(currentYearData?.taxBenefit ?? 0);
  const annualRentSummary = currentYearData?.rentalIncome ?? 0;
  const totalExpensesSummary = (currentYearData?.totalInterest ?? 0) + (currentYearData?.otherExpenses ?? 0) + (currentYearData?.depreciation ?? 0);
  const marginalTaxRateSummary = propertyData.clients.length > 0 ? Math.max(...propertyData.clients.map(c => {
    const income = c.annualIncome + c.otherIncome;
    if (income <= 18200) return 0;
    if (income <= 45000) return 0.19;
    if (income <= 120000) return 0.325;
    if (income <= 180000) return 0.37;
    return 0.45;
  })) : 0.325;
  return <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/')} className="flex items-center gap-2">
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

      {/* Investment Summary Dashboard */}
      <PropertySummaryDashboard
        weeklyCashflowYear1={weeklyAfterTaxCashFlowSummary}
        taxSavingsYear1={-taxDifferenceSummary}
        taxSavingsTotal={projections.slice(0, validatedYearRange[1]).reduce((sum, p) => sum + Math.max(0, p.taxBenefit), 0)}
        netEquityAtYearTo={equityAtYearTo}
        yearTo={validatedYearRange[1]}
      />

      {/* Summary Cards */}
      

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Scenario Controls</CardTitle>
            <CardDescription>Adjust key assumptions and projection range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Year Range From/To */}
              <div className="space-y-2">
                <Label htmlFor="yearFrom" className="text-sm font-medium">Year From</Label>
                <Input id="yearFrom" type="text" value={inputValues.yearFrom} onChange={e => {
                setInputValues(prev => ({
                  ...prev,
                  yearFrom: e.target.value
                }));
              }} onBlur={e => {
                const value = Math.max(1, Math.min(40, parseInt(e.target.value) || 1));
                const to = Math.max(value, yearRange[1]);
                setYearRange([value, to]);
                setInputValues(prev => ({
                  ...prev,
                  yearFrom: value.toString()
                }));
              }} className="h-9" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="yearTo" className="text-sm font-medium">Year To</Label>
                <Input id="yearTo" type="text" value={inputValues.yearTo} onChange={e => {
                setInputValues(prev => ({
                  ...prev,
                  yearTo: e.target.value
                }));
              }} onBlur={e => {
                const value = Math.max(1, Math.min(40, parseInt(e.target.value) || 1));
                const from = Math.min(value, yearRange[0]);
                setYearRange([from, value]);
                setInputValues(prev => ({
                  ...prev,
                  yearTo: value.toString()
                }));
              }} className="h-9" />
              </div>
              
              {/* Capital Growth Rate */}
              <div className="space-y-2">
                <Label htmlFor="capitalGrowth" className="text-sm font-medium">Capital Growth</Label>
                <div className="relative">
                  <Input id="capitalGrowth" type="text" value={inputValues.capitalGrowth} onChange={e => {
                  setInputValues(prev => ({
                    ...prev,
                    capitalGrowth: e.target.value
                  }));
                }} onBlur={e => {
                  const value = Math.max(0, Math.min(15, parseFloat(e.target.value) || 0));
                  setAssumptions(prev => ({
                    ...prev,
                    capitalGrowthRate: value
                  }));
                  setInputValues(prev => ({
                    ...prev,
                    capitalGrowth: value.toString()
                  }));
                }} className="h-9 pr-8" />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">%</span>
                </div>
              </div>
              
              {/* Rental Growth Rate */}
              <div className="space-y-2">
                <Label htmlFor="rentalGrowth" className="text-sm font-medium">Rental Growth</Label>
                <div className="relative">
                  <Input id="rentalGrowth" type="text" value={inputValues.rentalGrowth} onChange={e => {
                  setInputValues(prev => ({
                    ...prev,
                    rentalGrowth: e.target.value
                  }));
                }} onBlur={e => {
                  const value = Math.max(0, Math.min(10, parseFloat(e.target.value) || 0));
                  setAssumptions(prev => ({
                    ...prev,
                    rentalGrowthRate: value
                  }));
                  setInputValues(prev => ({
                    ...prev,
                    rentalGrowth: value.toString()
                  }));
                }} className="h-9 pr-8" />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">%</span>
                </div>
              </div>
              
              {/* Main Interest Rate */}
              <div className="space-y-2">
                <Label htmlFor="interestRate" className="text-sm font-medium">Interest Rate</Label>
                <div className="relative">
                  <Input id="interestRate" type="text" value={inputValues.interestRate} onChange={e => {
                  setInputValues(prev => ({
                    ...prev,
                    interestRate: e.target.value
                  }));
                }} onBlur={e => {
                  const value = Math.max(0.1, Math.min(12, parseFloat(e.target.value) || 0.1));
                  setAssumptions(prev => ({
                    ...prev,
                    mainInterestRate: value
                  }));
                  setInputValues(prev => ({
                    ...prev,
                    interestRate: value.toString()
                  }));
                }} className="h-9 pr-8" />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
Tax Rate: {formatPercentage(marginalTaxRateSummary * 100)} (highest client marginal rate)
            </div>
          </CardContent>
        </Card>

        {/* Projections Table */}
        <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
  <div>
    <CardTitle>Investment Analysis - Projections over {validatedYearRange[1] - validatedYearRange[0] + 1} years</CardTitle>
    <CardDescription>Financial breakdown with metrics in rows and years in columns</CardDescription>
  </div>
  <Tabs value={viewMode} onValueChange={v => setViewMode(v as 'year' | 'table')}>
    <TabsList>
      <TabsTrigger value="year">Year by Year</TabsTrigger>
      <TabsTrigger value="table">Full Table</TabsTrigger>
    </TabsList>
  </Tabs>
        </CardHeader>
          <CardContent>
          <ProjectionsTable projections={projections} assumptions={assumptions} validatedYearRange={validatedYearRange} formatCurrency={formatCurrency} formatPercentage={formatPercentage} viewMode={viewMode} />
          </CardContent>
        </Card>

        {/* Client Income & Tax Optimization */}
        <Card>
          <Collapsible open={clientAccordionOpen} onOpenChange={setClientAccordionOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle>Client Income & Tax Optimization</CardTitle>
                      <CardDescription>Manage client details and ownership structure for optimal tax outcomes</CardDescription>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${clientAccordionOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-6">
                  {/* Tax Summary */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-medium mb-4">Current Tax Breakdown</h4>
                    
                    {/* Individual Investor Tax Breakdown */}
                    <div className="space-y-3 mb-4">
                      {propertyData.clients.map((client, index) => {
                      const allocation = propertyData.ownershipAllocations.find(o => o.clientId === client.id);
                      const ownershipPercentage = allocation?.ownershipPercentage || 0;
                      const individualTaxRate = (() => {
                        const income = client.annualIncome + client.otherIncome;
                        let rate = 0;
                        if (income <= 18200) rate = 0;else if (income <= 45000) rate = 19;else if (income <= 120000) rate = 32.5;else if (income <= 180000) rate = 37;else rate = 45;
                        if (client.hasMedicareLevy && income > 24276) rate += 2;
                        return rate;
                      })();

                      // Calculate this client's share of first year tax benefit
                      const firstYearTaxBenefit = projections[0]?.taxBenefit || 0;
                      const clientTaxBenefit = firstYearTaxBenefit * (ownershipPercentage / 100);
                      return <div key={client.id} className="bg-background/50 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-sm">{client.name}</span>
                              <span className="text-xs text-muted-foreground">{ownershipPercentage}% ownership</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-muted-foreground">Tax Rate:</span>
                                <div className="font-semibold">{formatPercentage(individualTaxRate)}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Annual Tax Benefit:</span>
                                <div className={`font-semibold ${clientTaxBenefit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatCurrency(clientTaxBenefit)}
                                </div>
                              </div>
                            </div>
                          </div>;
                    })}
                    </div>
                    
                    {/* Total Summary */}
                    <div className="border-t pt-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Ownership:</span>
                          <div className="font-semibold">
                            {propertyData.ownershipAllocations.reduce((sum, o) => sum + o.ownershipPercentage, 0)}%
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Annual Tax Benefit:</span>
                          <div className={`font-semibold ${(projections[0]?.taxBenefit || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(projections[0]?.taxBenefit || 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Client List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Clients & Ownership</h4>
                      <Button variant="outline" size="sm" onClick={() => {
                      const newClient = {
                        id: Date.now().toString(),
                        name: `Investor ${propertyData.clients.length + 1}`,
                        annualIncome: 75000,
                        otherIncome: 0,
                        hasMedicareLevy: true
                      };
                      const newAllocation = {
                        clientId: newClient.id,
                        ownershipPercentage: 0
                      };
                      propertyData.clients.push(newClient);
                      propertyData.ownershipAllocations.push(newAllocation);
                      setPropertyData({
                        ...propertyData
                      });
                    }} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Client
                      </Button>
                    </div>

                    {propertyData.clients.map((client, index) => {
                    const allocation = propertyData.ownershipAllocations.find(o => o.clientId === client.id);
                    const individualTaxRate = (() => {
                      const income = client.annualIncome + client.otherIncome;
                      let rate = 0;
                      if (income <= 18200) rate = 0;else if (income <= 45000) rate = 19;else if (income <= 120000) rate = 32.5;else if (income <= 180000) rate = 37;else rate = 45;
                      if (client.hasMedicareLevy && income > 24276) rate += 2;
                      return rate;
                    })();
                    return <div key={client.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="font-medium">Client {index + 1}</div>
                              <div className="text-sm text-muted-foreground">
                                Tax Rate: {formatPercentage(individualTaxRate)}
                              </div>
                            </div>
                            {propertyData.clients.length > 1 && <Button variant="ghost" size="sm" onClick={() => {
                          const updatedClients = propertyData.clients.filter(c => c.id !== client.id);
                          const updatedAllocations = propertyData.ownershipAllocations.filter(o => o.clientId !== client.id);
                          setPropertyData({
                            ...propertyData,
                            clients: updatedClients,
                            ownershipAllocations: updatedAllocations
                          });
                        }} className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`client-name-${client.id}`}>Name</Label>
                              <Input id={`client-name-${client.id}`} value={client.name} onChange={e => {
                            const updatedClients = propertyData.clients.map(c => c.id === client.id ? {
                              ...c,
                              name: e.target.value
                            } : c);
                            setPropertyData({
                              ...propertyData,
                              clients: updatedClients
                            });
                          }} className="h-9" />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`client-income-${client.id}`}>Annual Income</Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                                <Input id={`client-income-${client.id}`} type="text" value={client.annualIncome.toString()} onChange={e => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              const numericValue = parseInt(value) || 0;
                              const updatedClients = propertyData.clients.map(c => c.id === client.id ? {
                                ...c,
                                annualIncome: numericValue
                              } : c);
                              setPropertyData({
                                ...propertyData,
                                clients: updatedClients
                              });
                            }} className="h-9 pl-8" />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`client-other-${client.id}`}>Other Income</Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                                <Input id={`client-other-${client.id}`} type="text" value={client.otherIncome.toString()} onChange={e => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              const numericValue = parseInt(value) || 0;
                              const updatedClients = propertyData.clients.map(c => c.id === client.id ? {
                                ...c,
                                otherIncome: numericValue
                              } : c);
                              setPropertyData({
                                ...propertyData,
                                clients: updatedClients
                              });
                            }} className="h-9 pl-8" />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`client-ownership-${client.id}`}>Ownership %</Label>
                              <Input id={`client-ownership-${client.id}`} type="text" value={(allocation?.ownershipPercentage || 0).toFixed(1)} onChange={e => {
                            const value = e.target.value.replace(/[^0-9.]/g, '');
                            const numericValue = Math.max(0, Math.min(100, parseFloat(value) || 0));
                            const updatedAllocations = propertyData.ownershipAllocations.map(o => o.clientId === client.id ? {
                              ...o,
                              ownershipPercentage: numericValue
                            } : o);
                            setPropertyData({
                              ...propertyData,
                              ownershipAllocations: updatedAllocations
                            });
                          }} onBlur={e => {
                            const value = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                            const updatedAllocations = propertyData.ownershipAllocations.map(o => o.clientId === client.id ? {
                              ...o,
                              ownershipPercentage: value
                            } : o);
                            setPropertyData({
                              ...propertyData,
                              ownershipAllocations: updatedAllocations
                            });
                          }} className="h-9" />
                            </div>

                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <input type="checkbox" checked={client.hasMedicareLevy} onChange={e => {
                              const updatedClients = propertyData.clients.map(c => c.id === client.id ? {
                                ...c,
                                hasMedicareLevy: e.target.checked
                              } : c);
                              setPropertyData({
                                ...propertyData,
                                clients: updatedClients
                              });
                            }} className="rounded" />
                                Medicare Levy
                              </Label>
                            </div>
                          </div>
                        </div>;
                  })}
                  </div>

                  {/* Optimization Tips */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                    <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">Tax Optimization Tips</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Consider shifting more ownership to the lower income earner</li>
                      <li>• Ensure total ownership equals 100% for accurate projections</li>
                      <li>• Higher income earners benefit more from negative gearing</li>
                      <li>• Medicare levy applies to income over $24,276 (singles)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>;
};
export default Projections;