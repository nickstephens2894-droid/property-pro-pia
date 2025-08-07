import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, DollarSign, TrendingUp, Home } from "lucide-react";

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
}

const PropertyAnalysis = () => {
  const [propertyData, setPropertyData] = useState<PropertyData>({
    purchasePrice: 750000,
    weeklyRent: 650,
    deposit: 150000,
    loanAmount: 600000,
    interestRate: 6.5,
    loanTerm: 30,
    stampDuty: 35000,
    legalFees: 2500,
    inspectionFees: 800,
    propertyManagement: 8,
    councilRates: 2500,
    insurance: 1200,
    repairs: 2000,
  });

  const updateField = (field: keyof PropertyData, value: number) => {
    setPropertyData(prev => ({ ...prev, [field]: value }));
  };

  // Calculations
  const annualRent = propertyData.weeklyRent * 52;
  const weeklyMortgage = (propertyData.loanAmount * (propertyData.interestRate / 100 / 52) * Math.pow(1 + propertyData.interestRate / 100 / 52, propertyData.loanTerm * 52)) / (Math.pow(1 + propertyData.interestRate / 100 / 52, propertyData.loanTerm * 52) - 1);
  const annualMortgage = weeklyMortgage * 52;
  const annualPropertyManagement = annualRent * (propertyData.propertyManagement / 100);
  const totalAnnualCosts = annualMortgage + annualPropertyManagement + propertyData.councilRates + propertyData.insurance + propertyData.repairs;
  const annualCashFlow = annualRent - totalAnnualCosts;
  const weeklyCashFlow = annualCashFlow / 52;
  const grossYield = (annualRent / propertyData.purchasePrice) * 100;
  const netYield = (annualCashFlow / propertyData.purchasePrice) * 100;
  const totalUpfrontCosts = propertyData.deposit + propertyData.stampDuty + propertyData.legalFees + propertyData.inspectionFees;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Property Investment Analysis</h1>
          <p className="text-muted-foreground text-lg">Comprehensive analysis tool for Australian residential property investments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Property Details */}
          <Card className="lg:col-span-1 shadow-card">
            <CardHeader className="bg-gradient-to-r from-card to-accent border-b">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Home className="h-5 w-5" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={propertyData.purchasePrice}
                  onChange={(e) => updateField('purchasePrice', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="weeklyRent">Weekly Rent ($)</Label>
                <Input
                  id="weeklyRent"
                  type="number"
                  value={propertyData.weeklyRent}
                  onChange={(e) => updateField('weeklyRent', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="deposit">Deposit ($)</Label>
                <Input
                  id="deposit"
                  type="number"
                  value={propertyData.deposit}
                  onChange={(e) => updateField('deposit', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="loanAmount">Loan Amount ($)</Label>
                <Input
                  id="loanAmount"
                  type="number"
                  value={propertyData.loanAmount}
                  onChange={(e) => updateField('loanAmount', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  value={propertyData.interestRate}
                  onChange={(e) => updateField('interestRate', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="loanTerm">Loan Term (years)</Label>
                <Input
                  id="loanTerm"
                  type="number"
                  value={propertyData.loanTerm}
                  onChange={(e) => updateField('loanTerm', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Purchase Costs */}
          <Card className="lg:col-span-1 shadow-card">
            <CardHeader className="bg-gradient-to-r from-card to-accent border-b">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Calculator className="h-5 w-5" />
                Purchase Costs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="stampDuty">Stamp Duty ($)</Label>
                <Input
                  id="stampDuty"
                  type="number"
                  value={propertyData.stampDuty}
                  onChange={(e) => updateField('stampDuty', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="legalFees">Legal Fees ($)</Label>
                <Input
                  id="legalFees"
                  type="number"
                  value={propertyData.legalFees}
                  onChange={(e) => updateField('legalFees', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="inspectionFees">Building & Pest Inspection ($)</Label>
                <Input
                  id="inspectionFees"
                  type="number"
                  value={propertyData.inspectionFees}
                  onChange={(e) => updateField('inspectionFees', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">Annual Expenses</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="propertyManagement">Property Management (%)</Label>
                    <Input
                      id="propertyManagement"
                      type="number"
                      step="0.1"
                      value={propertyData.propertyManagement}
                      onChange={(e) => updateField('propertyManagement', Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="councilRates">Council Rates ($)</Label>
                    <Input
                      id="councilRates"
                      type="number"
                      value={propertyData.councilRates}
                      onChange={(e) => updateField('councilRates', Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="insurance">Insurance ($)</Label>
                    <Input
                      id="insurance"
                      type="number"
                      value={propertyData.insurance}
                      onChange={(e) => updateField('insurance', Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="repairs">Repairs & Maintenance ($)</Label>
                    <Input
                      id="repairs"
                      type="number"
                      value={propertyData.repairs}
                      onChange={(e) => updateField('repairs', Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card className="lg:col-span-1 shadow-card">
            <CardHeader className="bg-gradient-to-r from-card to-accent border-b">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <TrendingUp className="h-5 w-5" />
                Investment Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Key Metrics */}
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Weekly Cash Flow</span>
                    <span className={`text-xl font-bold ${weeklyCashFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ${weeklyCashFlow.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-success/10 to-success/5 rounded-lg border border-success/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Gross Yield</span>
                    <span className="text-xl font-bold text-success">
                      {grossYield.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-warning/10 to-warning/5 rounded-lg border border-warning/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Net Yield</span>
                    <span className={`text-xl font-bold ${netYield >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {netYield.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-semibold text-foreground">Financial Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annual Rent Income</span>
                    <span className="font-medium text-success">${annualRent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annual Mortgage</span>
                    <span className="font-medium text-destructive">-${annualMortgage.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Property Management</span>
                    <span className="font-medium text-destructive">-${annualPropertyManagement.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Other Expenses</span>
                    <span className="font-medium text-destructive">-${(propertyData.councilRates + propertyData.insurance + propertyData.repairs).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Annual Cash Flow</span>
                      <span className={annualCashFlow >= 0 ? 'text-success' : 'text-destructive'}>
                        ${annualCashFlow.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upfront Costs */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-semibold text-foreground">Upfront Investment</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deposit</span>
                    <span className="font-medium">${propertyData.deposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Purchase Costs</span>
                    <span className="font-medium">${(propertyData.stampDuty + propertyData.legalFees + propertyData.inspectionFees).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total Upfront</span>
                      <span className="text-primary">${totalUpfrontCosts.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cash Flow Analysis */}
        <Card className="mt-6 shadow-card">
          <CardHeader className="bg-gradient-to-r from-card to-accent border-b">
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <DollarSign className="h-5 w-5" />
              Cash Flow Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                <div className="text-3xl font-bold text-primary mb-2">${weeklyCashFlow.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Weekly Cash Flow</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {weeklyCashFlow >= 0 ? 'Positive' : 'Negative'} cash flow property
                </div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-success/10 to-success/5 rounded-lg border border-success/20">
                <div className="text-3xl font-bold text-success mb-2">{grossYield.toFixed(2)}%</div>
                <div className="text-sm text-muted-foreground">Gross Rental Yield</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Before expenses
                </div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-warning/10 to-warning/5 rounded-lg border border-warning/20">
                <div className={`text-3xl font-bold mb-2 ${netYield >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {netYield.toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">Net Rental Yield</div>
                <div className="text-xs text-muted-foreground mt-1">
                  After all expenses
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyAnalysis;