import React, { useEffect } from "react";
import { useRepo, Client, Investor, Property, Scenario } from "@/services/repository";

const DEMO_FLAG = "app_demo_seed_v1";

function genId(prefix = "id"): string {
  try {
    // @ts-ignore - crypto may not exist in older browsers
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {}
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

const SeedDemo: React.FC = () => {
  const {
    clients,
    properties,
    scenarios,
    addClient,
    addProperty,
    addScenario,
  } = useRepo();

  useEffect(() => {
    // Avoid duplicating demo data
    if (localStorage.getItem(DEMO_FLAG)) return;

    // Create 3 clients with different investor setups
    const c1Id = genId("client");
    const c2Id = genId("client");
    const c3Id = genId("client");

    const alex: Investor = {
      id: genId("inv"),
      name: "Alex Johnson",
      annualIncome: 145000,
      otherIncome: 5000,
      hasMedicareLevy: true,
      ownershipPercentage: 100,
      loanSharePercentage: 100,
      cashContribution: 100000,
    };

    const sam: Investor = {
      id: genId("inv"),
      name: "Sam Patel",
      annualIncome: 90000,
      otherIncome: 0,
      hasMedicareLevy: true,
      ownershipPercentage: 60,
      loanSharePercentage: 50,
      cashContribution: 80000,
    };
    const priya: Investor = {
      id: genId("inv"),
      name: "Priya Patel",
      annualIncome: 65000,
      otherIncome: 5000,
      hasMedicareLevy: true,
      ownershipPercentage: 40,
      loanSharePercentage: 50,
      cashContribution: 40000,
    };

    const bao: Investor = {
      id: genId("inv"),
      name: "Bao Nguyen",
      annualIncome: 120000,
      otherIncome: 15000,
      hasMedicareLevy: false,
      ownershipPercentage: 50,
      loanSharePercentage: 50,
      cashContribution: 120000,
    };
    const linh: Investor = {
      id: genId("inv"),
      name: "Linh Nguyen",
      annualIncome: 45000,
      otherIncome: 2000,
      hasMedicareLevy: true,
      ownershipPercentage: 30,
      loanSharePercentage: 30,
      cashContribution: 30000,
    };
    const chris: Investor = {
      id: genId("inv"),
      name: "Chris Nguyen",
      annualIncome: 30000,
      otherIncome: 0,
      hasMedicareLevy: false,
      ownershipPercentage: 20,
      loanSharePercentage: 20,
      cashContribution: 15000,
    };

    const clientsToCreate: Client[] = [
      { id: c1Id, name: "Alex Johnson (Single)", investors: [alex] },
      { id: c2Id, name: "Sam & Priya Patel (Couple)", investors: [sam, priya] },
      { id: c3Id, name: "Nguyen Family Group", investors: [bao, linh, chris] },
    ];

    // Create 3 properties with different types
    const p1Id = genId("prop");
    const p2Id = genId("prop");
    const p3Id = genId("prop");

    const propertiesToCreate: Property[] = [
      {
        id: p1Id,
        name: "Riverside House",
        type: "House",
        purchasePrice: 750000,
        weeklyRent: 650,
        location: "Brisbane, QLD",
        notes: "Established suburb family home",
      },
      {
        id: p2Id,
        name: "CityView Apartment",
        type: "Apartment",
        purchasePrice: 620000,
        weeklyRent: 700,
        location: "Melbourne, VIC",
        notes: "CBD proximity, high rental demand",
      },
      {
        id: p3Id,
        name: "Sunset Acreage",
        type: "Land",
        purchasePrice: 420000,
        weeklyRent: 0,
        location: "Perth, WA",
        notes: "Vacant land for future development",
      },
    ];

    // Only seed if nothing exists yet OR counts are below requested samples
    const shouldSeed = clients.length < 3 || properties.length < 3 || scenarios.length < 3;
    if (!shouldSeed) {
      localStorage.setItem(DEMO_FLAG, "1");
      return;
    }

    clientsToCreate.forEach(addClient);
    propertiesToCreate.forEach(addProperty);

    // Create 3 scenarios linking them
    const scenariosToCreate: Scenario[] = [
      {
        id: genId("scn"),
        name: "Alex buys Riverside House",
        clientId: c1Id,
        propertyId: p1Id,
        createdAt: new Date().toISOString(),
      },
      {
        id: genId("scn"),
        name: "Patels invest in CityView Apartment",
        clientId: c2Id,
        propertyId: p2Id,
        createdAt: new Date().toISOString(),
      },
      {
        id: genId("scn"),
        name: "Nguyen group land banking",
        clientId: c3Id,
        propertyId: p3Id,
        createdAt: new Date().toISOString(),
      },
    ];
    scenariosToCreate.forEach(addScenario);

    localStorage.setItem(DEMO_FLAG, "1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default SeedDemo;
