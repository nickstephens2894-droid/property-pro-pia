import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRepo, Property } from "@/services/repository";

import AppNav from "@/components/AppNav";

export default function Properties() {
  const { properties, addProperty, deleteProperty } = useRepo();
  const [form, setForm] = useState<Property>({
    id: "",
    name: "",
    type: "House",
    purchasePrice: 0,
    weeklyRent: 0,
    location: "",
    notes: "",
  });

  const update = (patch: Partial<Property>) => setForm((p) => ({ ...p, ...patch }));
  const save = () => {
    if (!form.name.trim()) return;
    addProperty({ ...form, id: crypto.randomUUID() });
    setForm({ id: "", name: "", type: "House", purchasePrice: 0, weeklyRent: 0, location: "", notes: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
            <p className="text-muted-foreground">Create and manage properties for analysis</p>
          </div>
          <AppNav />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Property</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => update({ name: e.target.value })} placeholder="e.g., 12 Ocean View" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => update({ type: v as Property["type"] })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="House">House</SelectItem>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="Townhouse">Townhouse</SelectItem>
                  <SelectItem value="Unit">Unit</SelectItem>
                  <SelectItem value="Land">Land</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Purchase Price (AUD)</Label>
              <Input type="number" value={form.purchasePrice} onChange={(e) => update({ purchasePrice: Number(e.target.value || 0) })} />
            </div>
            <div className="space-y-2">
              <Label>Weekly Rent (AUD)</Label>
              <Input type="number" value={form.weeklyRent} onChange={(e) => update({ weeklyRent: Number(e.target.value || 0) })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => update({ location: e.target.value })} placeholder="City/Suburb" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => update({ notes: e.target.value })} placeholder="Optional notes" />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button onClick={save}>Save Property</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved Properties</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {properties.length === 0 && <p className="text-sm text-muted-foreground">No properties yet.</p>}
            {properties.map((p) => (
              <div key={p.id} className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-muted-foreground">{p.type} • ${p.purchasePrice.toLocaleString()} • ${p.weeklyRent}/wk</div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => deleteProperty(p.id)}>Delete</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
