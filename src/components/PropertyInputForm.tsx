import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { CurrencyInput } from "@/components/ui/currency-input";
import { NumberInput } from "@/components/ui/number-input";
import { FieldUpdateConfirmDialog } from "@/components/FieldUpdateConfirmDialog";
import { AccordionCompletionIndicator } from "@/components/AccordionCompletionIndicator";
import { FundingSummaryPanel } from "@/components/FundingSummaryPanel";
import { PresetSelector } from "@/components/PresetSelector";
import { ValidationWarnings } from "@/components/ValidationWarnings";
import { useFieldConfirmations } from "@/hooks/useFieldConfirmations";
import { usePropertyData, PropertyData } from "@/contexts/PropertyDataContext";
import { 
  validatePersonalProfile, 
  validatePropertyBasics, 
  validateFinancing, 
  validatePurchaseCosts, 
  validateAnnualExpenses,
  validateTaxOptimization
} from "@/utils/validationUtils";
import { Users, Home, Receipt, Calculator, Building2, Hammer, CreditCard, Clock, DollarSign, TrendingUp, Percent, X, Plus, AlertTriangle } from "lucide-react";
import { PROPERTY_METHODS, type PropertyMethod } from "@/types/presets";
import StampDutyCalculator from "@/components/StampDutyCalculator";

interface Client {
  id: string;
  name: string;
  annualIncome: number;
  otherIncome: number;
  hasMedicareLevy: boolean;
}

interface OwnershipAllocation {
  clientId: string;
  ownershipPercentage: number;
}


interface ClientTaxResult {
  client: Client;
  ownershipPercentage: number;
  taxWithoutProperty: number;
  taxWithProperty: number;
  taxDifference: number;
  marginalTaxRate: number;
  propertyTaxableIncome: number;
}

interface PropertyInputFormProps {
  propertyData: PropertyData;
  updateField: (field: keyof PropertyData, value: any) => void;
  clientTaxResults: ClientTaxResult[];
  totalTaxableIncome: number;
  marginalTaxRate: number;
}


const PercentageInput = ({ 
  id, 
  value, 
  onChange, 
  step = "0.1",
  placeholder = "0",
  className = ""
}: {
  id: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
  placeholder?: string;
  className?: string;
}) => {
  const [displayValue, setDisplayValue] = useState<string>(value?.toFixed(1) || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^0-9.]/g, '');
    setDisplayValue(inputValue);
  };

  const handleBlur = () => {
    const numericValue = parseFloat(displayValue) || 0;
    onChange(numericValue);
  };

  return (
    <div className="relative">
      <Input
        id={id}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`pr-8 ${className}`}
      />
      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
    </div>
  );
};

export const PropertyInputForm = ({ 
  propertyData, 
  updateField, 
  clientTaxResults,
  totalTaxableIncome, 
  marginalTaxRate 
}: PropertyInputFormProps) => {
  const [openSections, setOpenSections] = useState<string[]>(["personal-profile"]);
  const { confirmations, updateConfirmation } = useFieldConfirmations();
  const { applyPreset, calculateEquityLoanAmount, calculateAvailableEquity } = usePropertyData();
  const [pendingUpdate, setPendingUpdate] = useState<{
    field: keyof PropertyData;
    value: any;
    confirmationType: 'construction' | 'building';
  } | null>(null);
  const [dutyCalcOpen, setDutyCalcOpen] = useState(false);

  // Calculate total construction value
  const totalConstructionValue = propertyData.buildingValue + propertyData.plantEquipmentValue;

  // Calculate holding costs during construction
  const calculateHoldingCosts = () => {
    const months = propertyData.constructionPeriod || 12;
    const annualRate = propertyData.constructionInterestRate / 100;
    const monthlyRate = annualRate / 12;
    
    // Calculate monthly progress payments (simplified)
    const totalValue = propertyData.landValue + propertyData.constructionValue;
    const landPortion = propertyData.landValue / totalValue;
    const constructionPortion = propertyData.constructionValue / totalValue;
    
    // Assume land is paid upfront, construction paid progressively
    const avgConstructionBalance = propertyData.constructionValue * 0.5; // Average balance during construction
    const landInterest = propertyData.landValue * monthlyRate * months;
    const constructionInterest = avgConstructionBalance * monthlyRate * months;
    
    return {
      landHoldingInterest: landInterest,
      constructionHoldingInterest: constructionInterest,
      totalHoldingCosts: landInterest + constructionInterest
    };
  };

  const holdingCosts = propertyData.isConstructionProject ? calculateHoldingCosts() : {
    landHoldingInterest: 0,
    constructionHoldingInterest: 0,
    totalHoldingCosts: 0
  };

  // Enhanced updateField with cascading updates and confirmations
  const updateFieldWithCascade = useCallback((field: keyof PropertyData, value: any) => {
    // Handle construction contract value with confirmation
    if (field === 'constructionValue' && !confirmations.hasShownConstructionWarning) {
      setPendingUpdate({ field, value, confirmationType: 'construction' });
      return;
    }
    
    // Handle building/equipment values with confirmation
    if ((field === 'buildingValue' || field === 'plantEquipmentValue') && !confirmations.hasShownBuildingWarning) {
      setPendingUpdate({ field, value, confirmationType: 'building' });
      return;
    }
    
    // Execute the update
    executeFieldUpdate(field, value);
  }, [propertyData, updateField, confirmations]);

  const executeFieldUpdate = useCallback((field: keyof PropertyData, value: any) => {
    updateField(field, value);
    
    // Handle cascading updates
    if (field === 'constructionValue') {
      // Split construction value: 90% building, 10% plant & equipment
      const buildingValue = Math.round(value * 0.9);
      const plantEquipmentValue = Math.round(value * 0.1);
      updateField('buildingValue', buildingValue);
      updateField('plantEquipmentValue', plantEquipmentValue);
    } else if (field === 'buildingValue' || field === 'plantEquipmentValue') {
      // Update construction contract value when building/equipment changes
      const newBuildingValue = field === 'buildingValue' ? value : propertyData.buildingValue;
      const newPlantEquipmentValue = field === 'plantEquipmentValue' ? value : propertyData.plantEquipmentValue;
      const newTotal = newBuildingValue + newPlantEquipmentValue;
      updateField('constructionValue', newTotal);
    }
    
    // Update holding costs when construction parameters change
    if (['landValue', 'constructionValue', 'constructionPeriod', 'constructionInterestRate'].includes(field)) {
      const costs = calculateHoldingCosts();
      updateField('landHoldingInterest', costs.landHoldingInterest);
      updateField('constructionHoldingInterest', costs.constructionHoldingInterest);
      updateField('totalHoldingCosts', costs.totalHoldingCosts);
    }
  }, [propertyData, updateField]);

  const handleConfirmUpdate = useCallback((dontShowAgain: boolean) => {
    if (!pendingUpdate) return;
    
    if (pendingUpdate.confirmationType === 'construction') {
      updateConfirmation('hasShownConstructionWarning', dontShowAgain);
    } else {
      updateConfirmation('hasShownBuildingWarning', dontShowAgain);
    }
    
    executeFieldUpdate(pendingUpdate.field, pendingUpdate.value);
    setPendingUpdate(null);
  }, [pendingUpdate, updateConfirmation, executeFieldUpdate]);

  // Get completion status for each section
  const personalProfileStatus = validatePersonalProfile(propertyData);
  const propertyBasicsStatus = validatePropertyBasics(propertyData);
  const financingStatus = validateFinancing(propertyData);
  const purchaseCostsStatus = validatePurchaseCosts(propertyData);
  const annualExpensesStatus = validateAnnualExpenses(propertyData);
  const taxOptimizationStatus = validateTaxOptimization(propertyData);

  const addClient = () => {
    const newClient: Client = {
      id: Date.now().toString(),
      name: `Client ${propertyData.clients.length + 1}`,
      annualIncome: 0,
      otherIncome: 0,
      hasMedicareLevy: false,
    };
    
    const newAllocation: OwnershipAllocation = {
      clientId: newClient.id,
      ownershipPercentage: 0,
    };

    updateField('clients', [...propertyData.clients, newClient]);
    updateField('ownershipAllocations', [...propertyData.ownershipAllocations, newAllocation]);
  };

  const removeClient = (clientId: string) => {
    if (propertyData.clients.length <= 1) return; // Keep at least one client
    
    const updatedClients = propertyData.clients.filter(c => c.id !== clientId);
    const updatedAllocations = propertyData.ownershipAllocations.filter(a => a.clientId !== clientId);
    
    updateField('clients', updatedClients);
    updateField('ownershipAllocations', updatedAllocations);
  };

  const updateClient = (clientId: string, field: keyof Client, value: any) => {
    const updatedClients = propertyData.clients.map(client =>
      client.id === clientId ? { ...client, [field]: value } : client
    );
    updateField('clients', updatedClients);
  };

  const updateOwnershipAllocation = (clientId: string, percentage: number) => {
    const updatedAllocations = propertyData.ownershipAllocations.map(allocation =>
      allocation.clientId === clientId ? { ...allocation, ownershipPercentage: percentage } : allocation
    );
    updateField('ownershipAllocations', updatedAllocations);
  };

  const totalOwnership = propertyData.ownershipAllocations.reduce((sum, allocation) => 
    sum + allocation.ownershipPercentage, 0);

  const handleApplyPreset = (presetData: any) => {
    // Extract the PropertyMethod and FundingMethod if they exist in the preset data
    const { propertyMethod, fundingMethod, ...dataToApply } = presetData;
    applyPreset(dataToApply, propertyMethod, fundingMethod);
  };

  return (
    <div className="space-y-6">
      {/* Validation Warnings */}
      <ValidationWarnings />
      
      <Card className="w-full border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b-2 border-primary/20">
          <CardTitle className="flex items-center gap-3 text-primary text-xl">
            <Home className="h-6 w-6" />
            <div>
              <div>Property Investment Details</div>
              <div className="text-sm font-normal text-muted-foreground mt-1">
                Configure your property investment parameters
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Accordion 
            type="multiple" 
            value={openSections} 
            onValueChange={setOpenSections}
            className="w-full"
          >
          {/* 1. Personal Financial Profile */}
          <AccordionItem value="personal-profile" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
              <div className="flex items-center gap-2 w-full">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium">Personal Financial Profile</span>
                <div className="ml-auto">
                  <AccordionCompletionIndicator status={personalProfileStatus} />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Clients</h4>
                  <Button 
                    onClick={addClient}
                    size="sm"
                    variant="outline"
                    disabled={propertyData.clients.length >= 4}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Client
                  </Button>
                </div>

                {propertyData.clients.map((client) => (
                  <div key={client.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Input
                        value={client.name}
                        onChange={(e) => updateClient(client.id, 'name', e.target.value)}
                        placeholder="Client name"
                        className="max-w-[200px] font-medium"
                      />
                      {propertyData.clients.length > 1 && (
                        <Button
                          onClick={() => removeClient(client.id)}
                          size="sm"
                          variant="ghost"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`income-${client.id}`} className="text-sm font-medium">
                          Annual Income
                        </Label>
                        <CurrencyInput
                          id={`income-${client.id}`}
                          value={client.annualIncome}
                          onChange={(value) => updateClient(client.id, 'annualIncome', value)}
                          className="mt-1"
                          placeholder="Enter annual income"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`other-income-${client.id}`} className="text-sm font-medium">
                          Other Income
                        </Label>
                        <CurrencyInput
                          id={`other-income-${client.id}`}
                          value={client.otherIncome}
                          onChange={(value) => updateClient(client.id, 'otherIncome', value)}
                          className="mt-1"
                          placeholder="Enter other income"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`medicare-${client.id}`}
                        checked={client.hasMedicareLevy}
                        onChange={(e) => updateClient(client.id, 'hasMedicareLevy', e.target.checked)}
                        className="rounded border-border"
                      />
                      <Label htmlFor={`medicare-${client.id}`} className="text-sm">
                        Subject to Medicare Levy
                      </Label>
                    </div>

                    {/* Display tax summary for this client */}
                    {clientTaxResults.find(r => r.client.id === client.id) && (
                      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                        <div className="text-sm font-medium">Tax Summary</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Marginal Rate:</span>
                            <span className="ml-1 font-medium">
                              {(clientTaxResults.find(r => r.client.id === client.id)?.marginalTaxRate * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Current Tax:</span>
                            <span className="ml-1 font-medium">
                              ${clientTaxResults.find(r => r.client.id === client.id)?.taxWithoutProperty.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 2. Property Basics */}
          <AccordionItem value="property-basics" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
              <div className="flex items-center gap-2 w-full">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="font-medium">Property Basics</span>
                <div className="ml-auto">
                  <AccordionCompletionIndicator status={propertyBasicsStatus} />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
<div className="space-y-2">
  <Label className="text-sm font-medium">Property Method</Label>
  <Select
    value={propertyData.currentPropertyMethod}
    onValueChange={(value) => {
      updateField('currentPropertyMethod', value as PropertyMethod);
      updateField('isConstructionProject', value === 'house-land-construction');
    }}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select property method..." />
    </SelectTrigger>
    <SelectContent className="bg-background border border-border">
      {Object.entries(PROPERTY_METHODS).map(([key, method]) => (
        <SelectItem key={key} value={key}>
          {method.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

                {propertyData.isConstructionProject ? (
                  <div className="space-y-4">

                    {/* Total Property Value */}
                    <div className="bg-primary/10 rounded-lg p-4 border-l-4 border-primary">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Total Property Value
                      </h4>
                      <div className="text-2xl font-bold text-primary">
                        ${(propertyData.landValue + propertyData.constructionValue).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Land: ${propertyData.landValue.toLocaleString()} + Construction: ${propertyData.constructionValue.toLocaleString()}
                      </div>
                    </div>

<div>
  <Label htmlFor="landValue" className="text-sm font-medium">Land Value</Label>
  <CurrencyInput
    id="landValue"
    value={propertyData.landValue}
    onChange={(value) => updateFieldWithCascade('landValue', value)}
    className="mt-1"
    placeholder="Enter land value"
  />
  <p className="text-xs text-muted-foreground mt-2">Set construction amount and details in the Construction section.</p>
</div>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="purchasePrice" className="text-sm font-medium">Purchase Price</Label>
                    <CurrencyInput
                      id="purchasePrice"
                      value={propertyData.purchasePrice}
                      onChange={(value) => updateFieldWithCascade('purchasePrice', value)}
                      className="mt-1"
                      placeholder="Enter purchase price"
                    />
                  </div>
                )}


              </div>
            </AccordionContent>
          </AccordionItem>

{/* 3. Construction */}
{propertyData.isConstructionProject && (
  <AccordionItem value="construction" className="border-b">
    <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
      <div className="flex items-center gap-2 w-full">
        <Hammer className="h-4 w-4 text-primary" />
        <span className="font-medium">Construction</span>
      </div>
    </AccordionTrigger>
    <AccordionContent className="px-6 pb-6">
      <div className="space-y-6">
        {/* Construction Value & Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="constructionValue" className="text-sm font-medium">
              Total Construction Value
              {totalConstructionValue !== propertyData.constructionValue && (
                <span className="text-muted-foreground text-xs ml-2">
                  (Calculated: ${totalConstructionValue.toLocaleString()})
                </span>
              )}
            </Label>
            <CurrencyInput
              id="constructionValue"
              value={propertyData.constructionValue}
              onChange={(value) => updateFieldWithCascade('constructionValue', value)}
              className="mt-1"
              placeholder="Enter total construction value"
            />
          </div>
          <div className="bg-primary/10 rounded-lg p-4 border-l-4 border-primary">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Home className="h-4 w-4" />
              Total Property Value
            </h4>
            <div className="text-2xl font-bold text-primary">
              ${(propertyData.landValue + propertyData.constructionValue).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Land: ${propertyData.landValue.toLocaleString()} + Construction: ${propertyData.constructionValue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Building Values */}
        <div className="bg-muted/20 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Construction Value Breakdown
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="buildingValue" className="text-sm font-medium">Building Value (excl. land)</Label>
              <CurrencyInput
                id="buildingValue"
                value={propertyData.buildingValue}
                onChange={(value) => updateFieldWithCascade('buildingValue', value)}
                className="mt-1"
                placeholder="Enter building value"
              />
            </div>
            <div>
              <Label htmlFor="plantEquipmentValue" className="text-sm font-medium">Plant & Equipment Value</Label>
              <CurrencyInput
                id="plantEquipmentValue"
                value={propertyData.plantEquipmentValue}
                onChange={(value) => updateFieldWithCascade('plantEquipmentValue', value)}
                className="mt-1"
                placeholder="Enter equipment value"
              />
            </div>
            <div>
              <Label htmlFor="constructionYear" className="text-sm font-medium">Construction Year</Label>
              <NumberInput
                id="constructionYear"
                value={propertyData.constructionYear}
                onChange={(value) => updateField('constructionYear', value)}
                className="mt-1"
                placeholder="2020"
                min={1900}
                max={new Date().getFullYear() + 10}
                formatThousands={false}
              />
            </div>
          </div>
          <div className="mt-3">
            <div className="bg-accent/30 rounded-lg p-3">
              <div className="text-sm font-medium text-accent-foreground">
                Total Construction Value: ${totalConstructionValue.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Building Value + Plant & Equipment Value
              </div>
            </div>
          </div>

          {/* Holding Cost Estimates */}
          <div className="bg-orange-50/50 dark:bg-orange-950/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800 mt-4">
            <h5 className="text-sm font-medium mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <DollarSign className="h-4 w-4" />
              Holding Cost Estimates ({propertyData.constructionPeriod || 12} months)
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3 border border-red-200 dark:border-red-800">
                <div className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">
                  Land Interest (Non-deductible)
                </div>
                <div className="text-lg font-bold text-red-700 dark:text-red-300">
                  ${holdingCosts.landHoldingInterest.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  On ${propertyData.landValue.toLocaleString()}
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 border border-green-200 dark:border-green-800">
                <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                  Construction Interest (Deductible)
                </div>
                <div className="text-lg font-bold text-green-700 dark:text-green-300">
                  ${holdingCosts.constructionHoldingInterest.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  On construction progress
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                  Total Holding Costs
                </div>
                <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                  ${holdingCosts.totalHoldingCosts.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  During construction
                </div>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-2">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                Tax Implications:
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• <strong>Land Interest:</strong> Non-deductible as it relates to land acquisition</div>
                <div>• <strong>Construction Interest:</strong> Can be claimed as immediate deduction or capitalized to building cost</div>
                <div>• <strong>Total deductible amount:</strong> ${holdingCosts.constructionHoldingInterest.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Construction Timeline & Financing */}
        <div className="bg-accent/20 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Construction Timeline & Financing
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="constructionPeriod" className="text-sm font-medium">Construction Period (months)</Label>
              <NumberInput
                id="constructionPeriod"
                value={propertyData.constructionPeriod || 0}
                onChange={(value) => updateField('constructionPeriod', value)}
                className="mt-1"
                placeholder="e.g., 12"
                min={1}
                max={60}
              />
            </div>
            <div>
              <Label htmlFor="constructionInterestRate" className="text-sm font-medium">Construction Interest Rate</Label>
              <PercentageInput
                id="constructionInterestRate"
                value={propertyData.constructionInterestRate}
                onChange={(value) => updateField('constructionInterestRate', value)}
                className="mt-1"
                placeholder="Enter rate"
              />
            </div>
          </div>
          {/* Construction Progress Payments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Construction Progress Payments</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPayment = {
                    id: Date.now().toString(),
                    percentage: 0,
                    month: 1,
                    description: 'New payment'
                  };
                  updateField('constructionProgressPayments', [...(propertyData.constructionProgressPayments || []), newPayment]);
                }}
              >
                Add Payment
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {propertyData.constructionProgressPayments?.map((payment, index) => (
                <div key={payment.id} className="grid grid-cols-12 gap-2 items-end bg-muted/30 p-3 rounded">
                  <div className="col-span-4">
                    <Label className="text-xs">Description</Label>
                    <Input
                      value={payment.description}
                      onChange={(e) => {
                        const updated = [...(propertyData.constructionProgressPayments || [])];
                        updated[index] = { ...payment, description: e.target.value };
                        updateField('constructionProgressPayments', updated);
                      }}
                      className="mt-1 text-sm"
                      placeholder="Payment description"
                    />
                  </div>
                  <div className="col-span-3">
                    <Label className="text-xs">Percentage (%)</Label>
                    <NumberInput
                      value={payment.percentage}
                      onChange={(value) => {
                        const updated = [...(propertyData.constructionProgressPayments || [])];
                        updated[index] = { ...payment, percentage: value };
                        updateField('constructionProgressPayments', updated);
                      }}
                      className="mt-1 text-sm"
                      placeholder="0"
                      min={0}
                      max={100}
                      id={`percentage-${payment.id}`}
                    />
                  </div>
                  <div className="col-span-3">
                    <Label className="text-xs">Month</Label>
                    <NumberInput
                      value={payment.month}
                      onChange={(value) => {
                        const updated = [...(propertyData.constructionProgressPayments || [])];
                        updated[index] = { ...payment, month: value };
                        updateField('constructionProgressPayments', updated);
                      }}
                      className="mt-1 text-sm"
                      placeholder="1"
                      min={1}
                      max={60}
                      id={`month-${payment.id}`}
                    />
                  </div>
                  <div className="col-span-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updated = (propertyData.constructionProgressPayments || []).filter((_, i) => i !== index);
                        updateField('constructionProgressPayments', updated);
                      }}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {propertyData.constructionProgressPayments?.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Total: {propertyData.constructionProgressPayments.reduce((sum, p) => sum + p.percentage, 0)}% 
                  {propertyData.constructionProgressPayments.reduce((sum, p) => sum + p.percentage, 0) !== 100 && (
                    <span className="text-warning ml-2">⚠️ Should total 100%</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Development Costs */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Development Costs</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="councilFees" className="text-sm font-medium">Council Fees & Approvals</Label>
              <CurrencyInput
                id="councilFees"
                value={propertyData.councilFees}
                onChange={(value) => updateFieldWithCascade('councilFees', value)}
                className="mt-1"
                placeholder="Enter council fees"
              />
            </div>
            <div>
              <Label htmlFor="architectFees" className="text-sm font-medium">Architect/Design Fees</Label>
              <CurrencyInput
                id="architectFees"
                value={propertyData.architectFees}
                onChange={(value) => updateFieldWithCascade('architectFees', value)}
                className="mt-1"
                placeholder="Enter architect fees"
              />
            </div>
            <div>
              <Label htmlFor="siteCosts" className="text-sm font-medium">Site Costs & Utilities</Label>
              <CurrencyInput
                id="siteCosts"
                value={propertyData.siteCosts}
                onChange={(value) => updateFieldWithCascade('siteCosts', value)}
                className="mt-1"
                placeholder="Enter site costs"
              />
            </div>
          </div>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
)}

{/* 5. Transaction & Setup Costs */}
<AccordionItem value="transaction-costs" className="border-b">
  <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
    <div className="flex items-center gap-2 w-full">
      <Receipt className="h-4 w-4 text-primary" />
      <span className="font-medium">Transaction & Setup Costs</span>
      <div className="ml-auto">
        <AccordionCompletionIndicator status={purchaseCostsStatus} />
      </div>
    </div>
  </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Purchase Costs</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="stampDuty" className="text-sm font-medium">Stamp Duty</Label>
                        <Button type="button" size="sm" variant="outline" onClick={() => setDutyCalcOpen(true)}>
                          Calculate
                        </Button>
                      </div>
                      <CurrencyInput
                        id="stampDuty"
                        value={propertyData.stampDuty}
                        onChange={(value) => updateFieldWithCascade('stampDuty', value)}
                        className="mt-1"
                        placeholder="Enter stamp duty"
                      />
                      <StampDutyCalculator open={dutyCalcOpen} onOpenChange={setDutyCalcOpen} />
                    </div>
                    <div>
                      <Label htmlFor="legalFees" className="text-sm font-medium">Legal Fees</Label>
                      <CurrencyInput
                        id="legalFees"
                        value={propertyData.legalFees}
                        onChange={(value) => updateFieldWithCascade('legalFees', value)}
                        className="mt-1"
                        placeholder="Enter legal fees"
                      />
                    </div>
                    <div>
                      <Label htmlFor="inspectionFees" className="text-sm font-medium">Inspection Fees</Label>
                      <CurrencyInput
                        id="inspectionFees"
                        value={propertyData.inspectionFees}
                        onChange={(value) => updateFieldWithCascade('inspectionFees', value)}
                        className="mt-1"
                        placeholder="Enter inspection fees"
                      />
                    </div>
                  </div>
                </div>

                {propertyData.isConstructionProject && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Development Costs</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="councilFees" className="text-sm font-medium">Council Fees & Approvals</Label>
                        <CurrencyInput
                          id="councilFees"
                          value={propertyData.councilFees}
                          onChange={(value) => updateFieldWithCascade('councilFees', value)}
                          className="mt-1"
                          placeholder="Enter council fees"
                        />
                      </div>
                      <div>
                        <Label htmlFor="architectFees" className="text-sm font-medium">Architect/Design Fees</Label>
                        <CurrencyInput
                          id="architectFees"
                          value={propertyData.architectFees}
                          onChange={(value) => updateFieldWithCascade('architectFees', value)}
                          className="mt-1"
                          placeholder="Enter architect fees"
                        />
                      </div>
                      <div>
                        <Label htmlFor="siteCosts" className="text-sm font-medium">Site Costs & Utilities</Label>
                        <CurrencyInput
                          id="siteCosts"
                          value={propertyData.siteCosts}
                          onChange={(value) => updateFieldWithCascade('siteCosts', value)}
                          className="mt-1"
                          placeholder="Enter site costs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 5. Funding & Finance Structure */}
          <AccordionItem value="funding-finance" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
              <div className="flex items-center gap-2 w-full">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="font-medium">Funding & Finance Structure</span>
                <div className="ml-auto">
                  <AccordionCompletionIndicator status={financingStatus} />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useEquityFunding"
                    checked={propertyData.useEquityFunding}
                    onChange={(e) => updateField('useEquityFunding', e.target.checked)}
                    className="rounded border-border"
                  />
                  <Label htmlFor="useEquityFunding" className="text-sm font-medium">
                    Use Equity from Existing Property
                  </Label>
                </div>

                {/* Main Loan Structure */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Main Loan Structure</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="interestRate" className="text-sm font-medium">Interest Rate</Label>
                        <PercentageInput
                          id="interestRate"
                          value={propertyData.interestRate}
                          onChange={(value) => updateField('interestRate', value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="loanTerm" className="text-sm font-medium">Loan Term (years)</Label>
                        <NumberInput
                          id="loanTerm"
                          value={propertyData.loanTerm}
                          onChange={(value) => updateField('loanTerm', value)}
                          className="mt-1"
                          min={1}
                          max={50}
                        />
                      </div>
                      {!propertyData.useEquityFunding && (
                        <div>
                          <Label htmlFor="lvr" className="text-sm font-medium">Loan to Value Ratio (LVR)</Label>
                          <PercentageInput
                            id="lvr"
                            value={propertyData.lvr}
                            onChange={(value) => updateField('lvr', value)}
                            className="mt-1"
                          />
                        </div>
                      )}
                    </div>

                    {/* Loan Type Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Loan Payment Type</Label>
                      <RadioGroup
                        value={propertyData.mainLoanType}
                        onValueChange={(value: 'io' | 'pi') => updateField('mainLoanType', value)}
                        className="flex flex-row space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pi" id="pi" />
                          <Label htmlFor="pi" className="text-sm">Principal & Interest</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="io" id="io" />
                          <Label htmlFor="io" className="text-sm">Interest Only</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Interest Only Period */}
                    {propertyData.mainLoanType === 'io' && (
                      <div className="ml-4 space-y-2">
                        <Label htmlFor="ioTermYears" className="text-sm font-medium">Interest Only Period (years)</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                          <NumberInput
                            id="ioTermYears"
                            value={propertyData.ioTermYears}
                            onChange={(value) => updateField('ioTermYears', value)}
                            className="mt-1"
                            min={1}
                            max={40}
                          />
                          <div className="text-xs text-muted-foreground">
                            Maximum 40 years allowed
                            {propertyData.ioTermYears > 10 && (
                              <div className="flex items-center gap-1 text-warning mt-1">
                                <AlertTriangle className="h-3 w-3" />
                                Long IO periods increase total interest cost
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                     {/* Equity Funding Details */}
                {propertyData.useEquityFunding && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Equity Property Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="primaryPropertyValue" className="text-sm font-medium">Primary Property Value</Label>
                        <CurrencyInput
                          id="primaryPropertyValue"
                          value={propertyData.primaryPropertyValue}
                          onChange={(value) => updateFieldWithCascade('primaryPropertyValue', value)}
                          className="mt-1"
                          placeholder="Enter property value"
                        />
                      </div>
                      <div>
                        <Label htmlFor="existingDebt" className="text-sm font-medium">Existing Debt</Label>
                        <CurrencyInput
                          id="existingDebt"
                          value={propertyData.existingDebt}
                          onChange={(value) => updateFieldWithCascade('existingDebt', value)}
                          className="mt-1"
                          placeholder="Enter existing debt"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxLVR" className="text-sm font-medium">Maximum LVR Available</Label>
                        <PercentageInput
                          id="maxLVR"
                          value={propertyData.maxLVR}
                          onChange={(value) => updateField('maxLVR', value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Equity Loan Calculation Display */}
                    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                      <h5 className="font-medium text-sm flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Equity Calculation Summary
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Available Equity:</span>
                          <div className="font-medium text-primary">
                            ${calculateAvailableEquity().toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Required Equity Loan:</span>
                          <div className={`font-medium ${calculateEquityLoanAmount() > calculateAvailableEquity() ? 'text-destructive' : 'text-success'}`}>
                            ${calculateEquityLoanAmount().toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Remaining Equity:</span>
                          <div className="font-medium">
                            ${Math.max(0, calculateAvailableEquity() - calculateEquityLoanAmount()).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {calculateEquityLoanAmount() > calculateAvailableEquity() && (
                        <div className="flex items-center gap-2 text-destructive text-sm">
                          <AlertTriangle className="h-4 w-4" />
                          Insufficient equity available. Consider increasing property value or reducing loan amount.
                        </div>
                      )}
                    </div>

                    {/* Equity Loan Options */}
                    <div className="space-y-4 border-t pt-4">
                      <h5 className="font-medium text-sm">Equity Loan Terms</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="equityLoanInterestRate" className="text-sm font-medium">Equity Loan Interest Rate</Label>
                          <PercentageInput
                            id="equityLoanInterestRate"
                            value={propertyData.equityLoanInterestRate}
                            onChange={(value) => updateField('equityLoanInterestRate', value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="equityLoanTerm" className="text-sm font-medium">Equity Loan Term (years)</Label>
                          <NumberInput
                            id="equityLoanTerm"
                            value={propertyData.equityLoanTerm}
                            onChange={(value) => updateField('equityLoanTerm', value)}
                            className="mt-1"
                            min={1}
                            max={50}
                          />
                        </div>
                      </div>

                      {/* Equity Loan Type */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Equity Loan Payment Type</Label>
                        <RadioGroup
                          value={propertyData.equityLoanType}
                          onValueChange={(value: 'io' | 'pi') => updateField('equityLoanType', value)}
                          className="flex flex-row space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pi" id="equity-pi" />
                            <Label htmlFor="equity-pi" className="text-sm">Principal & Interest</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="io" id="equity-io" />
                            <Label htmlFor="equity-io" className="text-sm">Interest Only</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Equity Loan IO Period */}
                      {propertyData.equityLoanType === 'io' && (
                        <div className="ml-4 space-y-2">
                          <Label htmlFor="equityLoanIoTermYears" className="text-sm font-medium">Equity Loan IO Period (years)</Label>
                          <NumberInput
                            id="equityLoanIoTermYears"
                            value={propertyData.equityLoanIoTermYears}
                            onChange={(value) => updateField('equityLoanIoTermYears', value)}
                            className="mt-1"
                            min={1}
                            max={40}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cash Deposit - Always show regardless of funding method */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Cash Deposit Requirements</h4>
                  <div>
                    <Label htmlFor="depositAmount" className="text-sm font-medium">Cash Deposit Amount</Label>
                    <CurrencyInput
                      id="depositAmount"
                      value={propertyData.depositAmount}
                      onChange={(value) => updateFieldWithCascade('depositAmount', value)}
                      className="mt-1"
                      placeholder="Enter deposit amount"
                    />
                    {propertyData.useEquityFunding && propertyData.depositAmount > 0 && (
                      <div className="flex items-center gap-2 mt-2 text-blue-600 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        Additional cash deposit on top of equity funding
                      </div>
                    )}
                    {!propertyData.useEquityFunding && propertyData.depositAmount < propertyData.minimumDepositRequired && (
                      <div className="flex items-center gap-2 mt-2 text-warning text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        Shortfall of ${(propertyData.minimumDepositRequired - propertyData.depositAmount).toLocaleString()} - require additional cash or equity financing
                      </div>
                    )}
                  </div>
                </div>

                {propertyData.isConstructionProject && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Construction Holding Costs Funding</h4>
                    <div className="space-y-3">
                      {/* Quick toggle to capitalise everything */}
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="capitalizeConstructionCosts"
                          checked={propertyData.capitalizeConstructionCosts}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            updateField('capitalizeConstructionCosts', checked);
                            if (checked) {
                              updateField('holdingCostFunding', 'debt');
                              updateField('holdingCostCashPercentage', 0);
                            }
                          }}
                          className="rounded border-border"
                        />
                        <Label htmlFor="capitalizeConstructionCosts" className="text-sm">Capitalise all costs during construction</Label>
                      </div>
                      <div className="text-xs text-muted-foreground ml-6 -mt-1">
                        Interest and eligible holding costs will be added to the loan balance instead of paid from cash.
                      </div>
                      {/* Detailed funding split */}
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="holdingCostCash"
                          name="holdingCostFunding"
                          checked={propertyData.holdingCostFunding === 'cash'}
                          onChange={() => {
                            updateField('holdingCostFunding', 'cash');
                            updateField('holdingCostCashPercentage', 100);
                            updateField('capitalizeConstructionCosts', false);
                          }}
                          className="rounded-full"
                        />
                        <Label htmlFor="holdingCostCash" className="text-sm">Pay holding costs in cash</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="holdingCostDebt"
                          name="holdingCostFunding"
                          checked={propertyData.holdingCostFunding === 'debt'}
                          onChange={() => updateField('holdingCostFunding', 'debt')}
                          className="rounded-full"
                        />
                        <Label htmlFor="holdingCostDebt" className="text-sm">Capitalize holding costs into loan</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="holdingCostHybrid"
                          name="holdingCostFunding"
                          checked={propertyData.holdingCostFunding === 'hybrid'}
                          onChange={() => updateField('holdingCostFunding', 'hybrid')}
                          className="rounded-full"
                        />
                        <Label htmlFor="holdingCostHybrid" className="text-sm">Hybrid (partial cash, partial debt)</Label>
                      </div>
                      {propertyData.holdingCostFunding === 'hybrid' && (
                        <div className="ml-6">
                          <Label htmlFor="holdingCostCashPercentage" className="text-sm font-medium">Percentage to pay in cash</Label>
                          <PercentageInput
                            id="holdingCostCashPercentage"
                            value={propertyData.holdingCostCashPercentage}
                            onChange={(value) => updateField('holdingCostCashPercentage', value)}
                            className="mt-1"
                          />
                        </div>
                      )}
                    </div>

                    {/* Equity repayments during construction */}
                    {propertyData.useEquityFunding && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Equity loan repayments during construction</Label>
                        <RadioGroup
                          value={propertyData.constructionEquityRepaymentType}
                          onValueChange={(value: 'io' | 'pi') => updateField('constructionEquityRepaymentType', value)}
                          className="flex flex-row space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="io" id="equity-construct-io" />
                            <Label htmlFor="equity-construct-io" className="text-sm">Interest Only</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pi" id="equity-construct-pi" />
                            <Label htmlFor="equity-construct-pi" className="text-sm">Principal & Interest</Label>
                          </div>
                        </RadioGroup>
                        <div className="text-xs text-muted-foreground">
                          Construction loan is Interest-Only during construction (progressive drawdown). Equity can be IO or P&I.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 6. Ongoing Income & Expenses */}
          <AccordionItem value="ongoing-income-expenses" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
              <div className="flex items-center gap-2 w-full">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="font-medium">Ongoing Income & Expenses</span>
                <div className="ml-auto">
                  <AccordionCompletionIndicator status={annualExpensesStatus} />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Rental Income Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Rental Income</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="weeklyRent" className="text-sm font-medium">Weekly Rent</Label>
                      <CurrencyInput
                        id="weeklyRent"
                        value={propertyData.weeklyRent}
                        onChange={(value) => updateFieldWithCascade('weeklyRent', value)}
                        className="mt-1"
                        placeholder="Enter weekly rent"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rentalGrowthRate" className="text-sm font-medium">Rental Growth Rate</Label>
                      <PercentageInput
                        id="rentalGrowthRate"
                        value={propertyData.rentalGrowthRate}
                        onChange={(value) => updateField('rentalGrowthRate', value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vacancyRate" className="text-sm font-medium">Vacancy Rate</Label>
                      <PercentageInput
                        id="vacancyRate"
                        value={propertyData.vacancyRate}
                        onChange={(value) => updateField('vacancyRate', value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Ongoing Expenses */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Ongoing Expenses</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="propertyManagement" className="text-sm font-medium">Property Management (%)</Label>
                      <PercentageInput
                        id="propertyManagement"
                        value={propertyData.propertyManagement}
                        onChange={(value) => updateField('propertyManagement', value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="councilRates" className="text-sm font-medium">Council Rates (annual)</Label>
                      <CurrencyInput
                        id="councilRates"
                        value={propertyData.councilRates}
                        onChange={(value) => updateFieldWithCascade('councilRates', value)}
                        className="mt-1"
                        placeholder="Enter council rates"
                      />
                    </div>
                    <div>
                      <Label htmlFor="insurance" className="text-sm font-medium">Insurance (annual)</Label>
                      <CurrencyInput
                        id="insurance"
                        value={propertyData.insurance}
                        onChange={(value) => updateFieldWithCascade('insurance', value)}
                        className="mt-1"
                        placeholder="Enter insurance cost"
                      />
                    </div>
                    <div>
                      <Label htmlFor="repairs" className="text-sm font-medium">Repairs & Maintenance (annual)</Label>
                      <CurrencyInput
                        id="repairs"
                        value={propertyData.repairs}
                        onChange={(value) => updateFieldWithCascade('repairs', value)}
                        className="mt-1"
                        placeholder="Enter repair costs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 7. Tax Optimization */}
          <AccordionItem value="tax-optimization" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
              <div className="flex items-center gap-2 w-full">
                <Calculator className="h-4 w-4 text-primary" />
                <span className="font-medium">Tax Optimization & Depreciation</span>
                <div className="ml-auto">
                  <AccordionCompletionIndicator status={taxOptimizationStatus} />
                </div>
              </div>
            </AccordionTrigger>
           <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Property Ownership Allocation - Moved from Personal Profile */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Property Ownership Allocation</h4>
                  <div className="text-xs text-muted-foreground mb-3">
                    Configure ownership percentages to optimize tax outcomes across multiple investors.
                  </div>
                  {propertyData.clients.map((client) => {
                    const allocation = propertyData.ownershipAllocations.find(a => a.clientId === client.id);
                    return (
                      <div key={client.id} className="grid grid-cols-2 gap-4 items-center">
                        <Label className="text-sm">{client.name}</Label>
                        <PercentageInput
                          id={`ownership-${client.id}`}
                          value={allocation?.ownershipPercentage || 0}
                          onChange={(value) => updateOwnershipAllocation(client.id, value)}
                          step="1"
                        />
                      </div>
                    );
                  })}
                  <div className="text-sm text-muted-foreground">
                    Total: {totalOwnership}% 
                    {totalOwnership !== 100 && (
                      <span className="text-warning ml-2">⚠️ Should total 100%</span>
                    )}
                  </div>
                </div>

                {/* Depreciation Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Depreciation Strategy</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="depreciationMethod" className="text-sm font-medium">Depreciation Method</Label>
                      <Select 
                        value={propertyData.depreciationMethod} 
                        onValueChange={(value: 'prime-cost' | 'diminishing-value') => updateField('depreciationMethod', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prime-cost">Prime Cost (Straight Line)</SelectItem>
                          <SelectItem value="diminishing-value">Diminishing Value</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 mt-6">
                      <input
                        type="checkbox"
                        id="isNewProperty"
                        checked={propertyData.isNewProperty}
                        onChange={(e) => updateField('isNewProperty', e.target.checked)}
                        className="rounded border-border"
                      />
                      <Label htmlFor="isNewProperty" className="text-sm">
                        New Property (full depreciation available)
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Multi-Client Tax Summary */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Tax Impact by Client</h4>
                  <div className="space-y-3">
                    {clientTaxResults.map((result) => (
                      <div key={result.client.id} className="bg-muted/30 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{result.client.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {(result.ownershipPercentage * 100).toFixed(0)}% ownership
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Tax Without:</span>
                            <div className="font-medium">${result.taxWithoutProperty.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tax With:</span>
                            <div className="font-medium">${result.taxWithProperty.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tax Difference:</span>
                            <div className={`font-medium ${result.taxDifference < 0 ? 'text-success' : 'text-destructive'}`}>
                              ${result.taxDifference.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overall Tax Summary */}
                <div className="bg-primary/5 rounded-lg p-4 space-y-3">
                  <div className="font-medium text-sm">Combined Household Summary</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Household Income:</span>
                      <div className="font-medium">${totalTaxableIncome.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Highest Marginal Rate:</span>
                      <div className="font-medium">{(marginalTaxRate * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>

    {/* Confirmation Dialogs */}
    <FieldUpdateConfirmDialog
      open={!!pendingUpdate}
      onOpenChange={(open) => !open && setPendingUpdate(null)}
      onConfirm={handleConfirmUpdate}
      title={
        pendingUpdate?.confirmationType === 'construction'
          ? "Auto-split Construction Contract Value"
          : "Auto-update Construction Contract Value"
      }
      description={
        pendingUpdate?.confirmationType === 'construction'
          ? "This will automatically split the construction contract value into building and plant & equipment values."
          : "This will automatically update the construction contract value based on your building and equipment values."
      }
      details={
        pendingUpdate?.confirmationType === 'construction'
          ? [
              "Building Value: 90% of construction contract",
              "Plant & Equipment: 10% of construction contract",
              "You can manually adjust these values later"
            ]
          : [
              "Construction Contract = Building Value + Plant & Equipment Value",
              "This helps maintain accurate totals",
              "You can manually adjust the contract value if needed"
            ]
      }
    />
  </div>
  );
};