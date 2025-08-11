import { useMemo, useState } from "react";
import { calculateStampDuty, formatCurrencyAUD, type Jurisdiction } from "@/utils/stampDuty";
import { usePropertyData } from "@/contexts/PropertyDataContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface StampDutyCalculatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JURISDICTIONS: Jurisdiction[] = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];

export default function StampDutyCalculator({ open, onOpenChange }: StampDutyCalculatorProps) {
  const { propertyData, updateField } = usePropertyData();
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>((propertyData as any).dutyJurisdiction || "VIC");

  const dutiableValue = useMemo(() => {
    return propertyData.isConstructionProject ? propertyData.landValue : propertyData.purchasePrice;
  }, [propertyData.isConstructionProject, propertyData.landValue, propertyData.purchasePrice]);

  const duty = useMemo(() => calculateStampDuty(dutiableValue, jurisdiction), [dutiableValue, jurisdiction]);

  const applyDuty = () => {
    updateField("stampDuty", duty);
    updateField("dutyJurisdiction" as any, jurisdiction);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Stamp Duty Calculator</DialogTitle>
          <DialogDescription>
            Base rates only. Excludes concessions/exemptions. ACT/NT are estimated for v1.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Jurisdiction</div>
              <Select value={jurisdiction} onValueChange={(v) => setJurisdiction(v as Jurisdiction)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {JURISDICTIONS.map((j) => (
                    <SelectItem key={j} value={j}>{j}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Dutiable value</div>
              <div className="text-sm font-medium">
                {formatCurrencyAUD(dutiableValue)}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                {propertyData.isConstructionProject ? "Using land value for construction projects" : "Using purchase price for established properties"}
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="text-sm">Calculated duty</div>
            <div className="text-base font-semibold">{formatCurrencyAUD(duty)}</div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            <Button onClick={applyDuty}>Apply to analysis</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
