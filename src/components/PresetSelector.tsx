import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  PropertyMethod, 
  FundingMethod, 
  PROPERTY_METHODS, 
  FUNDING_METHODS, 
  generatePreset 
} from "@/types/presets";
import { PropertyData } from "@/contexts/PropertyDataContext";
import { Settings, Home, CreditCard, RotateCcw } from "lucide-react";

interface PresetSelectorProps {
  onApplyPreset: (presetData: any) => void;
  currentPropertyMethod?: PropertyMethod;
  currentFundingMethod?: FundingMethod;
}

export const PresetSelector = ({ 
  onApplyPreset, 
  currentPropertyMethod, 
  currentFundingMethod 
}: PresetSelectorProps) => {
  const [selectedPropertyMethod, setSelectedPropertyMethod] = useState<PropertyMethod | undefined>(currentPropertyMethod);
  const [selectedFundingMethod, setSelectedFundingMethod] = useState<FundingMethod | undefined>(currentFundingMethod);

  const handleApplyPreset = () => {
    if (selectedPropertyMethod && selectedFundingMethod) {
      const presetData = generatePreset(selectedPropertyMethod, selectedFundingMethod);
      onApplyPreset(presetData);
    }
  };

  const handleReset = () => {
    setSelectedPropertyMethod(undefined);
    setSelectedFundingMethod(undefined);
  };

  const canApply = selectedPropertyMethod && selectedFundingMethod;
  const hasCurrentPreset = currentPropertyMethod && currentFundingMethod;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5" />
          Quick Setup Presets
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose common property and funding scenarios to populate realistic defaults. You can modify any values after applying.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Preset Display */}
        {hasCurrentPreset && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Current Preset:</span>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Home className="h-3 w-3" />
              {PROPERTY_METHODS[currentPropertyMethod].name}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              {FUNDING_METHODS[currentFundingMethod].name}
            </Badge>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {/* Property Method Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Property Method
            </Label>
            <Select 
              value={selectedPropertyMethod} 
              onValueChange={(value) => setSelectedPropertyMethod(value as PropertyMethod)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property type..." />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border">
                {Object.entries(PROPERTY_METHODS).map(([key, method]) => (
                  <SelectItem key={key} value={key}>
                    <div className="space-y-1">
                      <div className="font-medium">{method.name}</div>
                      <div className="text-xs text-muted-foreground">{method.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Funding Method Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Funding Method
            </Label>
            <Select 
              value={selectedFundingMethod} 
              onValueChange={(value) => setSelectedFundingMethod(value as FundingMethod)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select funding type..." />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border">
                {Object.entries(FUNDING_METHODS).map(([key, method]) => (
                  <SelectItem key={key} value={key}>
                    <div className="space-y-1">
                      <div className="font-medium">{method.name}</div>
                      <div className="text-xs text-muted-foreground">{method.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleApplyPreset} 
            disabled={!canApply}
            className="flex-1"
          >
            Apply Preset
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Description of selected combination */}
        {selectedPropertyMethod && selectedFundingMethod && (
          <div className="p-3 bg-muted/30 rounded-lg text-sm">
            <strong>This preset will configure:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside text-muted-foreground">
              <li>{PROPERTY_METHODS[selectedPropertyMethod].description}</li>
              <li>{FUNDING_METHODS[selectedFundingMethod].description}</li>
              <li>Optimized tax settings with high/low income split</li>
              <li>Realistic market values and holding costs</li>
              <li>Appropriate depreciation strategy</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};