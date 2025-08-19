import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Building2, Edit, Trash2, Copy, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatters";
import { PROPERTY_METHODS } from "@/types/presets";
import { useModels, type PropertyModel } from "@/contexts/ModelsContext";



const Models = () => {
  const navigate = useNavigate();
  const { models, deleteModel, duplicateModel } = useModels();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");



  const handleCreateModel = () => {
    navigate('/models/create');
  };

  const handleEditModel = (modelId: string) => {
    navigate(`/models/${modelId}/edit`);
  };

  const handleDeleteModel = (modelId: string) => {
    if (confirm('Are you sure you want to delete this model? This action cannot be undone.')) {
      deleteModel(modelId);
    }
  };

  const handleDuplicateModel = (modelId: string) => {
    duplicateModel(modelId);
  };

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.propertyType.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (models.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="text-center">
            <EmptyState
              icon={Building2}
              title="No models yet"
              description="Create your first property model to use as a template for new instances."
              action={
                <Button onClick={handleCreateModel} size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Model
                </Button>
              }
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
            <h1 className="text-3xl font-bold">Property Models</h1>
            <p className="text-muted-foreground">
              Create and manage property templates for quick instance setup
            </p>
          </div>
          <Button onClick={handleCreateModel} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Create Model
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search models by name, description, location, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Models Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredModels.map((model) => (
            <Card key={model.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{model.name}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {model.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicateModel(model.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditModel(model.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteModel(model.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Property Type & Method */}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{model.propertyType}</Badge>
                  <Badge variant="outline">
                    {PROPERTY_METHODS[model.propertyMethod].name}
                  </Badge>
                </div>

                {/* Key Details */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{model.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Purchase Price:</span>
                    <span className="font-medium">{formatCurrency(model.purchasePrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Weekly Rent:</span>
                    <span className="font-medium">{formatCurrency(model.weeklyRent)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Yield:</span>
                    <span className="font-medium">
                      {((model.weeklyRent * 52 / model.purchasePrice) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="pt-2 border-t text-xs text-muted-foreground">
                  <div>Created: {new Date(model.createdAt).toLocaleDateString()}</div>
                  <div>Modified: {new Date(model.lastModified).toLocaleDateString()}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredModels.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No models found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Models;
