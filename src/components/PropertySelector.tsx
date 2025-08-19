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
import { useProperties, type PropertyModel } from "@/contexts/PropertiesContext";



interface PropertySelectorProps {
  onApplyProperty: (propertyData: PropertyModel) => void;
}

export const PropertySelector = ({ onApplyProperty }: PropertySelectorProps) => {
  const isMobile = useIsMobile();
  const { properties, loading: propertiesLoading } = useProperties();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<PropertyModel | null>(null);

    useEffect(() => {
    if (open) {
      setLoading(false); // Properties are already loaded from context
    }
  }, [open]);

  const filteredProperties = (properties || []).filter(property =>
    property && property.name && property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property && property.description && property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property && property.location && property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property && property.property_type && property.property_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApplyProperty = () => {
    if (selectedProperty) {
      onApplyProperty(selectedProperty);
      setOpen(false);
      setSelectedProperty(null);
    }
  };

  const handleCreateNewProperty = () => {
    // Navigate to create property page
    window.open('/properties/create', '_blank');
  };

  const Body = (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
                        placeholder="Search properties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

                  {/* Properties List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {propertiesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="text-sm text-muted-foreground mt-2">Loading properties...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">
                {searchTerm ? 'No properties found matching your search.' : 'No properties available.'}
              </p>
              {!searchTerm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateNewProperty}
                  className="mt-3"
                >
                  Create First Property
                </Button>
              )}
          </div>
        ) : (
          filteredProperties.filter(property => property).map((property) => {
            const isSelected = selectedProperty?.id === property.id;
            return (
                              <Card
                  key={property.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedProperty(isSelected ? null : property)}
                >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium truncate">{property.name}</h3>
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {property.description || 'No description available'}
                      </p>
                      
                      {/* Property Details */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="font-medium">{property.property_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium">{property.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-medium">{formatCurrency(property.purchase_price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rent:</span>
                          <span className="font-medium">{formatCurrency(property.weekly_rent)}/week</span>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary" className="text-xs">
                          {PROPERTY_METHODS[property.property_method]?.name || 'Unknown Method'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {property.weekly_rent && property.purchase_price ? 
                            ((property.weekly_rent * 52 / property.purchase_price) * 100).toFixed(2) + '% yield' : 
                            'N/A'
                          }
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
                    <Button variant="outline" className="flex-1" onClick={handleCreateNewProperty}>
                Create New Property
              </Button>
              <Button
          className="flex-1"
          disabled={!selectedProperty}
          onClick={handleApplyProperty}
        >
          Apply Selected Property
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
                <span className="font-medium">Add from Property</span>
              </div>
              <Button size="sm" variant="default" onClick={() => setOpen(true)}>
                Select Property
              </Button>
            </div>
          </CardContent>
        </Card>

        <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground>
          <DrawerContent>
            <DrawerHeader className="flex items-start justify-between">
              <div>
                        <DrawerTitle>Select Property</DrawerTitle>
        <DrawerDescription>Choose a property to populate your instance form</DrawerDescription>
              </div>
              <DrawerClose asChild>
                                  <Button variant="ghost" size="icon" aria-label="Close property selector">
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
                              <span className="font-medium">Add from Property</span>
              <span className="text-xs text-muted-foreground">Use a saved property template</span>
            </div>
            <Button size="sm" variant="default" onClick={() => setOpen(true)}>
                              Select Property
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Property</DialogTitle>
            <DialogDescription>Choose a property to populate your instance form with pre-filled data</DialogDescription>
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
