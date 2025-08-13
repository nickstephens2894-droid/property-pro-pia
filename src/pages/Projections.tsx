import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Download, Users, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePropertyData } from "@/contexts/PropertyDataContext";
import ProjectionsTable from "@/components/ProjectionsTable";
import ConstructionPeriodTable from "@/components/ConstructionPeriodTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertySummaryDashboard } from "@/components/PropertySummaryDashboard";
import { PresetSelector } from "@/components/PresetSelector";
import { resolve, Triplet } from "@/utils/overrides";
import { OverrideField } from "@/components/OverrideField";
import { totalTaxAU, marginalRateAU } from "@/utils/tax";
import { InvestmentResultsDetailed } from "@/components/InvestmentResultsDetailed";
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
type Assumptions = {
  initialPropertyValue: number;
  initialWeeklyRent: Triplet<number>;
  capitalGrowthRate: Triplet<number>;
  rentalGrowthRate: Triplet<number>;
  vacancyRate: Triplet<number>;
  initialMainLoanBalance: number;
  initialEquityLoanBalance: number;
  mainInterestRate: number;
  equityInterestRate: number;
  mainLoanTerm: number;
  equityLoanTerm: number;
  mainLoanType: 'io' | 'pi';
  equityLoanType: 'io' | 'pi';
  mainIOTermYears: number;
  equityIOTermYears: number;
  propertyManagementRate: Triplet<number>;
  councilRates: number;
  insurance: number;
  repairs: number;
  expenseInflationRate: number;
  depreciationYear1: number;
};
const Projections = () => {
  const navigate = useNavigate();
  const { propertyData, setPropertyData, applyPreset } = usePropertyData();

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

  // Property assumptions derived from property data but adjustable (with overrides)
  const [assumptions, setAssumptions] = useState<Assumptions>({
    initialPropertyValue: propertyData.purchasePrice || funding.totalProjectCost,
    initialWeeklyRent: { mode: 'auto', auto: propertyData.weeklyRent, manual: null },
    capitalGrowthRate: { mode: 'auto', auto: 7.0, manual: null },
    rentalGrowthRate: { mode: 'auto', auto: 5.0, manual: null },
    vacancyRate: { mode: 'auto', auto: propertyData.vacancyRate, manual: null },
    initialMainLoanBalance: funding.mainLoanAmount,
    initialEquityLoanBalance: funding.equityLoanAmount,
    mainInterestRate: propertyData.interestRate,
    equityInterestRate: propertyData.equityLoanInterestRate || 7.2,
    // Default if not set
    mainLoanTerm: propertyData.loanTerm,
    equityLoanTerm: propertyData.equityLoanTerm,
    mainLoanType: propertyData.mainLoanType,
    equityLoanType: propertyData.equityLoanType,
    mainIOTermYears: propertyData.ioTermYears,
    equityIOTermYears: propertyData.equityLoanIoTermYears,
    propertyManagementRate: { mode: 'auto', auto: propertyData.propertyManagement, manual: null },
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
    interestAdjValue: '',
    interestAdjStartYear: ''
  });

  // Calculate total household tax difference from property taxable income, indexing client incomes by CPI
  const calculateTotalTaxDifference = (propertyTaxableIncome: number, year: number) => {
    const cpiMultiplier = year >= 1 ? Math.pow(1 + (assumptions.expenseInflationRate || 0) / 100, year - 1) : 1;
    let totalDifference = 0;
    propertyData.clients.forEach(client => {
      const ownership = propertyData.ownershipAllocations.find(o => o.clientId === client.id);
      const ownershipPercentage = ownership ? ownership.ownershipPercentage / 100 : 0;
      if (ownershipPercentage > 0) {
        const baseIncome = (client.annualIncome + client.otherIncome) * cpiMultiplier;
        const allocatedPropertyIncome = propertyTaxableIncome * ownershipPercentage;
        const taxWithoutProperty = totalTaxAU(baseIncome, client.hasMedicareLevy);
        const taxWithProperty = totalTaxAU(baseIncome + allocatedPropertyIncome, client.hasMedicareLevy);
        totalDifference += taxWithProperty - taxWithoutProperty;
      }
    });
    return totalDifference;
  };

  // Validate year range (max 30 year span)
  const validatedYearRange = useMemo((): [number, number] => {
    const [start, end] = yearRange;
    const span = end - start + 1;
    if (span > 30) {
      return [start, start + 29];
    }
    return [start, end];
  }, [yearRange]);
  const projections = useMemo(() => {
    const years: YearProjection[] = [];
    const weeklyRent = resolve(assumptions.initialWeeklyRent) ?? 0;
    const annualRent = weeklyRent * 52;
    let mainLoanBalance = assumptions.initialMainLoanBalance;
    let equityLoanBalance = assumptions.initialEquityLoanBalance;

    // Apply interest rate adjustment if specified
    const rawStartYear = parseInt(inputValues.interestAdjStartYear);
    const adjustmentStartYear = isNaN(rawStartYear) ? null : Math.max(1, Math.min(40, rawStartYear));
    const rawAdj = parseFloat(inputValues.interestAdjValue);
    const hasAdj = !isNaN(rawAdj);
    const adjustmentValue = hasAdj ? rawAdj : null;
    
    const getEffectiveInterestRate = (baseRate: number, year: number) => {
      if (adjustmentValue !== null) {
        const startYear = adjustmentStartYear ?? 1; // default to Year 1 if not provided
        if (year >= startYear) {
          return adjustmentValue; // Override with adjustment value
        }
      }
      return baseRate;
    };

    // Track remaining months for dynamic rate adjustments
    const calculateMonthlyPayment = (balance: number, monthlyRate: number, remainingMonths: number) => {
      if (remainingMonths <= 0) return 0;
      if (monthlyRate === 0) return balance / remainingMonths;
      return balance * (monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)) / (Math.pow(1 + monthlyRate, remainingMonths) - 1);
    };
    const mainTotalMonths = assumptions.mainLoanTerm * 12;
    const mainIOMonths = assumptions.mainLoanType === 'io' ? assumptions.mainIOTermYears * 12 : 0;
    let mainRemainingMonths = Math.max(0, mainTotalMonths - mainIOMonths);
    const equityTotalMonths = assumptions.equityLoanTerm * 12;
    const equityIOMonths = assumptions.equityLoanType === 'io' ? assumptions.equityIOTermYears * 12 : 0;
    let equityRemainingMonths = Math.max(0, equityTotalMonths - equityIOMonths);
    let cumulativeCashFlow = 0;

    // Construction period calculation (if applicable)
    const holdingCosts = calculateHoldingCosts();
    let constructionPeriodProjection: YearProjection | null = null;

    // Adjust opening balances for construction period (capitalisation and equity P&I)
    if (propertyData.isConstructionProject && propertyData.constructionPeriod > 0) {
      const months = propertyData.constructionPeriod;

      // Capitalisation split
      const capitalisePortion = propertyData.capitalizeConstructionCosts
        ? 1
        : propertyData.holdingCostFunding === 'debt'
        ? 1
        : propertyData.holdingCostFunding === 'hybrid'
        ? Math.max(0, Math.min(1, (100 - (propertyData.holdingCostCashPercentage || 0)) / 100))
        : 0;

      // Rates during construction
      const mainMonthlyRateConstruction = (propertyData.constructionInterestRate || assumptions.mainInterestRate) / 100 / 12;
      const equityMonthlyRateConstruction = (assumptions.equityInterestRate || 0) / 100 / 12;

      // Main loan: IO during construction
      const mainInterestAccrued = assumptions.initialMainLoanBalance * mainMonthlyRateConstruction * months;
      const mainInterestCapitalised = mainInterestAccrued * capitalisePortion;
      const mainInterestCash = mainInterestAccrued - mainInterestCapitalised;
      // Update opening main balance for post-construction
      mainLoanBalance = assumptions.initialMainLoanBalance + mainInterestCapitalised;

      // Equity loan during construction: IO or P&I
      let equityInterestAccrued = 0;
      let equityInterestCapitalised = 0;
      let equityInterestCash = 0;
      let equityPrincipalPaid = 0;
      let equityBalanceTemp = assumptions.initialEquityLoanBalance;

      if (equityBalanceTemp > 0) {
        if (propertyData.constructionEquityRepaymentType === 'io') {
          equityInterestAccrued = equityBalanceTemp * equityMonthlyRateConstruction * months;
          equityInterestCapitalised = equityInterestAccrued * capitalisePortion;
          equityInterestCash = equityInterestAccrued - equityInterestCapitalised;
          // Balance only increases by capitalised interest under IO
          equityBalanceTemp = equityBalanceTemp + equityInterestCapitalised;
        } else {
          // P&I during construction: principal is always cash, interest can be capitalised per split
          const totalMonths = equityTotalMonths; // use full term for amortisation baseline
          const monthlyPayment = calculateMonthlyPayment(equityBalanceTemp, equityMonthlyRateConstruction, totalMonths);
          for (let m = 0; m < months; m++) {
            const interest = equityBalanceTemp * equityMonthlyRateConstruction;
            const principal = Math.min(Math.max(0, monthlyPayment - interest), equityBalanceTemp);
            equityInterestAccrued += interest;
            const capInt = interest * capitalisePortion;
            equityInterestCapitalised += capInt;
            equityInterestCash += interest - capInt;
            equityPrincipalPaid += principal; // always cash
            equityBalanceTemp = Math.max(0, equityBalanceTemp - principal + capInt);
            if (equityBalanceTemp <= 0) break;
          }
          // Reduce remaining P&I months after construction
          equityRemainingMonths = Math.max(0, equityRemainingMonths - months);
        }
      }

      // Set post-construction opening balance
      equityLoanBalance = equityBalanceTemp;

      const totalInterestAccrued = mainInterestAccrued + equityInterestAccrued;
      const constructionMainPaymentCash = mainInterestCash; // IO interest cash portion only
      const constructionEquityPaymentCash = equityInterestCash + equityPrincipalPaid;

      // Tax: use existing holdingCosts breakdown (deductible interest proxy)
      const constructionTaxableIncome = -holdingCosts.total;
      const constructionTaxBenefit = -calculateTotalTaxDifference(constructionTaxableIncome, 0);
      const constructionAfterTaxCashFlow = -(constructionMainPaymentCash + constructionEquityPaymentCash) + constructionTaxBenefit;
      cumulativeCashFlow += constructionAfterTaxCashFlow;

      constructionPeriodProjection = {
        year: 0,
        rentalIncome: 0,
        propertyValue: 0,
        mainLoanBalance: 0,
        equityLoanBalance: 0,
        totalInterest: Math.round(totalInterestAccrued),
        mainLoanPayment: Math.round(constructionMainPaymentCash),
        equityLoanPayment: Math.round(constructionEquityPaymentCash),
        mainInterestYear: Math.round(mainInterestAccrued),
        equityInterestYear: Math.round(equityInterestAccrued),
        mainLoanIOStatus: 'IO',
        equityLoanIOStatus: propertyData.constructionEquityRepaymentType === 'pi' ? 'P&I' : 'IO',
        otherExpenses: 0,
        depreciation: 0,
        taxableIncome: Math.round(constructionTaxableIncome),
        taxBenefit: Math.round(constructionTaxBenefit),
        afterTaxCashFlow: Math.round(constructionAfterTaxCashFlow),
        cumulativeCashFlow,
        propertyEquity: 0,
        totalReturn: Math.round(constructionAfterTaxCashFlow),
      };
    }
    for (let year = 1; year <= 40; year++) {
      // Rental income with growth and vacancy
      const rentalGrowth = (resolve(assumptions.rentalGrowthRate) ?? 0) / 100;
      const vacancy = (resolve(assumptions.vacancyRate) ?? 0) / 100;
      const grossRentalIncome = annualRent * Math.pow(1 + rentalGrowth, year - 1);
      const rentalIncome = grossRentalIncome * (1 - vacancy);

      // Property value with capital growth
      const capitalGrowth = (resolve(assumptions.capitalGrowthRate) ?? 0) / 100;
      const propertyValue = assumptions.initialPropertyValue * Math.pow(1 + capitalGrowth, year - 1);

      // Main and equity loan calculations with dynamic interest adjustment
      const mainIsIOPeriod = assumptions.mainLoanType === 'io' && year <= assumptions.mainIOTermYears;
      const equityIsIOPeriod = assumptions.equityLoanType === 'io' && year <= assumptions.equityIOTermYears && assumptions.initialEquityLoanBalance > 0;
      const mainLoanIOStatus: 'IO' | 'P&I' = mainIsIOPeriod ? 'IO' : 'P&I';
      const equityLoanIOStatus: 'IO' | 'P&I' = equityIsIOPeriod ? 'IO' : 'P&I';

      // Effective rates for this year
      const effectiveMainRate = getEffectiveInterestRate(assumptions.mainInterestRate, year);
      const effectiveEquityRate = getEffectiveInterestRate(assumptions.equityInterestRate, year);
      const mainMonthlyRate = effectiveMainRate / 100 / 12;
      const equityMonthlyRate = effectiveEquityRate / 100 / 12;

      let mainLoanPayment = 0;
      let equityLoanPayment = 0;
      let mainInterestYear = 0;
      let equityInterestYear = 0;

      // Main loan
      if (mainIsIOPeriod) {
        const months = 12;
        const monthly = mainLoanBalance * mainMonthlyRate;
        mainLoanPayment = monthly * months;
        mainInterestYear = mainLoanPayment; // IO payments are all interest
      } else if (mainRemainingMonths > 0 && mainLoanBalance > 0) {
        const months = Math.min(12, mainRemainingMonths);
        const monthlyPayment = calculateMonthlyPayment(mainLoanBalance, mainMonthlyRate, mainRemainingMonths);
        for (let m = 0; m < months; m++) {
          const interest = mainLoanBalance * mainMonthlyRate;
          const principal = Math.min(monthlyPayment - interest, mainLoanBalance);
          mainLoanBalance = Math.max(0, mainLoanBalance - principal);
          mainInterestYear += interest;
          mainLoanPayment += interest + principal;
          mainRemainingMonths -= 1;
          if (mainLoanBalance <= 0) break;
        }
      }

      // Equity loan
      if (assumptions.initialEquityLoanBalance > 0) {
        if (equityIsIOPeriod) {
          const months = 12;
          const monthly = equityLoanBalance * equityMonthlyRate;
          equityLoanPayment = monthly * months;
          equityInterestYear = equityLoanPayment;
        } else if (equityRemainingMonths > 0 && equityLoanBalance > 0) {
          const months = Math.min(12, equityRemainingMonths);
          const monthlyPayment = calculateMonthlyPayment(equityLoanBalance, equityMonthlyRate, equityRemainingMonths);
          for (let m = 0; m < months; m++) {
            const interest = equityLoanBalance * equityMonthlyRate;
            const principal = Math.min(monthlyPayment - interest, equityLoanBalance);
            equityLoanBalance = Math.max(0, equityLoanBalance - principal);
            equityInterestYear += interest;
            equityLoanPayment += interest + principal;
            equityRemainingMonths -= 1;
            if (equityLoanBalance <= 0) break;
          }
        }
      }

      const totalInterest = mainInterestYear + equityInterestYear;

      // Operating expenses with inflation
      const inflationMultiplier = Math.pow(1 + assumptions.expenseInflationRate / 100, year - 1);
      const pmRate = (resolve(assumptions.propertyManagementRate) ?? 0) / 100;
      const propertyManagement = rentalIncome * pmRate;
      const councilRates = assumptions.councilRates * inflationMultiplier;
      const insurance = assumptions.insurance * inflationMultiplier;
      const repairs = assumptions.repairs * inflationMultiplier;
      const otherExpenses = propertyManagement + councilRates + insurance + repairs;

      // Depreciation (diminishing over time)
      const depreciation = Math.max(0, assumptions.depreciationYear1 * Math.pow(0.95, year - 1));

      // Tax calculations using progressive tax method
      const taxableIncome = rentalIncome - totalInterest - otherExpenses - depreciation;
      const taxBenefit = -calculateTotalTaxDifference(taxableIncome, year);

      // Cash flow calculations
      const totalLoanPayments = mainLoanPayment + equityLoanPayment;
      const afterTaxCashFlow = rentalIncome - otherExpenses - totalLoanPayments + taxBenefit;
      cumulativeCashFlow += afterTaxCashFlow;

      // Property equity
      const propertyEquity = propertyValue - mainLoanBalance - equityLoanBalance;

      // Total return (cash flow + equity growth)
      const totalReturn = afterTaxCashFlow + (year > 1 ? propertyValue - assumptions.initialPropertyValue * Math.pow(1 + capitalGrowth, year - 2) : 0);
      years.push({
        year,
        rentalIncome,
        propertyValue,
        mainLoanBalance,
        equityLoanBalance,
        totalInterest,
        mainLoanPayment,
        equityLoanPayment,
        mainInterestYear,
        equityInterestYear,
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
  }, [assumptions, propertyData, calculateTotalTaxDifference, calculateHoldingCosts, inputValues]);

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

  // Investment Summary metrics based on Year From - memoized to update when year range changes
  const investmentSummary = useMemo(() => {
    const yearFrom = validatedYearRange[0];
    const yearTo = validatedYearRange[1];
    const currentYearData = projections.find(p => p.year === yearFrom);
    const yearToData = projections.find(p => p.year === yearTo);
    
    const weeklyAfterTaxCashFlowSummary = (currentYearData?.afterTaxCashFlow ?? 0) / 52;
    const taxDifferenceSummary = -(currentYearData?.taxBenefit ?? 0);
    const taxSavingsTotal = projections.slice(0, yearTo).reduce((sum, p) => sum + Math.max(0, p.taxBenefit), 0);
    const equityAtYearTo = yearToData?.propertyEquity ?? 0;
    
    // Calculate cumulative cash contribution (all negative cash flows = money put in)
    const cumulativeCashContribution = Math.abs(Math.min(0, projections.slice(0, yearTo).reduce((sum, p) => sum + p.afterTaxCashFlow, 0)));
    
    // Calculate ROI = Net Equity / Cumulative Cash Contribution * 100
    const roiAtYearTo = cumulativeCashContribution > 0 ? (equityAtYearTo / cumulativeCashContribution) * 100 : 0;
    
    const cpiMultiplier = yearFrom >= 1 ? Math.pow(1 + (assumptions.expenseInflationRate || 0) / 100, yearFrom - 1) : 1;
    const marginalTaxRateSummary = propertyData.clients.length > 0
      ? Math.max(...propertyData.clients.map(c => marginalRateAU((c.annualIncome + c.otherIncome) * cpiMultiplier)))
      : 0.325;
    
    return {
      weeklyAfterTaxCashFlowSummary,
      taxDifferenceSummary,
      taxSavingsTotal,
      equityAtYearTo,
      roiAtYearTo,
      marginalTaxRateSummary
    };
  }, [projections, validatedYearRange, propertyData.clients, assumptions.expenseInflationRate]);
  return <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
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

      <div className="mb-6">
        <PresetSelector 
          onApplyPreset={(presetData: any) => {
            const { propertyMethod, fundingMethod, ...dataToApply } = presetData;
            applyPreset(dataToApply, propertyMethod, fundingMethod);
          }}
          currentPropertyMethod={propertyData.currentPropertyMethod}
          currentFundingMethod={propertyData.currentFundingMethod}
        />
      </div>

      {/* Investment Summary Dashboard */}
      <PropertySummaryDashboard
        weeklyCashflowYear1={investmentSummary.weeklyAfterTaxCashFlowSummary}
        taxSavingsYear1={-investmentSummary.taxDifferenceSummary}
        taxSavingsTotal={investmentSummary.taxSavingsTotal}
        netEquityAtYearTo={investmentSummary.equityAtYearTo}
        roiAtYearTo={investmentSummary.roiAtYearTo}
        yearTo={validatedYearRange[1]}
      />

      {/* Summary Cards */}
      

        {/* Controls */}
        <Card className="mb-6">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Scenario Controls</CardTitle>
                    <CardDescription>Adjust key assumptions and projection range</CardDescription>
                  </div>
                  <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
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
              
              {/* Growth Assumptions */}
              <OverrideField
                label="Capital Growth"
                unit="%"
                triplet={assumptions.capitalGrowthRate}
                onChange={(t) => setAssumptions(prev => ({ ...prev, capitalGrowthRate: t }))}
              />
              <OverrideField
                label="Rental Growth"
                unit="%"
                triplet={assumptions.rentalGrowthRate}
                onChange={(t) => setAssumptions(prev => ({ ...prev, rentalGrowthRate: t }))}
              />
              
              {/* CPI for fixed costs & client incomes */}
              <div className="space-y-2">
                <Label htmlFor="cpiRate" className="text-sm font-medium">CPI (applies to fixed costs and client incomes)</Label>
                <div className="relative max-w-xs">
                  <Input
                    id="cpiRate"
                    type="text"
                    value={assumptions.expenseInflationRate.toString()}
                    onChange={e => {
                      const raw = e.target.value.replace(/[^0-9.]/g, '');
                      const val = Math.max(0, parseFloat(raw) || 0);
                      setAssumptions(prev => ({ ...prev, expenseInflationRate: val }));
                    }}
                    className="h-9 pr-10"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Applies to council rates, insurance, repairs and client incomes. Not applied to % fees, rent/capital growth, depreciation, or loan repayments.
                </p>
              </div>

              {/* Interest Rate Adjustment */}
              <div className="space-y-2 col-span-1">
                <Label htmlFor="interestAdj" className="text-sm font-medium">Interest Rate Adjustment</Label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <Input 
                      id="interestAdj" 
                      type="text" 
                      placeholder="e.g. 6.5"
                      value={inputValues.interestAdjValue} 
                      onChange={e => {
                        setInputValues(prev => ({ ...prev, interestAdjValue: e.target.value }));
                      }} 
                      className="h-9 pr-12" 
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">%</span>
                  </div>
                  <div className="relative w-36">
                    <Input id="interestAdjStartYear" placeholder="Start Year" type="text" value={inputValues.interestAdjStartYear} onChange={e => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setInputValues(prev => ({ ...prev, interestAdjStartYear: raw }));
                    }} onBlur={e => {
                      const val = Math.max(1, Math.min(40, parseInt(e.target.value || '0')));
                      setInputValues(prev => ({ ...prev, interestAdjStartYear: isNaN(val) ? '' : val.toString() }));
                    }} className="h-9 pr-8" />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">Yr</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setInputValues(prev => ({ ...prev, interestAdjValue: '', interestAdjStartYear: '' }))}>Clear</Button>
                </div>
                <p className="text-xs text-muted-foreground">Override base rates from Funding & Finance section. Clear to revert to original rates.</p>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
Tax Rate: {formatPercentage(investmentSummary.marginalTaxRateSummary * 100)} (highest client marginal rate)
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
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

        {/* Construction Period Table */}
        {projections.some(p => p.year === 0) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Construction Period Summary</CardTitle>
              <CardDescription>Interest-only holding costs and tax impact during build</CardDescription>
            </CardHeader>
            <CardContent>
              <ConstructionPeriodTable
                projection={projections.find(p => p.year === 0)!}
                months={propertyData.constructionPeriod}
                formatCurrency={formatCurrency}
              />
            </CardContent>
          </Card>
        )}
 
        <InvestmentResultsDetailed
          projections={projections}
          yearTo={validatedYearRange[1]}
          initialPropertyValue={assumptions.initialPropertyValue}
          totalProjectCost={calculateTotalProjectCost()}
          cpiRate={assumptions.expenseInflationRate}
          formatCurrency={formatCurrency}
          formatPercentage={formatPercentage}
        />
        
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