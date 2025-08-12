import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppNav from "@/components/AppNav";
import { useNavigate } from "react-router-dom";
import { useRepo } from "@/services/repository";
import { usePropertyData } from "@/contexts/PropertyDataContext";


export default function Scenarios() {
  const { clients, properties, scenarios, addScenario, deleteScenario, byId } = useRepo();
  const { setPropertyData, propertyData } = usePropertyData();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const [propertyId, setPropertyId] = useState<string>("");

  const selectedClient = useMemo(() => byId.client(clientId), [byId, clientId]);
  const selectedProperty = useMemo(() => byId.property(propertyId), [byId, propertyId]);

  useEffect(() => { document.title = "Scenarios | Property Analyzer"; }, []);

  const canBuild = !!selectedClient && !!selectedProperty;

  const openInAnalyzer = () => {
    if (!canBuild) return;
    // Map basic fields from saved property + client investors into the shared analyzer
    setPropertyData((prev: any) => ({
      ...prev,
      purchasePrice: selectedProperty!.purchasePrice,
      weeklyRent: selectedProperty!.weeklyRent,
      clients: selectedClient!.investors.map((i) => ({
        id: i.id,
        name: i.name,
        annualIncome: i.annualIncome,
        otherIncome: i.otherIncome,
        hasMedicareLevy: i.hasMedicareLevy,
      })),
      ownershipAllocations: selectedClient!.investors.map((i) => ({
        clientId: i.id,
        ownershipPercentage: i.ownershipPercentage && i.ownershipPercentage > 0
          ? i.ownershipPercentage
          : Math.floor(100 / selectedClient!.investors.length),
      })),
    }));
    navigate("/");
  };

  const loadScenario = (s: { id: string; snapshot?: any; clientId: string; propertyId: string }) => {
    if (s.snapshot) {
      setPropertyData((prev: any) => ({ ...prev, ...s.snapshot }));
      navigate("/");
      return;
    }
    const client = byId.client(s.clientId);
    const property = byId.property(s.propertyId);
    if (!client || !property) return;
    setPropertyData((prev: any) => ({
      ...prev,
      purchasePrice: property.purchasePrice,
      weeklyRent: property.weeklyRent,
      clients: client.investors.map((i) => ({
        id: i.id,
        name: i.name,
        annualIncome: i.annualIncome,
        otherIncome: i.otherIncome,
        hasMedicareLevy: i.hasMedicareLevy,
      })),
      ownershipAllocations: client.investors.map((i) => ({
        clientId: i.id,
        ownershipPercentage: i.ownershipPercentage && i.ownershipPercentage > 0
          ? i.ownershipPercentage
          : Math.floor(100 / client.investors.length),
      })),
    }));
    navigate("/");
  };

  const saveScenario = () => {
    if (!canBuild || !name.trim()) return;
    addScenario({
      id: crypto.randomUUID(),
      name: name.trim(),
      clientId: clientId!,
      propertyId: propertyId!,
      createdAt: new Date().toISOString(),
      snapshot: propertyData, // optional snapshot of current working data
    });
    setName("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Scenarios</h1>
            <p className="text-muted-foreground">Combine a client and property into a saveable scenario</p>
          </div>
          <AppNav />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Scenario</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Smith + Ocean View" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Client</label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Property</label>
              <Select value={propertyId} onValueChange={setPropertyId}>
                <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                <SelectContent>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-3 flex gap-2 justify-end">
              <Button variant="outline" onClick={openInAnalyzer} disabled={!canBuild}>Open in Analyzer</Button>
              <Button onClick={saveScenario} disabled={!canBuild || !name.trim()}>Save Scenario</Button>
            </div>
          </CardContent>
        </Card>

        {/* Saved scenarios list */}
        <Card>
          <CardHeader>
            <CardTitle>Saved Scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            {scenarios.length === 0 && <p className="text-sm text-muted-foreground">No scenarios yet.</p>}
            {scenarios.slice().sort((a,b) => b.createdAt.localeCompare(a.createdAt)).map((s) => {
              const client = byId.client(s.clientId);
              const property = byId.property(s.propertyId);
              return (
                <div key={s.id} className="flex items-center justify-between border rounded-md p-3 mb-2">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm text-muted-foreground">{client?.name ?? 'Unknown Client'} • {property?.name ?? 'Unknown Property'}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => loadScenario(s)}>Open</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteScenario(s.id)}>Delete</Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
