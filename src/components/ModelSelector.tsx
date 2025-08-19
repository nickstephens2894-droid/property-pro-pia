import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { 
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose 
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Building2, Search, Copy, Check } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { PROPERTY_METHODS } from "@/types/presets";
import { useModels, type PropertyModel } from "@/contexts/ModelsContext";



interface ModelSelectorProps {
  onApplyModel: (modelData: PropertyModel) => void;
}

export const ModelSelector = ({ onApplyModel }: ModelSelectorProps) => {
  const isMobile = useIsMobile();
  const { models } = useModels();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModel, setSelectedModel] = useState<PropertyModel | null>(null);

    useEffect(() => {
    if (open) {
      setLoading(false); // Models are already loaded from context
    }
  }, [open]);

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.propertyType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApplyModel = () => {
    if (selectedModel) {
      onApplyModel(selectedModel);
      setOpen(false);
      setSelectedModel(null);
    }
  };

  const handleCreateNewModel = () => {
    // Navigate to create model page
    window.open('/models/create', '_blank');
  };

  const Body = (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search models..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Models List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading models...</p>
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'No models found matching your search.' : 'No models available.'}
            </p>
            {!searchTerm && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCreateNewModel}
                className="mt-3"
              >
                Create First Model
              </Button>
            )}
          </div>
        ) : (
          filteredModels.map((model) => {
            const isSelected = selectedModel?.id === model.id;
            return (
              <Card 
                key={model.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedModel(isSelected ? null : model)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium truncate">{model.name}</h3>
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {model.description}
                      </p>
                      
                      {/* Property Details */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="font-medium">{model.propertyType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium">{model.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-medium">{formatCurrency(model.purchasePrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rent:</span>
                          <span className="font-medium">{formatCurrency(model.weeklyRent)}/week</span>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary" className="text-xs">
                          {PROPERTY_METHODS[model.propertyMethod].name}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {((model.weeklyRent * 52 / model.purchasePrice) * 100).toFixed(2)}% yield
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );

  const Footer = (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button variant="outline" className="flex-1" onClick={handleCreateNewModel}>
        Create New Model
      </Button>
      <Button 
        className="flex-1" 
        disabled={!selectedModel}
        onClick={handleApplyModel}
      >
        Apply Selected Model
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Card className="mb-4 border-primary/20 shadow-sm">
          <CardContent className="py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="font-medium">Add from Model</span>
              </div>
              <Button size="sm" variant="default" onClick={() => setOpen(true)}>
                Select Model
              </Button>
            </div>
          </CardContent>
        </Card>

        <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground>
          <DrawerContent>
            <DrawerHeader className="flex items-start justify-between">
              <div>
                <DrawerTitle>Select Property Model</DrawerTitle>
                <DrawerDescription>Choose a model to populate your instance form</DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" aria-label="Close model selector">
                  <Check className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </DrawerHeader>
            <div className="px-4 pb-4 space-y-4">
              {Body}
            </div>
            <DrawerFooter>
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <DrawerClose asChild>
                  <Button variant="outline" className="flex-1">Cancel</Button>
                </DrawerClose>
                {Footer}
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <>
      <Card className="mb-4 border-primary/20 shadow-sm">
        <CardContent className="py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-medium">Add from Model</span>
              <span className="text-xs text-muted-foreground">Use a saved property template</span>
            </div>
            <Button size="sm" variant="default" onClick={() => setOpen(true)}>
              Select Model
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Property Model</DialogTitle>
            <DialogDescription>Choose a model to populate your instance form with pre-filled data</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {Body}
            {Footer}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
