import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Download, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

// Import all the components from PropertyAnalysis and Projections
import { PropertyInputForm } from "@/components/PropertyInputForm";
import { FundingSummaryPanel } from "@/components/FundingSummaryPanel";

import { PropertySummaryDashboard } from "@/components/PropertySummaryDashboard";
import ProjectionsTable from "@/components/ProjectionsTable";
import ConstructionPeriodTable from "@/components/ConstructionPeriodTable";
import { InvestmentResultsDetailed } from "@/components/InvestmentResultsDetailed";
import { PropertyCalculationDetails } from "@/components/PropertyCalculationDetails";
import { ValidationWarnings } from "@/components/ValidationWarnings";
import { MobileFinancialSummary } from "@/components/MobileFinancialSummary";

// Import the context hook
import { usePropertyData, PropertyData } from "@/contexts/PropertyDataContext";
import { useInstances } from "@/contexts/InstancesContext";
import { Database } from "@/integrations/supabase/types";

type Instance = Database['public']['Tables']['instances']['Row'];
import { useToast } from "@/hooks/use-toast";

// Import utility functions
import { downloadInputsCsv } from "@/utils/csvExport";
import { SaveIndicator } from "@/components/SaveIndicator";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import { resolve, Triplet } from "@/utils/overrides";
import { totalTaxAU, marginalRateAU } from "@/utils/tax";
import { calculateLoanPayment, calculateCurrentLoanPayment } from "@/utils/calculationUtils";

// Using the Instance type from Supabase types

interface LocalYearProjection {
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
  mainLoanIOStatus: "IO" | "P&I";
  equityLoanIOStatus: "IO" | "P&I";
  otherExpenses: number;
  depreciation: number;
  buildingDepreciation: number;
  fixturesDepreciation: number;
  taxableIncome: number;
  taxBenefit: number;
  afterTaxCashFlow: number; 
  cumulativeCashFlow: number;
  propertyEquity: number;
  totalReturn: number;
}

// Type definition for the assumptions object 
interface Assumptions {
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
  mainLoanType: string;
  equityLoanType: string;
  mainIOTermYears: number;
  equityIOTermYears: number;
  propertyManagementRate: Triplet<number>;
  councilRates: number;
  insurance: number;
  repairs: number;
  expenseInflationRate: number;
  depreciationYear1: number;
  isConstructionProject: boolean;
  constructionPeriod: number;
}

const InstanceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // State management
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analysis");
  const [yearRange, setYearRange] = useState([1, 10]);
  const [viewMode, setViewMode] = useState<'year' | 'table'>('year');
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingInstance, setDeletingInstance] = useState(false);

  // Context hooks
  const { propertyData, setPropertyData, updateField } = usePropertyData();
  const { getInstance, updateInstance, deleteInstance, instances } = useInstances();
  
  // State for the current instance
  const [instance, setInstance] = useState<Instance | null>(null);
  
  // Track unsaved changes
  const lastSavedDataRef = useRef<string>('');

  useEffect(() => {
    const loadInstance = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const fetchedInstance = await getInstance(id);
        if (fetchedInstance) {
          setInstance(fetchedInstance);
          
          // Convert the instance data to PropertyData format
          const convertedPropertyData: PropertyData = {
            // Property Details
            purchasePrice: fetchedInstance.purchase_price,
            weeklyRent: fetchedInstance.weekly_rent,
            propertyManagement: fetchedInstance.property_management || 7.0,
            vacancyRate: fetchedInstance.vacancy_rate || 2.0,
            
            // Property Information (use defaults if not available)
            propertyMethod: fetchedInstance.property_method || 'purchase',
            address: '',
            suburb: '',
            state: '',
            postcode: '',
            constructionYear: fetchedInstance.construction_year || 2020,
            isNewProperty: fetchedInstance.is_new_property || false,
            
            // Required fields with defaults
            rentalGrowthRate: 5.0,
            buildingValue: fetchedInstance.purchase_price * 0.6,
            plantEquipmentValue: fetchedInstance.purchase_price * 0.05,
            landValue: fetchedInstance.purchase_price * 0.4,
            constructionValue: 0,
            postConstructionRateReduction: 0.5,
            
            // Loan Details
            loanAmount: fetchedInstance.loan_amount || 0,
            interestRate: fetchedInstance.interest_rate || 6.5,
            loanTerm: fetchedInstance.loan_term || 30,
            mainLoanType: (fetchedInstance.main_loan_type as 'io' | 'pi') || 'pi',
            ioTermYears: fetchedInstance.io_term_years || 5,
            
            // Traditional financing
            deposit: 0,
            lvr: 80,
            
            // Equity Loan Details
            equityLoanAmount: fetchedInstance.equity_loan_amount || 0,
            equityLoanInterestRate: fetchedInstance.equity_loan_interest_rate || 7.2,
            equityLoanTerm: fetchedInstance.equity_loan_term || 30,
            equityLoanType: (fetchedInstance.equity_loan_type as 'io' | 'pi') || 'io',
            equityLoanIoTermYears: fetchedInstance.equity_loan_io_term_years || 5,
            
            // Equity funding
            useEquityFunding: (fetchedInstance.equity_loan_amount || 0) > 0,
            primaryPropertyValue: 1000000,
            existingDebt: 400000,
            maxLVR: 80,
            
            // Deposit and Costs  
            depositAmount: fetchedInstance.deposit_amount || 0,
            minimumDepositRequired: fetchedInstance.deposit_amount || 0,
            stampDuty: fetchedInstance.stamp_duty || 0,
            legalFees: fetchedInstance.legal_fees || 1500,
            inspectionFees: fetchedInstance.inspection_fees || 500,
            loanFees: 1000,
            
            // Property Expenses
            councilRates: fetchedInstance.council_rates || 2000,
            insurance: fetchedInstance.insurance || 1000,
            repairs: fetchedInstance.repairs || 1500,
            
            // Construction costs
            councilFees: 0,
            architectFees: 0,
            siteCosts: 0,
            professionalFees: 0,
            councilDevelopmentFees: 0,
            utilityConnections: 0,
            
            // Depreciation
            depreciationMethod: (fetchedInstance.depreciation_method as 'prime-cost' | 'diminishing-value') || 'prime-cost',
            
            // Construction Project specific
            isConstructionProject: fetchedInstance.is_construction_project || false,
            constructionPeriod: fetchedInstance.construction_period || 0,
            constructionInterestRate: fetchedInstance.construction_interest_rate || 6.5,
            holdingCostFunding: (fetchedInstance.holding_cost_funding as 'cash' | 'debt' | 'hybrid') || 'cash',
            holdingCostCashPercentage: 100,
            capitalizeConstructionCosts: false,
            constructionEquityRepaymentType: 'io' as 'io' | 'pi',
            landHoldingInterest: 0,
            constructionHoldingInterest: 0,
            totalHoldingCosts: 0,
            
            // Development costs (for construction projects)
            constructionProgressPayments: Array.isArray(fetchedInstance.construction_progress_payments) 
              ? fetchedInstance.construction_progress_payments.map((p: any) => ({
                  id: p.id || Math.random().toString(),
                  percentage: p.percentage || 0,
                  month: p.month || 1,
                  description: p.description || '',
                  amount: p.amount || 0
                }))
              : [],
            
            // Property state and metadata
            propertyState: 'VIC' as 'ACT' | 'NSW' | 'NT' | 'QLD' | 'SA' | 'TAS' | 'VIC' | 'WA',
            propertyType: 'Apartment',
            location: 'VIC',
            
            // Investors
            investors: Array.isArray(fetchedInstance.investors) 
              ? (fetchedInstance.investors as any[]).map((inv: any) => ({
                  id: inv.id || Math.random().toString(),
                  name: inv.name || '',
                  annualIncome: inv.annualIncome || 0,
                  otherIncome: inv.otherIncome || 0,
                  hasMedicareLevy: inv.hasMedicareLevy || false
                }))
              : [],
            ownershipAllocations: Array.isArray(fetchedInstance.ownership_allocations)
              ? (fetchedInstance.ownership_allocations as any[]).map((alloc: any) => ({
                  investorId: alloc.investorId || '',
                  ownershipPercentage: alloc.ownershipPercentage || 0
                }))
              : []
          };
          
          setPropertyData(convertedPropertyData);
          lastSavedDataRef.current = JSON.stringify(convertedPropertyData);
        }
      } catch (error) {
        console.error('Error loading instance:', error);
        toast({
          title: "Error",
          description: "Failed to load instance data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInstance();
  }, [id, getInstance, setPropertyData, toast]);

  // Track changes to propertyData for unsaved changes indicator
  useEffect(() => {
    const currentDataString = JSON.stringify(propertyData);
    if (lastSavedDataRef.current && lastSavedDataRef.current !== currentDataString) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [propertyData]);

  // Auto-save debounced
  useEffect(() => {
    if (!hasUnsavedChanges || !isEditMode) return;
    
    const timer = setTimeout(() => {
      handleSaveInstance();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [propertyData, hasUnsavedChanges, isEditMode]);

  // Warning before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSaveInstance = async () => {
    if (!id || !instance || saving) return;
    
    setSaving(true);
    try {
        // Convert PropertyData back to Instance format for database
        const updatedInstance: Partial<Instance> = {
          name: instance.name, // Keep existing name
          
          // Property Details
          purchase_price: propertyData.purchasePrice || 0,
          weekly_rent: propertyData.weeklyRent || 0,
          property_management: propertyData.propertyManagement || 7.0,
          vacancy_rate: propertyData.vacancyRate || 2.0,
          
          // Property Information
          property_method: propertyData.propertyMethod || 'purchase',
          construction_year: propertyData.constructionYear || 2020,
          is_new_property: propertyData.isNewProperty || false,
          
          // Loan Details
          loan_amount: propertyData.loanAmount || 0,
          interest_rate: propertyData.interestRate || 6.5,
          loan_term: propertyData.loanTerm || 30,
          main_loan_type: propertyData.mainLoanType || 'pi',
          io_term_years: propertyData.ioTermYears || 5,
          
          // Equity Loan Details
          equity_loan_amount: propertyData.equityLoanAmount || 0,
          equity_loan_interest_rate: propertyData.equityLoanInterestRate || 7.2,
          equity_loan_term: propertyData.equityLoanTerm || 30,
          equity_loan_type: propertyData.equityLoanType || 'io',
          equity_loan_io_term_years: propertyData.equityLoanIoTermYears || 5,
          
          // Deposit and Costs
          deposit_amount: propertyData.depositAmount || 0,
          stamp_duty: propertyData.stampDuty || 0,
          legal_fees: propertyData.legalFees || 1500,
          inspection_fees: propertyData.inspectionFees || 500,
          
          // Property Expenses
          council_rates: propertyData.councilRates || 2000,
          insurance: propertyData.insurance || 1000,
          repairs: propertyData.repairs || 1500,
          
          // Depreciation
          depreciation_method: propertyData.depreciationMethod || 'prime-cost',
          
          // Construction Project specific
          is_construction_project: propertyData.isConstructionProject || false,
          construction_period: propertyData.constructionPeriod || 0,
          construction_interest_rate: propertyData.constructionInterestRate || 6.5,
          holding_cost_funding: propertyData.holdingCostFunding || 'cash',
          
          // Development costs
          construction_progress_payments: propertyData.constructionProgressPayments as any || [],
          
          // Investors
          investors: propertyData.investors as any || [],
          ownership_allocations: propertyData.ownershipAllocations as any || [],
          
          // Timestamps
          updated_at: new Date().toISOString()
        };

      const savedInstance = await updateInstance(id, updatedInstance);
      if (savedInstance) {
        setInstance(savedInstance);
        lastSavedDataRef.current = JSON.stringify(propertyData);
        setHasUnsavedChanges(false);
        
        toast({
          title: "Instance Saved",
          description: "Your changes have been saved successfully.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error saving instance:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      // Revert to last saved state
      if (lastSavedDataRef.current) {
        const lastSavedData = JSON.parse(lastSavedDataRef.current);
        setPropertyData(lastSavedData);
      }
      setHasUnsavedChanges(false);
    }
    setIsEditMode(false);
  };

  // Enhanced updateField function that triggers edit mode
  const enhancedUpdateField = useCallback((path: string, value: any) => {
    updateField(path as keyof PropertyData, value);
    if (!isEditMode) {
      setIsEditMode(true);
    }
  }, [updateField, isEditMode]);

  // Calculate project costs and funding
  const totalProjectCost = useMemo(() => {
    const baseCost = propertyData.purchasePrice || 0;
    const transactionCosts = (propertyData.stampDuty || 0) + (propertyData.legalFees || 0) + (propertyData.inspectionFees || 0) + (propertyData.loanFees || 0);
    
      // Construction project additional costs
      const developmentCosts = propertyData.isConstructionProject ? 
        (propertyData.professionalFees || 0) + 
        (propertyData.councilDevelopmentFees || 0) + 
        (propertyData.utilityConnections || 0) +
        (propertyData.constructionProgressPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0)
        : 0;
    
    return baseCost + transactionCosts + developmentCosts;
  }, [propertyData]);

  const equityLoanAmount = useMemo(() => propertyData.equityLoanAmount || 0, [propertyData.equityLoanAmount]);

  const funding = useMemo(() => ({
    mainLoanAmount: propertyData.loanAmount || 0,
    equityLoanAmount: equityLoanAmount,
    totalLoanAmount: (propertyData.loanAmount || 0) + equityLoanAmount,
    cashRequired: Math.max(0, totalProjectCost - (propertyData.loanAmount || 0) - equityLoanAmount)
  }), [propertyData.loanAmount, equityLoanAmount, totalProjectCost]);

  const monthlyPayments = useMemo(() => {
    const mainLoanPayment = calculateCurrentLoanPayment(
      propertyData.loanAmount || 0,
      propertyData.interestRate || 6.5,
      propertyData.loanTerm || 30,
      propertyData.ioTermYears || 0,
      0, // Current year (initial calculation)
      'monthly'
    );

    const equityLoanPayment = equityLoanAmount > 0 ? calculateCurrentLoanPayment(
      equityLoanAmount,
      propertyData.equityLoanInterestRate || 7.2,
      propertyData.equityLoanTerm || 30,
      propertyData.equityLoanIoTermYears || 0,
      0, // Current year (initial calculation)
      'monthly'
    ) : 0;

    return {
      mainLoan: mainLoanPayment,
      equityLoan: equityLoanPayment,
      total: mainLoanPayment + equityLoanPayment
    };
  }, [propertyData, equityLoanAmount]);

  const loanPaymentDetails = useMemo(() => {
    const mainLoanDetails = {
      ioPayment: calculateLoanPayment(propertyData.loanAmount || 0, propertyData.interestRate || 6.5, 0),
      piPayment: calculateLoanPayment(propertyData.loanAmount || 0, propertyData.interestRate || 6.5, propertyData.loanTerm || 30),
      ioTermYears: propertyData.ioTermYears || 5,
      isIO: propertyData.mainLoanType === 'io'
    };

    const equityLoanDetails = equityLoanAmount > 0 ? {
      ioPayment: calculateLoanPayment(equityLoanAmount, propertyData.equityLoanInterestRate || 7.2, 0),
      piPayment: calculateLoanPayment(equityLoanAmount, propertyData.equityLoanInterestRate || 7.2, propertyData.equityLoanTerm || 30),
      ioTermYears: propertyData.equityLoanIoTermYears || 5,
      isIO: propertyData.equityLoanType === 'io'
    } : null;

    return { mainLoanDetails, equityLoanDetails };
  }, [propertyData, equityLoanAmount]);

  // Calculate holding costs for construction projects
  const holdingCosts = useMemo(() => {
    if (!propertyData.isConstructionProject || !propertyData.constructionPeriod) {
      return { landInterest: 0, constructionInterest: 0, total: 0 };
    }

    const months = propertyData.constructionPeriod;
    const interestRate = (propertyData.constructionInterestRate || 6.5) / 100;
    
    // Land interest (on full loan amount)
    const landValue = propertyData.purchasePrice || 0;
    const landInterest = (landValue * interestRate * months) / 12;
    
    // Construction progress payment costs - handle potential string values
    const constructionCosts = propertyData.constructionProgressPayments?.reduce((sum, payment) => {
      const amount = typeof payment.amount === 'number' ? payment.amount : 
                    typeof payment.amount === 'string' ? parseFloat(payment.amount) || 0 : 0;
      return sum + amount;
    }, 0) || 0;
    
    // Construction interest (on progressive drawdowns - approximate 50% average)
    const constructionInterest = (constructionCosts * 0.5 * interestRate * months) / 12;
    
    return {
      landInterest,
      constructionInterest,
      total: landInterest + constructionInterest
    };
  }, [propertyData]);

  // Calculate depreciation
  const depreciation = useMemo(() => {
    const isEligibleForCapitalWorks = (propertyData.constructionYear || 2020) >= 1987;
    const method = propertyData.depreciationMethod || 'prime-cost';
    
    // Capital Works (Building) - 2.5% or 4% depending on method
    const capitalWorksRate = method === 'prime-cost' ? 0.025 : 0.04;
    const buildingValue = (propertyData.purchasePrice || 0) * 0.6; // Assume 60% building value
    const capitalWorks = isEligibleForCapitalWorks ? buildingValue * capitalWorksRate : 0;
    
    // Plant & Equipment - typically 15-20% in first year
    const plantEquipmentValue = (propertyData.purchasePrice || 0) * 0.05; // Assume 5% P&E value
    const plantEquipmentRate = propertyData.isNewProperty ? 0.2 : 0.15; // Higher for new properties
    const plantEquipment = plantEquipmentValue * plantEquipmentRate;
    
    return {
      capitalWorks,
      plantEquipment,
      total: capitalWorks + plantEquipment
    };
  }, [propertyData]);

  // Calculate depreciation for a specific year
  const calculateDepreciationForYear = useCallback((year: number) => {
    const method = propertyData.depreciationMethod || 'prime-cost';
    const buildingValue = (propertyData.purchasePrice || 0) * 0.6;
    const isEligibleForCapitalWorks = (propertyData.constructionYear || 2020) >= 1987;
    
    // Building depreciation (Capital Works)
    const capitalWorksRate = method === 'prime-cost' ? 0.025 : 0.04;
    const building = isEligibleForCapitalWorks ? buildingValue * capitalWorksRate : 0;
    
    // Plant & Equipment depreciation (diminishing value)
    const plantEquipmentValue = (propertyData.purchasePrice || 0) * 0.05;
    const baseRate = propertyData.isNewProperty ? 0.2 : 0.15;
    const fixtures = plantEquipmentValue * baseRate * Math.pow(0.8, year - 1);
    
    return { building, fixtures, total: building + fixtures };
  }, [propertyData]);

  // Calculate total tax difference
  const calculateTotalTaxDifference = useCallback((rentalIncome: number, totalDeductibleExpenses: number) => {
    if (!propertyData.investors || propertyData.investors.length === 0) {
      return 0;
    }

    const taxableIncome = rentalIncome - totalDeductibleExpenses;
    
    return propertyData.investors.reduce((totalTaxDifference, investor) => {
      const ownership = propertyData.ownershipAllocations?.find(o => o.investorId === investor.id);
      const ownershipPercentage = ownership ? ownership.ownershipPercentage / 100 : 0;
      
      const investorTaxableIncome = taxableIncome * ownershipPercentage;
      const totalIncome = investor.annualIncome + (investor.otherIncome || 0);
      
      const taxWithoutProperty = totalTaxAU(totalIncome, investor.hasMedicareLevy);
      const taxWithProperty = totalTaxAU(totalIncome + investorTaxableIncome, investor.hasMedicareLevy);
      
      return totalTaxDifference + (taxWithProperty - taxWithoutProperty);
    }, 0);
  }, [propertyData.investors, propertyData.ownershipAllocations]);

  // Calculate detailed projections
  const projections = useMemo((): LocalYearProjection[] => {
    const years: LocalYearProjection[] = [];
    const baseYear = 1;
    const startYear = yearRange[0];
    const endYear = yearRange[1];
    
    // Construction period projection (Year 0)
    let constructionPeriodProjection: LocalYearProjection | null = null;
    if (propertyData.isConstructionProject && propertyData.constructionPeriod) {
      const constructionMonthlyInterest = holdingCosts.total / (propertyData.constructionPeriod || 1);
      const constructionTaxBenefit = -constructionMonthlyInterest * (propertyData.constructionPeriod || 1);
      
      constructionPeriodProjection = {
        year: 0,
        rentalIncome: 0,
        propertyValue: totalProjectCost,
        mainLoanBalance: propertyData.loanAmount || 0,
        equityLoanBalance: equityLoanAmount,
        totalInterest: holdingCosts.total,
        mainLoanPayment: 0,
        equityLoanPayment: 0,
        mainInterestYear: holdingCosts.landInterest,
        equityInterestYear: holdingCosts.constructionInterest,
        mainLoanIOStatus: 'IO' as "IO" | "P&I",
        equityLoanIOStatus: 'IO' as "IO" | "P&I",
        otherExpenses: 0,
        depreciation: 0,
        buildingDepreciation: 0,
        fixturesDepreciation: 0,
        taxableIncome: -holdingCosts.total,
        taxBenefit: constructionTaxBenefit,
        afterTaxCashFlow: -holdingCosts.total + Math.abs(constructionTaxBenefit),
        cumulativeCashFlow: -holdingCosts.total + Math.abs(constructionTaxBenefit),
        propertyEquity: totalProjectCost - (propertyData.loanAmount || 0) - equityLoanAmount,
        totalReturn: 0
      };
    }
    
    // Yearly projections
    for (let year = startYear; year <= endYear; year++) {
      const yearsSinceStart = year - baseYear;
      const cpiMultiplier = Math.pow(1 + 2.5 / 100, yearsSinceStart);
      const rentalGrowthMultiplier = Math.pow(1 + 5.0 / 100, yearsSinceStart);
      const capitalGrowthMultiplier = Math.pow(1 + 7.0 / 100, yearsSinceStart);
      
      const rentalIncome = (propertyData.weeklyRent || 0) * 52 * rentalGrowthMultiplier * (1 - (propertyData.vacancyRate || 2) / 100);
      const propertyValue = (propertyData.purchasePrice || totalProjectCost) * capitalGrowthMultiplier;
      
      // Calculate loan balances (simplified)
      const mainLoanBalance = Math.max(0, (propertyData.loanAmount || 0) - (year * 1000)); // Simplified principal reduction
      const equityLoanBalance = Math.max(0, equityLoanAmount - (year * 500)); // Simplified principal reduction
      
      // Calculate interest payments
      const mainInterestYear = mainLoanBalance * (propertyData.interestRate || 6.5) / 100;
      const equityInterestYear = equityLoanBalance * (propertyData.equityLoanInterestRate || 7.2) / 100;
      
      // Determine loan status
      const mainLoanIOStatus: "IO" | "P&I" = (propertyData.mainLoanType === 'io' && year <= (propertyData.ioTermYears || 5)) ? 'IO' : 'P&I';
      const equityLoanIOStatus: "IO" | "P&I" = (propertyData.equityLoanType === 'io' && year <= (propertyData.equityLoanIoTermYears || 5)) ? 'IO' : 'P&I';
      
      // Calculate expenses
      const propertyManagementCost = rentalIncome * (propertyData.propertyManagement || 7) / 100;
      const councilRates = (propertyData.councilRates || 0) * cpiMultiplier;
      const insurance = (propertyData.insurance || 0) * cpiMultiplier;
      const repairs = (propertyData.repairs || 0) * cpiMultiplier;
      const otherExpenses = propertyManagementCost + councilRates + insurance + repairs;
      
      // Calculate depreciation for this year
      const yearDepreciation = calculateDepreciationForYear(year);
      const depreciationAmount = yearDepreciation.total;
      
      // Calculate tax
      const totalDeductibleExpenses = mainInterestYear + equityInterestYear + otherExpenses + depreciationAmount;
      const taxableIncome = rentalIncome - totalDeductibleExpenses;
      const taxBenefit = -calculateTotalTaxDifference(rentalIncome, totalDeductibleExpenses);
      
      // Calculate cash flow
      const grossCashFlow = rentalIncome - monthlyPayments.total * 12 - otherExpenses;
      const afterTaxCashFlow = grossCashFlow + taxBenefit;
      
      // Calculate cumulative cash flow
      const previousYear = years[years.length - 1];
      const cumulativeCashFlow = (previousYear?.cumulativeCashFlow || (constructionPeriodProjection?.cumulativeCashFlow || 0)) + afterTaxCashFlow;
      
      // Calculate equity and return
      const totalLoanBalance = mainLoanBalance + equityLoanBalance;
      const propertyEquity = propertyValue - totalLoanBalance;
      const totalReturn = propertyEquity + cumulativeCashFlow;

      years.push({
        year,
        rentalIncome,
        propertyValue,
        mainLoanBalance,
        equityLoanBalance,
        totalInterest: mainInterestYear + equityInterestYear,
        mainLoanPayment: monthlyPayments.mainLoan * 12,
        equityLoanPayment: monthlyPayments.equityLoan * 12,
        mainInterestYear,
        equityInterestYear,
        mainLoanIOStatus,
        equityLoanIOStatus,
        otherExpenses,
        depreciation: depreciationAmount,
        buildingDepreciation: yearDepreciation.building,
        fixturesDepreciation: yearDepreciation.fixtures,
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
  const assumptions = useMemo(() => {
    const tripletify = (value: any) => ({ mode: 'auto', auto: value, manual: null });
    
    return {
      initialPropertyValue: propertyData.purchasePrice || totalProjectCost,
      initialWeeklyRent: tripletify(propertyData.weeklyRent),
      capitalGrowthRate: tripletify(7.0),
      rentalGrowthRate: tripletify(5.0),
      vacancyRate: tripletify(propertyData.vacancyRate),
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
      propertyManagementRate: tripletify(propertyData.propertyManagement),
      councilRates: propertyData.councilRates || 0,
      insurance: propertyData.insurance || 0,
      repairs: propertyData.repairs || 0,
      expenseInflationRate: 2.5,
      depreciationYear1: depreciation.total || 15000,
      isConstructionProject: propertyData.isConstructionProject || false,
      constructionPeriod: propertyData.constructionPeriod || 0
    };
  }, [propertyData, totalProjectCost, funding, depreciation.total]);

  // Calculate annual interest for display use
  const annualInterest = (projections[0]?.mainInterestYear || 0) + (projections[0]?.equityInterestYear || 0);

  // Calculate cash and paper deductions separately
  const cashDeductions = 
    annualInterest + // Use calculated annual interest from projections
    (propertyData.councilRates || 0) + 
    (propertyData.insurance || 0) + 
    (propertyData.repairs || 0) + 
    ((propertyData.weeklyRent || 0) * 52 * (propertyData.propertyManagement || 0.07) / 100);
  
  const paperDeductions = depreciation.total;
  const totalDeductibleExpenses = cashDeductions + paperDeductions;

  // Calculate tax results for investors using projections as single source of truth with CPI indexing
  const investorTaxResults = useMemo(() => {
    const year1Data = projections.find(p => p.year === 1);
    if (!propertyData.investors || propertyData.investors.length === 0 || !year1Data) {
      console.log('⚠️ No investor data or year 1 projections available');
      return [];
    }
    
    // Apply CPI indexing to investor incomes for consistency with projections
    const cpiMultiplier = Math.pow(1 + 2.5 / 100, 1 - 1); // Year 1, so multiplier = 1
    const totalTaxBenefit = year1Data.taxBenefit;
    
    console.log('📊 Using Projections for Tax Calculations (CPI-adjusted):', {
      source: 'projections[1]',
      cpiMultiplier,
      totalTaxBenefit,
      year1Data: {
        rentalIncome: year1Data.rentalIncome,
        taxBenefit: year1Data.taxBenefit,
        afterTaxCashFlow: year1Data.afterTaxCashFlow
      }
    });
    
    return propertyData.investors.map(investor => {
      const ownership = propertyData.ownershipAllocations?.find(o => o.investorId === investor.id);
      const ownershipPercentage = ownership ? ownership.ownershipPercentage / 100 : 0;
      
      // Calculate investor's share of tax benefit from projections
      const investorTaxBenefit = totalTaxBenefit * ownershipPercentage;
      
      // Apply CPI indexing to investor income (consistent with projection calculations)
      const adjustedTotalIncome = (investor.annualIncome + (investor.otherIncome || 0)) * cpiMultiplier;
      
      // Calculate taxes using CPI-adjusted income and correct sign convention
      const taxWithoutProperty = totalTaxAU(adjustedTotalIncome, investor.hasMedicareLevy);
      const taxWithProperty = taxWithoutProperty - Math.abs(investorTaxBenefit); // FIXED: Subtract tax benefit (benefit reduces tax)
      
      console.log(`🧾 Tax calculation for ${investor.name}:`, {
        investorTaxBenefit,
        taxWithoutProperty,
        taxWithProperty,
        taxDifference: investorTaxBenefit,
        calculation: `${taxWithoutProperty} - ${Math.abs(investorTaxBenefit)} = ${taxWithProperty}`
      });
      
      return {
        investor: {
          id: investor.id,
          name: investor.name,
          annualIncome: investor.annualIncome,
          otherIncome: investor.otherIncome || 0,
          nonTaxableIncome: 0,
          hasMedicareLevy: investor.hasMedicareLevy
        },
        ownershipPercentage,
        taxWithoutProperty,
        taxWithProperty,
        taxDifference: investorTaxBenefit, // Use projection-based tax benefit (negative = savings)
        marginalTaxRate: marginalRateAU(adjustedTotalIncome),
        propertyTaxableIncome: year1Data.rentalIncome - totalDeductibleExpenses // Use projection rental income
      };
    });
  }, [projections, propertyData.investors, propertyData.ownershipAllocations, totalDeductibleExpenses]);

  // Calculate total tax refund or liability using projections for consistency
  const totalTaxRefundOrLiability = useMemo(() => {
    const year1Data = projections.find(p => p.year === 1);
    const result = year1Data ? year1Data.taxBenefit : 0; // FIXED: Use taxBenefit directly (negative = benefit/savings)
    
    console.log('🧾 Tax Refund/Liability Calculation (CORRECTED):', {
      year1TaxBenefit: year1Data?.taxBenefit,
      totalTaxRefundOrLiability: result,
      meaning: result < 0 ? 'Tax Savings/Benefit (reduces tax)' : 'Tax Liability (increases tax)',
      note: 'Negative values = SAVINGS, Positive values = INCREASED TAX'
    });
    
    return result;
  }, [projections]);

  // Add comprehensive validation logging for tax calculations
  useEffect(() => {
    if (projections.length > 0 && investorTaxResults.length > 0) {
      console.log('🔍 COMPREHENSIVE TAX VALIDATION:', {
        projectionTaxBenefit: projections[0]?.taxBenefit,
        totalTaxRefundOrLiability,
        investorTaxResultsSum: investorTaxResults.reduce((sum, result) => sum + result.taxDifference, 0),
        signConventionCheck: {
          negative_means: 'Tax SAVINGS/BENEFIT (good for investor)',
          positive_means: 'Tax INCREASE/COST (bad for investor)',
          current_value: totalTaxRefundOrLiability,
          interpretation: totalTaxRefundOrLiability < 0 ? 'TAX SAVINGS ✅' : 'TAX INCREASE ⚠️'
        },
        cpiIndexingCheck: {
          note: 'Investor incomes should be CPI-adjusted for consistency',
          multiplier: 'Math.pow(1 + 2.5 / 100, year - 1)',
          year1Multiplier: 1
        }
      });
    }
  }, [projections, investorTaxResults, totalTaxRefundOrLiability]);

  // Calculate net of tax cost/income using projections data for consistency
  const netOfTaxCostIncome = useMemo(() => {
    const year1Data = projections.find(p => p.year === 1);
    if (!year1Data) return 0;
    
    // Use after-tax cash flow directly from projections - this is the true net result
    const result = year1Data.afterTaxCashFlow;
    
    console.log('💰 Net of Tax Calculation (Unified):', {
      source: 'projections[year=1].afterTaxCashFlow',
      afterTaxCashFlow: year1Data.afterTaxCashFlow,
      rentalIncome: year1Data.rentalIncome,
      taxBenefit: year1Data.taxBenefit,
      result,
      note: 'Using projections afterTaxCashFlow as single source of truth'
    });
    
    return result;
  }, [projections]);

  // Calculate investment summary metrics using projections as single source of truth
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
    
    // Also calculate standardized values for PropertyCalculationDetails to ensure consistency
    const year1Data = projections.find(p => p.year === 1);
    const annualRentFromProjections = year1Data?.rentalIncome ?? 0;
    const taxBenefitFromProjections = year1Data?.taxBenefit ?? 0;
    
    console.log('📊 Investment Summary Calculation Validation:', {
      year1Data: {
        rentalIncome: year1Data?.rentalIncome,
        taxBenefit: year1Data?.taxBenefit,
        afterTaxCashFlow: year1Data?.afterTaxCashFlow
      },
      calculatedValues: {
        annualRentFromProjections,
        taxBenefitFromProjections,
        weeklyAfterTaxCashFlowSummary,
        taxDifferenceSummary
      },
      comparisonValues: {
        oldAnnualRent: (propertyData.weeklyRent || 0) * 52,
        oldTaxDifference: -(currentYearData?.taxBenefit ?? 0)
      }
    });
    
    return {
      weeklyAfterTaxCashFlowSummary,
      taxDifferenceSummary,
      taxSavingsTotal,
      cumulativeTaxImpact,
      equityAtYearTo,
      roiAtYearTo,
      marginalTaxRateSummary,
      // Add standardized values for consistent display
      annualRentFromProjections,
      taxBenefitFromProjections
    };
  }, [projections, yearRange, propertyData.investors]);

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!id) return;
    
    setDeletingInstance(true);
    try {
      // Actually delete the instance from the database
      await deleteInstance(id);
      
      toast({
        title: "Instance Deleted",
        description: "The instance has been successfully deleted.",
        variant: "default",
      });
      navigate('/instances');
    } catch (error) {
      console.error('Error deleting instance:', error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete instance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingInstance(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleBack = () => {
    navigate('/instances');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Instance not found</h1>
            <p className="text-muted-foreground">The instance you're looking for doesn't exist.</p>
            <Button onClick={handleBack} className="mt-4">
              Back to Instances
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className={`max-w-7xl mx-auto ${isMobile ? 'px-3 py-4' : 'px-4 sm:px-6 py-6'}`}>
        {/* Enhanced Header */}
        <div className={isMobile ? 'mb-6' : 'mb-8'}>
          {/* Back Button Row */}
          <div className={isMobile ? 'mb-4' : 'mb-6'}>
            <Button variant="ghost" size={isMobile ? 'default' : 'sm'} onClick={handleBack} className={`text-muted-foreground hover:text-foreground ${isMobile ? 'min-h-[44px] px-3' : ''}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Instances
            </Button>
          </div>

          {/* Instance Info Header - Responsive Layout */}
          <div className={`${isMobile ? 'space-y-4' : 'flex items-center gap-4'}`}>
            {/* Instance Details - Enhanced */}
            <Card className={`${isMobile ? 'w-full' : 'flex-1 min-w-0'} border-2 ${isEditMode ? 'border-primary' : 'border-dashed border-muted-foreground/20'} ${isEditMode ? 'border-primary/50' : 'hover:border-primary/30'} transition-colors`}>
              <CardHeader className={isMobile ? "pb-3 px-4 pt-4" : "pb-4"}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isEditMode ? 'bg-orange-500' : 'bg-primary'}`}></div>
                  <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'}`}>{instance.name}</CardTitle>
                  <SaveIndicator 
                    hasUnsavedChanges={hasUnsavedChanges} 
                    saving={saving} 
                    isEditMode={isEditMode} 
                  />
                </div>
                <CardDescription className={`${isMobile ? 'text-sm' : 'text-base'}`}>
                  {instance.property_method || 'Property'} • ${instance.purchase_price.toLocaleString()} • ${instance.weekly_rent}/week
                </CardDescription>
                {/* Status and Dates integrated into header */}
                <div className={`${isMobile ? 'flex flex-col gap-2 mt-2' : 'flex items-center gap-4 mt-3'}`}>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    instance.status === 'active' ? 'bg-green-100 text-green-800' :
                    instance.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  } ${isMobile ? 'self-start' : ''}`}>
                    {instance.status}
                  </div>
                  <div className={`${isMobile ? 'flex flex-col gap-1' : 'flex gap-4'}`}>
                    <span className="text-sm text-muted-foreground">
                      Created: {new Date(instance.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Modified: {new Date(instance.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Action Buttons - Mobile Optimized */}
            <div className={`${isMobile ? 'grid grid-cols-2 gap-3' : 'flex gap-3'}`}>
              {isEditMode ? (
                <>
                  <Button 
                    variant="default" 
                    onClick={handleSaveInstance}
                    disabled={saving || !hasUnsavedChanges}
                    className={`flex items-center gap-2 px-4 py-2 h-auto ${isMobile ? 'min-h-[48px] w-full' : ''}`}
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                    )}
                    <div className="text-left">
                      <div className="font-medium">
                        {saving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                      </div>
                      {!isMobile && (
                        <div className="text-xs text-muted-foreground">
                          {hasUnsavedChanges ? 'Updates pending' : 'All changes saved'}
                        </div>
                      )}
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className={`flex items-center gap-2 px-4 py-2 h-auto ${isMobile ? 'min-h-[48px] w-full' : ''}`}
                  >
                    <div className="h-4 w-4 bg-gray-400 rounded-full"></div>
                    <div className="text-left">
                      <div className="font-medium">Cancel</div>
                      {!isMobile && (
                        <div className="text-xs text-muted-foreground">
                          {hasUnsavedChanges ? 'Discard changes' : 'Exit edit mode'}
                        </div>
                      )}
                    </div>
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => downloadInputsCsv(propertyData)}
                    className={`flex items-center gap-2 px-4 py-2 h-auto ${isMobile ? 'min-h-[48px] w-full' : ''}`}
                  >
                    <Download className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Export CSV</div>
                      {!isMobile && (
                        <div className="text-xs text-muted-foreground">Download current data</div>
                      )}
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleEdit}
                    className={`flex items-center gap-2 px-4 py-2 h-auto ${isMobile ? 'min-h-[48px] w-full' : ''}`}
                  >
                    <Edit className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Edit Instance</div>
                      {!isMobile && (
                        <div className="text-xs text-muted-foreground">Modify settings</div>
                      )}
                    </div>
                  </Button>

                  {!isMobile && (
                    <Button 
                      variant="destructive"
                      onClick={handleDelete}
                      className="flex items-center gap-2 px-4 py-2 h-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">Delete Instance</div>
                        <div className="text-xs text-muted-foreground">Remove permanently</div>
                      </div>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full grid-cols-3 ${isMobile ? 'h-12 text-sm' : 'h-10'}`}>
            <TabsTrigger value="analysis" className={`${isMobile ? 'min-h-[44px] text-sm font-medium' : 'text-sm'}`}>
              Analysis
            </TabsTrigger>
            <TabsTrigger value="projections" className={`${isMobile ? 'min-h-[44px] text-sm font-medium' : 'text-sm'}`}>
              Projections
            </TabsTrigger>
            <TabsTrigger value="summary" className={`${isMobile ? 'min-h-[44px] text-sm font-medium' : 'text-sm'}`}>
              Summary
            </TabsTrigger>
          </TabsList>

          {/* Analysis Tab - Input Forms Only */}
          <TabsContent value="analysis" className="space-y-6">
            {isMobile ? (
              /* Mobile: Single Column Stack with Sticky Summary */
              <div className="space-y-4">
                <MobileFinancialSummary
                  totalCost={totalProjectCost}
                  totalFunding={funding.mainLoanAmount + funding.equityLoanAmount + propertyData.depositAmount}
                  fundingShortfall={Math.max(0, totalProjectCost - (funding.mainLoanAmount + funding.equityLoanAmount + propertyData.depositAmount))}
                  weeklyRent={propertyData.weeklyRent || 0}
                  monthlyRepayment={monthlyPayments.total}
                  weeklyCashFlow={investmentSummary.weeklyAfterTaxCashFlowSummary}
                />
                <PropertyInputForm
                  propertyData={propertyData}
                  updateField={enhancedUpdateField}
                  investorTaxResults={investorTaxResults}
                  totalTaxableIncome={0}
                  marginalTaxRate={0.3}
                  isEditMode={isEditMode}
                />
              </div>
            ) : (
              /* Desktop: Single Column Layout for Input Forms */
              <div className="max-w-5xl mx-auto space-y-8">
                <PropertyInputForm
                  propertyData={propertyData}
                  updateField={enhancedUpdateField}
                  investorTaxResults={investorTaxResults}
                  totalTaxableIncome={0}
                  marginalTaxRate={0.3}
                  isEditMode={isEditMode}
                />
              </div>
            )}
          </TabsContent>

          {/* Summary Tab - Funding & Calculation Details */}
          <TabsContent value="summary" className="space-y-6">
            {isMobile ? (
              /* Mobile: Single Column Stack */
              <div className="space-y-4">
                <FundingSummaryPanel />
                <PropertyCalculationDetails
                  monthlyRepayment={monthlyPayments.total}
                  annualRepayment={monthlyPayments.total * 12}
                  annualRent={investmentSummary.annualRentFromProjections}
                  propertyManagementCost={investmentSummary.annualRentFromProjections * (propertyData.propertyManagement || 0.07) / 100}
                  councilRates={propertyData.councilRates || 0}
                  insurance={propertyData.insurance || 0}
                  repairs={propertyData.repairs || 0}
                  totalDeductibleExpenses={totalDeductibleExpenses}
                  cashDeductionsSubtotal={cashDeductions}
                  paperDeductionsSubtotal={paperDeductions}
                  depreciation={{
                    capitalWorks: depreciation.capitalWorks,
                    plantEquipment: depreciation.plantEquipment,
                    total: depreciation.total,
                    capitalWorksAvailable: propertyData.constructionYear >= 1987,
                    plantEquipmentRestricted: !propertyData.isNewProperty
                  }}
                  investorTaxResults={investorTaxResults}
                  totalTaxWithProperty={investorTaxResults.reduce((sum, result) => sum + (result.taxWithProperty || 0), 0)}
                  totalTaxWithoutProperty={investorTaxResults.reduce((sum, result) => sum + (result.taxWithoutProperty || 0), 0)}
                  marginalTaxRate={investmentSummary.marginalTaxRateSummary}
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
                    availableEquity: 0,
                    loanAmount: funding.mainLoanAmount
                  }}
                  outOfPocketHoldingCosts={0}
                  capitalizedHoldingCosts={0}
                  actualCashInvested={0}
                  constructionPeriod={propertyData.constructionPeriod || 0}
                  holdingCostFunding={propertyData.holdingCostFunding || 'cash'}
                  mainLoanPayments={{
                    ioPayment: loanPaymentDetails.mainLoanDetails.ioPayment,
                    piPayment: loanPaymentDetails.mainLoanDetails.piPayment,
                    ioTermYears: loanPaymentDetails.mainLoanDetails.ioTermYears,
                    remainingTerm: (propertyData.loanTerm || 30) - loanPaymentDetails.mainLoanDetails.ioTermYears,
                    totalInterest: (propertyData.loanAmount || 0) * (propertyData.interestRate || 6) / 100,
                    currentPayment: loanPaymentDetails.mainLoanDetails.isIO && loanPaymentDetails.mainLoanDetails.ioTermYears > 0 ? loanPaymentDetails.mainLoanDetails.ioPayment : loanPaymentDetails.mainLoanDetails.piPayment,
                    futurePayment: loanPaymentDetails.mainLoanDetails.isIO && loanPaymentDetails.mainLoanDetails.ioTermYears > 0 ? loanPaymentDetails.mainLoanDetails.piPayment : 0
                  }}
                  equityLoanPayments={loanPaymentDetails.equityLoanDetails ? {
                    ioPayment: loanPaymentDetails.equityLoanDetails.ioPayment,
                    piPayment: loanPaymentDetails.equityLoanDetails.piPayment,
                    ioTermYears: loanPaymentDetails.equityLoanDetails.ioTermYears,
                    remainingTerm: (propertyData.equityLoanTerm || 30) - loanPaymentDetails.equityLoanDetails.ioTermYears,
                    totalInterest: (equityLoanAmount || 0) * (propertyData.equityLoanInterestRate || 7.2) / 100,
                    currentPayment: loanPaymentDetails.equityLoanDetails.isIO && loanPaymentDetails.equityLoanDetails.ioTermYears > 0 ? loanPaymentDetails.equityLoanDetails.ioPayment : loanPaymentDetails.equityLoanDetails.piPayment,
                    futurePayment: loanPaymentDetails.equityLoanDetails.isIO && loanPaymentDetails.equityLoanDetails.ioTermYears > 0 ? loanPaymentDetails.equityLoanDetails.piPayment : 0
                  } : null}
                  totalAnnualInterest={annualInterest}
                  taxRefundOrLiability={totalTaxRefundOrLiability}
                  netOfTaxCostIncome={netOfTaxCostIncome}
                />
              </div>
            ) : (
              /* Desktop: Two-Column Layout for Summary Content */
              <div className="grid grid-cols-12 gap-8">
                {/* Left Column - Funding Summary (5 columns) */}
                <div className="col-span-5 space-y-6">
                  <FundingSummaryPanel />
                </div>
                
                {/* Right Column - Calculation Details (7 columns) */}
                <div className="col-span-7">
                  <PropertyCalculationDetails
                    monthlyRepayment={monthlyPayments.total}
                    annualRepayment={monthlyPayments.total * 12}
                    annualRent={investmentSummary.annualRentFromProjections}
                    propertyManagementCost={investmentSummary.annualRentFromProjections * (propertyData.propertyManagement || 0.07) / 100}
                    councilRates={propertyData.councilRates || 0}
                    insurance={propertyData.insurance || 0}
                    repairs={propertyData.repairs || 0}
                    totalDeductibleExpenses={totalDeductibleExpenses}
                    cashDeductionsSubtotal={cashDeductions}
                    paperDeductionsSubtotal={paperDeductions}
                    depreciation={{
                      capitalWorks: depreciation.capitalWorks,
                      plantEquipment: depreciation.plantEquipment,
                      total: depreciation.total,
                      capitalWorksAvailable: propertyData.constructionYear >= 1987,
                      plantEquipmentRestricted: !propertyData.isNewProperty
                    }}
                    investorTaxResults={investorTaxResults}
                    totalTaxWithProperty={investorTaxResults.reduce((sum, result) => sum + (result.taxWithProperty || 0), 0)}
                    totalTaxWithoutProperty={investorTaxResults.reduce((sum, result) => sum + (result.taxWithoutProperty || 0), 0)}
                    marginalTaxRate={investmentSummary.marginalTaxRateSummary}
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
                      availableEquity: 0,
                      loanAmount: funding.mainLoanAmount
                    }}
                    outOfPocketHoldingCosts={0}
                    capitalizedHoldingCosts={0}
                    actualCashInvested={0}
                    constructionPeriod={propertyData.constructionPeriod || 0}
                    holdingCostFunding={propertyData.holdingCostFunding || 'cash'}
                    mainLoanPayments={{
                      ioPayment: loanPaymentDetails.mainLoanDetails.ioPayment,
                      piPayment: loanPaymentDetails.mainLoanDetails.piPayment,
                      ioTermYears: loanPaymentDetails.mainLoanDetails.ioTermYears,
                      remainingTerm: (propertyData.loanTerm || 30) - loanPaymentDetails.mainLoanDetails.ioTermYears,
                      totalInterest: (propertyData.loanAmount || 0) * (propertyData.interestRate || 6) / 100,
                      currentPayment: loanPaymentDetails.mainLoanDetails.isIO && loanPaymentDetails.mainLoanDetails.ioTermYears > 0 ? loanPaymentDetails.mainLoanDetails.ioPayment : loanPaymentDetails.mainLoanDetails.piPayment,
                      futurePayment: loanPaymentDetails.mainLoanDetails.isIO && loanPaymentDetails.mainLoanDetails.ioTermYears > 0 ? loanPaymentDetails.mainLoanDetails.piPayment : 0
                    }}
                    equityLoanPayments={loanPaymentDetails.equityLoanDetails ? {
                      ioPayment: loanPaymentDetails.equityLoanDetails.ioPayment,
                      piPayment: loanPaymentDetails.equityLoanDetails.piPayment,
                      ioTermYears: loanPaymentDetails.equityLoanDetails.ioTermYears,
                      remainingTerm: (propertyData.equityLoanTerm || 30) - loanPaymentDetails.equityLoanDetails.ioTermYears,
                      totalInterest: (equityLoanAmount || 0) * (propertyData.equityLoanInterestRate || 7.2) / 100,
                      currentPayment: loanPaymentDetails.equityLoanDetails.isIO && loanPaymentDetails.equityLoanDetails.ioTermYears > 0 ? loanPaymentDetails.equityLoanDetails.ioPayment : loanPaymentDetails.equityLoanDetails.piPayment,
                      futurePayment: loanPaymentDetails.equityLoanDetails.isIO && loanPaymentDetails.equityLoanDetails.ioTermYears > 0 ? loanPaymentDetails.equityLoanDetails.piPayment : 0
                    } : null}
                    totalAnnualInterest={annualInterest}
                    taxRefundOrLiability={totalTaxRefundOrLiability}
                    netOfTaxCostIncome={netOfTaxCostIncome}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          {/* Projections Tab */}
          <TabsContent value="projections" className="space-y-6">
            {/* Investment Summary Dashboard */}
            <PropertySummaryDashboard
              weeklyCashflowYear1={investmentSummary.weeklyAfterTaxCashFlowSummary}
              taxSavingsYear1={investmentSummary.taxBenefitFromProjections}
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
              assumptions={{} as any}
              validatedYearRange={[yearRange[0], yearRange[1]] as [number, number]}
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
        
        {/* Validation Warnings at bottom for mobile */}
        <div className={isMobile ? 'mt-6 pb-6' : 'mt-8'}>
          <ValidationWarnings />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!deletingInstance) {
            setDeleteDialogOpen(open);
          }
        }}
        title="Delete Instance"
        description="Are you sure you want to delete this instance? This action cannot be undone."
        confirmText={deletingInstance ? "Deleting..." : "Delete Instance"}
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={deletingInstance ? undefined : () => setDeleteDialogOpen(false)}
       />
     </div>
   );
 };

 export default InstanceDetail;
