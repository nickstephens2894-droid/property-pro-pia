import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Repository with Supabase-first data, falling back to Local Storage when logged out
// Shapes match existing UI so pages remain unchanged

export type Investor = {
  id: string;
  name: string;
  annualIncome: number;
  otherIncome: number;
  hasMedicareLevy: boolean;
  ownershipPercentage?: number;
  loanSharePercentage?: number;
  cashContribution?: number;
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
  clientId?: string; // required in Supabase
};

export type Scenario = {
  id: string;
  name: string;
  clientId: string;
  propertyId: string;
  createdAt: string;
  snapshot?: any;
};

const LS_KEYS = {
  clients: "app_clients",
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
const num = (v: any) => (v == null ? 0 : typeof v === "number" ? v : Number(v));

export function useRepository() {
  // Local state mirrors UI expectations
  const [clients, setClients] = useState<Client[]>(() => lsGet<Client[]>(LS_KEYS.clients, []));
  const [properties, setProperties] = useState<Property[]>(() => lsGet<Property[]>(LS_KEYS.properties, []));
  const [scenarios, setScenarios] = useState<Scenario[]>(() => lsGet<Scenario[]>(LS_KEYS.scenarios, []));

  // Persist to local storage always (works as offline cache)
  useEffect(() => lsSet(LS_KEYS.clients, clients), [clients]);
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
      // Clients
      const { data: dbClients, error: cErr } = await supabase
        .from("clients")
        .select("id, name")
        .order("created_at", { ascending: true });
      if (cErr) {
        toast.error(`Failed to load clients: ${cErr.message}`);
        return;
      }
      const clientIds = dbClients?.map((c) => c.id) ?? [];

      // Investors
      let dbInvestors: any[] = [];
      if (clientIds.length) {
        const { data, error } = await supabase
          .from("investors")
          .select("id, client_id, name, annual_income, other_income, has_medicare_levy, ownership_percentage, loan_share_percentage, cash_contribution")
          .in("client_id", clientIds);
        if (error) {
          toast.error(`Failed to load investors: ${error.message}`);
        } else {
          dbInvestors = data ?? [];
        }
      }

      const mergedClients: Client[] = (dbClients ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        investors: dbInvestors
          .filter((i) => i.client_id === c.id)
          .map((i) => ({
            id: i.id,
            name: i.name,
            annualIncome: num(i.annual_income),
            otherIncome: num(i.other_income),
            hasMedicareLevy: !!i.has_medicare_levy,
            ownershipPercentage: i.ownership_percentage == null ? undefined : num(i.ownership_percentage),
            loanSharePercentage: i.loan_share_percentage == null ? undefined : num(i.loan_share_percentage),
            cashContribution: i.cash_contribution == null ? undefined : num(i.cash_contribution),
          })),
      }));
      setClients(mergedClients);

      // Properties (linked to clients by RLS)
      const { data: dbProps, error: pErr } = await supabase
        .from("properties")
        .select("id, name, type, purchase_price, weekly_rent, location, notes, client_id")
        .order("created_at", { ascending: true });
      if (pErr) {
        toast.error(`Failed to load properties: ${pErr.message}`);
        return;
      }
      setProperties(
        (dbProps ?? []).map((p) => ({
          id: p.id,
          name: p.name,
          type: (p.type as Property["type"]) ?? "House",
          purchasePrice: num(p.purchase_price),
          weeklyRent: num(p.weekly_rent),
          location: p.location ?? undefined,
          notes: p.notes ?? undefined,
          clientId: p.client_id ?? undefined,
        }))
      );

      // Scenarios (with snapshot)
      const { data: dbScenarios, error: sErr } = await supabase
        .from("scenarios")
        .select("id, name, client_id, created_at, snapshot")
        .order("created_at", { ascending: true });
      if (sErr) {
        toast.error(`Failed to load scenarios: ${sErr.message}`);
        return;
      }

      // Link primary property via scenario_properties
      const scenarioIds = (dbScenarios ?? []).map((s) => s.id);
      let spMap = new Map<string, string>();
      if (scenarioIds.length) {
        const { data: sps, error } = await supabase
          .from("scenario_properties")
          .select("scenario_id, property_id, is_primary")
          .in("scenario_id", scenarioIds);
        if (!error) {
          (sps ?? []).forEach((r) => {
            if (r.is_primary) spMap.set(r.scenario_id, r.property_id);
          });
        }
      }

      setScenarios(
        (dbScenarios ?? []).map((s) => ({
          id: s.id,
          name: s.name,
          clientId: s.client_id,
          propertyId: spMap.get(s.id) || "",
          createdAt: s.created_at,
          snapshot: s.snapshot ?? undefined,
        }))
      );

      // One-time import if needed
      if (!didImport.current) {
        didImport.current = true;
        const alreadyImported = localStorage.getItem(LS_KEYS.importedFlag) === "true";
        if (!alreadyImported && (lsGet<Client[]>(LS_KEYS.clients, []).length || lsGet<Property[]>(LS_KEYS.properties, []).length || lsGet<Scenario[]>(LS_KEYS.scenarios, []).length)) {
          // Only import if user has no data in Supabase yet
          const { count } = await supabase
            .from("clients")
            .select("id", { count: "exact", head: true });
          if ((count ?? 0) === 0) {
            await importLocalToSupabase();
          }
        }
      }
    };

    loadAll();
  }, [userId]);

  // Ensure a default client for unassigned properties
  const ensureDefaultClient = async (): Promise<string> => {
    const DEFAULT_NAME = "General";
    const { data, error } = await supabase.from("clients").select("id").eq("name", DEFAULT_NAME).maybeSingle();
    if (error) return Promise.reject(error);
    if (data?.id) return data.id;
    const id = crypto.randomUUID();
    const { error: insErr } = await supabase.from("clients").insert({ id, name: DEFAULT_NAME, owner_user_id: userId });
    if (insErr) return Promise.reject(insErr);
    return id;
  };

  // Import local storage data into Supabase (one-time helper)
  const importLocalToSupabase = async () => {
    if (!userId) return;
    try {
      toast.info("Importing local data to Supabase...");
      const localClients = lsGet<Client[]>(LS_KEYS.clients, []);
      const localProperties = lsGet<Property[]>(LS_KEYS.properties, []);
      const localScenarios = lsGet<Scenario[]>(LS_KEYS.scenarios, []);

      // Clients
      if (localClients.length) {
        const clientRows = localClients.map((c) => ({ id: c.id, name: c.name, owner_user_id: userId }));
        const { error } = await supabase.from("clients").insert(clientRows);
        if (error) throw error;
        // Investors
        const investorRows = localClients.flatMap((c) =>
          (c.investors || []).map((i) => ({
            id: i.id,
            client_id: c.id,
            name: i.name,
            annual_income: num(i.annualIncome),
            other_income: num(i.otherIncome),
            has_medicare_levy: !!i.hasMedicareLevy,
            ownership_percentage: i.ownershipPercentage == null ? null : num(i.ownershipPercentage),
            loan_share_percentage: i.loanSharePercentage == null ? null : num(i.loanSharePercentage),
            cash_contribution: i.cashContribution == null ? null : num(i.cashContribution),
          }))
        );
        if (investorRows.length) {
          const { error: invErr } = await supabase.from("investors").insert(investorRows);
          if (invErr) throw invErr;
        }
      }

      // Properties (attach to first client or default)
      let attachClientId: string | null = null;
      if (localClients.length) attachClientId = localClients[0].id;
      if (!attachClientId) attachClientId = await ensureDefaultClient();

      if (localProperties.length) {
        const propRows = localProperties.map((p) => ({
          id: p.id,
          client_id: attachClientId!,
          name: p.name,
          type: p.type,
          purchase_price: num(p.purchasePrice),
          weekly_rent: num(p.weeklyRent),
          location: p.location ?? null,
          notes: p.notes ?? null,
        }));
        const { error } = await supabase.from("properties").insert(propRows);
        if (error) throw error;
      }

      // Scenarios + mapping
      if (localScenarios.length) {
        const scenRows = localScenarios.map((s) => ({
          id: s.id,
          name: s.name,
          client_id: s.clientId,
          snapshot: s.snapshot ?? null,
        }));
        const { error } = await supabase.from("scenarios").insert(scenRows);
        if (error) throw error;

        const mapRows = localScenarios.map((s) => ({
          scenario_id: s.id,
          property_id: s.propertyId,
          is_primary: true,
        }));
        const { error: mErr } = await supabase.from("scenario_properties").insert(mapRows);
        if (mErr) throw mErr;
      }

      localStorage.setItem(LS_KEYS.importedFlag, "true");
      toast.success("Import complete");

      // Reload from Supabase
      setTimeout(() => {
        // trigger reload by resetting userId
        setUserId((u) => (u ? `${u}` : null));
      }, 0);
    } catch (e: any) {
      console.error(e);
      toast.error(`Import failed: ${e?.message || e}`);
    }
  };

  // CRUD operations route to Supabase when logged in, otherwise local

  // Clients
  const addClient = async (client: Client) => {
    if (userId) {
      const { error } = await supabase.from("clients").insert({ id: client.id, name: client.name, owner_user_id: userId });
      if (error) return toast.error(error.message);
      if (client.investors?.length) {
        const rows = client.investors.map((i) => ({
          id: i.id,
          client_id: client.id,
          name: i.name,
          annual_income: num(i.annualIncome),
          other_income: num(i.otherIncome),
          has_medicare_levy: !!i.hasMedicareLevy,
          ownership_percentage: i.ownershipPercentage == null ? null : num(i.ownershipPercentage),
          loan_share_percentage: i.loanSharePercentage == null ? null : num(i.loanSharePercentage),
          cash_contribution: i.cashContribution == null ? null : num(i.cashContribution),
        }));
        const { error: invErr } = await supabase.from("investors").insert(rows);
        if (invErr) return toast.error(invErr.message);
      }
      setClients((p) => [...p, client]);
      return;
    }
    // Local
    setClients((p) => [...p, client]);
  };

  const updateClient = async (id: string, patch: Partial<Client>) => {
    if (userId) {
      if (patch.name != null) {
        const { error } = await supabase.from("clients").update({ name: patch.name }).eq("id", id);
        if (error) return toast.error(error.message);
      }
      // For simplicity, investors are not updated here (UI doesn't edit investors after create)
      setClients((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      return;
    }
    setClients((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const deleteClient = async (id: string) => {
    if (userId) {
      // Delete dependents
      await supabase.from("investors").delete().eq("client_id", id);
      await supabase.from("scenarios").delete().eq("client_id", id);
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) return toast.error(error.message);
      setClients((p) => p.filter((c) => c.id !== id));
      setScenarios((p) => p.filter((s) => s.clientId !== id));
      return;
    }
    setClients((p) => p.filter((c) => c.id !== id));
  };

  // Properties
  const addProperty = async (property: Property) => {
    if (userId) {
      const clientId = property.clientId || (await ensureDefaultClient());
      const { error } = await supabase.from("properties").insert({
        id: property.id,
        client_id: clientId,
        name: property.name,
        type: property.type,
        purchase_price: num(property.purchasePrice),
        weekly_rent: num(property.weeklyRent),
        location: property.location ?? null,
        notes: property.notes ?? null,
      });
      if (error) return toast.error(error.message);
      setProperties((p) => [...p, { ...property, clientId }]);
      return;
    }
    setProperties((p) => [...p, property]);
  };

  const updateProperty = async (id: string, patch: Partial<Property>) => {
    if (userId) {
      const dbPatch: any = {};
      if (patch.name != null) dbPatch.name = patch.name;
      if (patch.type != null) dbPatch.type = patch.type;
      if (patch.purchasePrice != null) dbPatch.purchase_price = num(patch.purchasePrice);
      if (patch.weeklyRent != null) dbPatch.weekly_rent = num(patch.weeklyRent);
      if (patch.location !== undefined) dbPatch.location = patch.location ?? null;
      if (patch.notes !== undefined) dbPatch.notes = patch.notes ?? null;
      if (patch.clientId !== undefined) dbPatch.client_id = patch.clientId ?? null;
      if (Object.keys(dbPatch).length) {
        const { error } = await supabase.from("properties").update(dbPatch).eq("id", id);
        if (error) return toast.error(error.message);
      }
      setProperties((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      return;
    }
    setProperties((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const deleteProperty = async (id: string) => {
    if (userId) {
      await supabase.from("scenario_properties").delete().eq("property_id", id);
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) return toast.error(error.message);
      setProperties((p) => p.filter((c) => c.id !== id));
      return;
    }
    setProperties((p) => p.filter((c) => c.id !== id));
  };

  // Scenarios
  const addScenario = async (scenario: Scenario) => {
    if (userId) {
      const { error } = await supabase.from("scenarios").insert({
        id: scenario.id,
        name: scenario.name,
        client_id: scenario.clientId,
        snapshot: scenario.snapshot ?? null,
      });
      if (error) return toast.error(error.message);
      const { error: mapErr } = await supabase.from("scenario_properties").insert({
        scenario_id: scenario.id,
        property_id: scenario.propertyId,
        is_primary: true,
      });
      if (mapErr) return toast.error(mapErr.message);
      setScenarios((p) => [...p, scenario]);
      return;
    }
    setScenarios((p) => [...p, scenario]);
  };

  const deleteScenario = async (id: string) => {
    if (userId) {
      await supabase.from("scenario_properties").delete().eq("scenario_id", id);
      const { error } = await supabase.from("scenarios").delete().eq("id", id);
      if (error) return toast.error(error.message);
      setScenarios((p) => p.filter((s) => s.id !== id));
      return;
    }
    setScenarios((p) => p.filter((s) => s.id !== id));
  };

  const byId = useMemo(
    () => ({
      client: (id?: string) => clients.find((c) => c.id === id),
      property: (id?: string) => properties.find((p) => p.id === id),
    }),
    [clients, properties]
  );

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
    // expose manual import just in case
    importLocalToSupabase,
    userId,
  };
}

// Context wrapper remains the same
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
