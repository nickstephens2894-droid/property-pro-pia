import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { 
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter 
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { 
  PropertyMethod, FundingMethod, PROPERTY_METHODS, FUNDING_METHODS, 
  generatePreset, getPropertyMethodData, getFundingMethodData 
} from "@/types/presets";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePropertyData } from "@/contexts/PropertyDataContext";
import { Home, CreditCard, Check } from "lucide-react";

interface QuickSetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyPreset: (presetData: any) => void;
  currentPropertyMethod?: PropertyMethod;
  currentFundingMethod?: FundingMethod;
}

export const QuickSetupWizard: React.FC<QuickSetupWizardProps> = ({
  open,
  onOpenChange,
  onApplyPreset,
  currentPropertyMethod,
  currentFundingMethod,
}) => {
  const isMobile = useIsMobile();
  const { propertyData } = usePropertyData();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPropertyMethod, setSelectedPropertyMethod] = useState<PropertyMethod | undefined>(currentPropertyMethod);
  const [selectedFundingMethod, setSelectedFundingMethod] = useState<FundingMethod | undefined>(currentFundingMethod);

  const canApplyProperty = !!selectedPropertyMethod;
  const canApplyFunding = !!selectedFundingMethod;
  const canApplyBoth = canApplyProperty && canApplyFunding;

  const propertyValue = useMemo(() => (
    propertyData.isConstructionProject
      ? (propertyData.landValue + propertyData.constructionValue)
      : propertyData.purchasePrice
  ), [propertyData]);

  const applyProperty = () => {
    if (!selectedPropertyMethod) return;
    const data = getPropertyMethodData(selectedPropertyMethod);
    onApplyPreset({ ...data, propertyMethod: selectedPropertyMethod });
    onOpenChange(false);
  };

  const applyFunding = () => {
    if (!selectedFundingMethod) return;
    const data = getFundingMethodData(selectedFundingMethod, propertyValue);
    onApplyPreset({ ...data, fundingMethod: selectedFundingMethod });
    onOpenChange(false);
  };

  const applyBoth = () => {
    if (!selectedPropertyMethod || !selectedFundingMethod) return;
    const data = generatePreset(selectedPropertyMethod, selectedFundingMethod);
    onApplyPreset(data);
    onOpenChange(false);
  };

  const Header = (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-sm text-muted-foreground">Quick setup</div>
        <div className="font-semibold">Choose methods</div>
      </div>
      <div className="flex items-center gap-2">
        {selectedPropertyMethod && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Home className="h-3 w-3" /> {PROPERTY_METHODS[selectedPropertyMethod].name}
          </Badge>
        )}
        {selectedFundingMethod && (
          <Badge variant="outline" className="flex items-center gap-1">
            <CreditCard className="h-3 w-3" /> {FUNDING_METHODS[selectedFundingMethod].name}
          </Badge>
        )}
      </div>
    </div>
  );

  const Body = (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="text-sm font-medium flex items-center gap-2">
          <Home className="h-4 w-4" /> Property method
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(PROPERTY_METHODS).map(([key, method]) => {
            const active = selectedPropertyMethod === (key as PropertyMethod);
            return (
              <Button
                key={key}
                type="button"
                variant={active ? "default" : "outline"}
                className="justify-start h-auto py-3"
                onClick={() => setSelectedPropertyMethod(key as PropertyMethod)}
              >
                <div className="flex items-center gap-3">
                  <Home className="h-4 w-4" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{method.name}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">{method.description}</span>
                  </div>
                </div>
                {active && <Check className="ml-auto h-4 w-4" />}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium flex items-center gap-2">
          <CreditCard className="h-4 w-4" /> Funding method
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(FUNDING_METHODS).map(([key, method]) => {
            const active = selectedFundingMethod === (key as FundingMethod);
            return (
              <Button
                key={key}
                type="button"
                variant={active ? "default" : "outline"}
                className="justify-start h-auto py-3"
                onClick={() => setSelectedFundingMethod(key as FundingMethod)}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{method.name}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">{method.description}</span>
                  </div>
                </div>
                {active && <Check className="ml-auto h-4 w-4" />}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const Footer = (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button variant="outline" className="flex-1" disabled={!canApplyProperty} onClick={applyProperty}>
        Apply property only
      </Button>
      <Button variant="outline" className="flex-1" disabled={!canApplyFunding} onClick={applyFunding}>
        Apply funding only
      </Button>
      <Button className="flex-1" disabled={!canApplyBoth} onClick={applyBoth}>
        Apply both
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Quick setup</DrawerTitle>
            <DrawerDescription>Select property and funding methods</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-4">
            {Header}
            {Body}
          </div>
          <DrawerFooter>
            {Footer}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quick setup</DialogTitle>
          <DialogDescription>Select property and funding methods</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {Header}
          {Body}
          {Footer}
        </div>
      </DialogContent>
    </Dialog>
  );
};
