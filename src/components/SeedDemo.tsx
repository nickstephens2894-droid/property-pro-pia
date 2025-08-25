import React, { useEffect } from "react";
import { useRepo, type Investor } from "@/services/repository";

const DEMO_FLAG = "app_demo_seed_v2";

function genId(prefix = "id"): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    // Fallback to alternative ID generation
  }
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export default function SeedDemo() {
  const { investors, properties, scenarios, addInvestor, addProperty, addScenario } = useRepo();

  useEffect(() => {
    const initializeDemo = async () => {
    // Avoid duplicating demo data
    if (localStorage.getItem(DEMO_FLAG)) return;

    // Create demo investors with correct structure
    const investorsToCreate: Investor[] = [
      {
        id: genId("inv"),
        name: "Alex Johnson",
        annualIncome: 145000,
        otherIncome: 5000,
        nonTaxableIncome: 0,
        hasMedicareLevy: true,
        ownershipPercentage: 100,
        loanSharePercentage: 100,
        cashContribution: 100000,
      },
      {
        id: genId("inv"),
        name: "Sam Patel",
        annualIncome: 90000,
        otherIncome: 0,
        nonTaxableIncome: 0,
        hasMedicareLevy: true,
        ownershipPercentage: 50,
        loanSharePercentage: 50,
        cashContribution: 80000,
      },
      {
        id: genId("inv"),
        name: "Priya Patel",
        annualIncome: 65000,
        otherIncome: 5000,
        nonTaxableIncome: 0,
        hasMedicareLevy: true,
        ownershipPercentage: 50,
        loanSharePercentage: 50,
        cashContribution: 40000,
      },
      {
        id: genId("inv"),
        name: "Bao Nguyen",
        annualIncome: 120000,
        otherIncome: 15000,
        nonTaxableIncome: 0,
        hasMedicareLevy: false,
        ownershipPercentage: 33.33,
        loanSharePercentage: 50,
        cashContribution: 120000,
      },
      {
        id: genId("inv"),
        name: "Linh Nguyen",
        annualIncome: 45000,
        otherIncome: 2000,
        nonTaxableIncome: 0,
        hasMedicareLevy: true,
        ownershipPercentage: 33.33,
        loanSharePercentage: 30,
        cashContribution: 30000,
      },
      {
        id: genId("inv"),
        name: "Chris Nguyen",
        annualIncome: 30000,
        otherIncome: 0,
        nonTaxableIncome: 0,
        hasMedicareLevy: false,
        ownershipPercentage: 33.34,
        loanSharePercentage: 20,
        cashContribution: 15000,
      },
    ];

    // Create demo properties
    const propertiesToCreate: Array<{
      id: string;
      name: string;
      type: "House" | "Apartment" | "Land" | "Townhouse" | "Unit" | "Other";
      purchasePrice: number;
      weeklyRent: number;
      location: string;
      notes: string;
    }> = [
      {
        id: genId("prop"),
        name: "Riverside House",
        type: "House",
        purchasePrice: 750000,
        weeklyRent: 650,
        location: "Brisbane, QLD",
        notes: "Established suburb family home",
      },
      {
        id: genId("prop"),
        name: "CityView Apartment",
        type: "Apartment",
        purchasePrice: 620000,
        weeklyRent: 700,
        location: "Melbourne, VIC",
        notes: "CBD proximity, high rental demand",
      },
      {
        id: genId("prop"),
        name: "Sunset Acreage",
        type: "Land",
        purchasePrice: 420000,
        weeklyRent: 0,
        location: "Perth, WA",
        notes: "Vacant land for future development",
      },
    ];

    // Only seed if nothing exists yet OR counts are below requested samples
    const shouldSeed = investors.length < 3 || properties.length < 3 || scenarios.length < 3;
    if (!shouldSeed) {
      localStorage.setItem(DEMO_FLAG, "1");
      return;
    }

    // Add investors and properties
    investorsToCreate.forEach(addInvestor);
    propertiesToCreate.forEach(addProperty);

    // Map legacy scenario format to correct Scenario type
    const scenariosToCreate: Array<{
      id: string;
      name: string;
      owner_user_id: string;
      is_core: boolean;
      snapshot: any;
      created_at: string;
      updated_at: string;
    }> = [
      {
        id: genId("scn"),
        name: "Alex buys Riverside House",
        owner_user_id: "",
        is_core: false,
        snapshot: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: genId("scn"),
        name: "Patels invest in CityView Apartment",
        owner_user_id: "",
        is_core: false,
        snapshot: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: genId("scn"),
        name: "Nguyen group land banking",
        owner_user_id: "",
        is_core: true,
        snapshot: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
    ];
    
    // Use foreach with async callback
    for (const scenario of scenariosToCreate) {
      await addScenario(scenario as any);
    }

    };
    
    initializeDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
