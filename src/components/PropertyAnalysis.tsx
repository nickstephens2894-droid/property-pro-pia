import { useState } from "react";
import { PropertyInputForm } from "@/components/PropertyInputForm";
import { PropertySummaryDashboard } from "@/components/PropertySummaryDashboard";
import { PropertyCalculationDetails } from "@/components/PropertyCalculationDetails";
import { useIsMobile } from "@/hooks/use-mobile";

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

  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Property Investment Analysis
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Comprehensive analysis tool for Australian residential property investments
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-3'}`}>
          
          {/* Input Form - Takes 1 column on desktop */}
          <div className={isMobile ? 'order-2' : 'lg:col-span-1'}>
            <PropertyInputForm
              propertyData={propertyData}
              updateField={updateField}
              totalTaxableIncome={totalTaxableIncome}
              marginalTaxRate={marginalTaxRate}
              taxWithoutProperty={taxWithoutProperty}
            />
          </div>

          {/* Summary & Details - Takes 2 columns on desktop */}
          <div className={`space-y-6 ${isMobile ? 'order-1' : 'lg:col-span-2'}`}>
            
            {/* Summary Dashboard */}
            <PropertySummaryDashboard
              weeklyAfterTaxCashFlow={weeklyAfterTaxCashFlow}
              grossYield={grossYield}
              afterTaxYield={afterTaxYield}
              taxDifference={taxDifference}
              annualRent={annualRent}
              totalExpenses={totalDeductibleExpenses}
              marginalTaxRate={marginalTaxRate}
            />

            {/* Calculation Details */}
            <PropertyCalculationDetails
              monthlyRepayment={weeklyMortgage * 52 / 12}
              annualRepayment={weeklyMortgage * 52}
              annualRent={annualRent}
              propertyManagementCost={annualPropertyManagement}
              councilRates={propertyData.councilRates}
              insurance={propertyData.insurance}
              repairs={propertyData.repairs}
              totalDeductibleExpenses={totalDeductibleExpenses}
              depreciation={{
                ...depreciation,
                capitalWorksAvailable: propertyData.constructionYear >= 1987,
                plantEquipmentRestricted: !propertyData.isNewProperty
              }}
              propertyTaxableIncome={propertyTaxableIncome}
              taxWithProperty={taxWithProperty}
              taxWithoutProperty={taxWithoutProperty}
              marginalTaxRate={marginalTaxRate}
              purchasePrice={propertyData.purchasePrice}
              constructionYear={propertyData.constructionYear}
              depreciationMethod={propertyData.depreciationMethod}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyAnalysis;