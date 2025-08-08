import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRepo, Client, Investor } from "@/services/repository";

import AppNav from "@/components/AppNav";

const emptyInvestor = (): Investor => ({ id: crypto.randomUUID(), name: "", annualIncome: 0, otherIncome: 0, hasMedicareLevy: true, ownershipPercentage: 0, loanSharePercentage: 0, cashContribution: 0 });

export default function Clients() {
  const { clients, addClient, deleteClient, scenarios } = useRepo();
  const [name, setName] = useState("");
  const [investors, setInvestors] = useState<Investor[]>([emptyInvestor()]);

  const addInvestor = () => {
    if (investors.length >= 4) return;
    setInvestors((prev) => [...prev, emptyInvestor()]);
  };
  const removeInvestor = (id: string) => setInvestors((p) => p.filter((i) => i.id !== id));
  const updateInvestor = (id: string, patch: Partial<Investor>) => setInvestors((p) => p.map((i) => i.id === id ? { ...i, ...patch } : i));

  const saveClient = () => {
    if (!name.trim() || investors.length === 0) return;
    const client: Client = { id: crypto.randomUUID(), name: name.trim(), investors };
    addClient(client);
    setName("");
    setInvestors([emptyInvestor()]);
  };
  useEffect(() => { document.title = "Clients | Property Analyzer"; }, []);
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground">Create clients with up to 4 investors and tax settings</p>
          </div>
          <AppNav />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Client Name</Label>
              <Input id="client-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Smith Family Trust" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Investors</h3>
                <Button size="sm" variant="outline" onClick={addInvestor} disabled={investors.length >= 4}>Add investor</Button>
              </div>
              <div className="grid gap-4">
                {investors.map((inv, idx) => (
                    <Card key={inv.id}>
                      <CardContent className="pt-6 grid sm:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input value={inv.name} onChange={(e) => updateInvestor(inv.id, { name: e.target.value })} placeholder={`Investor ${idx + 1}`} />
                        </div>
                        <div className="space-y-2">
                          <Label>Annual Income (AUD)</Label>
                          <Input type="number" value={inv.annualIncome} onChange={(e) => updateInvestor(inv.id, { annualIncome: Number(e.target.value || 0) })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Other Income (AUD)</Label>
                          <Input type="number" value={inv.otherIncome} onChange={(e) => updateInvestor(inv.id, { otherIncome: Number(e.target.value || 0) })} />
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch checked={inv.hasMedicareLevy} onCheckedChange={(v) => updateInvestor(inv.id, { hasMedicareLevy: v })} id={`medicare-${inv.id}`} />
                          <Label htmlFor={`medicare-${inv.id}`}>Medicare Levy</Label>
                        </div>
                        <div className="space-y-2">
                          <Label>Default Ownership %</Label>
                          <Input type="number" min={0} max={100} value={inv.ownershipPercentage ?? 0} onChange={(e) => updateInvestor(inv.id, { ownershipPercentage: Number(e.target.value || 0) })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Loan Share %</Label>
                          <Input type="number" min={0} max={100} value={inv.loanSharePercentage ?? 0} onChange={(e) => updateInvestor(inv.id, { loanSharePercentage: Number(e.target.value || 0) })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Cash Contribution (AUD)</Label>
                          <Input type="number" min={0} value={inv.cashContribution ?? 0} onChange={(e) => updateInvestor(inv.id, { cashContribution: Number(e.target.value || 0) })} />
                        </div>
                        <div className="sm:col-span-4 flex justify-end">
                          <Button size="sm" variant="destructive" onClick={() => removeInvestor(inv.id)}>Remove</Button>
                        </div>
                      </CardContent>
                    </Card>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={saveClient}>Save Client</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved Clients</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {clients.length === 0 && <p className="text-sm text-muted-foreground">No clients yet.</p>}
            {clients.map((c) => (
              <div key={c.id} className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-muted-foreground">{c.investors.length} investor(s) • {scenarios.filter(s => s.clientId === c.id).length} scenario(s)</div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => deleteClient(c.id)}>Delete</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
