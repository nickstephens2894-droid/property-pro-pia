import { useState } from "react";
import { PropertyInputForm } from "@/components/PropertyInputForm";
import { PropertySummaryDashboard } from "@/components/PropertySummaryDashboard";
import { PropertyCalculationDetails } from "@/components/PropertyCalculationDetails";
import { useIsMobile } from "@/hooks/use-mobile";

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

interface PropertyData {
  // Multi-client structure
  clients: Client[];
  ownershipAllocations: OwnershipAllocation[];
  
  // Project Type
  isConstructionProject: boolean;
  
  // Basic Property Details - Enhanced
  purchasePrice: number;
  weeklyRent: number;
  rentalGrowthRate: number;
  vacancyRate: number;
  constructionYear: number;
  buildingValue: number;
  plantEquipmentValue: number;
  
  // Construction-specific
  landValue: number;
  constructionValue: number;
  constructionPeriod: number; // months
  constructionInterestRate: number;
  
  // Traditional Financing
  deposit: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  lvr: number; // Loan to Value Ratio
  
  // Equity Funding
  useEquityFunding: boolean;
  primaryPropertyValue: number;
  existingDebt: number;
  maxLVR: number;
  
  // Holding Costs During Construction
  holdingCostFunding: 'cash' | 'debt' | 'hybrid';
  holdingCostCashPercentage: number; // For hybrid funding
  
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
  
  // Depreciation fields
  depreciationMethod: 'prime-cost' | 'diminishing-value';
  isNewProperty: boolean;
}

const PropertyAnalysis = () => {
  const [propertyData, setPropertyData] = useState<PropertyData>({
    // Multi-client structure
    clients: [
      {
        id: '1',
        name: 'Husband',
        annualIncome: 200000,
        otherIncome: 0,
        hasMedicareLevy: true,
      },
      {
        id: '2',
        name: 'Wife',
        annualIncome: 20000,
        otherIncome: 0,
        hasMedicareLevy: false,
      }
    ],
    ownershipAllocations: [
      { clientId: '1', ownershipPercentage: 90 },
      { clientId: '2', ownershipPercentage: 10 }
    ],
    
    // Project Type
    isConstructionProject: false,
    
    // Basic Property Details - Enhanced
    purchasePrice: 750000,
    weeklyRent: 650,
    rentalGrowthRate: 3.0,
    vacancyRate: 2.0,
    constructionYear: 2020,
    buildingValue: 600000,
    plantEquipmentValue: 35000,
    
    // Construction-specific
    landValue: 200000,
    constructionValue: 550000,
    constructionPeriod: 8, // months
    constructionInterestRate: 7.0, // typically higher than standard rate
    
    // Traditional Financing
    deposit: 150000,
    loanAmount: 600000,
    interestRate: 6.5,
    loanTerm: 30,
    lvr: 80,
    
    // Equity Funding
    useEquityFunding: false,
    primaryPropertyValue: 1000000,
    existingDebt: 400000,
    maxLVR: 80,
    
    // Holding Costs During Construction
    holdingCostFunding: 'cash',
    holdingCostCashPercentage: 100,
    
    // Purchase Costs
    stampDuty: 35000,
    legalFees: 2500,
    inspectionFees: 800,
    
    // Construction Costs
    councilFees: 5000,
    architectFees: 15000,
    siteCosts: 8000,
    
    // Annual Expenses
    propertyManagement: 8,
    councilRates: 2500,
    insurance: 1200,
    repairs: 2000,
    
    // Depreciation defaults
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

    // Medicare levy will be calculated per client
    // Removed from general calculation

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

  // Calculate construction holding costs
  const calculateHoldingCosts = () => {
    if (!propertyData.isConstructionProject) return { landInterest: 0, constructionInterest: 0, total: 0 };
    
    // Land interest during construction period
    const landInterest = propertyData.landValue * (propertyData.constructionInterestRate / 100) * (propertyData.constructionPeriod / 12);
    
    // Progressive construction interest (simplified - assumes 50% average drawdown)
    const averageConstructionDrawdown = propertyData.constructionValue * 0.5;
    const constructionInterest = averageConstructionDrawdown * (propertyData.constructionInterestRate / 100) * (propertyData.constructionPeriod / 12);
    
    return {
      landInterest,
      constructionInterest,
      total: landInterest + constructionInterest
    };
  };

  const holdingCosts = calculateHoldingCosts();

  // Calculate total project costs
  const baseCosts = propertyData.isConstructionProject 
    ? propertyData.landValue + propertyData.constructionValue 
    : propertyData.purchasePrice;
  
  const developmentCosts = propertyData.isConstructionProject 
    ? propertyData.councilFees + propertyData.architectFees + propertyData.siteCosts 
    : 0;
  
  const totalProjectCost = baseCosts + propertyData.stampDuty + propertyData.legalFees + 
                          propertyData.inspectionFees + developmentCosts + holdingCosts.total;

  // Calculate funding requirements
  const calculateFundingRequirements = () => {
    if (propertyData.useEquityFunding) {
      const availableEquity = Math.max(0, (propertyData.primaryPropertyValue * propertyData.maxLVR / 100) - propertyData.existingDebt);
      const equityUsed = Math.min(availableEquity, totalProjectCost);
      const additionalCashRequired = Math.max(0, totalProjectCost - equityUsed);
      
      return {
        totalRequired: totalProjectCost,
        equityUsed,
        cashRequired: additionalCashRequired,
        availableEquity,
        loanAmount: equityUsed
      };
    } else {
      // Traditional LVR financing
      const loanAmount = totalProjectCost * (propertyData.lvr / 100);
      const cashRequired = totalProjectCost - loanAmount;
      
      return {
        totalRequired: totalProjectCost,
        equityUsed: 0,
        cashRequired,
        availableEquity: 0,
        loanAmount
      };
    }
  };

  const funding = calculateFundingRequirements();

  // Calculate out-of-pocket vs capitalized holding costs
  const outOfPocketHoldingCosts = propertyData.holdingCostFunding === 'cash' 
    ? holdingCosts.total 
    : propertyData.holdingCostFunding === 'debt' 
      ? 0 
      : holdingCosts.total * (propertyData.holdingCostCashPercentage / 100);

  const capitalizedHoldingCosts = holdingCosts.total - outOfPocketHoldingCosts;

  // Actual cash invested (for true ROI calculations)
  const actualCashInvested = funding.cashRequired + outOfPocketHoldingCosts;

  // Property calculations
  const annualRent = propertyData.weeklyRent * 52;
  const finalLoanAmount = funding.loanAmount + capitalizedHoldingCosts;
  const weeklyMortgage = (finalLoanAmount * (propertyData.interestRate / 100 / 52) * Math.pow(1 + propertyData.interestRate / 100 / 52, propertyData.loanTerm * 52)) / (Math.pow(1 + propertyData.interestRate / 100 / 52, propertyData.loanTerm * 52) - 1);
  const annualMortgage = weeklyMortgage * 52;
  const annualPropertyManagement = annualRent * (propertyData.propertyManagement / 100);
  
  // Tax-deductible expenses (including depreciation)
  const annualInterest = finalLoanAmount * (propertyData.interestRate / 100);
  const totalDeductibleExpenses = annualInterest + annualPropertyManagement + propertyData.councilRates + propertyData.insurance + propertyData.repairs + depreciation.total;
  
  const totalAnnualCosts = annualMortgage + annualPropertyManagement + propertyData.councilRates + propertyData.insurance + propertyData.repairs;
  const annualCashFlow = annualRent - totalAnnualCosts;
  const weeklyCashFlow = annualCashFlow / 52;
  
  // Multi-client tax calculations
  const calculateClientTax = (client: Client, propertyIncome: number, propertyDeductions: number) => {
    const totalIncome = client.annualIncome + client.otherIncome;
    const propertyTaxableIncome = propertyIncome - propertyDeductions;
    const totalIncomeWithProperty = totalIncome + propertyTaxableIncome;
    
    let taxWithoutProperty = calculateTax(totalIncome);
    let taxWithProperty = calculateTax(totalIncomeWithProperty);
    
    // Add Medicare levy per client
    if (client.hasMedicareLevy && totalIncome > 29207) {
      taxWithoutProperty += totalIncome * 0.02;
    }
    if (client.hasMedicareLevy && totalIncomeWithProperty > 29207) {
      taxWithProperty += totalIncomeWithProperty * 0.02;
    }
    
    return {
      taxWithoutProperty,
      taxWithProperty,
      taxDifference: taxWithProperty - taxWithoutProperty,
      marginalTaxRate: getMarginalTaxRate(totalIncome),
      propertyTaxableIncome
    };
  };

  // Calculate for each client based on ownership allocation
  const clientTaxResults = propertyData.clients.map(client => {
    const ownership = propertyData.ownershipAllocations.find(o => o.clientId === client.id);
    const ownershipPercentage = ownership ? ownership.ownershipPercentage / 100 : 0;
    
    const allocatedRent = annualRent * ownershipPercentage;
    const allocatedDeductions = totalDeductibleExpenses * ownershipPercentage;
    
    return {
      client,
      ownershipPercentage,
      ...calculateClientTax(client, allocatedRent, allocatedDeductions)
    };
  });

  // Combined household totals
  const totalTaxableIncome = propertyData.clients.reduce((sum, client) => 
    sum + client.annualIncome + client.otherIncome, 0);
  const totalTaxWithoutProperty = clientTaxResults.reduce((sum, result) => 
    sum + result.taxWithoutProperty, 0);
  const totalTaxWithProperty = clientTaxResults.reduce((sum, result) => 
    sum + result.taxWithProperty, 0);
  const totalTaxDifference = totalTaxWithProperty - totalTaxWithoutProperty;
  
  // Use highest earner's marginal rate for overall decisions
  const marginalTaxRate = Math.max(...clientTaxResults.map(r => r.marginalTaxRate));
  
  // After-tax calculations
  const afterTaxCashFlow = annualCashFlow - totalTaxDifference;
  const weeklyAfterTaxCashFlow = afterTaxCashFlow / 52;
  const afterTaxYield = (afterTaxCashFlow / totalProjectCost) * 100;
  
  const grossYield = (annualRent / totalProjectCost) * 100;
  const netYield = (annualCashFlow / totalProjectCost) * 100;
  const cashOnCashReturn = actualCashInvested > 0 ? (annualCashFlow / actualCashInvested) * 100 : 0;
  const totalUpfrontCosts = funding.cashRequired + outOfPocketHoldingCosts;

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
              clientTaxResults={clientTaxResults}
              totalTaxableIncome={totalTaxableIncome}
              marginalTaxRate={marginalTaxRate}
            />
          </div>

          {/* Summary & Details - Takes 2 columns on desktop */}
          <div className={`space-y-6 ${isMobile ? 'order-1' : 'lg:col-span-2'}`}>
            
            {/* Summary Dashboard */}
            <PropertySummaryDashboard
              weeklyAfterTaxCashFlow={weeklyAfterTaxCashFlow}
              grossYield={grossYield}
              afterTaxYield={afterTaxYield}
              cashOnCashReturn={cashOnCashReturn}
              taxDifference={totalTaxDifference}
              annualRent={annualRent}
              totalExpenses={totalDeductibleExpenses}
              marginalTaxRate={marginalTaxRate}
              totalProjectCost={totalProjectCost}
              actualCashInvested={actualCashInvested}
              isConstructionProject={propertyData.isConstructionProject}
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
              clientTaxResults={clientTaxResults}
              totalTaxWithProperty={totalTaxWithProperty}
              totalTaxWithoutProperty={totalTaxWithoutProperty}
              marginalTaxRate={marginalTaxRate}
              purchasePrice={propertyData.purchasePrice}
              constructionYear={propertyData.constructionYear}
              depreciationMethod={propertyData.depreciationMethod}
              // Enhanced construction details
              isConstructionProject={propertyData.isConstructionProject}
              totalProjectCost={totalProjectCost}
              holdingCosts={holdingCosts}
              funding={funding}
              outOfPocketHoldingCosts={outOfPocketHoldingCosts}
              capitalizedHoldingCosts={capitalizedHoldingCosts}
              actualCashInvested={actualCashInvested}
              constructionPeriod={propertyData.constructionPeriod}
              holdingCostFunding={propertyData.holdingCostFunding}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyAnalysis;