import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calculator, Building2, TrendingDown, AlertCircle, Receipt } from "lucide-react";

interface DepreciationDetails {
  capitalWorks: number;
  plantEquipment: number;
  total: number;
  capitalWorksAvailable: boolean;
  plantEquipmentRestricted: boolean;
}

interface PropertyCalculationDetailsProps {
  // Loan calculations
  monthlyRepayment: number;
  annualRepayment: number;
  
  // Income calculations
  annualRent: number;
  propertyManagementCost: number;
  
  // Expense breakdown
  councilRates: number;
  insurance: number;
  repairs: number;
  totalDeductibleExpenses: number;
  
  // Depreciation
  depreciation: DepreciationDetails;
  
  // Tax calculations
  propertyTaxableIncome: number;
  taxWithProperty: number;
  taxWithoutProperty: number;
  marginalTaxRate: number;
  
  // Property data for CGT
  purchasePrice: number;
  constructionYear: number;
  depreciationMethod: string;
}

export const PropertyCalculationDetails = ({
  monthlyRepayment,
  annualRepayment,
  annualRent,
  propertyManagementCost,
  councilRates,
  insurance,
  repairs,
  totalDeductibleExpenses,
  depreciation,
  propertyTaxableIncome,
  taxWithProperty,
  taxWithoutProperty,
  marginalTaxRate,
  purchasePrice,
  constructionYear,
  depreciationMethod
}: PropertyCalculationDetailsProps) => {

  const currentYear = new Date().getFullYear();
  const propertyAge = currentYear - constructionYear;

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-card to-accent border-b">
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Calculator className="h-5 w-5" />
          Detailed Calculations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Accordion type="multiple" className="w-full">
          
          {/* Loan Calculations */}
          <AccordionItem value="loan-calculations" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                <span className="font-medium">Loan & Repayment Calculations</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">Monthly Repayment</div>
                    <div className="text-2xl font-bold text-destructive">${monthlyRepayment.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground mt-1">Principal + Interest</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">Annual Repayment</div>
                    <div className="text-2xl font-bold text-destructive">${annualRepayment.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground mt-1">Total loan servicing cost</div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <p><strong>Note:</strong> Only the interest portion of loan repayments is tax-deductible for investment properties.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Income & Expense Breakdown */}
          <AccordionItem value="income-expenses" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-primary" />
                <span className="font-medium">Income & Expense Breakdown</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Income Section */}
                <div>
                  <h4 className="font-medium text-sm mb-3 text-success">Rental Income</h4>
                  <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Annual Rental Income</span>
                      <span className="font-bold text-success">${annualRent.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Expenses Section */}
                <div>
                  <h4 className="font-medium text-sm mb-3 text-destructive">Tax-Deductible Expenses</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="text-sm">Property Management</span>
                      <span className="text-destructive">${propertyManagementCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="text-sm">Council Rates</span>
                      <span className="text-destructive">${councilRates.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="text-sm">Insurance</span>
                      <span className="text-destructive">${insurance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="text-sm">Repairs & Maintenance</span>
                      <span className="text-destructive">${repairs.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="text-sm">Depreciation (Total)</span>
                      <span className="text-destructive">${depreciation.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-destructive/5 px-3 rounded-lg border-t-2 border-destructive/20">
                      <span className="font-medium">Total Deductible Expenses</span>
                      <span className="font-bold text-destructive">${totalDeductibleExpenses.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Depreciation Analysis */}
          <AccordionItem value="depreciation-analysis" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="font-medium">Depreciation Analysis</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg border ${
                    depreciation.capitalWorksAvailable 
                      ? 'bg-success/5 border-success/20' 
                      : 'bg-muted/30 border-border'
                  }`}>
                    <div className="text-sm text-muted-foreground">Capital Works (Div 43)</div>
                    <div className={`text-xl font-bold ${
                      depreciation.capitalWorksAvailable ? 'text-success' : 'text-muted-foreground'
                    }`}>
                      ${depreciation.capitalWorks.toLocaleString()}
                    </div>
                    <div className="text-xs mt-1">
                      {depreciation.capitalWorksAvailable 
                        ? '2.5% per annum' 
                        : 'Not available (pre-1987)'
                      }
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg border ${
                    !depreciation.plantEquipmentRestricted 
                      ? 'bg-success/5 border-success/20' 
                      : 'bg-warning/5 border-warning/20'
                  }`}>
                    <div className="text-sm text-muted-foreground">Plant & Equipment (Div 40)</div>
                    <div className={`text-xl font-bold ${
                      !depreciation.plantEquipmentRestricted ? 'text-success' : 'text-warning'
                    }`}>
                      ${depreciation.plantEquipment.toLocaleString()}
                    </div>
                    <div className="text-xs mt-1">
                      {depreciation.plantEquipmentRestricted 
                        ? 'Restricted (established property)' 
                        : `${depreciationMethod === 'prime-cost' ? 'Prime Cost' : 'Diminishing Value'} method`
                      }
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Annual Depreciation</span>
                    <span className="text-xl font-bold text-primary">${depreciation.total.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Tax savings: ${(depreciation.total * marginalTaxRate).toLocaleString()} per year
                  </div>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <p><strong>Property Age:</strong> {propertyAge} years (built in {constructionYear})</p>
                  {!depreciation.capitalWorksAvailable && (
                    <p className="text-warning">⚠️ Capital works depreciation only available for buildings constructed after 15 September 1987</p>
                  )}
                  {depreciation.plantEquipmentRestricted && (
                    <p className="text-warning">⚠️ Plant & equipment depreciation restricted for established properties purchased after May 2017</p>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Tax Impact Analysis */}
          <AccordionItem value="tax-analysis" className="border-b-0">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                <span className="font-medium">Tax Impact Analysis</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">Tax Without Property</div>
                    <div className="text-xl font-bold">${taxWithoutProperty.toLocaleString()}</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">Tax With Property</div>
                    <div className="text-xl font-bold">${taxWithProperty.toLocaleString()}</div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${
                  propertyTaxableIncome < 0 
                    ? 'bg-success/5 border-success/20' 
                    : 'bg-warning/5 border-warning/20'
                }`}>
                  <div className="text-sm text-muted-foreground">Property Taxable Income</div>
                  <div className={`text-2xl font-bold ${
                    propertyTaxableIncome < 0 ? 'text-success' : 'text-warning'
                  }`}>
                    ${propertyTaxableIncome.toLocaleString()}
                  </div>
                  <div className="text-xs mt-1">
                    {propertyTaxableIncome < 0 ? 'Negative gearing benefit' : 'Positive taxable income'}
                  </div>
                </div>

                {/* CGT Impact */}
                <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                  <h4 className="font-medium text-sm mb-3">Capital Gains Tax Impact</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Original Cost Base:</span>
                      <span className="font-medium">${purchasePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual Depreciation Claimed:</span>
                      <span className="font-medium text-warning">-${depreciation.total.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-medium">
                        <span>Adjusted Cost Base (Year 1):</span>
                        <span>${(purchasePrice - depreciation.total).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Depreciation reduces your cost base for CGT calculation at sale
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mx-6 mb-6 p-4 bg-muted/30 rounded-lg border border-muted">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Professional Advice Recommended:</p>
              <p>These calculations are estimates based on current tax laws and general assumptions. 
              For accurate depreciation schedules and tax advice, consult a qualified quantity surveyor 
              and tax professional.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};