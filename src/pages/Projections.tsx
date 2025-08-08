import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ArrowLeft, Download, Users, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePropertyData } from "@/contexts/PropertyDataContext";
import ProjectionsTable from "@/components/ProjectionsTable";

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
  const { propertyData, setPropertyData } = usePropertyData();
  
  // Use centralized calculations from context
  const { calculateTotalProjectCost, calculateEquityLoanAmount } = usePropertyData();
  
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
    equityInterestRate: propertyData.equityLoanInterestRate || 7.2, // Default if not set
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

  // Calculate weighted average marginal tax rate from clients
  const calculateWeightedTaxRate = () => {
    const totalIncome = propertyData.clients.reduce((sum, client) => {
      const ownership = propertyData.ownershipAllocations.find(o => o.clientId === client.id)?.ownershipPercentage || 0;
      return sum + (client.annualIncome + client.otherIncome) * (ownership / 100);
    }, 0);

    if (totalIncome === 0) return 32.5; // Default middle tax rate

    let weightedRate = 0;
    propertyData.clients.forEach(client => {
      const ownership = propertyData.ownershipAllocations.find(o => o.clientId === client.id)?.ownershipPercentage || 0;
      const clientIncome = client.annualIncome + client.otherIncome;
      const weight = (clientIncome * (ownership / 100)) / totalIncome;
      
      // Australian tax brackets 2024-25 + Medicare levy
      let taxRate = 0;
      if (clientIncome <= 18200) taxRate = 0;
      else if (clientIncome <= 45000) taxRate = 19;
      else if (clientIncome <= 120000) taxRate = 32.5;
      else if (clientIncome <= 180000) taxRate = 37;
      else taxRate = 45;

      // Add Medicare levy (2%) for applicable clients
      if (client.hasMedicareLevy && clientIncome > 24276) {
        taxRate += 2;
      }

      weightedRate += taxRate * weight;
    });

    return weightedRate;
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
      
      // Tax calculations using weighted average rate
      const taxableIncome = rentalIncome - totalInterest - otherExpenses - depreciation;
      const weightedTaxRate = calculateWeightedTaxRate();
      const taxBenefit = taxableIncome < 0 ? Math.abs(taxableIncome) * (weightedTaxRate / 100) : -taxableIncome * (weightedTaxRate / 100);
      
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Year Range From/To */}
              <div className="space-y-2">
                <Label htmlFor="yearFrom" className="text-sm font-medium">Year From</Label>
                <Input
                  id="yearFrom"
                  type="text"
                  value={yearRange[0]}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value === '') return;
                    const from = Math.max(1, Math.min(40, parseInt(value)));
                    const to = Math.max(from, yearRange[1]);
                    const span = to - from + 1;
                    setYearRange(span > 25 ? [from, from + 24] : [from, to]);
                  }}
                  className="h-9"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="yearTo" className="text-sm font-medium">Year To</Label>
                <Input
                  id="yearTo"
                  type="text"
                  value={yearRange[1]}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value === '') return;
                    const to = Math.max(1, Math.min(40, parseInt(value)));
                    const from = Math.min(to, yearRange[0]);
                    const span = to - from + 1;
                    setYearRange(span > 25 ? [to - 24, to] : [from, to]);
                  }}
                  className="h-9"
                />
              </div>
              
              {/* Capital Growth Rate */}
              <div className="space-y-2">
                <Label htmlFor="capitalGrowth" className="text-sm font-medium">Capital Growth</Label>
                <div className="relative">
                  <Input
                    id="capitalGrowth"
                    type="text"
                    value={assumptions.capitalGrowthRate.toFixed(1)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      const numValue = parseFloat(value) || 0;
                      if (numValue >= 0 && numValue <= 15) {
                        setAssumptions(prev => ({ ...prev, capitalGrowthRate: numValue }));
                      }
                    }}
                    onBlur={(e) => {
                      const value = Math.max(0, Math.min(15, parseFloat(e.target.value) || 0));
                      setAssumptions(prev => ({ ...prev, capitalGrowthRate: value }));
                    }}
                    className="h-9 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">%</span>
                </div>
              </div>
              
              {/* Rental Growth Rate */}
              <div className="space-y-2">
                <Label htmlFor="rentalGrowth" className="text-sm font-medium">Rental Growth</Label>
                <div className="relative">
                  <Input
                    id="rentalGrowth"
                    type="text"
                    value={assumptions.rentalGrowthRate.toFixed(1)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      const numValue = parseFloat(value) || 0;
                      if (numValue >= 0 && numValue <= 10) {
                        setAssumptions(prev => ({ ...prev, rentalGrowthRate: numValue }));
                      }
                    }}
                    onBlur={(e) => {
                      const value = Math.max(0, Math.min(10, parseFloat(e.target.value) || 0));
                      setAssumptions(prev => ({ ...prev, rentalGrowthRate: value }));
                    }}
                    className="h-9 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">%</span>
                </div>
              </div>
              
              {/* Main Interest Rate */}
              <div className="space-y-2">
                <Label htmlFor="interestRate" className="text-sm font-medium">Interest Rate</Label>
                <div className="relative">
                  <Input
                    id="interestRate"
                    type="text"
                    value={assumptions.mainInterestRate.toFixed(1)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      const numValue = parseFloat(value) || 0;
                      if (numValue >= 3 && numValue <= 12) {
                        setAssumptions(prev => ({ ...prev, mainInterestRate: numValue }));
                      }
                    }}
                    onBlur={(e) => {
                      const value = Math.max(3, Math.min(12, parseFloat(e.target.value) || 3));
                      setAssumptions(prev => ({ ...prev, mainInterestRate: value }));
                    }}
                    className="h-9 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              Tax Rate: {formatPercentage(calculateWeightedTaxRate())} (calculated from client incomes)
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
            <ProjectionsTable
              projections={projections}
              assumptions={assumptions}
              validatedYearRange={validatedYearRange}
              formatCurrency={formatCurrency}
              formatPercentage={formatPercentage}
            />
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
                    <h4 className="font-medium mb-2">Current Tax Calculation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Weighted Tax Rate:</span>
                        <div className="font-semibold">{formatPercentage(calculateWeightedTaxRate())}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Ownership:</span>
                        <div className="font-semibold">
                          {propertyData.ownershipAllocations.reduce((sum, o) => sum + o.ownershipPercentage, 0)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Combined Income:</span>
                        <div className="font-semibold">
                          {formatCurrency(propertyData.clients.reduce((sum, c) => sum + c.annualIncome + c.otherIncome, 0))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Client List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Clients & Ownership</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
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
                          setPropertyData({ ...propertyData });
                        }}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Client
                      </Button>
                    </div>

                    {propertyData.clients.map((client, index) => {
                      const allocation = propertyData.ownershipAllocations.find(o => o.clientId === client.id);
                      const individualTaxRate = (() => {
                        const income = client.annualIncome + client.otherIncome;
                        let rate = 0;
                        if (income <= 18200) rate = 0;
                        else if (income <= 45000) rate = 19;
                        else if (income <= 120000) rate = 32.5;
                        else if (income <= 180000) rate = 37;
                        else rate = 45;
                        if (client.hasMedicareLevy && income > 24276) rate += 2;
                        return rate;
                      })();

                      return (
                        <div key={client.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="font-medium">Client {index + 1}</div>
                              <div className="text-sm text-muted-foreground">
                                Tax Rate: {formatPercentage(individualTaxRate)}
                              </div>
                            </div>
                            {propertyData.clients.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updatedClients = propertyData.clients.filter(c => c.id !== client.id);
                                  const updatedAllocations = propertyData.ownershipAllocations.filter(o => o.clientId !== client.id);
                                  setPropertyData({
                                    ...propertyData,
                                    clients: updatedClients,
                                    ownershipAllocations: updatedAllocations
                                  });
                                }}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`client-name-${client.id}`}>Name</Label>
                              <Input
                                id={`client-name-${client.id}`}
                                value={client.name}
                                onChange={(e) => {
                                  const updatedClients = propertyData.clients.map(c =>
                                    c.id === client.id ? { ...c, name: e.target.value } : c
                                  );
                                  setPropertyData({ ...propertyData, clients: updatedClients });
                                }}
                                className="h-9"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`client-income-${client.id}`}>Annual Income</Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                                <Input
                                  id={`client-income-${client.id}`}
                                  type="number"
                                  min={0}
                                  value={client.annualIncome}
                                  onChange={(e) => {
                                    const updatedClients = propertyData.clients.map(c =>
                                      c.id === client.id ? { ...c, annualIncome: parseInt(e.target.value) || 0 } : c
                                    );
                                    setPropertyData({ ...propertyData, clients: updatedClients });
                                  }}
                                  className="h-9 pl-8"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`client-other-${client.id}`}>Other Income</Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                                <Input
                                  id={`client-other-${client.id}`}
                                  type="number"
                                  min={0}
                                  value={client.otherIncome}
                                  onChange={(e) => {
                                    const updatedClients = propertyData.clients.map(c =>
                                      c.id === client.id ? { ...c, otherIncome: parseInt(e.target.value) || 0 } : c
                                    );
                                    setPropertyData({ ...propertyData, clients: updatedClients });
                                  }}
                                  className="h-9 pl-8"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`client-ownership-${client.id}`}>Ownership %</Label>
                              <Input
                                id={`client-ownership-${client.id}`}
                                type="number"
                                min={0}
                                max={100}
                                step={0.1}
                                value={allocation?.ownershipPercentage || 0}
                                onChange={(e) => {
                                  const value = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                                  const updatedAllocations = propertyData.ownershipAllocations.map(o =>
                                    o.clientId === client.id ? { ...o, ownershipPercentage: value } : o
                                  );
                                  setPropertyData({ ...propertyData, ownershipAllocations: updatedAllocations });
                                }}
                                className="h-9"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={client.hasMedicareLevy}
                                  onChange={(e) => {
                                    const updatedClients = propertyData.clients.map(c =>
                                      c.id === client.id ? { ...c, hasMedicareLevy: e.target.checked } : c
                                    );
                                    setPropertyData({ ...propertyData, clients: updatedClients });
                                  }}
                                  className="rounded"
                                />
                                Medicare Levy
                              </Label>
                            </div>
                          </div>
                        </div>
                      );
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
    </div>
  );
};

export default Projections;