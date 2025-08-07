import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Home, Receipt, Calculator, Building2, ChevronDown } from "lucide-react";

interface PropertyData {
  purchasePrice: number;
  weeklyRent: number;
  deposit: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  stampDuty: number;
  legalFees: number;
  inspectionFees: number;
  propertyManagement: number;
  councilRates: number;
  insurance: number;
  repairs: number;
  annualIncome: number;
  otherIncome: number;
  hasMedicareLevy: boolean;
  constructionYear: number;
  buildingValue: number;
  plantEquipmentValue: number;
  depreciationMethod: 'prime-cost' | 'diminishing-value';
  isNewProperty: boolean;
}

interface PropertyInputFormProps {
  propertyData: PropertyData;
  updateField: (field: keyof PropertyData, value: number | boolean | string) => void;
  totalTaxableIncome: number;
  marginalTaxRate: number;
  taxWithoutProperty: number;
}

const CurrencyInput = ({ 
  id, 
  value, 
  onChange, 
  placeholder = "0",
  className = ""
}: {
  id: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
    <Input
      id={id}
      type="number"
      value={value || ''}
      onChange={(e) => onChange(Number(e.target.value))}
      placeholder={placeholder}
      className={`pl-8 ${className}`}
    />
  </div>
);

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
}) => (
  <div className="relative">
    <Input
      id={id}
      type="number"
      step={step}
      value={value || ''}
      onChange={(e) => onChange(Number(e.target.value))}
      placeholder={placeholder}
      className={`pr-8 ${className}`}
    />
    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
  </div>
);

export const PropertyInputForm = ({ 
  propertyData, 
  updateField, 
  totalTaxableIncome, 
  marginalTaxRate, 
  taxWithoutProperty 
}: PropertyInputFormProps) => {
  const [openSections, setOpenSections] = useState<string[]>(["property-basics"]);

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-card to-accent border-b">
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Home className="h-5 w-5" />
          Property Investment Details
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Accordion 
          type="multiple" 
          value={openSections} 
          onValueChange={setOpenSections}
          className="w-full"
        >
          {/* Property Basics */}
          <AccordionItem value="property-basics" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" />
                <span className="font-medium">Property Basics</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchasePrice" className="text-sm font-medium">Purchase Price</Label>
                  <CurrencyInput
                    id="purchasePrice"
                    value={propertyData.purchasePrice}
                    onChange={(value) => updateField('purchasePrice', value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="weeklyRent" className="text-sm font-medium">Weekly Rent</Label>
                  <CurrencyInput
                    id="weeklyRent"
                    value={propertyData.weeklyRent}
                    onChange={(value) => updateField('weeklyRent', value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="deposit" className="text-sm font-medium">Deposit</Label>
                  <CurrencyInput
                    id="deposit"
                    value={propertyData.deposit}
                    onChange={(value) => updateField('deposit', value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="loanAmount" className="text-sm font-medium">Loan Amount</Label>
                  <CurrencyInput
                    id="loanAmount"
                    value={propertyData.loanAmount}
                    onChange={(value) => updateField('loanAmount', value)}
                    className="mt-1"
                  />
                </div>
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
                  <Input
                    id="loanTerm"
                    type="number"
                    value={propertyData.loanTerm}
                    onChange={(e) => updateField('loanTerm', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Purchase Costs */}
          <AccordionItem value="purchase-costs" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                <span className="font-medium">Purchase Costs & Expenses</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-sm mb-3">One-time Purchase Costs</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stampDuty" className="text-sm font-medium">Stamp Duty</Label>
                      <CurrencyInput
                        id="stampDuty"
                        value={propertyData.stampDuty}
                        onChange={(value) => updateField('stampDuty', value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="legalFees" className="text-sm font-medium">Legal Fees</Label>
                      <CurrencyInput
                        id="legalFees"
                        value={propertyData.legalFees}
                        onChange={(value) => updateField('legalFees', value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="inspectionFees" className="text-sm font-medium">Building & Pest Inspection</Label>
                      <CurrencyInput
                        id="inspectionFees"
                        value={propertyData.inspectionFees}
                        onChange={(value) => updateField('inspectionFees', value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-3">Annual Expenses</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="propertyManagement" className="text-sm font-medium">Property Management</Label>
                      <PercentageInput
                        id="propertyManagement"
                        value={propertyData.propertyManagement}
                        onChange={(value) => updateField('propertyManagement', value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="councilRates" className="text-sm font-medium">Council Rates</Label>
                      <CurrencyInput
                        id="councilRates"
                        value={propertyData.councilRates}
                        onChange={(value) => updateField('councilRates', value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="insurance" className="text-sm font-medium">Insurance</Label>
                      <CurrencyInput
                        id="insurance"
                        value={propertyData.insurance}
                        onChange={(value) => updateField('insurance', value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="repairs" className="text-sm font-medium">Repairs & Maintenance</Label>
                      <CurrencyInput
                        id="repairs"
                        value={propertyData.repairs}
                        onChange={(value) => updateField('repairs', value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Income & Tax */}
          <AccordionItem value="income-tax" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                <span className="font-medium">Income & Tax Details</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="annualIncome" className="text-sm font-medium">Annual Salary/Wage</Label>
                    <CurrencyInput
                      id="annualIncome"
                      value={propertyData.annualIncome}
                      onChange={(value) => updateField('annualIncome', value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="otherIncome" className="text-sm font-medium">Other Investment Income</Label>
                    <CurrencyInput
                      id="otherIncome"
                      value={propertyData.otherIncome}
                      onChange={(value) => updateField('otherIncome', value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="medicareLevy"
                    checked={propertyData.hasMedicareLevy}
                    onChange={(e) => updateField('hasMedicareLevy', e.target.checked)}
                    className="rounded border-border"
                  />
                  <Label htmlFor="medicareLevy" className="text-sm">
                    Subject to Medicare Levy (2%)
                  </Label>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border">
                  <h4 className="font-medium text-sm mb-3">Tax Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Taxable Income:</span>
                      <span className="font-medium">${totalTaxableIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Marginal Tax Rate:</span>
                      <span className="font-medium">{(marginalTaxRate * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual Tax (without property):</span>
                      <span className="font-medium">${taxWithoutProperty.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Depreciation */}
          <AccordionItem value="depreciation" className="border-b-0">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="font-medium">Depreciation Schedule</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="constructionYear" className="text-sm font-medium">Construction Year</Label>
                    <Input
                      id="constructionYear"
                      type="number"
                      value={propertyData.constructionYear}
                      onChange={(e) => updateField('constructionYear', Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="buildingValue" className="text-sm font-medium">Building Value (excl. land)</Label>
                    <CurrencyInput
                      id="buildingValue"
                      value={propertyData.buildingValue}
                      onChange={(value) => updateField('buildingValue', value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="plantEquipmentValue" className="text-sm font-medium">Plant & Equipment Value</Label>
                    <CurrencyInput
                      id="plantEquipmentValue"
                      value={propertyData.plantEquipmentValue}
                      onChange={(value) => updateField('plantEquipmentValue', value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="depreciationMethod" className="text-sm font-medium">Depreciation Method</Label>
                    <Select
                      value={propertyData.depreciationMethod}
                      onValueChange={(value) => updateField('depreciationMethod', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prime-cost">Prime Cost (Straight-line)</SelectItem>
                        <SelectItem value="diminishing-value">Diminishing Value</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isNewProperty"
                    checked={propertyData.isNewProperty}
                    onChange={(e) => updateField('isNewProperty', e.target.checked)}
                    className="rounded border-border"
                  />
                  <Label htmlFor="isNewProperty" className="text-sm">
                    New property (full plant & equipment depreciation available)
                  </Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};