import React, { createContext, useContext, ReactNode } from "react";
import { useScenarioFunding } from "@/hooks/useScenarioFunding";
import {
  ScenarioInstanceFunding,
  CreateScenarioFundingRequest,
  UpdateScenarioFundingRequest,
  ScenarioFundingApplication,
} from "@/types/scenarios";

interface ScenarioFundingContextType {
  // Scenario funding data
  scenarioFundings: ScenarioInstanceFunding[];
  fundingApplications: ScenarioFundingApplication[];

  // CRUD operations
  addScenarioFunding: (
    funding: CreateScenarioFundingRequest
  ) => Promise<ScenarioInstanceFunding | null>;
  updateScenarioFunding: (
    id: string,
    updates: UpdateScenarioFundingRequest
  ) => Promise<boolean>;
  removeScenarioFunding: (id: string) => Promise<boolean>;

  // Apply operations
  applyScenarioFunding: (targetInstanceId: string) => Promise<boolean>;
  rollbackScenarioFunding: () => Promise<boolean>;

  // Refresh functions
  refreshScenarioFundings: () => Promise<void>;
  refreshFundingApplications: () => Promise<void>;

  // Loading states
  loading: boolean;
}

const ScenarioFundingContext = createContext<
  ScenarioFundingContextType | undefined
>(undefined);

export const useScenarioFundingContext = () => {
  const context = useContext(ScenarioFundingContext);
  if (context === undefined) {
    throw new Error(
      "useScenarioFundingContext must be used within a ScenarioFundingProvider"
    );
  }
  return context;
};

interface ScenarioFundingProviderProps {
  children: ReactNode;
  scenarioInstanceId?: string;
}

export const ScenarioFundingProvider = ({
  children,
  scenarioInstanceId,
}: ScenarioFundingProviderProps) => {
  const {
    scenarioFundings,
    fundingApplications,
    loading,
    addScenarioFunding,
    updateScenarioFunding,
    removeScenarioFunding,
    applyScenarioFunding,
    rollbackScenarioFunding,
    refreshScenarioFundings,
    refreshFundingApplications,
  } = useScenarioFunding(scenarioInstanceId);

  const value: ScenarioFundingContextType = {
    scenarioFundings,
    fundingApplications,
    addScenarioFunding,
    updateScenarioFunding,
    removeScenarioFunding,
    applyScenarioFunding,
    rollbackScenarioFunding,
    refreshScenarioFundings,
    refreshFundingApplications,
    loading,
  };

  return (
    <ScenarioFundingContext.Provider value={value}>
      {children}
    </ScenarioFundingContext.Provider>
  );
};
