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

interface InvestorTaxResult {
  investor: {
    id: string;
    name: string;
    annualIncome: number;
    otherIncome: number;
    hasMedicareLevy: boolean;
  };
  ownershipPercentage: number;
  taxWithoutProperty: number;
  taxWithProperty: number;
  taxDifference: number;
  marginalTaxRate: number;
  propertyTaxableIncome: number;
}

interface LoanPaymentDetails {
  ioPayment: number;
  piPayment: number;
  ioTermYears: number;
  remainingTerm: number;
  totalInterest: number;
  currentPayment: number;
  futurePayment: number;
}

interface PropertyCalculationDetailsProps {
  monthlyRepayment: number;
  annualRepayment: number;
  annualRent: number;
  propertyManagementCost: number;
  councilRates: number;
  insurance: number;
  repairs: number;
  totalDeductibleExpenses: number;
  cashDeductionsSubtotal: number;
  paperDeductionsSubtotal: number;
  depreciation: DepreciationDetails;
  investorTaxResults: InvestorTaxResult[];
  totalTaxWithProperty: number;
  totalTaxWithoutProperty: number;
  marginalTaxRate: number;
  purchasePrice: number;
  constructionYear: number;
  depreciationMethod: 'prime-cost' | 'diminishing-value';
  // Enhanced construction details
  isConstructionProject: boolean;
  totalProjectCost: number;
  holdingCosts: {
    landInterest: number;
    constructionInterest: number;
    total: number;
  };
  funding: {
    totalRequired: number;
    equityUsed: number;
    cashRequired: number;
    availableEquity: number;
    loanAmount: number;
  };
  outOfPocketHoldingCosts: number;
  capitalizedHoldingCosts: number;
  actualCashInvested: number;
  constructionPeriod: number;
  holdingCostFunding: 'cash' | 'debt' | 'hybrid';
  // Enhanced loan payment details
  mainLoanPayments: LoanPaymentDetails;
  equityLoanPayments: LoanPaymentDetails | null;
  totalAnnualInterest: number;
  taxRefundOrLiability: number;
  netOfTaxCostIncome: number;
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
  cashDeductionsSubtotal,
  paperDeductionsSubtotal,
  depreciation,
  investorTaxResults,
  totalTaxWithProperty,
  totalTaxWithoutProperty,
  marginalTaxRate,
  purchasePrice,
  constructionYear,
  depreciationMethod,
  isConstructionProject,
  totalProjectCost,
  holdingCosts,
  funding,
  outOfPocketHoldingCosts,
  capitalizedHoldingCosts,
  actualCashInvested,
  constructionPeriod,
  holdingCostFunding,
  mainLoanPayments,
  equityLoanPayments,
  totalAnnualInterest,
  taxRefundOrLiability,
  netOfTaxCostIncome
}: PropertyCalculationDetailsProps) => {

  const currentYear = new Date().getFullYear();
  const propertyAge = currentYear - constructionYear;

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <Accordion type="multiple" className="w-full">
          
          {/* Project Costs & Funding (for construction projects) */}
          {isConstructionProject && (
            <AccordionItem value="project-costs" className="border-b">
              <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="font-medium">Project Costs & Funding Analysis</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-sm mb-3">Total Project Cost Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1">
                        <span>Total Project Cost:</span>
                        <span className="font-medium">${totalProjectCost.toLocaleString()}</span>
                      </div>
                      <div className="ml-4 space-y-1 text-muted-foreground">
                        <div className="flex justify-between py-1">
                          <span>• Land & Construction Interest:</span>
                          <span>${holdingCosts.total.toLocaleString()}</span>
                        </div>
                        <div className="ml-4 space-y-1">
                          <div className="flex justify-between">
                            <span>- Land Interest ({constructionPeriod} months):</span>
                            <span>${holdingCosts.landInterest.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>- Construction Interest:</span>
                            <span>${holdingCosts.constructionInterest.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-3">Funding Structure</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1">
                        <span>Total Funding Required:</span>
                        <span className="font-medium">${funding.totalRequired.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Loan Amount:</span>
                        <span className="font-medium">${funding.loanAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Cash Required:</span>
                        <span className="font-medium">${funding.cashRequired.toLocaleString()}</span>
                      </div>
                      {funding.equityUsed > 0 && (
                        <div className="flex justify-between py-1">
                          <span>Equity Used:</span>
                          <span className="font-medium">${funding.equityUsed.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-3">Holding Costs During Construction</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1">
                        <span>Funding Method:</span>
                        <span className="font-medium capitalize">{holdingCostFunding}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Out-of-Pocket Holding Costs:</span>
                        <span className="font-medium">${outOfPocketHoldingCosts.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Capitalized Holding Costs:</span>
                        <span className="font-medium">${capitalizedHoldingCosts.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1 border-t pt-2 mt-3">
                        <span className="font-medium">Actual Cash Invested:</span>
                        <span className="font-bold">${actualCashInvested.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Enhanced Loan Calculations */}
          <AccordionItem value="loan-calculations" className="border-b">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                <span className="font-medium">Loan & Repayment Calculations</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Overall Payment Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">Monthly Repayment (Total)</div>
                    <div className="text-2xl font-bold text-destructive">${monthlyRepayment.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground mt-1">All loan payments combined</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">Annual Interest (Deductible)</div>
                    <div className="text-2xl font-bold text-success">${totalAnnualInterest.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground mt-1">Tax-deductible portion</div>
                  </div>
                </div>

                {/* Main Loan Details */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Main Loan Payment Breakdown</h4>
                  <div className="bg-muted/20 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Loan Amount:</span>
                      <span className="font-medium">${funding.loanAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Current Payment Type:</span>
                      <span className="font-medium capitalize">
                        {mainLoanPayments.ioTermYears > 0 ? 'Interest Only' : 'Principal & Interest'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Current Monthly Payment:</span>
                      <span className="font-bold text-destructive">${mainLoanPayments.currentPayment.toFixed(2)}</span>
                    </div>
                    
                    {mainLoanPayments.ioTermYears > 0 && (
                      <div className="border-t pt-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">IO Period Remaining:</span>
                          <span className="font-medium">{mainLoanPayments.ioTermYears} years</span>
                        </div>
                        {mainLoanPayments.futurePayment > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Future P&I Payment:</span>
                            <span className="font-bold text-warning">${mainLoanPayments.futurePayment.toFixed(2)}/month</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Equity Loan Details */}
                {equityLoanPayments && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Equity Loan Payment Breakdown</h4>
                    <div className="bg-muted/20 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Equity Loan Amount:</span>
                        <span className="font-medium">${funding.equityUsed.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Current Payment Type:</span>
                        <span className="font-medium capitalize">
                          {equityLoanPayments.ioTermYears > 0 ? 'Interest Only' : 'Principal & Interest'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Current Monthly Payment:</span>
                        <span className="font-bold text-destructive">${equityLoanPayments.currentPayment.toFixed(2)}</span>
                      </div>
                      
                      {equityLoanPayments.ioTermYears > 0 && equityLoanPayments.futurePayment > 0 && (
                        <div className="border-t pt-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">IO Period Remaining:</span>
                            <span className="font-medium">{equityLoanPayments.ioTermYears} years</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Future P&I Payment:</span>
                            <span className="font-bold text-warning">${equityLoanPayments.futurePayment.toFixed(2)}/month</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg">
                  <p><strong>Important:</strong> Only the interest portion of loan repayments is tax-deductible for investment properties. 
                  Interest-only payments provide maximum immediate tax benefits but result in higher total interest costs over the loan life.</p>
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
                  <h4 className="font-medium text-sm mb-3 text-success">Income</h4>
                  <div className="p-4 bg-success/5 border border-success/20 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Annual Rental Income</span>
                      <span className="font-bold text-success">${annualRent.toLocaleString()}</span>
                    </div>
                    {taxRefundOrLiability < 0 && (
                      <div className="flex justify-between items-center border-t border-success/30 pt-2">
                        <span className="text-sm">Tax Refund</span>
                        <span className="font-bold text-success">${Math.abs(taxRefundOrLiability).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expenses Section */}
                <div>
                  <h4 className="font-medium text-sm mb-3 text-destructive">Tax-Deductible Expenses</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="text-sm">Loan Interest (Total)</span>
                      <span className="text-destructive">${totalAnnualInterest.toLocaleString()}</span>
                    </div>
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
                     {taxRefundOrLiability > 0 && (
                       <div className="flex justify-between items-center py-2 border-b border-border/30">
                         <span className="text-sm">Additional Tax Liability</span>
                         <span className="text-destructive">${taxRefundOrLiability.toLocaleString()}</span>
                       </div>
                     )}
                     
                     {/* Subtotals */}
                    <div className="flex justify-between items-center py-2 border-t border-border/50 bg-muted/20 px-3 rounded-lg mt-2">
                      <span className="text-sm font-medium">Cash Deductions Subtotal</span>
                      <span className="font-semibold text-destructive">${cashDeductionsSubtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 bg-muted/20 px-3 rounded-lg">
                      <span className="text-sm font-medium">Paper Deductions Subtotal</span>
                      <span className="font-semibold text-destructive">${paperDeductionsSubtotal.toLocaleString()}</span>
                    </div>
                    
                     <div className="flex justify-between items-center py-3 bg-destructive/5 px-3 rounded-lg border-t-2 border-destructive/20 mt-2">
                       <span className="font-medium">Total Deductible Expenses</span>
                       <span className="font-bold text-destructive">${totalDeductibleExpenses.toLocaleString()}</span>
                     </div>
                   </div>
                 </div>

                 {/* Net Position Section */}
                 <div>
                   <h4 className="font-medium text-sm mb-3">Net Annual Cash Position (after tax)</h4>
                   <div className={`p-4 rounded-lg border-2 ${
                     netOfTaxCostIncome >= 0 
                       ? 'bg-success/5 border-success/20' 
                       : 'bg-destructive/5 border-destructive/20'
                   }`}>
                     <div className="flex justify-between items-center">
                       <span className="text-sm font-medium">
                         {netOfTaxCostIncome >= 0 ? 'Net Annual Income' : 'Net Annual Cost'}
                       </span>
                       <span className={`text-xl font-bold ${
                         netOfTaxCostIncome >= 0 ? 'text-success' : 'text-destructive'
                       }`}>
                         ${Math.abs(netOfTaxCostIncome).toLocaleString()}
                       </span>
                     </div>
                     <div className="text-xs text-muted-foreground mt-1">
                       Rental income {taxRefundOrLiability < 0 ? '+ tax refund' : taxRefundOrLiability > 0 ? '- additional tax' : ''} - cash expenses
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
                    <div className="text-sm text-muted-foreground">Total Tax Without Property</div>
                    <div className="text-xl font-bold">${totalTaxWithoutProperty.toLocaleString()}</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Tax With Property</div>
                    <div className="text-xl font-bold">${totalTaxWithProperty.toLocaleString()}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Multi-Investor Tax Summary</h4>
                  {investorTaxResults.map((result) => (
                    <div key={result.investor.id} className="bg-muted/20 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">{result.investor.name}</span>
                        <span className="text-xs">{(result.ownershipPercentage * 100).toFixed(0)}% ownership</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>Tax: ${result.taxDifference.toLocaleString()}</div>
                        <div>Rate: {(result.marginalTaxRate * 100).toFixed(0)}%</div>
                        <div>Income: ${result.propertyTaxableIncome.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
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