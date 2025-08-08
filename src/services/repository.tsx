import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Simple local storage backed repository with future-ready backend swappability
// If Supabase is connected later, we can replace the storage implementation here only.

export type Investor = {
  id: string;
  name: string;
  annualIncome: number;
  otherIncome: number;
  hasMedicareLevy: boolean;
  // Optional defaults for scenarios/analysis
  ownershipPercentage?: number; // default ownership allocation (%)
  loanSharePercentage?: number; // share of loan responsibility (%)
  cashContribution?: number; // cash going into deals (AUD)
};

export type Client = {
  id: string;
  name: string;
  investors: Investor[]; // up to 4
};

export type Property = {
  id: string;
  name: string;
  type: "House" | "Apartment" | "Townhouse" | "Unit" | "Land" | "Other";
  purchasePrice: number;
  weeklyRent: number;
  location?: string;
  notes?: string;
};

export type Scenario = {
  id: string;
  name: string;
  clientId: string;
  propertyId: string;
  createdAt: string;
  snapshot?: any; // optional: propertyData snapshot for quick restore
};

const LS_KEYS = {
  clients: "app_clients",
  properties: "app_properties",
  scenarios: "app_scenarios",
} as const;

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function lsSet<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useRepository() {
  const [clients, setClients] = useState<Client[]>(() => lsGet<Client[]>(LS_KEYS.clients, []));
  const [properties, setProperties] = useState<Property[]>(() => lsGet<Property[]>(LS_KEYS.properties, []));
  const [scenarios, setScenarios] = useState<Scenario[]>(() => lsGet<Scenario[]>(LS_KEYS.scenarios, []));

  useEffect(() => lsSet(LS_KEYS.clients, clients), [clients]);
  useEffect(() => lsSet(LS_KEYS.properties, properties), [properties]);
  useEffect(() => lsSet(LS_KEYS.scenarios, scenarios), [scenarios]);

  // CRUD: Clients
  const addClient = (client: Client) => setClients((p) => [...p, client]);
  const updateClient = (id: string, patch: Partial<Client>) =>
    setClients((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const deleteClient = (id: string) => setClients((p) => p.filter((c) => c.id !== id));

  // CRUD: Properties
  const addProperty = (property: Property) => setProperties((p) => [...p, property]);
  const updateProperty = (id: string, patch: Partial<Property>) =>
    setProperties((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const deleteProperty = (id: string) => setProperties((p) => p.filter((c) => c.id !== id));

  // CRUD: Scenarios
  const addScenario = (scenario: Scenario) => setScenarios((p) => [...p, scenario]);
  const deleteScenario = (id: string) => setScenarios((p) => p.filter((s) => s.id !== id));

  const byId = useMemo(() => ({
    client: (id?: string) => clients.find((c) => c.id === id),
    property: (id?: string) => properties.find((p) => p.id === id),
  }), [clients, properties]);

  return {
    clients,
    addClient,
    updateClient,
    deleteClient,
    properties,
    addProperty,
    updateProperty,
    deleteProperty,
    scenarios,
    addScenario,
    deleteScenario,
    byId,
  };
}

// Optional context wrapper if needed later
const RepoContext = createContext<ReturnType<typeof useRepository> | null>(null);
export const RepoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const repo = useRepository();
  return <RepoContext.Provider value={repo}>{children}</RepoContext.Provider>;
};
export const useRepo = () => {
  const ctx = useContext(RepoContext);
  if (!ctx) throw new Error("useRepo must be used within RepoProvider");
  return ctx;
};
