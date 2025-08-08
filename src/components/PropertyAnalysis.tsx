import { PropertyInputForm } from "@/components/PropertyInputForm";
import { PropertyCalculationDetails } from "@/components/PropertyCalculationDetails";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePropertyData } from "@/contexts/PropertyDataContext";

interface Client {
  id: string;
  name: string;
  annualIncome: number;
  otherIncome: number;
  hasMedicareLevy: boolean;
}

const PropertyAnalysis = () => {
  const navigate = useNavigate();
  const { propertyData, updateField, calculateTotalProjectCost, calculateEquityLoanAmount } = usePropertyData();

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

  // Use centralized calculations from context
  const { calculateHoldingCosts, calculateMinimumDeposit, calculateAvailableEquity } = usePropertyData();
  
  // Use centralized holding costs calculation
  const holdingCosts = calculateHoldingCosts();
  const totalProjectCost = calculateTotalProjectCost();
  const equityLoanAmount = calculateEquityLoanAmount();

  // Calculate funding requirements using centralized calculations
  const funding = {
    totalRequired: totalProjectCost,
    equityUsed: equityLoanAmount,
    cashRequired: propertyData.depositAmount,
    availableEquity: calculateAvailableEquity(),
    loanAmount: propertyData.loanAmount
  };

  // Enhanced loan payment calculations
  const calculateLoanPayments = (loanAmount: number, interestRate: number, totalTerm: number, loanType: 'io' | 'pi', ioTermYears: number = 0) => {
    if (loanType === 'io' && ioTermYears > 0) {
      // Interest-only payment (weekly)
      const ioPayment = loanAmount * (interestRate / 100 / 52);
      
      // Principal & Interest payment after IO period
      const remainingTerm = totalTerm - ioTermYears;
      let piPayment = 0;
      
      if (remainingTerm > 0) {
        const weeklyRate = interestRate / 100 / 52;
        const totalPayments = remainingTerm * 52;
        piPayment = (loanAmount * weeklyRate * Math.pow(1 + weeklyRate, totalPayments)) / (Math.pow(1 + weeklyRate, totalPayments) - 1);
      }
      
      // Total interest over loan life
      const ioInterest = loanAmount * (interestRate / 100) * ioTermYears;
      const piInterest = remainingTerm > 0 ? (piPayment * remainingTerm * 52) - loanAmount : 0;
      const totalInterest = ioInterest + piInterest;
      
      return {
        ioPayment,
        piPayment,
        ioTermYears,
        remainingTerm,
        totalInterest,
        currentPayment: ioPayment,
        futurePayment: piPayment
      };
    } else {
      // Standard Principal & Interest
      const weeklyRate = interestRate / 100 / 52;
      const totalPayments = totalTerm * 52;
      const piPayment = (loanAmount * weeklyRate * Math.pow(1 + weeklyRate, totalPayments)) / (Math.pow(1 + weeklyRate, totalPayments) - 1);
      const totalInterest = (piPayment * totalPayments) - loanAmount;
      
      return {
        ioPayment: 0,
        piPayment,
        ioTermYears: 0,
        remainingTerm: totalTerm,
        totalInterest,
        currentPayment: piPayment,
        futurePayment: 0
      };
    }
  };

  // Calculate main loan payments
  const mainLoanPayments = calculateLoanPayments(
    funding.loanAmount,
    propertyData.interestRate,
    propertyData.loanTerm,
    propertyData.mainLoanType,
    propertyData.ioTermYears
  );

  // Calculate equity loan payments (if applicable)
  const equityLoanPayments = propertyData.useEquityFunding ? calculateLoanPayments(
    funding.equityUsed,
    propertyData.equityLoanInterestRate,
    propertyData.equityLoanTerm,
    propertyData.equityLoanType,
    propertyData.equityLoanIoTermYears
  ) : null;

  // Calculate minimum deposit using centralized function
  const minimumDepositRequired = calculateMinimumDeposit();

  // Calculate out-of-pocket vs capitalized holding costs
  const outOfPocketHoldingCosts = propertyData.holdingCostFunding === 'cash' 
    ? holdingCosts.total 
    : propertyData.holdingCostFunding === 'debt' 
      ? 0 
      : holdingCosts.total * (propertyData.holdingCostCashPercentage / 100);

  const capitalizedHoldingCosts = holdingCosts.total - outOfPocketHoldingCosts;

  // Actual cash invested (for true ROI calculations)
  const actualCashInvested = funding.cashRequired + outOfPocketHoldingCosts;

  // Enhanced property calculations with IO/P&I support
  const annualRent = propertyData.weeklyRent * 52;
  const finalLoanAmount = funding.loanAmount + capitalizedHoldingCosts;
  
  // Use enhanced loan payment calculations
  const totalWeeklyLoanPayments = mainLoanPayments.currentPayment + (equityLoanPayments?.currentPayment || 0);
  const totalAnnualLoanPayments = totalWeeklyLoanPayments * 52;
  const annualPropertyManagement = annualRent * (propertyData.propertyManagement / 100);
  
  // Enhanced tax-deductible expenses calculation (only interest is deductible, not principal)
  const mainLoanInterest = funding.loanAmount * (propertyData.interestRate / 100);
  const equityLoanInterest = equityLoanPayments 
    ? funding.equityUsed * (propertyData.equityLoanInterestRate / 100)
    : 0;
  
  const totalAnnualInterest = mainLoanInterest + equityLoanInterest;
  const totalDeductibleExpenses = totalAnnualInterest + annualPropertyManagement + propertyData.councilRates + propertyData.insurance + propertyData.repairs + depreciation.total;
  
  const totalAnnualCosts = totalAnnualLoanPayments + annualPropertyManagement + propertyData.councilRates + propertyData.insurance + propertyData.repairs;
  const annualCashFlow = annualRent - totalAnnualCosts;
  const weeklyCashFlow = annualCashFlow / 52;
  
  // Multi-client tax calculations
  const calculateClientTax = (client: Client, propertyIncome: number, propertyDeductions: number) => {
    const totalIncome = client.annualIncome + client.otherIncome;
    const propertyTaxableIncome = propertyIncome - propertyDeductions;
    const totalIncomeWithProperty = totalIncome + propertyTaxableIncome;
    
    let taxWithoutProperty = calculateTax(totalIncome);
    let taxWithProperty = calculateTax(totalIncomeWithProperty);
    
    // Add Medicare levy per client (2024-25 threshold)
    if (client.hasMedicareLevy && totalIncome > 26000) {
      taxWithoutProperty += totalIncome * 0.02;
    }
    if (client.hasMedicareLevy && totalIncomeWithProperty > 26000) {
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Property Investment Analysis
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg">
                Comprehensive analysis tool for Australian residential property investments
              </p>
            </div>
            <Button 
              onClick={() => navigate('/projections')}
              className="flex items-center gap-2 self-start sm:self-auto"
            >
              <TrendingUp className="h-4 w-4" />
              40-Year Projections
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-3'}`}>
          
          {/* Input Form - Takes 1 column on desktop, appears first */}
          <div className={isMobile ? 'order-1' : 'lg:col-span-1'}>
            <PropertyInputForm
              propertyData={propertyData}
              updateField={updateField}
              clientTaxResults={clientTaxResults}
              totalTaxableIncome={totalTaxableIncome}
              marginalTaxRate={marginalTaxRate}
            />
          </div>

          {/* Summary & Details - Takes 2 columns on desktop, appears second */}
          <div className={`space-y-6 ${isMobile ? 'order-2' : 'lg:col-span-2'}`}>
            
            {/* Calculation Details */}
            <PropertyCalculationDetails
              monthlyRepayment={totalWeeklyLoanPayments * 52 / 12}
              annualRepayment={totalAnnualLoanPayments}
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
              // Enhanced loan payment details
              mainLoanPayments={mainLoanPayments}
              equityLoanPayments={equityLoanPayments}
              totalAnnualInterest={totalAnnualInterest}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyAnalysis;