import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PropertyData } from "@/contexts/PropertyDataContext";
import { 
  PropertyMethod, 
  FundingMethod, 
  PROPERTY_METHODS, 
  FUNDING_METHODS
} from "@/types/presets";
import { Settings, Home, CreditCard } from "lucide-react";
import { QuickSetupWizard } from "@/components/QuickSetupWizard";

// Payload type for applying presets from the wizard
type PresetPayload = Partial<PropertyData> & {
  propertyMethod?: PropertyMethod;
  fundingMethod?: FundingMethod;
};

interface PresetSelectorProps {
  onApplyPreset: (presetData: PresetPayload) => void;
  currentPropertyMethod?: PropertyMethod;
  currentFundingMethod?: FundingMethod;
}

export const PresetSelector = ({ 
  onApplyPreset, 
  currentPropertyMethod, 
  currentFundingMethod 
}: PresetSelectorProps) => {
  const [open, setOpen] = useState(false);

  const hasCurrentPreset = currentPropertyMethod && currentFundingMethod;

  return (
    <Card className="mb-4 border-primary/20 shadow-sm">
      <CardContent className="py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Settings className="h-5 w-5 text-primary" />
            <span className="font-medium">Quick setup</span>
            {hasCurrentPreset && (
              <span className="ml-1 text-xs text-muted-foreground">Current</span>
            )}
          </div>

          {/* Current selection badges (ellipsis on small screens) */}
          <div className="hidden sm:flex items-center gap-2 min-w-0 flex-1">
            {currentPropertyMethod && (
              <Badge variant="secondary" className="flex items-center gap-1 truncate max-w-[40%]">
                <Home className="h-3 w-3" />
                <span className="truncate">{PROPERTY_METHODS[currentPropertyMethod].name}</span>
              </Badge>
            )}
            {currentFundingMethod && (
              <Badge variant="outline" className="flex items-center gap-1 truncate max-w-[40%]">
                <CreditCard className="h-3 w-3" />
                <span className="truncate">{FUNDING_METHODS[currentFundingMethod].name}</span>
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="default" onClick={() => setOpen(true)} aria-label="Open quick setup">
              Quick setup
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Wizard (Dialog on desktop, Drawer on mobile) */}
      <QuickSetupWizard 
        open={open} 
        onOpenChange={setOpen} 
        onApplyPreset={(presetData: PresetPayload) => {
          onApplyPreset(presetData);
          setOpen(false);
        }}
        currentPropertyMethod={currentPropertyMethod}
        currentFundingMethod={currentFundingMethod}
      />
    </Card>
  );
};