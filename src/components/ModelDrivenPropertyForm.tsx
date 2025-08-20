import { useState, useCallback, useEffect } from "react";
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
import { ValidationWarnings } from "@/components/ValidationWarnings";
import StampDutyCalculator from "@/components/StampDutyCalculator";
import { useFieldConfirmations } from "@/hooks/useFieldConfirmations";
import { usePropertyData, PropertyData } from "@/contexts/PropertyDataContext";
import { useClients, type Investor } from "@/hooks/useClients";
import { 
  validatePersonalProfile, 
  validatePropertyBasics, 
  validateFinancing, 
  validatePurchaseCosts, 
  validateAnnualExpenses,
  validateTaxOptimization
} from "@/utils/validationUtils";
import { Users, Home, Receipt, Calculator, Building2, Hammer, CreditCard, Clock, DollarSign, TrendingUp, Percent, X, Plus, AlertTriangle, Info, Search, Lock } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { formatFinancialValue } from "@/utils/calculationUtils";
import { PROPERTY_METHODS, type PropertyMethod } from "@/types/presets";
import { calculateStampDuty, type Jurisdiction } from "@/utils/stampDuty";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const JURISDICTIONS: Jurisdiction[] = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];

interface InvestorData {
  id: string;
  name: string;
  annualIncome: number;
  otherIncome: number;
  hasMedicareLevy: boolean;
}

interface OwnershipAllocation {
  investorId: string;
  ownershipPercentage: number;
}

interface InvestorTaxResult {
  investor: Investor;
  ownershipPercentage: number;
  taxWithoutProperty: number;
  taxWithProperty: number;
  taxDifference: number;
  marginalTaxRate: number;
  propertyTaxableIncome: number;
}

interface ModelDrivenPropertyFormProps {
  propertyData: PropertyData;
  updateField: (field: keyof PropertyData, value: any) => void;
  investorTaxResults: InvestorTaxResult[];
  totalTaxableIncome: number;
  marginalTaxRate: number;
  selectedModel: any;
}

// Fields that should be populated from the model (and thus disabled until model is selected)
const MODEL_DRIVEN_FIELDS = [
  // Property Basics
  'purchasePrice', 'propertyType', 'location', 'constructionYear', 'isConstructionProject',
  'landValue', 'constructionValue', 'constructionPeriod', 'constructionInterestRate',
  'buildingValue', 'plantEquipmentValue', 'weeklyRent', 'rentalGrowthRate', 'vacancyRate',
  
  // Transaction Costs
  'stampDuty', 'legalFees', 'inspectionFees', 'councilFees', 'architectFees', 'siteCosts',
  
  // Ongoing Expenses
  'propertyManagement', 'councilRates', 'insurance', 'repairs',
  
  // Depreciation
  'depreciationMethod', 'isNewProperty',
  
  // Property Method
  'currentPropertyMethod'
];

const PercentageInput = ({ 
  id, 
  value, 
  onChange, 
  step = "0.1",
  placeholder = "0",
  className = "",
  disabled = false
}: {
  id: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) => {
  const [displayValue, setDisplayValue] = useState<string>(value?.toFixed(1) || '');
  const [isFocused, setIsFocused] = useState(false);

  // Keep display value in sync with external prop updates when not actively editing
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value === 0 ? "" : value.toFixed(1));
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    // Remove formatting while editing and select all for easy replacement
    setDisplayValue(value === 0 ? "" : value.toString());
    setTimeout(() => {
      const input = document.getElementById(id) as HTMLInputElement;
      input?.select();
    }, 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Allow any input while typing - we'll validate and format on blur
    setDisplayValue(inputValue);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const raw = displayValue.trim();
    
    // Clean the input to only allow numbers and decimal points
    const cleanedInput = raw.replace(/[^\d.]/g, '');
    
    // Handle multiple decimal points by keeping only the first one
    const parts = cleanedInput.split('.');
    const validInput = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleanedInput;
    
    // Convert to number, defaulting to 0 if invalid
    const numericValue = validInput === "" || validInput === "." ? 0 : parseFloat(validInput);
    
    onChange(numericValue);
    // Re-apply formatting after editing (keep empty if user cleared)
    setDisplayValue(raw === "" ? "" : numericValue.toFixed(1));
  };

  return (
    <div className="relative">
      <Input
        id={id}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        step={step}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
        %
      </span>
    </div>
  );
};

const ModelDrivenPropertyForm = ({
  propertyData,
  updateField,
  investorTaxResults,
  totalTaxableIncome,
  marginalTaxRate,
  selectedModel
}: ModelDrivenPropertyFormProps) => {
  const { clients, addClient, removeClient, updateClient } = useClients();
  const { confirmFieldUpdate, isFieldConfirmed, clearFieldConfirmation } = useFieldConfirmations();
  const [dutyCalcOpen, setDutyCalcOpen] = useState(false);
  const [showInvestorDialog, setShowInvestorDialog] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<InvestorData | null>(null);

  const isFieldFromModel = (fieldName: string) => {
    return MODEL_DRIVEN_FIELDS.includes(fieldName);
  };

  const isFieldDisabled = (fieldName: string) => {
    return isFieldFromModel(fieldName) && !selectedModel;
  };

  const getFieldPrompt = (fieldName: string) => {
    if (isFieldFromModel(fieldName) && !selectedModel) {
      return "Select a model to populate this field";
    }
    return "";
  };

  const renderModelPrompt = (fieldName: string) => {
    if (isFieldFromModel(fieldName) && !selectedModel) {
      return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <Lock className="h-3 w-3" />
          <span>Select a model to populate this field</span>
        </div>
      );
    }
    return null;
  };

  // Rest of the component implementation would follow the same structure as PropertyInputForm
  // but with the disabled states and prompts applied to model-driven fields
  
  return (
    <div className="space-y-6">
      {/* Model Selection Alert */}
      {!selectedModel && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Model Required</AlertTitle>
          <AlertDescription>
            Please select a property model from the "Add from Model" section above to populate the form fields. 
            This ensures consistency and accuracy in your property analysis.
          </AlertDescription>
        </Alert>
      )}

      {/* Personal Profile Section */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="personal-profile" className="border-b">
          <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
            <div className="flex items-center gap-2 w-full">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-medium">Personal Profile</span>
              <div className="ml-auto">
                <AccordionCompletionIndicator status="complete" sectionKey="personal-profile" />
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            {/* Personal Profile content - these fields are NOT model-driven */}
            <div className="space-y-6">
              {/* Investors section - always editable */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Investors</h4>
                {/* Investor management UI */}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Property Basics Section */}
        <AccordionItem value="property-basics" className="border-b">
          <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
            <div className="flex items-center gap-2 w-full">
              <Home className="h-4 w-4 text-primary" />
              <span className="font-medium">Property Basics</span>
              <div className="ml-auto">
                <AccordionCompletionIndicator status="complete" sectionKey="property-basics" />
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6">
              {/* Property Type - Model Driven */}
              <div className="space-y-2">
                <Label htmlFor="propertyType" className="text-sm font-medium">Property Type</Label>
                <Select 
                  value={propertyData.propertyType} 
                  onValueChange={(value) => updateField('propertyType', value)}
                  disabled={isFieldDisabled('propertyType')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Townhouse">Townhouse</SelectItem>
                    <SelectItem value="Unit">Unit</SelectItem>
                    <SelectItem value="Land">Land</SelectItem>
                  </SelectContent>
                </Select>
                {renderModelPrompt('propertyType')}
              </div>

              {/* Purchase Price - Model Driven */}
              <div className="space-y-2">
                <Label htmlFor="purchasePrice" className="text-sm font-medium">Purchase Price</Label>
                <CurrencyInput
                  id="purchasePrice"
                  value={propertyData.purchasePrice}
                  onValueChange={(value) => updateField('purchasePrice', value)}
                  placeholder="Enter purchase price"
                  disabled={isFieldDisabled('purchasePrice')}
                />
                {renderModelPrompt('purchasePrice')}
              </div>

              {/* Location - Model Driven */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">Location (State)</Label>
                <Select 
                  value={propertyData.location} 
                  onValueChange={(value) => updateField('location', value)}
                  disabled={isFieldDisabled('location')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {JURISDICTIONS.map((jurisdiction) => (
                      <SelectItem key={jurisdiction} value={jurisdiction}>
                        {jurisdiction}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderModelPrompt('location')}
                <div className="text-[11px] text-muted-foreground">Used for stamp duty calculations</div>
              </div>

              {/* More property basics fields would follow the same pattern */}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Additional sections would follow the same pattern */}
      </Accordion>
    </div>
  );
};

export default ModelDrivenPropertyForm;
