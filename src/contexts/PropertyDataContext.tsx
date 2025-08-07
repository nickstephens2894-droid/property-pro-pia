import React, { createContext, useContext, useState, ReactNode } from 'react';

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

export interface PropertyData {
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
  
  // Enhanced Loan Options
  mainLoanType: 'io' | 'pi';
  ioTermYears: number;
  
  // Equity Funding Enhanced
  useEquityFunding: boolean;
  primaryPropertyValue: number;
  existingDebt: number;
  maxLVR: number;
  equityLoanType: 'io' | 'pi';
  equityLoanIoTermYears: number;
  equityLoanInterestRate: number;
  equityLoanTerm: number;
  
  // Deposit Management
  depositAmount: number;
  minimumDepositRequired: number;
  
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

interface PropertyDataContextType {
  propertyData: PropertyData;
  setPropertyData: React.Dispatch<React.SetStateAction<PropertyData>>;
  updateField: (field: keyof PropertyData, value: number | boolean | string) => void;
}

const PropertyDataContext = createContext<PropertyDataContextType | undefined>(undefined);

const defaultPropertyData: PropertyData = {
  // Multi-client structure
  clients: [
    {
      id: '1',
      name: 'Investor 1',
      annualIncome: 200000,
      otherIncome: 0,
      hasMedicareLevy: true,
    },
    {
      id: '2',
      name: 'Investor 2',
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
  
  // Enhanced Loan Options
  mainLoanType: 'pi',
  ioTermYears: 5,
  
  // Equity Funding Enhanced
  useEquityFunding: false,
  primaryPropertyValue: 1000000,
  existingDebt: 400000,
  maxLVR: 80,
  equityLoanType: 'pi',
  equityLoanIoTermYears: 3,
  equityLoanInterestRate: 7.0,
  equityLoanTerm: 25,
  
  // Deposit Management
  depositAmount: 150000,
  minimumDepositRequired: 150000,
  
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
};

export const PropertyDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [propertyData, setPropertyData] = useState<PropertyData>(defaultPropertyData);

  const updateField = (field: keyof PropertyData, value: number | boolean | string) => {
    setPropertyData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <PropertyDataContext.Provider value={{ propertyData, setPropertyData, updateField }}>
      {children}
    </PropertyDataContext.Provider>
  );
};

export const usePropertyData = () => {
  const context = useContext(PropertyDataContext);
  if (context === undefined) {
    throw new Error('usePropertyData must be used within a PropertyDataProvider');
  }
  return context;
};