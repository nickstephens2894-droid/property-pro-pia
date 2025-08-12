import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Building2, MapPin, DollarSign, Home, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useProperties, type Property } from "@/hooks/useProperties";
import { useClients } from "@/hooks/useClients";
import { SearchAndFilters } from "@/components/ui/search-and-filters";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatCurrency } from "@/utils/formatters";
import { Checkbox } from "@/components/ui/checkbox";

export default function Properties() {
  const {
    properties,
    loading,
    createProperty,
    updateProperty,
    deleteProperty
  } = useProperties();

  const { clients } = useClients();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "current" | "new">("all");
  const [filterPropertyType, setFilterPropertyType] = useState<Property['type'] | "all">("all");
  
  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  
  // Property form
  const [propertyForm, setPropertyForm] = useState({
    name: "",
    type: 'House' as Property['type'],
    purchasePrice: 0,
    weeklyRent: 0,
    location: "",
    notes: "",
    clientIds: [] as string[],
    status: 'current' as Property['status']
  });

  const resetPropertyForm = () => {
    setPropertyForm({
      name: "",
      type: 'House',
      purchasePrice: 0,
      weeklyRent: 0,
      location: "",
      notes: "",
      clientIds: [],
      status: 'current'
    });
    setEditingProperty(null);
  };

  const openAddDialog = () => {
    setEditingProperty(null);
    resetPropertyForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (property: Property) => {
    setEditingProperty(property);
    setPropertyForm({
      name: property.name,
      type: property.type,
      purchasePrice: property.purchasePrice,
      weeklyRent: property.weeklyRent,
      location: property.location || "",
      notes: property.notes || "",
      clientIds: property.clients.map(c => c.client_id),
      status: property.status
    });
    setIsDialogOpen(true);
  };

  const handlePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!propertyForm.name.trim() || propertyForm.clientIds.length === 0) {
      return;
    }

    try {
      if (editingProperty) {
        await updateProperty(editingProperty.id, {
          name: propertyForm.name.trim(),
          type: propertyForm.type,
          purchasePrice: propertyForm.purchasePrice,
          weeklyRent: propertyForm.weeklyRent,
          location: propertyForm.location.trim(),
          notes: propertyForm.notes.trim() || null,
          clientIds: propertyForm.clientIds,
          status: propertyForm.status
        });
      } else {
        await createProperty({
          name: propertyForm.name.trim(),
          type: propertyForm.type,
          purchasePrice: propertyForm.purchasePrice,
          weeklyRent: propertyForm.weeklyRent,
          location: propertyForm.location.trim(),
          notes: propertyForm.notes.trim() || null,
          clientIds: propertyForm.clientIds,
          status: propertyForm.status
        });
      }

      setIsDialogOpen(false);
      resetPropertyForm();
    } catch (error) {
      console.error('Error submitting property:', error);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) {
      return;
    }
    try {
      await deleteProperty(propertyId);
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (property.location && property.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "all" || property.status === filterType;
    const matchesPropertyType = filterPropertyType === "all" || property.type === filterPropertyType;
    
    return matchesSearch && matchesType && matchesPropertyType;
  });

  const filters = [
    {
      key: "status",
      label: "Status",
      value: filterType,
      options: [
        { value: "all", label: "All Properties" },
        { value: "current", label: "Current" },
        { value: "new", label: "New" }
      ],
      onChange: (value: string) => setFilterType(value as "all" | "current" | "new")
    },
    {
      key: "propertyType",
      label: "Property Type",
      value: filterPropertyType,
      options: [
        { value: "all", label: "All Types" },
        { value: "House", label: "House" },
        { value: "Apartment", label: "Apartment" },
        { value: "Townhouse", label: "Townhouse" },
        { value: "Unit", label: "Unit" },
        { value: "Land", label: "Land" },
        { value: "Other", label: "Other" }
      ],
      onChange: (value: string) => setFilterPropertyType(value as Property['type'] | "all")
    }
  ];

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : "Unknown Client";
  };

  const getPropertyTypeIcon = (type: Property['type']) => {
    switch (type) {
      case 'House': return <Home className="h-4 w-4" />;
      case 'Apartment': return <Building2 className="h-4 w-4" />;
      case 'Townhouse': return <Building2 className="h-4 w-4" />;
      case 'Unit': return <Building2 className="h-4 w-4" />;
      case 'Land': return <MapPin className="h-4 w-4" />;
      default: return <Building2 className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading properties..." />;
  }

  // Render the modal first, so it's always available
  const modalContent = isDialogOpen && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-background border border-border shadow-2xl rounded-lg w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden mx-2">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                {editingProperty ? 'Edit Property' : 'Add New Property'}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {editingProperty ? 'Update property information' : 'Create a new property for your portfolio'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDialogOpen(false)}
              className="h-8 w-8 p-0 hover:bg-background/80 ml-2 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
          <form onSubmit={handlePropertySubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="property-name" className="text-sm font-medium">
                Property Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="property-name"
                type="text"
                value={propertyForm.name}
                onChange={(e) => setPropertyForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter property name"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="property-type" className="text-sm font-medium">
                  Property Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={propertyForm.type}
                  onValueChange={(value) => setPropertyForm(prev => ({ ...prev, type: value as Property['type'] }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select property type..." />
                  </SelectTrigger>
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
                <Label htmlFor="property-status" className="text-sm font-medium">
                  Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={propertyForm.status}
                  onValueChange={(value) => setPropertyForm(prev => ({ ...prev, status: value as Property['status'] }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="property-purchase-price" className="text-sm font-medium">
                  Purchase Price (AUD) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="property-purchase-price"
                  type="number"
                  min="0"
                  step="1000"
                  value={propertyForm.purchasePrice}
                  onChange={(e) => setPropertyForm(prev => ({ ...prev, purchasePrice: Number(e.target.value) }))}
                  placeholder="0"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="property-weekly-rent" className="text-sm font-medium">
                  Weekly Rent (AUD) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="property-weekly-rent"
                  type="number"
                  min="0"
                  step="50"
                  value={propertyForm.weeklyRent}
                  onChange={(e) => setPropertyForm(prev => ({ ...prev, weeklyRent: Number(e.target.value) }))}
                  placeholder="0"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="property-clients" className="text-sm font-medium">
                Clients <span className="text-destructive">*</span>
                <span className="text-xs text-muted-foreground ml-2">
                  (Select up to 4 clients)
                </span>
              </Label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
                {clients.map((client) => (
                  <div key={client.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`client-${client.id}`}
                      checked={propertyForm.clientIds.includes(client.id)}
                      onCheckedChange={(checked) => {
                        if (checked && propertyForm.clientIds.length < 4) {
                          setPropertyForm(prev => ({
                            ...prev,
                            clientIds: [...prev.clientIds, client.id]
                          }));
                        } else if (!checked) {
                          setPropertyForm(prev => ({
                            ...prev,
                            clientIds: prev.clientIds.filter(id => id !== client.id)
                          }));
                        }
                      }}
                      disabled={!propertyForm.clientIds.includes(client.id) && propertyForm.clientIds.length >= 4}
                    />
                    <Label
                      htmlFor={`client-${client.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {client.name}
                    </Label>
                  </div>
                ))}
              </div>
              {propertyForm.clientIds.length === 0 && (
                <p className="text-sm text-destructive">Please select at least one client</p>
              )}
              {propertyForm.clientIds.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Selected: {propertyForm.clientIds.map(id => 
                    clients.find(c => c.id === id)?.name
                  ).join(', ')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="property-location" className="text-sm font-medium">Location</Label>
              <Input
                id="property-location"
                type="text"
                value={propertyForm.location}
                onChange={(e) => setPropertyForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter property location"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="property-notes" className="text-sm font-medium">Notes</Label>
              <Textarea
                id="property-notes"
                value={propertyForm.notes}
                onChange={(e) => setPropertyForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this property"
                rows={3}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="transition-all duration-200 hover:bg-muted order-2 sm:order-1 w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!propertyForm.name.trim() || propertyForm.clientIds.length === 0}
                className="transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 w-full sm:w-auto"
              >
                {editingProperty ? 'Update Property' : 'Create Property'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (properties.length === 0) {
    return (
      <>
        {modalContent}
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Properties</h1>
              <p className="text-muted-foreground">Manage your property portfolio</p>
            </div>
            <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>

          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
              <p className="text-muted-foreground mb-4">Start building your property portfolio by adding your first property.</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      {modalContent}
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Properties</h1>
            <p className="text-muted-foreground">Manage your property portfolio</p>
          </div>
          <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>

        {/* Search and Filters */}
        <SearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search properties by name or location..."
          filters={filters}
        />

        {/* Properties Grid */}
        <div className="grid gap-4">
          {filteredProperties.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No properties match your search criteria</p>
              </CardContent>
            </Card>
          ) : (
            filteredProperties.map((property) => (
              <Card key={property.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {getPropertyTypeIcon(property.type)}
                        {property.name}
                        <Badge variant={property.status === 'current' ? 'default' : 'secondary'}>
                          {property.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        {property.location && (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {property.location}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(property.purchasePrice)}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Building2 className="h-3 w-3" />
                          {property.clients.map((client, index) => (
                            <span key={client.client_id}>
                              {getClientName(client.client_id)}
                              {client.ownership_percentage < 100 && ` (${client.ownership_percentage}%)`}
                              {index < property.clients.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      </CardDescription>
                      {property.weeklyRent > 0 && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          Weekly Rent: {formatCurrency(property.weeklyRent)}
                        </div>
                      )}
                      {property.notes && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {property.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(property)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProperty(property.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}
