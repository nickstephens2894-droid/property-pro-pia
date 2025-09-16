import React, { createContext, useContext, ReactNode } from "react";
import { useInstanceFundings } from "@/hooks/useInstanceFundings";
import { useLoanFunds } from "@/hooks/useLoanFunds";
import { useCashFunds } from "@/hooks/useCashFunds";
import {
  InstanceFunding,
  CreateInstanceFundingRequest,
  FundAvailabilityCheck,
  CashFund,
  LoanFundWithUsage,
} from "@/types/funding";

interface FundingContextType {
  // Instance fundings
  instanceFundings: InstanceFunding[];
  addInstanceFunding: (
    funding: CreateInstanceFundingRequest
  ) => Promise<InstanceFunding | null>;
  updateInstanceFunding: (
    id: string,
    updates: Partial<InstanceFunding>
  ) => Promise<boolean>;
  removeInstanceFunding: (id: string) => Promise<boolean>;

  // Funds
  cashFunds: CashFund[];
  loanFundsWithUsage: LoanFundWithUsage[];

  // Fund CRUD operations
  createCashFund: (fundData: any) => Promise<CashFund | null>;
  updateCashFund: (id: string, updates: any) => Promise<boolean>;
  deleteCashFund: (id: string) => Promise<boolean>;
  createLoanFund: (fundData: any) => Promise<any>;
  updateLoanFund: (id: string, updates: any) => Promise<boolean>;
  deleteLoanFund: (id: string) => Promise<boolean>;

  // Fund availability
  checkFundAvailability: (
    fundId: string,
    fundType: "loan" | "cash",
    amount: number
  ) => Promise<FundAvailabilityCheck>;

  // Refresh functions
  refreshCashFunds: () => Promise<void>;
  refreshLoanFunds: () => Promise<void>;

  // Loading states
  loading: boolean;
}

const FundingContext = createContext<FundingContextType | undefined>(undefined);

export const useFunding = () => {
  const context = useContext(FundingContext);
  if (context === undefined) {
    throw new Error("useFunding must be used within a FundingProvider");
  }
  return context;
};

interface FundingProviderProps {
  children: ReactNode;
}

export const FundingProvider = ({ children }: FundingProviderProps) => {
  const {
    loanFundsWithUsage,
    loading: loanFundsLoading,
    loadLoanFunds,
    createLoanFund,
    updateLoanFund,
    deleteLoanFund,
  } = useLoanFunds();
  const {
    cashFunds,
    loading: cashFundsLoading,
    loadCashFunds,
    createCashFund,
    updateCashFund,
    deleteCashFund,
  } = useCashFunds();

  // Create a refresh function that refreshes both funds
  const refreshFunds = async () => {
    await Promise.all([loadCashFunds(), loadLoanFunds()]);
  };

  const {
    instanceFundings,
    loading: instanceFundingsLoading,
    addInstanceFunding,
    updateInstanceFunding,
    removeInstanceFunding,
    checkFundAvailability,
  } = useInstanceFundings(undefined, refreshFunds);

  const loading =
    instanceFundingsLoading || loanFundsLoading || cashFundsLoading;

  const value: FundingContextType = {
    instanceFundings,
    addInstanceFunding,
    updateInstanceFunding,
    removeInstanceFunding,
    cashFunds,
    loanFundsWithUsage,
    createCashFund,
    updateCashFund,
    deleteCashFund,
    createLoanFund,
    updateLoanFund,
    deleteLoanFund,
    checkFundAvailability,
    refreshCashFunds: loadCashFunds,
    refreshLoanFunds: loadLoanFunds,
    loading,
  };

  return (
    <FundingContext.Provider value={value}>{children}</FundingContext.Provider>
  );
};
