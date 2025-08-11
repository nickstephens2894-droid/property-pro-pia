import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  PropertyMethod, 
  FundingMethod, 
  PROPERTY_METHODS, 
  FUNDING_METHODS, 
  generatePreset, 
  getPropertyMethodData, 
  getFundingMethodData 
} from "@/types/presets";
import { usePropertyData } from "@/contexts/PropertyDataContext";
import { Settings, Home, CreditCard, RotateCcw, ChevronDown } from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPropertyMethod, setSelectedPropertyMethod] = useState<PropertyMethod | undefined>(currentPropertyMethod);
  const [selectedFundingMethod, setSelectedFundingMethod] = useState<FundingMethod | undefined>(currentFundingMethod);
  const { propertyData } = usePropertyData();

  // Apply both methods together (existing behavior)
  const handleApplyPreset = () => {
    if (selectedPropertyMethod && selectedFundingMethod) {
      const presetData = generatePreset(selectedPropertyMethod, selectedFundingMethod);
      onApplyPreset(presetData);
    }
  };

  // Apply only the property method
  const handleApplyPropertyPreset = () => {
    if (selectedPropertyMethod) {
      const data = getPropertyMethodData(selectedPropertyMethod);
      onApplyPreset({ ...data, propertyMethod: selectedPropertyMethod });
    }
  };

  // Apply only the funding method
  const handleApplyFundingPreset = () => {
    if (selectedFundingMethod) {
      const propertyValue = propertyData.isConstructionProject
        ? (propertyData.landValue + propertyData.constructionValue)
        : propertyData.purchasePrice;
      const data = getFundingMethodData(selectedFundingMethod, propertyValue);
      onApplyPreset({ ...data, fundingMethod: selectedFundingMethod });
    }
  };

  const handleReset = () => {
    setSelectedPropertyMethod(undefined);
    setSelectedFundingMethod(undefined);
  };

  const canApply = selectedPropertyMethod && selectedFundingMethod;
  const hasCurrentPreset = currentPropertyMethod && currentFundingMethod;

  return (
    <Card className="mb-6 border-primary/20 shadow-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-4 cursor-pointer hover:bg-muted/30 transition-colors">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Quick Setup Presets
                {hasCurrentPreset && (
                  <Badge variant="default" className="ml-2">
                    Active
                  </Badge>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose common property and funding scenarios to populate realistic defaults. You can modify any values after applying.
            </p>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Current Preset Display */}
            {hasCurrentPreset && (
              <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
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
              {/* Property Method Selection - Icon Buttons */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Property Method
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(PROPERTY_METHODS).map(([key, method]) => (
                    <Button
                      key={key}
                      type="button"
                      variant={selectedPropertyMethod === key ? "default" : "outline"}
                      onClick={() => setSelectedPropertyMethod(key as PropertyMethod)}
                      className="h-auto py-3 flex flex-col items-center gap-1"
                    >
                      <Home className="h-4 w-4" />
                      <span className="text-xs text-center leading-tight">{method.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Funding Method Selection - Icon Buttons */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Funding Method
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(FUNDING_METHODS).map(([key, method]) => (
                    <Button
                      key={key}
                      type="button"
                      variant={selectedFundingMethod === key ? "default" : "outline"}
                      onClick={() => setSelectedFundingMethod(key as FundingMethod)}
                      className="h-auto py-3 flex flex-col items-center gap-1"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span className="text-xs text-center leading-tight">{method.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={handleApplyPropertyPreset}
                disabled={!selectedPropertyMethod}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                Apply Property
              </Button>
              <Button 
                onClick={handleApplyFundingPreset}
                disabled={!selectedFundingMethod}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                Apply Funding
              </Button>
              <Button 
                onClick={handleApplyPreset} 
                disabled={!canApply}
                size="sm"
                className="flex-1"
              >
                Apply Both
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
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
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};