import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Building2, Edit, Trash2, Copy, Search, Upload, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatters";
import { PROPERTY_METHODS } from "@/types/presets";
import { useProperties } from "@/contexts/PropertiesContext";
import { type PropertyModel } from "@/types/propertyModels";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/components/ui/use-toast";
import { PropertyImportDialog } from "@/components/PropertyImportDialog";
import { CsvImportService } from "@/utils/csvImport";



const Properties = () => {
  const navigate = useNavigate();
  const { properties, deleteProperty, duplicateProperty } = useProperties();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [duplicatingProperty, setDuplicatingProperty] = useState<string | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);



  const handleCreateProperty = () => {
    navigate('/properties/create');
  };

  const handleImportProperties = () => {
    setImportDialogOpen(true);
  };

  const handleDownloadTemplate = () => {
    CsvImportService.downloadCsvTemplate();
  };

  const handleEditProperty = (propertyId: string) => {
    navigate(`/properties/${propertyId}/edit`);
  };

  const handleDeleteProperty = (propertyId: string) => {
    setPropertyToDelete(propertyId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (propertyToDelete) {
      setDeletingProperty(propertyToDelete);
      try {
        await deleteProperty(propertyToDelete);
        toast({
          title: "Property Deleted",
          description: "Property has been successfully deleted.",
          variant: "default",
        });
      } catch (error) {
        toast({
          title: "Delete Failed",
          description: error instanceof Error ? error.message : "Failed to delete property.",
          variant: "destructive",
        });
      } finally {
        setPropertyToDelete(null);
        setDeleteDialogOpen(false);
        setDeletingProperty(null);
      }
    }
  };

  const handleDuplicateProperty = async (propertyId: string) => {
    setDuplicatingProperty(propertyId);
    try {
      await duplicateProperty(propertyId);
      toast({
        title: "Property Duplicated",
        description: "Property has been successfully duplicated.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Duplicate Failed",
        description: error instanceof Error ? error.message : "Failed to duplicate property.",
        variant: "destructive",
      });
    } finally {
      setDuplicatingProperty(null);
    }
  };

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (property.description && property.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.property_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="text-center">
            <EmptyState
              icon={Building2}
              title="No properties yet"
              description="Create your first property template to use for new instances."
              actionLabel="Create First Property"
              onAction={() => handleCreateProperty()}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Properties</h1>
            <p className="text-muted-foreground">
              Create and manage property templates for quick instance setup
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadTemplate} size="lg">
              <Download className="h-4 w-4 mr-2" />
              CSV Template
            </Button>
            <Button variant="outline" onClick={handleImportProperties} size="lg">
              <Upload className="h-4 w-4 mr-2" />
              Import Properties
            </Button>
            <Button onClick={handleCreateProperty} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create Property
            </Button>
          </div>
        </div>


        {/* Properties Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{property.name}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {property.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicateProperty(property.id)}
                      disabled={duplicatingProperty === property.id}
                      className="h-8 w-8 p-0"
                    >
                      {duplicatingProperty === property.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProperty(property.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProperty(property.id)}
                      disabled={deletingProperty === property.id}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      {deletingProperty === property.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Property Type & Method */}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{property.property_type}</Badge>
                  <Badge variant="outline">
                    {PROPERTY_METHODS[property.property_method].name}
                  </Badge>
                </div>

                {/* Key Details */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{property.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Purchase Price:</span>
                    <span className="font-medium">{formatCurrency(property.purchase_price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Weekly Rent:</span>
                    <span className="font-medium">{formatCurrency(property.weekly_rent)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Yield:</span>
                    <span className="font-medium">
                      {((property.weekly_rent * 52 / property.purchase_price) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="pt-2 border-t text-xs text-muted-foreground">
                                  <div>Created: {new Date(property.created_at).toLocaleDateString()}</div>
                <div>Modified: {new Date(property.updated_at).toLocaleDateString()}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredProperties.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No properties found matching "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!deletingProperty) {
            setDeleteDialogOpen(open);
          }
        }}
        title="Delete Property"
        description="Are you sure you want to delete this property? This action cannot be undone."
        confirmText={deletingProperty ? "Deleting..." : "Delete Property"}
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={deletingProperty ? undefined : () => setPropertyToDelete(null)}
      />

      {/* Import Dialog */}
      <PropertyImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportComplete={() => {
          // Properties will be refreshed automatically via the context
        }}
      />
    </div>
  );
};

export default Properties;
