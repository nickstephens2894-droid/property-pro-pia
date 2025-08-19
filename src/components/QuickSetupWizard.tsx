import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { 
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose 
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import type { PropertyData } from "@/contexts/PropertyDataContext";
import { 
  FundingMethod, FUNDING_METHODS, getFundingMethodData 
} from "@/types/presets";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePropertyData } from "@/contexts/PropertyDataContext";
import { CreditCard, Check, X } from "lucide-react";

type PresetPayload = Partial<PropertyData> & {
  fundingMethod?: FundingMethod;
};

interface QuickSetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyPreset: (presetData: PresetPayload) => void;
  currentFundingMethod?: FundingMethod;
}

export const QuickSetupWizard: React.FC<QuickSetupWizardProps> = ({
  open,
  onOpenChange,
  onApplyPreset,
  currentFundingMethod,
}) => {
  const isMobile = useIsMobile();
  const { propertyData } = usePropertyData();

  const [selectedFundingMethod, setSelectedFundingMethod] = useState<FundingMethod | undefined>(currentFundingMethod);

  const canApplyFunding = !!selectedFundingMethod;

  const propertyValue = useMemo(() => (
    propertyData.isConstructionProject
      ? (propertyData.landValue + propertyData.constructionValue)
      : propertyData.purchasePrice
  ), [propertyData]);

  const applyFunding = () => {
    if (!selectedFundingMethod) return;
    const data = getFundingMethodData(selectedFundingMethod, propertyValue);
    onApplyPreset({ ...data, fundingMethod: selectedFundingMethod });
    onOpenChange(false);
  };

  const Header = (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-sm text-muted-foreground">Quick setup</div>
        <div className="font-semibold">Select funding method</div>
      </div>
      <div className="flex items-center gap-2">
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
      <Button className="flex-1" disabled={!canApplyFunding} onClick={applyFunding}>
        Apply Funding Method
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground>
        <DrawerContent>
          <DrawerHeader className="flex items-start justify-between">
            <div>
              <DrawerTitle>Quick setup</DrawerTitle>
              <DrawerDescription>Select funding method</DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" aria-label="Close quick setup">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-4">
            {Header}
            {Body}
          </div>
          <DrawerFooter>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1" aria-label="Cancel quick setup">Cancel</Button>
              </DrawerClose>
              {Footer}
            </div>
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
          <DialogDescription>Select funding method</DialogDescription>
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