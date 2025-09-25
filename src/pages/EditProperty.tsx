import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { NumberInput } from "@/components/ui/number-input";
import {
  ArrowLeft,
  Save,
  Building2,
  Loader2,
  Home,
  DollarSign,
} from "lucide-react";
import { PROPERTY_METHODS } from "@/types/presets";
import { calculateStampDuty, type Jurisdiction } from "@/utils/stampDuty";
import { useProperties } from "@/contexts/PropertiesContext";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PropertyTypeSelector } from "@/components/PropertyTypeSelector";

interface EditPropertyForm {
  name: string;
  description: string;
  property_type:
    | "Apartment"
    | "House"
    | "Townhouse"
    | "Unit"
    | "Land"
    | "Commercial";
  purchase_price: number;
  weekly_rent: number;
  location: Jurisdiction;
  property_method:
    | "house-land-construction"
    | "built-first-owner"
    | "built-second-owner";
  propertyType: "new" | "current"; // This is for the form state, maps to property_workflow_type in database
  property_workflow_type: "new" | "current"; // Database field

  // Current Property Data (for current properties)
  currentPropertyValue: number;
  currentLoanBalance: number;
  currentEquityLoanBalance: number;
  originalPurchasePrice: number;
  originalPurchaseDate: string;
  originalStampDuty: number;
  originalLegalFees: number;
  originalInspectionFees: number;

  // Essential Funding (for new properties)
  depositAmount: number;
  selectedFundingStrategy: string;

  // Property Basics
  construction_year: number;
  is_construction_project: boolean;
  land_value: number;
  construction_value: number;
  construction_period: number;
  construction_interest_rate: number;
  building_value: number;
  plant_equipment_value: number;
  // Transaction Costs
  stamp_duty: number;
  legal_fees: number;
  inspection_fees: number;
  council_fees: number;
  architect_fees: number;
  site_costs: number;
  // Ongoing Income & Expenses
  rental_growth_rate: number;
  vacancy_rate: number;
  property_management: number;
  council_rates: number;
  insurance: number;
  repairs: number;
  // Depreciation
  depreciation_method: "prime-cost" | "diminishing-value";
  is_new_property: boolean;
}

const EditProperty = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId: string }>();
  const { getPropertyById, refreshPropertyById, updateProperty } =
    useProperties();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<EditPropertyForm>({
    name: "",
    description: "",
    property_type: "Apartment",
    purchase_price: 0,
    weekly_rent: 0,
    location: "NSW",
    property_method: "built-first-owner",
    propertyType: "new",
    property_workflow_type: "new",

    // Current Property Data (for current properties)
    currentPropertyValue: 0,
    currentLoanBalance: 0,
    currentEquityLoanBalance: 0,
    originalPurchasePrice: 0,
    originalPurchaseDate: "",
    originalStampDuty: 0,
    originalLegalFees: 0,
    originalInspectionFees: 0,

    // Essential Funding (for new properties)
    depositAmount: 0,
    selectedFundingStrategy: "",

    construction_year: new Date().getFullYear(),
    is_construction_project: false,
    land_value: 0,
    construction_value: 0,
    construction_period: 0,
    construction_interest_rate: 0,
    building_value: 0,
    plant_equipment_value: 0,
    stamp_duty: 0,
    legal_fees: 0,
    inspection_fees: 0,
    council_fees: 0,
    architect_fees: 0,
    site_costs: 0,
    rental_growth_rate: 3.0,
    vacancy_rate: 2.0,
    property_management: 8.0,
    council_rates: 0,
    insurance: 0,
    repairs: 0,
    depreciation_method: "prime-cost",
    is_new_property: true,
  });

  // Load existing property data
  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId) {
        toast({
          title: "Error",
          description: "Property ID not found",
          variant: "destructive",
        });
        navigate("/properties");
        return;
      }

      try {
        let property = getPropertyById(propertyId);

        // If property not found in local state, try to fetch from backend
        if (!property) {
          property = await refreshPropertyById(propertyId);
        }

        if (!property) {
          toast({
            title: "Property Not Found",
            description: "The property you're trying to edit doesn't exist",
            variant: "destructive",
          });
          navigate("/properties");
          return;
        }

        // Map the property data to the form
        setFormData({
          name: property.name || "",
          description: property.description || "",
          property_type: property.property_type || "Apartment",
          purchase_price: property.purchase_price || 0,
          weekly_rent: property.weekly_rent || 0,
          location: (property.location as any) || "NSW",
          property_method: property.property_method || "built-first-owner",
          propertyType: (property as any).property_workflow_type || "new", // Map property_workflow_type to propertyType
          property_workflow_type:
            (property as any).property_workflow_type || "new", // Set property_workflow_type

          // Current Property Data (for current properties)
          currentPropertyValue: (property as any).current_property_value || 0,
          currentLoanBalance: (property as any).current_loan_balance || 0,
          currentEquityLoanBalance:
            (property as any).current_equity_loan_balance || 0,
          originalPurchasePrice: (property as any).original_purchase_price || 0,
          originalPurchaseDate: (property as any).original_purchase_date || "",
          originalStampDuty: (property as any).original_stamp_duty || 0,
          originalLegalFees: (property as any).original_legal_fees || 0,
          originalInspectionFees:
            (property as any).original_inspection_fees || 0,

          // Essential Funding (for new properties)
          depositAmount: (property as any).deposit_amount || 0,
          selectedFundingStrategy:
            (property as any).selected_funding_strategy || "",

          construction_year:
            property.construction_year || new Date().getFullYear(),
          is_construction_project: property.is_construction_project || false,
          land_value: property.land_value || 0,
          construction_value: property.construction_value || 0,
          construction_period: property.construction_period || 0,
          construction_interest_rate: property.construction_interest_rate || 0,
          building_value: property.building_value || 0,
          plant_equipment_value: property.plant_equipment_value || 0,
          stamp_duty: property.stamp_duty || 0,
          legal_fees: property.legal_fees || 0,
          inspection_fees: property.inspection_fees || 0,
          council_fees: property.council_fees || 0,
          architect_fees: property.architect_fees || 0,
          site_costs: property.site_costs || 0,
          rental_growth_rate: property.rental_growth_rate || 3.0,
          vacancy_rate: property.vacancy_rate || 2.0,
          property_management: property.property_management || 8.0,
          council_rates: property.council_rates || 0,
          insurance: property.insurance || 0,
          repairs: property.repairs || 0,
          depreciation_method: property.depreciation_method || "prime-cost",
          is_new_property: property.is_new_property || true,
        });
      } catch (error) {
        console.error("Error loading property:", error);
        toast({
          title: "Error",
          description: "Failed to load property data",
          variant: "destructive",
        });
        navigate("/properties");
      } finally {
        setInitialLoading(false);
      }
    };

    loadProperty();
  }, [propertyId, getPropertyById, navigate, toast]);

  // Auto-calculate stamp duty when location or purchase price changes
  useEffect(() => {
    if (formData.location && formData.purchase_price > 0) {
      const duty = calculateStampDuty(
        formData.is_construction_project
          ? formData.land_value
          : formData.purchase_price,
        formData.location
      );
      setFormData((prev) => ({ ...prev, stamp_duty: duty }));
    }
  }, [
    formData.location,
    formData.purchase_price,
    formData.is_construction_project,
    formData.land_value,
  ]);

  // Auto-calculate purchase price for House & Land - Construction
  useEffect(() => {
    if (formData.property_method === "house-land-construction") {
      const calculatedPrice = formData.land_value + formData.construction_value;
      setFormData((prev) => {
        if (prev.purchase_price !== calculatedPrice) {
          return {
            ...prev,
            purchase_price: calculatedPrice,
          };
        }
        return prev;
      });
    }
  }, [
    formData.property_method,
    formData.land_value,
    formData.construction_value,
  ]);

  const handleInputChange = (field: keyof EditPropertyForm, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePropertyMethodChange = (
    method:
      | "house-land-construction"
      | "built-first-owner"
      | "built-second-owner"
  ) => {
    setFormData((prev) => ({
      ...prev,
      property_method: method,
      is_construction_project: method === "house-land-construction",
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a property name",
        variant: "destructive",
      });
      return;
    }

    if (!propertyId) {
      toast({
        title: "Error",
        description: "Property ID not found",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Map formData to include property_workflow_type and exclude propertyType
      const {
        propertyType,
        currentPropertyValue,
        currentLoanBalance,
        currentEquityLoanBalance,
        originalPurchasePrice,
        originalPurchaseDate,
        originalStampDuty,
        originalLegalFees,
        originalInspectionFees,
        depositAmount,
        selectedFundingStrategy,
        ...formDataWithoutPropertyType
      } = formData;

      const propertyData = {
        ...formDataWithoutPropertyType,
        property_workflow_type: propertyType,
        // Map camelCase form fields to snake_case database fields
        current_property_value: currentPropertyValue,
        current_loan_balance: currentLoanBalance,
        current_equity_loan_balance: currentEquityLoanBalance,
        original_purchase_price: originalPurchasePrice,
        original_purchase_date: originalPurchaseDate,
        original_stamp_duty: originalStampDuty,
        original_legal_fees: originalLegalFees,
        original_inspection_fees: originalInspectionFees,
        deposit_amount: depositAmount,
        selected_funding_strategy: selectedFundingStrategy,
        id: propertyId,
      };
      // Update the property
      await updateProperty(propertyId, propertyData);

      // Show success message
      toast({
        title: "Property Updated!",
        description: `"${formData.name}" has been successfully updated.`,
        variant: "default",
      });

      // Navigate back to properties page
      navigate("/properties");
    } catch (error) {
      console.error("Error updating property:", error);
      toast({
        title: "Update Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/properties");
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Property</h1>
            <p className="text-muted-foreground">
              Update your property template
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Type Selection */}
            <Card>
              <CardContent className="p-6">
                <PropertyTypeSelector
                  propertyData={{
                    propertyWorkflowType: formData.propertyType,
                    // Add other required fields with default values
                    investors: [],
                    ownershipAllocations: [],
                    isConstructionProject: formData.is_construction_project,
                    purchasePrice: formData.purchase_price,
                    weeklyRent: formData.weekly_rent,
                    rentalGrowthRate: formData.rental_growth_rate,
                    vacancyRate: formData.vacancy_rate,
                    constructionYear: formData.construction_year,
                    buildingValue: formData.building_value,
                    plantEquipmentValue: formData.plant_equipment_value,
                    currentPropertyValue: formData.currentPropertyValue,
                    originalPurchasePrice: formData.originalPurchasePrice,
                    originalPurchaseDate: formData.originalPurchaseDate,
                    originalStampDuty: formData.originalStampDuty,
                    originalLegalFees: formData.originalLegalFees,
                    originalInspectionFees: formData.originalInspectionFees,
                    currentLoanBalance: formData.currentLoanBalance,
                    currentEquityLoanBalance: formData.currentEquityLoanBalance,
                    depositAmount: formData.depositAmount,
                    selectedFundingStrategy:
                      formData.selectedFundingStrategy as any,
                    landValue: formData.land_value,
                    constructionValue: formData.construction_value,
                    constructionPeriod: formData.construction_period,
                    constructionInterestRate:
                      formData.construction_interest_rate,
                    postConstructionRateReduction: 0.5,
                    constructionProgressPayments: [],
                    deposit: 0,
                    loanAmount: 0,
                    interestRate: 0,
                    loanTerm: 30,
                    lvr: 80,
                    mainLoanType: "pi",
                    ioTermYears: 5,
                    useEquityFunding: false,
                    primaryPropertyValue: 0,
                    existingDebt: 0,
                    maxLVR: 80,
                    equityLoanAmount: 0,
                    equityLoanType: "pi",
                    equityLoanIoTermYears: 3,
                    equityLoanInterestRate: 7.2,
                    equityLoanTerm: 25,
                    minimumDepositRequired: 0,
                    holdingCostFunding: "cash",
                    holdingCostCashPercentage: 100,
                    capitalizeConstructionCosts: false,
                    constructionEquityRepaymentType: "io",
                    landHoldingInterest: 0,
                    constructionHoldingInterest: 0,
                    totalHoldingCosts: 0,
                    stampDuty: formData.stamp_duty,
                    legalFees: formData.legal_fees,
                    inspectionFees: formData.inspection_fees,
                    councilFees: formData.council_fees,
                    architectFees: formData.architect_fees,
                    siteCosts: formData.site_costs,
                    propertyManagement: formData.property_management,
                    councilRates: formData.council_rates,
                    insurance: formData.insurance,
                    repairs: formData.repairs,
                    depreciationMethod: formData.depreciation_method,
                    isNewProperty: true,
                    propertyState: formData.location,
                    propertyType: formData.property_type,
                    location: formData.location,
                    currentPropertyMethod: formData.property_method as any,
                    currentFundingMethod: undefined,
                  }}
                  onPropertyTypeChange={(type) =>
                    setFormData((prev) => ({
                      ...prev,
                      propertyType: type,
                      property_workflow_type: type,
                    }))
                  }
                />
              </CardContent>
            </Card>

            {/* Current Property Data - Only for current properties */}
            {formData.propertyType === "current" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Current Property Data
                  </CardTitle>
                  <CardDescription>
                    Input your current property values and historical purchase
                    data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="current_property_value">
                        Current Property Value
                      </Label>
                      <CurrencyInput
                        id="current_property_value"
                        value={formData.currentPropertyValue}
                        onChange={(value) =>
                          handleInputChange("currentPropertyValue", value)
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current_loan_balance">
                        Current Loan Balance
                      </Label>
                      <CurrencyInput
                        id="current_loan_balance"
                        value={formData.currentLoanBalance}
                        onChange={(value) =>
                          handleInputChange("currentLoanBalance", value)
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="original_purchase_price">
                        Original Purchase Price
                      </Label>
                      <CurrencyInput
                        id="original_purchase_price"
                        value={formData.originalPurchasePrice}
                        onChange={(value) =>
                          handleInputChange("originalPurchasePrice", value)
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="original_purchase_date">
                        Original Purchase Date
                      </Label>
                      <Input
                        id="original_purchase_date"
                        type="date"
                        value={formData.originalPurchaseDate}
                        onChange={(e) =>
                          handleInputChange(
                            "originalPurchaseDate",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Essential Funding - Only for new properties */}
            {formData.propertyType === "new" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Essential Funding
                  </CardTitle>
                  <CardDescription>
                    Select your funding strategy and input deposit amounts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deposit_amount">Cash Deposit</Label>
                    <CurrencyInput
                      id="deposit_amount"
                      value={formData.depositAmount}
                      onChange={(value) =>
                        handleInputChange("depositAmount", value)
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Funding Strategy</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div
                        className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                          formData.selectedFundingStrategy === "loan-cash"
                            ? "ring-2 ring-primary border-primary"
                            : ""
                        }`}
                        onClick={() =>
                          handleInputChange(
                            "selectedFundingStrategy",
                            "loan-cash"
                          )
                        }
                      >
                        <div className="font-medium text-sm">
                          80% Loan + Cash
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Traditional financing
                        </div>
                      </div>
                      <div
                        className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                          formData.selectedFundingStrategy === "loan-equity"
                            ? "ring-2 ring-primary border-primary"
                            : ""
                        }`}
                        onClick={() =>
                          handleInputChange(
                            "selectedFundingStrategy",
                            "loan-equity"
                          )
                        }
                      >
                        <div className="font-medium text-sm">
                          80% Loan + Equity
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Use existing equity
                        </div>
                      </div>
                      <div
                        className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                          formData.selectedFundingStrategy === "full-equity"
                            ? "ring-2 ring-primary border-primary"
                            : ""
                        }`}
                        onClick={() =>
                          handleInputChange(
                            "selectedFundingStrategy",
                            "full-equity"
                          )
                        }
                      >
                        <div className="font-medium text-sm">Full Equity</div>
                        <div className="text-xs text-muted-foreground">
                          No new loans
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Define the basic details of your property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Property Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="e.g., Sydney CBD Apartment"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property_type">Property Type</Label>
                    <Select
                      value={formData.property_type}
                      onValueChange={(value) =>
                        handleInputChange("property_type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Apartment">Apartment</SelectItem>
                        <SelectItem value="House">House</SelectItem>
                        <SelectItem value="Townhouse">Townhouse</SelectItem>
                        <SelectItem value="Unit">Unit</SelectItem>
                        <SelectItem value="Land">Land</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe your property..."
                    rows={3}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) =>
                        handleInputChange("location", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACT">ACT</SelectItem>
                        <SelectItem value="NSW">NSW</SelectItem>
                        <SelectItem value="NT">NT</SelectItem>
                        <SelectItem value="QLD">QLD</SelectItem>
                        <SelectItem value="SA">SA</SelectItem>
                        <SelectItem value="TAS">TAS</SelectItem>
                        <SelectItem value="VIC">VIC</SelectItem>
                        <SelectItem value="WA">WA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property_method">Property Method</Label>
                    <Select
                      value={formData.property_method}
                      onValueChange={handlePropertyMethodChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PROPERTY_METHODS).map(
                          ([key, method]) => (
                            <SelectItem key={key} value={key}>
                              {method.name}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
                <CardDescription>
                  Key property information and pricing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="purchase_price">
                      Purchase Price
                      {formData.property_method ===
                        "house-land-construction" && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (Auto-calculated)
                        </span>
                      )}
                    </Label>
                    <CurrencyInput
                      id="purchase_price"
                      value={formData.purchase_price}
                      onChange={(value) =>
                        handleInputChange("purchase_price", value)
                      }
                      placeholder="Enter purchase price"
                      disabled={
                        formData.property_method === "house-land-construction"
                      }
                      className={
                        formData.property_method === "house-land-construction"
                          ? "bg-muted"
                          : ""
                      }
                    />
                    {formData.property_method === "house-land-construction" && (
                      <p className="text-xs text-muted-foreground">
                        Calculated as Land Value + Construction Value
                        {formData.purchase_price > 0 && (
                          <span className="block mt-1 font-medium text-green-600">
                            ${formData.land_value.toLocaleString()} + $
                            {formData.construction_value.toLocaleString()} = $
                            {formData.purchase_price.toLocaleString()}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weekly_rent">Weekly Rent</Label>
                    <CurrencyInput
                      id="weekly_rent"
                      value={formData.weekly_rent}
                      onChange={(value) =>
                        handleInputChange("weekly_rent", value)
                      }
                      placeholder="Enter weekly rent"
                    />
                  </div>
                </div>

                {formData.is_construction_project && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="land_value">Land Value</Label>
                      <CurrencyInput
                        id="land_value"
                        value={formData.land_value}
                        onChange={(value) =>
                          handleInputChange("land_value", value)
                        }
                        placeholder="Enter land value"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="construction_value">
                        Construction Value
                      </Label>
                      <CurrencyInput
                        id="construction_value"
                        value={formData.construction_value}
                        onChange={(value) =>
                          handleInputChange("construction_value", value)
                        }
                        placeholder="Enter construction value"
                      />
                    </div>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="construction_year">Construction Year</Label>
                    <NumberInput
                      id="construction_year"
                      value={formData.construction_year}
                      onChange={(value) =>
                        handleInputChange("construction_year", value)
                      }
                      placeholder="2020"
                      min={1900}
                      max={new Date().getFullYear() + 10}
                      formatThousands={false}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rental_growth_rate">
                      Rental Growth Rate (%)
                    </Label>
                    <NumberInput
                      id="rental_growth_rate"
                      value={formData.rental_growth_rate}
                      onChange={(value) =>
                        handleInputChange("rental_growth_rate", Number(value))
                      }
                      placeholder="3.0"
                      min={0}
                      max={20}
                      step="0.1"
                      formatThousands={false}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Costs */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Costs</CardTitle>
                <CardDescription>
                  One-time costs associated with the property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="stamp_duty">Stamp Duty</Label>
                    <CurrencyInput
                      id="stamp_duty"
                      value={formData.stamp_duty}
                      onChange={(value) =>
                        handleInputChange("stamp_duty", value)
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legal_fees">Legal Fees</Label>
                    <CurrencyInput
                      id="legal_fees"
                      value={formData.legal_fees}
                      onChange={(value) =>
                        handleInputChange("legal_fees", value)
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="inspection_fees">Inspection Fees</Label>
                    <CurrencyInput
                      id="inspection_fees"
                      value={formData.inspection_fees}
                      onChange={(value) =>
                        handleInputChange("inspection_fees", value)
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="council_fees">Council Fees</Label>
                    <CurrencyInput
                      id="council_fees"
                      value={formData.council_fees}
                      onChange={(value) =>
                        handleInputChange("council_fees", value)
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ongoing Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Ongoing Expenses</CardTitle>
                <CardDescription>Annual recurring costs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="property_management">
                      Property Management (%)
                    </Label>
                    <NumberInput
                      id="property_management"
                      value={formData.property_management}
                      onChange={(value) =>
                        handleInputChange("property_management", Number(value))
                      }
                      placeholder="8.0"
                      min={0}
                      max={20}
                      step="0.1"
                      formatThousands={false}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="council_rates">
                      Council Rates (annual)
                    </Label>
                    <CurrencyInput
                      id="council_rates"
                      value={formData.council_rates}
                      onChange={(value) =>
                        handleInputChange("council_rates", value)
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="insurance">Insurance (annual)</Label>
                    <CurrencyInput
                      id="insurance"
                      value={formData.insurance}
                      onChange={(value) =>
                        handleInputChange("insurance", value)
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="repairs">
                      Repairs & Maintenance (annual)
                    </Label>
                    <CurrencyInput
                      id="repairs"
                      value={formData.repairs}
                      onChange={(value) => handleInputChange("repairs", value)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Summary & Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Property Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Property Type:
                    </span>
                    <span className="font-medium">
                      {formData.property_type}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{formData.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Purchase Price:
                    </span>
                    <span className="font-medium">
                      ${formData.purchase_price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Weekly Rent:</span>
                    <span className="font-medium">
                      ${formData.weekly_rent.toLocaleString()}
                    </span>
                  </div>
                  {formData.purchase_price > 0 && formData.weekly_rent > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Yield:</span>
                      <span className="font-medium">
                        {(
                          ((formData.weekly_rent * 52) /
                            formData.purchase_price) *
                          100
                        ).toFixed(2)}
                        %
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Method:</span>
                    <span className="font-medium">
                      {PROPERTY_METHODS[formData.property_method].name}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleSave}
                    disabled={loading || !formData.name.trim()}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating Property...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Property
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProperty;
