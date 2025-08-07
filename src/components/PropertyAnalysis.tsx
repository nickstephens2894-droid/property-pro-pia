import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, DollarSign, TrendingUp, Home, Receipt, AlertCircle, Building2 } from "lucide-react";

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
    // Tax defaults
    annualIncome: 85000,
    otherIncome: 0,
    hasMedicareLevy: true,
    // Depreciation defaults
    constructionYear: 2020,
    buildingValue: 600000,
    plantEquipmentValue: 35000,
    depreciationMethod: 'prime-cost',
    isNewProperty: true,
  });

  const updateField = (field: keyof PropertyData, value: number | boolean | string) => {
    setPropertyData(prev => ({ ...prev, [field]: value }));
  };

  // Tax calculations
  const calculateTax = (income: number) => {
    let tax = 0;
    let remainingIncome = income;
    
    // 2024-25 Australian tax brackets
    const brackets = [
      { min: 0, max: 18200, rate: 0 },
      { min: 18201, max: 45000, rate: 0.16 },
      { min: 45001, max: 135000, rate: 0.30 },
      { min: 135001, max: 190000, rate: 0.37 },
      { min: 190001, max: Infinity, rate: 0.45 }
    ];

    for (const bracket of brackets) {
      if (remainingIncome <= 0) break;
      
      const taxableInThisBracket = Math.min(remainingIncome, bracket.max - bracket.min + 1);
      if (income > bracket.min) {
        const actualTaxable = Math.min(taxableInThisBracket, Math.max(0, income - bracket.min));
        tax += actualTaxable * bracket.rate;
        remainingIncome -= actualTaxable;
      }
    }

    // Medicare levy (2% for income above $29,207)
    if (propertyData.hasMedicareLevy && income > 29207) {
      tax += income * 0.02;
    }

    return tax;
  };

  const getMarginalTaxRate = (income: number) => {
    if (income <= 18200) return 0;
    if (income <= 45000) return 0.16;
    if (income <= 135000) return 0.30;
    if (income <= 190000) return 0.37;
    return 0.45;
  };

  // Depreciation calculations
  const calculateDepreciation = () => {
    const currentYear = new Date().getFullYear();
    const propertyAge = currentYear - propertyData.constructionYear;
    
    // Division 43 - Capital Works Depreciation (2.5% per annum)
    let capitalWorksDepreciation = 0;
    if (propertyData.constructionYear >= 1987) { // Must be built after 15 Sep 1987
      capitalWorksDepreciation = propertyData.buildingValue * 0.025;
    }
    
    // Division 40 - Plant & Equipment Depreciation
    const plantEquipmentItems = [
      { name: 'Air Conditioning', value: propertyData.plantEquipmentValue * 0.25, effectiveLife: 15 },
      { name: 'Kitchen Appliances', value: propertyData.plantEquipmentValue * 0.20, effectiveLife: 8 },
      { name: 'Carpets & Flooring', value: propertyData.plantEquipmentValue * 0.15, effectiveLife: 10 },
      { name: 'Hot Water System', value: propertyData.plantEquipmentValue * 0.15, effectiveLife: 12 },
      { name: 'Window Furnishings', value: propertyData.plantEquipmentValue * 0.10, effectiveLife: 10 },
      { name: 'Other Equipment', value: propertyData.plantEquipmentValue * 0.15, effectiveLife: 10 },
    ];
    
    let totalPlantEquipmentDepreciation = 0;
    
    plantEquipmentItems.forEach(item => {
      if (propertyData.depreciationMethod === 'prime-cost') {
        // Prime Cost Method (Straight Line)
        totalPlantEquipmentDepreciation += item.value / item.effectiveLife;
      } else {
        // Diminishing Value Method
        const rate = (1 / item.effectiveLife) * 1.5; // 150% of prime cost rate
        totalPlantEquipmentDepreciation += item.value * rate;
      }
    });
    
    // For established properties post-May 2017, only new plant & equipment can be claimed
    if (!propertyData.isNewProperty && propertyAge > 0) {
      totalPlantEquipmentDepreciation *= 0.3; // Reduce by 70% for established properties
    }
    
    return {
      capitalWorks: capitalWorksDepreciation,
      plantEquipment: totalPlantEquipmentDepreciation,
      total: capitalWorksDepreciation + totalPlantEquipmentDepreciation,
      items: plantEquipmentItems
    };
  };

  const depreciation = calculateDepreciation();

  // Property calculations
  const annualRent = propertyData.weeklyRent * 52;
  const weeklyMortgage = (propertyData.loanAmount * (propertyData.interestRate / 100 / 52) * Math.pow(1 + propertyData.interestRate / 100 / 52, propertyData.loanTerm * 52)) / (Math.pow(1 + propertyData.interestRate / 100 / 52, propertyData.loanTerm * 52) - 1);
  const annualMortgage = weeklyMortgage * 52;
  const annualPropertyManagement = annualRent * (propertyData.propertyManagement / 100);
  
  // Tax-deductible expenses (including depreciation)
  const annualInterest = propertyData.loanAmount * (propertyData.interestRate / 100); // Simplified interest calculation
  const totalDeductibleExpenses = annualInterest + annualPropertyManagement + propertyData.councilRates + propertyData.insurance + propertyData.repairs + depreciation.total;
  
  const totalAnnualCosts = annualMortgage + annualPropertyManagement + propertyData.councilRates + propertyData.insurance + propertyData.repairs;
  const annualCashFlow = annualRent - totalAnnualCosts;
  const weeklyCashFlow = annualCashFlow / 52;
  
  // Tax calculations
  const totalTaxableIncome = propertyData.annualIncome + propertyData.otherIncome;
  const propertyTaxableIncome = annualRent - totalDeductibleExpenses;
  const totalIncomeWithProperty = totalTaxableIncome + propertyTaxableIncome;
  
  const taxWithoutProperty = calculateTax(totalTaxableIncome);
  const taxWithProperty = calculateTax(totalIncomeWithProperty);
  const taxDifference = taxWithProperty - taxWithoutProperty;
  const marginalTaxRate = getMarginalTaxRate(totalTaxableIncome);
  
  // After-tax calculations
  const afterTaxCashFlow = annualCashFlow - taxDifference;
  const weeklyAfterTaxCashFlow = afterTaxCashFlow / 52;
  const afterTaxYield = (afterTaxCashFlow / propertyData.purchasePrice) * 100;
  
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
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

          {/* Income & Tax Details */}
          <Card className="lg:col-span-1 shadow-card">
            <CardHeader className="bg-gradient-to-r from-card to-accent border-b">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Receipt className="h-5 w-5" />
                Income & Tax Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="annualIncome">Annual Salary/Wage ($)</Label>
                <Input
                  id="annualIncome"
                  type="number"
                  value={propertyData.annualIncome}
                  onChange={(e) => updateField('annualIncome', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="otherIncome">Other Investment Income ($)</Label>
                <Input
                  id="otherIncome"
                  type="number"
                  value={propertyData.otherIncome}
                  onChange={(e) => updateField('otherIncome', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">Tax Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="medicareLevy"
                      checked={propertyData.hasMedicareLevy}
                      onChange={(e) => updateField('hasMedicareLevy', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="medicareLevy" className="text-sm">
                      Subject to Medicare Levy (2%)
                    </Label>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm space-y-1">
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

          {/* Depreciation Schedule */}
          <Card className="lg:col-span-1 shadow-card">
            <CardHeader className="bg-gradient-to-r from-card to-accent border-b">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Building2 className="h-5 w-5" />
                Depreciation Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="constructionYear">Construction Year</Label>
                <Input
                  id="constructionYear"
                  type="number"
                  value={propertyData.constructionYear}
                  onChange={(e) => updateField('constructionYear', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="buildingValue">Building Value ($)</Label>
                <Input
                  id="buildingValue"
                  type="number"
                  value={propertyData.buildingValue}
                  onChange={(e) => updateField('buildingValue', Number(e.target.value))}
                  className="mt-1"
                  placeholder="Exclude land value"
                />
              </div>
              
              <div>
                <Label htmlFor="plantEquipmentValue">Plant & Equipment Value ($)</Label>
                <Input
                  id="plantEquipmentValue"
                  type="number"
                  value={propertyData.plantEquipmentValue}
                  onChange={(e) => updateField('plantEquipmentValue', Number(e.target.value))}
                  className="mt-1"
                  placeholder="Fixtures, fittings, appliances"
                />
              </div>
              
              <div>
                <Label htmlFor="depreciationMethod">Depreciation Method</Label>
                <Select 
                  value={propertyData.depreciationMethod} 
                  onValueChange={(value) => updateField('depreciationMethod', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prime-cost">Prime Cost (Straight Line)</SelectItem>
                    <SelectItem value="diminishing-value">Diminishing Value</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isNewProperty"
                  checked={propertyData.isNewProperty}
                  onChange={(e) => updateField('isNewProperty', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isNewProperty" className="text-sm">
                  New Property (full depreciation available)
                </Label>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">Annual Depreciation</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capital Works (Div 43):</span>
                    <span className="font-medium text-success">${depreciation.capitalWorks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plant & Equipment (Div 40):</span>
                    <span className="font-medium text-success">${depreciation.plantEquipment.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total Annual Depreciation:</span>
                      <span className="text-primary">${depreciation.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {!propertyData.isNewProperty && (
                <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-warning-foreground">
                      <p className="font-medium mb-1">Established Property:</p>
                      <p>Post-May 2017 rules limit plant & equipment depreciation for established properties. Consider a quantity surveyor report for accurate calculations.</p>
                    </div>
                  </div>
                </div>
              )}
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
                    <span className="text-sm font-medium text-muted-foreground">Weekly Cash Flow (Before Tax)</span>
                    <span className={`text-xl font-bold ${weeklyCashFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ${weeklyCashFlow.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg border border-accent/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Weekly Cash Flow (After Tax)</span>
                    <span className={`text-xl font-bold ${weeklyAfterTaxCashFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ${weeklyAfterTaxCashFlow.toFixed(2)}
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
                    <span className="text-sm font-medium text-muted-foreground">After-Tax Yield</span>
                    <span className={`text-xl font-bold ${afterTaxYield >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {afterTaxYield.toFixed(2)}%
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
                    <span className="text-muted-foreground">Tax Deductible Expenses</span>
                    <span className="font-medium text-destructive">-${(totalDeductibleExpenses - depreciation.total).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Depreciation (non-cash)</span>
                    <span className="font-medium text-primary">-${depreciation.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Principal Repayments</span>
                    <span className="font-medium text-destructive">-${(annualMortgage - annualInterest).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Pre-Tax Cash Flow</span>
                      <span className={annualCashFlow >= 0 ? 'text-success' : 'text-destructive'}>
                        ${annualCashFlow.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Tax Impact</span>
                      <span className={taxDifference <= 0 ? 'text-success' : 'text-destructive'}>
                        {taxDifference <= 0 ? '+' : '-'}${Math.abs(taxDifference).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-primary">
                      <span>After-Tax Cash Flow</span>
                      <span className={afterTaxCashFlow >= 0 ? 'text-success' : 'text-destructive'}>
                        ${afterTaxCashFlow.toLocaleString()}
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

        {/* Depreciation Detail & CGT Analysis */}
        <Card className="mt-6 shadow-card">
          <CardHeader className="bg-gradient-to-r from-card to-accent border-b">
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Building2 className="h-5 w-5" />
              Depreciation Analysis & CGT Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Depreciation Breakdown */}
              <div>
                <h4 className="font-semibold text-foreground mb-4">Annual Depreciation Breakdown</h4>
                <div className="space-y-3">
                  {depreciation.items.map((item, index) => {
                    const annualDepreciation = propertyData.depreciationMethod === 'prime-cost' 
                      ? item.value / item.effectiveLife 
                      : item.value * ((1 / item.effectiveLife) * 1.5);
                    
                    return (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            ${item.value.toLocaleString()} over {item.effectiveLife} years
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-success">
                            ${(propertyData.isNewProperty ? annualDepreciation : annualDepreciation * 0.3).toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">per year</div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div>
                      <div className="font-medium">Capital Works (Building)</div>
                      <div className="text-xs text-muted-foreground">
                        ${propertyData.buildingValue.toLocaleString()} @ 2.5% p.a.
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">
                        ${depreciation.capitalWorks.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">per year</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* CGT Impact Analysis */}
              <div>
                <h4 className="font-semibold text-foreground mb-4">Capital Gains Tax Impact</h4>
                <div className="space-y-3">
                  <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Original Cost Base:</span>
                        <span className="font-medium">${propertyData.purchasePrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annual Depreciation Claimed:</span>
                        <span className="font-medium text-warning">-${depreciation.total.toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Adjusted Cost Base (Year 1):</span>
                          <span>${(propertyData.purchasePrice - depreciation.total).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p><strong>Important CGT Considerations:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Depreciation reduces your cost base for CGT purposes</li>
                      <li>Building depreciation must be "clawed back" at sale</li>
                      <li>Plant & equipment depreciation may trigger capital gains</li>
                      <li>50% CGT discount available for assets held &gt;12 months</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                    <div className="text-sm">
                      <div className="font-medium text-success mb-1">Tax Benefit Analysis</div>
                      <div className="flex justify-between">
                        <span>Annual Tax Savings:</span>
                        <span className="font-bold text-success">
                          ${(depreciation.total * getMarginalTaxRate(totalTaxableIncome)).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Based on {(getMarginalTaxRate(totalTaxableIncome) * 100).toFixed(0)}% marginal tax rate
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-muted">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Depreciation Disclaimer:</p>
                  <p>These are estimated depreciation calculations. For investment properties, you should obtain a professional 
                  quantity surveyor's depreciation schedule to ensure accuracy and ATO compliance. Actual depreciation may vary 
                  based on property condition, age, and specific components. Consider the long-term CGT implications when claiming depreciation.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cash Flow Analysis */}
        <Card className="mt-6 shadow-card">
          <CardHeader className="bg-gradient-to-r from-card to-accent border-b">
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <DollarSign className="h-5 w-5" />
              Cash Flow Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                <div className="text-3xl font-bold text-primary mb-2">${weeklyAfterTaxCashFlow.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Weekly After-Tax Cash Flow</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Including tax benefits
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
                <div className={`text-3xl font-bold mb-2 ${afterTaxYield >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {afterTaxYield.toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">After-Tax Yield</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Real return on investment
                </div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg border border-accent/20">
                <div className={`text-3xl font-bold mb-2 ${taxDifference <= 0 ? 'text-success' : 'text-destructive'}`}>
                  ${Math.abs(taxDifference).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {taxDifference <= 0 ? 'Annual Tax Savings' : 'Additional Tax'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {taxDifference <= 0 ? 'From negative gearing' : 'From positive income'}
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-muted">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Tax Disclaimer:</p>
                  <p>These calculations are estimates based on current Australian tax rates (2024-25) and simplified assumptions. 
                  Actual tax outcomes may vary based on individual circumstances, depreciation schedules, capital gains implications, 
                  and other factors. Please consult a qualified tax advisor or accountant for personalized advice.</p>
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