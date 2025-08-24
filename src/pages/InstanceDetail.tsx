import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Download, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Import all the components from PropertyAnalysis and Projections
import { PropertyInputForm } from "@/components/PropertyInputForm";
import { FundingSummaryPanel } from "@/components/FundingSummaryPanel";

import { PropertySummaryDashboard } from "@/components/PropertySummaryDashboard";
import ProjectionsTable from "@/components/ProjectionsTable";
import ConstructionPeriodTable from "@/components/ConstructionPeriodTable";
import { InvestmentResultsDetailed } from "@/components/InvestmentResultsDetailed";
import { PropertyCalculationDetails } from "@/components/PropertyCalculationDetails";
import { ValidationWarnings } from "@/components/ValidationWarnings";

// Import the context hook
import { usePropertyData } from "@/contexts/PropertyDataContext";
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
  buildingDepreciation: number;
  fixturesDepreciation: number;
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

const InstanceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { propertyData, updateField, calculateTotalProjectCost, calculateEquityLoanAmount, calculateHoldingCosts, applyPreset } = usePropertyData();
  const { getInstance, updateInstance, loading: instancesLoading } = useInstances();
  const { toast } = useToast();

  // State for the instance
  const [instance, setInstance] = useState<Instance | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analysis");
  const [yearRange, setYearRange] = useState<[number, number]>([1, 30]);
  const [viewMode, setViewMode] = useState<'year' | 'table'>("table");
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const debouncedSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track changes to mark as unsaved
  // Warn before page unload if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && isEditMode) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isEditMode]);

  useEffect(() => {
    if (id && !isDataLoaded) {
      const loadInstance = async () => {
        try {
          setLoading(true);
          const instanceData = getInstance(id);
        if (instanceData) {
          setInstance(instanceData);
          console.log('🔄 Loading instance data:', {
            id: instanceData.id,
            constructionValue: instanceData.construction_value,
            buildingValue: instanceData.building_value,
            plantEquipmentValue: instanceData.plant_equipment_value,
            purchasePrice: instanceData.purchase_price,
            investors: instanceData.investors,
            ownershipAllocations: instanceData.ownership_allocations,
            isEditMode,
            isDataLoaded
          });
          
          // Only apply preset if not in edit mode and data hasn't been loaded yet
          if (!isEditMode && !hasUnsavedChanges) {
            console.log('📋 Applying preset data from instance:', {
              investors: instanceData.investors,
              ownershipAllocations: instanceData.ownership_allocations
            });
            applyPreset({
              investors: instanceData.investors as any,
              ownershipAllocations: instanceData.ownership_allocations as any,
              isConstructionProject: instanceData.is_construction_project,
              purchasePrice: instanceData.purchase_price,
              weeklyRent: instanceData.weekly_rent,
              rentalGrowthRate: instanceData.rental_growth_rate,
              vacancyRate: instanceData.vacancy_rate,
              constructionYear: instanceData.construction_year,
              buildingValue: instanceData.building_value,
              plantEquipmentValue: instanceData.plant_equipment_value,
              landValue: instanceData.land_value,
              constructionValue: instanceData.construction_value,
              constructionPeriod: instanceData.construction_period,
              constructionInterestRate: instanceData.construction_interest_rate,
              constructionProgressPayments: instanceData.construction_progress_payments as any,
              deposit: instanceData.deposit,
              loanAmount: instanceData.loan_amount,
              interestRate: instanceData.interest_rate,
              loanTerm: instanceData.loan_term,
              lvr: instanceData.lvr,
              mainLoanType: instanceData.main_loan_type as "io" | "pi",
              ioTermYears: instanceData.io_term_years,
              useEquityFunding: instanceData.use_equity_funding,
              primaryPropertyValue: instanceData.primary_property_value,
              existingDebt: instanceData.existing_debt,
              maxLVR: instanceData.max_lvr,
              equityLoanType: instanceData.equity_loan_type as "io" | "pi",
              equityLoanIoTermYears: instanceData.equity_loan_io_term_years,
              equityLoanInterestRate: instanceData.equity_loan_interest_rate,
              equityLoanTerm: instanceData.equity_loan_term,
              depositAmount: instanceData.deposit_amount,
              minimumDepositRequired: instanceData.minimum_deposit_required,
              holdingCostFunding: instanceData.holding_cost_funding as "cash" | "debt" | "hybrid",
              holdingCostCashPercentage: instanceData.holding_cost_cash_percentage,
              capitalizeConstructionCosts: instanceData.capitalize_construction_costs,
              constructionEquityRepaymentType: instanceData.construction_equity_repayment_type as "io" | "pi",
              landHoldingInterest: instanceData.land_holding_interest,
              constructionHoldingInterest: instanceData.construction_holding_interest,
              totalHoldingCosts: instanceData.total_holding_costs,
              stampDuty: instanceData.stamp_duty,
              legalFees: instanceData.legal_fees,
              inspectionFees: instanceData.inspection_fees,
              councilFees: instanceData.council_fees,
              architectFees: instanceData.architect_fees,
              siteCosts: instanceData.site_costs,
              propertyManagement: instanceData.property_management,
              councilRates: instanceData.council_rates,
              insurance: instanceData.insurance,
              repairs: instanceData.repairs,
              depreciationMethod: instanceData.depreciation_method as "prime-cost" | "diminishing-value",
              isNewProperty: instanceData.is_new_property,
              currentPropertyMethod: instanceData.property_method as any,
              currentFundingMethod: instanceData.funding_method as any
            }, instanceData.property_method as any, instanceData.funding_method as any);
            setIsDataLoaded(true);
            console.log('✅ Instance data loaded and applied');
          } else {
            console.log('⚠️ Skipping preset application - edit mode or has unsaved changes');
            setIsDataLoaded(true);
          }
        }
        } catch (error) {
          console.error('❌ Failed to load instance:', error);
        } finally {
          setLoading(false);
        }
      };

      loadInstance();
    }
  }, [id, getInstance, applyPreset, isDataLoaded, isEditMode, hasUnsavedChanges]);

  // Track changes to mark as unsaved with improved logic
  const lastPropertyDataRef = useRef(propertyData);
  useEffect(() => {
    if (isDataLoaded && !loading && isEditMode) {
      // Only mark as unsaved if data actually changed (deep comparison on key fields)
      const currentData = propertyData;
      const lastData = lastPropertyDataRef.current;
      
      const keyFieldsChanged = currentData.purchasePrice !== lastData.purchasePrice ||
        currentData.weeklyRent !== lastData.weeklyRent ||
        currentData.constructionValue !== lastData.constructionValue ||
        currentData.buildingValue !== lastData.buildingValue ||
        currentData.plantEquipmentValue !== lastData.plantEquipmentValue ||
        currentData.landValue !== lastData.landValue ||
        currentData.loanAmount !== lastData.loanAmount ||
        currentData.depositAmount !== lastData.depositAmount;
      
      if (keyFieldsChanged) {
        console.log('📝 Property data changed, marking as unsaved:', {
          purchasePrice: { old: lastData.purchasePrice, new: currentData.purchasePrice },
          constructionValue: { old: lastData.constructionValue, new: currentData.constructionValue },
          buildingValue: { old: lastData.buildingValue, new: currentData.buildingValue }
        });
        setHasUnsavedChanges(true);
      }
    }
    
    lastPropertyDataRef.current = propertyData;
  }, [propertyData, loading, isDataLoaded, isEditMode]);

  // Improved debounced auto-save with faster response and validation
  useEffect(() => {
    if (hasUnsavedChanges && isEditMode && !saving && isDataLoaded && instance) {
      // Clear existing timeout
      if (debouncedSaveTimeoutRef.current) {
        clearTimeout(debouncedSaveTimeoutRef.current);
      }
      
      // Validate that we have essential data before saving
      const hasValidData = propertyData.purchasePrice > 0 || propertyData.constructionValue > 0;
      
      if (hasValidData) {
        // Set new timeout for debounced save - reduced to 1 second for more responsive saving
        debouncedSaveTimeoutRef.current = setTimeout(() => {
          console.log('💾 Auto-saving changes (1s timeout)...', {
            purchasePrice: propertyData.purchasePrice,
            constructionValue: propertyData.constructionValue,
            buildingValue: propertyData.buildingValue
          });
          handleSaveInstance();
        }, 1000); // Reduced from 3000ms to 1000ms for faster auto-save
      } else {
        console.log('⚠️ Skipping auto-save - invalid data detected');
      }
    }
    
    return () => {
      if (debouncedSaveTimeoutRef.current) {
        clearTimeout(debouncedSaveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, isEditMode, saving, isDataLoaded, instance, propertyData.purchasePrice, propertyData.constructionValue, propertyData.buildingValue]);

  // Convert propertyData back to instance format for saving
  const convertPropertyDataToInstance = () => {
    if (!instance) return null;
    
    return {
      name: instance.name, // Keep original name for now
      description: null, // Instance doesn't have description field in schema
      status: instance.status,
      property_type: propertyData.propertyType || 'Apartment',
      property_method: propertyData.currentPropertyMethod || 'built-first-owner',
      location: propertyData.location || 'NSW',
      purchase_price: propertyData.purchasePrice || 0,
      weekly_rent: propertyData.weeklyRent || 0,
      rental_growth_rate: propertyData.rentalGrowthRate || 5.0,
      vacancy_rate: propertyData.vacancyRate || 2.0,
      capital_growth_rate: 7.0, // Default value as it's not in PropertyData
      is_construction_project: propertyData.isConstructionProject || false,
      construction_year: propertyData.constructionYear || 2025,
      land_value: propertyData.landValue || 0,
      construction_value: propertyData.constructionValue || 0,
      construction_period: propertyData.constructionPeriod || 0,
      construction_interest_rate: propertyData.constructionInterestRate || 7.0,
      building_value: propertyData.buildingValue || 0,
      plant_equipment_value: propertyData.plantEquipmentValue || 0,
      construction_progress_payments: propertyData.constructionProgressPayments || [],
      stamp_duty: propertyData.stampDuty || 0,
      legal_fees: propertyData.legalFees || 0,
      inspection_fees: propertyData.inspectionFees || 0,
      council_fees: propertyData.councilFees || 0,
      architect_fees: propertyData.architectFees || 0,
      site_costs: propertyData.siteCosts || 0,
      property_management: propertyData.propertyManagement || 8.0,
      council_rates: propertyData.councilRates || 0,
      insurance: propertyData.insurance || 0,
      repairs: propertyData.repairs || 0,
      is_new_property: propertyData.isNewProperty || true,
      deposit: propertyData.deposit || 0,
      loan_amount: propertyData.loanAmount || 0,
      interest_rate: propertyData.interestRate || 6.0,
      loan_term: propertyData.loanTerm || 30,
      lvr: propertyData.lvr || 80,
      main_loan_type: propertyData.mainLoanType || 'pi',
      io_term_years: propertyData.ioTermYears || 5,
      use_equity_funding: propertyData.useEquityFunding || false,
      primary_property_value: propertyData.primaryPropertyValue || 0,
      existing_debt: propertyData.existingDebt || 0,
      max_lvr: propertyData.maxLVR || 80,
      equity_loan_type: propertyData.equityLoanType || 'pi',
      equity_loan_io_term_years: propertyData.equityLoanIoTermYears || 3,
      equity_loan_interest_rate: propertyData.equityLoanInterestRate || 7.2,
      equity_loan_term: propertyData.equityLoanTerm || 25,
      deposit_amount: propertyData.depositAmount || 0,
      minimum_deposit_required: propertyData.minimumDepositRequired || 0,
      holding_cost_funding: propertyData.holdingCostFunding || 'cash',
      holding_cost_cash_percentage: propertyData.holdingCostCashPercentage || 100,
      capitalize_construction_costs: propertyData.capitalizeConstructionCosts || false,
      construction_equity_repayment_type: propertyData.constructionEquityRepaymentType || 'io',
      land_holding_interest: propertyData.landHoldingInterest || 0,
      construction_holding_interest: propertyData.constructionHoldingInterest || 0,
      total_holding_costs: propertyData.totalHoldingCosts || 0,
      investors: propertyData.investors as any || [],
      ownership_allocations: propertyData.ownershipAllocations as any || [],
      total_project_cost: totalProjectCost,
      equity_loan_amount: equityLoanAmount,
      available_equity: 0, // Will be calculated
      minimum_cash_required: 0, // Will be calculated
      actual_cash_deposit: propertyData.depositAmount || 0, // Use depositAmount as fallback
      funding_shortfall: 0, // Will be calculated
      funding_surplus: 0, // Will be calculated
      projections: [], // Will be calculated on save
      assumptions: {}, // Will be calculated on save
      weekly_cashflow_year1: investmentSummary.weeklyAfterTaxCashFlowSummary,
      tax_savings_year1: -investmentSummary.taxDifferenceSummary,
      tax_savings_total: investmentSummary.taxSavingsTotal,
      net_equity_at_year_to: investmentSummary.equityAtYearTo,
      roi_at_year_to: investmentSummary.roiAtYearTo,
      analysis_year_to: yearRange[1],
      depreciation_method: propertyData.depreciationMethod || 'prime-cost',
      funding_method: propertyData.currentFundingMethod,
      property_state: propertyData.propertyState || 'VIC'
    };
  };

  const handleSaveInstance = async () => {
    if (!instance || !id) {
      console.error('❌ Cannot save - missing instance or id');
      return;
    }
    
    try {
      setSaving(true);
      console.log('💾 Starting save process...', {
        instanceId: id,
        hasUnsavedChanges,
        isEditMode,
        propertyData: {
          purchasePrice: propertyData.purchasePrice,
          constructionValue: propertyData.constructionValue,
          buildingValue: propertyData.buildingValue,
          plantEquipmentValue: propertyData.plantEquipmentValue
        }
      });
      
      const instanceUpdates = convertPropertyDataToInstance();
      
      if (instanceUpdates) {
        console.log('🔄 Saving instance updates:', {
          purchase_price: instanceUpdates.purchase_price,
          construction_value: instanceUpdates.construction_value,
          building_value: instanceUpdates.building_value,
          plant_equipment_value: instanceUpdates.plant_equipment_value
        });
        
        await updateInstance(id, instanceUpdates);
        setHasUnsavedChanges(false);
        
        console.log('✅ Instance saved successfully');
        toast({
          title: "Instance Updated",
          description: "Your instance has been successfully updated.",
        });
      } else {
        console.error('❌ Failed to convert property data to instance format');
      }
    } catch (error) {
      console.error('❌ Failed to save instance:', error);
      toast({
        title: "Error",
        description: "Failed to update instance. Please try again.",
        variant: "destructive",
      });
      
      // Add retry logic
      setTimeout(() => {
        if (hasUnsavedChanges && isEditMode) {
          console.log('🔄 Retrying auto-save in 5 seconds...');
          handleSaveInstance();
        }
      }, 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        setIsEditMode(false);
        setHasUnsavedChanges(false);
        // Reload the instance data to reset any changes with proper field mapping
        if (instance) {
          applyPreset({
            investors: instance.investors as any,
            ownershipAllocations: instance.ownership_allocations as any,
            isConstructionProject: instance.is_construction_project,
            purchasePrice: instance.purchase_price,
            weeklyRent: instance.weekly_rent,
            rentalGrowthRate: instance.rental_growth_rate,
            vacancyRate: instance.vacancy_rate,
            constructionYear: instance.construction_year,
            buildingValue: instance.building_value,
            plantEquipmentValue: instance.plant_equipment_value,
            landValue: instance.land_value,
            constructionValue: instance.construction_value,
            constructionPeriod: instance.construction_period,
            constructionInterestRate: instance.construction_interest_rate,
            constructionProgressPayments: instance.construction_progress_payments as any,
            deposit: instance.deposit,
            loanAmount: instance.loan_amount,
            interestRate: instance.interest_rate,
            loanTerm: instance.loan_term,
            lvr: instance.lvr,
            mainLoanType: instance.main_loan_type as "io" | "pi",
            ioTermYears: instance.io_term_years,
            useEquityFunding: instance.use_equity_funding,
            primaryPropertyValue: instance.primary_property_value,
            existingDebt: instance.existing_debt,
            maxLVR: instance.max_lvr,
            equityLoanType: instance.equity_loan_type as "io" | "pi",
            equityLoanIoTermYears: instance.equity_loan_io_term_years,
            equityLoanInterestRate: instance.equity_loan_interest_rate,
            equityLoanTerm: instance.equity_loan_term,
            depositAmount: instance.deposit_amount,
            minimumDepositRequired: instance.minimum_deposit_required,
            holdingCostFunding: instance.holding_cost_funding as "cash" | "debt" | "hybrid",
            holdingCostCashPercentage: instance.holding_cost_cash_percentage,
            capitalizeConstructionCosts: instance.capitalize_construction_costs,
            constructionEquityRepaymentType: instance.construction_equity_repayment_type as "io" | "pi",
            landHoldingInterest: instance.land_holding_interest,
            constructionHoldingInterest: instance.construction_holding_interest,
            totalHoldingCosts: instance.total_holding_costs,
            stampDuty: instance.stamp_duty,
            legalFees: instance.legal_fees,
            inspectionFees: instance.inspection_fees,
            councilFees: instance.council_fees,
            architectFees: instance.architect_fees,
            siteCosts: instance.site_costs,
            propertyManagement: instance.property_management,
            councilRates: instance.council_rates,
            insurance: instance.insurance,
            repairs: instance.repairs,
            // Fix depreciation method mapping
            depreciationMethod: instance.depreciation_method as "prime-cost" | "diminishing-value",
            isNewProperty: instance.is_new_property,
            currentPropertyMethod: instance.property_method as any,
            currentFundingMethod: instance.funding_method as any
          }, instance.property_method as any, instance.funding_method as any);
        }
      }
    } else {
      setIsEditMode(false);
    }
  };

  const enhancedUpdateField = (field: keyof typeof propertyData, value: any) => {
    console.log('🔧 Field update:', { field, value, isEditMode, isDataLoaded });
    
    // Enable edit mode if not already enabled and data is loaded
    if (!isEditMode && isDataLoaded) {
      console.log('📝 Enabling edit mode due to field update');
      setIsEditMode(true);
    }
    
    updateField(field, value);
    
    if (isDataLoaded) {
      setHasUnsavedChanges(true);
    }
  };

  // Calculate all the necessary values for the components
  const totalProjectCost = calculateTotalProjectCost();
  const equityLoanAmount = calculateEquityLoanAmount();

  // Calculate monthly payments using useMemo for performance
  const monthlyPayments = useMemo(() => {
    // Use the new calculation functions to properly handle P&I vs IO
    const mainCurrentPayment = calculateCurrentLoanPayment(
      propertyData.loanAmount || 0, 
      propertyData.interestRate || 6, 
      propertyData.loanTerm || 30,
      propertyData.ioTermYears || 0,
      0, // Current year (initial calculation)
      'monthly'
    );
    
    const equityCurrentPayment = propertyData.useEquityFunding ? 
      calculateCurrentLoanPayment(
        equityLoanAmount || 0, 
        propertyData.equityLoanInterestRate || 7.2, 
        propertyData.equityLoanTerm || 30,
        propertyData.equityLoanIoTermYears || 0,
        0, // Current year (initial calculation)
        'monthly'
      ) : 0;
      
    return { 
      mainMonthly: mainCurrentPayment, 
      equityMonthly: equityCurrentPayment, 
      total: mainCurrentPayment + equityCurrentPayment 
    };
  }, [propertyData.loanAmount, propertyData.interestRate, propertyData.loanTerm, propertyData.mainLoanType, propertyData.ioTermYears, propertyData.useEquityFunding, equityLoanAmount, propertyData.equityLoanInterestRate, propertyData.equityLoanTerm, propertyData.equityLoanType, propertyData.equityLoanIoTermYears]);

  // Calculate loan payment details
  const loanPaymentDetails = useMemo(() => {
    const mainLoanDetails = {
      isIO: propertyData.mainLoanType === 'io',
      ioPayment: (propertyData.loanAmount || 0) * (propertyData.interestRate || 6) / 100 / 12,
      piPayment: calculateLoanPayment(propertyData.loanAmount || 0, propertyData.interestRate || 6, propertyData.loanTerm || 30, 'monthly'),
      ioTermYears: propertyData.ioTermYears || 0
    };

    const equityLoanDetails = propertyData.useEquityFunding ? {
      isIO: propertyData.equityLoanType === 'io',
      ioPayment: (equityLoanAmount || 0) * (propertyData.equityLoanInterestRate || 7.2) / 100 / 12,
      piPayment: calculateLoanPayment(equityLoanAmount || 0, propertyData.equityLoanInterestRate || 7.2, propertyData.equityLoanTerm || 30, 'monthly'),
      ioTermYears: propertyData.equityLoanIoTermYears || 0
    } : null;

    return { mainLoanDetails, equityLoanDetails };
  }, [propertyData.loanAmount, propertyData.interestRate, propertyData.loanTerm, propertyData.mainLoanType, propertyData.ioTermYears, propertyData.useEquityFunding, equityLoanAmount, propertyData.equityLoanInterestRate, propertyData.equityLoanTerm, propertyData.equityLoanType, propertyData.equityLoanIoTermYears]);
  
  const funding = {
    mainLoanAmount: propertyData.loanAmount,
    equityLoanAmount: equityLoanAmount,
    totalProjectCost: totalProjectCost
  };

  // Calculate holding costs
  const holdingCosts = useMemo(() => {
    const result = calculateHoldingCosts();
    console.log('🔧 DEBUG: Holding costs calculation:', {
      isConstructionProject: propertyData.isConstructionProject,
      constructionPeriod: propertyData.constructionPeriod,
      constructionInterestRate: propertyData.constructionInterestRate,
      landValue: propertyData.landValue,
      constructionValue: propertyData.constructionValue,
      stampDuty: propertyData.stampDuty,
      constructionProgressPayments: propertyData.constructionProgressPayments,
      result: result
    });
    return result;
  }, [calculateHoldingCosts]);

  // Calculate depreciation with separate building and fixtures amounts per year
  const calculateDepreciationForYear = useCallback((year: number) => {
    const buildingValue = propertyData.buildingValue || 0;
    const plantEquipmentValue = propertyData.plantEquipmentValue || 0;
    
    // Building depreciation: 2.5% annually (prime cost method) - available if built after Sept 1987
    const buildingDepreciationAvailable = propertyData.constructionYear >= 1987;
    const buildingDepreciationAnnual = buildingDepreciationAvailable ? buildingValue * 0.025 : 0;
    
    // Fixtures depreciation: 15% using chosen method - available for new properties only
    const fixturesDepreciationAvailable = propertyData.isNewProperty;
    let fixturesDepreciationAnnual = 0;
    
    if (fixturesDepreciationAvailable && plantEquipmentValue > 0) {
      if (propertyData.depreciationMethod === 'prime-cost') {
        // Prime cost: 15% of original value each year
        fixturesDepreciationAnnual = plantEquipmentValue * 0.15;
      } else {
        // Diminishing value: 15% of remaining value each year
        const remainingValue = plantEquipmentValue * Math.pow(0.85, year - 1);
        fixturesDepreciationAnnual = remainingValue > 0 ? remainingValue * 0.15 : 0;
      }
    }
    
    return {
      building: Math.max(0, buildingDepreciationAnnual),
      fixtures: Math.max(0, fixturesDepreciationAnnual),
      total: Math.max(0, buildingDepreciationAnnual + fixturesDepreciationAnnual)
    };
  }, [propertyData.buildingValue, propertyData.plantEquipmentValue, propertyData.constructionYear, propertyData.isNewProperty, propertyData.depreciationMethod]);

  // Calculate total annual depreciation for display
  const depreciation = useMemo(() => {
    const year1 = calculateDepreciationForYear(1);
    return {
      capitalWorks: year1.building,
      plantEquipment: year1.fixtures,
      total: year1.total
    };
  }, [calculateDepreciationForYear]);

  // Calculate total household tax difference from property taxable income, indexing investor incomes by CPI
  const calculateTotalTaxDifference = (propertyTaxableIncome: number, year: number) => {
    console.log('🔍 calculateTotalTaxDifference called:', { propertyTaxableIncome, year });
    console.log('📊 Investors data:', propertyData.investors);
    console.log('📊 Ownership allocations:', propertyData.ownershipAllocations);
    
    const cpiMultiplier = year >= 1 ? Math.pow(1 + 2.5 / 100, year - 1) : 1;
    let totalDifference = 0;
    
    if (!propertyData.investors || propertyData.investors.length === 0) {
      console.log('⚠️ No investors found in propertyData');
      return 0;
    }
    
    propertyData.investors.forEach(investor => {
      const ownership = propertyData.ownershipAllocations.find(o => o.investorId === investor.id);
      const ownershipPercentage = ownership ? ownership.ownershipPercentage / 100 : 0;
      console.log(`👤 Processing investor ${investor.name}:`, { 
        ownershipPercentage, 
        annualIncome: investor.annualIncome,
        otherIncome: investor.otherIncome 
      });
      
      if (ownershipPercentage > 0) {
        const baseIncome = (investor.annualIncome + investor.otherIncome) * cpiMultiplier;
        const allocatedPropertyIncome = propertyTaxableIncome * ownershipPercentage;
        const taxWithoutProperty = totalTaxAU(baseIncome, investor.hasMedicareLevy);
        const taxWithProperty = totalTaxAU(baseIncome + allocatedPropertyIncome, investor.hasMedicareLevy);
        
        console.log(`💰 Tax calculation for ${investor.name}:`, {
          baseIncome,
          allocatedPropertyIncome,
          taxWithoutProperty,
          taxWithProperty,
          difference: taxWithProperty - taxWithoutProperty
        });
        
        totalDifference += taxWithProperty - taxWithoutProperty;
      }
    });
    
    console.log('💸 Total tax difference:', totalDifference);
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

      // Debug log construction period calculation
      console.log('🚀 Construction Period Summary Debug:', {
        holdingCostsTotal: holdingCosts.total,
        constructionPeriod: propertyData.constructionPeriod,
        constructionInterestRate: propertyData.constructionInterestRate,
        isConstructionProject: propertyData.isConstructionProject,
        landValue: propertyData.landValue,
        constructionValue: propertyData.constructionValue,
        constructionProgressPayments: propertyData.constructionProgressPayments
      });

      constructionPeriodProjection = {
        year: 0,
        rentalIncome: 0,
        propertyValue: 0,
        mainLoanBalance: 0,
        equityLoanBalance: 0,
        totalInterest: Math.round(holdingCosts.total), // Use holding costs total, not loan interest payments
        mainLoanPayment: Math.round(constructionMainPaymentCash),
        equityLoanPayment: Math.round(constructionEquityPaymentCash),
        mainInterestYear: Math.round(mainInterestAccrued),
        equityInterestYear: Math.round(equityInterestAccrued),
        mainLoanIOStatus: 'IO',
        equityLoanIOStatus: propertyData.constructionEquityRepaymentType === 'pi' ? 'P&I' : 'IO',
        otherExpenses: 0,
        depreciation: 0,
        buildingDepreciation: 0,
        fixturesDepreciation: 0,
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

      // Depreciation using proper calculation for each year
      const yearDepreciation = calculateDepreciationForYear(year);
      const depreciationAmount = yearDepreciation.total;

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
    if (confirm('Are you sure you want to delete this instance? This action cannot be undone.')) {
      // Will be implemented when backend is ready
      console.log('Deleting instance:', id);
      navigate('/instances');
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
          <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'h-12' : ''}`}>
            <TabsTrigger value="analysis" className={isMobile ? 'text-sm' : ''}>Analysis</TabsTrigger>
            <TabsTrigger value="projections" className={isMobile ? 'text-sm' : ''}>Projections</TabsTrigger>
          </TabsList>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-12'}`}>
              {/* Property Investment Details - Left Side */}
              <div className={isMobile ? 'col-span-1' : 'col-span-7'}>
                <div className="sticky top-4">
                  <PropertyInputForm
                    propertyData={propertyData}
                    updateField={enhancedUpdateField}
                    investorTaxResults={investorTaxResults}
                    totalTaxableIncome={0} // Will be calculated
                    marginalTaxRate={0.3} // Will be calculated
                    isEditMode={isEditMode}
                  />
                </div>
              </div>
              
              {/* Right Side - Summaries */}
              <div className={isMobile ? 'col-span-1' : 'col-span-5'}>
                <div className="space-y-6">
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
                       availableEquity: 0, // Will be calculated
                       loanAmount: funding.mainLoanAmount
                     }}
                     outOfPocketHoldingCosts={0} // Will be calculated
                     capitalizedHoldingCosts={0} // Will be calculated
                     actualCashInvested={0} // Will be calculated
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
            </div>
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
        
        {/* Validation Warnings at bottom for mobile */}
        <div className={isMobile ? 'mt-6 pb-6' : 'mt-8'}>
          <ValidationWarnings />
        </div>
      </div>
    </div>
  );
};

export default InstanceDetail; 