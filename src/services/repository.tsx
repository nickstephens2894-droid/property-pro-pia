import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Repository with Supabase-first data, falling back to Local Storage when logged out
// Updated to use investors table directly instead of non-existent clients table

export type Investor = {
  id: string;
  name: string;
  annualIncome: number;
  otherIncome: number;
  nonTaxableIncome: number;
  hasMedicareLevy: boolean;
  ownershipPercentage?: number;
  loanSharePercentage?: number;
  cashContribution?: number;
  created_at?: string;
  updated_at?: string;
};

export type Property = {
  id: string;
  name: string;
  type: "House" | "Apartment" | "Townhouse" | "Unit" | "Land" | "Other";
  purchasePrice: number;
  weeklyRent: number;
  location?: string;
  notes?: string;
  owner_user_id?: string; // Updated to match investors table structure
};

export type Scenario = {
  id: string;
  name: string;
  isCore: boolean;
  createdAt: string;
  snapshot?: Record<string, unknown>;
};

const LS_KEYS = {
  investors: "app_investors", // Updated from clients
  properties: "app_properties",
  scenarios: "app_scenarios",
  importedFlag: "supabase_import_done",
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

// Utilities
const num = (v: unknown) => (v == null ? 0 : typeof v === "number" ? v : Number(v));

export function useRepository() {
  // Local state mirrors UI expectations
  const [investors, setInvestors] = useState<Investor[]>(() => lsGet<Investor[]>(LS_KEYS.investors, []));
  const [properties, setProperties] = useState<Property[]>(() => lsGet<Property[]>(LS_KEYS.properties, []));
  const [scenarios, setScenarios] = useState<Scenario[]>(() => lsGet<Scenario[]>(LS_KEYS.scenarios, []));

  // Persist to local storage always (works as offline cache)
  useEffect(() => lsSet(LS_KEYS.investors, investors), [investors]);
  useEffect(() => lsSet(LS_KEYS.properties, properties), [properties]);
  useEffect(() => lsSet(LS_KEYS.scenarios, scenarios), [scenarios]);

  const [userId, setUserId] = useState<string | null>(null);
  const didImport = useRef(false);

  // Auth wiring: keep userId in state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user?.id ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // Loading from Supabase when authenticated
  useEffect(() => {
    if (!userId) return; // stay on local cache when logged out

    const loadAll = async () => {
      
      // Investors
      const { data: dbInvestors, error: iErr } = await supabase
        .from("investors")
        .select("id, name, annual_income, other_income, non_taxable_income, has_medicare_levy, created_at, updated_at")
        .eq("owner_user_id", userId)
        .order("created_at", { ascending: true });
      
      if (iErr) {
        toast.error(`Failed to load investors: ${iErr.message}`);
        return;
      }

      const investorIds = dbInvestors?.map((i) => i.id) ?? [];

      // Properties (linked to investors by RLS)
      const { data: dbProperties, error: pErr } = await supabase
        .from("properties")
        .select("id, name, type, purchase_price, weekly_rent, location, notes, owner_user_id")
        .eq("owner_user_id", userId)
        .order("created_at", { ascending: true });
      
      if (pErr) {
        toast.error(`Failed to load properties: ${pErr.message}`);
        return;
      }

      // Scenarios (linked to investors and properties)
      let dbScenarios = null;
      let sErr = null;
      
      // Scenarios are now user-owned, not linked to specific investors/properties
      const { data, error } = await supabase
        .from("scenarios")
        .select("id, name, is_core, created_at, snapshot")
        .eq("owner_user_id", userId)
        .order("created_at", { ascending: true });
      
      dbScenarios = data;
      sErr = error;
      
      if (sErr) {
        toast.error(`Failed to load scenarios: ${sErr.message}`);
        return;
      }

      // Map database fields to frontend interface
      const mergedInvestors: Investor[] = (dbInvestors ?? []).map((i) => ({
        id: i.id,
        name: i.name,
        annualIncome: num(i.annual_income),
        otherIncome: num(i.other_income),
        nonTaxableIncome: num(i.non_taxable_income),
        hasMedicareLevy: Boolean(i.has_medicare_levy),
        created_at: i.created_at,
        updated_at: i.updated_at
      }));

      const mergedProperties: Property[] = (dbProperties ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        type: (p.type as Property["type"]) || "Other",
        purchasePrice: num(p.purchase_price),
        weeklyRent: num(p.weekly_rent),
        location: p.location || undefined,
        notes: p.notes || undefined,
        owner_user_id: p.owner_user_id
      }));

      const mergedScenarios: Scenario[] = (dbScenarios ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        isCore: Boolean(s.is_core),
        createdAt: s.created_at,
        snapshot: s.snapshot
      }));

      setInvestors(mergedInvestors);
      setProperties(mergedProperties);
      setScenarios(mergedScenarios);
    };

    loadAll();
  }, [userId]);

  // Import local data to Supabase (one-time)
  useEffect(() => {
    if (!userId || didImport.current) return;

    const importLocalData = async () => {
      const DEFAULT_NAME = "Default Investor";
      const alreadyImported = localStorage.getItem(LS_KEYS.importedFlag) === "true";
      if (!alreadyImported && (lsGet<Investor[]>(LS_KEYS.investors, []).length || lsGet<Property[]>(LS_KEYS.properties, []).length || lsGet<Scenario[]>(LS_KEYS.scenarios, []).length)) {
        toast.info("Importing local data to Supabase...");

        // Check if we need to create a default investor
        const { data, error } = await supabase.from("investors").select("id").eq("name", DEFAULT_NAME).maybeSingle();
        if (error) {
          toast.error(`Failed to check default investor: ${error.message}`);
          return;
        }

        if (!data) {
          const id = crypto.randomUUID();
          const { error: insErr } = await supabase.from("investors").insert({ id, name: DEFAULT_NAME, owner_user_id: userId });
          if (insErr) {
            toast.error(`Failed to create default investor: ${insErr.message}`);
            return;
          }
        }

        const localInvestors = lsGet<Investor[]>(LS_KEYS.investors, []);
        const localProperties = lsGet<Property[]>(LS_KEYS.properties, []);
        const localScenarios = lsGet<Scenario[]>(LS_KEYS.scenarios, []);

        // Investors
        if (localInvestors.length) {
          const investorRows = localInvestors.map((i) => ({ 
            id: i.id, 
            name: i.name, 
            annual_income: i.annualIncome,
            other_income: i.otherIncome,
            non_taxable_income: i.nonTaxableIncome || 0,
            has_medicare_levy: i.hasMedicareLevy,
            owner_user_id: userId 
          }));
          const { error } = await supabase.from("investors").insert(investorRows);
          if (error) toast.error(`Failed to import investors: ${error.message}`);
        }

        // Properties
        if (localProperties.length) {
          const propertyRows = localProperties.map((p) => ({ 
            id: p.id, 
            name: p.name, 
            type: p.type,
            purchase_price: p.purchasePrice,
            weekly_rent: p.weeklyRent,
            location: p.location,
            notes: p.notes,
            owner_user_id: userId
          }));
          const { error } = await supabase.from("properties").insert(propertyRows);
          if (error) toast.error(`Failed to import properties: ${error.message}`);
        }

        // Scenarios
        if (localScenarios.length) {
          let attachInvestorId = localInvestors[0]?.id;
          if (!attachInvestorId) {
            const { data: defaultInvestor } = await supabase.from("investors").select("id").eq("name", DEFAULT_NAME).single();
            attachInvestorId = defaultInvestor?.id;
          }

          if (attachInvestorId) {
            const scenarioRows = localScenarios.map((s) => ({ 
              id: s.id, 
              name: s.name, 
              is_core: s.isCore,
              owner_user_id: attachInvestorId,
              created_at: s.createdAt,
              snapshot: s.snapshot as any
            }));
            const { error } = await supabase.from("scenarios").insert(scenarioRows);
            if (error) toast.error(`Failed to import scenarios: ${error.message}`);
          }
        }

        localStorage.setItem(LS_KEYS.importedFlag, "true");
        toast.success("Local data imported successfully");
        didImport.current = true;
      }
    };

    importLocalData();
  }, [userId]);

  // CRUD operations for investors
  const addInvestor = useCallback(async (investor: Investor) => {
    
    if (!userId) {
      setInvestors((p) => [...p, investor]);
      return;
    }

    try {
      
      const { error } = await supabase.from("investors").insert({ 
        id: investor.id, 
        name: investor.name, 
        annual_income: investor.annualIncome,
        other_income: investor.otherIncome,
        non_taxable_income: investor.nonTaxableIncome || 0,
        has_medicare_levy: investor.hasMedicareLevy,
        owner_user_id: userId 
      });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      toast.success("Investor added successfully");
    } catch (error) {
      console.error("Failed to add investor:", error);
      toast.error("Failed to add investor");
      setInvestors((p) => [...p, investor]);
    }
  }, [userId]);

  const updateInvestor = useCallback(async (id: string, patch: Partial<Investor>) => {
    if (!userId) {
      setInvestors((p) => p.map((i) => (i.id === id ? { ...i, ...patch } : i)));
      return;
    }

    try {
      const { error } = await supabase.from("investors").update({ 
        name: patch.name,
        annual_income: patch.annualIncome,
        other_income: patch.otherIncome,
        non_taxable_income: patch.nonTaxableIncome,
        has_medicare_levy: patch.hasMedicareLevy
      }).eq("id", id);
      if (error) throw error;
      toast.success("Investor updated successfully");
      setInvestors((p) => p.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    } catch (error) {
      console.error("Failed to update investor:", error);
      toast.error("Failed to update investor");
      setInvestors((p) => p.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    }
  }, [userId]);

  const removeInvestor = useCallback(async (id: string) => {
    if (!userId) {
      setInvestors((p) => p.filter((i) => i.id !== id));
      return;
    }

    try {
      const { error } = await supabase.from("investors").delete().eq("id", id);
      if (error) throw error;
      toast.success("Investor removed successfully");
      setInvestors((p) => p.filter((i) => i.id !== id));
    } catch (error) {
      console.error("Failed to remove investor:", error);
      toast.error("Failed to remove investor");
      setInvestors((p) => p.filter((i) => i.id !== id));
    }
  }, [userId]);

  // CRUD operations for properties
  const addProperty = useCallback(async (property: Property) => {
    if (!userId) {
      setProperties((p) => [...p, property]);
      return;
    }

    try {
      const { error } = await supabase.from("properties").insert({ 
        id: property.id, 
        name: property.name, 
        type: property.type,
        purchase_price: property.purchasePrice,
        weekly_rent: property.weeklyRent,
        location: property.location,
        notes: property.notes,
        owner_user_id: userId
      });
      if (error) throw error;
      toast.success("Property added successfully");
    } catch (error) {
      console.error("Failed to add property:", error);
      toast.error("Failed to add property");
      setProperties((p) => [...p, property]);
    }
  }, [userId]);

  const updateProperty = useCallback(async (id: string, patch: Partial<Property>) => {
    if (!userId) {
      setProperties((p) => p.map((prop) => (prop.id === id ? { ...prop, ...patch } : prop)));
      return;
    }

    try {
      const { error } = await supabase.from("properties").update({ 
        name: patch.name,
        type: patch.type,
        purchase_price: patch.purchasePrice,
        weekly_rent: patch.weeklyRent,
        location: patch.location,
        notes: patch.notes
      }).eq("id", id);
      if (error) throw error;
      toast.success("Property updated successfully");
      setProperties((p) => p.map((prop) => (prop.id === id ? { ...prop, ...patch } : prop)));
    } catch (error) {
      console.error("Failed to update property:", error);
      toast.error("Failed to update property");
      setProperties((p) => p.map((prop) => (prop.id === id ? { ...prop, ...patch } : prop)));
    }
  }, [userId]);

  const removeProperty = useCallback(async (id: string) => {
    if (!userId) {
      setProperties((p) => p.filter((prop) => prop.id !== id));
      return;
    }

    try {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
      toast.success("Property removed successfully");
      setProperties((p) => p.filter((prop) => prop.id !== id));
    } catch (error) {
      console.error("Failed to remove property:", error);
      toast.error("Failed to remove property");
      setProperties((p) => p.filter((prop) => prop.id !== id));
    }
  }, [userId]);

  // CRUD operations for scenarios
  const addScenario = useCallback(async (scenario: Scenario) => {
    if (!userId) {
      setScenarios((s) => [...s, scenario]);
      return;
    }

    try {
      const { error } = await supabase.from("scenarios").insert({ 
        id: scenario.id, 
        name: scenario.name, 
        is_core: scenario.isCore,
        owner_user_id: userId,
        created_at: scenario.createdAt,
        snapshot: scenario.snapshot as any
      });
      if (error) throw error;
      toast.success("Scenario added successfully");
    } catch (error) {
      console.error("Failed to add scenario:", error);
      toast.error("Failed to add scenario");
      setScenarios((s) => [...s, scenario]);
    }
  }, [userId]);

  const updateScenario = useCallback(async (id: string, patch: Partial<Scenario>) => {
    if (!userId) {
      setScenarios((s) => s.map((sc) => (sc.id === id ? { ...sc, ...patch } : sc)));
      return;
    }

    try {
      const { error } = await supabase.from("scenarios").update({ 
        name: patch.name,
        is_core: patch.isCore,
        snapshot: patch.snapshot as any
      }).eq("id", id);
      if (error) throw error;
      toast.success("Scenario updated successfully");
      setScenarios((s) => s.map((sc) => (sc.id === id ? { ...sc, ...patch } : sc)));
    } catch (error) {
      console.error("Failed to update scenario:", error);
      toast.error("Failed to update scenario");
      setScenarios((s) => s.map((sc) => (sc.id === id ? { ...sc, ...patch } : sc)));
    }
  }, [userId]);

  const removeScenario = useCallback(async (id: string) => {
    if (!userId) {
      setScenarios((s) => s.filter((sc) => sc.id !== id));
      return;
    }

    try {
      const { error } = await supabase.from("scenarios").delete().eq("id", id);
      if (error) throw error;
      toast.success("Scenario removed successfully");
      setScenarios((s) => s.filter((sc) => sc.id !== id));
    } catch (error) {
      console.error("Failed to remove scenario:", error);
      toast.error("Failed to remove scenario");
      setScenarios((s) => s.filter((sc) => sc.id !== id));
    }
  }, [userId]);

  // Computed values
  const totalInvestments = useMemo(() => properties.reduce((sum, p) => sum + p.purchasePrice, 0), [properties]);
  const totalWeeklyRent = useMemo(() => properties.reduce((sum, p) => sum + p.weeklyRent, 0), [properties]);
  const totalAnnualRent = useMemo(() => totalWeeklyRent * 52, [totalWeeklyRent]);

  // Helper functions
  const investor = useCallback((id?: string) => investors.find((i) => i.id === id), [investors]);
  const property = useCallback((id?: string) => properties.find((p) => p.id === id), [properties]);
  const scenario = useCallback((id?: string) => scenarios.find((s) => s.id === id), [scenarios]);

  const value = useMemo(
    () => ({
      // Data
      investors,
      properties,
      scenarios,
      totalInvestments,
      totalWeeklyRent,
      totalAnnualRent,

      // CRUD operations
      addInvestor,
      updateInvestor,
      removeInvestor,
      addProperty,
      updateProperty,
      removeProperty,
      addScenario,
      updateScenario,
      removeScenario,

      // Helpers
      investor,
      property,
      scenario,
    }),
    [
      investors,
      properties,
      scenarios,
      totalInvestments,
      totalWeeklyRent,
      totalAnnualRent,
      addInvestor,
      updateInvestor,
      removeInvestor,
      addProperty,
      updateProperty,
      removeProperty,
      addScenario,
      updateScenario,
      removeScenario,
      investor,
      property,
      scenario,
    ]
  );

  return value;
}

// Context wrapper remains the same
const RepositoryContext = createContext<ReturnType<typeof useRepository> | null>(null);
export const RepositoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const repo = useRepository();
  return <RepositoryContext.Provider value={repo}>{children}</RepositoryContext.Provider>;
};
export const useRepo = () => {
  const ctx = useContext(RepositoryContext);
  if (!ctx) throw new Error("useRepo must be used within RepositoryProvider");
  return ctx;
};

// Constants
const DEFAULT_NAME = "Default Investor";
const alreadyImported = localStorage.getItem(LS_KEYS.importedFlag) === "true";
