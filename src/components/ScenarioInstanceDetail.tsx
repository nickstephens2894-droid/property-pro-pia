import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Save,
  Play,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";
import {
  ScenarioWithInstances,
  ScenarioInstanceWithData,
} from "@/types/scenarios";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { PropertyInputForm } from "./PropertyInputForm";
import { PropertySummaryDashboard } from "./PropertySummaryDashboard";
import { ProjectionsTable } from "./ProjectionsTable";
import { ConfirmationDialog } from "./ui/confirmation-dialog";
import { usePropertyData } from "@/contexts/PropertyDataContext";
import { useScenarios } from "@/contexts/ScenariosContext";
import { ScenarioFundingProvider } from "@/contexts/ScenarioFundingContext";
import { useToast } from "@/hooks/use-toast";
import { SaveIndicator } from "./SaveIndicator";
import { ValidationWarnings } from "./ValidationWarnings";
import { PropertyCalculationDetails } from "./PropertyCalculationDetails";
import { ScenarioFundingPanel } from "./ScenarioFundingPanel";
import { InvestmentResultsDetailed } from "./InvestmentResultsDetailed";
import { ConstructionPeriodTable } from "./ConstructionPeriodTable";
import { ScenarioApplyDialog } from "./ScenarioApplyDialog";
import { totalTaxAU, marginalRateAU } from "@/utils/tax";
import {
  calculateLoanPayment,
  calculateCurrentLoanPayment,
} from "@/utils/calculationUtils";
import { resolve, Triplet } from "@/utils/overrides";

interface ScenarioInstanceDetailProps {
  scenario: ScenarioWithInstances;
  scenarioInstance: ScenarioInstanceWithData;
  onBack: () => void;
  onUpdate: () => void;
}

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

export const ScenarioInstanceDetail: React.FC<ScenarioInstanceDetailProps> = ({
  scenario,
  scenarioInstance,
  onBack,
  onUpdate,
}) => {
  const {
    propertyData,
    updateField,
    calculateTotalProjectCost,
    calculateEquityLoanAmount,
    calculateHoldingCosts,
    applyPreset,
  } = usePropertyData();
  const { updateScenarioInstance, applyScenarioInstance } = useScenarios();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("analysis");
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [yearRange, setYearRange] = useState<[number, number]>([1, 30]);
  const [viewMode, setViewMode] = useState<"year" | "table">("table");

  // Load scenario instance data into PropertyData context
  useEffect(() => {
    if (!isDataLoaded) {
      const instanceData = scenarioInstance.instance_data_parsed;
      console.log("🔄 Loading scenario instance data:", instanceData);

      applyPreset(
        {
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
          constructionProgressPayments:
            instanceData.construction_progress_payments as any,
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
          holdingCostFunding: instanceData.holding_cost_funding as
            | "cash"
            | "debt"
            | "hybrid",
          holdingCostCashPercentage: instanceData.holding_cost_cash_percentage,
          capitalizeConstructionCosts:
            instanceData.capitalize_construction_costs,
          constructionEquityRepaymentType:
            instanceData.construction_equity_repayment_type as "io" | "pi",
          landHoldingInterest: instanceData.land_holding_interest,
          constructionHoldingInterest:
            instanceData.construction_holding_interest,
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
          depreciationMethod: instanceData.depreciation_method as
            | "prime-cost"
            | "diminishing-value",
          isNewProperty: instanceData.is_new_property,
          currentPropertyMethod: instanceData.property_method as any,
          currentFundingMethod: instanceData.funding_method as any,
        },
        instanceData.property_method as any,
        instanceData.funding_method as any
      );
      setIsDataLoaded(true);
    }
  }, [scenarioInstance, applyPreset, isDataLoaded]);

  const getStatusIcon = () => {
    switch (scenarioInstance.status) {
      case "synced":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "conflict":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "draft":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (scenarioInstance.status) {
      case "synced":
        return "bg-green-100 text-green-800";
      case "conflict":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Convert PropertyData back to scenario instance format
  const convertPropertyDataToScenarioInstance = () => {
    const instanceData = scenarioInstance.instance_data_parsed;
    const totalProjectCost = calculateTotalProjectCost();
    const equityLoanAmount = calculateEquityLoanAmount();

    return {
      ...instanceData,
      purchase_price: propertyData.purchasePrice || 0,
      weekly_rent: propertyData.weeklyRent || 0,
      rental_growth_rate: propertyData.rentalGrowthRate || 5.0,
      vacancy_rate: propertyData.vacancyRate || 2.0,
      is_construction_project: propertyData.isConstructionProject || false,
      construction_year: propertyData.constructionYear || 2025,
      land_value: propertyData.landValue || 0,
      construction_value: propertyData.constructionValue || 0,
      construction_period: propertyData.constructionPeriod || 0,
      construction_interest_rate: propertyData.constructionInterestRate || 7.0,
      building_value: propertyData.buildingValue || 0,
      plant_equipment_value: propertyData.plantEquipmentValue || 0,
      construction_progress_payments:
        propertyData.constructionProgressPayments || [],
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
      main_loan_type: propertyData.mainLoanType || "pi",
      io_term_years: propertyData.ioTermYears || 5,
      use_equity_funding: propertyData.useEquityFunding || false,
      primary_property_value: propertyData.primaryPropertyValue || 0,
      existing_debt: propertyData.existingDebt || 0,
      max_lvr: propertyData.maxLVR || 80,
      equity_loan_type: propertyData.equityLoanType || "pi",
      equity_loan_io_term_years: propertyData.equityLoanIoTermYears || 3,
      equity_loan_interest_rate: propertyData.equityLoanInterestRate || 7.2,
      equity_loan_term: propertyData.equityLoanTerm || 25,
      deposit_amount: propertyData.depositAmount || 0,
      minimum_deposit_required: propertyData.minimumDepositRequired || 0,
      holding_cost_funding: propertyData.holdingCostFunding || "cash",
      holding_cost_cash_percentage:
        propertyData.holdingCostCashPercentage || 100,
      capitalize_construction_costs:
        propertyData.capitalizeConstructionCosts || false,
      construction_equity_repayment_type:
        propertyData.constructionEquityRepaymentType || "io",
      land_holding_interest: propertyData.landHoldingInterest || 0,
      construction_holding_interest:
        propertyData.constructionHoldingInterest || 0,
      total_holding_costs: propertyData.totalHoldingCosts || 0,
      investors: (propertyData.investors as any) || [],
      ownership_allocations: (propertyData.ownershipAllocations as any) || [],
      total_project_cost: totalProjectCost,
      equity_loan_amount: equityLoanAmount,
      depreciation_method: propertyData.depreciationMethod || "prime-cost",
      property_method: propertyData.currentPropertyMethod,
      funding_method: propertyData.currentFundingMethod,
      property_state: propertyData.propertyState || "VIC",
    };
  };

  const handleSave = async () => {
    if (!scenarioInstance.id) {
      console.error("❌ Cannot save - missing scenario instance id");
      return;
    }

    try {
      setSaving(true);
      console.log("💾 Starting save process for scenario instance...");

      const updatedInstanceData = convertPropertyDataToScenarioInstance();

      await updateScenarioInstance(scenarioInstance.id, {
        instance_data: updatedInstanceData,
        status: "draft",
      });

      setHasUnsavedChanges(false);
      setIsEditMode(false);
      onUpdate();

      toast({
        title: "Scenario Instance Updated",
        description: "Your scenario instance has been successfully updated.",
      });

      console.log("✅ Scenario instance saved successfully");
    } catch (error) {
      console.error("❌ Failed to save scenario instance:", error);
      toast({
        title: "Error",
        description: "Failed to update scenario instance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async () => {
    setIsApplyDialogOpen(true);
  };

  const handleApplyComplete = async (result: any) => {
    if (result.success) {
      toast({
        title: "Scenario applied successfully",
        description:
          result.operation_type === "create"
            ? "New instance created from scenario"
            : "Instance updated with merged scenario changes",
      });
      // Refresh the scenario data
      onUpdate();
    } else {
      toast({
        title: "Apply failed",
        description: result.error || "Failed to apply scenario changes",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    // TODO: Implement delete functionality
    console.log("Deleting scenario instance...");
    onBack();
  };

  // Track changes to mark as unsaved
  const lastPropertyDataRef = React.useRef(propertyData);
  useEffect(() => {
    if (isDataLoaded && isEditMode) {
      const currentData = propertyData;
      const lastData = lastPropertyDataRef.current;

      const keyFieldsChanged =
        currentData.purchasePrice !== lastData.purchasePrice ||
        currentData.weeklyRent !== lastData.weeklyRent ||
        currentData.constructionValue !== lastData.constructionValue ||
        currentData.buildingValue !== lastData.buildingValue ||
        currentData.plantEquipmentValue !== lastData.plantEquipmentValue ||
        currentData.landValue !== lastData.landValue ||
        currentData.loanAmount !== lastData.loanAmount ||
        currentData.depositAmount !== lastData.depositAmount;

      if (keyFieldsChanged) {
        setHasUnsavedChanges(true);
      }
    }

    lastPropertyDataRef.current = propertyData;
  }, [propertyData, isDataLoaded, isEditMode]);

  const enhancedUpdateField = (
    field: keyof typeof propertyData,
    value: any
  ) => {
    console.log("🔧 Field update:", { field, value, isEditMode, isDataLoaded });

    // Enable edit mode if not already enabled and data is loaded
    if (!isEditMode && isDataLoaded) {
      console.log("📝 Enabling edit mode due to field update");
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
  const holdingCosts = useMemo(() => {
    return calculateHoldingCosts();
  }, [calculateHoldingCosts]);

  // Calculate monthly payments using useMemo for performance
  const monthlyPayments = useMemo(() => {
    const mainCurrentPayment = calculateCurrentLoanPayment(
      propertyData.loanAmount || 0,
      propertyData.interestRate || 6,
      propertyData.loanTerm || 30,
      propertyData.ioTermYears || 0,
      0, // Current year (initial calculation)
      "monthly"
    );

    const equityCurrentPayment = propertyData.useEquityFunding
      ? calculateCurrentLoanPayment(
          equityLoanAmount || 0,
          propertyData.equityLoanInterestRate || 7.2,
          propertyData.equityLoanTerm || 30,
          propertyData.equityLoanIoTermYears || 0,
          0, // Current year (initial calculation)
          "monthly"
        )
      : 0;

    return {
      mainMonthly: mainCurrentPayment,
      equityMonthly: equityCurrentPayment,
      total: mainCurrentPayment + equityCurrentPayment,
    };
  }, [
    propertyData.loanAmount,
    propertyData.interestRate,
    propertyData.loanTerm,
    propertyData.mainLoanType,
    propertyData.ioTermYears,
    propertyData.useEquityFunding,
    equityLoanAmount,
    propertyData.equityLoanInterestRate,
    propertyData.equityLoanTerm,
    propertyData.equityLoanType,
    propertyData.equityLoanIoTermYears,
  ]);

  // Calculate projections (simplified version for now)
  const projections = useMemo(() => {
    const years: YearProjection[] = [];
    const weeklyRent =
      resolve({ mode: "auto", auto: propertyData.weeklyRent, manual: null }) ??
      0;
    const annualRent = weeklyRent * 52;
    let mainLoanBalance = propertyData.loanAmount || 0;
    let equityLoanBalance = equityLoanAmount || 0;
    let cumulativeCashFlow = 0;

    for (let year = 1; year <= 30; year++) {
      // Rental income with growth and vacancy
      const rentalGrowth = 5.0 / 100; // 5% rental growth
      const vacancy = (propertyData.vacancyRate || 5.0) / 100;
      const grossRentalIncome =
        annualRent * Math.pow(1 + rentalGrowth, year - 1);
      const rentalIncome = grossRentalIncome * (1 - vacancy);

      // Property value with capital growth
      const capitalGrowth = 7.0 / 100; // 7% capital growth
      const propertyValue =
        (propertyData.purchasePrice || totalProjectCost) *
        Math.pow(1 + capitalGrowth, year - 1);

      // Calculate loan payments (simplified)
      const mainInterestYear =
        (mainLoanBalance * (propertyData.interestRate || 6)) / 100;
      const equityInterestYear =
        (equityLoanBalance * (propertyData.equityLoanInterestRate || 7.2)) /
        100;
      const totalInterest = mainInterestYear + equityInterestYear;

      // Operating expenses
      const pmRate = (propertyData.propertyManagement || 7.0) / 100;
      const propertyManagement = rentalIncome * pmRate;
      const otherExpenses =
        propertyManagement +
        (propertyData.councilRates || 0) +
        (propertyData.insurance || 0) +
        (propertyData.repairs || 0);

      // Depreciation (simplified)
      const depreciationAmount =
        (propertyData.buildingValue || 0) * 0.025 +
        (propertyData.plantEquipmentValue || 0) * 0.15;

      // Tax calculations (simplified)
      const taxableIncome =
        rentalIncome - totalInterest - otherExpenses - depreciationAmount;
      const taxBenefit = -taxableIncome * 0.3; // Simplified 30% tax rate

      // Cash flow calculations
      const afterTaxCashFlow =
        rentalIncome - otherExpenses - totalInterest + taxBenefit;
      cumulativeCashFlow += afterTaxCashFlow;

      // Property equity
      const propertyEquity =
        propertyValue - mainLoanBalance - equityLoanBalance;

      years.push({
        year,
        rentalIncome,
        propertyValue,
        mainLoanBalance,
        equityLoanBalance,
        totalInterest,
        mainLoanPayment: mainInterestYear,
        equityLoanPayment: equityInterestYear,
        mainInterestYear,
        equityInterestYear,
        mainLoanIOStatus: "IO" as "IO" | "P&I",
        equityLoanIOStatus: "IO" as "IO" | "P&I",
        otherExpenses,
        depreciation: depreciationAmount,
        buildingDepreciation: (propertyData.buildingValue || 0) * 0.025,
        fixturesDepreciation: (propertyData.plantEquipmentValue || 0) * 0.15,
        taxableIncome,
        taxBenefit,
        afterTaxCashFlow,
        cumulativeCashFlow,
        propertyEquity,
        totalReturn: afterTaxCashFlow,
      });
    }

    return years;
  }, [propertyData, totalProjectCost, equityLoanAmount]);

  // Calculate investor tax results
  const investorTaxResults = useMemo(() => {
    const year1Data = projections.find((p) => p.year === 1);
    if (
      !propertyData.investors ||
      propertyData.investors.length === 0 ||
      !year1Data
    ) {
      return [];
    }

    return propertyData.investors.map((investor) => {
      const ownership = propertyData.ownershipAllocations?.find(
        (o) => o.investorId === investor.id
      );
      const ownershipPercentage = ownership
        ? ownership.ownershipPercentage / 100
        : 0;

      const investorTaxBenefit = year1Data.taxBenefit * ownershipPercentage;
      const adjustedTotalIncome =
        investor.annualIncome + (investor.otherIncome || 0);

      const taxWithoutProperty = totalTaxAU(
        adjustedTotalIncome,
        investor.hasMedicareLevy
      );
      const taxWithProperty = taxWithoutProperty - Math.abs(investorTaxBenefit);

      return {
        investor: {
          id: investor.id,
          name: investor.name,
          annualIncome: investor.annualIncome,
          otherIncome: investor.otherIncome || 0,
          nonTaxableIncome: 0,
          hasMedicareLevy: investor.hasMedicareLevy,
        },
        ownershipPercentage,
        taxWithoutProperty,
        taxWithProperty,
        taxDifference: investorTaxBenefit,
        marginalTaxRate: marginalRateAU(adjustedTotalIncome),
        propertyTaxableIncome:
          year1Data.rentalIncome -
          (year1Data.otherExpenses + year1Data.depreciation),
      };
    });
  }, [projections, propertyData.investors, propertyData.ownershipAllocations]);

  // Calculate investment summary
  const investmentSummary = useMemo(() => {
    const year1Data = projections.find((p) => p.year === 1);
    const yearToData = projections.find((p) => p.year === yearRange[1]);

    return {
      weeklyAfterTaxCashFlowSummary: (year1Data?.afterTaxCashFlow ?? 0) / 52,
      taxBenefitFromProjections: year1Data?.taxBenefit ?? 0,
      taxSavingsTotal: projections
        .slice(0, yearRange[1])
        .reduce((sum, p) => sum + Math.max(0, p.taxBenefit), 0),
      equityAtYearTo: yearToData?.propertyEquity ?? 0,
      roiAtYearTo: 0, // Simplified for now
      marginalTaxRateSummary:
        propertyData.investors.length > 0
          ? Math.max(
              ...propertyData.investors.map((c) =>
                marginalRateAU(c.annualIncome + c.otherIncome)
              )
            )
          : 0.325,
      annualRentFromProjections: year1Data?.rentalIncome ?? 0,
    };
  }, [projections, yearRange, propertyData.investors]);

  return (
    <ScenarioFundingProvider scenarioInstanceId={scenarioInstance.id}>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Scenario
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">
                    {scenarioInstance.scenario_name}
                  </h1>
                  <SaveIndicator
                    hasUnsavedChanges={hasUnsavedChanges}
                    saving={saving}
                    isEditMode={isEditMode}
                  />
                </div>
                <p className="text-muted-foreground">
                  {scenario.name} •{" "}
                  {scenarioInstance.original_instance_id
                    ? "Copied from existing"
                    : "New instance"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor()}>
                {getStatusIcon()}
                <span className="ml-1">{scenarioInstance.status}</span>
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mb-6">
            {isEditMode ? (
              <>
                <Button
                  variant="default"
                  onClick={handleSave}
                  disabled={saving || !hasUnsavedChanges}
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saving
                    ? "Saving..."
                    : hasUnsavedChanges
                    ? "Save Changes"
                    : "Saved"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditMode(false);
                    setHasUnsavedChanges(false);
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditMode(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                {scenarioInstance.status === "draft" ||
                scenarioInstance.status === "conflict" ? (
                  <Button
                    variant="default"
                    onClick={() => setIsApplyDialogOpen(true)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Apply Changes
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove from Scenario
                </Button>
              </>
            )}
          </div>

          {/* Main Content */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="projections">Projections</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Property Input Form */}
                <div className="lg:col-span-2">
                  <PropertyInputForm
                    propertyData={propertyData}
                    updateField={enhancedUpdateField}
                    investorTaxResults={investorTaxResults}
                    totalTaxableIncome={0} // Will be calculated
                    marginalTaxRate={0.3} // Will be calculated
                    isEditMode={isEditMode}
                    instanceId={undefined} // No real instance ID in scenario context
                    disableFunding={true} // Disable funding functionality in scenarios
                  />
                </div>

                {/* Summary Dashboard */}
                <div className="lg:col-span-1">
                  <div className="space-y-6">
                    {/* Scenario Funding Panel */}
                    <ScenarioFundingPanel
                      scenarioInstanceId={scenarioInstance.id}
                      onApplyFunding={() => {
                        // Handle funding application
                        console.log("Funding applied to scenario instance");
                        onUpdate(); // Refresh the scenario data
                      }}
                      onRollbackFunding={() => {
                        // Handle funding rollback
                        console.log(
                          "Funding rolled back for scenario instance"
                        );
                        onUpdate(); // Refresh the scenario data
                      }}
                    />
                    <PropertyCalculationDetails
                      monthlyRepayment={monthlyPayments.total}
                      annualRepayment={monthlyPayments.total * 12}
                      annualRent={investmentSummary.annualRentFromProjections}
                      propertyManagementCost={
                        (investmentSummary.annualRentFromProjections *
                          (propertyData.propertyManagement || 0.07)) /
                        100
                      }
                      councilRates={propertyData.councilRates || 0}
                      insurance={propertyData.insurance || 0}
                      repairs={propertyData.repairs || 0}
                      totalDeductibleExpenses={0} // Will be calculated
                      cashDeductionsSubtotal={0} // Will be calculated
                      paperDeductionsSubtotal={0} // Will be calculated
                      depreciation={{
                        capitalWorks: (propertyData.buildingValue || 0) * 0.025,
                        plantEquipment:
                          (propertyData.plantEquipmentValue || 0) * 0.15,
                        total:
                          (propertyData.buildingValue || 0) * 0.025 +
                          (propertyData.plantEquipmentValue || 0) * 0.15,
                        capitalWorksAvailable:
                          (propertyData.constructionYear || 0) >= 1987,
                        plantEquipmentRestricted: !propertyData.isNewProperty,
                      }}
                      investorTaxResults={investorTaxResults}
                      totalTaxWithProperty={investorTaxResults.reduce(
                        (sum, result) => sum + (result.taxWithProperty || 0),
                        0
                      )}
                      totalTaxWithoutProperty={investorTaxResults.reduce(
                        (sum, result) => sum + (result.taxWithoutProperty || 0),
                        0
                      )}
                      marginalTaxRate={investmentSummary.marginalTaxRateSummary}
                      purchasePrice={propertyData.purchasePrice || 0}
                      constructionYear={propertyData.constructionYear || 2020}
                      depreciationMethod={
                        propertyData.depreciationMethod || "prime-cost"
                      }
                      isConstructionProject={
                        propertyData.isConstructionProject || false
                      }
                      totalProjectCost={totalProjectCost}
                      holdingCosts={{
                        landInterest: holdingCosts.landInterest,
                        constructionInterest: holdingCosts.constructionInterest,
                        total: holdingCosts.total,
                      }}
                      funding={{
                        totalRequired: totalProjectCost,
                        equityUsed: equityLoanAmount,
                        cashRequired:
                          totalProjectCost -
                          (propertyData.loanAmount || 0) -
                          equityLoanAmount,
                        availableEquity: 0,
                        loanAmount: propertyData.loanAmount || 0,
                      }}
                      outOfPocketHoldingCosts={0}
                      capitalizedHoldingCosts={0}
                      actualCashInvested={0}
                      constructionPeriod={propertyData.constructionPeriod || 0}
                      holdingCostFunding={
                        propertyData.holdingCostFunding || "cash"
                      }
                      mainLoanPayments={{
                        ioPayment:
                          ((propertyData.loanAmount || 0) *
                            (propertyData.interestRate || 6)) /
                          100 /
                          12,
                        piPayment: calculateLoanPayment(
                          propertyData.loanAmount || 0,
                          propertyData.interestRate || 6,
                          propertyData.loanTerm || 30,
                          "monthly"
                        ),
                        ioTermYears: propertyData.ioTermYears || 0,
                        remainingTerm:
                          (propertyData.loanTerm || 30) -
                          (propertyData.ioTermYears || 0),
                        totalInterest:
                          ((propertyData.loanAmount || 0) *
                            (propertyData.interestRate || 6)) /
                          100,
                        currentPayment:
                          propertyData.mainLoanType === "io" &&
                          (propertyData.ioTermYears || 0) > 0
                            ? ((propertyData.loanAmount || 0) *
                                (propertyData.interestRate || 6)) /
                              100 /
                              12
                            : calculateLoanPayment(
                                propertyData.loanAmount || 0,
                                propertyData.interestRate || 6,
                                propertyData.loanTerm || 30,
                                "monthly"
                              ),
                        futurePayment:
                          propertyData.mainLoanType === "io" &&
                          (propertyData.ioTermYears || 0) > 0
                            ? calculateLoanPayment(
                                propertyData.loanAmount || 0,
                                propertyData.interestRate || 6,
                                propertyData.loanTerm || 30,
                                "monthly"
                              )
                            : 0,
                      }}
                      equityLoanPayments={
                        propertyData.useEquityFunding
                          ? {
                              ioPayment:
                                (equityLoanAmount *
                                  (propertyData.equityLoanInterestRate ||
                                    7.2)) /
                                100 /
                                12,
                              piPayment: calculateLoanPayment(
                                equityLoanAmount,
                                propertyData.equityLoanInterestRate || 7.2,
                                propertyData.equityLoanTerm || 30,
                                "monthly"
                              ),
                              ioTermYears:
                                propertyData.equityLoanIoTermYears || 0,
                              remainingTerm:
                                (propertyData.equityLoanTerm || 30) -
                                (propertyData.equityLoanIoTermYears || 0),
                              totalInterest:
                                (equityLoanAmount *
                                  (propertyData.equityLoanInterestRate ||
                                    7.2)) /
                                100,
                              currentPayment:
                                propertyData.equityLoanType === "io" &&
                                (propertyData.equityLoanIoTermYears || 0) > 0
                                  ? (equityLoanAmount *
                                      (propertyData.equityLoanInterestRate ||
                                        7.2)) /
                                    100 /
                                    12
                                  : calculateLoanPayment(
                                      equityLoanAmount,
                                      propertyData.equityLoanInterestRate ||
                                        7.2,
                                      propertyData.equityLoanTerm || 30,
                                      "monthly"
                                    ),
                              futurePayment:
                                propertyData.equityLoanType === "io" &&
                                (propertyData.equityLoanIoTermYears || 0) > 0
                                  ? calculateLoanPayment(
                                      equityLoanAmount,
                                      propertyData.equityLoanInterestRate ||
                                        7.2,
                                      propertyData.equityLoanTerm || 30,
                                      "monthly"
                                    )
                                  : 0,
                            }
                          : null
                      }
                      totalAnnualInterest={
                        ((propertyData.loanAmount || 0) *
                          (propertyData.interestRate || 6)) /
                          100 +
                        (equityLoanAmount *
                          (propertyData.equityLoanInterestRate || 7.2)) /
                          100
                      }
                      taxRefundOrLiability={
                        investmentSummary.taxBenefitFromProjections
                      }
                      netOfTaxCostIncome={
                        investmentSummary.weeklyAfterTaxCashFlowSummary * 52
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="projections" className="space-y-6">
              {/* Investment Summary Dashboard */}
              <PropertySummaryDashboard
                weeklyCashflowYear1={
                  investmentSummary.weeklyAfterTaxCashFlowSummary
                }
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
                    <CardTitle>
                      Investment Analysis - Projections over{" "}
                      {yearRange[1] - yearRange[0] + 1} years
                    </CardTitle>
                    <CardDescription>
                      Financial breakdown with metrics in rows and years in
                      columns
                    </CardDescription>
                  </div>
                  <Tabs
                    value={viewMode}
                    onValueChange={(v) => setViewMode(v as "year" | "table")}
                  >
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
                    formatPercentage={(value: number) => `${value.toFixed(2)}%`}
                    viewMode={viewMode}
                  />
                </CardContent>
              </Card>

              {/* Investment Results Detailed */}
              <Card>
                <CardHeader>
                  <CardTitle>Investment Results Summary</CardTitle>
                  <CardDescription>
                    Comprehensive analysis of your investment performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InvestmentResultsDetailed
                    projections={projections}
                    yearTo={yearRange[1]}
                    initialPropertyValue={propertyData.purchasePrice || 0}
                    totalProjectCost={totalProjectCost}
                    cpiRate={2.5}
                    formatCurrency={formatCurrency}
                    formatPercentage={(value: number) => `${value.toFixed(2)}%`}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Instance Details</CardTitle>
                  <CardDescription>
                    Detailed information about this scenario instance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">
                        Scenario Name
                      </label>
                      <div className="text-sm text-muted-foreground">
                        {scenarioInstance.scenario_name}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Original Instance
                      </label>
                      <div className="text-sm text-muted-foreground">
                        {scenarioInstance.original_instance_id
                          ? "Yes"
                          : "No (New instance)"}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Created</label>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(scenarioInstance.created_at)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Last Modified
                      </label>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(scenarioInstance.last_modified_at)}
                      </div>
                    </div>
                    {scenarioInstance.last_synced_at && (
                      <div>
                        <label className="text-sm font-medium">
                          Last Synced
                        </label>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(scenarioInstance.last_synced_at)}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Validation Warnings */}
          <div className="mt-8">
            <ValidationWarnings />
          </div>
        </div>

        {/* Confirmation Dialogs */}
        <ConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Remove Instance from Scenario"
          description="Are you sure you want to remove this instance from the scenario? This action cannot be undone."
          confirmText="Remove"
          cancelText="Cancel"
          variant="destructive"
          onConfirm={handleDelete}
          onCancel={() => setIsDeleteDialogOpen(false)}
        />

        <ScenarioApplyDialog
          isOpen={isApplyDialogOpen}
          onClose={() => setIsApplyDialogOpen(false)}
          scenarioInstanceId={scenarioInstance.id}
          scenarioInstanceName={scenarioInstance.scenario_name}
          onApplyComplete={handleApplyComplete}
        />
      </div>
    </ScenarioFundingProvider>
  );
};
