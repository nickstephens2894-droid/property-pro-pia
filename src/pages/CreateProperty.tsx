import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CurrencyInput } from "@/components/ui/currency-input";
import { NumberInput } from "@/components/ui/number-input";
import {
  ArrowLeft,
  Save,
  Building2,
  Home,
  Receipt,
  DollarSign,
  Calculator,
} from "lucide-react";
import { PROPERTY_METHODS } from "@/types/presets";
import { calculateStampDuty, type Jurisdiction } from "@/utils/stampDuty";
import { useProperties } from "@/contexts/PropertiesContext";
import { ConstructionStagesTable } from "@/components/ConstructionStagesTable";
import { useToast } from "@/components/ui/use-toast";
import { CreatePropertyFormData } from "@/types/propertyModels";
import { PropertyTypeSelector } from "@/components/PropertyTypeSelector";

interface CreatePropertyForm extends CreatePropertyFormData {
  location: Jurisdiction;
  propertyType: "new" | "current"; // This is for the form state, maps to property_workflow_type in database

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
}

const CreateProperty = () => {
  const navigate = useNavigate();
  const { addProperty } = useProperties();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([
    "basic-information",
  ]);
  const [formData, setFormData] = useState<CreatePropertyForm>({
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
    construction_period: 8,
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

  const handleInputChange = (field: keyof CreatePropertyForm, value: any) => {
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

  // Auto-calculate stamp duty when location, purchase price, or land value changes
  useEffect(() => {
    if (formData.location) {
      let dutiableValue = 0;

      if (formData.is_construction_project && formData.land_value > 0) {
        dutiableValue = formData.land_value;
      } else if (formData.purchase_price > 0) {
        dutiableValue = formData.purchase_price;
      }

      if (dutiableValue > 0) {
        const calculatedDuty = calculateStampDuty(
          dutiableValue,
          formData.location
        );
        setFormData((prev) => {
          if (prev.stamp_duty !== calculatedDuty) {
            return {
              ...prev,
              stamp_duty: calculatedDuty,
            };
          }
          return prev;
        });
      } else {
        setFormData((prev) => {
          if (prev.stamp_duty !== 0) {
            return {
              ...prev,
              stamp_duty: 0,
            };
          }
          return prev;
        });
      }
    }
  }, [
    formData.location,
    formData.purchase_price,
    formData.is_construction_project,
    formData.land_value,
  ]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a property name",
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
      };
      await addProperty(propertyData);

      toast({
        title: "Property Created!",
        description: `"${formData.name}" has been successfully created and added to your properties list.`,
        variant: "default",
      });

      navigate("/properties");
    } catch (error) {
      console.error("Error creating property:", error);
      toast({
        title: "Creation Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/properties");
  };

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
            <h1 className="text-3xl font-bold">Create Property</h1>
            <p className="text-muted-foreground">
              Create a reusable property template for quick instance setup
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="w-full border-2 border-primary/20 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b-2 border-primary/20">
                <CardTitle className="flex items-center gap-3 text-primary text-xl">
                  <Building2 className="h-6 w-6" />
                  <div>
                    <div>Property Creation Form</div>
                    <div className="text-sm font-normal text-muted-foreground mt-1">
                      Configure your property details across different
                      categories
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Property Type Selection */}
                <div className="p-6 border-b">
                  <PropertyTypeSelector
                    propertyData={{
                      propertyWorkflowType: formData.propertyType, // This should be "new" or "current"
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
                      currentPropertyValue: 0,
                      originalPurchasePrice: 0,
                      originalPurchaseDate: "",
                      originalStampDuty: 0,
                      originalLegalFees: 0,
                      originalInspectionFees: 0,
                      currentLoanBalance: 0,
                      currentEquityLoanBalance: 0,
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
                      depositAmount: 0,
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
                      propertyType: formData.property_type, // This is the property category (Apartment, House, etc.)
                      location: formData.location,
                      currentPropertyMethod: formData.property_method as any,
                      currentFundingMethod: undefined,
                      selectedFundingStrategy: undefined,
                    }}
                    onPropertyTypeChange={(type) =>
                      setFormData((prev) => ({
                        ...prev,
                        propertyType: type,
                        property_workflow_type: type,
                      }))
                    }
                  />
                </div>

                <Accordion
                  type="multiple"
                  value={openSections}
                  onValueChange={setOpenSections}
                  className="w-full"
                >
                  {/* Basic Information */}
                  <AccordionItem value="basic-information" className="border-b">
                    <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                      <div className="flex items-center gap-2 w-full">
                        <Home className="h-4 w-4 text-primary" />
                        <span className="font-medium">Basic Information</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-4">
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
                                <SelectItem value="Apartment">
                                  Apartment
                                </SelectItem>
                                <SelectItem value="House">House</SelectItem>
                                <SelectItem value="Townhouse">
                                  Townhouse
                                </SelectItem>
                                <SelectItem value="Unit">Unit</SelectItem>
                                <SelectItem value="Land">Land</SelectItem>
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
                            placeholder="Describe this property..."
                            rows={3}
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="location">Location (State)</Label>
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
                                <SelectItem value="NSW">
                                  New South Wales
                                </SelectItem>
                                <SelectItem value="VIC">Victoria</SelectItem>
                                <SelectItem value="QLD">Queensland</SelectItem>
                                <SelectItem value="WA">
                                  Western Australia
                                </SelectItem>
                                <SelectItem value="SA">
                                  South Australia
                                </SelectItem>
                                <SelectItem value="TAS">Tasmania</SelectItem>
                                <SelectItem value="ACT">
                                  Australian Capital Territory
                                </SelectItem>
                                <SelectItem value="NT">
                                  Northern Territory
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="property_method">
                              Property Method
                            </Label>
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
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Current Property Data - Only for current properties */}
                  {formData.propertyType === "current" && (
                    <AccordionItem
                      value="current-property-data"
                      className="border-b"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                        <div className="flex items-center gap-2 w-full">
                          <Home className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            Current Property Data
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="current_property_value">
                                Current Property Value
                              </Label>
                              <CurrencyInput
                                id="current_property_value"
                                value={formData.currentPropertyValue}
                                onChange={(value) =>
                                  handleInputChange(
                                    "currentPropertyValue",
                                    value
                                  )
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
                                  handleInputChange(
                                    "originalPurchasePrice",
                                    value
                                  )
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
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Essential Funding - Only for new properties */}
                  {formData.propertyType === "new" && (
                    <AccordionItem
                      value="essential-funding"
                      className="border-b"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                        <div className="flex items-center gap-2 w-full">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span className="font-medium">Essential Funding</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <div className="space-y-4">
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
                                  formData.selectedFundingStrategy ===
                                  "loan-cash"
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
                                  formData.selectedFundingStrategy ===
                                  "loan-equity"
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
                                  formData.selectedFundingStrategy ===
                                  "full-equity"
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
                                <div className="font-medium text-sm">
                                  Full Equity
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  No new loans
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Property Details */}
                  <AccordionItem value="property-details" className="border-b">
                    <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                      <div className="flex items-center gap-2 w-full">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="font-medium">Property Details</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-4">
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
                              placeholder="0"
                              disabled={
                                formData.property_method ===
                                "house-land-construction"
                              }
                              className={
                                formData.property_method ===
                                "house-land-construction"
                                  ? "bg-muted"
                                  : ""
                              }
                            />
                            {formData.property_method ===
                              "house-land-construction" && (
                              <p className="text-xs text-muted-foreground">
                                Calculated as Land Value + Construction Value
                                {formData.purchase_price > 0 && (
                                  <span className="block mt-1 font-medium text-green-600">
                                    ${formData.land_value.toLocaleString()} + $
                                    {formData.construction_value.toLocaleString()}{" "}
                                    = $
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
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="construction_year">
                              Construction Year
                            </Label>
                            <NumberInput
                              id="construction_year"
                              value={formData.construction_year}
                              onChange={(value) =>
                                handleInputChange("construction_year", value)
                              }
                              placeholder="2024"
                              formatThousands={false}
                            />
                          </div>
                          {formData.is_construction_project && (
                            <div className="space-y-2">
                              <Label htmlFor="construction_period">
                                Construction Period (months)
                              </Label>
                              <NumberInput
                                id="construction_period"
                                value={formData.construction_period}
                                onChange={(value) =>
                                  handleInputChange(
                                    "construction_period",
                                    value
                                  )
                                }
                                placeholder="8"
                              />
                            </div>
                          )}
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
                                placeholder="0"
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
                                placeholder="0"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Transaction Costs */}
                  <AccordionItem value="transaction-costs" className="border-b">
                    <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                      <div className="flex items-center gap-2 w-full">
                        <Receipt className="h-4 w-4 text-primary" />
                        <span className="font-medium">Transaction Costs</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="stamp_duty">
                              Stamp Duty (Auto-calculated)
                            </Label>
                            <CurrencyInput
                              id="stamp_duty"
                              value={formData.stamp_duty}
                              onChange={(value) =>
                                handleInputChange("stamp_duty", value)
                              }
                              placeholder="0"
                              disabled={true}
                              className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                              Based on {formData.location} rates for{" "}
                              {formData.is_construction_project
                                ? "land value"
                                : "purchase price"}
                              {formData.stamp_duty > 0 && (
                                <span className="block mt-1 font-medium text-green-600">
                                  Calculated: $
                                  {formData.stamp_duty.toLocaleString()}
                                </span>
                              )}
                            </p>
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
                          <div className="space-y-2">
                            <Label htmlFor="inspection_fees">
                              Inspection Fees
                            </Label>
                            <CurrencyInput
                              id="inspection_fees"
                              value={formData.inspection_fees}
                              onChange={(value) =>
                                handleInputChange("inspection_fees", value)
                              }
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Ongoing Income & Expenses */}
                  <AccordionItem value="ongoing-expenses" className="border-b">
                    <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                      <div className="flex items-center gap-2 w-full">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          Ongoing Income & Expenses
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="rental_growth_rate">
                              Rental Growth Rate (%)
                            </Label>
                            <NumberInput
                              id="rental_growth_rate"
                              value={formData.rental_growth_rate}
                              onChange={(value) =>
                                handleInputChange("rental_growth_rate", value)
                              }
                              placeholder="3.0"
                              step="0.1"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="vacancy_rate">
                              Vacancy Rate (%)
                            </Label>
                            <NumberInput
                              id="vacancy_rate"
                              value={formData.vacancy_rate}
                              onChange={(value) =>
                                handleInputChange("vacancy_rate", value)
                              }
                              placeholder="2.0"
                              step="0.1"
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="property_management">
                              Property Management (%)
                            </Label>
                            <NumberInput
                              id="property_management"
                              value={formData.property_management}
                              onChange={(value) =>
                                handleInputChange("property_management", value)
                              }
                              placeholder="8.0"
                              step="0.1"
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
                            <Label htmlFor="insurance">
                              Insurance (annual)
                            </Label>
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
                              onChange={(value) =>
                                handleInputChange("repairs", value)
                              }
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Depreciation */}
                  <AccordionItem value="depreciation" className="border-b-0">
                    <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                      <div className="flex items-center gap-2 w-full">
                        <Calculator className="h-4 w-4 text-primary" />
                        <span className="font-medium">Depreciation</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <Label>Depreciation Method</Label>
                          <Select
                            value={formData.depreciation_method}
                            onValueChange={(
                              value: "prime-cost" | "diminishing-value"
                            ) =>
                              handleInputChange("depreciation_method", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="prime-cost">
                                Prime Cost (Straight Line)
                              </SelectItem>
                              <SelectItem value="diminishing-value">
                                Diminishing Value
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="is_new_property"
                            checked={formData.is_new_property}
                            onChange={(e) =>
                              handleInputChange(
                                "is_new_property",
                                e.target.checked
                              )
                            }
                            className="rounded border-border"
                          />
                          <Label htmlFor="is_new_property">
                            New Property (eligible for building depreciation)
                          </Label>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Property...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Property
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

export default CreateProperty;
