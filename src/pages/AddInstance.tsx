import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Download, Building2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Import all the components from PropertyAnalysis and Projections
import { PropertyInputForm } from "@/components/PropertyInputForm";
import { FundingSummaryPanel } from "@/components/FundingSummaryPanel";

import { PropertySummaryDashboard } from "@/components/PropertySummaryDashboard";
import ProjectionsTable from "@/components/ProjectionsTable";
import ConstructionPeriodTable from "@/components/ConstructionPeriodTable";
import { InvestmentResultsDetailed } from "@/components/InvestmentResultsDetailed";
import { PropertyCalculationDetails } from "@/components/PropertyCalculationDetails";
import { PropertySelector } from "@/components/PropertySelector";

// Import the context hook
import { usePropertyData } from "@/contexts/PropertyDataContext";
import { useInstances } from "@/contexts/InstancesContext";
import { PROPERTY_METHODS } from "@/types/presets";

// Import utility functions
import { downloadInputsCsv } from "@/utils/csvExport";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import { resolve, Triplet } from "@/utils/overrides";
import { totalTaxAU, marginalRateAU } from "@/utils/tax";

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

const AddInstance = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { propertyData, updateField, calculateTotalProjectCost, calculateEquityLoanAmount, calculateHoldingCosts, applyPreset, resetToDefaults } = usePropertyData();
  const { createInstance, loading: instancesLoading } = useInstances();

  // State for the instance
  const [instanceName, setInstanceName] = useState("New Property Investment Instance");
  const [activeTab, setActiveTab] = useState("analysis");
  const [yearRange, setYearRange] = useState<[number, number]>([1, 30]);
  const [viewMode, setViewMode] = useState<'year' | 'table'>("table");
  const [selectedModel, setSelectedModel] = useState<any>(null);

  // Calculate all the necessary values for the components
  const totalProjectCost = calculateTotalProjectCost();
  const equityLoanAmount = calculateEquityLoanAmount();
  
  const funding = {
    mainLoanAmount: propertyData.loanAmount,
    equityLoanAmount: equityLoanAmount,
    totalProjectCost: totalProjectCost
  };

  // Calculate holding costs
  const holdingCosts = useMemo(() => {
    return calculateHoldingCosts();
  }, [calculateHoldingCosts]);

  // Clear any cached data and ensure clean slate on mount
  useEffect(() => {
    // Clear any localStorage data that might be persisting old investor data
    localStorage.removeItem('propertyData');
    localStorage.removeItem('propertyModels');
    
    // Force reset to defaults to ensure clean state
    resetToDefaults();
  }, []);

  // Debug: Monitor propertyData changes
  useEffect(() => {
    if (selectedModel) {
      console.log('PropertyData updated:', propertyData);
      console.log('Selected model:', selectedModel);
    }
  }, [propertyData, selectedModel]);

  // Calculate depreciation
  const depreciation = useMemo(() => {
    const buildingValue = propertyData.buildingValue || 0;
    const plantEquipmentValue = propertyData.plantEquipmentValue || 0;
    
    const capitalWorksDepreciation = propertyData.constructionYear >= 1987 ? buildingValue * 0.025 : 0;
    const plantEquipmentDepreciation = propertyData.isNewProperty ? plantEquipmentValue * 0.15 : 0;
    
    return {
      capitalWorks: capitalWorksDepreciation,
      plantEquipment: plantEquipmentDepreciation,
      total: capitalWorksDepreciation + plantEquipmentDepreciation
    };
  }, [propertyData.buildingValue, propertyData.plantEquipmentValue, propertyData.constructionYear, propertyData.isNewProperty]);

  // Calculate total household tax difference from property taxable income, indexing investor incomes by CPI
  const calculateTotalTaxDifference = (propertyTaxableIncome: number, year: number) => {
    const cpiMultiplier = year >= 1 ? Math.pow(1 + (2.5 || 0) / 100, year - 1) : 1;
    let totalDifference = 0;
    propertyData.investors.forEach(investor => {
      const ownership = propertyData.ownershipAllocations.find(o => o.investorId === investor.id);
      const ownershipPercentage = ownership ? ownership.ownershipPercentage / 100 : 0;
      if (ownershipPercentage > 0) {
        const baseIncome = (investor.annualIncome + investor.otherIncome) * cpiMultiplier;
        const allocatedPropertyIncome = propertyTaxableIncome * ownershipPercentage;
        const taxWithoutProperty = totalTaxAU(baseIncome, investor.hasMedicareLevy);
        const taxWithProperty = totalTaxAU(baseIncome + allocatedPropertyIncome, investor.hasMedicareLevy);
        totalDifference += taxWithProperty - taxWithoutProperty;
      }
    });
    return totalDifference;
  };

  // Calculate comprehensive projections using the same logic as the main Projections page
  const projections = useMemo(() => {
    const years: YearProjection[] = [];
    const weeklyRent = resolve({ mode: 'auto', auto: propertyData.weeklyRent, manual: null }) ?? 0;
    const annualRent = weeklyRent * 52;
    let mainLoanBalance = funding.mainLoanAmount;
    let equityLoanBalance = funding.equityLoanAmount;

    // Track remaining months for dynamic rate adjustments
    const calculateMonthlyPayment = (balance: number, monthlyRate: number, remainingMonths: number) => {
      if (remainingMonths <= 0) return 0;
      if (monthlyRate === 0) return balance / remainingMonths;
      return balance * (monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)) / (Math.pow(1 + monthlyRate, remainingMonths) - 1);
    };
    
    const mainTotalMonths = (propertyData.loanTerm || 30) * 12;
    const mainIOMonths = (propertyData.mainLoanType === 'io' ? (propertyData.ioTermYears || 0) : 0) * 12;
    let mainRemainingMonths = Math.max(0, mainTotalMonths - mainIOMonths);
    
    const equityTotalMonths = (propertyData.equityLoanTerm || 30) * 12;
    const equityIOMonths = (propertyData.equityLoanType === 'io' ? (propertyData.equityLoanIoTermYears || 0) : 0) * 12;
    let equityRemainingMonths = Math.max(0, equityTotalMonths - equityIOMonths);
    let cumulativeCashFlow = 0;

    // Construction period calculation (if applicable)
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
      const mainMonthlyRateConstruction = (propertyData.constructionInterestRate || propertyData.interestRate || 6.0) / 100 / 12;
      const equityMonthlyRateConstruction = (propertyData.equityLoanInterestRate || 7.2) / 100 / 12;

      // Main loan: IO during construction
      const mainInterestAccrued = funding.mainLoanAmount * mainMonthlyRateConstruction * months;
      const mainInterestCapitalised = mainInterestAccrued * capitalisePortion;
      const mainInterestCash = mainInterestAccrued - mainInterestCapitalised;
      // Update opening main balance for post-construction
      mainLoanBalance = funding.mainLoanAmount + mainInterestCapitalised;

      // Equity loan during construction: IO or P&I
      let equityInterestAccrued = 0;
      let equityInterestCapitalised = 0;
      let equityInterestCash = 0;
      let equityPrincipalPaid = 0;
      let equityBalanceTemp = funding.equityLoanAmount;

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
      const rentalGrowth = 5.0 / 100; // 5% rental growth
      const vacancy = (propertyData.vacancyRate || 5.0) / 100;
      const grossRentalIncome = annualRent * Math.pow(1 + rentalGrowth, year - 1);
      const rentalIncome = grossRentalIncome * (1 - vacancy);

      // Property value with capital growth
      const capitalGrowth = 7.0 / 100; // 7% capital growth
      const propertyValue = (propertyData.purchasePrice || totalProjectCost) * Math.pow(1 + capitalGrowth, year - 1);

      // Main and equity loan calculations
      const mainIsIOPeriod = propertyData.mainLoanType === 'io' && year <= (propertyData.ioTermYears || 0);
      const equityIsIOPeriod = propertyData.equityLoanType === 'io' && year <= (propertyData.equityLoanIoTermYears || 0) && funding.equityLoanAmount > 0;
      const mainLoanIOStatus: 'IO' | 'P&I' = mainIsIOPeriod ? 'IO' : 'P&I';
      const equityLoanIOStatus: 'IO' | 'P&I' = equityIsIOPeriod ? 'IO' : 'P&I';

      const mainMonthlyRate = (propertyData.interestRate || 6.0) / 100 / 12;
      const equityMonthlyRate = (propertyData.equityLoanInterestRate || 7.2) / 100 / 12;

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
      if (funding.equityLoanAmount > 0) {
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
      const inflationMultiplier = Math.pow(1 + 2.5 / 100, year - 1);
      const pmRate = (propertyData.propertyManagement || 7.0) / 100;
      const propertyManagement = rentalIncome * pmRate;
      const councilRates = (propertyData.councilRates || 0) * inflationMultiplier;
      const insurance = (propertyData.insurance || 0) * inflationMultiplier;
      const repairs = (propertyData.repairs || 0) * inflationMultiplier;
      const otherExpenses = propertyManagement + councilRates + insurance + repairs;

      // Depreciation (diminishing over time)
      const depreciationAmount = Math.max(0, (depreciation.total || 15000) * Math.pow(0.95, year - 1));

      // Tax calculations using progressive tax method
      const taxableIncome = rentalIncome - totalInterest - otherExpenses - depreciationAmount;
      const taxBenefit = -calculateTotalTaxDifference(taxableIncome, year);

      // Cash flow calculations
      const totalLoanPayments = mainLoanPayment + equityLoanPayment;
      const afterTaxCashFlow = rentalIncome - otherExpenses - totalLoanPayments + taxBenefit;
      cumulativeCashFlow += afterTaxCashFlow;

      // Property equity
      const propertyEquity = propertyValue - mainLoanBalance - equityLoanBalance;

      // Total return (cash flow + equity growth)
      const totalReturn = afterTaxCashFlow + (year > 1 ? propertyValue - (propertyData.purchasePrice || totalProjectCost) * Math.pow(1 + capitalGrowth, year - 2) : 0);
      
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
        depreciation: depreciationAmount,
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
  }, [propertyData, funding, holdingCosts, depreciation.total, calculateTotalTaxDifference, totalProjectCost]);

  // Calculate assumptions for projections
  const assumptions = useMemo(() => ({
    initialPropertyValue: propertyData.purchasePrice || totalProjectCost,
    initialWeeklyRent: { mode: 'auto', auto: propertyData.weeklyRent, manual: null },
    capitalGrowthRate: { mode: 'auto', auto: 7.0, manual: null },
    rentalGrowthRate: { mode: 'auto', auto: 5.0, manual: null },
    vacancyRate: { mode: 'auto', auto: propertyData.vacancyRate, manual: null },
    initialMainLoanBalance: funding.mainLoanAmount,
    initialEquityLoanBalance: funding.equityLoanAmount,
    mainInterestRate: propertyData.interestRate || 6.0,
    equityInterestRate: propertyData.equityLoanInterestRate || 7.2,
    mainLoanTerm: propertyData.loanTerm || 30,
    equityLoanTerm: propertyData.equityLoanTerm || 30,
    mainLoanType: propertyData.mainLoanType || 'pi',
    equityLoanType: propertyData.equityLoanType || 'io',
    mainIOTermYears: propertyData.ioTermYears || 5,
    equityIOTermYears: propertyData.equityLoanIoTermYears || 5,
    propertyManagementRate: { mode: 'auto', auto: propertyData.propertyManagement, manual: null },
    councilRates: propertyData.councilRates || 0,
    insurance: propertyData.insurance || 0,
    repairs: propertyData.repairs || 0,
    expenseInflationRate: 2.5,
    depreciationYear1: depreciation.total || 15000
  }), [propertyData, totalProjectCost, funding, depreciation.total]);

  // Calculate tax results for investors
  const investorTaxResults = useMemo(() => {
    if (!propertyData.investors || propertyData.investors.length === 0) return [];
    
    const annualRent = (propertyData.weeklyRent || 0) * 52;
    const totalDeductibleExpenses = (propertyData.councilRates || 0) + (propertyData.insurance || 0) + (propertyData.repairs || 0) + depreciation.total;
    
    return propertyData.investors.map(investor => {
      const ownership = propertyData.ownershipAllocations?.find(o => o.investorId === investor.id);
      const ownershipPercentage = ownership ? ownership.ownershipPercentage / 100 : 0;
      const allocatedRent = annualRent * ownershipPercentage;
      const allocatedDeductions = totalDeductibleExpenses * ownershipPercentage;
      
      const totalIncome = investor.annualIncome + (investor.otherIncome || 0);
      const propertyTaxableIncome = allocatedRent - allocatedDeductions;
      const totalIncomeWithProperty = totalIncome + propertyTaxableIncome;
      
      // Use proper tax calculation
      const taxWithoutProperty = totalTaxAU(totalIncome, investor.hasMedicareLevy);
      const taxWithProperty = totalTaxAU(totalIncomeWithProperty, investor.hasMedicareLevy);
      
      return {
        investor,
        ownershipPercentage,
        taxWithoutProperty,
        taxWithProperty,
        taxDifference: taxWithProperty - taxWithoutProperty,
        marginalTaxRate: marginalRateAU(totalIncome),
        propertyTaxableIncome
      };
    });
  }, [propertyData.investors, propertyData.ownershipAllocations, propertyData.weeklyRent, propertyData.councilRates, propertyData.insurance, propertyData.repairs, depreciation.total]);

  // Calculate investment summary metrics
  const investmentSummary = useMemo(() => {
    const yearFrom = yearRange[0];
    const yearTo = yearRange[1];
    const currentYearData = projections.find(p => p.year === yearFrom);
    const yearToData = projections.find(p => p.year === yearTo);
    
    const weeklyAfterTaxCashFlowSummary = (currentYearData?.afterTaxCashFlow ?? 0) / 52;
    const taxDifferenceSummary = -(currentYearData?.taxBenefit ?? 0);
    const taxSavingsTotal = projections.slice(0, yearTo).reduce((sum, p) => sum + Math.max(0, p.taxBenefit), 0);
    const cumulativeTaxImpact = projections.slice(0, yearTo).reduce((sum, p) => sum + p.taxBenefit, 0);
    const equityAtYearTo = yearToData?.propertyEquity ?? 0;
    
    // Calculate cumulative cash contribution (all negative cash flows = money put in)
    const cumulativeCashContribution = Math.abs(Math.min(0, projections.slice(0, yearTo).reduce((sum, p) => sum + p.afterTaxCashFlow, 0)));
    
    // Calculate ROI = Net Equity / Cumulative Cash Contribution * 100
    const roiAtYearTo = cumulativeCashContribution > 0 ? (equityAtYearTo / cumulativeCashContribution) * 100 : 0;
    
    const cpiMultiplier = yearFrom >= 1 ? Math.pow(1 + 2.5 / 100, yearFrom - 1) : 1;
    const marginalTaxRateSummary = propertyData.investors.length > 0
      ? Math.max(...propertyData.investors.map(c => marginalRateAU((c.annualIncome + c.otherIncome) * cpiMultiplier)))
      : 0.325;
    
    return {
      weeklyAfterTaxCashFlowSummary,
      taxDifferenceSummary,
      taxSavingsTotal,
      cumulativeTaxImpact,
      equityAtYearTo,
      roiAtYearTo,
      marginalTaxRateSummary
    };
  }, [projections, yearRange, propertyData.investors]);

  const handleSave = async () => {
    if (!instanceName.trim()) {
      alert('Please enter an instance name');
      return;
    }

    if (!selectedModel) {
      alert('Please select a property model');
      return;
    }

    try {
      // Validate required fields
      const requiredFields = [
        { field: 'purchasePrice', value: propertyData.purchasePrice, name: 'Purchase Price' },
        { field: 'weeklyRent', value: propertyData.weeklyRent, name: 'Weekly Rent' },
        { field: 'propertyState', value: propertyData.propertyState, name: 'Property State' }
      ];

      for (const { field, value, name } of requiredFields) {
        if (value === undefined || value === null) {
          alert(`Please provide a valid value for ${name}`);
          return;
        }
      }

      // Validate property state is one of the allowed values
      const allowedStates = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'];
      if (!allowedStates.includes(propertyData.propertyState)) {
        alert(`Property State must be one of: ${allowedStates.join(', ')}`);
        return;
      }

      // Prepare the instance data for database
      const instanceData = {
        name: instanceName,
        source_model_id: selectedModel?.id || null,
        property_method: propertyData.currentPropertyMethod || null,
        funding_method: propertyData.currentFundingMethod || null,
        investors: JSON.parse(JSON.stringify(propertyData.investors)),
        ownership_allocations: JSON.parse(JSON.stringify(propertyData.ownershipAllocations)),
        is_construction_project: propertyData.isConstructionProject,
        purchase_price: propertyData.purchasePrice,
        weekly_rent: propertyData.weeklyRent,
        rental_growth_rate: propertyData.rentalGrowthRate,
        vacancy_rate: propertyData.vacancyRate,
        construction_year: propertyData.constructionYear,
        building_value: propertyData.buildingValue,
        plant_equipment_value: propertyData.plantEquipmentValue,
        land_value: propertyData.landValue,
        construction_value: propertyData.constructionValue,
        construction_period: propertyData.constructionPeriod,
        construction_interest_rate: propertyData.constructionInterestRate,
        construction_progress_payments: JSON.parse(JSON.stringify(propertyData.constructionProgressPayments)),
        deposit: propertyData.deposit,
        loan_amount: propertyData.loanAmount,
        interest_rate: propertyData.interestRate,
        loan_term: propertyData.loanTerm,
        lvr: propertyData.lvr,
        main_loan_type: propertyData.mainLoanType,
        io_term_years: propertyData.ioTermYears,
        use_equity_funding: propertyData.useEquityFunding,
        primary_property_value: propertyData.primaryPropertyValue,
        existing_debt: propertyData.existingDebt,
        max_lvr: propertyData.maxLVR,
        equity_loan_type: propertyData.equityLoanType,
        equity_loan_io_term_years: propertyData.equityLoanIoTermYears,
        equity_loan_interest_rate: propertyData.equityLoanInterestRate,
        equity_loan_term: propertyData.equityLoanTerm,
        deposit_amount: propertyData.depositAmount,
        minimum_deposit_required: propertyData.minimumDepositRequired,
        holding_cost_funding: propertyData.holdingCostFunding,
        holding_cost_cash_percentage: propertyData.holdingCostCashPercentage,
        capitalize_construction_costs: propertyData.capitalizeConstructionCosts,
        construction_equity_repayment_type: propertyData.constructionEquityRepaymentType,
        land_holding_interest: propertyData.landHoldingInterest,
        construction_holding_interest: propertyData.constructionHoldingInterest,
        total_holding_costs: propertyData.totalHoldingCosts,
        stamp_duty: propertyData.stampDuty,
        legal_fees: propertyData.legalFees,
        inspection_fees: propertyData.inspectionFees,
        council_fees: propertyData.councilFees,
        architect_fees: propertyData.architectFees,
        site_costs: propertyData.siteCosts,
        property_management: propertyData.propertyManagement,
        council_rates: propertyData.councilRates,
        insurance: propertyData.insurance,
        repairs: propertyData.repairs,
        depreciation_method: propertyData.depreciationMethod,
        is_new_property: propertyData.isNewProperty,
        property_state: propertyData.propertyState || 'VIC',
        total_project_cost: totalProjectCost,
        equity_loan_amount: equityLoanAmount,
        available_equity: 0, // Will be calculated by the service
        status: 'draft' as const
      };

      console.log('Sending instance data:', instanceData);
      console.log('Property state value:', propertyData.propertyState);
      console.log('Property state type:', typeof propertyData.propertyState);

      // Create the instance in the database
      const newInstance = await createInstance(instanceData);
      
      // Show success message
      console.log('Instance created successfully:', newInstance);
      
      // Navigate to instances list
      navigate('/instances');
    } catch (error) {
      console.error('Failed to save instance:', error);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to save instance';
      
      // You could add a toast notification here
      // For now, we'll show an alert (you can replace this with a toast later)
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleBack = () => {
    navigate('/instances');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Enhanced Header with Wizard Step */}
        <div className="mb-8">
          {/* Back Button Row */}
          <div className="mb-6">
            <Button variant="ghost" size="sm" onClick={handleBack} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Instances
            </Button>
          </div>



        {/* Main Content Row */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                    {/* Instance Name Input - Enhanced */}
        <div className="flex-1 min-w-0">
          <Card className={`border-2 border-dashed transition-colors ${
            selectedModel 
              ? 'border-green-300 bg-green-50/50 hover:border-green-400' 
              : 'border-muted-foreground/20 hover:border-primary/30'
          }`}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  selectedModel ? 'bg-green-500' : 'bg-orange-500'
                }`}></div>
                <CardTitle className="text-lg">Instance Name</CardTitle>
                {selectedModel ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    From Property: {selectedModel.name}
                  </span>
                ) : (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                    No Model Selected
                  </span>
                )}
              </div>
              <CardDescription className="text-sm">
                {selectedModel 
                  ? 'Name populated from selected property - you can edit if needed'
                  : 'Select a property above to auto-populate the instance name and property details'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="relative">
                <input
                  type="text"
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                  className="w-full px-4 py-3 text-lg border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder={selectedModel ? selectedModel.name : "Select a property above to auto-populate..."}
                />
                {instanceName && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className={`w-2 h-2 rounded-full ${
                      selectedModel ? 'bg-green-500' : 'bg-blue-500'
                    }`}></div>
                  </div>
                )}
              </div>
              {selectedModel ? (
                instanceName && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Your instance will be saved as: <span className="font-medium text-foreground">"{instanceName}"</span>
                  </p>
                )
                              ) : (
                  <p className="mt-2 text-xs text-orange-600">
                    💡 Tip: Select a property above to automatically populate this field and all property details
                  </p>
                )}
            </CardContent>
          </Card>
        </div>

            {/* Action Buttons - Enhanced */}
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-col">
              <Button 
                variant="outline" 
                onClick={() => downloadInputsCsv(propertyData)}
                className="flex items-center gap-2 px-6 py-3 h-auto"
              >
                <Download className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Export CSV</div>
                  <div className="text-xs text-muted-foreground">Download current data</div>
                </div>
              </Button>
              
              <Button 
                onClick={handleSave}
                disabled={instancesLoading}
                className="flex items-center gap-2 px-6 py-3 h-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Save className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">
                    {instancesLoading ? 'Saving...' : 'Save & Continue'}
                  </div>
                  <div className="text-xs text-primary-foreground/80">
                    {instancesLoading ? 'Creating your instance...' : 'Create your instance'}
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>



        {/* Add Model Section */}
        <div className="mb-6">
          <PropertySelector 
            hasSelectedProperty={!!selectedModel}
            selectedPropertyName={selectedModel?.name}
            onApplyProperty={(propertyData: any) => {
              setSelectedModel(propertyData);
              // Set instance name from property
              setInstanceName(propertyData.name);
              
              console.log('Applying property data:', propertyData);
              
              // Map property model fields (snake_case) to PropertyData fields (camelCase)
              const mappedData = {
                // Basic property info
                purchasePrice: propertyData.purchase_price || 0,
                weeklyRent: propertyData.weekly_rent || 0,
                rentalGrowthRate: propertyData.rental_growth_rate || 5.0,
                vacancyRate: propertyData.vacancy_rate || 2.0,
                location: propertyData.location || '',
                
                // Construction details
                constructionYear: propertyData.construction_year || 2024,
                isConstructionProject: propertyData.is_construction_project || false,
                landValue: propertyData.land_value || 0,
                constructionValue: propertyData.construction_value || 0,
                constructionPeriod: propertyData.construction_period || 0,
                constructionInterestRate: propertyData.construction_interest_rate || 7.0,
                buildingValue: propertyData.building_value || 0,
                plantEquipmentValue: propertyData.plant_equipment_value || 0,
                
                // Transaction costs
                stampDuty: propertyData.stamp_duty || 0,
                legalFees: propertyData.legal_fees || 0,
                inspectionFees: propertyData.inspection_fees || 0,
                councilFees: propertyData.council_fees || 0,
                architectFees: propertyData.architect_fees || 0,
                siteCosts: propertyData.site_costs || 0,
                
                // Ongoing expenses
                propertyManagement: propertyData.property_management || 8.0,
                councilRates: propertyData.council_rates || 0,
                insurance: propertyData.insurance || 0,
                repairs: propertyData.repairs || 0,
                
                // Depreciation & tax
                depreciationMethod: propertyData.depreciation_method || 'prime-cost',
                isNewProperty: propertyData.is_new_property || true,
              };
              
              console.log('Mapped data to apply:', mappedData);
              applyPreset(mappedData, propertyData.property_method);
              console.log('Property data applied via applyPreset');
            }}
          />
          

        </div>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
          </TabsList>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-12'}`}>
              {/* Property Investment Details - Left Side */}
              <div className={isMobile ? 'col-span-1' : 'col-span-7'}>
                <div className="sticky top-4">
                  <PropertyInputForm
                    propertyData={propertyData}
                    updateField={updateField}
                    investorTaxResults={investorTaxResults}
                    totalTaxableIncome={0} // Will be calculated
                    marginalTaxRate={0.3} // Will be calculated
                    selectedModel={selectedModel}
                  />
                </div>
              </div>
              
              {/* Right Side - Summaries */}
              <div className={isMobile ? 'col-span-1' : 'col-span-5'}>
                <div className="space-y-6">
                  <FundingSummaryPanel />
                  <PropertyCalculationDetails
                    monthlyRepayment={(() => {
                      const { calculateLoanPayment } = require('@/utils/calculationUtils');
                      const mainMonthly = calculateLoanPayment(propertyData.loanAmount || 0, propertyData.interestRate || 6, propertyData.loanTerm || 30, 'monthly');
                      const equityMonthly = propertyData.useEquityFunding ? calculateLoanPayment(equityLoanAmount || 0, propertyData.equityLoanInterestRate || 7.2, propertyData.equityLoanTerm || 30, 'monthly') : 0;
                      return mainMonthly + equityMonthly;
                    })()}
                    annualRepayment={(() => {
                      const { calculateLoanPayment } = require('@/utils/calculationUtils');
                      const mainMonthly = calculateLoanPayment(propertyData.loanAmount || 0, propertyData.interestRate || 6, propertyData.loanTerm || 30, 'monthly');
                      const equityMonthly = propertyData.useEquityFunding ? calculateLoanPayment(equityLoanAmount || 0, propertyData.equityLoanInterestRate || 7.2, propertyData.equityLoanTerm || 30, 'monthly') : 0;
                      return (mainMonthly + equityMonthly) * 12;
                    })()}
                    annualRent={(propertyData.weeklyRent || 0) * 52}
                    propertyManagementCost={(propertyData.weeklyRent || 0) * 52 * (propertyData.propertyManagement || 0.07) / 100}
                    councilRates={propertyData.councilRates || 0}
                    insurance={propertyData.insurance || 0}
                    repairs={propertyData.repairs || 0}
                    totalDeductibleExpenses={(propertyData.councilRates || 0) + (propertyData.insurance || 0) + (propertyData.repairs || 0)}
                    depreciation={{
                      capitalWorks: depreciation.capitalWorks,
                      plantEquipment: depreciation.plantEquipment,
                      total: depreciation.total,
                      capitalWorksAvailable: propertyData.constructionYear >= 1987,
                      plantEquipmentRestricted: !propertyData.isNewProperty
                    }}
                    investorTaxResults={investorTaxResults}
                    totalTaxWithProperty={0} // Will be calculated
                    totalTaxWithoutProperty={0} // Will be calculated
                    marginalTaxRate={0.3} // Will be calculated
                    purchasePrice={propertyData.purchasePrice || 0}
                    constructionYear={propertyData.constructionYear || 2020}
                    depreciationMethod={propertyData.depreciationMethod || 'prime-cost'}
                    isConstructionProject={propertyData.isConstructionProject || false}
                    totalProjectCost={totalProjectCost}
                    holdingCosts={{
                      landInterest: holdingCosts.landInterest,
                      constructionInterest: holdingCosts.constructionInterest,
                      total: holdingCosts.total
                    }}
                    funding={{
                      totalRequired: totalProjectCost,
                      equityUsed: funding.equityLoanAmount,
                      cashRequired: totalProjectCost - funding.mainLoanAmount - funding.equityLoanAmount,
                      availableEquity: 0, // Will be calculated
                      loanAmount: funding.mainLoanAmount
                    }}
                    outOfPocketHoldingCosts={0} // Will be calculated
                    capitalizedHoldingCosts={0} // Will be calculated
                    actualCashInvested={0} // Will be calculated
                    constructionPeriod={propertyData.constructionPeriod || 0}
                    holdingCostFunding={propertyData.holdingCostFunding || 'cash'}
                    mainLoanPayments={(() => {
                      const { calculateLoanPayment } = require('@/utils/calculationUtils');
                      const isIO = propertyData.mainLoanType === 'io';
                      const ioPayment = isIO ? (propertyData.loanAmount || 0) * (propertyData.interestRate || 6) / 100 / 12 : 0;
                      const piPayment = calculateLoanPayment(propertyData.loanAmount || 0, propertyData.interestRate || 6, propertyData.loanTerm || 30, 'monthly');
                      const ioTermYears = propertyData.ioTermYears || 0;
                      return {
                        ioPayment,
                        piPayment,
                        ioTermYears,
                        remainingTerm: (propertyData.loanTerm || 30) - ioTermYears,
                        totalInterest: (propertyData.loanAmount || 0) * (propertyData.interestRate || 6) / 100,
                        currentPayment: isIO && ioTermYears > 0 ? ioPayment : piPayment,
                        futurePayment: isIO && ioTermYears > 0 ? piPayment : 0
                      };
                    })()}
                    equityLoanPayments={propertyData.useEquityFunding ? (() => {
                      const { calculateLoanPayment } = require('@/utils/calculationUtils');
                      const isIO = propertyData.equityLoanType === 'io';
                      const ioPayment = isIO ? (equityLoanAmount || 0) * (propertyData.equityLoanInterestRate || 7.2) / 100 / 12 : 0;
                      const piPayment = calculateLoanPayment(equityLoanAmount || 0, propertyData.equityLoanInterestRate || 7.2, propertyData.equityLoanTerm || 30, 'monthly');
                      const ioTermYears = propertyData.equityLoanIoTermYears || 0;
                      return {
                        ioPayment,
                        piPayment,
                        ioTermYears,
                        remainingTerm: (propertyData.equityLoanTerm || 30) - ioTermYears,
                        totalInterest: (equityLoanAmount || 0) * (propertyData.equityLoanInterestRate || 7.2) / 100,
                        currentPayment: isIO && ioTermYears > 0 ? ioPayment : piPayment,
                        futurePayment: isIO && ioTermYears > 0 ? piPayment : 0
                      };
                    })() : null}
                    totalAnnualInterest={(propertyData.loanAmount || 0) * (propertyData.interestRate || 0.06) / 100}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Projections Tab */}
          <TabsContent value="projections" className="space-y-6">
            {/* Investment Summary Dashboard */}
            <PropertySummaryDashboard
              weeklyCashflowYear1={investmentSummary.weeklyAfterTaxCashFlowSummary}
              taxSavingsYear1={-investmentSummary.taxDifferenceSummary}
              taxSavingsTotal={investmentSummary.taxSavingsTotal}
              netEquityAtYearTo={investmentSummary.equityAtYearTo}
              roiAtYearTo={investmentSummary.roiAtYearTo}
              yearTo={yearRange[1]}
            />

            {/* Projections Table */}
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle>Investment Analysis - Projections over {yearRange[1] - yearRange[0] + 1} years</CardTitle>
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
                <ProjectionsTable 
                  projections={projections}
                  assumptions={assumptions}
                  validatedYearRange={yearRange}
                  formatCurrency={formatCurrency}
                  formatPercentage={formatPercentage}
                  viewMode={viewMode}
                />
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
                    months={propertyData.constructionPeriod || 0}
                    formatCurrency={formatCurrency}
                  />
                </CardContent>
              </Card>
            )}

            {/* Investment Results Detailed */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Results Summary</CardTitle>
                <CardDescription>Comprehensive analysis of your investment performance</CardDescription>
              </CardHeader>
              <CardContent>
                <InvestmentResultsDetailed
                  projections={projections}
                  yearTo={yearRange[1]}
                  initialPropertyValue={propertyData.purchasePrice || 0}
                  totalProjectCost={totalProjectCost}
                  cpiRate={2.5}
                  formatCurrency={formatCurrency}
                  formatPercentage={formatPercentage}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AddInstance; 