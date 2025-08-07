import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Home, Receipt, Calculator, Building2, Hammer, CreditCard, Clock } from "lucide-react";

interface PropertyData {
  // Project Type
  isConstructionProject: boolean;
  
  // Basic Property Details
  purchasePrice: number;
  weeklyRent: number;
  
  // Construction-specific
  landValue: number;
  constructionValue: number;
  constructionPeriod: number;
  constructionInterestRate: number;
  
  // Traditional Financing
  deposit: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  lvr: number;
  
  // Equity Funding
  useEquityFunding: boolean;
  primaryPropertyValue: number;
  existingDebt: number;
  maxLVR: number;
  
  // Holding Costs During Construction
  holdingCostFunding: 'cash' | 'debt' | 'hybrid';
  holdingCostCashPercentage: number;
  
  // Purchase Costs
  stampDuty: number;
  legalFees: number;
  inspectionFees: number;
  
  // Construction Costs
  councilFees: number;
  architectFees: number;
  siteCosts: number;
  
  // Annual Expenses
  propertyManagement: number;
  councilRates: number;
  insurance: number;
  repairs: number;
  
  // Tax-related fields
  annualIncome: number;
  otherIncome: number;
  hasMedicareLevy: boolean;
  
  // Depreciation fields
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
  const [openSections, setOpenSections] = useState<string[]>(["project-type"]);

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
          {/* Project Type */}
          <AccordionItem value="project-type" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="font-medium">Project Type & Costs</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isConstructionProject"
                    checked={propertyData.isConstructionProject}
                    onChange={(e) => updateField('isConstructionProject', e.target.checked)}
                    className="rounded border-border"
                  />
                  <Label htmlFor="isConstructionProject" className="text-sm font-medium">
                    Construction/Development Project
                  </Label>
                </div>

                {propertyData.isConstructionProject ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="landValue" className="text-sm font-medium">Land Value</Label>
                        <CurrencyInput
                          id="landValue"
                          value={propertyData.landValue}
                          onChange={(value) => updateField('landValue', value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="constructionValue" className="text-sm font-medium">Construction Contract Value</Label>
                        <CurrencyInput
                          id="constructionValue"
                          value={propertyData.constructionValue}
                          onChange={(value) => updateField('constructionValue', value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="constructionPeriod" className="text-sm font-medium">Construction Period (months)</Label>
                        <Input
                          id="constructionPeriod"
                          type="number"
                          value={propertyData.constructionPeriod}
                          onChange={(e) => updateField('constructionPeriod', Number(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="constructionInterestRate" className="text-sm font-medium">Construction Interest Rate</Label>
                        <PercentageInput
                          id="constructionInterestRate"
                          value={propertyData.constructionInterestRate}
                          onChange={(value) => updateField('constructionInterestRate', value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-3">Development Costs</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="councilFees" className="text-sm font-medium">Council Fees & Approvals</Label>
                          <CurrencyInput
                            id="councilFees"
                            value={propertyData.councilFees}
                            onChange={(value) => updateField('councilFees', value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="architectFees" className="text-sm font-medium">Architect/Design Fees</Label>
                          <CurrencyInput
                            id="architectFees"
                            value={propertyData.architectFees}
                            onChange={(value) => updateField('architectFees', value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="siteCosts" className="text-sm font-medium">Site Costs & Utilities</Label>
                          <CurrencyInput
                            id="siteCosts"
                            value={propertyData.siteCosts}
                            onChange={(value) => updateField('siteCosts', value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="purchasePrice" className="text-sm font-medium">Purchase Price</Label>
                    <CurrencyInput
                      id="purchasePrice"
                      value={propertyData.purchasePrice}
                      onChange={(value) => updateField('purchasePrice', value)}
                      className="mt-1"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="weeklyRent" className="text-sm font-medium">Expected Weekly Rent</Label>
                  <CurrencyInput
                    id="weeklyRent"
                    value={propertyData.weeklyRent}
                    onChange={(value) => updateField('weeklyRent', value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Funding Strategy */}
          <AccordionItem value="funding-strategy" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="font-medium">Funding Strategy</span>
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

                {propertyData.useEquityFunding ? (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Equity Property Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primaryPropertyValue" className="text-sm font-medium">Primary Property Value</Label>
                        <CurrencyInput
                          id="primaryPropertyValue"
                          value={propertyData.primaryPropertyValue}
                          onChange={(value) => updateField('primaryPropertyValue', value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="existingDebt" className="text-sm font-medium">Existing Debt</Label>
                        <CurrencyInput
                          id="existingDebt"
                          value={propertyData.existingDebt}
                          onChange={(value) => updateField('existingDebt', value)}
                          className="mt-1"
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
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Traditional Financing</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="lvr" className="text-sm font-medium">Loan to Value Ratio (LVR)</Label>
                        <PercentageInput
                          id="lvr"
                          value={propertyData.lvr}
                          onChange={(value) => updateField('lvr', value)}
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
                  </div>
                )}

                {propertyData.isConstructionProject && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Construction Holding Costs Funding</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="holdingCostCash"
                          name="holdingCostFunding"
                          checked={propertyData.holdingCostFunding === 'cash'}
                          onChange={() => updateField('holdingCostFunding', 'cash')}
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
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Purchase Costs */}
          <AccordionItem value="purchase-costs" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                <span className="font-medium">Purchase Costs & Annual Expenses</span>
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