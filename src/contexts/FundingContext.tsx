import React, { createContext, useContext, ReactNode } from "react";
import { useInstanceFundings } from "@/hooks/useInstanceFundings";
import { useLoanFunds } from "@/hooks/useLoanFunds";
import { useCashFunds } from "@/hooks/useCashFunds";
import {
  InstanceFunding,
  CreateInstanceFundingRequest,
  FundAvailabilityCheck,
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

  // Fund availability
  checkFundAvailability: (
    fundId: string,
    fundType: "loan" | "cash",
    amount: number
  ) => Promise<FundAvailabilityCheck>;

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
    instanceFundings,
    loading: instanceFundingsLoading,
    addInstanceFunding,
    updateInstanceFunding,
    removeInstanceFunding,
    checkFundAvailability,
  } = useInstanceFundings();

  const { loading: loanFundsLoading } = useLoanFunds();
  const { loading: cashFundsLoading } = useCashFunds();

  const loading =
    instanceFundingsLoading || loanFundsLoading || cashFundsLoading;

  const value: FundingContextType = {
    instanceFundings,
    addInstanceFunding,
    updateInstanceFunding,
    removeInstanceFunding,
    checkFundAvailability,
    loading,
  };

  return (
    <FundingContext.Provider value={value}>{children}</FundingContext.Provider>
  );
};
